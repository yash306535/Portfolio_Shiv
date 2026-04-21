(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const body = document.body;

  if (!body) {
    return;
  }

  const ensureLoader = () => {
    if (document.querySelector(".site-loader")) {
      return;
    }

    const loader = document.createElement("div");
    loader.className = "site-loader";
    loader.innerHTML = `
      <div class="loader-shell" aria-hidden="true">
        <div class="loader-ring"></div>
        <strong>Loading portfolio</strong>
        <div class="loader-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    body.appendChild(loader);
  };

  const hideLoader = () => {
    const loader = document.querySelector(".site-loader");
    if (!loader) {
      return;
    }

    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 500);
  };

  const setupLoader = () => {
    ensureLoader();
    const start = performance.now();
    const minVisible = 650;

    const finish = () => {
      const delay = Math.max(0, minVisible - (performance.now() - start));
      window.setTimeout(hideLoader, delay);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }
  };

  const injectEffects = () => {
    if (!document.querySelector(".particle-canvas")) {
      const canvas = document.createElement("canvas");
      canvas.className = "particle-canvas";
      canvas.setAttribute("aria-hidden", "true");
      body.appendChild(canvas);
    }

    if (finePointer && !document.querySelector(".cursor-glow")) {
      const glow = document.createElement("div");
      glow.className = "cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      body.appendChild(glow);
    }
  };

  const revealTargets = () => {
    const groups = [
      { selector: "#home .intro > *", direction: "up" },
      { selector: "#about h2, #about .about-text", direction: "up" },
      { selector: "#about .about-card", direction: "alternate" },
      { selector: "#education h2", direction: "up" },
      { selector: ".edu-item", direction: "alternate" },
      { selector: "#skills h2", direction: "up" },
      { selector: "#skills .skills-list li", direction: "alternate" },
      { selector: "#projects h2", direction: "up" },
      { selector: ".project-card", direction: "alternate" },
      { selector: ".extra-activities-container h1, .extra-activities-container > p", direction: "up" },
      { selector: ".activity-card", direction: "up" },
      { selector: "#contact h2, #contact p, #contact .social-links", direction: "up" },
      { selector: ".page-header", direction: "up" },
      { selector: ".certificate-note", direction: "up" },
      { selector: ".certificates-grid .certificate-card", direction: "alternate" }
    ];

    const nodes = [];

    groups.forEach((group) => {
      document.querySelectorAll(group.selector).forEach((node, index) => {
        node.classList.add("reveal");
        if (group.direction === "alternate") {
          node.classList.add(index % 2 === 0 ? "reveal-left" : "reveal-right");
        }
        node.style.setProperty("--reveal-delay", `${index * 70}ms`);
        nodes.push(node);
      });
    });

    return nodes;
  };

  const setupRevealObserver = (nodes) => {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    nodes.forEach((node) => observer.observe(node));
  };

  const setupNavHighlight = () => {
    const links = Array.from(document.querySelectorAll("header nav a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) {
      return;
    }

    const sections = links
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1);
        const section = id ? document.getElementById(id) : null;
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.02 }
    );

    sections.forEach(({ section }) => observer.observe(section));
    setActive(sections[0].section.id);
  };

  const setupParticles = () => {
    const canvas = document.querySelector(".particle-canvas");
    if (!canvas || reduceMotion) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;
    const count = prefersCoarse ? 18 : 30;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
    const particles = [];
    let width = 0;
    let height = 0;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.2 + Math.random() * 2.4,
      alpha: 0.28 + Math.random() * 0.35,
      hue: Math.random() > 0.5 ? 248 : 196
    });

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < count; i += 1) {
        particles.push(createParticle());
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${particle.hue}, 85%, 70%, ${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(109, 94, 252, ${(1 - distance / 150) * 0.14})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (pointer.active) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(109, 94, 252, 0.16)";
        ctx.arc(pointer.x, pointer.y, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(step);
    };

    const handleMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    resize();
    init();
    step();

    window.addEventListener("resize", () => {
      resize();
      init();
    });

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(rafId);
    });
  };

  const setupCursorGlow = () => {
    if (reduceMotion || !finePointer) {
      return;
    }

    const glow = document.querySelector(".cursor-glow");
    if (!glow) {
      return;
    }

    let nextX = window.innerWidth / 2;
    let nextY = window.innerHeight / 2;
    let currentX = nextX;
    let currentY = nextY;
    let rafId = 0;

    const tick = () => {
      currentX += (nextX - currentX) * 0.12;
      currentY += (nextY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", (event) => {
      nextX = event.clientX;
      nextY = event.clientY;
      glow.style.opacity = "1";
    });

    window.addEventListener("pointerleave", () => {
      glow.style.opacity = "0.5";
    });

    tick();
    window.addEventListener("beforeunload", () => window.cancelAnimationFrame(rafId));
  };

  const setupTiltCards = () => {
    if (reduceMotion || !finePointer) {
      return;
    }

    const cards = document.querySelectorAll(
      ".about-card, .project-card, .activity-card, .certificate-card, #skills .skills-list li"
    );

    cards.forEach((card) => {
      card.style.transformStyle = "preserve-3d";

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const rotateY = ((offsetX / rect.width) - 0.5) * 10;
        const rotateX = (0.5 - offsetY / rect.height) * 10;
        card.style.transform = `translateY(-8px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  };

  setupLoader();
  injectEffects();
  const nodes = revealTargets();
  setupRevealObserver(nodes);
  setupNavHighlight();
  setupParticles();
  setupCursorGlow();
  setupTiltCards();
})();
