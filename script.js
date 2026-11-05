let quizData = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const chapterSelect = document.getElementById('chapter-select');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const optionsContainer = document.getElementById('options-container');

async function loadQuizData() {
    try {
        const response = await fetch('Data_assignment.json');
        const data = await response.json();
        quizData = data.chapters;
        populateChapterSelect();
    } catch (error) {
        console.error("Lỗi tải dữ liệu JSON:", error);
        document.querySelector('.subtitle').innerText = "❌ Lỗi: Không thể đọc file Data_assignment.json. Vui lòng chạy qua Live Server.";
    }
}

function populateChapterSelect() {
    quizData.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${chapter.chapter_name} (${chapter.questions.length} câu)`;
        chapterSelect.appendChild(option);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

startBtn.addEventListener('click', () => {
    const selectedValue = chapterSelect.value;
    currentQuestions = [];
    
    if (selectedValue === 'all') {
        quizData.forEach(chapter => {
            currentQuestions = currentQuestions.concat(chapter.questions);
        });
    } else {
        currentQuestions = [...quizData[selectedValue].questions];
    }

    currentQuestions = shuffleArray(currentQuestions);
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('total-q-num').innerText = currentQuestions.length;
    switchScreen(setupScreen, quizScreen);
    loadQuestion();
});

function loadQuestion() {
    resetState();
    const currentQ = currentQuestions[currentQuestionIndex];
    
    document.getElementById('current-q-num').innerText = currentQuestionIndex + 1;
    document.getElementById('score-display').innerText = score;
    
    // Xóa chữ "Câu X:" ở đầu câu hỏi nếu có để UI sạch sẽ hơn
    let cleanQuestionText = currentQ.question_text.replace(/^Câu \d+[:.]\s*/i, '');
    document.getElementById('question-text').innerText = cleanQuestionText;
    
    const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    currentQ.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        
        // Dọn dẹp các tiền tố "a.", "b.", "c.", "d.", "A.", "B." từ file JSON
        let cleanText = optionText.replace(/^[a-d]\s*[.)]\s*/i, '');
        button.innerText = cleanText;
        
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(button, index, currentQ.correct_answer_index));
        optionsContainer.appendChild(button);
    });
}

function resetState() {
    nextBtn.classList.add('hidden');
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
}

function selectAnswer(selectedBtn, selectedIndex, correctIndex) {
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
        document.getElementById('score-display').innerText = score;
    } else {
        selectedBtn.classList.add('wrong');
    }

    Array.from(optionsContainer.children).forEach((btn, index) => {
        btn.disabled = true;
        if (index === correctIndex) {
            btn.classList.add('correct');
        }
    });

    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-total').innerText = currentQuestions.length;
    
    const percent = (score / currentQuestions.length) * 100;
    let feedback = "";
    if (percent >= 90) feedback = "🏆 Xuất sắc! Kiến thức của bạn cực kỳ vững vàng.";
    else if (percent >= 70) feedback = "👏 Rất tốt! Bạn đã nắm chắc phần lớn giáo trình.";
    else if (percent >= 50) feedback = "👍 Khá ổn! Nhưng cần ôn tập kỹ thêm vài chương nhé.";
    else feedback = "📚 Đừng nản chí! Hãy đọc lại tài liệu và làm lại nào.";
    
    document.getElementById('feedback-msg').innerText = feedback;
    switchScreen(quizScreen, resultScreen);
}

restartBtn.addEventListener('click', () => {
    switchScreen(resultScreen, setupScreen);
});

function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.remove('active');
    setTimeout(() => {
        hideScreen.classList.add('hidden');
        showScreen.classList.remove('hidden');
        showScreen.classList.add('active');
    }, 300); // Khớp với thời gian animation CSS
}

// Khởi chạy khi load trang
loadQuizData();