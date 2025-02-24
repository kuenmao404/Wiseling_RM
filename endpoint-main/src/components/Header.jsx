import React, { useEffect, useState } from 'react'
import {
  AppBar, Box, Toolbar, IconButton, Typography, InputBase, Avatar, useMediaQuery, Button,
  Menu, MenuItem, ListItemIcon, Divider,
  Tooltip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { Logout, Timeline } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import useAppStore from '../store/app'
import useAccountStore from '../store/account'
import useDialogStore from '../store/dialog'
import { Link } from 'react-router-dom'
import Login from './elements/dialog/Login'
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useMutation } from '@tanstack/react-query'
import { logoutAccount } from '../apis'

export default function Header() {
  const location = useLocation()
  let navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const str = searchParams.get('str')
  const [searchStr, setSearchStr] = useState('')

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setSearchStr(str)
  }, [str])

  const { setDrawerOpen } = useAppStore(state => state)
  const { isLogin, name, refetch, mid, img } = useAccountStore(state => state)
  const { setDialog } = useDialogStore(state => state)

  const logout_api = useMutation({ mutationFn: logoutAccount, onSuccess: (data) => (refetch()) })

  const width_matches = useMediaQuery('(min-width:900px)')



  // 判斷主畫面是否有scrollbar
  const [hasVerticalScrollbar, setHasVerticalScrollbar] = useState(false);
  useEffect(() => {
    const body = document.getElementById("body");

    if (body) {
      const checkScrollbar = () => {
        const isScrollbarPresent = body.scrollHeight > body.clientHeight;
        setHasVerticalScrollbar(isScrollbarPresent);
      };

      // 檢查初始狀態
      checkScrollbar();

      // 偵測視窗大小改變或內容變化
      const resizeObserver = new ResizeObserver(checkScrollbar);
      resizeObserver.observe(body);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#1f1f1f", overflowY: hasVerticalScrollbar ? "scroll" : "auto" }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
          onClick={() => setDrawerOpen()}
        >
          <MenuIcon />
        </IconButton>
        <Link to="/" className='reset-link' onClick={() => !!width_matches && setDrawerOpen(true)}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block', color: "white", } }}
          >
            智學記
          </Typography>
        </Link>
        <Search>
          <StyledInputBase
            defaultValue={str}
            placeholder="搜尋影片…"
            onChange={e => setSearchStr(e.target.value)}
            onKeyDown={e => e.keyCode == 13 && navigate(`search?str=${encodeURIComponent(e.target.value)}`)}
          />
          <SearchIconWrapper>
            <IconButton size='small' sx={{ color: "#fff", zIndex: 1 }} onClick={() => navigate(`search?str=${encodeURIComponent(searchStr)}`)}>
              <SearchIcon />
            </IconButton>
          </SearchIconWrapper>
        </Search>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex' }} className="aic">
          <Link to="/timeline" className='reset-link'>
            <Tooltip title="里程碑">
              <IconButton sx={{ color: "#fff" }}>
                <Timeline />
              </IconButton>
            </Tooltip>
          </Link>
          {
            !!isLogin ?
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleClick}
                // onClick={() => logout_api.mutate()}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar {...stringAvatar(name)} src={img} />
              </IconButton> :
              <Button
                variant="contained"
                color="warning"
                onClick={() => setDialog({ title: '登入', content: <Login state={`${location.pathname}${location.search}`} /> })}
              >
                登入
              </Button>
          }
        </Box>
      </Toolbar>
      <AccountMenu anchorEl={anchorEl} handleClose={handleClose} name={name} logout={() => logout_api.mutate()} mid={mid} img={img} />
    </AppBar>
  )
}

const AccountMenu = (props) => {
  const { anchorEl, handleClose, name, logout, mid, img } = props
  let navigate = useNavigate()

  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => (handleClose(), navigate(`/member/${mid}`))}>
        <Avatar {...stringAvatar(name)} src={img} />
        個人頁面
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => (handleClose(), logout())}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        登出
      </MenuItem>
    </Menu>
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

function stringAvatar(name = "") {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name?.split(' ')?.[0]?.[0] || name?.[0]}${name?.split(' ')?.[1]?.[0] || ""}`,
  };
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  // pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  top: 0,
  right: 0,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(0)})`, //   paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

export { stringAvatar }