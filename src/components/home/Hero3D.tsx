"use client";
import { useEffect, useRef, useState } from "react";
import JewelArt from "../JewelArt";

/**
 * Real-time 3D jewellery: a gold hoop, a pearl and a cherry gem floating on the page.
 * three.js is loaded lazily so it never blocks first paint. Falls back to SVG art.
 */
export default function Hero3D({ compact = true }: { compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        const el = host.current;
        if (!el || disposed) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;

        const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 9);

        const gold = new THREE.MeshPhysicalMaterial({ color: 0xe2b659, metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.2 });
        const group = new THREE.Group();
        scene.add(group);

        // Chunky hoop
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.36, 64, 160), gold);
        hoop.rotation.set(0.3, -0.5, 0.1);
        group.add(hoop);
        // Post
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16), gold);
        post.position.set(0, 1.95, 0);
        hoop.add(post);

        // Pearl
        const pearl = new THREE.Mesh(
          new THREE.SphereGeometry(0.62, 64, 64),
          new THREE.MeshPhysicalMaterial({ color: 0xf6efe6, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 1, sheenColor: new THREE.Color(0xffd6e0), iridescence: 0.6, iridescenceIOR: 1.6 }),
        );
        if (!compact) group.add(pearl);

        // Gem
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.62, 0),
          new THREE.MeshPhysicalMaterial({ color: 0xc1122c, metalness: 0, roughness: 0.02, transmission: 0.55, thickness: 1.2, ior: 2.1, clearcoat: 1, flatShading: true, attenuationColor: new THREE.Color(0x7a0010), attenuationDistance: 0.8 }),
        );
        gem.scale.set(1, 1.35, 1);
        group.add(gem);

        // Tiny gold stars
        const stars: import("three").Mesh[] = [];
        const starGeo = new THREE.OctahedronGeometry(0.12, 0);
        for (let i = 0; i < 9; i++) {
          const s = new THREE.Mesh(starGeo, gold);
          s.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 2 - 1);
          s.userData.speed = 0.4 + Math.random();
          stars.push(s);
          if (!compact) group.add(s);
        }

        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(3, 4, 5);
        scene.add(key, new THREE.AmbientLight(0xfff1e6, 0.4));

        const isMobile = el.clientWidth < 520;
        group.position.x = compact ? 0 : isMobile ? 0 : 0.2;
        group.scale.setScalar(compact ? 1.25 : isMobile ? 0.7 : 0.82);

        // Pointer parallax
        let tx = 0, ty = 0, sx = 0, sy = 0;
        const onMove = (e: PointerEvent) => {
          tx = (e.clientX / window.innerWidth - 0.5) * 0.9;
          ty = (e.clientY / window.innerHeight - 0.5) * 0.6;
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);

        const clock = new THREE.Clock();
        let raf = 0;
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!visible) return;
          const t = reduced ? 0 : clock.getElapsedTime();
          sx += (tx - sx) * 0.05; sy += (ty - sy) * 0.05;
          const scroll = Math.min(window.scrollY / 600, 1.5);
          group.rotation.y = sx + scroll * 0.8;
          group.rotation.x = sy;
          hoop.rotation.y = -0.5 + Math.sin(t * 0.6) * 0.35 + t * 0.15;
          hoop.position.y = Math.sin(t * 0.9) * 0.12;
          pearl.position.set(Math.cos(t * 0.5) * 1.8, -0.9 + Math.sin(t * 0.8) * 0.2, Math.sin(t * 0.5) * 1.2);
          if (compact) gem.position.set(1.15 + Math.sin(t * 0.7) * 0.1, -1.05 + Math.cos(t * 0.6) * 0.15, 1);
          else gem.position.set(-1.9 + Math.sin(t * 0.7) * 0.15, 1.1 + Math.cos(t * 0.6) * 0.25, 0.6);
          gem.rotation.y = t * 0.8;
          gem.rotation.z = 0.3;
          stars.forEach((s, i) => { s.rotation.y = t * s.userData.speed; s.position.y += Math.sin(t + i) * 0.0015; });
          renderer.render(scene, camera);
        };
        tick();

        const onResize = () => {
          if (!el.clientWidth) return;
          renderer.setSize(el.clientWidth, el.clientHeight);
          camera.aspect = el.clientWidth / el.clientHeight;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("resize", onResize);
          scene.traverse((o) => {
            const mesh = o as import("three").Mesh;
            mesh.geometry?.dispose?.();
            const mat = mesh.material as import("three").Material | import("three").Material[] | undefined;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose()); else mat?.dispose?.();
          });
          envTex.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        if (disposed) cleanup();
      } catch (e) {
        console.warn("3D hero unavailable, using illustration", e);
        if (!disposed) setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden>
      {failed && (
        <div className="absolute inset-[12%] animate-sway"><JewelArt art={{ kind: "hoop", metal: "gold" }} bare /></div>
      )}
    </div>
  );
}
