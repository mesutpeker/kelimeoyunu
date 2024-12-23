let selectedCategory = 'english';
let currentGame = null;

// Sesleri önceden yükle
const sounds = {
    background: new Audio('assets/sounds/background.mp3'),
    correct: new Audio('assets/sounds/correct.mp3'),
    wrong: new Audio('assets/sounds/wrong.mp3'),
    pop: new Audio('assets/sounds/pop.mp3')
};

// Ses ayarları
sounds.background.loop = true;
sounds.background.volume = 0.3;
sounds.correct.volume = 0.5;
sounds.wrong.volume = 0.5;
sounds.pop.volume = 0.4;

function selectCategory(category) {
    selectedCategory = category;
    sounds.pop.play().catch(err => console.log('Ses hatası:', err));
    document.querySelector('.category-buttons').style.display = 'none';
    document.querySelector('.level-buttons').style.display = 'flex';
}

function startGame(difficulty) {
    if(currentGame) {
        currentGame.stop();
    }
    sounds.pop.play().catch(err => console.log('Ses hatası:', err));
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
        this.isSoundOn = true;

        // Balon renkleri
        this.colors = [
            '#FF61D8', '#4ECDC4', '#FFD93D', 
            '#6C63FF', '#FF9A9E', '#FF0099',
            '#FF3366', '#FF6B6B'
        ];

        // Zorluk seviyeleri
        this.settings = {
            easy: {
                balloonSpeed: 14000,
                balloonInterval: 2500,
                points: 5,
                balloonSize: '90px'
            },
            medium: {
                balloonSpeed: 12000,
                balloonInterval: 2200,
                points: 8,
                balloonSize: '85px'
            },
            hard: {
                balloonSpeed: 10000,
                balloonInterval: 2000,
                points: 10,
                balloonSize: '80px'
            }
        };

        // UI elementleri
        this.scoreElement = document.getElementById('score-value');
        this.highScoreElement = document.getElementById('high-score-value');
        this.turkishWordElement = document.getElementById('turkish-word');
        this.startScreen = document.getElementById('start-screen');
    }

    createBalloon(word) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.textContent = word;
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        balloon.style.background = color;
        balloon.style.width = this.settings[this.difficulty].balloonSize;
        balloon.style.height = this.settings[this.difficulty].balloonSize;

        let left = Math.random() * (window.innerWidth - 100);
        balloon.style.left = `${left}px`;
        balloon.style.top = '-100px';
        
        return balloon;
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
                        if (this.isSoundOn) {
                            sounds.correct.play();
                            sounds.pop.play();
                        }
                        this.startNewRound();
                    } else {
                        this.showMessage('Tekrar dene! 🤔', false);
                        if (this.isSoundOn) {
                            sounds.wrong.play();
                            sounds.pop.play();
                        }
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

    showMessage(text, isSuccess) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px 40px;
            border-radius: 15px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            background: ${isSuccess ? '#4DD964' : '#FF3B30'};
            z-index: 1000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 1000);
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

    initialize(difficulty, category) {
        this.difficulty = difficulty;
        this.category = category;
        this.score = 0;
        this.updateScore();
        
        const highScore = localStorage.getItem(`highScore_${this.category}_${this.difficulty}`) || 0;
        this.highScoreElement.textContent = highScore;
        
        this.startScreen.style.display = 'none';
        this.container.style.display = 'block';
        
        if (this.isSoundOn) {
            sounds.background.play();
        }

        this.gameActive = true;
        this.startNewRound();
    }

    stop() {
        this.gameActive = false;
        this.clearBalloons();
        sounds.background.pause();
    }
}
