// ========== 퀴즈 로직 ==========

/**
 * Multiple Choice 문제 표시
 */
function displayMCQuestion() {
    if (window.currentQuestionIndex >= window.currentQuestions.length) {
        showResult();
        return;
    }
    
    window.answered = false;
    const question = window.currentQuestions[window.currentQuestionIndex];
    
    // 문제 표시
    document.getElementById('mcEnglish').textContent = question.english;
    document.getElementById('mcPos').textContent = `(${question.pos})`;
    
    // 선택지 생성
    const choices = generateChoices(question);
    const choicesContainer = document.getElementById('mcChoices');
    choicesContainer.innerHTML = '';
    
    choices.forEach((choice, index) => {
        const div = document.createElement('div');
        div.className = 'choice';
        div.textContent = choice;
        div.onclick = () => selectMCAnswer(choice, question.korean);
        choicesContainer.appendChild(div);
    });
    
    // 피드백 및 버튼 초기화
    document.getElementById('mcFeedback').className = 'feedback';
    document.getElementById('mcFeedback').style.display = 'none';
    document.getElementById('mcNextBtn').style.display = 'none';
    
    updateProgress();
}

/**
 * 선택지 생성 (정답 + 오답 3개)
 */
function generateChoices(correctWord) {
    const allWords = window.currentQuestions;
    const choices = [correctWord.korean];
    
    // 오답 3개 추가
    while (choices.length < 4) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (!choices.includes(randomWord.korean)) {
            choices.push(randomWord.korean);
        }
    }
    
    return shuffleArray(choices);
}

/**
 * MC 답안 선택
 */
function selectMCAnswer(selected, correct) {
    if (window.answered) return;
    
    window.answered = true;
    const isCorrect = selected === correct;
    const question = window.currentQuestions[window.currentQuestionIndex];
    
    // 통계 업데이트
    updateStats(isCorrect, question);
    
    // 점수 업데이트
    if (isCorrect) {
        window.score++;
    }
    
    // 선택지 스타일 업데이트
    const choices = document.querySelectorAll('.choice');
    choices.forEach(choice => {
        if (choice.textContent === correct) {
            choice.classList.add('correct');
        } else if (choice.textContent === selected && !isCorrect) {
            choice.classList.add('incorrect');
        }
        choice.onclick = null;
    });
    
    // 피드백 표시
    const feedback = document.getElementById('mcFeedback');
    if (isCorrect) {
        feedback.className = 'feedback correct';
        feedback.textContent = '✓ 정답입니다!';
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `✗ 틀렸습니다.<br>정답: ${correct}`;
    }
    feedback.style.display = 'block';
    
    // 다음 버튼 표시
    document.getElementById('mcNextBtn').style.display = 'inline-block';
}

/**
 * MC 다음 문제
 */
function nextMCQuestion() {
    window.currentQuestionIndex++;
    displayMCQuestion();
}

/**
 * Typing Practice 문제 표시
 */
function displayTPQuestion() {
    if (window.currentQuestionIndex >= window.currentQuestions.length) {
        showResult();
        return;
    }
    
    window.answered = false;
    const question = window.currentQuestions[window.currentQuestionIndex];
    
    // 문제 표시
    document.getElementById('tpKorean').textContent = question.korean;
    document.getElementById('tpPos').textContent = `(${question.pos})`;
    document.getElementById('tpExample').textContent = question.example;
    
    // 입력 박스 생성
    const inputBoxes = document.getElementById('inputBoxes');
    inputBoxes.innerHTML = '';
    
    const answer = question.english.toLowerCase();
    for (let i = 0; i < answer.length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-box';
        input.maxLength = 1;
        input.dataset.index = i;
        
        // 입력 이벤트
        input.addEventListener('input', function(e) {
            const value = e.target.value.toLowerCase();
            if (value && i < answer.length - 1) {
                inputBoxes.children[i + 1].focus();
            }
        });
        
        // 백스페이스 처리
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                inputBoxes.children[i - 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!window.answered && document.getElementById('tpSubmitBtn').style.display !== 'none') {
                    submitTypingPractice();
                }
            }
        });
        
        inputBoxes.appendChild(input);
    }
    
    // 첫 번째 입력 박스에 포커스
    if (inputBoxes.children.length > 0) {
        inputBoxes.children[0].focus();
    }
    
    // 피드백 및 버튼 초기화
    document.getElementById('tpFeedback').className = 'feedback';
    document.getElementById('tpFeedback').style.display = 'none';
    document.getElementById('tpSubmitBtn').style.display = 'inline-block';
    document.getElementById('tpNextBtn').style.display = 'none';
    
    updateProgress();
}

/**
 * TP 답안 제출
 */
function submitTypingPractice() {
    if (window.answered) return;
    
    window.answered = true;
    const question = window.currentQuestions[window.currentQuestionIndex];
    const correctAnswer = question.english.toLowerCase();
    
    // 사용자 입력 수집
    const inputs = document.querySelectorAll('.input-box');
    let userAnswer = '';
    inputs.forEach(input => {
        userAnswer += input.value.toLowerCase();
    });
    
    const isCorrect = userAnswer === correctAnswer;
    
    // 통계 업데이트
    updateStats(isCorrect, question);
    
    // 점수 업데이트
    if (isCorrect) {
        window.score++;
    }
    
    // 입력 박스 스타일 업데이트
    inputs.forEach((input, index) => {
        const correctChar = correctAnswer[index];
        const userChar = input.value.toLowerCase();
        
        if (userChar === correctChar) {
            input.classList.add('correct');
        } else {
            input.classList.add('incorrect');
        }
        input.disabled = true;
    });
    
    // 피드백 표시
    const feedback = document.getElementById('tpFeedback');
    if (isCorrect) {
        feedback.className = 'feedback correct';
        feedback.textContent = '✓ 정답입니다!';
    } else {
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `✗ 틀렸습니다.<br>정답: ${question.english}`;
    }
    feedback.style.display = 'block';
    
    // 버튼 전환
    document.getElementById('tpSubmitBtn').style.display = 'none';
    document.getElementById('tpNextBtn').style.display = 'inline-block';
}

/**
 * TP 다음 문제
 */
function nextTPQuestion() {
    window.currentQuestionIndex++;
    displayTPQuestion();
}

/**
 * 결과 표시
 */
function showResult() {
    const total = window.currentQuestions.length;
    const percentage = Math.round((window.score / total) * 100);
    const passed = percentage >= 90;
    
    // 결과 텍스트
    let resultTitle = '';
    if (percentage === 100) {
        resultTitle = '완벽합니다! 🎉';
    } else if (percentage >= 90) {
        resultTitle = '통과! 🎊';
    } else {
        resultTitle = '다시 시도해주세요 📝';
    }
    
    document.getElementById('resultTitle').textContent = resultTitle;
    document.getElementById('resultScore').textContent = `${window.score} / ${total}`;
    document.getElementById('resultMessage').textContent = `정답률: ${percentage}% ${passed ? '통과했습니다!' : '통과하지 못했습니다.'}`;
    
    // 진행 상황 저장
    const levelKey = `${window.currentDifficulty}-${window.currentLevel}`;
    if (window.currentMode === 'mc') {
        window.progress.levels[levelKey].mcScore = window.score;
        window.progress.levels[levelKey].mcTotal = total;
        if (passed) {
            window.progress.levels[levelKey].mcPassed = true;
        }
    } else {
        window.progress.levels[levelKey].tpScore = window.score;
        window.progress.levels[levelKey].tpTotal = total;
        if (passed) {
            window.progress.levels[levelKey].tpPassed = true;
        }
    }
    saveProgressToStorage();
    
    // 모달 표시
    document.getElementById('resultModal').classList.add('show');
    
    // 레벨 완료 축하
    const levelData = window.progress.levels[levelKey];
    if (levelData.mcPassed && levelData.tpPassed && passed) {
        const justCompleted = 
            (window.currentMode === 'tp' && !levelData.mcPassed) || 
            (window.currentMode === 'mc' && !levelData.tpPassed);
        
        if (!justCompleted) {
            setTimeout(() => {
                alert('🎉 축하합니다! 이 레벨을 완전히 마스터했습니다!');
            }, 500);
        }
    }
}

/**
 * 재시도
 */
function retryMode() {
    document.getElementById('resultModal').classList.remove('show');
    startMode(window.currentDifficulty, window.currentLevel, window.currentMode);
}