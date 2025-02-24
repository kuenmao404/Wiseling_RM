import React, { Fragment, useState, useEffect } from 'react'
import {
  Box, IconButton, Collapse, Tooltip,
} from '@mui/material'
import { Settings, Add, ExpandLess, ExpandMore } from '@mui/icons-material'
import SearchBar from '../../../elements/formitem/SearchBar'
import ListManager from '../../../elements/collection/ListManager'
import { ListButton } from '../../../elements/collection/ListManager'
import { getVideoListClass, addVideoListClass, editVideoListClass, delVideoListClass, sortVideoListClass } from '../../../../apis'
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

  const getVideoListClassApi = useQuery({ queryKey: ["getVideoListClass"], queryFn: () => getVideoListClass() })

  const addVideoListClassApi = useMutation({ mutationFn: addVideoListClass, onSuccess: () => getVideoListClassApi.refetch() })
  const editVideoListClassApi = useMutation({ mutationFn: editVideoListClass, onSuccess: () => getVideoListClassApi.refetch() })
  const delVideoListClassApi = useMutation({ mutationFn: delVideoListClass, onSuccess: () => getVideoListClassApi.refetch() })
  const sortVideoListClassApi = useMutation({ mutationFn: sortVideoListClass, onSuccess: () => getVideoListClassApi.refetch() })

  const handleDelVideoListClass = (d) => {
    setAlert({
      title: "刪除目錄",
      content: `確定要刪除此「${d?.vListName}」目錄？`,
      handleAgree: (callback) => (delVideoListClassApi.mutate({ cid: d?.cid }), callback())
    })
  }

  const handleSortVideoListClass = (arr) => {
    let sortstr = `${arr.map((m, idx) => `${m.cid}`)}`
    let cid = arr?.[0]?.pcid
    sortVideoListClassApi.mutate({ cid, sortstr })
  }

  useEffect(() => {
    const vName = (Array.isArray(getVideoListClassApi?.data) && getVideoListClassApi?.data || [])?.find(f => f.cid == cid)?.vListName || null
    !!vName && setTitle(`${vName} - WiseLing`)
    return () => {
      setTitle(null)
    }
  }, [cid, getVideoListClassApi?.data])

  return (
    <Fragment>
      <Dialog
        open={open}
        title={"目錄管理"}
        content={
          <ListManager
            name={'vListName'}
            data={(getVideoListClassApi?.data || [])}
            addList={({ vListName }) => addVideoListClassApi.mutate({ vListName })}
            editList={(d) => editVideoListClassApi.mutate({ cid: d?.cid, vListName: d?.vListName, hide: d?.hide })}
            delList={(d) => handleDelVideoListClass(d)}
            sortList={(arr) => handleSortVideoListClass(arr)}
          />
        }
        handleClose={() => setOpen(false)}
      />
      <Box sx={{ width: "100%", mt: margin, ml: margin, mr: margin, flexDirection: md ? "row" : "column" }} className="flex">
        <Box sx={{ width: !md ? "100%" : "25%", minWidth: "230px" }}>
          <Box sx={{ position: !!md ? "relative" : null }}>
            <Box sx={{ pt: 2, pb: 2, fontSize: "16px", pl: 4, pr: 4, backgroundColor: "#f1f1f1", mb: 1, borderRadius: "15px 15px 0 0" }} className="flex jcsb aic">
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
              <Box sx={{ p: 2, backgroundColor: "#f1f1f1" }}>
                <LoadingWrapper query={getVideoListClassApi}>
                  <Fragment>
                    {Array.isArray((getVideoListClassApi?.data || [])) && (getVideoListClassApi?.data || [])?.map(d =>
                      <ListButton
                        key={d?.cid}
                        name={'vListName'}
                        data={d}
                        id={d}
                        onClick={(_d) => navigate(`/videolist/${_d?.cid}`)}
                        cid={cid}
                      />
                    )}
                  </Fragment>
                </LoadingWrapper>
              </Box>
            </Collapse>
          </Box>
        </Box>
        <Box className="flex-1-1 flex-col" sx={{ pl: md ? "15px" : null, pt: !md ? "15px" : null, pb: 2 }}>
          {
            Array.isArray(getVideoListClassApi?.data) &&
            <TableList
              cid={cid}
              cname={(getVideoListClassApi?.data || [])?.find(f => f.cid == cid)?.vListName}
              vListDes={(getVideoListClassApi?.data || [])?.find(f => f.cid == cid)?.vListDes}
              data={(getVideoListClassApi?.data || [])?.find(f => f.cid == cid)}
              onEditDes={(data) => editVideoListClassApi.mutate(data, { onSuccess: () => data?.callback() })}
            />
          }

        </Box>
      </Box>
    </Fragment>
  )
}
