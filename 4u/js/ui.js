// ========== 통합 UI 렌더링 ==========

/**
 * 레벨 선택 화면 렌더링
 */
function renderLevelSelection() {
    const exam = window.currentExam;
    const difficulty = window.currentDifficulty;
    
    const examConfig = getExamConfig(exam, difficulty);
    if (!examConfig) {
        console.error('Invalid exam or difficulty');
        return;
    }
    
    // 제목 업데이트
    const titleElement = document.getElementById('difficultyTitle');
    if (titleElement) {
        titleElement.textContent = `${examConfig.name} ${examConfig.currentDifficulty.name}`;
    }
    
    const levelGrid = document.getElementById('levelGrid');
    if (!levelGrid) return;
    
    levelGrid.innerHTML = '';
    
    const totalLevels = examConfig.currentDifficulty.levels;
    
    for (let i = 1; i <= totalLevels; i++) {
        const levelKey = getLevelKey(exam, difficulty, i);
        const levelInfo = window.progress.levels[levelKey];
        
        // 첫 레벨이거나 이전 레벨을 통과한 경우 잠금 해제
        const prevLevelKey = getLevelKey(exam, difficulty, i - 1);
        const isUnlocked = i === 1 || (window.progress.levels[prevLevelKey] && window.progress.levels[prevLevelKey].mcPassed);
        
        const card = document.createElement('div');
        card.className = 'level-card' + (isUnlocked ? '' : ' disabled');

        // 완료 배지
        let statusHTML = '';
        if (levelInfo && levelInfo.mcPassed && levelInfo.tpPassed) {
            statusHTML = '<div class="status-badge">✓ 완료</div>';
        }

        // 점수 표시
        let scoreHTML = '';
        if (levelInfo && (levelInfo.mcTotal > 0 || levelInfo.tpTotal > 0)) {
            scoreHTML = '<div class="score-display">';
            if (levelInfo.mcTotal > 0) {
                scoreHTML += `<span class="mc-score">MC: ${levelInfo.mcScore}/${levelInfo.mcTotal}</span>`;
            }
            if (levelInfo.tpTotal > 0) {
                scoreHTML += `<span class="tp-score">TP: ${levelInfo.tpScore}/${levelInfo.tpTotal}</span>`;
            }
            scoreHTML += '</div>';
        }

        card.innerHTML = 
            `<div class="level-title">Level ${i}</div>` +
            statusHTML +
            scoreHTML +
            '<div class="mode-buttons">' +
                `<button class="mode-btn mc" ${isUnlocked ? '' : 'disabled'} onclick="startMode('${exam}', '${difficulty}', ${i}, 'mc')">Multiple Choice</button>` +
                `<button class="mode-btn tp" ${isUnlocked ? '' : 'disabled'} onclick="startMode('${exam}', '${difficulty}', ${i}, 'tp')">Typing Practice</button>` +
            '</div>';

        levelGrid.appendChild(card);
    }
}

/**
 * 학습 모드 시작
 */
function startMode(exam, difficulty, level, mode) {
    window.currentExam = exam;
    window.currentDifficulty = difficulty;
    window.currentLevel = level;
    window.currentMode = mode;
    
    const data = getLevelData(exam, difficulty, level);
    if (!data) {
        alert('데이터를 불러올 수 없습니다.');
        return;
    }
    
    window.currentQuestions = shuffleArray([...data]);
    window.currentQuestionIndex = 0;
    window.score = 0;
    window.answered = false;
    
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('learningMode').classList.add('active');
    document.getElementById('learningMode').style.display = 'block';

    const modeTitle = mode === 'mc' ? 'Multiple Choice' : 'Typing Practice';
    document.getElementById('modeTitle').textContent = `Level ${level} - ${modeTitle}`;

    if (mode === 'mc') {
        document.getElementById('mcMode').style.display = 'block';
        document.getElementById('tpMode').style.display = 'none';
        displayMCQuestion();
    } else {
        document.getElementById('mcMode').style.display = 'none';
        document.getElementById('tpMode').style.display = 'block';
        displayTPQuestion();
    }
    
    updateProgress();
}

/**
 * 진행률 업데이트
 */
function updateProgress() {
    const total = window.currentQuestions.length;
    const current = window.currentQuestionIndex + 1;
    const percentage = (current / total) * 100;
    
    document.getElementById('questionCounter').textContent = `${current} / ${total}`;
    document.getElementById('progressFill').style.width = percentage + '%';
}

/**
 * 레벨 선택 화면으로 돌아가기
 */
function backToLevelSelection() {
    document.getElementById('learningMode').classList.remove('active');
    document.getElementById('learningMode').style.display = 'none';
    document.getElementById('levelSelection').style.display = 'block';
    document.getElementById('resultModal').classList.remove('show');
    
    renderLevelSelection();
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

/**
 * 레벨 데이터 가져오기
 */
function getLevelData(exam, difficulty, level) {
    if (!window.VOCAB_DATA) {
        console.error('VOCAB_DATA not loaded');
        return null;
    }
    
    if (!window.VOCAB_DATA[exam]) {
        console.error(`Exam not found: ${exam}`);
        return null;
    }
    
    if (!window.VOCAB_DATA[exam][difficulty]) {
        console.error(`Difficulty not found: ${difficulty}`);
        return null;
    }
    
    if (!window.VOCAB_DATA[exam][difficulty].levels[level]) {
        console.error(`Level not found: ${level}`);
        return null;
    }
    
    return window.VOCAB_DATA[exam][difficulty].levels[level];
}