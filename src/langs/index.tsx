import React from 'react'
import { FluentBundle, FluentResource } from '@fluent/bundle'
import { LocalizationProvider as LP } from '@fluent/react'
import zh_CN from './zh_CN'

const LangMap: Record<string, string> = {
  'zh-CN': zh_CN
}
const BundleMap: Record<string, FluentBundle> = {}
const Langs = ['zh-CN']

for (const locale of Object.keys(LangMap)) {
  const bundle = new FluentBundle(locale)
  bundle.addResource(new FluentResource(LangMap[locale]))
  BundleMap[locale] = bundle
}

const langs = [chrome.i18n.getUILanguage(), ...Langs]
const bundles = langs.map(i => BundleMap[i]).filter(Boolean)

export const LocalizationProvider: React.FC = ({ children }) => {
  return <LP bundles={bundles}>
    {children}
  </LP>
}
