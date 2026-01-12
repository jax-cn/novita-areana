import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultWeb } from '@/lib/types'
import { Sandbox } from 'novita-sandbox'

const sandboxTimeout = 10 * 60 * 1000

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    fragment,
  }: {
    fragment: FragmentSchema
  } = await req.json()

  console.log('fragment', fragment)

  const sbx = await Sandbox.create(fragment.template, {
    metadata: {
      template: fragment.template,
    },
    timeoutMs: sandboxTimeout,
  })

  if (fragment.has_additional_dependencies) {
    try {
      console.log(`Installing dependencies: ${fragment.install_dependencies_command}`)
      const result = await sbx.commands.run(fragment.install_dependencies_command)
      console.log(`Install result:`, result)
      console.log(
        `Installed dependencies: ${fragment.additional_dependencies.join(', ')} in sandbox ${sbx.sandboxId}`,
      )
    } catch (error: unknown) {
      console.error(`Failed to install dependencies:`, error)
      // Continue anyway - some dependencies might already be pre-installed
      // This allows the sandbox to start even if install fails
    }
  }

  await sbx.files.write(fragment.file_path, fragment.code)
  console.log(`Copied file to ${fragment.file_path} in ${sbx.sandboxId}`)

  return new Response(
    JSON.stringify({
      sbxId: sbx?.sandboxId,
      template: fragment.template,
      url: `https://${sbx?.getHost(fragment.port || 80)}`,
    } as ExecutionResultWeb),
  )
}
