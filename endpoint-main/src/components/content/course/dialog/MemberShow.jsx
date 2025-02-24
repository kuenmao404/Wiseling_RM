import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourseMember } from '../../../../apis'
import { Box } from '@mui/material'
import MemberList from './MemberList'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'

export default function MemberShow(props) {
  const { cid } = props

  const getCourseMemberApi = useQuery({ queryKey: ["getCourseMember", cid], queryFn: () => getCourseMember({ courseCID: cid }) })

  return (
    <LoadingWrapper query={getCourseMemberApi}>
      <MemberList data={getCourseMemberApi?.data?.data} isManager={false} />
    </LoadingWrapper>
  )
}
