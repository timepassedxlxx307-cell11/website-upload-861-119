(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-local-search]');
  var grid = document.querySelector('[data-filter-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (searchInput && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));
    var query = new URLSearchParams(window.location.search).get('q') || '';

    if (query) {
      searchInput.value = query;
    }

    function applyFilter() {
      var value = searchInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matched = value === '' || text.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    searchInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  var video = document.querySelector('video[data-stream]');

  if (video) {
    var shell = document.querySelector('[data-video-shell]');
    var startButton = document.querySelector('[data-player-button]');
    var stream = video.getAttribute('data-stream');
    var attached = false;

    function attachPlayer() {
      if (attached || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      if (startButton) {
        startButton.textContent = '播放暂时无法加载';
        startButton.style.width = 'auto';
        startButton.style.padding = '0 22px';
        startButton.style.fontSize = '15px';
      }
    }

    function playVideo() {
      attachPlayer();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    attachPlayer();

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        if (video.paused) {
          playVideo();
        }
      });
    }

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });
  }
})();
