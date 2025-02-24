import React, { useCallback, useEffect, useRef } from 'react'
import { Box, Divider, IconButton, Button } from '@mui/material'
import { VerticalAlignTopOutlined as VerticalAlignTopOutlinedIcon } from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import { getVlistApi, editVlistApi, addVlistApi, delVlistApi, addVlistNotebookApi, sortVlistApi, moveVlistApi, sortVlistNotebookApi, delVlistNotebookApi, updateVlistNotebookApi } from '../../../apis'
import useAccountStore from '../../../store/account'
import Path from './Path'
import FolderList from './FolderList'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import TitleDes from './titledes/TitleDes'

import { useAtom } from 'jotai'
import { atomWithStorage } from "jotai/utils"
import { settingAtom } from './titledes/TitleDes'

const folderAtom = atomWithStorage("folder", null)

export default function index(props) {
  const { margin, width } = props
  const { mid, subclass } = useAccountStore()
  const root_data = subclass?.find(f => f.cname == "新影片收藏清單")
  const [searchParams, setSearchParams] = useSearchParams()
  const [folder_cid, setFolderCID] = useAtom(folderAtom)
  const cid = searchParams.get('cid') || folder_cid || root_data?.cid

  const [isSetting, setSetting] = useAtom(settingAtom)
  useEffect(() => {
    setSetting(false)
  }, [])

  const vlist_query = getVlistApi({ ownerMID: mid, cid: cid })
  const { folder, notebook, root } = vlist_query?.data || {}

  const editVlist = editVlistApi({ onSuccess: () => vlist_query?.refetch() })
  const addVlist = addVlistApi({ onSuccess: () => vlist_query?.refetch() })
  const delVlist = delVlistApi()
  const addVlistNotebook = addVlistNotebookApi({ onSuccess: () => vlist_query?.refetch() })
  const sortVlist = sortVlistApi({ onSuccess: () => vlist_query?.refetch() })
  const moveVlist = moveVlistApi({ onSuccess: () => vlist_query?.refetch() })
  const sortVlistNotebook = sortVlistNotebookApi({ onSuccess: () => vlist_query?.refetch() })
  const delVlistNotebook = delVlistNotebookApi({ onSuccess: () => vlist_query?.refetch() })
  const updateVlistNotebook = updateVlistNotebookApi({ onSuccess: () => vlist_query?.refetch() })

  const handleEditVlist = ({ vListDes, vListName }, callback) => {
    editVlist.mutate({ cid, vListDes, vListName }, { onSuccess: (res) => res?.body?.status && callback() })
  }

  const handleAddVlist = ({ vListDes, vListName }, callback) => {
    addVlist.mutate({ cid, vListDes, vListName }, { onSuccess: (res) => res?.body?.status && callback() })
  }

  const handleDelVlist = ({ pcid }, callback) => {
    delVlist.mutate({ cid }, { onSuccess: (res) => res?.body?.status && (callback?.(), setSearchParams({ cid: pcid })) })
  }

  const handleSubmitNotebook = ({ cid, notebookCIDstr, ...data }, callback) => {
    addVlistNotebook.mutate({ cid, notebookCIDstr, ...data }, { onSuccess: (res) => res?.body?.status && callback() })
  }

  const sortFolder = (data, callback) => {
    sortVlist.mutate(data, { onSuccess: (res) => callback?.(res?.body?.status) })
  }

  const moveFolder = (data, callback) => {
    moveVlist.mutate(data, { onSuccess: (res) => callback?.(res?.body?.status) })
  }

  const sortNotebook = (data, callback) => {
    sortVlistNotebook.mutate({ ...data }, { onSuccess: (res) => callback?.(res?.body?.status) })
  }

  const delNotebook = (data, callback) => {
    delVlistNotebook.mutate({ ...data }, { onSuccess: (res) => callback?.(res?.body?.status) })
  }

  const updateNotebook = (data, callback) => {
    updateVlistNotebook.mutate(data, { onSuccess: (res) => callback?.(res?.body?.status) })
  }

  useEffect(() => {
    return () => {
      !!searchParams.get('cid') && setFolderCID(cid)
    }
  }, [searchParams.get('cid'), cid])

  useEffect(() => {
    if (vlist_query?.isFetching === false && vlist_query?.data === null) {
      setSearchParams({ cid: root_data?.cid })
    }
  }, [vlist_query?.isFetching, vlist_query?.data, root_data])

  return (
    <Box sx={{ p: margin }} className="flex-1-1 relative">
      <Path data={root} root_cid={root_data?.cid} />
      <Divider sx={{ mt: margin, mb: margin }} />
      <TitleDes
        title={root?.vListName || (cid == root_data?.cid && "根目錄")}
        des={root?.vListDes}
        namepath={root?.namepath}
        pcid={root?.pcid}
        cid={cid}
        folder={folder}
        notebook={notebook}
        isRoot={cid == root_data?.cid}
        onEdit={handleEditVlist}
        onAdd={handleAddVlist}
        onDel={handleDelVlist}
        onAddNotebook={handleSubmitNotebook}
        sortFolder={sortFolder}
        sortNotebook={sortNotebook}
        delNotebook={delNotebook}
        isPending={editVlist.isPending || addVlist.isPending || addVlistNotebook.isPending}
      />
      <Box>
        <LoadingWrapper query={vlist_query}>
          <FolderList
            isRoot={cid == root_data?.cid}
            pcid={root?.pcid || root_data?.cid}
            cid={cid}
            folder={folder}
            notebook={notebook}
            updateNotebook={updateNotebook}
            moveFolder={moveFolder}
            sortFolder={sortFolder}
            sortNotebook={sortNotebook}
            delNotebook={delNotebook}
            isSetting={isSetting}
            setSetting={setSetting}
          />
        </LoadingWrapper>
      </Box>
      {/* <IconButton
        sx={{ position: "sticky", bottom: "16px", right: "16px", float: "right", backgroundColor: "#f9f9f9", border: "#000", mt: 2, mb: 2, mr: 2, minWidth: "auto" }}
        color={"primary"}
        component={Button}
        variant={"contained"}
        onClick={() => window.scrollTo(0, 0)}
        title="回到最上層"
      >
        <VerticalAlignTopOutlinedIcon />
      </IconButton> */}
    </Box>
  )
}
