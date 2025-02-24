import React, { useState, useRef } from 'react'
import { Typography, Box, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'

export default function FileInput(props) {
  const { onChange, accept = null, sx, placeholder } = props
  const fileEl = useRef(null)
  const [ondrag, setOndrag] = useState(false)
  const [files, setFiles] = useState(null)

  const handleChange = (e) => {
    setFiles([...e.target?.files])
    onChange(e)
  }

  const handleClearFiles = () => {
    fileEl.current.value = null
    setFiles(null)
    onChange({ target: { files: null } })
  }

  return (
    <Box sx={sx}>
      <Typography
        variant='label'
        className={`aic jcc${!!ondrag ? " ondrag_file" : ""}`}
        sx={{
          border: "2px solid #eee", borderStyle: "dashed", borderColor: !ondrag ? "#b1acf3" : "#4053ca", borderRadius: "8px",
          display: "flex", height: "50px", cursor: "pointer", transition: "border-color 0.2s ease-in-out", position: "relative", p: "0 16px",
          "&:hover": { borderColor: "#4053ca" }
        }}
        draggable="true"
      >
        <input
          type="file"
          // multiple="multiple"
          required="required"
          draggable="true"
          onChange={handleChange}
          className={`whl_hidden_input pointer`}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, left: 0, bottom: 0, opacity: 0 }}
          ref={fileEl}
          onDragEnter={() => setOndrag(true)}
          onDragLeave={() => setOndrag(false)}
          onMouseLeave={() => setOndrag(false)}
          accept={accept}
        />
        <div className=''>{!placeholder ? "選擇或拖曳檔案至此" : placeholder}</div>
      </Typography>
      {
        !!(files) && files?.map((d, idx) =>
          <Box key={idx} className="flex jcsb aie flex-row" sx={{ transition: "color 0.2s ease-in-out", mt: 1, "&:hover": { color: "#4053ca" } }}>
            <Box sx={{ mr: 1 }} className="flex aic">
              <span>{d.name}</span>
            </Box>
            <Box sx={{ borderBottom: "1px dotted #bdbaba", height: "100%" }} className="flex-1-1" />
            <IconButton color="error" size='small' onClick={() => handleClearFiles()}>
              <Close fontSize='inherit' />
            </IconButton>
          </Box>
        )
      }
    </Box>
  )
}

