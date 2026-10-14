import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MARK } from '../lib/chiliMark';

const TURN_SECONDS = 40; // one full, very slow revolution

function bodyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1);
  s.lineTo(MARK.top.x, MARK.top.y);
  s.lineTo(MARK.notch.x, MARK.notch.y);
  s.lineTo(MARK.bottom.x, MARK.bottom.y);
  s.lineTo(0, -1);
  s.absarc(0, 0, 1, -Math.PI / 2, Math.PI / 2, true); // round left side
  return s;
}

function facetShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(MARK.notch.x, MARK.notch.y);
  s.lineTo(MARK.bottom.x, MARK.bottom.y);
  s.lineTo(0, -1);
  s.absarc(0, 0, 1, -Math.PI / 2, MARK.facetAngle, true);
  s.lineTo(MARK.notch.x, MARK.notch.y);
  return s;
}

/** The CHILI publish mark, extruded and slowly turning in 3D, lit like it sits above a fire. */
export default function ChiliLogo3D() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const bevel = { bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6, curveSegments: 64 };
    const body = new THREE.ExtrudeGeometry(bodyShape(), { depth: 0.38, ...bevel });
    const facet = new THREE.ExtrudeGeometry(facetShape(), { depth: 0.38, ...bevel });
    body.computeBoundingBox();
    const center = body.boundingBox!.getCenter(new THREE.Vector3());
    body.translate(-center.x, -center.y, -center.z);
    facet.translate(-center.x, -center.y, -center.z - 0.0); // same slab, separate material
    facet.translate(0, 0, 0.012); // lift the facet a hair so its face wins the depth test

    const glossy = { metalness: 0.2, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.18 };
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: MARK.colors.bodyDeep, emissive: '#2a0008', ...glossy });
    const facetMaterial = new THREE.MeshPhysicalMaterial({ color: MARK.colors.facet, emissive: '#4a000c', ...glossy });

    const mark = new THREE.Group();
    mark.add(new THREE.Mesh(body, bodyMaterial), new THREE.Mesh(facet, facetMaterial));
    scene.add(mark);

    // Lighting: dim ambient, a warm key, an orbiting ember light, fire glow from below, and a hot rim from behind.
    scene.add(new THREE.AmbientLight('#ffd9c7', 0.25));
    const key = new THREE.DirectionalLight('#fff1e6', 1.6);
    key.position.set(2, 3, 5);
    const ember = new THREE.PointLight('#ff7a1a', 30, 20);
    const fire = new THREE.PointLight('#ff2a1a', 26, 20);
    fire.position.set(0, -3.2, 2);
    const rim = new THREE.PointLight('#ffb36b', 40, 20);
    rim.position.set(-2.5, 2, -3);
    scene.add(key, ember, fire, rim);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the mark about the same visual size on narrow screens.
      camera.position.z = w < h ? 10 * Math.min(1.6, h / w / 1.2) : 10;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    let frame = 0;
    const started = performance.now();
    const render = (now: number) => {
      const t = (now - started) / 1000;
      mark.rotation.y = 0.5 + (reduceMotion ? 0 : (t / TURN_SECONDS) * Math.PI * 2);
      mark.rotation.x = reduceMotion ? 0.1 : 0.1 + Math.sin(t * 0.35) * 0.1;
      mark.position.y = reduceMotion ? 0 : Math.sin(t * 0.6) * 0.06;
      ember.position.set(Math.cos(t * 0.5) * 3, Math.sin(t * 0.7) * 1.2, Math.sin(t * 0.5) * 3);
      fire.intensity = 22 + Math.sin(t * 7) * 3 + Math.sin(t * 13) * 2; // flicker
      renderer.render(scene, camera);
      if (!reduceMotion) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      body.dispose();
      facet.dispose();
      bodyMaterial.dispose();
      facetMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className="size-full [&>canvas]:size-full" />;
}
