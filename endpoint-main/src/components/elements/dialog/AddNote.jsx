import React, { Fragment, useState, useEffect } from 'react'
import { TextField, DialogContent, DialogActions, Button, Box, IconButton, Divider, useMediaQuery, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useSnackbarStore from '../../../store/snackbar'
import useDialogStore from '../../../store/dialog'
import LoadingWrapper from '../wrapper/LoadingWrapper'
import Pagination from '../../elements/Pagination'
import Grid from '@mui/material/Unstable_Grid2'
import { searchVideo, addNoteClass, addYTVideo } from '../../../apis'
import VideoCard from '../../elements/cards/VideoCard'
import SearchBar from '../formitem/SearchBar'

export default function AddNote(props) {
  const [data, setData] = useState({})
  const [isSearchPage, setSearchPage] = useState(false)
  const [video_data, setVideoData] = useState(null)
  const [str, setStr] = useState("")

  const { handleClose } = useDialogStore()
  const navigate = useNavigate()

  const handleChange = (d) => {
    setData({ ...data, ...d })
  }

  const handleSelectVideo = (d) => {
    setVideoData(d)
    handleChange({ vid: d.vid })
    setSearchPage(false)
  }

  const lg = useMediaQuery('(min-width:1200px)')
  const md = useMediaQuery('(min-width:600px)')
  const xs = useMediaQuery('(min-width:500px)')

  const addNoteClassApi = useMutation({ mutationFn: addNoteClass })
  const addYTVideoApi = useMutation({ mutationFn: addYTVideo, onSuccess: () => { } })

  const handleSubmit = () => {
    if (!!ytVidId(str)) {
      addYTVideoApi.mutate({ bPlayList: false, url: str }, {
        onSuccess: (d) => {
          let vid = d?.body?.vid
          addNoteClassApi.mutate({ ...data, vid }, { onSuccess: (d) => d?.body?.status && (navigate(`/watch?v=${vid}&cid=${d?.body?.cid}`), handleClose()) })
        }
      })
    } else {
      addNoteClassApi.mutate({ ...data }, { onSuccess: (d) => d?.body?.status && (navigate(`/watch?v=${data?.vid}&cid=${d?.body?.cid}`), handleClose()) })
    }
  }

  function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    // return (url.match(p)) ? RegExp.$1 : false;
    return (url.match(p)) ? true : false;
  }

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

  return (
    <Fragment>
      <DialogContent dividers>
        <TextField
          label="筆記本名稱"
          variant="standard"
          sx={{ width: "100%", mb: 2 }}
          value={data?.cname || ""}
          placeholder=''
          onChange={(e) => handleChange({ cname: e.target.value })}
          autoFocus
        />
        {video_data !== null &&
          <Box>
            <VideoCard
              sx={{ mt: 2 }}
              v={video_data?.videoID}
              title={video_data?.title}
              viewCount={video_data?.viewCount}
              channelTitle={video_data?.channelTitle}
              isColumn={(!md || !xs)}
              vid={video_data?.vid}
              onClick={() => { }}
            />
            <Button onClick={() => setVideoData(null)} variant='outlined' fullWidth sx={{ mt: 1 }}>重新選擇</Button>
          </Box>
        }
      </DialogContent>
      {video_data == null &&
        <VideoSearch setSearchPage={setSearchPage} handleSelectVideo={handleSelectVideo} str={str} setStr={setStr} parseVideoID={parseVideoID} ytVidId={ytVidId} />
      }
      <DialogActions>
        <Button
          onClick={() => handleSubmit()}
          disabled={!data?.cname || (!video_data && !ytVidId(str))}
        >
          新增
        </Button>
      </DialogActions>
    </Fragment>
  )
}

const VideoSearch = (props) => {
  const { setSearchPage, handleSelectVideo, str, setStr, ytVidId, parseVideoID } = props
  const [search_value, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const counts = 20
  const query = useQuery({
    queryKey: ['searchVideo', search_value, page],
    queryFn: () => searchVideo({ like: search_value, start: (page - 1) * counts + 1, counts }),
    enabled: search_value !== ""
  })

  const lg = useMediaQuery('(min-width:1200px)')
  const md = useMediaQuery('(min-width:600px)')
  const xs = useMediaQuery('(min-width:500px)')

  return (
    <DialogContent dividers>
      <Box className="flex jcsb">
        <Box className="flex-1-1">
          <SearchBar
            value={str}
            placeholder='搜尋影片...'
            onChange={value => setStr(value)}
            onKeyDown={e => e.keyCode == 13 && setSearchValue(e.target.value)}
            handleSummit={(value) => setSearchValue(value)}
          />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
        如果要新增YouTube影片請輸入完整YouTube網址，下方出現影片縮圖代表網址可用
      </Typography>
      <Divider sx={{ mt: 1, mb: 2 }} />
      {ytVidId(str) ?
        <img src={`https://i.ytimg.com/vi/${parseVideoID(str)}/mqdefault.jpg`} /> :
        <Fragment>
          <LoadingWrapper query={query}>
            <Grid container spacing={2} columnSpacing={2} columns={{ md: 12, xl: 12 }}>
              {query?.data?.data?.map((d, index) => (
                <Grid md={12} xl={6} key={d?.videoID} width={"100%"}>
                  <VideoCard
                    v={d?.videoID}
                    title={d?.title}
                    viewCount={d?.viewCount}
                    channelTitle={d?.channelTitle}
                    isColumn={(!md || !xs)}
                    vid={d?.vid}
                    onClick={() => handleSelectVideo(d)}
                  />
                </Grid>
              ))}
            </Grid>
          </LoadingWrapper>
          <Box sx={{ display: "flex", justifyContent: "center", m: 2, mb: 0 }}>
            {Array.isArray(query?.data?.data) &&
              <Pagination
                value={parseInt(page || 1)}
                total={query?.data?.total ? parseInt((query?.data?.total - 1) / counts) + 1 : 1}
                withEllipsis={true}
                ellipsisRange={!!lg ? 3 : !!md ? 2 : xs ? 1 : 0}
                isFixed={true}
                color={"rgb(25, 118, 210)"}
                onChange={({ current }) => setPage(current)}
              />
            }
          </Box>
        </Fragment>
      }
    </DialogContent>
  )
}