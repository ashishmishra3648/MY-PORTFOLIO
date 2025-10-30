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
		Array.prototype.forEach.call(navList.querySelectorAll('a'), function (a) {
			a.addEventListener('click', function () {
				navList.classList.remove('is-open');
				navToggle.setAttribute('aria-expanded', 'false');
			});
		});
	}

	// Theme toggle (persisted)
	var themeToggle = document.getElementById('themeToggle');
	var stored = localStorage.getItem('theme');
	if (stored === 'light') document.documentElement.classList.add('light');
	if (themeToggle) {
		themeToggle.addEventListener('click', function () {
			document.documentElement.classList.toggle('light');
			var isLight = document.documentElement.classList.contains('light');
			localStorage.setItem('theme', isLight ? 'light' : 'dark');
		});
	}

	// Reveal on scroll (re-trigger on every entry)
	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('reveal--visible');
			} else {
				entry.target.classList.remove('reveal--visible');
			}
		});
	}, { threshold: 0.12 });
	Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
		observer.observe(el);
	});

	// Staggered headline animation for greeting and name
	function applyStagger(el, opts) {
		if (!el) return;
		var text = el.textContent;
		var mode = (opts && opts.mode) || 'words';
		var unitArray;
		if (mode === 'chars') {
			unitArray = text.split('');
		} else {
			unitArray = text.split(/(\s+)/); // keep spaces
		}
		var html = unitArray.map(function (unit) {
			if (unit.trim() === '') return unit;
			return '<span>' + unit + '</span>';
		}).join('');
		el.innerHTML = html;
		el.classList.add('stagger');
		var delay = (opts && opts.delay) || 90;
		Array.prototype.forEach.call(el.querySelectorAll('span'), function (span, i) {
			span.style.animationDelay = (i * delay) + 'ms';
		});
	}

	applyStagger(document.querySelector('[data-stagger].eyebrow'), { mode: 'chars', delay: 40 });
	applyStagger(document.querySelector('.hero__title.name-animate[data-stagger]'), { mode: 'chars', delay: 40 });
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


