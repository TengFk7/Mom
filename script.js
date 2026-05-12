// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------
// 1. Particle System (Golden Dust)
// --------------------------------------------------------
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 100; // Adjust for performance / density

function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.5 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseOpacity = this.opacity;
        // Pinkish-white hues
        const r = Math.floor(Math.random() * 55 + 200); // 200-255
        const g = Math.floor(Math.random() * 50 + 150); // 150-200
        const b = Math.floor(Math.random() * 50 + 150); // 150-200
        this.color = `${r}, ${g}, ${b}`;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Flicker effect
        this.opacity = this.baseOpacity + Math.sin(Date.now() * 0.002 + this.x) * 0.2;

        // Reset if out of bounds
        if (this.y < -10) {
            this.y = height + 10;
            this.x = Math.random() * width;
        }
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0, this.opacity)})`;
        ctx.fill();
        
        // Add subtle glow to larger particles
        if (this.size > 1.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${this.color}, 1)`;
        } else {
            ctx.shadowBlur = 0;
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

// Handle Resize
window.addEventListener('resize', () => {
    initCanvas();
    initParticles();
});

// Initialize Particle System
initCanvas();
initParticles();
animateParticles();

// --------------------------------------------------------
// 2. Scroll Parallax Effect on Particles
// --------------------------------------------------------
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    
    // Make particles react slightly to scroll direction
    particles.forEach(p => {
        p.y -= deltaY * (p.size * 0.1); // Larger particles move more (parallax)
    });
    
    lastScrollY = currentScrollY;
});


// --------------------------------------------------------
// 3. GSAP Animations
// --------------------------------------------------------

window.addEventListener('load', () => {
    
    // --- Hero Section Timeline (Initial Load) ---
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

    heroTl.to("#hero-subtitle", {
        y: 0,
        opacity: 1,
        duration: 1.5,
        delay: 0.5
    })
    .to("#hero-cake-container", {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "back.out(1.2)"
    }, "-=1")
    .to("#candle-flame", {
        opacity: 1,
        scale: 1,
        duration: 3,
        ease: "power2.inOut"
    }, "-=0.5")
    .to("#hero-title", {
        y: 0,
        opacity: 1,
        duration: 2,
        ease: "power3.out"
    }, "-=2.5")
    .to("#hero-greeting", {
        y: 0,
        opacity: 1,
        duration: 1.5
    }, "-=1.5")
    .to("#scroll-indicator", {
        opacity: 1,
        duration: 2
    }, "-=0.5");


    // --- Memory Lane Scroll Animations ---
    
    // Fade in the title section
    gsap.fromTo(".memory-title-container", 
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            duration: 1.5,
            scrollTrigger: {
                trigger: "#memory-lane",
                start: "top 60%",
                end: "top 20%",
                scrub: 1 // smooth scrubbing
            }
        }
    );

    // Staggered reveal of the picture frames
    const frames = gsap.utils.toArray('.memory-frame');
    
    frames.forEach((frame, i) => {
        gsap.to(frame, {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: frame,
                start: "top 85%", // Trigger when top of frame hits 85% of viewport
                toggleActions: "play reverse play reverse" // play on enter, reverse on leave
            }
        });

        // Add subtle parallax to the image inside the frame
        const parallaxWrap = frame.querySelector('.parallax-wrap');
        gsap.fromTo(parallaxWrap,
            { yPercent: -10 },
            {
                yPercent: 10, // Move image downwards while scrolling past
                ease: "none",
                scrollTrigger: {
                    trigger: frame,
                    start: "top bottom", 
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });

    // --- Heartfelt Message Animation ---
    const messageTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#message",
            start: "top 60%",
            end: "center center",
            scrub: 1
        }
    });

    messageTl.fromTo(".message-container", 
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 2 }
    );

    // --- Footer Animation ---
    gsap.to(".footer-content", {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#footer",
            start: "top 80%"
        }
    });

});
