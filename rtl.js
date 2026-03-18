(function () {
  const UI_REPLACEMENTS = new Map([
    ['Chats', 'שיחות'],
    ['New Chat', 'צ׳אט חדש'],
    ['Search messages', 'חיפוש הודעות'],
    ['Search conversations', 'חיפוש שיחות'],
    ['Temporary Chat', 'צ׳אט זמני'],
    ['Bookmarks', 'סימניות'],
    ['Prompts', 'הנחיות'],
    ['Agents', 'סוכנים'],
    ['Parameters', 'פרמטרים'],
    ['Custom instructions', 'הוראות מותאמות אישית'],
    ['Set custom instructions for ChatGPT', 'הגדר הוראות מותאמות אישית עבור ChatGPT'],
    ['System', 'מערכת'],
    ['Model', 'מודל']
  ]);

  const TECHNICAL_SELECTORS = [
    'pre',
    'code',
    '.font-mono',
    '[class*="font-mono"]',
    '[class*="hljs"]',
    '[class*="language-"]',
    '[data-model-name]',
    '.model-name',
    '.version-string',
    '.api-token',
    '.crm-token'
  ];

  const AUTO_CONTENT_SELECTORS = [
    '[data-message-id]',
    '.prose',
    '.markdown',
    '[data-testid*="conversation"]',
    '[data-testid*="chat"]',
    '[data-testid*="message"]',
    'textarea',
    '[contenteditable="true"]'
  ];

  function hasHebrew(text) {
    return /[\u0590-\u05FF]/.test(text || '');
  }

  function hasLatinOrDigits(text) {
    return /[A-Za-z0-9]/.test(text || '');
  }

  function isTechnicalLeaf(el) {
    return el.closest('pre, code') || el.matches(TECHNICAL_SELECTORS.join(','));
  }

  function forceShellRTL() {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
    document.body.setAttribute('dir', 'rtl');
  }

  function applyAutoToDynamicContent() {
    document.querySelectorAll(AUTO_CONTENT_SELECTORS.join(',')).forEach((el) => {
      if (isTechnicalLeaf(el)) return;
      el.setAttribute('dir', 'auto');

      if (el.matches('textarea, [contenteditable="true"]')) {
        el.style.textAlign = 'right';
      }
    });
  }

  function isolateTechnicalFragments() {
    document.querySelectorAll(TECHNICAL_SELECTORS.join(',')).forEach((el) => {
      el.setAttribute('dir', 'ltr');
      el.style.direction = 'ltr';
      el.style.textAlign = 'left';
      el.style.unicodeBidi = 'isolate';

      const display = getComputedStyle(el).display;
      if (display === 'inline') {
        el.style.display = 'inline-block';
      }
    });
  }

  function translateLeafLabels() {
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length) return;
      if (isTechnicalLeaf(el)) return;

      const text = (el.textContent || '').trim();
      if (!text) return;

      if (UI_REPLACEMENTS.has(text)) {
        el.textContent = UI_REPLACEMENTS.get(text);
      }
    });
  }

  function isolateMixedLeafNodes() {
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length) return;
      if (isTechnicalLeaf(el)) return;

      const text = (el.textContent || '').trim();
      if (!text) return;

      if (hasHebrew(text) && hasLatinOrDigits(text)) {
        el.setAttribute('dir', 'auto');
        el.style.unicodeBidi = 'plaintext';
      }
    });
  }

  function improveInputs() {
    document.querySelectorAll('input, textarea, [contenteditable="true"], select').forEach((el) => {
      if (el.matches('textarea, [contenteditable="true"]')) {
        el.setAttribute('dir', 'auto');
      } else {
        el.setAttribute('dir', 'rtl');
      }

      el.style.textAlign = 'right';
    });
  }

  let scheduled = false;

  function applyAll() {
    forceShellRTL();
    improveInputs();
    applyAutoToDynamicContent();
    isolateTechnicalFragments();
    translateLeafLabels();
    isolateMixedLeafNodes();
    scheduled = false;
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyAll);
  }

  applyAll();

  const observer = new MutationObserver(() => {
    scheduleApply();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });

  window.addEventListener('load', applyAll);
  document.addEventListener('readystatechange', scheduleApply);
})();
