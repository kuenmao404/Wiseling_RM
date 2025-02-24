import React, { Fragment } from 'react'
import { Box, Typography, Divider } from '@mui/material'

export default function VideoPlayerInfo(props) {
  const { isSwipe, title, viewCount, onlyPlayer = false } = props

  return (
    <Fragment>
      <div className="video-wrapper">
        <div id="player" />
        {!!isSwipe && <div className='cover' />}
      </div>
      {!onlyPlayer &&
        <Box sx={{ m: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "18px" }}>
              {title}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "14px", marginTop: "8px", color: "#606060" }}>
              觀看次數：{viewCount}次
            </Typography>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </Box>
      }
    </Fragment>
  )
}
