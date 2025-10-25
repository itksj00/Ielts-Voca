// ========== 퀴즈 로직 (Shrimp 방식) ==========

/**
 * 영어 단어 발음 재생
 */
function speakWord(text) {
    // 이전 발음 중지
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // 속도 (0.1 ~ 10)
    utterance.pitch = 1; // 음높이 (0 ~ 2)
    utterance.volume = 1; // 볼륨 (0 ~ 1)
    
    speechSynthesis.speak(utterance);
}

/**
 * Multiple Choice 문제 표시
 */
function displayMCQuestion() {
    if (window.currentQuestionIndex >= window.currentQuestions.length) {
        showResultModal();
        return;
    }

    // MC Enter 핸들러 등록
    document.addEventListener('keydown', handleMCEnter);

    window.answered = false;
    document.getElementById('mcFeedback').classList.remove('show', 'correct', 'incorrect');
    document.getElementById('mcNextBtn').disabled = true;

    const question = window.currentQuestions[window.currentQuestionIndex];
    
    // 영어 단어 + 스피커 버튼
    const wordWithSpeaker = question.english + ' <button class="speaker-btn" onclick="speakWord(\'' + question.english + '\')">🔊</button>';
    
    document.getElementById('mcPosLabel').textContent = '(' + question.pos + ')';
    document.getElementById('koreanWord').innerHTML = wordWithSpeaker;  // innerHTML으로 변경
    document.getElementById('mcExampleSentence').textContent = question.example;

    // 선택지 생성 (한글, 같은 품사 우선)
    const answers = [question.korean];
    const samePosList = window.currentQuestions.filter(q => q.id !== question.id && q.pos === question.pos);
    
    // 같은 품사에서 먼저 선택
    while (answers.length < 4 && samePosList.length >= answers.length) {
        const randomWord = samePosList[Math.floor(Math.random() * samePosList.length)];
        if (!answers.includes(randomWord.korean)) {
            answers.push(randomWord.korean);
        }
    }
    
    // 부족하면 다른 품사에서 선택
    while (answers.length < 4) {
        const randomWord = window.currentQuestions[Math.floor(Math.random() * window.currentQuestions.length)];
        if (!answers.includes(randomWord.korean)) {
            answers.push(randomWord.korean);
        }
    }

    // 선택지 섞기
    const shuffledAnswers = shuffleArray(answers);

    // 선택지 표시
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    shuffledAnswers.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = answer;
        btn.onclick = () => selectMCAnswer(answer, question.korean, idx);  // 한글이 정답
        choicesContainer.appendChild(btn);
    });

    updateProgress();
}

/**
 * MC Enter 키 핸들러
 */
function handleMCEnter(e) {
    if (e.key === 'Enter' && !document.getElementById('mcNextBtn').disabled) {
        nextMCQuestion();
    }
}

/**
 * MC 답안 선택
 */
function selectMCAnswer(selected, correct, idx) {
    if (window.answered) return;

    const isCorrect = selected === correct;
    window.answered = true;

    if (isCorrect) {
        window.score++;
    }

    const question = window.currentQuestions[window.currentQuestionIndex];
    updateStats(isCorrect, question);

    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('selected', 'correct');
        }
    });

    if (!isCorrect) {
        choiceBtns[idx].classList.add('selected', 'incorrect');
    }

    const feedback = document.getElementById('mcFeedback');
    if (isCorrect) {
        feedback.textContent = '✓ 정답입니다!';
        feedback.classList.add('show', 'correct');
    } else {
        feedback.textContent = '✗ 오답입니다. 정답: ' + correct;
        feedback.classList.add('show', 'incorrect');
    }

    document.getElementById('mcNextBtn').disabled = false;
}

/**
 * MC 다음 문제
 */
function nextMCQuestion() {
    document.removeEventListener('keydown', handleMCEnter);
    window.currentQuestionIndex++;
    displayMCQuestion();
}

/**
 * Typing Practice 문제 표시
 */
function displayTPQuestion() {
    if (window.currentQuestionIndex >= window.currentQuestions.length) {
        showResultModal();
        return;
    }

    // MC Enter 핸들러 제거
    document.removeEventListener('keydown', handleMCEnter);

    window.answered = false;
    document.getElementById('tpFeedback').classList.remove('show', 'correct', 'incorrect');
    document.getElementById('tpSubmitBtn').disabled = false;
    document.getElementById('tpSubmitBtn').style.display = 'inline-block';
    
    const tpNextBtn = document.getElementById('tpNextBtn');
    if (tpNextBtn) {
        tpNextBtn.style.display = 'none';
        tpNextBtn.removeEventListener('keydown', handleTPNextKey);
    }

    const question = window.currentQuestions[window.currentQuestionIndex];
    
    document.getElementById('tpPosLabel').textContent = '(' + question.pos + ')';
    document.getElementById('tpKoreanWord').textContent = question.korean;  // 스피커 버튼 제거
    document.getElementById('tpExampleSentence').textContent = question.korExample;

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
        
        // 백스페이스 및 Enter 처리
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

    updateProgress();
}

/**
 * TP Next 키 핸들러
 */
function handleTPNextKey(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!window.answered) return;
    nextTPQuestion();
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

    if (isCorrect) {
        window.score++;
    }

    updateStats(isCorrect, question);

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
        feedback.textContent = '✓ 정답입니다!';
        feedback.classList.add('show', 'correct');
    } else {
        feedback.textContent = '✗ 오답입니다. 정답: ' + question.english;
        feedback.classList.add('show', 'incorrect');
    }

    // 버튼 전환
    document.getElementById('tpSubmitBtn').style.display = 'none';
    const tpNextBtn = document.getElementById('tpNextBtn');
    tpNextBtn.style.display = 'inline-block';
    tpNextBtn.addEventListener('keydown', handleTPNextKey);
    tpNextBtn.focus();
}

/**
 * TP 다음 문제
 */
function nextTPQuestion() {
    const tpNextBtn = document.getElementById('tpNextBtn');
    tpNextBtn.removeEventListener('keydown', handleTPNextKey);
    
    window.currentQuestionIndex++;
    displayTPQuestion();
}

/**
 * 결과 모달 표시
 */
function showResultModal() {
    // Enter 핸들러 제거
    document.removeEventListener('keydown', handleMCEnter);
    const tpNextBtn = document.getElementById('tpNextBtn');
    if (tpNextBtn) {
        tpNextBtn.removeEventListener('keydown', handleTPNextKey);
    }

    const total = window.currentQuestions.length;
    const percentage = Math.round((window.score / total) * 100);
    const passed = percentage >= 90;

    let resultTitle = '';
    if (percentage === 100) {
        resultTitle = '완벽합니다! 🎉';
    } else if (percentage >= 90) {
        resultTitle = '통과! 🎊';
    } else {
        resultTitle = '다시 시도해주세요 📝';
    }

    document.getElementById('resultTitle').textContent = resultTitle;
    document.getElementById('resultScore').textContent = window.score + ' / ' + total;
    document.getElementById('resultMessage').textContent = '정답률: ' + percentage + '% ' + (passed ? '통과했습니다!' : '통과하지 못했습니다.');

    // 진행 상황 저장
    const levelKey = window.currentDifficulty + '-' + window.currentLevel;
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

    document.getElementById('resultModal').classList.add('show');

    // 레벨 완료 축하
    const levelData = window.progress.levels[levelKey];
    if (levelData.mcPassed && levelData.tpPassed && passed) {
        setTimeout(() => {
            alert('🎉 축하합니다! 이 레벨을 완전히 마스터했습니다!');
        }, 500);
    }
}

/**
 * 재시도
 */
function retryMode() {
    document.getElementById('resultModal').classList.remove('show');
    startMode(window.currentDifficulty, window.currentLevel, window.currentMode);
}

/**
 * 배열 섞기
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}