class BalloonGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.score = 0;
        this.difficulty = 'easy';
        this.gameActive = false;
        this.currentWord = null;
        this.colors = [
            'linear-gradient(135deg, #FF6B6B, #F06292)',
            'linear-gradient(135deg, #4ECDC4, #26A69A)',
            'linear-gradient(135deg, #45B7D1, #29B6F6)',
            'linear-gradient(135deg, #96CEB4, #66BB6A)',
            'linear-gradient(135deg, #9B59B6, #7E57C2)',
            'linear-gradient(135deg, #3498DB, #2196F3)'
        ];
        
        // Zorluk seviyesine göre oyun ayarları
        this.settings = {
            easy: {
                balloonSpeed: 12000,
                balloonInterval: 2200,
                points: 5,
                balloonSize: '80px'
            },
            medium: {
                balloonSpeed: 10000,
                balloonInterval: 2000,
                points: 8,
                balloonSize: '75px'
            },
            hard: {
                balloonSpeed: 8000,
                balloonInterval: 1800,
                points: 10,
                balloonSize: '70px'
            }
        };

        // UI elementleri
        this.scoreElement = document.getElementById('score-value');
        this.highScoreElement = document.getElementById('high-score-value');
        this.turkishWordElement = document.getElementById('turkish-word');
        this.startScreen = document.getElementById('start-screen');

        // Olay dinleyicileri
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    handleResize() {
        if (this.gameActive) {
            this.clearBalloons();
            this.startNewRound();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.gameActive = false;
            this.clearBalloons();
        } else if (!document.hidden && this.container.style.display === 'block') {
            this.gameActive = true;
            this.startNewRound();
        }
    }

    createBalloon(word) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.textContent = word;
        balloon.style.background = this.colors[Math.floor(Math.random() * this.colors.length)];
        balloon.style.width = this.settings[this.difficulty].balloonSize;
        balloon.style.height = this.settings[this.difficulty].balloonSize;
        
        const minDistance = parseInt(this.settings[this.difficulty].balloonSize) + 20;
        let left;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            left = Math.random() * (window.innerWidth - parseInt(this.settings[this.difficulty].balloonSize));
            attempts++;
        } while (attempts < maxAttempts && !this.isValidPosition(left, minDistance));
        
        balloon.style.left = left + 'px';
        balloon.style.top = '-100px';
        
        return balloon;
    }

    isValidPosition(left, minDistance) {
        const balloons = document.getElementsByClassName('balloon');
        for (let balloon of balloons) {
            const existingLeft = parseInt(balloon.style.left);
            if (Math.abs(existingLeft - left) < minDistance) {
                return false;
            }
        }
        return true;
    }

    showMessage(text, isSuccess) {
        const message = document.createElement('div');
        message.className = `message ${isSuccess ? 'success' : 'error'}`;
        message.textContent = text;
        message.style.color = 'white';
        message.style.background = isSuccess ? 
            'rgba(34, 197, 94, 0.9)' : 
            'rgba(239, 68, 68, 0.9)';
        
        document.body.appendChild(message);
        
        requestAnimationFrame(() => {
            message.style.opacity = '1';
            
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => message.remove(), 300);
            }, 1000);
        });
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        
        const highScore = localStorage.getItem(`highScore_${this.difficulty}`) || 0;
        if (this.score > highScore) {
            localStorage.setItem(`highScore_${this.difficulty}`, this.score);
            this.highScoreElement.textContent = this.score;
        }
    }

    clearBalloons() {
        const balloons = document.getElementsByClassName('balloon');
        while (balloons.length > 0) {
            balloons[0].remove();
        }
    }

    startNewRound() {
        if (!this.gameActive) return;

        const currentWords = WORDS[this.difficulty];
        const previousWord = this.currentWord;
        
        do {
            this.currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
        } while (this.currentWord === previousWord);

        this.turkishWordElement.textContent = this.currentWord.tr;
        this.clearBalloons();

        const wrongWords = currentWords
            .filter(w => w !== this.currentWord)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        
        const allWords = [this.currentWord, ...wrongWords]
            .sort(() => Math.random() - 0.5);

        const currentSettings = this.settings[this.difficulty];

        allWords.forEach((word, index) => {
            setTimeout(() => {
                if (!this.gameActive) return;
                
                const balloon = this.createBalloon(word.en);
                this.container.appendChild(balloon);

                balloon.addEventListener('click', () => {
                    if (word === this.currentWord) {
                        this.score += currentSettings.points;
                        this.updateScore();
                        this.showMessage('Tebrikler! 🎉', true);
                        this.startNewRound();
                    } else {
                        this.showMessage('Tekrar dene! 🤔', false);
                    }
                    balloon.remove();
                });

                const animation = balloon.animate([
                    { top: '-100px' },
                    { top: 'calc(100vh + 100px)' }
                ], {
                    duration: currentSettings.balloonSpeed,
                    easing: 'linear'
                });

                animation.onfinish = () => {
                    if (balloon.parentNode) {
                        balloon.remove();
                    }
                };
            }, index * currentSettings.balloonInterval);
        });
    }

    initialize(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.updateScore();
        
        // Yüksek skoru göster
        const highScore = localStorage.getItem(`highScore_${this.difficulty}`) || 0;
        this.highScoreElement.textContent = highScore;
        
        // Başlangıç ekranını gizle
        this.startScreen.style.display = 'none';
        
        // Oyun container'ını göster
        this.container.style.display = 'block';
        
        // Oyunu başlat
        this.gameActive = true;
        this.startNewRound();
    }
}

// Global oyun başlatma fonksiyonu
function startGame(difficulty) {
    const game = new BalloonGame();
    game.initialize(difficulty);
}
