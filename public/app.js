const API_URL = 'http://localhost:3000/api';

let todos = [];
let currentFilter = 'all';
let currentView = 'list';
let tempTags = [];
let currentEditId = null;

const elements = {
  form: document.getElementById('addTodoForm'),
  todoTitle: document.getElementById('todoTitle'),
  todoDescription: document.getElementById('todoDescription'),
  todoDueDate: document.getElementById('todoDueDate'),
  tagInput: document.getElementById('tagInput'),
  addTagBtn: document.getElementById('addTagBtn'),
  tagsList: document.getElementById('tagsList'),
  toggleDetailsBtn: document.getElementById('toggleDetailsBtn'),
  detailsSection: document.getElementById('detailsSection'),
  todosList: document.getElementById('todosList'),
  emptyState: document.getElementById('emptyState'),
  listView: document.getElementById('listView'),
  calendarView: document.getElementById('calendarView'),
  completionStats: document.getElementById('completionStats'),
};

async function fetchTodos() {
  try {
    const response = await fetch(`${API_URL}/todos`);
    todos = await response.json();
    renderTodos();
  } catch (error) {
    console.error('Error fetching todos:', error);
    todos = [];
    renderTodos();
  }
}

async function addTodo(todo) {
  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    const newTodo = await response.json();
    todos.push(newTodo);
    renderTodos();
  } catch (error) {
    console.error('Error adding todo:', error);
  }
}

async function updateTodo(id, updates) {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updatedTodo = await response.json();
    const index = todos.findIndex(t => t._id === id);
    if (index !== -1) {
      todos[index] = updatedTodo;
    }
    renderTodos();
  } catch (error) {
    console.error('Error updating todo:', error);
  }
}

async function deleteTodo(id) {
  try {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    todos = todos.filter(t => t._id !== id);
    renderTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
}

elements.toggleDetailsBtn.addEventListener('click', () => {
  const isVisible = elements.detailsSection.style.display !== 'none';
  elements.detailsSection.style.display = isVisible ? 'none' : 'block';
});

elements.addTagBtn.addEventListener('click', () => {
  const tag = elements.tagInput.value.trim();
  if (tag && !tempTags.includes(tag)) {
    tempTags.push(tag);
    renderTempTags();
    elements.tagInput.value = '';
  }
});

elements.tagInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    elements.addTagBtn.click();
  }
});

function renderTempTags() {
  elements.tagsList.innerHTML = tempTags.map(tag => `
    <span class="tag-item">
      ${tag}
      <button class="tag-remove" onclick="removeTag('${tag}')">×</button>
    </span>
  `).join('');
}

function removeTag(tag) {
  tempTags = tempTags.filter(t => t !== tag);
  renderTempTags();
}

elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = elements.todoTitle.value.trim();
  if (!title) return;

  const todo = {
    title,
    description: elements.todoDescription.value.trim() || undefined,
    dueDate: elements.todoDueDate.value || undefined,
    tags: tempTags,
    completed: false,
    priority: 'medium',
    timeTracked: 0,
  };

  await addTodo(todo);

  elements.form.reset();
  tempTags = [];
  renderTempTags();
  elements.detailsSection.style.display = 'none';
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;

    if (currentView === 'list') {
      elements.listView.style.display = 'block';
      elements.calendarView.style.display = 'none';
    } else {
      elements.listView.style.display = 'none';
      elements.calendarView.style.display = 'block';
      renderCalendar();
    }
  });
});

function getFilteredTodos() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  switch (currentFilter) {
    case 'active':
      return todos.filter(t => !t.completed);
    case 'completed':
      return todos.filter(t => t.completed);
    case 'today':
      return todos.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate.getTime() === today.getTime();
      });
    case 'week':
      return todos.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= weekStart && dueDate <= weekEnd;
      });
    default:
      return todos;
  }
}

function updateCounts() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  document.getElementById('countAll').textContent = todos.length;
  document.getElementById('countActive').textContent = todos.filter(t => !t.completed).length;
  document.getElementById('countCompleted').textContent = todos.filter(t => t.completed).length;
  document.getElementById('countToday').textContent = todos.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate.getTime() === today.getTime();
  }).length;
  document.getElementById('countWeek').textContent = todos.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= weekStart && dueDate <= weekEnd;
  }).length;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTodos() {
  updateCounts();

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    elements.todosList.style.display = 'none';
    elements.emptyState.style.display = 'block';
    elements.completionStats.style.display = 'none';

    const emptyText = currentFilter === 'all'
      ? 'Create your first task to get started!'
      : 'Try changing the filter!';
    elements.emptyState.querySelector('.empty-text').textContent = emptyText;
  } else {
    elements.todosList.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.completionStats.style.display = 'block';

    const completed = todos.filter(t => t.completed).length;
    elements.completionStats.textContent = `${completed} of ${todos.length} tasks DONE!`;

    elements.todosList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');
  }
}

function createTodoElement(todo) {
  const priorityClass = `priority-${todo.priority}`;

  return `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id}">
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo._id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <div class="todo-content">
        <div class="todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}

        <div class="todo-meta">
          <span class="priority-badge ${priorityClass}">${todo.priority}!</span>
          ${todo.dueDate ? `
            <span class="meta-badge date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${formatDate(todo.dueDate)}
            </span>
          ` : ''}
          ${todo.timeTracked > 0 ? `
            <span class="meta-badge time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${formatTime(todo.timeTracked)}
            </span>
          ` : ''}
          ${todo.tags.map(tag => `
            <span class="meta-badge tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              ${tag}
            </span>
          `).join('')}
        </div>

        <div id="timer-${todo._id}" style="display: none;"></div>
      </div>

      <div class="todo-actions">
        <button class="action-btn timer" onclick="toggleTimer('${todo._id}')" title="Timer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>
        <button class="action-btn edit" onclick="editTodo('${todo._id}')" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="action-btn delete" onclick="confirmDelete('${todo._id}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

const timers = {};

function toggleTimer(id) {
  const timerElement = document.getElementById(`timer-${id}`);

  if (timerElement.style.display === 'none') {
    timerElement.style.display = 'block';
    if (!timers[id]) {
      timers[id] = { seconds: 0, interval: null };
    }
    renderTimer(id);
  } else {
    if (timers[id]?.interval) {
      clearInterval(timers[id].interval);
      timers[id].interval = null;
    }
    timerElement.style.display = 'none';
  }
}

function renderTimer(id) {
  const timer = timers[id];
  const timerElement = document.getElementById(`timer-${id}`);
  const isRunning = timer.interval !== null;

  timerElement.innerHTML = `
    <div class="timer-box">
      <div class="timer-display">${formatTime(timer.seconds)}</div>
      <div class="timer-controls">
        ${!isRunning ? `
          <button class="timer-btn start" onclick="startTimer('${id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            START!
          </button>
        ` : `
          <button class="timer-btn pause" onclick="pauseTimer('${id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            PAUSE!
          </button>
        `}
        <button class="timer-btn reset" onclick="resetTimer('${id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          RESET!
        </button>
        <button class="timer-btn save" onclick="saveTimer('${id}')">
          SAVE!
        </button>
      </div>
    </div>
  `;
}

function startTimer(id) {
  if (!timers[id].interval) {
    timers[id].interval = setInterval(() => {
      timers[id].seconds++;
      renderTimer(id);
    }, 1000);
  }
}

function pauseTimer(id) {
  if (timers[id].interval) {
    clearInterval(timers[id].interval);
    timers[id].interval = null;
    renderTimer(id);
  }
}

function resetTimer(id) {
  if (timers[id].interval) {
    clearInterval(timers[id].interval);
    timers[id].interval = null;
  }
  timers[id].seconds = 0;
  renderTimer(id);
}

async function saveTimer(id) {
  const todo = todos.find(t => t._id === id);
  if (todo && timers[id].seconds > 0) {
    await updateTodo(id, { timeTracked: todo.timeTracked + timers[id].seconds });
  }
  pauseTimer(id);
  resetTimer(id);
  toggleTimer(id);
}

async function toggleTodo(id) {
  const todo = todos.find(t => t._id === id);
  if (todo) {
    await updateTodo(id, { completed: !todo.completed });
  }
}

async function confirmDelete(id) {
  if (confirm('Delete this task?')) {
    await deleteTodo(id);
  }
}

function editTodo(id) {
  alert('Edit functionality coming soon!');
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let html = `
    <div class="calendar-header">
      <div class="calendar-title">${monthNames[month]} ${year}!</div>
      <div class="calendar-nav">
        <button class="cal-btn today" onclick="renderCalendar()">TODAY!</button>
        <button class="cal-btn nav" onclick="changeMonth(-1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="cal-btn nav" onclick="changeMonth(1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
    <div class="calendar-grid">
  `;

  dayNames.forEach(day => {
    html += `<div class="day-header">${day}</div>`;
  });

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const dateString = date.toISOString().split('T')[0];

    const dayTodos = todos.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateString);

    html += `
      <div class="day-cell ${isToday ? 'today' : ''}">
        <div class="day-number">${day}</div>
        <div class="day-todos">
          ${dayTodos.slice(0, 3).map(t => `
            <button class="day-todo ${t.completed ? 'completed' : ''}" onclick="viewTodo('${t._id}')">
              ${t.title}
            </button>
          `).join('')}
          ${dayTodos.length > 3 ? `<div class="day-more">+${dayTodos.length - 3} more!</div>` : ''}
        </div>
      </div>
    `;
  }

  const remainingDays = 42 - (startDay + daysInMonth);
  for (let day = 1; day <= remainingDays; day++) {
    html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
  }

  html += '</div>';
  elements.calendarView.innerHTML = html;
}

function changeMonth(delta) {
  alert('Month navigation coming soon!');
}

function viewTodo(id) {
  currentView = 'list';
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.view-btn[data-view="list"]').classList.add('active');
  elements.listView.style.display = 'block';
  elements.calendarView.style.display = 'none';
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  renderTodos();
}

fetchTodos();
