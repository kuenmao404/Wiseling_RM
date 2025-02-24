import React from 'react'
import { Link } from 'react-router-dom'
import { Box } from '@mui/material'

export default function LinkWrapper({ children, props, onClick = null, to = "", className="" }) {

  if (onClick !== null)
    return (
      <Box onClick={onClick} className={className} {...props}>
        {children}
      </Box>
    )

  return (
    <Link to={to} className={className} {...props}>
      {children}
    </Link>
  )
}
