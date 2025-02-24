import React, { useState, Fragment, useEffect } from 'react'
import { Box, Button, Divider, TableBody, CardMedia, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { ViewList, ViewModule, Book as BookIcon, YouTube as YouTubeIcon } from '@mui/icons-material'
import NoteCard from '../../elements/cards/NoteCard'
import { getNoteClass, getMyNotebook } from '../../../apis'
import Wrapper from '../../elements/wrapper/LoadingWrapper'
import useDialogStore from '../../../store/dialog'
import AddNote from '../../elements/dialog/AddNote'
import SearchBar from '../../elements/formitem/SearchBar'
import useAccountStore from '../../../store/account'
import { useBasicInfiniteQuery } from '../../../lib/infiniteQuery'
import { Table, TableHeadRow, TableRow, TableCell } from '../../elements/table/Table'
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Link, useNavigate } from 'react-router-dom'

const ToggleGroupAtom = atomWithStorage("ToggleGroupAtom", "list")

const counts = 36;

export default function index(props) {
  const { width, width_margin, margin, xs } = props
  const [toggle_value, setToggleValue] = useAtom(ToggleGroupAtom)

  const { setDialog } = useDialogStore()
  const { mid } = useAccountStore()

  const [value, setValue] = useState(null)
  const [search_value, setSearchValue] = useState(null)

  const navigate = useNavigate()

  const {
    data_arr,
    InViewQuery,
  } = useBasicInfiniteQuery({
    queryKey: ['getMyNotebook', search_value],
    queryFn: ({ pageParam: page }) => getMyNotebook({
      order: "lastModifiedDT_d,nO_d", like: search_value, like_column: "search_str", bTotal: true, start: (page) * counts + 1, counts
    }),
    keyName: "getMyNotebook",
    counts,
  })

  const openAddNoteDialog = () => {
    setDialog({
      title: "建立筆記本",
      body: <AddNote />,
      isRwdWidth: true,
    })
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box className="flex jcsb aic" sx={{ m: 2, mb: 0 }}>
        <Box className="flex-1-1">
          <SearchBar
            value={value || ""}
            onChange={value => setValue(value)}
            onKeyDown={e => e.keyCode == 13 && setSearchValue(e.target.value)}
            placeholder='搜尋筆記本...'
            // autoFocus={true}
            handleSummit={(value) => setSearchValue(value)}
          />
        </Box>
      </Box>
      {search_value &&
        <Box sx={{ m: 2, ml: margin, mr: margin, mb: 0, fontSize: "14px" }} className="flex jcsb aic">
          <div>
            「{search_value}」的查詢結果...
          </div>
          <Button variant='outlined' size='small' onClick={() => (setValue(null), setSearchValue(null))} sx={{ p: 0 }}>清除</Button>
        </Box>
      }
      <Divider sx={{ m: margin, mt: 2, mb: 0 }} />
      <Box className="flex jcsb aic" sx={{ m: margin, mb: 0 }}>
        <ToggleButtonGroup value={toggle_value} onChange={(e, nextView) => nextView !== null && setToggleValue(nextView)} size="small" exclusive>
          <ToggleButton value="list">
            <ViewList fontSize='small' />
          </ToggleButton>
          <ToggleButton value="module">
            <ViewModule fontSize='small' />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" color="success" onClick={() => openAddNoteDialog()}>
          {xs ? "建立筆記本" : <AddIcon />}
        </Button>
      </Box>
      {toggle_value == "list" ?
        <Box sx={{ m: margin }}>
          <Table>
            <TableHeadRow />
            <TableBody>
              {Array.isArray(data_arr) && data_arr?.map(d =>
                <NotebookTableItem key={d?.cid} data={d} onClick={() => navigate(`/watch?v=${d?.vid}${!!d?.cid ? `&cid=${d?.cid}` : ""}`)} />
              )}
            </TableBody>
          </Table>
        </Box> :
        <Box sx={{ mt: 0 }} className="flex fww">
          {data_arr?.map(d => // ?.filter(d => d?.nO > 0)
            <NoteCard
              key={d?.cid}
              sx={{ width: width_margin, margin }}
              cid={d?.cid}
              videoId={d?.videoID}
              vid={d?.vid}
              title={`${d?.cname} (${d?.nO})`}
              content={d?.title}
              lastModifiedDT={d?.lastModifiedDT}
            />
          )}
        </Box>
      }
      <Box sx={{ m: margin, mt: 0 }}>
        <InViewQuery />
      </Box>
    </Box>
  )
}


const NotebookTableItem = (props) => {
  const { onClick, otherCells } = props
  const { videoID, vid, cname, lastModifiedDT, nO, title, cid, viewCount } = props?.data

  return (
    <TableRow onClick={onClick}>
      <TableCell sx={{ maxWidth: "150px" }}>
        <CardMedia
          component="img"
          sx={{ height: "50px", width: "auto" }}
          image={`https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`}
        />
      </TableCell>
      <TableCell>
        <div className='flex'>
          <Tooltip
            title={
              <div>
                {(cname !== null && cname !== undefined) && <div>筆記本：{cname} ({nO} 個筆記)</div>}
                <div>影片標題：{title}</div>
              </div>
            }
          >
            <div>
              {(cid !== null && cid !== undefined) ?
                <div className='flex aic'>
                  <BookIcon fontSize='small' color="secondary" />
                  <span className='max-line-1'>
                    &ensp;
                    {(cname !== null && cname !== undefined) && <b>{cname}<span style={{ color: "#3f51b5" }}>&ensp;({nO})</span>&ensp;-&ensp;</b>}
                    <span style={{ color: "#606060" }}>{title}</span>
                  </span>
                </div> :
                <span className='flex aic'>
                  <YouTubeIcon fontSize='small' color="error" />&ensp;<b>{title}</b>&ensp;<span style={{ color: "#606060", fontSize: "12px" }}>(觀看次數：{viewCount})</span>
                </span>
              }
            </div>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <Tooltip title={`上次編輯時間：${lastModifiedDT}`}>
          <span>{lastModifiedDT}</span>
        </Tooltip>
      </TableCell>
      {!!otherCells &&
        otherCells
      }
    </TableRow>
  )
}

export { NotebookTableItem }