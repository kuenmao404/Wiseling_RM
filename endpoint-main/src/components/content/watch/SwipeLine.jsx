import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function SwipeLine(props) {
  const { getPosition, setSwipe, isSwipe, width, setClose, close } = props
  const [isHover, setHover] = useState(false)
  const [startX, setStartX] = useState(null)

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });

  const onMouseDown = (e) => {
    if (e.button === 0) {
      setStartX(e.pageX)
      setSwipe(true)
    }
  }

  const onMouseMove = (e) => {
    if (startX != null) {
      getPosition(document.body.clientWidth - e.pageX)
    }
  }

  const onMouseUp = (e) => {
    setStartX(null)
    setSwipe(false)
  }

  const left_right = (width < 100 || close) ? {
    right: "3px", borderRadius: "5px 0 0 5px",
  } : {
    left: "5px", borderRadius: "0 5px 5px 0",
  }

  return (
    <Box
      sx={{ width: "5px", backgroundColor: "#9e9e9e", position: "relative", zIndex: "2" }}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!close &&
        <Box
          sx={{
            width: (!!isHover || isSwipe) ? "25px" : "0px", height: "60px", position: "absolute", backgroundColor: "#9e9e9e",
            bottom: "50%"//, transform: "translate(0, -50%)"
            , ...left_right,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "ew-resize",
            transition: "all .2s"
          }}
          onMouseDown={onMouseDown}
        >
          {(!!isHover || isSwipe) && <ViewCompactIcon className='transform-90' />}
        </Box>}
      <Box
        sx={{
          width: (!!isHover || isSwipe || close) ? "25px" : "0px", height: "60px", position: "absolute", backgroundColor: "#9e9e9e",
          top: "50%", // transform: "translate(0, -50%)", 
          ...left_right,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          transition: "all .2s"
        }}
        onClick={() => (setClose())}
      >
        {(!!isHover || isSwipe || close) && <VisibilityIcon className='transform-90' />}
      </Box>
    </Box>
  )
}
