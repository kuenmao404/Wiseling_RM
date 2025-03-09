import create from 'zustand'

// 模擬
const sampleTasks = {
  actionItems: [
    {
      aid: "1",
      sid: "1",
      title: "討論線性回歸與溫濕度模型的bug修正",
      content: "朱荐漳將與老師討論並解決目前在使用線性回歸進行特徵權重分析時遇到的輸出bug。",
      dueDate: "2024-12-19",
      status: 1,
      completedAt: null
    },
    {
      aid: "2",
      sid: "1", 
      title: "完工報告與程式整合",
      content: "朱荐漳需於本周五前完成完工報告與相關程式的計劃，包括PowerPoint與source code，並確認報告內容後整合至PDF。",
      dueDate: "2024-12-20",
      status: 1,
      completedAt: "2024-03-10"
    },
    {
      aid: "3",
      sid: "1",
      title: "決定投影片大綱與安排合作成果簡報",
      content: "朱荐漳需盡快決定投影片的大綱，並安排合作成果的簡報。",
      dueDate: "2024-03-15",
      status: 1,
      completedAt: null
    }
  ]
}
// ToDo:create修改掉
const useTaskStore = create((set, get) => ({
  tasks: sampleTasks.actionItems,
  currentFilter: 'all',
  setFilter: (filter) => set({ currentFilter: filter }),
  
  updateTaskStatus: (taskId) => {
    set(state => ({
      tasks: state.tasks.map(task => {
        if (task.aid === taskId) {
          const newStatus = task.status === 1 ? 0 : 1
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 0 ? new Date().toISOString() : null
          }
        }
        return task
      })
    }))
  },

  updateTaskDueDate: (taskId, newDate) => {
    set(state => ({
      tasks: state.tasks.map(task => {
        if (task.aid === taskId) {
          // 如果 newDate 是空值或無效值，直接設為 null
          if (!newDate || newDate === '') {
            return {
              ...task,
              dueDate: null
            }
          }
          
          try {
            // 嘗試解析日期
            const date = new Date(newDate)
            // 檢查是否為有效日期
            if (isNaN(date.getTime())) {
              return {
                ...task,
                dueDate: null
              }
            }
            return {
              ...task,
              dueDate: date.toISOString().split('T')[0]
            }
          } catch (error) {
            console.error('Invalid date:', error)
            return {
              ...task,
              dueDate: null
            }
          }
        }
        return task
      })
    }))
  },

  getFilteredTasks: () => {
    const { tasks, currentFilter } = get()
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    switch (currentFilter) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false
          const dueDate = new Date(task.dueDate)
          return dueDate.toDateString() === today.toDateString() && task.status === 1
        })
      case 'week':
        return tasks.filter(task => {
          if (!task.dueDate) return false
          const dueDate = new Date(task.dueDate)
          return dueDate >= today && dueDate <= nextWeek && task.status === 1
        })
      case 'pending':
        return tasks.filter(task => !task.dueDate && task.status === 1)
      case 'completed':
        return tasks.filter(task => task.status === 0)
      default:
        return tasks
    }
  }
}))

export default useTaskStore 