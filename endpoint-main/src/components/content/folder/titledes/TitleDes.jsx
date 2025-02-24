import React, { cloneElement, Fragment, useEffect, useState } from 'react'

import {
  Box, Button, IconButton, Tooltip
} from '@mui/material'
import {
  Edit as EditIcon, CreateNewFolder as CreateNewFolderIcon, NoteAdd as NoteAddIcon, SwapVert as SwapVertIcon, Delete as DeleteIcon,
} from '@mui/icons-material'
import { useAtom, atom } from 'jotai'

import useAlertStore from '../../../../store/alert'

import { DialogWrapper } from '../../../elements/dialog/Dialog'
import AddNotebook from './AddNotebook'
import EditFolderInfo from './EditFolderInfo'
import MarkdownView from '../../../elements/markdown/MarkdownView'
import SortDelItems from './SortDelItems'

export const settingAtom = atom(false)

export default function TitleDes({
  cid,
  title,
  des,
  namepath,
  folder,
  notebook,
  pcid,
  isRoot,
  onEdit = () => { },
  onAdd = () => { },
  onDel = () => { },
  onAddNotebook = () => { },
  sortFolder = () => { },
  sortNotebook = () => { },
  delNotebook = () => { },
  isPending,
}) {
  const [isSetting, setSetting] = useAtom(settingAtom)

  const { setAlert } = useAlertStore()

  const handleDel = () => {
    setAlert({
      title: "移除資料夾",
      content: <div>確定要移除「<b style={{ color: 'black' }}>根目錄/{namepath}</b>」此資料夾？{`\n`}移除後<b className='error-msg'>資料夾與資料夾內的子目錄不會復原</b>，筆記本還是會存在於筆記本清單中。</div>,
      handleAgree: (callback) => onDel({ pcid }, () => (callback()))
    })
  }

  const full_props = {
    fullWidth: true,
    isRwdWidth: true,
    fullHeight: "100%",
  }

  return (
    <Fragment>
      <Box className="flex jcsb aic fww" sx={{ position: "sticky", top: 64, backgroundColor: "#fafafa", zIndex: 1 }}>
        <FolderTitle
          title={title}
        />
        {!isSetting &&
          <Box className="flex">
            <DialogWrapper
              dialogProps={{
                title: "連結筆記本/影片",
                ...full_props,
                body: (
                  <AddNotebook
                    cid={cid}
                    notebook={notebook}
                    onAddNotebook={onAddNotebook}
                    isPending={isPending}
                  />)
              }}
            >
              <Tooltip title="連結筆記本/影片">
                <IconButton size="small" sx={{ mr: 1 }} color="secondary"><NoteAddIcon fontSize='small' /></IconButton>
              </Tooltip>
            </DialogWrapper>
            <DialogWrapper
              dialogProps={{
                title: "新增資料夾",
                ...full_props,
                body: (
                  <EditFolderInfo
                    title={""}
                    des={""}
                    onSubmit={(data, callback) => onAdd({ vListDes: data?.des, vListName: data?.title }, callback)}
                    isPending={isPending}
                  />)
              }}
            >
              <Tooltip title="新增資料夾">
                <IconButton size="small" sx={{ mr: 1 }} color="success"><CreateNewFolderIcon fontSize='small' /></IconButton>
              </Tooltip>
            </DialogWrapper>
            {!isRoot &&
              <DialogWrapper
                dialogProps={{
                  title: "修改資料夾資訊",
                  ...full_props,
                  body: (
                    <EditFolderInfo
                      cid={cid}
                      title={title}
                      des={des}
                      onSubmit={(data, callback) => onEdit({ vListDes: data?.des, vListName: data?.title }, callback)}
                      isPending={isPending}
                    />)
                }}
              >
                <Tooltip title="編輯資料夾">
                  <IconButton size="small" color="primary" sx={{ mr: 1 }}><EditIcon fontSize='small' /></IconButton>
                </Tooltip>
              </DialogWrapper>
            }
            <DialogWrapper
              dialogProps={{
                title: "排序或刪除資料夾/筆記本",
                ...full_props,
                body: (
                  <SortDelItems
                    cid={cid}
                    folder={folder}
                    notebook={notebook}
                    sortFolder={sortFolder}
                    sortNotebook={sortNotebook}
                    delNotebook={delNotebook}
                  />)
              }}
            >
              <Tooltip title="排序或刪除資料夾/筆記本">
                <IconButton size="small" color="warning" sx={{ mr: 1 }}
                  onClick={() => setSetting(!isSetting)}
                >
                  <SwapVertIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </DialogWrapper>
            {!isRoot &&
              <Tooltip title="刪除資料夾">
                <IconButton size="small" color="error" onClick={handleDel}><DeleteIcon fontSize='small' /></IconButton>
              </Tooltip>
            }
          </Box>
        }

      </Box>
      {
        !!des &&
        <Box
          sx={{ mb: 2, mt: 2, backgroundColor: "#fff", borderRadius: "10px 10px 10px 10px", border: "1px solid rgba(0, 0, 0, .1)", p: 2 }}
        >
          <MarkdownView source={des} />
        </Box>
      }
    </Fragment>
  )
}


const FolderTitle = ({ sx = {}, className = "", title }) => {
  return (
    <Box className={"flex" + className.length > 0 ? ` ${className}` : ""} sx={{ position: "relative", ...sx }}>
      <Box sx={{ width: "4px", backgroundColor: "#666666", position: "absolute", left: 0, top: 0, bottom: 0 }} />
      <Box sx={{ ml: 2, fontSize: "18px" }}><b>{(title || "")?.replaceAll('<\\>', '/')}</b></Box>
    </Box>
  )
}

export { FolderTitle }