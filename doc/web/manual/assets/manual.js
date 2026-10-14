(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const menuButton = $('.mobile-menu');
  const sidebar = $('.sidebar');
  if (menuButton && sidebar) {
    menuButton.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }
  const form = $('.search-form');
  const searchInput = form ? $('input[name="q"]', form) : null;
  if (form && searchInput) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const term = searchInput.value.trim();
      window.location.href = 'search.html' + (term ? '?q=' + encodeURIComponent(term) : '');
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const input = $('.search-form input[name="q"]');
      if (input) { event.preventDefault(); input.focus(); }
    }
  });
  const docs = window.RAZ_DOCS || [];
  const resultsRoot = $('#search-results');
  if (resultsRoot) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const label = $('#search-query-label');
    if (label) label.textContent = query ? 'Search results for “' + query + '”' : 'Enter a search term above to find a page.';
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = query ? docs.map((doc) => {
      const haystack = (doc.title + ' ' + doc.section + ' ' + doc.summary + ' ' + doc.keywords + ' ' + doc.url).toLowerCase();
      const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? (doc.title.toLowerCase().includes(token) ? 3 : 1) : -5), 0);
      return {doc, score};
    }).filter((item) => item.score >= 0).sort((a, b) => b.score - a.score) : [];
    if (!query) return;
    if (!matches.length) {
      resultsRoot.innerHTML = '<li class="empty-results">No matching pages were found. Try a keyword such as <code>include</code>, <code>i64</code>, <code>lexer</code>, or <code>std.io</code>.</li>';
      return;
    }
    resultsRoot.innerHTML = matches.map(({doc}) => '<li class="search-result"><h2><a href="' + doc.url + '">' + escapeHTML(doc.title) + '</a></h2><p>' + escapeHTML(doc.summary) + '</p><span class="result-path">' + escapeHTML(doc.section) + ' · ' + escapeHTML(doc.url) + '</span></li>').join('');
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
})();
