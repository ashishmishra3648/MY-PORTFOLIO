(function () {
	var yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// Mobile nav
	var navToggle = document.getElementById('navToggle');
	var navList = document.getElementById('navList');
	if (navToggle && navList) {
		navToggle.addEventListener('click', function () {
			var open = navToggle.getAttribute('aria-expanded') === 'true';
			navToggle.setAttribute('aria-expanded', String(!open));
			navList.classList.toggle('is-open');
		});
		// Close on link click
    
				grad.addColorStop(0.5, 'hsla(' + Math.floor((p.hue+30)%360) + ',80%,55%, ' + (p.alpha*0.12) + ')');
				grad.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.fillStyle = grad;
				ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill();
			}
		}

		function drawNoise() {
			if (!noisePattern) noisePattern = createNoisePattern(180);
			ctx.globalCompositeOperation = 'overlay';
			ctx.globalAlpha = 0.06;
			ctx.fillStyle = noisePattern;
			ctx.fillRect(0, 0, w, h);
			ctx.globalAlpha = 1;
		}

		var raf = null;
		function loop() {
			if (prefersReduce) {
				// static render once
				ctx.clearRect(0,0,w,h);
				drawSpheres();
				drawParticles();
				drawNoise();
				return;
			}
			ctx.clearRect(0, 0, w, h);
			drawSpheres();
			drawParticles();
			drawNoise();
			raf = requestAnimationFrame(loop);
		}

		// init
		resize();
		noisePattern = createNoisePattern(180);
		initSpheres();
		initParticles();
		if (!prefersReduce) raf = requestAnimationFrame(loop); else loop();

		// events
		var resizeTO;
		window.addEventListener('resize', function () {
			clearTimeout(resizeTO);
			resizeTO = setTimeout(function () { resize(); initSpheres(); initParticles(); }, 140);
		});

		window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
		window.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });

		document.addEventListener('visibilitychange', function () {
			if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
			else { if (!prefersReduce && !raf) raf = requestAnimationFrame(loop); }
		});

		// expose controls for debugging
		window.__bgWaves = { spheres: spheres, particles: particles };
	})();

// Project slider/carousel
(function () {
	var slider = document.getElementById('projectSlider');
	if (!slider) return;
	var cards = slider.querySelectorAll('.card');
	var prevBtn = document.querySelector('.project-arrow--left');
	var nextBtn = document.querySelector('.project-arrow--right');
	var animating = false;
	var duration = 540;
	// find starting idx
	var idx = 0;
	for (var i = 0; i < cards.length; ++i) {
		if (cards[i].classList.contains('is-active')) { idx = i; break; }
	}
	function cleanClasses(card) {
		card.classList.remove('is-flipping-in','is-flipping-out','slide-in-right','slide-in-left','slide-out-right','slide-out-left','is-active','is-next','is-animating');
	}
	function animateTo(targetIdx, direction) {
		if (animating || idx === targetIdx) return;
		animating = true;
		var oldCard = cards[idx];
		var newCard = cards[targetIdx];
		cards.forEach(function(card){
			cleanClasses(card);
			card.style.display = 'none';
		});
		// Setup outgoing and incoming
		oldCard.classList.add('is-flipping-out', direction === 'next' ? 'slide-out-left' : 'slide-out-right');
		newCard.classList.add('is-flipping-in', direction === 'next' ? 'slide-in-left' : 'slide-in-right');
		oldCard.style.display = 'block';
		newCard.style.display = 'block';
		setTimeout(function () {
			cards.forEach(function(card){ cleanClasses(card);card.style.display='none'; });
			newCard.classList.add('is-active');
			newCard.style.display='block';
			idx = targetIdx;
			animating = false;
		}, duration);
	}
	function goNext() { if (animating) return; var nextIdx = (idx + 1) % cards.length; animateTo(nextIdx, 'next'); }
	function goPrev() { if (animating) return; var prevIdx = (idx - 1 + cards.length) % cards.length; animateTo(prevIdx, 'prev'); }
	cards.forEach(function(card) { card.classList.remove('is-active'); card.style.display = 'none'; });
	if (cards[idx]) { cards[idx].classList.add('is-active'); cards[idx].style.display='block'; }
	if (nextBtn) nextBtn.addEventListener('click', goNext);
	if (prevBtn) prevBtn.addEventListener('click', goPrev);
	document.addEventListener('keydown', function (e) {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
		if (e.key === 'ArrowRight') { goNext(); }
		if (e.key === 'ArrowLeft') { goPrev(); }
	});
})();


// avatar hover/raise only: no JS needed (kept intentionally minimal for accessibility)
/* Background particles canvas */
(function () {
	var canvas = document.getElementById('bgParticles');
	if (!canvas) return;

	var ctx = canvas.getContext('2d');
	var particles = [];
	var vpW = 0, vpH = 0;
	var DPR = Math.max(1, window.devicePixelRatio || 1);

	var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function resize() {
		vpW = canvas.clientWidth = window.innerWidth;
		vpH = canvas.clientHeight = window.innerHeight;
		canvas.width = Math.floor(vpW * DPR);
		canvas.height = Math.floor(vpH * DPR);
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	}

	function rand(min, max) { return Math.random() * (max - min) + min; }

	function createParticles() {
		particles = [];
		var baseCount = Math.round((vpW * vpH) / 90000); // density scaling
		var count = Math.min(120, Math.max(18, baseCount));
		// reduce on small screens
		if (vpW < 700) count = Math.round(count * 0.45);
		for (var i = 0; i < count; i++) {
			particles.push({
				x: rand(0, vpW),
				y: rand(0, vpH),
				vx: rand(-0.25, 0.25),
				vy: rand(-0.2, 0.2),
				r: rand(1.2, 4.5),
				alpha: rand(0.12, 0.9),
				hue: rand(200, 320)
			});
		}
	}

	function draw(now) {
		if (prefersReduce) return; // don't animate
		ctx.clearRect(0, 0, vpW, vpH);
		// soft glow backdrop
		ctx.globalCompositeOperation = 'lighter';
		for (var i = 0; i < particles.length; i++) {
			var p = particles[i];
			// move
			p.x += p.vx;
			p.y += p.vy;
			// wrap
			if (p.x < -40) p.x = vpW + 40;
			if (p.x > vpW + 40) p.x = -40;
			if (p.y < -40) p.y = vpH + 40;
			if (p.y > vpH + 40) p.y = -40;

			// draw glow circle
			var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
			var colorA = 'hsla(' + Math.floor(p.hue) + ', 85%, 60%, ' + (p.alpha * 0.35) + ')';
			var colorB = 'hsla(' + Math.floor((p.hue + 40) % 360) + ', 85%, 55%, 0)';
			grd.addColorStop(0, colorA);
			grd.addColorStop(0.3, colorA);
			grd.addColorStop(1, colorB);
			ctx.fillStyle = grd;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
			ctx.fill();
		}

		// subtle connections for nearby particles
		ctx.globalCompositeOperation = 'source-over';
		ctx.lineWidth = 0.6;
		for (var a = 0; a < particles.length; a++) {
			for (var b = a + 1; b < particles.length; b++) {
				var p1 = particles[a], p2 = particles[b];
				var dx = p1.x - p2.x, dy = p1.y - p2.y;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 120) {
					var t = 1 - (dist / 120);
					ctx.strokeStyle = 'rgba(120,170,255,' + (t * 0.06) + ')';
					ctx.beginPath();
					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.stroke();
				}
			}
		}

		raf = requestAnimationFrame(draw);
	}

	var raf = null;
	function start() {
		if (prefersReduce) return;
		if (raf) cancelAnimationFrame(raf);
		raf = requestAnimationFrame(draw);
	}

	function stop() {
		if (raf) cancelAnimationFrame(raf);
		raf = null;
	}

	// init
	resize();
	createParticles();
	start();

	// responsive and visibility handling
	var resizeTO;
	window.addEventListener('resize', function () {
		clearTimeout(resizeTO);
		resizeTO = setTimeout(function () {
			resize();
			createParticles();
		}, 120);
	});

	// pause when tab hidden to save CPU
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) stop(); else start();
	});

	// expose for debugging (optional)
	window.__bgParticles = { restart: function(){ createParticles(); start(); }, stop: stop };

})();


