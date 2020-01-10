import { Living, CacheItem, CacheError, PollError, PollErrorType } from './types'
import { LocalMap, now } from '~/utils'
import * as config from './config'

enum From {
  Timer,
  User,
}
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
    await poll(From.User)
  }
})

chrome.notifications.onClicked.addListener((id) => {
  console.log('click', id)
  window.open(id)
})

if (EnablePolling) {
  chrome.alarms.create({
    delayInMinutes: 1,
    periodInMinutes: 5,
  })
  chrome.alarms.onAlarm.addListener(() => {
    poll(From.Timer)
  })
}

function orderBy(b: Living, a: Living) {
  return (a.online || 0) - (b.online || 0)
}

function dictByUrl(all: Living[]) {
  let out: Record<string, Living> = {}
  for (const i of all) {
    out[i.url] = i
  }
  return out
}

function beginLive(item: Living) {
  console.log('beginLive', item)
  chrome.notifications.create(item.url, {
    type: 'basic',
    iconUrl: item.preview,
    title: item.title,
    message: '正在直播',
    contextMessage: item.author
  }, function () { return false })
}

function endLive(item: Living) {
  console.log('endLive', item)
  chrome.notifications.clear(item.url)
}

async function poll(from: From) {
  if (now() - lastPoll <= 10) {
    return
  }
  const startTime = +new Date()
  const enabledWebsites = await config.getEnabledWebsites()
  const notification = !!(await config.getConfig()).preference?.notification

  if (notification || from === From.User) {
    polling = true
    syncAll()

    const all: Living[] = []
    cache.filterKeys(enabledWebsites.map(i => i.id))
    await Promise.all(enabledWebsites.map(async w => {
      let error: CacheError | undefined
      try {
        const living = await w.getLiving()
        all.push(...living)
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
    const living = dictByUrl(all)
    const lastLiving = config.getLastPoll()
    for (const [key, value] of Object.entries(living)) {
      if (!lastLiving[key]) {
        beginLive(value)
      }
    }
    for (const [key, value] of Object.entries(lastLiving)) {
      if (!living[key]) {
        endLive(value)
      }
    }
    config.setLastPoll(living)

    polling = false
    console.log('poll done', +new Date() - startTime)
    // eslint-disable-next-line
    lastPoll = now()
    syncAll()
  }
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
