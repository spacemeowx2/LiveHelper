import { Shit } from './types'

chrome.runtime.onMessage.addListener((message, callback, sendResponse) => {
  if (message == 'hello') {
    sendResponse({greeting: 'welcome!', Shit})
  }
})

chrome.alarms.onAlarm.addListener(() => {
  alert("Hello, world!")
})

chrome.alarms.create({delayInMinutes: 5.0})
