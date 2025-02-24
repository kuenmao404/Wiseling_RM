import React from 'react'
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Avatar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link } from 'react-router-dom'
import useAppStore from '../../store/app'
import useDialogStore from '../../store/dialog'
import useAlertStore from '../../store/alert'
import Login from '../elements/dialog/Login'
import { useLocation } from "react-router-dom"

export default function index(props) {
  const { isLoading, isLogin, title, name, logout, mid, img } = props
  const { setSidebarOpen } = useAppStore(state => state)
  const { setDialog, closeDialog } = useDialogStore(state => state)
  const { setAlert } = useAlertStore(state => state)
  const location = useLocation()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 998, background: "#1f1f1f" }}> {/**zIndex: (theme) => theme.zIndex.drawer + 1 */}
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setSidebarOpen()}
          >
            <MenuIcon />
          </IconButton> */}
          <Link to="/" className='reset-link'>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          {
            !isLoading ?
              (
                !!isLogin ?
                  <IconButton
                    size="large"
                    edge="end"
                    color="inherit"
                    onClick={() => setAlert({
                      title: "登出",
                      content: "確定要登出？",
                      handleAgree: (callback) => (logout(), callback())
                    })}
                  >
                    <Avatar {...stringAvatar(name)} src={img} />
                  </IconButton> :
                  <Button
                    color="inherit"
                    onClick={() => setDialog({
                      title: '登入',
                      content: <Login state={`${location.pathname}${location.search}`} />,
                      actions: <Button onClick={() => closeDialog()}>關閉</Button>,
                      handleClose: closeDialog,
                    })}
                  >
                    登入
                  </Button>
              ) :
              <span>Loading...</span>
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name?.split(' ')?.[0]?.[0] || name?.[0]}${name?.split(' ')?.[1]?.[0] || ""}`,
  };
}

export { stringAvatar }