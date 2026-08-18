export const cyrillicToGlagoliticMap = {
  А: 'Ⰰ', Б: 'Ⰱ', В: 'Ⰲ', Г: 'Ⰳ', Д: 'Ⰴ',
  Е: 'Ⰵ', Ё: 'Ⰵ', Ж: 'Ⰶ', З: 'Ⰸ', И: 'Ⰹ',
  Й: 'Ⰹ', К: 'Ⰽ', Л: 'Ⰾ', М: 'Ⰿ', Н: 'Ⱀ',
  О: 'Ⱁ', П: 'Ⱂ', Р: 'Ⱃ', С: 'Ⱄ', Т: 'Ⱅ',
  У: 'Ⱆ', Ф: 'Ⱇ', Х: 'Ⱈ', Ц: 'Ⱌ', Ч: 'Ⱍ',
  Ш: 'Ⱎ', Щ: 'Ⱋ', Ъ: 'Ⱏ', Ы: 'ⰟⰉ', Ь: 'Ⱐ',
  Э: 'Ⰵ', Ю: 'Ⱓ', Я: 'Ⱔ',
  а: 'ⰰ', б: 'ⰱ', в: 'ⰲ', г: 'ⰳ', д: 'ⰴ',
  е: 'ⰵ', ё: 'ⰵ', ж: 'ⰶ', з: 'ⰸ', и: 'ⰹ',
  й: 'ⰹ', к: 'ⰽ', л: 'ⰾ', м: 'ⰿ', н: 'ⱀ',
  о: 'ⱁ', п: 'ⱂ', р: 'ⱃ', с: 'ⱄ', т: 'ⱅ',
  у: 'ⱆ', ф: 'ⱇ', х: 'ⱈ', ц: 'ⱌ', ч: 'ⱍ',
  ш: 'ⱎ', щ: 'ⱋ', ъ: 'ⱏ', ы: 'ⱏⰹ', ь: 'ⱐ',
  э: 'ⰵ', ю: 'ⱓ', я: 'ⱔ',
};

// Длинные сочетания идут первыми, чтобы Ы не распадалась на Ъ + И.
export const glagoliticToCyrillicMap = {
  'ⰟⰉ': 'Ы', 'ⱏⰹ': 'ы',
  'Ⰰ': 'А', 'Ⰱ': 'Б', 'Ⰲ': 'В', 'Ⰳ': 'Г', 'Ⰴ': 'Д',
  'Ⰵ': 'Е', 'Ⰶ': 'Ж', 'Ⰸ': 'З', 'Ⰹ': 'И', 'Ⰽ': 'К',
  'Ⰾ': 'Л', 'Ⰿ': 'М', 'Ⱀ': 'Н', 'Ⱁ': 'О', 'Ⱂ': 'П',
  'Ⱃ': 'Р', 'Ⱄ': 'С', 'Ⱅ': 'Т', 'Ⱆ': 'У', 'Ⱇ': 'Ф',
  'Ⱈ': 'Х', 'Ⱌ': 'Ц', 'Ⱍ': 'Ч', 'Ⱎ': 'Ш', 'Ⱋ': 'Щ',
  'Ⱏ': 'Ъ', 'Ⱐ': 'Ь', 'Ⱓ': 'Ю', 'Ⱔ': 'Я',
  'ⰰ': 'а', 'ⰱ': 'б', 'ⰲ': 'в', 'ⰳ': 'г', 'ⰴ': 'д',
  'ⰵ': 'е', 'ⰶ': 'ж', 'ⰸ': 'з', 'ⰹ': 'и', 'ⰽ': 'к',
  'ⰾ': 'л', 'ⰿ': 'м', 'ⱀ': 'н', 'ⱁ': 'о', 'ⱂ': 'п',
  'ⱃ': 'р', 'ⱄ': 'с', 'ⱅ': 'т', 'ⱆ': 'у', 'ⱇ': 'ф',
  'ⱈ': 'х', 'ⱌ': 'ц', 'ⱍ': 'ч', 'ⱎ': 'ш', 'ⱋ': 'щ',
  'ⱏ': 'ъ', 'ⱐ': 'ь', 'ⱓ': 'ю', 'ⱔ': 'я',
};

const reverseTokens = Object.keys(glagoliticToCyrillicMap).sort(
  (left, right) => right.length - left.length,
);

export function translateToGlagolitic(text) {
  return Array.from(
    text,
    (character) => cyrillicToGlagoliticMap[character] || character,
  ).join('');
}

export function translateToCyrillic(text) {
  let result = '';
  let position = 0;

  while (position < text.length) {
    const token = reverseTokens.find((candidate) =>
      text.startsWith(candidate, position),
    );

    if (token) {
      result += glagoliticToCyrillicMap[token];
      position += token.length;
    } else {
      const codePoint = String.fromCodePoint(text.codePointAt(position));
      result += codePoint;
      position += codePoint.length;
    }
  }

  return result;
}
