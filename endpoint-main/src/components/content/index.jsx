import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Home from './home'
import Watch from './watch'
import Note from './note'
import Search from './search'
import History from './history'
import NotLogin from './NotLogin'
import Course from './course'
import VideoCollection from './collection/video'
import NoteCollection from './collection/note'
import useAccountStore from '../../store/account'
import RwdWrapper from '../elements/wrapper/RwdWrapper'
import AuthPage from './auth'
import Member from './member'
import IT108 from './transfer/IT108'
import Policy from './Policy'
import RandomDice from './randomdice/RandomDice'
import TimeLine from './timeline'
import Help from './help'
import Folder from './folder'
import useAppStore from '../../store/app'
import Config from 'Config'
const { isProd } = Config

function index() {
  const { isLogin } = useAccountStore()

  const { setTitle } = useAppStore()

  return (
    <Box sx={{
      flex: "1 1 auto",
      display: "flex",
      flexDirection: "column",
    }}>
      <Routes>
        <Route path="/" element={<Course />} /> {/** <Home /> */}
        <Route path="/timeline" element={<RwdWrapper content_sx={{ flex: "1 1 auto" }}><TimeLine setTitle={setTitle} /></RwdWrapper>} />
        <Route path="/watch" element={<Watch setTitle={setTitle} />} />
        <Route path="/RandomDice" element={<RwdWrapper><RandomDice /></RwdWrapper>} />
        <Route path="/policy" element={<RwdWrapper><Policy /></RwdWrapper>} />
        <Route path="/search" element={<Search setTitle={setTitle} />} />
        <Route path="/course/*" element={<Course setTitle={setTitle} />} />
        <Route path="/help" element={<RwdWrapper content_sx={{ flex: "1 1 auto" }}><Help /></RwdWrapper>} />
        <Route path="/note" element={isLogin ? <RwdWrapper><Note /></RwdWrapper> : <NotLogin />} />
        <Route path="/history" element={isLogin ? <RwdWrapper><History /></RwdWrapper> : <NotLogin />} />
        <Route path="/videolist" element={isLogin ? <RwdWrapper content_sx={{ flex: "1 1 auto" }}><VideoCollection setTitle={setTitle} /></RwdWrapper> : <NotLogin />} />
        <Route path="/notelist" element={isLogin ? <RwdWrapper content_sx={{ flex: "1 1 auto" }}><NoteCollection setTitle={setTitle} /></RwdWrapper> : <NotLogin />} />
        <Route path="/videolist/:cid" element={isLogin ? <RwdWrapper><VideoCollection setTitle={setTitle} /></RwdWrapper> : <NotLogin />} />
        <Route path="/notelist/:cid" element={isLogin ? <RwdWrapper><NoteCollection setTitle={setTitle} /></RwdWrapper> : <NotLogin />} />
        <Route path="/trasnsfer/it108" element={isLogin ? <RwdWrapper content_sx={{ flex: "1 1 auto" }}><IT108></IT108></RwdWrapper> : <NotLogin />} />
        <Route path="/auth" element={<RwdWrapper><AuthPage /></RwdWrapper>} />
        <Route path="/member/:mid" element={isLogin ? <RwdWrapper content_sx={{ flex: "1 1 auto" }}><Member /></RwdWrapper> : <NotLogin />} />
        <Route path="/folder" element={isLogin ? <RwdWrapper content_sx={{ flex: "1 1 auto" }}><Folder /></RwdWrapper> : <NotLogin />} />
      </Routes>
    </Box>
  )
}

export default index