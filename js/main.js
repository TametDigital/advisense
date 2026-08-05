// ---- 1. Hovers (remplace le runtime style-hover de Claude Design) ----
document.querySelectorAll('[data-hover]').forEach(function(el){
  var base = el.getAttribute('style') || '';
  var hover = el.getAttribute('data-hover');
  el.addEventListener('mouseenter', function(){ el.setAttribute('style', base + ';' + hover); });
  el.addEventListener('mouseleave', function(){ el.setAttribute('style', base); });
});

// ---- 2. Méga menu (remplace les sc-if / bindings) ----
(function(){
  var closeTimer = null;
  function closeAll(){ document.querySelectorAll('.mega-panel').forEach(function(p){ p.hidden = true; }); }
  function open(name){
    clearTimeout(closeTimer);
    closeAll();
    var p = document.querySelector('.mega-panel[data-panel="' + name + '"]');
    if (p) p.hidden = false;
  }
  function scheduleClose(){ clearTimeout(closeTimer); closeTimer = setTimeout(closeAll, 250); }
  document.querySelectorAll('[data-menu-trigger]').forEach(function(li){
    li.addEventListener('mouseenter', function(){ open(li.getAttribute('data-menu-trigger')); });
    li.addEventListener('mouseleave', scheduleClose);
  });
  document.querySelectorAll('[data-menu-zone]').forEach(function(z){
    z.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); });
    z.addEventListener('mouseleave', scheduleClose);
  });
})();

// ---- 3. Canvas ondes du hero (remplace canvasRef2) ----
(function(){
  var canvas = document.getElementById('waves-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = null, w = 0, h = 0, nt = 0;
  var speed = 0.0005;
  var colors = ['#F07030', '#d85a1e', '#F58A3C', '#e8b287', '#c9541b'];

  function noise2(x, y) {
    var fx = Math.floor(x), fy = Math.floor(y);
    var smooth = function(a, b, t){ return a + (b - a) * (t * t * (3 - 2 * t)); };
    var corner = function(ix, iy){
      var v = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    var tx = x - fx, ty = y - fy;
    var top = smooth(corner(fx, fy), corner(fx + 1, fy), tx);
    var bot = smooth(corner(fx, fy + 1), corner(fx + 1, fy + 1), tx);
    return smooth(top, bot, ty) * 2 - 1;
  }

  function resize(){
    var parent = canvas.parentElement;
    w = parent.clientWidth; h = parent.clientHeight;
    canvas.width = w; canvas.height = h;
  }
  window.addEventListener('resize', resize); resize();

  function drawWave(n){
    for (var i = 0; i < n; i++){
      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = colors[i % colors.length];
      var baseY = h * 0.5;
      for (var x = 0; x < w; x += 6){
        var y = Math.sin(x / 220 + nt * 30 + i * 0.35) * 70
              + Math.sin(x / 90 + nt * 50 - i * 0.5) * 25
              + noise2(x / 300, nt * 12 + i) * 14;
        if (x === 0) ctx.moveTo(x, y + baseY); else ctx.lineTo(x, y + baseY);
      }
      ctx.stroke();
      ctx.closePath();
    }
  }

  function render(){
    nt += speed;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.85;
    drawWave(5);
    if (!reduced) raf = requestAnimationFrame(render);
  }
  render();
})();