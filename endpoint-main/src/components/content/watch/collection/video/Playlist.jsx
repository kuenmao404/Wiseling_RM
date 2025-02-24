import React, { Fragment, useState, useEffect } from 'react'
import { Box, IconButton, Tooltip, Button, useMediaQuery, List, ListItemButton, ListItemText, Collapse, Divider, Switch } from '@mui/material'
import { ExpandLess, ExpandMore, SkipPrevious, SkipNext, NavigateBefore, NavigateNext } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAppStore from '../../../../../store/app'
import useSnackbarStore from '../../../../../store/snackbar'
import { getVideoListClass, getVideoListParagraph, getVideoListParagraphVideo } from 'apis'
import { VideoTable } from '../../../course/page/Home'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import VideoControl from '../VideoControl'

import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const autoPlayAtom = atomWithStorage("auto_play", true)

export default function Playlist(props) {
  const { width, vid, cid, paragraphCID, player_state, isLoading } = props

  const [open, setOpen] = useState(true)
  const [now_paragraph, setNowParagraph] = useState(null)
  const [videos, setVideos] = useState(null)
  const [auto, setAuto] = useAtom(autoPlayAtom)
  const { isDrawerOpen } = useAppStore()
  const { setSnackMsg } = useSnackbarStore()
  const navigate = useNavigate()
  let [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const xs = useMediaQuery(!isDrawerOpen ? `(min-width:${768 + width}px)` : `(min-width:${1008 + width}px)`)

  const getVideoListClassApi = useQuery({ queryKey: ["getVideoListClass"], queryFn: () => getVideoListClass({ first: true, cid }) })
  const getVideoListParagraphApi = useQuery({ queryKey: ["getVideoListParagraph", cid], queryFn: () => getVideoListParagraph({ cid }), enabled: !!cid })
  const getVideoListParagraphVideoApi = useQuery({
    queryKey: ["getVideoListParagraphVideo", cid], queryFn: () => getVideoListParagraphVideo({ cid }), enabled: !!cid
  })

  useEffect(() => {
    setNowParagraph(paragraphCID)
  }, [paragraphCID])

  useEffect(() => {
    const current_videos = (getVideoListParagraphVideoApi?.data || [])?.filter(f => f.paragraphCID == now_paragraph && f.vid !== null)
    setVideos(current_videos)
  }, [getVideoListParagraphVideoApi?.data, now_paragraph])

  useEffect(() => {
    if (player_state == 0 && !!auto) {
      getPerNextVideo(1)
    }
  }, [player_state])

  const getPerNextVideo = (num = 1) => {
    let index = videos?.indexOf((videos || [])?.find(d => d?.vid == vid))
    let jump_vid = videos?.[index + num]?.vid
    if (Number.isInteger(index) && Number.isInteger(jump_vid)) {
      setSearchParams({ ...params, v: jump_vid })
    } else {
      getPerNextChapter(num)
      // setSnackMsg({ message: `此段落沒有${num < 0 ? "上" : "下"}一部影片了` })
    }
  }

  const getPerNextChapter = (num = 1) => {
    const index = (getVideoListParagraphApi?.data?.filter(f => f.nO_Paragraph > 0) || [])?.indexOf((getVideoListParagraphApi?.data || [])?.find(d => d?.paragraphCID == paragraphCID))
    let jump_cid = (getVideoListParagraphApi?.data?.filter(f => f.nO_Paragraph > 0))?.[index + num]?.paragraphCID
    const current_videos = (getVideoListParagraphVideoApi?.data || [])?.filter(f => f.paragraphCID == jump_cid)
    let jump_vid = current_videos?.[(num > 0 ? 0 : current_videos?.length - 1)]?.vid || null
    if (Number.isInteger(jump_cid) && Number.isInteger(jump_vid)) {
      setSearchParams({ ...params, p: jump_cid, v: jump_vid })
    } else {
      setSnackMsg({ message: `無${num < 0 ? "上" : "下"}一個段落或無${num < 0 ? "上" : "下"}一部影片` })
    }
  }

  return (
    <Fragment>
      <Box sx={{ mb: 2 }} className={`flex jcsb ${!xs ? "flex-col" : ""}`}>
        <Button variant='outlined' onClick={() => navigate(`/videolist/${cid}`)}>回到播放清單</Button>
        <VideoControl
          getPerNextChapter={getPerNextChapter}
          getPerNextVideo={getPerNextVideo}
        />
      </Box>
      {getVideoListClassApi?.data?.vListDes?.length > 0 &&
        <Box sx={{ mb: 2, whiteSpace: "pre-wrap", lineHeight: "1.5" }} className="flex-1-1">
          {getVideoListClassApi?.data?.vListDes}
        </Box>
      }
      <Box sx={{ backgroundColor: "rgb(244, 244, 244)" }}>
        {
          Array.isArray(getVideoListParagraphApi?.data) &&
          <List>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemText primary={getVideoListClassApi?.data?.vListName} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            {open && <Divider />}
            <Collapse in={open} timeout="auto" unmountOnExit sx={{}}>
              <List component="div" disablePadding>
                <Box sx={{ p: 1 }}>
                  {getVideoListParagraphApi?.data?.map(d =>
                    <ListItemButton
                      key={d?.paragraphCID}
                      sx={{ backgroundColor: d?.paragraphCID == now_paragraph ? "#e1e1e1" : null }}
                      onClick={() => setNowParagraph(d?.paragraphCID)}
                    >
                      <ListItemText
                        primary={<span>{`${d?.paragraphName}`}{d?.paragraphCID == paragraphCID ? <span>&ensp;<span style={{ color: "#3f51b5" }}>(當前章節)</span></span> : ""}</span>}
                      />
                    </ListItemButton>
                  )}
                </Box>
              </List>
            </Collapse>
          </List>
        }
      </Box>
      <br />
      <Box sx={{ backgroundColor: "rgb(244, 244, 244)", mb: 2 }}>
        <LoadingWrapper query={getVideoListParagraphVideoApi}>
          <Fragment>
            {
              Array.isArray(getVideoListParagraphVideoApi?.data) &&
              <VideoTable
                data={videos}
                vid={vid}
                isImgShow={true}
                onClick={(d) => !isLoading && setSearchParams({ ...params, p: now_paragraph, v: d?.vid })}
              />
            }
          </Fragment>
        </LoadingWrapper>
      </Box>
    </Fragment>
  )
}
