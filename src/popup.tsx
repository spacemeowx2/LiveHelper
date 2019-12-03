import React, { useState, useEffect, useCallback } from 'react'
import { render } from 'react-dom'
import { CacheItem, Living, CacheError, PollErrorType, maybeHas } from './types'
import { useNow } from './utils'
import { LocalizationProvider } from './langs'
import { Localized } from '@fluent/react'
import { Loading } from './loading'

type Cache = Record<string, CacheItem>

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
  const hasOnline = maybeHas(online)
  let timeView = <Localized id='time-started' />
  if (maybeHas(startAt)) {
    const sec = now - startAt
    const min = Math.round(sec / 60)
    const hour = Math.round(min / 60)
    timeView = <Localized
      id='time-passed'
      $hour={hour}
      $min={min}
      $sec={sec}
    />
  }

  return <div className='room' onClick={onClick}>
    <img className='preview' alt='preview' src={preview} />
    <div className='right'>
      <p className='title'>{title}</p>
      <div className='detail'>
        <span className='time'>{timeView}</span>
        <span className='author'>{author}</span>
        <span className='online'><Localized
          id={hasOnline ? 'online' : 'online-placeholder'}
          $online={online}
        /></span>
      </div>
    </div>
  </div>
}

const ShowError: React.FC<{ err: CacheError }> = ({ err: {type, message} }) => {
  if (type === PollErrorType.NotLogin) {
    return <Localized id='error-not-login'><span className='error'>Error not login</span></Localized>
  } else if (message) {
    return <Localized id={message}><span className='error'>{message}</span></Localized>
  } else {
    return <Localized id='error-unknown' ><span className='error'>Unknown error</span></Localized>
  }
}

const Site: React.FC<{
  id: string
  item: CacheItem
}> = ({ id, item }) => {
  const handleClick = useCallback(() => {
    window.open(item.info.homepage)
  }, [ item ])
  return <div className='site'>
    <Localized id={`site-${id}`}><div className='site-header' onClick={handleClick}>{id}</div></Localized>
    {
      !item.error ?
        item.living.length === 0 ?
          <span className='info'><Localized id='no-room' /></span> :
          item.living.map((i, id) => <Item key={id} room={i} />) :
        <ShowError err={item.error}/>
    }
  </div>
}

const Popup: React.FC = () => {
  const [ list, setList ] = useState<Cache>({})
  const [ polling, setPolling ] = useState(false)
  useEffect(() => {
    const port = chrome.runtime.connect({name: 'channel'})
    port.onMessage.addListener((m) => {
      setList(m.cache)
      setPolling(m.polling)
    })
    return () => port.disconnect()
  }, [])
  const keys = Object.keys(list)

  return <LocalizationProvider>
    <div className='status' data-polling={polling}>
      <div className='polling'>
        <Loading />
        <span><Localized id='loading' /></span>
      </div>
    </div>
    <div>
      { keys.map(k => <Site key={k} id={k} item={list[k]} />) }
    </div>
  </LocalizationProvider>
}

render(<Popup />, document.getElementById('app'))
