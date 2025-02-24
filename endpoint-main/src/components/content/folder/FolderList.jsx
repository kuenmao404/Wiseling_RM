import React, { Fragment, useEffect, useState, useRef } from 'react'
import { Box, List, ListItemIcon, ListItemButton, ListItemText, CardMedia, Menu, MenuItem, IconButton, DialogContent, Divider, Button, Checkbox } from '@mui/material'
import {
  Folder as FolderIcon, ArrowBack as ArrowBackIcon, Description as DescriptionIcon, YouTube as YouTubeIcon, Book as BookIcon, Home as HomeIcon,
  ChangeCircleOutlined as ChangeCircleOutlinedIcon, DriveFileMoveOutlined as DriveFileMoveOutlinedIcon
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getMyNotebook, getVlistApi } from '../../../apis'

import { arrayMove, SortableContainer, DragHandle, SortableItem, onSortEnd } from '../../../lib/array'
import collectform from '../../../lib/collectform'

import Loading from '../../elements/loading'
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import Dialog from '../../elements/dialog/Dialog'
import Path from './Path'

import useAccountStore from '../../../store/account'

const full_props = {
  fullWidth: true,
  isRwdWidth: true,
  fullHeight: "100%",
}

export default function FolderList({
  isRoot,
  pcid,
  cid,
  folder,
  notebook,
  onClickBack = null,
  onClickFold = null,
  onClickHome = null,
  now_notebook = null,
  updateNotebook = null,
  onClickNotebook = null,
  moveFolder = null,
  sortFolder = null,
  sortNotebook = null,
  delNotebook = null,
  // 設定資料夾及筆記本的排序或刪除
  isSetting,
  setSetting,
}) {
  const [isFetching, setIsFetching] = useState(false)
  const [t_folder, setTmpFolder] = useState(folder)
  const [t_notebook, setTmpNotebook] = useState(notebook)

  const formRef = useRef(null)

  useEffect(() => {
    setTmpFolder(folder)
  }, [folder])

  useEffect(() => {
    setTmpNotebook(notebook)
  }, [notebook])

  const onLinkClick = (e, onClick) => {
    if (onClickFold !== null) {
      e.preventDefault();
      onClick?.()
    }
  };

  const handleSortFolder = ({ data, seqNum }, callback) => {
    sortFolder({ cid: data?.cid, seqNum }, callback)
  }

  const handleSortNotebook = ({ data: { vid, notebookCID, ...data }, seqNum }, callback) => {
    sortNotebook({ cid, vid, notebookCID, seqNum, type: notebookCID ? 19 : 18 }, callback) // 18|19 (影片|筆記本)
  }

  const handleSortEndFolder = (newArr, { oldIndex, newIndex }) => {
    setIsFetching(true)
    handleSortFolder({ data: newArr?.[newIndex], seqNum: newIndex + 1 }, (status) => {
      setIsFetching(false)
      if (!status) {
        setTmpFolder(folder)
      }
    })
  };

  const handleSortEndNotebook = (newArr, { oldIndex, newIndex }) => {
    setIsFetching(true)
    handleSortNotebook({ data: newArr?.[newIndex], seqNum: newIndex + 1 }, (status) => {
      setIsFetching(false)
      if (!status) {
        setTmpNotebook(notebook)
      }
    })
  };

  const handleDelNotebook = (obj, callback) => {
    let notebookCIDstr = ""
    let vidstr = ""
    Object.keys(obj)?.map(key => {
      const type = key?.split("_")?.[0], id = key?.split("_")?.[1]
      if (type == "n") {
        notebookCIDstr += (notebookCIDstr == "" ? `${id}` : `,${id}`)
      } else if (type == "v") {
        vidstr += (vidstr == "" ? `${id}` : `,${id}`)
      }
    })
    delNotebook({ cid: parseInt(cid), notebookCIDstr, vidstr }, callback)
  }

  const onSubmit = () => {
    setIsFetching(true)
    handleDelNotebook?.(collectform(formRef.current), () => setIsFetching(false))
  }

  return (
    <Fragment>
      {!!isSetting &&
        <Box sx={{ position: "sticky", top: 94, pt: 1, pb: 1, bgcolor: "#f9f9f9", zIndex: 1 }} className="flex jcsb">
          <Button size='small' variant="contained" color="error" sx={{ p: 0, pl: 1, pr: 1 }} onClick={onSubmit}>移除勾選的影片/筆記本</Button>
          <Button size='small' variant="contained" color="primary" sx={{ p: 0, pl: 1, pr: 1 }} onClick={() => setSetting(false)}>取消編輯</Button>
        </Box>
      }
      <Box sx={{ p: 2, backgroundColor: "#f1f1f1", mt: !isSetting ? 2 : 0 }}>
        {!!onClickHome &&
          <ListItemButton onClick={onClickHome}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText>
              <b>回到當前的播放目錄</b>
            </ListItemText>
          </ListItemButton>
        }
        {!isRoot &&
          <Link to={`/folder?cid=${pcid}`} onClick={e => onLinkClick(e, () => onClickBack({ pcid }))}>
            <ListItemButton>
              <ListItemIcon><ArrowBackIcon /></ListItemIcon>
              <ListItemText>
                回上一層...
              </ListItemText>
            </ListItemButton>
          </Link>
        }
        <SortableContainer onSortEnd={e => onSortEnd({ ...e, items: t_folder }, setTmpFolder, handleSortEndFolder)} useDragHandle>
          {Array.isArray(t_folder) && t_folder?.map((d, index) =>
            <SortableItem key={d?.cid} index={index}>
              <FolderListFolder
                key={d?.cid}
                {...d}
                onClick={e => onLinkClick(e, () => onClickFold({ ...d }))}
                moveFolder={moveFolder}
                isSetting={isSetting}
                isFetching={isFetching}
              />
            </SortableItem>
          )}
        </SortableContainer>
        <form ref={formRef}>
          <SortableContainer onSortEnd={e => onSortEnd({ ...e, items: t_notebook }, setTmpNotebook, handleSortEndNotebook)} useDragHandle>
            {Array.isArray(t_notebook) && t_notebook?.map(({ vid, videoID, notebookCID, notebookName, nO, title, rank, viewCount }, index) =>
              <SortableItem key={notebookCID || vid} index={index}>
                <FolderListItem
                  key={notebookCID || vid}
                  now_notebook={now_notebook}
                  cid={cid}
                  updateNotebook={updateNotebook}
                  onClickNotebook={!onClickNotebook ? null : (e) => onLinkClick(e, () => onClickNotebook?.())}
                  isSetting={isSetting}
                  isFetching={isFetching}
                  // item 內參數
                  vid={vid} videoID={videoID} notebookCID={notebookCID} notebookName={notebookName} nO={nO} title={title} rank={rank} viewCount={viewCount}
                />
              </SortableItem>
            )}
          </SortableContainer>
        </form>
      </Box>
    </Fragment>

  )
}

const FolderListFolder = ({
  vListName,
  namepath,
  cid,
  pcid,
  onClick,
  moveFolder,
  isSetting,
  isFetching,
}) => {
  //hover顯示移動資料夾icon
  const [isHover, setHover] = useState(false)
  const [open, setOpen] = useState(false)

  const title = vListName?.replaceAll('<\\>', '/')

  return (
    <Fragment>
      <Tooltip title={title}>
        <Link key={cid} to={`/folder?cid=${cid}`} onClick={onClick}>
          <ListItemButton
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <ListItemIcon><FolderIcon /></ListItemIcon>
            <ListItemText>
              {title}
            </ListItemText>
            {!!isSetting && !!moveFolder &&
              <Tooltip title="移動資料夾">
                <IconButton sx={{ pl: 1, minWidth: "20px" }} size='small' onClick={e => (e.preventDefault(), setOpen(true))}>
                  <DriveFileMoveOutlinedIcon fontSize='small' color="primary" />
                </IconButton>
              </Tooltip>
            }
            {!!isSetting &&
              <DragHandle disabled={isFetching} />
            }
          </ListItemButton>
        </Link>
      </Tooltip>
      <Dialog
        title="移動資料夾至..."
        open={open}
        handleClose={() => setOpen(false)}
        {...full_props}
        body={
          <MoveFolderDialog
            cid={pcid}
            move_cid={cid}
            namepath={namepath}
            onSubmit={(data) => moveFolder?.(data, () => setOpen(false))}
            handleClose={() => setOpen(false)}
          />
        }
      />
    </Fragment>
  )
}

const MoveFolderDialog = ({
  cid,
  move_cid,
  namepath,
  onSubmit,
  handleClose,
}) => {
  const { mid, subclass } = useAccountStore()
  const root_data = subclass?.find(f => f.cname == "新影片收藏清單")

  const [select_cid, setSelectCID] = useState(cid)

  const vlist_query = getVlistApi({ ownerMID: mid, cid: select_cid })
  const { folder, notebook, root } = vlist_query?.data || {}

  const move_path = namepath?.split('/')
  const name_arr = root?.namepath?.length > 0 ? root?.namepath?.split('/') : []

  return (
    <Fragment>
      <DialogContent dividers>
        {select_cid}
        <Path data={root} root_cid={root_data?.cid} onClick={(cid) => setSelectCID(cid)} />
        <Divider sx={{ mt: 2, mb: 2 }} />
        <LoadingWrapper query={vlist_query}>
          <FolderList
            isRoot={select_cid == root_data?.cid}
            pcid={root?.pcid || root_data?.cid}
            cid={(root)?.cid}
            folder={folder}
            notebook={notebook}
            onClickBack={({ pcid }) => setSelectCID(pcid)}
            onClickFold={({ ...data }) => setSelectCID(data.cid)}
            onClickNotebook={() => { }}
          />
        </LoadingWrapper>
        <Box className="flex jce" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => onSubmit({ pcid: select_cid, cid: move_cid })}>
            將資料夾"
            <b style={{ color: "rgba(0, 0, 0, .8)" }}>{`根目錄${move_path.map(d => ` / ${d.replaceAll('<\\>', '/')}`).join('')}`}</b>
            "移動到"
            <b style={{ color: "rgba(0, 0, 0, .8)" }}>{`根目錄${name_arr.map(d => ` / ${d.replaceAll('<\\>', '/')}`).join('')}`}</b>"
          </Button>
        </Box>
      </DialogContent>
    </Fragment>
  )
}

const FolderListItem = ({
  now_notebook,
  cid,
  updateNotebook,
  onClickNotebook,
  // item 內參數
  vid,
  videoID,
  notebookCID,
  notebookName,
  viewCount,
  nO,
  title,
  rank,
  isSetting,
  isFetching,
  setSetting,
}) => {
  //hover顯示icon
  const [isHover, setHover] = useState(false)

  // 切換筆記本或影片的開關
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClickTrans = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseTrans = () => {
    setAnchorEl(null);
  };

  // 取得自己擁有的筆記本
  const getVideoNoteBookApi = useQuery({
    queryKey: ["getVideoNoteBook", vid],
    queryFn: () => getMyNotebook({ vid, order: "bDefault_d,lastModifiedDT_d,nO_d" }),
    enabled: !!open,
  })

  const getTitle = (isTips = false) => (notebookCID !== null ?
    <div className='flex aic'>
      <BookIcon fontSize='small' color="secondary" />
      <span className='max-line-1'>
        &ensp;<b>{notebookName}<span style={{ color: "#3f51b5" }}>&ensp;({nO})</span>&ensp;-&ensp;</b><span style={{ color: !isTips ? "#606060" : "#fff" }}>{title}</span>
      </span>
    </div> :
    <div className='flex aic'><YouTubeIcon fontSize='small' color="error" /><span className='max-line-1'>&ensp;<b>{title}</b></span></div>)

  return (
    <Fragment>
      <Link key={notebookCID || vid} to={`/watch?v=${vid}${notebookCID !== null ? `&cid=${notebookCID}&n=${notebookCID}` : ""}&list=${cid}&mode=v`} onClick={onClickNotebook}>
        <NoMaxWidthTooltip title={getTitle(true)}>
          <ListItemButton
            style={now_notebook == (notebookCID || vid) ? {
              backgroundColor: "rgba(0, 0, 0, 0.10)",
            } : {}}
            className='flex'
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <ListItemIcon>
              <CardMedia
                component="img"
                sx={{ height: "20px", width: "auto" }}
                image={`https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`}
              />
            </ListItemIcon>
            <ListItemText className='flex-1-1'>
              {getTitle()}
            </ListItemText>
            {(isSetting || open) && !!updateNotebook &&
              <IconButton sx={{ pl: 1, minWidth: "20px" }} size='small' onClick={e => (e.preventDefault(), handleClickTrans(e))}>
                <Tooltip title="切換筆記本/影片">
                  <ChangeCircleOutlinedIcon fontSize='small' color="primary" />
                </Tooltip>
              </IconButton>
            }
            {!!isSetting &&
              <DragHandle disabled={isFetching} />
            }
            {!!isSetting &&
              <Checkbox
                onClick={e => (e.stopPropagation())}
                name={`${(notebookCID !== null ? `n_${notebookCID}` : `v_${vid}`)}`}
                color={"primary"}
                defaultChecked={false}
              />
            }
          </ListItemButton>
        </NoMaxWidthTooltip>
      </Link>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseTrans}
        disableScrollLock={true}
      >
        {getVideoNoteBookApi?.isFetching && <Loading />}
        {!getVideoNoteBookApi?.isFetching &&
          <MenuItem
            onClick={e => (handleCloseTrans(e), updateNotebook({ cid, vid, rank, updateNotebookCID: null }))}
            selected={notebookCID == null}
            disabled={notebookCID == null}
          ><em>單純連結影片</em>
          </MenuItem>
        }
        {!getVideoNoteBookApi?.isFetching && getVideoNoteBookApi?.data?.map(d =>
          <MenuItem
            key={d?.cid}
            onClick={e => (handleCloseTrans(e), updateNotebook({ cid, vid, rank, updateNotebookCID: d?.cid }))}
            selected={d?.cid == notebookCID}
            disabled={d?.cid == notebookCID}
          >{d?.cname}
          </MenuItem>)
        }
      </Menu>
    </Fragment>
  )
}

const NoMaxWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});