import React, { Fragment, useState } from 'react'
import { DialogContent, DialogActions, Typography, Box, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { delCourses } from '../../../apis'
import useDialogStore from '../../../store/dialog'

export default function DelCourse(props) {
  const { data } = props
  const { handleClose } = useDialogStore()
  const [courseName, setCourseName] = useState("")
  const navigate = useNavigate()

  const delCoursesApi = useMutation({
    mutationFn: delCourses,
    onSuccess: (data) => {
      if (data?.body?.status == true) {
        navigate(`/course`)
        handleClose()
      }
    }
  })

  return (
    <Fragment>
      <DialogContent dividers className='flex flex-col fww jcsb'>
        <Box sx={{ fontSize: "20px", mb: 2 }}>
          <div>
            <b>請問您非常確定刪除此「<Typography variant='span' sx={{ color: "red" }}>{data?.courseName}</Typography>」課程？</b>
          </div>
          <b>刪除後<Typography variant='span' sx={{ color: "red" }}>不可復原</Typography>！</b>
        </Box>
        <div>
          輸入以下內容進行確認：
        </div>
        <Box sx={{ mt: 1 }}>
          <Typography variant="code" sx={{ color: "#1f1e24", backgroundColor: "#ececef", borderRadius: "4px", p: "2px 4px", fontSize: "90%" }}>
            {data.courseName}
          </Typography>
        </Box>
        <TextField
          label=""
          variant="standard"
          value={courseName || ""}
          sx={{ mt: 1 }}
          placeholder=''
          onChange={(e) => setCourseName(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          color={"error"}
          onClick={() => delCoursesApi.mutate({ courseName, ownerMID: data?.ownerMID, cid: data?.cid })}
        >
          刪除
        </LoadingButton>
      </DialogActions>
    </Fragment>
  )
}
