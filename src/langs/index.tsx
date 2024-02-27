import React from 'react'
import { FluentBundle, FluentResource, FluentNumber, FluentFunction, FluentValue } from '@fluent/bundle'
import { LocalizationProvider as LP } from '@fluent/react'
import zh_CN from './zh_CN'
import { Maybe, maybeHas } from '~/src/types'

const LangMap: Record<string, string> = {
  'zh-CN': zh_CN
}
const BundleMap: Record<string, FluentBundle> = {}
const Langs = ['zh-CN']
const functions: Record<string, FluentFunction> = {
  DIV([a, b]: FluentValue[]) {
    return new FluentNumber(a.value / b.value)
  },
  STRLEN([str]: FluentValue<string>[]) {
    return new FluentNumber(str.value.toString().length)
  },
  MINUS([a, b]: FluentValue<number>[]) {
    return a.value - b.value
  },
  CMP([a, b]: FluentValue<number>[]) {
    if (a.value === b.value) {
      return 'EQ'
    } else if (a.value > b.value) {
      return 'GT'
    } else {
      return 'LT'
    }
  },
  STR([n]: FluentValue<number>[]) {
    return n.value.toString()
  },
  MAYBE_HAS([n]: FluentValue<Maybe<any>>[]) {
    return maybeHas(n.value) ? 'has' : 'none'
  }
}

for (const locale of Object.keys(LangMap)) {
  const bundle = new FluentBundle(locale, {
    functions
  })
  bundle.addResource(new FluentResource(LangMap[locale]))
  BundleMap[locale] = bundle
}

const langs = [chrome.i18n.getUILanguage(), ...Langs]
const bundles = langs.map(i => BundleMap[i]).filter(Boolean)

export const LocalizationProvider: React.FC = ({ children }) => {
  return <LP bundles={bundles}>
    <>{children}</>
  </LP>
}
