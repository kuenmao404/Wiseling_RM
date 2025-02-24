import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import useAlertStore from '../../../store/alert'

export default function Alert() {
  const { open, handleClose, title, content, handleAgree, handleDisagree } = useAlertStore(state => state)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{whiteSpace: "pre-line"}}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={(handleDisagree, handleClose)}>取消</Button>
        <Button onClick={() => handleAgree(handleClose)} autoFocus>
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}
