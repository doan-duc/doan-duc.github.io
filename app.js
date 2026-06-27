const canvas = document.getElementById("neurofield");
const progress = document.querySelector(".scroll-progress");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pointer = {
  x: 0,
  y: 0
};

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth - 0.5;
  pointer.y = event.clientY / window.innerHeight - 0.5;
});

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });
}

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

const revealElements = [...document.querySelectorAll(".reveal")];

function isElementInRevealRange(element) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 1.08 && rect.bottom > -window.innerHeight * 0.08;
}

function showVisibleReveals() {
  revealElements.forEach((element) => {
    if (!element.classList.contains("is-visible") && isElementInRevealRange(element)) {
      element.classList.add("is-visible");
      revealObserver.unobserve(element);
    }
  });
}

revealElements.forEach((element) => {
  if (isElementInRevealRange(element)) {
    element.classList.add("is-visible");
    return;
  }

  revealObserver.observe(element);
});

window.addEventListener("load", () => {
  window.setTimeout(showVisibleReveals, 80);
});
window.addEventListener("hashchange", () => {
  window.setTimeout(showVisibleReveals, 80);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const active = navLinks.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
      navLinks.forEach((link) => link.classList.toggle("is-active", link === active));
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

document.querySelectorAll("section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

async function bootNeurofield() {
  if (!canvas) {
    return;
  }

  try {
    const threeModule = await import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js");
    initThreeScene(threeModule);
  } catch (error) {
    initFallbackCanvas();
  }
}

function initThreeScene(THREE) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const root = new THREE.Group();
  const shapeGroup = new THREE.Group();
  const ribbonGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  const clock = new THREE.Clock();

  camera.position.set(0, 0.45, 9.4);
  scene.add(root);
  root.add(shapeGroup);
  root.add(ribbonGroup);
  root.add(particleGroup);

  const palette = [0xff5f7a, 0xffc64d, 0x55d98b, 0x35c9ff, 0x8f65ff, 0xff6acb];
  const shapeMaterials = palette.map((color) =>
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    })
  );

  const wireMaterials = palette.map((color) =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.48
    })
  );

  const geometries = [
    new THREE.TorusGeometry(0.9, 0.22, 22, 72),
    new THREE.IcosahedronGeometry(0.86, 1),
    new THREE.OctahedronGeometry(0.88, 1),
    new THREE.DodecahedronGeometry(0.82, 0),
    new THREE.TorusKnotGeometry(0.72, 0.18, 96, 12)
  ];

  const layout = [
    [-3.7, 1.6, -2.1, 1.05],
    [3.45, 1.2, -2.4, 1.26],
    [4.35, -1.35, -2.2, 1.08],
    [-4.1, -1.55, -2.55, 0.96],
    [1.35, -2.55, -3.25, 0.78],
    [-0.4, 2.55, -3.2, 0.7]
  ];

  layout.forEach(([x, y, z, scale], index) => {
    const geometry = geometries[index % geometries.length];
    const mesh = new THREE.Mesh(geometry, shapeMaterials[index % shapeMaterials.length]);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    mesh.userData = {
      drift: 0.3 + index * 0.17,
      baseY: y
    };
    shapeGroup.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      wireMaterials[(index + 2) % wireMaterials.length]
    );
    wire.position.copy(mesh.position);
    wire.scale.copy(mesh.scale);
    wire.userData = mesh.userData;
    shapeGroup.add(wire);
  });

  for (let band = 0; band < 4; band += 1) {
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 9 }, (_, index) => {
        const t = index / 8;
        const x = (t - 0.5) * 13.4;
        const y = Math.sin(t * Math.PI * 2 + band * 0.7) * 0.7 + (band - 1.5) * 0.55;
        const z = -3.4 + Math.cos(t * Math.PI * 2 + band) * 0.36;
        return new THREE.Vector3(x, y, z);
      })
    );

    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.025 + band * 0.004, 8, false),
      new THREE.MeshBasicMaterial({
        color: palette[band],
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      })
    );
    ribbon.userData.offset = band * 0.9;
    ribbonGroup.add(ribbon);
  }

  const particleGeometry = new THREE.SphereGeometry(0.035, 10, 10);
  const particleMaterials = palette.map((color) =>
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    })
  );

  for (let index = 0; index < 72; index += 1) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterials[index % particleMaterials.length]);
    const lane = index % 6;
    const t = index / 72;
    particle.position.set(
      (Math.random() - 0.5) * 12.8,
      Math.sin(t * Math.PI * 6) * 1.9 + (lane - 2.5) * 0.18,
      -2.8 - Math.random() * 1.8
    );
    particle.scale.setScalar(0.8 + Math.random() * 2.6);
    particle.userData.seed = Math.random() * Math.PI * 2;
    particleGroup.add(particle);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render() {
    const elapsed = clock.getElapsedTime();
    const scrollInfluence = window.scrollY * 0.00022;

    root.rotation.y = pointer.x * 0.08 + scrollInfluence;
    root.rotation.x = pointer.y * 0.045;

    shapeGroup.children.forEach((shape, index) => {
      shape.rotation.x = elapsed * (0.065 + index * 0.002) + index * 0.17;
      shape.rotation.y = elapsed * (0.08 + index * 0.003);
      shape.position.y = shape.userData.baseY + Math.sin(elapsed * 0.65 + shape.userData.drift) * 0.1;
    });

    ribbonGroup.children.forEach((ribbon, index) => {
      ribbon.rotation.z = Math.sin(elapsed * 0.22 + ribbon.userData.offset) * 0.045;
      ribbon.position.x = Math.sin(elapsed * 0.18 + index) * 0.16;
      ribbon.position.y = Math.cos(elapsed * 0.16 + index) * 0.08;
    });

    particleGroup.children.forEach((particle, index) => {
      particle.position.x += Math.sin(elapsed * 0.8 + particle.userData.seed) * 0.0016;
      particle.position.y += Math.cos(elapsed * 0.7 + particle.userData.seed) * 0.0012;
      particle.scale.setScalar(0.95 + ((index % 5) * 0.22) + Math.sin(elapsed * 1.4 + index) * 0.1);
    });

    renderer.render(scene, camera);

    if (!reduceMotion) {
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  render();
}

function initFallbackCanvas() {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let frame = 0;
  const colors = ["#ff5f7a", "#ffc64d", "#55d98b", "#35c9ff", "#8f65ff", "#ff6acb"];
  const shapes = Array.from({ length: 36 }, (_, index) => ({
    seed: index * 0.82,
    x: Math.random(),
    y: Math.random(),
    size: 26 + Math.random() * 72,
    color: colors[index % colors.length]
  }));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.floor(window.innerWidth * ratio);
    height = Math.floor(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawRibbon(yBase, color, phase) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    for (let x = -40; x <= window.innerWidth + 40; x += 14) {
      const y = yBase + Math.sin((x + phase) * 0.012) * 42 + Math.sin((x + phase) * 0.028) * 16;

      if (x === -40) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  function draw() {
    frame += reduceMotion ? 0 : 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.save();
    ctx.globalAlpha = 0.5;
    drawRibbon(window.innerHeight * 0.24, "rgba(53, 201, 255, 0.52)", frame * 1.5);
    drawRibbon(window.innerHeight * 0.55, "rgba(255, 95, 122, 0.42)", frame * 1.1 + 80);
    drawRibbon(window.innerHeight * 0.78, "rgba(143, 101, 255, 0.38)", frame * 0.9 + 160);
    ctx.restore();

    shapes.forEach((shape, index) => {
      const drift = frame * 0.006 + shape.seed;
      const x = shape.x * window.innerWidth + Math.sin(drift) * 28 + pointer.x * 28;
      const y = shape.y * window.innerHeight + Math.cos(drift * 0.8) * 22 + pointer.y * 18;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(drift * 0.12);
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = shape.color;
      if (index % 3 === 0) {
        ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (!reduceMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

bootNeurofield();
