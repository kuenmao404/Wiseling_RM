import React from 'react'
import { CardActionArea, Card, CardContent, CardMedia, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function NoteCard(props) {
  const { sx, videoId, vid, title, content, lastModifiedDT, cid } = props

  return (
    <Card sx={{ width: 300, flexShrink: 0, display: "flex", ...sx }}>
      <Link to={`/watch?v=${vid}${!!cid ? `&cid=${cid}` : ""}`} className='reset-link flex-1-1 flex'>
        <CardActionArea sx={{ flex: "1 1 auto", display: "flex" }} className='flex-col'>
          <CardMedia
            component="img"
            image={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          />
          <CardContent sx={{ p: 1, boxSizing: "border-box", width: "100%" }} className='flex flex-col flex-1-1'>
            <Typography gutterBottom variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: "20px" }} className='flex-1-1'>
              {content}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上次編輯：{lastModifiedDT}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card >
  )
}
