import './websites'
import { getWebSites, Living, CacheItem } from './types'
import { LocalMap, now } from '~/utils'

const listening: Set<chrome.runtime.Port> = new Set()
const EnablePolling = localStorage.getItem('EnablePolling')
const cache = new LocalMap<CacheItem<Living[]>>('cache')
let lastPoll = 0
console.log('EnablePolling', EnablePolling)

chrome.runtime.onConnect.addListener(async (port) => {
  console.log('on connect')
  console.assert(port.name == 'channel')

  sync(port)
  listening.add(port)
  port.onDisconnect.addListener(onPortDisconnect)
  await poll()
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
  if (now() - lastPoll <= 60) {
    return
  }
  const startTime = +new Date()
  console.log('poll start')
  await Promise.all(getWebSites().map(async w => {
    const living = await w.getLiving()
    cache.set(w.getId(), {
      lastUpdate: now(),
      content: living.sort(orderBy)
    })
  }))
  console.log('poll done', +new Date() - startTime)
  for (const p of listening) {
    sync(p)
  }
  lastPoll = now()
}

function sync(port: chrome.runtime.Port) {
  port.postMessage({ type: 'sync', cache })
}

function onPortDisconnect(port: chrome.runtime.Port) {
  listening.delete(port)
}
