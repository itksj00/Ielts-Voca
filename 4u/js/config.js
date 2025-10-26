// ========== 시험 설정 ==========

window.EXAM_CONFIG = {
    // IELTS 설정
    ielts: {
        name: 'IELTS',
        type: 'english',
        difficulties: {
            5: { 
                name: 'Band 5', 
                description: '기본 수준의 실용 어휘',
                levels: 10,
                wordsPerLevel: 35
            },
            6: { 
                name: 'Band 6', 
                description: '중급 수준의 학술 어휘',
                levels: 10,
                wordsPerLevel: 35
            },
            7: { 
                name: 'Band 7', 
                description: '고급 수준의 전문 어휘',
                levels: 10,
                wordsPerLevel: 35
            }
        }
    },
    
    // TOPIK 설정
    topik: {
        name: 'TOPIK',
        type: 'korean',
        difficulties: {
            12: { 
                name: '1~2급', 
                description: '초급 한국어 필수 어휘',
                levels: 10,
                wordsPerLevel: 35
            },
            34: { 
                name: '3~4급', 
                description: '중급 한국어 필수 어휘',
                levels: 10,
                wordsPerLevel: 35
            },
            56: { 
                name: '5~6급', 
                description: '고급 한국어 필수 어휘',
                levels: 10,
                wordsPerLevel: 35
            },
            '6plus': { 
                name: '6급+', 
                description: '최상급 한국어 어휘 및 관용구',
                levels: 20,
                wordsPerLevel: 37
            }
        }
    }
};

/**
 * 시험 정보 가져오기
 */
function getExamConfig(exam, difficulty) {
    if (!window.EXAM_CONFIG[exam]) return null;
    if (difficulty && !window.EXAM_CONFIG[exam].difficulties[difficulty]) return null;
    
    if (difficulty) {
        return {
            ...window.EXAM_CONFIG[exam],
            currentDifficulty: window.EXAM_CONFIG[exam].difficulties[difficulty]
        };
    }
    
    return window.EXAM_CONFIG[exam];
}

/**
 * 레벨 키 생성
 */
function getLevelKey(exam, difficulty, level) {
    return `${exam}-${difficulty}-${level}`;
}

/**
 * 레벨 키 파싱
 */
function parseLevelKey(levelKey) {
    const parts = levelKey.split('-');
    return {
        exam: parts[0],
        difficulty: parts[1],
        level: parseInt(parts[2])
    };
}