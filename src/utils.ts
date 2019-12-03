import { parse, HTMLElement } from 'node-html-parser'
import { useState, useEffect } from 'react'
import deepmerge from 'deepmerge'

export { HTMLElement } from 'node-html-parser'
export { deepmerge }

export function useNow() {
  const [ time, setTime ] = useState(now())
  useEffect(() => {
    const id = setInterval(() => setTime(now()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function now() {
  return Math.floor(+new Date() / 1000)
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
  filterKeys(keys: string[]) {
    for (const key of Object.keys(this.mem)) {
      if (!keys.includes(key)) {
        delete this.mem[key]
      }
    }
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

/**
 * Parse views to number
 * @param views views could be:
 *   1.01万
 *   39.78万
 *   8,346
 *   16
 */
export function parseViews(views: string): number | undefined {
  const map: Record<string, number> = {
    '': 1,
    '万': 10000,
    '千': 1000,
    '百': 100,
  }
  const re = /^([\d.,]+)([万千百]?)$/.exec(views)
  if (re === null) {
    return undefined
  }
  const [ , num, unit ] = re
  return parseFloat(num.replace(/,/g, '')) * map[unit]
}
