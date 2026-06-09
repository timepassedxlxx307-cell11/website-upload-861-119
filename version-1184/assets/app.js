(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHeaderSearch() {
        var forms = document.querySelectorAll('.site-search-form');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || input.value.trim() === '') {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-control.prev');
        var next = root.querySelector('.hero-control.next');
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function initCardFilters() {
        var input = document.querySelector('.page-filter-input');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        if (!input && chips.length === 0) {
            return;
        }
        var activeFilter = 'all';

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var meta = (card.getAttribute('data-meta') || '').toLowerCase();
                var haystack = title + ' ' + meta;
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || meta.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-filtered-out', !(matchesText && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });
        apply();
    }

    function initSearchPage() {
        var results = document.getElementById('search-results');
        var summary = document.getElementById('search-summary');
        var fallback = document.getElementById('search-default');
        if (!results || !summary || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var formInput = document.querySelector('.search-page-form input[name="q"]');
        if (formInput) {
            formInput.value = query;
        }
        if (!query) {
            summary.textContent = '';
            results.innerHTML = '';
            fallback.classList.remove('hidden');
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                movie.summary,
                movie.year,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return text.indexOf(lower) !== -1;
        }).slice(0, 160);
        fallback.classList.add('hidden');
        summary.textContent = '“' + query + '” 的相关影片';
        if (matched.length === 0) {
            results.innerHTML = '<div class="detail-section"><h2>未找到相关影片</h2><p>可以尝试更换片名、地区、类型、年份或标签关键词。</p></div>';
            return;
        }
        results.innerHTML = matched.map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>#' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="./' + escapeHtml(movie.file) + '" data-title="' + escapeHtml(movie.title) + '" data-meta="' + escapeHtml(movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + (movie.tags || []).join(' ')) + '">' +
                '<div class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
                    '<span class="play-float">▶</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<span class="category-pill">' + escapeHtml(movie.category) + '</span>' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + Number(movie.views).toLocaleString() + ' 热度</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var stream = shell.getAttribute('data-stream');
            var loaded = false;
            var hls = null;
            if (!video || !stream) {
                return;
            }

            function loadStream() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                loadStream();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    button.classList.add('is-hidden');
                    playVideo();
                });
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && !video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayers();
    });
}());
