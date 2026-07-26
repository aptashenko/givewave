import { isCriticalError, sendCriticalErrorNotification } from '~~/server/utils/telegram'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error, context) => {
    if (!isCriticalError(error)) {
      return
    }

    await sendCriticalErrorNotification({
      error,
      event: context.event
    })
  })
})
