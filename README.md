# Time Manager

A fun, comic book-styled todo list application with timer and calendar features, built with vanilla HTML, CSS, JavaScript, and MongoDB Atlas.

## Features

- ⚡ Comic book themed UI with vibrant colors and bold borders
- ✅ Create, read, update, and delete todos
- ⏱️ Built-in timer for tracking time spent on tasks
- 📅 Calendar view with monthly navigation
- 🏷️ Tags and priority levels for organization
- 📆 Due dates and filtering (All, Active, Completed, Today, This Week)
- 💾 MongoDB Atlas integration for cloud storage

## Setup Instructions

### 1. MongoDB Atlas Configuration

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access (create a user with password)
4. Get your connection string from "Connect" > "Connect your application"
5. Update the `.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
PORT=3000
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual MongoDB credentials.

### 2. Installation

Install dependencies:

```bash
npm install
```

### 3. Running the Application

Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

## Project Structure

```
/project
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Comic book themed CSS
│   └── app.js          # Frontend JavaScript
├── server.js           # Express server with MongoDB integration
├── .env                # Environment variables (MongoDB credentials)
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo