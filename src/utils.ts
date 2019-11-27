import { parse, HTMLElement } from 'node-html-parser'
export { HTMLElement } from 'node-html-parser'

export function now() {
  return Math.floor(+new Date())
}

export function parseJSON(s: any, def: any = undefined) {
  try {
    return JSON.parse(s)
  } catch (e) {
    return def
  }
}

export class LocalMap<V> {
  private mem: Record<string, V>
  private id: ReturnType<typeof setTimeout> | undefined
  constructor(private name: string) {
    this.mem = parseJSON(window.localStorage.getItem(name)) || {}
  }
  set(k: string, v: V) {
    this.mem[k] = v
    this.save()
  }
  get(k: string) {
    return this.mem[k]
  }
  private save() {
    if (this.id !== undefined) {
      clearTimeout(this.id)
      this.id = undefined
    }
    this.id = setTimeout(() => {
      window.localStorage.setItem(this.name, JSON.stringify(this.mem))
    }, 0)
  }
  toJSON () {
    return this.mem
  }
}

export function parseHTML(html: string) {
  return (parse(html) as (HTMLElement & {
    valid: boolean;
  }))
}

export function mapFilter<T, U>(ary: T[], f: (t: T) => U | undefined | null) {
  return ary.map(f).filter(Boolean) as U[]
}
