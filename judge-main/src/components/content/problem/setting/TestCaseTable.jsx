import React from 'react'
import { TableCell, TableBody, TableRow, Box, Button, duration } from '@mui/material'
import { Table, TableHeadRow, tablerow_sx } from '../../../elements/ui/Table'
import MarkdownPreview from '../../../elements/markdown/MarkdownPreview'
import useAlertStore from '../../../../store/alert'
import TestCaseContent from './TestCaseContent'

export default function TestCaseTable({ data, handleDelete }) {
  const { setAlert } = useAlertStore()

  const handleDeleteButton = (d) => {
    setAlert({
      title: "刪除測資",
      content: `刪除測資後無法復原，確定要刪除測資嗎？`,
      handleAgree: (callback) => {
        handleDelete(d)
        callback()
      }
    })
  }

  return (
    <Table>
      <TableHeadRow>
        <TableCell sx={{ fontWeight: "bolder" }}>上傳者</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>Input</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>Output</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>上傳時間</TableCell>
        <TableCell sx={{ fontWeight: "bolder" }}>功能</TableCell>
      </TableHeadRow>
      <TableBody>
        {Array.isArray(data) &&
          data?.map(d =>
            <TableRow key={d?.tcid} sx={tablerow_sx}>
              <TableCell>
                {d?.owner}
              </TableCell>
              <TableCell>
                <TestCaseContent content={d?.input} maxHeight='400px' />
              </TableCell>
              <TableCell>
                <TestCaseContent content={d?.output} />
              </TableCell>
              <TableCell>
                {d?.since ?? 'N/A'}
              </TableCell>
              <TableCell>
                <div>
                  <Button size='small' color={"error"} onClick={() => handleDeleteButton(d)}>
                    刪除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        }
      </TableBody>
    </Table>
  )
}
