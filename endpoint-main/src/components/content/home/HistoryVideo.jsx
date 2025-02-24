import React from 'react'
import { Box, Tooltip } from '@mui/material'
import NoteCard from '../../elements/cards/NoteCard'
import { ArrowForwardIos } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getVideoHistory } from '../../../apis'
import VideoCard from '../../elements/cards/VideoCard'

export default function HistoryVideo() {
  let navigate = useNavigate()
  const query = useQuery({ queryKey: ['getVideoHistory'], queryFn: () => getVideoHistory({ top: 10 }) })

  return (
    <Box sx={{ m: "16px 0" }}>
      <Box sx={{ mb: 1 }}>
        上次觀看
      </Box>
      <Box className="flex fwnw" sx={{ overflow: "hidden", pb: 1, position: "relative", }}>
        {Array.isArray(query.data) && query.data?.map(d =>
          <VideoCard
            key={d?.videoID + d?.date} v={d?.videoID} title={d?.title} viewCount={d?.viewCount} channelTitle={d?.channelTitle} vid={d?.vid} isColumn={true}
            sx={{ width: 300, mr: 2 }}
          />
        )}
        <Tooltip title={"移動至觀看紀錄"}>
          <Box
            sx={{
              position: "absolute", width: "50px", right: 0, height: "100%",
              backgroundImage: "linear-gradient(to left, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0))",
              transition: "all 1s",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, .9)", cursor: "pointer" }
            }}
            className="flex aic jcc"
            onClick={() => navigate('/history')}
          >
            <ArrowForwardIos />
          </Box>
        </Tooltip>
      </Box>

    </Box>
  )
}
