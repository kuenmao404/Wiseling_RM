import React from 'react'
import { TableBody, Box, Rating } from '@mui/material'
import { Table, TableHeadRow, TableRow, TableCell } from '@/components/elements/ui/Table'
import { useNavigate } from 'react-router-dom'

import Loading from '@/components/elements/Loading'
import { switchKind } from '../../problem/components/Console'

function HistoryTable({ data, isLoading }) {

  const navigate = useNavigate()

  if (!!isLoading) {
    return (
      <EmptyTable><TableRow><TableCell><Loading /></TableCell></TableRow></EmptyTable>
    )
  }
  else if (!Array.isArray(data)) {
    return (
      <EmptyTable><TableRow><TableCell>讀取資料發生錯誤...</TableCell></TableRow></EmptyTable>
    )
  }
  else if (Array.isArray(data) && data?.length == 0) {
    return (
      <EmptyTable><TableRow><TableCell>目前沒有解題紀錄...</TableCell></TableRow></EmptyTable>
    )
  }

  return (
    <EmptyTable headerlist={['星等', '題目名稱', '解題時間', '狀態', 'Language', 'Runtime (ms)', 'Memory (Kb)']}>
      {data?.map(d =>
        <TableRow key={`${d?.pid}_${d?.jsid}_${d?.jkid}`} onClick={() => navigate(`/problem/${d?.pid}/history?jsid=${d?.jsid}`)}>
          <TableCell align='center' sx={{ width: "130px" }}><Rating value={d?.difficulty} size="small" readOnly /></TableCell>
          <TableCell>{d?.title}</TableCell>
          <TableCell>{d?.since}</TableCell>
          <TableCell>
            <div>{switchKind(d?.kind)}</div>
            <Box sx={{ color: "#262626bf" }}>{d?.since?.split(' ')?.[0]}</Box>
          </TableCell>
          <TableCell>{d?.name}</TableCell>
          <TableCell>{d?.runTime ?? 'N/A'}</TableCell>
          <TableCell>{d?.memory ?? 'N/A'}</TableCell>
        </TableRow>
      )}
    </EmptyTable>
  )
}

export default HistoryTable

const EmptyTable = ({ children, headerlist }) => {
  return (
    <Table>
      <TableHeadRow>
        {Array.isArray(headerlist) && headerlist?.map(d =>
          <TableCell key={d} sx={{ fontWeight: "bolder" }}>{d}</TableCell>
        )}
      </TableHeadRow>
      <TableBody>
        {
          children
        }
      </TableBody>
    </Table>
  )
}