/* ═══════════════════════════════════════════════════
   JIVRAJ CAPITAL — script.js
   Scrollytelling engine · GSAP + ScrollTrigger
   ═══════════════════════════════════════════════════ */

// ── Wait for GSAP to be loaded ────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onGSAPReady(cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        cb();
    } else {
        setTimeout(() => onGSAPReady(cb), 50);
    }
}

onGSAPReady(() => {

    gsap.registerPlugin(ScrollTrigger);

    /* ─────────────────────────────────────────────────
       HERO VIDEO — cinematic fade-in + slow playback
       ───────────────────────────────────────────────── */
    (function initHeroVideo() {
        const vid = document.getElementById('heroVideo');
        const hero = document.getElementById('hero');
        if (!vid) return;

        // Slow the playback for a calm, hypnotic quality
        vid.playbackRate = 0.78;

        // Fade video in + add class that softens the dark overlay
        function fadeVideoIn() {
            // Add class → CSS transitions overlay from near-opaque to transparent
            if (hero) hero.classList.add('video-playing');

            gsap.to(vid, {
                opacity: 1,
                duration: 2.8,
                ease: 'power2.out',
                delay: 0.15,
            });
        }

        // canplay fires earlier than canplaythrough — better UX
        if (vid.readyState >= 2) {
            fadeVideoIn();
        } else {
            vid.addEventListener('canplay', fadeVideoIn, { once: true });
            // Safety fallback after 2s
            setTimeout(() => {
                if (!hero.classList.contains('video-playing')) fadeVideoIn();
            }, 2000);
        }
    })();

    /* ─────────────────────────────────────────────────
       UTILITIES
       ───────────────────────────────────────────────── */

    // Prepare an SVG path for stroke-draw animation
    function preparePath(path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        return len;
    }

    // Animate a path from invisible to drawn
    function drawPath(path, duration, delay = 0, ease = 'power2.inOut') {
        return gsap.to(path, {
            strokeDashoffset: 0,
            duration,
            delay,
            ease,
        });
    }

    // Respect reduced-motion preference

    /* ─────────────────────────────────────────────────
       CUSTOM CURSOR
       ───────────────────────────────────────────────── */
    (function initCursor() {
        const dot = document.getElementById('cursor');
        const ring = document.getElementById('cursorRing');
        let mx = 0, my = 0;
        let rx = 0, ry = 0;
        let shown = false;

        if (!dot || !ring) return;

        // Dot follows mouse directly
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            gsap.to(dot, {
                x: mx, y: my,
                duration: .09,
                ease: 'none',
                overwrite: 'auto',
            });

            // Reveal on first move
            if (!shown) {
                gsap.to([dot, ring], { opacity: 1, duration: .5 });
                shown = true;
            }
        }, { passive: true });

        // Ring lags behind smoothly via rAF
        (function tickRing() {
            rx += (mx - rx) * .09;
            ry += (my - ry) * .09;
            gsap.set(ring, { x: rx, y: ry });
            requestAnimationFrame(tickRing);
        })();

        // Hide/show on page leave/enter
        document.addEventListener('mouseleave', () =>
            gsap.to([dot, ring], { opacity: 0, duration: .3 })
        );
        document.addEventListener('mouseenter', () =>
            shown && gsap.to([dot, ring], { opacity: 1, duration: .3 })
        );

        // Scale on interactive elements
        document.querySelectorAll('a, button, .cta-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(dot, { scale: 2.4, duration: .35, ease: 'power2.out' });
                gsap.to(ring, {
                    scale: 1.6,
                    borderColor: 'rgba(194,168,90,.8)',
                    duration: .4, ease: 'power2.out',
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(dot, { scale: 1, duration: .35, ease: 'power2.out' });
                gsap.to(ring, {
                    scale: 1,
                    borderColor: 'rgba(194,168,90,.45)',
                    duration: .4, ease: 'power2.out',
                });
            });
        });
    })();

    /* ─────────────────────────────────────────────────
       NAVBAR — add bg on scroll
       ───────────────────────────────────────────────── */
    window.addEventListener('scroll', () => {
        document.getElementById('nav')
            ?.classList.toggle('is-scrolled', window.scrollY > 70);
    }, { passive: true });

    /* ─────────────────────────────────────────────────
       NAVBAR — mobile menu toggle
       ───────────────────────────────────────────────── */
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');

    function closeMobileNav() {
        navToggle?.setAttribute('aria-expanded', 'false');
        navToggle?.classList.remove('is-open');
        navMobile?.classList.remove('is-open');
        navMobile?.setAttribute('aria-hidden', 'true');
    }

    navToggle?.addEventListener('click', () => {
        const isOpen = navMobile?.classList.contains('is-open');
        if (isOpen) {
            closeMobileNav();
        } else {
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.classList.add('is-open');
            navMobile?.classList.add('is-open');
            navMobile?.setAttribute('aria-hidden', 'false');
        }
    });

    document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    /* ─────────────────────────────────────────────────
       NAVBAR — scrollspy active state
       ───────────────────────────────────────────────── */
    const navSections = ['philosophy', 'research-system', 'trust', 'calculators'];
    const navLinks = document.querySelectorAll('.nav-links a.nav-link');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    navSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) spyObserver.observe(el);
    });

    /* ─────────────────────────────────────────────────
       AMBIENT HERO PARTICLES
       ───────────────────────────────────────────────── */
    (function spawnParticles() {
        const wrap = document.getElementById('heroParticles');
        if (!wrap || prefersReduced) return;

        for (let i = 0; i < 22; i++) {
            const p = document.createElement('div');
            const sz = Math.random() * 2.5 + 1;
            const opa = (Math.random() * .1 + .04).toFixed(2);
            Object.assign(p.style, {
                position: 'absolute',
                width: sz + 'px',
                height: sz + 'px',
                borderRadius: '50%',
                background: `rgba(74,98,40,${opa})`,
                left: Math.random() * 100 + '%',
                top: (55 + Math.random() * 45) + '%',
                pointerEvents: 'none',
            });
            wrap.appendChild(p);

            gsap.to(p, {
                y: -(Math.random() * 110 + 55),
                x: (Math.random() - .5) * 38,
                opacity: 0,
                duration: Math.random() * 9 + 7,
                ease: 'none',
                repeat: -1,
                delay: -(Math.random() * 14),
                onRepeat() {
                    gsap.set(p, {
                        y: 0,
                        opacity: +(opa) + Math.random() * .08,
                        left: Math.random() * 100 + '%',
                        top: (65 + Math.random() * 35) + '%',
                    });
                },
            });
        }
    })();

    /* ─────────────────────────────────────────────────
       All animations run after fonts + images load
       ───────────────────────────────────────────────── */
    window.addEventListener('load', () => {

        /* ═══ VISUAL COLUMN PIN (REMOVED) ═════════════
           Replaced by the philosophy-engine unified pin. */

        /* ═══ HERO ENTRANCE ═══════════════════════════ */

        // Light bloom starts subtly scaled down
        gsap.set('.hero-light', { opacity: 0, scale: .88 });
        gsap.set('.hero-rule', { opacity: 0, scaleX: 0 });

        const heroTL = gsap.timeline({ delay: .15 });

        heroTL
            // Background light blooms in first — sets the scene
            .to('.hero-light', {
                opacity: 1, scale: 1, duration: 2.2,
                ease: 'power2.out',
            })
            // Nav slides down
            .to('.nav-brand', {
                opacity: 1, y: 0, duration: 1.1,
                ease: 'power3.out',
            }, '-=1.9')
            .to('.nav-links a, .nav-cta', {
                opacity: 1, y: 0, duration: 1,
                stagger: .08, ease: 'power3.out',
            }, '-=.85')
            // Eyebrow
            .to('.hero-eyebrow', {
                opacity: 1, duration: .9,
                ease: 'power3.out',
            }, '-=.7')
            // Gold rule expands from center
            .to('.hero-rule', {
                opacity: 1, scaleX: 1, duration: .9,
                ease: 'expo.out',
            }, '-=.55')
            // Headline words cascade upward
            .to('.hw', {
                y: '0%', duration: 1.2,
                stagger: .065, ease: 'power4.out',
            }, '-=.6')
            // Sub-line words drift in
            .to('.hw-sub', {
                opacity: 1, y: 0, duration: .9,
                stagger: .12, ease: 'power3.out',
            }, '-=.55')
            // Scroll indicator
            .to('.scroll-cue', {
                opacity: 1, duration: 1,
                ease: 'power3.out',
            }, '-=.65');

        /* ═══ HERO MOUSE PARALLAX ══════════════════════
           Three depth planes at different rates:
           back (light) → mid (copy) — larger offset = closer
           ────────────────────────────────────────────── */
        if (!prefersReduced) {
            const heroSection = document.getElementById('hero');
            const heroLight = document.querySelector('.hero-light');
            const heroCopy = document.querySelector('.hero-copy');

            heroSection && heroSection.addEventListener('mousemove', e => {
                const { left, top, width, height } = heroSection.getBoundingClientRect();
                const dx = e.clientX - left - width / 2;
                const dy = e.clientY - top - height / 2;

                // Light bloom follows cursor at back-plane speed
                heroLight && gsap.to(heroLight, {
                    x: dx * .016, y: dy * .012,
                    duration: 2.0, ease: 'power1.out', overwrite: 'auto',
                });

                // Text lifts at a faster rate (closer plane)
                heroCopy && gsap.to(heroCopy, {
                    x: dx * .008, y: dy * .006,
                    duration: 1.6, ease: 'power2.out', overwrite: 'auto',
                });
            }, { passive: true });

            heroSection && heroSection.addEventListener('mouseleave', () => {
                [heroLight, heroCopy].forEach(el => {
                    el && gsap.to(el, { x: 0, y: 0, duration: 1.8, ease: 'power2.out', overwrite: 'auto' });
                });
            });
        }

        /* ═══ HERO PARALLAX ═══════════════════════════ */
        if (!prefersReduced) {
            gsap.to('.hero-center', {
                yPercent: -22,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        /* ═══ CINEMATIC PHILOSOPHY ENGINE ══════════════ */

        (function initPhilosophyEngine() {
            const section = document.getElementById('philosophy-engine');
            if (!section) return;

            const pinShell = section.querySelector('.pe-pin-shell');
            const topbarItems = section.querySelectorAll('.pe-kicker, .pe-topline');
            const panels = gsap.utils.toArray('#philosophy-engine .pe-panel');
            const dots = gsap.utils.toArray('#philosophy-engine .pe-dot');
            const floatCards = gsap.utils.toArray('#philosophy-engine .pe-float-card');
            const meterBars = gsap.utils.toArray('#philosophy-engine .pe-meter-bar');
            const progressFill = section.querySelector('.pe-progress-fill');
            const lens = section.querySelector('.pe-lens');
            const photo = section.querySelector('.pe-photo');
            const lensCore = section.querySelector('.pe-lens-core');
            const rings = gsap.utils.toArray('#philosophy-engine .pe-lens-ring');
            const backdrops = gsap.utils.toArray('#philosophy-engine .pe-radial, #philosophy-engine .pe-grid, #philosophy-engine .pe-horizon');

            if (!pinShell || !panels.length) return;

            gsap.set([lens, photo], { force3D: true });

            const lensStates = [
                { rotate: -0.6, scale: 1.005, x: 0, y: 3, core: 1, ringScale: 1, photoX: -6, photoY: 0, photoScale: 1.03 },
                { rotate: 0.8, scale: 1.018, x: 6, y: -3, core: 1, ringScale: 1, photoX: 0, photoY: -4, photoScale: 1.045 },
                { rotate: 1.4, scale: 1.03, x: 10, y: -7, core: 1, ringScale: 1, photoX: 6, photoY: -8, photoScale: 1.06 },
            ];

            let activePanel = -1;

            function setActiveState(index, immediate = false) {
                if (activePanel === index && !immediate) return;
                activePanel = index;

                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle('is-active', dotIndex === index);
                });

                floatCards.forEach((card, cardIndex) => {
                    card.classList.toggle('is-active', cardIndex === index);
                });

                gsap.to(progressFill, {
                    scaleX: (index + 1) / panels.length,
                    duration: immediate ? 0 : 0.55,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });

                meterBars.forEach((bar, barIndex) => {
                    const lit = barIndex <= index;
                    gsap.to(bar, {
                        scaleX: lit ? 1 : 0.62,
                        backgroundColor: lit ? 'rgba(239, 219, 162, 0.92)' : 'rgba(255, 255, 255, 0.12)',
                        duration: immediate ? 0 : 0.45,
                        ease: 'power3.out',
                        overwrite: 'auto',
                    });
                });

                if (!lens) return;

                const state = lensStates[index];
                gsap.to(lens, {
                    rotation: state.rotate,
                    scale: state.scale,
                    x: state.x,
                    y: state.y,
                    duration: immediate ? 0 : 0.72,
                    ease: 'power2.out',
                    overwrite: 'auto',
                });

                if (photo) {
                    gsap.to(photo, {
                        xPercent: state.photoX,
                        yPercent: state.photoY,
                        scale: state.photoScale,
                        duration: immediate ? 0 : 0.72,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                }

                if (lensCore) {
                    gsap.to(lensCore, {
                        scale: state.core,
                        duration: immediate ? 0 : 0.72,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                }

                rings.forEach((ring, ringIndex) => {
                    gsap.to(ring, {
                        scale: state.ringScale + (ringIndex * 0.035),
                        opacity: 0.72 + (index * 0.08),
                        duration: immediate ? 0 : 0.72,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                });
            }

            if (prefersReduced) {
                setActiveState(2, true);
                gsap.set(topbarItems, { opacity: 1, y: 0 });
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(min-width: 901px)', () => {
                gsap.set(topbarItems, { autoAlpha: 0, y: 18 });
                gsap.set(panels, { autoAlpha: 0, y: 34 });
                gsap.set(panels[0], { autoAlpha: 1, y: 0 });
                gsap.set(progressFill, { scaleX: 1 / panels.length });
                setActiveState(0, true);

                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: '+=1650',
                        pin: pinShell,
                        scrub: 0.18,
                        anticipatePin: 1,
                        fastScrollEnd: true,
                        invalidateOnRefresh: true,
                    },
                });

                timeline
                    .call(() => setActiveState(0), null, 0)
                    .to(topbarItems, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power3.out',
                        stagger: 0.06,
                    }, 0.04)
                    .to(panels[0], {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.42,
                        ease: 'power3.out',
                    }, 0.08)
                    .to(backdrops, {
                        yPercent: -2.2,
                        duration: 8,
                        ease: 'none',
                    }, 0)
                    .to(lens, {
                        yPercent: -1.4,
                        duration: 8,
                        ease: 'none',
                    }, 0)
                    .to(panels[0], {
                        autoAlpha: 0,
                        y: -20,
                        duration: 0.42,
                        ease: 'power2.out',
                    }, 1.62)
                    .call(() => setActiveState(1), null, 1.72)
                    .to(panels[1], {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.42,
                        ease: 'power3.out',
                    }, 1.9)
                    .to(panels[1], {
                        autoAlpha: 0,
                        y: -20,
                        duration: 0.42,
                        ease: 'power2.out',
                    }, 3.55)
                    .call(() => setActiveState(2), null, 3.7)
                    .to(panels[2], {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.42,
                        ease: 'power3.out',
                    }, 3.95);

                return () => {
                    timeline.scrollTrigger && timeline.scrollTrigger.kill();
                    timeline.kill();
                };
            });

            mm.add('(max-width: 900px)', () => {
                dots.forEach(dot => dot.classList.add('is-active'));
                floatCards.forEach(card => card.classList.add('is-active'));
                gsap.set(progressFill, { scaleX: 1 });
                gsap.set(topbarItems, { autoAlpha: 0, y: 18 });

                gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 82%',
                        toggleActions: 'play none none none',
                    },
                }).to(topbarItems, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.65,
                    ease: 'power3.out',
                    stagger: 0.08,
                });

                ScrollTrigger.batch(panels, {
                    start: 'top 85%',
                    once: true,
                    onEnter(batch) {
                        gsap.fromTo(batch, {
                            autoAlpha: 0,
                            y: 28,
                        }, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            stagger: 0.12,
                        });
                    },
                });
            });
        })();


        /* ═══ FOOTER ENTRANCE ════════════════════════ */
        gsap.from('#contact .footer-brand', {
            opacity: 0, y: 26, duration: 1.1, ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 82%',
                toggleActions: 'play none none none',
            },
        });

        gsap.from('.footer-nav a', {
            opacity: 0, y: 18, duration: .9,
            stagger: .1, ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 78%',
                toggleActions: 'play none none none',
            },
        });

        gsap.from('.footer-meta', {
            opacity: 0, y: 16, duration: .9, ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 74%',
                toggleActions: 'play none none none',
            },
        });

        /* ═══ SECTION 5 — RESEARCH INTELLIGENCE SYSTEM ═══ */

        // Content text reveal
        gsap.timeline({
            scrollTrigger: {
                trigger: '#research-system',
                start: 'top 68%',
                toggleActions: 'play none none none',
            },
        })
            .to('.rs-eyebrow', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' })
            .to('.rs-title', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=.5')
            .to('.rs-body', { opacity: 1, y: 0, duration: .95, ease: 'power3.out' }, '-=.7')
            .to('.rs-rule', { opacity: 1, duration: .9, ease: 'power2.out' }, '-=.5');

        // Panel staggered entrance (scale + opacity — no y, reserved for parallax)
        ScrollTrigger.create({
            trigger: '#research-system',
            start: 'top 62%',
            once: true,
            onEnter() {
                gsap.to('.dp-back', { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out', delay: .1 });
                gsap.to('.dp-mid', { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out', delay: .32 });
                gsap.to('.dp-front', {
                    opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out', delay: .54,
                    onComplete() {
                        // Trigger CSS bar fill transitions after panels appear
                        document.querySelectorAll('.data-panel').forEach(p => p.classList.add('dp-animated'));
                    }
                });
            },
        });

        // Panel parallax depth layers (different y speeds create 3D feel)
        if (!prefersReduced) {
            const panelParallax = [
                { sel: '.dp-back', y: -28 },
                { sel: '.dp-mid', y: -52 },
                { sel: '.dp-front', y: -76 },
            ];
            panelParallax.forEach(({ sel, y }) => {
                gsap.to(sel, {
                    y,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#research-system',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.4,
                    },
                });
            });
        }

        /* ═══ SECTION 6 — PROCESS ═══════════════════════ */

        // Header reveal
        gsap.timeline({
            scrollTrigger: {
                trigger: '#process',
                start: 'top 70%',
                toggleActions: 'play none none none',
            },
        })
            .to('.proc-eyebrow', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' })
            .to('.proc-title', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=.5');

        // Progress line fill scrub
        if (!prefersReduced) {
            gsap.to('.proc-line-fill', {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.proc-steps',
                    start: 'top 72%',
                    end: 'bottom 65%',
                    scrub: .8,
                },
            });
        } else {
            gsap.set('.proc-line-fill', { scaleY: 1 });
        }

        // Each step activates when it enters the middle of the viewport
        document.querySelectorAll('.proc-step').forEach((step, i) => {
            // Text reveal
            gsap.timeline({
                scrollTrigger: {
                    trigger: step,
                    start: 'top 75%',
                    toggleActions: 'play none none none',
                },
            })
                .to(step.querySelector('.proc-step-num'), { opacity: 1, x: 0, duration: .6, ease: 'power2.out' })
                .to(step.querySelector('.proc-step-title'), { opacity: 1, y: 0, duration: .85, ease: 'power3.out' }, '-=.3')
                .to(step.querySelector('.proc-step-body'), { opacity: 1, y: 0, duration: .75, ease: 'power3.out' }, '-=.5');

            // Active highlight when step is centered in view
            ScrollTrigger.create({
                trigger: step,
                start: 'top 60%',
                end: 'bottom 40%',
                onEnter: () => step.classList.add('is-active'),
                onLeave: () => step.classList.remove('is-active'),
                onEnterBack: () => step.classList.add('is-active'),
                onLeaveBack: () => step.classList.remove('is-active'),
            });
        });

        /* ═══ SECTION 7 — TRUST / CREDIBILITY ══════════ */

        (function initTrustSection() {
            const section = document.getElementById('trust');
            if (!section) return;

            const eyebrow = section.querySelector('.trust-eyebrow');
            const quote = section.querySelector('.trust-quote');
            const quoteAttr = section.querySelector('.trust-quote-attr');
            const divider = section.querySelector('.trust-divider');
            const stats = section.querySelectorAll('.trust-stat');
            const orbOne = section.querySelector('.trust-orb--one');
            const orbTwo = section.querySelector('.trust-orb--two');

            // ── Orchestrated reveal timeline ──
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#trust',
                    start: 'top 68%',
                    toggleActions: 'play none none none',
                },
            });

            tl.to(eyebrow, {
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            })
                .to(quote, {
                    opacity: 1, y: 0, duration: 1.4, ease: 'power4.out',
                }, '-=0.4')
                .to(quoteAttr, {
                    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                }, '-=0.7')
                .to(divider, {
                    opacity: 1, duration: 0.8, ease: 'power2.out',
                    onComplete() {
                        if (divider) divider.classList.add('is-visible');
                    },
                }, '-=0.4')
                .to(stats, {
                    opacity: 1, y: 0, duration: 1.1,
                    stagger: 0.12, ease: 'power4.out',
                }, '-=0.3');

            // ── Counter numbers (fixed formatting) ──
            section.querySelectorAll('.stat-number').forEach(el => {
                const target = +el.dataset.target;
                const suffix = el.dataset.suffix || '';
                const obj = { val: 0 };

                // Format: use commas for thousands, no "K" abbreviation
                const fmt = v => {
                    const rounded = Math.round(v);
                    return rounded.toLocaleString('en-IN') + suffix;
                };

                gsap.to(obj, {
                    val: target,
                    duration: 2.4,
                    ease: 'power2.out',
                    onUpdate() {
                        el.textContent = fmt(obj.val);
                    },
                    scrollTrigger: {
                        trigger: '.trust-stats',
                        start: 'top 78%',
                        toggleActions: 'play none none none',
                    },
                });
            });

            // ── Atmospheric parallax ──
            if (!prefersReduced) {
                if (orbOne) {
                    gsap.to(orbOne, {
                        xPercent: 12, yPercent: 18, ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.4,
                        },
                    });
                }
                if (orbTwo) {
                    gsap.to(orbTwo, {
                        xPercent: -10, yPercent: -14, ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.6,
                        },
                    });
                }
            }
        })();

        /* ═══ SECTION 6 — PHILOSOPHY ══════════════════════════════════ */

        (function initPhilosophySection() {
            const section = document.getElementById('philosophy');
            if (!section) return;

            const headingItems = section.querySelectorAll('.philo-kicker, .philo-marquee, .philo-intro');
            const copyItems = section.querySelectorAll('.philo-chip, .philo-title, .philo-description');
            const signalItems = section.querySelectorAll('.philo-signal');
            const cards = Array.from(section.querySelectorAll('.philo-card'));
            const quoteDock = section.querySelector('.philo-quote-dock');
            const observatory = section.querySelector('.philo-observatory');
            const auraOne = section.querySelector('.philo-aura--one');
            const auraTwo = section.querySelector('.philo-aura--two');
            const beam = section.querySelector('.philo-beam');
            const panelGlow = section.querySelector('.philo-panel-glow');

            gsap.set(cards, {
                transformPerspective: 1400,
                transformOrigin: 'center center',
                force3D: true,
            });

            if (observatory) {
                gsap.set(observatory, {
                    transformPerspective: 1600,
                    transformOrigin: 'center center',
                    force3D: true,
                });
            }

            gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 72%',
                    toggleActions: 'play none none none',
                },
            })
                .to(headingItems, {
                    opacity: 1,
                    y: 0,
                    duration: 1.05,
                    ease: 'power3.out',
                    stagger: 0.12,
                })
                .to(copyItems, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    stagger: 0.1,
                }, '-=0.45')
                .to(signalItems, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.1,
                }, '-=0.35')
                .to(cards, {
                    opacity: 1,
                    y: 0,
                    duration: 1.15,
                    ease: 'power4.out',
                    stagger: 0.12,
                }, '-=0.45')
                .to(quoteDock, {
                    opacity: 1,
                    y: 0,
                    duration: 0.95,
                    ease: 'power3.out',
                }, '-=0.4');

            if (!prefersReduced) {
                if (auraOne) {
                    gsap.to(auraOne, {
                        xPercent: 8,
                        yPercent: 12,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.2,
                        },
                    });
                }

                if (auraTwo) {
                    gsap.to(auraTwo, {
                        xPercent: -10,
                        yPercent: -8,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.4,
                        },
                    });
                }

                if (beam) {
                    gsap.to(beam, {
                        yPercent: 18,
                        opacity: 0.65,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1,
                        },
                    });
                }

                if (panelGlow) {
                    gsap.to(panelGlow, {
                        yPercent: -6,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.1,
                        },
                    });
                }

                if (observatory) {
                    gsap.to(observatory, {
                        yPercent: -4,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.1,
                        },
                    });
                }
            }

            const desktopPointer = window.matchMedia('(min-width: 901px) and (pointer: fine)').matches;
            if (prefersReduced || !desktopPointer || !observatory) return;

            let currentX = 0;
            let currentY = 0;
            let targetX = 0;
            let targetY = 0;
            let tickerActive = false;

            const updateInteractiveMotion = () => {
                currentX += (targetX - currentX) * 0.09;
                currentY += (targetY - currentY) * 0.09;

                gsap.set(observatory, {
                    rotationY: currentX * -2.8,
                    rotationX: currentY * 1.8,
                    x: currentX * 5,
                    y: currentY * 3,
                    force3D: true,
                });

                if (panelGlow) {
                    gsap.set(panelGlow, {
                        x: currentX * 18,
                        y: currentY * 14,
                        force3D: true,
                    });
                }

                if (beam) {
                    gsap.set(beam, {
                        x: currentX * 10,
                        rotation: currentX * 0.75,
                        force3D: true,
                    });
                }

                const settled =
                    Math.abs(targetX - currentX) < 0.0015 &&
                    Math.abs(targetY - currentY) < 0.0015;

                if (settled && targetX === 0 && targetY === 0) {
                    gsap.set(observatory, {
                        rotationY: 0,
                        rotationX: 0,
                        x: 0,
                        y: 0,
                    });

                    if (panelGlow) gsap.set(panelGlow, { x: 0, y: 0 });
                    if (beam) gsap.set(beam, { x: 0, rotation: 0 });

                    gsap.ticker.remove(updateInteractiveMotion);
                    tickerActive = false;
                }
            };

            const ensureTicker = () => {
                if (tickerActive) return;
                tickerActive = true;
                gsap.ticker.add(updateInteractiveMotion);
            };

            observatory.addEventListener('pointermove', e => {
                const rect = observatory.getBoundingClientRect();
                targetX = ((e.clientX - rect.left) / rect.width) - 0.5;
                targetY = ((e.clientY - rect.top) / rect.height) - 0.5;
                ensureTicker();
            }, { passive: true });

            observatory.addEventListener('pointerleave', () => {
                targetX = 0;
                targetY = 0;
                ensureTicker();
            });
        })();

        /* ═══ SECTION 4 — PROCESS (PREMIUM CARDS) ════════ */

        (function initProcessSection() {
            const section = document.getElementById('process');
            if (!section) return;

            const pinShell = section.querySelector('.proc-pin-shell');
            const cards = gsap.utils.toArray('.proc-card-ui');
            const ringFill = section.querySelector('.proc-ring-fill');
            const indicatorNum = section.querySelector('.proc-indicator-num');
            
            if (cards.length === 0) return;

            // ── Initial State ──────────────────────────────
            // Set the first card exactly where it needs to be so stackTl caches its start values perfectly (0, 1, 1)
            gsap.set(cards[0], { yPercent: 0, opacity: 1, scale: 1, y: 0 });
            
            // Other cards start pushed down below the section
            if (cards.length > 1) {
                gsap.set(cards.slice(1), { yPercent: 120, opacity: 0, scale: 1 });
            }
            
            const totalCards = cards.length;

            // ── Pinning Timeline (Card Stack) ──────────────
            const stackTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    pin: true,
                    start: 'top top',
                    end: '+=400%',
                    scrub: 1,
                    anticipatePin: 1
                }
            });

            // Iterate through every card starting from the second (index 1)
            cards.forEach((card, i) => {
                if (i === 0) return;

                const stepLabel = "step" + i;
                
                // Explicitly animate from 120 to 0 to prevent DOM inherit jump bugs
                stackTl.fromTo(card, {
                    yPercent: 120,
                    opacity: 0,
                    scale: 1
                }, {
                    yPercent: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'none',
                }, stepLabel);

                // Push previous cards further back and upwards explicitly
                cards.slice(0, i).forEach((prevCard, j) => {
                    const distance = i - j;
                    const prevDist = distance - 1;
                    
                    stackTl.fromTo(prevCard, {
                        scale: 1 - 0.05 * prevDist,
                        yPercent: -8 * prevDist, 
                        opacity: 1 - 0.1 * prevDist
                    }, {
                        scale: 1 - 0.05 * distance,
                        yPercent: -8 * distance, 
                        opacity: 1 - 0.1 * distance,
                        duration: 1,
                        ease: 'none'
                    }, stepLabel);
                });
            });

            // Smoothly animate the progress ring across the entire scroll
            if (ringFill) {
                stackTl.to(ringFill, {
                    strokeDashoffset: 0,
                    duration: totalCards - 1,
                    ease: 'none'
                }, 0);
            }

            // Scrub update event to change numbered indicator
            stackTl.eventCallback("onUpdate", function() {
                const prog = stackTl.progress();
                const currentStepIndex = Math.min(
                    Math.floor(prog * (totalCards - 0.01)) + 1, 
                    totalCards
                );
                
                if (indicatorNum && indicatorNum._currentStep !== currentStepIndex) {
                    indicatorNum._currentStep = currentStepIndex;
                    indicatorNum.textContent = String(currentStepIndex).padStart(2, '0');
                    
                    // Small local pop animation on number change
                    gsap.fromTo(indicatorNum, 
                        { y: 10, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
                    );
                }
            });

            // ── Intro Animation (When section enters) ──────
            const introTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 65%',
                    toggleActions: 'play none none none'
                }
            });

            introTl.fromTo('.proc-eyebrow', {y: 20, opacity: 0}, {y:0, opacity: 1, duration: 0.8, ease: "power3.out"})
                   .fromTo('.proc-title', {y: 30, opacity: 0}, {y:0, opacity: 1, duration: 1, ease: 'power4.out'}, "-=0.6")
                   .fromTo('.proc-subtitle', {y: 20, opacity: 0}, {y:0, opacity: 1, duration: 0.8, ease: "power3.out"}, "-=0.8")
                   .fromTo('.proc-indicator', {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)'}, "-=0.6")
                   .fromTo(cards[0], {y: 80, opacity: 0}, {y: 0, opacity: 1, duration: 1.2, ease: "power3.out"}, "-=0.6");

            // Ambient Orbs subtle float
            gsap.to('.proc-orb--1', {
                y: '-40px', x: '20px', duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
            gsap.to('.proc-orb--2', {
                y: '30px', x: '-20px', duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });

        })();

        /* ═══ SECTION 9 — FINAL CTA ══════════════════════ */

        gsap.timeline({
            scrollTrigger: {
                trigger: '#final-cta',
                start: 'top 68%',
                toggleActions: 'play none none none',
            },
        })
            .to('.fcta-super', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' })
            .to('.fcta-headline', { opacity: 1, y: 0, duration: 1.3, ease: 'power4.out' }, '-=.5')
            .to('.fcta-sub', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.8')
            .to('.fcta-btn', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.55');

        /* ═══ SCROLL VIDEO SEQUENCE ══════════════════════ */
        (function initVideoSequence() {
            const canvas = document.getElementById('scroll-canvas');
            const video = document.getElementById('story-video');
            if (!canvas || !video) return;

            function setupVideoScrub() {
                video.pause();
                video.currentTime = 0;

                // Proxy object to decouple GSAP ticker from heavy DOM video decoding
                let proxy = { time: 0 };
                let rafId;

                function renderVideo() {
                    // Only update if difference is meaningful
                    if (Math.abs(video.currentTime - proxy.time) > 0.005) {
                        video.currentTime = proxy.time;
                    }
                    rafId = requestAnimationFrame(renderVideo);
                }

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: canvas,
                        start: 'top top',
                        end: '+=5000', // Increased distance for slower, luxurious scrubbing
                        pin: '.sticky-stage',
                        scrub: 1.5, // 1.5s inertial smoothing for Apple/Tesla feel
                        onEnter: () => { rafId = requestAnimationFrame(renderVideo); },
                        onLeave: () => cancelAnimationFrame(rafId),
                        onEnterBack: () => { rafId = requestAnimationFrame(renderVideo); },
                        onLeaveBack: () => cancelAnimationFrame(rafId)
                    }
                });

                // Scrub the proxy time parameter seamlessly
                tl.to(proxy, {
                    time: video.duration || 5, // Fallback duration
                    ease: 'none',
                    duration: 1
                }, 0);

                // Progress line stretches smoothly
                tl.to('#progress-fill', {
                    height: '100%',
                    ease: 'none',
                    duration: 1
                }, 0);

                // Staggered text phases with ultra-smooth easing
                const phases = gsap.utils.toArray('.scroll-canvas .phase');
                if (phases.length) {
                    const p_dur = 1 / phases.length;

                    phases.forEach((phase, i) => {
                        const start = i * p_dur;

                        // Luxurious drift upwards and fade in
                        tl.fromTo(phase, { opacity: 0, y: 30 }, {
                            opacity: 1,
                            y: 0,
                            duration: p_dur * 0.35,
                            ease: 'power2.out'
                        }, start + (p_dur * 0.05));

                        // Soft fade out
                        if (i < phases.length - 1) {
                            tl.to(phase, {
                                opacity: 0,
                                y: -30,
                                duration: p_dur * 0.35,
                                ease: 'power2.inOut'
                            }, start + (p_dur * 0.65));
                        }
                    });

                    // Add a generous empty buffer at the end of the timeline
                    // This creates a "luxurious hold" so the user can admire the final fully grown tree frame
                    // before the section unpins and reveals the next content.
                    tl.to({}, { duration: 0.35 });
                }
            }

            // Ensure video metadata is loaded before initializing
            if (video.readyState >= 1) {
                setupVideoScrub();
            } else {
                video.addEventListener('loadedmetadata', setupVideoScrub, { once: true });
            }
        })();

        /* ═══ ANIMATED WAVE SECTION DIVIDERS ═════════════ */

        (function initWaves() {
            const waves = document.querySelectorAll('.wave-reveal');
            if (!waves.length) return;

            waves.forEach((wave) => {
                const dir = wave.dataset.direction; // 'left' or 'right'
                const isLeft = dir !== 'right';

                // Enforce initial clip state in JS so it's always correct
                gsap.set(wave, {
                    clipPath: isLeft
                        ? 'inset(0 100% 0 0)'   // hidden: right edge covers everything
                        : 'inset(0 0 0 100%)', // hidden: left edge covers everything
                });

                // Reveal the wave as the section bottom enters viewport
                gsap.to(wave, {
                    clipPath: 'inset(0 0% 0 0%)',
                    duration: 1.4,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: wave,
                        start: 'top 98%',     // fires when wave top is just inside view
                        toggleActions: 'play none none none',
                        once: true,
                    },
                });
            });
        })();

        /* ─────────────────────────────────────────────
           Final refresh after all setup
           ───────────────────────────────────────────── */
        ScrollTrigger.refresh();


    }); // end window.load

}); // end onGSAPReady


/* ═══════════════════════════════════════════════════
   FINANCIAL CALCULATORS — interactive logic
   ═══════════════════════════════════════════════════ */
(function initCalculators() {
    'use strict';

    var CIRC = 2 * Math.PI * 50; // SVG donut circumference ~314.16

    /* ─── Formatting ─────────────────────────────── */
    function fmtINR(n) {
        n = Math.abs(Math.round(n));
        if (n >= 1e7) return '\u20B9' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '\u20B9' + (n / 1e5).toFixed(2) + ' L';
        if (n >= 1e3) return '\u20B9' + n.toLocaleString('en-IN');
        return '\u20B9' + n;
    }

    /* ─── Count-up animation ────────────────────── */
    function countUp(el, target, dur) {
        if (!el) return;
        var from = parseFloat(el.dataset.raw) || 0;
        el.dataset.raw = target;
        // Always set final value immediately (RAF may not fire in all contexts)
        el.textContent = fmtINR(target);
        if (from === target || from === 0) return;
        // Animate from previous value for slider adjustments
        var t0 = performance.now();
        function tick(now) {
            var t = Math.min((now - t0) / dur, 1);
            var ease = 1 - Math.pow(1 - t, 3);
            el.textContent = fmtINR(from + (target - from) * ease);
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* ─── Slider fill (gold left, muted right) ───── */
    function fillSlider(s) {
        var min = parseFloat(s.min), max = parseFloat(s.max), val = parseFloat(s.value);
        var pct = ((val - min) / (max - min)) * 100;
        s.style.background =
            'linear-gradient(to right, var(--gold) ' + pct + '%, rgba(194,168,90,0.12) ' + pct + '%)';
    }

    /* ─── Donut chart ─────────────────────────────── */
    function drawDonut(arcA, arcB, a, b) {
        if (!arcA || !arcB) return;
        var total = a + b;
        if (total <= 0) {
            arcA.setAttribute('stroke-dasharray', '0 ' + CIRC);
            arcB.setAttribute('stroke-dasharray', '0 ' + CIRC);
            return;
        }
        var da = (a / total) * CIRC;
        var db = (b / total) * CIRC;
        arcA.setAttribute('stroke-dasharray', da + ' ' + (CIRC - da));
        arcA.setAttribute('stroke-dashoffset', '0');
        arcB.setAttribute('stroke-dasharray', db + ' ' + (CIRC - db));
        arcB.setAttribute('stroke-dashoffset', (-da).toString());
    }

    /* ─── SIP ─────────────────────────────────────── */
    function calcSIP() {
        var P = +document.getElementById('sip-amount').value;
        var r = +document.getElementById('sip-rate').value / 12 / 100;
        var n = +document.getElementById('sip-years').value * 12;
        var fv = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        var inv = P * n;
        var gain = fv - inv;
        countUp(document.getElementById('sip-result'), fv, 600);
        countUp(document.getElementById('sip-invested'), inv, 600);
        countUp(document.getElementById('sip-gains'), gain, 600);
        drawDonut(
            document.getElementById('sip-arc-invested'),
            document.getElementById('sip-arc-gains'),
            inv, gain
        );
    }

    /* ─── EMI ─────────────────────────────────────── */
    function calcEMI() {
        var P = +document.getElementById('emi-amount').value;
        var r = +document.getElementById('emi-rate').value / 12 / 100;
        var n = +document.getElementById('emi-years').value * 12;
        var emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var total = emi * n;
        var interest = total - P;
        countUp(document.getElementById('emi-result'), emi, 600);
        countUp(document.getElementById('emi-total'), total, 600);
        countUp(document.getElementById('emi-interest'), interest, 600);
        drawDonut(
            document.getElementById('emi-arc-principal'),
            document.getElementById('emi-arc-interest'),
            P, interest
        );
    }

    /* ─── Inflation ───────────────────────────────── */
    function calcInflation() {
        var PV = +document.getElementById('inf-amount').value;
        var rate = +document.getElementById('inf-rate').value / 100;
        var years = +document.getElementById('inf-years').value;
        var FV = PV * Math.pow(1 + rate, years);
        var loss = FV - PV;
        var pctDrop = ((1 - PV / FV) * 100).toFixed(1);

        var lbl = document.getElementById('inf-main-label');
        if (lbl) lbl.textContent = 'Future Cost of ' + fmtINR(PV);

        countUp(document.getElementById('inf-result'), FV, 600);
        countUp(document.getElementById('inf-loss'), loss, 600);
        var pctEl = document.getElementById('inf-pct');
        if (pctEl) pctEl.textContent = '-' + pctDrop + '%';

        /* bar chart heights */
        var maxH = 96;
        var ratio = FV / PV;
        var futureH = maxH;
        var presentH = ratio > 0 ? maxH / ratio : maxH;
        var bp = document.getElementById('inf-bar-present');
        var bf = document.getElementById('inf-bar-future');
        if (bp) bp.style.height = presentH + 'px';
        if (bf) bf.style.height = futureH + 'px';
    }

    /* ─── Goal SIP ────────────────────────────────── */
    function calcGoal() {
        var FV = +document.getElementById('goal-target').value;
        var r = +document.getElementById('goal-rate').value / 12 / 100;
        var n = +document.getElementById('goal-years').value * 12;
        var P = FV * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
        var inv = P * n;
        var gain = FV - inv;
        countUp(document.getElementById('goal-result'), P, 600);
        countUp(document.getElementById('goal-invested'), inv, 600);
        countUp(document.getElementById('goal-gains'), gain, 600);
        drawDonut(
            document.getElementById('goal-arc-invested'),
            document.getElementById('goal-arc-gains'),
            inv, gain
        );
    }

    /* ─── Slider label formatters ─────────────────── */
    var fmtMap = {
        'sip-amount': function (v) { return fmtINR(v); },
        'sip-rate': function (v) { return parseFloat(v).toFixed(1) + '%'; },
        'sip-years': function (v) { return v + (v == 1 ? ' yr' : ' yrs'); },
        'emi-amount': function (v) { return fmtINR(v); },
        'emi-rate': function (v) { return parseFloat(v).toFixed(1) + '%'; },
        'emi-years': function (v) { return v + (v == 1 ? ' yr' : ' yrs'); },
        'inf-amount': function (v) { return fmtINR(v); },
        'inf-rate': function (v) { return parseFloat(v).toFixed(1) + '%'; },
        'inf-years': function (v) { return v + (v == 1 ? ' yr' : ' yrs'); },
        'goal-target': function (v) { return fmtINR(v); },
        'goal-rate': function (v) { return parseFloat(v).toFixed(1) + '%'; },
        'goal-years': function (v) { return v + (v == 1 ? ' yr' : ' yrs'); },
    };

    var calcMap = {
        'sip-amount': calcSIP, 'sip-rate': calcSIP, 'sip-years': calcSIP,
        'emi-amount': calcEMI, 'emi-rate': calcEMI, 'emi-years': calcEMI,
        'inf-amount': calcInflation, 'inf-rate': calcInflation, 'inf-years': calcInflation,
        'goal-target': calcGoal, 'goal-rate': calcGoal, 'goal-years': calcGoal,
    };

    /* ─── Bind sliders ────────────────────────────── */
    document.querySelectorAll('.calc-slider').forEach(function (s) {
        fillSlider(s);
        s.addEventListener('input', function () {
            fillSlider(this);
            var valEl = document.getElementById(this.id + '-val');
            if (valEl && fmtMap[this.id]) valEl.textContent = fmtMap[this.id](this.value);
            if (calcMap[this.id]) calcMap[this.id]();
        });
    });

    /* ─── Tab switching ───────────────────────────── */
    document.querySelectorAll('.calc-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            var id = this.dataset.calc;
            document.querySelectorAll('.calc-tab').forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            document.querySelectorAll('.calc-panel').forEach(function (p) {
                p.classList.remove('active');
            });
            var panel = document.getElementById('panel-' + id);
            if (panel) panel.classList.add('active');
        });
    });

    /* ─── Initial compute (on DOM ready) ─────────── */
    function init() {
        calcSIP();
        calcEMI();
        calcInflation();
        calcGoal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ─── GSAP scroll-entry animation ────────────── */
    onGSAPReady(function () {
        gsap.from('#calculators .calc-left', {
            scrollTrigger: {
                trigger: '#calculators',
                start: 'top 72%',
                once: true,
            },
            opacity: 0,
            y: 36,
            duration: 0.95,
            ease: 'power3.out',
        });
        gsap.from('#calculators .calc-right', {
            scrollTrigger: {
                trigger: '#calculators',
                start: 'top 68%',
                once: true,
            },
            opacity: 0,
            y: 48,
            duration: 1.05,
            ease: 'power3.out',
            delay: 0.12,
        });
    });

})();


/* ═══════════════════════════════════════════════
   ENQUIRY FORM — submit feedback
   ═══════════════════════════════════════════════ */
(function () {
    var form = document.getElementById('enquiryForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('.enq-btn');
        var status = document.getElementById('enq-status');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        // Simulate async submit
        setTimeout(function () {
            if (status) status.textContent = 'Thank you — we will be in touch shortly.';
            btn.disabled = false;
            btn.style.opacity = '';
            form.reset();
        }, 1200);
    });
})();

/* ═══════════════════════════════════════════════
   WHATSAPP BUTTON — GSAP scroll reveal
   ═══════════════════════════════════════════════ */
onGSAPReady(function () {
    var btn = document.getElementById('wa-btn');
    if (!btn) return;

    gsap.set(btn, { opacity: 0, y: 16 });

    ScrollTrigger.create({
        trigger: '#hero',
        start: 'bottom 80%',
        onEnterBack: function () {
            gsap.to(btn, {
                opacity: 0, y: 16, duration: 0.35, ease: 'power2.in',
                onComplete: function () { btn.classList.remove('wa-visible'); }
            });
        },
        onLeave: function () {
            btn.classList.add('wa-visible');
            gsap.to(btn, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
        },
    });
});

/* ═══════════════════════════════════════════════
   COMPOUNDING STORY — GSAP cinematic reveal
   ═══════════════════════════════════════════════ */
onGSAPReady(function () {
    const compoundingSection = document.getElementById('compounding-story');
    if (!compoundingSection) return;

    const stage = compoundingSection.querySelector('.compounding-stage');
    const background = compoundingSection.querySelector('.compounding-bg');
    const overlay = compoundingSection.querySelector('.compounding-overlay');
    const aura = compoundingSection.querySelector('.compounding-aura');
    const grid = compoundingSection.querySelector('.compounding-grid');
    const introPanel = compoundingSection.querySelector('.compounding-panel--intro');
    const focusPanel = compoundingSection.querySelector('.compounding-panel--focus');
    const content = compoundingSection.querySelector('.compounding-content');
    const focus = compoundingSection.querySelector('.compounding-focus');
    const kicker = compoundingSection.querySelector('.compounding-kicker');
    const main = compoundingSection.querySelector('.compounding-main');
    const sourceWord = compoundingSection.querySelector('[data-compounding-source]');
    const mainRest = compoundingSection.querySelector('.compounding-main-rest');
    const sub = compoundingSection.querySelector('.compounding-sub');
    const targetWord = compoundingSection.querySelector('[data-compounding-target]');
    const flightLayer = compoundingSection.querySelector('.compounding-flight-layer');
    const flightWord = compoundingSection.querySelector('.compounding-flight-word');

    if (!stage || !background || !content || !focus || !kicker || !main || !sourceWord || !mainRest || !sub || !targetWord || !flightLayer || !flightWord) return;

    // Split text for Digital Typewriter Effect
    function createTypewriterSplit(element, options) {
        const settings = Object.assign({ trim: true }, options);
        if (!element || element.dataset.splitReady === 'true') {
            return { chars: Array.from(element.querySelectorAll('.tw-char')), cursor: element.querySelector('.tw-cursor') };
        }

        const text = settings.trim ? element.textContent.trim() : element.textContent;
        element.dataset.splitReady = 'true';
        element.setAttribute('aria-label', text);
        element.textContent = '';

        const matchIndices = new Set();
        const regex = /compounding/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
            for (let i = 0; i < match[0].length; i++) {
                matchIndices.add(match.index + i);
            }
        }

        Array.from(text).forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'tw-char';
            span.setAttribute('aria-hidden', 'true');
            // Maintain spacing with a non-breaking space if it's a space
            span.textContent = char === ' ' ? '\u00A0' : char;
            // Hide entirely so the cursor sticks to the very edge of the rendering text
            span.style.display = 'none';

            if (matchIndices.has(index)) {
                span.classList.add('tw-highlight');
            }

            element.appendChild(span);
        });

        const cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        cursor.textContent = '|';
        cursor.style.opacity = '0';
        cursor.style.fontWeight = '100';
        cursor.style.marginLeft = '2px';
        element.appendChild(cursor);

        return { chars: Array.from(element.querySelectorAll('.tw-char')), cursor };
    }

    function getRectWithFallback(element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 1 && rect.height > 1) return rect;

        const styles = window.getComputedStyle(element);
        const mirror = document.createElement('span');
        mirror.textContent = element.getAttribute('aria-label') || element.dataset.measureText || element.textContent.trim();
        mirror.style.position = 'fixed';
        mirror.style.left = '-9999px';
        mirror.style.top = '0';
        mirror.style.visibility = 'hidden';
        mirror.style.whiteSpace = 'pre';
        mirror.style.fontFamily = styles.fontFamily;
        mirror.style.fontSize = styles.fontSize;
        mirror.style.fontWeight = styles.fontWeight;
        mirror.style.fontStyle = styles.fontStyle;
        mirror.style.letterSpacing = styles.letterSpacing;
        mirror.style.lineHeight = styles.lineHeight;
        mirror.style.textTransform = styles.textTransform;
        document.body.appendChild(mirror);
        const measured = mirror.getBoundingClientRect();
        document.body.removeChild(mirror);

        return {
            left: rect.left,
            top: rect.top,
            width: measured.width,
            height: measured.height || parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) || rect.height || 0
        };
    }

    function getFlightMetrics() {
        const stageRect = stage.getBoundingClientRect();
        const sourceRect = getRectWithFallback(sourceWord);
        const targetRect = getRectWithFallback(targetWord);
        const travelX = targetRect.left - sourceRect.left;
        const travelY = targetRect.top - sourceRect.top;
        const endScale = targetRect.width / Math.max(sourceRect.width, 1);

        return {
            startX: sourceRect.left - stageRect.left,
            startY: sourceRect.top - stageRect.top,
            midX: sourceRect.left - stageRect.left + travelX * 0.46,
            midY: Math.min(sourceRect.top, targetRect.top) - stageRect.top - Math.max(stageRect.height * 0.16, Math.abs(travelY) * 0.2),
            endX: targetRect.left - stageRect.left,
            endY: targetRect.top - stageRect.top,
            endScale,
            midScale: 1 + (endScale - 1) * 0.46 + 0.08
        };
    }

    flightWord.textContent = sourceWord.textContent.trim();

    if (prefersReduced) {
        compoundingSection.style.minHeight = 'auto';
        stage.style.position = 'relative';
        stage.style.height = 'auto';
        introPanel.style.position = 'relative';
        introPanel.style.inset = 'auto';
        introPanel.style.minHeight = '100vh';
        focusPanel.style.position = 'relative';
        focusPanel.style.inset = 'auto';
        focusPanel.style.minHeight = '100vh';
        focusPanel.style.marginTop = '32px';
        flightLayer.style.display = 'none';
        gsap.set([kicker, main, sub, content, focusPanel, focus, targetWord], { clearProps: 'all', opacity: 1, y: 0, scale: 1 });
        gsap.set(background, { scale: 1, yPercent: 0 });
        if (grid) gsap.set(grid, { opacity: 0.18 });
        if (aura) gsap.set(aura, { opacity: 0.22, scale: 1, xPercent: -50, yPercent: -54 });
        return;
    }

    compoundingSection.classList.add('compounding-enhanced');

    const tKicker = createTypewriterSplit(kicker);
    const tSource = createTypewriterSplit(sourceWord);
    const tRest = createTypewriterSplit(mainRest);
    const tSub = createTypewriterSplit(sub);

    // Initial resets
    gsap.set(content, { autoAlpha: 1 });
    gsap.set(main, { autoAlpha: 1 });
    gsap.set([introPanel, kicker, sourceWord, mainRest, sub], { autoAlpha: 1 });
    gsap.set([focusPanel, focus], { autoAlpha: 0, y: 40 });
    gsap.set(targetWord, { autoAlpha: 0 });
    gsap.set(flightLayer, { autoAlpha: 0, x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: 'left top' });
    gsap.set(background, { scale: 1.1, yPercent: -4 });
    if (grid) gsap.set(grid, { opacity: 0.08, scale: 1.08, transformOrigin: '50% 50%' });
    if (overlay) gsap.set(overlay, { opacity: 0.95 });
    if (aura) gsap.set(aura, { opacity: 0, scale: 0.86, xPercent: -50, yPercent: -54 });

    // Main Typewriter Timeline runs EXACTLY ONCE
    const typeTl = gsap.timeline({
        scrollTrigger: {
            trigger: compoundingSection,
            start: 'top 72%',
            once: true
        },
        onComplete: function () {
            ScrollTrigger.refresh();
        }
    });

    // Gently fade in the background/aura while typing begins
    typeTl.to(background, { scale: 1.04, duration: 3.2, ease: 'power2.out' }, 0)
        .to(overlay, { opacity: 1, duration: 2, ease: 'power2.out' }, 0);

    if (grid) {
        typeTl.to(grid, { opacity: 0.18, scale: 1, duration: 2.4, ease: 'power2.out' }, 0);
    }

    if (aura) {
        typeTl.to(aura, { opacity: 0.72, scale: 1, duration: 2.8, ease: 'power2.out' }, 0);
    }

    typeTl.set(tKicker.cursor, { opacity: 1 }, 0.16)
        .to(tKicker.chars, { display: 'inline', duration: 0.01, stagger: 0.05, ease: 'none' })
        .set(tKicker.cursor, { opacity: 0 }, '+=0.14')
        .set(tSource.cursor, { opacity: 1 })
        .to(tSource.chars, { display: 'inline', duration: 0.01, stagger: 0.06, ease: 'none' })
        .set(tSource.cursor, { opacity: 0 }, '+=0.08')
        .set(tRest.cursor, { opacity: 1 })
        .to(tRest.chars, { display: 'inline', duration: 0.01, stagger: 0.02, ease: 'none' })
        .set(tRest.cursor, { opacity: 0 }, '+=0.1')
        .set(tSub.cursor, { opacity: 1 })
        .to(tSub.chars, { display: 'inline', duration: 0.01, stagger: 0.028, ease: 'none' })
        .to(tSub.cursor, { opacity: 0, duration: 0.2, yoyo: true, repeat: 5 }, '+=0');

    // Background parallax continues independently of the one-time typewriter
    gsap.to(background, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
            trigger: compoundingSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4,
        }
    });

    if (grid) {
        gsap.to(grid, {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: {
                trigger: compoundingSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.45,
            }
        });
    }

    if (aura) {
        gsap.to(aura, {
            yPercent: -46,
            ease: 'none',
            scrollTrigger: {
                trigger: compoundingSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
            }
        });
    }

    const journeyTl = gsap.timeline({
        scrollTrigger: {
            trigger: compoundingSection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1,
            invalidateOnRefresh: true
        }
    });

    journeyTl.to(content, {
        y: -120,
        autoAlpha: 0,
        duration: 0.32,
        ease: 'none'
    }, 0.22);

    if (aura) {
        journeyTl.to(aura, {
            opacity: 0.38,
            scale: 1.08,
            duration: 0.28,
            ease: 'none'
        }, 0.36);
    }

    if (grid) {
        journeyTl.to(grid, {
            opacity: 0.28,
            duration: 0.22,
            ease: 'none'
        }, 0.5);
    }

    journeyTl.to(sourceWord, {
        autoAlpha: 0,
        duration: 0.03,
        ease: 'none'
    }, 0.26);

    journeyTl.to(flightLayer, {
        autoAlpha: 1,
        duration: 0.03,
        ease: 'none'
    }, 0.26);

    journeyTl.fromTo(flightLayer, {
        x: function () { return getFlightMetrics().startX; },
        y: function () { return getFlightMetrics().startY; },
        scale: 1,
        rotation: 0
    }, {
        x: function () { return getFlightMetrics().midX; },
        y: function () { return getFlightMetrics().midY; },
        scale: function () { return getFlightMetrics().midScale; },
        rotation: -5,
        duration: 0.34,
        ease: 'none'
    }, 0.26);

    journeyTl.to(flightLayer, {
        x: function () { return getFlightMetrics().endX; },
        y: function () { return getFlightMetrics().endY; },
        scale: function () { return getFlightMetrics().endScale; },
        rotation: 0,
        duration: 0.26,
        ease: 'none'
    }, 0.58);

    journeyTl.to([focusPanel, focus], {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        ease: 'none'
    }, 0.52);

    journeyTl.to(targetWord, {
        autoAlpha: 1,
        duration: 0.06,
        ease: 'none'
    }, 0.84);

    journeyTl.to(flightLayer, {
        autoAlpha: 0,
        duration: 0.06,
        ease: 'none'
    }, 0.84);
});

onGSAPReady(function () {
    const compoundingSection = document.getElementById('compounding-story');
    if (!compoundingSection) return;

    const background = compoundingSection.querySelector('.compounding-bg');
    const overlay = compoundingSection.querySelector('.compounding-overlay');
    const aura = compoundingSection.querySelector('.compounding-aura');
    const content = compoundingSection.querySelector('.compounding-content');
    const title = compoundingSection.querySelector('.compounding-title');
    const main = compoundingSection.querySelector('.compounding-main');
    const sub = compoundingSection.querySelector('.compounding-sub');

    if (!background || !content || !title || !main || !sub) return;

    function createTypewriterSplit(element) {
        if (!element || element.dataset.splitReady === 'true') {
            return { chars: Array.from(element.querySelectorAll('.tw-char')), cursor: element.querySelector('.tw-cursor') };
        }

        const text = element.textContent.trim();
        element.dataset.splitReady = 'true';
        element.setAttribute('aria-label', text);
        element.textContent = '';

        const matchIndices = new Set();
        const regex = /compounding/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
            for (let i = 0; i < match[0].length; i++) {
                matchIndices.add(match.index + i);
            }
        }

        Array.from(text).forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'tw-char';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'none';

            if (matchIndices.has(index)) {
                span.classList.add('tw-highlight');
            }

            element.appendChild(span);
        });

        const cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        cursor.textContent = '|';
        cursor.style.opacity = '0';
        cursor.style.fontWeight = '100';
        cursor.style.marginLeft = '2px';
        element.appendChild(cursor);

        return { chars: Array.from(element.querySelectorAll('.tw-char')), cursor };
    }

    if (prefersReduced) {
        gsap.set([title, main, sub, content], { clearProps: 'all', opacity: 1, y: 0 });
        gsap.set(background, { scale: 1, yPercent: 0 });
        if (aura) gsap.set(aura, { opacity: 0.22, scale: 1, xPercent: -50, yPercent: -54 });
        return;
    }

    compoundingSection.classList.add('compounding-enhanced');

    const tTitle = createTypewriterSplit(title);
    const tMain = createTypewriterSplit(main);
    const tSub = createTypewriterSplit(sub);

    gsap.set(content, { autoAlpha: 1 });
    gsap.set([title, main, sub], { autoAlpha: 1 });
    gsap.set(background, { scale: 1.05, yPercent: -4 });
    if (overlay) gsap.set(overlay, { opacity: 0.95 });
    if (aura) gsap.set(aura, { opacity: 0, scale: 0.88, xPercent: -50, yPercent: -54 });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: compoundingSection,
            start: 'top 65%',
            once: true
        }
    });

    tl.to(background, { scale: 1, duration: 4, ease: 'power2.out' }, 0)
        .to(overlay, { opacity: 1, duration: 2, ease: 'power2.out' }, 0);

    if (aura) {
        tl.to(aura, { opacity: 0.8, scale: 1, duration: 3, ease: 'power2.out' }, 0);
    }

    tl.set(tTitle.cursor, { opacity: 1 }, 0.2)
        .to(tTitle.chars, { display: 'inline', duration: 0.01, stagger: 0.06, ease: 'none' })
        .set(tTitle.cursor, { opacity: 0 }, '+=0.2');

    tl.set(tMain.cursor, { opacity: 1 })
        .to(tMain.chars, { display: 'inline', duration: 0.01, stagger: 0.03, ease: 'none' })
        .set(tMain.cursor, { opacity: 0 }, '+=0.2');

    tl.set(tSub.cursor, { opacity: 1 })
        .to(tSub.chars, { display: 'inline', duration: 0.01, stagger: 0.04, ease: 'none' })
        .to(tSub.cursor, { opacity: 0, duration: 0.2, yoyo: true, repeat: 7 }, '+=0');

    gsap.to(background, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
            trigger: compoundingSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4,
        }
    });

    if (aura) {
        gsap.to(aura, {
            yPercent: -46,
            ease: 'none',
            scrollTrigger: {
                trigger: compoundingSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
            }
        });
    }
});

onGSAPReady(function () {
    if (prefersReduced) return;

    var enquiry = document.getElementById('enquiry');
    if (!enquiry) return;

    gsap.from('#enquiry .enq-left', {
        scrollTrigger: {
            trigger: enquiry,
            start: 'top 72%',
            once: true,
        },
        opacity: 0,
        y: 42,
        duration: 1.05,
        ease: 'power3.out',
    });

    gsap.from('#enquiry .enq-right', {
        scrollTrigger: {
            trigger: enquiry,
            start: 'top 68%',
            once: true,
        },
        opacity: 0,
        y: 56,
        duration: 1.12,
        ease: 'power3.out',
        delay: 0.08,
    });

    gsap.from('#enquiry .enq-signal', {
        scrollTrigger: {
            trigger: enquiry,
            start: 'top 66%',
            once: true,
        },
        opacity: 0,
        y: 26,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.18,
    });
});
