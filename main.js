// main.js (improved version with safe fallback and diagnostics)

window.addEventListener("DOMContentLoaded", async () => {
  const contentUrl = 'content.yaml';
  const businessUrl = 'business.yaml';
  const productUrl = 'product.yaml';

  const loadYaml = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const text = await res.text();
      return jsyaml.load(text);
    } catch (e) {
      console.error(`Error loading YAML from ${url}:`, e);
      return {};
    }
  };

  const applyText = (id, value, attr = 'innerText') => {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) {
      if (attr === 'href' || attr === 'src') {
        el.setAttribute(attr, value);
      } else {
        el.innerText = value;
      }
    } else {
      console.warn(`Missing element with ID: ${id}`);
    }
  };

  try {
    const [content, business, product] = await Promise.all([
      loadYaml(contentUrl),
      loadYaml(businessUrl),
      loadYaml(productUrl)
    ]);

    // Fill static text content
    Object.entries(content).forEach(([key, value]) => applyText(key, value));

    // Contact and meta info
    applyText('emailValue', `mailto:${business.email}`, 'href');
    applyText('emailValue', business.email);
    applyText('phoneValue', `tel:${business.phone}`, 'href');
    applyText('phoneValue', business.phone);
    applyText('locationLabel', business.address);

    document.title = content.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content.metaDescription) {
      metaDesc.setAttribute('content', content.metaDescription);
    }

    // Render dynamic programs
    const programList = document.getElementById('programList');
    if (programList && Array.isArray(product.programs)) {
      programList.innerHTML = '';
      product.programs.forEach(({ title, description, price }) => {
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
          <h3>${title || '(Untitled Program)'}</h3>
          <p>${description || ''}</p>
          <p><strong>${price || ''}</strong></p>
        `;
        programList.appendChild(li);
      });
    }

    // Widget placeholders
    const widgetFallback = {
      trialWidget: 'Book your free trial here.',
      loginWidget: 'Login coming soon.',
      signupWidget: 'Create a parent account.',
      contactWidget: 'Use our contact form or email us directly.'
    };

    Object.entries(widgetFallback).forEach(([id, defaultText]) => {
      const el = document.getElementById(id);
      if (el && el.innerHTML.trim().length === 0) {
        el.innerHTML = `<p class="muted">${defaultText}</p>`;
      }
    });

  } catch (err) {
    console.error("Initialization error:", err);
  }
});
