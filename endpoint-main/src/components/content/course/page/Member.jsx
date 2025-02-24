import React, { Fragment, useEffect, useState } from 'react'
import { Box, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, useMediaQuery } from '@mui/material'
import SearchBar from '../../../elements/formitem/SearchBar'
import useDialogStore from '../../../../store/dialog'
import useAppStore from '../../../../store/app'
import { getApplyCourseList, getCourseMemberPermission, deleteCourseMember, editCourseMember } from '../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import MemberList from '../dialog/MemberList'
import Pagination from '../../../elements/Pagination'
import InviteMember from '../dialog/InviteMember'
import ApplyMemberList from '../dialog/ApplyMemberList'

export default function Member(props) {
  const { cid, applyCount, refetch, groups, subclass } = props
  const { setDialog } = useDialogStore()
  const { isDrawerOpen } = useAppStore()
  const [page, setPage] = useState(1)
  const counts = 20

  const [value, setValue] = useState('')
  const [searchstr, setSearchstr] = useState('')

  // const getApplyCourseListApi = useQuery({ queryKey: [], queryFn: () => getApplyCourseList() })
  const getCourseMemberApi = useQuery({
    queryKey: ['getCourseMemberPermission', cid, page, searchstr],
    queryFn: () => getCourseMemberPermission({ cid, start: (page - 1) * counts + 1, counts, searchstr: searchstr })
  })
  const deleteCourseMemberApi = useMutation({ mutationFn: deleteCourseMember })
  const editCourseMemberApi = useMutation({ mutationFn: editCourseMember })

  const lg = useMediaQuery(!isDrawerOpen ? '(min-width:1200px)' : "(min-width:1440px)")
  const md = useMediaQuery(!isDrawerOpen ? '(min-width:992px)' : '(min-width:1232px)')
  const xs = useMediaQuery(!isDrawerOpen ? '(min-width:768px)' : '(min-width:1008px)')

  const handleInviteDialog = () => {
    setDialog({
      title: "邀請成員",
      body: <InviteMember cid={cid} groups={groups} courseCID={cid} />,
      isRwdWidth: true,
    })
  }

  const handleApplyDialog = () => {
    setDialog({
      title: "申請中的成員",
      content: <ApplyMemberList cid={cid} refetch={() => (refetch(), getCourseMemberApi.refetch())} />,
      isRwdWidth: true,
    })
  }

  const onDeleteMember = (d, callback) => {
    deleteCourseMemberApi.mutate({ ...d, deleteMID: d?.mid }, { onSuccess: () => (page !== 1 ? setPage(1) : getCourseMemberApi.refetch(), refetch(), callback()) })
  }

  const onEditMember = (d, callback) => {
    editCourseMemberApi.mutate({ ...d, cid: subclass?.['群組']?.cid, memberMID: d?.mid }, { onSuccess: () => (getCourseMemberApi.refetch(), callback()) })
  }

  return (
    <Fragment>
      <Box sx={{ m: 2 }}>
        <Box className="flex aic jcsb">
          <Typography variant='h3' sx={{ fontSize: "20px", fontWeight: "bold" }}>成員管理</Typography>
          <Box>
            {/* <Button variant='outlined'>其他課程匯入</Button> */}
            <Button variant='contained' sx={{ ml: 2 }} onClick={() => handleInviteDialog()}>邀請成員</Button>
          </Box>
        </Box>
        <SearchBar
          sx={{ mt: 2 }}
          value={value || ""}
          onChange={value => setValue(value)}
          onKeyDown={e => e.keyCode == 13 && setSearchstr(e.target.value)}
          handleSummit={(value) => setSearchstr(value)}
          placeholder="過濾成員"
          autoFocus
        />
        {!!searchstr &&
          <Box className="flex jcsb aic" sx={{ mt: 1 }}>
            <Box>
              搜尋「{searchstr}」的結果...
            </Box>
            <Button
              size='small' variant={"contained"} sx={{ pt: 0, pb: 0, pl: 1, pr: 1 }} color={"warning"}
              onClick={() => (setSearchstr(""))}
            >
              清除
            </Button>
          </Box>
        }
        <Box sx={{ mt: 1 }} className="flex">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ "&:hover": { cursor: "pointer", textDecoration: "underline" } }}
            onClick={() => handleApplyDialog()}
          >
            <b>申請名單 ({applyCount || 0})</b>
          </Typography>
        </Box>
        <Box>
          <LoadingWrapper query={getCourseMemberApi}>
            <MemberList data={getCourseMemberApi?.data?.data} onDeleteMember={onDeleteMember} onEditMember={onEditMember} isManager={true} groups={groups} />
          </LoadingWrapper>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", m: 2 }}>
          <Pagination
            value={parseInt(page || 1)}
            total={getCourseMemberApi?.data?.total ? parseInt((getCourseMemberApi?.data?.total - 1) / counts) + 1 : 1}
            withEllipsis={true}
            ellipsisRange={!!lg ? 3 : !!md ? 2 : xs ? 1 : 0}
            isFixed={true}
            color={"rgb(25, 118, 210)"}
            onChange={({ current }) => setPage(current)}
          />
        </Box>
      </Box>
    </Fragment>
  )
}

