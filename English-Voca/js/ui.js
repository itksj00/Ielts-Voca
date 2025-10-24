// ========== UI 렌더링 ==========

/**
 * 레벨 선택 화면 렌더링
 */
function renderLevelSelection() {
    const difficulty = localStorage.getItem('currentDifficulty') || 'ielts5';
    const difficultyNames = {
        'ielts5': 'IELTS Band 5',
        'ielts6': 'IELTS Band 6',
        'ielts7': 'IELTS Band 7'
    };
    
    document.getElementById('difficultyTitle').textContent = difficultyNames[difficulty];
    
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const levelKey = `${difficulty}-${i}`;
        const levelInfo = window.progress.levels[levelKey];
        const isUnlocked = i === 1 || window.progress.levels[`${difficulty}-${i-1}`].mcPassed;
        
        const card = document.createElement('div');
        card.className = 'level-card' + (isUnlocked ? '' : ' disabled');

        // 완료 배지
        let statusHTML = '';
        if (levelInfo.mcPassed && levelInfo.tpPassed) {
            statusHTML = '<div class="status-badge">✓ 완료</div>';
        }

        // 점수 표시
        let scoreHTML = '';
        if (levelInfo.mcTotal > 0 || levelInfo.tpTotal > 0) {
            scoreHTML = '<div class="score-display">';
            if (levelInfo.mcTotal > 0) {
                scoreHTML += '<span class="mc-score">MC: ' + levelInfo.mcScore + '/' + levelInfo.mcTotal + '</span>';
            }
            if (levelInfo.tpTotal > 0) {
                scoreHTML += '<span class="tp-score">TP: ' + levelInfo.tpScore + '/' + levelInfo.tpTotal + '</span>';
            }
            scoreHTML += '</div>';
        }

        card.innerHTML = 
            '<div class="level-title">Level ' + i + '</div>' +
            statusHTML +
            scoreHTML +
            '<div class="mode-buttons">' +
                '<button class="mode-btn mc" ' + (isUnlocked ? '' : 'disabled') + ' onclick="startMode(\'' + difficulty + '\', ' + i + ', \'mc\')">Multiple Choice</button>' +
                '<button class="mode-btn tp" ' + (isUnlocked ? '' : 'disabled') + ' onclick="startMode(\'' + difficulty + '\', ' + i + ', \'tp\')">Typing Practice</button>' +
            '</div>';

        levelGrid.appendChild(card);
    }
}

/**
 * 학습 모드 시작
 */
function startMode(difficulty, level, mode) {
    window.currentDifficulty = difficulty;
    window.currentLevel = level;
    window.currentMode = mode;
    
    const data = getLevelData(difficulty, level);
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
    document.getElementById('modeTitle').textContent = 'Level ' + level + ' - ' + modeTitle;

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
    
    document.getElementById('questionCounter').textContent = current + ' / ' + total;
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
 * 난이도와 레벨에 맞는 데이터 가져오기
 */
function getLevelData(difficulty, level) {
    if (difficulty === 'ielts5') {
        return window.IELTS5_DATA ? window.IELTS5_DATA[level] : null;
    } else if (difficulty === 'ielts6') {
        return window.IELTS6_DATA ? window.IELTS6_DATA[level] : null;
    } else if (difficulty === 'ielts7') {
        return window.IELTS7_DATA ? window.IELTS7_DATA[level] : null;
    }
    return null;
}