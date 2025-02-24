import React, { useEffect } from 'react'
import { unstable_useBlocker as useBlocker } from 'react-router-dom'

export default function Prompt({ when, message }) {
  useBlocker(() => {
    if (when) {
      return !window.confirm(message)
    }
    return false
  }, [when])

  return <div key={when} />
}

const Beforeunload = ({ callback }) => {
  useEffect(() => {
    const handleTabClose = event => {
      // event.preventDefault()
      callback?.()
      // event.preventDefault()
    }
    window.addEventListener('beforeunload', handleTabClose)

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }
  }, [])
}

export { Beforeunload }