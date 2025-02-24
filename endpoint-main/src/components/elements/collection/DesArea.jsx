import React, { Fragment, useEffect, useState } from 'react'
import { Box, TextField, IconButton, Tooltip } from '@mui/material'
import { Edit, Done, Close } from '@mui/icons-material'

export default function DesArea(props) {
  const { TextFieldProps = {}, BoxProps = {}, des, onEdit } = props
  const [isEdit, setEdit] = useState(false)
  const [tmp_text, setTmpText] = useState("")

  useEffect(() => {
    setTmpText(des)
  }, [des])

  return (
    <Box
      sx={{ mb: 2, backgroundColor: "#fff", borderRadius: "10px 10px 10px 10px", border: "1px solid rgba(0, 0, 0, .1)" }}
      className="flex"
    >
      {!isEdit ?
        <Box sx={{ m: 2, whiteSpace: "pre-wrap", lineHeight: "1.5" }} className="flex-1-1" {...BoxProps}>
          {des}
        </Box> :
        <TextField
          label=""
          variant="standard"
          sx={{ m: 2, width: "100%" }}
          value={tmp_text || ""}
          placeholder=''
          onChange={(e) => setTmpText(e.target.value)}
          multiline
          maxRows={10}
          autoFocus
          {...TextFieldProps}
        />
      }
      <Box sx={{ borderLeft: "1px solid rgba(0, 0, 0, .1)" }} className="flex flex-col">
        {!isEdit ?
          <Tooltip title="編輯描述">
            <IconButton sx={{ m: 1 }} onClick={() => setEdit(true)}>
              <Edit fontSize='small' />
            </IconButton>
          </Tooltip> :
          <Fragment>
            <Tooltip title="完成編輯">
              <IconButton sx={{ m: 1 }} onClick={() => onEdit(tmp_text, () => setEdit(false))}>
                <Done fontSize='small' color="success" />
              </IconButton>
            </Tooltip>
            <Tooltip title="取消編輯">
              <IconButton sx={{ m: 1, mt: 0 }} onClick={() =>( setEdit(false), setTmpText(des))}>
                <Close fontSize='small' color="error" />
              </IconButton>
            </Tooltip>
          </Fragment>
        }
      </Box>
    </Box>
  )
}
