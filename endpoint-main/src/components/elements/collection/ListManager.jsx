import React, { Fragment, useState, useRef, useEffect } from 'react'
import { ListItem, ListItemButton, ListItemText, Collapse, List, IconButton, Box, TextField } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { SortableContainer, DragHandle, SortableItem, onSortEnd } from '../../../lib/array'

export default function ListManager(props) {
  const { data, addList, editList, delList, sortList, name, key_name, reName } = props
  const [isAdding, setAdding] = useState(false)
  const [items, setItems] = useState([]) // 變更排序用

  useEffect(() => {
    setItems(data || [])
  }, [data])

  return (
    <Box sx={{ minWidth: "200px" }}>
      <SortableContainer onSortEnd={e => onSortEnd({ ...e, items }, setItems, sortList)} useDragHandle>
        {Array.isArray(items) && items?.map((d, index) =>
          <SortableItem key={`item-${d?.[(key_name || 'cid')]}`} value={d?.[(key_name || 'cid')]} index={index}>
            <ListButton
              key={d?.[(key_name || 'cid')]}
              name={name}
              data={d}
              editList={editList}
              delList={delList}
              id={d}
              sortList={sortList}
              reName={reName}
            />
          </SortableItem>

        )
        }
      </SortableContainer>
      {!isAdding && !!addList && <ListAddItem onClick={() => setAdding(true)} />}
      {!!isAdding && <ListItemEditor level={0} onDone={(value) => (addList({ [name || 'cname']: value }), setAdding(false))} onCancel={() => setAdding(false)} />}
    </Box>
  )
}

export { ListButton }

const ListButton = (props) => {
  const { data, root, level, cid, path, editList, delList, id, onClick, name, sortList, reName } = props
  const [isHover, setHover] = useState(false)
  const [isAdding, setAdding] = useState(false)
  const [isEditing, setEditing] = useState(false)

  const drawer_active = (cid == data?.cid ? {
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    color: "#fff"
  } : {})

  return (
    <Fragment>
      <ListItemButton
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ ...drawer_active }}
        onClick={() => !!onClick && onClick(data)}
      >
        {!isEditing ?
          <ListItemText
            primary={typeof reName === 'function' ? reName(data) : data?.[(name || 'cname')]?.replaceAll('<\\>', '/')}
            sx={{ fontWeight: "bolder", minWidth: "150px" }}
            disableTypography
          /> :
          <ListItemEditor
            defaultValue={data?.[(name || 'cname')]?.replaceAll('<\\>', '/')}
            onDone={(value) => (editList({ ...data, [(name || 'cname')]: value }), setEditing(false))}
            onCancel={() => setEditing(false)}
          />
        }
        {!isEditing &&
          <Box sx={{ ml: 2 }}>
            {!!editList &&
              <IconButton color="primary" size="small" onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
                <EditIcon fontSize="inherit" />
              </IconButton>
            }
            {!!sortList &&
              <DragHandle />
            }
            {!!delList &&
              <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); delList(data) }}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            }
          </Box>
        }
      </ListItemButton>
    </Fragment>
  )
}


const ListAddItem = (props) => {
  const { onClick } = props
  const [isHover, setHover] = useState(false)

  return (
    <ListItemButton
      sx={{ '&:hover': { backgroundColor: "#128A8C", color: "#fff" } }}
      style={{ display: "flex", justifyContent: "center", paddingLeft: "8px" }}
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AddIcon sx={{ color: !isHover ? "#1976d2" : "#fff" }} />
    </ListItemButton>
  )
}

const ListItemEditor = (props) => {
  const { onDone, onCancel, level, defaultValue } = props
  const [value, setValue] = useState("")
  const inputEl = useRef(null)

  useEffect(() => {
    setValue(defaultValue || "")
  }, [])

  const handleChange = (value) => {
    setValue(value.trim())
  }

  return (
    <ListItem sx={{ pl: !!level ? 4 + 2 * (level - 1) : null, p: level == null ? 0 : null }}>
      <TextField
        inputRef={inputEl}
        defaultValue={defaultValue}
        variant="standard"
        onChange={e => handleChange(e.target.value)}
        onKeyDown={e => e.keyCode == 13 && value.length !== 0 && onDone(inputEl.current.value.trim())}
        fullWidth
        autoFocus
        autoComplete='off'
      />
      <IconButton color="success" size="small" onClick={() => onDone(inputEl.current.value.trim())} disabled={value.length == 0}>
        <DoneIcon fontSize="inherit" />
      </IconButton>
      <IconButton color="error" size="small" onClick={onCancel}>
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </ListItem>
  )
}