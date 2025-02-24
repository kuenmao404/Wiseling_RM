import React, { Fragment, useState, useEffect } from 'react'
import { TextField, DialogContent, DialogActions, Button } from '@mui/material'
import { addYTVideo } from '../../../apis'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useSnackbarStore from '../../../store/snackbar'
import useDialogStore from '../../../store/dialog'

export default function AddVideo() {
  const [url, setUrl] = useState("")
  const { setSnackMsg } = useSnackbarStore()
  const { handleClose } = useDialogStore()
  const navigate = useNavigate()

  const addYTVideoApi = useMutation({ mutationFn: addYTVideo, onSuccess: (d) => d?.body?.vid && (navigate(`/watch?v=${d?.body?.vid}`), handleClose()) })

  const handleAddVideo = () => {
    // setSnackMsg({ message: `${parseVideoID(url)}` })
    addYTVideoApi.mutate({ bPlayList: false, url: url })
  }

  const parseVideoID = (string) => {
    let videoID = string
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .replace("youtu.be/", "youtube.com/watch?v=")
      .split("/")
      .splice(1)
      .join("");

    videoID = videoID.substring(8, 19);

    return videoID;
  };

  return (
    <Fragment>
      <DialogContent dividers>
        <TextField
          label="YouTube網址"
          variant="standard"
          sx={{ width: { md: 350, xs: 250 } }}
          value={url}
          placeholder='請輸入完整YouTube網址'
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.keyCode == 13 && handleAddVideo()}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAddVideo()} disabled={!parseVideoID(url)}>
          新增
        </Button>
      </DialogActions>
    </Fragment>
  )
}
