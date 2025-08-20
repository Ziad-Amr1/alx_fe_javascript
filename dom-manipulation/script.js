// script.js - Final fix for checker
document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quoteMeta = document.getElementById('quoteMeta');
  const newQuoteBtn = document.getElementById('newQuote');
  const showAddFormBtn = document.getElementById('showAddForm');
  const addFormArea = document.getElementById('addFormArea');

  // initial quotes
  const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" }
  ];

  /**
   * showRandomQuote
   * - selects random quote and updates DOM with innerHTML
   */
  function showRandomQuote() {
    if (!quotes.length) {
      quoteDisplay.innerHTML = '<blockquote>No quotes available. Please add one.</blockquote>';
      quoteMeta.innerHTML = '';
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const q = quotes[idx];

    quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(q.text)}"</blockquote>`;
    quoteMeta.innerHTML = `Category: <strong>${escapeHtml(q.category || 'Uncategorized')}</strong>`;
  }

  /**
   * addQuote
   */
  function addQuote(text, category) {
    const trimmedText = String(text || '').trim();
    const trimmedCategory = String(category || '').trim() || 'Uncategorized';

    if (!trimmedText) {
      alert('Please provide a non-empty quote.');
      return;
    }

    const newQ = { text: trimmedText, category: trimmedCategory };
    quotes.push(newQ);

    quoteDisplay.innerHTML = `<blockquote style="margin:0;font-style:italic;">"${escapeHtml(newQ.text)}"</blockquote>`;
    quoteMeta.innerHTML = `Category: <strong>${escapeHtml(newQ.category)}</strong>`;

    const form = addFormArea.querySelector('form');
    if (form) form.reset();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
    inputText.required = true;

    const lblCat = document.createElement('label');
    lblCat.setAttribute('for', 'newQuoteCategory');
    lblCat.textContent = 'Category';
    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    inputCat.id = 'newQuoteCategory';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Add Quote';

    form.append(lblText, inputText, lblCat, inputCat, submitBtn);

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      addQuote(inputText.value, inputCat.value);
    });

    addFormArea.appendChild(form);
  }

  // event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);

  // initial display
  showRandomQuote();

  // expose globally for testing
  window._quotesApp = { quotes, showRandomQuote, addQuote };
});