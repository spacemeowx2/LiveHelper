export enum PollErrorType {
  NotLogin,
}
export class PollError extends Error {
  constructor (private type: PollErrorType) {
    super()
  }
}
export interface Living {
  title: string
  preview: string
  start_at: number
  author: string
  online: string
  url: string
}
export interface WebSite {
  getLiving (): Promise<Living[]>
}

const websites: WebSite[] = []
export function registerWebSite (id: string, website: WebSite) {
  websites.push(website)
}
export function getWebSites () {
  return websites
}
