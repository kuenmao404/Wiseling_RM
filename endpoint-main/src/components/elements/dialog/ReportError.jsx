import React, { Fragment, useState, useEffect } from 'react'
import { DialogContent, DialogActions, Typography, Box, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { reportError } from '../../../apis'
import { useMutation } from '@tanstack/react-query'
import useDialogStore from '../../../store/dialog'
import useWatchStore from '../../../store/watch'

export default function ReportError({
  path
}) {
  const [data, setData] = useState({ title: "", des: "" })
  const { handleClose } = useDialogStore()
  const { setEditing } = useWatchStore()

  useEffect(() => {
    setEditing(true)
    return () => {
      setEditing(false)
    }
  }, [])

  const reportErrorApi = useMutation({ mutationFn: reportError })

  const handleChange = (d) => {
    setData({ ...data, ...d })
  }

  return (
    <Fragment>
      <DialogContent dividers className='flex flex-col'>
        <TextField value={path} disabled={true} variant="filled" label="回報路徑" sx={{ mb: 2 }} fullWidth />
        <TextField defaultValue={""} label="標題" onChange={e => handleChange({ title: e.target.value })} autoFocus sx={{ mb: 2 }} required fullWidth />
        <TextField defaultValue={""} label="說明" onChange={e => handleChange({ des: e.target.value })} multiline rows={15} required fullWidth />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => reportErrorApi.mutate({ ...data, path }, { onSuccess: (d) => !!d?.body?.status && handleClose() })}
          disabled={reportErrorApi.isPending || !data?.title || !data?.des}
          loading={reportErrorApi.isPending}
        >
          回報
        </LoadingButton>
      </DialogActions>
    </Fragment>
  )
}
