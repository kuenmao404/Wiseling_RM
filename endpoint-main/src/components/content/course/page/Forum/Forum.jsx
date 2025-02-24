import React, { useState, Fragment, useEffect } from 'react'
import { Box, Avatar, DialogContent, DialogActions, Button, Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { MoreVert, ThumbUpAlt, ThumbUpOffAlt, ArrowDropDown, ArrowDropUp, Done, CheckCircle, CheckCircleOutline } from '@mui/icons-material'
import useAccountStore from '../../../../../store/account'
import useAlertStore from '../../../../../store/alert'
import { stringAvatar } from '../../../../Header'
import Dialog from '../../../../elements/dialog/Dialog'
import MarkdownEditor from '../../../../elements/markdown/MarkdownEditor'
import MarkdownView from '../../../../elements/markdown/MarkdownView'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import { BottomWrapper } from '../Home'
import { useBasicInfiniteQuery } from '../../../../../lib/infiniteQuery'
import TimeConvert from '../../../../elements/TimeConvert'
import { getCourseForum, addCourseForum, likebestCourseForum, getCourseForumChild, delCourseForum, editCourseForum } from '../../../../../apis'
import { useMutation, useQuery } from '@tanstack/react-query'

const counts = 20

export default function Forum({
  cid, // forum cid
  CourseCID,
  isCourseTA, isCourseMember, isCourseManager,
  ...props
}) {
  const { name, img, isLogin, mid } = useAccountStore()

  const { InViewQuery, data_arr, ...getCourseForumApi } = useBasicInfiniteQuery({
    queryKey: ['getCourseForum', cid],
    queryFn: ({ pageParam: page }) => getCourseForum({ cid, start: (page) * counts + 1, counts, bTotal: true }),
    keyName: 'getCourseForum',
    enabled: !!isLogin && !!cid,
    counts
  })
  const addCourseForumApi = useMutation({ mutationFn: addCourseForum, onSuccess: () => getCourseForumApi?.refetch() })
  const likebestCourseForumApi = useMutation({ mutationFn: likebestCourseForum, onSuccess: () => getCourseForumApi?.refetch() })
  const editCourseForumApi = useMutation({ mutationFn: editCourseForum, onSuccess: () => getCourseForumApi?.refetch() })
  const delCourseForumApi = useMutation({ mutationFn: delCourseForum, onSuccess: () => getCourseForumApi?.refetch() })

  const handleSubmit = ({ text, fid = null }, callback) => {
    addCourseForumApi?.mutate({ cid, fid, text, id: CourseCID }, { onSuccess: (res) => res?.body?.status && callback() })
  }

  const handleEditForum = ({ text, fid }, callback) => {
    editCourseForumApi?.mutate({ fid, text }, { onSuccess: (res) => res?.body?.status && callback() })
  }

  const handleFeedback = ({ pfid, fid }, callback) => {
    likebestCourseForumApi?.mutate({ cid, pfid, fid, mode: 1 }, { onSuccess: (res) => res?.body?.status && callback?.() })
  }

  const handleBest = ({ pfid, fid }, callback) => {
    likebestCourseForumApi?.mutate({ cid, pfid, fid, mode: 2 }, { onSuccess: (res) => res?.body?.status && callback?.() })
  }

  const handleDelForum = ({ pfid = null, fid }, callback) => {
    delCourseForumApi.mutate({ cid, pfid, fid }, { onSuccess: (res) => res?.body?.status && callback?.() })
  }

  return (
    <Fragment>
      <Box sx={{ p: 2 }}>
        <PostCard
          name={name}
          img={img}
          onSubmit={(text, callback) => handleSubmit({ text }, callback)}
        />
      </Box>
      <LoadingWrapper query={getCourseForumApi}>
        <>
          {!!Array?.isArray(data_arr) && data_arr?.map(d =>
            <ForumList
              key={d?.fid}
              fid={d?.fid}
              name={d?.name}
              img={d?.img}
              content={d?.content}
              date={"2024-06-24"}
              lastModifiedDT={d?.lastModifiedDT}
              nC={d?.nC}
              nlevel={d?.nlevel}
              nLike={d?.nLike}
              sx={{ m: 2, mt: 1 }}
              onSubmit={(text, callback) => handleSubmit({ text, fid: d?.fid }, callback)}
              onFeedback={handleFeedback}
              onEditForum={handleEditForum}
              onDelForum={handleDelForum}
              onBest={handleBest}
              bMyLike={d?.bMyLike}
              cid={cid}
              owner_mid={d?.mid}
              mid={mid}
              isCourseManager={isCourseManager}
              isCourseMember={isCourseMember}
              isCourseTA={isCourseTA}
            />
          )}
        </>
      </LoadingWrapper>
      <BottomWrapper sx={{ mt: 1 }}>
        <InViewQuery sx={{ m: 2 }} />
      </BottomWrapper>
    </Fragment>

  )
}

const ForumList = ({
  fid,
  pfid = null,
  name,
  img,
  content,
  date,
  bMyLike,
  nlevel,
  lastModifiedDT,
  bBest,
  nC,
  nLike,
  cid,
  onSubmit = (text, callback) => callback(),
  onFeedback = () => { },
  onDelForum = () => { },
  onEditForum = () => { },
  onBest = () => { },
  sx,
  owner_mid,
  mid,
  parent_mid = null,
  isCourseTA, isCourseMember, isCourseManager,
  ...props
}) => {
  const { setAlert } = useAlertStore()

  const [show_reply, setShowReply] = useState(false)
  const [editing, setEditing] = useState(false)
  const handleEditing = () => {
    setText(content)
    setEditing(true)
  }

  // 回覆貼文狀態
  const [reply_open, setReplying] = useState(false)
  const [text, setText] = useState("")
  const handleSubmit = () => {
    onSubmit(text, () => (handleCloseDialog(), setShowReply(true)))
  }

  const handleEditForum = () => {
    onEditForum({ fid, text }, () => handleCloseDialog())
  }

  const handleCloseDialog = () => {
    setText("")
    setReplying(false)
    setEditing(false)
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

  const getDateString = (date) => {
    const _date = new Date(date)
    return `${_date?.getFullYear()}-${_date?.getMonth() + 1}-${_date?.getDate()}`
  }

  const getCourseForumChildApi = useQuery({ queryKey: ['getCourseForumChild', fid, cid], queryFn: () => getCourseForumChild({ pfid: fid, cid }), enabled: !!show_reply })

  useEffect(() => {
    if (show_reply) {
      getCourseForumChildApi?.refetch()
    }
  }, [nC])

  const handleDelButton = (data) => {
    setAlert({
      title: "移除留言",
      content: `移除留言後無法復原，確定要移除留言？`,
      handleAgree: (callback) => (handleClose(), onDelForum({ pfid, fid }), callback())
    })
  }

  return (
    <Box sx={{ ...borderStyle, p: 2, ...sx }}>
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
            {name}・{getDateString(lastModifiedDT)}
          </Box>
          <Box>
            <MarkdownView
              source={content}
            />
          </Box>
        </Box>
      </Box>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Box className="flex jcsb aic" sx={{ mt: 1 }}>
        <Box>
          {nC > 0 && nlevel == 1 &&
            <Button size="small" sx={{ p: 0 }} onClick={() => setShowReply(!show_reply)}>
              {!show_reply ? <ArrowDropDown fontSize='small' /> : <ArrowDropUp fontSize='small' />} {nC} 則回覆
            </Button>}
        </Box>
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
          {nlevel == 2 && parent_mid == mid && (bBest ?
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
          )
          }
          {nlevel == 1 && <Button size="small" sx={{ p: 0, minWidth: "45px" }} onClick={() => (setReplying(true))}>回覆</Button>}
          {((isCourseManager || isCourseTA) && nlevel == 1 || owner_mid == mid) &&
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
                {owner_mid == mid && <MenuItem onClick={() => (handleClose(), handleEditing())}>編輯</MenuItem>}
                {((isCourseManager || isCourseTA) && nlevel == 1 || owner_mid == mid) && <MenuItem onClick={handleDelButton}>刪除</MenuItem>}
              </Menu>
            </Fragment>
          }
        </Box>
      </Box>
      {!!show_reply &&
        <Box sx={{ mt: 1 }}>
          <LoadingWrapper query={getCourseForumChildApi}>
            <>
              {getCourseForumChildApi?.data?.data?.map(d =>
                <ForumList
                  key={d?.fid}
                  fid={d?.fid}
                  name={d?.name}
                  img={d?.img}
                  content={d?.content}
                  date={"2024-06-24"}
                  lastModifiedDT={d?.lastModifiedDT}
                  nC={d?.nC}
                  nlevel={2}
                  nLike={d?.nLike}
                  bBest={d?.bBest}
                  sx={{ m: 2, mt: 1, mr: 0 }}
                  onSubmit={onSubmit}
                  onFeedback={(data, callback) => onFeedback(data, () => (callback?.(), getCourseForumChildApi?.refetch()))}
                  onDelForum={(data, callback) => onDelForum(data, () => (callback?.(), getCourseForumChildApi?.refetch()))}
                  onEditForum={(data, callback) => onEditForum(data, () => (callback?.(), getCourseForumChildApi?.refetch()))}
                  onBest={(data, callback) => onBest(data, () => (callback?.(), getCourseForumChildApi?.refetch()))}
                  pfid={fid}
                  bMyLike={d?.bMyLike}
                  owner_mid={d?.mid} // 子留言的MID
                  mid={mid} // 登入帳號的MID
                  parent_mid={owner_mid} // 第一層 (主流言) 的MID
                  isCourseManager={isCourseManager}
                  isCourseMember={isCourseMember}
                  isCourseTA={isCourseTA}
                />
              )}
            </>
          </LoadingWrapper>
        </Box>
      }
      <Dialog
        open={reply_open || editing}
        handleClose={() => handleCloseDialog()}
        title={reply_open ? "回覆貼文" : "編輯貼文"}
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
              <Button onClick={() => !editing ? handleSubmit() : handleEditForum()}>
                完成
              </Button>
            </DialogActions>
          </Fragment>
        )}
      />
    </Box>
  )
}

const borderStyle = {
  backgroundColor: "#fff", borderRadius: "10px", border: "1px solid rgba(0, 0, 0, .1)"
}

const PostCard = ({ name, img, onSubmit = (text, callback) => callback() }) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const handleSubmit = () => {
    onSubmit(text, () => handleClose(false))
  }

  const handleClose = () => {
    setOpen(false)
    setText('')
  }

  return (
    <Box className="flex" sx={{ ...borderStyle, p: 2 }}>
      <Avatar {...stringAvatar(name)} src={img} sx={{ ...(stringAvatar(name).sx), mr: 2 }} />
      <Box
        className="flex-1-1 flex aic transition-2"
        sx={{
          backgroundColor: "#f0f2f5", borderRadius: "20px", p: 1, pl: 2, pr: 2, cursor: "pointer",
          "&:hover": { backgroundColor: "#e9e9e9" }
        }}
        onClick={() => setOpen(true)}
      >
        表達你要討論的內容。
      </Box>
      <Dialog
        open={open}
        handleClose={() => setOpen(false)}
        title={"新增貼文"}
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
              <Button onClick={() => handleSubmit()}>
                完成
              </Button>
            </DialogActions>
          </Fragment>
        )}
      />
    </Box>
  )
}
