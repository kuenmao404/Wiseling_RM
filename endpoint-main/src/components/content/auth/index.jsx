import React, { Fragment } from 'react'
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { Box, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Divider } from '@mui/material'
import useAccountStore from '../../../store/account'
import { getMailTokenInfo, activeMailToken } from '../../../apis'
import Loading from '../../elements/loading'
import { useMutation, useQuery } from '@tanstack/react-query'
import Login from '../../elements/dialog/Login'

export default function index(props) {
  const { margin } = props
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token')
  const { isLogin, name, sso } = useAccountStore()

  const getMailTokenInfoApi = useQuery({ queryKey: ['getMailTokenInfo', token, isLogin], queryFn: () => getMailTokenInfo({ token }) })
  const { data } = getMailTokenInfoApi

  const activeMailTokenApi = useMutation({ mutationFn: activeMailToken, onSuccess: () => navigate(`/course/${data?.cid}`) })

  return (
    <Box sx={{ margin, width: "100%" }}>
      {!isLogin ?
        <Box>
          <Box sx={{ ml: 1, mr: 1, mb: 2 }}>請先登入帳號 (第三方登入)！登入後會幫您導回加入課程頁面！</Box>
          <Divider />
          <Box sx={{ mt: 2 }}>
            <Login state={`${location.pathname}${location.search}`} />
          </Box>
        </Box> :
        <Box className="flex flex-col jcc">
          {(!token || (!getMailTokenInfoApi?.isFetching && data == null)) ?
            <Fragment>
              <Box className='flex jcc'>
                <span>請確認傳入的Token是否正確！</span>
              </Box>
              <Box className='flex jcc'>
                <Button variant='outlined' sx={{ mt: 2 }} onClick={() => navigate('/')}>
                  點我回首頁
                </Button>
              </Box>
            </Fragment> :
            (getMailTokenInfoApi?.isFetching ?
              <Fragment>
                <Loading />
                <Box sx={{ mt: 1 }} className='flex jcc'>驗證中...</Box>
              </Fragment> :
              <Fragment>
                <Box className='flex jcc flex-col'>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bolder" }}> 課程名稱</TableCell>
                          <TableCell><Link className="hover" to={`/course/${data?.cid}`}>{data?.courseName}</Link></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bolder" }}>信箱</TableCell>
                          <TableCell>{data?.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bolder" }}>加入身分</TableCell>
                          <TableCell>{data?.gname}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bolder" }}>帳號名稱</TableCell>
                          <TableCell>{name} ({sso})</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant='contained'
                      color="success"
                      sx={{ opacity: 0.85 }}
                      onClick={() => activeMailTokenApi.mutate({ token })}
                      disabled={activeMailTokenApi?.isPending}
                    >
                      加入課程
                    </Button>
                    <Button variant='contained' color="error" sx={{ ml: 2, opacity: 0.85 }} onClick={() => navigate('/')}>
                      取消
                    </Button>
                  </Box>
                </Box>
              </Fragment>
            )

          }
        </Box>
      }
    </Box >
  )
}
