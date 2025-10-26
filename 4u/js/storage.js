// ========== 통합 로컬스토리지 관리 ==========

/**
 * 진행 상황을 로컬스토리지에서 불러오기
 */
function loadProgressFromStorage() {
    const saved = localStorage.getItem('vocabProgress');
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
    localStorage.setItem('vocabProgress', JSON.stringify(window.progress));
}

/**
 * 진행 상황 초기화
 * 모든 시험의 모든 레벨을 초기화
 */
function initializeProgress() {
    window.progress = { levels: {} };
    
    // 모든 시험 순회
    Object.keys(window.EXAM_CONFIG).forEach(exam => {
        const examConfig = window.EXAM_CONFIG[exam];
        
        // 모든 난이도 순회
        Object.keys(examConfig.difficulties).forEach(difficulty => {
            const diffConfig = examConfig.difficulties[difficulty];
            
            // 모든 레벨 초기화
            for (let i = 1; i <= diffConfig.levels; i++) {
                const levelKey = getLevelKey(exam, difficulty, i);
                window.progress.levels[levelKey] = {
                    mcPassed: false,
                    tpPassed: false,
                    mcScore: 0,
                    tpScore: 0,
                    mcTotal: 0,
                    tpTotal: 0
                };
            }
        });
    });
    
    saveProgressToStorage();
}

/**
 * 통계를 로컬스토리지에서 불러오기
 */
function loadStatsFromStorage() {
    const saved = localStorage.getItem('vocabStats');
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
    localStorage.setItem('vocabStats', JSON.stringify(window.stats));
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

/**
 * 특정 시험의 진행률 가져오기
 */
function getExamProgress(exam, difficulty) {
    const examConfig = getExamConfig(exam, difficulty);
    if (!examConfig) return { completed: 0, total: 0, percentage: 0 };
    
    const totalLevels = examConfig.currentDifficulty.levels;
    let completed = 0;
    
    for (let i = 1; i <= totalLevels; i++) {
        const levelKey = getLevelKey(exam, difficulty, i);
        const levelData = window.progress.levels[levelKey];
        
        if (levelData && levelData.mcPassed && levelData.tpPassed) {
            completed++;
        }
    }
    
    return {
        completed,
        total: totalLevels,
        percentage: Math.round((completed / totalLevels) * 100)
    };
}