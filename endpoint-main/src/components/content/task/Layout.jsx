import React, { useEffect } from 'react'
import { Box, Typography, Paper, useTheme } from '@mui/material'
import { useLocation } from 'react-router-dom'
import TaskList from './index'
import useTaskStore from '../../../store/tasks'
import useAppStore from '../../../store/app'

const Layout = () => {
  const { currentFilter, setFilter } = useTaskStore()
  const { isSidebarOpen } = useAppStore()
  const theme = useTheme()
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const filter = path.split('/').pop()
    setFilter(filter)
  }, [location.pathname, setFilter])

  const getFilterTitle = () => {
    switch (currentFilter) {
      case 'today':
        return '今天的任務'
      case 'week':
        return '未來七天的任務'
      case 'pending':
        return '待定的任務'
      case 'completed':
        return '已完成的任務'
      default:
        return '全部任務'
    }
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${isSidebarOpen ? 240 : 64}px)` },
        ml: { sm: `${isSidebarOpen ? 240 : 64}px` },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          mt: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '900px' }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 3
            }}
          >
            {getFilterTitle()}
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.grey[300],
              backgroundColor: 'white',
              overflow: 'hidden'
            }}
          >
            <TaskList filter={currentFilter} />
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout 