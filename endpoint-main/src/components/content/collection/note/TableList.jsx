import React, { Fragment, useState, useEffect } from 'react'
import {
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Divider, Box, IconButton, Tooltip, CardMedia, Button, useMediaQuery,
} from '@mui/material'
import { Settings, Add, Dehaze, Delete, SwapVert } from '@mui/icons-material'
import Dialog from '../../../elements/dialog/Dialog'
import ListManager from '../../../elements/collection/ListManager'
import {
  getNoteListNote, delNoteListNote, sortNoteListNote,
} from '../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAlertStore from '../../../../store/alert'
import useDialogStore from '../../../../store/dialog'
import useAppStore from '../../../../store/app'
import AddNoteList from './AddNoteList'
import DesArea from '../../../elements/collection/DesArea'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import MarkdownView from '../../../elements/markdown/MarkdownView'
import { TimeBlock } from '../../../elements/note/NoteItem'
import NoteListItem from '../../../elements/collection/NoteListItem'

export default function TableList(props) {
  const { cname, cid, vListDes, data, onEditDes } = props
  const [open, setOpen] = useState(false)
  const { setAlert } = useAlertStore()
  const { setDialog, handleClose } = useDialogStore()
  const isDrawerOpen = useAppStore()?.isDrawerOpen;
  const xs = useMediaQuery(!isDrawerOpen ? '(min-width:768px)' : '(min-width:1008px)')

  const navigate = useNavigate()

  const getNoteListNoteApi = useQuery({ queryKey: ["getNoteListNote", cid], queryFn: () => getNoteListNote({ cid }), enabled: !!cid })

  const delNoteListNoteApi = useMutation({ mutationFn: delNoteListNote, onSuccess: () => refetchApis() })
  const sortNoteListNoteApi = useMutation({ mutationFn: sortNoteListNote, onSuccess: () => refetchApis() })

  const refetchApis = () => {
    getNoteListNoteApi.refetch()
  }

  const handleDelNoteListNote = (d) => {
    setAlert({
      title: "刪除段落",
      content: `確定要從清單中移除此「${d?.title}」筆記？`,
      handleAgree: (callback) => (delNoteListNoteApi.mutate({ cid, nid: d?.nid }), callback())
    })
  }

  const handleSortNoteListNote = (arr) => {
    let sortstr = `${arr.map((m, idx) => `${m.nid}`)}`
    sortNoteListNoteApi.mutate({ cid, sortstr })
  }

  return (
    <Fragment>
      <Dialog
        open={open}
        title={"筆記排序"}
        content={
          <ListManager
            name={"title"}
            key_name={'nid'}
            reName={(d) =>
              <Tooltip title={`${d?.notebookName} - ${d?.title}`}>
                <Box className='max-line-1' sx={{ maxWidth: "450px" }}><TimeBlock start={d?.startTime} /> <b>{d?.notebookName} - </b><span style={{ color: "#606060" }}>{d?.title}</span></Box>
              </Tooltip>
            }
            data={getNoteListNoteApi?.data}
            delList={(d) => handleDelNoteListNote(d)}
            sortList={(arr) => handleSortNoteListNote(arr)}
          />
        }
        handleClose={() => setOpen(false)}
      />
      <Box sx={{ mb: 2, }} className="flex aic">
        <Typography variant="h6" sx={{ fontWeight: "bolder" }} className='flex-1-1'>{cname?.replaceAll('<\\>', '/') ?? "請選擇目錄"}</Typography>
        {!!cid &&
          <Tooltip title={"刪除/排序筆記"}>
            {xs ?
              <Button size='small' color="inherit" startIcon={<SwapVert fontSize='small' />} onClick={() => setOpen(true)}>
                刪除/排序筆記
              </Button> :
              <IconButton size='small' onClick={() => setOpen(true)}>
                <SwapVert fontSize='small' />
              </IconButton>
            }
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
      {!!cid &&
        <LoadingWrapper query={getNoteListNoteApi}>
          <Box sx={{ backgroundColor: "#fff", mt: 2, p: 2, borderRadius: "10px 10px 0 0", border: "1px solid rgba(0, 0, 0, .1)" }}>
            {Array.isArray(getNoteListNoteApi?.data) && getNoteListNoteApi?.data?.map((d, idx) =>
              <NoteListItem
                key={d?.nid}
                sx={{ mt: idx !== 0 && 2 }}
                d={d}
                onClick={() => navigate(`/watch?v=${d?.vid}&list=${d?.cid}&n=${d?.nid}&t=${d?.startTime}&mode=n`)}
              />
              // <Box key={d?.nid} sx={{ mt: idx !== 0 && 2 }}>
              //   <Box sx={{ mb: 1 }} className="flex aic">
              //     <TimeBlock start={d?.startTime} onClick={() => navigate(`/watch?v=${d?.vid}&list=${d?.cid}&n=${d?.nid}&t=${d?.startTime}&mode=n`)} />
              //     <Box sx={{ fontSize: "18px", whiteSpace: "pre-wrap" }}>
              //       <b>{d?.notebookName} - </b><span style={{ color: "#606060" }}>{d?.title}</span>
              //     </Box>
              //   </Box>
              //   <Divider sx={{ mb: 1 }} />
              //   <MarkdownView source={d?.content} />
              // </Box>
            )
            }
          </Box>
        </LoadingWrapper>
      }
      {
        !!cid &&
        <AddNoteList list_cid={cid} refetch={getNoteListNoteApi?.refetch} />
      }
    </Fragment >
  )
}

