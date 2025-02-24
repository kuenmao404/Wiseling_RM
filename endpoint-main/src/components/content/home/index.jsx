import React from 'react'
import { Box, Divider, Button } from '@mui/material'
import NoteCard from '../../elements/cards/NoteCard'
import HistoryNote from './HistoryNote'
import { Link } from 'react-router-dom'
import HistoryVideo from './HistoryVideo'
import useAccountStore from '../../../store/account'

export default function index() {
  const { isLogin } = useAccountStore()

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Link to="/course">
          <Button>
            課程
          </Button>
        </Link>
        <Button>
          課綱
        </Button>
      </Box>
      <Divider />
      <HistoryNote />
      <Divider />
      {
        !!isLogin &&
        <>
          <HistoryVideo />
          <Divider />
        </>
      }

    </Box>
  )
}
