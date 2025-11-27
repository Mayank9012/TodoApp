import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, updateTask, deleteTask } from '../services/api';
import { IoArrowBack, IoSearchOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import TaskModal from './TaskModal';
import './SearchScreen.css';

function SearchScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await getTasks(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching tasks:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Open' : 'Completed';
      await updateTask(task._id, { ...task, status: newStatus });
      if (searchQuery.trim()) {
        const results = await getTasks(searchQuery);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        if (searchQuery.trim()) {
          const results = await getTasks(searchQuery);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    setSelectedTask(null);
    if (searchQuery.trim()) {
      const results = await getTasks(searchQuery);
      setSearchResults(results);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <IoArrowBack size={22} />
        </button>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a task"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          <IoSearchOutline className="search-icon" size={18} />
        </div>
      </div>

      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map(task => (
            <div key={task._id} className="search-result-item">
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
          ))
        ) : searchQuery.trim() ? (
          <p className="no-results">No tasks found</p>
        ) : null}
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default SearchScreen;
