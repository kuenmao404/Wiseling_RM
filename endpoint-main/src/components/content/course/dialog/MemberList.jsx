import React, { Fragment } from 'react'
import {
  Box, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, useMediaQuery,
  Select, MenuItem, InputLabel, FormControl, Avatar,
} from '@mui/material'
import useAppStore from '../../../../store/app'
import useAlertStore from '../../../../store/alert'
import useAccountStore from '../../../../store/account'
import useDialogStore from '../../../../store/dialog'
import { stringAvatar } from '../../../Header'

const MemberList = (props) => {
  const { data, isManager = false, onDeleteMember, onEditMember, groups = [] } = props
  const { isDrawerOpen } = useAppStore()
  const { setAlert } = useAlertStore()
  const { mid } = useAccountStore()
  const { setDialog } = useDialogStore()

  const sx = {
    '&:last-child td, &:last-child th': { border: 0 },
    '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
    '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "", transition: "all .2s" }
  }

  const md = useMediaQuery(!isDrawerOpen ? '(min-width:992px)' : '(min-width:1232px)')

  const handleDeleteMember = (d) => {
    setAlert({
      title: "刪除成員",
      content: `確定要刪除？`,
      handleAgree: (callback) => onDeleteMember(d, callback),
      handleDisagree: () => { },
    })
  }

  const handleChangeGroup = (d, groupCID = null) => {
    setAlert({
      title: "變更身分",
      content: (
        <FormControl variant="filled" sx={{ minWidth: "200px" }}>
          <InputLabel id="member-change-group">身分</InputLabel>
          <Select
            labelId="member-change-group"
            value={groupCID || d?.cid}
            onChange={(e) => handleChangeGroup(d, e.target.value)}
            label="身分"
          >
            {groups?.map(m =>
              <MenuItem value={m?.cid} disabled={d?.cid == m?.cid}>{m?.gname}</MenuItem>)}
          </Select>
        </FormControl>),
      handleAgree: (callback) => onEditMember({ ...d, groupCID }, callback),
      handleDisagree: () => { },
    })
  }

  const head_column = [
    <TableCell sx={{ fontWeight: "bolder" }}>頭像</TableCell>,
    <TableCell sx={{ fontWeight: "bolder" }}>名稱</TableCell>,
    <TableCell sx={{ fontWeight: "bolder" }}>身分</TableCell>,
    <TableCell sx={{ fontWeight: "bolder" }}>上次登入</TableCell>,
    !!isManager && <TableCell sx={{ fontWeight: "bolder" }}>管理</TableCell>
  ]

  const body_column = [
  ]

  return (
    <Box>
      {
        md ?
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table sx={{ minWidth: 200 }}>
              <TableHead>
                <TableRow sx={{ borderTop: "5px solid #1f1f1f" }}>
                  {
                    head_column?.map((d, idx) =>
                      d !== false && <Fragment key={idx}>{d}</Fragment>)
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  data?.map(d =>
                    <TableRow sx={sx} key={d?.mid}>
                      <TableCell align="left"><Avatar {...stringAvatar(d?.name)} src={d?.img} sx={{ ...(stringAvatar(d?.name).sx) }} /></TableCell>
                      <TableCell align="left">{d?.name}<span style={{ color: "#4153C7" }}>{d?.sso && ` (${!!d?.bPrev ? `${d?.sso}登入預先匯入的會員` : d?.sso})`}</span></TableCell>
                      <TableCell align="left">{d?.gname}</TableCell>
                      <TableCell align="left">{d?.lastLoginDT}</TableCell>
                      {!!isManager &&
                        <TableCell align="left">
                          {mid != d?.mid && d?.bDelete && <Button color='error' variant='contained' onClick={() => handleDeleteMember(d)}>移除</Button>}
                          {mid != d?.mid && d?.bUpdate && <Button color='info' variant='contained' onClick={() => handleChangeGroup(d)} sx={{ ml: 1 }}>變更身分</Button>}
                        </TableCell>
                      }
                    </TableRow>)
                }
              </TableBody>
            </Table>
          </TableContainer> :
          data?.map(d =>
            <MemberCard key={d?.mid} data={d} isManager={isManager} handleDeleteMember={handleDeleteMember} handleChangeGroup={handleChangeGroup} mid={mid} />)
      }
    </Box>
  )
}

export default MemberList

const MemberCard = (props) => {
  const { data, isManager, mid, handleDeleteMember, handleChangeGroup } = props

  const sx = {
    '&:last-child td, &:last-child th': { border: 0 },
    '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
    '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "", transition: "all .2s" }
  }

  return (
    <Box sx={{ mt: 1 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 200 }}>
          <TableHead>
            <TableRow sx={{ borderTop: "5px solid #1f1f1f;" }}>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={sx}>
              <TableCell sx={{ fontWeight: "bolder" }}>頭像</TableCell>
              <TableCell align="left"><Avatar {...stringAvatar(data?.name)} src={data?.img} sx={{ ...(stringAvatar(data?.name).sx) }} /></TableCell>
            </TableRow>
            <TableRow sx={sx}>
              <TableCell sx={{ fontWeight: "bolder" }}>名稱</TableCell>
              <TableCell align="left">{data?.name}<span style={{ color: "#4153C7" }}>{data?.sso && ` (${data?.sso})`}</span></TableCell>
            </TableRow>
            <TableRow sx={sx}>
              <TableCell sx={{ fontWeight: "bolder" }}>身分</TableCell>
              <TableCell align="left">{data?.gname}</TableCell>
            </TableRow>
            <TableRow sx={sx}>
              <TableCell sx={{ fontWeight: "bolder" }}>上次登入</TableCell>
              <TableCell align="left">{data?.lastLoginDT}</TableCell>
            </TableRow>
            {!!isManager &&
              <TableRow sx={sx}>
                <TableCell sx={{ fontWeight: "bolder" }}>管理</TableCell>
                <TableCell align="left">
                  {mid != data?.mid && data?.bDelete && <Button color='error' variant='contained' onClick={() => handleDeleteMember(data)}>移除</Button>}
                  {mid != data?.mid && data?.bUpdate && <Button color='info' variant='contained' onClick={() => handleChangeGroup(data)} sx={{ ml: 1 }}>變更身分</Button>}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

  )
}
