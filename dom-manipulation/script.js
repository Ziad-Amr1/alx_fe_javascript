// script.js
// Task 0: Dynamic Quote Generator (advanced DOM manipulation)
// - showRandomQuote(): يختار اقتباس عشوائي ويعرضه
// - createAddQuoteForm(): يبني فورم الإضافة باستخدام DOM API
// - addQuote(): يضيف اقتباسًا جديدًا للمصفوفة ويعرضه

document.addEventListener('DOMContentLoaded', () => {
  // العناصر الأساسية
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quoteMeta = document.getElementById('quoteMeta');
  const newQuoteBtn = document.getElementById('newQuote');
  const showAddFormBtn = document.getElementById('showAddForm');
  const addFormArea = document.getElementById('addFormArea');

  // مصفوفة الاقتباسات الأولية (كل عنصر: { text, category })
  const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
  ];

  // عرض اقتباس (DOM rendering)
  function displayQuote(quoteObj) {
    // نمسح العرض القديم
    while (quoteDisplay.firstChild) quoteDisplay.removeChild(quoteDisplay.firstChild);

    // عنصر النص
    const q = document.createElement('blockquote');
    q.style.margin = "0";
    q.style.fontStyle = "italic";
    q.textContent = `"${quoteObj.text}"`;

    // إضافة العناصر إلى DOM
    quoteDisplay.appendChild(q);

    // ميتا: الفئة
    quoteMeta.textContent = `Category: ${quoteObj.category || 'Uncategorized'}`;
  }

  // اختيار عرض اقتباس عشوائي
  function showRandomQuote() {
    if (quotes.length === 0) {
      displayQuote({ text: "No quotes available. Please add one.", category: "" });
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const quote = quotes[idx];
    displayQuote(quote);
  }

  // دالة لإضافة اقتباس جديد برمجياً
  function addQuote(text, category) {
    const trimmedText = String(text || '').trim();
    const trimmedCategory = String(category || '').trim() || 'Uncategorized';

    if (trimmedText.length === 0) {
      alert('Please provide a non-empty quote.');
      return;
    }

    // Append to quotes array
    const newQ = { text: trimmedText, category: trimmedCategory };
    quotes.push(newQ);

    // عرض الاقتباس المضاف الآن
    displayQuote(newQ);

    // لو الفورم موجود: إعادة تعيين الحقول
    const form = addFormArea.querySelector('form');
    if (form) form.reset();
  }

  // إنشاء الفورم ديناميكياً باستخدام DOM API
  function createAddQuoteForm() {
    // إذا الفورم موجود مسبقاً لا ننشئ واحداً جديداً بل نعرض/نخفي
    if (addFormArea.querySelector('form')) {
      // toggle visibility
      const hidden = addFormArea.getAttribute('aria-hidden') === 'true';
      addFormArea.setAttribute('aria-hidden', String(!hidden));
      addFormArea.style.display = hidden ? 'block' : 'none';
      return;
    }

    // فصل الحاوية
    addFormArea.setAttribute('aria-hidden', 'false');
    addFormArea.style.display = 'block';

    // إنشاء العناصر
    const form = document.createElement('form');

    // Label + input for quote text
    const lblText = document.createElement('label');
    lblText.setAttribute('for', 'newQuoteText');
    lblText.textContent = 'New Quote';
    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'newQuoteText';
    inputText.name = 'newQuoteText';
    inputText.placeholder = 'Enter a new quote';
    inputText.required = true;

    // Label + input for category
    const lblCat = document.createElement('label');
    lblCat.setAttribute('for', 'newQuoteCategory');
    lblCat.textContent = 'Category';
    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    inputCat.id = 'newQuoteCategory';
    inputCat.name = 'newQuoteCategory';
    inputCat.placeholder = 'Enter quote category (e.g. Motivation)';

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Add Quote';

    // Arrange nodes in form
    form.appendChild(lblText);
    form.appendChild(inputText);
    form.appendChild(lblCat);
    form.appendChild(inputCat);
    form.appendChild(submitBtn);

    // Handle submission
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      addQuote(inputText.value, inputCat.value);
    });

    // Append form to addFormArea
    addFormArea.appendChild(form);
  }

  // الأحداث
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showAddFormBtn.addEventListener('click', createAddQuoteForm);

  // عرض اقتباس أولي عند بدء التشغيل
  showRandomQuote();

  // Expose some functions on window for debugging (optional)
  window._quotesApp = {
    quotes,
    showRandomQuote,
    addQuote,
    createAddQuoteForm
  };
});