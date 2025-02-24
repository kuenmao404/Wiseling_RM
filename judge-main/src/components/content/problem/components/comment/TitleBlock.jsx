import React from 'react'
import { Avatar, Box, Divider, Chip } from '@mui/material'
import { ChatBubbleOutline, Visibility, ThumbUpOffAlt } from '@mui/icons-material'
import { stringAvatar } from '../../../../header'

export default function TitleBlock({
  author = "Author",
  src = null,
  date = "2024-05-30",
  title = "This is title.",
  tags = [],
  like = 0,
  view = 0,
  nC = 0,
  onClick = () => { },
  ...props
}) {

  return (
    <div className='w-full group pt-3'>
      <div className='flex cursor-pointer flex-row gap-1.5' onClick={onClick}>
        <Avatar {...stringAvatar(author)} src={src} sx={{ ...(stringAvatar(author).sx), mb: 1, mt: 1, mr: 1, width: "35px", height: "35px" }} />
        <div className='flex-1-1'>
          <Box className='text-[14px]' sx={{ color: "#0000008c" }}>
            {author}・{date}
          </Box>
          <div className='font-bold leading-5 truncate text-[14px]'>
            <span>{title}</span>
          </div>
          <div className='mt-1'>
            {Array.isArray(tags) &&
              tags?.map(d => d?.length !== 0 && <Chip key={d} label={d} size="small" sx={{ fontSize: "12px", color: "#0000008c", mr: 1 }} />)
            }
          </div>
          <Box className='mt-2 flex aic' sx={{ color: "#0000008c" }}>
            <div className='mr-4'><ThumbUpOffAlt fontSize='small' />&ensp;{like}</div>
            {/* <div className='mr-4'><Visibility fontSize='small' />&ensp;{view}</div> */}
            <div className='mr-2'><ChatBubbleOutline fontSize='small' />&ensp;{nC}</div>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </div>
      </div>
    </div>
  )
}
