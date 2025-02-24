import React, { Fragment, useState, useEffect } from 'react'
import {
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Divider, Box, IconButton, Tooltip, CardMedia
} from '@mui/material'
import { Settings, Add, Dehaze, Delete } from '@mui/icons-material'
import Dialog from '../../../elements/dialog/Dialog'
import ListManager from '../../../elements/collection/ListManager'
import {
  getVideoListParagraphVideo, getVideoListParagraph, addVideoListParagraph, editVideoListParagraph, delVideoListParagraph, sortVideoListParagraph,
  addVideoListVideo, sortVideoListVideo, delVideoListVideo,
} from '../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAlertStore from '../../../../store/alert'

import { SortableContainer, DragHandle, SortableItem, onSortEnd } from '../../../../lib/array'

import useDialogStore from '../../../../store/dialog'
import AddChapterVideo from '../../course/dialog/AddChapterVideo'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import DesArea from '../../../elements/collection/DesArea'

export default function TableList(props) {
  const { cname, cid, vListDes, data, onEditDes } = props
  const [open, setOpen] = useState(false)
  const { setAlert } = useAlertStore()
  const { setDialog, handleClose } = useDialogStore()

  const getVideoListParagraphApi = useQuery({ queryKey: ["getVideoListParagraph", cid], queryFn: () => getVideoListParagraph({ cid }), enabled: !!cid })
  const getVideoListParagraphVideoApi = useQuery({ queryKey: ["getVideoListParagraphVideo", cid], queryFn: () => getVideoListParagraphVideo({ cid }), enabled: !!cid })

  const addVideoListParagraphApi = useMutation({ mutationFn: addVideoListParagraph, onSuccess: () => refetchApis() })
  const editVideoListParagraphApi = useMutation({ mutationFn: editVideoListParagraph, onSuccess: () => refetchApis() })
  const delVideoListParagraphApi = useMutation({ mutationFn: delVideoListParagraph, onSuccess: () => refetchApis() })
  const sortVideoListParagraphApi = useMutation({ mutationFn: sortVideoListParagraph, onSuccess: () => refetchApis() })

  const addVideoListVideoApi = useMutation({ mutationFn: addVideoListVideo, onSuccess: () => refetchApis() })
  const sortVideoListVideoApi = useMutation({ mutationFn: sortVideoListVideo, onSuccess: () => refetchApis() })
  const delVideoListVideoApi = useMutation({ mutationFn: delVideoListVideo, onSuccess: () => refetchApis() })

  const refetchApis = () => {
    getVideoListParagraphApi.refetch()
    getVideoListParagraphVideoApi.refetch()
  }

  const handleDelVideoListParagraph = (d) => {
    setAlert({
      title: "刪除段落",
      content: `確定要刪除此「${d?.paragraphName}」段落？`,
      handleAgree: (callback) => (delVideoListParagraphApi.mutate({ cid, paragraphCID: d?.paragraphCID }), callback())
    })
  }

  const handleSortVideoListParagraph = (arr) => {
    let sortstr = `${arr.map((m, idx) => `${m.paragraphCID}`)}`
    sortVideoListParagraphApi.mutate({ cid, sortstr })
  }

  const handleAddButton = (d) => {
    setDialog({
      title: "新增影片",
      body: (
        <AddChapterVideo
          addVideo={({ bYoutube, url, vid, bPlayList, }, callback) => addVideoListVideoApi.mutate(
            { cid: d?.cid, paragraphCID: d?.paragraphCID, bYoutube, url, vid, bPlayList }, { onSuccess: () => { !!callback && callback() } }
          )}
          isPending={addVideoListVideoApi?.isPending}
          handleClose={handleClose}
        />),
      isRwdWidth: true
    })
  }

  const handleSortVideoListVideo = (arr, d) => {
    let sortstr = `${arr.map((m, idx) => `${m.vid}`)}`
    sortVideoListVideoApi.mutate({ cid: d?.cid, paragraphCID: d?.paragraphCID, sortstr })
  }

  return (
    <Fragment>
      <Dialog
        open={open}
        title={"段落管理"}
        content={
          <ListManager
            name={"paragraphName"}
            key_name={'paragraphCID'}
            data={getVideoListParagraphApi?.data}
            addList={({ paragraphName }) => addVideoListParagraphApi.mutate({ cid, paragraphName })}
            editList={(d) => editVideoListParagraphApi.mutate({ cid, paragraphCID: d?.paragraphCID, paragraphName: d?.paragraphName })}
            delList={(d) => handleDelVideoListParagraph(d)}
            sortList={(arr) => handleSortVideoListParagraph(arr)}
          />
        }
        handleClose={() => setOpen(false)}
      />
      <Box sx={{ mb: 2, }} className="flex aic">
        <Typography variant="h6" sx={{ fontWeight: "bolder" }} className='flex-1-1'>{cname?.replaceAll('<\\>', '/') ?? "請選擇目錄"}</Typography>
        {!!cid &&
          <Tooltip title={"段落管理"}>
            <IconButton size='small' onClick={() => setOpen(true)}>
              <Settings fontSize='small' />
            </IconButton>
          </Tooltip>
        }
      </Box>
      {!!cid &&
        <DesArea
          des={vListDes}
          onEdit={(value, callback) => onEditDes({ ...data, vListDes: value, callback })}
        />
      }
      <Divider />
      <LoadingWrapper query={getVideoListParagraphApi}>
        <Fragment>
          {!!cid && Array.isArray(getVideoListParagraphApi?.data) &&
            getVideoListParagraphApi?.data?.map(d =>
              <ParagraphTableFixVideo
                key={d?.paragraphCID}
                data={d}
                all_videos={(getVideoListParagraphVideoApi?.data || [])}
                handleAddButton={() => handleAddButton(d)}
                handleDelVideo={(d) => delVideoListVideoApi.mutate({ cid: d?.cid, paragraphCID: d?.paragraphCID, vid: d?.vid })}
                handleSortVideoListVideo={handleSortVideoListVideo}
              />
            )
          }
        </Fragment>
      </LoadingWrapper>
    </Fragment>
  )
}

const sx = {
  '&:last-child td, &:last-child th': { border: 0 },
  '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
  '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "pointer", transition: "all .2s" }
}

const ParagraphTableFixVideo = (props) => {
  const { all_videos, data } = props

  const [video, setVideo] = useState([])

  useEffect(() => {
    setVideo(all_videos?.filter(f => f.paragraphCID == data?.paragraphCID && f?.vid !== null))
  }, [all_videos])

  return (
    <ParagraphTable {...props} videos={video} />
  )
}

const ParagraphTable = (props) => {
  const { data, videos, handleAddButton, handleDelVideo, handleSortVideoListVideo } = props
  const { setAlert } = useAlertStore()

  const [items, setItems] = useState([]) // 變更排序用

  const handleDelButton = (d) => {
    setAlert({
      title: "刪除影片",
      content: `確定要刪除此「${d?.paragraphName}」段落的影片「${d?.title}」？`,
      handleAgree: (callback) => (handleDelVideo(d), callback())
    })
  }


  useEffect(() => {
    if (JSON.stringify(videos || []) !== JSON.stringify(items || [])) {
      setItems(videos || [])
    }
  }, [videos])

  return (
    <Fragment>
      <h3>{data?.paragraphName}</h3>
      <SortableContainer onSortEnd={e => onSortEnd({ ...e, items }, setItems, (arr) => sortList(arr, data))} useDragHandle>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 200 }}>
            <TableHead>
              <TableRow sx={{ borderTop: "5px solid #1f1f1f" }}>
                {videos?.length == 0 && <TableCell sx={{ fontWeight: "bolder" }}>此段落沒有影片</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                Array.isArray(items) && items?.map(d =>
                  <SortableItem key={`item-${d?.vid}`} value={d?.vid} index={index}>
                    <VideoTableRow
                      key={d?.vid}
                      d={d}
                      handleDelButton={handleDelButton}
                    />
                  </SortableItem>

                )
              }
              <TableRow sx={{ ...sx }}>
                <TableCell colSpan={1000} sx={{ p: 1 }} align='center' onClick={() => handleAddButton()}><Add /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </SortableContainer>
    </Fragment>
  )
}

const VideoTableRow = (props) => {
  const { d, handleDelButton, vid } = props
  const navigate = useNavigate()

  return (
    <TableRow
      sx={{ ...sx, backgroundColor: d?.vid == vid ? "#e1e1e1 !important" : null }}
      onClick={(e) => navigate(`/watch?v=${d?.vid}&list=${d?.cid}&p=${d?.paragraphCID}&mode=v`)}
    >
      <TableCell sx={{ maxWidth: "150px" }}>
        <CardMedia
          component="img"
          sx={{ height: "50px", width: "auto" }}
          image={`https://i.ytimg.com/vi/${d?.videoID}/mqdefault.jpg`}
        />
      </TableCell>
      <TableCell align="left">{d?.title}</TableCell>
      <TableCell align="left">
        <DragHandle />
        <IconButton size="small" onClick={(e) => (e.stopPropagation(), handleDelButton(d))}>
          <Delete fontSize='small' color="error" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}