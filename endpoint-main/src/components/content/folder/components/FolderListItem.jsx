import React, { Fragment } from 'react'
import { Button, Typography, ListItemButton, ListItemText, IconButton, ListItemIcon, CardMedia } from '@mui/material'
import { Folder as FolderIcon, Book as BookIcon, YouTube as YouTubeIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function FolderListItem({
  onClick,
  extend_child,
  listbutton_props = {},
  to,
  ...props
}) {

  const onLinkClick = (e) => {
    if (onClick !== null) {
      e.preventDefault();
      onClick?.(props)
    }
  };


  return (
    <ListItemButton
      onClick={(e) => onLinkClick?.(e)}
      className='flex aic aic reset-link'
      component={Link}
      to={to}
      {...listbutton_props}
    >
      <SelectFolderType
        {...props}
      />
      {extend_child}
    </ListItemButton>
  )
}

const SelectFolderType = ({
  ...props
}) => {
  const { cid, notebookCID } = props

  // cid is Folder Type
  if (!!cid) {
    return (
      <FolderList {...props} />
    )
  }
  // notebookCID is Notebook Type
  else if (notebookCID !== null) {
    return (
      <NotebookList {...props} />
    )
  }
  // Video Type
  return (
    <VideoList {...props} />
  )
}

const VideoIcon = ({ videoID }) => {
  return (
    <CardMedia
      component="img"
      sx={{ height: "20px", width: "auto" }}
      image={`https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`}
    />
  )
}

const CustomListItemText = (props) => {
  return (
    <ListItemText
      sx={{ fontWeight: "bolder", minWidth: "150px", flex: "1 1" }}
      className='max-line-1'
      disableTypography
      {...props}
    />
  )
}

const FolderList = ({
  vListName,
}) => {
  return (
    <Fragment>
      <ListItemIcon>
        <FolderIcon />
      </ListItemIcon>
      <CustomListItemText
        primary={vListName?.replaceAll('<\\>', '/')}
      />
    </Fragment>
  )
}

const VideoList = ({
  videoID,
  title,
}) => {
  return (
    <Fragment>
      <ListItemIcon>
        <VideoIcon videoID={videoID} />
      </ListItemIcon>
      <CustomListItemText
        primary={<div className='flex aic'><YouTubeIcon fontSize='small' color="error" /><span className='max-line-1'>&ensp;<b>{title}</b></span></div>}
      />
    </Fragment>
  )
}


const NotebookList = ({
  videoID,
  notebookName,
  nO,
  title,
}) => {
  return (
    <Fragment>
      <ListItemIcon>
        <VideoIcon videoID={videoID} />
      </ListItemIcon>
      <CustomListItemText
        primary={
          <div className='flex aic'>
            <BookIcon fontSize='small' color="secondary" />
            <span className='max-line-1'>
              &ensp;<b>{notebookName}<span style={{ color: "#3f51b5" }}>&ensp;({nO})</span>&ensp;-&ensp;</b><span style={{ color: "#606060" }}>{title}</span>
            </span>
          </div>
        }
      />
    </Fragment>
  )
}