import './websites'
import { getWebSites, Living, CacheItem } from './types'
import { LocalMap } from '~/utils'

const listening: Set<chrome.runtime.Port> = new Set()
const EnablePolling = localStorage.getItem('EnablePolling')
const cache = new LocalMap<CacheItem<Living[]>>('cache')
let lastPoll = 0
console.log('EnablePolling', EnablePolling)

chrome.runtime.onConnect.addListener(async (port) => {
  console.assert(port.name == 'channel')

  sync(port)
  listening.add(port)
  port.onDisconnect.addListener(onPortDisconnect)
  await poll()
})

if (EnablePolling) {
  chrome.alarms.create({
    delayInMinutes: 1,
    periodInMinutes: 1,
  })
  chrome.alarms.onAlarm.addListener(() => {
    poll()
  })
}

async function poll() {
  if (+new Date() - lastPoll <= 1000 * 60) {
    return
  }
  const startTime = +new Date()
  console.log('poll start')
  await Promise.all(getWebSites().map(async w => {
    const living = await w.getLiving()
    cache.set(w.getId(), {
      lastUpdate: +new Date(),
      content: living
    })
  }))
  console.log('poll done', +new Date() - startTime)
  for (const p of listening) {
    sync(p)
  }
  lastPoll = +new Date()
}
poll()

function sync(port: chrome.runtime.Port) {
  port.postMessage({ type: 'sync', cache })
}

function onPortDisconnect(port: chrome.runtime.Port) {
  listening.delete(port)
}
