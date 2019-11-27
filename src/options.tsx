import './websites'
import React from 'react'
import { render } from 'react-dom'
import { LocalizationProvider } from './langs'
import { Localized } from '@fluent/react'
import { getWebSites } from './types'

export const OptionSectionTitle: React.FC<{
  subTitle?: string
}> = ({subTitle, children }) => {
  return <>
    <h2>{children}</h2>
    <p>{subTitle}</p>
  </>
}

const websites = getWebSites()
const Options: React.FC = () => {
  return <LocalizationProvider>
    <h1><Localized id='options' /></h1>
      <section>
        <Localized id='website-title' attrs={{subTitle: true}}>
          <OptionSectionTitle />
        </Localized>
        { websites.map(w => <div>
          <><input type='checkbox' /><Localized id={`site-${w.getId()}`} /></>
        </div>) }
      </section>
  </LocalizationProvider>
}

render(<Options />, document.getElementById('app'))
