document.addEventListener('DOMContentLoaded', () => {
    // 添加支付对话框相关变量
    let isPaid = false;
    let isFreeTrialMode = false;
    
    // 创建支付对话框
    const paymentModal = document.createElement('div');
    paymentModal.className = 'payment-modal';
    paymentModal.innerHTML = `
        <div class="payment-content">
            <h2>请支付游戏费用</h2>
            <p>享受无限乐趣，仅需支付 ¥19.99</p>
            <div class="payment-options">
                <button id="wechat-pay">微信支付</button>
                <button id="alipay-pay">支付宝</button>
            </div>
            <button id="free-trial">免费试玩 (30秒)</button>
        </div>
    `;
    document.body.appendChild(paymentModal);
    
    // 支付按钮事件
    document.getElementById('wechat-pay').addEventListener('click', () => {
        showQRCode('wechat');
    });
    
    document.getElementById('alipay-pay').addEventListener('click', () => {
        showQRCode('alipay');
    });
    
    document.getElementById('free-trial').addEventListener('click', () => {
        isPaid = true;
        isFreeTrialMode = true;
        paymentModal.style.display = 'none';
        // 开始游戏但限制时间为30秒
        gameTimeInSeconds = 30;
        startGame();
    });
    
    function showQRCode(type) {
        const qrModal = document.createElement('div');
        qrModal.className = 'qr-modal';
        qrModal.innerHTML = `
            <div class="qr-content">
                <h3>${type === 'wechat' ? '微信支付' : '支付宝支付'}</h3>
                <div class="qr-code">
                    <div class="fake-qr"></div>
                </div>
                <p>请使用${type === 'wechat' ? '微信' : '支付宝'}扫描二维码完成支付</p>
                <button id="payment-complete">我已完成支付</button>
                <button id="cancel-payment">取消</button>
            </div>
        `;
        document.body.appendChild(qrModal);
        
        document.getElementById('payment-complete').addEventListener('click', () => {
            isPaid = true;
            isFreeTrialMode = false;
            qrModal.remove();
            paymentModal.style.display = 'none';
            gameTimeInSeconds = 120; // 付费用户获得完整的2分钟
            startGame();
        });
        
        document.getElementById('cancel-payment').addEventListener('click', () => {
            qrModal.remove();
        });
    }
    
    // 修改startGame函数，添加支付检查
    const originalStartGame = startGame;
    startGame = function() {
        if (!isPaid) {
            paymentModal.style.display = 'flex';
            return;
        }
        
        // 重置游戏时间
        if (isFreeTrialMode) {
            gameTimeInSeconds = 30;
            timeLeft = 30;
        } else {
            gameTimeInSeconds = 120;
            timeLeft = 120;
        }
        
        originalStartGame();
        
        // 如果是免费试玩模式，添加一个强制结束的计时器
        if (isFreeTrialMode) {
            setTimeout(() => {
                if (gameActive) {
                    endGame(false);
                    
                    // 显示支付提示
                    const trialEndModal = document.createElement('div');
                    trialEndModal.className = 'payment-modal';
                    trialEndModal.innerHTML = `
                        <div class="payment-content">
                            <h2>试玩时间结束</h2>
                            <p>您的免费试玩时间已结束。请支付 ¥19.99 继续游戏！</p>
                            <div class="payment-options">
                                <button id="wechat-pay-after-trial">微信支付</button>
                                <button id="alipay-pay-after-trial">支付宝</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(trialEndModal);
                    
                    document.getElementById('wechat-pay-after-trial').addEventListener('click', () => {
                        trialEndModal.remove();
                        showQRCode('wechat');
                    });
                    
                    document.getElementById('alipay-pay-after-trial').addEventListener('click', () => {
                        trialEndModal.remove();
                        showQRCode('alipay');
                    });
                }
            }, 30000); // 严格30秒后结束
        }
    };
    
    // 修改endGame函数，添加试玩结束逻辑
    const originalEndGame = endGame;
    endGame = function(victory) {
        originalEndGame(victory);
        
        // 如果是免费试玩模式且游戏结束，显示支付提示
        if (isFreeTrialMode) {
            setTimeout(() => {
                const trialEndModal = document.createElement('div');
                trialEndModal.className = 'payment-modal';
                trialEndModal.innerHTML = `
                    <div class="payment-content">
                        <h2>试玩已结束</h2>
                        <p>想要继续享受游戏乐趣？请支付 ¥19.99 解锁完整版！</p>
                        <div class="payment-options">
                            <button id="wechat-pay-after-game">微信支付</button>
                            <button id="alipay-pay-after-game">支付宝</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(trialEndModal);
                
                document.getElementById('wechat-pay-after-game').addEventListener('click', () => {
                    trialEndModal.remove();
                    showQRCode('wechat');
                });
                
                document.getElementById('alipay-pay-after-game').addEventListener('click', () => {
                    trialEndModal.remove();
                    showQRCode('alipay');
                });
            }, 2000); // 游戏结束2秒后显示
        }
    };
    
    // Game elements
    const gameArea = document.querySelector('.game-area');
    const player = document.getElementById('player');
    const cutButton = document.getElementById('cut-button');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverScreen = document.getElementById('game-over');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const sausageCountElement = document.getElementById('sausage-count');
    const remainingSausagesElement = document.getElementById('remaining-sausages');
    const timeLeftElement = document.getElementById('time-left');

    // Game variables
    let score = 0;
    let gameActive = false;
    let sausagePeople = [];
    let playerX = 0;
    let playerY = 0;
    let playerSpeed = 8;
    let keys = {};
    let closestSausagePerson = null;
    let totalSausagePeople = 500;
    let remainingSausagePeople = totalSausagePeople;
    let lastMoveX = 0;
    let lastMoveY = 0;
    let sausageMovementInterval;
    let panicMode = false;
    let gameTimeInSeconds = 120; // 2 minutes
    let timeLeft = gameTimeInSeconds;
    let timerInterval;
    let canCut = true;
    let spaceHeld = false;
    let cutInterval;
    let powerUps = [];
    let powerUpTypes = [
        {type: 'speed', duration: 5000, color: '#00ff00', text: '2X SPEED'},
        {type: 'range', duration: 5000, color: '#ff00ff', text: 'LONG REACH'},
        {type: 'multiCut', duration: 5000, color: '#ffff00', text: 'MULTI CUT'}
    ];
    let comboCount = 0;
    let comboTimer = null;
    let maxCombo = 0;
    const sausageTypes = [
        {type: 'normal', speed: 1, points: 10, color: '#ff6b6b'},
        {type: 'fast', speed: 2, points: 20, color: '#ff4757'},
        {type: 'tank', speed: 0.5, points: 30, color: '#ff7f50'}
    ];

    const achievements = [
        {id: 'speed_demon', name: 'Speed Demon', condition: 'Kill 5 sausages in 2 seconds'},
        {id: 'massacre', name: 'Massacre', condition: 'Get a 20x combo'},
        {id: 'apocalypse', name: 'Apocalypse Master', condition: 'Win with 30 seconds remaining'}
    ];

    const sounds = {
        cut: new Audio('cut.mp3'),
        powerup: new Audio('powerup.mp3'),
        scream: new Audio('scream.mp3'),
        combo: new Audio('combo.mp3')
    };

    const stats = {
        gamesPlayed: 0,
        totalKills: 0,
        bestTime: Infinity,
        highestCombo: 0,
        fastestKill: Infinity
    };

    const specialAbilities = {
        dash: {
            cooldown: 5000,
            duration: 500,
            speed: 20
        },
        timeFreeze: {
            cooldown: 15000,
            duration: 3000
        }
    };

    // Game area dimensions
    const gameAreaRect = gameArea.getBoundingClientRect();
    const gameAreaWidth = gameAreaRect.width;
    const gameAreaHeight = gameAreaRect.height;
    
    // Safe zone margins to keep sausages visible
    const safeMargin = 20;

    // Initialize player position
    playerX = gameAreaWidth / 2 - player.offsetWidth / 2;
    playerY = gameAreaHeight / 2 - player.offsetHeight / 2;
    updatePlayerPosition();

    // Start game function
    function startGame() {
        // Reset all game variables
        gameActive = true;
        score = 0;
        remainingSausagePeople = totalSausagePeople;
        panicMode = false;
        timeLeft = gameTimeInSeconds;
        
        // Update UI
        scoreElement.textContent = score;
        sausageCountElement.textContent = remainingSausagePeople;
        updateTimeDisplay();
        
        // Remove any existing classes
        document.body.classList.remove('panic-mode');
        const gameAreaElement = document.querySelector('.game-area');
        gameAreaElement.classList.remove('extreme-panic');
        
        // Clear existing sausage people
        clearSausagePeople();
        
        // Generate new sausage people
        generateSausagePeople();
        
        // Hide game over screen
        gameOverScreen.classList.add('hidden');
        
        // Enable reset button
        resetBtn.disabled = false;
        startBtn.disabled = true;
        
        // Start sausage movement
        startSausageMovement();
        
        // Start timer
        startTimer();
        
        // Start game loop
        requestAnimationFrame(gameLoop);
        
        spawnPowerUp(); // Start power-up spawning
    }

    // Start timer function
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(() => {
            if (gameActive) {
                timeLeft--;
                updateTimeDisplay();
                
                if (timeLeft <= 0) {
                    // Time's up!
                    endGame(false);
                }
            }
        }, 1000);
    }
    
    // Update time display
    function updateTimeDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeLeftElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Generate sausage people
    function generateSausagePeople() {
        for (let i = 0; i < totalSausagePeople; i++) {
            createSausagePerson();
        }
    }

    // Create a single sausage person
    function createSausagePerson() {
        const type = sausageTypes[Math.floor(Math.random() * sausageTypes.length)];
        const sausageMan = document.createElement('div');
        sausageMan.className = 'sausage-man';
        
        const head = document.createElement('div');
        head.className = 'head';
        
        const body = document.createElement('div');
        body.className = 'body';
        
        const legs = document.createElement('div');
        legs.className = 'legs';
        
        const leftLeg = document.createElement('div');
        leftLeg.className = 'leg left-leg';
        leftLeg.dataset.leg = 'left';
        
        const rightLeg = document.createElement('div');
        rightLeg.className = 'leg right-leg';
        rightLeg.dataset.leg = 'right';
        
        legs.appendChild(leftLeg);
        legs.appendChild(rightLeg);
        
        sausageMan.appendChild(head);
        sausageMan.appendChild(body);
        sausageMan.appendChild(legs);
        
        // Position randomly in game area, but keep within safe margins
        const maxX = gameAreaWidth - sausageMan.offsetWidth - safeMargin;
        const maxY = gameAreaHeight - sausageMan.offsetHeight - safeMargin;
        
        // Ensure they're not too close to the player at start and stay within safe margins
        let sausageX, sausageY;
        do {
            sausageX = Math.random() * (maxX - safeMargin) + safeMargin;
            sausageY = Math.random() * (maxY - safeMargin) + safeMargin;
        } while (
            Math.abs(sausageX - playerX) < 100 && 
            Math.abs(sausageY - playerY) < 100
        );
        
        sausageMan.style.left = `${sausageX}px`;
        sausageMan.style.top = `${sausageY}px`;
        
        // Add to game area
        gameArea.appendChild(sausageMan);
        
        // All sausages are walking from the start
        const speedX = (Math.random() - 0.5) * 2;
        const speedY = (Math.random() - 0.5) * 2;
        
        // Add to sausage people array with random speed and direction
        sausagePeople.push({
            element: sausageMan,
            x: sausageX,
            y: sausageY,
            isDead: false,
            speedX: speedX,
            speedY: speedY,
            runningAway: false,
            legAnimationFrame: 0,
            isWalking: true,  // All sausages are walking from the start
            type: type
        });
    }

    // Clear all sausage people
    function clearSausagePeople() {
        sausagePeople.forEach(sausage => {
            if (sausage.element.parentNode) {
                sausage.element.parentNode.removeChild(sausage.element);
            }
        });
        sausagePeople = [];
    }

    // Start sausage movement
    function startSausageMovement() {
        if (sausageMovementInterval) {
            clearInterval(sausageMovementInterval);
        }
        
        sausageMovementInterval = setInterval(() => {
            if (gameActive) {
                moveSausagePeople();
            }
        }, 50);
    }

    // Move all sausage people
    function moveSausagePeople() {
        // Use safe margins to keep sausages visible
        const maxX = gameAreaWidth - 40 - safeMargin; // sausage width
        const maxY = gameAreaHeight - 100 - safeMargin; // sausage height
        const minX = safeMargin;
        const minY = safeMargin;
        
        sausagePeople.forEach(sausage => {
            if (!sausage.isDead) {
                // Check if player is close and sausage should run away
                const dx = (playerX + player.offsetWidth / 2) - (sausage.x + sausage.element.offsetWidth / 2);
                const dy = (playerY + player.offsetHeight / 2) - (sausage.y + sausage.element.offsetHeight / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If player is close, run away!
                if (distance < 150) {
                    sausage.runningAway = true;
                    
                    // Run away from player - as fast as player in panic mode!
                    const angle = Math.atan2(dy, dx);
                    const runSpeed = panicMode ? playerSpeed : 2.5; // Same speed as player in panic mode
                    sausage.speedX = -Math.cos(angle) * runSpeed;
                    sausage.speedY = -Math.sin(angle) * runSpeed;
                    
                    // Add panic class for running animation
                    sausage.element.classList.add('panic');
                } else {
                    // If not running away, move randomly
                    if (!sausage.runningAway) {
                        // Occasionally change direction
                        if (Math.random() < 0.02) {
                            sausage.speedX = (Math.random() - 0.5) * 2;
                            sausage.speedY = (Math.random() - 0.5) * 2;
                        }
                    } else {
                        // Gradually slow down if no longer being chased
                        sausage.speedX *= 0.95;
                        sausage.speedY *= 0.95;
                        
                        // Stop running if speed is very low
                        if (Math.abs(sausage.speedX) < 0.1 && Math.abs(sausage.speedY) < 0.1) {
                            sausage.runningAway = false;
                            sausage.element.classList.remove('panic');
                        }
                    }
                }
                
                // Update position
                sausage.x += sausage.speedX;
                sausage.y += sausage.speedY;
                
                // Keep within bounds with safe margins
                if (sausage.x < minX) {
                    sausage.x = minX;
                    sausage.speedX *= -1;
                }
                if (sausage.x > maxX) {
                    sausage.x = maxX;
                    sausage.speedX *= -1;
                }
                if (sausage.y < minY) {
                    sausage.y = minY;
                    sausage.speedY *= -1;
                }
                if (sausage.y > maxY) {
                    sausage.y = maxY;
                    sausage.speedY *= -1;
                }
                
                // Update position in DOM
                sausage.element.style.left = `${sausage.x}px`;
                sausage.element.style.top = `${sausage.y}px`;
                
                // Flip sausage based on movement direction
                if (sausage.speedX > 0.1) {
                    sausage.element.style.transform = 'scaleX(-1)';
                } else if (sausage.speedX < -0.1) {
                    sausage.element.style.transform = 'scaleX(1)';
                }
                
                // Animate legs for walking/running
                sausage.legAnimationFrame = (sausage.legAnimationFrame + 1) % 6;
                const leftLeg = sausage.element.querySelector('.left-leg');
                const rightLeg = sausage.element.querySelector('.right-leg');
                
                if (sausage.legAnimationFrame < 3) {
                    const intensity = sausage.runningAway ? 20 : 10;
                    leftLeg.style.transform = `rotate(${intensity}deg)`;
                    rightLeg.style.transform = `rotate(-${intensity}deg)`;
                } else {
                    const intensity = sausage.runningAway ? 20 : 10;
                    leftLeg.style.transform = `rotate(-${intensity}deg)`;
                    rightLeg.style.transform = `rotate(${intensity}deg)`;
                }
            }
        });
        
        // Make panic mode start when there are 400 sausages left (100 killed)
        if (!panicMode && remainingSausagePeople <= 400) {
            panicMode = true;
            document.body.classList.add('panic-mode');
            
            // Add panic message
            const panicMessage = document.createElement('div');
            panicMessage.className = 'panic-message';
            panicMessage.textContent = 'APOCALYPSE MODE ACTIVATED!!!';
            document.body.appendChild(panicMessage);
            
            // Add more panic effects
            const gameArea = document.querySelector('.game-area');
            gameArea.classList.add('extreme-panic');
            
            setTimeout(() => {
                if (panicMessage.parentNode) {
                    panicMessage.remove();
                }
            }, 3000);
        }
    }

    // Update player position
    function updatePlayerPosition() {
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
        
        // Rotate knife hand based on movement direction
        const knifeHand = player.querySelector('.knife-hand');
        
        // If player is moving, rotate knife in that direction
        if (lastMoveX !== 0 || lastMoveY !== 0) {
            const angle = Math.atan2(lastMoveY, lastMoveX) * (180 / Math.PI);
            knifeHand.style.transform = `rotate(${angle}deg)`;
        }
    }

    // Move player based on key presses
    function movePlayer() {
        let moveX = 0;
        let moveY = 0;
        
        // WASD or Arrow keys
        if (keys['ArrowUp'] || keys['w'] || keys['W']) moveY -= playerSpeed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) moveY += playerSpeed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) moveX -= playerSpeed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) moveX += playerSpeed;
        
        // Update position
        playerX += moveX;
        playerY += moveY;
        
        // Keep player within game area
        if (playerX < 0) playerX = 0;
        if (playerX > gameAreaWidth - player.offsetWidth) playerX = gameAreaWidth - player.offsetWidth;
        if (playerY < 0) playerY = 0;
        if (playerY > gameAreaHeight - player.offsetHeight) playerY = gameAreaHeight - player.offsetHeight;
        
        // Store last movement direction if player is moving
        if (moveX !== 0 || moveY !== 0) {
            lastMoveX = moveX;
            lastMoveY = moveY;
        }
        
        updatePlayerPosition();
    }

    // Check for proximity to sausage people
    function checkProximity() {
        const cutRange = 70; // Distance within which player can cut legs
        let minDistance = cutRange + 1;
        closestSausagePerson = null;
        
        sausagePeople.forEach(sausage => {
            if (!sausage.isDead) {
                const dx = (playerX + player.offsetWidth / 2) - (sausage.x + sausage.element.offsetWidth / 2);
                const dy = (playerY + player.offsetHeight / 2) - (sausage.y + sausage.element.offsetHeight / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < cutRange && distance < minDistance) {
                    minDistance = distance;
                    closestSausagePerson = sausage;
                }
            }
        });
        
        if (closestSausagePerson) {
            cutButton.classList.remove('hidden');
            // Position the cut button above the closest sausage person
            cutButton.style.left = `${closestSausagePerson.x + closestSausagePerson.element.offsetWidth / 2 - cutButton.offsetWidth / 2}px`;
            cutButton.style.top = `${closestSausagePerson.y - cutButton.offsetHeight - 10}px`;
            
            // Auto-cut if space is held down
            if (spaceHeld && canCut) {
                cutLegs();
                canCut = false;
                setTimeout(() => {
                    canCut = true;
                }, 200); // Small cooldown to prevent too rapid cutting
            }
        } else {
            cutButton.classList.add('hidden');
        }
    }

    // Cut the legs of the closest sausage person
    function cutLegs() {
        sounds.cut.play();
        if (closestSausagePerson && !closestSausagePerson.isDead) {
            comboCount++;
            score += 10 * (1 + Math.floor(comboCount / 5)); // More points for higher combos
            updateComboDisplay();
            
            if (comboTimer) clearTimeout(comboTimer);
            comboTimer = setTimeout(() => {
                comboCount = 0;
                updateComboDisplay();
            }, 2000);
            
            // Animate the knife cutting
            const knifeHand = player.querySelector('.knife-hand');
            knifeHand.classList.add('cutting');
            
            // Remove the cutting class after animation completes
            setTimeout(() => {
                knifeHand.classList.remove('cutting');
            }, 300);
            
            const leftLeg = closestSausagePerson.element.querySelector('.left-leg');
            const rightLeg = closestSausagePerson.element.querySelector('.right-leg');
            
            // Get positions for the detached legs
            const leftLegRect = leftLeg.getBoundingClientRect();
            const rightLegRect = rightLeg.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            
            // Create blood splatter effects
            createBloodSplatter(leftLegRect.left - gameAreaRect.left, leftLegRect.top - gameAreaRect.top);
            createBloodSplatter(rightLegRect.left - gameAreaRect.left, rightLegRect.top - gameAreaRect.top);
            
            // Create detached left leg
            const detachedLeftLeg = document.createElement('div');
            detachedLeftLeg.className = 'detached-leg';
            detachedLeftLeg.style.left = `${leftLegRect.left - gameAreaRect.left}px`;
            detachedLeftLeg.style.top = `${leftLegRect.top - gameAreaRect.top + 10}px`;
            gameArea.appendChild(detachedLeftLeg);
            
            // Create detached right leg
            const detachedRightLeg = document.createElement('div');
            detachedRightLeg.className = 'detached-leg';
            detachedRightLeg.style.left = `${rightLegRect.left - gameAreaRect.left}px`;
            detachedRightLeg.style.top = `${rightLegRect.top - gameAreaRect.top + 10}px`;
            gameArea.appendChild(detachedRightLeg);
            
            // Add cut class to original legs
            leftLeg.classList.add('cut');
            rightLeg.classList.add('cut');
            
            // Mark sausage person as dead and stop movement
            closestSausagePerson.element.classList.add('dead');
            closestSausagePerson.isDead = true;
            closestSausagePerson.speedX = 0;
            closestSausagePerson.speedY = 0;
            closestSausagePerson.isWalking = false;
            closestSausagePerson.runningAway = false;
            
            // Add scream effect
            createScream(closestSausagePerson.x, closestSausagePerson.y);
            
            // Update score and count
            scoreElement.textContent = score;
            
            remainingSausagePeople--;
            sausageCountElement.textContent = remainingSausagePeople;
            
            cutButton.classList.add('hidden');
            
            // Remove detached legs after animation completes
            setTimeout(() => {
                if (detachedLeftLeg.parentNode) {
                    detachedLeftLeg.parentNode.removeChild(detachedLeftLeg);
                }
                if (detachedRightLeg.parentNode) {
                    detachedRightLeg.parentNode.removeChild(detachedRightLeg);
                }
            }, 1000);
            
            // Check if all sausage people are dead
            if (remainingSausagePeople <= 0) {
                endGame(true);
            }
        }
    }

    // Create blood splatter effect
    function createBloodSplatter(x, y) {
        const splatter = document.createElement('div');
        splatter.className = 'blood-splatter';
        splatter.style.left = `${x}px`;
        splatter.style.top = `${y}px`;
        gameArea.appendChild(splatter);
        
        // Remove splatter after animation completes
        setTimeout(() => {
            if (splatter.parentNode) {
                splatter.parentNode.removeChild(splatter);
            }
        }, 500);
    }
    
    // Create scream effect
    function createScream(x, y) {
        const scream = document.createElement('div');
        scream.className = 'scream';
        
        // Array of possible screams
        const screams = [
            'AAAH!', 
            'HELP!', 
            'MY LEGS!', 
            'WHY?!', 
            'NOOO!', 
            'OUCH!', 
            'MOMMY!',
            'OH GOD!',
            'SAVE ME!',
            'RUN!',
            'NOT MY LEGS!',
            'I NEED THOSE!',
            'MEDIC!',
            'PLEASE NO!',
            'MERCY!'
        ];
        
        // Pick a random scream
        scream.textContent = screams[Math.floor(Math.random() * screams.length)];
        
        scream.style.left = `${x}px`;
        scream.style.top = `${y - 30}px`;
        gameArea.appendChild(scream);
        
        // Remove scream after animation completes
        setTimeout(() => {
            if (scream.parentNode) {
                scream.parentNode.removeChild(scream);
            }
        }, 1000);
    }

    // Game loop
    function gameLoop() {
        if (gameActive) {
            movePlayer();
            checkProximity();
            requestAnimationFrame(gameLoop);
        }
    }

    // End game function
    function endGame(victory) {
        gameActive = false;
        finalScoreElement.textContent = score;
        remainingSausagesElement.textContent = remainingSausagePeople;
        
        // Show victory or defeat message
        const gameOverTitle = document.querySelector('#game-over h2');
        if (victory) {
            gameOverTitle.textContent = "VICTORY!";
            gameOverTitle.style.color = "#4caf50";
        } else {
            gameOverTitle.textContent = "TIME'S UP!";
            gameOverTitle.style.color = "#ff0000";
        }
        
        gameOverScreen.classList.remove('hidden');
        
        resetBtn.disabled = true;
        startBtn.disabled = false;
        
        // Clear all intervals
        if (sausageMovementInterval) {
            clearInterval(sausageMovementInterval);
            sausageMovementInterval = null;
        }
        
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        if (cutInterval) {
            clearInterval(cutInterval);
            cutInterval = null;
        }
        
        // Remove panic mode
        document.body.classList.remove('panic-mode');
        const gameAreaElement = document.querySelector('.game-area');
        if (gameAreaElement.classList.contains('extreme-panic')) {
            gameAreaElement.classList.remove('extreme-panic');
        }
        
        // Remove any panic messages that might still be on screen
        const panicMessages = document.querySelectorAll('.panic-message');
        panicMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
    }

    // Reset game function - now properly resets everything
    function resetGame() {
        endGame(false);
        startBtn.disabled = false;
    }

    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Space bar to cut legs
        if (e.key === ' ' && gameActive) {
            spaceHeld = true;
            if (closestSausagePerson && canCut) {
                cutLegs();
                canCut = false;
                setTimeout(() => {
                    canCut = true;
                }, 200);
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        
        if (e.key === ' ') {
            spaceHeld = false;
        }
    });
    
    cutButton.addEventListener('click', () => {
        if (gameActive && canCut) {
            cutLegs();
            canCut = false;
            setTimeout(() => {
                canCut = true;
            }, 200);
        }
    });
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', startGame);

    // New power-up functions
    function spawnPowerUp() {
        if (gameActive) {
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            const powerUp = createPowerUp(type);
            powerUps.push(powerUp);
            setTimeout(spawnPowerUp, Math.random() * 10000 + 5000); // Spawn every 5-15 seconds
        }
    }

    // Add to updateComboDisplay function
    function updateComboDisplay() {
        // Implementation of updateComboDisplay function
    }

    function checkAchievements() {
        // Check various conditions and award achievements
    }

    const difficultyLevels = {
        easy: {sausageCount: 300, timeLimit: 180, panicAt: 200},
        normal: {sausageCount: 500, timeLimit: 120, panicAt: 400},
        hard: {sausageCount: 700, timeLimit: 90, panicAt: 500}
    };

    // Add ability activation on specific key presses

    function saveScore(score) {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        scores.push({
            score,
            date: new Date().toISOString(),
            name: prompt('Enter your name:')
        });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('scores', JSON.stringify(scores.slice(0, 10)));
    }
}); 