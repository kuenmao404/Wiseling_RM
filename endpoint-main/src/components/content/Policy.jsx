import React from 'react'
import policy from '../../markdown/policy.md?raw'
import MarkdownView from '../elements/markdown/MarkdownView'
import { Box } from '@mui/material'

export default function Policy({ margin }) {

  return (
    <Box className='markdown-body github policy' sx={{ padding: margin, backgroundColor: "#fff" }}>
      <MarkdownView source={policy} />
    </Box>
  )
}
