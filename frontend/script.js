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
// GEMINI AI INTEGRATION (with rule-based fallback)
// ============================================

// GEMINI_API_KEY comes from config.js (kept out of GitHub).
// suggestion.html must load config.js BEFORE script.js.
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

// ── Rule-based backup (used when Gemini fails) ──
function ruleBasedAnswer(textIn) {
  const t = textIn.toLowerCase();
  let tips;

  if (/plastic|bottle|polythene|bag/.test(t)) {
    tips = [
      "Rinse and sort by plastic type before giving it to a recycler.",
      "Reuse bottles as planters, storage containers or bird feeders.",
      "Sell clean plastic to a local scrap dealer (kabadiwala).",
      "Never burn plastic, it releases toxic fumes.",
      "Switch to cloth bags and steel bottles to cut plastic use."
    ];
  } else if (/paper|cardboard|newspaper|book/.test(t)) {
    tips = [
      "Keep paper dry and clean, then sell it to a scrap dealer.",
      "Reuse cardboard for packing or school craft projects.",
      "Use old newspaper for wrapping or cleaning glass.",
      "Shred paper for compost or pet bedding.",
      "Print on both sides to reduce paper waste."
    ];
  } else if (/metal|iron|steel|aluminium|aluminum|can|tin|copper/.test(t)) {
    tips = [
      "Keep different metals separate for a better scrap price.",
      "Sell to a scrap dealer or metal recycler.",
      "Reuse tin cans as pen holders or planters.",
      "Donate usable utensils and tools.",
      "Metal can be recycled again and again without losing quality."
    ];
  } else if (/glass|jar/.test(t)) {
    tips = [
      "Wash and reuse jars for storage.",
      "Hand over bottles to a glass recycler or scrap dealer.",
      "Wrap broken glass in paper and label it for safe disposal.",
      "Turn bottles into lamps or vases.",
      "Never mix glass with general waste."
    ];
  } else if (/electronic|e-waste|ewaste|battery|phone|laptop|charger|cable|tv/.test(t)) {
    tips = [
      "Do not throw e-waste in the dustbin.",
      "Give it to an authorised e-waste collection centre.",
      "Donate or sell devices that still work.",
      "Ask the manufacturer about take-back programs.",
      "Remove personal data before disposing of any device."
    ];
  } else if (/food|vegetable|fruit|organic|kitchen|peel|leaves|garden/.test(t)) {
    tips = [
      "Make compost at home from kitchen waste.",
      "Give leftover food to farmers or animal feed collectors.",
      "Use vegetable peels for natural cleaners or garden fertiliser.",
      "Send large amounts to a biogas plant.",
      "Plan meals to reduce food waste."
    ];
  } else if (/cloth|textile|fabric|shirt|jeans|saree/.test(t)) {
    tips = [
      "Donate wearable clothes to charities.",
      "Turn old cloth into cleaning rags or bags.",
      "Give worn-out fabric to textile recyclers.",
      "Swap clothes with friends or family.",
      "Repair and restyle before throwing away."
    ];
  } else {
    tips = [
      "Check what material the item is made of.",
      "Sort it as plastic, paper, metal, glass, organic or e-waste.",
      "Look for a local recycler or scrap dealer.",
      "Think of a creative way to reuse it at home.",
      "Dispose of anything unusable responsibly."
    ];
  }

  return tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n') +
         '\n\n♻️ Small steps in recycling make a big difference!';
}

// ── Button cooldown ──
function startCooldown(btn, seconds) {
  let countdown = seconds;
  btn.disabled = true;
  btn.textContent = `⏳ Wait ${countdown}s`;
  const timer = setInterval(() => {
    countdown--;
    btn.textContent = `⏳ Wait ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(timer);
      btn.disabled = false;
      btn.textContent = '✨ Ask AI';
    }
  }, 1000);
}

let geminiBusy = false;

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
  if (geminiBusy) return;
  geminiBusy = true;

  // Show loading
  btn.disabled          = true;
  btn.textContent       = '⏳ Thinking...';
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

  let answer;
  let usedFallback = false;

  try {
    if (typeof GEMINI_API_KEY === 'undefined') {
      throw new Error('GEMINI_API_KEY missing. Is config.js loaded before script.js?');
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', response.status, data);
      throw new Error('Gemini error ' + response.status);
    }
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    answer = data.candidates[0].content.parts[0].text;

  } catch (error) {
    // Gemini failed (429, wrong key, no internet...) -> use rule-based answer
    console.error('Gemini failed, using rule-based fallback:', error);
    answer = ruleBasedAnswer(userInput);
    usedFallback = true;
  }

  // Show result
  text.textContent      = answer;
  result.style.display  = 'block';
  loading.style.display = 'none';

  showToast(usedFallback
    ? '💡 AI is busy, showing quick suggestions'
    : '✅ Gemini AI responded!');

  // 10 second cooldown between requests
  startCooldown(btn, 10);
  setTimeout(() => { geminiBusy = false; }, 10000);
}

// Allow Enter key to trigger Gemini
document.getElementById('geminiInput')?.
  addEventListener('keypress', function (e) {
    if (e.key === 'Enter') askGemini();
  });