(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-stage");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var clear = panel.querySelector(".filter-clear");
    function apply() {
      var q = (keyword && keyword.value || "").trim().toLowerCase();
      var t = type && type.value || "";
      var r = region && region.value || "";
      var y = year && year.value || "";
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        var visible = true;
        if (q && text.indexOf(q) === -1) visible = false;
        if (t && card.dataset.type !== t) visible = false;
        if (r && card.dataset.region !== r) visible = false;
        if (y && card.dataset.year !== y) visible = false;
        card.classList.toggle("is-hidden", !visible);
      });
    }
    [keyword, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (keyword) keyword.value = "";
        if (type) type.value = "";
        if (region) region.value = "";
        if (year) year.value = "";
        apply();
      });
    }
    apply();
  }

  function setupSearchPage() {
    var root = document.getElementById("search-results");
    var form = document.getElementById("search-form");
    var input = document.getElementById("search-input");
    if (!root || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var prefix = root.dataset.prefix || "";
    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<a class=\"movie-card\" href=\"" + prefix + "movies/" + escapeHtml(movie.file) + "\">",
        "<div class=\"poster-wrap\"><img src=\"" + prefix + escapeHtml(movie.cover) + ".jpg\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"type-pill\">" + escapeHtml(movie.type) + "</span></div>",
        "<div class=\"movie-info\"><strong>" + escapeHtml(movie.title) + "</strong><p>" + escapeHtml(movie.one_line) + "</p>",
        "<div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.rating) + "</span></div>",
        "<div class=\"tag-row\">" + tags + "</div></div></a>"
      ].join("");
    }
    function render(value) {
      var q = (value || "").trim().toLowerCase();
      input.value = value || "";
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.one_line, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return !q || text.indexOf(q) !== -1;
      });
      if (!results.length) {
        root.innerHTML = "<div class=\"empty-state\">未找到相关影片</div>";
        return;
      }
      root.innerHTML = results.map(movieCard).join("");
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = input.value.trim();
        var url = new URL(window.location.href);
        if (q) {
          url.searchParams.set("q", q);
        } else {
          url.searchParams.delete("q");
        }
        history.replaceState(null, "", url.toString());
        render(q);
      });
    }
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(getParam("q"));
  }

  function setupPlayer() {
    var player = document.querySelector(".movie-player");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var source = player.getAttribute("data-source");
    var attached = false;
    if (!video || !source) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
