import React, { useState, useEffect, useCallback } from 'react'
import { render } from 'react-dom'
import { CacheItem, Living } from './types'
import { now } from './utils'

type Cache = Record<string, CacheItem<Living[]>>

const Item: React.FC<{ room: Living }> = ({ room: {
  preview,
  title,
  author,
  startAt,
  online,
  url,
} }) => {
  const time = startAt ? now() - startAt : null
  return <div className='room' onClick={useCallback(() => {
    window.open(url)
  }, [url])}>
    <img className='preview' src={preview} />
    <div className='detail'>
      <p className='title'>{title}</p>
      <span className='time'>{time}</span>
      <span className='author'>{author}</span>
      <span className='online'>{online}</span>
    </div>
  </div>
}

const Site: React.FC<{
  id: string
  item: CacheItem<Living[]>
}> = ({ id, item }) => {
  return <div className='site'>
    <div className='site-header'>{id}</div>
    { item.content.map((i, id) => <Item key={id} room={i} />) }
  </div>
}

const Popup: React.FC = () => {
  const [ list, setList ] = useState<Cache>({})
  useEffect(() => {
    const port = chrome.runtime.connect({name: 'channel'})
    port.onMessage.addListener((m) => {
      setList(m.cache)
      console.log('on message')
    })
    return () => port.disconnect()
  }, [])
  const keys = Object.keys(list)

  return <div>
    { keys.map(k => <Site key={k} id={k} item={list[k]} />) }
  </div>
}

render(<Popup />, document.getElementById('app'))
