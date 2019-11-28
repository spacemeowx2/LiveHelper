export enum PollErrorType {
  NotLogin,
  Other,
}
export class PollError extends Error {
  constructor (public readonly type: PollErrorType) {
    super()
  }
}
export interface CacheError {
  type: PollErrorType
  message?: string
}
export type Maybe<T> = T | undefined | null
export interface Living {
  // room title
  title: string
  // url to preview image
  preview: string
  // UTC time in seconds
  startAt: Maybe<number>
  // author
  author: string
  // online viewer
  online: Maybe<number>
  // the room url
  url: string
}
export interface WebSite {
  readonly id: string
  getLiving: () => Promise<Living[]>
}
export type CacheItem<T> = {
  lastUpdate: number
  content: T
} | {
  lastUpdate: number
  error: CacheError
}
export function CacheHasContent<T> (i: CacheItem<T>): i is {
  lastUpdate: number
  content: T
} {
  return Object.keys(i).indexOf('content') !== -1
}

const websites: WebSite[] = []
export function registerWebSite (website: WebSite) {
  websites.push(website)
}
export function getWebSites () {
  return websites
}
