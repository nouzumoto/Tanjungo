const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let darkThemeEnabled = false;
let emojiList = {};
let emojiPopup = null;
let currentInput = null;
let emojiFilter = '';
let selectedEmojiIndex = 0;
let globalSubmitBlocked = false;

(async () => {
  try {
    const result = await browserAPI.storage.sync.get(['darkTheme']);
    darkThemeEnabled = result.darkTheme === true;
    if (darkThemeEnabled) {
      setTimeout(() => injectDarkTheme(), 200);
    }
  } catch (error) {
    console.error('Error loading dark theme preference:', error);
  }

  try {
    const response = await fetch(browserAPI.runtime.getURL('emoji-list.json'));
    emojiList = await response.json();
  } catch (error) {
    console.error('Error loading emoji list:', error);
  }

  browserAPI.storage.onChanged.addListener((changes) => {
    if (changes.darkTheme) {
      darkThemeEnabled = changes.darkTheme.newValue;
      if (darkThemeEnabled) {
        setTimeout(() => injectDarkTheme(), 100);
      } else {
        removeDarkTheme();
      }
    }
  });

  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleDarkTheme') {
      darkThemeEnabled = message.enabled;
      if (darkThemeEnabled) {
        setTimeout(() => injectDarkTheme(), 100);
      } else {
        removeDarkTheme();
      }
    } else if (message.action === 'command') {
      handleCommand(message.command);
    }
    return true;
  });

  setupEventListeners();
  setupGlobalShortcuts();
})();

function injectDarkTheme() {
  let style = document.getElementById('tanjungo-dark-theme');
  if (style) {
    style.remove();
  }
  
  style = document.createElement('style');
  style.id = 'tanjungo-dark-theme';
  style.textContent = `
    body.emoji_image {
      background-color: #212121 !important;
      color: #e0e0e0 !important;
    }

    #aj_content, .tr-container, main.container, section.content {
      background-color: #212121 !important;
    }

    header.has-search {
      border-color: #2b2b2b !important;
      background-color: #212121 !important;
    }

    div.header-wrap, h3.tr-header, a.tr-menu-item, section.tr-key.clearfix, div.tr-key-full-block, 
    .tr-menu-section-collapsed .tr-menu-header-collapse::after, .key-suggestion-collapsed .key-suggestion-collapse:after, 
    .tr-menu-header-collapse:after, #aj_content header, .key-suggestion-collapse:after, .tr-selected-icon:after, 
    .key-suggestion-wrap.highlight, .popup, .tr-share-link-wrap input.tr-share-link {
      background-color: #212121 !important;
    }

    .tr-search-field-wrap {
      background-color: #212121 !important;
    }

    .tr-key-row-wrap {
      box-shadow: inset 0 -1px 0 #2b2b2b !important;
      border-bottom: none !important;
    }

    .tr-key-row {
      background-color: #212121 !important;
    }

    .tr-key-row:hover {
      background-color: #2b2b2b !important;
    }

    input.form-control, div.input.form-control.tr-search-field.empty {
      background-color: #212121 !important;
      color: #ffffff !important;
    }

    input.tr-form-control, div.input.form-control.tr-form-control.tr-keyword-input, 
    div.input.form-control.tr-form-control.tr-emoji-input, div.input.form-control.tr-search-field {
      background-color: #1e1e1e !important;
      color: #ffffff !important;
      box-shadow: inset 0 -1px 0 #3a3a3a !important;
      border: none !important;
    }

    input.tr-form-control:focus {
      box-shadow: inset 0 -2px 0 #3390ec !important;
      background-color: #1e1e1e !important;
    }

    div.emoji-panel {
      background-color: #2b2b2b !important;
      color: #ffffff !important;
      box-shadow: inset 0 -1px 0 #3a3a3a !important;
    }

    span.tr-search-filter.dropdown-toggle {
      background-color: #2b2b2b !important;
      color: #ffffff !important;
      font-style: normal !important;
      font-weight: normal !important;
    }

    span.tr-search-filter.dropdown-toggle:hover {
      background-color: #3a3a3a !important;
    }

    .tr-languages-filter.selected {
      background-color: #2b2b2b !important;
    }

    span.nav-label {
      color: #e0e0e0 !important;
      border-style: none !important;
    }

    div.tr-section-cover.cover_untranslated {
      border-style: none !important;
    }

    .screenshot-side-scrollable, div.input.form-control.tr-form-control.key-add-suggestion-field {
      color: #ffffff !important;
      background-color: #212121 !important;
      border-style: none !important;
    }

    span.value, span.tr-languages-name, .tr-header, .tr-header-link, .tr-header-link:hover, 
    header .breadcrumb > .active, header .breadcrumb > .active a, .tr-section-row .tr-section-caption {
      color: #ffffff !important;
    }

    .tr-value-key {
      color: #999999 !important;
    }

    .tr-value-default {
      color: #ffffff !important;
    }

    .tr-value-suggestion {
      background-color: #2b2b2b !important;
    }

    .tr-value-suggestion:hover {
      background-color: #3a3a3a !important;
    }

    .tr-value-suggestion a {
      color: #3390ec !important;
    }

    .tr-value-suggestion a:hover {
      color: #5288c1 !important;
    }

    div.key-add-suggestion-header {
      color: #3390ec !important;
    }

    .key-add-suggestion-collapse:before, .key-add-suggestion-collapse:after {
      background-color: #3390ec !important;
    }

    button.field-ins-btn {
      color: #3390ec !important;
    }

    mark.token {
      background: #2b2b2b !important;
      box-shadow: 0 0 0 1px #3390ec !important;
      color: #3390ec !important;
    }

    ::selection, ::-moz-selection {
      background: #3390ec !important;
      color: #ffffff !important;
    }

    .active .tr-menu-item, a.tr-menu-item:hover, .popup a.tr-languages-result:hover, 
    .popup a.tr-languages-result.default, .popup .selected a.tr-languages-result, .tr-plain-key-row:hover {
      background: #3a3a3a !important;
      border: 1px solid #4a4a4a !important;
    }

    .tr-plain-key-row:hover a:hover > .p-value:before, .tr-plain-key-row:hover a:hover > .pluralized:before, 
    .tr-plain-key-row:hover .comment-text > a:hover:before {
      background: #3a3a3a !important;
    }

    .screenshot-key-row.hover, screenshot-key-row.active, .p-value:before, .pluralized:before, .comment-text > a:before {
      background: #2b2b2b !important;
    }

    .screenshot-key-row.hover {
      border-bottom: 1px solid #2b2b2b !important;
      border-top: 1px solid #2b2b2b !important;
    }

    .screenshot-key-row, .screenshot-key-row.hover {
      border-bottom: 1px solid #2b2b2b !important;
    }

    .screenshot-key-value-default, .key-history-value, .key-suggestion-value, .key-default-value {
      font-weight: 300 !important;
    }

    span.diff-btn {
      color: #ffffff !important;
    }

    .show-diff ins, .show-diff-full ins {
      background: rgba(0, 125, 0, 0.50) !important;
    }

    .show-diff del, .show-diff-full del {
      background: rgba(255, 0, 0, 0.50) !important;
    }

    .tr-menu, .tr-search-field-wrap, .content {
      border-color: #2b2b2b !important;
    }

    .tr-feedback-row:after {
      border-bottom-color: #2b2b2b !important;
    }

    .key-default {
      border-bottom-color: #2b2b2b !important;
    }

    .tr-suggestion-row-wrap {
      border-bottom-color: #2b2b2b !important;
    }

    .tr-suggestion-comment-wrap {
      border-bottom-color: #2b2b2b !important;
    }

    header .header-wrap {
      box-shadow: inset 0 -1px 0 #2b2b2b !important;
    }

    .login-popup-container .form-control {
      background-color: #2b2b2b !important;
      color: #e0e0e0 !important;
      box-shadow: inset 0 -1px 0 #3a3a3a !important;
    }

    .tr-badge, .tr-badges .tr-badge, .tr-badges a.tr-badge:hover {
      background-color: #3390ec !important;
      color: #ffffff !important;
    }

    .binding-item, .tr-languages-filters > .tr-languages-filter, .tr-languages-filters-more {
      background: #3a3a3a !important;
      color: #ffffff !important;
    }

    .binding-item-current, .binding-item-current:hover, .binding-item-current:focus, 
    .tr-languages-filters > .tr-languages-filter.selected {
      background-color: #3390ec !important;
      color: #ffffff !important;
    }

    .tr-badge *, .tr-badges .tr-badge * {
      color: #ffffff !important;
    }

    .tr-section-wrap .tr-badge {
      border-color: #5288c1 !important;
    }

    .tr-header-counter {
      color: #ffffff !important;
      background-color: transparent !important;
    }

    .tr-header-counter * {
      color: #ffffff !important;
    }

    ul.dropdown-menu, span.dropdown-menu {
      background-color: #2b2b2b !important;
    }

    div.header-auth ul.dropdown-menu a {
      color: #e0e0e0 !important;
    }

    div.header-auth ul.dropdown-menu a:hover {
      color: #ffffff !important;
      background-color: #3a3a3a !important;
    }

    div.tr-search-results {
      background: transparent !important;
    }

    a.tr-search-result {
      background-color: rgba(43, 43, 43, 0.9) !important;
    }

    .comment-deleted-row, .key-suggestion-deleted-row {
      background: #2b2b2b !important;
    }

    .comment-text, .comment-author {
      color: #e0e0e0 !important;
    }

    a, *.btn-link, .header-auth-name {
      color: #ffffff !important;
    }

    a:hover {
      color: #5288c1 !important;
    }

    a:focus {
      color: #5288c1 !important;
    }

    .popup *.btn-link:hover {
      background-color: #2b2b2b !important;
      color: #5288c1 !important;
    }

    #dev_page_content_wrap blockquote {
      border-color: #2b2b2b !important;
    }

    hr {
      border-color: #2b2b2b !important;
      background-color: #2b2b2b !important;
    }


    div[style*="background-color: white"],
    div[style*="background-color: #fff"],
    div[style*="background-color: #ffffff"],
    div[style*="background: white"],
    div[style*="background: #fff"],
    div[style*="background: #ffffff"],
    div[style*="background-color: rgb(255"],
    div[style*="background: rgb(255"],
    section[style*="background-color: white"],
    section[style*="background-color: #fff"],
    section[style*="background-color: #ffffff"],
    *[style*="background-color: white"],
    *[style*="background-color: #fff"],
    *[style*="background-color: #ffffff"] {
      background-color: #212121 !important;
    }

    .tr-key-row-wrap[style*="background"],
    .tr-key-row[style*="background"] {
      background-color: #212121 !important;
    }

    *[style*="border-color: white"],
    *[style*="border-color: #fff"],
    *[style*="border-color: #ffffff"],
    *[style*="border-top-color: white"],
    *[style*="border-bottom-color: white"],
    *[style*="border-left-color: white"],
    *[style*="border-right-color: white"],
    *[style*="border: 1px solid white"],
    *[style*="border: 1px solid #fff"],
    *[style*="border: 1px solid #ffffff"],
    *[style*="border-top: 1px solid white"],
    *[style*="border-bottom: 1px solid white"],
    *[style*="border-top: 1px solid #fff"],
    *[style*="border-bottom: 1px solid #fff"] {
      border-color: #2b2b2b !important;
    }

    table, tr, td, th {
      border-color: #2b2b2b !important;
    }

    .table, .table td, .table th {
      border-color: #2b2b2b !important;
    }

    .tr-menu {
      background-color: #212121 !important;
    }

    .tr-menu-item {
      color: #ffffff !important;
    }

    a.tr-menu-item {
      color: #ffffff !important;
    }

    .active .tr-menu-item, a.tr-menu-item:hover {
      color: #ffffff !important;
      background: #3a3a3a !important;
      border: 1px solid #4a4a4a !important;
    }

    a.tr-menu-item {
      border: 1px solid transparent !important;
    }

    .breadcrumb {
      background-color: transparent !important;
    }

    .breadcrumb a {
      color: #3390ec !important;
    }

    .breadcrumb > .active {
      color: #ffffff !important;
    }

    [style*="border"][style*="white"],
    [style*="border"][style*="#fff"],
    [style*="border"][style*="#ffffff"],
    [style*="border"][style*="rgb(255"] {
      border-color: #2b2b2b !important;
    }
  `;
  document.head.appendChild(style);
  
  const observer = new MutationObserver((mutations) => {
    if (!darkThemeEnabled) return;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const el = mutation.target;
        const style = el.getAttribute('style') || '';
        if (style.includes('white') || style.includes('#fff') || style.includes('#ffffff') || style.includes('rgb(255')) {
          let newStyle = style;
          newStyle = newStyle.replace(/border[^:]*:\s*[^;]*white[^;]*;?/gi, 'border-color: #2b2b2b !important;');
          newStyle = newStyle.replace(/border[^:]*:\s*[^;]*#fff[^;]*;?/gi, 'border-color: #2b2b2b !important;');
          newStyle = newStyle.replace(/border[^:]*:\s*[^;]*#ffffff[^;]*;?/gi, 'border-color: #2b2b2b !important;');
          newStyle = newStyle.replace(/background[^:]*:\s*[^;]*white[^;]*;?/gi, 'background-color: #212121 !important;');
          newStyle = newStyle.replace(/background[^:]*:\s*[^;]*#fff[^;]*;?/gi, 'background-color: #212121 !important;');
          newStyle = newStyle.replace(/background[^:]*:\s*[^;]*#ffffff[^;]*;?/gi, 'background-color: #212121 !important;');
          if (newStyle !== style && (el.classList.contains('tr-') || el.closest('[class*="tr-"]'))) {
            el.setAttribute('style', newStyle);
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
    attributeOldValue: false
  });
}

function removeDarkTheme() {
  const style = document.getElementById('tanjungo-dark-theme');
  if (style) {
    style.remove();
  }
}

function setupEventListeners() {
  const observer = new MutationObserver(() => {
    attachInputListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  attachInputListeners();
}

function attachInputListeners() {
  const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
  
  inputs.forEach(input => {
    if (input.dataset.tanjungoListener === 'true') return;
    input.dataset.tanjungoListener = 'true';
    
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('keydown', (e) => {
      if (e.key === ':' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        e.stopPropagation();
        currentInput = e.target;
        emojiFilter = '';
        selectedEmojiIndex = 0;
        setTimeout(() => {
          const value = e.target.value || e.target.textContent || '';
          if (value.includes(':')) {
            handleEmojiInput({ target: e.target, inputType: 'insertText', data: ':' });
          }
        }, 50);
      }
    }, true);
    input.addEventListener('input', handleAutoReplace);
    input.addEventListener('input', handleEmojiInput);
  });
}

async function quickSearchSelectedText() {
  let text = '';
  
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    text = selection.toString().trim();
  } else {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        if (start !== end) {
          text = activeElement.value.substring(start, end);
        }
      } else {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) {
          text = sel.toString().trim();
        }
      }
    }
  }
  
  if (!text) {
    try {
      await navigator.clipboard.readText().then(clipText => {
        if (clipText && clipText.trim()) {
          text = clipText.trim();
        }
      });
    } catch (err) {
      console.error('Error reading clipboard:', err);
    }
  }
  
  if (text) {
    const match = window.location.href.match(/translations\.telegram\.org\/([^\/]+)/);
    const lang = match ? match[1] : 'en';
    const searchUrl = `https://translations.telegram.org/${lang}/search?query=${encodeURIComponent(text)}`;
    browserAPI.runtime.sendMessage({ action: 'openSearch', url: searchUrl });
  }
}

function setupGlobalShortcuts() {
  document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      return true;
    }
    
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
    
    if (e.ctrlKey && e.key === 'k' && !e.shiftKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      await quickSearchSelectedText();
      return;
    }

    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
      const searchInput = document.querySelector('.tr-search-field, input[type="search"], input[placeholder*="Search"]');
      if (searchInput && document.body.contains(searchInput)) {
        e.preventDefault();
        try {
          searchInput.focus();
          searchInput.select();
        } catch (err) {
          console.warn('Error focusing search input:', err);
        }
      }
      return;
    }

    if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.altKey && !isInput) {
      e.preventDefault();
      e.stopPropagation();
      quickApply(-1);
      return;
    }

    if (e.key === 'y' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isInput) {
      e.preventDefault();
      quickApply(-1);
      return;
    }

    if (e.ctrlKey && (e.key === 'a' || e.key === 'A') && !e.shiftKey && !e.metaKey && !e.altKey && !isInput) {
      if (!window.location.href.includes('/import')) {
        e.preventDefault();
        addTranslation();
      }
      return;
    }

    if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isInput) {
      e.preventDefault();
      addTranslation();
      return;
    }

    if (e.ctrlKey && (e.key === 'e' || e.key === 'E') && !e.shiftKey && !e.metaKey && !e.altKey && !isInput) {
      e.preventDefault();
      editTranslation();
      return;
    }

    if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isInput) {
      e.preventDefault();
      editTranslation();
      return;
    }

    if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
      const cancelButtons = document.querySelectorAll('.btn-link, button, [aria-label*="Cancel"]');
      const cancelButton = Array.from(cancelButtons).find(btn => 
        btn.textContent && btn.textContent.trim().toLowerCase().includes('cancel')
      );
      if (cancelButton) {
        e.preventDefault();
        cancelButton.click();
      }
      return;
    }
  });
}

function getCurrentBinding() {
  return document.querySelector('.binding-item.binding-item-current');
}

function cycleBindings(forward) {
  const bindings = Array.from(document.querySelectorAll('.binding-item'));
  if (bindings.length < 1) return;
  const current = getCurrentBinding();
  const i = current ? bindings.indexOf(current) : -1;

  if (forward) {
    if (i < bindings.length - 1) bindings[i + 1].click();
    else bindings[0].click();
  } else {
    if (i > 0) bindings[i - 1].click();
    else bindings[bindings.length - 1].click();
  }
}

function scrollItems(down) {
  const event = new KeyboardEvent('keydown', {
    key: down ? 'ArrowDown' : 'ArrowUp',
    code: down ? 'ArrowDown' : 'ArrowUp',
    keyCode: down ? 40 : 38,
    which: down ? 40 : 38,
    bubbles: true,
    cancelable: true
  });
  document.body.dispatchEvent(event);
}

function quickApply(index) {
  const currentRow = document.querySelector('.tr-key-row-wrap.open');
  if (!currentRow) return;

  const buttons = currentRow.querySelectorAll('.btn.btn-sm.btn-default.key-status-apply-btn');
  if (index > -1 && buttons[index] && buttons[index].offsetParent !== null) {
    buttons[index].click();
  } else {
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].offsetParent === null) continue;
      buttons[i].click();
      break;
    }
  }

  if (getCurrentBinding() === null) {
    scrollItems(true);
  } else {
    cycleBindings(true);
  }
}

function submitScrollDown() {
  const addwrap = document.querySelector('.key-add-suggestion-wrap');
  if (!addwrap) return;

  const observer = new MutationObserver(() => {
    const suggestionField = document.querySelector('.key-add-suggestion-field');
    if (suggestionField && document.activeElement === suggestionField) {
      scrollItems(true);
      const valueBox = document.querySelector('.key-suggestion-value-box');
      if (valueBox) valueBox.focus();
    }
    observer.disconnect();
  });

  observer.observe(addwrap, {
    attributeFilter: ['class'],
    attributeOldValue: false
  });
}

function isInputTranslationOpen() {
  const wrap = document.querySelector('.key-add-suggestion-wrap');
  if (!wrap) return false;
  if (wrap.className === 'key-add-suggestion-wrap') {
    const input = document.querySelector('.tr-form-control');
    if (input) input.focus();
    return true;
  }
  return false;
}

function addTranslation() {
  if (!isInputTranslationOpen()) {
    const header = document.querySelector('.key-add-suggestion-header');
    if (header) header.click();
  }
}

function editTranslation() {
  if (!isInputTranslationOpen()) {
    const editBtn = document.querySelector('.ibtn.key-suggestion-edit');
    if (editBtn) editBtn.click();
  }
}

async function applyFirstSuggestionAndMoveNext() {
  quickApply(-1);
}


function findCurrentTranslationRow() {
  const visibleRows = Array.from(document.querySelectorAll('.tr-key-row, .tr-key-row-wrap'));
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;
  
  for (const row of visibleRows) {
    const rect = row.getBoundingClientRect();
    const rowTop = rect.top + window.scrollY;
    const rowBottom = rowTop + rect.height;
    
    if (rowTop <= viewportTop + 200 && rowBottom >= viewportTop) {
      return row;
    }
  }
  
  return visibleRows[0] || null;
}

function moveToNextUntranslated() {
  const allRows = Array.from(document.querySelectorAll('.tr-key-row-wrap'));
  const currentRow = findCurrentTranslationRow();
  const currentIndex = currentRow ? allRows.indexOf(currentRow) : -1;
  
  for (let i = currentIndex + 1; i < allRows.length; i++) {
    const row = allRows[i];
    const input = row.querySelector('input.tr-form-control, textarea.tr-form-control, [contenteditable="true"]');
    const hasValue = input && (input.value || input.textContent || '').trim();
    
    if (!hasValue) {
      const rect = row.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - 100;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      
      setTimeout(() => {
        if (input && document.body.contains(input)) {
          try {
            input.focus();
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
              input.select();
            }
          } catch (err) {
            console.warn('Error focusing input:', err);
          }
        }
      }, 300);
      return;
    }
  }
  
  window.scrollBy({ top: 300, behavior: 'smooth' });
}

async function handleCommand(command) {
  const activeElement = document.activeElement;
  const isInput = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );

  switch (command) {
    case 'ctrl-k':
      await quickSearchSelectedText();
      break;

    case 'ctrl-shift-x':
      if (isInput) {
        document.execCommand('cut');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const text = await navigator.clipboard.readText();
        if (text) {
          const wrapped = `[${text}]()`;
          insertTextAtCursor(activeElement, wrapped);
        }
      }
      break;

    case 'ctrl-m':
      if (isInput) {
        let selectedText = '';
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          if (start !== end) {
            selectedText = activeElement.value.substring(start, end);
            const newText = selectedText.replace(/\*/g, '');
            const value = activeElement.value;
            activeElement.value = value.substring(0, start) + newText + value.substring(end);
            activeElement.setSelectionRange(start, start + newText.length);
          } else {
            const value = activeElement.value;
            const newValue = value.replace(/\*/g, '');
            if (newValue !== value) {
              const cursorPos = activeElement.selectionStart;
              activeElement.value = newValue;
              activeElement.setSelectionRange(cursorPos, cursorPos);
            }
          }
        } else if (activeElement.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            selectedText = range.toString();
            if (selectedText) {
              const newText = selectedText.replace(/\*/g, '');
              range.deleteContents();
              range.insertNode(document.createTextNode(newText));
            } else {
              const textContent = activeElement.textContent || '';
              const newText = textContent.replace(/\*/g, '');
              if (newText !== textContent) {
                activeElement.textContent = newText;
              }
            }
          }
        }
      }
      break;

    case 'ctrl-i':
      if (isInput) {
        let selectedText = '';
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          if (start !== end) {
            selectedText = activeElement.value.substring(start, end);
            const newText = selectedText.toUpperCase();
            const value = activeElement.value;
            activeElement.value = value.substring(0, start) + newText + value.substring(end);
            activeElement.setSelectionRange(start, start + newText.length);
          }
        } else if (activeElement.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            selectedText = range.toString();
            if (selectedText) {
              const newText = selectedText.toUpperCase();
              range.deleteContents();
              range.insertNode(document.createTextNode(newText));
            }
          }
        }
      }
      break;

    case 'ctrl-m':
      if (isInput) {
        let selectedText = '';
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          if (start !== end) {
            selectedText = activeElement.value.substring(start, end);
            const newText = selectedText.replace(/\*/g, '');
            const value = activeElement.value;
            activeElement.value = value.substring(0, start) + newText + value.substring(end);
            activeElement.setSelectionRange(start, start + newText.length);
          } else {
            const value = activeElement.value;
            const newValue = value.replace(/\*/g, '');
            if (newValue !== value) {
              const cursorPos = activeElement.selectionStart;
              activeElement.value = newValue;
              activeElement.setSelectionRange(cursorPos, cursorPos);
            }
          }
        } else if (activeElement.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            selectedText = range.toString();
            if (selectedText) {
              const newText = selectedText.replace(/\*/g, '');
              range.deleteContents();
              range.insertNode(document.createTextNode(newText));
            } else {
              const textContent = activeElement.textContent || '';
              const newText = textContent.replace(/\*/g, '');
              if (newText !== textContent) {
                activeElement.textContent = newText;
              }
            }
          }
        }
      }
      break;

    case 'ctrl-i':
      if (isInput) {
        let selectedText = '';
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          if (start !== end) {
            selectedText = activeElement.value.substring(start, end);
            const newText = selectedText.toUpperCase();
            const value = activeElement.value;
            activeElement.value = value.substring(0, start) + newText + value.substring(end);
            activeElement.setSelectionRange(start, start + newText.length);
          }
        } else if (activeElement.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            selectedText = range.toString();
            if (selectedText) {
              const newText = selectedText.toUpperCase();
              range.deleteContents();
              range.insertNode(document.createTextNode(newText));
            }
          }
        }
      }
      break;
  }
}

function handleKeyDown(e) {
  const input = e.target;
  const eClassList = input.classList;
  
  if (eClassList.contains('form-control') && (eClassList.contains('tr-form-control') || eClassList.contains('comment-field'))) {
    if (e.key === 'Escape' && !e.ctrlKey) {
      const cancelBtns = document.querySelectorAll('.form-cancel-btn');
      if (cancelBtns.length > 0) {
        const isTranslator = document.querySelector('.form-submit-btn')?.textContent?.includes('Apply') ? 0 : cancelBtns.length - 1;
        if (cancelBtns[isTranslator]) {
          e.stopImmediatePropagation();
          e.preventDefault();
          cancelBtns[isTranslator].click();
          const valueBox = document.querySelector('.key-suggestion-value-box');
          if (valueBox) valueBox.focus();
        }
      }
      return;
    }
    
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      submitScrollDown();
      return;
    }
    return;
  }
  
  if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
    e.preventDefault();
    e.stopPropagation();
    quickApply(-1);
    return;
  }
  
  if (e.key === 'y' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
    const isInput = input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.isContentEditable;
    if (!isInput) {
      e.preventDefault();
      quickApply(-1);
      return;
    }
  }
  
  if (e.ctrlKey && (e.key === 'a' || e.key === 'A') && !e.shiftKey && !e.metaKey && !e.altKey) {
    if (window.location.href.includes('/import')) {
      const phrases = document.querySelectorAll('.tr-plain-key-row');
      const total = phrases.length > 50 ? 50 : phrases.length;
      const selectedAll = total === document.querySelectorAll('.tr-plain-key-row.selected').length;
      for (let i = 0; i < total; i++) {
        if (selectedAll) {
          phrases[i].click();
        } else {
          if (!phrases[i].classList.contains('selected')) {
            phrases[i].click();
          }
        }
      }
    } else {
      e.preventDefault();
      addTranslation();
    }
    return;
  }
  
  if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
    const isInput = input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.isContentEditable;
    if (!isInput) {
      e.preventDefault();
      addTranslation();
      return;
    }
  }
  
  if (e.ctrlKey && (e.key === 'e' || e.key === 'E') && !e.shiftKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    editTranslation();
    return;
  }
  
  if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
    const isInput = input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.isContentEditable;
    if (!isInput) {
      e.preventDefault();
      editTranslation();
      return;
    }
  }

  if (e.ctrlKey && (e.key === 'm' || e.key === 'M') && !e.shiftKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    let selectedText = '';
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== end) {
        selectedText = input.value.substring(start, end);
        const newText = selectedText.replace(/\*/g, '');
        const value = input.value;
        input.value = value.substring(0, start) + newText + value.substring(end);
        input.setSelectionRange(start, start + newText.length);
      } else {
        const value = input.value;
        const newValue = value.replace(/\*/g, '');
        if (newValue !== value) {
          const cursorPos = input.selectionStart;
          input.value = newValue;
          input.setSelectionRange(cursorPos, cursorPos);
        }
      }
    } else if (input.isContentEditable) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
        if (selectedText) {
          const newText = selectedText.replace(/\*/g, '');
          range.deleteContents();
          range.insertNode(document.createTextNode(newText));
        } else {
          const textContent = input.textContent || '';
          const newText = textContent.replace(/\*/g, '');
          if (newText !== textContent) {
            input.textContent = newText;
          }
        }
      }
    }
    return;
  }

  if (e.ctrlKey && (e.key === 'i' || e.key === 'I') && !e.shiftKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    let selectedText = '';
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== end) {
        selectedText = input.value.substring(start, end);
        const newText = selectedText.toUpperCase();
        const value = input.value;
        input.value = value.substring(0, start) + newText + value.substring(end);
        input.setSelectionRange(start, start + newText.length);
      }
    } else if (input.isContentEditable) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
        if (selectedText) {
          const newText = selectedText.toUpperCase();
          range.deleteContents();
          range.insertNode(document.createTextNode(newText));
        }
      }
    }
    return;
  }

  if (e.ctrlKey && e.key === '*' && !e.shiftKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    let selectedText = '';
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== end) {
        selectedText = input.value.substring(start, end);
      } else {
        selectedText = 'token';
      }
      const wrapped = `**${selectedText}**`;
      const value = input.value;
      input.value = value.substring(0, start) + wrapped + value.substring(end);
      input.setSelectionRange(start + 2, start + 2 + selectedText.length);
    } else if (input.isContentEditable) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString() || 'token';
        const wrapped = `**${selectedText}**`;
        range.deleteContents();
        range.insertNode(document.createTextNode(wrapped));
        range.setStart(range.startContainer, range.startOffset + 2);
        range.setEnd(range.startContainer, range.startOffset + 2 + selectedText.length);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    return;
  }
  

  if (emojiPopup && emojiPopup.style.display !== 'none') {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedEmojiIndex = Math.min(selectedEmojiIndex + 1, getFilteredEmojis().length - 1);
      updateEmojiSelection();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedEmojiIndex = Math.max(selectedEmojiIndex - 1, 0);
      updateEmojiSelection();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      selectEmoji();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideEmojiPopup();
      return;
    }
  }
}

function handleAutoReplace(e) {
  const input = e.target;
  let value = input.value || input.textContent || '';
  
  const replacements = {
    '--': '—',
    '...': '…',
    '<<': '«',
    '>>': '»',
    ' tg ': ' Telegram ',
    ' tdesk ': ' Telegram Desktop ',
    ' tgfa ': ' Telegram for Android ',
    ' tgx ': ' Telegram X ',
    ' tgp ': ' Telegram Premium '
  };

  let changed = false;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    if (value.includes(pattern)) {
      value = value.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      changed = true;
    }
  }

  if (changed) {
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      const cursorPos = input.selectionStart;
      input.value = value;
      input.setSelectionRange(cursorPos, cursorPos);
    } else {
      input.textContent = value;
    }
  }
}

function handleEmojiInput(e) {
  const input = e.target;
  let value = input.value || input.textContent || '';
  
  if (e.inputType === 'insertText' && e.data === ':') {
    currentInput = input;
    emojiFilter = '';
    selectedEmojiIndex = 0;
    setTimeout(() => {
      const newValue = input.value || input.textContent || '';
      if (newValue.endsWith(':')) {
        showEmojiPopup(input);
      }
    }, 50);
    return;
  }
  
  if (value.includes(':')) {
    const match = value.match(/:([^:\s\n]*)$/);
    if (match) {
      currentInput = input;
      emojiFilter = match[1].toLowerCase();
      if (emojiFilter.length >= 0 && Object.keys(emojiList).length > 0) {
        if (!emojiPopup || emojiPopup.style.display === 'none') {
          showEmojiPopup(input);
        } else {
          updateEmojiPopup();
        }
      }
    } else {
      if (currentInput === input && emojiPopup && emojiPopup.style.display !== 'none') {
        hideEmojiPopup();
      }
    }
  } else {
    if (currentInput === input && emojiPopup && emojiPopup.style.display !== 'none') {
      hideEmojiPopup();
    }
  }
}

function showEmojiPopup(input) {
  if (Object.keys(emojiList).length === 0) {
    console.warn('Emoji list not loaded yet');
    return;
  }

  if (!emojiPopup) {
    emojiPopup = document.createElement('div');
    emojiPopup.id = 'tanjungo-emoji-popup';
    emojiPopup.className = 'tanjungo-emoji-popup';
    document.body.appendChild(emojiPopup);
  }

  const rect = input.getBoundingClientRect();
  emojiPopup.style.display = 'block';
  emojiPopup.style.position = 'absolute';
  emojiPopup.style.zIndex = '10000';
  emojiPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  emojiPopup.style.left = `${rect.left + window.scrollX}px`;

  updateEmojiPopup();
}

function updateEmojiPopup() {
  if (!emojiPopup) return;

  const filtered = getFilteredEmojis();
  selectedEmojiIndex = Math.min(selectedEmojiIndex, filtered.length - 1);

  // Clear existing content
  emojiPopup.textContent = '';
  
  // Create elements safely
  filtered.slice(0, 10).forEach((emoji, index) => {
    const item = document.createElement('div');
    item.className = `emoji-item ${index === selectedEmojiIndex ? 'selected' : ''}`;
    item.setAttribute('data-index', index);
    
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji';
    emojiSpan.textContent = emoji.emoji;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'emoji-name';
    nameSpan.textContent = emoji.keyword;
    
    item.appendChild(emojiSpan);
    item.appendChild(nameSpan);
    
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectedEmojiIndex = index;
      selectEmoji();
    });
    
    emojiPopup.appendChild(item);
  });
}

function getFilteredEmojis() {
  if (!emojiFilter) {
    return Object.entries(emojiList).slice(0, 10).map(([keyword, emoji]) => ({ keyword, emoji }));
  }

  return Object.entries(emojiList)
    .filter(([keyword]) => keyword.toLowerCase().includes(emojiFilter))
    .slice(0, 10)
    .map(([keyword, emoji]) => ({ keyword, emoji }));
}

function updateEmojiSelection() {
  if (!emojiPopup) return;
  emojiPopup.querySelectorAll('.emoji-item').forEach((item, index) => {
    if (index === selectedEmojiIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function selectEmoji() {
  if (!currentInput || !emojiPopup) return;

  const filtered = getFilteredEmojis();
  if (filtered[selectedEmojiIndex]) {
    const emoji = filtered[selectedEmojiIndex].emoji;
    
    let value = currentInput.value || currentInput.textContent || '';
    const lastColon = value.lastIndexOf(':');
    if (lastColon !== -1) {
      let endIndex = value.length;
      for (let i = lastColon + 1; i < value.length; i++) {
        if (value[i] === ' ' || value[i] === ':' || value[i] === '\n') {
          endIndex = i;
          break;
        }
      }
      
      const before = value.substring(0, lastColon);
      const after = value.substring(endIndex);
      const newValue = before + emoji + (after.startsWith(' ') ? after : (after ? ' ' + after : ''));
      
      if (currentInput.tagName === 'INPUT' || currentInput.tagName === 'TEXTAREA') {
        const cursorPos = lastColon + emoji.length + (after.startsWith(' ') ? 0 : (after ? 1 : 0));
        currentInput.value = newValue;
        currentInput.setSelectionRange(cursorPos, cursorPos);
        setTimeout(() => {
          if (currentInput && document.body.contains(currentInput)) {
            currentInput.focus();
          }
        }, 10);
      } else {
        currentInput.textContent = newValue;
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(currentInput.firstChild || currentInput, Math.min(lastColon + emoji.length, newValue.length));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        setTimeout(() => {
          if (currentInput && document.body.contains(currentInput)) {
            currentInput.focus();
          }
        }, 10);
      }
    }
  }

  hideEmojiPopup();
  
  setTimeout(() => {
    if (currentInput && document.body.contains(currentInput)) {
      try {
        currentInput.focus();
        if (currentInput.tagName === 'INPUT' || currentInput.tagName === 'TEXTAREA') {
          const len = currentInput.value.length;
          currentInput.setSelectionRange(len, len);
        }
      } catch (err) {
        console.warn('Error focusing input:', err);
      }
    }
  }, 50);
}

function hideEmojiPopup() {
  if (emojiPopup) {
    emojiPopup.style.display = 'none';
  }
  currentInput = null;
  emojiFilter = '';
  selectedEmojiIndex = 0;
}

function insertTextAtCursor(element, text) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const value = element.value;
    element.value = value.substring(0, start) + text + value.substring(end);
    element.setSelectionRange(start + text.length, start + text.length);
  } else if (element.isContentEditable) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

document.addEventListener('click', (e) => {
  if (emojiPopup && !emojiPopup.contains(e.target) && e.target !== currentInput) {
    hideEmojiPopup();
  }
});

(function injectEmojiStyles() {
  if (document.getElementById('tanjungo-emoji-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'tanjungo-emoji-styles';
  style.textContent = `
    .tanjungo-emoji-popup {
      position: absolute;
      z-index: 10000;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .tanjungo-emoji-popup .emoji-item {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      cursor: pointer;
      border-radius: 4px;
      color: #e8e8e8;
    }
    
    .tanjungo-emoji-popup .emoji-item:hover,
    .tanjungo-emoji-popup .emoji-item.selected {
      background-color: #4a4a4a;
    }
    
    .tanjungo-emoji-popup .emoji {
      font-size: 20px;
      margin-right: 8px;
      width: 24px;
      text-align: center;
    }
    
    .tanjungo-emoji-popup .emoji-name {
      font-size: 13px;
      color: #e8e8e8;
    }
  `;
  document.head.appendChild(style);
})();
