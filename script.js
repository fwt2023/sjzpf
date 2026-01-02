let accounts = [];
let accountCounter = 1;
let completedTasks = {};

// 任务详细说明
const taskDetails = {
    buying: {
        title: '使用脚本买低价皮肤',
        description: '今天需要使用脚本为账号购买低价皮肤。这个过程需要专注操作，脚本只能同时操作一个账号。',
        steps: [
            '打开游戏客户端，登录对应账号',
            '启动购买脚本',
            '监控脚本运行状态，确保购买成功',
            '记录今日购买的皮肤数量和金额',
            '完成后关闭脚本，准备明天继续'
        ],
        priority: 'high',
        icon: '🛒'
    },
    selling: {
        title: '挂售皮肤',
        description: '将购买的皮肤以高价挂售。这个过程不需要脚本，可以多账号同时操作。',
        steps: [
            '登录交易平台',
            '将购买的皮肤以目标价格挂售',
            '检查挂售状态，确保价格正确',
            '可以同时处理多个账号的挂售'
        ],
        priority: 'medium',
        icon: '💰'
    },
    friend: {
        title: '添加买家为好友',
        description: '今天需要添加买家为好友。注意：加好友后需要等待5天才能赠送皮肤，所以这个时间点很关键！',
        steps: [
            '联系买家，获取游戏ID',
            '在游戏中添加买家为好友',
            '确认好友申请已发送',
            '记录添加好友的日期（5天后可赠送）',
            '提醒买家接受好友申请'
        ],
        priority: 'high',
        icon: '👥'
    },
    gift: {
        title: '赠送皮肤并收款（获利500元）',
        description: '今天是赠送日！卖皮肤已完成，好友等待期已满5天，现在可以一次性赠送5次皮肤，完成交易获利500元。',
        steps: [
            '确认买家已经付款',
            '登录游戏，找到对应好友',
            '连续赠送5次皮肤（每个账号每月最多送5次）',
            '截图保存赠送记录',
            '确认买家收到皮肤',
            '完成交易，获利500元！🎉'
        ],
        priority: 'high',
        icon: '🎁'
    }
};

// 工具函数
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

function getWeekday(dateStr) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date(dateStr);
    return weekdays[date.getDay()];
}

function isToday(dateStr) {
    return dateStr === formatDate(new Date());
}

// 获取指定日期的任务
function getTasksForDate(dateStr) {
    const tasks = [];
    
    accounts.forEach(account => {
        const buyStart = new Date(account.buyStart);
        const buyEnd = new Date(account.buyEnd);
        const sellStart = new Date(account.sellStart);
        const sellEnd = new Date(account.sellEnd);
        const currentDate = new Date(dateStr);
        
        // 买皮肤
        if (currentDate >= buyStart && currentDate <= buyEnd) {
            const dayNum = Math.floor((currentDate - buyStart) / (1000 * 60 * 60 * 24)) + 1;
            tasks.push({
                id: `${account.id}-buy-${dateStr}`,
                type: 'buying',
                account: account.name,
                accountId: account.id,
                dayNum: dayNum,
                totalDays: 4
            });
        }
        
        // 卖皮肤
        if (currentDate >= sellStart && currentDate <= sellEnd) {
            const dayNum = Math.floor((currentDate - sellStart) / (1000 * 60 * 60 * 24)) + 1;
            tasks.push({
                id: `${account.id}-sell-${dateStr}`,
                type: 'selling',
                account: account.name,
                accountId: account.id,
                dayNum: dayNum,
                totalDays: 7
            });
        }
        
        // 加好友
        if (dateStr === account.addFriendDate) {
            tasks.push({
                id: `${account.id}-friend-${dateStr}`,
                type: 'friend',
                account: account.name,
                accountId: account.id
            });
        }
        
        // 赠送
        if (dateStr === account.giftDate) {
            tasks.push({
                id: `${account.id}-gift-${dateStr}`,
                type: 'gift',
                account: account.name,
                accountId: account.id
            });
        }
    });
    
    return tasks;
}

// 渲染今日任务
function renderTodayTasks() {
    const today = formatDate(new Date());
    const tasks = getTasksForDate(today);
    const container = document.getElementById('todayTasksList');
    
    document.getElementById('todayDate').textContent = `${today} ${getWeekday(today)}`;
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <div class="empty-text">今天没有任务，好好休息一下吧！</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        const detail = taskDetails[task.type];
        const isCompleted = completedTasks[task.id];
        
        return `
            <div class="task-card ${isCompleted ? 'completed' : ''}">
                <div class="task-header">
                    <div>
                        <div class="task-title">
                            <span class="task-icon">${detail.icon}</span>
                            <span>${task.account}</span>
                            <span class="task-badge badge-${detail.priority}">
                                ${detail.priority === 'high' ? '重要' : '中等'}
                            </span>
                        </div>
                        ${task.dayNum ? `<div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">进度：第${task.dayNum}/${task.totalDays}天</div>` : ''}
                    </div>
                    <button class="task-complete-btn ${isCompleted ? 'completed' : ''}" 
                            onclick="toggleTaskComplete('${task.id}')">
                        ${isCompleted ? '✓ 已完成' : '标记完成'}
                    </button>
                </div>
                
                <div class="task-description">
                    <strong>${detail.title}</strong><br>
                    ${detail.description}
                </div>
                
                <div class="task-steps">
                    <strong style="color: var(--primary);">📝 操作步骤：</strong>
                    ${detail.steps.map(step => `<div class="task-step">${step}</div>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 渲染账号列表
function renderAccounts() {
    const container = document.getElementById('accountsList');
    const section = document.getElementById('accountsSection');
    
    if (accounts.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = accounts.map(account => `
        <div class="account-card">
            <div class="account-info">
                <div class="account-name">${account.name}</div>
                <div class="account-dates">
                    买: ${account.buyStart}~${account.buyEnd} | 
                    卖: ${account.sellStart}~${account.sellEnd} | 
                    加友: ${account.addFriendDate} | 
                    赠送: ${account.giftDate}
                </div>
            </div>
            <div class="account-actions">
                <span class="profit-badge">+500元</span>
                <button class="btn-icon" onclick="editAccount(${account.id})" title="编辑">✏️</button>
                <button class="btn-icon" onclick="deleteAccount(${account.id})" title="删除">🗑️</button>
            </div>
        </div>
    `).join('');
}

// 渲染日历
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const displayDays = parseInt(document.getElementById('displayDays').value);
    const today = new Date();
    
    let html = '';
    
    for (let i = 0; i < displayDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
        const tasks = getTasksForDate(dateStr);
        const isTodayDate = isToday(dateStr);
        
        html += `
            <div class="day-card">
                <div class="day-header">
                    <div>
                        <div class="day-date">${dateStr}</div>
                        <div class="day-weekday">${getWeekday(dateStr)}</div>
                    </div>
                    ${isTodayDate ? '<span class="today-badge">今天</span>' : ''}
                </div>
                <div class="day-tasks">
                    ${tasks.length > 0 ? tasks.map(task => {
                        const detail = taskDetails[task.type];
                        return `
                            <div class="day-task ${task.type}">
                                <span>${detail.icon}</span>
                                <span>${task.account} - ${detail.title.substring(0, 10)}${task.dayNum ? ` (${task.dayNum}/${task.totalDays})` : ''}</span>
                            </div>
                        `;
                    }).join('') : '<div class="no-tasks">无任务</div>'}
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// 更新统计
function updateStats() {
    const today = formatDate(new Date());
    const todayTasks = getTasksForDate(today);
    
    document.getElementById('totalAccounts').textContent = accounts.length;
    document.getElementById('totalProfit').textContent = '¥' + (accounts.length * 500);
    document.getElementById('todayTasks').textContent = todayTasks.length;
}

// 渲染所有
function renderAll() {
    renderTodayTasks();
    renderAccounts();
    renderCalendar();
    updateStats();
}

// 切换任务完成状态
function toggleTaskComplete(taskId) {
    completedTasks[taskId] = !completedTasks[taskId];
    saveToLocalStorage();
    renderTodayTasks();
}

// 添加账号
function showAddAccountModal() {
    const name = prompt('请输入账号名称：', `账号${accountCounter}`);
    if (!name) return;
    
    const startDate = prompt('请输入开始买皮肤日期（格式：YYYY-MM-DD）：', formatDate(new Date()));
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        alert('日期格式不正确！');
        return;
    }
    
    const account = {
        id: Date.now(),
        name: name,
        buyStart: startDate,
        buyEnd: addDays(startDate, 3),
        sellStart: addDays(startDate, 4),
        sellEnd: addDays(startDate, 10),
        addFriendDate: addDays(startDate, 6),
        giftDate: addDays(startDate, 11)
    };
    
    accounts.push(account);
    accountCounter++;
    
    saveToLocalStorage();
    renderAll();
}

// 自动排期
function autoSchedule() {
    const count = parseInt(prompt('要自动排期多少个账号？', '5'));
    if (!count || count < 1) return;
    
    const startDate = prompt('请输入起始日期（格式：YYYY-MM-DD）：', formatDate(new Date()));
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        alert('日期格式不正确！');
        return;
    }
    
    let currentDate = startDate;
    
    for (let i = 1; i <= count; i++) {
        const account = {
            id: Date.now() + i,
            name: `账号${accountCounter}`,
            buyStart: currentDate,
            buyEnd: addDays(currentDate, 3),
            sellStart: addDays(currentDate, 4),
            sellEnd: addDays(currentDate, 10),
            addFriendDate: addDays(currentDate, 6),
            giftDate: addDays(currentDate, 11)
        };
        
        accounts.push(account);
        accountCounter++;
        currentDate = addDays(currentDate, 4);
    }
    
    saveToLocalStorage();
    renderAll();
}

// 编辑账号
function editAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;
    
    const newName = prompt('请输入新的账号名称：', account.name);
    if (newName && newName.trim()) {
        account.name = newName.trim();
    }
    
    const newDate = prompt('请输入新的开始日期（格式：YYYY-MM-DD）：', account.buyStart);
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        account.buyStart = newDate;
        account.buyEnd = addDays(newDate, 3);
        account.sellStart = addDays(newDate, 4);
        account.sellEnd = addDays(newDate, 10);
        account.addFriendDate = addDays(newDate, 6);
        account.giftDate = addDays(newDate, 11);
    }
    
    saveToLocalStorage();
    renderAll();
}

// 删除账号
function deleteAccount(id) {
    if (confirm('确定要删除这个账号吗？')) {
        accounts = accounts.filter(acc => acc.id !== id);
        saveToLocalStorage();
        renderAll();
    }
}

// 导出日历
function exportToCalendar() {
    alert('日历导出功能开发中...');
}

// 切换移动端菜单
function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

// 本地存储
function saveToLocalStorage() {
    localStorage.setItem('skinTradingAccounts', JSON.stringify(accounts));
    localStorage.setItem('accountCounter', accountCounter);
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('skinTradingAccounts');
    if (saved) {
        accounts = JSON.parse(saved);
        accountCounter = parseInt(localStorage.getItem('accountCounter')) || accounts.length + 1;
    }
    
    const savedCompleted = localStorage.getItem('completedTasks');
    if (savedCompleted) {
        completedTasks = JSON.parse(savedCompleted);
    }
    
    renderAll();
}

// 初始化
loadFromLocalStorage();
