import React, { Fragment, useState, useEffect } from 'react'
import { Box, Tabs, Tab, Divider, TextField, Button, Switch, Select, MenuItem, Chip, CardMedia } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import OptionTextField from '../../../elements/formitem/OptionTextField'
import { styled } from '@mui/material/styles'
import { CloudUpload } from '@mui/icons-material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getTags, editCourses } from '../../../../apis'
import useDialogStore from '../../../../store/dialog'
import Config from 'Config'
import DelCourse from '../../../elements/dialog/DelCourse'
import Member from './Member'
import FileInput from '../../../elements/formitem/FileInput'
import CourseSetting from './CourseSetting'
const { apiurl } = Config

export default function Setting(props) {
  const { margin, data, subclass, refetch, applyCount, groups, isCourseTA, isCourseMember, isCourseManager } = props
  const [tab_value, setTabValue] = useState("課程")

  const changeTab = (value) => {
    switch (value) {
      case "課程":
        return (<CourseSetting data={data} subclass={subclass} refetch={refetch} />)
      case "設定":
        return (<Settings data={data} refetch={refetch} isCourseTA={isCourseTA} isCourseManager={isCourseManager} isCourseMember={isCourseMember} />)
      case "成員管理":
        return (<Member cid={data?.cid} applyCount={applyCount} refetch={refetch} groups={groups} subclass={subclass} />)
      default:
        return <></>
    }
  }

  return (
    <Fragment>
      <Box sx={{ ml: margin, mr: margin }}>
        <Tabs
          value={tab_value}
          onChange={(e, value) => setTabValue(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="課程" label={<b>課程</b>} />
          <Tab value="設定" label={<b>設定</b>} />
          <Tab value="成員管理" label={<b>成員</b>} />
        </Tabs>
        <Divider />
      </Box>
      <Box
        className="flex-1-1"
        sx={{ backgroundColor: "#fff", mt: 2, ml: margin, mr: margin, borderRadius: "10px 10px 0 0", border: "1px solid rgba(0, 0, 0, .1)", borderBottom: "0px" }}
      >
        {
          changeTab(tab_value)
        }
      </Box>
    </Fragment>
  )
}

const Settings = (props) => {
  const { data, refetch, isCourseTA, isCourseMember, isCourseManager } = props
  const { setDialog } = useDialogStore()
  const [search_value, setSearchValue] = useState("")
  const [data_new, setData] = useState({ ...data })
  const [tags, setTags] = useState('[]')

  useEffect(() => {
    setTags(data?.tags)
    // setData(data)
  }, [])

  const handleChange = (d) => {
    setData({ ...data_new, ...d })
  }

  const addTags = (text) => {
    let new_tags = JSON.parse(tags || '[]')
    new_tags[new_tags.length] = { text }
    setSearchValue("")
    setTags(JSON.stringify(new_tags))
  }

  const delTag = (text) => {
    let new_tags = JSON.parse(tags || '[]')
    new_tags = new_tags.filter(f => f.text !== text)
    setTags(JSON.stringify(new_tags))
  }

  const handleUploadPic = (file) => {
    if (!!file) {
      let blob = URL.createObjectURL(file);
      handleChange({ pic: blob, files: [file] })
    } else {
      handleChange({ pic: null, files: null })
    }
  }

  const transTagsStr = () => {
    let str = ''
    let tags_arr = JSON.parse(tags || '[]')
    tags_arr?.map((d, idx) => {
      str += d.text + (tags_arr.length - 1 !== idx ? ' ' : "")
    })
    return str
  }

  const tags_str = transTagsStr()
  const { cid, courseName, courseDes, courseStatus, joinStatus, ownerMID, files } = data_new

  const query = useQuery({ queryKey: ['getTags', search_value], queryFn: () => getTags({ like: search_value }), enabled: search_value !== "" })
  const editCoursesApi = useMutation({ mutationFn: editCourses, onSuccess: () => refetch() })

  const handleDelButton = () => {
    setDialog({
      title: "刪除課程",
      body: <DelCourse data={data} />,
    })
  }

  return (
    <Fragment>
      <Box className="flex-1-1" sx={{ position: "relative", m: 2 }}>
        <div><b>課程名稱</b></div>
        <TextField
          label=""
          variant="standard"
          sx={{ mb: 2, width: "100%" }}
          value={data_new?.courseName || ""}
          placeholder=''
          onChange={(e) => handleChange({ courseName: e.target.value })}
          autoFocus
        />
        <div><b>課程描述</b></div>
        <TextField
          label=""
          variant="standard"
          sx={{ mb: 2, width: "100%" }}
          value={data_new?.courseDes || ""}
          placeholder=''
          onChange={(e) => handleChange({ courseDes: e.target.value })}
          multiline
          maxRows={10}
        />
        <div><b>Hashtags</b></div>
        <OptionTextField
          sx={{ mb: 1, mt: 1 }}
          value={search_value || ""}
          onChange={(value) => setSearchValue(value.replaceAll(' ', '-'))}
          handleSummit={(value) => addTags(value)}
          options={query?.data || []}
          placeholder='輸入後按Enter確認'
        />
        <Box sx={{ mb: 2 }}>
          {
            JSON.parse(tags || '[]')?.map((d, idx) =>
              <Chip key={idx} label={d?.text} onDelete={() => delTag(d?.text)} sx={{ mr: 1 }} size='small' />
            )
          }
        </Box>
        <div><b>圖片</b></div>
        <Box sx={{ mb: 2, mt: 1 }}>
          <FileInput
            onChange={(e) => handleUploadPic(e.target?.files?.[0])}
            accept="image/*"
          />
          <Box
            sx={{ height: "300px", backgroundColor: "#2d2d2d", borderRadius: "10px", position: "relative", mt: 1 }}
            className="flex jcc aic"
          >
            <Box sx={{ maxHeight: "100%", maxWidth: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} className="flex aic jcc">
              <CardMedia
                sx={{ maxHeight: "100%", maxWidth: "100%", width: "auto" }}
                component="img"
                image={data_new?.pic ? data_new?.pic : data_new?.logo ? `${apiurl}/assets?${data_new?.logo}` : '/imgs/no-image.jpg'}
              />
            </Box>
          </Box>
        </Box>
        <div><b>公開課程 (私人|公開)</b></div>
        <Switch
          sx={{ mb: 2 }}
          onChange={e => handleChange({ courseStatus: !e.target.checked ? 1 : 0 })}
          checked={(data_new.courseStatus == 0)}
        />
        {
          data_new.courseStatus !== 1 &&
          <Fragment>
            <div><b>加入狀態 (直接加入|申請加入)</b></div>
            <Select
              value={Number.isInteger(data_new?.joinStatus) ? data_new?.joinStatus : ""}
              size='small'
              sx={{ mt: 1 }}
              onChange={(e) => handleChange({ joinStatus: e.target.value })}
            >
              <MenuItem value={0}>直接加入</MenuItem>
              <MenuItem value={1}>申請加入</MenuItem>
              {/* <MenuItem value={2}>不開放</MenuItem> */}
            </Select>
          </Fragment>
        }
      </Box>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box sx={{ mb: 4, mr: 2, ml: 2 }} className="flex jcsb aic">
        <div>
          {isCourseManager &&
            <Button
              variant='contained'
              color="error"
              onClick={() => handleDelButton()}
            >
              刪除課程
            </Button>
          }
        </div>
        <LoadingButton
          variant='contained'
          onClick={() => editCoursesApi.mutate({ cid, courseName, courseDes, courseStatus, joinStatus, ownerMID, files, tags: tags_str })}
          loading={editCoursesApi.isPending}
          disabled={editCoursesApi.isPending}
        >
          修改
        </LoadingButton>
      </Box>
    </Fragment >
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