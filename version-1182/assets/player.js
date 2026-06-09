(function () {
    async function attachSource(video, source) {
        if (video.dataset.ready === "true") {
            return;
        }
        video.dataset.ready = "true";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        var HlsConstructor = window.Hls;
        if (HlsConstructor && HlsConstructor.isSupported()) {
            var hls = new HlsConstructor({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = source;
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        if (!video || !button || !config.source) {
            return;
        }

        async function playVideo() {
            button.classList.add("is-hidden");
            await attachSource(video, config.source);
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };
})();
