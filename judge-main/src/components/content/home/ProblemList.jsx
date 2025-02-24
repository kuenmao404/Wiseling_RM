import React, { Fragment, useState } from 'react'
import { Box, Rating, TableBody, Chip } from '@mui/material'
import { Table, TableHeadRow, TableRow, TableCell } from '@/components/elements/ui/Table'
import { useBasicInfiniteQuery } from '@/lib/infiniteQuery'
import { useNavigate } from 'react-router-dom'

import LoadingWrapper from '@/components/elements/wrapper/LoadingWrapper'

import { getProblems } from '../../../apis'

import Searchbar from '@/components/elements/ui/Searchbar'

const counts = 20

function ProblemList() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")

  const { InViewQuery, ...getProblemsApi } = useBasicInfiniteQuery({
    queryKey: ['getProblems', search],
    queryFn: ({ pageParam: page }) => getProblems({ start: (page) * counts + 1, counts, order: "difficulty_a", bTotal: true, like_column: "title", like: search }),
    keyName: 'getProblems',
    counts
  })

  const tansTag = (tag) => typeof tag === "string" ? JSON.parse(tag) : tag

  return (
    <Fragment>
      <h1 className="text-3xl font-bold pt-4">
        公開題目
      </h1>
      <div className='mt-2' />
      <Searchbar onClick={(text) => setSearch(text)} placeholder='搜尋題目...' autoFocus={true} />
      <div className='mt-4' />
      <LoadingWrapper query={getProblemsApi}>
        <Table>
          <TableHeadRow>
          </TableHeadRow>
          <TableBody>
            {Array.isArray(getProblemsApi?.data_arr) && getProblemsApi?.data_arr?.map(data =>
              <TableRow key={data?.pid} onClick={() => navigate(`/problem/${data?.pid}`)}>
                <TableCell align='center' sx={{ width: "130px" }}><Rating value={data?.difficulty} size="small" readOnly /></TableCell>
                <TableCell align='left'>
                  <Box className="flex">
                    {data?.title}{(tansTag(data?.tag) || [])?.map((d, idx) =>
                      <Chip sx={{ ml: 1 }} label={d?.cname} key={idx} size="small" />)}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </LoadingWrapper>
      <InViewQuery sx={{ mt: 1 }} />
    </Fragment>
  )
}

export default ProblemList