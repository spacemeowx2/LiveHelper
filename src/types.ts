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
export function maybeHas<T>(t: Maybe<T>): t is T {
  return t !== undefined && t !== null
}
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
export interface WebSiteInfo {
  readonly id: string
  readonly homepage: string
}
export interface WebSite extends WebSiteInfo {
  getLiving: () => Promise<Living[]>
}
export type CacheItem = {
  lastUpdate: number
  info: WebSiteInfo
  living: Living[]
  error?: CacheError
}
const websites: WebSite[] = []
export function registerWebSite (website: WebSite) {
  websites.push(website)
}
export function getWebSites () {
  return websites
}
