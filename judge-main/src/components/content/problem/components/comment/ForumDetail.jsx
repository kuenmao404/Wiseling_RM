import React, { Fragment, cloneElement, useState } from 'react'
import { Avatar, Box, Chip, Divider, DialogContent, DialogActions, Button, Tooltip, IconButton, Menu, MenuItem } from '@mui/material'
import { ChatBubbleOutline, MoreVert, ThumbUpAlt, ThumbUpOffAlt, ArrowDropDown, ArrowDropUp, Done, CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { stringAvatar } from '../../../../header'
import MarkdownPreview from '../../../../elements/markdown/MarkdownPreview'
import MarkdownEditor from '../../../../elements/markdown/MarkdownEditor';
import { KeyboardBackspace } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemForum, getProblemForumChild, addProblemForumChild, editProblemForum, delProblemForum, likebestProblemForum } from '../../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import Dialog from '../../../../elements/dialog/Dialog'
import TimeConvert from '../../../../elements/TimeConvert'
import { accountAtom } from '../../../../App'
import { useAtomValue } from 'jotai'
import useAlertStore from '../../../../../store/alert'
import { EditorDialog } from '.';

const getProblemForumApi = ({ cid, pid, fid }) => {
  return useQuery({
    queryKey: ["getProblemForum", cid, pid, fid],
    queryFn: () => getProblemForum({ cid, pid, fid, order: "since_d" })
  })
}

const getProblemForumChildApi = ({ pfid, cid }) => {
  return useQuery({
    queryKey: ["getProblemForumChild", pfid, cid],
    queryFn: () => getProblemForumChild({ pfid, cid })
  })
}

const addProblemForumChildApi = ({ ...props }) => {
  return useMutation({ mutationFn: addProblemForumChild, ...props })
}

const ForumWrapper = ({
  cid,
  pid,
  onClick = () => { },
  refetch,
  children
}) => {
  const params = useParams()
  const { oid: fid } = params || {}
  const navigate = useNavigate()
  const { mid } = useAtomValue(accountAtom)

  const { ...query } = getProblemForumApi({ cid, pid, fid })
  const { ...child_query } = getProblemForumChildApi({ pfid: fid, cid })
  const { data: child_data, total } = child_query?.data || {}

  const { mutate: addChildForum } = addProblemForumChildApi({ onSuccess: () => child_query?.refetch() })
  const editProblemForumApi = useMutation({ mutationFn: editProblemForum, onSuccess: (res) => res?.body?.status && (child_query?.refetch(), refetch()) })
  const delProblemForumApi = useMutation({ mutationFn: delProblemForum, onSuccess: (res) => res?.body?.status && refetch() })
  const likebestProblemForumApi = useMutation({ mutationFn: likebestProblemForum })

  const handleFeedback = ({ pfid, fid }, callback) => {
    likebestProblemForumApi?.mutate({ cid, pfid, fid, mode: 1 }, { onSuccess: (res) => res?.body?.status && (query?.refetch(), child_query?.refetch()) })
  }

  const handleBest = ({ pfid, fid }, callback) => {
    likebestProblemForumApi?.mutate({ cid, pfid, fid, mode: 2 }, { onSuccess: (res) => res?.body?.status && (query?.refetch(), child_query?.refetch()) })
  }

  return (
    <Fragment>
      <Box sx={{ m: 1, pl: 1, pr: 1, color: "#0000008c" }} className="text-sm flex">
        <Box sx={{ "&:hover": { color: "#1a1a1a" } }} className="transition-2 cursor-pointer" onClick={onClick}>
          <KeyboardBackspace fontSize='small' />&ensp;All Solutions
        </Box>
      </Box>
      <Divider sx={{ mt: 0, mb: 0 }} />
      <LoadingWrapper query={query}>
        {cloneElement(children, {
          ...query?.data,
          parent_mid: mid,
        })}
      </LoadingWrapper>
      <Divider sx={{ mt: 0, mb: 0 }} />
      {query?.data &&
        <ForumActionBar
          {...query?.data}
          login_mid={mid}
          onFeedback={handleFeedback}
          handleEdit={({ text, title, tag }, callback) => editProblemForumApi.mutate(
            { fid: query?.data?.fid, title: title, text, tag },
            { onSuccess: (d) => d?.body?.status && (callback(), query?.refetch()) })}
          handleDel={() => delProblemForumApi.mutate({ cid, fid: query?.data?.fid }, { onSuccess: (d) => d?.body?.status && navigate(`/problem/${pid}/comment`) })}
          isPending={editProblemForumApi?.isPending}
        />
      }
      <Divider sx={{ mt: 0, mb: 0 }} />
      <Box className="p-4">
        <div className='text-base font-medium text-label-1 flex aic'>
          <ChatBubbleOutline fontSize='small' />&ensp;<b>留言 ({query?.data?.nC || 0})</b>
        </div>
        <AddChildForum
          hanldleSubmit={(text, callback) => addChildForum({ fid: parseInt(fid), cid, text, id: parseInt(pid) }, { onSuccess: (d) => d?.body?.status && callback() })}
        />
        <LoadingWrapper query={child_query}>
          <Fragment>
            {Array.isArray(child_data) && child_data?.map(d =>
              <ForumComment
                key={d?.fid}
                {...d}
                sx={{ mt: 2 }}
                parent_mid={query?.data?.mid}
                handleEdit={(text, callback) => editProblemForumApi.mutate({ fid: d?.fid, text }, { onSuccess: (d) => d?.body?.status && callback() })}
                handleDel={() => delProblemForumApi.mutate(
                  { cid, fid: d?.fid, pfid: query?.data?.fid },
                  { onSuccess: (d) => d?.body?.status && (query?.refetch(), child_query?.refetch()) }
                )}
                login_mid={mid}
                onFeedback={handleFeedback}
                onBest={handleBest}
              />
            )}
          </Fragment>
        </LoadingWrapper>
      </Box>
      <br />
    </Fragment>
  )
}

const ForumActionBar = ({
  bMyLike,
  fid,
  title: defaultTitle,
  mid,
  login_mid,
  content,
  nLike,
  tag,
  onFeedback,
  handleEdit,
  handleDel,
  isPending,
}) => {
  // 編輯
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const [tags, setTags] = useState(tag?.length !== 0 && (tag?.split(' ')) || [])
  const [title, setTitle] = useState(defaultTitle)
  const handleEditing = () => {
    setText(content)
    setEditing(true)
  }

  // 貼文管理功能 顯示更多
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { setAlert } = useAlertStore()
  const handleDelButton = () => {
    setAlert({
      title: "移除留言",
      content: `移除留言後無法復原，確定要移除留言？`,
      handleAgree: (callback) => (handleDel(), handleClose(), callback())
    })
  }

  const transTag = (tags) => {
    return tags?.join(" ")
  }

  return (
    <Box sx={{ p: 1, backgroundColor: "#0000000a" }} className="flex jce aic">
      <EditorDialog
        open={editing}
        value={text}
        setValue={setText}
        handleClose={() => setEditing(false)}
        tags={JSON.stringify(tags || "[]")}
        setTags={(t) => setTags(JSON.parse(t))}
        title={title}
        setTitle={setTitle}
        onSubmit={() => handleEdit({ text, title, tag: transTag(tags) }, () => (setEditing(false), setText("")))}
        isPending={isPending}
      />
      {bMyLike ?
        <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ fid })}>
          <ThumbUpAlt fontSize='small' />
        </IconButton> :
        <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ fid })}>
          <ThumbUpOffAlt fontSize='small' />
        </IconButton>
      }
      {nLike > 0 &&
        <Box sx={{ fontSize: "14px", fontWeight: "500", color: "rgba(0, 0, 0, 0.55)" }}>{nLike}</Box>
      }
      {login_mid == mid &&
        <Fragment>
          <IconButton size='small' onClick={handleClick}>
            <MoreVert fontSize='small' />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock={true}
          >
            {login_mid == mid && <MenuItem onClick={() => (handleClose(), handleEditing())}>編輯</MenuItem>}
            {login_mid == mid && <MenuItem onClick={handleDelButton}>刪除</MenuItem>}
          </Menu>
        </Fragment>
      }
    </Box>
  )
}

const ForumDetail = ({
  title = null,
  name = "SSuung..YY",
  since = '2024-08-06',
  content = "",
  tag = "",
  img = null,
}) => {

  const tags = tag?.split(' ')

  return (
    <div className='p-4'>
      <Box className='text-base font-semibold [overflow-wrap:anywhere] text-lc-text-primary'>{title}</Box>
      <Box className='flex aifs' sx={{ mt: 2 }}>
        <Avatar {...stringAvatar(name)} src={img} sx={{ ...(stringAvatar(name).sx), mb: 1, mr: 1, width: "35px", height: "35px" }} />
        <div>
          <div>{name}</div>
          <Box sx={{ color: "#0000008c" }} className="text-xs">{since}</Box>
        </div>
      </Box>
      <div className='mt-1'>
        {Array.isArray(tags) &&
          tags?.map(d => d?.length !== 0 && <Chip key={d} label={d} size="small" sx={{ fontSize: "12px", color: "#0000008c", mr: 1 }} />)
        }
      </div>
      <Box sx={{ mt: 2 }}>
        <MarkdownPreview
          source={content}
        />
      </Box>
    </div>
  )
}

const borderStyle = {
  backgroundColor: "#fff", borderRadius: "10px", border: "1px solid rgba(0, 0, 0, .1)"
}

const ForumComment = ({
  name,
  img,
  nC,
  sx,
  lastModifiedDT,
  nlevel,
  bBest,
  nLike = null,
  content,
  bMyLike,
  fid,
  pfid,
  parent_mid,
  login_mid,
  mid,
  handleEdit = () => { },
  handleDel = () => { },
  onFeedback = () => { },
  onBest = () => { },
}) => {

  // 編輯
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const handleEditing = () => {
    setText(content)
    setEditing(true)
  }

  // 貼文管理功能 顯示更多
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { setAlert } = useAlertStore()
  const handleDelButton = () => {
    setAlert({
      title: "移除留言",
      content: `移除留言後無法復原，確定要移除留言？`,
      handleAgree: (callback) => (handleDel(), handleClose(), callback())
    })
  }

  return (
    <Box sx={{ ...borderStyle, p: 1, ...sx }}>
      <MarkdownEditDialog
        open={editing}
        setOpen={setEditing}
        title="編輯"
        text={text}
        setText={setText}
        hanldleSubmit={() => handleEdit(text, () => (setEditing(false), setText("")))}
      />
      <Box className="flex flex-row">
        <Box sx={{ pt: 1, mr: 2 }} className="flex flex-col aic">
          <Avatar {...stringAvatar(name)} src={img} sx={{ ...(stringAvatar(name).sx) }} />
          {nlevel !== 1 && bBest &&
            <Tooltip title={"最佳答案"}>
              <Done color='success' sx={{ mt: 1 }} />
            </Tooltip>
          }
        </Box>
        <Box className="flex-1-1">
          <Box sx={{ fontSize: "14px", fontWeight: "500", color: "rgba(0, 0, 0, 0.55)", mb: 1 }}>
            {name}・{lastModifiedDT}
          </Box>
          <Box>
            <MarkdownPreview
              source={content}
            />
          </Box>
        </Box>
      </Box>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Box className="flex jcsb aic" sx={{ mt: 1 }}>
        <div></div>
        <Box>
          <Box className="flex aic">
            <Tooltip title={`最後編輯 ${lastModifiedDT}`}>
              <Box sx={{ color: "#717171", fontSize: "14px" }}><TimeConvert time={lastModifiedDT || new Date()} /></Box>
            </Tooltip>
            {bMyLike ?
              <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ pfid, fid })}>
                <ThumbUpAlt fontSize='small' />
              </IconButton> :
              <IconButton size='small' sx={{ ml: 1 }} onClick={() => onFeedback({ pfid, fid })}>
                <ThumbUpOffAlt fontSize='small' />
              </IconButton>
            }
            {nLike > 0 &&
              <Box sx={{ fontSize: "14px", fontWeight: "500", color: "rgba(0, 0, 0, 0.55)" }}>{nLike}</Box>
            }
            {nlevel == 2 && parent_mid == login_mid && (bBest ?
              <Tooltip title="取消授予最佳答案">
                <IconButton size='small' sx={{ ml: 1 }} color={"success"} onClick={() => onBest({ pfid, fid })}>
                  <CheckCircle fontSize='small' />
                </IconButton>
              </Tooltip> :
              <Tooltip title="授予最佳答案">
                <IconButton size='small' sx={{ ml: 1 }} onClick={() => onBest({ pfid, fid })}>
                  <CheckCircleOutline fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
            {(nlevel == 1 || login_mid == mid) &&
              <Fragment>
                <IconButton size='small' onClick={handleClick}>
                  <MoreVert fontSize='small' />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  disableScrollLock={true}
                >
                  {login_mid == mid && <MenuItem onClick={() => (handleClose(), handleEditing())}>編輯</MenuItem>}
                  {(nlevel == 1 || login_mid == mid) && <MenuItem onClick={handleDelButton}>刪除</MenuItem>}
                </Menu>
              </Fragment>
            }
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const AddChildForum = ({
  hanldleSubmit = () => { },
}) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  return (
    <Fragment>
      <MarkdownEditDialog
        open={open}
        setOpen={setOpen}
        title="回覆"
        text={text}
        setText={setText}
        hanldleSubmit={() => hanldleSubmit(text, () => (setOpen(false), setText("")))}
      />
      <Box
        className="flex-1-1 flex aic transition-2"
        sx={{
          backgroundColor: "#f0f2f5", borderRadius: "20px", mt: 1, p: 1, pl: 2, pr: 2, cursor: "pointer",
          "&:hover": { backgroundColor: "#e9e9e9" }
        }}
        onClick={() => setOpen(true)}
      >
        表達你要回覆的內容。
      </Box>
    </Fragment>
  )
}

const MarkdownEditDialog = ({
  open,
  setOpen,
  title,
  text,
  setText,
  hanldleSubmit
}) => {

  return (
    <Dialog
      open={open}
      handleClose={() => setOpen(false)}
      title={title}
      fullWidth={true}
      isRwdWidth={true}
      fullHeight={"100%"}
      body={(
        <Fragment>
          <DialogContent dividers className='flex flex-col'>
            <div className='flex-1-1 md-editor-container'>
              <MarkdownEditor
                value={text}
                onChange={(text, event) => setText(text)}
                sx={{ height: "100%" }}
                autoFocus={true}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={hanldleSubmit}>
              完成
            </Button>
          </DialogActions>
        </Fragment>
      )}
    />
  )
}

export { ForumDetail, ForumWrapper } 