class QuizApp {
    constructor() {
        this.quizDataFile = 'quizData.json';
        this.quizCount = 10;
        this.quizData = [];
        this.shuffledQuiz = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizInProgress = false;

        this.cacheDOM();
        this.bindEvents();
        this.loadQuizData();
    }

    cacheDOM() {
        this.dom = {
            quizContainer: document.getElementById('quiz-container'),
            resultContainer: document.getElementById('result-container'),
            progressElement: document.getElementById('progress'),
            questionTextElement: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            feedbackBox: document.getElementById('feedback-box'),
            answerResultElement: document.getElementById('answer-result'),
            answerRationaleElement: document.getElementById('answer-rationale'),
            nextButton: document.getElementById('next-button'),
            resultScoreText: document.getElementById('score-text'),
            restartButton: document.getElementById('restart-button'),
            hintButton: document.getElementById('hint-button'),
            hintTextElement: document.getElementById('hint-text')
        };
    }

    bindEvents() {
        this.dom.nextButton.addEventListener('click', () => this.handleNextButton());
        this.dom.restartButton.addEventListener('click', () => this.startQuiz());
        this.dom.hintButton.addEventListener('click', () => this.showHint());
    }

    async loadQuizData() {
        try {
            const response = await fetch(this.quizDataFile);
            this.quizData = await response.json();
            this.startQuiz();
        } catch (error) {
            console.error('Error loading quiz data:', error);
            this.dom.questionTextElement.textContent = 'エラー: クイズデータを読み込めませんでした。';
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;

        const fullData = [...this.quizData];
        this.shuffleArray(fullData);
        this.shuffledQuiz = fullData.slice(0, this.quizCount);

        this.dom.quizContainer.classList.remove('hidden');
        this.dom.resultContainer.classList.add('hidden');
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.shuffledQuiz.length) {
            this.showResult();
            return;
        }

        const currentQuestion = this.shuffledQuiz[this.currentQuestionIndex];

        // Reset UI
        this.dom.optionsContainer.innerHTML = '';
        this.dom.feedbackBox.classList.add('hidden');
        this.dom.hintTextElement.classList.add('hidden');
        this.dom.hintButton.disabled = false;
        
        this.quizInProgress = true;

        this.dom.progressElement.textContent = `問題 ${this.currentQuestionIndex + 1} / ${this.quizCount}`;
        this.dom.questionTextElement.textContent = currentQuestion.question;

        const shuffledOptions = this.shuffleArray([...currentQuestion.options]);
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.addEventListener('click', () => this.handleAnswer(button, option.isCorrect));
            this.dom.optionsContainer.appendChild(button);
        });
    }

    handleAnswer(selectedButton, isCorrect) {
        if (!this.quizInProgress) return;

        this.quizInProgress = false;

        const allButtons = this.dom.optionsContainer.querySelectorAll('button');
        const currentQuestion = this.shuffledQuiz[this.currentQuestionIndex];

        allButtons.forEach(button => {
            button.disabled = true;
            const optionData = currentQuestion.options.find(opt => opt.text === button.textContent && opt.isCorrect);
            
            if (optionData) {
                button.classList.add('correct');
            } else if (button === selectedButton) {
                button.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.score++;
            this.dom.answerResultElement.textContent = '⭕ 正解！';
            this.dom.answerResultElement.style.color = 'var(--accent-color)';
        } else {
            this.dom.answerResultElement.textContent = '❌ 不正解...';
            this.dom.answerResultElement.style.color = 'var(--error-color)';
        }

        this.dom.answerRationaleElement.textContent = `【解説】${currentQuestion.rationale}`;
        this.dom.feedbackBox.classList.remove('hidden');
        this.dom.hintButton.disabled = true;
    }

    handleNextButton() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    showHint() {
        const currentQuestion = this.shuffledQuiz[this.currentQuestionIndex];
        this.dom.hintTextElement.textContent = `ヒント: ${currentQuestion.hint}`;
        this.dom.hintTextElement.classList.remove('hidden');
        this.dom.hintButton.disabled = true;
    }

    showResult() {
        this.dom.quizContainer.classList.add('hidden');
        this.dom.resultContainer.classList.remove('hidden');
        this.dom.resultScoreText.textContent = `あなたのスコア: ${this.score} / ${this.shuffledQuiz.length}`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});