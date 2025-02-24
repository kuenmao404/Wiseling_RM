import React, { Fragment, useState } from 'react'
import Dialog from '../../../elements/dialog/Dialog'
import { Tooltip, Button, Box, useMediaQuery, CardMedia, Card, Divider } from '@mui/material'
import { Add, ExpandMore, ExpandLess, Delete } from '@mui/icons-material'
import SearchBar from '../../../elements/formitem/SearchBar'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getMemberNote, getMemberNoteAdd, addNoteListNote, delNoteListNote } from 'apis'
import Pagination from '../../../elements/Pagination'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { TimeBlock } from '../../../elements/note/NoteItem'
import MarkdownView from '../../../elements/markdown/MarkdownView'
import useAlertStore from '../../../../store/alert'

export default function AddNoteList(props) {
  const { list_cid, refetch } = props
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <Dialog
        open={open}
        title={"新增筆記"}
        content={
          <Content
            list_cid={list_cid}
            refetch={refetch}
          />
        }
        handleClose={() => setOpen(false)}
        isRwdWidth={true}
        contentProps={{ backgroundColor: "#f9f9f9" }}
      />
      <Tooltip title="新增筆記">
        <Button variant='outlined' sx={{ mt: 2, mb: 2 }} onClick={() => setOpen(true)} fullWidth>
          <Add />
        </Button>
      </Tooltip>
    </Fragment>
  )
}

const Content = (props) => {
  const { list_cid, refetch } = props
  const counts = 5
  const [page, setPage] = useState(1)
  const [value, setValue] = useState('')
  const [searchstr, setSearchstr] = useState('')

  const lg = useMediaQuery('(min-width:1200px)')
  const md = useMediaQuery('(min-width:600px)')
  const xs = useMediaQuery('(min-width:500px)')

  const getMemberNoteAddApi = useQuery({ queryKey: ['getMemberNoteAdd', searchstr, page], queryFn: () => getMemberNoteAdd({ start: (page - 1) * counts + 1, counts, searchstr }) })
  const { total, data } = (getMemberNoteAddApi?.data || {})

  return (
    <Fragment>
      <SearchBar
        value={value || ""}
        onChange={value => setValue(value)}
        onKeyDown={e => e.keyCode == 13 && setSearchstr(e.target.value)}
        handleSummit={(value) => setSearchstr(value)}
        placeholder={"搜尋筆記本"}
        autoFocus
      />
      {searchstr &&
        <Fragment>
          <Box sx={{ m: 2, ml: 0, mr: 0, fontSize: "14px" }} className="flex jcsb aic">
            <div>
              「{searchstr}」的查詢結果...
            </div>
            <Button variant='outlined' size='small' onClick={() => (setValue(null), setSearchstr(null), setPage(1))} sx={{ p: 0 }}>清除</Button>
          </Box>
          <Divider sx={{ mb: 0 }} />
        </Fragment>
      }
      <Box>
        <LoadingWrapper query={getMemberNoteAddApi}>
          <Fragment>
            {Array.isArray(data) && data?.map(d =>
              <VideoBlock
                key={d?.cid}
                data={d}
                list_cid={list_cid}
                refetch={refetch}
                lg={lg}
                md={md}
                xs={xs}
              />)
            }
          </Fragment>
        </LoadingWrapper>
      </Box>
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
    </Fragment>
  )
}

const VideoBlock = (props) => {
  const { data, list_cid, lg, md, xs, refetch } = props
  const [expand, setExpand] = useState(false)

  const { cid, cname, vid, videoID, title, lastModifiedDT, nO, nO_Search, bSearchTitle } = (data || {})

  const getMemberNoteApi = useQuery({
    queryKey: ['getMemberNote', list_cid, vid, expand, cid],
    queryFn: () => getMemberNote({ cid: list_cid, vid, notebookCID: cid }), enabled: !!expand
  })

  return (
    <Card sx={{ mt: 2, flexDirection: !lg ? "column" : "row" }} className='flex'>
      <Box sx={{ borderRight: !lg ? null : "1px solid rgba(0, 0, 0, .1)", borderBottom: !lg ? "1px solid rgba(0, 0, 0, .1)" : null }} className="flex jcc">
        <Box>
          <CardMedia
            component="img"
            sx={{ width: "300px" }}
            image={`https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`}
          />
        </Box>
      </Box>
      <Box sx={{ p: 1 }} className="flex flex-col flex-1-1">
        <Box sx={{ fontSize: "18px", whiteSpace: "pre-wrap" }}>
          <b>{data?.cname} - </b><span style={{ color: "#606060" }}>{data?.title}</span>
        </Box>
        <Box className="flex-1-1">
          <Box sx={{ mt: 1, fontSize: "14px" }}>筆記數：({nO}){!!nO_Search && <span>、符合搜尋的筆記數：({nO_Search})</span>}</Box>
          <LoadingWrapper query={getMemberNoteApi}>
            <Fragment>
              {getMemberNoteApi?.data?.map(d =>
                <MarkdownBlock
                  key={d?.nid}
                  d={d}
                  list_cid={list_cid}
                  refetch={() => (getMemberNoteApi?.refetch(), refetch())}
                />)
              }
            </Fragment>
          </LoadingWrapper>
        </Box>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Button className="flex jcc aic" onClick={() => setExpand(!expand)}>
          {!expand ?
            <Fragment>展開筆記<ExpandMore /></Fragment> :
            <Fragment>收折筆記<ExpandLess /></Fragment>
          }
        </Button>
      </Box>
    </Card>
  )
}

const MarkdownBlock = (props) => {
  const { d, refetch, list_cid } = props
  const [isHover, setHover] = useState(false)
  const { setAlert } = useAlertStore()

  const addNoteListNoteApi = useMutation({ mutationFn: addNoteListNote, onSuccess: () => refetch() })
  const delNoteListNoteApi = useMutation({ mutationFn: delNoteListNote, onSuccess: () => refetch() })

  const handleDelButton = (d) => {
    setAlert({
      title: "移除清單",
      content: `確定要移除清單？`,
      handleAgree: (callback) => (delNoteListNoteApi?.mutate({ cid: list_cid, nid: d?.nid }), callback())
    })
  }

  return (
    <Box
      sx={{ mt: 2, border: isHover ? "1px solid rgba(0, 0, 0, .2)" : "1px solid rgba(0, 0, 0, 0)", p: 1, transition: "all .2s" }}
      key={d?.nid}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box sx={{ mb: 1 }} className="flex jcsb aic">
        <TimeBlock start={d?.startTime} />
        {!d?.bExists ?
          <Button size='small' variant='outlined' onClick={() => addNoteListNoteApi?.mutate({ cid: list_cid, nid: d?.nid })} disabled={addNoteListNoteApi?.isPending}>
            <Add fontSize='small' />加入清單
          </Button> :
          <Button
            size='small'
            variant='outlined'
            color={'error'}
            onClick={() => handleDelButton(d)}
            disabled={delNoteListNoteApi?.isPending}
          >
            <Delete fontSize='small' />移出清單
          </Button>
        }
      </Box>
      <MarkdownView
        source={d?.content}
      />
    </Box>
  )
}