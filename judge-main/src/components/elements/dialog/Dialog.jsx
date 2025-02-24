import React from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import useDialogStore from '../../../store/dialog'
import RwdWrapper from '../wrapper/RwdWrapper'

export { DialogContent, DialogActions }


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function Index(props) {
  const { isRwdWidth } = props

  return !!isRwdWidth ? (
    <RwdWrapper onlyProps={true} noDrawer={true}>
      <CustomDialog {...props} />
    </RwdWrapper>
  ) :
    <CustomDialog {...props} />
}

const CustomDialog = (props) => {
  const { content_width,
    open, title, content, actions, body, handleClose, disableScrollLock, fullWidth, fullHeight, maxWidth, fullScreen, isRwdWidth, contentProps = {} } = props

  const p = isRwdWidth ? {
    sx: {
      width: "100%",
      maxWidth: `${content_width} !important`,
      height: fullHeight ? "100%" : "auto",
    }
  } : { fullWidth, maxWidth, fullScreen }

  return (
    <BootstrapDialog
      onClose={handleClose}
      open={open}
      disableScrollLock={!!disableScrollLock}
      {...(!!isRwdWidth ? {} : p)}
      PaperProps={{
        ...(!!isRwdWidth ? p : {})
      }}
    >
      <Box className="flex aic jcsb" sx={{ p: 1 }}>
        <DialogTitle sx={{ m: 0, p: 0, pl: 1 }}>
          {title}
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            // position: 'absolute',
            // right: 8,
            // top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      {
        !!body ? body :
          <>
            <DialogContent dividers sx={{ ...contentProps }}>
              {content}
            </DialogContent>
            {!!actions &&
              <DialogActions>
                {actions}
              </DialogActions>
            }
          </>
      }
    </BootstrapDialog>
  )
}