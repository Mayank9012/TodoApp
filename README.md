# To-Do List App

A simple task management app built with the MERN stack. Keep track of your daily tasks, organize them by week, and never miss a deadline.

## What It Does

This app helps you manage your tasks efficiently. You can create tasks with titles, descriptions, dates, and priorities. The home screen shows your tasks organized by week, making it easy to see what's coming up. There's also a search feature to quickly find specific tasks.

## Features

- Create tasks with title, description, date/time, and priority levels
- Edit or delete tasks anytime
- Mark tasks as complete or in progress
- Search through your tasks
- Weekly view showing completed vs pending tasks
- Expandable week cards to see all tasks for that week
- Responsive design that works on mobile and desktop

## Built With

- React for the frontend
- Node.js and Express for the backend API
- MongoDB for storing tasks
- React Icons for the UI icons
- date-fns for date handling

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb://localhost:27017/todoapp
PORT=5000
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Go to the client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the app:
```bash
npm start
```

The app should open in your browser at http://localhost:3000

## Running Both Together

From the root directory, you can run both servers at once:

```bash
npm run dev
```

This starts the backend on port 5000 and the frontend on port 3000.


