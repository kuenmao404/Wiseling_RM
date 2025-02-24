import React, { Fragment, cloneElement } from 'react'
import { Box } from '@mui/material'
import Loading from '../loading'

export default function LoadingWrapper({ children, query = {} }) {

  if (query?.isLoading) {
    return (
      <Box sx={{ p: 2, width: "100%", boxSizing: "border-box" }} className="flex aic jcc">
        <Loading />
      </Box>
    )
  }

  if (Array.isArray(children)) {
    return (
      <Fragment>
        {children}
      </Fragment>
    )
  }

  return (
    <Fragment>
      {children ? cloneElement(children, {}) : children}
    </Fragment>
  )
}
