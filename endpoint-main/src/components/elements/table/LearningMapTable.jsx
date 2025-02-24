import React, { Fragment } from 'react'
import { Table, TableHeadRow, TableRow, TableCell } from './Table'
import { TableBody, CardMedia, Box, Chip } from '@mui/material'
import { sec2date } from '../../../lib/time'

export default function LearningMapTable({
  data
}) {


  return (
    <Table>
      <TableHeadRow>
      </TableHeadRow>
      <TableBody>
        {Array.isArray(data) && data?.map((d, idx) => {
          switch (d?.type) {
            case 18:
              return <VideoRow key={`${d?.id}_${d?.action}_${idx}_${d?.date}`} info={d} data={JSON?.parse(d?.data || "{}")} />
            case 5:
              return <NoteRow key={`${d?.id}_${d?.action}_${idx}_${d?.date}`} info={d} data={JSON?.parse(d?.data || "{}")} />
            default:
              return null
          }
        })}
      </TableBody>
    </Table>
  )
}

const VideoRow = ({ info, data }) => {

  return (
    <TableRow>
      <TableCell sx={{ maxWidth: "150px" }}>
        <CardMedia
          component="img"
          sx={{ height: "50px", width: "auto" }}
          image={`https://i.ytimg.com/vi/${data?.videoID}/mqdefault.jpg`}
        />
      </TableCell>
      <TableCell>
        <Chip
          label={`影片觀看`}
          sx={{ mr: 1 }}
          color={info?.action == "刪除" ? "error" : "warning"}
          size="small"
        />{data?.title}
      </TableCell>
      <TableCell>
        <Box>
          <div>觀看時間：{sec2date(info?.duration || 0)}</div>
        </Box>
      </TableCell>
    </TableRow>
  )
}

const NoteRow = ({ info, data }) => {
  return (
    <TableRow>
      <TableCell sx={{ maxWidth: "150px" }}>
        <CardMedia
          component="img"
          sx={{ height: "50px", width: "auto" }}
          image={`https://i.ytimg.com/vi/${data?.videoID}/mqdefault.jpg`}
        />
      </TableCell>
      <TableCell>
        <Chip
          label={`筆記${info?.action}`}
          sx={{ mr: 1 }}
          color={info?.action == "刪除" ? "error" : info?.action == "更新" ? "info" : "success"}
          size="small"
        /><b>{data?.notebookName} - </b><span style={{ color: "#606060" }}>{data?.title}</span>
      </TableCell>
      <TableCell>
        {info?.action !== "刪除" &&
          <Box>
            <div>編輯時間：{sec2date(info?.duration || 0)}</div>
            <div>筆記長度：{data?.contentLength || 0}個字</div>
          </Box>
        }
      </TableCell>
    </TableRow>
  )
}