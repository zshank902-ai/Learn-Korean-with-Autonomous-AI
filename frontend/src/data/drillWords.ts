export interface DrillWord {
  id: string;
  korean: string;
  romanization: string;
  meaning: string;
  difficulty: 1 | 2 | 3;
  sttVariants: string[];
  syllableCount: number;
  pronunciationTip?: string;
}

export const DRILL_WORDS: DrillWord[] = [
  // TIER 1 — Single/double syllable (difficulty: 1)
  { id: 'w_1_1', korean: '가', romanization: 'ga', meaning: 'A basic syllable', difficulty: 1, syllableCount: 1, sttVariants: ['가', '다', '바'] },
  { id: 'w_1_2', korean: '나', romanization: 'na', meaning: 'I / me', difficulty: 1, syllableCount: 1, sttVariants: ['나', '라', '마'] },
  { id: 'w_1_3', korean: '다', romanization: 'da', meaning: 'All / everything', difficulty: 1, syllableCount: 1, sttVariants: ['다', '타', '가'] },
  { id: 'w_1_4', korean: '물', romanization: 'mul', meaning: 'Water', difficulty: 1, syllableCount: 1, sttVariants: ['물', '불'] },
  { id: 'w_1_5', korean: '밥', romanization: 'bap', meaning: 'Rice / meal', difficulty: 1, syllableCount: 1, sttVariants: ['밥', '밤', '법'] },
  { id: 'w_1_6', korean: '집', romanization: 'jip', meaning: 'House', difficulty: 1, syllableCount: 1, sttVariants: ['집', '짐', '칩'] },
  { id: 'w_1_7', korean: '책', romanization: 'chaek', meaning: 'Book', difficulty: 1, syllableCount: 1, sttVariants: ['책', '척', '채'] },
  { id: 'w_1_8', korean: '손', romanization: 'son', meaning: 'Hand', difficulty: 1, syllableCount: 1, sttVariants: ['손', '선', '솜'] },
  { id: 'w_1_9', korean: '눈', romanization: 'nun', meaning: 'Eye / snow', difficulty: 1, syllableCount: 1, sttVariants: ['눈', '은'] },
  { id: 'w_1_10', korean: '입', romanization: 'ip', meaning: 'Mouth', difficulty: 1, syllableCount: 1, sttVariants: ['입', '잎', '임'] },

  // TIER 2 — 2-3 syllable common words (difficulty: 2)
  { id: 'w_2_1', korean: '한국', romanization: 'han-guk', meaning: 'Korea', difficulty: 2, syllableCount: 2, sttVariants: ['한국', '항국', '한 국'] },
  { id: 'w_2_2', korean: '사랑', romanization: 'sa-rang', meaning: 'Love', difficulty: 2, syllableCount: 2, sttVariants: ['사랑', '사 랑', '사람'] },
  { id: 'w_2_3', korean: '학교', romanization: 'hak-gyo', meaning: 'School', difficulty: 2, syllableCount: 2, sttVariants: ['학교', '하꾜', '학 교'] },
  { id: 'w_2_4', korean: '친구', romanization: 'chin-gu', meaning: 'Friend', difficulty: 2, syllableCount: 2, sttVariants: ['친구', '칭구', '친 구'] },
  { id: 'w_2_5', korean: '음식', romanization: 'eum-sik', meaning: 'Food', difficulty: 2, syllableCount: 2, sttVariants: ['음식', '음 식'] },
  { id: 'w_2_6', korean: '가방', romanization: 'ga-bang', meaning: 'Bag', difficulty: 2, syllableCount: 2, sttVariants: ['가방', '가 방', '카방'] },
  { id: 'w_2_7', korean: '의자', romanization: 'ui-ja', meaning: 'Chair', difficulty: 2, syllableCount: 2, sttVariants: ['의자', '으자', '이자', '의 자'] },
  { id: 'w_2_8', korean: '사과', romanization: 'sa-gwa', meaning: 'Apple', difficulty: 2, syllableCount: 2, sttVariants: ['사과', '사 과', '사고'] },
  { id: 'w_2_9', korean: '전화', romanization: 'jeon-hwa', meaning: 'Phone', difficulty: 2, syllableCount: 2, sttVariants: ['전화', '저나', '전 화'] },
  { id: 'w_2_10', korean: '공부', romanization: 'gong-bu', meaning: 'Study', difficulty: 2, syllableCount: 2, sttVariants: ['공부', '공 부', '곰부'] },

  // TIER 3 — 3-4 syllable phrases (difficulty: 3)
  { id: 'w_3_1', korean: '안녕하세요', romanization: 'an-nyeong-ha-se-yo', meaning: 'Hello (formal)', difficulty: 3, syllableCount: 5, sttVariants: ['안녕하세요', '안녕 하세요', '안녕 하세 요', '안녕하새요'] },
  { id: 'w_3_2', korean: '감사합니다', romanization: 'gam-sa-ham-ni-da', meaning: 'Thank you', difficulty: 3, syllableCount: 5, sttVariants: ['감사합니다', '감사 합니다', '감사함니다', '감사합니 다'], pronunciationTip: "Tip: The 'ㅂ' before 'ㄴ' sounds like 'm' — 감사함니다" },
  { id: 'w_3_3', korean: '괜찮아요', romanization: 'gwaen-chan-a-yo', meaning: "It's okay", difficulty: 3, syllableCount: 4, sttVariants: ['괜찮아요', '괜차나요', '괜찮 아요', '괸찮아요'] },
  { id: 'w_3_4', korean: '어디예요', romanization: 'eo-di-ye-yo', meaning: 'Where is it', difficulty: 3, syllableCount: 4, sttVariants: ['어디예요', '어디에요', '어디 예요'] },
  { id: 'w_3_5', korean: '뭐예요', romanization: 'mwo-ye-yo', meaning: 'What is it', difficulty: 3, syllableCount: 3, sttVariants: ['뭐예요', '머예요', '뭐 에요', '뭐에요'] },
  { id: 'w_3_6', korean: '얼마예요', romanization: 'eol-ma-ye-yo', meaning: 'How much', difficulty: 3, syllableCount: 4, sttVariants: ['얼마예요', '얼마에요', '얼마 예요'] },
  { id: 'w_3_7', korean: '화장실', romanization: 'hwa-jang-sil', meaning: 'Bathroom', difficulty: 3, syllableCount: 3, sttVariants: ['화장실', '화장 실', '하장실'] },
  { id: 'w_3_8', korean: '맛있어요', romanization: 'ma-sis-seo-yo', meaning: 'Delicious', difficulty: 3, syllableCount: 4, sttVariants: ['맛있어요', '마시써요', '맛 있어요'] },
  { id: 'w_3_9', korean: '모르겠어요', romanization: 'mo-reu-ges-seo-yo', meaning: "I don't know", difficulty: 3, syllableCount: 5, sttVariants: ['모르겠어요', '모르겠 어요', '모르개써요'] },
  { id: 'w_3_10', korean: '잘 부탁해요', romanization: 'jal bu-tak-hae-yo', meaning: 'Please take care of me', difficulty: 3, syllableCount: 5, sttVariants: ['잘 부탁해요', '잘부탁해요', '잘부타캐요', '잘 부탁 해요'] }
];
