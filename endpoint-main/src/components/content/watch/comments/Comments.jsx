import React, { Fragment, useState } from 'react'
import { Avatar, Box, Divider, Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { stringAvatar } from '../../../Header'
import MarkdownView from '../../../elements/markdown/MarkdownView'
import { ThumbUpAlt, ThumbUpOffAlt, ArrowDropUp, ArrowDropDown, MoreVert, Done, CheckCircle, CheckCircleOutline } from '@mui/icons-material'
import { getVideoCommentChild, editVideoComment } from 'apis'
import MdTextArea from './MdTextArea'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import useAccountStore from '../../../../store/account'
import { useQuery } from '@tanstack/react-query'
import TimeConvert from '../../../elements/TimeConvert'
import { CustomTextArea } from './MdTextArea'
import useAlertStore from '../../../../store/alert'

export default function Comments({ data, onSubmit, onEdit, onDel, onFeedback, isAuthor }) {

  return (
    <Box sx={{ mt: 2 }} className="flex flex-row">
      <Box className="flex flex-col aic" sx={{ pr: 2 }}>
        <Tooltip title={data?.name}>
          <Avatar {...stringAvatar(data?.name)} src={data?.img} sx={{ ...(stringAvatar(data?.name).sx), mb: 1 }} />
        </Tooltip>
        {data?.nlevel !== 1 && data?.bBest &&
          <Tooltip title={"最佳答案"}>
            <Done color='success' />
          </Tooltip>
        }
      </Box>
      <Box className="flex-1-1">
        <Box sx={{ fontSize: "14px", mb: 1 }} className="flex aic">
          <Box sx={{ fontWeight: "500", color: "rgba(0, 0, 0, 0.55)" }}>
            {data?.name}
          </Box>
          <span style={{ color: "#4153C7" }}>&ensp;({data?.sso})</span>
        </Box>
        <Box
          sx={{ p: 1, backgroundColor: "#fff", borderRadius: "10px", border: "1px solid rgba(0, 0, 0, .1)", position: "relative" }}
        >
          <CommentBlock
            data={data}
            onSubmit={onSubmit}
            onEdit={onEdit}
            onDel={onDel}
            onFeedback={onFeedback}
            isAuthor={isAuthor}
          />
          {/* <MdTextArea /> */}
        </Box>
      </Box>

    </Box>
  )
}


const CommentBlock = (props) => {
  const { data, onSubmit, onEdit, onDel, onFeedback, isAuthor } = props
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [show_reply, setShowReply] = useState(false)

  const { mid } = useAccountStore()
  const { setAlert } = useAlertStore()

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const query = useQuery({
    queryKey: ['getVideoCommentChild', data?.oid, data?.fid],
    queryFn: () => getVideoCommentChild({ oid: data?.oid, pcid: data?.fid }),
    enabled: !!show_reply && data?.nlevel == 1
  })

  const handleDelButton = (d) => {
    setAlert({
      title: "刪除留言",
      content: `確定要刪除此留言，刪除後不可復原？`,
      handleAgree: (callback) => (handleClose(), onDel(d, () => d?.nlevel == 1 && query.refetch()), callback())
    })
  }

  return (
    <Fragment>
      {!editing ?
        <MarkdownView
          source={data?.content}
        /> :
        <CustomTextArea
          defaultValue={data?.content}
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={(content, callback) => onEdit({ content, fid: data?.fid }, (tf) => (callback(tf), data?.nlevel == 1 && query.refetch()))}
          btn_text={"儲存"}
        />
      }
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Box className="flex jcsb aic" sx={{ fontSize: "14px" }}>
        <Box>
          {data?.nC > 0 && data?.nlevel == 1 &&
            <Button size="small" sx={{ p: 0 }} onClick={() => setShowReply(!show_reply)}>
              {!show_reply ? <ArrowDropDown fontSize='small' /> : <ArrowDropUp fontSize='small' />} {data?.nC} 則回覆
            </Button>}
        </Box>
        {!editing &&
          <Box className="flex aic">
            <Box sx={{ color: "#717171" }}><TimeConvert time={data?.lastModifiedDT || null} /></Box>
            {data?.bMyLike ?
              <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ ...data, mode: 1 }, () => data?.nlevel == 1 && query.refetch())}>
                <ThumbUpAlt fontSize='small' />
              </IconButton> :
              <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ ...data, mode: 1 }, () => data?.nlevel == 1 && query.refetch())}>
                <ThumbUpOffAlt fontSize='small' />
              </IconButton>
            }
            {data?.nLike > 0 &&
              <Box>{data?.nLike}</Box>
            }
            {data?.nlevel == 2 && !!isAuthor && (data?.bBest ?
              <Tooltip title="取消授予最佳答案">
                <IconButton size='small' sx={{ ml: 1 }} color={"success"} onClick={() => onFeedback({ ...data, mode: 2 }, () => data?.nlevel == 1 && query.refetch())}>
                  <CheckCircle fontSize='small' />
                </IconButton>
              </Tooltip> :
              <Tooltip title="授予最佳答案">
                <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ ...data, mode: 2 }, () => data?.nlevel == 1 && query.refetch())}>
                  <CheckCircleOutline fontSize='small' />
                </IconButton>
              </Tooltip>
            )
            }
            {data?.nlevel == 1 && <Button size="small" sx={{ p: 0, minWidth: "45px" }} onClick={() => setReplying(true)}>回覆</Button>}
            {mid == data?.mid &&
              <Fragment>
                <IconButton
                  size='small'
                  onClick={handleClick}
                ><MoreVert fontSize='small' />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => (handleClose(), setEditing(true))}>編輯</MenuItem>
                  <MenuItem onClick={() => (handleDelButton(data))}>刪除</MenuItem>
                </Menu>
              </Fragment>
            }
          </Box>
        }
      </Box>
      {
        !!replying &&
        <MdTextArea
          autoFocus
          onCancel={() => setReplying(false)}
          onSubmit={(text, callback) => onSubmit(text, (tf) => (callback(tf), setShowReply(true), query.refetch()))}
        />
      }
      {
        !!show_reply &&
        <LoadingWrapper query={query}>
          <Fragment>
            {Array.isArray(query?.data?.data) && query?.data?.data?.map(d =>
              <Comments
                data={d}
                key={d?.fid}
                onEdit={(d, callback) => onEdit(d, (tf) => (callback(tf), data?.nlevel == 1 && query.refetch()))}
                onDel={(d, callback) => onDel(d, (tf) => (callback(), data?.nlevel == 1 && query.refetch()))}
                onFeedback={(d, callback) => onFeedback(d, () => (callback(), data?.nlevel == 1 && query.refetch()))}
                isAuthor={isAuthor}
              />
            )}
          </Fragment>
        </LoadingWrapper>
      }
    </Fragment >
  )
}