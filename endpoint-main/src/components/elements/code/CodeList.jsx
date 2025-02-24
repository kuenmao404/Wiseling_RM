import React, { Fragment, useState, useEffect } from 'react'
import {
  TableHead, TableBody, Rating, IconButton, Chip, Tooltip, Box, Button, DialogContent, Collapse, Typography,
} from '@mui/material'
import { Dehaze, Delete, Check, Recommend } from '@mui/icons-material'

import Config from 'Config'
const { CodeSolve } = Config
import { DragHandle } from '../../../lib/array'

import { getCourseProblemMStatusApi, getCourseProblemMSolutionApi } from '../../../apis'

import useAccountStore from '../../../store/account'
import useSnackbarStore from '../../../store/snackbar'

import { DialogWrapper, full_props } from '../dialog/Dialog'
import { Table, TableHeadRow, TableRow, TableCell, } from '../table/Table'
import LoadingWrapper from '../wrapper/LoadingWrapper'
import Avatar from '../Avatar'

export default function CodeList(props) {
  const { body } = props

  return (
    <Table>
      <TableHead>
      </TableHead>
      <TableBody>
        {body}
      </TableBody>
    </Table>
  )
}

const CodeBlock = (props) => {
  const {
    data, onClick = () => { window.open(`${CodeSolve}${(props?.data?.pid || props?.data?.oid)}`, '_blank') },
    isImgShow = true, isSetting, handleDelButton, enabled = true, bChoose = false, bRecommend = false, expand = null, cid, isPermission,
  } = props

  const sx = {
    '&:last-child td, &:last-child th': { border: 0 },
    '&:nth-of-type(odd)': { backgroundColor: "#fcfcfc" },
    '&:hover': !!enabled ? { backgroundColor: "rgba(0, 0, 0, .1)", cursor: "pointer", transition: "all .2s" } : {}
  }

  const tansTag = (tag) => {
    if (typeof tag === "string") {
      return JSON.parse(tag)
    }
    else {
      return tag
    }
  }

  return (
    <TableRow
      onClick={e => !isSetting && onClick(e)}
      sx={{ ...sx }}
    >
      {!!isImgShow &&
        <TableCell align="center" sx={{ width: "125px", boxSizing: "border-box" }}>
          <Rating value={data?.difficulty} size="small" readOnly />
        </TableCell>
      }
      <TableCell align="left" sx={{ textAlign: "center" }}>
        <Box className='flex jcsb aic'>
          <Box className="flex">
            {data?.title}{(tansTag(data?.tag) || [])?.map((d, idx) =>
              <Chip sx={{ ml: 1 }} label={d?.cname} key={idx} size="small" />)}
            {!!bChoose && <Tooltip title={"題目已存在於章節中"}><Check sx={{ ml: 2 }} color="success" /></Tooltip>}
            {!!bRecommend && <Tooltip title={"此章節的推薦影片"}><Recommend sx={{ ml: 2 }} color="warning" /></Tooltip>}
          </Box>
          <Box onClick={e => e.stopPropagation()}>
            {!isSetting && Number.isInteger(data?.nAccept) &&
              <DialogWrapper
                dialogProps={{
                  title: `課程成員解題狀況`,
                  ...full_props,
                  body: <SolveCodeInfo courseCID={data?.courseCID} cid={cid} pid={data?.oid} isPermission={isPermission} />
                }}
              >
                <Button variant="text" size='small' sx={{ color: "#818181" }}>
                  <span>{data?.nAccept}</span>人通過
                </Button>
              </DialogWrapper>
            }
          </Box>
        </Box>
      </TableCell >
      {!!isSetting &&
        <TableCell align="right">
          <DragHandle />
          <IconButton size="small" onClick={() => handleDelButton({ ...data })}>
            <Delete fontSize='small' color="error" />
          </IconButton>
        </TableCell>
      }
      {
        expand
      }
    </TableRow >
  )
}

const SolveCodeInfo = ({
  courseCID,
  cid,
  pid,
  isPermission,
  ...props
}) => {
  const getCourseProblemMStatus = getCourseProblemMStatusApi({ courseCID, cid, pid })

  const { total, data } = getCourseProblemMStatus?.data || {}

  return (
    <DialogContent dividers>
      <LoadingWrapper query={getCourseProblemMStatus}>
        <Table sx={{ mt: 0 }}>
          <TableHeadRow>
            <TableCell sx={{ fontWeight: "bolder" }}>成員</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>提交次數</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>第一次提交成功次數</TableCell>
            <TableCell sx={{ fontWeight: "bolder" }}>第一次提交成功時間</TableCell>
          </TableHeadRow>
          <TableBody>
            {data?.map((d) =>
              <SolveCodeRow key={`${d?.cid}_${d?.name}_${d?.sso}`} {...d} courseCID={courseCID} cid={cid} isPermission={isPermission} />
            )}
          </TableBody>
        </Table>
      </LoadingWrapper>
    </DialogContent>
  )
}

const SolveCodeRow = (props) => {
  const { courseCID, cid, pid, bAccept, nSubmit, nFirstAccSubmit, acceptSince, since, lastModifiedDT, solutionID, ownerMID, name, sso, img, isPermission } = props
  const [open, setOpen] = useState(false)

  return (
    <Fragment key={`${cid}_${name}_${sso}`}>
      <TableRow onClick={() => !!isPermission && setOpen(!open)}>
        <TableCell sx={{ display: "flex" }} className='aic'>
          <Avatar name={name} src={img} /><Box sx={{ ml: 1 }}>{name}&ensp;<span style={{ color: "#4153C7" }}>({sso})</span></Box>
        </TableCell>
        <TableCell>{nSubmit}</TableCell>
        <TableCell>{nFirstAccSubmit}</TableCell>
        <TableCell>{acceptSince}</TableCell>
      </TableRow>
      {!!isPermission && <CodeHistory open={open} {...props} />}
    </Fragment>
  )
}

const CodeHistory = ({
  open,
  ...props
}) => {
  const { courseCID, cid, pid, bAccept, nSubmit, nFirstAccSubmit, acceptSince, since, lastModifiedDT, solutionID, ownerMID, name, sso, img } = props
  const { setSnackMsg } = useSnackbarStore()

  const getCourseProblemMSolution = getCourseProblemMSolutionApi({ courseCID, cid, ownerMID, pid }, { enabled: !!open })
  const { data, total } = getCourseProblemMSolution?.data || {}

  const textToClipboard = async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setSnackMsg({ message: "複製成功！" });
      } catch (err) {
        console.error("無法使用 Clipboard API：", err);
      }
    } else {
      // 備用方案
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        setSnackMsg({ message: "複製成功！！！" });
      } catch (err) {
        console.error("無法執行複製：", err);
      }
      document.body.removeChild(el);
    }
  };

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Collapse in={!!open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography variant="h6" gutterBottom component="div">
              最後一次成功或失敗解題紀錄
            </Typography>
            <LoadingWrapper query={getCourseProblemMSolution}>
              <Table sx={{ mt: 2 }} size="small">
                <TableHeadRow>
                  <TableCell sx={{ fontWeight: "bolder" }}>狀態</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>語言</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>Runtime (ms)</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>Memory (Kb)</TableCell>
                  <TableCell sx={{ fontWeight: "bolder" }}>程式碼</TableCell>
                </TableHeadRow>
                <TableBody>
                  {Array.isArray(data) && data?.map(d =>
                    <TableRow key={`${d?.cid}_${d?.ownerMID}_${d?.pid}`}>
                      <TableCell>
                        <div>{switchKind(d?.kind)}</div>
                        <Box sx={{ color: "#262626bf" }}>{d?.since}</Box>
                      </TableCell>
                      <TableCell>
                        {d?.language}
                      </TableCell>
                      <TableCell>
                        {d?.runTime ?? 'N/A'}
                      </TableCell>
                      <TableCell>
                        {d?.memory ?? 'N/A'}
                      </TableCell>
                      <TableCell><Button onClick={() => textToClipboard(d?.code)}>複製程式碼</Button></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </LoadingWrapper>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}

const switchKind = (kind = null) => {
  switch (kind) {
    case "System":
      return <span className="text-red-600 font-bold" style={{ fontWeight: "700", color: "rgb(220, 38, 38)" }}>System Error</span>
    case "Accept":
      return <span className="text-emerald-600 font-bold" style={{ fontWeight: "700", color: "rgb(5, 150, 105)" }}>Accept</span>
    default:
      return <span className="text-red-600 font-bold" style={{ fontWeight: "700", color: "rgb(220, 38, 38)" }}>{kind}</span>
  }
}

export { CodeBlock }