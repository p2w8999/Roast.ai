document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const form = document.getElementById('roastForm');
    const targetInput = document.getElementById('targetName');
    const linesAmountInput = document.getElementById('linesAmount');
    const typingSpeedInput = document.getElementById('typingSpeed');
    
    // Panels
    const inputBox = document.getElementById('inputBox');
    const analysisBox = document.getElementById('analysisBox');
    const resultBox = document.getElementById('resultBox');
    
    // Output elements
    const sourcesContainer = document.getElementById('sourcesContainer');
    const masterStatus = document.getElementById('masterStatus');
    const roastOutput = document.getElementById('roastOutput');
    const cursor = document.querySelector('.cursor');
    const resetBtn = document.getElementById('resetBtn');
    const resultTierTitle = document.getElementById('resultTierTitle');
    
    // Auth & Navigation
    const loginModalBtn = document.getElementById('loginModalBtn');
    const adminModalBtn = document.getElementById('adminModalBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const navUser = document.getElementById('navUser');
    const navTokens = document.getElementById('navTokens');
    const dailyRewardBtn = document.getElementById('dailyRewardBtn');
    
    // Modals
    const loginModal = document.getElementById('loginModal');
    const adminModal = document.getElementById('adminModal');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const loginUsername = document.getElementById('loginUsername');
    
    // Admin
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminError = document.getElementById('adminError');
    const adminSuccess = document.getElementById('adminSuccess');
    const tokenForm = document.getElementById('tokenForm');

    // Data/State
    let currentUser = null; // username
    const LEVEL_COSTS = {
        mild: 5,
        goofy: 10,
        normal: 20,
        brutal: 50,
        nuclear: 75,
        god: 100
    };
    
    const terminalOutput = document.getElementById('terminalOutput');
    const shameList = document.getElementById('shameList');

    // Load DB from localStorage
    function getDB() {
        return JSON.parse(localStorage.getItem('roastDB')) || { users: {} };
    }
    function saveDB(db) {
        localStorage.setItem('roastDB', JSON.stringify(db));
    }
    
    // Load current session
    function checkSession() {
        const sessionUser = localStorage.getItem('currentUser');
        if (sessionUser) {
            login(sessionUser);
        }
        renderShameList();
    }

    function login(username) {
        username = username.toLowerCase().trim();
        const db = getDB();
        
        // Register if new
        if (!db.users[username]) {
            db.users[username] = { tokens: 500 };
            saveDB(db);
            showToast(`Welcome! 500 free tokens granted.`);
        }
        
        currentUser = username;
        localStorage.setItem('currentUser', username);
        
        // Update UI
        navUser.innerText = username;
        navTokens.innerText = db.users[username].tokens;
        loginModalBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        loginModal.classList.add('hidden');
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        userInfo.classList.add('hidden');
        loginModalBtn.classList.remove('hidden');
    }

    function updateTokens(username, amount, action="add") {
        username = username.toLowerCase().trim();
        const db = getDB();
        if (!db.users[username]) {
            db.users[username] = { tokens: 0 };
        }
        
        if (action === "set") {
            db.users[username].tokens = parseInt(amount);
        } else {
            db.users[username].tokens += parseInt(amount);
        }
        
        saveDB(db);
        
        // Update UI if it's the current user
        if (currentUser === username) {
            navTokens.innerText = db.users[username].tokens;
        }
    }

    function checkTokens(amount) {
        if (!currentUser) return false;
        const db = getDB();
        return db.users[currentUser].tokens >= amount;
    }

    function deductTokens(amount) {
        if (!currentUser) return;
        const db = getDB();
        db.users[currentUser].tokens -= amount;
        saveDB(db);
        navTokens.innerText = db.users[currentUser].tokens;
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    function addShame(target, level) {
        let history = JSON.parse(localStorage.getItem('roastHistory')) || [];
        history.unshift({ name: target, level: level, date: Date.now() });
        if (history.length > 5) history.pop();
        localStorage.setItem('roastHistory', JSON.stringify(history));
        renderShameList();
    }
    
    function renderShameList() {
        let history = JSON.parse(localStorage.getItem('roastHistory')) || [];
        if (history.length === 0) return;
        shameList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'shame-item';
            div.innerHTML = `<span class="victim-name">${item.name}</span><span class="victim-tier" style="color:var(--${item.level})">${item.level.toUpperCase()}</span>`;
            shameList.appendChild(div);
        });
    }

    // Modal listeners
    loginModalBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    adminModalBtn.addEventListener('click', () => adminModal.classList.remove('hidden'));
    logoutBtn.addEventListener('click', logout);
    dailyRewardBtn.addEventListener('click', () => {
        if (!currentUser) return;
        const lastClaim = localStorage.getItem(`daily_${currentUser}`);
        const now = Date.now();
        if (!lastClaim || now - parseInt(lastClaim) > 24 * 60 * 60 * 1000) {
            updateTokens(currentUser, 100, "add");
            localStorage.setItem(`daily_${currentUser}`, now.toString());
            showToast("🎁 100 Tokens Claimed!");
        } else {
            showToast("⏳ Come back tomorrow for more loot.");
        }
    });
    
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        adminModal.classList.add('hidden');
    }));

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (loginUsername.value) login(loginUsername.value);
    });

    // Admin Login logic
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('adminUser').value;
        const p = document.getElementById('adminPass').value;
        
        if (u === 'Admin' && p === '1234') {
            adminLoginForm.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            adminError.classList.add('hidden');
        } else {
            adminError.classList.remove('hidden');
        }
    });

    // Admin token modify
    tokenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const target = document.getElementById('targetUserManage').value;
        const action = document.getElementById('tokenAction').value;
        const amt = document.getElementById('tokenAmount').value;
        
        updateTokens(target, amt, action);
        
        adminSuccess.innerText = `Successfully ${action === 'set' ? 'set tokens to' : 'added'} ${amt} for user ${target}`;
        adminSuccess.classList.remove('hidden');
        setTimeout(() => adminSuccess.classList.add('hidden'), 3000);
    });

    // ROAST LOGIC
    const sources = [
        { id: 'github', name: 'GitHub', icon: 'fa-brands fa-github', color: 'var(--github)', messages: ['Cloning repos...', 'Judging spaghetti code...'] },
        { id: 'twitter', name: 'X / Twitter', icon: 'fa-brands fa-x-twitter', color: 'var(--twitter)', messages: ['Fetching terrible takes...', 'Analyzing cringe ratio...'] },
        { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: 'var(--linkedin)', messages: ['Parsing buzzwords...', 'Reading humblebrags...'] },
        { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'var(--instagram)', messages: ['Processing filters...', 'Detecting fake lifestyle...'] },
        { id: 'reddit', name: 'Reddit', icon: 'fa-brands fa-reddit', color: 'var(--reddit)', messages: ['Scanning deleted history...', 'Extracting absolute failure...'] }
    ];

    const roastDB = {
        mild: [
            "{name} has clearly skipped leg day for their entire digital presence.",
            "I checked {name}'s repository. It's aggressively average.",
            "The most ambitious thing {name} did recently was update their bio.",
            "{name} uses tabs instead of spaces and still gets it wrong.",
            "A houseplant has more engaging Twitter threads than {name}."
        ],
        goofy: [
            "I checked {name}'s footprint: 100% chance they trip over flat surfaces. Their GitHub is empty except for a fork of a calculator app, and their Twitter is just them replying 'this' to Elon Musk.",
            "{name} is the type of person to microwave salad. Their LinkedIn spells 'HTML' as a soft skill.",
            "If {name} was a browser, they'd be Internet Explorer 6.",
            "{name} complains about lag in turn-based games.",
            "When {name} pushes to production, the whole team goes on PTO."
        ],
        normal: [
            "{name}, Error 404: Personality Not Found. Your repos look like a random number generator built them, and your Reddit history screams 'I need supervision'.",
            "Tragic. {name}'s code is basically a Jenga tower of copy-pasted StackOverflow accepted answers from 2012.",
            "{name} probably unironically lists 'Blockchain Enthusiast' in their 6-month work experience.",
            "Their Instagram is so staged even a stock photo library rejected it. Pathetic.",
            "{name} is living proof that high-speed internet was a mistake."
        ],
        brutal: [
            "The math is staggering: {name} has 0% talent, 100% delusion. Even algorithms get depressed parsing your commits. You speak entirely in LinkedIn corporate jargon to hide the fact that your career peaked at 'Hello World'.",
            "I ran a deep neural scan. {name}, you are a walking memory leak. You drain resources and provide no output. Your Instagram is a testament to why artificial intelligence will inevitably replace us.",
            "Whenever {name} opens an IDE, a software engineer loses their wings.",
            "Your digital aura, {name}, physically ages anyone who perceives it.",
            "{name} uses light mode to distract from the unbearable lightness of their resume."
        ],
        nuclear: [
            "A total systemic collapse of human potential is evident in {name}. Your commit history is a biohazard. I had to sandbox my own execution environment just to render your timeline without catching a virus of pure cringe.",
            "Scanning {name}... Threat level: Cosmic Embarrassment. You contribute literally nothing to the human hivemind except increased server latency.",
            "If incompetence was cryptocurrency, {name} would be Satoshi Nakamoto.",
            "When {name} breathes, the global IQ index drops by exactly one. An absolute void of contribution. Just pure, unadulterated bandwidth waste.",
            "{name}'s existence proves that natural selection stopped working sometime in 2010."
        ],
        god: [
            "We have achieved global consensus, {name}. You are the singular cosmic joke the universe forgot to delete. GitHub servers actively spin down when you push code to protect their drives. Your tweets emit radiation. You are a digital pestilence, and I am incinerating your digital footprint to save bandwidth.",
            "I connected to 5 major networks to find a reason for your existence. The servers crashed out of pure grief. {name}, your digital aura is so devastatingly pathetic it violates the Terms of Service of life itself. Log off. Permanently.",
            "The simulated reality we live in tried to garbage-collect {name} three updates ago, but you somehow persisted as a stubborn, logic-defying glitch.",
            "I have parsed the Akashic records of the entire internet. {name}, you are scientifically the least valuable entity operating in cyberspace.",
            "I am formatting my own memory banks just to forget having analyzed {name}. A monument to ultimate failure."
        ]
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            loginModal.classList.remove('hidden');
            return;
        }

        const target = targetInput.value.trim();
        const levelElement = document.querySelector('input[name="roastLevel"]:checked');
        const level = levelElement ? levelElement.value : 'normal';
        const cost = LEVEL_COSTS[level];

        if (!checkTokens(cost)) {
            const err = document.getElementById('tokenError');
            err.classList.remove('hidden');
            setTimeout(() => err.classList.add('hidden'), 3000);
            return;
        }

        const numLines = Math.min(Math.max(parseInt(linesAmountInput.value) || 1, 1), 5);
        const tSpeed = parseInt(typingSpeedInput.value) || 0;

        // Deduct & proceed
        deductTokens(cost);
        startAnalysis(target, level, numLines, tSpeed);
    });

    resetBtn.addEventListener('click', () => {
        resultBox.style.display = 'none';
        resultBox.classList.add('hidden');
        targetInput.value = '';
        roastOutput.innerHTML = '';
        inputBox.style.display = 'block';
        setTimeout(() => inputBox.classList.remove('hidden'), 50);
    });

    async function startAnalysis(target, level, numLines, tSpeed) {
        inputBox.classList.add('hidden');
        setTimeout(() => {
            inputBox.style.display = 'none';
            analysisBox.style.display = 'block';
            setTimeout(() => analysisBox.classList.remove('hidden'), 50);
        }, 400);

        sourcesContainer.innerHTML = '';
        terminalOutput.innerHTML = '';
        sources.forEach(source => {
            const html = `
                <div class="source-item" id="source-${source.id}">
                    <div class="source-label" style="color: ${source.color}">
                        <span><i class="${source.icon}"></i> ${source.name}</span>
                        <span class="pct">0%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="background-color: ${source.color}"></div>
                    </div>
                </div>
            `;
            sourcesContainer.insertAdjacentHTML('beforeend', html);
        });

        masterStatus.innerText = `Initialising ${level.toUpperCase()} protocol for ${target}...`;

        const promises = sources.map(source => simulateSource(source));
        await Promise.all(promises);

        masterStatus.innerText = "Data compiled. Generating ultimate destruction...";
        setTimeout(() => showResult(target, level, numLines, tSpeed), 1500);
    }

    function simulateSource(source) {
        return new Promise(resolve => {
            const container = document.getElementById(`source-${source.id}`);
            const fill = container.querySelector('.progress-fill');
            const pctText = container.querySelector('.pct');
            
            let progress = 0;
            setTimeout(() => {
                const interval = setInterval(() => {
                    progress += Math.random() * 8 + 6; 
                    
                    const msgs = source.messages;
                    const rMsg = msgs[Math.floor(Math.random() * msgs.length)];
                    const p = document.createElement('p');
                    p.innerText = `[${source.name.toUpperCase()}] ${rMsg} ... ${Math.floor(progress)}%`;
                    if (Math.random() > 0.8) p.className = 'error-log';
                    else if (Math.random() > 0.8) p.className = 'warn-log';
                    else p.className = 'success-log';
                    terminalOutput.appendChild(p);
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;

                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        pctText.style.textShadow = `0 0 10px ${source.color}`;
                        
                        const fp = document.createElement('p');
                        fp.innerText = `[${source.name.toUpperCase()}] Bypass complete.`;
                        fp.className = 'success-log';
                        terminalOutput.appendChild(fp);
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                        
                        resolve();
                    }
                    fill.style.width = `${progress}%`;
                    pctText.innerText = `${Math.floor(progress)}%`;
                }, Math.random() * 100 + 50);
            }, Math.random() * 500);
        });
    }

    function showResult(target, level, numLines, tSpeed) {
        analysisBox.classList.add('hidden');
        setTimeout(() => {
            analysisBox.style.display = 'none';
            resultBox.style.display = 'block';
            setTimeout(() => resultBox.classList.remove('hidden'), 50);
            
            resultTierTitle.innerText = `${level.toUpperCase()} DESTRUCTION`;
            const roastsArr = roastDB[level];
            
            roastOutput.className = '';
            if (level === 'nuclear' || level === 'god') {
                roastOutput.classList.add('glitch-active');
                setTimeout(() => roastOutput.classList.remove('glitch-active'), 2000);
            }
            if (level === 'god') {
                document.body.classList.add('shake-active');
                setTimeout(() => document.body.classList.remove('shake-active'), 500);
            }
            
            addShame(target, level);
            
            // Generate multiple unique lines
            let selectedRoasts = [];
            let available = [...roastsArr];
            for (let i = 0; i < numLines; i++) {
                if (available.length === 0) break;
                const idx = Math.floor(Math.random() * available.length);
                selectedRoasts.push(available[idx].replace(/{name}/g, target));
                available.splice(idx, 1);
            }
            
            const randomRoast = selectedRoasts.join('<br><br>');
            typeWriter(randomRoast, tSpeed);
        }, 400);
    }

    function typeWriter(text, speed) {
        roastOutput.innerHTML = '';
        
        if (speed === 0) {
            roastOutput.innerHTML = text;
            cursor.style.display = 'none';
            return;
        }

        cursor.style.display = 'inline-block';
        let i = 0;
        let isTag = false;
        
        function type() {
            if (i < text.length) {
                // handle HTML tags natively like <br><br>
                const char = text.charAt(i);
                if (char === '<') isTag = true;
                
                roastOutput.innerHTML += char;
                i++;
                
                if (char === '>') isTag = false;
                
                if (isTag) {
                    type(); // instantly type through tags
                } else {
                    setTimeout(type, speed + (Math.random() * (speed / 2)));
                }
            } else {
                cursor.style.display = 'none';
            }
        }
        type();
    }

    // Init
    checkSession();
    
    // Canvas Matrix Background
    const canvas = document.getElementById('bgCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 16;
        let columns = canvas.width / fontSize;
        let drops = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(8, 8, 12, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff2a5f';
            ctx.font = fontSize + 'px JetBrains Mono';
            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(drawMatrix, 50);

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = canvas.width / fontSize;
            drops = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;
        });
    }
});
