// ========== 언어 설정 ==========

const translations = {
    ko: {
        // index.html
        mainTitle: '🐺 Voca for you',
        mainSubtitle: '당신의 어휘 실력 향상을 위한 학습 플랫폼',
        menuEnglish: '영어 공부',
        menuEnglishDesc: '다양한 시험 준비를 위한 어휘 학습',
        menuKorean: '한국어 공부',
        menuKoreanDesc: 'TOPIK 시험 준비를 위한 어휘 학습',
        menuStats: '학습 통계',
        menuStatsDesc: '나의 학습 현황과 성과 확인',
        issueReportText: '💡 이슈 신고 / 개선 아이디어',
        issueTitle: '이슈 신고 / 개선 아이디어',
        issueDesc: '아래 이메일로 내용을 전달해 주세요:',
        issueCloseBtn: '닫기',
        
        // korean-collections.html
        backText: '뒤로',
        koreanStudyTitle: '한국어 공부',
        koreanStudyDesc: '학습할 TOPIK 레벨을 선택하세요',
        topik12Title: 'TOPIK 1~2급 대비',
        topik12Desc: '초급 한국어 필수 어휘',
        topik34Title: 'TOPIK 3~4급 대비',
        topik34Desc: '중급 한국어 필수 어휘',
        topik56Title: 'TOPIK 5~6급 대비',
        topik56Desc: '고급 한국어 필수 어휘',
        comingSoon1: '🔒 준비중',
        comingSoon2: '🔒 준비중',
        comingSoon3: '🔒 준비중',
        
        // collections.html
        englishStudyTitle: '영어 공부',
        englishStudyDesc: '학습할 시험 유형을 선택하세요',
        ieltsTitle: 'IELTS Vocabulary',
        ieltsDesc: 'Band 5-7 수준의 필수 어휘',
        ieltsStats: '1,050개 단어',
        ieltsLevels: '30개 레벨',
        toeicTitle: 'TOEIC Vocabulary',
        toeicDesc: '비즈니스 영어 필수 어휘',
        toeflTitle: 'TOEFL Vocabulary',
        toeflDesc: '학술 영어 필수 어휘',
        comingSoonToeic: '🔒 준비중',
        comingSoonToefl: '🔒 준비중'
    },
    en: {
        // index.html
        mainTitle: '🐺 Voca for you',
        mainSubtitle: 'Your platform for vocabulary improvement',
        menuEnglish: 'English Study',
        menuEnglishDesc: 'Vocabulary learning for various exams',
        menuKorean: 'Korean Study',
        menuKoreanDesc: 'Vocabulary learning for TOPIK exams',
        menuStats: 'Learning Statistics',
        menuStatsDesc: 'Check your learning progress and achievements',
        issueReportText: '💡 Report Issue / Improvement Ideas',
        issueTitle: 'Report Issue / Improvement Ideas',
        issueDesc: 'Please send your message to:',
        issueCloseBtn: 'Close',
        
        // korean-collections.html
        backText: 'Back',
        koreanStudyTitle: 'Korean Study',
        koreanStudyDesc: 'Select your TOPIK level',
        topik12Title: 'TOPIK Level 1~2',
        topik12Desc: 'Beginner Korean essential vocabulary',
        topik34Title: 'TOPIK Level 3~4',
        topik34Desc: 'Intermediate Korean essential vocabulary',
        topik56Title: 'TOPIK Level 5~6',
        topik56Desc: 'Advanced Korean essential vocabulary',
        comingSoon1: '🔒 Coming Soon',
        comingSoon2: '🔒 Coming Soon',
        comingSoon3: '🔒 Coming Soon',
        
        // collections.html
        englishStudyTitle: 'English Study',
        englishStudyDesc: 'Select your exam type',
        ieltsTitle: 'IELTS Vocabulary',
        ieltsDesc: 'Essential vocabulary for Band 5-7',
        ieltsStats: '1,050 words',
        ieltsLevels: '30 levels',
        toeicTitle: 'TOEIC Vocabulary',
        toeicDesc: 'Business English essential vocabulary',
        toeflTitle: 'TOEFL Vocabulary',
        toeflDesc: 'Academic English essential vocabulary',
        comingSoonToeic: '🔒 Coming Soon',
        comingSoonToefl: '🔒 Coming Soon'
    }
};

/**
 * 언어 설정
 */
function setLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (lang === 'ko') {
        const koBtn = document.getElementById('langKo');
        if (koBtn) koBtn.classList.add('active');
    } else {
        const enBtn = document.getElementById('langEn');
        if (enBtn) enBtn.classList.add('active');
    }
    
    // 페이지 텍스트 업데이트
    updatePageTexts(lang);
}

/**
 * 페이지 텍스트 업데이트
 */
function updatePageTexts(lang) {
    const texts = translations[lang];
    
    Object.keys(texts).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = texts[key];
        }
    });
}

/**
 * 페이지 로드 시 언어 설정 적용
 */
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
    
    // 언어 버튼 상태 업데이트
    if (savedLang === 'ko') {
        const koBtn = document.getElementById('langKo');
        if (koBtn) {
            koBtn.classList.add('active');
            const enBtn = document.getElementById('langEn');
            if (enBtn) enBtn.classList.remove('active');
        }
    } else {
        const enBtn = document.getElementById('langEn');
        if (enBtn) {
            enBtn.classList.add('active');
            const koBtn = document.getElementById('langKo');
            if (koBtn) koBtn.classList.remove('active');
        }
    }
    
    // 텍스트 업데이트
    updatePageTexts(savedLang);
});

/**
 * 이슈 신고 모달 표시
 */
function showIssueReport() {
    document.getElementById('issueModal').classList.add('show');
}

/**
 * 이슈 신고 모달 닫기
 */
function closeIssueReport() {
    document.getElementById('issueModal').classList.remove('show');
}