// ============================================
// SCEM - Smart Circular Economy Market
// script.js - Complete Final Version
// ============================================

const API = 'http://localhost:8082/api/waste';

// ── Dark Mode ────────────────────────────────
function toggleDark() {
  document.body.classList.toggle('dark-mode');
  const btn = document.querySelector('.dark-toggle');
  const isDark = document.body.classList.contains('dark-mode');
  btn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
}

// Load dark mode preference on page load
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  const btn = document.querySelector('.dark-toggle');
  if (btn) btn.textContent = '☀️';
}

// ── Toast Notification ───────────────────────
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Emoji & Badge helpers ────────────────────
const emoji = {
  Plastic:  '🧴',
  Glass:    '🪞',
  Metal:    '🔩',
  Organic:  '🌱',
  'E-waste':'📱'
};

const badgeClass = {
  Plastic:  'badge-plastic',
  Glass:    'badge-glass',
  Metal:    'badge-metal',
  Organic:  'badge-organic',
  'E-waste':'badge-ewaste'
};

// ── Format Date ──────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── Animate Counter ──────────────────────────
function animateCount(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = current;
    }
  }, 40);
}

// ============================================
// PAGE: HOME (index.html)
// ============================================
const statTotal = document.getElementById('total-items');

if (statTotal) {
  fetch(API)
    .then(res => res.json())
    .then(items => {
      const totalKg   = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      const types     = new Set(items.map(i => i.type)).size;
      const co2       = Math.round(totalKg * 2.5);

      animateCount('total-items', items.length);
      animateCount('total-kg',    Math.round(totalKg));
      animateCount('total-types', types);
      animateCount('co2-saved',   co2);

      animateCount('impact-items', items.length);
      animateCount('impact-kg',    Math.round(totalKg));
      animateCount('impact-co2',   co2);
    })
    .catch(() => {
      console.warn('Backend not running — stats unavailable');
    });
}

// ============================================
// PAGE: ADD WASTE (add_waste.html)
// ============================================
const form = document.getElementById('wasteForm');

if (form) {

  // Live Preview
  const nameInput     = document.getElementById('itemName');
  const typeInput     = document.getElementById('itemType');
  const qtyInput      = document.getElementById('itemQty');
  const locationInput = document.getElementById('itemLocation');
  const previewBox    = document.getElementById('preview-box');
  const previewText   = document.getElementById('preview-text');

  function updatePreview() {
    const name     = nameInput?.value;
    const type     = typeInput?.value;
    const qty      = qtyInput?.value;
    const location = locationInput?.value;

    if (name && type && qty && location) {
      previewBox.style.display = 'block';
      previewText.textContent  =
        ` ${emoji[type] || '♻️'} ${name} | ${type} | ${qty} kg | 📍 ${location}`;
    } else {
      previewBox.style.display = 'none';
    }
  }

  nameInput?.addEventListener('input', updatePreview);
  typeInput?.addEventListener('change', updatePreview);
  qtyInput?.addEventListener('input', updatePreview);
  locationInput?.addEventListener('input', updatePreview);

  // Form Submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = '⏳ Saving...';
    submitBtn.disabled = true;

    const newItem = {
      name:     nameInput.value,
      type:     typeInput.value,
      quantity: parseFloat(qtyInput.value),
      location: locationInput.value,
      addedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newItem)
      });

      if (response.ok) {
        showToast('✅ Waste item saved successfully!');
        form.reset();
        previewBox.style.display = 'none';
        submitBtn.textContent = '♻️ Submit Waste Item';
        submitBtn.disabled = false;
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      showToast('❌ Cannot connect to server! Is Spring Boot running?');
      submitBtn.textContent = '♻️ Submit Waste Item';
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// PAGE: VIEW WASTE (view_waste.html)
// ============================================
const cardContainer = document.getElementById('card-container');
let allItems = [];

if (cardContainer) {
  loadWasteItems();
}

async function loadWasteItems() {
  try {
    const res   = await fetch(API);
    allItems    = await res.json();
    renderCards(allItems);
  } catch (error) {
    cardContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">❌</span>
        <h3>Cannot connect to server!</h3>
        <p>Make sure Spring Boot is running on port 8082.</p>
      </div>`;
  }
}

function renderCards(items) {
  const countDisplay = document.getElementById('count-display');
  if (countDisplay) countDisplay.textContent = items.length;

  if (items.length === 0) {
    cardContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No waste items found!</h3>
        <p><a href="add_waste.html" style="color:var(--green-mid);">Add your first item</a></p>
      </div>`;
    return;
  }

  cardContainer.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'waste-card';
    card.style.animationDelay = `${index * 0.08}s`;
    card.dataset.id       = item.id;
    card.dataset.name     = (item.name     || '').toLowerCase();
    card.dataset.location = (item.location || '').toLowerCase();
    card.dataset.type     = (item.type     || '');

    card.innerHTML = `
      <h3>${emoji[item.type] || '♻️'} ${item.name}</h3>
      <p>🗂️ <strong>Type:</strong>
        <span class="type-badge ${badgeClass[item.type] || ''}">
          ${item.type}
        </span>
      </p>
      <p>⚖️ <strong>Quantity:</strong> ${item.quantity} kg</p>
      <p>📍 <strong>Location:</strong> ${item.location}</p>
      <div class="card-footer">
        <span class="card-date">📅 ${formatDate(item.addedDate)}</span>
        <button class="btn btn-danger"
          onclick="deleteWaste(${item.id}, this)">
          🗑️ Delete
        </button>
      </div>
    `;
    cardContainer.appendChild(card);
  });
}

// Filter / Search
function filterCards() {
  const search     = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filterType = document.getElementById('filterType')?.value || '';

  const filtered = allItems.filter(item => {
    const matchSearch =
      (item.name     || '').toLowerCase().includes(search) ||
      (item.location || '').toLowerCase().includes(search);
    const matchType =
      filterType === '' || item.type === filterType;
    return matchSearch && matchType;
  });

  renderCards(filtered);
}

// Delete Waste
async function deleteWaste(id, btn) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  btn.textContent  = '⏳';
  btn.disabled     = true;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });

    if (res.ok) {
      // Remove card from UI
      const card = btn.closest('.waste-card');
      card.style.transform = 'scale(0)';
      card.style.opacity   = '0';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        card.remove();
        allItems = allItems.filter(i => i.id !== id);
        const countDisplay = document.getElementById('count-display');
        if (countDisplay) countDisplay.textContent = allItems.length;
        showToast('🗑️ Item deleted successfully!');
      }, 300);
    } else {
      throw new Error('Delete failed');
    }
  } catch (error) {
    showToast('❌ Could not delete item!');
    btn.textContent = '🗑️ Delete';
    btn.disabled    = false;
  }
}

// ============================================
// PAGE: SUGGESTIONS (suggestion.html)
// ============================================
const aiBox = document.getElementById('ai-suggestion-box');

if (aiBox) {
  fetch(API)
    .then(res => res.json())
    .then(items => {
      if (items.length === 0) return;

      const lastItem = items[items.length - 1];

      // Show AI box
      aiBox.style.display = 'block';
      document.getElementById('ai-waste-name').textContent =
        `${emoji[lastItem.type] || '♻️'} ${lastItem.name} (${lastItem.type})`;

      // Fetch AI suggestions
      return fetch(`${API}/suggestions/${lastItem.type}`)
        .then(res => res.json())
        .then(suggestions => {
          const list = document.getElementById('ai-suggestion-list');
          list.innerHTML = '';
          suggestions.forEach(tip => {
            list.innerHTML += `<li>${tip}</li>`;
          });
        });
    })
    .then(() => {
      // Highlight matching card
      return fetch(API)
        .then(res => res.json())
        .then(items => {
          if (items.length === 0) return;
          const lastItem  = items[items.length - 1];
          const typeMap   = {
            Plastic:  'card-plastic',
            Glass:    'card-glass',
            Metal:    'card-metal',
            Organic:  'card-organic',
            'E-waste':'card-ewaste'
          };
          const cardId = typeMap[lastItem.type];
          if (cardId) {
            const card = document.getElementById(cardId);
            if (card) {
              card.classList.add('highlighted');
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              const banner = document.createElement('p');
              banner.style.cssText =
                'color:var(--green-mid);font-weight:700;margin-top:10px;font-size:13px;';
              banner.textContent = `💡 Matched your item: ${lastItem.name}`;
              card.appendChild(banner);
            }
          }
        });
    })
    .catch(err => console.error('Suggestions error:', err));
}
// ============================================
// GEMINI AI INTEGRATION
// ============================================

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function askGemini() {
  const input   = document.getElementById('geminiInput');
  const btn     = document.getElementById('geminiBtn');
  const loading = document.getElementById('gemini-loading');
  const result  = document.getElementById('gemini-result');
  const text    = document.getElementById('gemini-text');

  const userInput = input.value.trim();

  // Validation
  if (!userInput) {
    showToast('⚠️ Please type a waste item first!');
    return;
  }

  // Show loading
  btn.disabled      = true;
  btn.textContent   = '⏳ Thinking...';
  loading.style.display = 'block';
  result.style.display  = 'none';

  // Prompt for Gemini
  const prompt = `
    You are an expert in waste management and circular economy.
    
    A user has this waste item: "${userInput}"
    
    Give 5 smart, practical and creative suggestions on how to 
    reuse, recycle or dispose this waste item responsibly.
    
    Format your response as a numbered list.
    Keep each suggestion short and clear.
    Focus on Indian context where possible.
    End with one motivational line about recycling.
  `;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    // Extract response text
    if (!data.candidates || data.candidates.length === 0) {
  if (data.error?.code === 429) {
    throw new Error('Too many requests! Wait 1 minute and try again.');
    }
    throw new Error('No response from Gemini!');
   }
const aiText = data.candidates[0].content.parts[0].text;

    // Show result
    text.textContent      = aiText;
    result.style.display  = 'block';
    loading.style.display = 'none';
    // 10 second cooldown between requests
let countdown = 10;
btn.textContent = `⏳ Wait ${countdown}s`;
const timer = setInterval(() => {
  countdown--;
  btn.textContent = `⏳ Wait ${countdown}s`;
  if (countdown <= 0) {
    clearInterval(timer);
    btn.disabled    = false;
    btn.textContent = '✨ Ask AI';
  }
}, 1000);

    showToast('✅ Gemini AI responded!');

  } catch (error) {
    loading.style.display = 'none';
    btn.disabled          = false;
    btn.textContent       = '✨ Ask AI';
    showToast('⏱️ Too many requests! Wait 1 minute and try again.');
    console.error('Gemini error:', error);
  }
}

// Allow Enter key to trigger Gemini
document.getElementById('geminiInput')?.
  addEventListener('keypress', function(e) {
    if (e.key === 'Enter') askGemini();
  });