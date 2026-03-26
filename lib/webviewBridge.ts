// JavaScript injected into the WebView to control <video> elements
export const INJECTED_JS = `
(function() {
  let _syncLock = false;
  let _video = null;
  let _observer = null;
  let _timeupdateInterval = null;

  function findVideo() {
    // Find the largest visible video element
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return null;
    if (videos.length === 1) return videos[0];

    let largest = videos[0];
    let maxArea = 0;
    videos.forEach(v => {
      const rect = v.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > maxArea) {
        maxArea = area;
        largest = v;
      }
    });
    return largest;
  }

  function attachListeners(video) {
    if (!video || video._wtListenersAttached) return;
    video._wtListenersAttached = true;
    _video = video;

    video.addEventListener('play', () => {
      if (_syncLock) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'play', currentTime: video.currentTime
      }));
    });

    video.addEventListener('pause', () => {
      if (_syncLock) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'pause', currentTime: video.currentTime
      }));
    });

    video.addEventListener('seeked', () => {
      if (_syncLock) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'seek', currentTime: video.currentTime
      }));
    });

    // Periodic time sync every 5s (clear previous to avoid stacking)
    if (_timeupdateInterval) clearInterval(_timeupdateInterval);
    _timeupdateInterval = setInterval(() => {
      if (_video) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'timeupdate',
          currentTime: _video.currentTime,
          paused: _video.paused
        }));
      }
    }, 5000);

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'ready', currentTime: video.currentTime
    }));
  }

  // Try to find video immediately
  const video = findVideo();
  if (video) {
    attachListeners(video);
  }

  // MutationObserver for lazy-loaded videos
  _observer = new MutationObserver(() => {
    if (!_video) {
      const v = findVideo();
      if (v) {
        attachListeners(v);
        _observer.disconnect();
      }
    }
  });
  _observer.observe(document.body, { childList: true, subtree: true });

  // Global functions for React Native to call
  window._wtPlay = function(time) {
    if (!_video) return;
    _syncLock = true;
    _video.currentTime = time;
    _video.play().finally(() => { _syncLock = false; });
  };
  window._wtPause = function(time) {
    if (!_video) return;
    _syncLock = true;
    _video.currentTime = time;
    _video.pause();
    setTimeout(() => { _syncLock = false; }, 100);
  };
  window._wtSeek = function(time) {
    if (!_video) return;
    _syncLock = true;
    _video.currentTime = time;
    setTimeout(() => { _syncLock = false; }, 100);
  };
})();
true;
`;
