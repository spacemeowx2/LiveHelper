export enum PollErrorType {
  NotLogin,
}
export class PollError extends Error {
  constructor (private type: PollErrorType) {
    super()
  }
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
  getId: () => string
  getLiving: () => Promise<Living[]>
}
export interface CacheItem<T> {
  lastUpdate: number
  content: T
}

const websites: WebSite[] = []
export function registerWebSite (website: WebSite) {
  websites.push(website)
}
export function getWebSites () {
  return websites
}
