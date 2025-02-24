import React, { Fragment, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Box, IconButton, Tooltip, Button, useMediaQuery, List, ListItemButton, ListItemText, Collapse, Divider, Switch } from '@mui/material'
import { ExpandLess, ExpandMore, SkipPrevious, SkipNext, NavigateBefore, NavigateNext } from '@mui/icons-material'

import useAppStore from '../../../../../store/app'
import useSnackbarStore from '../../../../../store/snackbar'
import useAccountStore from '../../../../../store/account'

import { getVlistApi } from 'apis'

import { VideoTable } from '../../../course/page/Home'
import LoadingWrapper from '../../../../elements/wrapper/LoadingWrapper'
import FolderList from '../../../folder/FolderList'
import Path from '../../../folder/Path'
import MarkdownView from '../../../../elements/markdown/MarkdownView'
import VideoControl from '../VideoControl'
import { FolderTitle } from '../../../folder/titledes/TitleDes'


import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { autoPlayAtom } from '../VideoControl'

export default function FolderPlaylist({
  width,
  vid,
  cid,
  notebook_cid,
  player_state,
  isLoading,
}) {
  const [auto] = useAtom(autoPlayAtom)
  const [preview_cid, setPreviewCID] = useState(null)

  const { isDrawerOpen } = useAppStore()
  const { setSnackMsg } = useSnackbarStore()
  const { mid, subclass } = useAccountStore()
  const root_data = subclass?.find(f => f.cname == "新影片收藏清單")

  const navigate = useNavigate()
  let [searchParams, setSearchParams] = useSearchParams()
  let params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });

  const xs = useMediaQuery(!isDrawerOpen ? `(min-width:${768 + width}px)` : `(min-width:${1008 + width}px)`)

  const vlist_query = getVlistApi({ ownerMID: mid, cid: cid })
  const vlist_preview_query = getVlistApi({ ownerMID: mid, cid: preview_cid }, { enabled: !!preview_cid, queryKey: ['getVlistPreview', preview_cid, mid] })
  const { folder, notebook, root } = vlist_query?.data || {}
  const { folder: p_folder, notebook: p_notebook, root: p_root } = vlist_preview_query?.data || vlist_query?.data || {}

  // 自動播放
  useEffect(() => {
    if (player_state == 0 && !!auto) {
      getPerNextVideo(1)
    }
  }, [player_state])

  const now_obj = notebook?.find(f => !!notebook_cid ? f.notebookCID == notebook_cid : f.vid == vid && !f.notebookCID)

  const getPerNextVideo = (num = 1) => {
    let index = notebook?.indexOf((notebook || [])?.find(d => d?.vid == now_obj?.vid && d?.notebookCID == now_obj?.notebookCID))
    let jump_vid = notebook?.[index + num]?.vid
    let jump_cid = notebook?.[index + num]?.notebookCID
    if (Number.isInteger(index) && Number.isInteger(jump_vid)) {
      setSearchParams({ ...params, v: jump_vid, list: p_root?.cid, cid: jump_cid || "", n: jump_cid || "" })
    } else {
      setSnackMsg({ message: `無${num < 0 ? "上" : "下"}一部影片` })
    }
  }

  return (
    <Fragment>
      <Box sx={{ mb: 2 }} className={`flex jcsb ${!xs ? "flex-col" : ""}`}>
        <Button variant='outlined' onClick={() => navigate(`/folder?cid=${cid}`)}>回到影片收藏</Button>
        <VideoControl
          getPerNextVideo={getPerNextVideo}
          width={width}
          isLoading={isLoading}
        />
      </Box>
      <Path data={(!!preview_cid ? p_root : root)} root_cid={root_data?.cid} onClick={(cid) => setPreviewCID(cid)} />
      <Divider sx={{ mt: 2, mb: 2 }} />
      <FolderTitle
        sx={{ mb: 2 }}
        title={(!!preview_cid ? p_root : root)?.vListName}
      />
      {
        !!(!!preview_cid ? p_root : root)?.vListDes &&
        <Box
          sx={{ mb: 2, mt: 2, backgroundColor: "#fff", borderRadius: "10px 10px 10px 10px", border: "1px solid rgba(0, 0, 0, .1)", p: 2 }}
        >
          <MarkdownView source={(!!preview_cid ? p_root : root)?.vListDes} />
        </Box>
      }
      <Box>
        <LoadingWrapper query={vlist_query}>
          <FolderList
            isRoot={(!!preview_cid ? preview_cid : cid) == root_data?.cid}
            pcid={!preview_cid ? (root?.pcid || root_data?.cid) : (p_root?.pcid || root_data?.cid)}
            cid={(!!preview_cid ? p_root : root)?.cid}
            folder={!!preview_cid ? p_folder : folder}
            notebook={!!preview_cid ? p_notebook : notebook}
            onClickBack={({ pcid }) => setPreviewCID(pcid)}
            onClickFold={({ ...data }) => setPreviewCID(data.cid)}
            onClickHome={() => setPreviewCID(null)}
            now_notebook={now_obj?.notebookCID || now_obj?.vid}
          />
        </LoadingWrapper>
      </Box>
    </Fragment>
  )
}
