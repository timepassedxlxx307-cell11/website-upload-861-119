(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-control.prev");
        var next = document.querySelector(".hero-control.next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function setupFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var input = document.querySelector("[data-card-search]");
        var type = document.querySelector("[data-type-filter]");
        var year = document.querySelector("[data-year-filter]");

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedType = type ? type.value : "";
            var selectedYear = year ? year.value : "";
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
                var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                card.style.display = matchKeyword && matchType && matchYear ? "" : "none";
            });
        }

        [input, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupSearchPage() {
        var container = document.querySelector("[data-search-results]");
        if (!container || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var input = document.querySelector("[data-main-search]");
        if (input) {
            input.value = q;
        }

        function render(keyword) {
            var term = keyword.trim().toLowerCase();
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                if (!term) {
                    return true;
                }
                return movie.searchText.toLowerCase().indexOf(term) !== -1;
            }).slice(0, 96);
            container.innerHTML = "";
            if (!results.length) {
                var empty = document.createElement("div");
                empty.className = "empty-state";
                empty.textContent = "没有找到匹配的影片";
                container.appendChild(empty);
                return;
            }
            results.forEach(function (movie) {
                var article = document.createElement("article");
                article.className = "movie-card";
                article.innerHTML = [
                    '<a class="poster-link" href="' + movie.url + '">',
                    '<img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
                    '<span class="poster-glow"></span>',
                    '<em>' + movie.year + '</em>',
                    '</a>',
                    '<div class="card-body">',
                    '<div class="meta-row"><span>' + movie.category + '</span><span>' + movie.region + '</span></div>',
                    '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
                    '<p>' + movie.oneLine + '</p>',
                    '<div class="tag-row"><span>' + movie.type + '</span><span>' + movie.genre + '</span></div>',
                    '</div>'
                ].join("");
                container.appendChild(article);
            });
        }

        var form = document.querySelector("[data-search-form]");
        if (form && input) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render(input.value);
                var nextUrl = window.location.pathname + "?q=" + encodeURIComponent(input.value.trim());
                window.history.replaceState({}, "", nextUrl);
            });
        }
        render(q);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
