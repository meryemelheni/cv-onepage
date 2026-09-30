(function () {
  var bars = document.querySelectorAll('.bar i');
  window.addEventListener('load', function () {
    setTimeout(function () {
      bars.forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-level') + '%';
      });
    }, 150);
  });
  document.getElementById('print').addEventListener('click', function () {
    window.print();
  });
})();
