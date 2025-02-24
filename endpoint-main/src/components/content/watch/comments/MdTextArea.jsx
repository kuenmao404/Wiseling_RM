import React, { useState, useEffect, useRef, Fragment } from 'react'
import { Box, Avatar, TextField, Button, Tooltip, IconButton, DialogContent, DialogActions } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { stringAvatar } from '../../../Header'
import useAccountStore from '../../../../store/account'
import useWatchStore from '../../../../store/watch'
import pasteImg from '../../../../lib/pasteImg'
import Dialog from '../../../elements/dialog/Dialog'
import MarkdownEditor from '../../../elements/markdown/MarkdownEditor'

export default function MdTextArea({ defaultValue, onSubmit, autoFocus = false, onCancel, ...props }) {
  const { img, name } = useAccountStore()
  const { setEditing } = useWatchStore()

  return (
    <Box className="flex flex-row ais">
      <Tooltip title={name}>
        <Avatar {...stringAvatar(name)} src={img} sx={{ ...(stringAvatar(name).sx), mr: 2 }} />
      </Tooltip>
      <CustomTextArea
        defaultValue={defaultValue}
        onSubmit={onSubmit}
        autoFocus={autoFocus}
        onCancel={onCancel}
      />
    </Box>
  )
}

export { CustomTextArea }

const CustomTextArea = ({
  defaultValue = "",
  onSubmit,
  autoFocus,
  btn_text = null,
  onCancel = () => { },
  ...props
}) => {
  const [text, setText] = useState('')
  const [view, setView] = useState(autoFocus)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const textRef = useRef()

  const { mid } = useAccountStore()
  const { setEditing } = useWatchStore()

  useEffect(() => {
    setText(defaultValue || '')
    !!view && setEditing(true)

    return () => {
      setEditing(false)
    }
  }, [view])

  const checkText = (t) => {
    if (t?.trim()?.length > 0)
      return true
    else
      return false
  }

  const resetAction = () => {
    setView(false)
    setText("")
    onCancel()
    setLoading(false)
  }

  return (
    <Box width={"100%"}>
      <Dialog
        open={open}
        handleClose={() => setOpen(false)}
        title={"編輯留言"}
        fullWidth={true}
        isRwdWidth={true}
        fullHeight={"100%"}
        body={(
          <Fragment>
            <DialogContent dividers>
              <MarkdownEditor
                value={text}
                handleChange={(text, event) => setText(text)}
                sx={{ height: "100%" }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>
                完成
              </Button>
            </DialogActions>
          </Fragment>
        )}
      />
      <TextField
        inputRef={textRef}
        value={text}
        variant="standard"
        label={!!mid ? (!view ? "留言採用Markdown語法..." : "留言") : "請先登入"}
        // placeholder={'留言採用Markdown語法...'}
        onClick={() => setView(true)}
        onChange={(e) => setText(e.target.value)}
        multiline
        fullWidth
        disabled={!mid}
        autoFocus={!!autoFocus}
        onPaste={async (event) => {
          const text = (await pasteImg(event.clipboardData, textRef.current))
          if (text !== null) {
            setText(text);
          }
        }}
      />
      {!!view &&
        <Box className="flex jcsb" sx={{ mt: 1 }}>
          <Box>
            <Tooltip title={"使用編輯器"}>
              <IconButton size={"small"} onClick={() => setOpen(true)}>
                <OpenInNew fontSize='small' />
              </IconButton>
            </Tooltip>
          </Box>
          <Box>
            <Button color="error" onClick={() => resetAction()}>
              取消
            </Button>
            <Button
              disabled={!checkText(text) || !!loading}
              onClick={() => (setLoading(true), onSubmit(text, (tf) => !!tf && resetAction()))}
            >
              {btn_text || "留言"}
            </Button>
          </Box>
        </Box>
      }
    </Box>

  )
}