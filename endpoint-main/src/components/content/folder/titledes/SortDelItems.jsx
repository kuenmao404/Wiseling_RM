import React, { Fragment, useEffect, useState, useRef, memo } from 'react'

import { DialogContent, DialogActions, Button, Box, Typography, ListItemButton, ListItemText, IconButton, ListItemIcon, Checkbox, Divider, CardMedia } from '@mui/material'
import { Folder as FolderIcon, Book as BookIcon, YouTube as YouTubeIcon } from '@mui/icons-material'

import { arrayMove, SortableContainer, DragHandle, SortableItem } from '../../../../lib/array'
import collectform from '../../../../lib/collectform'

import { } from '../../../../apis'

const SortDelItems = ({
  folder,
  notebook,
  sortFolder,
  sortNotebook,
  delNotebook,
  cid,
}) => {

  const handleSortFolder = ({ data, seqNum }, callback) => {
    sortFolder({ cid: data?.cid, seqNum }, callback)
  }

  const handleSortNotebook = ({ data: { vid, notebookCID, ...data }, seqNum }, callback) => {
    sortNotebook({ cid, vid, notebookCID, seqNum, type: notebookCID ? 19 : 18 }, callback) // 18|19 (影片|筆記本)
  }

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

  return (
    <Fragment>
      <DialogContent dividers>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            資料夾
          </Typography>
          <SortFolder
            data={folder}
            handleSort={handleSortFolder}
            id="folder"
            del_text={null}
          />
        </Box>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            影片/筆記
          </Typography>
          <SortFolder
            data={notebook}
            handleSort={handleSortNotebook}
            handleDel={handleDelNotebook}
            id={"notebook"}
            del_text={"移除勾選的影片/筆記本"}
          />
        </Box>
      </DialogContent>
    </Fragment>
  )
}

export default SortDelItems;

const SortFolder = ({
  data,
  handleSort = () => { },
  handleDel = () => { },
  id = "data",
  del_text,
}) => {

  const [items, setItems] = useState({ data: data }) // 變更排序用
  const [isFetching, setIsFetching] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    setItems({ [id]: data || [] })
  }, [data])

  const onSubmit = () => {
    setIsFetching(true)
    handleDel?.(collectform(formRef.current), () => setIsFetching(false))
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      setIsFetching(true)
      setItems({
        ...items,
        [id]: arrayMove(items?.[id], oldIndex, newIndex)
      })
      handleSort({ data: items?.[id]?.[oldIndex], seqNum: newIndex + 1 }, (status) => {
        setIsFetching(false)
        if (!status) {
          setItems({ [id]: data || [] })
        }
      })
    }
  };

  return (
    <Box className="relative flex flex-col">
      <form ref={formRef}>
        <Box>
          <SortableContainer onSortEnd={onSortEnd} useDragHandle>
            {Array.isArray(items?.[id]) && items?.[id]?.map((d, index) =>
              d?.cid ?
                <SortableItem key={`item-${d?.cid}`} value={d?.cid} index={index}>
                  <ListButton key={d?.cid} {...d} cname={d?.vListName} id={d?.cid} isFetching={isFetching} />
                </SortableItem> :
                <SortableItem key={`item-${d?.notebookCID || d?.vid}`} value={d?.notebookCID || d?.vid} index={index}>
                  <ListButton key={d?.notebookCID || d?.vid} {...d} cname={d?.notebookName || d?.title} id={d?.notebookCID || d?.vid} isFetching={isFetching} />
                </SortableItem>
            )}
          </SortableContainer>
        </Box>
      </form>
      {del_text !== null &&
        <Box sx={{ mt: 1, mb: 1, backgroundColor: "#FFF", position: "sticky", bottom: 0 }}>
          <Button
            color="error" variant="outlined" onClick={onSubmit} disabled={isFetching} fullWidth
          >
            {del_text || "移除"}
          </Button>
        </Box>
      }
    </Box>
  )
}

const ListButton = memo(({
  cname,
  videoID,
  notebookName,
  notebookCID,
  title,
  vid,
  nO,
  isFetching,
  ...props
}) => {
  const { data, cid, onClick } = props

  return (
    <Fragment>
      <ListItemButton
        onClick={() => !!onClick && onClick(data)}
        className='flex aic aic'
      >
        <ListItemIcon>
          {cid ?
            <FolderIcon /> :
            <CardMedia
              component="img"
              sx={{ height: "20px", width: "auto" }}
              image={`https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`}
            />
          }
        </ListItemIcon>
        <ListItemText
          primary={cid ?
            cname?.replaceAll('<\\>', '/') :
            (notebookCID !== null ?
              <div className='flex aic'><BookIcon fontSize='small' color="secondary" /><span className='max-line-1'>&ensp;<b>{notebookName}<span style={{ color: "#3f51b5" }}>&ensp;({nO})</span>&ensp;-&ensp;</b><span style={{ color: "#606060" }}>{title}</span></span></div> :
              <div className='flex aic'><YouTubeIcon fontSize='small' color="error" /><span className='max-line-1'>&ensp;<b>{title}</b></span></div>)
          }
          sx={{ fontWeight: "bolder", minWidth: "150px", flex: "1 1" }}
          className='max-line-1'
          disableTypography
        />
        <Box sx={{ ml: 2 }}>
          <DragHandle disabled={isFetching} />
          {!cid &&
            <Checkbox
              name={`${cid || (notebookCID !== null ? `n_${notebookCID}` : `v_${vid}`)}`}
              color={"primary"}
              defaultChecked={false}
            />
          }
        </Box>
      </ListItemButton>
    </Fragment >
  )
})