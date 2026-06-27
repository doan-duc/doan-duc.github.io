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
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const group = new THREE.Group();
  const signalGroup = new THREE.Group();
  const nodeGroup = new THREE.Group();
  const clock = new THREE.Clock();

  camera.position.set(0, 0.6, 9);
  scene.add(group);
  group.add(signalGroup);
  group.add(nodeGroup);

  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.58, 0.38, 180, 18),
    new THREE.MeshBasicMaterial({
      color: 0x76e7ff,
      transparent: true,
      opacity: 0.24,
      wireframe: true
    })
  );
  torus.position.set(2.55, 0.28, -1.1);
  group.add(torus);

  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.45, 2)),
    new THREE.LineBasicMaterial({
      color: 0xff8b64,
      transparent: true,
      opacity: 0.15
    })
  );
  shell.position.set(-2.9, -0.25, -1.7);
  group.add(shell);

  const particleCount = 1050;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color(0x76e7ff),
    new THREE.Color(0xffc857),
    new THREE.Color(0xff7a65),
    new THREE.Color(0x8fff9f),
    new THREE.Color(0xe084ff)
  ];

  for (let i = 0; i < particleCount; i += 1) {
    const index = i * 3;
    positions[index] = (Math.random() - 0.5) * 17;
    positions[index + 1] = (Math.random() - 0.5) * 9;
    positions[index + 2] = (Math.random() - 0.5) * 8;

    const color = palette[i % palette.length];
    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
  }

  const particles = new THREE.BufferGeometry();
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMesh = new THREE.Points(
    particles,
    new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    })
  );
  group.add(particleMesh);

  for (let line = 0; line < 5; line += 1) {
    const geometry = new THREE.BufferGeometry();
    const points = [];
    const z = -3.1 + line * 1.28;

    for (let i = 0; i < 260; i += 1) {
      const x = (i / 259 - 0.5) * 14.8;
      const beat = i % 52;
      let y = Math.sin(i * 0.18 + line) * 0.16 + Math.sin(i * 0.047) * 0.12;

      if (beat === 12) y += 1.04;
      if (beat === 13) y -= 0.68;
      if (beat === 14) y += 0.34;

      points.push(new THREE.Vector3(x, y - 1.2 + line * 0.54, z + Math.sin(i * 0.035) * 0.18));
    }

    geometry.setFromPoints(points);
    const signalLine = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: line % 2 ? 0xffc857 : 0x76e7ff,
        transparent: true,
        opacity: 0.32
      })
    );

    signalGroup.add(signalLine);
  }

  const nodeGeometry = new THREE.IcosahedronGeometry(0.065, 1);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fff9f,
    transparent: true,
    opacity: 0.68
  });

  for (let i = 0; i < 84; i += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    const angle = i * 0.75;
    const radius = 1.6 + (i % 7) * 0.22;
    node.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.32) * 1.08,
      Math.sin(angle) * radius - 0.7
    );
    node.userData.seed = angle;
    nodeGroup.add(node);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render() {
    const elapsed = clock.getElapsedTime();
    const scrollInfluence = window.scrollY * 0.00042;

    group.rotation.y = elapsed * 0.08 + pointer.x * 0.16 + scrollInfluence;
    group.rotation.x = pointer.y * 0.08;
    torus.rotation.x = elapsed * 0.17;
    torus.rotation.z = elapsed * 0.11;
    shell.rotation.y = -elapsed * 0.09;
    signalGroup.position.x = Math.sin(elapsed * 0.38) * 0.26;
    particleMesh.rotation.y = -elapsed * 0.025;

    nodeGroup.children.forEach((node, index) => {
      node.position.y += Math.sin(elapsed * 1.4 + node.userData.seed) * 0.0008;
      node.scale.setScalar(0.86 + Math.sin(elapsed * 1.7 + index) * 0.14);
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
  const nodes = Array.from({ length: 110 }, (_, index) => ({
    seed: index * 13.37,
    x: Math.random(),
    y: Math.random(),
    z: Math.random() * 0.7 + 0.3
  }));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.8);
    width = Math.floor(window.innerWidth * ratio);
    height = Math.floor(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawSignal(yBase, color, phase) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.45;

    const visibleWidth = window.innerWidth;
    for (let x = -20; x <= visibleWidth + 20; x += 8) {
      const beat = Math.floor((x + phase) / 20) % 24;
      let y = yBase + Math.sin((x + phase) * 0.025) * 18 + Math.sin((x + phase) * 0.009) * 22;

      if (beat === 8) y -= 52;
      if (beat === 9) y += 42;
      if (beat === 10) y -= 19;

      if (x === -20) {
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
    ctx.globalAlpha = 0.78;
    nodes.forEach((node, index) => {
      const drift = frame * 0.0018 + node.seed;
      const x = (node.x * window.innerWidth + Math.sin(drift) * 34 + pointer.x * 38 * node.z) % window.innerWidth;
      const y = node.y * window.innerHeight + Math.cos(drift * 0.8) * 26 + pointer.y * 28 * node.z;
      const size = 1.2 + node.z * 2.2;
      ctx.fillStyle = index % 4 === 0 ? "rgba(255, 200, 87, 0.72)" : "rgba(118, 231, 255, 0.64)";
      ctx.beginPath();
      ctx.arc(x < 0 ? x + window.innerWidth : x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    drawSignal(window.innerHeight * 0.33, "rgba(118, 231, 255, 0.45)", frame * 1.8);
    drawSignal(window.innerHeight * 0.56, "rgba(255, 200, 87, 0.38)", frame * 1.4 + 90);
    drawSignal(window.innerHeight * 0.74, "rgba(255, 122, 101, 0.32)", frame * 1.1 + 180);

    if (!reduceMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

bootNeurofield();
