function app() {
    return {
        // 数据
        accounts: [],
        accountCounter: 1,
        completedTasks: {},
        settings: {
            defaultProfit: 500,
            buyDays: 4,
            sellDays: 7,
            friendWaitDays: 5
        },
        
        // UI状态
        sidebarOpen: false,
        displayDays: 30,
        modals: {
            add: false,
            edit: false,
            autoSchedule: false,
            settings: false,
            confirmDelete: false,
            confirmDeleteAll: false
        },
        
        // 表单数据
        form: {
            id: null,
            name: '',
            startDate: '',
            profit: 500,
            count: 5,
            replace: false
        },
        
        deleteId: null,
        
        // 任务详情
        taskDetails: {
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
        },
        
        // 初始化
        init() {
            this.loadFromStorage();
            this.form.startDate = this.formatDate(new Date());
            this.form.profit = this.settings.defaultProfit;
        },
        
        // 计算属性
        get todayDate() {
            const today = new Date();
            return this.formatDate(today) + ' ' + this.getWeekday(this.formatDate(today));
        },
        
        get todayTasks() {
            const today = this.formatDate(new Date());
            const tasks = this.getTasksForDate(today);
            return tasks.map(task => ({
                ...task,
                ...this.taskDetails[task.type]
            }));
        },
        
        get todayTasksCount() {
            return this.todayTasks.length;
        },
        
        get activeAccounts() {
            return this.accounts.filter(acc => acc.status !== 'completed');
        },
        
        get completedAccounts() {
            return this.accounts.filter(acc => acc.status === 'completed');
        },
        
        get totalProfit() {
            return this.accounts.reduce((sum, acc) => {
                return sum + (acc.profit || this.settings.defaultProfit);
            }, 0);
        },
        
        get calendarDays() {
            const days = [];
            const today = new Date();
            
            for (let i = 0; i < parseInt(this.displayDays); i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                const dateStr = this.formatDate(date);
                const tasks = this.getTasksForDate(dateStr);
                
                days.push({
                    date: dateStr,
                    weekday: this.getWeekday(dateStr),
                    isToday: this.isToday(dateStr),
                    tasks: tasks.map(task => ({
                        ...task,
                        icon: this.taskDetails[task.type].icon,
                        text: `${task.account} - ${this.taskDetails[task.type].title.substring(0, 10)}${task.dayNum ? ` (${task.dayNum}/${task.totalDays})` : ''}`
                    }))
                });
            }
            
            return days;
        },
        
        // 工具函数
        formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        
        addDays(dateStr, days) {
            const date = new Date(dateStr);
            date.setDate(date.getDate() + days);
            return this.formatDate(date);
        },
        
        getWeekday(dateStr) {
            const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const date = new Date(dateStr);
            return weekdays[date.getDay()];
        },
        
        isToday(dateStr) {
            return dateStr === this.formatDate(new Date());
        },
        
        isGiftDay(account) {
            return this.formatDate(new Date()) === account.giftDate;
        },
        
        isPastGiftDay(account) {
            return new Date() > new Date(account.giftDate);
        },
        
        formatAccountDates(account) {
            return `买: ${account.buyStart}~${account.buyEnd} | 卖: ${account.sellStart}~${account.sellEnd} | 加友: ${account.addFriendDate} | 赠送: ${account.giftDate}`;
        },
        
        getTasksForDate(dateStr) {
            const tasks = [];
            
            this.accounts.forEach(account => {
                const buyStart = new Date(account.buyStart);
                const buyEnd = new Date(account.buyEnd);
                const sellStart = new Date(account.sellStart);
                const sellEnd = new Date(account.sellEnd);
                const currentDate = new Date(dateStr);
                
                if (currentDate >= buyStart && currentDate <= buyEnd) {
                    const dayNum = Math.floor((currentDate - buyStart) / (1000 * 60 * 60 * 24)) + 1;
                    tasks.push({
                        id: `${account.id}-buy-${dateStr}`,
                        type: 'buying',
                        account: account.name,
                        accountId: account.id,
                        dayNum: dayNum,
                        totalDays: this.settings.buyDays
                    });
                }
                
                if (currentDate >= sellStart && currentDate <= sellEnd) {
                    const dayNum = Math.floor((currentDate - sellStart) / (1000 * 60 * 60 * 24)) + 1;
                    tasks.push({
                        id: `${account.id}-sell-${dateStr}`,
                        type: 'selling',
                        account: account.name,
                        accountId: account.id,
                        dayNum: dayNum,
                        totalDays: this.settings.sellDays
                    });
                }
                
                if (dateStr === account.addFriendDate) {
                    tasks.push({
                        id: `${account.id}-friend-${dateStr}`,
                        type: 'friend',
                        account: account.name,
                        accountId: account.id
                    });
                }
                
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
        },
        
        // 模态框操作
        openAddModal() {
            this.form = {
                name: `账号${this.accountCounter}`,
                startDate: this.formatDate(new Date()),
                profit: this.settings.defaultProfit
            };
            this.modals.add = true;
        },
        
        openEditModal(account) {
            this.form = {
                id: account.id,
                name: account.name,
                startDate: account.buyStart,
                profit: account.profit || this.settings.defaultProfit
            };
            this.modals.edit = true;
        },
        
        openAutoScheduleModal() {
            this.form = {
                count: 5,
                startDate: this.formatDate(new Date()),
                replace: false
            };
            this.modals.autoSchedule = true;
        },
        
        openSettingsModal() {
            this.modals.settings = true;
        },
        
        confirmDelete(id) {
            this.deleteId = id;
            this.modals.confirmDelete = true;
        },
        
        confirmDeleteAll() {
            this.modals.confirmDeleteAll = true;
        },
        
        // 账号操作
        addAccount() {
            if (!this.form.name || !this.form.startDate) {
                alert('请填写完整信息');
                return;
            }
            
            const account = {
                id: Date.now(),
                name: this.form.name,
                buyStart: this.form.startDate,
                buyEnd: this.addDays(this.form.startDate, this.settings.buyDays - 1),
                sellStart: this.addDays(this.form.startDate, this.settings.buyDays),
                sellEnd: this.addDays(this.form.startDate, this.settings.buyDays + this.settings.sellDays - 1),
                addFriendDate: this.addDays(this.form.startDate, this.settings.buyDays + 2),
                giftDate: this.addDays(this.form.startDate, this.settings.buyDays + this.settings.sellDays),
                profit: parseInt(this.form.profit) || this.settings.defaultProfit,
                status: 'active'
            };
            
            this.accounts.push(account);
            this.accountCounter++;
            this.saveToStorage();
            this.modals.add = false;
        },
        
        saveEdit() {
            const account = this.accounts.find(acc => acc.id === this.form.id);
            if (!account) return;
            
            account.name = this.form.name;
            account.buyStart = this.form.startDate;
            account.buyEnd = this.addDays(this.form.startDate, this.settings.buyDays - 1);
            account.sellStart = this.addDays(this.form.startDate, this.settings.buyDays);
            account.sellEnd = this.addDays(this.form.startDate, this.settings.buyDays + this.settings.sellDays - 1);
            account.addFriendDate = this.addDays(this.form.startDate, this.settings.buyDays + 2);
            account.giftDate = this.addDays(this.form.startDate, this.settings.buyDays + this.settings.sellDays);
            account.profit = parseInt(this.form.profit) || this.settings.defaultProfit;
            
            this.saveToStorage();
            this.modals.edit = false;
        },
        
        deleteAccount() {
            this.accounts = this.accounts.filter(acc => acc.id !== this.deleteId);
            this.saveToStorage();
            this.modals.confirmDelete = false;
        },
        
        deleteAllAccounts() {
            this.accounts = [];
            this.accountCounter = 1;
            this.completedTasks = {};
            this.saveToStorage();
            this.modals.confirmDeleteAll = false;
        },
        
        toggleAccountStatus(id) {
            const account = this.accounts.find(acc => acc.id === id);
            if (!account) return;
            
            account.status = account.status === 'completed' ? 'active' : 'completed';
            this.saveToStorage();
        },
        
        autoSchedule() {
            if (!this.form.count || !this.form.startDate) {
                alert('请填写完整信息');
                return;
            }
            
            if (this.form.replace) {
                this.accounts = [];
                this.accountCounter = 1;
            }
            
            let currentDate = this.form.startDate;
            
            for (let i = 1; i <= parseInt(this.form.count); i++) {
                const account = {
                    id: Date.now() + i,
                    name: `账号${this.accountCounter}`,
                    buyStart: currentDate,
                    buyEnd: this.addDays(currentDate, this.settings.buyDays - 1),
                    sellStart: this.addDays(currentDate, this.settings.buyDays),
                    sellEnd: this.addDays(currentDate, this.settings.buyDays + this.settings.sellDays - 1),
                    addFriendDate: this.addDays(currentDate, this.settings.buyDays + 2),
                    giftDate: this.addDays(currentDate, this.settings.buyDays + this.settings.sellDays),
                    profit: this.settings.defaultProfit,
                    status: 'active'
                };
                
                this.accounts.push(account);
                this.accountCounter++;
                currentDate = this.addDays(currentDate, this.settings.buyDays);
            }
            
            this.saveToStorage();
            this.modals.autoSchedule = false;
        },
        
        saveSettings() {
            this.saveToStorage();
            this.modals.settings = false;
        },
        
        toggleTaskComplete(taskId) {
            this.completedTasks[taskId] = !this.completedTasks[taskId];
            this.saveToStorage();
        },
        
        // 存储
        saveToStorage() {
            localStorage.setItem('skinTradingAccounts', JSON.stringify(this.accounts));
            localStorage.setItem('accountCounter', this.accountCounter);
            localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },
        
        loadFromStorage() {
            const saved = localStorage.getItem('skinTradingAccounts');
            if (saved) {
                this.accounts = JSON.parse(saved);
                this.accounts = this.accounts.map(acc => ({
                    ...acc,
                    profit: acc.profit || this.settings.defaultProfit,
                    status: acc.status || 'active'
                }));
                this.accountCounter = parseInt(localStorage.getItem('accountCounter')) || this.accounts.length + 1;
            }
            
            const savedCompleted = localStorage.getItem('completedTasks');
            if (savedCompleted) {
                this.completedTasks = JSON.parse(savedCompleted);
            }
            
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        }
    };
}
