import React, { useState, useEffect, Fragment } from 'react'
import { Box, Divider, Tabs, Tab, Tooltip, TextField, Button } from '@mui/material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  getNoteListNote,
  getNoteClass, // 一般筆記
  addNoteClass,
} from 'apis'
import KeyPress from '../../../../elements/KeyPress'
import NoteClass from '../../../../elements/note/NoteClass'
import Loading from '../../../../elements/loading'
import { ClassNote } from '../../NoteWrapper'
import Notes from '../../../../elements/note/Notes'
import ListNotes from './ListNotes'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import useAccountStore from '../../../../../store/account'

export default function NoteWrapper(props) {
  const { sx = {}, vid, player, cid, nid, t, note_cid } = props
  const [tab_value, setTabValue] = useState('清單')
  const [cname, setCName] = useState("我的筆記本")
  const [current_note, setCurrentNote] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const { mid } = useAccountStore()

  const getNoteClassApi = useQuery({ queryKey: ["getNoteClass", vid, mid], queryFn: () => getNoteClass({ vid, ownerMID: mid }), enabled: !!vid })
  const getNoteListNoteApi = useQuery({ queryKey: ["getNoteListNote", cid], queryFn: () => getNoteListNote({ cid }), enabled: !!cid })
  const addNoteClassApi = useMutation({ mutationFn: addNoteClass, onSuccess: (res) => res?.body?.status && getNoteClassApi.refetch() })

  useEffect(() => {
    let data = (getNoteListNoteApi?.data || [])?.find(f => f.nid == nid)
    setCurrentNote(data)
    if (!!data && t != data.startTime) {
      setSearchParams({ ...params, t: data.startTime })
    }
  }, [getNoteListNoteApi?.data, nid])

  if (getNoteClassApi.isLoading) {
    return (
      <div></div>
    )
  }

  return (
    <Box sx={{ ...sx, width: "100%", position: "relative", overflow: "hidden" }} className="flex flex-col">
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto" }} className="flex flex-col">
        <KeyPress keyList={[17, 39]} onSuccess={() => setTabValue(tab_value == "清單" ? "筆記" : "清單")} />
        <Tooltip title="ctrl + ▶ 可切換tab">
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            value={tab_value}
            onChange={(e, value) => (setTabValue(value))}
          >
            <Tab value="清單" label={<b>清單</b>} />
            <Tab value="筆記" label={<b>筆記</b>} />
          </Tabs>
        </Tooltip>
        <Divider />
        {tab_value == "筆記" &&
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
                    onClick={() => addNoteClassApi.mutate({ cname, vid: vid })}
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
                    <ClassNote cid={note_cid || getNoteClassApi?.data?.[0]?.cid} player={player} vid={vid} nid={nid} /> :
                    <Loading />
                }
              </Fragment>
            }
          </Fragment>
        }
        {tab_value == "清單" &&
          <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column", overflow: "auto" }}>
            <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
              <LoadingWrapper query={getNoteListNoteApi}>
                <ListNotes
                  cid={cid}
                  vid={vid}
                  nid={nid}
                  data={getNoteListNoteApi?.data}
                  refetch={() => getNoteListNoteApi.refetch()}
                  current_note={current_note}
                  player={player}
                />
              </LoadingWrapper>
            </Box>
          </Box>
        }
      </Box>
    </Box>
  )
}
