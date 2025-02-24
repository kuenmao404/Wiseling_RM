import React, { useEffect } from 'react'
import { Box, Divider, Drawer, Backdrop, Toolbar, List, useMediaQuery, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material'
import useAppStore from '../../store/app'
import useAccountStore from '../../store/account'
import useDialogStore from '../../store/dialog'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPersonClass } from '../../apis'
import { Home, Book, FeaturedVideo, ShuffleOn, History, School, OndemandVideo, Groups, HelpOutline, ReportGmailerrorred, Launch, Folder } from '@mui/icons-material'
import ReportError from '../elements/dialog/ReportError'
import Config from 'Config'
const { isProd } = Config

const drawerWidth = 240;

const test_drawer = !isProd ? [
  // { text: "資料夾", path: '/folder', icon: <Folder /> }
] : []

const drawer = [
  { text: "我的筆記", path: '/note', icon: <Book /> },
  { text: "影片收藏", path: '/folder', icon: <Folder /> },
  // { text: "影片收藏", path: '/videolist', icon: <FeaturedVideo /> },
  { text: "隨選播放", path: '/notelist', icon: <ShuffleOn /> },
  { text: "觀看紀錄", path: '/history', icon: <History /> },
  ...test_drawer
]

const other_drawer = [
  { text: "課程", path: '/course', icon: <OndemandVideo /> },
  // { text: "群組", path: '/groups', icon: <Groups /> },
  // { text: "課綱", path: '/12basic', icon: <School /> },
]

export default function index(props) {
  const { isDrawerOpen, setDrawerOpen } = useAppStore(state => state)
  const { mid, isLogin } = useAccountStore(state => state)
  const { setDialog } = useDialogStore()
  let location = useLocation()
  let navigate = useNavigate()

  const matches = useMediaQuery('(min-width:900px)')

  const checkHomePage = (text) => {
    if (location.pathname !== "/")
      return false
    // if (isLogin)
    //   return text == "我的筆記"
    // else
    return text == "課程"
  }

  const help_drawer = [
    { text: "幫助", path: '/help', icon: <HelpOutline /> },
    {
      text: `回報問題`,
      path: null,
      onClick: () => {
        setDialog({
          title: "回報問題",
          body: <ReportError path={`${location.pathname}${location.search}`} />,
          isRwdWidth: true,
        })
      },
      icon: <Launch />
    },
  ]

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: !!matches && isDrawerOpen ? drawerWidth : 0 }}
    >
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { md: 'none', xs: 'block' }
        }}
        open={!matches && !!isDrawerOpen}
        onClick={() => setDrawerOpen()}
      ></Backdrop>
      <Drawer
        variant={!matches ? "temporary" : "persistent"}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open={isDrawerOpen}
        anchor='left'
        hideBackdrop={true}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {/* <List>
            <ListItem
              disablePadding
              onClick={e => (navigate("/"), !matches && setDrawerOpen(false))}
            >
              <ListItemButton selected={"/" == location.pathname}>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={"首頁"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider /> */}
          <List>
            {other_drawer.map(({ text, path, icon }, index) => (
              <DrawerListItem
                key={text}
                selected={!!location.pathname.match(new RegExp(path + '($|/)')) || checkHomePage(text)}
                onClick={e => (navigate(path), !matches && setDrawerOpen(false))}
                icon={icon}
                text={text}
              />
            ))}
          </List>
          <Divider />
          <List>
            {
              drawer.map(({ text, path, icon }, index) => (
                <DrawerListItem
                  key={text}
                  onClick={e => (navigate(path), !matches && setDrawerOpen(false))}
                  selected={!!location.pathname.match(new RegExp(path + '($|/)')) || checkHomePage(text)}
                  icon={icon}
                  text={text}
                />
              ))
            }
          </List>
          <Divider />
          <List>
            {help_drawer.map(({ text, path, onClick, icon }, index) => (
              <ListItem
                key={text}
                disablePadding
                onClick={e => (!!path && navigate(path), !!onClick && onClick(), !matches && setDrawerOpen(false))}
              >
                <ListItemButton selected={!!location.pathname.match(new RegExp(path + '($|/)'))}>
                  {!!icon &&
                    <ListItemIcon>
                      {icon}
                    </ListItemIcon>
                  }
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}

const DrawerListItem = ({
  onClick = () => { },
  selected = null,
  icon = null,
  text = "",
}) => {
  return (
    <ListItem
      disablePadding
      onClick={onClick}
    >
      <ListItemButton selected={selected}>
        {!!icon &&
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        }
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  )
}