// Global değişkenler
let currentGame = null;
let selectedCategory = 'english';

// Kategori seçme fonksiyonu
function selectCategory(category) {
    selectedCategory = category;
    const categoryButtons = document.querySelector('.category-buttons');
    const levelButtons = document.querySelector('.level-buttons');
    
    // Aktif kategori butonunu vurgula
    document.querySelectorAll('.category-button').forEach(button => {
        if (button.textContent.toLowerCase().includes(category)) {
            button.style.background = '#FF2D55';
            button.style.color = 'white';
        } else {
            button.style.background = 'white';
            button.style.color = '#333';
        }
    });

    // Seviye butonlarını göster
    categoryButtons.style.display = 'none';
    levelButtons.style.display = 'flex';
}

// Oyunu başlatma fonksiyonu
function startGame(difficulty) {
    if (currentGame) {
        currentGame = null;
    }
    currentGame = new BalloonGame();
    currentGame.initialize(difficulty, selectedCategory);
}

class BalloonGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.score = 0;
        this.difficulty = 'easy';
        this.category = 'english';
        this.gameActive = false;
        this.currentWord = null;
        
        // Balon renk paletleri
        this.colorPalettes = {
            english: [
                'linear-gradient(45deg, #FF61D8, #FE9090)',
                'linear-gradient(45deg, #31D0AA, #4CAFED)',
                'linear-gradient(45deg, #FF9500, #FFBD30)',
                'linear-gradient(45deg, #4DD964, #62E8A0)',
                'linear-gradient(45deg, #5856D6, #AF52DE)'
            ],
            turkish: [
                'linear-gradient(45deg, #5856D6, #AF52DE)',
                'linear-gradient(45deg, #FF2D55, #FF3B30)',
                'linear-gradient(45deg, #007AFF, #5856D6)',
                'linear-gradient(45deg, #FF9500, #FF2D55)',
                'linear-gradient(45deg, #4CD964, #5AC8FA)'
            ]
        };
        
        // Zorluk seviyesi ayarları
        this.settings = {
            easy: {
                balloonSpeed: 12000,
                balloonInterval: 2200,
                points: 5,
                balloonSize: '90px'
            },
            medium: {
                balloonSpeed: 10000,
                balloonInterval: 2000,
                points: 8,
                balloonSize: '85px'
            },
            hard: {
                balloonSpeed: 8000,
                balloonInterval: 1800,
                points: 10,
                balloonSize: '80px'
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
        balloon.style.background = this.colorPalettes[this.category][Math.floor(Math.random() * this.colorPalettes[this.category].length)];
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
        message.className = 'message';
        message.textContent = text;
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.padding = '20px 40px';
        message.style.borderRadius = '15px';
        message.style.fontSize = '24px';
        message.style.fontWeight = 'bold';
        message.style.color = 'white';
        message.style.background = isSuccess ? 
            'linear-gradient(45deg, #4DD964, #62E8A0)' : 
            'linear-gradient(45deg, #FF3B30, #FF6482)';
        message.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        message.style.zIndex = '1000';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 1000);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        
        const highScore = localStorage.getItem(`highScore_${this.category}_${this.difficulty}`) || 0;
        if (this.score > highScore) {
            localStorage.setItem(`highScore_${this.category}_${this.difficulty}`, this.score);
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

        const currentWords = WORDS[this.category][this.difficulty];
        const previousWord = this.currentWord;
        
        do {
            this.currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
        } while (this.currentWord === previousWord);

        this.turkishWordElement.textContent = this.category === 'english' ? 
            this.currentWord.tr : 
            this.currentWord.en;

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
                
                const balloon = this.createBalloon(this.category === 'english' ? word.en : word.tr);
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
                        if (word === this.currentWord) {
                            this.startNewRound();
                        }
                    }
                };
            }, index * currentSettings.balloonInterval);
        });
    }

    initialize(difficulty, category) {
        this.difficulty = difficulty;
        this.category = category;
        this.score = 0;
        this.updateScore();
        
        const highScore = localStorage.getItem(`highScore_${this.category}_${this.difficulty}`) || 0;
        this.highScoreElement.textContent = highScore;
        
        this.startScreen.style.display = 'none';
        this.container.style.display = 'block';
        
        this.gameActive = true;
        this.startNewRound();
    }
}