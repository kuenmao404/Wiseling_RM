import React, { Fragment, useState } from 'react'
import { Box, DialogContent, Divider, IconButton, Button, Tooltip, Checkbox, DialogActions, Chip } from '@mui/material'
import { Settings, PlaylistAdd as PlaylistAddIcon } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'

import { getCourseChapter, addChapterVideo, delCourseChapterVideo, getVlistApi, importCourseChapterApi } from '../../../../apis'

import useDialogStore from '../../../../store/dialog'
import useAccountStore from '../../../../store/account'

import { ChapterBlock, QuickyList } from './Home'
import AddChapterVideo from '../dialog/AddChapterVideo'
import ChapterSetting from '../dialog/ChapterSetting'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { DialogWrapper, full_props } from '../../../elements/dialog/Dialog'
import FolderListItem from '../../folder/components/FolderListItem'
import Path from '../../folder/Path'

export default function CourseSetting(props) {
  const { data, subclass, refetch } = props
  const [isImgShow, setImgShow] = useState(true)
  const { setDialog, handleClose } = useDialogStore()

  const { ...getCourseChapterApi } = useQuery({ queryKey: ['getCourseChapter', data?.cid], queryFn: () => getCourseChapter({ cid: data?.cid }) })

  const addChapterVideoApi = useMutation({ mutationFn: addChapterVideo })
  const delCourseChapterVideoApi = useMutation({ mutationFn: delCourseChapterVideo, onSuccess: () => getCourseChapter({ cid: data?.cid }) })

  const handleAddButton = (d) => {
    setDialog({
      title: "新增影片或程式解題",
      body: (
        <AddChapterVideo
          addVideo={({ bYoutube, type, url, vid, bPlayList }, callback) => addChapterVideoApi.mutate(
            { cid: d?.cid, courseCID: d?.courseCID, bYoutube, type, url, oid: vid, bPlayList }, { onSuccess: () => (!!callback && callback(), refetch(), getCourseChapterApi.refetch()) }
          )}
          delVideo={({ vid, type }, callback) => delCourseChapterVideoApi.mutate(
            { cid: d?.cid, courseCID: d?.courseCID, oid: vid, type }, { onSuccess: () => (!!callback && callback(), refetch(), getCourseChapterApi.refetch()) }
          )}
          isPending={addChapterVideoApi?.isPending}
          isCode={true}
          courseCID={d?.courseCID}
          cid={d?.cid}
          isCourse={true}
          handleClose={handleClose}
        />),
      isRwdWidth: true
    })
  }

  const handleChapterSetting = () => {
    setDialog({
      title: "管理章節",
      body: (
        <ChapterSetting
          data={getCourseChapterApi?.data}
          course_data={data}
          subclass={subclass}
          refetch={() => (refetch(), getCourseChapterApi.refetch())}
        />),
      // isRwdWidth: true
    })
  }

  return (
    <Fragment>
      <Box sx={{ m: 2 }} className="flex jcsb aic">
        設定
        <Box>
          <Tooltip title="管理章節">
            <IconButton size="small" onClick={() => handleChapterSetting()}>
              <Settings fontSize='small' />
            </IconButton>
          </Tooltip>
          <DialogWrapper
            dialogProps={{
              title: "從資料夾匯入章節",
              ...full_props,
              body: (
                <ImportFloder
                  courseCID={data?.cid}
                  refetch={() => (refetch?.(), getCourseChapterApi?.refetch())}
                />)
            }}
          >
            <Tooltip title="匯入章節">
              <IconButton size="small" sx={{ ml: 1 }}>
                <PlaylistAddIcon fontSize='small' color={"primary"} />
              </IconButton>
            </Tooltip>
          </DialogWrapper>

        </Box>
      </Box>
      <Divider />
      <Box sx={{ m: 2 }}>
        <LoadingWrapper query={getCourseChapterApi}>
          <Box sx={{ whiteSpace: "pre-wrap", lineHeight: "1.5", wordWrap: "break-word" }}>
            {
              (getCourseChapterApi?.data || [])?.map((d, index) =>
                <ChapterBlock
                  key={d?.cid}
                  data={d}
                  index={index}
                  isImgShow={isImgShow}
                  isLogin={true}
                  myJoinStatus={1}
                  isSetting={true}
                  handleAddButton={() => handleAddButton(d)}
                  refetch={getCourseChapterApi.refetch}
                />
              )
            }
          </Box>
        </LoadingWrapper>
        <QuickyList
          list={(getCourseChapterApi?.data || [])}
        />
      </Box>
    </Fragment>
  )
}

const ImportFloder = ({
  courseCID,
  refetch,
  handleClose,
}) => {
  const [now_cid, setNowCID] = useState(null)
  const [check_list, setCheckList] = useState({})

  const { mid, subclass } = useAccountStore()
  const root_data = subclass?.find(f => f.cname == "新影片收藏清單")
  const cid = now_cid || root_data?.cid

  const vlist_query = getVlistApi({ ownerMID: mid, cid: cid })
  const { folder, notebook, root } = vlist_query?.data || {}

  const importCourseChapter = importCourseChapterApi({ onSuccess: (res) => res?.body?.status && (refetch?.(), handleClose?.()) })

  const handleCheck = ({ id, vListName, namepath }) => {
    setCheckList({ ...check_list, [id]: { checked: !check_list?.[id]?.checked, vListName, namepath } })
  }

  const handleImportCourseChapter = () => {
    let cidListstr = ""
    cidListstr = `${Object.keys(check_list)?.filter(f => check_list?.[f]?.checked)?.map(m => `${m}`)}`
    importCourseChapter.mutate({ cid: courseCID, cidListstr })
  }

  const checkListLength = () => {
    return Object.keys(check_list)?.filter(f => check_list?.[f]?.checked)?.length > 0
  }

  return (
    <Fragment>
      <DialogContent dividers sx={{ position: "relative" }}>
        <Path data={root} root_cid={root_data?.cid} onClick={(cid) => setNowCID(cid)} />
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box className="flex jcsb aic" sx={{ backgroundColor: "#fff" }}>
          <Box sx={{ overflowY: "hidden" }}>
            已選擇的資料夾「{
              Object.keys(check_list)?.map((d, idx) => {
                const check_obj = check_list?.[d]
                const { vListName, namepath } = check_obj
                return (
                  check_list?.[d]?.checked &&
                  <Fragment key={d}>
                    {idx !== 0 && <span>&ensp;</span>}
                    <Tooltip title={namepath}>
                      <Chip label={vListName} size='small' onDelete={() => handleCheck({ id: d, ...check_obj })} />
                    </Tooltip>
                  </Fragment>
                )
              })
            }」
          </Box>
          <Box>
            <Button color='error' size='small' variant={"contained"} onClick={() => setCheckList({})} sx={{ minWidth: "73.5px", ml: 1 }}>取消全部</Button>
          </Box>
        </Box>
        <br />
        <Box sx={{ p: 2, backgroundColor: "#f1f1f1", mt: 0 }}>
          <LoadingWrapper query={vlist_query}>
            <Fragment>
              {Array.isArray(folder) && folder?.map((d) =>
                <FolderListItem
                  key={d?.cid}
                  onClick={({ cid }) => setNowCID(cid)}
                  {...d}
                  extend_child={
                    <Checkbox
                      checked={!!check_list?.[d?.cid]?.checked}
                      onClick={e => e.stopPropagation()}
                      onChange={() => handleCheck({ id: d?.cid, ...d })}
                      color={"primary"}
                    />
                  }
                />)
              }
              {Array.isArray(notebook) && notebook?.map((d) =>
                <FolderListItem
                  key={d?.notebookCID || d?.vid}
                  {...d}
                />)
              }
            </Fragment>
          </LoadingWrapper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant={"contained"} onClick={() => handleImportCourseChapter()} disabled={importCourseChapter.isPending || !checkListLength()}>
          確認
        </Button>
      </DialogActions>
    </Fragment>
  )
}