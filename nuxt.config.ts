// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    databaseSsl: process.env.DATABASE_SSL === 'true',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  }
})
