let calendarState = {
  rows: 0,
  cols: 0,
  startDate: null,
  events: {}
};

let selectedCellId = null;

const STORAGE_KEY = 'campus-events-calendar-v1';

const outputEl = document.getElementById('output');
const calendarMount = document.getElementById('calendarMount');
const panel = document.getElementById('eventPanel');
const panelDate = document.getElementById('panelDate');
const eventInput = document.getElementById('eventInput');
const eventList = document.getElementById('eventList');
const emptyState = document.getElementById('emptyState');
const addEventBtn = document.getElementById('addEventBtn');

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

const formatFullDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarState));
};

const loadState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return false;
  }
  try {
    calendarState = JSON.parse(stored);
    return true;
  } catch {
    return false;
  }
};

const updateBadge = (cellId) => {
  const badge = document.querySelector(`[data-badge="${cellId}"]`);
  if (!badge) return;

  const count = calendarState.events[cellId]?.length || 0;
  badge.textContent = `${count} event${count === 1 ? '' : 's'}`;
  badge.classList.toggle('hidden', count === 0);
};

const renderEventList = (cellId) => {
  eventList.innerHTML = '';
  const events = calendarState.events[cellId] || [];

  if (!events.length) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  events.forEach((event) => {
    const li = document.createElement('li');
    li.className = 'event-item';

    const text = document.createElement('span');
    text.textContent = event.title;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeEvent(cellId, event.id);

    li.appendChild(text);
    li.appendChild(removeBtn);
    eventList.appendChild(li);
  });
};

const openPanel = (cellId, dateLabel) => {
  selectedCellId = cellId;
  panel.style.display = 'block';
  panelDate.textContent = dateLabel;
  eventInput.value = '';
  renderEventList(cellId);
};

const addEvent = () => {
  if (!selectedCellId) return;
  const title = eventInput.value.trim();
  if (!title) return;

  const list = calendarState.events[selectedCellId] || [];
  list.push({ id: Date.now(), title });
  calendarState.events[selectedCellId] = list;

  eventInput.value = '';
  renderEventList(selectedCellId);
  updateBadge(selectedCellId);
  saveState();
};

const removeEvent = (cellId, eventId) => {
  const list = calendarState.events[cellId] || [];
  calendarState.events[cellId] = list.filter((event) => event.id !== eventId);
  renderEventList(cellId);
  updateBadge(cellId);
  saveState();
};

function createTable() {
  outputEl.textContent = '';
  const rows = Number(document.getElementById('rows').value);
  const cols = Number(document.getElementById('columns').value);

  if (!rows || !cols || rows < 1 || cols < 1) {
    outputEl.textContent = 'Please enter valid numbers for rows and columns.';
    return;
  }

  calendarState.rows = rows;
  calendarState.cols = cols;
  calendarState.startDate = new Date().toISOString();
  calendarState.events = calendarState.events || {};

  buildCalendar();
  saveState();
}

const buildCalendar = () => {
  calendarMount.innerHTML = '';
  const table = document.createElement('table');
  table.id = 'events_table';

  const startDate = calendarState.startDate
    ? new Date(calendarState.startDate)
    : new Date();
  let currentDate = new Date(startDate);

  for (let row = 0; row < calendarState.rows; row += 1) {
    const tr = document.createElement('tr');

    for (let col = 0; col < calendarState.cols; col += 1) {
      const cellId = `r${row}c${col}`;
      const td = document.createElement('td');

      const title = document.createElement('div');
      title.className = 'day-title';
      title.textContent = `Day ${row * calendarState.cols + col + 1}`;

      const dateLabel = document.createElement('div');
      dateLabel.className = 'day-date';
      dateLabel.textContent = formatDate(currentDate);

      const badge = document.createElement('span');
      badge.className = 'badge hidden';
      badge.dataset.badge = cellId;

      const actions = document.createElement('div');
      actions.className = 'cell-actions';

      const manageButton = document.createElement('button');
      manageButton.type = 'button';
      manageButton.className = 'cell-action';
      manageButton.textContent = 'Manage';
      manageButton.onclick = () => openPanel(cellId, formatFullDate(currentDate));

      actions.appendChild(manageButton);
      actions.appendChild(badge);

      td.appendChild(title);
      td.appendChild(dateLabel);
      td.appendChild(actions);
      tr.appendChild(td);

      updateBadge(cellId);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    table.appendChild(tr);
  }

  calendarMount.appendChild(table);
};

function hideEventDetail() {
  panel.style.display = 'none';
  selectedCellId = null;
}

function clearButton() {
  document.getElementById('myform').reset();
}

function refreshPage() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

addEventBtn.addEventListener('click', addEvent);

eventInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEvent();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  panel.style.display = 'none';
  if (loadState()) {
    buildCalendar();
  }
});
