import React, { Fragment, useState } from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DelIcon from '@mui/icons-material/Delete'
import MarkdownView from '../markdown/MarkdownView'
import NoteEdit from './NoteEdit'
import useAlertStore from '../../../store/alert'

export default function NoteItem(props) {
  const { start, end, content, onClickTime, onDelNote, onEditNote, setDisable, cid, editable, title, isPlay, player, className } = props
  const { setAlert } = useAlertStore()
  const [isHover, setHover] = useState(false)
  const [isEditContent, setEditContent] = useState(false)
  const [data, setData] = useState({ content: content, startTime: start, endTime: end })

  const test = `
  (點兩下編輯筆記)
  `

  const handleChange = (d) => {
    setData({ ...data, ...d })
  }

  const handleDelNote = () => {
    setAlert({
      title: `刪除筆記`,
      content: `確定要刪除開始時間${ConvertTime(start)}的筆記？`,
      handleAgree: (callback) => onDelNote(callback),
    })
  }

  const handleEditContent = (tf = !isEditContent) => {
    setEditContent(tf)
    setDisable(tf)
  }

  return (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} sx={{ pr: 1, pl: 1, pb: 1, backgroundColor: isPlay ? "pink" : null }}>
      <Box className={`flex aic jcsb ${className}`} sx={{ mb: 1, position: "relative", }}>
        <Box className="flex aic">
          <TimeBlock start={start} onClick={() => onClickTime(start)} />
          {!!end &&
            <Fragment>
              <span>~&ensp;</span>
              <TimeBlock start={end} onClick={() => onClickTime(end)} />
            </Fragment>
          }
          {!!title && title(props.data)}
        </Box>
        {!!editable &&
          <Box sx={{ visibility: !isHover ? "hidden" : "visible" }}>
            {!!onEditNote &&
              <Tooltip title="編輯筆記">
                <IconButton size="small" sx={{ mr: 1 }} onClick={() => handleEditContent(true)}>
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            }
            {!!onDelNote &&
              <Tooltip title="刪除筆記">
                <IconButton size="small" color="error" onClick={handleDelNote}>
                  <DelIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            }
          </Box>
        }
      </Box>
      {!isEditContent ?
        <Tooltip title={!!editable && !!onEditNote ? "雙擊右鍵可編輯筆記" : ""} placement="top">
          <Box
            onDoubleClick={() => !!editable && !!onEditNote && handleEditContent(true)}
            sx={{ pt: 1, pb: 1, pl: "4px", pr: "4px", backgroundColor: "#fff" }}
          >
            <MarkdownView source={content || test} />
          </Box>
        </Tooltip>
        :
        <NoteEdit
          cid={cid}
          start={data?.startTime}
          end={data?.endTime}
          content={data?.content}
          player={player}
          handleChange={handleChange}
          handleSuccess={(d) => onEditNote({ ...data, ...d }, () => handleEditContent(false))}
          handleCancel={() => (handleEditContent(false), handleChange({ content }))}
        />
      }
    </Box>
  )
}

export { TimeBlock }

const TimeBlock = (props) => {
  const { start, onClick = () => { } } = props
  return (
    <Typography
      variant="span"
      sx={{ backgroundColor: "#6aa8fb", fontSize: "12px", p: "1px 6px", mr: 1, color: "#fff", borderRadius: "5px", cursor: "pointer" }}
      onClick={onClick}
    >
      {
        (Number.isInteger(start) || !isNaN(parseFloat(start))) ?
          ConvertTime(start) :
          "無結束時間"
      }
    </Typography>
  )
}

const ConvertTime = (time) => {
  return `${parseInt(time / 60)}:${(((time - parseInt(time / 60) * 60) / 100).toFixed(2)).split('.')[1]}`
}

/**
{!isEditTitle ?
  <Typography
    className='flex-1-1'
    variant="span"
    sx={{ fontWeight: "weight", fontSize: "16px", ml: 1, position: "relative" }}
    onDoubleClick={() => setEditTitle(true)}
  >
    <b>{title || "(點兩下編輯標題)"}</b>
  </Typography> :
  <Fragment>
    <TextField
      className='flex-1-1'
      sx={{ ml: 1 }}
      variant="standard"
      autoFocus={true}
      placeholder='按Enter接續編輯內容'
      onKeyDown={e => e.keyCode == 13 && (handleTitleEdit(), setEditContent(true))}
    />
    <IconButton color="success" size="small" onClick={handleTitleEdit}>
      <DoneIcon fontSize="inherit" />
    </IconButton>
    <IconButton color="error" size="small" onClick={handleTitleCancel}>
      <CloseIcon fontSize="inherit" />
    </IconButton>
  </Fragment>
}
 */