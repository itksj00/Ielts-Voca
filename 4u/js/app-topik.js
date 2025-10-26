// ========== 메인 앱 로직 (TOPIK) ==========

window.currentDifficulty = null;
window.currentLevel = null;
window.currentMode = null;
window.currentQuestions = [];
window.currentQuestionIndex = 0;
window.score = 0;
window.answered = false;

/**
 * 앱 초기화 함수
 */
function initializeApp() {
    loadProgressFromStorage();
    loadStatsFromStorage();
    
    if (document.getElementById('levelSelection')) {
        renderLevelSelection();
    }
}

window.addEventListener('DOMContentLoaded', initializeApp);