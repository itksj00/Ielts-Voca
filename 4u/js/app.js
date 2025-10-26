// ========== 통합 메인 앱 로직 ==========

// 전역 변수
window.currentExam = null;
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
    
    // study.html 페이지인 경우
    if (document.getElementById('levelSelection')) {
        // URL 파라미터에서 시험 정보 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const exam = urlParams.get('exam');
        const difficulty = urlParams.get('difficulty');
        
        if (exam && difficulty) {
            window.currentExam = exam;
            window.currentDifficulty = difficulty;
            renderLevelSelection();
        } else {
            console.error('Missing exam or difficulty parameter');
            alert('잘못된 접근입니다. 시험을 다시 선택해주세요.');
            window.location.href = 'index.html';
        }
    }
}

/**
 * 시험 선택 페이지로 이동
 */
function goToExamSelect(exam) {
    window.location.href = `exam-select.html?exam=${exam}`;
}

/**
 * 학습 페이지로 이동
 */
function goToStudy(exam, difficulty) {
    window.location.href = `study.html?exam=${exam}&difficulty=${difficulty}`;
}

// 페이지 로드 시 앱 시작
window.addEventListener('DOMContentLoaded', initializeApp);