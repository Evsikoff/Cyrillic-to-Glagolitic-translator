import bridge, {
  parseURLSearchParamsForGetLaunchParams,
} from '@vkontakte/vk-bridge';
import {
  translateToCyrillic,
  translateToGlagolitic,
} from './translator.js';

const root = document.documentElement;
const themeColor = document.getElementById('theme-color');
const inputField = document.getElementById('input');
const outputField = document.getElementById('output');
const inputLabel = document.getElementById('input-label');
const outputLabel = document.getElementById('output-label');
const swapButton = document.getElementById('swap-direction');
const copyButton = document.getElementById('copy-output');
const copyStatus = document.getElementById('copy-status');

let direction = 'to-glagolitic';
let copyFeedbackTimer;

function updateTranslation() {
  outputField.value = direction === 'to-glagolitic'
    ? translateToGlagolitic(inputField.value)
    : translateToCyrillic(inputField.value);
  copyButton.disabled = outputField.value.length === 0;
}

function updateDirectionInterface() {
  const toGlagolitic = direction === 'to-glagolitic';
  inputLabel.textContent = toGlagolitic ? 'Русский (Кириллица)' : 'Глаголица';
  outputLabel.textContent = toGlagolitic ? 'Глаголица' : 'Русский (Кириллица)';
  inputField.placeholder = toGlagolitic
    ? 'Введите текст здесь…'
    : 'Введите текст глаголицей…';
  outputField.placeholder = toGlagolitic
    ? 'Ⱃⰵⰸⱆⰾⱐⱅⰰⱅ…'
    : 'Результат…';
  inputField.spellcheck = toGlagolitic;
  swapButton.setAttribute(
    'aria-label',
    toGlagolitic
      ? 'Переключить на перевод с глаголицы на кириллицу'
      : 'Переключить на перевод с кириллицы на глаголицу',
  );
}

function switchDirection() {
  const previousTranslation = outputField.value;
  direction = direction === 'to-glagolitic' ? 'to-cyrillic' : 'to-glagolitic';
  inputField.value = previousTranslation;
  updateDirectionInterface();
  updateTranslation();
  inputField.focus();
}

function legacyCopy() {
  const selectionStart = outputField.selectionStart;
  const selectionEnd = outputField.selectionEnd;
  outputField.focus();
  outputField.select();
  const copied = document.execCommand('copy');
  outputField.setSelectionRange(selectionStart, selectionEnd);
  inputField.focus({ preventScroll: true });

  if (!copied) {
    throw new Error('Copy command was rejected');
  }
}

async function browserCopy(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Старые WebView могут объявлять Clipboard API, но запрещать его вызов.
    }
  }

  legacyCopy();
}

function showCopyFeedback() {
  clearTimeout(copyFeedbackTimer);
  copyButton.textContent = 'Скопировано';
  copyButton.classList.add('is-copied');
  copyStatus.textContent = 'Перевод скопирован в буфер обмена';
  copyFeedbackTimer = window.setTimeout(() => {
    copyButton.textContent = 'Копировать';
    copyButton.classList.remove('is-copied');
  }, 1800);
}

async function copyTranslation() {
  const text = outputField.value;
  if (!text) return;

  try {
    if (
      bridge.isEmbedded()
      && await bridge.supportsAsync('VKWebAppCopyText')
    ) {
      await bridge.send('VKWebAppCopyText', { text });
    } else {
      await browserCopy(text);
    }

    showCopyFeedback();
  } catch {
    try {
      await browserCopy(text);
      showCopyFeedback();
    } catch {
      copyStatus.textContent = 'Не удалось скопировать перевод';
      outputField.focus();
      outputField.select();
    }
  }
}

function normaliseAppearance(config = {}) {
  if (config.appearance === 'dark') return 'dark';
  if (config.appearance === 'light') return 'light';

  const scheme = String(config.scheme || '').toLowerCase();
  return scheme.includes('dark') || scheme === 'space_gray' ? 'dark' : 'light';
}

function setInsets(payload = {}) {
  const insets = payload.insets || payload;

  for (const side of ['top', 'right', 'bottom', 'left']) {
    const value = Number(insets[side]);
    if (Number.isFinite(value) && value >= 0) {
      root.style.setProperty(`--vk-safe-area-${side}`, `${value}px`);
    }
  }
}

async function applyAppearance(config = {}) {
  const appearance = normaliseAppearance(config);
  const backgroundColor = appearance === 'dark' ? '#19191a' : '#f2f3f5';

  root.dataset.appearance = appearance;
  root.style.colorScheme = appearance;
  themeColor.setAttribute('content', backgroundColor);

  if (bridge.isStandalone()) return;
  if (!(await bridge.supportsAsync('VKWebAppSetViewSettings'))) return;

  try {
    await bridge.send('VKWebAppSetViewSettings', {
      status_bar_style: appearance === 'dark' ? 'light' : 'dark',
      action_bar_color: backgroundColor,
      navigation_bar_color: backgroundColor,
    });
  } catch {
    // Некоторые клиенты VK сами управляют системными панелями.
  }
}

function handleBridgeEvent(event) {
  if (!event?.detail?.type) return;

  if (event.detail.type === 'VKWebAppUpdateConfig') {
    const config = event.detail.data || {};
    setInsets(config);
    void applyAppearance(config);
  }

  if (event.detail.type === 'VKWebAppUpdateInsets') {
    setInsets(event.detail.data || {});
  }
}

function applyLaunchParams() {
  try {
    const params = parseURLSearchParamsForGetLaunchParams(window.location.search);
    root.dataset.platform = params.vk_platform || 'web';
  } catch {
    root.dataset.platform = 'web';
  }
}

async function initialiseVKMiniApp() {
  bridge.subscribe(handleBridgeEvent);
  applyLaunchParams();

  if (bridge.isStandalone()) return;

  try {
    await bridge.send('VKWebAppInit');

    if (await bridge.supportsAsync('VKWebAppSetTitle')) {
      void bridge.send('VKWebAppSetTitle', {
        title: 'Кириллица ↔ Глаголица',
      }).catch(() => {});
    }

    if (await bridge.supportsAsync('VKWebAppGetConfig')) {
      const config = await bridge.send('VKWebAppGetConfig');
      setInsets(config);
      await applyAppearance(config);
    }
  } catch {
    // В обычном браузере приложение остаётся полностью работоспособным.
  }
}

inputField.addEventListener('input', updateTranslation);
swapButton.addEventListener('click', switchDirection);
copyButton.addEventListener('click', copyTranslation);

updateDirectionInterface();
updateTranslation();
void initialiseVKMiniApp();
