import React, { Fragment, useEffect, useState } from 'react'
import {
  Box, Divider, Tabs, Tab, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  useMediaQuery, CardMedia, ToggleButton, ToggleButtonGroup, Tooltip, IconButton, TextField, Collapse, Menu,
  MenuItem,
} from '@mui/material'
import { ViewList, Add, Dehaze, Edit, Done, Close, Delete, ExpandMore, ExpandLess, MenuOutlined as MenuOutlinedIcon } from '@mui/icons-material'
import { useQueries, useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'

import { getCourseChapter, getCourseChapterVideo, editCourseChapter, delCourseChapterVideo, sortCourseChapterVideo, getCourseProblemMStatus } from '../../../../apis'

import useAccountStore from '../../../../store/account'
import useAlertStore from '../../../../store/alert'

import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { CourseLearningMap } from './LearningMap'
import { CodeBlock } from '../../../elements/code/CodeList'
import Forum from './Forum/Forum'

import { SortableContainer, DragHandle, SortableItem, onSortEnd } from '../../../../lib/array'

import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'

const CourseHomeAtom = atomWithStorage("CourseHomeAtom", "課程")

// permission.myJoinStatus → 0：申請中；1：已加入；2：未申請
export default function Home(props) {
  const { data, margin, myJoinStatus, subclass, isCourseTA, isCourseMember, isCourseManager } = props
  const [tab_value, setTabValue] = useAtom(CourseHomeAtom)
  const { mid, since } = useAccountStore()

  const changeTab = (value) => {
    switch (value) {
      case "課程":
        return (
          <BottomWrapper margin={margin}>
            <CourseInfo
              data={data}
              myJoinStatus={myJoinStatus}
              subclass={subclass}
              isCourseManager={isCourseManager}
              isCourseMember={isCourseMember}
              isCourseTA={isCourseTA}
            />
          </BottomWrapper>)
      case "學習紀錄":
        return (<BottomWrapper margin={margin}>
          <CourseLearningMap mid={mid} CourseCID={data?.cid} cid={subclass?.['學習紀錄']?.cid} since={data?.since} />
        </BottomWrapper>)
      case "討論區":
        return (<Forum
          cid={subclass?.['討論區']?.cid}
          CourseCID={data?.cid}
          isCourseManager={isCourseManager}
          isCourseMember={isCourseMember}
          isCourseTA={isCourseTA}
        />)
      default:
        return <></>
    }
  }

  useEffect(() => {
    if (myJoinStatus !== 1 && mid !== null) {
      setTabValue("課程")
    }
  }, [myJoinStatus])

  return (
    <Fragment>
      <Box sx={{ ml: margin, mr: margin }}>
        <Tabs value={tab_value} onChange={(e, value) => setTabValue(value)}>
          <Tab value="課程" label={<b>課程</b>} />
          {myJoinStatus == 1 &&
            <Tab value="學習紀錄" label={<b>學習紀錄</b>} />
          }
          {myJoinStatus == 1 &&
            <Tab value="討論區" label={<b>討論區</b>} />
          }
        </Tabs>
        <Divider />
      </Box>
      {
        changeTab(tab_value)
      }
    </Fragment>
  )
}

const BottomWrapper = ({ margin = 2, sx = {}, children }) => {
  return (
    <Box
      className="flex-1-1"
      sx={{ backgroundColor: "#fff", mt: 2, ml: margin, mr: margin, borderRadius: "10px 10px 0 0", border: "1px solid rgba(0, 0, 0, .1)", borderBottom: "0px", ...sx }}
    >
      {children}
    </Box>
  )
}

export { BottomWrapper }

const CourseInfo = (props) => {
  const { data, myJoinStatus, subclass, isCourseTA, isCourseMember, isCourseManager } = props
  const [isImgShow, setImgShow] = useState(true)
  const { isLogin } = useAccountStore()
  const { ...getCourseChapterApi } = useQuery({ queryKey: ['getCourseChapter', data?.cid, myJoinStatus], queryFn: () => getCourseChapter({ cid: data?.cid }), enabled: !!data?.cid })

  return (
    <Fragment>
      <Box sx={{ m: 2, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
        {data?.courseDes}
      </Box>
      <ToggleButtonGroup sx={{ ml: 2, mr: 2 }} size={"small"} value="">
        <Tooltip title={"顯示縮圖"}>
          <ToggleButton size='small' selected={isImgShow} value="" sx={{ p: "3px" }}
            onChange={() => {
              setImgShow(!isImgShow);
            }}><ViewList size="small" /></ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Divider sx={{ m: 2, mr: 0, ml: 0 }} />
      <LoadingWrapper query={getCourseChapterApi}>
        <Box sx={{ m: 2, whiteSpace: "pre-wrap", lineHeight: "1.5", wordWrap: "break-word", position: "relative" }}>
          {
            (getCourseChapterApi?.data || [])?.map((d, index) =>
              <ChapterBlock
                key={d?.cid}
                data={d}
                index={index}
                isImgShow={isImgShow}
                isLogin={isLogin}
                myJoinStatus={myJoinStatus}
                subclass={subclass}
                isCourseManager={isCourseManager}
                isCourseMember={isCourseMember}
                isCourseTA={isCourseTA}
              />
            )
          }
          <QuickyList
            list={(getCourseChapterApi?.data || [])}
          />
        </Box>
      </LoadingWrapper>
    </Fragment>
  )
}

const QuickyList = ({
  list
}) => {
  // 顯示章節目錄 控制
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {Array.isArray(list) && list?.map(d => {
          return (
            <a key={d?.cid} href={`#${d?.chapterName?.replaceAll(" ", "-")}`}>
              <MenuItem>{d?.chapterName}</MenuItem>
            </a>
          )
        })}
      </Menu>
      <IconButton
        sx={{ position: "sticky", bottom: "16px", right: "0px", float: "right", backgroundColor: "#f9f9f9", mt: 2, mb: 2, minWidth: "auto" }}
        onClick={handleClick}
        color={"primary"}
        component={Button}
        variant={"contained"}
      >
        <MenuOutlinedIcon />
      </IconButton>
    </Fragment>
  )
}

export { QuickyList }

const ChapterBlock = (props) => {
  const { data, index, isImgShow, isLogin, myJoinStatus, isSetting, handleAddButton, refetch, subclass, isCourseTA, isCourseMember, isCourseManager } = props
  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState("")
  const [open_list, setOpenList] = useState(false)
  const { setAlert } = useAlertStore()
  const navigate = useNavigate()

  const editCourseChapterApi = useMutation({ mutationFn: editCourseChapter, onSuccess: () => (refetch(), setEditing(false)) })
  const delCourseChapterVideoApi = useMutation({ mutationFn: delCourseChapterVideo, onSuccess: () => refetch() })
  const sortCourseChapterVideoApi = useMutation({ mutationFn: sortCourseChapterVideo, onSuccess: () => refetch() })

  useEffect(() => {
    setValue(data?.chapterDes)
  }, [data?.chapterDes])

  const handleDelButton = (d) => {
    setAlert({
      title: "刪除影片",
      content: `確定要刪除此「${d?.title}」部影片？`,
      handleAgree: (callback) => (delCourseChapterVideoApi.mutate({ ...d }), callback())
    })
  }

  const handleSortCourseVideo = (arr) => {
    let sortstr = `${arr.map((m, idx) => `${m.oid}`)}`
    sortCourseChapterVideoApi.mutate({ courseCID: data?.courseCID, cid: data?.cid, sortstr })
  }

  return (
    <Box key={data?.cid} sx={{ mt: index == 0 ? "-8px" : null }}>
      <Box className="flex jcsb aic">
        <Box className="flex aic" sx={{ cursor: "pointer" }} onClick={() => setOpenList(!open_list)}>
          <a href={`#${data?.chapterName?.replaceAll(" ", "-")}`}>
            <h3 >{data?.chapterName}</h3>
            <Box id={data?.chapterName?.replaceAll(" ", "-")} sx={{ position: "relative", top: "-128px" }} />
          </a>
          {!!isSetting &&
            <Tooltip title="展開/收合">
              <IconButton sx={{ p: "0.2px", ml: 1 }} onClick={() => setOpenList(!open_list)}>
                {open_list ? <ExpandLess fontSize='small' /> : <ExpandMore fontSize='small' />}
              </IconButton>
            </Tooltip>
          }
        </Box>
        {!!isSetting &&
          (!isEditing ?
            <Tooltip title="編輯章節內容">
              <IconButton size="small" onClick={() => setEditing(true)}>
                <Edit fontSize='small' />
              </IconButton>
            </Tooltip> :
            <Box>
              <IconButton size="small" onClick={() => editCourseChapterApi.mutate({ ...data, chapterDes: value, chapterName: null })}>
                <Done fontSize='small' color="success" />
              </IconButton>
              <IconButton size="small" onClick={() => setEditing(false)}>
                <Close fontSize='small' color="error" />
              </IconButton>
            </Box>)
        }
      </Box>
      {(!isEditing ?
        data?.chapterDes && <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: "-16px", mb: 1 }}
        >
          {data?.chapterDes}
        </Typography> :
        <TextField
          label=""
          variant="standard"
          sx={{ mt: "-16px", mb: 2, width: "100%" }}
          value={value || ""}
          placeholder='章節描述'
          onChange={(e) => setValue(e.target.value)}
          multiline
          maxRows={10}
          autoFocus
        />)
      }
      <Collapse in={!isSetting || open_list} timeout="auto" unmountOnExit>
        <VideoTable
          data={data?.items || []}
          isImgShow={isImgShow}
          isLogin={isLogin}
          myJoinStatus={myJoinStatus}
          isSetting={isSetting}
          subclass={subclass}
          handleAddButton={handleAddButton}
          handleDelButton={handleDelButton}
          handleSortCourseVideo={handleSortCourseVideo}
          onClick={(d) =>
            // !isSetting && //navigate(`/course/${d?.courseCID}/watch?v=${d?.oid}&chapter=${d?.cid}`)
            window.open(`/course/${d?.courseCID}/watch?v=${d?.oid}&chapter=${d?.cid}`, "_blank")
          }
          isCourseManager={isCourseManager}
          isCourseMember={isCourseMember}
          isCourseTA={isCourseTA}
        />
      </Collapse>
    </Box>
  )
}

const VideoTable = (props) => {
  const { data, isImgShow, isLogin, myJoinStatus, isSetting, handleAddButton, handleDelButton, handleSortCourseVideo, vid, onClick, isLoading = false, subclass,
    isCourseTA, isCourseMember, isCourseManager } = props

  const [items, setItems] = useState([]) // 變更排序用

  const sx = {
    '&:last-child td, &:last-child th': { border: 0 },
    '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
    '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "pointer", transition: "all .2s" }
  }

  useEffect(() => {
    setItems(data || [])
  }, [data])

  return (

    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <SortableContainer onSortEnd={e => onSortEnd({ ...e, items }, setItems, handleSortCourseVideo)} useDragHandle>
        <Table sx={{ minWidth: 200 }}>
          <TableHead>
            <TableRow sx={{ borderTop: "5px solid #1f1f1f;" }}>
              {data?.length == 0 && <TableCell sx={{ fontWeight: "bolder" }}>{(myJoinStatus === 2 || myJoinStatus === 0) ? "加入課程後才可顯示影片" : `此章節沒有影片`}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Array.isArray(items) && items?.map((d, index) =>
                d?.typeName == "Problem" ? // 題目
                  <SortableItem key={`item-${d?.cid}_${d?.oid}`} value={`${d?.cid}_${d?.oid}`} component={Fragment} index={index}>
                    <CodeBlock
                      key={`${d?.cid}_${d?.oid}`}
                      data={d}
                      isImgShow={isImgShow}
                      isSetting={isSetting}
                      handleDelButton={handleDelButton}
                      cid={subclass?.['解題紀錄']?.cid}
                      isPermission={!!(isCourseManager || isCourseTA)}
                    />
                  </SortableItem> : // 影片
                  <SortableItem key={`item-${d?.cid}_${d?.oid || d?.vid}`} value={`${d?.cid}_${d?.oid || d?.vid}`} component={Fragment} index={index}>
                    <CourseTableRow
                      key={`${d?.cid}_${d?.oid || d?.vid}`}
                      d={d}
                      isSetting={isSetting}
                      isImgShow={isImgShow}
                      handleDelButton={handleDelButton}
                      sx={sx}
                      vid={vid}
                      onClick={() => !isLoading && onClick(d)}
                    />
                  </SortableItem>
              )
            }
            {!!isSetting &&
              <TableRow sx={{ ...sx }}>
                <TableCell colSpan={1000} sx={{ p: 1 }} align='center' onClick={() => handleAddButton()}><Add /></TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </SortableContainer>
    </TableContainer>
  )
}

const CourseTableRow = (props) => {
  const { d, isSetting, isImgShow, handleDelButton, sx, vid, onClick } = props
  const navigate = useNavigate()

  return (
    <TableRow
      key={`${d?.cid}_${d?.oid}`}
      sx={{ ...sx, backgroundColor: (d?.oid || d?.vid) == vid ? "#e1e1e1 !important" : null }}
      onClick={onClick}
    >
      {!!isImgShow &&
        <TableCell align='center' sx={{ width: "125px", boxSizing: "border-box" }}>
          <CardMedia
            component="img"
            sx={{ height: "50px", width: "auto" }}
            image={`https://i.ytimg.com/vi/${d?.videoID}/mqdefault.jpg`}
          />
        </TableCell>
      }
      <TableCell align="left">{d?.title}</TableCell>
      {!!isSetting &&
        <TableCell align="right">
          <DragHandle />
          <IconButton size="small" onClick={() => handleDelButton(d)}>
            <Delete fontSize='small' color="error" />
          </IconButton>
        </TableCell>
      }
    </TableRow>
  )
}

export { CourseInfo, ChapterBlock, VideoTable }