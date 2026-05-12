// ============================================================
// MAX LEVEL SCRIPT — Birthday Luxury Edition
// ============================================================

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. CUSTOM CURSOR  (always active — purely visual, no audio)
// ============================================================
const cursorDot      = document.getElementById('cursor-dot');
const cursorFollower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.1, ease: 'none' });
});

function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(cursorFollower, { x: followerX - 18, y: followerY - 18 });
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .memory-frame').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursorDot,      { scale: 1.5, duration: 0.3 });
        gsap.to(cursorFollower, { scale: 1.5, borderColor: 'rgba(192,124,136,0.9)', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(cursorDot,      { scale: 1, duration: 0.3 });
        gsap.to(cursorFollower, { scale: 1, borderColor: 'rgba(192,124,136,0.6)', duration: 0.3 });
    });
});

// ============================================================
// 2. SCROLL PROGRESS BAR
// ============================================================
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
}, { passive: true });

// ============================================================
// 3. ROSE PETAL PARTICLE SYSTEM  (init only — start deferred)
// ============================================================
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let width, height;
let petals = [];
const PETAL_COUNT = 60;

const PETAL_COLORS = [
    [255, 192, 203],
    [255, 182, 193],
    [255, 160, 170],
    [255, 220, 228],
    [232, 180, 184],
    [255, 200, 210],
];

function initCanvas() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Petal {
    constructor(startFromTop = false) { this.reset(startFromTop); }
    reset(startFromTop = false) {
        this.x      = Math.random() * width;
        this.y      = startFromTop ? -20 : Math.random() * height;
        this.size   = Math.random() * 12 + 7;
        this.speedY = Math.random() * 1.2 + 0.4;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.rotation      = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.wobble        = Math.random() * Math.PI * 2;
        this.wobbleSpeed   = Math.random() * 0.025 + 0.008;
        this.opacity       = Math.random() * 0.45 + 0.2;
        this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    }
    update() {
        this.wobble   += this.wobbleSpeed;
        this.x        += this.speedX + Math.sin(this.wobble) * 0.7;
        this.y        += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > height + 30) this.reset(true);
        if (this.x < -30)         this.x = width + 30;
        if (this.x > width + 30)  this.x = -30;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(0, -s * 0.5);
        ctx.bezierCurveTo( s * 0.55, -s * 0.5,  s * 0.55,  s * 0.5, 0,  s * 0.5);
        ctx.bezierCurveTo(-s * 0.55,  s * 0.5, -s * 0.55, -s * 0.5, 0, -s * 0.5);
        const [r, g, b] = this.color;
        const grad = ctx.createRadialGradient(0, -s * 0.1, 0, 0, 0, s * 0.6);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(1, `rgba(${Math.max(r-40,0)},${Math.max(g-40,0)},${Math.max(b-40,0)},0.3)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
}

function initPetals() {
    petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal(false));
}

let petalsAnimating = false;
function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animatePetals);
}

// Parallax on scroll
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    petals.forEach(p => { p.y -= delta * (p.size * 0.04); });
    lastScrollY = window.scrollY;
}, { passive: true });

window.addEventListener('resize', () => { initCanvas(); initPetals(); });

// Pre-calculate canvas size but DON'T start drawing yet
initCanvas();

// ============================================================
// 4. LOADING SCREEN — CINEMATIC CURTAIN REVEAL  (deferred)
// ============================================================
const loadingScreen = document.getElementById('loading-screen');

function revealSite() {
    document.querySelector('.loading-content').style.animation = 'none';
    gsap.to('.loading-content', {
        opacity: 0, y: -24, duration: 0.7, ease: 'power2.in',
        onComplete: () => {
            loadingScreen.classList.add('open');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                startHeroTimeline();
            }, 1500);
        }
    });
}

// ============================================================
// 5. GSAP HERO TIMELINE
// ============================================================
function startHeroTimeline() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('#hero-subtitle',    { y: 0, opacity: 1, duration: 1.2, delay: 0.2 })
      .to('#hero-cake-container', { scale: 1, opacity: 1, duration: 1.8, ease: 'back.out(1.3)' }, '-=0.8')
      .to('#candle-flame', {
            opacity: 1, scale: 1,
            transformOrigin: 'bottom center',
            duration: 2.5, ease: 'power2.inOut',
            onComplete: triggerSparkles
        }, '-=0.5')
      .to('#hero-title',    { y: 0, opacity: 1, duration: 1.8, ease: 'power3.out' }, '-=2')
      .to('#hero-greeting', { y: 0, opacity: 1, duration: 1.4 }, '-=1.2')
      .to('#scroll-indicator', { opacity: 1, duration: 1.5 }, '-=0.8');
}

// ============================================================
// 6. SPARKLE BURST
// ============================================================
function triggerSparkles() {
    const sparkles = document.querySelectorAll('.sparkle');
    sparkles.forEach((s, i) => {
        setTimeout(() => {
            s.classList.add('active');
            setTimeout(() => s.classList.remove('active'), 900);
        }, i * 60);
    });
    setTimeout(triggerSparkles, 5000);
}

// ============================================================
// 7. SCROLL ANIMATIONS  (registered after gate tap)
// ============================================================
function initScrollAnimations() {
    gsap.fromTo('.memory-title-container',
        { opacity: 0, y: 40 },
        {
            opacity: 1, y: 0, duration: 1.5,
            scrollTrigger: {
                trigger: '#memory-lane',
                start: 'top 60%', end: 'top 20%',
                scrub: 1
            }
        }
    );

    gsap.utils.toArray('.memory-frame').forEach((frame) => {
        gsap.to(frame, {
            y: 0, opacity: 1, duration: 1.4, ease: 'power3.out',
            scrollTrigger: {
                trigger: frame,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.fromTo('.message-container',
        { scale: 0.92, opacity: 0, y: 50 },
        {
            scale: 1, opacity: 1, y: 0, duration: 1.5,
            scrollTrigger: {
                trigger: '#message',
                start: 'top 65%',
                onEnter: revealMessageLines
            }
        }
    );

    gsap.to('.footer-content', {
        y: 0, opacity: 1, duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: '#footer', start: 'top 80%' }
    });

    animateFloatingHearts();
}

// ============================================================
// 8. MESSAGE TEXT LINE REVEAL
// ============================================================
function revealMessageLines() {
    const lines = document.querySelectorAll('.msg-line');
    lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), i * 350);
    });
}

// ============================================================
// 9. 3D TILT EFFECT ON POLAROID FRAMES
// ============================================================
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const rotX = ((y - cy) / cy) * -8;
        const rotY = ((x - cx) / cx) *  8;
        card.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.transition = 'transform 0.6s ease, box-shadow 0.4s ease';
    });
});

// ============================================================
// 10. AUTOPLAY GATE — single entry point for everything
// ============================================================
const bgMusic      = document.getElementById('bg-music');
const autoplayGate = document.getElementById('autoplay-gate');

// Pre-load audio while the gate is showing (no sound yet)
window.addEventListener('DOMContentLoaded', () => { bgMusic.load(); });

function fadeIn(audio, duration = 3000) {
    audio.volume = 0;
    const step      = 50;
    const target    = 0.75;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
        if (audio.volume < target - increment) {
            audio.volume = Math.min(audio.volume + increment, target);
        } else {
            audio.volume = target;
            clearInterval(timer);
        }
    }, step);
}

function dismissGateAndStart() {
    // 1. Fade out the gate overlay
    autoplayGate.style.opacity      = '0';
    autoplayGate.style.pointerEvents = 'none';
    setTimeout(() => { autoplayGate.style.display = 'none'; }, 650);

    // 2. Start music (tap IS the required user gesture)
    bgMusic.play()
        .then(() => fadeIn(bgMusic))
        .catch(err => console.warn('Audio play failed:', err));

    // 3. Start petals
    initPetals();
    animatePetals();

    // 4. Start curtain reveal after a short pause
    setTimeout(revealSite, 2200);

    // 5. Register scroll animations (after GSAP/DOM is ready)
    initScrollAnimations();
}

autoplayGate.addEventListener('click',      dismissGateAndStart, { once: true });
autoplayGate.addEventListener('touchstart', dismissGateAndStart, { once: true });
autoplayGate.addEventListener('keydown',    dismissGateAndStart, { once: true });

// ============================================================
// 11. BIRTHDAY CELEBRATION — Fireworks + Balloons on scroll bottom
// ============================================================
const celebrationOverlay = document.getElementById('birthday-celebration');
const fwCanvas           = document.getElementById('fireworks-canvas');
const fwCtx              = fwCanvas.getContext('2d');

let fwW, fwH;
let celebActive   = false;
let fwAnimFrameId = null;
let particles     = [];

// Resize fireworks canvas to full viewport
function resizeFireworks() {
    fwW = fwCanvas.width  = window.innerWidth;
    fwH = fwCanvas.height = window.innerHeight;
}
resizeFireworks();
window.addEventListener('resize', resizeFireworks, { passive: true });

// ── Firework Particle ──────────────────────────────────────
class FireworkParticle {
    constructor(x, y, color) {
        this.x    = x; this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx      = Math.cos(angle) * speed;
        this.vy      = Math.sin(angle) * speed;
        this.gravity = 0.12;
        this.alpha   = 1;
        this.decay   = Math.random() * 0.018 + 0.01;
        this.size    = Math.random() * 4 + 2;
        this.trail   = [];
    }
    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        this.vy   += this.gravity;
        this.x    += this.vx;
        this.y    += this.vy;
        this.alpha -= this.decay;
        this.vx   *= 0.98;
    }
    draw(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const a = (i / this.trail.length) * this.alpha * 0.5;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5 * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `,${a})`).replace('rgb', 'rgba');
            ctx.fill();
        }
        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `,${this.alpha})`).replace('rgb', 'rgba');
        ctx.fill();
        // Sparkle glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `,${this.alpha * 0.3})`).replace('rgb', 'rgba');
        ctx.fill();
    }
    isDead() { return this.alpha <= 0; }
}

// Palettes that match the site's aesthetic
const FW_PALETTES = [
    ['rgb(255,180,193)', 'rgb(255,200,210)', 'rgb(232,180,184)', 'rgb(255,220,228)'],  // pinks
    ['rgb(255,215,0)',   'rgb(255,240,150)', 'rgb(255,180,100)', 'rgb(255,200,50)'],   // golds
    ['rgb(180,220,255)', 'rgb(210,240,255)', 'rgb(150,200,255)', 'rgb(255,255,255)'],  // blues
    ['rgb(200,180,255)', 'rgb(220,200,255)', 'rgb(170,150,255)', 'rgb(255,220,255)'],  // purples
];

function launchFirework() {
    const palette = FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)];
    // Aim for upper 55% of screen
    const x = Math.random() * fwW;
    const y = Math.random() * fwH * 0.55 + fwH * 0.05;
    const count = Math.floor(Math.random() * 60) + 70;
    for (let i = 0; i < count; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        particles.push(new FireworkParticle(x, y, color));
    }
}

let fwInterval = null;

function startFireworks() {
    if (fwInterval) return;
    launchFirework();
    fwInterval = setInterval(launchFirework, 700);
    renderFireworks();
}

function stopFireworks() {
    clearInterval(fwInterval);
    fwInterval = null;
    if (fwAnimFrameId) {
        cancelAnimationFrame(fwAnimFrameId);
        fwAnimFrameId = null;
    }
    fwCtx.clearRect(0, 0, fwW, fwH);
    particles = [];
}

function renderFireworks() {
    fwCtx.fillStyle = 'rgba(255,240,243,0.18)'; // ghostly trail
    fwCtx.fillRect(0, 0, fwW, fwH);

    particles = particles.filter(p => {
        p.update();
        p.draw(fwCtx);
        return !p.isDead();
    });

    fwAnimFrameId = requestAnimationFrame(renderFireworks);
}

// ── Show / Hide overlay ───────────────────────────────────
function showCelebration() {
    if (celebActive) return;
    celebActive = true;
    celebrationOverlay.classList.add('visible');
    startFireworks();
}
function hideCelebration() {
    if (!celebActive) return;
    celebActive = false;
    celebrationOverlay.classList.remove('visible');
    stopFireworks();
}

// ── Scroll-to-bottom detection ─────────────────────────────
function checkScrollBottom() {
    const scrollTop  = window.scrollY || document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight;
    const winHeight  = window.innerHeight;
    const atBottom   = (scrollTop + winHeight) >= (docHeight - 2); // ต้องถึงล่างสุดจริงๆ

    if (atBottom) {
        showCelebration();
    } else {
        hideCelebration();
    }
}

window.addEventListener('scroll', checkScrollBottom, { passive: true });
