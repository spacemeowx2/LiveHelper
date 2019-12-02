import React from 'react'
import loading from '~/img/loading.gif'

export const Loading: React.FC = () => {
  return <img src={loading} className='loading' alt='loading' />
}
