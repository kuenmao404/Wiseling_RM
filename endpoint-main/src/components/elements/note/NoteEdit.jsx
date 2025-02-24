import React, { useEffect, useState } from 'react'
import { Box, IconButton, Tooltip, Typography, Switch } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import MarkdownEditor from '../markdown/MarkdownEditor'
import useAlertStore from '../../../store/alert'
import useWatchStore from '../../../store/watch'
import { EditorKeyPress } from '../KeyPress'
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const autoEndtimeAtom = atomWithStorage("auto_endtime", true)

export default function NoteEdit(props) {
  const { start, end, handleChange, content, handleSuccess, handleCancel, cid, player, isAdd } = props
  const { setAlert } = useAlertStore()
  const { setEditing } = useWatchStore()
  const [auto_endtime, setAutoEndtime] = useAtom(autoEndtimeAtom)
  const [startTime, setStartTime] = useState(new Date())

  useEffect(() => {
    setEditing(true)
    return () => {
      setEditing(false)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveEndtime();
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, [player, auto_endtime, content, start, end, cid, isAdd])

  const autoSaveEndtime = () => {
    if (!!player?.getCurrentTime && !!auto_endtime && isAdd) {
      handleChange({ endTime: player?.getCurrentTime() })
    }
  }

  const onhandleCancel = () => {
    setAlert({
      title: `取消編輯筆記`,
      content: `取消後將不會保留修改的內容，確定要取消編輯？`,
      handleAgree: (callback) => (handleCancel(), callback()),
    })
  }

  const getTimeDiff = () => {
    return parseInt(((new Date()).getTime() - startTime.getTime()) / 1000)
  }

  return (
    <Box className="cover flex flex-col">
      <EditorKeyPress player={player} />
      <Box sx={{ backgroundColor: "#fff", p: 1 }} className="flex flex-row aic">
        <Tooltip title="重設開始時間為目前時間">
          <span>
            <TimeBlock start={start} onClick={() => !!player?.getCurrentTime && handleChange({ startTime: player?.getCurrentTime() })} />
          </span>
        </Tooltip>
        <span>~&ensp;</span>
        <Tooltip title="重設結束時間為目前時間">
          <span>
            <TimeBlock start={end} onClick={() => !!player?.getCurrentTime && handleChange({ endTime: player?.getCurrentTime() })} />
          </span>
        </Tooltip>
        {!!isAdd &&
          <Tooltip title={"自動記錄結束時間"}>
            <Switch checked={auto_endtime} onChange={e => setAutoEndtime(e.target.checked)} size='small' color='warning' />
          </Tooltip>
        }
        <IconButton color="success" size="small" onClick={() => (!!handleSuccess && handleSuccess({ duration: getTimeDiff() }))}>
          <DoneIcon fontSize="inherit" />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => (onhandleCancel())}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Box className="flex-1-1" sx={{ position: "relative" }}>
        <MarkdownEditor
          cid={cid}
          className="cover"
          value={content || ""}
          handleChange={(text, event) => handleChange({ content: text })}
          onKeyDown={(e) => e.keyCode == 27 && onhandleCancel()}
          sx={{ zIndex: "1" }}
        />
      </Box>
    </Box>
  )
}

const TimeBlock = (props) => {
  const { start, onClick } = props
  return (
    <Typography
      variant="span"
      sx={{ backgroundColor: "#6aa8fb", fontSize: "12px", p: "1px 6px", mr: 1, color: "#fff", borderRadius: "5px", cursor: "pointer" }}
      onClick={onClick}
    >{
        (Number.isInteger(start) || !isNaN(parseFloat(start))) ?
          `${parseInt(start / 60)}:${(((start - parseInt(start / 60) * 60) / 100).toFixed(2)).split('.')[1]}` :
          "無結束時間"
      }
    </Typography>
  )
}
