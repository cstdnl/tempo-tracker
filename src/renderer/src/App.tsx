import Shell from './app/Shell'
import MainPage from './pages/MainPage'
import React, { useState, useCallback, useEffect } from 'react'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import ArchivePage from './pages/ArchivePage'
import FocusPage from './pages/FocusPage'
import { Settings as SettingsIcon, ListTodo, BarChart3, Archive } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useTasks } from './hooks/useTasks'

function App(): React.JSX.Element {
  const [page, setPage] = useState<'main' | 'archive' | 'export' | 'settings'>('main')
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null)

  const {
    tasks,
    runningByTask,
    loading,
    addTask,
    toggleComplete,
    start,
    pause,
    removeTask,
    archiveTask,
    subtasksByTask,
    loadSubtasks,
    addSubtask,
    toggleSubtaskComplete,
    deleteSubtask
  } = useTasks()

  useEffect(() => {
    window.api.onNavigate((targetPage) => {
      if (targetPage === 'new-task') {
        setPage('main')
        setTimeout(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'n',
            metaKey: process.platform === 'darwin',
            ctrlKey: process.platform !== 'darwin',
            bubbles: true
          }))
        }, 50)
      } else {
        setPage(targetPage)
      }
    })
  }, [])

  const handleEnterFocus = useCallback((taskId: number) => {
    setFocusTaskId(taskId)
    window.api.setFocusMode(true)
  }, [])

  const handleExitFocus = useCallback(() => {
    setFocusTaskId(null)
    window.api.setFocusMode(false)
  }, [])

  if (focusTaskId !== null) {
    const task = tasks.find((t) => t.id === focusTaskId)
    if (task) {
      return (
        <FocusPage
          task={task}
          entry={runningByTask[focusTaskId] || null}
          onStart={start}
          onPause={pause}
          onExit={handleExitFocus}
        />
      )
    }
  }


  const pageTitles = {
    main: 'Tasks',
    archive: 'Archive',
    export: 'Reports',
    settings: 'Settings'
  }

  return (
    <Shell>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4 pt-1">
          <Tabs 
            value={page} 
            onValueChange={(value) => setPage(value as 'main' | 'archive' | 'export' | 'settings')}
            className="w-auto"
          >
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="main" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                  "data-[state=active]:bg-muted data-[state=active]:shadow-none",
                  "hover:bg-muted/50"
                )}
              >
                <ListTodo className="h-4 w-4" />
                <span className="text-sm font-medium">Tasks</span>
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                  "data-[state=active]:bg-muted data-[state=active]:shadow-none",
                  "hover:bg-muted/50"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Report</span>
              </TabsTrigger>
              <TabsTrigger 
                value="archive" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                  "data-[state=active]:bg-muted data-[state=active]:shadow-none",
                  "hover:bg-muted/50"
                )}
              >
                <Archive className="h-4 w-4" />
                <span className="text-sm font-medium">Archive</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
                  "data-[state=active]:bg-muted data-[state=active]:shadow-none",
                  "hover:bg-muted/50"
                )}
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-4 w-px bg-border hidden sm:block" />
          
          <h1 className="text-sm font-semibold text-muted-foreground hidden sm:block">
            {pageTitles[page]}
          </h1>
        </div>
      </header>

      {page === 'main' ? (
        <MainPage
          tasks={tasks}
          runningByTask={runningByTask}
          loading={loading}
          addTask={addTask}
          toggleComplete={toggleComplete}
          start={start}
          pause={pause}
          removeTask={removeTask}
          archiveTask={archiveTask}
          subtasksByTask={subtasksByTask}
          loadSubtasks={loadSubtasks}
          addSubtask={addSubtask}
          toggleSubtaskComplete={toggleSubtaskComplete}
          deleteSubtask={deleteSubtask}
          onEnterFocus={handleEnterFocus}
        />
      ) : page === 'archive' ? (
        <ArchivePage />
      ) : page === 'export' ? (
        <ReportPage />
      ) : (
        <SettingsPage />
      )}
    </Shell>
  )
}

export default App
