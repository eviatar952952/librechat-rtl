(function () {
  'use strict';

  /* === Hebrew UI text replacements === */
  var HEBREW_UI = new Map([
    ['Chats', '\u05E9\u05D9\u05D7\u05D5\u05EA'],
    ['New Chat', '\u05E6\u05F3\u05D0\u05D8 \u05D7\u05D3\u05E9'],
    ['Search messages', '\u05D7\u05D9\u05E4\u05D5\u05E9 \u05D4\u05D5\u05D3\u05E2\u05D5\u05EA'],
    ['Search conversations', '\u05D7\u05D9\u05E4\u05D5\u05E9 \u05E9\u05D9\u05D7\u05D5\u05EA'],
    ['Temporary Chat', '\u05E6\u05F3\u05D0\u05D8 \u05D6\u05DE\u05E0\u05D9'],
    ['Bookmarks', '\u05E1\u05D9\u05DE\u05E0\u05D9\u05D5\u05EA'],
    ['Prompts', '\u05D4\u05E0\u05D7\u05D9\u05D5\u05EA'],
    ['Agents', '\u05E1\u05D5\u05DB\u05E0\u05D9\u05DD'],
    ['Parameters', '\u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD'],
    ['Custom instructions', '\u05D4\u05D5\u05E8\u05D0\u05D5\u05EA \u05DE\u05D5\u05EA\u05D0\u05DE\u05D5\u05EA \u05D0\u05D9\u05E9\u05D9\u05EA'],
    ['System', '\u05DE\u05E2\u05E8\u05DB\u05EA'],
    ['Model', '\u05DE\u05D5\u05D3\u05DC']
  ]);

  /* === Selectors === */
  var LTR_SELECTORS = 'pre, code, svg, .font-mono, [class*="font-mono"], [class*="hljs"], [class*="language-"]';
  var ISOLATE_SELECTORS = '[data-model-name], [data-testid*="model"], .model-name';

  /* === Force document-level RTL === */
  function forceDocumentRTL() {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
    if (document.body) {
      document.body.setAttribute('dir', 'rtl');
    }
  }

  /* === Force RTL on input fields === */
  function forceRTLOnInputs() {
    var inputs = document.querySelectorAll('input, textarea, [contenteditable="true"], select');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      el.setAttribute('dir', 'rtl');
      el.style.textAlign = 'right';
      el.style.direction = 'rtl';
      el.style.unicodeBidi = 'plaintext';
    }
  }

  /* === Keep technical elements LTR === */
  function keepTechnicalLTR() {
    var elements = document.querySelectorAll(LTR_SELECTORS);
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.setAttribute('dir', 'ltr');
      el.style.direction = 'ltr';
      el.style.textAlign = 'left';
      el.style.unicodeBidi = 'embed';
    }
  }

  /* === Isolate English fragments === */
  function isolateEnglishFragments() {
    var elements = document.querySelectorAll(ISOLATE_SELECTORS);
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.setAttribute('dir', 'ltr');
      el.style.direction = 'ltr';
      el.style.unicodeBidi = 'isolate';
      if (getComputedStyle(el).display === 'inline') {
        el.style.display = 'inline-block';
      }
    }
  }

  /* === Translate UI text using TreeWalker === */
  function translateUITextNodes() {
    var root = document.body || document.documentElement;
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue.trim();
      if (text && HEBREW_UI.has(text)) {
        node.nodeValue = HEBREW_UI.get(text);
      }
    }
  }

  /* === Fix composer textarea === */
  function fixComposerText() {
    var composers = document.querySelectorAll('textarea, [contenteditable="true"]');
    for (var i = 0; i < composers.length; i++) {
      var el = composers[i];
      var aria = el.getAttribute('aria-label') || '';
      if (aria.indexOf('Message') !== -1 || aria.indexOf('Send') !== -1) {
        el.setAttribute('dir', 'rtl');
        el.style.textAlign = 'right';
      }
    }
  }

  /* === Fix CRM/MRC BiDi issue in landing title === */
  function fixLandingCRMTitle() {
    var titles = document.querySelectorAll('.landing-title, .landing-subtitle, h1, h2');
    for (var i = 0; i < titles.length; i++) {
      var el = titles[i];
      var text = (el.textContent || '').trim();
      if (!text) continue;

      /* If BiDi flipped CRM to MRC, fix it */
      var fixed = text.replace(/\bMRC\b/g, 'CRM');

      /* Isolate Latin acronyms so they dont flip */
      if (fixed !== text || /\b(CRM|API|PDF|AI|MCP|RTL|LTR)\b/.test(fixed)) {
        var html = fixed.replace(/\b(CRM|API|PDF|AI|MCP|RTL|LTR)\b/g, '<bdi dir="ltr">$1</bdi>');
        if (el.innerHTML !== html) {
          el.innerHTML = html;
        }
      }
    }
  }

  /* === Main apply function === */
  function applyRTL() {
    forceDocumentRTL();
    forceRTLOnInputs();
    keepTechnicalLTR();
    isolateEnglishFragments();
    translateUITextNodes();
    fixComposerText();
    fixLandingCRMTitle();
  }

  /* === Initial application === */
  applyRTL();

  /* === MutationObserver with debounce === */
  var debounceTimer = null;
  var observer = new MutationObserver(function () {
    if (debounceTimer) { clearTimeout(debounceTimer); }
    debounceTimer = setTimeout(applyRTL, 100);
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
    attributeFilter: ['dir', 'lang']
  });

  /* === Re-apply on load === */
  window.addEventListener('load', applyRTL);
  document.addEventListener('readystatechange', applyRTL);
})();
