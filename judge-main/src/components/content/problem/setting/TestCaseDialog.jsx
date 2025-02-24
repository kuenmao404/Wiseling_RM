import React, { Fragment, useState } from 'react'
import { TextField, DialogContent, DialogActions, Button, Box, IconButton, Divider, useMediaQuery, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

export default function TestCaseDialog({ handleSubmit }) {
  const [data, setData] = useState({ input: null, output: null })
  const [isFetching, setFetching] = useState(false)

  const handleDataChange = (d) => {
    setData({ ...data, ...d })
  }

  return (
    <Fragment>
      <DialogContent dividers sx={{ width: "700px", maxWidth: "100%" }}>
        <div><b>Input</b></div>
        <Box sx={{ mb: 2, mt: 1 }}>
          <TextField
            onChange={(e) => handleDataChange({ input: e.target.value })}
            multiline={true}
            minRows={10}
            autoFocus
            fullWidth
          />
        </Box>
        <div><b>上傳Input</b></div>
        <Box sx={{ mb: 2, mt: 1 }}>

          <Box>
            <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth>
              上傳Input
              <VisuallyHiddenInput type="file" onChange={(e) => handleDataChange({ inputFile: e.target?.files?.[0] })} />
            </Button>
          </Box>
          <div>{data?.inputFile?.name}</div>
        </Box>
        {/* <div><b>上傳Output</b></div>
        <Box sx={{ mt: 1 }}>
          <Box>
            <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth>
              上傳Output
              <VisuallyHiddenInput type="file" onChange={(e) => handleDataChange({ outputFile: e.target?.files?.[0] })} />
            </Button>
          </Box>
          <div>{data?.outputFile?.name}</div>
        </Box> */}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => (setFetching(true), handleSubmit(data, () => setFetching(false)))}
          disabled={isFetching}
        >
          新增
        </Button>
      </DialogActions>
    </Fragment>
  )
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});