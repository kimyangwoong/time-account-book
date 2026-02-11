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
    const miniModeBtn = document.getElementById('mini-mode-btn');
    const widgetBubble = document.getElementById('widget-bubble');
    const mainApp = document.getElementById('main-app');
    const widgetTimeEl = document.getElementById('widget-time');

    let totalBudget = 24.0;
    let tasks = JSON.parse(localStorage.getItem('time-tasks')) || [];
    let currentTheme = localStorage.getItem('time-theme') || 'light';
    let isMiniMode = localStorage.getItem('time-mini') === 'true';

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
        });
    }

    // 초기 상태 설정
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';

    if (isMiniMode) {
        mainApp.classList.add('hidden');
        widgetBubble.classList.remove('hidden');
    }

    // 위젯 모드 전환
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

    // 테마 전환 이벤트
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('time-theme', currentTheme);
    });

    // 날짜 표시
    const now = new Date();
    currentDateEl.textContent = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}.`;

    function formatTime(hoursFloat) {
        const h = Math.floor(hoursFloat);
        const m = Math.round((hoursFloat - h) * 60);
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    }

    function updateUI() {
        const spentTime = tasks.reduce((acc, task) => acc + parseFloat(task.time), 0);
        const remainingTime = totalBudget - spentTime;

        timeBalanceEl.textContent = formatTime(Math.max(0, remainingTime));
        widgetTimeEl.textContent = formatTime(Math.max(0, remainingTime));

        const percentage = (remainingTime / totalBudget) * 100;
        progressFill.style.width = Math.max(0, percentage) + '%';

        if (percentage < 20) {
            progressFill.style.background = 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)';
            timeBalanceEl.style.background = 'linear-gradient(to bottom, #ff4e50, #f9d423)';
        } else {
            progressFill.style.background = 'var(--progress-gradient)';
            timeBalanceEl.style.background = 'linear-gradient(to bottom, #6a11cb, #2575fc)';
        }
        timeBalanceEl.style.webkitBackgroundClip = 'text';
        timeBalanceEl.style.backgroundClip = 'text';
        timeBalanceEl.style.webkitTextFillColor = 'transparent';

        renderTasks();
        taskCountEl.textContent = tasks.length;
        localStorage.setItem('time-tasks', JSON.stringify(tasks));
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

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                tasks.splice(index, 1);
                updateUI();
            });
        });
    }

    addBtn.addEventListener('click', () => {
        const name = taskInput.value.trim();
        const h = parseInt(hourInput.value) || 0;
        const m = parseInt(minInput.value) || 0;
        const time = h + (m / 60);

        if (!name) {
            alert('어떤 작업인지 입력해주세요!');
            return;
        }

        if (time <= 0 || time > 24) {
            alert('유효한 시간을 입력해주세요 (0~24시간)');
            return;
        }

        const currentSpent = tasks.reduce((acc, t) => acc + parseFloat(t.time), 0);
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
