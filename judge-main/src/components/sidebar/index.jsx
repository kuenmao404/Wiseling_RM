import React from 'react'
import { Box, Divider, Drawer, Backdrop, Toolbar, List, useMediaQuery, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import useAppStore from '../../store/app'
import { Home } from '@mui/icons-material';

const drawerWidth = 240;

const drawer = [
  { text: "首頁", path: '/', icon: <Home /> },
]

export default function index() {
  const { isSidebarOpen, setSidebarOpen } = useAppStore(state => state)
  let location = useLocation()
  let navigate = useNavigate()
  const matches = useMediaQuery('(min-width:900px)')

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: !!matches && isSidebarOpen ? drawerWidth : 0 }}
    >
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { md: 'none', xs: 'block' }
        }}
        open={!matches && !!isSidebarOpen}
        onClick={() => setSidebarOpen()}
      ></Backdrop>
      <Drawer
        variant={!matches ? "temporary" : "persistent"}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open={isSidebarOpen}
        anchor='left'
        hideBackdrop={true}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {
              drawer.map(({ text, path, icon }, index) => (
                <Link to={path} className='reset-link' key={path}>
                  <ListItem
                    key={text}
                    disablePadding
                    onClick={e => (!matches && setSidebarOpen(false))}
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
                </Link>
              ))
            }
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
