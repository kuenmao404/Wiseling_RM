import React, { Fragment, useState } from 'react'
import { Box, Select, InputLabel, FormControl, MenuItem, Button, Divider, Tabs, Tab } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getCourses, getMidCourse } from '../../../apis'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import CourseCard from '../../elements/cards/CourseCard'
import SearchBar from '../../elements/formitem/SearchBar'
import { Route, Routes, useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import useAccountStore from '../../../store/account'
import useDialogStore from '../../../store/dialog'
import AddCourse from '../../elements/dialog/AddCourse'
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const courseStatusAtom = atomWithStorage("courseStatus", 1)

export default function Courses(props) {
  const { content_width, width, margin, data, width_margin, xs } = props
  const { isLogin } = useAccountStore()
  const { setDialog } = useDialogStore()
  const [courseStatus, setCourseStatus] = useAtom(courseStatusAtom)
  const [value, setValue] = useState(null)
  const [search_value, setSearchValue] = useState(null)

  const navigate = useNavigate()

  const getMidCourseApi = useQuery({
    queryKey: ["getMidCourse", courseStatus, search_value],
    queryFn: () => getMidCourse({ order: "nObject_d", like: search_value, like_column: "courseName" }),
    enabled: courseStatus == 0 && !!isLogin
  })
  const getCoursesApi = useQuery({
    queryKey: ["getCourses", courseStatus, search_value],
    queryFn: () => getCourses({
      courseStatus: null, order: "nObject_d", like: search_value, like_column: "courseName"
    }),
    enabled: courseStatus == 1 || !isLogin
  })

  const openAddCourseDialog = () => {
    setDialog({
      title: "建立課程",
      body: <AddCourse refetch={getCoursesApi.refetch} />,
      isRwdWidth: true,
    })
  }

  const map_data = (courseStatus == 0 && !!isLogin) ? getMidCourseApi?.data : (courseStatus == 1 || !isLogin) ? getCoursesApi?.data : null

  return (
    <Fragment>
      <Box sx={{ width: "100%", m: margin, mb: 0 }}>
        <SearchBar
          value={value || ""}
          onChange={value => setValue(value)}
          onKeyDown={e => e.keyCode == 13 && setSearchValue(e.target.value)}
          placeholder={"搜尋課程..."}
          handleSummit={(value) => setSearchValue(value)}
          autoFocus={true}
        />
        {
          isLogin &&
          <Box sx={{ width: "100%", mt: margin }} className="flex jcsb aic">
            <Tabs
              value={courseStatus}
              onChange={(e, value) => setCourseStatus(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: "32px" }}
            >
              <Tab label={"已加入"} sx={{ minHeight: "32px" }} />
              <Tab label={"全部"} sx={{ minHeight: "32px" }} />
            </Tabs>
            <Button variant="contained" color="success" onClick={() => openAddCourseDialog()}>
              {xs ? "建立課程" : <AddIcon />}
            </Button>
          </Box>
        }
        {search_value &&
          <Fragment>
            <Box sx={{ m: 2, ml: 0, mr: 0, fontSize: "14px" }} className="flex jcsb aic">
              <div>
                「{search_value}」的查詢結果...
              </div>
              <Button variant='outlined' size='small' onClick={() => (setValue(null), setSearchValue(null))} sx={{ p: 0 }}>清除</Button>
            </Box>
            <Divider sx={{ mb: 0 }} />
          </Fragment>
        }
      </Box>
      <LoadingWrapper query={{ isLoading: getCoursesApi?.isLoading || getMidCourseApi?.isLoading }}>
        <Box width={"100%"} className="flex fww">
          {
            Array.isArray(map_data) && map_data?.map(d =>
              <CourseCard
                key={d.cid}
                sx={{ width: width_margin, margin }}
                data={d}
                onClick={() => navigate(`/course/${d?.cid}`)}
              />)
          }
        </Box>
      </LoadingWrapper>
    </Fragment>
  )
}
