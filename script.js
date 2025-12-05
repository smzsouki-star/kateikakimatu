const QUIZ_DATA_FILE = 'quizData.json';
const QUIZ_COUNT = 10; // 出題する問題数を10問に固定

let quizData = [];
let shuffledQuiz = []; // 実際に使用するシャッフルされた問題リスト
let currentQuestionIndex = 0;
let score = 0;
let quizInProgress = false;

// DOM要素の取得 (変更なし)
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const progressElement = document.getElementById('progress');
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackBox = document.getElementById('feedback-box');
const answerResultElement = document.getElementById('answer-result');
const answerRationaleElement = document.getElementById('answer-rationale');
const nextButton = document.getElementById('next-button');
const resultScoreText = document.getElementById('score-text');
const restartButton = document.getElementById('restart-button');
const hintButton = document.getElementById('hint-button');
const hintTextElement = document.getElementById('hint-text');

// 配列をシャッフルする関数 (Fisher-Yatesアルゴリズム)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// JSONファイルを読み込む関数
async function loadQuizData() {
    try {
        const response = await fetch(QUIZ_DATA_FILE);
        quizData = await response.json();
        startQuiz();
    } catch (error) {
        console.error('クイズデータの読み込み中にエラーが発生しました:', error);
        questionTextElement.textContent = 'エラー: クイズデータを読み込めませんでした。';
    }
}

// クイズを開始する
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    quizInProgress = true;
    
    // ① 全問題からランダムに10問を選択してシャッフル
    const fullData = [...quizData]; // 元データをコピー
    shuffleArray(fullData); // 全問題をシャッフル
    shuffledQuiz = fullData.slice(0, QUIZ_COUNT); // 先頭から10問を抽出
    
    quizContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    showQuestion();
}

// 現在の問題を表示する
function showQuestion() {
    if (currentQuestionIndex >= shuffledQuiz.length) {
        showResult();
        return;
    }

    const currentQuestion = shuffledQuiz[currentQuestionIndex];
    
    // 画面の初期化
    optionsContainer.innerHTML = '';
    feedbackBox.classList.add('hidden');
    hintTextElement.classList.add('hidden');
    hintButton.disabled = false;
    
    // 進行状況の表示: QUIZ_COUNT（10）を総数として表示
    progressElement.textContent = `問題 ${currentQuestionIndex + 1} / ${QUIZ_COUNT}`;
    
    // 質問文の表示
    questionTextElement.textContent = currentQuestion.question;
    
    // 選択肢の生成
    // 選択肢の並びもランダムにシャッフル
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => handleAnswer(button, option.isCorrect));
        optionsContainer.appendChild(button);
    });
}

// 解答が選択された時の処理
function handleAnswer(selectedButton, isCorrect) {
    if (!quizInProgress) return;
    
    quizInProgress = false;
    const allButtons = optionsContainer.querySelectorAll('button');
    const currentQuestion = shuffledQuiz[currentQuestionIndex];

    // 全ての選択肢を無効化
    allButtons.forEach(button => {
        button.disabled = true;
        // 正しい選択肢をハイライト
        const optionData = currentQuestion.options.find(opt => opt.text === button.textContent && opt.isCorrect);
        if (optionData) {
            button.classList.add('correct');
        } else if (button === selectedButton) {
            // 間違った選択肢をハイライト
            button.classList.add('incorrect');
        }
    });

    // 正誤判定とスコア更新
    if (isCorrect) {
        score++;
        answerResultElement.textContent = '⭕ 正解！';
        answerResultElement.style.color = '#28a745';
    } else {
        answerResultElement.textContent = '❌ 不正解...';
        answerResultElement.style.color = '#dc3545';
    }
    
    // 解説の表示
    answerRationaleElement.textContent = `【解説】${currentQuestion.rationale}`;
    feedbackBox.classList.remove('hidden');
    
    // ヒントボタンを無効化
    hintButton.disabled = true;
}

// 次の問題へ進む処理
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    quizInProgress = true;
    showQuestion();
});

// 結果画面を表示する
function showResult() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    resultScoreText.textContent = `あなたのスコア: ${score} / ${shuffledQuiz.length}`;
}

// リスタート処理
restartButton.addEventListener('click', () => {
    startQuiz();
});

// ヒント表示処理
hintButton.addEventListener('click', () => {
    const currentQuestion = shuffledQuiz[currentQuestionIndex];
    hintTextElement.textContent = `ヒント: ${currentQuestion.hint}`;
    hintTextElement.classList.remove('hidden');
    hintButton.disabled = true;
});

// アプリケーション起動
loadQuizData();