import { fileURLToPath } from 'node:url'
import netlifyBuild from '@netlify/build'
import { expect, it } from 'vitest'

const NETLIFY_CONFIG = fileURLToPath(
  new URL('../netlify.toml', import.meta.url),
)

it('netlify build should not fail', async () => {
  const { success, logs } = await netlifyBuild({
    config: NETLIFY_CONFIG,
    buffer: true,
    context: 'deploy-preview',
  })

  // Netlify Build output
  // eslint-disable-next-line no-console
  console.log(
    [logs.stdout.join('\n'), logs.stderr.join('\n')]
      .filter(Boolean)
      .join('\n\n'),
  )

  // Check that build succeeded
  expect(success).toBe(true)
})
