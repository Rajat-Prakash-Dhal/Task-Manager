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

### MongoDB Atlas Configuration


Update the `.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
PORT=3000
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual MongoDB credentials.

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