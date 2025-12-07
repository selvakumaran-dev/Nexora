import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Navbar from '../components/Navbar'
import { Plus, MoreHorizontal, Clock, X, Calendar } from 'lucide-react'

// Start with empty data - users create their own tasks
const INITIAL_DATA = {
    columns: {
        'col-1': { id: 'col-1', title: 'Backlog', taskIds: [], color: 'border-t-4 border-gray-400' },
        'col-2': { id: 'col-2', title: 'In Progress', taskIds: [], color: 'border-t-4 border-blue-500' },
        'col-3': { id: 'col-3', title: 'Review', taskIds: [], color: 'border-t-4 border-purple-500' },
        'col-4': { id: 'col-4', title: 'Done', taskIds: [], color: 'border-t-4 border-green-500' },
    },
    tasks: {},
    columnOrder: ['col-1', 'col-2', 'col-3', 'col-4'],
}

export default function KanbanPage() {
    const [data, setData] = useState(INITIAL_DATA)
    const [showAddTask, setShowAddTask] = useState(null)
    const [newTask, setNewTask] = useState({ content: '', priority: 'Medium' })

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const start = data.columns[source.droppableId]
        const finish = data.columns[destination.droppableId]

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds)
            newTaskIds.splice(source.index, 1)
            newTaskIds.splice(destination.index, 0, draggableId)

            const newColumn = { ...start, taskIds: newTaskIds }
            setData(prev => ({ ...prev, columns: { ...prev.columns, [newColumn.id]: newColumn } }))
            return
        }

        const startTaskIds = Array.from(start.taskIds)
        startTaskIds.splice(source.index, 1)
        const newStart = { ...start, taskIds: startTaskIds }

        const finishTaskIds = Array.from(finish.taskIds)
        finishTaskIds.splice(destination.index, 0, draggableId)
        const newFinish = { ...finish, taskIds: finishTaskIds }

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        }))
    }

    const handleAddTask = (columnId) => {
        if (!newTask.content.trim()) return

        const taskId = `task-${Date.now()}`
        const task = {
            id: taskId,
            content: newTask.content,
            priority: newTask.priority,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }

        setData(prev => ({
            ...prev,
            tasks: { ...prev.tasks, [taskId]: task },
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    taskIds: [...prev.columns[columnId].taskIds, taskId]
                }
            }
        }))

        setNewTask({ content: '', priority: 'Medium' })
        setShowAddTask(null)
    }

    const handleDeleteTask = (taskId, columnId) => {
        const newTasks = { ...data.tasks }
        delete newTasks[taskId]

        setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    taskIds: prev.columns[columnId].taskIds.filter(id => id !== taskId)
                }
            }
        }))
    }

    const totalTasks = Object.keys(data.tasks).length

    return (
        <div className="h-screen bg-[#F4F7FA] flex flex-col overflow-hidden relative">
            {/* Navbar with higher z-index to ensure navigation works */}
            <div className="relative z-50">
                <Navbar />
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative z-10">
                <div className="flex justify-between items-center mb-6 min-w-[1000px]">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 font-heading flex items-center gap-2">
                            <span className="bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent">
                                My Projects & Goals
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Track your learning path, mentorship tasks, or collaborative projects.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddTask('col-1')}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={16} /> New Goal
                    </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 h-full min-w-[1000px] pb-4">
                        {data.columnOrder.map(columnId => {
                            const column = data.columns[columnId]
                            const tasks = column.taskIds.map(taskId => data.tasks[taskId]).filter(Boolean)

                            return (
                                <div key={column.id} className="w-80 flex flex-col h-full max-h-[calc(100vh-180px)]">
                                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full ${column.color.replace('blue', 'purple').replace('green', 'orange')}`}>
                                        {/* Column Header */}
                                        <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800">{column.title}</h3>
                                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">{tasks.length}</span>
                                            </div>
                                            <button
                                                onClick={() => setShowAddTask(column.id)}
                                                className="text-gray-400 hover:text-purple-600 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Add Task Form */}
                                        {showAddTask === column.id && (
                                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                                                <input
                                                    type="text"
                                                    value={newTask.content}
                                                    onChange={(e) => setNewTask(prev => ({ ...prev, content: e.target.value }))}
                                                    placeholder="Enter goal or task..."
                                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                                    autoFocus
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={newTask.priority}
                                                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                                        className="text-xs p-1.5 border border-gray-200 rounded-lg focus:outline-none"
                                                    >
                                                        <option value="High">High</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="Low">Low</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleAddTask(column.id)}
                                                        className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg font-bold hover:bg-purple-700"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowAddTask(null); setNewTask({ content: '', priority: 'Medium' }) }}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Droppable Area */}
                                        <Droppable droppableId={column.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors min-h-[100px] ${snapshot.isDraggingOver ? 'bg-purple-50/50' : ''}`}
                                                >
                                                    {tasks.length === 0 && !snapshot.isDraggingOver && (
                                                        <div className="text-center py-8 text-gray-400 text-sm">
                                                            <p>No goals yet</p>
                                                            <button
                                                                onClick={() => setShowAddTask(column.id)}
                                                                className="text-purple-600 hover:underline mt-1 font-medium"
                                                            >
                                                                + Add goal
                                                            </button>
                                                        </div>
                                                    )}
                                                    {tasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:shadow-md hover:border-purple-100 transition-all ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-purple-500/20 z-50' : ''}`}
                                                                    style={provided.draggableProps.style}
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-50 text-red-500' :
                                                                            task.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
                                                                            }`}>
                                                                            {task.priority}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleDeleteTask(task.id, column.id)}
                                                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-800 mb-3 leading-snug">{task.content}</p>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                        <Calendar size={12} />
                                                                        {task.date}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </DragDropContext>
            </div>
        </div>
    )
}
