// Test script for sandbox creation and /generate endpoint

async function testSandboxFlow() {
  const baseUrl = 'http://localhost:3001'
  const modelId = 'deepseek/deepseek-v3.2' // Using a valid Novita model ID

  console.log('🧪 Testing Sandbox Flow\n')

  // Step 1: Create sandbox
  console.log('Step 1: Creating sandbox...')
  const createResponse = await fetch(`${baseUrl}/api/sandbox/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId,
      prompt: 'Create a simple todo app',
    }),
  })

  const createData = await createResponse.json()

  if (!createData.success) {
    console.error('❌ Failed to create sandbox:', createData.error)
    return
  }

  console.log('✅ Sandbox created successfully!')
  console.log(`   Sandbox ID: ${createData.sandboxId}`)
  console.log(`   API URL: ${createData.apiUrl}`)
  console.log(`   Preview URL: ${createData.previewUrl}`)

  // Step 2: Test /generate endpoint with credentials
  console.log('Step 2: Testing /generate endpoint with credentials...')
  console.log('   This will stream events for 30 seconds...\n')

  try {
    const response = await fetch(`${createData.apiUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        prompt: 'Create a simple hello world page',
        workdir: '/home/user/app',
        anthropic_auth_token: "sk_Y52XftPzTCOOrx9-oWJF_cRHUPWiZqirVYvov-qxWkA",
        anthropic_model: "deepseek/deepseek-v3.2",
      }),
    })

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`)
      const errorText = await response.text()
      console.error(`   Error: ${errorText}`)
      return
    }

    console.log('✅ Connection established. Receiving events:\n')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let eventCount = 0
    const startTime = Date.now()

    while (Date.now() - startTime < 30000) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          eventCount++
          const data = line.slice(6)
          try {
            const event = JSON.parse(data)
            console.log(`   [${event.type}] ${JSON.stringify(event.data).slice(0, 100)}...`)

            if (event.type === 'error') {
              console.log('\n❌ Error occurred in agent execution')
              console.log(`   Error: ${event.data.message}`)
              return
            }

            if (event.type === 'completed') {
              console.log('\n✅ Agent completed successfully!')
              return
            }
          } catch (e) {
            console.log(`   Raw: ${data}`)
          }
        }
      }
    }

    console.log(`\n⏱️  Timeout reached after ${eventCount} events`)

  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

testSandboxFlow()
