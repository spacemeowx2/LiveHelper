import './websites'
import React, { useState, useCallback, ChangeEvent, createContext, useMemo, useContext, useEffect } from 'react'
import { render } from 'react-dom'
import { LocalizationProvider } from './langs'
import { Localized } from '@fluent/react'
import { getWebSites } from './types'
import { deepmerge } from './utils'
import * as cfg from './config'

const websites = getWebSites()
const ConfigCtx = createContext<{
  config: cfg.Config
  setConfig: (c: cfg.Config) => void
}>({
  config: {},
  setConfig: () => void 0,
})

const CheckBox: React.FC<{
  value?: boolean,
  onChange: (v: boolean) => void,
}> = ({ value, onChange, children }) => {
  return <div className='checkbox'>
    <label>
      <input type='checkbox' checked={value} onChange={useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.currentTarget.checked)
      }, [ onChange ])} value='o1n' />
      <span>{children}</span>
    </label>
  </div>
}

const SiteEnabled: React.FC<{id: string}> = ({ id }) => {
  const { config, setConfig } = useContext(ConfigCtx)
  const onChange = useCallback((value: boolean) => {
    setConfig({
      enabled: {
        [id]: value
      }
    })
  }, [ setConfig, id ])
  return <CheckBox value={config.enabled?.[id]} onChange={onChange}><Localized id={`site-${id}`} /></CheckBox>
}

const useMiscCheckBox = (key: keyof cfg.Preference) => {
  const { config, setConfig } = useContext(ConfigCtx)
  const onChange = useCallback((value: boolean) => {
    setConfig({
      preference: {
        [key]: value
      }
    })
  }, [ setConfig, key ])
  return {
    value: config.preference?.[key] as boolean,
    onChange,
  } as const
}

const OptionSectionTitle: React.FC<{
  subTitle?: string
}> = ({subTitle, children }) => {
  return <>
    <h2>{children}</h2>
    { subTitle && <p>{subTitle}</p> }
  </>
}

const WebsiteSection: React.FC = () => {
  return <section>
    <Localized id='options-website-title' attrs={{subTitle: true}}>
      <OptionSectionTitle />
    </Localized>
    { websites.map(({ id }) => <div>
      <SiteEnabled id={id} />
    </div>) }
  </section>
}

const MiscCheckBoxKeys: (keyof cfg.Preference)[] = ['notification', 'preview', 'ignoreFirstNotify']
const MiscSection: React.FC = () => {
  // eslint-disable-next-line
  const checkboxs = MiscCheckBoxKeys.map(key => <CheckBox key={key} {...useMiscCheckBox(key)}><Localized id={`misc-${key}`} /></CheckBox>)
  return <section>
    <Localized id='options-misc-title' attrs={{subTitle: true}}>
      <OptionSectionTitle />
    </Localized>
    { checkboxs }
  </section>
}

const Options: React.FC = () => {
  const [ config, setConfigOri ] = useState<cfg.Config>({})
  const setConfig = useCallback((newConfig: cfg.Config) => {
    const ret = deepmerge(config, newConfig)
    console.log('set', config, newConfig, ret)
    setConfigOri(newConfig)
  }, [  ])
  useEffect(() => {
    cfg.getConfig().then(setConfigOri)
  }, [])
  useEffect(() => {
    cfg.setConfig(config)
  }, [ config ])

  return <LocalizationProvider>
    <ConfigCtx.Provider value={useMemo(() => ({
      config,
      setConfig,
    }), [ config, setConfig ])}>
      <h1><Localized id='options' /></h1>
      <WebsiteSection />
      <MiscSection />
    </ConfigCtx.Provider>
  </LocalizationProvider>
}

render(<Options />, document.getElementById('app'))
