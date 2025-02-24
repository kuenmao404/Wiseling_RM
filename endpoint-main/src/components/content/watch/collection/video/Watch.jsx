import React, { Fragment, useState } from 'react'
import { Box } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import VideoPlayerInfo from '../../../../elements/watch/VideoPlayerInfo'
import useAccountStore from '../../../../../store/account'
import SwipeLine from '../../SwipeLine'
import NoteWrapper from './NoteWrapper'
import Playlist from './Playlist'
import FolderPlaylist from './FolderPlaylist'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../../elements/Resizable'
import { TabGroup } from '../../../../elements/tabs'
import Comments from '../../comments'

const init_width = 450

export default function Watch(props) {
  const { title, viewCount, query, player, player_state, ProblemBlock, isLoading } = props

  const [searchParams] = useSearchParams()
  const [width, setWidth] = useState(init_width)
  const [isSwipe, setSwipe] = useState(false)
  const [close, setClose] = useState(false)
  const { isLogin } = useAccountStore()
  const [isColHandleDragging, setIsColHandleDragging] = useState(false);

  const v = searchParams.get('v')
  const t = searchParams.get('t')
  const mode = searchParams.get('mode')
  const list = searchParams.get('list')
  const p = searchParams.get('p')
  const cid = searchParams.get('cid')
  const n = searchParams.get('n')

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal" className="" autoSaveId={"watch_width"}>
        <ResizablePanel className="" defaultSize={60}>
          <Box className="flex-1-1" sx={{ overflow: "auto", height: "100%" }}>
            <VideoPlayerInfo isSwipe={isSwipe} title={title} viewCount={viewCount} />
            <Box sx={{ ml: 2, mr: 2 }}>
              {/* <Playlist
                width={width}
                vid={v}
                cid={list}
                paragraphCID={p}
                player_state={player_state}
                isLoading={isLoading}
              /> */}
              <FolderPlaylist
                width={width}
                vid={v}
                notebook_cid={n}
                cid={list}
                paragraphCID={p}
                player_state={player_state}
                isLoading={isLoading}
              />
            </Box>
            <TabGroup tabs={['程式解題', "討論區"]} sx={{ mr: 2, ml: 2 }} id={"watch_tab"}>
              {ProblemBlock}
              <Comments vid={v} />
            </TabGroup>
            <br />
            <br />
          </Box>
        </ResizablePanel>
        <ResizableHandle
          onDragging={setIsColHandleDragging}
          withHandle
          style={{ width: "0.25rem" }}
          className={isColHandleDragging ? "bg-blue-500" : ""}
        />
        <ResizablePanel className="flex flex-1-1" defaultSize={40}>
          {(!query.isFetching || !isLogin) ?
            <NoteWrapper
              player={player}
              sx={{ position: "relative", display: !!close ? "none" : "flex" }}
              vid={v}
              cid={cid}
            /> :
            <Box sx={{ position: "relative", display: !!close ? "none" : "flex" }}>
            </Box>
          }
        </ResizablePanel>
        {/* <SwipeLine getPosition={x => (setWidth(x < 200 ? 200 : x))} setSwipe={setSwipe} isSwipe={isSwipe} close={close} setClose={() => setClose(!close)} /> */}
      </ResizablePanelGroup>
    </Fragment>
  )
}
