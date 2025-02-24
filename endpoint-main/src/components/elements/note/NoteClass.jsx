import React, { useState, Fragment, useEffect } from 'react'
import { List, ListItemButton, ListItemText, Divider, Collapse, Tooltip, Box, IconButton, ListItemIcon, TextField } from '@mui/material'
import { ExpandLess, ExpandMore, Add, Edit, PictureAsPdf, Article, Help, Done, Close, Delete } from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { editNoteClass, delNoteClass, addNoteClass } from '../../../apis'
import useDialogStore from '../../../store/dialog'
import useAlertStore from '../../../store/alert'
import MarkdownView from '../markdown/MarkdownView'
import useWatchStore from '../../../store/watch'

export default function NoteClass(props) {
  const { data, refetch = () => { }, cid } = props
  const now_data = (Array.isArray(data) ? data : [])?.find(f => f.cid == cid) || data?.[0]
  const other_data = (Array.isArray(data) ? data : []).filter(f => f.cid !== now_data?.cid)

  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const [add, setAdd] = useState(false)
  const [new_name, setNewName] = useState("")

  const { setDialog } = useDialogStore()
  const { setEditing } = useWatchStore()
  const { setAlert } = useAlertStore()

  const [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const addNoteClassApi = useMutation({
    mutationFn: addNoteClass,
    onSuccess: (d) => d?.body?.status && (setEditing(false), setAdd(false), refetch())
  })
  const editNoteClassApi = useMutation({ mutationFn: editNoteClass, onSuccess: (d) => d?.body?.status && (setEditing(false), setEdit(false), refetch()) })
  const delNoteClassApi = useMutation({ mutationFn: delNoteClass, onSuccess: (d) => d?.body?.status && refetch() })

  useEffect(() => {
    if (!!data && !!now_data && now_data?.cid?.toString() !== cid && Array.isArray(data)) {
      setSearchParams({ ...params, cid: now_data?.cid })
    }
  }, [now_data, data])

  const handleClickTip = () => {
    setDialog({
      title: "快捷鍵說明",
      content: <NoteTips />
    })
  }

  const handleDelNote = () => {
    setAlert({
      title: "刪除筆記本",
      content: `確定要刪除此「${now_data?.cname}」筆記本？\n所有筆記也會一併刪除！`,
      handleAgree: (callback) => (delNoteClassApi.mutate({ cid, vid: params.v }), callback())
    })
  }

  return (
    <List sx={{ p: 0 }}>
      <ListItemButton onClick={(e) => (!!edit && e.stopPropagation, !edit && setOpen(!open))}>
        {(!edit && !add) ?
          <Fragment>
            <Tooltip title={"快捷鍵提示"}>
              <ListItemIcon
                onClick={(e) => { e.stopPropagation(), handleClickTip() }}
                sx={{ minWidth: "38px" }}
              >
                <Help fontSize='small' />
              </ListItemIcon>
            </Tooltip>
            <Tooltip title={`${now_data?.cname}${now_data?.bDefault ? " (預設)" : ""}` ?? (!Array.isArray(data) ? 'Loading...' : '沒有筆記本')}>
              <ListItemText
                className='max-line-1'
                primary={`${now_data?.cname}${now_data?.bDefault ? " (預設)" : ""}` ?? (!Array.isArray(data) ? 'Loading...' : '沒有筆記本')}
              />
            </Tooltip>
            <Tooltip title="編輯筆記本名稱" onClick={() => (setNewName(now_data?.cname), setEdit(true), setEditing(true))}>
              <IconButton size="small" color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="刪除筆記本" onClick={() => handleDelNote()}>
              <IconButton size="small" color='error'>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
            {open ? <ExpandLess /> : <ExpandMore />}
          </Fragment> :
          !!edit ?
            <SimpleTextField
              defaultValue={now_data?.cname}
              handleSubmit={(value) => editNoteClassApi.mutate({ vid: now_data?.vid, cid: now_data?.cid, cname: value })}
              handleCancel={() => (setEditing(false), setEdit(false))}
            /> :
            <SimpleTextField
              defaultValue=""
              handleSubmit={(value) => addNoteClassApi.mutate({ vid: now_data?.vid, cname: value }, { onSuccess: (d) => d?.body?.status && (setSearchParams({ ...params, cid: d?.body?.cid })) })}
              handleCancel={() => (setEditing(false), setAdd(false))}
            />
        }
      </ListItemButton>
      {/* <Divider /> */}
      {/* !!cid && !edit &&
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1 }}>
          <Tooltip title="編輯筆記本名稱" onClick={() => (setNewName(now_data?.cname), setEdit(true), setEditing(true))}>
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="刪除筆記本" onClick={() => handleDelNote()}>
            <IconButton size="small" color='error'>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
           <Tooltip title="下載成PDF (功能尚未開放)">
            <IconButton size="small">
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="下載成Word (功能尚未開放)">
            <IconButton size="small">
              <Article fontSize="small" />
            </IconButton>
          </Tooltip> 
        </Box>
       */}
      {open && !edit && <Divider />}
      <Collapse in={open && !edit} timeout="auto" unmountOnExit sx={{ backgroundColor: "#f9f9f9" }}>
        <List component="div" disablePadding>
          {
            other_data.map(m =>
              <Fragment key={m.cid}>
                <ListItemButton sx={{ pl: 4 }} onClick={() => (setSearchParams({ ...params, cid: m.cid }), setOpen(false))}>
                  <ListItemText primary={`${m.cname}${m?.bDefault ? " (預設)" : ""}`} />
                </ListItemButton>
                <Divider />
              </Fragment>
            )
          }
          <Tooltip title="建立新的筆記本">
            <ListItemButton sx={{ display: "flex", justifyContent: "center", alignItems: "center", }} onClick={() => (setEditing(true), setAdd(true))}>
              <Add />
            </ListItemButton>
          </Tooltip>
        </List>
      </Collapse>
    </List>
  )
}

import tips from '../../../markdown/tips.md?raw'
import SimpleTextField from '../formitem/SimpleTextField'

const NoteTips = (props) => {

  return (
    <div className='markdown-body'>
      <MarkdownView
        source={tips}
      />
    </div>
  )
}