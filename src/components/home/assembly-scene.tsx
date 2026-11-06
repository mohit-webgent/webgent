"use client";

import { useEffect, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { gsap, ScrollTrigger, isReducedMotion } from "@/components/animations/gsap-core";

/**
 * A loose cloud of particles that assembles into a website layout: the "you imagine, we engineer
 * reality" idea made visual. Scrolling separates the layout into layers, like an exploded diagram.
 * Written in plain three.js rather than a React renderer because it is a single, self-contained scene.
 */

interface Shape {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  /** Solid block rather than an outline. */
  fill?: boolean;
  accent?: boolean;
  /** Share of particles relative to size. */
  density?: number;
}

const LAYOUT: Shape[] = [
  // Browser window
  { x: -3.5, y: -2.25, w: 6.6, h: 4.5, z: 0, density: 1.6 },
  { x: -3.5, y: 1.85, w: 6.6, h: 0.01, z: 0, density: 1.2 },
  { x: -3.3, y: 2.02, w: 0.07, h: 0.07, z: 0, fill: true, accent: true, density: 40 },
  { x: -3.13, y: 2.02, w: 0.07, h: 0.07, z: 0, fill: true, density: 30 },
  { x: -2.96, y: 2.02, w: 0.07, h: 0.07, z: 0, fill: true, density: 30 },
  // Navigation
  { x: -3.2, y: 1.48, w: 0.62, h: 0.14, z: 0.25, fill: true, density: 3 },
  { x: -0.2, y: 1.51, w: 0.42, h: 0.07, z: 0.25, fill: true, density: 2.4 },
  { x: 0.42, y: 1.51, w: 0.42, h: 0.07, z: 0.25, fill: true, density: 2.4 },
  { x: 1.04, y: 1.51, w: 0.42, h: 0.07, z: 0.25, fill: true, density: 2.4 },
  { x: 2.05, y: 1.43, w: 0.82, h: 0.23, z: 0.25, fill: true, accent: true, density: 3 },
  // Headline, copy and button
  { x: -3.2, y: 0.82, w: 2.7, h: 0.3, z: 0.65, fill: true, density: 2.3 },
  { x: -3.2, y: 0.4, w: 2.15, h: 0.3, z: 0.65, fill: true, density: 2.3 },
  { x: -3.2, y: 0.04, w: 2.45, h: 0.07, z: 0.55, fill: true, density: 1.7 },
  { x: -3.2, y: -0.12, w: 1.9, h: 0.07, z: 0.55, fill: true, density: 1.7 },
  { x: -3.2, y: -0.52, w: 0.92, h: 0.26, z: 0.8, fill: true, accent: true, density: 2.6 },
  // Image panel
  { x: -0.2, y: -0.56, w: 3.05, h: 1.72, z: 0.45, fill: true, density: 0.62 },
  // Cards
  { x: -3.2, y: -1.95, w: 1.9, h: 0.98, z: 1, density: 1.5 },
  { x: -3.02, y: -1.4, w: 1.1, h: 0.08, z: 1, fill: true, density: 2 },
  { x: -3.02, y: -1.6, w: 1.5, h: 0.05, z: 1, fill: true, density: 2 },
  { x: -1.08, y: -1.95, w: 1.9, h: 0.98, z: 1.15, density: 1.5 },
  { x: -0.9, y: -1.4, w: 1.1, h: 0.08, z: 1.15, fill: true, density: 2 },
  { x: -0.9, y: -1.6, w: 1.5, h: 0.05, z: 1.15, fill: true, density: 2 },
  { x: 1.04, y: -1.95, w: 1.84, h: 0.98, z: 1.3, density: 1.5 },
  { x: 1.22, y: -1.4, w: 1.1, h: 0.08, z: 1.3, fill: true, density: 2 },
  { x: 1.22, y: -1.6, w: 1.4, h: 0.05, z: 1.3, fill: true, density: 2 },
  // Phone
  { x: 2.55, y: -2.6, w: 1.45, h: 2.95, z: 1.9, density: 1.9 },
  { x: 2.72, y: -0.6, w: 1.1, h: 0.75, z: 2.05, fill: true, density: 1 },
  { x: 2.72, y: -0.86, w: 0.85, h: 0.09, z: 2.05, fill: true, density: 2.2 },
  { x: 2.72, y: -1.04, w: 1.05, h: 0.05, z: 2.05, fill: true, density: 2.2 },
  { x: 2.72, y: -1.42, w: 1.1, h: 0.22, z: 2.2, fill: true, accent: true, density: 2.6 },
  { x: 2.72, y: -2.32, w: 1.1, h: 0.66, z: 2.05, density: 2 },
];

function buildParticles(count: number) {
  const weights = LAYOUT.map((s) => (s.fill ? s.w * s.h * 2.4 : (s.w + s.h) * 0.75) * (s.density ?? 1));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const counts = weights.map((w) => Math.max(4, Math.round((w / total) * count)));
  const size = counts.reduce((sum, c) => sum + c, 0);

  const target = new Float32Array(size * 3);
  const cloud = new Float32Array(size * 3);
  const seed = new Float32Array(size);
  const depth = new Float32Array(size);
  const accent = new Float32Array(size);

  let index = 0;
  LAYOUT.forEach((shape, shapeIndex) => {
    const n = counts[shapeIndex];
    const columns = Math.max(1, Math.round(Math.sqrt((n * shape.w) / Math.max(shape.h, 0.01))));
    const rows = Math.max(1, Math.ceil(n / columns));
    const perimeter = 2 * (shape.w + shape.h);

    for (let i = 0; i < n; i += 1) {
      let x: number;
      let y: number;
      if (shape.fill) {
        x = shape.x + (((i % columns) + 0.5) / columns) * shape.w;
        y = shape.y + ((Math.floor(i / columns) + 0.5) / rows) * shape.h;
      } else {
        let distance = (i / n) * perimeter;
        if (distance < shape.w) {
          x = shape.x + distance;
          y = shape.y;
        } else if ((distance -= shape.w) < shape.h) {
          x = shape.x + shape.w;
          y = shape.y + distance;
        } else if ((distance -= shape.h) < shape.w) {
          x = shape.x + shape.w - distance;
          y = shape.y + shape.h;
        } else {
          x = shape.x;
          y = shape.y + shape.h - (distance - shape.w);
        }
      }

      target.set([x, y, shape.z * 0.32], index * 3);

      // Start spread through a soft shell around the layout.
      const angle = Math.random() * Math.PI * 2;
      const tilt = Math.acos(2 * Math.random() - 1);
      const radius = 3.4 + Math.random() * 4.2;
      cloud.set(
        [
          Math.sin(tilt) * Math.cos(angle) * radius * 1.25,
          Math.sin(tilt) * Math.sin(angle) * radius * 0.85,
          Math.cos(tilt) * radius,
        ],
        index * 3,
      );

      seed[index] = Math.random();
      depth[index] = shape.z;
      accent[index] = shape.accent ? 1 : 0;
      index += 1;
    }
  });

  return { target, cloud, seed, depth, accent };
}

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aCloud;
  attribute float aSeed;
  attribute float aDepth;
  attribute float aAccent;

  uniform float uProgress;
  uniform float uExplode;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  varying float vAccent;
  varying float vAssembled;

  void main() {
    // Each particle starts at a slightly different moment, so the shape forms in a wave.
    float start = aSeed * 0.45;
    float t = clamp((uProgress - start) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);

    float drift = uTime * (0.18 + aSeed * 0.22) + aSeed * 40.0;
    vec3 flowing = aCloud + vec3(sin(drift), cos(drift * 0.8), sin(drift * 0.6)) * 0.45;
    vec3 pos = mix(flowing, position, t);

    pos.z += aDepth * uExplode;
    pos += vec3(sin(drift), cos(drift), 0.0) * 0.008;

    // Particles lift gently towards the pointer.
    float d = distance(pos.xy, uPointer);
    float lift = smoothstep(1.5, 0.0, d) * t;
    pos.z += lift * 0.45;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (11.0 / -mv.z) * (1.0 + lift * 0.5 + (1.0 - t) * 0.25);

    vAccent = aAccent;
    vAssembled = t;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;

  varying float vAccent;
  varying float vAssembled;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.12, d);
    vec3 color = mix(uBase, uAccent, vAccent * vAssembled);
    float strength = mix(0.3, 0.85 + vAccent * 0.15, vAssembled);
    gl_FragColor = vec4(color, alpha * strength);
  }
`;

interface AssemblySceneProps {
  /** Element whose scroll position drives the exploded view. */
  scrollTrigger?: string;
  /** Leaves the particles as a drifting cloud that never assembles. */
  cloudOnly?: boolean;
  className?: string;
}

export default function AssemblyScene({ scrollTrigger, cloudOnly = false, className = "" }: AssemblySceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      setUnavailable(true);
      return;
    }

    const reducedMotion = isReducedMotion();
    const isSmall = window.innerWidth < 768;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.z = 13;

    const data = buildParticles(isSmall ? 9000 : 20000);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(data.target, 3));
    geometry.setAttribute("aCloud", new BufferAttribute(data.cloud, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(data.seed, 1));
    geometry.setAttribute("aDepth", new BufferAttribute(data.depth, 1));
    geometry.setAttribute("aAccent", new BufferAttribute(data.accent, 1));

    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uProgress: { value: reducedMotion && !cloudOnly ? 1 : 0 },
        uExplode: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: isSmall ? 2 : 1.9 },
        uPixelRatio: { value: pixelRatio },
        uPointer: { value: new Vector2(99, 99) },
        uBase: { value: new Color("#F4F3EE") },
        uAccent: { value: new Color("#F26A1F") },
      },
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    const group = new Group();
    group.add(points);
    scene.add(group);

    const base = { x: 0.13, y: -0.38 };
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const scroll = { progress: 0 };

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      group.scale.setScalar(Math.min(1, camera.aspect / 1.35));
      if (reducedMotion) renderer.render(scene, camera);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.targetY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const assemble = cloudOnly
      ? null
      : gsap.to(material.uniforms.uProgress, { value: 1, duration: reducedMotion ? 0 : 3, delay: 0.25, ease: "power2.inOut" });

    const scrollControl =
      scrollTrigger && !reducedMotion
        ? ScrollTrigger.create({
            trigger: scrollTrigger,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              scroll.progress = self.progress;
            },
          })
        : null;

    let frame = 0;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    const startTime = performance.now();

    const render = () => {
      frame = 0;
      if (!isVisible || !isTabVisible) return;

      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      material.uniforms.uTime.value = (performance.now() - startTime) / 1000;
      material.uniforms.uExplode.value = scroll.progress * 0.95;
      material.uniforms.uPointer.value.set(pointer.x * 4.4, pointer.y * 3);

      group.rotation.x = base.x + pointer.y * -0.05 + scroll.progress * 0.28;
      group.rotation.y = base.y + pointer.x * 0.1 + scroll.progress * 0.72;
      group.position.y = scroll.progress * 0.9;
      container.style.opacity = String(Math.max(0, 1 - scroll.progress * 1.25));

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!frame && !reducedMotion) frame = requestAnimationFrame(render);
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      startLoop();
    });
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      startLoop();
    };

    if (reducedMotion) {
      group.rotation.set(base.x, base.y, 0);
      renderer.render(scene, camera);
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);
      startLoop();
    }

    return () => {
      cancelAnimationFrame(frame);
      assemble?.kill();
      scrollControl?.kill();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scrollTrigger, cloudOnly]);

  if (unavailable) {
    return (
      <div className={className} aria-hidden="true">
      </div>
    );
  }

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
