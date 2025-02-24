import React from 'react'

import { Box, Tooltip, IconButton, Switch, useMediaQuery } from '@mui/material'
import { SkipPrevious, NavigateBefore, NavigateNext, SkipNext } from '@mui/icons-material'

import useDialogStore from '../../../../store/dialog'

import { useAtom } from 'jotai'
import { atomWithStorage } from "jotai/utils"
export const autoPlayAtom = atomWithStorage("auto_play", true)

export default function VideoControl({
  getPerNextChapter = null,
  getPerNextVideo = null,
  isLoading = false,
  width = 450,
}) {
  const [auto_play, setAutoPlay] = useAtom(autoPlayAtom)
  const { isDrawerOpen } = useDialogStore()

  const xs = useMediaQuery(!isDrawerOpen ? `(min-width:${768 + width}px)` : `(min-width:${1008 + width}px)`)

  return (
    <Box sx={{ borderRadius: "5px", backgroundColor: "rgb(244, 244, 244)", p: "4px", mt: !xs ? 1 : null }} className="flex jcc aic">
      {!!getPerNextChapter &&
        <Tooltip title="上個段落">
          <IconButton size='small' onClick={() => !isLoading && getPerNextChapter(-1)}>
            <SkipPrevious />
          </IconButton>
        </Tooltip>
      }
      <Tooltip title="上個影片" onClick={() => !isLoading && getPerNextVideo(-1)}>
        <IconButton size='small'>
          <NavigateBefore />
        </IconButton>
      </Tooltip>
      <Tooltip title="自動播放">
        <Switch size="small" checked={auto_play} onChange={e => setAutoPlay(e.target.checked)} />
      </Tooltip>
      <Tooltip title="下個影片" onClick={() => !isLoading && getPerNextVideo(1)}>
        <IconButton size='small'>
          <NavigateNext />
        </IconButton>
      </Tooltip>
      {!!getPerNextChapter &&
        <Tooltip title="下個段落" onClick={() => !isLoading && getPerNextChapter(1)}>
          <IconButton size='small'>
            <SkipNext />
          </IconButton>
        </Tooltip>
      }
    </Box>
  )
}
