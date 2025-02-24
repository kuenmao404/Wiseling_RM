import React, { Fragment, useEffect, useState } from 'react'
import {
  Box, Button, DialogActions, DialogContent, TableBody, Checkbox, Divider, MenuItem, FormControl, Select, InputLabel,
  Typography, Radio, FormControlLabel, ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import {
  Book as BookIcon, YouTube as YouTubeIcon, Link as LinkIcon,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'

import SearchBar from '../../../elements/formitem/SearchBar'
import { useBasicInfiniteQuery } from '../../../../lib/infiniteQuery'
import { getMyNotebook, addVlistNotebookApi, searchVideo } from '../../../../apis'
import { Table, TableHeadRow, TableRow, TableCell, tablerow_sx } from '../../../elements/table/Table'
import { NotebookTableItem } from '../../note'
import { useQuery } from '@tanstack/react-query'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { parseVideoID, ytVidId, ytPlaylistId } from '../../../../lib/youtube'
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const foldlinkAtom = atomWithStorage("FoldLink", true)

const counts = 30;

const AddNotebook = ({
  cid,
  handleClose,
  notebook,
  onAddNotebook,
  isPending,
}) => {
  const [value, setValue] = useState("")
  const [search_value, setSearchValue] = useState(null)
  const [check_obj, setCheckObj] = useState({})
  const [check_vid_obj, setCheckVidObj] = useState({})
  const [check_cid_del, setCheckCIDDel] = useState({})
  const [check_vid_del, setCheckVIDDel] = useState({})
  const [notebook_cid, setNotebookCID] = useState("")
  const [isAddNotebook, setIsAddNotebook] = useAtom(foldlinkAtom)
  const [isAddPlaylist, setIsAddPlaylist] = useState(false)

  const transSortStr = (obj = {}) => Object.keys(obj).filter(key => obj[key]).join(",");
  const checkObjTrue = (obj = {}) => !!Object.keys(obj).find(key => obj[key]);

  const {
    data_arr,
    InViewQuery,
  } = useBasicInfiniteQuery({
    queryKey: ['getMyNotebook', search_value, isAddNotebook],
    queryFn:
      ({ pageParam: page }) => !!isAddNotebook ?
        getMyNotebook({
          order: "lastModifiedDT_d,nO_d", like: search_value, like_column: "search_str", bTotal: true, start: (page) * counts + 1, counts
        }) :
        searchVideo({ like: search_value, start: (page) * counts + 1, counts }),
    keyName: "getMyNotebook",
    enabled: (!ytVidId(search_value || "") && !ytPlaylistId(search_value || "")),
    counts
  })

  const getVideoNoteBookApi = useQuery({
    queryKey: ["getVideoNoteBook", parseVideoID(search_value || "")],
    queryFn: () => getMyNotebook({ videoID: parseVideoID(search_value || ""), order: "bDefault_d,lastModifiedDT_d,nO_d" }),
    enabled: (!!ytVidId(search_value || "")),
  })

  useEffect(() => {
    if (Array.isArray(getVideoNoteBookApi?.data) && getVideoNoteBookApi?.data?.length > 0) {
      setNotebookCID("")
    } else if (Array.isArray(getVideoNoteBookApi?.data)) {
      setNotebookCID("")
    }
  }, [getVideoNoteBookApi?.data])

  // 清除搜尋結果時如果從是YT變成不是YT變回搜尋筆記本
  useEffect(() => {
    if (!!ytPlaylistId(search_value || "") && !ytVidId(search_value || "")) {
      setIsAddPlaylist(true)
    } else {
      setIsAddPlaylist(false)
    }
  }, [ytPlaylistId(search_value || ""), ytVidId(search_value || "")])

  const handleSubmitNotebook = (isYT = false) => {
    if (!isYT) {
      onAddNotebook({ cid, idstr: transSortStr(!!isAddNotebook ? check_obj : check_vid_obj), mode: !!isAddNotebook ? "notebook" : "video" }, () => handleClose())
    } else {
      if (!isAddPlaylist) {
        if (notebook_cid !== "") {
          onAddNotebook({ cid, idstr: notebook_cid.toString() }, () => handleClose())
        } else {
          onAddNotebook({ cid, bYoutube: true, url: search_value, mode: "video" }, () => handleClose())
        }
      } else {
        onAddNotebook({ cid, bYoutube: true, url: search_value, bPlayList: true, mode: "video" }, () => handleClose())
      }
    }
  }

  return (
    <Fragment>
      <DialogContent dividers>
        <Box className="flex jcsb aic" sx={{ m: 2, mb: 0 }}>
          <Box className="flex-1-1">
            <SearchBar
              value={value || ""}
              onChange={value => setValue(value)}
              onKeyDown={e => e.keyCode == 13 && setSearchValue(e.target.value)}
              placeholder='搜尋筆記本或YouTube影片...'
              autoFocus={true}
              handleSummit={(value) => setSearchValue(value)}
            />
          </Box>
        </Box>
        {search_value &&
          <Box sx={{ m: 2, ml: 2, mr: 2, mb: 0, fontSize: "14px" }} className="flex jcsb aic">
            <Box sx={{ lineBreak: "anywhere" }}>
              「{search_value}」的查詢結果...
            </Box>
            <Button variant='outlined' size='small' onClick={() => (setValue(null), setSearchValue(null))} sx={{ p: 0 }}>清除</Button>
          </Box>
        }
        <Divider sx={{ m: 2, mt: 2, mb: 0 }} />
        {(!ytVidId(search_value || "") && !ytPlaylistId(search_value || "")) ?
          <Fragment>
            <Box sx={{ m: 2, mt: 0, mb: -2 }}>
              <ToggleButtonGroup
                value={isAddNotebook}
                onChange={(e, nextView) => (nextView !== null && setIsAddNotebook(nextView))}
                size="small"
                exclusive sx={{ mt: 1, mb: 1 }}
              >
                <ToggleButton value={false}>
                  <YouTubeIcon fontSize='small' />站內影片
                </ToggleButton>
                <ToggleButton value={true}>
                  <BookIcon fontSize='small' />我的筆記本
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ m: 2 }}>
              <Table>
                <TableHeadRow />
                <TableBody>
                  {isAddNotebook === 2 && notebook?.map(d => // 已連結筆記本/影片
                    <NotebookTableItem
                      key={d?.notebookCID || d?.vid}
                      data={{ ...d, cname: d?.notebookName, cid: d?.notebookCID }}
                      otherCells={
                        <TableCell>
                          <Checkbox
                            checked={(!!d?.notebookCID ? !check_cid_del?.[d?.notebookCID] : !check_vid_del?.[d?.vid])}
                            onChange={(event) =>
                              !!d?.notebookCID ?
                                setCheckCIDDel({ ...check_cid_del, [d?.notebookCID]: !event.target.checked }) :
                                setCheckVIDDel({ ...check_vid_del, [d?.vid]: !event.target.checked })
                            }
                          />
                        </TableCell>
                      }
                    />
                  )}
                  {isAddNotebook !== 2 && Array.isArray(data_arr) && data_arr?.map(d =>
                    (isAddNotebook === true ?
                      notebook?.map(e => e?.notebookCID).indexOf(d?.cid) === -1 :
                      notebook?.filter(f => f.notebookCID == null)?.map(e => e?.vid).indexOf(d?.vid) === -1
                    ) &&
                    <NotebookTableItem
                      key={d?.cid || d?.vid}
                      data={d}
                      onClick={() =>
                        !!isAddNotebook ?
                          setCheckObj({ ...check_obj, [d?.cid]: !check_obj?.[d?.cid] }) :
                          setCheckVidObj({ ...check_vid_obj, [d?.vid]: !check_vid_obj?.[d?.vid] })
                      }
                      otherCells={
                        <TableCell>
                          <Checkbox
                            checked={(!!isAddNotebook ? check_obj?.[d?.cid] : check_vid_obj?.[d?.vid]) || false}
                            onChange={(event) =>
                              !!isAddNotebook ?
                                setCheckObj({ ...check_obj, [d?.cid]: event.target.checked }) :
                                setCheckVidObj({ ...check_vid_obj, [d?.vid]: event.target.checked })
                            }
                          />
                        </TableCell>
                      }
                    />
                  )}
                </TableBody>
              </Table>
              <Box sx={{ mt: 1 }}>
                <InViewQuery />
              </Box>
            </Box>
          </Fragment> :
          <Box sx={{ m: 2 }}>
            {!!parseVideoID(search_value || "") &&
              <Fragment>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  如果要新增YouTube影片請輸入完整YouTube網址，下方出現影片縮圖代表網址可用
                </Typography>
                <img src={`https://i.ytimg.com/vi/${parseVideoID(search_value)}/mqdefault.jpg`} />
              </Fragment>
            }
            <LoadingWrapper query={getVideoNoteBookApi}>
              <Fragment>
                {ytPlaylistId(search_value || "") &&
                  <div>{Array.isArray(getVideoNoteBookApi?.data) &&
                    <FormControlLabel
                      checked={isAddPlaylist == false}
                      onChange={() => setIsAddPlaylist(false)}
                      value={false}
                      control={<Radio />}
                      label="筆記本/影片"
                    />}
                    <FormControlLabel
                      checked={isAddPlaylist == true}
                      onChange={() => setIsAddPlaylist(true)}
                      value={true}
                      control={<Radio />}
                      label="播放清單"
                    />
                  </div>
                }
                {!!parseVideoID(search_value || "") && !isAddPlaylist &&
                  <FormControl sx={{ mt: 2, minWidth: 120 }} size="small" variant="filled" fullWidth>
                    <InputLabel shrink>選擇筆記本</InputLabel>
                    <Select
                      label="選擇筆記本"
                      value={notebook_cid}
                      onChange={(e) => setNotebookCID(e.target.value)}
                      displayEmpty={true}
                      defaultOpen={Array.isArray(getVideoNoteBookApi?.data) && getVideoNoteBookApi?.data?.length > 0}
                    >
                      <MenuItem value=""><em>單純連結影片</em></MenuItem>
                      {Array.isArray(getVideoNoteBookApi?.data) && getVideoNoteBookApi?.data?.length > 0 && getVideoNoteBookApi?.data?.map(({ cname, nO, title, cid }) =>
                        <MenuItem value={cid} key={cid}><b>{cname} <span style={{ color: "#3f51b5" }}>({nO})</span> - </b><span style={{ color: "#606060" }}>{title}</span></MenuItem>
                      )}
                    </Select>
                  </FormControl>
                }
                {!isAddNotebook &&
                  <Typography variant="body1">加入YouTube播放清單中的影片 (最多500部)</Typography>
                }
              </Fragment>
            </LoadingWrapper>
          </Box>
        }
      </DialogContent>
      <DialogActions>
        {!ytVidId(search_value || "") && !ytPlaylistId(search_value || "") ?
          <LoadingButton
            onClick={() => handleSubmitNotebook(false)}
            disabled={!!isAddNotebook ? !checkObjTrue(check_obj) : !checkObjTrue(check_vid_obj)}
            loading={isPending}
          >
            完成
          </LoadingButton> :
          <LoadingButton
            onClick={() => handleSubmitNotebook(true)}
            // disabled={!!isAddNotebook && notebookName?.trim()?.length == 0}
            loading={isPending}
          >
            完成
          </LoadingButton>
        }
      </DialogActions>
    </Fragment>
  )
}

export default AddNotebook