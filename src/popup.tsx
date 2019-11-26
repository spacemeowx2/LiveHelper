import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { CacheItem, Living } from './types'

type Cache = Record<string, CacheItem<Living[]>>

const Item: React.FC<{ room: Living }> = ({ room: {
  preview,
  title,
  author,
  startAt,
  online,
} }) => {
  return <div className='room'>
    <img className='preview' src={preview} />
    <div className='detail'>
      <p className='title'>{title}</p>
      <span className='time'>{startAt}</span>
      <span className='nickname'>{author}</span>
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
    { item.content.map(i => <Item room={i} />) }
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
  })
  const keys = Object.keys(list)

  return <div>
    { keys.map(k => <Site id={k} item={list[k]} />) }
  </div>
}

render(<Popup />, document.getElementById('app'))
