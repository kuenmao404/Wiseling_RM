import React, { useState, useEffect } from 'react'
import { Box, Button, List, ListItemButton, ListItemText, Collapse, Divider, IconButton, Tooltip, useMediaQuery } from '@mui/material'
import { ExpandLess, ExpandMore, SkipPrevious, SkipNext, NavigateBefore, NavigateNext } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getCourseChapter } from '../../../../apis'
import { VideoTable } from '../page/Home'
import useAppStore from '../../../../store/app'
import useSnackbarStore from '../../../../store/snackbar'

export default function Playlist(props) {
  const { cid, chapter, vid, width, courseName, isLoading } = props
  const [open, setOpen] = useState(true)
  const [now_chapter, setNowChapter] = useState(null)
  const { isDrawerOpen } = useAppStore()
  const { setSnackMsg } = useSnackbarStore()
  const navigate = useNavigate()

  const xs = useMediaQuery(!isDrawerOpen ? `(min-width:${768 + width}px)` : `(min-width:${1008 + width}px)`)

  useEffect(() => {
    setNowChapter(chapter)
  }, [chapter])

  const { ...getCourseChapterApi } = useQuery({ queryKey: ['getCourseChapter'], queryFn: () => getCourseChapter({ cid: cid }) })

  const { items: video } = getCourseChapterApi?.data?.find(f => f.cid == now_chapter) || []

  const getPerNextVideo = (num = 1) => {
    let { items: current_videos } = getCourseChapterApi?.data?.find(f => f.cid == chapter) || []
    current_videos = current_videos?.filter(f => f.typeName == "Video")
    let index = current_videos?.indexOf(current_videos?.find(d => d?.oid == vid))
    let jump_vid = current_videos?.[index + num]?.oid
    if (Number.isInteger(index) && Number.isInteger(jump_vid)) {
      navigate(`/course/${cid}/watch?v=${jump_vid}&chapter=${chapter}`)
    } else {
      getPerNextChapter(num)
      // setSnackMsg({ message: `此章節沒有${num < 0 ? "上" : "下"}一部影片了` })
    }
  }

  const getPerNextChapter = (num = 1) => {
    const index = (getCourseChapterApi?.data?.filter(f => f.nO > 0) || [])?.indexOf((getCourseChapterApi?.data || [])?.find(d => d?.cid == chapter))
    let jump_cid = (getCourseChapterApi?.data?.filter(f => f.nO > 0))?.[index + num]?.cid
    const current_videos = (getCourseChapterApi?.data || [])?.find(f => f.cid == jump_cid)?.items
    let jump_vid = current_videos?.[(num > 0 ? 0 : current_videos?.length - 1)]?.oid || null
    if (Number.isInteger(jump_cid) && Number.isInteger(jump_vid)) {
      navigate(`/course/${cid}/watch?v=${jump_vid}&chapter=${jump_cid}`)
    } else {
      setSnackMsg({ message: `無${num < 0 ? "上" : "下"}一個章節或無${num < 0 ? "上" : "下"}一部影片` })
    }
  }

  return (
    <Box sx={{ ml: 2, mr: 2, mb: 2, mt: 1 }}>
      <Box sx={{ mb: 2 }} className={`flex jcsb ${!xs ? "flex-col" : ""}`}>
        <Button variant='outlined' onClick={() => navigate(`/course/${cid}`)}>回到課程首頁</Button>
        <Box sx={{ borderRadius: "5px", backgroundColor: "rgb(244, 244, 244)", p: "4px", mt: !xs ? 1 : null }} className="flex jcc">
          <Tooltip title="上個章節">
            <IconButton size='small' onClick={() => !isLoading && getPerNextChapter(-1)}>
              <SkipPrevious />
            </IconButton>
          </Tooltip>
          <Tooltip title="上個影片" onClick={() => !isLoading && getPerNextVideo(-1)}>
            <IconButton size='small'>
              <NavigateBefore />
            </IconButton>
          </Tooltip>
          <Tooltip title="下個影片" onClick={() => !isLoading && getPerNextVideo(1)}>
            <IconButton size='small'>
              <NavigateNext />
            </IconButton>
          </Tooltip>
          <Tooltip title="下個章節" onClick={() => !isLoading && getPerNextChapter(1)}>
            <IconButton size='small'>
              <SkipNext />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ backgroundColor: "rgb(244, 244, 244)" }}>
        {
          Array.isArray(getCourseChapterApi?.data) &&
          <List>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemText primary={courseName} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            {open && <Divider />}
            <Collapse in={open} timeout="auto" unmountOnExit sx={{}}>
              <List component="div" disablePadding>
                <Box sx={{ p: 1 }}>
                  {getCourseChapterApi?.data?.map(d =>
                    <ListItemButton
                      key={d?.cid}
                      sx={{ backgroundColor: d?.cid == now_chapter ? "#e1e1e1" : null }}
                      onClick={() => setNowChapter(d?.cid)}
                    >
                      <ListItemText
                        primary={<span>{`${d?.chapterName}`}{d?.cid == chapter ? <span>&ensp;<span style={{ color: "#3f51b5" }}>(當前章節)</span></span> : ""}</span>}
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
      <Box sx={{ backgroundColor: "rgb(244, 244, 244)" }}>
        {
          Array.isArray(getCourseChapterApi?.data) &&
          <VideoTable
            data={video}
            vid={vid}
            isImgShow={true}
            isLoading={isLoading}
            onClick={(d) => !isLoading && navigate(`/course/${d?.courseCID}/watch?v=${d?.oid}&chapter=${d?.cid}`)}
          />
        }
      </Box>
    </Box>
  )
}
