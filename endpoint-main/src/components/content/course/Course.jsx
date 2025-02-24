import React, { Fragment, useEffect } from 'react'
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Box, CardMedia, Typography, Divider, Tabs, Tab, IconButton, Button, Tooltip } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Settings } from '@mui/icons-material'
import HomeIcon from '@mui/icons-material/Home'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getCourse, applyCourse, cancelApplyCourse, quitMidCourse, getCourseGroups } from '../../../apis'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import Config from 'Config'
import Home from './page/Home'
import Setting from './page/Setting'
import MemberShow from './dialog/MemberShow'
import useDialogStore from '../../../store/dialog'
import useAccountStore from '../../../store/account'
import useAlertStore from '../../../store/alert'
import ApplyMemberList from './dialog/ApplyMemberList'
const { apiurl } = Config

export default function Course(props) {
  const { margin, setTitle } = props
  let params = useParams()
  let location = useLocation()
  const { cid } = params
  const { setDialog } = useDialogStore()
  const { isLogin, mid } = useAccountStore()
  const { setAlert } = useAlertStore()

  const { data, ...query } = useQuery({ queryKey: ["getCourse", cid, isLogin], queryFn: () => getCourse({ cid }), enabled: !Number.isInteger(cid) && isLogin !== null && mid !== null })
  const getCourseGroupsApi = useQuery({ queryKey: ['getCourseGroups', cid, isLogin], queryFn: () => getCourseGroups({ courseCID: cid }), enabled: !!isLogin })

  const { course, subclass, permission, applyCount } = (data || {})

  const applyCourseApi = useMutation({ mutationFn: applyCourse, onSuccess: () => { query.refetch() } })
  const cancelApplyCourseApi = useMutation({ mutationFn: cancelApplyCourse, onSuccess: () => { query.refetch() } })
  const quitMidCourseApi = useMutation({ mutationFn: quitMidCourse, onSuccess: () => { query.refetch() } })

  const changeArr2Obj = (arr = [], key) => {
    const obj = {}
    arr?.map(d => {
      obj[d[key]] = d
    })
    return obj
  }

  const handleMemberView = () => {
    setDialog({
      title: "成員列表",
      content: permission?.myJoinStatus == 1 ? <MemberShow cid={cid} /> : <Box>加入課程後即可查看成員列表</Box>,
      isRwdWidth: true
    })
  }

  const handleApplyDialog = () => {
    setDialog({
      title: "申請中的成員",
      content: <ApplyMemberList cid={cid} refetch={() => (query.refetch())} />,
      isRwdWidth: true,
    })
  }

  const handleQuitCourse = () => {
    setAlert({
      title: "退出課程",
      content: `確定要退出此「${course?.courseName}」課程？`,
      handleAgree: (callback) => quitMidCourseApi.mutate({ courseCID: course?.cid }, { onSuccess: () => callback() }),
    })
  }

  const checkSettingPermission = (permission) => {
    return (permission?.isCourseManager || permission?.isCourseTA)
  }

  useEffect(() => {
    !!course?.courseName && setTitle(`${course?.courseName} - WiseLing`)
    return () => {
      setTitle(null)
    }
  }, [course?.courseName])

  return (
    <LoadingWrapper query={query}>
      <Box width="100%" minHeight={"100%"} className="flex flex-col flex-1-1">
        <Box
          sx={{ height: "300px", backgroundColor: "#2d2d2d", borderRadius: "0 0 10px 10px", ml: margin, mr: margin, position: "relative" }}
          className="flex jcc aic"
        >
          <Box sx={{ maxHeight: "100%", maxWidth: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} className="flex aic jcc">
            <CardMedia
              sx={{ maxHeight: "100%", maxWidth: "100%", width: "auto" }}
              component="img"
              image={course?.logo ? `${apiurl}/assets?${course?.logo}` : course?.pic ? course?.pic : '/imgs/no-image.jpg'}
            />
          </Box>
        </Box>
        <Box sx={{ ml: margin, mr: margin }}>
          <Box sx={{ mb: "-15px" }} className="flex jcsb aic">
            <h1>{course?.courseName}</h1>
            <Routes>
              {!!checkSettingPermission(permission) &&
                <Route
                  path="/"
                  element={
                    <Tooltip title="後台">
                      <Link style={{ marginLeft: "8px" }} to={`/course/${cid}/setting`}>
                        <IconButton>
                          <Settings />
                        </IconButton>
                      </Link>
                    </Tooltip>
                  }
                />
              }
              <Route
                path="setting"
                element={
                  <Tooltip title="首頁">
                    <Link style={{ marginLeft: "8px" }} to={`/course/${cid}`}>
                      <IconButton>
                        <HomeIcon />
                      </IconButton>
                    </Link>
                  </Tooltip>
                }
              />
            </Routes>
          </Box>
          <Box className="flex jcsb aic flex-row fww" sx={{ mb: 1 }}>
            <Box className="flex-1-1">
              <Box sx={{ color: "#038aed", mb: 1, fontSize: "14px" }} className="max-line-1">
                {JSON.parse(course?.tags || '[]')?.map((d, idx) =>
                  <span key={idx}>
                    <Typography variant="span" sx={{ "&:hover": { textDecoration: "underline" } }}>#{d?.text}</Typography>&ensp;
                  </span>)}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {convertJoinStatus(course?.joinStatus)} · <Typography
                  variant="span"
                  sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer" }}
                  onClick={() => handleMemberView()}
                >
                  <b>{course?.nObject} 位成員</b>
                </Typography>
                {
                  checkSettingPermission(permission) &&
                  <Fragment>
                    &ensp;
                    <Typography
                      variant="span"
                      sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer" }}
                      onClick={() => handleApplyDialog()}
                    >{!!applyCount && <b>({applyCount} 位申請中)</b>}</Typography>
                  </Fragment>
                }
              </Typography>
            </Box>
            {!!isLogin && (!(permission?.isCourseManager || permission?.isCourseTA || permission?.isCourseMember) ?
              <LoadingButton
                variant='contained'
                color={permission?.myJoinStatus == 0 ? "error" : "primary"}
                onClick={() => permission?.myJoinStatus == 0 ? cancelApplyCourseApi.mutate({ cid: course?.cid }) : applyCourseApi.mutate({ cid: course?.cid })}
                loading={applyCourseApi.isPending || cancelApplyCourseApi.isPending}
                disabled={applyCourseApi.isPending || cancelApplyCourseApi.isPending}
              >
                {permission?.myJoinStatus == 0 ? "取消申請" : "加入課程"}
              </LoadingButton> :
              course?.ownerMID !== mid && <LoadingButton
                variant='contained'
                color={"error"}
                onClick={() => handleQuitCourse()}
                loading={quitMidCourseApi.isPending}
                disabled={quitMidCourseApi.isPending}
              >
                退出課程
              </LoadingButton>)
            }
          </Box>
        </Box>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                data={course}
                margin={margin}
                myJoinStatus={permission?.myJoinStatus}
                subclass={changeArr2Obj(subclass, 'cname')}
                isCourseManager={permission?.isCourseManager}
                isCourseMember={permission?.isCourseMember}
                isCourseTA={permission?.isCourseTA}
              />
            }
          />
          {!!checkSettingPermission(permission) &&
            <Route path="setting" element={
              <Setting
                margin={margin}
                data={course}
                subclass={changeArr2Obj(subclass, 'cname')}
                refetch={query.refetch}
                applyCount={applyCount}
                groups={getCourseGroupsApi?.data}
                isCourseManager={permission?.isCourseManager}
                isCourseMember={permission?.isCourseMember}
                isCourseTA={permission?.isCourseTA}
              />
            } />
          }
        </Routes>
      </Box>
    </LoadingWrapper >
  )
}

const convertJoinStatus = (status) => {
  switch (status) {
    case 0:
      return "直接加入"
    case 1:
      return "申請加入"
    case 2:
      return "不開放"
    default:
      return ""
  }
}