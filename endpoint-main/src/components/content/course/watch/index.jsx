import React, { useState, useEffect, useRef, Fragment } from 'react'
import { Box, useMediaQuery, Divider, Button } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'

import useAccountStore from '../../../../store/account'

import { getCourse, getVideoInfo } from '../../../../apis'
import SwipeLine from '../../watch/SwipeLine'
import Playlist from './Playlist'
import NoteWrapper from './NoteWrapper'
import VideoPlayerInfo from '../../../elements/watch/VideoPlayerInfo'
import { ProblemBlock, WatchWrapper } from '../../watch'
import { TabGroup } from '../../../elements/tabs'
import Comments from '../../watch/comments'

import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { mobileNoteOpenAtom } from '../../watch/Watch'

import Config from 'Config'
const { autoPlay } = Config

const init_width = 450

const courseWidthAtom = atomWithStorage("course_width", init_width)

function index() {
  const { isLogin } = useAccountStore()
  const { cid } = useParams()
  const [searchParams] = useSearchParams()
  const v = searchParams.get('v')

  const getVideoInfoApi = useQuery({ queryKey: ['getVideoInfo', v], queryFn: () => getVideoInfo({ vid: v }), enabled: !!v })
  const { videoID } = getVideoInfoApi?.data || {}

  const getCourseApi = useQuery({ queryKey: ['getCourse', cid, isLogin], queryFn: () => getCourse({ cid }), enabled: !Number.isInteger(cid) && isLogin !== null })
  const { course, subclass, permission, applyCount } = (getCourseApi?.data || {})

  return (
    <Box className="flex flex-1-1">
      <WatchWrapper videoID={videoID}>
        <WatchContent
          getCourseApi={getCourseApi}
          getVideoInfoApi={getVideoInfoApi}
          {...(getVideoInfoApi?.data || {})}
        />
      </WatchWrapper>
    </Box>
  )
}

export default index

const WatchContent = ({
  player = null,
  title,
  viewCount,
  problem,
  query,
  setVideoLastSecApi,
  getVideoInfoApi,
  getCourseApi,
}) => {
  const [searchParams] = useSearchParams()
  const chapter = searchParams.get('chapter'), v = searchParams.get('v'), note_cid = searchParams.get('cid') ?? null
  const { cid } = useParams()
  const { permission, subclass } = (getCourseApi?.data || {})
  const { isLogin } = useAccountStore()

  const [isSwipe, setSwipe] = useState(false)
  const [width, setWidth] = useAtom(courseWidthAtom)
  const [close, setClose] = useState(false)

  const changeArr2Obj = (arr = [], key) => {
    const obj = {}
    arr?.map(d => {
      obj[d[key]] = d
    })
    return obj
  }

  // rwd 控制筆記打開收合模式
  const xs = useMediaQuery('(min-width:500px)')
  const [mobileNoteOpen, setMobileNoteOpen] = useAtom(mobileNoteOpenAtom)


  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // 加入 resize 事件監聽器
    window.addEventListener("resize", handleResize);

    // 清理事件監聽器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  console.log(mobileNoteOpen, xs, (!mobileNoteOpen || !!xs), !xs && !!mobileNoteOpen)

  return (
    <Fragment>
      <Box className="flex-1-1" sx={{ position: "relative" }}>
        <Box sx={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0, overflow: "auto" }}>
          <VideoPlayerInfo isSwipe={isSwipe} title={title} viewCount={viewCount} onlyPlayer={!!mobileNoteOpen} />
          {(!mobileNoteOpen || !!xs) &&
            <Fragment>
              {!getCourseApi?.isLoading &&
                <Playlist cid={cid} chapter={chapter} vid={v} width={close ? 0 : width}
                  courseName={getCourseApi?.data?.course?.courseName}
                  isLoading={getVideoInfoApi?.isFetching || query?.isFetching || setVideoLastSecApi?.isPending}
                />
              }
              <TabGroup tabs={["討論區", '程式解題']} sx={{ mr: 2, ml: 2 }} id={"watch_tab"}>
                <Comments vid={v} />
                <ProblemBlock problem={JSON.parse(problem || "{}")} />
              </TabGroup>
              <br />
              <br />
              {!xs &&
                <Box sx={{ width: "100%", position: "fixed", bottom: 0 }}>
                  <Divider />
                  <Box
                    sx={{ height: "20px" }} component={Button} variant={"contained"}
                    fullWidth className="flex jcc aic" onClick={() => setMobileNoteOpen(!mobileNoteOpen)}
                  >
                    {!!mobileNoteOpen ?
                      <ArrowDropDownIcon /> :
                      <ArrowDropUpIcon />
                    }
                  </Box>
                </Box>
              }
            </Fragment>
          }
          {!xs && !!mobileNoteOpen && // RWD 手機板 < 500 width && 使用者把筆記頁面打開 (預設開啟)
            <Box sx={{ height: `calc((100vh - 64px) - ${screenWidth * 219.41 / 414}px)`, overflow: "auto" }} className="flex flex-col">
              {!xs &&
                <Fragment>
                  <Divider />
                  <Box sx={{ height: "20px" }} component={Button} fullWidth className="flex jcc aic" onClick={() => setMobileNoteOpen(!mobileNoteOpen)}>
                    {!!mobileNoteOpen ?
                      <ArrowDropDownIcon /> :
                      <ArrowDropUpIcon />
                    }
                  </Box>
                  <Divider />
                </Fragment>
              }
              {(!query.isFetching || !isLogin) ?
                <NoteWrapper
                  player={player}
                  sx={{ position: "relative", flex: "1 1 auto" }}
                  vid={v}
                  chapter={chapter}
                  permission={permission}
                  subclass={changeArr2Obj(subclass, 'cname')}
                  cid={cid}
                  note_cid={note_cid}
                /> :
                <Box sx={{ position: "relative" }} />
              }
            </Box>
          }
        </Box>
      </Box>
      {!!xs &&
        <Fragment>
          {/** x < 200 ? 200 : x */}
          <SwipeLine getPosition={x => (setWidth(x))} setSwipe={setSwipe} isSwipe={isSwipe} width={width} setClose={() => setClose(!close)} close={close} />
          {
            (!query.isFetching || !isLogin) ?
              <NoteWrapper
                player={player}
                sx={{ width: `${width}px`, position: "relative", display: !!close ? "none" : "flex" }}
                vid={v}
                chapter={chapter}
                permission={permission}
                subclass={changeArr2Obj(subclass, 'cname')}
                cid={cid}
                note_cid={note_cid}
              /> :
              <Box sx={{ width: `${width}px`, position: "relative", display: !!close ? "none" : "flex" }} />
          }
        </Fragment>
      }
    </Fragment>
  )
}