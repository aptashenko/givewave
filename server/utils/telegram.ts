import type { H3Event } from 'h3'
import { getRequestURL } from 'h3'

interface CreatedGiveawayNotification {
  title: string
  publicUrl: string
}

interface CriticalErrorNotification {
  error: unknown
  event?: H3Event
}

const TELEGRAM_MESSAGE_LIMIT = 4096
const TELEGRAM_TIMEOUT_MS = 3000

export async function sendGiveawayCreatedNotification(payload: CreatedGiveawayNotification) {
  await sendTelegramMessage([
    '<b>Новий конкурс створено</b>',
    '',
    `<b>Назва:</b> ${escapeHtml(payload.title)}`,
    `<b>Публічна сторінка:</b> ${escapeHtml(payload.publicUrl)}`
  ].join('\n'))
}

export async function sendCriticalErrorNotification(payload: CriticalErrorNotification) {
  const error = normalizeError(payload.error)
  const event = payload.event
  const method = event?.method || 'unknown'
  const url = event ? redactUrl(getRequestURL(event).toString()) : 'unknown'

  await sendTelegramMessage([
    '<b>Critical error</b>',
    '',
    `<b>Status:</b> ${error.statusCode}`,
    `<b>Method:</b> ${escapeHtml(method)}`,
    `<b>URL:</b> ${escapeHtml(url)}`,
    `<b>Message:</b> ${escapeHtml(error.message)}`,
    `<b>Time:</b> ${new Date().toISOString()}`
  ].join('\n'))
}

export async function sendTelegramMessage(text: string) {
  const config = useRuntimeConfig()
  const botToken = String(config.telegramBotToken || '')
  const chatId = String(config.telegramChatId || '')

  if (!botToken || !chatId) {
    return false
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS)

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncateTelegramMessage(text),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      console.error('[telegram] notification failed', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[telegram] notification failed', error)
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export function isCriticalError(error: unknown) {
  return normalizeError(error).statusCode >= 500
}

function normalizeError(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as {
      statusCode?: number
      status?: number
      message?: string
      statusMessage?: string
      name?: string
    }

    return {
      statusCode: candidate.statusCode || candidate.status || 500,
      message: candidate.statusMessage || candidate.message || candidate.name || 'Unknown server error'
    }
  }

  return {
    statusCode: 500,
    message: String(error || 'Unknown server error')
  }
}

function redactUrl(value: string) {
  const url = new URL(value)
  const sensitiveParams = ['token', 'adminToken', 'password', 'code']

  for (const param of sensitiveParams) {
    if (url.searchParams.has(param)) {
      url.searchParams.set(param, '[redacted]')
    }
  }

  return url.toString()
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function truncateTelegramMessage(value: string) {
  if (value.length <= TELEGRAM_MESSAGE_LIMIT) {
    return value
  }

  return `${value.slice(0, TELEGRAM_MESSAGE_LIMIT - 20)}\n...[truncated]`
}
