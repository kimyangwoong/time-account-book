document.addEventListener('DOMContentLoaded', () => {
    const timeBalanceEl = document.getElementById('time-balance');
    const progressFill = document.getElementById('progress-fill');
    const taskInput = document.getElementById('task-input');
    const hourInput = document.getElementById('hour-input');
    const minInput = document.getElementById('min-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const taskCountEl = document.getElementById('task-count');
    const currentDateEl = document.getElementById('current-date');
    const themeToggle = document.getElementById('theme-toggle');
    const layoutToggle = document.getElementById('layout-toggle');
    const classicPlanner = document.getElementById('classic-planner');
    const miniModeBtn = document.getElementById('mini-mode-btn');
    const widgetBubble = document.getElementById('widget-bubble');
    const mainApp = document.getElementById('main-app');
    const widgetTimeEl = document.getElementById('widget-time');

    // Fixed schedule elements
    const fixedToggle = document.getElementById('fixed-toggle');
    const fixedInputArea = document.getElementById('fixed-input-area');
    const fixedAddBtn = document.getElementById('fixed-add-btn');
    const fixedListEl = document.getElementById('fixed-list');
    const fixedNameInput = document.getElementById('fixed-name');
    const fixedHInput = document.getElementById('fixed-h');
    const fixedMInput = document.getElementById('fixed-m');

    // SVG Elements
    const clockSlicesGroup = document.getElementById('clock-slices-group');
    const clockLabelsGroup = document.getElementById('clock-labels-group');
    const clockMarks = document.getElementById('clock-marks');

    let totalBudget = 24.0;
    let tasks = JSON.parse(localStorage.getItem('time-tasks')) || [];
    let fixedTasks = JSON.parse(localStorage.getItem('time-fixed-tasks')) || [];
    let currentTheme = localStorage.getItem('time-theme') || 'light';
    let currentLayout = localStorage.getItem('time-layout') || 'modern';
    let isMiniMode = localStorage.getItem('time-mini') === 'true';

    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
        });
    }

    // Initialize State
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-layout', currentLayout);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    updateLayoutUI();

    function updateLayoutUI() {
        if (currentLayout === 'classic') {
            classicPlanner.classList.remove('hidden');
            renderClock();
        } else {
            classicPlanner.classList.add('hidden');
        }
    }

    // Toggle Layout
    layoutToggle.addEventListener('click', () => {
        currentLayout = currentLayout === 'modern' ? 'classic' : 'modern';
        document.body.setAttribute('data-layout', currentLayout);
        localStorage.setItem('time-layout', currentLayout);
        updateLayoutUI();
    });

    // Toggle Theme
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('time-theme', currentTheme);
    });

    // Simple fixed toggle
    fixedToggle.addEventListener('click', () => {
        fixedInputArea.classList.toggle('hidden');
        fixedToggle.textContent = fixedInputArea.classList.contains('hidden') ? '➕' : '➖';
    });

    // Date
    const now = new Date();
    currentDateEl.textContent = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}.`;

    function formatTime(hoursFloat) {
        const h = Math.floor(hoursFloat);
        const m = Math.round((hoursFloat - h) * 60);
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    }

    function updateUI() {
        const spentTasksTime = tasks.reduce((acc, task) => acc + parseFloat(task.time), 0);
        const spentFixedTime = fixedTasks.reduce((acc, task) => acc + parseFloat(task.time), 0);
        const remainingTime = totalBudget - spentTasksTime - spentFixedTime;

        timeBalanceEl.textContent = formatTime(Math.max(0, remainingTime));
        if (widgetTimeEl) widgetTimeEl.textContent = formatTime(Math.max(0, remainingTime));

        const percentage = (remainingTime / totalBudget) * 100;
        progressFill.style.width = Math.max(0, percentage) + '%';

        if (percentage < 20) {
            progressFill.style.background = 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)';
            timeBalanceEl.style.background = 'linear-gradient(to bottom, #ff4e50, #f9d423)';
        } else {
            progressFill.style.background = 'var(--progress-gradient)';
            timeBalanceEl.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
        }
        timeBalanceEl.style.webkitBackgroundClip = 'text';
        timeBalanceEl.style.backgroundClip = 'text';
        timeBalanceEl.style.webkitTextFillColor = 'transparent';

        renderTasks();
        renderFixedTasks();
        if (currentLayout === 'classic') renderClock();

        taskCountEl.textContent = tasks.length;
        localStorage.setItem('time-tasks', JSON.stringify(tasks));
        localStorage.setItem('time-fixed-tasks', JSON.stringify(fixedTasks));
    }

    function renderClock() {
        if (!clockSlicesGroup) return;
        clockSlicesGroup.innerHTML = '';
        clockLabelsGroup.innerHTML = '';
        clockMarks.innerHTML = '';

        for (let i = 0; i < 24; i++) {
            const angle = (i * 15) - 90;
            const x1 = 100 + 90 * Math.cos(angle * Math.PI / 180);
            const y1 = 100 + 90 * Math.sin(angle * Math.PI / 180);
            const x2 = 100 + 95 * Math.cos(angle * Math.PI / 180);
            const y2 = 100 + 95 * Math.sin(angle * Math.PI / 180);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1); line.setAttribute('y1', y1);
            line.setAttribute('x2', x2); line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#ccc'); line.setAttribute('stroke-width', '0.5');
            clockMarks.appendChild(line);

            if (i % 3 === 0) {
                const tx = 100 + 82 * Math.cos(angle * Math.PI / 180);
                const ty = 100 + 82 * Math.sin(angle * Math.PI / 180);
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', tx); text.setAttribute('y', ty + 3);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('style', 'font-size: 8px; fill: #666; font-family: sans-serif;');
                text.textContent = (i === 0) ? '12' : (i > 12 ? i - 12 : i);
                clockMarks.appendChild(text);
            }
        }

        let startAngle = -90;
        const colors = [
            '#D1C4E9', // Deep Purple 100
            '#E1BEE7', // Purple 100
            '#F8BBD0', // Pink 100
            '#B2EBF2', // Cyan 100
            '#C5CAE9', // Indigo 100
            '#B3E5FC', // Light Blue 100
            '#D7CCC8', // Brown 100 (Pastel)
            '#F0F4C3'  // Lime 100 (Pastel)
        ];
        const allTasks = [...fixedTasks, ...tasks];

        allTasks.forEach((task, index) => {
            const durationAngle = (parseFloat(task.time) / 24) * 360;
            const endAngle = startAngle + durationAngle;

            const x1 = 100 + 90 * Math.cos(startAngle * Math.PI / 180);
            const y1 = 100 + 90 * Math.sin(startAngle * Math.PI / 180);
            const x2 = 100 + 90 * Math.cos(endAngle * Math.PI / 180);
            const y2 = 100 + 90 * Math.sin(endAngle * Math.PI / 180);

            const largeArcFlag = durationAngle > 180 ? 1 : 0;
            const pathData = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[index % colors.length]);
            path.setAttribute('class', 'slice');
            clockSlicesGroup.appendChild(path);

            const midAngle = startAngle + (durationAngle / 2);
            const lx = 100 + 65 * Math.cos(midAngle * Math.PI / 180);
            const ly = 100 + 65 * Math.sin(midAngle * Math.PI / 180);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx);
            text.setAttribute('y', ly);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'clock-label');
            // rotation 제거하여 가로로 고정
            text.textContent = task.name;
            clockLabelsGroup.appendChild(text);

            startAngle = endAngle;
        });
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <div class="todo-content">
                    <span class="todo-name">${task.name}</span>
                    <span class="todo-time">지출: ${formatTime(task.time)}</span>
                </div>
                <div class="delete-btn" data-index="${index}">삭제</div>
            `;
            todoList.appendChild(li);
        });

        document.querySelectorAll('.todo-section .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                tasks.splice(index, 1);
                updateUI();
            });
        });
    }

    function renderFixedTasks() {
        fixedListEl.innerHTML = '';
        fixedTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'fixed-tag';
            li.innerHTML = `
                <span>${task.name} (${formatTime(task.time)})</span>
                <span class="tag-delete" data-index="${index}">✕</span>
            `;
            fixedListEl.appendChild(li);
        });

        document.querySelectorAll('.tag-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                fixedTasks.splice(index, 1);
                updateUI();
            });
        });
    }

    fixedAddBtn.addEventListener('click', () => {
        const name = fixedNameInput.value.trim() || '고정일정';
        const h = parseInt(fixedHInput.value) || 0;
        const m = parseInt(fixedMInput.value) || 0;
        const time = h + (m / 60);

        if (time <= 0) return;

        fixedTasks.push({ name, time });
        fixedNameInput.value = '';
        fixedHInput.value = '';
        fixedMInput.value = '';
        updateUI();
    });

    addBtn.addEventListener('click', () => {
        const name = taskInput.value.trim();
        const h = parseInt(hourInput.value) || 0;
        const m = parseInt(minInput.value) || 0;
        const time = h + (m / 60);

        if (!name) {
            alert('어떤 작업인지 입력해주세요!');
            return;
        }

        if (time <= 0) {
            alert('시간을 입력해주세요!');
            return;
        }

        const currentSpent = tasks.reduce((acc, t) => acc + parseFloat(t.time), 0) +
            fixedTasks.reduce((acc, t) => acc + parseFloat(t.time), 0);

        if (currentSpent + time > totalBudget) {
            const overHours = currentSpent + time - totalBudget;
            if (!confirm(`예산을 초과했습니다! ${formatTime(overHours)}이 부족합니다. 계속하시겠습니까?`)) {
                return;
            }
        }

        tasks.push({ name, time });
        taskInput.value = '';
        hourInput.value = '';
        minInput.value = '';
        updateUI();
    });

    miniModeBtn.addEventListener('click', () => {
        mainApp.classList.add('fade-out');
        setTimeout(() => {
            mainApp.classList.add('hidden');
            mainApp.classList.remove('fade-out');
            widgetBubble.classList.remove('hidden');
            localStorage.setItem('time-mini', 'true');
        }, 400);
    });

    widgetBubble.addEventListener('click', () => {
        widgetBubble.classList.add('hidden');
        mainApp.classList.remove('hidden');
        localStorage.setItem('time-mini', 'false');
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') hourInput.focus();
    });
    hourInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') minInput.focus();
    });
    minInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    updateUI();
});
