import React, { useEffect, useState, useLayoutEffect } from "react"
import Snackbar from "./elements/snackbar/Snackbar"
import Header from "./Header"
import Main from "./Main"
import { Box, useMediaQuery } from '@mui/material'
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigation } from "react-router-dom"
import { getAccount } from '../apis'
import Alert from "./elements/alert/Alert"
import Dialog from "./elements/dialog/Dialog"
import useDialogStore from "../store/dialog"
import useSnackbarStore from "../store/snackbar"

import useAccountStore from '../store/account'
import useAppStore from "../store/app"

const App = () => {
  const { setAccount, isLogin, setState } = useAccountStore(state => state)
  const dialog_props = useDialogStore()
  const snackbar_props = useSnackbarStore()
  const query = useQuery({ queryKey: ['getAccount'], queryFn: () => getAccount(), refetchOnWindowFocus: true, })

  const { isDrawerOpen, setDrawerOpen, title } = useAppStore()
  const matches = useMediaQuery('(min-width:900px)')

  const location = useLocation()

  useEffect(() => {
    !query.isLoading && !matches && setDrawerOpen(false)
  }, [matches, query.isLoading])

  useEffect(() => {
    query?.data && setAccount({ ...(query?.data || {}), refetch: query.refetch })
  }, [query?.data])

  useEffect(() => {
    document.title = (titles?.[location.pathname] || title) ?? 'WiseLing'
  }, [location, title])

  const clipPath = !matches && !!isDrawerOpen ? {} : { clipPath: "inset(0 0 0 0);" }

  return (
    <Box sx={{ width: "100%", ...clipPath }}>
      <Header />
      <Main isLoading={query.isLoading} />
      <Dialog {...dialog_props} />
      <Alert />
      <Snackbar {...snackbar_props} />
    </Box>
  );
};

export default App;

const titles = {
  '/': 'WiseLing',
  '/course': '課程 - WiseLing',
  '/note': '我的筆記 - WiseLing',
  '/videolist': '影片收藏 - WiseLing',
  '/notelist': '隨選播放 - WiseLing',
  '/history': '觀看紀錄 - WiseLing',
  '/timeline': '版本里程 - WiseLing',
  '/help': '功能介紹 - WiseLing',
  '/policy': '隱私權條款 - WiseLing',
  '/tasks': '任務管理 - WiseLing',
  // '/RandomDice': 'RandomDice協同回合卡片計算機 - WiseLing',
  // '/randomdice': 'RandomDice協同回合卡片計算機 - WiseLing',
}