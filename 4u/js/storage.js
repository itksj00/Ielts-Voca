// ========== 로컬스토리지 관리 ==========

/**
 * 진행 상황을 로컬스토리지에서 불러오기
 */
function loadProgressFromStorage() {
    const saved = localStorage.getItem('vocabularyProgress');
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
    localStorage.setItem('vocabularyProgress', JSON.stringify(window.progress));
}

/**
 * 진행 상황 초기화
 * IELTS 5, 6, 7 각각 10개 레벨
 */
function initializeProgress() {
    window.progress = { levels: {} };
    
    // IELTS 5, 6, 7 각 10개 레벨 초기화
    const difficulties = ['ielts5', 'ielts6', 'ielts7'];
    difficulties.forEach(diff => {
        for (let i = 1; i <= 10; i++) {
            const levelKey = `${diff}-${i}`;
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
    
    saveProgressToStorage();
}

/**
 * 통계를 로컬스토리지에서 불러오기
 */
function loadStatsFromStorage() {
    const saved = localStorage.getItem('vocabularyStats');
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
    localStorage.setItem('vocabularyStats', JSON.stringify(window.stats));
}

/**
 * 통계 초기화
 */
function initializeStats() {
    window.stats = {
        totalAttempts: 0,
        totalCorrect: 0,
        mistakes: {},
        learnedWords: {}  // 학습한 단어 추적 (중복 제거용)
    };
    saveStatsToStorage();
}

/**
 * 통계 업데이트
 * @param {boolean} isCorrect - 정답 여부
 * @param {object} word - 단어 객체
 */
function updateStats(isCorrect, word) {
    window.stats.totalAttempts++;
    
    if (isCorrect) {
        window.stats.totalCorrect++;
    } else {
        // 틀린 단어 기록
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
    
    // 학습한 단어로 기록 (중복 없이)
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