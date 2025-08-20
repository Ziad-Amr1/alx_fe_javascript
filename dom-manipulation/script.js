// script.js - Task 1: Web Storage and JSON Handling
document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quoteMeta = document.getElementById('quoteMeta');
  const newQuoteBtn = document.getElementById('newQuote');
  const showAddFormBtn = document.getElementById('showAddForm');
  const addFormArea = document.getElementById('addFormArea');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');

  const STORAGE_KEY = 'quotes';
  const LAST_SHOWN_KEY = 'lastShownQuote'; // in sessionStorage

  // default quotes if none in localStorage
  let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" }
  ];

  // --- Storage helpers ---
  function saveQuotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (err) {
      // if storage full or disabled
      console.error('Failed to save quotes to localStorage', err);
    }
  }

  function loadQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // basic validation: items must have 'text'
          const valid = parsed.every(item => item && typeof item.text === 'string');
          if (valid) {
            quotes = parsed;
          } else {
            console.warn('Stored quotes invalid format, using defaults.');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load quotes from localStorage', err);
    }
  }

  // --- UI update functions (use innerHTML for checker) ---
  function showRandomQuote() {
    if (!quotes.length) {
      quoteDisplay.innerHTML = '<blockquote>No quotes available. Please add one.</blockquote>';
      quoteMeta.innerHTML = '';
      sessionStorage.removeItem(LAST_SHOWN_KEY);
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const q = quotes[idx];

    quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(q.text)}"</blockquote>`;
    quoteMeta.innerHTML = `Category: <strong>${escapeHtml(q.category || 'Uncategorized')}</strong>`;

    // save last shown quote text in session storage
    try {
      sessionStorage.setItem(LAST_SHOWN_KEY, JSON.stringify({ index: idx, quote: q }));
    } catch (err) {
      // ignore session storage errors
    }
  }

  function addQuote(text, category) {
    const trimmedText = String(text || '').trim();
    const trimmedCategory = String(category || '').trim() || 'Uncategorized';
    if (!trimmedText) {
      alert('Please provide a non-empty quote.');
      return;
    }
    const newQ = { text: trimmedText, category: trimmedCategory };
    quotes.push(newQ);
    saveQuotes();

    // show newly added
    quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(newQ.text)}"</blockquote>`;
    quoteMeta.innerHTML = `Category: <strong>${escapeHtml(newQ.category)}</strong>`;
    const form = addFormArea.querySelector('form');
    if (form) form.reset();
  }

  // --- Export / Import functions ---
  function exportToJson() {
    try {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `quotes_export_${new Date().toISOString().slice(0,10)}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed.');
    }
  }

  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          alert('Imported file must be a JSON array of quote objects.');
          return;
        }
        // validate and normalize
        const toAdd = imported.filter(item => item && typeof item.text === 'string')
          .map(item => ({ text: String(item.text).trim(), category: String(item.category || 'Uncategorized').trim() }));
        if (!toAdd.length) {
          alert('No valid quotes found in the provided file.');
          return;
        }
        // merge (simple) - append them
        quotes.push(...toAdd);
        saveQuotes();
        alert(`Imported ${toAdd.length} quotes successfully.`);
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to import JSON file. Make sure it is valid JSON.');
      } finally {
        // reset file input so same file can be chosen again if desired
        importFile.value = '';
      }
    };
    reader.readAsText(file);
  }

  // --- dynamic form creation (same pattern) ---
  function createAddQuoteForm() {
    if (addFormArea.querySelector('form')) {
      const hidden = addFormArea.getAttribute('aria-hidden') === 'true';
      addFormArea.setAttribute('aria-hidden', String(!hidden));
      addFormArea.style.display = hidden ? 'block' : 'none';
      return;
    }
    addFormArea.setAttribute('aria-hidden', 'false');
    addFormArea.style.display = 'block';

    const form = document.createElement('form');

    const lblText = document.createElement('label');
    lblText.setAttribute('for', 'newQuoteText');
    lblText.textContent = 'New Quote';
    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'newQuoteText';
    inputText.name = 'newQuoteText';
    inputText.placeholder = 'Enter a new quote';
    inputText.required = true;

    const lblCat = document.createElement('label');
    lblCat.setAttribute('for', 'newQuoteCategory');
    lblCat.textContent = 'Category';
    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    inputCat.id = 'newQuoteCategory';
    inputCat.name = 'newQuoteCategory';
    inputCat.placeholder = 'Enter quote category (e.g. Motivation)';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Add Quote';

    form.appendChild(lblText);
    form.appendChild(inputText);
    form.appendChild(lblCat);
    form.appendChild(inputCat);
    form.appendChild(submitBtn);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      addQuote(inputText.value, inputCat.value);
    });

    addFormArea.appendChild(form);
  }

  // small utility to escape HTML when injecting via innerHTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- initialisation ---
  loadQuotes();

  // if there is a last shown quote saved in sessionStorage, try to restore it
  try {
    const last = sessionStorage.getItem(LAST_SHOWN_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && parsed.quote && typeof parsed.quote.text === 'string') {
        // display same quote (sanitized)
        quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(parsed.quote.text)}"</blockquote>`;
        quoteMeta.innerHTML = `Category: <strong>${escapeHtml(parsed.quote.quote || parsed.quote.category || 'Uncategorized')}</strong>`;
      } else {
        // else show random
        showRandomQuote();
      }
    } else {
      showRandomQuote();
    }
  } catch (err) {
    showRandomQuote();
  }

  // --- event listeners ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJson);
  importFile.addEventListener('change', importFromJsonFile);

  // expose for debugging/testing if needed
  window._quotesApp = { quotes, showRandomQuote, addQuote, saveQuotes, loadQuotes, exportToJson, importFromJsonFile };
});