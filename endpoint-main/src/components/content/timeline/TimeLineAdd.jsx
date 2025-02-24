import React, { Fragment, useEffect, useState } from 'react'
import { DialogContent, DialogActions, Typography, Box, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import MarkdownEditor from '../../elements/markdown/MarkdownEditor'
import useDialogStore from '../../../store/dialog'
import useAlertStore from '../../../store/alert'
import dayjs from 'dayjs';

dayjs.locale('zh-tw');

export default function TimeLineAdd({
  onSubmit = () => { },
  onDelete = null,
  isLoading = false,
  cid,
  ...props
}) {
  const [date, setDate] = useState(dayjs(new Intl.DateTimeFormat('zh-TW').format(new Date())))
  const [content, setContent] = useState('')

  const { handleClose } = useDialogStore()
  const { setAlert } = useAlertStore()

  useEffect(() => {
    setDate(dayjs(props.date) || date)
    setContent(props.content || '')
  }, [])

  const getDateStr = (d) => {
    return d.format('YYYY-MM-DD')
  }

  const handleDelButton = () => {
    setAlert({
      title: "移除里程",
      content: `確定要移除里程？`,
      handleAgree: (callback) => (onDelete({ date: getDateStr(date), content }, () => handleClose()), callback())
    })
  }

  return (
    <Fragment>
      <DialogContent dividers className='flex flex-col'>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="日期"
            format="YYYY/MM/DD"
            value={date}
            onChange={(date) => setDate(dayjs(new Intl.DateTimeFormat('zh-TW').format(date)))}
          // slotProps={{ field: { clearable: true, }, }}
          />
        </LocalizationProvider>
        <Box sx={{ mt: 2 }} className="flex-1-1 flex flex-col">
          <MarkdownEditor
            value={content || ""}
            handleChange={(text, event) => setContent(text)}
            className={'flex-1-1'}
            cid={cid}
          />
        </Box>
      </DialogContent>
      <DialogActions className='flex jcsb aic' sx={{ justifyContent: "space-between" }}>
        {!!onDelete ?
          <LoadingButton
            onClick={() => handleDelButton()}
            disabled={isLoading || !date || !content}
            loading={isLoading}
            color={'error'}
          >
            刪除
          </LoadingButton> :
          <Box></Box>
        }
        <LoadingButton
          onClick={() => onSubmit({ date: getDateStr(date), content }, () => handleClose())}
          disabled={isLoading || !date || !content}
          loading={isLoading}
        >
          完成
        </LoadingButton>
      </DialogActions>
    </Fragment>
  )
}
