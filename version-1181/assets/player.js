
import { H as Hls } from './video-vendor-dru42stk.js';

export function initializePlayer(streamUrl) {
  const video = document.getElementById('movie-video');
  const button = document.querySelector('[data-play-button]');
  if (!video || !button || !streamUrl) {
    return;
  }
  let ready = false;
  const load = () => {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  };
  const play = () => {
    load();
    button.classList.add('is-hidden');
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(() => {
        button.classList.remove('is-hidden');
      });
    }
  };
  button.addEventListener('click', play);
  video.addEventListener('click', () => {
    if (!ready) {
      play();
    }
  });
}
