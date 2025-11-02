// ========== 퀴즈 로직 (시험별 방향 분기) ==========

/**
 * 영어 단어 발음 재생
 */
function speakWord(text) {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    
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

    document.addEventListener('keydown', handleMCEnter);

    window.answered = false;
    document.getElementById('mcFeedback').classList.remove('show', 'correct', 'incorrect');
    document.getElementById('mcNextBtn').disabled = true;

    const question = window.currentQuestions[window.currentQuestionIndex];
    const isKoreanExam = window.currentExam === 'topik';
    
    if (isKoreanExam) {
        // TOPIK: 한국어 단어 → 영어 뜻 선택
        document.getElementById('mcPosLabel').textContent = '(' + question.pos + ')';
        document.getElementById('koreanWord').innerHTML = question.korean;
        document.getElementById('mcExampleSentence').textContent = question.korExample || question.example;

        const answers = [question.english];
        const samePosList = window.currentQuestions.filter(q => q.id !== question.id && q.pos === question.pos);
        
        while (answers.length < 4 && samePosList.length >= answers.length) {
            const randomWord = samePosList[Math.floor(Math.random() * samePosList.length)];
            if (!answers.includes(randomWord.english)) {
                answers.push(randomWord.english);
            }
        }
        
        while (answers.length < 4) {
            const randomWord = window.currentQuestions[Math.floor(Math.random() * window.currentQuestions.length)];
            if (!answers.includes(randomWord.english)) {
                answers.push(randomWord.english);
            }
        }

        const shuffledAnswers = shuffleArray(answers);
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';
        shuffledAnswers.forEach((answer, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = answer;
            
            // 터치와 클릭 중복 방지
            let touchHandled = false;
            
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                touchHandled = true;
                selectMCAnswer(answer, question.english, idx);
                setTimeout(() => { touchHandled = false; }, 500);
            }, { passive: false });
            
            btn.addEventListener('click', function(e) {
                if (touchHandled) return;
                e.preventDefault();
                e.stopPropagation();
                selectMCAnswer(answer, question.english, idx);
            });
            
            choicesContainer.appendChild(btn);
        });
    } else {
        // IELTS: 영어 단어 → 한국어 뜻 선택
        const wordWithSpeaker = question.english + ' <button class="speaker-btn" onclick="speakWord(\'' + question.english + '\')">🔊</button>';
        
        document.getElementById('mcPosLabel').textContent = '(' + question.pos + ')';
        document.getElementById('koreanWord').innerHTML = wordWithSpeaker;
        document.getElementById('mcExampleSentence').textContent = question.example;

        const answers = [question.korean];
        const samePosList = window.currentQuestions.filter(q => q.id !== question.id && q.pos === question.pos);
        
        while (answers.length < 4 && samePosList.length >= answers.length) {
            const randomWord = samePosList[Math.floor(Math.random() * samePosList.length)];
            if (!answers.includes(randomWord.korean)) {
                answers.push(randomWord.korean);
            }
        }
        
        while (answers.length < 4) {
            const randomWord = window.currentQuestions[Math.floor(Math.random() * window.currentQuestions.length)];
            if (!answers.includes(randomWord.korean)) {
                answers.push(randomWord.korean);
            }
        }

        const shuffledAnswers = shuffleArray(answers);
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';
        shuffledAnswers.forEach((answer, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = answer;
            
            // 터치와 클릭 중복 방지
            let touchHandled = false;
            
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                touchHandled = true;
                selectMCAnswer(answer, question.korean, idx);
                setTimeout(() => { touchHandled = false; }, 500);
            }, { passive: false });
            
            btn.addEventListener('click', function(e) {
                if (touchHandled) return;
                e.preventDefault();
                e.stopPropagation();
                selectMCAnswer(answer, question.korean, idx);
            });
            
            choicesContainer.appendChild(btn);
        });
    }

    updateProgress();
}

function handleMCEnter(e) {
    if (e.key === 'Enter' && !document.getElementById('mcNextBtn').disabled) {
        nextMCQuestion();
    }
}

function selectMCAnswer(selected, correct, idx) {
    console.log('selectMCAnswer called:', { selected, correct, idx, answered: window.answered });
    
    if (window.answered) {
        console.log('Already answered, returning');
        return;
    }

    const isCorrect = selected === correct;
    window.answered = true;

    console.log('Answer is:', isCorrect ? 'CORRECT' : 'INCORRECT');

    if (isCorrect) {
        window.score++;
    }

    const question = window.currentQuestions[window.currentQuestionIndex];
    updateStats(isCorrect, question);

    const choiceBtns = document.querySelectorAll('.choice-btn');
    console.log('Found choice buttons:', choiceBtns.length);
    
    choiceBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('selected', 'correct');
            console.log('Marking button', i, 'as correct');
        }
    });

    if (!isCorrect) {
        choiceBtns[idx].classList.add('selected', 'incorrect');
        console.log('Marking button', idx, 'as incorrect');
    }

    const feedback = document.getElementById('mcFeedback');
    if (isCorrect) {
        feedback.textContent = '✓ 정답입니다!';
        feedback.classList.add('show', 'correct');
    } else {
        feedback.textContent = '✗ 오답입니다. 정답: ' + correct;
        feedback.classList.add('show', 'incorrect');
    }

    const nextBtn = document.getElementById('mcNextBtn');
    nextBtn.disabled = false;
    console.log('Next button enabled');
}

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
    const isKoreanExam = window.currentExam === 'topik';
    
    let answer;
    if (isKoreanExam) {
        // TOPIK: 영어 단어 → 한국어 타이핑
        document.getElementById('tpPosLabel').textContent = '(' + question.pos + ')';
        document.getElementById('tpKoreanWord').textContent = question.english;
        document.getElementById('tpExampleSentence').textContent = question.example;
        answer = question.korean;
    } else {
        // IELTS: 한국어 뜻 → 영어 타이핑
        document.getElementById('tpPosLabel').textContent = '(' + question.pos + ')';
        document.getElementById('tpKoreanWord').textContent = question.korean;
        document.getElementById('tpExampleSentence').textContent = question.korExample || question.example;
        answer = question.english.toLowerCase();
    }

    const inputBoxes = document.getElementById('inputBoxes');
    inputBoxes.innerHTML = '';
    
    for (let i = 0; i < answer.length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-box';
        input.maxLength = 1;
        input.dataset.index = i;
        
        // 한글 조합 중 여부 추적
        let isComposing = false;
        let lastCompositionValue = '';
        
        input.addEventListener('compositionstart', function() {
            isComposing = true;
        });
        
        input.addEventListener('compositionend', function(e) {
            isComposing = false;
            lastCompositionValue = e.target.value;
            const currentIndex = parseInt(e.target.dataset.index);
            
            // 한글 조합 완료 후 자동으로 다음 칸으로 이동 (약간의 지연)
            if (e.target.value && currentIndex < answer.length - 1) {
                setTimeout(() => {
                    const nextInput = inputBoxes.children[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }, 10);
            }
        });
        
        input.addEventListener('input', function(e) {
            // 한글 조합 중에는 완전히 무시
            if (isComposing) {
                return;
            }
            
            const currentIndex = parseInt(e.target.dataset.index);
            
            // compositionend 직후 input 이벤트는 무시 (중복 방지)
            if (isKoreanExam && e.target.value === lastCompositionValue) {
                lastCompositionValue = '';
                return;
            }
            
            // 영어일 때만 소문자 변환
            if (!isKoreanExam) {
                e.target.value = e.target.value.toLowerCase();
            }
            
            // 영어만 즉시 다음 칸으로 (한글은 compositionend에서 처리)
            if (!isKoreanExam && e.target.value && currentIndex < answer.length - 1) {
                const nextInput = inputBoxes.children[currentIndex + 1];
                if (nextInput) nextInput.focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            const currentIndex = parseInt(e.target.dataset.index);
            
            // 스페이스바로 다음 칸 이동
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                if (e.target.value && currentIndex < answer.length - 1) {
                    const nextInput = inputBoxes.children[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }
                return;
            }
            
            if (e.key === 'Backspace' && !e.target.value && currentIndex > 0) {
                const prevInput = inputBoxes.children[currentIndex - 1];
                if (prevInput) prevInput.focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!window.answered && document.getElementById('tpSubmitBtn').style.display !== 'none') {
                    submitTypingPractice();
                }
            }
        });
        
        inputBoxes.appendChild(input);
    }
    
    if (inputBoxes.children.length > 0) {
        inputBoxes.children[0].focus();
    }

    updateProgress();
}

function handleTPNextKey(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!window.answered) return;
    nextTPQuestion();
}

function submitTypingPractice() {
    if (window.answered) return;

    window.answered = true;
    const question = window.currentQuestions[window.currentQuestionIndex];
    const isKoreanExam = window.currentExam === 'topik';
    const correctAnswer = isKoreanExam ? question.korean : question.english.toLowerCase();

    const inputs = document.querySelectorAll('.input-box');
    let userAnswer = '';
    inputs.forEach(input => {
        userAnswer += isKoreanExam ? input.value : input.value.toLowerCase();
    });

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        window.score++;
    }

    updateStats(isCorrect, question);

    inputs.forEach((input, index) => {
        const correctChar = correctAnswer[index];
        const userChar = isKoreanExam ? input.value : input.value.toLowerCase();
        
        if (userChar === correctChar) {
            input.classList.add('correct');
        } else {
            input.classList.add('incorrect');
        }
        input.disabled = true;
    });

    const feedback = document.getElementById('tpFeedback');
    const displayAnswer = isKoreanExam ? question.korean : question.english;
    if (isCorrect) {
        feedback.textContent = '✓ 정답입니다!';
        feedback.classList.add('show', 'correct');
    } else {
        feedback.textContent = '✗ 오답입니다. 정답: ' + displayAnswer;
        feedback.classList.add('show', 'incorrect');
    }

    document.getElementById('tpSubmitBtn').style.display = 'none';
    const tpNextBtn = document.getElementById('tpNextBtn');
    tpNextBtn.style.display = 'inline-block';
    tpNextBtn.addEventListener('keydown', handleTPNextKey);
    tpNextBtn.focus();
}

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

    const levelKey = getLevelKey(window.currentExam, window.currentDifficulty, window.currentLevel);
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
    startMode(window.currentExam, window.currentDifficulty, window.currentLevel, window.currentMode);
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