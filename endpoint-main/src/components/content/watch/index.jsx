import React, { useEffect, Fragment, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import useAppStore from '../../../store/app'
import useAccountStore from '../../../store/account'
import useWatchStore from '../../../store/watch'
import useAlertStore from '../../../store/alert'
import { setVideoHistory, getVideoInfo, setVideoLastSec } from '../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Box, Typography, duration } from '@mui/material'
import YoutubeApi from './YoutubeApi'
import Watch from './Watch'
import VideoWatch from './collection/video/Watch'
import NoteWatch from './collection/note/Watch'
import CodeList, { CodeBlock } from '../../elements/code/CodeList'
import Prompt, { Beforeunload } from '../../../lib/Prompt'
import Config from 'Config'
const { autoPlay } = Config

function index({ setTitle }) {
  const [searchParams] = useSearchParams()
  const v = searchParams.get('v')

  const getVideoInfoApi = useQuery({ queryKey: ['getVideoInfo', v], queryFn: () => getVideoInfo({ vid: v }), enabled: !!v })
  const { videoID, title } = getVideoInfoApi?.data || {}

  useEffect(() => {
    setTitle(`${title} - WiseLing`)
    return () => {
      setTitle(null)
    }
  }, [title])

  return (
    <WatchWrapper videoID={videoID}>
      <WatchContent {...(getVideoInfoApi?.data || {})} />
    </WatchWrapper>
  )
}

const WatchContent = ({
  player = null,
  title,
  viewCount,
  problem,
  query,
  setVideoLastSecApi,
  getVideoInfoApi,
  player_state,
}) => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  return (
    <Box className="flex-1-1" sx={{ overflow: "hidden", position: 'relative' }}>
      <Box
        sx={{
          top: 0, bottom: 0, left: 0, right: 0, position: "absolute"
        }}
      >
        {!!mode && mode === 'v' &&
          <VideoWatch
            title={title}
            viewCount={viewCount}
            query={query}
            player={player}
            player_state={player_state}
            ProblemBlock={<ProblemBlock problem={JSON.parse(problem || "{}")} />}
            isLoading={setVideoLastSecApi?.isPending || getVideoInfoApi?.isFetching || query?.isFetching}
          />
        }
        {!!mode && mode === 'n' &&
          <NoteWatch
            title={title}
            viewCount={viewCount}
            query={query}
            player={player}
            player_state={player_state}
            ProblemBlock={<ProblemBlock problem={JSON.parse(problem || "{}")} />}
          />
        }
        {!mode &&
          <Watch
            title={title}
            viewCount={viewCount}
            query={query}
            player={player}
            ProblemBlock={<ProblemBlock problem={JSON.parse(problem || "{}")} />}
          />
        }
      </Box>
    </Box>
  )
}

export default index

const WatchWrapper = ({
  videoID,
  children
}) => {
  const { setDrawerOpen } = useAppStore()
  const { isLogin } = useAccountStore()
  const { isEditing } = useWatchStore()
  const [searchParams] = useSearchParams()
  const [player, setPlayer] = useState(null)
  const [player_state, setPlayerState] = useState(null)
  const [keypress, setKeyPress] = useState({})
  const [totalDuration, setTotalDuration] = useState(0)
  const [tmpStartTime, setTmpStartTime] = useState(null)
  const isMounted = useRef(true); // 偵測component卸載變數
  const totalDurationRef = useRef(0);
  const tmpStartTimeRef = useRef(null)

  const v = searchParams.get('v'), t = searchParams.get('t') ?? null;

  const [now_vid, setNowVID] = useState(v)

  useEffect(() => {
    setDrawerOpen(false)
    // document.body.style.overflow = "hidden";
    return () => {
      setDrawerOpen(true)
      // document.body.style.overflow = "auto";
    }
  }, [])

  useEffect(() => {
    return () => {
      // 在 component 卸載時執行的清理程式碼
      isMounted.current = false;
      // console.log('Component 卸載了');
    };
  }, []);

  useEffect(() => {
    if (!isEditing) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    } else {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    }
  }, [keypress, player, isEditing])

  const query = useQuery({ queryKey: ['setVideoHistory', v, isLogin], queryFn: () => setVideoHistory({ vid: v }), enabled: !!isLogin && !!v }) // 沒觀看過會自動建立筆記本，所以要等待
  const setVideoLastSecApi = useMutation({ mutationFn: setVideoLastSec })

  useEffect(() => {
    if (v !== now_vid && !!player && !!player?.getCurrentTime) {
      // 做一些只在 component 還在 mounted 時才需要執行的事情
      !!player && !!player?.getCurrentTime && setLastSec(now_vid)
      setNowVID(v)
    }
    return () => {
      if (!isMounted.current && !!player && !!player?.getCurrentTime) {
        // 做一些只在 component 還在 mounted 時才需要執行的事情
        setLastSec(v)
        setNowVID(v)
      }
    }
  }, [v, player, isLogin, isMounted.current, now_vid]);

  const setLastSec = (vid) => {
    let second = !!player && !!player?.getCurrentTime && player?.getCurrentTime() || 0
    let duration = 0
    if (tmpStartTimeRef.current !== null) {
      duration = getTimeDiff(tmpStartTimeRef.current)
    }
    !!isLogin && setVideoLastSecApi.mutate({ vid: parseInt(vid), second: Math.floor(second), duration: totalDurationRef.current + duration })
    setTotalDuration(0)
    setTmpStartTime(null)
    totalDurationRef.current = 0
    tmpStartTimeRef.current = null
  }

  useEffect(() => {
    if (player_state === 1 && tmpStartTime == null) {
      let now = new Date()
      setTmpStartTime(now)
      tmpStartTimeRef.current = now
    } else if ((player_state === 2 || player_state === 0 || player_state === 3) && tmpStartTime !== null) {
      const duration = getTimeDiff(tmpStartTime)
      setTotalDuration(totalDuration + duration)
      setTmpStartTime(null)
      totalDurationRef.current = totalDuration + duration
      tmpStartTimeRef.current = null
    }
  }, [player_state, tmpStartTime])

  const getTimeDiff = (startTime) => {
    return parseInt(((new Date()).getTime() - startTime.getTime()) / 1000)
  }

  const onPlayerStateChange = (event) => {
    setPlayerState(event?.data ?? null)
  }

  const pauseplayVideo = () => { // 播放/暫停影片，因ctrl+alt與space有用到，故寫成function
    if (!!player) {
      player.getPlayerState() == 1 ? player.pauseVideo() : player.playVideo();
    }
  }

  const onKeyUp = (e) => {
    if (keypress[17] && e.keyCode == 18) { // Ctrl + Alt
      pauseplayVideo();
    }
    !isEditing && setKeyPress({ ...keypress, [e.keyCode]: false })
  }

  const onKeyDown = (e) => {
    let keys = {}
    if (!!e.ctrlKey) {
      keys[17] = true
    }
    if (!isEditing && !!player) {
      switch (e.keyCode) {
        case 32: { // 空白鍵
          e.preventDefault(); // 不讓按鍵讓滾輪滾動
          pauseplayVideo();
          break;
        }
        case 37: { //key <-
          player.seekTo((player?.getCurrentTime() - 5));
          break;
        }
        case 39: { //key ->
          player.seekTo((player?.getCurrentTime() + 5));
          break;
        }
        case 38: { //key ↑
          e.preventDefault(); // 不讓按鍵讓滾輪滾動
          player.isMuted() ? (player.unMute(), player.setVolume(5)) : player.setVolume((player.getVolume() + 5));
          break;
        }
        case 40: { //key ↓
          e.preventDefault(); // 不讓按鍵讓滾輪滾動
          player.setVolume((player.getVolume() - 5));
          break;
        }
      }
    }
    !isEditing && setKeyPress({ ...keypress, [e.keyCode]: true, ...keys })
  }

  return (
    <Fragment>
      <Beforeunload callback={() => setLastSec(v)} />
      <Prompt when={isEditing} message='內容尚未儲存，確定要離開此頁面？' />
      <YoutubeApi
        videoid={videoID || null}
        t={t}
        setPlayer={obj => setPlayer(obj)}
        player={player}
        onPlayerStateChange={(e) => onPlayerStateChange(e)}
        onPlayerReady={(e) => !!autoPlay && e.target.playVideo()} // 自動播放
      />
      {children && (Array.isArray(children) ?
        children.map(children, (child) =>
          React.cloneElement(child, { player, query, player_state })
        ) :
        React.cloneElement(children, { player, query, player_state })
      )}
    </Fragment>
  )
}

export { WatchWrapper }

const ProblemBlock = (props) => {
  let { problem } = props

  if (!Array.isArray(problem)) {
    return (
      <Box sx={{ m: 2 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
          相關程式解題題目
        </Typography>
        <Box>
          無
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ m: 2 }}>
      <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
        相關程式解題題目
      </Typography>
      <CodeList
        body={
          problem?.map(d =>
            <CodeBlock key={d?.pid} data={d} />)
        }
      />
    </Box>
  )
}

export { ProblemBlock }