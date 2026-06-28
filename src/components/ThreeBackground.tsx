"use client";

import { useEffect, useRef } from "react";
import type { Color, Material } from "three";

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let mounted = true;
    let frame = 0;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (!mounted) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pointer = { x: 0, y: 0 };
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "low-power"
      });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      const root = new THREE.Group();
      const clock = new THREE.Clock();

      camera.position.set(0, 0, 7.6);
      scene.add(root);

      const cyan = new THREE.Color("#46c7d8");
      const gold = new THREE.Color("#e7bc5c");
      const green = new THREE.Color("#7ecf8f");

      function createLattice(color: Color, opacity: number, z: number) {
        const positions: number[] = [];
        const cols = 14;
        const rows = 8;
        const stepX = 0.58;
        const stepY = 0.48;
        const startX = -((cols - 1) * stepX) / 2;
        const startY = -((rows - 1) * stepY) / 2;

        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < cols; x += 1) {
            const px = startX + x * stepX;
            const py = startY + y * stepY;
            const wave = Math.sin(x * 0.7 + y * 0.45) * 0.08;

            if (x < cols - 1) {
              positions.push(px, py, z + wave, px + stepX, py, z - wave);
            }

            if (y < rows - 1 && (x + y) % 2 === 0) {
              positions.push(px, py, z + wave, px, py + stepY, z - wave);
            }
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false
        });

        const lines = new THREE.LineSegments(geometry, material);
        lines.rotation.x = -0.42;
        lines.rotation.z = -0.14;
        root.add(lines);
        return lines;
      }

      const rearLattice = createLattice(cyan, 0.16, -0.5);
      const frontLattice = createLattice(gold, 0.2, 0.16);
      const lowerLattice = createLattice(green, 0.12, -0.95);
      lowerLattice.position.y = -0.78;

      const chip = new THREE.Group();
      const chipMaterial = new THREE.LineBasicMaterial({
        color: gold,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });
      const chipEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.65, 1.05, 0.18)),
        chipMaterial
      );
      chip.add(chipEdges);

      for (let index = 0; index < 6; index += 1) {
        const pinGeometry = new THREE.BufferGeometry();
        const y = -0.42 + index * 0.168;
        pinGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute([-1.08, y, 0, -0.84, y, 0, 0.84, y, 0, 1.08, y, 0], 3)
        );
        chip.add(
          new THREE.LineSegments(
            pinGeometry,
            new THREE.LineBasicMaterial({
              color: cyan,
              transparent: true,
              opacity: 0.22,
              depthWrite: false
            })
          )
        );
      }

      chip.position.set(2.45, 0.35, -0.25);
      chip.rotation.set(-0.34, -0.46, 0.1);
      root.add(chip);

      const ring = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.TorusGeometry(0.56, 0.018, 8, 72)),
        new THREE.LineBasicMaterial({
          color: green,
          transparent: true,
          opacity: 0.2,
          depthWrite: false
        })
      );
      ring.position.set(2.45, 0.35, -0.25);
      ring.rotation.x = 1.2;
      root.add(ring);

      function handlePointerMove(event: PointerEvent) {
        pointer.x = event.clientX / window.innerWidth - 0.5;
        pointer.y = event.clientY / window.innerHeight - 0.5;
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
        root.rotation.y = pointer.x * 0.08;
        root.rotation.x = pointer.y * 0.035;

        frontLattice.position.x = Math.sin(elapsed * 0.18) * 0.18;
        rearLattice.position.x = Math.cos(elapsed * 0.14) * 0.12;
        lowerLattice.position.x = Math.sin(elapsed * 0.12 + 1.6) * 0.16;
        chip.rotation.y = -0.46 + Math.sin(elapsed * 0.28) * 0.16;
        chip.rotation.z = 0.1 + Math.cos(elapsed * 0.22) * 0.06;
        ring.rotation.z = elapsed * 0.18;

        renderer.render(scene, camera);

        if (!reduceMotion) {
          frame = window.requestAnimationFrame(render);
        }
      }

      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      resize();
      render();

      cleanup = () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", handlePointerMove);
        window.cancelAnimationFrame(frame);
        scene.traverse((object) => {
          const disposable = object as unknown as {
            geometry?: { dispose: () => void };
            material?: Material | Material[];
          };

          if (disposable.geometry) {
            disposable.geometry.dispose();
          }

          if (disposable.material) {
            const materials = Array.isArray(disposable.material)
              ? disposable.material
              : [disposable.material];
            materials.forEach((material) => material.dispose());
          }
        });
        renderer.dispose();
      };
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />;
}
