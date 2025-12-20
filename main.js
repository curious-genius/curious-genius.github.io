/* Updated main.js with improved layout handling and dynamic language support */

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

  // Language selection support
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.addEventListener('change', (e) => {
      const lang = e.target.value;
      localStorage.setItem('preferredLang', lang);
      location.reload();
    });
  }

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

    const content = contentRaw[targetLang] || contentRaw[DEFAULT_LANG];

    Object.entries(content).forEach(([key, value]) => applyText(key, value));

    applyText('emailValue', `mailto:${business.email}`, 'href');
    applyText('emailValue', business.email);
    applyText('phoneValue', `tel:${business.phone}`, 'href');
    applyText('phoneValue', business.phone);
    applyText('locationLabel', business.address);

    const programList = document.getElementById('programList');
    if (programList && Array.isArray(product.programs)) {
      programList.innerHTML = '';
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

  } catch (err) {
    console.error("Error loading or translating content:", err);
  }
});
