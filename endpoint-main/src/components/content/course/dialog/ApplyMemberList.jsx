import React from 'react'
import { getApplyCourseList, handleApplyCourse } from '../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import MemberList from './MemberList'
import { Box, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, useMediaQuery } from '@mui/material'
import useAppStore from '../../../../store/app'
import useAlertStore from '../../../../store/alert'

export default function ApplyMemberList(props) {
  const { cid, refetch } = props

  const getApplyCourseListApi = useQuery({ queryKey: ["getApplyCourseList"], queryFn: () => getApplyCourseList({ applyStatus: 0, cid }) })
  const handleApplyCourseApi = useMutation({ mutationFn: handleApplyCourse, onSuccess: () => (getApplyCourseListApi.refetch(), refetch()) })

  const data = (getApplyCourseListApi?.data || [])?.map(d => {
    return {
      ...d, mid: d?.applyMID, name: d?.applyName,
    }
  })

  const handleApplyMember = (d, tf) => {
    handleApplyCourseApi.mutate({ ...d, courseCID: d?.cid, bAccept: tf })
  }

  return (
    <ApplyList
      data={data}
      handleApplyMember={(d, tf) => handleApplyMember(d, tf)}
    />
  )
}

const ApplyList = (props) => {
  const { data, handleApplyMember } = props
  const { isDrawerOpen } = useAppStore()

  const sx = {
    '&:last-child td, &:last-child th': { border: 0 },
    '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
    '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "", transition: "all .2s" }
  }

  const md = useMediaQuery(!isDrawerOpen ? '(min-width:992px)' : '(min-width:1232px)')

  return (
    <Box>
      {
        md ?
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table sx={{ minWidth: 200 }}>
              <TableHead>
                <TableRow sx={{ borderTop: "5px solid #1f1f1f" }}>
                  <TableCell sx={{ fontWeight: "bolder" }}>名稱</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>信箱</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>登入平台</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>申請時間</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>管理</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  data?.map(d =>
                    <TableRow sx={sx} key={d?.mid}>
                      <TableCell align="left">{d?.name}</TableCell>
                      <TableCell align="left">{d?.email}</TableCell>
                      <TableCell align="left">{d?.sso}</TableCell>
                      <TableCell align="left">{d?.since}</TableCell>
                      <TableCell align="left">
                        <Button color='success' variant='contained' onClick={() => handleApplyMember(d, true)}>同意</Button>
                        <Button color='error' variant='contained' onClick={() => handleApplyMember(d, false)} sx={{ ml: 1 }}>拒絕</Button>
                      </TableCell>
                    </TableRow>)
                }
              </TableBody>
            </Table>
          </TableContainer> :
          data?.map(d =>
            <TableContainer component={Paper} key={d?.mid}>
              <Table sx={{ minWidth: 200 }}>
                <TableHead>
                  <TableRow sx={{ borderTop: "5px solid #1f1f1f;" }}>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={sx}>
                    <TableCell sx={{ fontWeight: "bolder" }}>名稱</TableCell>
                    <TableCell align="left">{d?.name}</TableCell>
                  </TableRow>
                  <TableRow sx={sx}>
                    <TableCell sx={{ fontWeight: "bolder" }}>信箱</TableCell>
                    <TableCell align="left">{d?.email}</TableCell>
                  </TableRow>
                  <TableRow sx={sx}>
                    <TableCell sx={{ fontWeight: "bolder" }}>登入平台</TableCell>
                    <TableCell align="left">{d?.sso}</TableCell>
                  </TableRow>
                  <TableRow sx={sx}>
                    <TableCell sx={{ fontWeight: "bolder" }}>申請時間</TableCell>
                    <TableCell align="left">{d?.since}</TableCell>
                  </TableRow>
                  <TableRow sx={sx}>
                    <TableCell sx={{ fontWeight: "bolder" }}>管理</TableCell>
                    <TableCell align="left">
                      <Button color='success' variant='contained' onClick={() => handleApplyMember(d, true)}>同意</Button>
                      <Button color='error' variant='contained' onClick={() => handleApplyMember(d, false)} sx={{ ml: 1 }}>拒絕</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )
      }
    </Box>
  )
}