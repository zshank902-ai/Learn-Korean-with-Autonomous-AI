export interface JamoData {
  char: string;
  type: 'consonant' | 'vowel' | 'tense';
  romanization: string;
  ipa: string;
  name: string;
  mnemonic: string;
  exampleWord: string;
  position: {
    asChoseong: boolean;
    asJongseong: boolean;
  };
}

export const JAMO_DATA: JamoData[] = [
  // --- BASIC CONSONANTS (14) ---
  {
    char: 'ㄱ', type: 'consonant', romanization: 'g/k', ipa: '[k] or [ɡ]',
    name: '기역 (giyeok)', mnemonic: 'Shaped like a gun pointing right 🔫',
    exampleWord: '가방 (gabang - bag)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㄴ', type: 'consonant', romanization: 'n', ipa: '[n]',
    name: '니은 (nieun)', mnemonic: 'Looks like a nose 👃',
    exampleWord: '나비 (nabi - butterfly)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㄷ', type: 'consonant', romanization: 'd/t', ipa: '[t] or [d]',
    name: '디귿 (digeut)', mnemonic: 'Looks like a door 🚪',
    exampleWord: '다리 (dari - leg/bridge)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㄹ', type: 'consonant', romanization: 'r/l', ipa: '[ɾ] or [l]',
    name: '리을 (rieul)', mnemonic: 'Looks like a rattlesnake 🐍',
    exampleWord: '라면 (ramyeon - ramen)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅁ', type: 'consonant', romanization: 'm', ipa: '[m]',
    name: '미음 (mieum)', mnemonic: 'A square, like a mouth 👄',
    exampleWord: '물 (mul - water)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅂ', type: 'consonant', romanization: 'b/p', ipa: '[p] or [b]',
    name: '비읍 (bieup)', mnemonic: 'Looks like a bucket 🪣',
    exampleWord: '바지 (baji - pants)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅅ', type: 'consonant', romanization: 's', ipa: '[s] or [ɕ]',
    name: '시옷 (siot)', mnemonic: 'Looks like a summit or peak ⛰️',
    exampleWord: '사과 (sagwa - apple)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅇ', type: 'consonant', romanization: 'ng (silent start)', ipa: '[-] or [ŋ]',
    name: '이응 (ieung)', mnemonic: 'An empty circle (silent initial) ⭕',
    exampleWord: '우유 (uyu - milk)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅈ', type: 'consonant', romanization: 'j/ch', ipa: '[tɕ] or [dʑ]',
    name: '지읒 (jieut)', mnemonic: 'Looks like a jug 🏺',
    exampleWord: '자전거 (jajeongeo - bicycle)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅊ', type: 'consonant', romanization: 'ch\'', ipa: '[tɕʰ]',
    name: '치읓 (chieut)', mnemonic: 'A jug with a lid (ch) 🏺',
    exampleWord: '치마 (chima - skirt)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅋ', type: 'consonant', romanization: 'k\'', ipa: '[kʰ]',
    name: '키읔 (kieuk)', mnemonic: 'A gun with a kick 💥',
    exampleWord: '카메라 (kamera - camera)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅌ', type: 'consonant', romanization: 't\'', ipa: '[tʰ]',
    name: '티읕 (tieut)', mnemonic: 'Looks like a two-tine fork 🍴',
    exampleWord: '타조 (tajo - ostrich)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅍ', type: 'consonant', romanization: 'p\'', ipa: '[pʰ]',
    name: '피읖 (pieup)', mnemonic: 'Looks like a part of a piano 🎹',
    exampleWord: '포도 (podo - grape)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅎ', type: 'consonant', romanization: 'h', ipa: '[h]',
    name: '히읗 (hieut)', mnemonic: 'A head with a hat 🎩',
    exampleWord: '하늘 (haneul - sky)', position: { asChoseong: true, asJongseong: true }
  },

  // --- TENSE CONSONANTS (5) ---
  {
    char: 'ㄲ', type: 'tense', romanization: 'kk', ipa: '[k͈]',
    name: '쌍기역 (ssang-giyeok)', mnemonic: 'Double gun (kk) 🔫🔫',
    exampleWord: '꼬리 (kkori - tail)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㄸ', type: 'tense', romanization: 'tt', ipa: '[t͈]',
    name: '쌍디귿 (ssang-digeut)', mnemonic: 'Double door (tt) 🚪🚪',
    exampleWord: '딸기 (ttalgi - strawberry)', position: { asChoseong: true, asJongseong: false }
  },
  {
    char: 'ㅃ', type: 'tense', romanization: 'pp', ipa: '[p͈]',
    name: '쌍비읍 (ssang-bieup)', mnemonic: 'Double bucket (pp) 🪣🪣',
    exampleWord: '뿌리 (ppuri - root)', position: { asChoseong: true, asJongseong: false }
  },
  {
    char: 'ㅆ', type: 'tense', romanization: 'ss', ipa: '[s͈]',
    name: '쌍시옷 (ssang-siot)', mnemonic: 'Double peak (ss) ⛰️⛰️',
    exampleWord: '쓰레기 (sseuregi - trash)', position: { asChoseong: true, asJongseong: true }
  },
  {
    char: 'ㅉ', type: 'tense', romanization: 'jj', ipa: '[t͈ɕ]',
    name: '쌍지읒 (ssang-jieut)', mnemonic: 'Double jug (jj) 🏺🏺',
    exampleWord: '짜장면 (jjajangmyeon)', position: { asChoseong: true, asJongseong: false }
  },

  // --- BASIC VOWELS (10) ---
  {
    char: 'ㅏ', type: 'vowel', romanization: 'a', ipa: '[a]',
    name: '아 (a)', mnemonic: 'Man standing pointing out (a) ➡️',
    exampleWord: '아이 (ai - child)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅑ', type: 'vowel', romanization: 'ya', ipa: '[ja]',
    name: '야 (ya)', mnemonic: 'Two lines pointing out (ya) ➡️➡️',
    exampleWord: '야구 (yagu - baseball)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅓ', type: 'vowel', romanization: 'eo', ipa: '[ʌ]',
    name: '어 (eo)', mnemonic: 'Man standing pointing in (eo) ⬅️',
    exampleWord: '어머니 (eomeoni - mother)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅕ', type: 'vowel', romanization: 'yeo', ipa: '[jʌ]',
    name: '여 (yeo)', mnemonic: 'Two lines pointing in (yeo) ⬅️⬅️',
    exampleWord: '여우 (yeou - fox)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅗ', type: 'vowel', romanization: 'o', ipa: '[o]',
    name: '오 (o)', mnemonic: 'Pointing up, over (o) ⬆️',
    exampleWord: '오리 (ori - duck)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅛ', type: 'vowel', romanization: 'yo', ipa: '[jo]',
    name: '요 (yo)', mnemonic: 'Two lines pointing up (yo) ⬆️⬆️',
    exampleWord: '요리 (yori - cooking)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅜ', type: 'vowel', romanization: 'u', ipa: '[u]',
    name: '우 (u)', mnemonic: 'Pointing down, under (u) ⬇️',
    exampleWord: '우산 (usan - umbrella)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅠ', type: 'vowel', romanization: 'yu', ipa: '[ju]',
    name: '유 (yu)', mnemonic: 'Two lines pointing down (yu) ⬇️⬇️',
    exampleWord: '유리 (yuri - glass)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅡ', type: 'vowel', romanization: 'eu', ipa: '[ɯ]',
    name: '으 (eu)', mnemonic: 'Flat ground (eu) ➖',
    exampleWord: '은행 (eunhaeng - bank)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅣ', type: 'vowel', romanization: 'i', ipa: '[i]',
    name: '이 (i)', mnemonic: 'A standing tree (i) 🌳',
    exampleWord: '이름 (ireum - name)', position: { asChoseong: false, asJongseong: false }
  },

  // --- COMPOUND VOWELS (11) ---
  {
    char: 'ㅐ', type: 'vowel', romanization: 'ae', ipa: '[ɛ]',
    name: '애 (ae)', mnemonic: 'ㅏ + ㅣ = ae',
    exampleWord: '사과 (sagwa) wait no, 애기 (aegi - baby)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅒ', type: 'vowel', romanization: 'yae', ipa: '[jɛ]',
    name: '얘 (yae)', mnemonic: 'ㅑ + ㅣ = yae',
    exampleWord: '얘기 (yaegi - story)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅔ', type: 'vowel', romanization: 'e', ipa: '[e]',
    name: '에 (e)', mnemonic: 'ㅓ + ㅣ = e',
    exampleWord: '게 (ge - crab)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅖ', type: 'vowel', romanization: 'ye', ipa: '[je]',
    name: '예 (ye)', mnemonic: 'ㅕ + ㅣ = ye',
    exampleWord: '예의 (yeui - manners)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅘ', type: 'vowel', romanization: 'wa', ipa: '[wa]',
    name: '와 (wa)', mnemonic: 'ㅗ + ㅏ = wa',
    exampleWord: '과일 (gwail - fruit)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅙ', type: 'vowel', romanization: 'wae', ipa: '[wɛ]',
    name: '왜 (wae)', mnemonic: 'ㅗ + ㅐ = wae',
    exampleWord: '돼지 (dwaeji - pig)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅚ', type: 'vowel', romanization: 'oe', ipa: '[we] or [ø]',
    name: '외 (oe)', mnemonic: 'ㅗ + ㅣ = oe (sounds like we)',
    exampleWord: '회사 (hoesa - company)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅝ', type: 'vowel', romanization: 'wo', ipa: '[wʌ]',
    name: '워 (wo)', mnemonic: 'ㅜ + ㅓ = wo',
    exampleWord: '병원 (byeongwon - hospital)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅞ', type: 'vowel', romanization: 'we', ipa: '[we]',
    name: '웨 (we)', mnemonic: 'ㅜ + ㅔ = we',
    exampleWord: '웨이터 (weiteo - waiter)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅟ', type: 'vowel', romanization: 'wi', ipa: '[wi] or [y]',
    name: '위 (wi)', mnemonic: 'ㅜ + ㅣ = wi',
    exampleWord: '귀 (gwi - ear)', position: { asChoseong: false, asJongseong: false }
  },
  {
    char: 'ㅢ', type: 'vowel', romanization: 'ui', ipa: '[ɰi]',
    name: '의 (ui)', mnemonic: 'ㅡ + ㅣ = ui',
    exampleWord: '의사 (uisa - doctor)', position: { asChoseong: false, asJongseong: false }
  }
];
