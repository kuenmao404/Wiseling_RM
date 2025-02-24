import React, { useState, useEffect } from 'react'
import { Box, Divider, useMediaQuery, CircularProgress, Button } from '@mui/material'
import VideoCard from '../../elements/cards/VideoCard'
import Grid from '@mui/material/Unstable_Grid2'
import { useSearchParams } from 'react-router-dom'
import { searchVideo } from '../../../apis'
import Pagination from '../../elements/Pagination'
import { useQuery } from '@tanstack/react-query'
import useDialogStore from '../../../store/dialog'
import useSnackbarStore from '../../../store/snackbar'
import useAccountStore from '../../../store/account'
import AddVideo from '../../elements/dialog/AddVideo'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'

export default function index({ setTitle }) {
  const [searchParams] = useSearchParams()
  const str = searchParams.get('str')
  const counts = 20
  const [page, setPage] = useState(1)
  const { setDialog } = useDialogStore()
  const { setSnackMsg } = useSnackbarStore()
  const { isLogin } = useAccountStore()

  const lg = useMediaQuery('(min-width:1200px)')
  const md = useMediaQuery('(min-width:600px)')
  const xs = useMediaQuery('(min-width:500px)')

  const query = useQuery({ queryKey: ['searchVideo', str, page], queryFn: () => searchVideo({ like: str, start: (page - 1) * counts + 1, counts }) })

  useEffect(() => {
    !!str && setTitle(`${str} - WiseLing`)
    return () => {
      setTitle(null)
    }
  }, [str])

  return (
    <Box sx={{ m: 2 }}>
      <Box sx={{ mb: 1 }} className="flex aic jcsb">
        <Box>
          「{str}」的搜尋結果...
        </Box>
        <Box>
          <Button onClick={() =>
            !!isLogin ?
              setDialog({
                title: "新增影片",
                body: <AddVideo />
              }) :
              setSnackMsg({ message: "登入後即可新增YouTube影片", autoHideDuration: null })
          }
          >
            找不到影片？點此新增
          </Button>
        </Box>
      </Box>
      <Divider sx={{ mt: 1, mb: 2 }} />
      <LoadingWrapper query={query}>
        <Grid container spacing={2} columnSpacing={2} columns={{ md: 12, xl: 12 }}>
          {query?.data?.data?.map((d, index) => (
            <Grid md={12} xl={6} key={d?.videoID} width={"100%"}>
              <VideoCard v={d?.videoID} title={d?.title} viewCount={d?.viewCount} channelTitle={d?.channelTitle} isColumn={(!md || !xs)} vid={d?.vid} />
            </Grid>
          ))}
        </Grid>
      </LoadingWrapper>
      <Box sx={{ display: "flex", justifyContent: "center", m: 2 }}>
        <Pagination
          value={parseInt(page || 1)}
          total={query?.data?.total ? parseInt((query?.data?.total - 1) / counts) + 1 : 1}
          withEllipsis={true}
          ellipsisRange={!!lg ? 3 : !!md ? 2 : xs ? 1 : 0}
          isFixed={true}
          color={"rgb(25, 118, 210)"}
          onChange={({ current }) => setPage(current)}
        />
      </Box>
    </Box>
  )
}
