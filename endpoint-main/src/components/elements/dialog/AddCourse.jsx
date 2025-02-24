import React, { Fragment, useState, useEffect } from 'react'
import { TextField, DialogContent, DialogActions, Button, Box, IconButton, Divider, Switch, Chip, Select, MenuItem, InputLabel } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { CloudUpload } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import CourseCard from '../cards/CourseCard'
import OptionTextField from '../formitem/OptionTextField'
import { getTags, addCourses } from '../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import useAccountStore from '../../../store/account'
import useDialogStore from '../../../store/dialog'

export default function AddCourse(props) {
  const { refetch } = props
  const { name } = useAccountStore()
  const { handleClose } = useDialogStore()
  const [data, setData] = useState({ name, courseName: "", courseDes: "", courseStatus: 0, nObject: 0, joinStatus: 0 })
  const [search_value, setSearchValue] = useState("")
  const [tags, setTags] = useState('[]')

  const handleChange = (d) => {
    setData({ ...data, ...d })
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
    let blob = URL.createObjectURL(file);
    handleChange({ pic: blob, files: [file] })
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

  const query = useQuery({ queryKey: ['getTags', search_value], queryFn: () => getTags({ like: search_value }), enabled: search_value !== "" })
  const addCoursesApi = useMutation({ mutationFn: addCourses, onSuccess: (data) => !!data?.body?.status && (handleClose(), refetch()) })

  return (
    <Fragment>
      <DialogContent dividers className='flex flex-row fww jcsb'>
        <Box className="flex-1-1" sx={{ position: "relative", pr: 2 }}>
          <div><b>課程名稱</b></div>
          <TextField
            label=""
            variant="standard"
            sx={{ mb: 2, width: "100%" }}
            value={data?.courseName || ""}
            placeholder=''
            onChange={(e) => handleChange({ courseName: e.target.value })}
            autoFocus
          />
          <div><b>課程描述</b></div>
          <TextField
            label=""
            variant="standard"
            sx={{ mb: 2, width: "100%" }}
            value={data?.courseDes || ""}
            placeholder=''
            onChange={(e) => handleChange({ courseDes: e.target.value })}
            multiline
            maxRows={4}
          />
          <div><b>Hashtags</b></div>
          <OptionTextField
            sx={{ mb: 1, mt: 1 }}
            value={search_value}
            onChange={(value) => setSearchValue(value.replaceAll(' ', '-'))}
            handleSummit={(value) => addTags(value)}
            options={query?.data || []}
            placeholder='輸入後按Enter確認'
          />
          <Box sx={{ mb: 2 }}>
            {
              JSON.parse(tags || '[]')?.map((d, idx) =>
                <Chip key={idx} label={d?.text} onDelete={() => delTag(d?.text)} />
              )
            }
          </Box>
          <div><b>圖片</b></div>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Button component="label" variant="contained" startIcon={<CloudUpload />}>
              上傳封面圖片
              <VisuallyHiddenInput type="file" onChange={(e) => handleUploadPic(e.target?.files?.[0])} />
            </Button>
          </Box>
          <div><b>公開課程 (私人|公開)</b></div>
          <Switch onChange={e => handleChange({ courseStatus: !e.target.checked ? 1 : 0 })} checked={(data.courseStatus == 0)} />
          <div><b>加入狀態 (直接加入|申請加入)</b></div>
          <Select
            value={data?.joinStatus}
            size='small'
            sx={{ mt: 1 }}
            onChange={(e) => handleChange({ joinStatus: e.target.value })}
          >
            <MenuItem value={0}>直接加入</MenuItem>
            <MenuItem value={1}>申請加入</MenuItem>
            {/* <MenuItem value={2}>不開放</MenuItem> */}
          </Select>
        </Box>
        <CourseCard
          sx={{ maxWidth: "100%" }}
          data={{ ...data, tags: tags || "[]" }}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => addCoursesApi.mutate({ ...data, des: data?.cdes || "", tags: tags_str })}
          loading={addCoursesApi.isPending}
          disabled={addCoursesApi.isPending}
        >
          建立
        </LoadingButton>
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