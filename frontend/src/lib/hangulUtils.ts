// src/lib/hangulUtils.ts

export const CHO_SEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const JUNG_SEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const JONG_SEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const HANGUL_START = 0xAC00;

export function composeHangul(cho: string, jung: string, jong: string = ''): string {
  const choIndex = CHO_SEONG.indexOf(cho);
  const jungIndex = JUNG_SEONG.indexOf(jung);
  const jongIndex = JONG_SEONG.indexOf(jong);

  if (choIndex === -1 || jungIndex === -1) return '';

  // Ensure jongIndex is 0 if jong is not found or empty
  const validJongIndex = jongIndex === -1 ? 0 : jongIndex;

  const code = HANGUL_START + (choIndex * 21 * 28) + (jungIndex * 28) + validJongIndex;
  return String.fromCharCode(code);
}

export function isCho(char: string): boolean {
  return CHO_SEONG.includes(char);
}

export function isJung(char: string): boolean {
  return JUNG_SEONG.includes(char);
}

export function isJong(char: string): boolean {
  return JONG_SEONG.includes(char);
}
