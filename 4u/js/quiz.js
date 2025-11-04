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
        let compositionHandled = false;
        let spaceKeyPressed = false;
        
        input.addEventListener('compositionstart', function(e) {
            isComposing = true;
            compositionHandled = false;
            spaceKeyPressed = false;
            console.log('compositionstart', e.target.dataset.index);
        });
        
        input.addEventListener('compositionupdate', function(e) {
            console.log('compositionupdate', e.data);
        });
        
        input.addEventListener('compositionend', function(e) {
            console.log('compositionend', e.target.value);
            isComposing = false;
            compositionHandled = true;
            
            const currentIndex = parseInt(e.target.dataset.index);
            const value = e.target.value;
            
            // 스페이스바로 인한 종료가 아니면 자동 이동
            if (!spaceKeyPressed && value && currentIndex < answer.length - 1) {
                setTimeout(() => {
                    // 중복 방지 플래그 초기화 (다음 입력을 위해)
                    compositionHandled = false;
                    const nextInput = inputBoxes.children[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }, 50);
            } else {
                // 스페이스바로 인한 종료거나 마지막 칸이면 플래그만 초기화
                setTimeout(() => {
                    compositionHandled = false;
                    spaceKeyPressed = false;
                }, 100);
            }
        });
        
        input.addEventListener('input', function(e) {
            console.log('input event', e.target.value, 'isComposing:', isComposing, 'compositionHandled:', compositionHandled, 'spaceKey:', spaceKeyPressed);
            
            // 한글 조합 중에는 완전히 무시
            if (isComposing) {
                console.log('input ignored - composing');
                return;
            }
            
            // compositionend 직후 input 이벤트는 무시
            if (compositionHandled) {
                console.log('input ignored - composition just handled');
                return;
            }
            
            // 스페이스바 직후 input 이벤트는 무시
            if (spaceKeyPressed) {
                console.log('input ignored - space key pressed');
                spaceKeyPressed = false;
                return;
            }
            
            const currentIndex = parseInt(e.target.dataset.index);
            
            // 영어일 때만 소문자 변환 및 다음 칸으로
            if (!isKoreanExam) {
                e.target.value = e.target.value.toLowerCase();
                if (e.target.value && currentIndex < answer.length - 1) {
                    const nextInput = inputBoxes.children[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }
            }
            
            console.log('input processed:', e.target.value);
        });
        
        // focus 이벤트 추가 - 잘못된 값 제거
        input.addEventListener('focus', function(e) {
            const currentIndex = parseInt(e.target.dataset.index);
            console.log('focus event at index', currentIndex, 'value:', e.target.value);
            
            // 이전 칸이 있고, 현재 칸의 값이 이전 칸의 값과 같으면 삭제
            if (currentIndex > 0) {
                const prevInput = inputBoxes.children[currentIndex - 1];
                if (prevInput && e.target.value === prevInput.value && e.target.value !== '') {
                    console.log('Clearing duplicated value:', e.target.value);
                    e.target.value = '';
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            const currentIndex = parseInt(e.target.dataset.index);
            
            // 스페이스바로 다음 칸 이동
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // 모든 이벤트 전파 중단
                console.log('Space key pressed at index', currentIndex);
                
                spaceKeyPressed = true;
                
                // 한글 조합 중이면 강제로 종료
                if (isComposing) {
                    console.log('Forcing composition end');
                    isComposing = false;
                    compositionHandled = true;
                }
                
                // 현재 값 저장
                const currentValue = e.target.value;
                console.log('Current value:', currentValue);
                
                // 현재 값이 있고 다음 칸이 있으면 이동
                if (currentValue && currentIndex < answer.length - 1) {
                    const nextInput = inputBoxes.children[currentIndex + 1];
                    if (nextInput) {
                        console.log('Moving to next input');
                        // 약간의 지연을 두고 이동
                        setTimeout(() => {
                            nextInput.focus();
                            // 다음 칸이 비어있는지 확인
                            if (nextInput.value) {
                                console.log('WARNING: Next input already has value:', nextInput.value);
                                nextInput.value = ''; // 강제로 비우기
                            }
                            spaceKeyPressed = false;
                            compositionHandled = false;
                        }, 10);
                    }
                } else {
                    // 이동하지 않는 경우에도 플래그 초기화
                    setTimeout(() => {
                        spaceKeyPressed = false;
                        compositionHandled = false;
                    }, 100);
                }
                
                return false; // 이벤트 완전 차단
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
    console.log('=== showResultModal called ===');
    console.log('Score:', window.score);
    console.log('Total questions:', window.currentQuestions.length);
    console.log('Current exam:', window.currentExam);
    console.log('Current difficulty:', window.currentDifficulty);
    console.log('Current level:', window.currentLevel);
    console.log('Current mode:', window.currentMode);
    
    document.removeEventListener('keydown', handleMCEnter);
    const tpNextBtn = document.getElementById('tpNextBtn');
    if (tpNextBtn) {
        tpNextBtn.removeEventListener('keydown', handleTPNextKey);
    }

    const total = window.currentQuestions.length;
    const percentage = Math.round((window.score / total) * 100);
    const passed = percentage >= 90;

    console.log('Percentage:', percentage, 'Passed:', passed);

    let resultTitle = '';
    if (percentage === 100) {
        resultTitle = '완벽합니다! 🎉';
    } else if (percentage >= 90) {
        resultTitle = '통과! 🎊';
    } else {
        resultTitle = '다시 시도해주세요 📝';
    }

    console.log('Setting result title:', resultTitle);
    document.getElementById('resultTitle').textContent = resultTitle;
    document.getElementById('resultScore').textContent = window.score + ' / ' + total;
    document.getElementById('resultMessage').textContent = '정답률: ' + percentage + '% ' + (passed ? '통과했습니다!' : '통과하지 못했습니다.');

    const levelKey = getLevelKey(window.currentExam, window.currentDifficulty, window.currentLevel);
    console.log('Level key:', levelKey);
    
    // progress.levels가 없으면 초기화
    if (!window.progress.levels[levelKey]) {
        console.log('WARNING: Level data not found, initializing...');
        window.progress.levels[levelKey] = {
            mcPassed: false,
            tpPassed: false,
            mcScore: 0,
            tpScore: 0,
            mcTotal: 0,
            tpTotal: 0
        };
    }
    
    if (window.currentMode === 'mc') {
        window.progress.levels[levelKey].mcScore = window.score;
        window.progress.levels[levelKey].mcTotal = total;
        if (passed) {
            window.progress.levels[levelKey].mcPassed = true;
        }
        console.log('MC results saved:', window.progress.levels[levelKey]);
    } else {
        window.progress.levels[levelKey].tpScore = window.score;
        window.progress.levels[levelKey].tpTotal = total;
        if (passed) {
            window.progress.levels[levelKey].tpPassed = true;
        }
        console.log('TP results saved:', window.progress.levels[levelKey]);
    }
    
    saveProgressToStorage();
    console.log('Progress saved to storage');

    const resultModal = document.getElementById('resultModal');
    if (!resultModal) {
        console.error('ERROR: resultModal element not found!');
        alert('결과: ' + window.score + '/' + total + ' (' + percentage + '%)');
        return;
    }
    
    console.log('Adding show class to modal');
    resultModal.classList.add('show');
    console.log('Modal classes:', resultModal.className);

    const levelData = window.progress.levels[levelKey];
    if (levelData.mcPassed && levelData.tpPassed && passed) {
        setTimeout(() => {
            alert('🎉 축하합니다! 이 레벨을 완전히 마스터했습니다!');
        }, 500);
    }
    
    console.log('=== showResultModal complete ===');
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