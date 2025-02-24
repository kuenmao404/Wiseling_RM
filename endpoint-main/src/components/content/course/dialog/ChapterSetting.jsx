import React, { Fragment, useState, useEffect, useRef } from 'react'
import {
  DialogContent, Box, TextField, ListItem, ListItemButton, ListItemText, IconButton
} from '@mui/material'
import { Edit, Add, Done, Close, Delete } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addCourseChapter, delCourseChapter, getCourseChapter, editCourseChapter, sortCourseChapter } from '../../../../apis'
import useAlertStore from '../../../../store/alert'

import { arrayMove, SortableContainer, DragHandle, SortableItem, onSortEnd } from '../../../../lib/array'

export default function ChapterSetting(props) {
  const { course_data, subclass, data, refetch } = props
  const [items, setItems] = useState([]) // 變更排序用
  const [isAdding, setAdding] = useState(false)
  const { setAlert } = useAlertStore()

  const { ...getCourseChapterApi } = useQuery({ queryKey: ['getCourseChapter', course_data?.cid], queryFn: () => getCourseChapter({ cid: course_data?.cid }) })
  const addCourseChapterApi = useMutation({ mutationFn: addCourseChapter, onSuccess: () => (getCourseChapterApi.refetch(), setAdding(false), refetch()) })
  const delCourseChapterApi = useMutation({ mutationFn: delCourseChapter, onSuccess: () => (getCourseChapterApi.refetch(), refetch()) })
  const editCourseChapterApi = useMutation({ mutationFn: editCourseChapter, onSuccess: () => (getCourseChapterApi.refetch(), refetch()) })
  const sortCourseChapterApi = useMutation({ mutationFn: sortCourseChapter, onSuccess: () => (getCourseChapterApi.refetch(), refetch()) })

  useEffect(() => {
    setItems(getCourseChapterApi?.data || data || [])
  }, [getCourseChapterApi?.data])

  const handleAddChapter = (value) => {
    addCourseChapterApi.mutate({ courseCID: course_data?.cid, cid: subclass?.['章節']?.cid, chapterName: value, chapterDes: "" })
  }

  const handleEditChapter = (value, cid) => {
    editCourseChapterApi.mutate({ courseCID: course_data?.cid, cid, chapterName: value, chapterDes: null })
  }

  const handleDelChapter = (d) => {
    setAlert({
      title: `刪除章節`,
      content: `確定要刪除此「${d?.chapterName}」章節嗎？`,
      handleAgree: (callback) => (delCourseChapterApi.mutate({ ...d }), callback())
    })

  }

  const handleSortChapter = (arr, { oldIndex, newIndex }) => {
    let sortstr = `${arr.map((m, idx) => `${m.cid}`)}`
    sortCourseChapterApi.mutate({ courseCID: course_data?.cid, cid: subclass?.['章節']?.cid, sortstr })
  }

  return (
    <Fragment>
      <DialogContent dividers className=''>
        <SortableContainer onSortEnd={e => onSortEnd({ ...e, items }, setItems, handleSortChapter)} useDragHandle>
          {
            Array.isArray(items) && items?.map((d, index) =>
              <SortableItem key={`item-${d?.cid}`} value={d?.cid} index={index}>
                <ListButton
                  key={d?.cid}
                  d={d}
                  id={d}
                  handleEditChapter={handleEditChapter}
                  handleDelChapter={handleDelChapter}
                />
              </SortableItem>)
          }
        </SortableContainer>
        {
          !isAdding ?
            <ListAddItem onClick={() => setAdding(true)} /> :
            <ListItemEditor level={0} onDone={(value) => handleAddChapter(value)} onCancel={() => setAdding(false)} />
        }
      </DialogContent>
    </Fragment>
  )
}

const ListButton = (props) => {
  const { d, id, handleEditChapter, handleDelChapter } = props
  const [isEditing, setEditing] = useState(false)

  return (
    <ListItemButton>
      {
        !isEditing ?
          <Fragment>
            <ListItemText primary={d?.chapterName} sx={{ fontWeight: "bolder", minWidth: "200px" }} disableTypography />
            <Box sx={{ ml: 2 }}>
              <IconButton color="primary" size="small" onClick={() => setEditing(true)}>
                <Edit fontSize="inherit" />
              </IconButton>
              <DragHandle />
              <IconButton color="error" size="small" onClick={() => handleDelChapter(d)}>
                <Delete fontSize="inherit" />
              </IconButton>
            </Box>
          </Fragment> :
          <ListItemEditor
            defaultValue={d?.chapterName}
            level={null}
            onDone={(value) => (handleEditChapter(value, d?.cid), setEditing(false))}
            onCancel={() => setEditing(false)}
          />
      }
    </ListItemButton>
  )
}

const ListAddItem = (props) => {
  const { onClick } = props
  const [isHover, setHover] = useState(false)

  return (
    <ListItemButton
      sx={{ '&:hover': { backgroundColor: "rgba(0,0,0,0.74)", color: "#fff" } }}
      style={{ display: "flex", justifyContent: "center", paddingLeft: "8px" }}
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Add sx={{ color: !isHover ? "#1976d2" : "#fff" }} />
    </ListItemButton>
  )
}

const ListItemEditor = (props) => {
  const { onDone, onCancel, level, defaultValue } = props
  const [value, setValue] = useState("")
  const inputEl = useRef(null)

  useEffect(() => {
    setValue(defaultValue || "")
  }, [])

  const handleChange = (value) => {
    setValue(value.trim())
  }

  return (
    <ListItem sx={{ pl: !!level ? 4 + 2 * (level - 1) : null, p: level == null ? 0 : null }}>
      <TextField
        inputRef={inputEl}
        defaultValue={defaultValue}
        variant="standard"
        onChange={e => handleChange(e.target.value)}
        onKeyDown={e => e.keyCode == 13 && onDone(inputEl.current.value.trim())}
        fullWidth
        autoFocus
        autoComplete='off'
      />
      <IconButton color="success" size="small" onClick={() => onDone(inputEl.current.value.trim())} disabled={value.length == 0}>
        <Done fontSize="inherit" />
      </IconButton>
      <IconButton color="error" size="small" onClick={onCancel}>
        <Close fontSize="inherit" />
      </IconButton>
    </ListItem>
  )
}