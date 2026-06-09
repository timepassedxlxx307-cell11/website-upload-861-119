(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    var hero = document.querySelector(".hero");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                activate(current + 1);
            }, 5600);
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener("click", function () {
                    activate(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    activate(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    activate(dotIndex);
                    start();
                });
            });
            start();
        }
    }

    var homeSearch = document.querySelector("[data-home-search]");

    if (homeSearch) {
        homeSearch.addEventListener("submit", function (event) {
            event.preventDefault();
            var keyword = homeSearch.querySelector("input[name='q']");
            var region = homeSearch.querySelector("select[name='region']");
            var type = homeSearch.querySelector("select[name='type']");
            var params = new URLSearchParams();

            if (keyword && keyword.value.trim()) {
                params.set("q", keyword.value.trim());
            }
            if (region && region.value) {
                params.set("region", region.value);
            }
            if (type && type.value) {
                params.set("type", type.value);
            }

            var target = "movies.html";
            var query = params.toString();
            window.location.href = query ? target + "?" + query : target;
        });
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-region][data-type]"));
    var emptyLine = document.querySelector("[data-empty-line]");

    if (filterForm && cards.length) {
        var qInput = filterForm.querySelector("input[name='q']");
        var regionSelect = filterForm.querySelector("select[name='region']");
        var typeSelect = filterForm.querySelector("select[name='type']");
        var yearSelect = filterForm.querySelector("select[name='year']");
        var params = new URLSearchParams(window.location.search);

        if (qInput && params.get("q")) {
            qInput.value = params.get("q");
        }
        if (regionSelect && params.get("region")) {
            regionSelect.value = params.get("region");
        }
        if (typeSelect && params.get("type")) {
            typeSelect.value = params.get("type");
        }
        if (yearSelect && params.get("year")) {
            yearSelect.value = params.get("year");
        }

        function applyFilters() {
            var keyword = qInput ? qInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var source = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.type || "",
                    card.dataset.year || "",
                    card.dataset.genre || ""
                ].join(" ").toLowerCase();
                var match = true;

                if (keyword && source.indexOf(keyword) === -1) {
                    match = false;
                }
                if (region && card.dataset.region !== region) {
                    match = false;
                }
                if (type && card.dataset.type !== type) {
                    match = false;
                }
                if (year && card.dataset.year !== year) {
                    match = false;
                }

                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (emptyLine) {
                emptyLine.classList.toggle("is-visible", visible === 0);
            }
        }

        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
        });
        [qInput, regionSelect, typeSelect, yearSelect].forEach(function (field) {
            if (field) {
                field.addEventListener("input", applyFilters);
                field.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    }
})();

var StaticMoviePlayer = (function () {
    function bind(videoId, overlayId, url) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var ready = false;

        function attach() {
            if (!video || !url || ready) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            ready = true;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (video && overlay) {
            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!ready) {
                    play();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        mount: bind
    };
})();
