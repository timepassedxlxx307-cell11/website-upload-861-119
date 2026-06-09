(function () {
    function hideCover(button) {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function initHls(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    function playVideo(video, cover) {
        hideCover(cover);
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    function initPlayer(config) {
        var video = document.getElementById(config.videoId);
        var cover = document.getElementById(config.coverId);
        if (!video || !config.source) {
            return;
        }
        video.controls = true;
        video.poster = config.poster || video.poster;
        initHls(video, config.source);
        if (cover) {
            cover.addEventListener("click", function () {
                playVideo(video, cover);
            });
        }
        video.addEventListener("play", function () {
            hideCover(cover);
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo(video, cover);
            }
        });
    }

    window.VideoPlayer = {
        init: initPlayer
    };
})();
