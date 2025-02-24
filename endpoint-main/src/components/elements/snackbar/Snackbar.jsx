import React, { useState } from 'react'
import MySnackbar from '@mui/material/Snackbar';
import { Slide, Button, SnackbarContent, Box, Portal } from '@mui/material';
import useSnackbarStore from '../../../store/snackbar'

function SlideTransition(props) {
  const { direction } = useSnackbarStore(state => state)
  return <Slide {...props} direction={direction} />;
}

export default function Snackbar(props) {
  const {
    snackbar,
    closeSnackbar,
    message,
    open,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
    autoHideDuration = 300,
    status = null,
    body_status = null,
  } = props

  const action = (
    <React.Fragment>
      <Button color="inherit" size="small" onClick={closeSnackbar}>
        確認
      </Button>
    </React.Fragment>
  );

  const getStatusMsg = (status) => {
    switch (status) {
      case 401:
        return "沒有權限！"
      case 500:
        return "API發生未知錯誤！"
    }
  }

  const error_props = body_status === false ? { bgcolor: "rgb(211, 47, 47)", color: "#fff", fontWeight: "700" } : {}

  return (
    <Portal>
      <MySnackbar
        open={open}
        onClose={closeSnackbar}
        anchorOrigin={anchorOrigin}
        TransitionComponent={SlideTransition}
        autoHideDuration={autoHideDuration}
        children={
          <Box className='rainbow'>
            <Box className='rainbow-container' sx={{ border: "1px solid rgba(255, 255, 255, .5)", borderRadius: "5px" }}>
              <SnackbarContent message={status != null ? getStatusMsg(status) : message} action={action} sx={error_props} />
            </Box>
          </Box>
        }
      />
    </Portal>
  )
}
