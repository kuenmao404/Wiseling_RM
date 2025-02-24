import React, { useState, useEffect, Fragment } from 'react'
import { Box, Button, Divider, TextField } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'

import { getNoteClass, getNotes, addNote, editNote, delNote, addNoteClass } from '../../../apis'
import NoteClass from '../../elements/note/NoteClass'
import Notes from '../../elements/note/Notes'
import Loading from '../../elements/loading'
import useAccountStore from '../../../store/account'

export default function NoteWrapper(props) {
  const { width, player, sx, t } = props
  const [cname, setCName] = useState("我的筆記本")
  let navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });
  const v = searchParams.get('v')
  const cid = searchParams.get('cid')

  const { mid } = useAccountStore()

  const getNoteClassApi = useQuery({ queryKey: ['getNoteClass', v, mid], queryFn: () => getNoteClass({ vid: v, ownerMID: mid }) })
  const addNoteClassApi = useMutation({ mutationFn: addNoteClass, onSuccess: (res) => res?.body?.status && getNoteClassApi.refetch() })

  if (getNoteClassApi.isLoading) {
    return (
      <div></div>
    )
  }

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", ...sx }} className="flex-1-1">
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto" }} className="flex flex-col">
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
                onClick={() => addNoteClassApi.mutate({ cname, vid: v })}
              >
                新增筆記本
              </Button>
            </Box>
          </Box> :
          <Fragment>
            <NoteClass data={getNoteClassApi?.data || null} cid={cid || getNoteClassApi?.data?.[0]?.cid} refetch={getNoteClassApi?.refetch} />
            <Divider />
            {
              !getNoteClassApi.isFetching ?
                <ClassNote cid={cid || getNoteClassApi?.data?.[0]?.cid} player={player} vid={v} t={t} /> :
                <Loading />
            }
          </Fragment>
        }
      </Box>
    </Box>
  )
}

const ClassNote = (props) => {
  const { cid, player, vid, nid, t } = props
  const [current_note, setCurrentNote] = useState(null)

  const getNotesApi = useQuery({ queryKey: ['getNotes', cid, vid], queryFn: () => getNotes({ cid, vid }), enabled: !!cid && !!vid })
  const addNoteApi = useMutation({ mutationFn: addNote, onSuccess: () => getNotesApi.refetch() })
  const editNoteApi = useMutation({ mutationFn: editNote, onSuccess: () => getNotesApi.refetch() })
  const delNoteApi = useMutation({ mutationFn: delNote, onSuccess: () => getNotesApi.refetch() })

  const data = getNotesApi?.data

  const handleAddNote = ({ startTime, endTime, content, duration }, callback = () => { }) => {
    // let t = !!player ? player?.getCurrentTime() : null
    if (startTime == null) {
      callback()
    }
    else {
      addNoteApi.mutate({ vid, cid, startTime, endTime: endTime || null, content, duration }, {
        onSuccess: (res) => {
          res?.body?.status && callback()
        }
      })
    }
  }

  const handleDelNote = (data, callback = () => { }) => {
    delNoteApi.mutate(data, { onSuccess: () => callback() })
  }

  const handleEditNote = (data, callback = () => { }) => {
    editNoteApi.mutate(data, { onSuccess: (data) => data?.body?.status && callback() })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      checkTime()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [data, player])

  const checkTime = () => {
    if (!!player && !!player?.getCurrentTime && !!data) {
      let now_time = player?.getCurrentTime();
      const sort_data = JSON.parse(JSON.stringify(data))?.sort((a, b) => b.startTime - a.startTime)
      const current_data = sort_data?.find(f => f.startTime <= now_time && (f.endTime !== null ? f.endTime >= now_time : true))
      if (current_data?.nid != current_note?.nid) {
        setCurrentNote(current_data)
      }
    }
  }

  return (
    <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Box sx={{ p: 1, flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
        {
          !getNotesApi.isLoading ?
            <Notes data={data} addNote={handleAddNote} player={player} delNote={handleDelNote} editNote={handleEditNote} cid={cid} editable={true} nid={current_note?.nid || nid} /> :
            <Loading />
        }
      </Box>
    </Box>
  )
}

export { ClassNote }