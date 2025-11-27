import React, { useState, useEffect } from 'react';
import { createTask, updateTask, deleteTask } from '../services/api';
import { IoClose } from 'react-icons/io5';
import './TaskModal.css';

function TaskModal({ task, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    priority: 'Low',
    status: 'Open'
  });

  useEffect(() => {
    if (task) {
      const dateTime = new Date(task.dateTime);
      const formattedDateTime = dateTime.toISOString().slice(0, 16);
      
      setFormData({
        title: task.title,
        description: task.description || '',
        dateTime: formattedDateTime,
        priority: task.priority || 'Low',
        status: task.status
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (task) {
        await updateTask(task._id, formData);
      } else {
        await createTask(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="close-btn" onClick={onClose}>
            <IoClose size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Task title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Doing Homework"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start</label>
              <input
                type="time"
                name="startTime"
                className="time-input"
              />
            </div>
            <div className="form-group">
              <label>Ends</label>
              <input
                type="time"
                name="endTime"
                className="time-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Set Date</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add Description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {task && (
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {task ? 'Update task' : 'Create task'}
            </button>
            {task && (
              <button type="button" onClick={handleDelete} className="delete-task-btn">
                Delete Task
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
