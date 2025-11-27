import React from 'react';
import { format } from 'date-fns';
import './WeekCard.css';

function WeekCard({ week, onSelectWeek, isSelected }) {
  const completedTasks = week.tasks.filter(t => t.status === 'Completed').length;
  const openTasks = week.tasks.length - completedTasks;

  return (
    <div className={`week-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelectWeek(week)}>
      <div className="week-header">
        <span className="week-label">Week of {format(week.start, 'MMM d')}</span>
      </div>
      <div className="week-stats">
        <div className="stat">
          <span className="stat-value">{openTasks}</span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat">
          <span className="stat-value">{completedTasks}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>
      
      {isSelected && (
        <div className="week-tasks">
          {week.tasks.map(task => (
            <div key={task._id} className="week-task-item">
              <span className={`task-title ${task.status === 'Completed' ? 'completed' : ''}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeekCard;
