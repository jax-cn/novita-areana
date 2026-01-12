#!/usr/bin/env node
/**
 * Agent Runner - Orchestrates the coding workflow inside the sandbox
 * 
 * Workflow steps:
 * 1. Receive file writes from host
 * 2. Run ESLint to check for errors
 * 3. Run TypeScript compilation check
 * 4. Run Next.js build (optional, for production validation)
 * 5. Start dev server
 * 
 * Communication: JSON over stdout for structured output
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_DIR = '/home/user/app';

function log(type, message, data = {}) {
  console.log(JSON.stringify({ type, message, timestamp: Date.now(), ...data }));
}

async function runCommand(cmd, options = {}) {
  const { ignoreError = false, cwd = APP_DIR } = options;
  try {
    const output = execSync(cmd, { 
      cwd, 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    if (ignoreError) {
      return { success: false, output: error.stderr || error.stdout || error.message };
    }
    throw error;
  }
}

async function lint() {
  log('step', 'Running ESLint...');
  const result = await runCommand('npm run lint -- --format json', { ignoreError: true });
  
  if (!result.success) {
    try {
      const errors = JSON.parse(result.output);
      const issues = errors.flatMap(f => f.messages.map(m => ({
        file: f.filePath.replace(APP_DIR + '/', ''),
        line: m.line,
        column: m.column,
        severity: m.severity === 2 ? 'error' : 'warning',
        message: m.message,
        ruleId: m.ruleId
      })));
      return { success: false, issues };
    } catch {
      return { success: false, issues: [{ message: result.output }] };
    }
  }
  return { success: true, issues: [] };
}

async function typeCheck() {
  log('step', 'Running TypeScript check...');
  const result = await runCommand('npx tsc --noEmit', { ignoreError: true });
  
  if (!result.success) {
    const issues = result.output.split('\n')
      .filter(line => line.includes('error TS'))
      .map(line => {
        const match = line.match(/(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            severity: 'error',
            message: match[5],
            ruleId: match[4]
          };
        }
        return { message: line, severity: 'error' };
      });
    return { success: false, issues };
  }
  return { success: true, issues: [] };
}

async function build() {
  log('step', 'Running Next.js build...');
  const result = await runCommand('npm run build', { ignoreError: true });
  
  if (!result.success) {
    return { 
      success: false, 
      issues: [{ message: result.output, severity: 'error' }] 
    };
  }
  return { success: true, issues: [] };
}

async function startDevServer() {
  log('step', 'Starting development server...');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: APP_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });
  
  return new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started server')) {
        log('ready', 'Development server is ready', { port: 3000 });
        resolve({ success: true, port: 3000 });
      }
    });
    
    server.stderr.on('data', (data) => {
      log('error', data.toString());
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      resolve({ success: true, port: 3000, warning: 'Server start timeout, assuming ready' });
    }, 60000);
  });
}

// Export functions for use by the host
module.exports = { lint, typeCheck, build, startDevServer, runCommand, log };

// If run directly, start the dev server
if (require.main === module) {
  startDevServer();
}
