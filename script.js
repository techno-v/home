const header = document.querySelector("#siteHeader");
const navToggle = document.querySelector("#navToggle");
const siteNav = document.querySelector("#siteNav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealEls = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const heroImages = document.querySelectorAll(".hero-showcase__image");
const canvas = document.querySelector("#techCanvas");
const ctx = canvas.getContext("2d");

let counterStarted = false;
let activeHeroImage = 0;
let particles = [];
let width = 0;
let height = 0;
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 28);
}

function closeMenu() {
  navToggle.classList.remove("is-open");
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.classList.toggle("is-open");
  siteNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealEls.forEach((el) => revealObserver.observe(el));

function animateCounters() {
  if (counterStarted) return;
  counterStarted = true;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      animateCounters();
      statsObserver.disconnect();
    }
  },
  { threshold: 0.35 }
);

const statsBlock = document.querySelector(".hero__stats");
if (statsBlock) statsObserver.observe(statsBlock);

function rotateHeroImage() {
  heroImages[activeHeroImage].classList.remove("is-active");
  activeHeroImage = (activeHeroImage + 1) % heroImages.length;
  heroImages[activeHeroImage].classList.add("is-active");
}

setInterval(rotateHeroImage, 4300);

function setActiveNav() {
  const sections = ["accueil", "services", "expertise", "process", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const scrollPoint = window.scrollY + window.innerHeight * 0.32;
  let activeId = "accueil";

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPoint) activeId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
}

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--rx", `${y * -4}deg`);
    card.style.setProperty("--ry", `${x * 4}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
});

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.max(44, Math.min(86, Math.floor(width / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    r: Math.random() * 1.8 + 0.7,
    hue: Math.random() > 0.28 ? "83, 215, 255" : "46, 230, 201"
  }));
}

function drawCanvas() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, 0.62)`;
    ctx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 132) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(83, 215, 255, ${(1 - distance / 132) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawCanvas);
}

window.addEventListener("scroll", () => {
  setHeaderState();
  setActiveNav();
}, { passive: true });

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

setHeaderState();
setActiveNav();
resizeCanvas();
drawCanvas();
