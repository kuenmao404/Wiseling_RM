import React from 'react'
import { CardActionArea, Card, CardContent, CardMedia, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import LinkWrapper from '../wrapper/LinkWrapper'

export default function VideoCard(props) {
  const { v, vid, title, viewCount, channelTitle, isColumn, sx, onClick = null, date, duration = null } = props

  return (
    <Card sx={{ flexShrink: 0, ...(sx || {}) }}>
      <LinkWrapper to={`/watch?v=${vid}`} className='reset-link' onClick={onClick}>
        <CardActionArea sx={{ display: "flex", flexDirection: isColumn ? "column" : "row", height: "100%" }}>
          <CardMedia
            component="img"
            sx={{ width: "300px" }}
            image={`https://i.ytimg.com/vi/${v}/mqdefault.jpg`}
          />
          <CardContent sx={{ flex: '1 1 auto' }}>
            <Typography component="div" variant="h6">
              {title || ""}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {channelTitle}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              觀看次數：{viewCount}
            </Typography>
            {!!date &&
              <Typography variant="subtitle1" color="text.secondary" component="div">
                日期：{date}
              </Typography>
            }
              {!!duration &&
              <Typography variant="subtitle1" color="text.secondary" component="div">
                總影片觀看時間：{duration}
              </Typography>
            }
          </CardContent>
        </CardActionArea>
      </LinkWrapper>
    </Card>
  )
}