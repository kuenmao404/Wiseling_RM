import React, { useState } from 'react'
import { DialogContent, DialogActions, Button, TextField } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { sendErrorReport } from '../../../apis'

export default function ErrorReport(props) {
  const { oid, handleClose } = props

  const [title, setTitle] = useState("")
  const [des, setDes] = useState("")

  const sendErrorReportApi = useMutation({ mutationFn: sendErrorReport, onSuccess: (d) => !!d?.ok && handleClose() })

  return (
    <>
      <DialogContent dividers sx={{ minWidth: "250px" }}>
        <TextField
          value={title}
          onChange={e => setTitle(e.target.value)}
          // variant="standard"
          label="標題"
          required
          fullWidth
          autoFocus
        />
        <TextField
          value={des}
          onChange={e => setDes(e.target.value)}
          // variant="standard"
          label="說明"
          sx={{ mt: 2 }}
          fullWidth
          required
          multiline
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => sendErrorReportApi.mutate({ oid, title, des })}
          disabled={(sendErrorReportApi?.isPending || title?.trim()?.length == 0 || des?.trim()?.length == 0)}
        >回報
        </Button>
      </DialogActions>
    </>
  )
}
