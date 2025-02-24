import React, { useState, useEffect } from 'react'
import { Box, Table, TableBody, TableRow, TableCell, Avatar, Divider, Tabs, Tab, Chip, Tooltip } from '@mui/material'
import { getMemberHeatMapDetail } from 'apis'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom'
import useAccountStore from '../../../store/account'
import { MemberLearningMap } from '../course/page/LearningMap'
import { stringAvatar } from '../../Header'
import CalendarType, { array } from '../../../jsons/CalendarType'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import VideoCard from '../../elements/cards/VideoCard'
import NoteListItem from '../../elements/collection/NoteListItem'
import { sec2date } from '../../../lib/time'

export default function index(props) {
  const { margin, md, xs, content_width } = props
  const { mid, name, sso, lastLoginDT, img, since } = useAccountStore()
  let { mid: UserID } = useParams() // 由網址取得的mid

  const [select_value, setSelectValue] = useState(null)
  const [tab_value, setTabValue] = useState(array[0].name)

  const getMemberHeatMapDetailApi = useQuery({
    queryKey: ['getMemberHeatMapDetail', select_value?.date],
    queryFn: () => getMemberHeatMapDetail({ date: select_value?.date, ownerMID: UserID }),
    enabled: !!select_value?.date
  })

  const { data } = getMemberHeatMapDetailApi

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, [])

  const getCounts = (type) => {
    return ` (${(data || [])?.filter(f => f.type == type)?.length})` || " (0)"
  }

  return (
    <Box width="100%" minHeight={"100%"} sx={{ boxSizing: "border-box" }} className="flex flex-col flex-1-1">
      <Box
        sx={{
          minHeight: "200px", backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, .1)", borderRadius: "0 0 10px 10px", position: "relative",
          maxWidth: `calc(100% - ${margin} * 2)`, ml: margin, mr: margin,
        }}
        className="flex jcc aic"
      >
        <Box className={`flex flex-${!xs ? "col" : "row"}`}>
          <Box className="flex aic jcc" sx={{ p: 2, mr: 2 }}>
            <Avatar {...stringAvatar(name)} src={img} sx={{ ...(stringAvatar(name).sx), height: '100px', width: '100px' }} />
          </Box>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><b>名稱</b></TableCell>
                <TableCell>{name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>登入平台</b></TableCell>
                <TableCell>{sso}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> <b>上次登入</b></TableCell>
                <TableCell> {lastLoginDT}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
      <Box
        className="flex-1-1"
        sx={{
          backgroundColor: "#fff", mt: 2, borderRadius: "10px 10px 0 0", border: "1px solid rgba(0, 0, 0, .1)", borderBottom: "0px", boxSizing: "border-box",
          maxWidth: `calc(100% - ${margin} * 2)`, ml: margin, mr: margin,
        }}
      >
        <Box sx={{ m: 1 }}>
          <MemberLearningMap mid={UserID} onClick={(value) => setSelectValue(value)} since={since} />
        </Box>
        <Divider sx={{ mt: "0" }} />
        <LoadingWrapper query={getMemberHeatMapDetailApi}>
          <Box sx={{ m: 2, mt: 1, boxSizing: "border-box", overflow: "hidden" }}>
            <Tabs
              value={tab_value}
              onChange={(e, value) => setTabValue(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile={true}
            >
              {array.map(m =>
                <Tab key={m.type} value={m.name} label={<b>{m.name}{getCounts(m.type)}</b>} />
              )}
            </Tabs>
            <Divider />
            <Box sx={{ mt: 2 }}>
              {select_value?.date}
            </Box>
            <Box>
              {(data?.filter(f => f.type == CalendarType[tab_value]) || [])?.map(d =>
                <CalendarBlockItem key={d?.id} type={CalendarType[tab_value]} data={d} md={md} xs={xs} />
              )}
            </Box>
          </Box>
        </LoadingWrapper>
      </Box>
    </Box>
  )
}

export { CalendarBlockItem }

const CalendarBlockItem = (props) => {
  const { type, data, md, xs } = props
  const d = JSON?.parse(data?.data || "{}")
  const navigate = useNavigate()

  switch (type) {
    case 18:
      return (
        <Box sx={{ mt: 1, mb: 1 }}>
          <VideoCard
            v={d?.videoID}
            title={d?.title}
            viewCount={d?.viewCount}
            channelTitle={d?.channelTitle}
            isColumn={(!md || !xs)}
            vid={d?.vid}
            duration={data?.duration ? sec2date(data?.duration) : null}
          />
        </Box>
      )
    case 5:
      return (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Tooltip title={`${data?.action}${data?.cname}${data?.duration ? ` (筆記編輯時間 ${sec2date(data?.duration)})` : ""}`}>
            <Chip
              label={`${data?.action}${data?.cname}${data?.duration ? ` (${sec2date(data?.duration)})` : ""}`}
              sx={{ mb: 1 }}
              color={data?.action == "刪除" ? "error" : "primary"}
              size="small"
            />
          </Tooltip>
          <NoteListItem
            onClick={() => navigate(`/watch?v=${d?.vid}&n=${d?.nid}&t=${d?.startTime}`)}
            d={{ ...d, ...d?.v }}
          />
        </Box>
      )
    case 34:
      return (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Chip label={`${data?.action}${data?.cname}`} sx={{ mb: 1 }} color={data?.action == "刪除" ? "error" : "primary"} size="small" />
          <Box>
            <Link to={`/videolist/${d?.cid}`}>
              根目錄/{d?.namepath}
            </Link>
          </Box>
        </Box>
      )
    case 15:
      return (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Chip label={`${data?.action}${data?.cname}`} sx={{ mb: 1 }} color={data?.action == "刪除" ? "error" : "primary"} size="small" />
          <Box>
            <Link to={`/notelist/${d?.cid}`}>
              {d?.vListName}
            </Link>
          </Box>
        </Box>
      )
    default:
      return (
        JSON?.stringify(data)
      )
  }
}
