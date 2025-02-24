import React from 'react';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import Sidebar from './sidebar';
import Footer from './footer';
import Content from './content';

function Main() {
  const matches = useMediaQuery('(min-width:900px)');

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* <Sidebar /> */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: !matches ? '100%' : `calc(100% - ${240}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Content />
        <Footer
          title={
            <video className="footer-logo" autoPlay={true} loop muted controls={false}>
              <source src="/wke_ani.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
            // <img src='./wke_ani.gif' alt="wke logo" className='footer-logo' />
          }
        />
      </Box>
    </Box>
  );
}

export default Main