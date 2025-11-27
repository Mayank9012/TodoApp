import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../services/api';
import { startOfWeek, endOfWeek, format, addDays } from 'date-fns';
import { IoSettingsOutline, IoSearchOutline, IoNotificationsOutline, IoAddOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import TaskModal from './TaskModal';
import './HomeScreen.css';

function HomeScreen() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (query = '') => {
    try {
      const data = await getTasks(query);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchTasks(query);
  };

  const groupTasksByWeek = () => {
    const weeks = {};
    
    for (const task of tasks) {
      const taskDate = new Date(task.dateTime);
      const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          start: weekStart,
          end: endOfWeek(weekStart, { weekStartsOn: 1 }),
          tasks: []
        };
      }
      weeks[weekKey].tasks.push(task);
    }
    
    return Object.entries(weeks)
      .sort((a, b) => b[1].start - a[1].start)
      .slice(0, 4);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // week navigation helpers (kept for future UI controls)
  // const goPrevWeek = () => setSelectedDate(addDays(weekStart, -7));
  // const goNextWeek = () => setSelectedDate(addDays(weekStart, 7));

  const tasksForSelectedDate = tasks.filter((task) => {
    try {
      const taskDate = new Date(task.dateTime);
      return taskDate.toDateString() === selectedDate.toDateString();
    } catch (e) {
      return false;
    }
  });

  const completedCountThisWeek = tasks.filter(t => {
    const d = new Date(t.dateTime);
    return d >= weekStart && d <= weekEnd && t.status === 'Completed';
  }).length;

  const pendingCountThisWeek = tasks.filter(t => {
    const d = new Date(t.dateTime);
    return d >= weekStart && d <= weekEnd && t.status !== 'Completed';
  }).length;

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const { deleteTask } = require('../services/api');
        await deleteTask(taskId);
        fetchTasks(searchQuery);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const { updateTask } = require('../services/api');
      const newStatus = task.status === 'Completed' ? 'Open' : 'Completed';
      await updateTask(task._id, { ...task, status: newStatus });
      fetchTasks(searchQuery);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchTasks(searchQuery);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <button className="settings-btn">
            <IoSettingsOutline size={22} />
          </button>
          <div className="search-bar-desktop">
            <IoSearchOutline className="search-icon-input" size={18} />
            <input 
              type="text" 
              placeholder="Search for a task" 
              className="search-input-desktop" 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="search-btn-mobile" onClick={() => navigate('/search')}>
            <IoSearchOutline size={22} />
          </button>
          <button className="notifications-btn">
            <IoNotificationsOutline size={22} />
          </button>
        </div>
      </header>

      <div className="calendar-container">
        <div className="calendar-strip">
          {daysOfWeek.map((d) => {
            const dayName = format(d, 'EEE');
            const dayNum = d.getDate();
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <div key={d.toISOString()} className={`calendar-day ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDate(d)}>
                <span className="day-name">{dayName}</span>
                <span className="day-number">{dayNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="task-summary">
        <div className="summary-card complete">
          <div className="summary-icon">
            <IoMdCheckmark size={32} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Task Complete</span>
            <div className="summary-value">
              <span className="summary-number">{completedCountThisWeek}</span>
              <span className="summary-period">This Week</span>
            </div>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">
            <IoMdClose size={32} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Task Pending</span>
            <div className="summary-value">
              <span className="summary-number">{pendingCountThisWeek}</span>
              <span className="summary-period">This Week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Weekly Progress</h2>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${(completedCountThisWeek + pendingCountThisWeek) > 0 ? (completedCountThisWeek / (completedCountThisWeek + pendingCountThisWeek)) * 100 : 0}%` 
            }}
          ></div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>All Weeks</h2>
        </div>
        <div className="weeks-container">
          {groupTasksByWeek().map(([weekKey, weekData]) => {
            const isExpanded = expandedWeek === weekKey;
            const completed = weekData.tasks.filter(t => t.status === 'Completed').length;
            const pending = weekData.tasks.length - completed;
            
            return (
              <div key={weekKey} className="week-card">
                <div className="week-card-header" onClick={() => setExpandedWeek(isExpanded ? null : weekKey)}>
                  <div className="week-info">
                    <h3>Week of {format(weekData.start, 'MMM d')}</h3>
                    <p className="week-range">{format(weekData.start, 'MMM d')} - {format(weekData.end, 'MMM d')}</p>
                  </div>
                  <div className="week-stats">
                    <span className="stat-badge complete">{completed} Done</span>
                    <span className="stat-badge pending">{pending} Open</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="week-tasks">
                    {weekData.tasks.map(task => (
                      <div key={task._id} className="week-task-item">
                        <input 
                          type="checkbox" 
                          checked={task.status === 'Completed'}
                          onChange={() => handleToggleStatus(task)}
                          className="task-checkbox-small"
                        />
                        <span className={`task-text ${task.status === 'Completed' ? 'completed' : ''}`}>
                          {task.title}
                        </span>
                        <span className="task-date">{format(new Date(task.dateTime), 'MMM d')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Tasks Today</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="tasks-list">
          {tasksForSelectedDate.map(task => (
            <div key={task._id} className="task-item">
              <input 
                type="checkbox" 
                checked={task.status === 'Completed'}
                onChange={() => handleToggleStatus(task)}
                className="task-checkbox"
              />
              <span className={`task-title ${task.status === 'Completed' ? 'completed' : ''}`}>
                {task.title}
              </span>
              <div className="task-actions">
                <button onClick={() => handleEditTask(task)} className="task-action-btn edit">
                  <IoCreateOutline size={20} />
                </button>
                <button onClick={() => handleDeleteTask(task._id)} className="task-action-btn delete">
                  <IoTrashOutline size={20} />
                </button>
              </div>
            </div>
          ))}
          {tasksForSelectedDate.length === 0 && (
            <p className="no-tasks">No tasks for this date</p>
          )}
        </div>
      </div>

      <button className="fab" onClick={handleAddTask}>
        <IoAddOutline size={28} />
      </button>

      {showModal && (
        <TaskModal 
          task={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default HomeScreen;
