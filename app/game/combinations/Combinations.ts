export interface Combination {
  result: string;
  resultEmoji: string;
  resultColor: number;
  materials: string[];
  description: string;
}

export const COMBINATIONS: Combination[] = [
  // ── 안흔함 (흔함 2종 조합) ──────────────────────────────
  { result: '황정기',        resultEmoji: '👑', resultColor: 0xf1c40f, materials: ['최상호', '노태현'],  description: '최상호 + 노태현' },
  { result: '박준희',        resultEmoji: '🎯', resultColor: 0x27ae60, materials: ['노태현', '문필환'],  description: '노태현 + 문필환' },
  { result: '김경현',        resultEmoji: '🌊', resultColor: 0x2980b9, materials: ['양재모', '박민수'],  description: '양재모 + 박민수' },
  { result: '김민준',        resultEmoji: '⚡', resultColor: 0xe74c3c, materials: ['강주혁', '박민석'],  description: '강주혁 + 박민석' },
  { result: '김용태',        resultEmoji: '🔥', resultColor: 0x8e44ad, materials: ['강재규', '박민석'],  description: '강재규 + 박민석' },
  { result: '신문철',        resultEmoji: '🌀', resultColor: 0x16a085, materials: ['박민석', '임장혁'],  description: '박민석 + 임장혁' },
  { result: '김수빈',        resultEmoji: '🌸', resultColor: 0xd35400, materials: ['문필환', '최상호'],  description: '문필환 + 최상호' },
  { result: '이재윤',        resultEmoji: '🌙', resultColor: 0x2c3e50, materials: ['박민수', '문필환'],  description: '박민수 + 문필환' },
  { result: '엄태웅',        resultEmoji: '🦁', resultColor: 0xe67e22, materials: ['임장혁', '양재모'],  description: '임장혁 + 양재모' },
  { result: '알라',          resultEmoji: '🌙', resultColor: 0xf39c12, materials: ['강주혁', '강주혁'],  description: '강주혁 × 2' },
  { result: '재규어',        resultEmoji: '🐆', resultColor: 0x9b59b6, materials: ['강재규', '강재규'],  description: '강재규 × 2' },
  { result: '쇼타',          resultEmoji: '✨', resultColor: 0xf1c40f, materials: ['문필환', '문필환'],  description: '문필환 × 2' },
  { result: '로이킴',        resultEmoji: '🎸', resultColor: 0x1abc9c, materials: ['박민수', '박민수'],  description: '박민수 × 2' },

  // ── 특별함 (흔함 × 3 / 안흔함 조합) ────────────────────
  { result: '최상호 일진',      resultEmoji: '😈', resultColor: 0xe74c3c, materials: ['최상호', '최상호', '최상호'],  description: '최상호 × 3' },
  { result: '노태현 노티',      resultEmoji: '🎩', resultColor: 0x3498db, materials: ['노태현', '노태현', '노태현'],  description: '노태현 × 3' },
  { result: '양재모 늑대',      resultEmoji: '🐺', resultColor: 0x2ecc71, materials: ['양재모', '양재모', '양재모'],  description: '양재모 × 3' },
  { result: '박민석 빡빡이',    resultEmoji: '💀', resultColor: 0x1abc9c, materials: ['박민석', '박민석', '박민석'],  description: '박민석 × 3' },
  { result: '임장혁 장애인',    resultEmoji: '⚡', resultColor: 0x8e44ad, materials: ['임장혁', '임장혁', '임장혁'],  description: '임장혁 × 3' },
  { result: '황정기 헝그리맨',  resultEmoji: '🍖', resultColor: 0xf1c40f, materials: ['황정기', '황정기', '박민석'],  description: '황정기 × 2 + 박민석' },
  { result: '임채준 따까리',    resultEmoji: '🐕', resultColor: 0xe67e22, materials: ['황정기', '로이킴', '최상호'],  description: '황정기 + 로이킴 + 최상호' },
  { result: '박기찬 야동마스터', resultEmoji: '📺', resultColor: 0xd35400, materials: ['박준희', '김용태', '최상호'],  description: '박준희 + 김용태 + 최상호' },
  { result: '이현빈 파파라치',  resultEmoji: '📷', resultColor: 0x27ae60, materials: ['박준희', '신문철', '임장혁'],  description: '박준희 + 신문철 + 임장혁' },
  { result: '조세민 이청용',    resultEmoji: '⚽', resultColor: 0x2980b9, materials: ['김경현', '박민수', '양재모'],  description: '김경현 + 박민수 + 양재모' },
  { result: '왕승환 왕싱싱',    resultEmoji: '👊', resultColor: 0xc0392b, materials: ['김경현', '김용태', '강주혁'],  description: '김경현 + 김용태 + 강주혁' },
  { result: '이병준 불법체류자',resultEmoji: '🚫', resultColor: 0x7f8c8d, materials: ['김민준', '최상호', '양재모'],  description: '김민준 + 최상호 + 양재모' },
  { result: '김정래 프로그래머',resultEmoji: '💻', resultColor: 0x2c3e50, materials: ['김민준', '재규어', '강주혁'],  description: '김민준 + 재규어 + 강주혁' },
  { result: '김용태 흑화',      resultEmoji: '🖤', resultColor: 0x1a1a2e, materials: ['김용태', '김용태'],            description: '김용태 × 2' },
  { result: '이정범 벨튀선구자',resultEmoji: '🏃', resultColor: 0x6c3483, materials: ['김용태', '엄태웅', '노태현'],  description: '김용태 + 엄태웅 + 노태현' },
  { result: '유재헌 피망',      resultEmoji: '🌶️', resultColor: 0xc0392b, materials: ['신문철', '김경현', '최상호'],  description: '신문철 + 김경현 + 최상호' },
  { result: '주영호 마마보이',  resultEmoji: '👩', resultColor: 0x16a085, materials: ['신문철', '황정기', '강재규'],  description: '신문철 + 황정기 + 강재규' },
  { result: '고우선 전정실부인',resultEmoji: '💍', resultColor: 0xe91e63, materials: ['김수빈', '박준희', '노태현'],  description: '김수빈 + 박준희 + 노태현' },
  { result: '이지원 음지소녀',  resultEmoji: '🌑', resultColor: 0x4a235a, materials: ['김수빈', '쇼타', '최상호'],    description: '김수빈 + 쇼타 + 최상호' },
  { result: '서아인 사이코패스',resultEmoji: '🔪', resultColor: 0x922b21, materials: ['이재윤', '엄태웅', '노태현'],  description: '이재윤 + 엄태웅 + 노태현' },
  { result: '박예원 성대결절',  resultEmoji: '🎤', resultColor: 0x9b59b6, materials: ['이재윤', '김수빈', '강재규'],  description: '이재윤 + 김수빈 + 강재규' },
  { result: '조성진 작은메주',  resultEmoji: '🍡', resultColor: 0x795548, materials: ['엄태웅', '알라', '임장혁'],    description: '엄태웅 + 알라 + 임장혁' },
  { result: '박진웅 축구의달인',resultEmoji: '⚽', resultColor: 0x27ae60, materials: ['엄태웅', '김경현', '박민수'],  description: '엄태웅 + 김경현 + 박민수' },
  { result: '노건완 노가리',    resultEmoji: '🐟', resultColor: 0x3498db, materials: ['알라', '황정기', '임장혁'],    description: '알라 + 황정기 + 임장혁' },
  { result: '최동준 구일톱블랙홀',resultEmoji:'🕳️',resultColor:0x0d0d0d, materials: ['알라', '엄태웅', '양재모'],    description: '알라 + 엄태웅 + 양재모' },
  { result: '강주혁 코알라',    resultEmoji: '🐨', resultColor: 0x7b9e87, materials: ['알라', '알라'],                description: '알라 × 2' },
  { result: '정승준 저승사자',  resultEmoji: '💀', resultColor: 0x2c2c2c, materials: ['재규어', '이재윤', '임장혁'],  description: '재규어 + 이재윤 + 임장혁' },
  { result: '배성령 해커',      resultEmoji: '💾', resultColor: 0x00ff41, materials: ['재규어', '노태현', '양재모'],  description: '재규어 + 노태현 + 양재모' },
  { result: '김태영 일베조무사',resultEmoji: '🤡', resultColor: 0xff6b35, materials: ['쇼타', '알라', '노태현'],      description: '쇼타 + 알라 + 노태현' },
  { result: '최준우 원조렝가',  resultEmoji: '🧱', resultColor: 0xd4a017, materials: ['쇼타', '김민준', '강재규'],    description: '쇼타 + 김민준 + 강재규' },
  { result: '송형성 틱장애',    resultEmoji: '💥', resultColor: 0xff4500, materials: ['로이킴', '박준희', '강재규'],  description: '로이킴 + 박준희 + 강재규' },
  { result: '박민수 루키인싸',  resultEmoji: '😎', resultColor: 0x00bcd4, materials: ['로이킴', '김경현', '양재모'],  description: '로이킴 + 김경현 + 양재모' },
  { result: '조도연 좆돼지',    resultEmoji: '🐷', resultColor: 0xff69b4, materials: ['이호준 볼보이', '이호준 볼보이', '이호준 볼보이', '최상호'], description: '이호준 볼보이 × 3 + 최상호' },
  { result: '이승우 악의근원',  resultEmoji: '😤', resultColor: 0xff0000, materials: ['박민수 루키인싸', '송형성 틱장애', '박예원 성대결절'], description: '박민수 루키인싸 + 송형성 틱장애 + 박예원 성대결절' },

  // ── 희귀함 (특별함 조합) ────────────────────────────────
  { result: '최상호 윤식파의두뇌',  resultEmoji: '🧠', resultColor: 0xe74c3c, materials: ['최상호 일진', '임채준 따까리', '황정기 헝그리맨'],        description: '최상호 일진 + 임채준 따까리 + 황정기 헝그리맨' },
  { result: '최상호 오타쿠의길',    resultEmoji: '🎌', resultColor: 0xff6b6b, materials: ['최상호 일진', '양재모 늑대', '이지원 음지소녀'],            description: '최상호 일진 + 양재모 늑대 + 이지원 음지소녀' },
  { result: '노태현 노짱',          resultEmoji: '🎩', resultColor: 0x3498db, materials: ['노태현 노티', '최준우 원조렝가', '고우선 전정실부인'],       description: '노태현 노티 + 최준우 원조렝가 + 고우선 전정실부인' },
  { result: '양재모 상호파의개',    resultEmoji: '🐕', resultColor: 0x2ecc71, materials: ['양재모 늑대', '조세민 이청용', '유재헌 피망'],               description: '양재모 늑대 + 조세민 이청용 + 유재헌 피망' },
  { result: '두유찬 차가운젖꼭지',  resultEmoji: '🥛', resultColor: 0x95a5a6, materials: ['박민석 빡빡이', '왕승환 왕싱싱', '황정기 헝그리맨'],        description: '박민석 빡빡이 + 왕승환 왕싱싱 + 황정기 헝그리맨' },
  { result: '엄태웅 엄티',          resultEmoji: '🦁', resultColor: 0xe67e22, materials: ['임장혁 장애인', '양재모 늑대', '서아인 사이코패스'],          description: '임장혁 장애인 + 양재모 늑대 + 서아인 사이코패스' },
  { result: '황준석 구일외교관',    resultEmoji: '🤝', resultColor: 0x1abc9c, materials: ['임장혁 장애인', '박진웅 축구의달인', '조도연 좆돼지'],       description: '임장혁 장애인 + 박진웅 축구의달인 + 조도연 좆돼지' },
  { result: '이용민 만삭',          resultEmoji: '🤰', resultColor: 0xf39c12, materials: ['황정기 헝그리맨', '노건완 노가리', '송형성 틱장애'],          description: '황정기 헝그리맨 + 노건완 노가리 + 송형성 틱장애' },
  { result: '강보명 과거의그림자',  resultEmoji: '👤', resultColor: 0x7f8c8d, materials: ['임채준 따까리', '서아인 사이코패스', '이정범 벨튀선구자'],    description: '임채준 따까리 + 서아인 사이코패스 + 이정범 벨튀선구자' },
  { result: '박기찬 DDR의권위자',   resultEmoji: '🕹️', resultColor: 0xd35400, materials: ['박기찬 야동마스터', '노태현 노티', '송형성 틱장애'],          description: '박기찬 야동마스터 + 노태현 노티 + 송형성 틱장애' },
  { result: '노수신 말파이트보법장인',resultEmoji:'🪨', resultColor: 0x6c3483, materials: ['이현빈 파파라치', '주영호 마마보이', '박진웅 축구의달인'],    description: '이현빈 파파라치 + 주영호 마마보이 + 박진웅 축구의달인' },
  { result: '임채민 채민파리더',    resultEmoji: '👔', resultColor: 0x2980b9, materials: ['조세민 이청용', '왕승환 왕싱싱', '박민수 루키인싸'],           description: '조세민 이청용 + 왕승환 왕싱싱 + 박민수 루키인싸' },
  { result: '김경현 야구부주장',    resultEmoji: '⚾', resultColor: 0x27ae60, materials: ['왕승환 왕싱싱', '최준우 원조렝가', '주영호 마마보이'],         description: '왕승환 왕싱싱 + 최준우 원조렝가 + 주영호 마마보이' },
  { result: '배병규 아랍왕자',      resultEmoji: '🤴', resultColor: 0xf1c40f, materials: ['이병준 불법체류자', '양재모 늑대', '왕승환 왕싱싱'],           description: '이병준 불법체류자 + 양재모 늑대 + 왕승환 왕싱싱' },
  { result: '박수찬 심각한로리콘',  resultEmoji: '😳', resultColor: 0xff69b4, materials: ['이병준 불법체류자', '김정래 프로그래머', '박기찬 야동마스터'], description: '이병준 불법체류자 + 김정래 프로그래머 + 박기찬 야동마스터' },
  { result: '김정래 은석패밀리해체자',resultEmoji:'💣', resultColor: 0x2c3e50, materials: ['김정래 프로그래머', '박예원 성대결절', '이지원 음지소녀'],    description: '김정래 프로그래머 + 박예원 성대결절 + 이지원 음지소녀' },
  { result: '김만경 구일단속반',    resultEmoji: '🚔', resultColor: 0x1a1a2e, materials: ['김용태 흑화', '임채준 따까리', '주영호 마마보이'],             description: '김용태 흑화 + 임채준 따까리 + 주영호 마마보이' },
  { result: '이태훈 폭군',          resultEmoji: '👑', resultColor: 0x8e44ad, materials: ['김용태 흑화', '이병준 불법체류자', '박민석 빡빡이'],           description: '김용태 흑화 + 이병준 불법체류자 + 박민석 빡빡이' },
  { result: '윤현모 비지니스',      resultEmoji: '💼', resultColor: 0x16a085, materials: ['이정범 벨튀선구자', '황정기 헝그리맨', '조세민 이청용'],       description: '이정범 벨튀선구자 + 황정기 헝그리맨 + 조세민 이청용' },
  { result: '장태영 경찰을꿈꾸는샛별',resultEmoji:'⭐', resultColor: 0x3498db, materials: ['이정범 벨튀선구자', '노건완 노가리', '조성진 작은메주'],       description: '이정범 벨튀선구자 + 노건완 노가리 + 조성진 작은메주' },
  { result: '유재헌 토토교수',      resultEmoji: '🎓', resultColor: 0xc0392b, materials: ['유재헌 피망', '최상호 일진', '강주혁 코알라'],                 description: '유재헌 피망 + 최상호 일진 + 강주혁 코알라' },
  { result: '최현우 마술사',        resultEmoji: '🎩', resultColor: 0x9b59b6, materials: ['유재헌 피망', '주영호 마마보이', '조도연 좆돼지', '신문철'],   description: '유재헌 피망 + 주영호 마마보이 + 조도연 좆돼지 + 신문철' },
  { result: '이재윤 논란의중심',    resultEmoji: '📢', resultColor: 0xe74c3c, materials: ['서아인 사이코패스', '정승준 저승사자', '박민수 루키인싸'],      description: '서아인 사이코패스 + 정승준 저승사자 + 박민수 루키인싸' },
  { result: '배현진 퀸카',          resultEmoji: '👸', resultColor: 0xe91e63, materials: ['고우선 전정실부인', '이현빈 파파라치', '이정범 벨튀선구자'],    description: '고우선 전정실부인 + 이현빈 파파라치 + 이정범 벨튀선구자' },
  { result: '고어진 분노조절장애',  resultEmoji: '😤', resultColor: 0xd32f2f, materials: ['고우선 전정실부인', '최동준 구일톱블랙홀', '박민석 빡빡이'],   description: '고우선 전정실부인 + 최동준 구일톱블랙홀 + 박민석 빡빡이' },
  { result: '정내연 그림쟁이',      resultEmoji: '🎨', resultColor: 0x4a235a, materials: ['이지원 음지소녀', '노건완 노가리', '임장혁 장애인'],            description: '이지원 음지소녀 + 노건완 노가리 + 임장혁 장애인' },
  { result: '서민성 정글설계사',    resultEmoji: '🌿', resultColor: 0x1a5276, materials: ['주영호 마마보이', '정승준 저승사자', '박민석 빡빡이'],          description: '주영호 마마보이 + 정승준 저승사자 + 박민석 빡빡이' },
  { result: '조현규 피즈',          resultEmoji: '🎪', resultColor: 0x00bcd4, materials: ['조성진 작은메주', '왕승환 왕싱싱', '배성령 해커'],              description: '조성진 작은메주 + 왕승환 왕싱싱 + 배성령 해커' },
  { result: '선효진 프로고백러',    resultEmoji: '💌', resultColor: 0xff80ab, materials: ['박진웅 축구의달인', '이병준 불법체류자', '이현빈 파파라치'],    description: '박진웅 축구의달인 + 이병준 불법체류자 + 이현빈 파파라치' },
  { result: '이상혁 거권',          resultEmoji: '✊', resultColor: 0x37474f, materials: ['조도연 좆돼지', '최동준 구일톱블랙홀', '배성령 해커', '김용태'], description: '조도연 좆돼지 + 최동준 구일톱블랙홀 + 배성령 해커 + 김용태' },
  { result: '현성현 모범생',        resultEmoji: '📚', resultColor: 0x1abc9c, materials: ['노건완 노가리', '고우선 전정실부인', '김정래 프로그래머'],       description: '노건완 노가리 + 고우선 전정실부인 + 김정래 프로그래머' },
  { result: '구주호 조성진스승',    resultEmoji: '🎹', resultColor: 0x795548, materials: ['최동준 구일톱블랙홀', '조성진 작은메주', '임장혁 장애인'],      description: '최동준 구일톱블랙홀 + 조성진 작은메주 + 임장혁 장애인' },
  { result: '박도진 거인학살자',    resultEmoji: '🗡️', resultColor: 0x922b21, materials: ['최동준 구일톱블랙홀', '김용태 흑화', '박진웅 축구의달인'],      description: '최동준 구일톱블랙홀 + 김용태 흑화 + 박진웅 축구의달인' },
  { result: '강주혁 악동',          resultEmoji: '🐨', resultColor: 0x7b9e87, materials: ['강주혁 코알라', '박민수 루키인싸', '노태현 노티'],               description: '강주혁 코알라 + 박민수 루키인싸 + 노태현 노티' },
  { result: '강재규 뒤틀린사랑',    resultEmoji: '💔', resultColor: 0x9c27b0, materials: ['정승준 저승사자', '최준우 원조렝가', '배성령 해커'],             description: '정승준 저승사자 + 최준우 원조렝가 + 배성령 해커' },
  { result: '이은엽 드럼신동',      resultEmoji: '🥁', resultColor: 0xff5722, materials: ['정승준 저승사자', '김정래 프로그래머', '조세민 이청용'],         description: '정승준 저승사자 + 김정래 프로그래머 + 조세민 이청용' },
  { result: '배성령 CY창설자',      resultEmoji: '💾', resultColor: 0x00e676, materials: ['배성령 해커', '이병준 불법체류자', '서아인 사이코패스'],          description: '배성령 해커 + 이병준 불법체류자 + 서아인 사이코패스' },
  { result: '박은석 은석패밀리두목',resultEmoji: '🕴️', resultColor: 0x212121, materials: ['김태영 일베조무사', '박기찬 야동마스터', '이정범 벨튀선구자'],   description: '김태영 일베조무사 + 박기찬 야동마스터 + 이정범 벨튀선구자' },
  { result: '김청운 애국보수',      resultEmoji: '🇰🇷', resultColor: 0x003087, materials: ['김태영 일베조무사', '이현빈 파파라치', '강주혁 코알라'],         description: '김태영 일베조무사 + 이현빈 파파라치 + 강주혁 코알라' },
  { result: '김기연 시조의게이',    resultEmoji: '🏳️‍🌈', resultColor: 0xff6b9d, materials: ['최준우 원조렝가', '김태영 일베조무사', '이지원 음지소녀'],      description: '최준우 원조렝가 + 김태영 일베조무사 + 이지원 음지소녀' },
  { result: '장하민 캐나다갱단',    resultEmoji: '🍁', resultColor: 0xff3d00, materials: ['송형성 틱장애', '임채준 따까리', '고우선 전정실부인'],            description: '송형성 틱장애 + 임채준 따까리 + 고우선 전정실부인' },
  { result: '박민수 슈퍼인싸',      resultEmoji: '🌟', resultColor: 0xffd600, materials: ['박민수 루키인싸', '송형성 틱장애', '박예원 성대결절'],            description: '박민수 루키인싸 + 송형성 틱장애 + 박예원 성대결절' },

  // ── 전설적인 (희귀함 조합) ──────────────────────────────
  { result: '최상호 상호파수장',      resultEmoji: '⚔️',  resultColor: 0xff1744, materials: ['최상호 윤식파의두뇌', '노태현 노짱', '김만경 구일단속반'],                description: '최상호 윤식파의두뇌 + 노태현 노짱 + 김만경 구일단속반' },
  { result: '노태현 사회복무요원',    resultEmoji: '🪖',  resultColor: 0x1565c0, materials: ['노태현 노짱', '강주혁 악동', '김정래 은석패밀리해체자'],                   description: '노태현 노짱 + 강주혁 악동 + 김정래 은석패밀리해체자' },
  { result: '양재모 상호파비밀병기',  resultEmoji: '🐺',  resultColor: 0x00c853, materials: ['양재모 상호파의개', '최상호 윤식파의두뇌', '박도진 거인학살자'],             description: '양재모 상호파의개 + 최상호 윤식파의두뇌 + 박도진 거인학살자' },
  { result: '정준영 준영파보스',      resultEmoji: '💎',  resultColor: 0xaa00ff, materials: ['두유찬 차가운젖꼭지', '임채민 채민파리더', '배병규 아랍왕자'],               description: '두유찬 차가운젖꼭지 + 임채민 채민파리더 + 배병규 아랍왕자' },
  { result: '엄태웅 짱스파최대전력', resultEmoji: '⚡',  resultColor: 0xff6d00, materials: ['엄태웅 엄티', '김경현 야구부주장', '고어진 분노조절장애'],                    description: '엄태웅 엄티 + 김경현 야구부주장 + 고어진 분노조절장애' },
  { result: '이유선 페미니스트',      resultEmoji: '♀️',  resultColor: 0xe91e63, materials: ['황준석 구일외교관', '김청운 애국보수', '현성현 모범생'],                      description: '황준석 구일외교관 + 김청운 애국보수 + 현성현 모범생' },
  { result: '임채현 호모사피엔스',    resultEmoji: '🦴',  resultColor: 0xbdbdbd, materials: ['강보명 과거의그림자', '이재윤 논란의중심', '장태영 경찰을꿈꾸는샛별'],        description: '강보명 과거의그림자 + 이재윤 논란의중심 + 장태영 경찰을꿈꾸는샛별' },
  { result: '박병규 세상물정모르는도련님',resultEmoji:'🎻',resultColor:0xf8bbd0, materials: ['노수신 말파이트보법장인', '선효진 프로고백러', '따릉이'],                      description: '노수신 말파이트보법장인 + 선효진 프로고백러 + 따릉이' },
  { result: '임채민 교회파리더',      resultEmoji: '✝️',  resultColor: 0x0288d1, materials: ['임채민 채민파리더', '윤현모 비지니스', '이재윤 논란의중심'],                   description: '임채민 채민파리더 + 윤현모 비지니스 + 이재윤 논란의중심' },
  { result: '박민석 혹독한요리사',    resultEmoji: '👨‍🍳', resultColor: 0xff8f00, materials: ['배병규 아랍왕자', '윤현모 비지니스', '양재모 상호파의개'],                     description: '배병규 아랍왕자 + 윤현모 비지니스 + 양재모 상호파의개' },
  { result: '홍인창 고슴도치',        resultEmoji: '🦔',  resultColor: 0xa1887f, materials: ['배병규 아랍왕자', '노태현 노짱', '유재헌 토토교수'],                          description: '배병규 아랍왕자 + 노태현 노짱 + 유재헌 토토교수' },
  { result: '김정래 전교회장',        resultEmoji: '🏆',  resultColor: 0xffd700, materials: ['김정래 은석패밀리해체자', '이은엽 드럼신동', '박수찬 심각한로리콘'],           description: '김정래 은석패밀리해체자 + 이은엽 드럼신동 + 박수찬 심각한로리콘' },
  { result: '정윤식 SM설립자',        resultEmoji: '🎤',  resultColor: 0x880e4f, materials: ['김만경 구일단속반', '이태훈 폭군', '김경현 야구부주장'],                       description: '김만경 구일단속반 + 이태훈 폭군 + 김경현 야구부주장' },
  { result: '김민규 미래를보는눈',    resultEmoji: '👁️',  resultColor: 0x1a237e, materials: ['유재헌 토토교수', '최현우 마술사', '김청운 애국보수'],                         description: '유재헌 토토교수 + 최현우 마술사 + 김청운 애국보수' },
  { result: '신문철 장난꾸러기',      resultEmoji: '😜',  resultColor: 0x76ff03, materials: ['최현우 마술사', '박은석 은석패밀리두목', '서민성 정글설계사'],                  description: '최현우 마술사 + 박은석 은석패밀리두목 + 서민성 정글설계사' },
  { result: '이재윤 이중인격',        resultEmoji: '🎭',  resultColor: 0x6a1b9a, materials: ['이재윤 논란의중심', '박민수 슈퍼인싸', '두유찬 차가운젖꼭지'],                  description: '이재윤 논란의중심 + 박민수 슈퍼인싸 + 두유찬 차가운젖꼭지' },
  { result: '진연서 윤식파여장부',    resultEmoji: '👩‍⚔️', resultColor: 0xad1457, materials: ['배현진 퀸카', '박민수 슈퍼인싸', '고어진 분노조절장애'],                       description: '배현진 퀸카 + 박민수 슈퍼인싸 + 고어진 분노조절장애' },
  { result: '이현주 그분의애마',      resultEmoji: '🐎',  resultColor: 0x4e342e, materials: ['배현진 퀸카', '김만경 구일단속반', '장하민 캐나다갱단'],                        description: '배현진 퀸카 + 김만경 구일단속반 + 장하민 캐나다갱단' },
  { result: '이시원 일러스트레이터',  resultEmoji: '🖌️',  resultColor: 0x7b1fa2, materials: ['정내연 그림쟁이', '엄태웅 엄티', '황준석 구일외교관'],                          description: '정내연 그림쟁이 + 엄태웅 엄티 + 황준석 구일외교관' },
  { result: '김민준 초대마스터',      resultEmoji: '🏅',  resultColor: 0xc62828, materials: ['서민성 정글설계사', '강주혁 악동', '박민수 슈퍼인싸'],                          description: '서민성 정글설계사 + 강주혁 악동 + 박민수 슈퍼인싸' },
  { result: '김건 YM파행동대장',      resultEmoji: '🗡️',  resultColor: 0x263238, materials: ['조현규 피즈', '이상혁 거권', '두유찬 차가운젖꼭지', '조도연 좆돼지'],           description: '조현규 피즈 + 이상혁 거권 + 두유찬 차가운젖꼭지 + 조도연 좆돼지' },
  { result: '백기현 코끼리다리',      resultEmoji: '🐘',  resultColor: 0x546e7a, materials: ['이상혁 거권', '노태현 노짱', '박은석 은석패밀리두목'],                          description: '이상혁 거권 + 노태현 노짱 + 박은석 은석패밀리두목' },
  { result: '이일중 엄친아',          resultEmoji: '🌠',  resultColor: 0x00acc1, materials: ['현성현 모범생', '두유찬 차가운젖꼭지', '김정래 은석패밀리해체자'],               description: '현성현 모범생 + 두유찬 차가운젖꼭지 + 김정래 은석패밀리해체자' },
  { result: '구주호 희대의사기꾼',    resultEmoji: '🃏',  resultColor: 0x558b2f, materials: ['구주호 조성진스승', '현성현 모범생', '김기연 시조의게이'],                       description: '구주호 조성진스승 + 현성현 모범생 + 김기연 시조의게이' },
  { result: '임건웅 초대받지않은외부인',resultEmoji:'🚪', resultColor: 0x37474f, materials: ['박도진 거인학살자', '강주혁 악동', '이태훈 폭군'],                              description: '박도진 거인학살자 + 강주혁 악동 + 이태훈 폭군' },
  { result: '신지우 빅맘',            resultEmoji: '👑',  resultColor: 0xff6f00, materials: ['강재규 뒤틀린사랑', '박은석 은석패밀리두목', '이상혁 거권'],                     description: '강재규 뒤틀린사랑 + 박은석 은석패밀리두목 + 이상혁 거권' },
  { result: '임장혁 짱스파단장',      resultEmoji: '⚡',  resultColor: 0x4527a0, materials: ['배성령 CY창설자', '황준석 구일외교관', '구주호 조성진스승'],                     description: '배성령 CY창설자 + 황준석 구일외교관 + 구주호 조성진스승' },
  { result: '박은석 은석가족두목',    resultEmoji: '🕴️',  resultColor: 0x0d0d0d, materials: ['박은석 은석패밀리두목', '장하민 캐나다갱단', '강보명 과거의그림자'],             description: '박은석 은석패밀리두목 + 장하민 캐나다갱단 + 강보명 과거의그림자' },
  { result: '양문호 트위터노출남',    resultEmoji: '📱',  resultColor: 0x1da1f2, materials: ['김기연 시조의게이', '박기찬 DDR의권위자', '배현진 퀸카'],                        description: '김기연 시조의게이 + 박기찬 DDR의권위자 + 배현진 퀸카' },
  { result: '박성호 리플리증후군',    resultEmoji: '🎭',  resultColor: 0x37474f, materials: ['조현규 피즈', '유재헌 토토교수', '노수신 말파이트보법장인'],                      description: '조현규 피즈 + 유재헌 토토교수 + 노수신 말파이트보법장인' },
  { result: '김용태 되돌아온동료',    resultEmoji: '🔄',  resultColor: 0x00897b, materials: ['장하민 캐나다갱단', '양재모 상호파의개', '이상혁 거권'],                         description: '장하민 캐나다갱단 + 양재모 상호파의개 + 이상혁 거권' },
  { result: '박민수 윤식파오른팔',    resultEmoji: '💪',  resultColor: 0x039be5, materials: ['박민수 슈퍼인싸', '김경현 야구부주장', '최상호 윤식파의두뇌'],                    description: '박민수 슈퍼인싸 + 김경현 야구부주장 + 최상호 윤식파의두뇌' },
  { result: '이승우 구일의악을흩뿌린장본인',resultEmoji:'😈',resultColor:0xb71c1c, materials: ['이승우 악의근원', '윤현모 비지니스', '김용태 흑화'],                           description: '이승우 악의근원 + 윤현모 비지니스 + 김용태 흑화' },
];

export function getCombinationsForUnit(unitName: string): Combination[] {
  return COMBINATIONS.filter(c => c.materials[0] === unitName);
}

export function canCombine(combo: Combination, myUnits: any[]): boolean {
  const needed = [...combo.materials];
  for (const unit of myUnits) {
    const idx = needed.indexOf(unit.type.name);
    if (idx !== -1) needed.splice(idx, 1);
  }
  return needed.length === 0;
}