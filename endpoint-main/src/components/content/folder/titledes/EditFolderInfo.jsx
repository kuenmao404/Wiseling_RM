import React, { cloneElement, Fragment, useEffect, useState } from 'react'
import MarkdownEditor from '../../../elements/markdown/MarkdownEditor'
import {
  Box, Button, DialogActions, DialogContent, IconButton, TextField, Tooltip
} from '@mui/material'

const EditFolderInfo = ({
  title,
  des,
  isPending,
  onSubmit = () => { },
  handleClose,
}) => {
  const [data, setData] = useState({ title: title?.replaceAll('<\\>', '/'), des })

  const handleChange = (d) => {
    setData({ ...data, ...d })
  }

  return (
    <Fragment>
      <DialogContent dividers>
        <Box className="flex flex-col" sx={{ height: "100%" }}>
          <TextField
            value={data?.title || ""}
            onChange={(e) => handleChange({ title: e.target.value })}
            variant='standard'
            label={'資料夾名稱'}
            fullWidth
            autoFocus
          />
          <Box sx={{ mt: 2 }} className="flex-1-1">
            <MarkdownEditor
              value={data?.des || ""}
              handleChange={(text) => handleChange({ des: text })}
              sx={{ height: "100%" }}
              autoFocus={false}
              placeholder="編輯資料夾資訊"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onSubmit(data, handleClose)} disabled={isPending}>
          完成
        </Button>
      </DialogActions>
    </Fragment>
  )
}

export default EditFolderInfo;