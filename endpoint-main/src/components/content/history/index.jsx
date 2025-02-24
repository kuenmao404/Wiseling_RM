import React, { Fragment, useState } from 'react'
import { Box, Divider, useMediaQuery, TextField, IconButton, Button } from '@mui/material'
import VideoCard from '../../elements/cards/VideoCard'
import Grid from '@mui/material/Unstable_Grid2'
import { useQuery } from '@tanstack/react-query'
import { getVideoHistory, getVideoHistoryHeatMap } from '../../../apis'
import Wrapper from '../../elements/wrapper/LoadingWrapper'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import SearchBar from '../../elements/formitem/SearchBar'
import Pagination from '../../elements/Pagination'
import LearningMap, { YearSelect } from '../course/page/LearningMap'
import useAccountStore from '../../../store/account'

const counts = 20

export default function index(props) {
  const { margin, lg, md, xs } = props
  const [value, setValue] = useState(null)
  const [searchstr, setSearchstr] = useState('')
  const [page, setPage] = useState(1)
  const [year, setYear] = useState((new Date()).getFullYear())
  const [date, setDate] = useState(null)

  const { since } = useAccountStore()

  const query = useQuery({
    queryKey: ['getVideoHistory', searchstr, page, date],
    queryFn: () => getVideoHistory({ bTotal: true, start: (page - 1) * counts + 1, counts, like_column: 'title', like: searchstr, date })
  })

  const getVideoHistoryHeatMapApi = useQuery({
    queryKey: ['getVideoHistoryHeatMap', year],
    queryFn: () => getVideoHistoryHeatMap({ year })
  })

  const { total, data } = query?.data || {}

  function onlyUniqueDate(value, index, array) {
    return array.indexOf(array?.filter(f => f.date == value?.date)?.[0]) === index
  }

  return (
    <Box sx={{ m: 2, width: "100%" }}>
      <SearchBar
        value={value || ""}
        onChange={value => setValue(value)}
        onKeyDown={e => e.keyCode == 13 && setSearchstr(e.target.value)}
        placeholder='搜尋影片...'
        autoFocus={true}
        handleSummit={(value) => setSearchstr(value)}
        sx={{ mb: 2 }}
      />
      <Box className="flex jcc" sx={{ mt: 2 }}>
        <YearSelect date={since} year={year} onChange={setYear} />
      </Box>
      <LearningMap
        data={getVideoHistoryHeatMapApi?.data || []}
        onClick={(d) => setDate(d?.date || null)}
        year={year}
      />
      {(searchstr || date) &&
        <Box sx={{ m: 2, ml: 0, mr: 0, mt: 0, mb: 2, fontSize: "14px" }} className="flex jcsb aic">
          <div>
            「{searchstr}{searchstr && '、'}{date}」的查詢結果...
          </div>
          <Button variant='outlined' size='small' onClick={() => (setValue(null), setSearchstr(null), setDate(null))} sx={{ p: 0 }}>清除</Button>
        </Box>
      }
      <Divider sx={{ mt: 1, mb: 2 }} />
      <Wrapper query={query}>
        <Fragment>
          {data?.filter(onlyUniqueDate)?.map(m =>
            <Box sx={{ mb: 2 }} key={m?.date}>
              <Box sx={{ mb: 1, fontSize: "18px" }}><b>{m?.date}</b></Box>
              <Grid container spacing={2} columnSpacing={2} columns={{ md: 12, xl: 12 }}>
                {data?.filter(f => f.date == m.date)?.map((d, idx) => (
                  <Grid md={12} xl={6} key={`${d?.videoID} ${idx}`} sx={{ flex: "1 1 auto" }}>
                    <VideoCard
                      v={d?.videoID}
                      title={d?.title}
                      viewCount={d?.viewCount}
                      channelTitle={d?.channelTitle}
                      isColumn={(!md || !xs)}
                      vid={d?.vid}
                      date={d?.date}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )
          }
        </Fragment>
      </Wrapper>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
