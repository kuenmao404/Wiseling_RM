import React, { useState, Fragment, useEffect } from 'react'
import { Box, Divider, Tabs, Tab, Tooltip, Card, Button, Collapse, IconButton, TextField } from '@mui/material'
import { ExpandMore, ExpandLess, Add, Delete, Done, Input, PlaylistAdd, } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getCourseVideoTeachNote, addCourseVideoTeachNote, editCourseVideoTeachNote, delCourseVideoTeachNote, // 教材筆記
  getNoteClass, getNotes, addNote, editNote, delNote, // 一般筆記
  getCourseTeachImportNote, importCourseTeachNote, // 匯入課程教材
  addNoteClass,
} from '../../../../apis'
import NoteClass from '../../../elements/note/NoteClass'
import Notes from '../../../elements/note/Notes'
import { ClassNote } from '../../watch/NoteWrapper'
import Loading from '../../../elements/loading'
import KeyPress from '../../../elements/KeyPress'
import useAccountStore from '../../../../store/account'
import useAlertStore from '../../../../store/alert'
import Dialog from '../../../elements/dialog/Dialog'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { TimeBlock } from '../../../elements/note/NoteItem'
import MarkdownView from '../../../elements/markdown/MarkdownView'

export default function NoteWrapper(props) {
  const { sx, vid, chapter, permission, player, cid, subclass, note_cid } = props
  const [tab_value, setTabValue] = useState('教材')
  const [current_note, setCurrentNote] = useState(null)
  const [open, setOpen] = useState(false)

  const { mid } = useAccountStore()

  const getCourseVideoTeachNoteApi = useQuery({ queryKey: ['getCourseVideoTeachNote', vid, cid], queryFn: () => getCourseVideoTeachNote({ vid, courseCID: cid }) })
  const getNoteClassApi = useQuery({ queryKey: ["getNoteClass", vid, mid], queryFn: () => getNoteClass({ vid, ownerMID: mid }) })

  const addCourseVideoTeachNoteApi = useMutation({ mutationFn: addCourseVideoTeachNote, onSuccess: () => getCourseVideoTeachNoteApi.refetch() })
  const editCourseVideoTeachNoteApi = useMutation({ mutationFn: editCourseVideoTeachNote, onSuccess: () => getCourseVideoTeachNoteApi.refetch() })
  const delCourseVideoTeachNoteApi = useMutation({ mutationFn: delCourseVideoTeachNote, onSuccess: () => getCourseVideoTeachNoteApi.refetch() })


  const handleAddCourseVideoTeachNote = ({ startTime, endTime, content }, callback = () => { }) => {
    if (startTime == null) {
      // callback()
    }
    else {
      addCourseVideoTeachNoteApi.mutate({ vid, courseCID: cid, cid: subclass?.['教材']?.cid, startTime, endTime: endTime, content }, {
        onSuccess: (res) => {
          res?.body?.status && callback()
        }
      })
    }
  }

  const handleDelCourseVideoTeachNote = (data, callback = () => { }) => {
    delCourseVideoTeachNoteApi.mutate({ ...data, courseCID: cid, cid: subclass?.['教材']?.cid }, { onSuccess: (d) => callback() })
  }

  const handleEditCourseVideoTeachNote = (data, callback = () => { }) => {
    console.log(data)
    editCourseVideoTeachNoteApi.mutate({ ...data, courseCID: cid, cid: subclass?.['教材']?.cid }, { onSuccess: (d) => d?.body?.status && callback() })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      checkTime()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [getCourseVideoTeachNoteApi?.data, player])

  const checkTime = () => {
    if (!!player && !!player?.getCurrentTime) {
      const data = getCourseVideoTeachNoteApi?.data
      if (data) {
        let now_time = player?.getCurrentTime();
        const sort_data = JSON.parse(JSON.stringify(data))?.sort((a, b) => b.startTime - a.startTime)
        const current_data = sort_data?.find(f => f.startTime <= now_time && (f.endTime !== null ? f.endTime >= now_time : true))
        if (current_data?.nid != current_note?.nid) {
          setCurrentNote(current_data)
        }
      }
    }
  }

  const [cname, setCName] = useState("我的筆記本")
  const addNoteClassApi = useMutation({ mutationFn: addNoteClass, onSuccess: (res) => res?.body?.status && getNoteClassApi.refetch() })

  if (getNoteClassApi.isLoading) {
    return (
      <div></div>
    )
  }

  return (
    <Box sx={{ ...sx, position: "relative" }} className="flex flex-col">
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto" }} className="flex flex-col">
        <KeyPress keyList={[17, 39]} onSuccess={() => setTabValue(tab_value == "教材" ? "筆記" : "教材")} />
        <Box className="flex jcsb aic">
          <Tooltip title="ctrl + ▶ 可切換tab">
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              value={tab_value}
              onChange={(e, value) => (setTabValue(value))}
            >
              <Tab value="教材" label={<b>教材</b>} />
              <Tab value="筆記" label={<b>筆記</b>} />
            </Tabs>
          </Tooltip>
          {tab_value == "教材" &&
            <Box sx={{ pl: 1, pr: 1 }}>
              <Tooltip title="匯入筆記">
                <IconButton size='small' color="warning" onClick={() => setOpen(true)}>
                  <PlaylistAdd fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
          }
        </Box>
        <Divider />
        {
          tab_value == "筆記" &&
          <Fragment>
            {!getNoteClassApi.isFetching && getNoteClassApi?.data?.length == 0 ?
              <Box className="flex flex-1-1 jcc aic flex-col" sx={{ backgroundColor: "rgba(0, 0, 0, .1)" }}>
                <Box>
                  <Box >
                    <TextField
                      variant="filled"
                      value={cname}
                      onChange={(e) => setCName(e.target.value)}
                      label="筆記本名稱"
                      autoFocus={true}
                      sx={{
                        "& .MuiFilledInput-root": {
                          color: "#000",
                          backgroundColor: "#fff",
                          ":hover:not(.Mui-focused)": { backgroundColor: "#fff", },
                        },
                        "& .MuiFilledInput-root.Mui-focused": {
                          backgroundColor: "#fff",
                        },
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    size='small'
                    sx={{ mt: 2 }}
                    color='success'
                    fullWidth
                    onClick={() => addNoteClassApi.mutate({ cname, vid })}
                  >
                    新增筆記本
                  </Button>
                </Box>
              </Box> :
              <Fragment>
                <NoteClass data={getNoteClassApi?.data || null} cid={note_cid || getNoteClassApi?.data?.[0]?.cid} refetch={getNoteClassApi?.refetch} />
                <Divider />
                {
                  !getNoteClassApi.isFetching ?
                    <ClassNote cid={note_cid || getNoteClassApi?.data?.[0]?.cid} player={player} vid={vid} /> :
                    <Loading />
                }
              </Fragment>
            }
          </Fragment>
        }
        {
          tab_value == "教材" &&
          <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column", overflow: "auto" }}>
            <Box sx={{ p: 1, flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
              <Notes
                data={getCourseVideoTeachNoteApi?.data || []}
                player={player}
                cid={cid}
                editable={permission?.isCourseManager || permission?.isCourseTA}
                addNote={handleAddCourseVideoTeachNote}
                editNote={handleEditCourseVideoTeachNote}
                delNote={handleDelCourseVideoTeachNote}
                handleImport={() => setOpen(true)}
                nid={current_note?.nid}
              />
            </Box>
            <ImportNote
              open={open}
              setOpen={setOpen}
              cid={subclass?.['教材']?.cid}
              courseCID={cid}
              vid={vid}
              note_class_data={getNoteClassApi?.data}
              refetch={getCourseVideoTeachNoteApi.refetch}
              onDelete={handleDelCourseVideoTeachNote}
            />
          </Box>
        }
      </Box>
    </Box>
  )
}

const ImportNote = ({
  open = false,
  setOpen = () => { },
  cid,
  courseCID,
  vid,
  note_class_data,
  refetch,
  onDelete,
}) => {


  const getCIDNoteItems = ({ cid, courseCID, vid, notebookCID }) => {
    const query = useQuery({
      queryKey: ["getCourseTeachImportNote", cid, courseCID, vid, notebookCID],
      queryFn: () => getCourseTeachImportNote({ cid, courseCID, vid, notebookCID }),
      enabled: !!open,
    })

    return query
  }

  return (
    <Dialog
      open={open}
      title={"匯入筆記"}
      fullWidth={true}
      isRwdWidth={true}
      fullHeight={"100%"}
      content={
        <>
          {Array.isArray(note_class_data) && note_class_data?.map(d =>
            <NoteClassData
              key={d?.cid}
              {...d}
              getNoteItem={() => getCIDNoteItems({ cid, courseCID, vid, notebookCID: d?.cid })}
              refetch={refetch}
              cid={cid}
              courseCID={courseCID}
              vid={vid}
              onDelete={onDelete}
              notebookCID={d?.cid}
            />
          )}
        </>
      }
      handleClose={() => setOpen(false)}
      contentProps={{ backgroundColor: "#f9f9f9" }}
    />
  )
}

const NoteClassData = ({
  getNoteItem,
  refetch,
  cid, courseCID, vid,
  onDelete,
  notebookCID,
  ...props
}) => {
  const query = getNoteItem()
  const { cname, note_cid, title } = props
  const [expand, setExpand] = useState(false)

  const addNoteListNoteApi = useMutation({ mutationFn: importCourseTeachNote, onSuccess: () => (query.refetch(), refetch()) })

  const importAllNoteList = (notebookCID) => {
    addNoteListNoteApi.mutate({ mode: "all", cid, courseCID, vid, notebookCID })
  }

  return (
    <Card sx={{ p: 1, mb: 2 }}>
      <Box className="flex jcsb aic">
        <Box sx={{ fontSize: "18px", whiteSpace: "pre-wrap" }}>
          <b>{cname} - </b><span style={{ color: "#606060" }}>{title}</span>
        </Box>
        {!!expand &&
          <Tooltip title="匯入全部筆記 (不會匯入相同內容的筆記)">
            <Button size='small' color="warning" startIcon={<Input />} onClick={() => importAllNoteList(notebookCID)}>
              匯入全部
            </Button>
          </Tooltip>
        }
      </Box>
      <Box>
        <Collapse in={expand}>
          <Box sx={{ color: "red", fontSize: "12px" }}>無法匯入相同時間點的筆記 (包含相同時間點不同內容)，打勾代表筆記時間點已存在於教材</Box>
          <LoadingWrapper query={query}>
            <Fragment>
              {query?.data?.map(d =>
                <MarkdownBlock
                  key={d?.nid}
                  d={d}
                  list_cid={note_cid}
                  refetch={() => (query?.refetch(), refetch())}
                  cid={cid}
                  courseCID={courseCID}
                  vid={vid}
                  notebookCID={notebookCID}
                />)
              }
            </Fragment>
          </LoadingWrapper>
        </Collapse>
      </Box>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Button className="flex jcc aic" onClick={() => setExpand(!expand)} fullWidth>
        {!expand ?
          <Fragment>展開筆記<ExpandMore /></Fragment> :
          <Fragment>收折筆記<ExpandLess /></Fragment>
        }
      </Button>
    </Card>
  )
}

const MarkdownBlock = (props) => {
  const { d, refetch, list_cid, cid, courseCID, vid, notebookCID } = props
  const [isHover, setHover] = useState(false)
  const { setAlert } = useAlertStore()

  const addNoteListNoteApi = useMutation({ mutationFn: importCourseTeachNote, onSuccess: () => refetch() })

  return (
    <Box
      sx={{ mt: 2, border: isHover ? "1px solid rgba(0, 0, 0, .2)" : "1px solid rgba(0, 0, 0, 0)", p: 1, transition: "all .2s" }}
      key={d?.nid}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box sx={{ mb: 1 }} className="flex jcsb aic">
        <TimeBlock start={d?.startTime} />
        {!d?.bExists ?
          <Button
            size='small'
            variant='outlined'
            onClick={() => addNoteListNoteApi?.mutate({ cid, courseCID, vid, nid: d?.nid, notebookCID })} disabled={addNoteListNoteApi?.isPending}
          >
            <Add fontSize='small' />加入清單
          </Button> :
          <Tooltip title="筆記時間點已存在於教材">
            <Done fontSize='small' color="success" />
          </Tooltip>
        }
      </Box>
      <MarkdownView
        source={d?.content}
      />
    </Box>
  )
}