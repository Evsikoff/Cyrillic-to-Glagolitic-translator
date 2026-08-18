import assert from 'node:assert/strict';
import test from 'node:test';

import {
  translateToCyrillic,
  translateToGlagolitic,
} from '../src/translator.js';

test('переводит кириллицу в глаголицу с сохранением регистра и пунктуации', () => {
  assert.equal(translateToGlagolitic('Привет, мир!'), 'Ⱂⱃⰹⰲⰵⱅ, ⰿⰹⱃ!');
});

test('переводит глаголицу обратно в кириллицу', () => {
  assert.equal(translateToCyrillic('Ⱂⱃⰹⰲⰵⱅ, ⰿⰹⱃ!'), 'Привет, мир!');
});

test('обрабатывает составной знак Ы до одиночных знаков', () => {
  assert.equal(translateToCyrillic('ⰟⰉⱏⰹ'), 'Ыы');
});

test('оставляет неподдерживаемые символы без изменений', () => {
  assert.equal(translateToGlagolitic('123 🙂'), '123 🙂');
  assert.equal(translateToCyrillic('123 🙂'), '123 🙂');
});
