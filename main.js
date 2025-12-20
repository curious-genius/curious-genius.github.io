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

  document.getElementById('languageSelector')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('preferredLang', lang);
    location.reload();
  });

  try {
    const [contentYaml] = await Promise.all([
      loadYaml(contentUrl)
    ]);

    const storedLang = localStorage.getItem('preferredLang');
    const browserLang = navigator.language.slice(0, 2);
    const userLang = storedLang || browserLang;
    const supportedLangs = Object.keys(contentYaml);
    const langToUse = supportedLangs.includes(userLang) ? userLang : DEFAULT_LANG;

    const content = contentYaml[langToUse];
    Object.entries(content).forEach(([key, value]) => applyText(key, value));
  } catch (err) {
    console.error("Loading error:", err);
  }
});
