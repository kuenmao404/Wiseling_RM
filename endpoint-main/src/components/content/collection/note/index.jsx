import React, { Fragment, useState, useEffect } from 'react'
import {
  Box, IconButton, Collapse, Tooltip,
} from '@mui/material'
import { Settings, Add, ExpandLess, ExpandMore } from '@mui/icons-material'
import ListManager from '../../../elements/collection/ListManager'
import { ListButton } from '../../../elements/collection/ListManager'
import { getNoteListClass, addNoteListClass, editNoteListClass, delNoteListClass, sortNoteListClass } from '../../../../apis'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import Dialog from '../../../elements/dialog/Dialog'
import useAlertStore from '../../../../store/alert'
import TableList from './TableList'
import LoadingWrapper from '../../../elements/wrapper/LoadingWrapper'
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const openListAtom = atomWithStorage("open_list", true)

export default function index(props) {
  const { margin, xs, md, lg, setTitle } = props
  const navigate = useNavigate()
  const params = useParams()
  const { cid } = params
  const [open, setOpen] = useState(false)
  const [open_list, setOpenList] = useAtom(openListAtom)
  const { setAlert } = useAlertStore()

  const getNoteListClassApi = useQuery({ queryKey: ["getNoteListClass"], queryFn: () => getNoteListClass() })

  const addNoteListClassApi = useMutation({ mutationFn: addNoteListClass, onSuccess: () => getNoteListClassApi.refetch() })
  const editNoteListClassApi = useMutation({ mutationFn: editNoteListClass, onSuccess: () => getNoteListClassApi.refetch() })
  const delNoteListClassApi = useMutation({ mutationFn: delNoteListClass, onSuccess: () => getNoteListClassApi.refetch() })
  const sortNoteListClassApi = useMutation({ mutationFn: sortNoteListClass, onSuccess: () => getNoteListClassApi.refetch() })

  const handleDelNoteListClass = (d) => {
    setAlert({
      title: "刪除目錄",
      content: `確定要刪除此「${d?.vListName}」目錄？`,
      handleAgree: (callback) => (delNoteListClassApi.mutate({ cid: d?.cid }), callback())
    })
  }

  const handleSortNoteListClass = (arr) => {
    let sortstr = `${arr.map((m, idx) => `${m.cid}`)}`
    let cid = arr?.[0]?.pcid
    sortNoteListClassApi.mutate({ cid, sortstr })
  }

  useEffect(() => {
    const vName = (getNoteListClassApi?.data || [])?.find(f => f.cid == cid)?.vListName
    setTitle(`${vName} - WiseLing`)
    return () => {
      setTitle(null)
    }
  }, [cid, getNoteListClassApi?.data])

  return (
    <Fragment>
      <Dialog
        open={open}
        title={"目錄管理"}
        content={
          <ListManager
            name={'vListName'}
            data={getNoteListClassApi?.data}
            addList={({ vListName }) => addNoteListClassApi.mutate({ vListName })}
            editList={(d) => editNoteListClassApi.mutate({ cid: d?.cid, vListName: d?.vListName, hide: d?.hide })}
            delList={(d) => handleDelNoteListClass(d)}
            sortList={(arr) => handleSortNoteListClass(arr)}
          />
        }
        handleClose={() => setOpen(false)}
      />
      <Box sx={{ width: "100%", mt: margin, ml: margin, mr: margin, flexDirection: md ? "row" : "column" }} className="flex flex-1-1">
        <Box sx={{ width: !md ? "100%" : "25%", minWidth: "230px", position: "relative", mb: 2 }}>
          <Box sx={{ position: !!md ? "relative" : null }}>
            <Box
              sx={{ pt: 2, pb: 2, fontSize: "16px", pl: 4, pr: 4, backgroundColor: "#f1f1f1", mb: 1, borderRadius: "15px 15px 0 0" }}
              className="flex jcsb aic"
            >
              <Box className="flex jcsb aic" sx={{ fontWeight: "bolder", cursor: "pointer" }} onClick={() => setOpenList(!open_list)}>
                <span>目錄列表</span>
                <Tooltip title="展開/收合">
                  <IconButton sx={{ p: "0.2px", ml: 1 }} onClick={() => setOpenList(!open_list)}>
                    {open_list ? <ExpandLess fontSize='small' /> : <ExpandMore fontSize='small' />}
                  </IconButton>
                </Tooltip>
              </Box>
              <IconButton sx={{ p: "0.2px" }} onClick={() => setOpen(true)}><Settings fontSize='small' /></IconButton>
            </Box>
            <Collapse in={open_list} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2, backgroundColor: "#f1f1f1", }}>
                <LoadingWrapper query={getNoteListClassApi}>
                  <Fragment>
                    {Array.isArray(getNoteListClassApi?.data) && getNoteListClassApi?.data?.map(d =>
                      <ListButton
                        key={d?.cid}
                        name={'vListName'}
                        data={d}
                        id={d}
                        onClick={(_d) => navigate(`/notelist/${_d?.cid}`)}
                        cid={cid}
                      />
                    )}
                  </Fragment>
                </LoadingWrapper>
              </Box>
            </Collapse>
          </Box>
        </Box>
        <Box className="flex-1-1 flex-col" sx={{ pl: md ? "15px" : null, pt: !md ? "15px" : null }}>
          <TableList
            cid={cid}
            cname={(getNoteListClassApi?.data || [])?.find(f => f.cid == cid)?.vListName}
            vListDes={getNoteListClassApi?.data?.find(f => f.cid == cid)?.vListDes}
            data={getNoteListClassApi?.data?.find(f => f.cid == cid)}
            onEditDes={(data) => editNoteListClassApi.mutate(data, { onSuccess: () => data?.callback() })}
          />
        </Box>
      </Box>
    </Fragment>
  )
}