import React from 'react'
import { Box, Tooltip } from '@mui/material'
import NoteCard from '../../elements/cards/NoteCard'
import { ArrowForwardIos } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getNoteClass } from '../../../apis'
import useAccountStore from '../../../store/account'

export default function HistoryNote() {
  let navigate = useNavigate()
  const { mid } = useAccountStore()
  const getNoteClassApi = useQuery({ queryKey: ['getNoteClass', mid], queryFn: () => getNoteClass({ top: 10, order: "since_d", ownerMID: mid }) })

  return (
    <Box sx={{ m: "16px 0" }}>
      <Box sx={{ mb: 1 }}>
        近期筆記
      </Box>
      <Box className="flex fwnw" sx={{
        overflow: "hidden", pb: 1, position: "relative",

      }}>
        {
          Array.isArray(getNoteClassApi?.data) && getNoteClassApi?.data?.map(d =>
            <NoteCard key={d?.cid} sx={{ mr: 2 }} videoId={d?.videoID} vid={d?.vid} title={d?.cname} content={d?.title} lastModifiedDT={d?.lastModifiedDT} />
          )
        }
        <Tooltip title={"移動至筆記本"}>
          <Box
            sx={{
              position: "absolute", width: "50px", right: 0, height: "100%",
              backgroundImage: "linear-gradient(to left, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0))",
              transition: "all 1s",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, .9)", cursor: "pointer" }
            }}
            className="flex aic jcc"
            onClick={() => navigate('/note')}
          >
            <ArrowForwardIos />
          </Box>
        </Tooltip>
      </Box>

    </Box>
  )
}
