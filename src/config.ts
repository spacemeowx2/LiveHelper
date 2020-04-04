import './websites'
import { getWebSites, Living } from './types'
import { parseJSON } from './utils'

const Websites = getWebSites()
const DirtyKey = 'dirty'
const UseSyncKey = 'useSync'
const ConfigKey = 'config'
const LastPollKey = 'last_poll'
const PollLastPollKey = 'poll_last_poll'

export interface Config {
  enabled?: Record<string, boolean>
  preference?: {
    interval?: number
    notification?: boolean
    preview?: boolean
    ignoreFirstNotify?: boolean
  }
}
export type Preference = Required<Required<Config>['preference']>

function getArea () {
  const UseSync = parseJSON(localStorage.getItem(UseSyncKey), false)
  const area: chrome.storage.StorageArea = UseSync ? chrome.storage.sync : chrome.storage.local
  return area
}

async function get<T> (key: string): Promise<T | undefined> {
  return new Promise((res, rej) => {
    getArea().get(key, (items) => {
      res(items[key])
    })
  })
}

async function set(key: string, value: unknown): Promise<void> {
  return new Promise((res, rej) => {
    getArea().set({
      [key]: value
    }, res)
  })
}

export function setConfig (config: Config) {
  return set(ConfigKey, config)
}

export async function getConfig () {
  return await get<Config>(ConfigKey) || {
    preference: {
      interval: 5,
      notification: true,
      preview: true,
      ignoreFirstNotify: true
    }
  }
}

export async function getEnabledWebsites () {
  const cfg = await getConfig()
  return Websites.filter(i => cfg.enabled && cfg.enabled[i.id])
}

export function setLastPoll(value: Record<string, Living>) {
  localStorage.setItem(LastPollKey, JSON.stringify(value))
}

export function getLastPoll(): Record<string, Living> {
  return parseJSON(localStorage.getItem(LastPollKey)) || {}
}

export function setPollLastPoll(value: number) {
  localStorage.setItem(PollLastPollKey, JSON.stringify(value))
}

export function getPollLastPoll(): number {
  return parseJSON(localStorage.getItem(PollLastPollKey)) || 0
}

export function setDirty() {
  localStorage.setItem(DirtyKey, 'true')
}

export function getDirty() {
  const ret = localStorage.getItem(DirtyKey) === 'true'
  localStorage.removeItem(DirtyKey)
  return ret
}

export async function getInterval() {
  const cfg = await getConfig()
  return cfg.preference?.interval || 5
}

export async function getSendNotification() {
  const cfg = await getConfig()
  return cfg.preference?.notification || true
}
