import React, { Fragment, useState, useRef, useEffect } from 'react'
import NoteItem from './NoteItem'
import { Divider, Box, Fab, Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import NoteEdit from './NoteEdit'
import { useSearchParams } from 'react-router-dom'
import { AddNoteKeyPress } from '../KeyPress'
import useWatchStore from '../../../store/watch'
import useSnackbarStore from '../../../store/snackbar'

const fabStyle = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  width: "48px"
};

export default function Notes(props) {
  const { data, addNote, player, delNote, editNote, cid, editable = true, title, nid } = props
  const [isHover, setHover] = useState(false)
  const [pre_data, setPreData] = useState({})
  const [open, setOpen] = useState(false)
  const [disable, setDisable] = useState(false)

  const noteWrapperRef = useRef(null)

  const { isEditing } = useWatchStore()
  const { setSnackMsg } = useSnackbarStore()

  const [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const handleChange = (d) => {
    setPreData({ ...pre_data, ...d })
  }

  useEffect(() => {
    if (Array.isArray(data) && nid) {
      const current_note_info = data?.find(f => f.nid == nid)
      if (current_note_info) {
        let now_ref = noteWrapperRef.current.querySelector(`.note_${current_note_info?.nid}`)
        if (!!now_ref) {
          now_ref.scrollIntoView()
        }
      }
    }
  }, [nid, data, noteWrapperRef])

  const handlePreAddNote = () => {
    let t = !!player ? player?.getCurrentTime() : 0
    if (!player) {
      console.log('No Player', player)
      setSnackMsg({ message: "請先播放影片" })
    }
    else {
      handleChange({ startTime: t, content: "" })
      setOpen(true)
    }
  }

  return (
    <Fragment>
      <Box
        sx={{ flex: "1 1 auto", overflow: "auto" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        ref={noteWrapperRef}
      >
        {Array.isArray(data) &&
          data.map((d, idx) =>
            <Fragment key={d?.nid}>
              <NoteItem
                cid={cid}
                className={`note_${d?.nid}`}
                start={d?.startTime}
                end={d?.endTime}
                title={title}
                content={d?.content}
                onClickTime={(time) => setSearchParams({ ...params, v: d?.vid, n: d?.nid, t: time })}
                onDelNote={!!delNote ? (callback) => delNote({ nid: d?.nid, vid: d?.vid, cid: d?.cid }, callback) : null}
                onEditNote={!!editNote ? (data_obj, callback) => editNote({ ...d, ...data_obj }, callback) : null}
                setDisable={setDisable}
                editable={editable}
                data={d}
                isPlay={d?.nid == nid}
                player={player}
              />
              <Divider sx={{ m: "8px 0", borderColor: "rgba(0,0,0,0)" }} />
            </Fragment>
          )
        }
        {!!open &&
          <NoteEdit
            cid={cid}
            start={pre_data.startTime}
            end={pre_data.endTime}
            content={pre_data.content}
            handleChange={handleChange}
            handleSuccess={(data) => addNote({ ...pre_data, ...data }, () => setOpen(false))}
            handleCancel={() => (setOpen(false), setPreData({}))}
            player={player}
            isAdd={true}
          />
        }
        {!open && !disable && !!editable && !!addNote && !isEditing && Array.isArray(data) &&
          <AddNoteKeyPress handlePreAddNote={handlePreAddNote} />
        }
        {/* {!!isHover && !open && !disable && !!editable && !!addNote && !!player && Array.isArray(data) &&
        <Fab variant="extended" color="primary" sx={fabStyle} onClick={handlePreAddNote}>
          <Add />
        </Fab>
      } */}
      </Box>
      {!open && !disable && !!editable && !!addNote && !!player && Array.isArray(data) &&
        <Button
          variant={"contained"}
          onClick={handlePreAddNote}
          fullWidth
          size='small'
          color={"info"}
          sx={{ position: "sticky", bottom: "16px", right: "0px", mt: 1, mb: 2 }}
          startIcon={<Add fontSize='small' />}
        >
          新增筆記本
        </Button>
      }
    </Fragment>

  )
}


/**

{!!bImport && !open && !disable && !!editable && !!addNote && !!player && Array.isArray(data) &&
  <Box
    sx={{ position: "sticky", bottom: 0, backgroundColor: "#f0f0f0", p: 2, borderTop: "1px solid rgba(0, 0, 0, .3)", pt: 0.5, pb: 0.5 }}
    className="flex jcsb aic"
  >
    <div>
      <b>教材</b>
    </div>
    <div>
      <Tooltip title="匯入筆記">
        <IconButton size='small' color="warning" onClick={handleImport}>
          <PlaylistAdd fontSize='small' />
        </IconButton>
      </Tooltip>
      <Tooltip title={"新增筆記"}>
        <IconButton size='small' color="primary" onClick={handlePreAddNote}>
          <Add fontSize='small' />
        </IconButton>
      </Tooltip>
    </div>
  </Box>
}

 */