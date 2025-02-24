import React, { Fragment, useState } from 'react'
import { DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, Typography, Box, TextField, Button, Tooltip, TableRow, TableCell, IconButton, Chip } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useMutation, useQuery } from '@tanstack/react-query'
import { searchVideo, getCodeTopicForAdd, searchCourseVideo } from '../../../../apis'
import SearchBar from '../../../elements/formitem/SearchBar'
import Pagination from '../../../elements/Pagination'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import VideoCard from '../../../elements/cards/VideoCard'
import useDialogStore from '../../../../store/dialog'
import CodeList, { CodeBlock } from '../../../elements/code/CodeList'
import VideoTable, { ImgCell } from '../../../elements/table/VideoTable'
import { Add, Remove } from '@mui/icons-material'

export default function AddChapterVideo(props) {
  const { lg, md, xs, addVideo, isPending, isCode = false, courseCID, cid, isCourse = false, delVideo } = props
  const [selectedValue, setSelectedValue] = useState('vid');
  const [str, setStr] = useState("")
  const [search_value, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [select_data, setSelectData] = useState(null)
  const [bPlayList, setbPlayList] = useState(false)
  const [url, setUrl] = useState(null)
  const { handleClose } = useDialogStore()
  const counts = 20

  const query = !isCourse ? useQuery({
    queryKey: ['searchVideo', search_value, page],
    queryFn: () => searchVideo({ like: search_value, start: (page - 1) * counts + 1, counts }),
    enabled: search_value !== "" && !ytVidId(str)
  }) : useQuery({
    queryKey: ['searchCourseVideo', search_value, page],
    queryFn: () => searchCourseVideo({ searchstr: search_value, start: (page - 1) * counts + 1, courseCID, cid, counts }),
    enabled: !ytVidId(str),
  })

  const handleChange = (event) => {
    setSelectData(null);
    setSelectedValue(event.target.value);
  };

  const parseVideoID = (string) => {
    let videoID = string
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .replace("youtu.be/", "youtube.com/watch?v=")
      .split("/")
      .splice(1)
      .join("");

    videoID = videoID.substring(8, 19);

    return videoID;
  };

  function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    // return (url.match(p)) ? RegExp.$1 : false;
    return (url.match(p)) ? true : false;
  }

  function ytPlaylistId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|playlist\/|watch\?list=|watch\?.+&list=))((\w|-){11})(?:\S+)?$/;
    // return (url.match(p)) ? RegExp.$1 : false;
    return (url.match(p)) ? true : false;
  }

  const selectType = () => {
    switch (selectedValue) {
      case 'vid':
      case 'url':
        return 18
      case 'code':
        return 20
      default:
        return null

    }
  }

  return (
    <Fragment>
      <DialogContent sx={{ minHeight: 200 }} dividers className=''>
        <RadioGroup
          value={selectedValue}
          onChange={e => handleChange(e)}
          className='flex'
          sx={{ flexDirection: "row" }}
        >
          {!!isCode && <FormControlLabel value="vid" control={<Radio />} label="本站/YouTube網址搜尋" />}
          {/* <FormControlLabel value="url" control={<Radio />} label="YouTube網址" /> */}
          {isCode && <FormControlLabel value="code" control={<Radio />} label="程式解題題目" />}
        </RadioGroup>
        {
          selectedValue == "vid" && (
            select_data !== null ?
              <Box>
                <VideoCard
                  v={select_data?.videoID}
                  title={select_data?.title}
                  viewCount={select_data?.viewCount}
                  channelTitle={select_data?.channelTitle}
                  isColumn={(!md || !xs)}
                  vid={select_data?.vid}
                  onClick={() => { }}
                />
                <Box sx={{ mt: 1 }} className="flex jcc">
                  <Button onClick={() => setSelectData(null)} variant='contained'>重新選擇</Button>
                </Box>
              </Box>
              :
              <Box>
                <SearchBar
                  value={str}
                  onChange={(value) => setStr(value)}
                  handleSummit={(value) => (setSearchValue(value), setPage(1))}
                  placeholder="搜尋影片..."
                  autoFocus
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  如果要新增YouTube影片請輸入完整YouTube網址，下方出現影片縮圖代表網址可用
                </Typography>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {!ytVidId(str) &&
                    <LoadingWrapper query={query}>
                      <VideoTable
                        head={['縮圖', '標題', '功能']}
                        body={
                          <Fragment>
                            {query?.data?.data?.map((d, index) =>
                              <TableRow key={d?.vid}>
                                <ImgCell src={`https://i.ytimg.com/vi/${d?.videoID}/mqdefault.jpg`} />
                                <TableCell>
                                  <Box>{d?.title}&ensp;{d?.nO && <Tooltip title={`筆記數量 ${d?.nO}`}><Chip label={`筆記 ${d?.nO}`} size='small' /></Tooltip>}</Box>
                                  <Typography variant="subtitle1" color="text.secondary" component="div">
                                    {d?.channelTitle}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {!d?.bChoose ?
                                    <IconButton
                                      color={'success'}
                                      onClick={() => addVideo({ bYoutube: false, vid: d?.vid, bPlayList: false, type: 18 }, query.refetch)}
                                      disabled={isPending}
                                    >
                                      <Add />
                                    </IconButton> :
                                    <IconButton color={"error"} onClick={() => delVideo({ ...d, type: 18 }, query.refetch)} disabled={isPending}><Remove /></IconButton>
                                  }
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        }
                      />
                    </LoadingWrapper>
                  }
                </Box>
                {!ytVidId(str) && query?.data &&
                  <Box sx={{ display: "flex", justifyContent: "center", m: 2, mb: 0 }}>
                    <Pagination
                      value={parseInt(page || 1)}
                      total={query?.data?.total ? parseInt((query?.data?.total - 1) / counts) + 1 : 1}
                      withEllipsis={true}
                      ellipsisRange={!!lg ? 3 : !!md ? 2 : xs ? 1 : 0}
                      isFixed={true}
                      color={"rgb(25, 118, 210)"}
                      onChange={({ current }) => setPage(current)}
                    />
                  </Box>
                }
              </Box>)
        }
        {
          (!!ytVidId(str)) &&
          <Box>
            {!!str && <img src={`https://i.ytimg.com/vi/${parseVideoID(str)}/mqdefault.jpg`} />}
            {ytPlaylistId(str) &&
              <RadioGroup
                value={bPlayList ? "1" : "0"}
                onChange={e => setbPlayList(e.target.value == "0" ? false : true)}
                className='flex'
                sx={{ flexDirection: "row" }}
              >
                <FormControlLabel value={"0"} control={<Radio />} label="影片" />
                <FormControlLabel value={"1"} control={<Radio />} label="播放清單" />
              </RadioGroup>
            }
            {/**bPlayList */}
          </Box>
        }
        {
          selectedValue == "code" &&
          (select_data == null ?
            <CodeSelect
              lg={lg}
              md={md}
              xs={xs}
              onClick={(d) => setSelectData(d)}
              courseCID={courseCID}
              cid={cid}
              addVideo={addVideo}
              delVideo={delVideo}
            /> :
            <Box>
              <CodeList
                body={
                  <CodeBlock data={select_data} />
                }
              />
              <Box sx={{ mt: 1 }} className="flex jcc">
                <Button onClick={() => setSelectData(null)} variant='contained'>重新選擇</Button>
              </Box>
            </Box>
          )
        }
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() =>
            addVideo({ bYoutube: !!ytVidId(str), url: str, vid: select_data?.vid || select_data?.pid, bPlayList: (ytPlaylistId(str) && bPlayList), type: selectType() }, handleClose)
          }
          loading={isPending}
          disabled={isPending || (!ytVidId(str) && !select_data?.vid && !select_data?.pid)}
        >
          新增
        </LoadingButton>
      </DialogActions>
    </Fragment >
  )
}

const CodeSelect = (props) => {
  const { lg, md, xs, onClick, courseCID, cid, addVideo, delVideo } = props
  const [str, setStr] = useState("")
  const [search_value, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const counts = 10

  const query = useQuery({
    queryKey: ['getCodeTopic', search_value, page],
    queryFn: () => getCodeTopicForAdd({ courseCID, cid, like: search_value, start: (page - 1) * counts + 1, counts }),
    // enabled: search_value !== ""
  })

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <SearchBar
          value={str}
          onChange={(value) => setStr(value)}
          handleSummit={(value) => setSearchValue(value)}
          placeholder="搜尋程式解題題目..."
          autoFocus
        />
      </Box>
      {!!search_value &&
        <Box>
          「{search_value}」的搜尋結果...
        </Box>
      }
      <LoadingWrapper query={query}>
        <CodeList
          body={
            <Fragment>
              {Array.isArray(query?.data?.data) && (query?.data?.data || [])?.map(d =>
                <CodeBlock
                  key={d?.pid}
                  data={d}
                  onClick={() => { }}
                  enabled={!d?.bChoose}
                  bChoose={d?.bChoose}
                  bRecommend={d?.bRecommend}
                  expand={
                    <TableCell align="left">
                      {!d?.bChoose ?
                        <IconButton
                          color={'success'}
                          onClick={() => addVideo({ bYoutube: false, vid: d?.pid, bPlayList: false, type: 20 }, query.refetch)}
                        >
                          <Add />
                        </IconButton> :
                        <IconButton color={"error"} onClick={() => delVideo({ ...d, vid: d?.pid, type: 20 }, query.refetch)}>
                          <Remove />
                        </IconButton>
                      }
                    </TableCell>
                  }
                />
              )}
            </Fragment>
          }
        />
      </LoadingWrapper>
      <Box sx={{ display: "flex", justifyContent: "center", m: 2, mb: 0 }}>
        <Pagination
          value={parseInt(page || 1)}
          total={query?.data?.total ? parseInt((query?.data?.total - 1) / counts) + 1 : 1}
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

