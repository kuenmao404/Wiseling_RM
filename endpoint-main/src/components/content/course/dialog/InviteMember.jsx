import React, { Fragment, useState, useRef, useEffect } from 'react'
import {
  Box, DialogContent, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper,
  TextField, FormControl, Select, MenuItem, InputLabel, Button, IconButton, Tooltip,
  Tabs, Tab, Divider, CircularProgress, useMediaQuery,
} from '@mui/material'
import { Add, Clear } from '@mui/icons-material'
import { getMailInvite, sendMailInvite, resendMailInvite, delMailInvite } from '../../../../apis'
import { useMutation, useQuery } from '@tanstack/react-query'
import Loading from '../../../elements/loading'
import Pagination from '../../../elements/Pagination'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'

const sx = {
  '&:last-child td, &:last-child th': { border: 0 },
  '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" },
  '&:hover': { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "pointer", transition: "all .2s" }
}

export default function InviteMember(props) {
  const { groups, courseCID } = props
  const [click_send_all, setClick] = useState(0)
  const [key, setKey] = useState(0)
  const [tab_value, setTabValue] = useState("新增邀請")
  const contentRef = useRef(null)
  const [list, setList] = useState([{ key }])


  const handleAddListRow = () => {
    setList([...list, { key: key + 1 }])
    setKey(key + 1)
  }

  useEffect(() => {
    contentRef.current?.scrollIntoView()
  }, [list])

  return (
    <Fragment>
      <DialogContent dividers className='flex flex-col fww jcsb flex-1-1' sx={{ overflow: "auto" }} ref={contentRef}>
        <Box>
          <Tabs
            value={tab_value}
            onChange={(e, value) => setTabValue(value)}
          >
            <Tab value="新增邀請" label={<b>新增邀請</b>} />
            <Tab value="邀請列表" label={<b>邀請列表</b>} />
          </Tabs>
          <Divider />
          {tab_value == "邀請列表" && <EMailInviteView courseCID={courseCID} />}
          <Box sx={{ display: tab_value == "新增邀請" ? "block" : "none" }}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table sx={{ minWidth: 200 }}>
                <TableHead>
                  <TableRow sx={{ borderTop: "5px solid #1f1f1f" }}>
                    <TableCell sx={{ fontWeight: "bolder" }}>信箱</TableCell>
                    <TableCell sx={{ fontWeight: "bolder" }}>身分</TableCell>
                    <TableCell sx={{ fontWeight: "bolder" }}>功能</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    Array.isArray(list) && list?.map((d, idx) =>
                      <InviteRow
                        key={d?.key}
                        d={d}
                        idx={idx}
                        groups={groups}
                        list={list}
                        setListItem={(o_list) => setList(o_list)}
                        sx={sx}
                        click_send_all={click_send_all}
                        courseCID={courseCID}
                      />)
                  }
                  <TableRow sx={sx}>
                    <TableCell
                      colSpan={1000}
                      sx={{ p: 1 }}
                      align='center'
                      onClick={() => handleAddListRow()}
                    >
                      <Add />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Button sx={{ mt: 2 }} variant='outlined' onClick={() => setClick(click_send_all + 1)} fullWidth>送出邀請驗證信</Button>
          </Box>
        </Box>
      </DialogContent>
    </Fragment>
  )
}

const InviteRow = (props) => {
  const { d, idx, groups, list, setListItem, sx, click_send_all, courseCID } = props
  const [pre_click_send_all, setClickSendAll] = useState(click_send_all)
  const [data, setData] = useState({ gid: groups.find(d => d?.gname == "課程成員")?.cid })

  const sendMailInviteApi = useMutation({ mutationFn: sendMailInvite })

  const handleSendMailInvite = (data) => {
    const { gid: cid, email } = data || {}
    sendMailInviteApi.mutate({ courseCID, cid, email }, {
      onSuccess: (d) => {
        setData({ ...data, isLoading: false, onSuccess: !!d?.ok })
      }
    })
  }

  useEffect(() => {
    if (click_send_all !== 0 && pre_click_send_all !== click_send_all && data?.onSuccess !== true) {
      SendingMailInvite(list)
    }
    pre_click_send_all !== click_send_all && setClickSendAll(click_send_all)
  }, [click_send_all, list, idx])

  const SendingMailInvite = (_list) => {
    setData({ ...data, isLoading: true })
    handleSendMailInvite(data)
  }

  const handleChangeEmail = (value) => {
    setData({ ...data, email: value })
  }

  const handleChangeGroup = (value) => {
    setData({ ...data, gid: value })
  }

  const handleDelGroup = () => {
    let o_list = Array.from(list)
    o_list = o_list?.filter((f, index) => index !== idx)
    setListItem(o_list)
  }

  return (
    <TableRow sx={sx}>
      <TableCell align="left">
        <TextField
          value={data?.email || ""}
          onChange={(e) => handleChangeEmail(e.target.value)}
          variant="standard"
          placeholder='請輸入完整信箱' autoFocus fullWidth
          disabled={data?.onSuccess}
        />
      </TableCell>
      <TableCell align="left">
        <FormControl variant="standard" sx={{ minWidth: "200px" }} fullWidth>
          <Select
            labelId="member-change-group"
            value={data?.gid || ""}
            onChange={(e) => handleChangeGroup(e.target.value)}
            label="身分"
            disabled={data?.onSuccess}
          >
            {groups?.map(m =>
              <MenuItem key={m.cid} value={m?.cid} disabled={data?.cid == m?.cid}>{m?.gname}</MenuItem>)}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="left">
        {data?.onSuccess == false && !data?.isLoading &&
          <Button sx={{ mr: 1 }} variant='contained' color="warning" onClick={() => SendingMailInvite(list, idx)}>失敗，重寄驗證信</Button>
        }
        {data?.onSuccess == true && !data?.isLoading && <Box sx={{ color: "green" }}>寄信成功！</Box>}
        {data?.isLoading && <CircularProgress />}
        {(!data?.onSuccess && !data?.isLoading) &&
          <Tooltip title="刪除此列邀請">
            <IconButton onClick={() => handleDelGroup()}>
              <Clear color="error" />
            </IconButton>
          </Tooltip>
        }
      </TableCell>
    </TableRow>
  )
}

const EMailInviteView = (props) => {
  const { courseCID } = props
  const counts = 10
  const [page, setPage] = useState(1)

  const lg = useMediaQuery('(min-width:1200px)')
  const md = useMediaQuery('(min-width:600px)')
  const xs = useMediaQuery('(min-width:500px)')

  const getMailInviteApi = useQuery({ queryKey: ['getMailInvite', courseCID, page], queryFn: () => getMailInvite({ cid: courseCID, start: (page - 1) * counts + 1, counts }) })
  const { total, data } = getMailInviteApi?.data || {}

  const resendMailInviteApi = useMutation({ mutationFn: resendMailInvite, onSuccess: () => getMailInviteApi.refetch() })
  const delMailInviteApi = useMutation({ mutationFn: delMailInvite, onSuccess: () => getMailInviteApi.refetch() })

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 200 }}>
          <TableHead>
            <TableRow sx={{ borderTop: "5px solid #1f1f1f" }}>
              <TableCell sx={{ fontWeight: "bolder" }}>信箱</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>身分</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>邀請人</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>連結到期時間</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>啟用狀態</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>功能</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <LoadingWrapper query={getMailInviteApi}>
              <Fragment>
                {
                  Array.isArray(data) && data?.map(d =>
                    <TableRow sx={sx} key={d?.iid}>
                      <TableCell align="left">
                        {d?.email}
                      </TableCell>
                      <TableCell align="left">
                        {d?.gname}
                      </TableCell>
                      <TableCell align="left">
                        {d?.inviteName}
                      </TableCell>
                      <TableCell align="left">
                        {d?.expiredDT}
                      </TableCell>
                      <TableCell align="left">
                        {getInviteStatus(d?.state)}
                      </TableCell>
                      <TableCell align="left">
                        {(d?.state == 2 || d?.state == 4 || d?.state == 0) &&
                          <Button
                            disabled={resendMailInviteApi?.isPending}
                            onClick={() => resendMailInviteApi.mutate({ courseCID: d?.cid, email: d?.email, iid: d?.iid, cid: d?.groupCID })}
                          >
                            重新發送
                          </Button>
                        }
                        {d?.state !== 3 && d?.state !== 1 &&
                          <Button color="error" onClick={() => delMailInviteApi.mutate({ courseCID: d?.cid, iid: d?.iid, cid: d?.groupCID })}>
                            刪除
                          </Button>
                        }
                      </TableCell>
                    </TableRow>)
                }
              </Fragment>
            </LoadingWrapper>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center", m: 2 }}>
        <Pagination
          value={parseInt(page || 1)}
          total={total ? parseInt((total - 1) / counts) + 1 : 1}
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

const getInviteStatus = (status) => {
  switch (status) {
    case 0:
      return "未開通"
    case 1:
      return "已開通"
    case 2:
      return "已到期"
    case 3:
      return "刪除"
    case 4:
      return "寄件失敗"
    default:
      return ""
  }
}