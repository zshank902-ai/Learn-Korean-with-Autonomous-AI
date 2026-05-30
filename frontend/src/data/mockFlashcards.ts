import { FlashCard } from '@/store/useKMasteryStore';

export const MOCK_FLASHCARDS: FlashCard[] = [
  // TOPIK Level 1
  { id: '1', front: '안녕하세요', back: 'Hello', romanization: 'an-nyeong-ha-se-yo', example: { korean: '안녕하세요, 만나서 반갑습니다.', english: 'Hello, nice to meet you.' }, level: '1', interval: 0 },
  { id: '2', front: '감사합니다', back: 'Thank you', romanization: 'gam-sa-ham-ni-da', example: { korean: '도와주셔서 감사합니다.', english: 'Thank you for your help.' }, level: '1', interval: 0 },
  { id: '3', front: '사람', back: 'Person', romanization: 'sa-ram', example: { korean: '저 사람은 내 친구입니다.', english: 'That person is my friend.' }, level: '1', interval: 0 },
  { id: '4', front: '먹다', back: 'To eat', romanization: 'meok-da', example: { korean: '밥을 먹어요.', english: 'I eat a meal.' }, level: '1', interval: 0 },
  { id: '5', front: '학교', back: 'School', romanization: 'hak-gyo', example: { korean: '학교에 가요.', english: 'I go to school.' }, level: '1', interval: 0 },
  { id: '6', front: '오늘', back: 'Today', romanization: 'o-neul', example: { korean: '오늘은 날씨가 좋아요.', english: 'The weather is good today.' }, level: '1', interval: 0 },
  { id: '7', front: '물', back: 'Water', romanization: 'mul', example: { korean: '물을 마셔요.', english: 'I drink water.' }, level: '1', interval: 0 },
  { id: '8', front: '친구', back: 'Friend', romanization: 'chin-gu', example: { korean: '친구와 함께 영화를 봅니다.', english: 'I watch a movie with a friend.' }, level: '1', interval: 0 },

  // TOPIK Level 2
  { id: '9', front: '경험', back: 'Experience', romanization: 'gyeong-heom', example: { korean: '좋은 경험이었습니다.', english: 'It was a good experience.' }, level: '2', interval: 0 },
  { id: '10', front: '비행기', back: 'Airplane', romanization: 'bi-haeng-gi', example: { korean: '비행기를 타고 한국에 가요.', english: 'I go to Korea by airplane.' }, level: '2', interval: 0 },
  { id: '11', front: '도서관', back: 'Library', romanization: 'do-seo-gwan', example: { korean: '도서관에서 책을 빌렸어요.', english: 'I borrowed a book from the library.' }, level: '2', interval: 0 },
  { id: '12', front: '설명하다', back: 'To explain', romanization: 'seol-myeong-ha-da', example: { korean: '문제를 설명해 주세요.', english: 'Please explain the problem.' }, level: '2', interval: 0 },
  { id: '13', front: '준비하다', back: 'To prepare', romanization: 'jun-bi-ha-da', example: { korean: '시험을 준비하고 있어요.', english: 'I am preparing for an exam.' }, level: '2', interval: 0 },
  { id: '14', front: '여행', back: 'Travel / Trip', romanization: 'yeo-haeng', example: { korean: '제주도로 여행을 가요.', english: 'I go on a trip to Jeju Island.' }, level: '2', interval: 0 },
  { id: '15', front: '약속', back: 'Promise / Appointment', romanization: 'yak-sok', example: { korean: '내일 약속이 있어요.', english: 'I have an appointment tomorrow.' }, level: '2', interval: 0 },

  // TOPIK Level 3
  { id: '16', front: '결정하다', back: 'To decide', romanization: 'gyeol-jeong-ha-da', example: { korean: '진로를 결정했어요.', english: 'I decided my career path.' }, level: '3', interval: 0 },
  { id: '17', front: '해결하다', back: 'To solve / resolve', romanization: 'hae-gyeol-ha-da', example: { korean: '문제를 빨리 해결해야 합니다.', english: 'We must solve the problem quickly.' }, level: '3', interval: 0 },
  { id: '18', front: '환경', back: 'Environment', romanization: 'hwan-gyeong', example: { korean: '환경 보호가 중요합니다.', english: 'Environmental protection is important.' }, level: '3', interval: 0 },
  { id: '19', front: '책임', back: 'Responsibility', romanization: 'chaek-im', example: { korean: '자신의 행동에 책임을 져야 합니다.', english: 'You must take responsibility for your actions.' }, level: '3', interval: 0 },
  { id: '20', front: '발전하다', back: 'To develop / grow', romanization: 'bal-jeon-ha-da', example: { korean: '기술이 빠르게 발전하고 있습니다.', english: 'Technology is developing rapidly.' }, level: '3', interval: 0 },
];
