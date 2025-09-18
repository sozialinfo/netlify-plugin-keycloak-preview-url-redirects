import process from 'node:process'
import KcAdminClient from '@keycloak/keycloak-admin-client'

let client

// Runs on build success
export async function onSuccess({ utils: { build, status } }) {
  try {
    // Only run on deploy-preview context
    if (process.env.CONTEXT === 'production') {
      status.show({
        title: 'Keycloak Configuration',
        summary: 'Skipping Keycloak configuration because this is not a preview deploy',
      })
      return
    }

    // Get the site URL from Netlify environment
    const siteUrl = process.env.DEPLOY_PRIME_URL || process.env.URL

    if (!siteUrl) {
      status.show({
        title: 'Keycloak Configuration',
        summary: 'Skipping Keycloak configuration because site URL is not available',
      })
      return
    }

    if (!client) {
      client = new KcAdminClient({
        baseUrl: process.env.NTL_PLUGIN_KEYCLOAK_URL,
        realmName: process.env.NTL_PLUGIN_KEYCLOAK_REALM,
      })
    }

    await client.auth({
      username: process.env.NTL_PLUGIN_KEYCLOAK_ADMIN_USERNAME,
      password: process.env.NTL_PLUGIN_KEYCLOAK_ADMIN_PASSWORD,
      grantType: 'password',
      clientId: process.env.NTL_PLUGIN_KEYCLOAK_ADMIN_CLIENT_ID,
    })

    // get the client to update from Keycloak and add in the deploy preview URL in valid redirect URIs
    const appClient = await client.clients.findOne({ id: process.env.NTL_PLUGIN_KEYCLOAK_CLIENT_TO_UPDATE })
    client.clients.update(
      { id: process.env.NTL_PLUGIN_KEYCLOAK_CLIENT_TO_UPDATE },
      { redirectUris: [...appClient?.redirectUris || [], `${siteUrl}/*`] },
    )

    status.show({
      title: 'Keycloak Configuration Success',
      summary: `Successfully added redirect URI ${siteUrl}/*`,
    })
  }
  catch (error) {
    // Report a user error
    build.failBuild('Error message', { error })
  }
}
