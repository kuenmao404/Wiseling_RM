import React from 'react'
import { Box, Divider } from '@mui/material'
import { TimeBlock } from '../note/NoteItem'
import MarkdownView from '../markdown/MarkdownView'

export default function NoteListItem(props) {
  const { sx, d, onClick = () => { } } = props

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ mb: 1 }} className="flex aic">
        <TimeBlock start={d?.startTime} onClick={onClick} />
        <Box sx={{ fontSize: "18px", whiteSpace: "pre-wrap" }}>
          <b>{d?.notebookName} - </b><span style={{ color: "#606060" }}>{d?.title}</span>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <MarkdownView source={d?.content} />
    </Box>
  )
}
