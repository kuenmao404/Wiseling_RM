import React, { useEffect, Fragment, useState } from 'react'
import { Box, Typography, Divider, useMediaQuery, Button } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon } from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import { useAtom, atom } from 'jotai'

import NoteWrapper from './NoteWrapper'
import useAccountStore from '../../../store/account'
import VideoPlayerInfo from '../../elements/watch/VideoPlayerInfo'
import Comments from './comments'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../elements/Resizable'
import { TabGroup } from '../../elements/tabs'

export const mobileNoteOpenAtom = atom(true)

function Watch(props) {
  const { title, viewCount, query, player, ProblemBlock } = props

  const [searchParams] = useSearchParams()
  const [isSwipe, setSwipe] = useState(false)
  const [close, setClose] = useState(false)
  const { isLogin } = useAccountStore(state => state)

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

  const [isColHandleDragging, setIsColHandleDragging] = useState(false);

  const v = searchParams.get('v')
  const t = searchParams.get('t')
  const mode = searchParams.get('mode')

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal" className="" autoSaveId={"watch_width"}>
        <ResizablePanel className="" defaultSize={60}>
          <Box className="flex-1-1 relative" sx={{ overflow: "auto", height: "100%" }}>
            <VideoPlayerInfo isSwipe={isSwipe} title={title} viewCount={viewCount} onlyPlayer={!!mobileNoteOpen} />
            {(!mobileNoteOpen || !!xs) &&
              <Fragment>
                <TabGroup tabs={["討論區", '程式解題']} sx={{ mr: 2, ml: 2 }} id={"watch_tab"}>
                  <Comments vid={v} />
                  {ProblemBlock}
                </TabGroup>
                {!xs &&
                  <Box sx={{ width: "100%", position: "fixed", bottom: 0 }}>
                    <Divider />
                    <Box sx={{ height: "20px" }} component={Button} variant={"contained"} fullWidth className="flex jcc aic" onClick={() => setMobileNoteOpen(!mobileNoteOpen)}>
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
                {!!isLogin && !mode ? (
                  !query.isFetching ?
                    <NoteWrapper width={"100%"} player={player} sx={{ display: "flex", overflow: "auto", flex: "1 1 auto" }} t={t} /> :
                    <Box></Box>) :
                  !mode && <Box sx={{ width: `100%`, position: "relative", p: 1, pt: 2 }} className="flex jcc flex-1-1">登入解鎖筆記功能</Box>
                }
              </Box>
            }
          </Box>
        </ResizablePanel>
        {!!xs &&
          <Fragment>
            <ResizableHandle
              onDragging={setIsColHandleDragging}
              withHandle
              style={{ width: "0.25rem" }}
              className={isColHandleDragging ? "bg-blue-500" : ""}
            />
            <ResizablePanel className="flex flex-1-1" defaultSize={40} >
              {!!isLogin && !mode ? (
                !query.isFetching ?
                  <NoteWrapper width={"100%"} player={player} sx={{ display: "flex" }} t={t} /> :
                  <Box></Box>) :
                !mode && <Box sx={{ width: `100%`, position: "relative", p: 1, pt: 2 }} className="flex jcc">登入解鎖筆記功能</Box>
              }
            </ResizablePanel>
          </Fragment>
        }
      </ResizablePanelGroup>
    </Fragment>
  )
}

export default Watch