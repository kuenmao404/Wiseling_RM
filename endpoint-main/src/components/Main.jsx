import React from 'react'
import useAppStore from '../store/app'
import Drawer from './drawer'
import Content from './content'
import Footer from './Footer'
import { Box, Toolbar, useMediaQuery } from '@mui/material'
import { Routes, Route } from 'react-router-dom'

function Main(props) {
  const { isLoading } = props
  const { isDrawerOpen } = useAppStore(state => state)
  const matches = useMediaQuery('(min-width:900px)')

  return (
    <Box sx={{ display: 'flex', width: "100%", minHeight: "100%" }}>

      <Drawer />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: !matches ? "100%" : `calc(100% - ${240}px)`,
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          backgroundColor: "#fafafa",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        {
          !isLoading &&
          <Content />
        }
        <Routes>
          <Route path="/course/:cid/watch" />
          <Route path="/watch" />
          <Route path="/*" element={
            <Footer
              title={
                <video className='footer-logo' autoPlay={true} loop muted controls={false}>
                  <source src="/imgs/wke_ani.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
                // <img src='./wke_ani.gif' alt="wke logo" className='footer-logo' />
              }
            />}
          />
        </Routes>
      </Box>
    </Box>
  )
}

export default Main