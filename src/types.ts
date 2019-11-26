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
  getLiving: () => Promise<Living[]>
}
export class Result<T, E> {
  ok?: T
  err?: E
  is_ok: boolean
  constructor(f: () => T) {
    try {
      this.ok = f()
      this.is_ok = true
    } catch(e) {
      this.err = e
      this.is_ok = false
    }
  }
}

const websites: WebSite[] = []
export function registerWebSite (website: WebSite) {
  websites.push(website)
}
export function getWebSites () {
  return websites
}
