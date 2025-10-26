// ========== 로컬스토리지 관리 (TOPIK) ==========

/**
 * 진행 상황을 로컬스토리지에서 불러오기
 */
function loadProgressFromStorage() {
    const saved = localStorage.getItem('topikProgress');
    if (saved) {
        window.progress = JSON.parse(saved);
    } else {
        initializeProgress();
    }
}

/**
 * 진행 상황을 로컬스토리지에 저장
 */
function saveProgressToStorage() {
    localStorage.setItem('topikProgress', JSON.stringify(window.progress));
}

/**
 * 진행 상황 초기화
 * TOPIK 1~2급 10개 레벨
 */
function initializeProgress() {
    window.progress = { levels: {} };
    
    // TOPIK 1~2급 10개 레벨 초기화
    for (let i = 1; i <= 10; i++) {
        const levelKey = `topik12-${i}`;
        window.progress.levels[levelKey] = {
            mcPassed: false,
            tpPassed: false,
            mcScore: 0,
            tpScore: 0,
            mcTotal: 0,
            tpTotal: 0
        };
    }
    
    saveProgressToStorage();
}

/**
 * 통계를 로컬스토리지에서 불러오기
 */
function loadStatsFromStorage() {
    const saved = localStorage.getItem('topikStats');
    if (saved) {
        window.stats = JSON.parse(saved);
    } else {
        initializeStats();
    }
}

/**
 * 통계를 로컬스토리지에 저장
 */
function saveStatsToStorage() {
    localStorage.setItem('topikStats', JSON.stringify(window.stats));
}

/**
 * 통계 초기화
 */
function initializeStats() {
    window.stats = {
        totalAttempts: 0,
        totalCorrect: 0,
        mistakes: {},
        learnedWords: {}
    };
    saveStatsToStorage();
}

/**
 * 통계 업데이트
 */
function updateStats(isCorrect, word) {
    window.stats.totalAttempts++;
    
    if (isCorrect) {
        window.stats.totalCorrect++;
    } else {
        const key = word.english;
        if (!window.stats.mistakes[key]) {
            window.stats.mistakes[key] = {
                english: word.english,
                korean: word.korean,
                count: 0
            };
        }
        window.stats.mistakes[key].count++;
    }
    
    const wordKey = word.english;
    if (!window.stats.learnedWords[wordKey]) {
        window.stats.learnedWords[wordKey] = {
            english: word.english,
            korean: word.korean,
            firstLearnedAt: new Date().toISOString()
        };
    }
    
    saveStatsToStorage();
}