import React, { useState } from 'react'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Collapse,
  Typography,
  IconButton,
  Box,
  TextField,
  Divider,
  useTheme,
  alpha,
} from '@mui/material'
import { ChevronDown, ChevronUp} from 'lucide-react'
import useTaskStore from '../../../store/tasks'

export default function index({ filter }) {
  const { tasks, updateTaskStatus, updateTaskDueDate } = useTaskStore()
  const [expandedTasks, setExpandedTasks] = useState([])
  const theme = useTheme()

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleStatusChange = (taskId) => {
    updateTaskStatus(taskId)
  }

  const handleDueDateChange = (taskId, event) => {
    const newDate = new Date(event.target.value)
    updateTaskDueDate(taskId, newDate)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getFilteredTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const activeTasks = tasks.filter(task => task.status === 1)
    const completedTasks = tasks.filter(task => task.status === 0)

    switch (filter) {
      case 'today':
        return activeTasks.filter(task => {
          const dueDate = new Date(task.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate.getTime() === today.getTime()
        })
      case 'week':
        return activeTasks.filter(task => {
          const dueDate = new Date(task.dueDate)
          return dueDate >= today && dueDate <= nextWeek
        })
      case 'completed':
        return completedTasks
      case 'pending':
        return activeTasks.filter(task => !task.dueDate)
      default:
        return activeTasks
    }
  }

  const filteredTasks = getFilteredTasks()

  if (filteredTasks.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            color: theme.palette.text.secondary
          }}
        >
          <Typography variant="body1">
            恭喜你任務已完成，請繼續保持!
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <List sx={{ 
        p: 0,
        width: '100%',
        bgcolor: 'background.paper'
      }}>
        {filteredTasks.map((task, index) => (
          <React.Fragment key={task.aid}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={task.status === 0}
                    onChange={() => handleStatusChange(task.aid)}
                    sx={{
                      color: theme.palette.grey[400],
                      '&.Mui-checked': {
                        color: theme.palette.success.main
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        textDecoration: task.status === 0 ? 'line-through' : 'none',
                        color: task.status === 0 ? theme.palette.text.secondary : theme.palette.text.primary
                      }}
                    >
                      {task.title}
                    </Typography>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {task.status !== 0 && (
                    <TextField
                      type="date"
                      size="small"
                      value={task.dueDate || ''}
                      onChange={(e) => handleDueDateChange(task.aid, e)}
                      sx={{
                        width: 150,
                        '& .MuiOutlinedInput-root': {
                          height: 32,
                          fontSize: '0.875rem'
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '4px 8px'
                        }
                      }}
                      InputProps={{
                        sx: {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.grey[300]
                          }
                        }
                      }}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={() => toggleExpand(task.aid)}
                    sx={{ color: theme.palette.grey[400] }}
                  >
                    {expandedTasks.includes(task.aid) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </IconButton>
                </Box>
              </Box>
              <Collapse in={expandedTasks.includes(task.aid)} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                <Box sx={{ pl: 5, pr: 2, pb: 1, pt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 2,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {task.content}
                  </Typography>
                </Box>
              </Collapse>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
} 