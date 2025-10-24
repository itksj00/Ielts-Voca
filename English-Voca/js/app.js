// ========== 메인 앱 로직 ==========

// ========== 전역 변수 ==========
window.currentDifficulty = null;    // 현재 난이도 (ielts5, ielts6, ielts7)
window.currentLevel = null;          // 현재 레벨 (1-10)
window.currentMode = null;           // 현재 모드 ('mc' 또는 'tp')
window.currentQuestions = [];        // 현재 문제 배열
window.currentQuestionIndex = 0;     // 현재 문제 인덱스
window.score = 0;                    // 현재 점수
window.answered = false;             // 현재 문제 답변 완료 여부

// ========== 앱 초기화 ==========

/**
 * 앱 초기화 함수
 * - 진행 상황 불러오기
 * - 통계 불러오기
 * - 레벨 선택 화면 렌더링
 */
function initializeApp() {
    loadProgressFromStorage();
    loadStatsFromStorage();
    
    // study.html 페이지인 경우에만 레벨 선택 렌더링
    if (document.getElementById('levelSelection')) {
        const difficulty = localStorage.getItem('currentDifficulty') || 'ielts5';
        localStorage.setItem('currentDifficulty', difficulty);
        renderLevelSelection();
    }
}

// ========== 페이지 로드 시 앱 시작 ==========
window.addEventListener('DOMContentLoaded', initializeApp);