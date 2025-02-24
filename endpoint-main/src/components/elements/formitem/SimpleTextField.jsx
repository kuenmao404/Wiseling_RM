import React, { Fragment, useState, useEffect } from 'react'
import { TextField, IconButton } from '@mui/material'
import { Done, Close } from '@mui/icons-material'

export default function SimpleTextField({
  defaultValue = null,
  value = null,
  onChange = () => { },
  handleSubmit = () => { },
  handleCancel = () => { },
}) {
  const [current_value, setCurrentValue] = useState("")

  useEffect(() => {
    !!defaultValue && setCurrentValue(defaultValue)
  }, [])

  useEffect(() => {
    !defaultValue && setCurrentValue(value)
  }, [value])

  return (
    <Fragment>
      <TextField
        value={current_value || ""}
        onChange={e => (onChange(e), !value && setCurrentValue(e.target.value))}
        onKeyDown={(e) => e.keyCode == 13 && handleSubmit(current_value)}
        variant='standard'
        fullWidth
        autoFocus
      />
      <IconButton size='small' color='success' onClick={() => handleSubmit(current_value)}>
        <Done fontSize='small' />
      </IconButton>
      <IconButton size='small' color="error" onClick={() => handleCancel()}>
        <Close fontSize='small' />
      </IconButton>
    </Fragment>
  )
}
