import React, { useState, useCallback } from 'react'
import { render } from 'react-dom'

type PopupProps = {
}

export const Popup: React.FC<PopupProps> = ({}) => {
  const [ i, setI ] = useState(0)
  return <div>
    Popup {i}
    <button onClick={useCallback(() => setI(i + 1), [i])}>+</button>
    <button onClick={useCallback(() => setI(i - 1), [i])}>-</button>
  </div>
}

render(<Popup />, document.getElementById('app'))
