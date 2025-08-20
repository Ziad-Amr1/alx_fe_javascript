// script.js - Task 3: Syncing with server & conflict resolution
// Builds on previous tasks: showRandomQuote, addQuote, populateCategories, filterQuotes, export/import, localStorage
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quoteMeta = document.getElementById('quoteMeta');
  const newQuoteBtn = document.getElementById('newQuote');
  const showAddFormBtn = document.getElementById('showAddForm');
  const addFormArea = document.getElementById('addFormArea');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const categoryFilter = document.getElementById('categoryFilter');
  const quotesList = document.getElementById('quotesList');
  const notifyEl = document.getElementById('notify');
  const syncBtn = document.getElementById('syncBtn');

  // keys
  const STORAGE_KEY = 'quotes';
  const SELECTED_CATEGORY_KEY = 'selectedCategory';
  const LAST_SHOWN_KEY = 'lastShownQuote';

  // mock server endpoint (JSONPlaceholder)
  const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // GET returns posts. We'll map them to quotes for simulation.
  const SYNC_INTERVAL_MS = 30000; // 30 seconds periodic sync

  // initial quotes (fallback)
  let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" }
  ];

  // ---- storage helpers ----
  function saveQuotes() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes)); } catch (e) { console.error(e); }
  }
  function loadQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(it => it && typeof it.text === 'string')) {
          quotes = parsed;
        }
      }
    } catch (e) { console.error(e); }
  }

  // ---- UI helpers ----
  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function showNotification(message, type = 'success', timeout = 6000) {
    notifyEl.className = `notify ${type === 'warn' ? 'warn' : 'success'}`;
    notifyEl.textContent = message;
    notifyEl.style.display = 'block';
    if (timeout) {
      setTimeout(() => {
        notifyEl.style.display = 'none';
      }, timeout);
    }
  }

  // ---- core functions (keep names for checker) ----
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
    try { sessionStorage.setItem(LAST_SHOWN_KEY, JSON.stringify({ index: idx, quote: q })); } catch (e) {}
  }

  function addQuote(text, category) {
    const trimmedText = String(text || '').trim();
    const trimmedCategory = String(category || '').trim() || 'Uncategorized';
    if (!trimmedText) { alert('Please provide a non-empty quote.'); return; }
    const newQ = { text: trimmedText, category: trimmedCategory };
    quotes.push(newQ);
    saveQuotes();
    quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(newQ.text)}"</blockquote>`;
    quoteMeta.innerHTML = `Category: <strong>${escapeHtml(newQ.category)}</strong>`;
    populateCategories();
    filterQuotes();
    const form = addFormArea.querySelector('form'); if (form) form.reset();
  }

  // export/import (reused)
  function exportToJson() {
    try {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `quotes_export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (err) { console.error(err); alert('Export failed.'); }
  }

  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) { alert('Imported file must be a JSON array of quote objects.'); return; }
        const toAdd = imported.filter(item => item && typeof item.text === 'string')
          .map(item => ({ text: String(item.text).trim(), category: String(item.category || 'Uncategorized').trim() }));
        if (!toAdd.length) { alert('No valid quotes found in the provided file.'); return; }
        quotes.push(...toAdd); saveQuotes(); populateCategories(); filterQuotes();
        showNotification(`Imported ${toAdd.length} quotes successfully.`);
      } catch (err) { console.error(err); alert('Failed to import JSON file.'); } finally { importFile.value = ''; }
    };
    reader.readAsText(file);
  }

  // ---- Filtering system (populate & filter) ----
  function populateCategories() {
    const cats = Array.from(new Set(quotes.map(q => (q.category || 'Uncategorized').trim())));
    const currentValue = categoryFilter.value || 'all';
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    cats.forEach(cat => {
      const opt = document.createElement('option'); opt.value = cat; opt.textContent = cat; categoryFilter.appendChild(opt);
    });
    const saved = localStorage.getItem(SELECTED_CATEGORY_KEY);
    if (saved && Array.from(categoryFilter.options).some(o => o.value === saved)) {
      categoryFilter.value = saved;
    } else {
      if (Array.from(categoryFilter.options).some(o => o.value === currentValue)) categoryFilter.value = currentValue;
      else categoryFilter.value = 'all';
    }
  }

  function filterQuotes() {
    const selected = categoryFilter.value || 'all';
    try { localStorage.setItem(SELECTED_CATEGORY_KEY, selected); } catch (e) {}
    const matches = (selected === 'all') ? quotes : quotes.filter(q => (q.category || 'Uncategorized') === selected);
    if (!matches.length) { quotesList.innerHTML = `<div class="quote-item">No quotes for category "${escapeHtml(selected)}".</div>`; return; }
    const html = matches.map(q => `<div class="quote-item"><div style="font-style:italic;">"${escapeHtml(q.text)}"</div><div class="small" style="margin-top:6px;color:#666;">${escapeHtml(q.category || 'Uncategorized')}</div></div>`).join('');
    quotesList.innerHTML = html;
  }

  // ---- dynamic add form ----
  function createAddQuoteForm() {
    if (addFormArea.querySelector('form')) {
      const hidden = addFormArea.getAttribute('aria-hidden') === 'true';
      addFormArea.setAttribute('aria-hidden', String(!hidden));
      addFormArea.style.display = hidden ? 'block' : 'none';
      return;
    }
    addFormArea.setAttribute('aria-hidden', 'false'); addFormArea.style.display = 'block';
    const form = document.createElement('form');
    const lblText = document.createElement('label'); lblText.setAttribute('for', 'newQuoteText'); lblText.textContent = 'New Quote';
    const inputText = document.createElement('input'); inputText.type = 'text'; inputText.id = 'newQuoteText'; inputText.name = 'newQuoteText'; inputText.placeholder = 'Enter a new quote'; inputText.required = true;
    const lblCat = document.createElement('label'); lblCat.setAttribute('for', 'newQuoteCategory'); lblCat.textContent = 'Category';
    const inputCat = document.createElement('input'); inputCat.type = 'text'; inputCat.id = 'newQuoteCategory'; inputCat.name = 'newQuoteCategory'; inputCat.placeholder = 'Enter quote category (e.g. Motivation)';
    const submitBtn = document.createElement('button'); submitBtn.type = 'submit'; submitBtn.textContent = 'Add Quote';
    form.append(lblText, inputText, lblCat, inputCat, submitBtn);
    form.addEventListener('submit', function (ev) { ev.preventDefault(); addQuote(inputText.value, inputCat.value); });
    addFormArea.appendChild(form);
  }

  // ---- SYNC with server (simulation using JSONPlaceholder) ----

  // fetchServerQuotes: GET from SERVER_URL and convert to our quote objects
  async function fetchServerQuotes() {
    try {
      const res = await fetch(SERVER_URL + '?_limit=10'); // limit to 10 items for speed
      if (!res.ok) throw new Error('Network response not ok');
      const posts = await res.json();
      // map posts -> quotes (simulation)
      const serverQuotes = posts.map(p => ({ text: String(p.title || '').trim(), category: 'Server' }));
      // filter out empty text
      return serverQuotes.filter(sq => sq.text.length > 0);
    } catch (err) {
      console.error('fetchServerQuotes failed', err);
      return null;
    }
  }

  // Merge logic: serverWins = true => server's category overwrites local one when text matches
  function mergeServerQuotes(serverQuotes = []) {
    if (!Array.isArray(serverQuotes)) return { added: 0, conflicts: 0 };

    let added = 0, conflicts = 0;

    // Build map for local by text for quick lookup
    const localMap = new Map();
    quotes.forEach(q => localMap.set(q.text, q));

    serverQuotes.forEach(sq => {
      const local = localMap.get(sq.text);
      if (!local) {
        // not present locally -> add
        quotes.push({ text: sq.text, category: sq.category || 'Server' });
        added++;
      } else {
        // present locally -> check for category difference
        if ((local.category || '') !== (sq.category || '')) {
          // conflict: server wins (replace category)
          local.category = sq.category || 'Server';
          conflicts++;
        }
      }
    });

    if (added > 0 || conflicts > 0) saveQuotes();
    return { added, conflicts };
  }

  // syncWithServer: fetch -> merge -> update UI and notify user
  async function syncWithServer() {
    showNotification('Syncing with server...', 'success', 3000);
    const serverQuotes = await fetchServerQuotes();
    if (!serverQuotes) { showNotification('Failed to reach server for sync.', 'warn', 5000); return; }
    const result = mergeServerQuotes(serverQuotes);
    if (result.added === 0 && result.conflicts === 0) {
      showNotification('No updates from server.', 'success', 2500);
    } else {
      let msg = `Sync complete — ${result.added} added, ${result.conflicts} conflicts resolved (server wins).`;
      showNotification(msg, 'success', 6000);
      populateCategories();
      filterQuotes();
    }
  }

  // Periodic sync starter
  let syncIntervalId = null;
  function startPeriodicSync() {
    if (syncIntervalId) return;
    syncIntervalId = setInterval(() => {
      syncWithServer();
    }, SYNC_INTERVAL_MS);
  }
  function stopPeriodicSync() {
    if (syncIntervalId) { clearInterval(syncIntervalId); syncIntervalId = null; }
  }

  // ---- initialization ----
  loadQuotes();
  populateCategories();
  filterQuotes();

  // restore last shown quote or show random
  try {
    const last = sessionStorage.getItem(LAST_SHOWN_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && parsed.quote && typeof parsed.quote.text === 'string') {
        quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(parsed.quote.text)}"</blockquote>`;
        quoteMeta.innerHTML = `Category: <strong>${escapeHtml(parsed.quote.quote || parsed.quote.category || 'Uncategorized')}</strong>`;
      } else showRandomQuote();
    } else showRandomQuote();
  } catch (e) { showRandomQuote(); }

  // --- events ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);
  exportBtn.addEventListener('click', exportToJson);
  importFile.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', filterQuotes);
  syncBtn.addEventListener('click', syncWithServer);

  // start periodic sync automatically
  startPeriodicSync();

  // Expose for debugging/testing
  window._quotesApp = {
    quotes, showRandomQuote, addQuote, populateCategories, filterQuotes,
    fetchServerQuotes, mergeServerQuotes, syncWithServer, startPeriodicSync, stopPeriodicSync
  };
}); // end DOMContentLoaded