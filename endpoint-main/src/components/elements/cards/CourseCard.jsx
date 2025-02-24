import React from 'react'
import { CardActionArea, Card, CardContent, CardMedia, Typography, Divider, Box, IconButton } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import useDialogStore from '../../../store/dialog'
import useAccountStore from '../../../store/account'
import MarkdownView from '../markdown/MarkdownView'
import { Lock, Public } from '@mui/icons-material'
import Config from 'Config'
const { apiurl } = Config

export default function CourseCard(props) {
  const { sx = {}, data, onClick } = props
  const { setDialog } = useDialogStore()
  const { mid } = useAccountStore()

  const tags = JSON.parse(data?.tags || '[]')

  const checkTags = (data) => {
    setDialog({
      title: "HashTags",
      content: (
        <Box width={250}>
          {data.map(d => <Box key={d.tid} sx={{ color: "#038aed", mb: 1 }}><span>#{d?.text}</span></Box>)}
        </Box>
      )
    })
  }

  const checkContent = (des) => {
    setDialog({
      title: "課程介紹",
      content: (
        <Box width={400} sx={{ maxWidth: "100%", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
          {des}
        </Box>
      )
    })
  }

  const handleClick = () => {
    onClick?.()
  }

  const icon_props = {
    color: "white", position: "absolute", top: "7px", left: "7px", backgroundColor: "rgba(0, 0, 0, .7)", padding: "3px", borderRadius: "50%",
    fontSize: "15px"
  }

  return (
    <Card sx={{ width: 300, flexShrink: 0, display: "flex", ...sx }}>
      <CardActionArea sx={{ flex: "1 1 auto", display: "flex", position: "relative" }} className='flex-col' onClick={() => handleClick?.()}>
        {!data?.courseStatus ? <Public sx={icon_props} fontSize='small' /> : <Lock sx={icon_props} fontSize='small' />}
        <Box sx={{ height: "45%", width: "100%", minHeight: "100px", backgroundColor: "#2d2d2d" }} className="flex jcc">
          <Box sx={{ maxHeight: "100%", maxWidth: "100%" }} className="flex aic jcc">
            <CardMedia
              sx={{ maxHeight: "100%", maxWidth: "100%" }}
              component="img"
              image={data?.logo ? `${apiurl}/assets?${data?.logo}` : data?.pic ? data?.pic : '/imgs/no-image.jpg'}
              alt={`${data?.courseName}}封面圖`}
            />
          </Box>
        </Box>
        <Divider sx={{ width: "100%" }} />
        <CardContent sx={{ p: 1, width: "100%", boxSizing: "border-box", backgroundColor: data?.ownerMID == mid ? "#f6fdff" : null }} className='flex-1-1 flex flex-col aifs'>
          <Box className="flex jcsb">
            <Box sx={{ color: "#038aed", overflow: "hidden" }} className="max-line-1">
              {(tags || [])?.map((d, idx) =>
                <span key={idx}>
                  <Typography variant="span" sx={{ "&:hover": { textDecoration: "underline" } }}>#{d?.text}</Typography>&ensp;
                </span>)}
            </Box>
            <Box sx={{ fontWeight: "bolder" }} onClick={(e) => (e.stopPropagation(), checkTags(tags))}>
              ...
            </Box>
          </Box>
          <Typography gutterBottom variant="h6" sx={{ fontSize: "18px" }} component="div" className='max-line-2'>
            <b>{data?.courseName}</b>
          </Typography>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              className='max-line-3'
              sx={{ mb: "55px", "&:hover": { textDecoration: "underline" } }}
              onClick={(e) => (e.stopPropagation(), checkContent(data?.courseDes))}
            >
              {data?.courseDes}
            </Typography>
          </Box>

          <Box className="flex-1-1" />
          <Box className="flex jcsb">
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: "1px" }}>{data?.since}</Typography>
              <div>建立者：{data?.name}</div>
            </Box>
            <Box className="flex flex-col aie jce">
              <div><Typography variant="span">{data?.nObject}</Typography> 位成員</div>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
