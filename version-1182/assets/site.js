(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var opened = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var timer = null;

            function show(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            start();
        }

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
        filterInputs.forEach(function (input) {
            var list = document.querySelector("[data-card-list]") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.style.display = haystack.indexOf(keyword) >= 0 ? "" : "none";
                });
            });
        });

        var resultsBox = document.querySelector("[data-search-results]");
        var statusBox = document.querySelector("[data-search-status]");
        if (resultsBox && statusBox && window.SiteSearchData) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim();
            var pageInput = document.querySelector(".page-search-form input[name='q']");
            if (pageInput) {
                pageInput.value = query;
            }
            if (!query) {
                statusBox.textContent = "请输入搜索关键词";
                return;
            }
            var words = query.toLowerCase().split(/\s+/).filter(Boolean);
            var matches = window.SiteSearchData.filter(function (item) {
                var haystack = item.search.toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) >= 0;
                });
            }).slice(0, 120);
            statusBox.textContent = matches.length ? "搜索结果" : "未找到相关视频";
            resultsBox.innerHTML = matches.map(function (item) {
                return [
                    '<article class="video-card movie-card">',
                    '    <a href="' + item.link + '" class="video-card-link">',
                    '        <span class="poster-box">',
                    '            <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '            <span class="poster-mask"></span>',
                    '            <span class="card-badge">' + escapeHtml(item.region) + '</span>',
                    '            <span class="duration-chip">' + escapeHtml(item.duration) + '</span>',
                    '        </span>',
                    '        <span class="video-card-body">',
                    '            <strong>' + escapeHtml(item.title) + '</strong>',
                    '            <span class="line-clamp">' + escapeHtml(item.oneLine) + '</span>',
                    '            <span class="card-meta">' + escapeHtml(item.genre) + ' · ' + escapeHtml(item.year) + '</span>',
                    '        </span>',
                    '    </a>',
                    '</article>'
                ].join("\n");
            }).join("\n");
        }
    });

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
