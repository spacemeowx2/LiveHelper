import { Living, CacheItem, CacheError, PollError, PollErrorType } from './types'
import { LocalMap, now } from '~/utils'
import * as config from './config'

const listening: Set<chrome.runtime.Port> = new Set()
const EnablePolling = localStorage.getItem('EnablePolling')
const cache = new LocalMap<CacheItem>('cache')
let polling = false
let lastPoll = 0
console.log('EnablePolling', EnablePolling)

chrome.runtime.onConnect.addListener(async (port) => {
  console.log('on connect')
  if (port.name === 'channel') {
    sync(port)
    listening.add(port)
    port.onDisconnect.addListener(onPortDisconnect)
    await poll()
  }
})

if (EnablePolling) {
  chrome.alarms.create({
    delayInMinutes: 1,
    periodInMinutes: 5,
  })
  chrome.alarms.onAlarm.addListener(() => {
    poll()
  })
}

function orderBy(b: Living, a: Living) {
  return (a.online || 0) - (b.online || 0)
}

async function poll() {
  if (now() - lastPoll <= 10) {
    return
  }
  const startTime = +new Date()
  polling = true
  syncAll()
  const enabledWebsites = await config.getEnabledWebsites()
  cache.filterKeys(enabledWebsites.map(i => i.id))
  await Promise.all(enabledWebsites.map(async w => {
    let error: CacheError | undefined
    try {
      const living = await w.getLiving()
      cache.set(w.id, {
        lastUpdate: now(),
        info: w,
        living: living.sort(orderBy),
        error,
      })
    } catch (e) {
      if (e instanceof PollError) {
        error = {
          type: e.type,
          message: e.message,
        }
      } else {
        error = {
          type: PollErrorType.Other,
          message: e.message
        }
      }
      cache.set(w.id, {
        lastUpdate: now(),
        info: w,
        living: [],
        error,
      })
    }
  }))
  polling = false
  console.log('poll done', +new Date() - startTime)
  // eslint-disable-next-line
  lastPoll = now()
  syncAll()
}

function syncAll() {
  for (const p of listening) {
    sync(p)
  }
}

function sync(port: chrome.runtime.Port) {
  port.postMessage({
    type: 'sync',
    cache: cache.toJSON(),
    polling,
  })
}

function onPortDisconnect(port: chrome.runtime.Port) {
  listening.delete(port)
}
