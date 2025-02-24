import React, { useState, useEffect, Fragment } from 'react'
import { Box, Divider, Tabs, Tab, Tooltip, TextField, Button } from '@mui/material'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getNoteClass, // 一般筆記
  addNoteClass,
} from 'apis'
import NoteClass from '../../../../elements/note/NoteClass'
import Loading from '../../../../elements/loading'
import { ClassNote } from '../../NoteWrapper'
import useAccountStore from '../../../../../store/account'

export default function NoteWrapper(props) {
  const { sx = {}, vid, player, cid } = props

  const [cname, setCName] = useState("我的筆記本")
  const { mid } = useAccountStore()

  const getNoteClassApi = useQuery({ queryKey: ["getNoteClass", vid, mid], queryFn: () => getNoteClass({ vid, ownerMID: mid }) })
  const addNoteClassApi = useMutation({ mutationFn: addNoteClass, onSuccess: (res) => res?.body?.status && getNoteClassApi.refetch() })

  if (getNoteClassApi.isLoading) {
    return (
      <div></div>
    )
  }

  return (
    <Box sx={{ ...sx, width: "100%", position: "relative", maxHeight: "100%", overflow: "hidden" }} className="flex flex-col">
      <Box sx={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }} className="flex flex-col">
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
            <NoteClass data={getNoteClassApi?.data || null} cid={cid || getNoteClassApi?.data?.[0]?.cid} refetch={getNoteClassApi?.refetch} />
            <Divider />
            {
              !getNoteClassApi.isFetching ?
                <ClassNote cid={cid || getNoteClassApi?.data?.[0]?.cid} player={player} vid={vid} /> :
                <Loading />
            }
          </Fragment>
        }

      </Box>
    </Box>
  )
}
