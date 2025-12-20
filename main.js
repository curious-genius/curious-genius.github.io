// main.js

const TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; // Replace this with your real API key
const DEFAULT_LANG = 'en';

window.addEventListener("DOMContentLoaded", async () => {
  const contentUrl = 'content.yaml';
  const businessUrl = 'business.yaml';
  const productUrl = 'product.yaml';

  const loadYaml = async (url) => {
    const res = await fetch(url);
    const text = await res.text();
    return jsyaml.load(text);
  };

  const applyText = (id, value, attr = 'innerText') => {
    const el = document.getElementById(id);
    if (el) {
      if (attr === 'href' || attr === 'src') {
        el.setAttribute(attr, value);
      } else {
        el.innerText = value;
      }
    }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === DEFAULT_LANG) return text;
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: targetLang, format: 'text', source: DEFAULT_LANG })
    });
    const data = await res.json();
    return data.data.translations[0].translatedText;
  };

  const translateContentObject = async (contentObj, targetLang) => {
    const entries = Object.entries(contentObj);
    const translated = {};
    for (const [key, value] of entries) {
      translated[key] = await translateText(value, targetLang);
    }
    return translated;
  };

  try {
    const [contentRaw, business, product] = await Promise.all([
      loadYaml(contentUrl),
      loadYaml(businessUrl),
      loadYaml(productUrl)
    ]);

    const storedLang = localStorage.getItem('preferredLang');
    const browserLang = navigator.language.slice(0, 2);
    const userLang = storedLang || browserLang;
    const supportedLangs = Object.keys(contentRaw);
    const targetLang = supportedLangs.includes(userLang) ? userLang : DEFAULT_LANG;

    // Set direction if Arabic
    if (targetLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }

    const content = contentRaw[targetLang] || await translateContentObject(contentRaw[DEFAULT_LANG], targetLang);

    Object.entries(content).forEach(([key, value]) => applyText(key, value));

    applyText('emailValue', `mailto:${business.email}`, 'href');
    applyText('emailValue', business.email);
    applyText('phoneValue', `tel:${business.phone}`, 'href');
    applyText('phoneValue', business.phone);
    applyText('locationLabel', business.address);

    const programList = document.getElementById('programList');
    if (programList && Array.isArray(product.programs)) {
      programList.innerHTML = ''; // Clear any existing content
      product.programs.forEach(program => {
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
          <h3>${program.title}</h3>
          <p>${program.description}</p>
          <p><strong>${program.price}</strong></p>
        `;
        programList.appendChild(li);
      });
    }

    document.title = content.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content.metaDescription) {
      metaDesc.setAttribute('content', content.metaDescription);
    }

    // Add listener for language change
    const langSelect = document.getElementById('languageSelector');
    if (langSelect) {
      langSelect.value = targetLang;
      langSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem('preferredLang', selectedLang);
        location.reload();
      });
    }

  } catch (err) {
    console.error("Error loading or translating content:", err);
  }
});
