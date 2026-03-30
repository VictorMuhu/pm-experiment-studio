(function () {
  const SCREENS = ['loop-builder', 'behavioral-flow', 'simulator', 'insights'];
  const TAB_LABELS = {
    'loop-builder': 'Loop Builder',
    'behavioral-flow': 'Behavioral Flow',
    'simulator': 'Simulator',
    'insights': 'Insights',
  };

  function navigate(target) {
    SCREENS.forEach(function (id) {
      var screen = document.getElementById('screen-' + id);
      var footer = document.getElementById('footer-loop-builder');
      if (screen) screen.classList.toggle('active', id === target);
      if (footer) footer.style.display = target === 'loop-builder' ? '' : 'none';
    });

    // Update top nav active state
    document.querySelectorAll('[data-tab]').forEach(function (link) {
      var isActive = link.dataset.tab === target;
      link.classList.toggle('text-[#00E5FF]', isActive);
      link.classList.toggle('border-b-2', isActive);
      link.classList.toggle('border-[#00E5FF]', isActive);
      link.classList.toggle('pb-1', isActive);
      link.classList.toggle('text-[#E5E2E1]/60', !isActive);
    });

    // Persist
    try { localStorage.setItem('rla-screen', target); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Wire nav links
    document.querySelectorAll('[data-tab]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(link.dataset.tab);
      });
    });

    // Restore last screen or default to loop-builder
    var saved;
    try { saved = localStorage.getItem('rla-screen'); } catch (e) {}
    navigate(SCREENS.includes(saved) ? saved : 'loop-builder');
  });
})();
