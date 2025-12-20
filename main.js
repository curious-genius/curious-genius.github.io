// main.js

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

  try {
    const [content, business, product] = await Promise.all([
      loadYaml(contentUrl),
      loadYaml(businessUrl),
      loadYaml(productUrl)
    ]);

    // Inject content.yaml keys
    Object.entries(content).forEach(([key, value]) => applyText(key, value));

    // Inject business.yaml
    applyText('emailValue', `mailto:${business.email}`, 'href');
    applyText('emailValue', business.email);
    applyText('phoneValue', `tel:${business.phone}`, 'href');
    applyText('phoneValue', business.phone);
    applyText('locationLabel', business.address);

    // Example: Populate program cards from product.yaml
    const programList = document.getElementById('programList');
    if (programList && Array.isArray(product.programs)) {
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

    // Meta title + description
    document.title = content.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content.metaDescription) {
      metaDesc.setAttribute('content', content.metaDescription);
    }
  } catch (err) {
    console.error("YAML loading error:", err);
  }
});
