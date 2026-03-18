(function() {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'he');

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'dir') {
        if (document.documentElement.getAttribute('dir') !== 'rtl') {
          document.documentElement.setAttribute('dir', 'rtl');
        }
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });
})();
