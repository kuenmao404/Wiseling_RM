import React, { Fragment, useState } from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent,
} from '@mui/lab'
import { Add } from '@mui/icons-material'
import MarkdownView from '../../elements/markdown/MarkdownView'
import { timelineItemClasses } from '@mui/lab/TimelineItem';
import { useQuery, useMutation } from '@tanstack/react-query'
import useAccountStore from '../../../store/account'
import useDialogStore from '../../../store/dialog'
import TimeLineAdd from './TimeLineAdd'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import { getTimeLine, addTimeLine, editTimeLine, delTimeLine } from '../../../apis'
import Config from 'Config'
const { mileStoneCID } = Config

export default function index({
  width,
  margin,
  // md,
}) {
  // 強制整頁式
  const md = false

  const sx = !md ? {
    [`& .${timelineItemClasses.root}:before`]: {
      flex: 0,
      padding: 0,
    },
  } : {}

  const { bOP } = useAccountStore()
  const { setDialog } = useDialogStore()

  const getTimeLineApi = useQuery({ queryKey: ['getTimeLine'], queryFn: () => getTimeLine() })
  const addTimeLineApi = useMutation({ mutationFn: addTimeLine, onSuccess: () => getTimeLineApi.refetch() })
  const editTimeLineApi = useMutation({ mutationFn: editTimeLine, onSuccess: () => getTimeLineApi.refetch() })
  const delTimeLineApi = useMutation({ mutationFn: delTimeLine, onSuccess: () => getTimeLineApi.refetch() })

  return (
    <Box sx={{ backgroundColor: "#fff", width: "100%", padding: margin }}>
      <MarkdownView source={`# Wiseling版本里程`} />
      <Timeline position={md ? "alternate" : null} sx={{ ...sx, backgroundColor: "#f9f9f9" }}>
        {!!bOP &&
          <OPTimeLineItem
            md={md}
            onClick={() => setDialog({
              title: "新增里程碑",
              body: (
                <TimeLineAdd
                  onSubmit={(d, callback) => addTimeLineApi.mutate({ ...d, cid: mileStoneCID }, { onSuccess: (d) => d?.body?.status && callback() })}
                  cid={mileStoneCID}
                />
              ),
              isRwdWidth: true,
              fullHeight: true
            })}
          />
        }
        <LoadingWrapper query={getTimeLineApi}>
          <Fragment>
            {getTimeLineApi?.data?.map(d =>
              <CustomTimeLineItem
                key={d?.date}
                date={d?.date}
                content={d?.content}
                md={md}
                onDoubleClick={() => !!bOP && setDialog({
                  title: "編輯里程碑",
                  body: (
                    <TimeLineAdd
                      date={d?.date}
                      content={d?.content}
                      onSubmit={(data, callback) => editTimeLineApi.mutate({ ...data, cid: mileStoneCID, msid: d?.msid }, { onSuccess: (d) => d?.body?.status && callback() })}
                      onDelete={({ }, callback) => delTimeLineApi.mutate({ cid: mileStoneCID, msid: d?.msid }, { onSuccess: (d) => d?.body?.status && callback() })}
                      // cid={mileStoneCID}
                    />),
                  isRwdWidth: true,
                  fullHeight: true
                })}
              />)
            }
          </Fragment>
        </LoadingWrapper>
      </Timeline>
    </Box>
  )
}

const CustomTimeLineItem = ({
  date,
  content,
  md,
  ...props
}) => {
  const [isHover, setHover] = useState(false)

  return (
    <TimelineItem onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...props}>
      {!!md &&
        <TimelineOppositeContent color="text.secondary" sx={{ color: isHover && "#000", transition: "all .4s" }}>
          {date}
        </TimelineOppositeContent>
      }
      <TimelineSeparator>
        <TimelineDot color={!isHover ? `grey` : "primary"} sx={{ transition: "all .4s" }} />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ textAlign: "left !important" }}>
        <Box sx={{ border: `1px solid rgba(0, 0, 0, ${!isHover ? ".2" : ".4"})`, backgroundColor: "#fff", borderRadius: "10px", p: 1, transition: "all .4s", boxShadow: "inset 0 -1px 0 #d1d5da" }}>
          {!md &&
            <Typography sx={{ color: isHover ? "#000" : "rgba(0, 0, 0, 0.6)", transition: "all .4s", mb: 1 }}>
              {date}
            </Typography>
          }
          <MarkdownView
            source={content}
          />
        </Box>
      </TimelineContent>
    </TimelineItem>
  )
}

const OPTimeLineItem = ({
  md,
  ...props
}) => {
  const [isHover, setHover] = useState(false)

  return (
    <TimelineItem onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...props}>
      {!!md && <TimelineOppositeContent />}
      <TimelineSeparator>
        <TimelineDot variant="outlined" color={!isHover ? `grey` : "primary"} sx={{ transition: "all .4s" }}>
          <IconButton sx={{ width: "2px", height: "2px", p: 0 }}>
            <Add sx={{ fontSize: "14px", p: 0, color: "#000", fontWeight: "bolder" }} />
          </IconButton>
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
      </TimelineContent>
    </TimelineItem>
  )
}

const data = [
  {
    date: "2024-05-10",
    content: `
## 回報問題功能
遇到系統問題時，可以打開側邊欄 → 回報問題，來回報系統錯誤！
    `
  },
  {
    date: "2024-05-09",
    content: `
## 新增Wiseling里程
因應楊松輯要求，建立了這個頁面
    `
  },
  {
    date: "2024-04-10",
    content: `
## 系統上線囉！
恭喜IT108改版系統Wiseling正式上線
    `
  },
]