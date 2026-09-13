(function () {
  'use strict';

  // ====== CẤU HÌNH ======
  var VIDEO_MAP = [
    { keys: ['khu nhap dao', 'nhap dao'], file: 'khu-nhap-dao.mp4' },
    { keys: ['khu thanh dat', 'thanh dat'], file: 'thanh-dat.mp4' },
    { keys: ['khue van cac', 'khue van'], file: 'khue-van-cac.mp4' },
    { keys: ['khu dai thanh', 'dai thanh'], file: 'dai-thanh.mp4' },
    { keys: ['khu thai hoc', 'thai hoc'], file: 'thai-hoc.mp4' }
  ];

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function fileForTitle(title) {
    var t = normalize(title);
    for (var i = 0; i < VIDEO_MAP.length; i++) {
      for (var j = 0; j < VIDEO_MAP[i].keys.length; j++) {
        if (t.indexOf(normalize(VIDEO_MAP[i].keys[j])) !== -1) return VIDEO_MAP[i].file;
      }
    }
    return null;
  }

  var canvas, ctx, video, lastFile = '';
  var width = 320, height = 180;

  function createUI() {
    canvas = document.createElement('canvas');
    canvas.id = 'panoee-mc-canvas';
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = [
  'position:fixed',
  'right:-70px',
  'bottom:30px',
  'width:380px',
  'height:214px',
  'z-index:99999',
  'pointer-events:none',
  'display:block'
].join(';');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.style.display = 'none';
    document.body.appendChild(video);

    video.addEventListener('loadedmetadata', function () {
      draw();
      video.play().catch(function () {});
    });
    video.addEventListener('canplay', function () {
      video.play().catch(function () {});
    });
  }

  function loadVideo(file) {
    if (!file || file === lastFile) return;
    lastFile = file;
    video.pause();
    video.src = 'static/static/mc-videos/' + file;
    video.load();
    video.play().catch(function () {});
  }

  function draw() {
    if (!canvas || !ctx || !video) return;
    if (video.readyState >= 2) {
      var vw = video.videoWidth || width;
      var vh = video.videoHeight || height;
      var scale = Math.min(width / vw, height / vh);
      var dw = vw * scale;
      var dh = vh * scale;
      var dx = (width - dw) / 2;
      var dy = (height - dh) / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, dx, dy, dw, dh);

      // Chroma key xanh lá.
      try {
        var img = ctx.getImageData(0, 0, width, height);
        var p = img.data;
        for (var i = 0; i < p.length; i += 4) {
          var r = p[i], g = p[i + 1], b = p[i + 2];
          var green = g > r * 1.18 && g > b * 1.12 && g > 75;
          if (green) {
            p[i + 3] = 0;
          } else {
            var strength = Math.max(0, Math.min(1, (g - Math.max(r, b) - 10) / 80));
            if (strength > 0.05) p[i + 3] = Math.round(255 * (1 - strength * 0.75));
          }
        }
        ctx.putImageData(img, 0, 0);
      } catch (e) {}
    }
    requestAnimationFrame(draw);
  }

  function getActiveSceneTitle() {
    var selectors = [
      '.galleryImg.active .--menuSceneTitle',
      '.itemScene.active .--menuSceneTitle',
      '.dropdownList button.active .--menuSceneTitle',
      '#themeListScene .galleryImg.active h2',
      '#themeListScene .galleryImg.active h3',
      '#themeListScene .galleryImg.active h4'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return '';
  }

  window.addEventListener('panoee-scene-change', function (event) {
    var detail = event && event.detail ? event.detail : {};
    var title = detail.title || detail.name || '';
    var file = fileForTitle(title);
    if (file) loadVideo(file);
  });

  function syncScene() {
    var title = getActiveSceneTitle();
    if (!title) return;
    var file = fileForTitle(title);
    if (file) loadVideo(file);
  }

  function hookHistory() {
    ['pushState', 'replaceState'].forEach(function (method) {
      var original = history[method];
      if (!original.__mcWrapped) {
        var wrapped = function () {
          var result = original.apply(this, arguments);
          setTimeout(syncScene, 50);
          setTimeout(syncScene, 300);
          return result;
        };
        wrapped.__mcWrapped = true;
        history[method] = wrapped;
      }
    });
    window.addEventListener('popstate', function () {
      setTimeout(syncScene, 50);
      setTimeout(syncScene, 300);
    });
  }

  function start() {
    createUI();
    hookHistory();

    var observer = new MutationObserver(function () {
      syncScene();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

    // Panoee/React dựng UI bất đồng bộ nên quét lại vài lần lúc khởi động.
    [100, 500, 1000, 2000, 4000, 7000].forEach(function (ms) {
      setTimeout(syncScene, ms);
    });

    // Fallback nhẹ: nếu theme thay đổi cấu trúc DOM, vẫn bắt được scene active.
    setInterval(syncScene, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
