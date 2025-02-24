import React, { Fragment } from 'react'
import Dialog, { DialogContent, DialogActions } from '../../../../elements/dialog/Dialog'

export default function ForumShow({
  open = false,
  ...props
}) {
  
  return (
    <Dialog
      open={open}
      fullWidth={true}
      isRwdWidth={true}
      fullHeight={"100%"}
      title={"Forum"}
      handleClose={handleClose}
      body={
        <Fragment>
          <DialogContent dividers>

          </DialogContent>
          <DialogActions>
            <Button onClick={onSubmit} disabled={isPending}>
              完成
            </Button>
          </DialogActions>
        </Fragment>
      }
    />
  )
}
