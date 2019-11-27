import React, { useState, useEffect, useCallback } from 'react'
import { render } from 'react-dom'
import { CacheItem, Living } from './types'
import { now, useNow } from './utils'
import { LocalizationProvider } from './langs'
import { Localized } from '@fluent/react'

type Cache = Record<string, CacheItem<Living[]>>

const Item: React.FC<{ room: Living }> = ({ room: {
  preview,
  title,
  author,
  startAt,
  online,
  url,
} }) => {
  const now = useNow()
  const onClick = useCallback(() => {
    window.open(url)
  }, [url])
  const sec = startAt ? now - startAt : null
  const min = sec ? Math.round(sec / 60) : null
  const hour = min ? Math.round(min / 60) : null
  return <div className='room' onClick={onClick}>
    <img className='preview' src={preview} />
    <div className='right'>
      <p className='title'>{title}</p>
      <div className='detail'>
        <span className='time'><Localized
          id='time-passed'
          $hour={hour}
          $min={min}
          $sec={sec}
        /></span>
        <span className='author'>{author}</span>
        <span className='online'><Localized
          id='online'
          $online={online}
        /></span>
      </div>
    </div>
  </div>
}

const Site: React.FC<{
  id: string
  item: CacheItem<Living[]>
}> = ({ id, item }) => {
  return <div className='site'>
    <div className='site-header'><Localized id={`site-${id}`} /></div>
    { item.content.map((i, id) => <Item key={id} room={i} />) }
  </div>
}

const Popup: React.FC = () => {
  const [ list, setList ] = useState<Cache>({})
  useEffect(() => {
    const port = chrome.runtime.connect({name: 'channel'})
    port.onMessage.addListener((m) => {
      setList(m.cache)
    })
    return () => port.disconnect()
  }, [])
  const keys = Object.keys(list)

  return <LocalizationProvider>
    <div>
      { keys.map(k => <Site key={k} id={k} item={list[k]} />) }
    </div>
  </LocalizationProvider>
}

render(<Popup />, document.getElementById('app'))
