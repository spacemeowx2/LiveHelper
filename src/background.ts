import './websites'
import { getWebSites } from './types'

const EnablePolling = localStorage.getItem('EnablePolling')
console.log('EnablePolling', EnablePolling)

// chrome.runtime.onMessage.addListener((message, callback, sendResponse) => {
//   if (message == 'hello') {
//     sendResponse({greeting: 'welcome!', getWebSites()})
//   }
// })

if (EnablePolling) {
  chrome.alarms.create({
    delayInMinutes: 1,
    periodInMinutes: 1,
  })
  chrome.alarms.onAlarm.addListener(() => {
    poll()
  })
}

function poll() {
  console.log('poll')
}
console.log(getWebSites())
