import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   customerBotLlmEndpoint: string,

   customerBotLlmApiKey: string,

   customerBotLlmModel: string,

   customerBotPlatformLlmEndpoint: string,

   customerBotPlatformLlmApiKey: string,

   customerBotPlatformLlmModel: string,

   customerBotWidgetVersion: string,

   customerBotCloudflareMigrationPhase: string,

   nitro: {
      envPrefix: string,
   },
  }
  interface SharedPublicRuntimeConfig {
   customerBotDeploymentTarget: string,

   customerBotPublicBaseUrl: string,

   customerBotStagingBaseUrl: string,
  }
declare module '@nuxt/schema' {
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }