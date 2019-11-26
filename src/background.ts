import './websites'
import { getWebSites, Living, Result } from './types'

class CacheItem<T> {
  lastUpdate: Date = new Date()
  constructor(public content: T) {}
}

const EnablePolling = localStorage.getItem('EnablePolling')
const cache = new Map<string, CacheItem<Living[]>>()
console.log('EnablePolling', EnablePolling)

chrome.runtime.onMessage.addListener((message, callback, sendResponse) => {
  if (message?.type == 'popup') {
    sendResponse({greeting: 'welcome!', getWebSites()})
  }
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
  for (const w of getWebSites()) {
    const r = await w.getLiving()
    console.log(r)
  }
  console.log('poll')
}
poll()
