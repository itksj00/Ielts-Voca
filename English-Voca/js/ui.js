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
    
    // 난이도 제목 업데이트
    document.getElementById('difficultyTitle').textContent = difficultyNames[difficulty];
    
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const levelKey = `${difficulty}-${i}`;
        const levelData = window.progress.levels[levelKey];
        const isLocked = i > 1 && !window.progress.levels[`${difficulty}-${i-1}`].mcPassed;
        
        const card = document.createElement('div');
        card.className = 'level-card' + (isLocked ? ' disabled' : '');
        
        card.innerHTML = `
            <div class="level-number">Level ${i}</div>
            <h3>35개 단어</h3>
            <div class="level-status">
                <span class="status-badge mc ${levelData.mcPassed ? 'passed' : ''}">
                    MC ${levelData.mcPassed ? '✓' : ''}
                </span>
                <span class="status-badge tp ${levelData.tpPassed ? 'passed' : ''}">
                    TP ${levelData.tpPassed ? '✓' : ''}
                </span>
            </div>
        `;
        
        if (!isLocked) {
            card.onclick = () => showModeSelection(difficulty, i);
        }
        
        levelGrid.appendChild(card);
    }
}

/**
 * 모드 선택 모달 표시 (MC 또는 TP)
 */
function showModeSelection(difficulty, level) {
    const levelKey = `${difficulty}-${level}`;
    const levelData = window.progress.levels[levelKey];
    
    // 모드 선택 모달 HTML 생성
    const modalHTML = `
        <div id="modeSelectModal" class="modal show">
            <div class="modal-content mode-select-modal">
                <h2>Level ${level} - 학습 모드 선택</h2>
                <p class="mode-select-subtitle">원하는 학습 모드를 선택하세요</p>
                <div class="mode-buttons">
                    <button class="mode-btn mc-btn" onclick="selectMode('${difficulty}', ${level}, 'mc')">
                        <div class="mode-icon">📝</div>
                        <div class="mode-title">Multiple Choice</div>
                        <div class="mode-status ${levelData.mcPassed ? 'passed' : ''}">${levelData.mcPassed ? '✓ 완료' : '미완료'}</div>
                    </button>
                    <button class="mode-btn tp-btn" onclick="selectMode('${difficulty}', ${level}, 'tp')">
                        <div class="mode-icon">⌨️</div>
                        <div class="mode-title">Typing Practice</div>
                        <div class="mode-status ${levelData.tpPassed ? 'passed' : ''}">${levelData.tpPassed ? '✓ 완료' : '미완료'}</div>
                    </button>
                </div>
                <button class="cancel-btn" onclick="closeModeSelectModal()">취소</button>
            </div>
        </div>
    `;
    
    // 기존 모달 제거 후 새로 추가
    const existingModal = document.getElementById('modeSelectModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * 모드 선택
 */
function selectMode(difficulty, level, mode) {
    closeModeSelectModal();
    startMode(difficulty, level, mode);
}

/**
 * 모드 선택 모달 닫기
 */
function closeModeSelectModal() {
    const modal = document.getElementById('modeSelectModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * 학습 모드 시작
 */
function startMode(difficulty, level, mode) {
    window.currentDifficulty = difficulty;
    window.currentLevel = level;
    window.currentMode = mode;
    
    // 데이터 가져오기
    const data = getLevelData(difficulty, level);
    if (!data) {
        alert('데이터를 불러올 수 없습니다.');
        return;
    }
    
    window.currentQuestions = shuffleArray([...data]);
    window.currentQuestionIndex = 0;
    window.score = 0;
    window.answered = false;
    
    // 화면 전환
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('learningMode').style.display = 'block';
    document.getElementById('learningMode').classList.add('active');
    
    // 모드 제목 설정
    const modeTitle = mode === 'mc' ? 'Multiple Choice' : 'Typing Practice';
    document.getElementById('modeTitle').textContent = `Level ${level} - ${modeTitle}`;
    
    // 첫 문제 표시
    if (mode === 'mc') {
        document.getElementById('mcArea').style.display = 'block';
        document.getElementById('tpArea').style.display = 'none';
        displayMCQuestion();
    } else {
        document.getElementById('mcArea').style.display = 'none';
        document.getElementById('tpArea').style.display = 'block';
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
 * 배열 섞기 (Fisher-Yates 알고리즘)
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