"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import {
  morph,
  phase,
  MORPH_TARGET_SELECTOR,
  TORUS_OUTER_DIAMETER,
  RING_FIT,
  FLATTEN,
  TRAVEL,
  PORTAL_OPEN_START,
  PORTAL_OPEN_END,
  DOM_HANDOFF_START,
  DOM_HANDOFF_END,
  DISSOLVE_START,
  FLUID_FADE,
} from "@/lib/morph";
import { env, STAR_RESIDUAL, FLUID_RESIDUAL, STAR_PARALLAX } from "@/lib/env";
import { BP_DESKTOP } from "@/lib/motion";
import { ACCENT_RGB, ACCENT_2_RGB, MAGENTA_RGB } from "@/lib/palette";
import { site } from "@/lib/content";

const PLANE_Z = -1;
const PLANE_POS = new THREE.Vector3(0, 0, PLANE_Z);
const RING_POS = new THREE.Vector3(0, 0, 0);

// ── Lens Handoff tuning ─────────────────────────────────────────────────────
const DOCK_THICKNESS = 0.3; // slim-rim z-scale at the dock — 1 is the idle torus
const THIN_TUBE = 0.05; // tube radius the torus thins to as it travels (idle: 0.14)
const TRAVEL_SPIN = 4; // peak rad/s while gliding — energy, not violence
const IDLE_SPIN = 0.08; // must stay byte-identical to the original idle
const PORTRAIT_RADIUS = 0.71; // world radius of the iris photo inside the ring
const PARTICLE_BURST = 2.8; // radial fly-out factor as the ring dissolves
const DISSOLVE_EXPAND = 0.12; // extra scale as the ring fades — a dying lens flare
// The idle torus is lit by the bright fluid it refracts; once the fluid dies
// the glass would read as a muddy dark donut against the ink page. A soft
// emissive ramp keeps the traveling/seated ring luminous, and it dies with
// the dissolve. Zero at p = 0 so the hero idle stays byte-identical.
const GLOW_MAX = 0.38;

/**
 * One damped copy of each scrubbed value, shared by every consumer in the
 * scene so ring / iris / particles / fluid never disagree mid-morph.
 * Priority -1 runs it before all other useFrame callbacks.
 */
const smoothed = { p: 0, below: 0, scroll: 0 };

function MorphSmoother() {
  useLayoutEffect(() => {
    // Post-idle mount mid-scroll: snap to the live values instead of
    // flying in from the hero
    smoothed.p = morph.progress;
    smoothed.below = env.below;
    smoothed.scroll = env.pageProgress;
  }, []);
  useFrame((_, delta) => {
    smoothed.p = THREE.MathUtils.damp(smoothed.p, morph.progress, 10, delta);
    smoothed.below = THREE.MathUtils.damp(smoothed.below, env.below, 8, delta);
    smoothed.scroll = THREE.MathUtils.damp(smoothed.scroll, env.pageProgress, 8, delta);
  }, -1);
  return null;
}

// What the transmission buffer shows behind the fluid — without it the
// docked glass goes black. A flat color reads as opaque paint; this gradient
// (the poster palette) gives the distortion pass something to refract, so
// the traveling/docked ring keeps the hero's glass look. Inert while the
// fluid is opaque; once the fluid has receded to its dim residual (see
// FLUID_RESIDUAL) the buffer is this gradient composited with that faint
// veil — intentional: the glass keeps refracting the live atmosphere.
function makeGlassBg() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0d0e12";
  ctx.fillRect(0, 0, 128, 128);
  const splash = (
    x: number,
    y: number,
    r: number,
    color: string
  ) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  };
  splash(40, 44, 80, `rgba(${ACCENT_RGB}, 0.75)`);
  splash(96, 72, 70, `rgba(${ACCENT_2_RGB}, 0.6)`);
  splash(64, 116, 60, `rgba(${MAGENTA_RGB}, 0.42)`);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const FLUID_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 3-octave fbm with domain warping — reads as slow-moving nebula fluid
const FLUID_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uFade;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    float t = uTime * 0.045;

    vec2 q = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 - t * 0.7));
    float f = fbm(uv * 1.8 + q * 1.4 + vec2(t * 0.6, -t * 0.3));

    vec3 ink     = vec3(0.027, 0.027, 0.031);
    vec3 cyan    = vec3(0.157, 0.878, 0.816);
    vec3 violet  = vec3(0.545, 0.361, 0.965);
    vec3 magenta = vec3(0.886, 0.420, 0.960);

    vec3 col = ink;
    col = mix(col, cyan * 0.6, smoothstep(0.36, 0.9, f) * 0.48);
    col = mix(col, violet * 0.55, smoothstep(0.48, 0.95, q.y) * 0.4);
    col = mix(col, magenta * 0.45, smoothstep(0.55, 1.0, q.x * f) * 0.26);

    float d = distance(vUv, vec2(0.5, 0.48));
    // soft glow behind the ring, then a vignette down to ink at the edges
    col += cyan * 0.07 * smoothstep(0.45, 0.0, d);
    col = mix(col, ink, smoothstep(0.34, 0.74, d));

    // Morph fade: settle toward ink while the alpha drops so the mid-fade
    // never flashes bright over the page's ink background
    gl_FragColor = vec4(mix(col, ink, uFade), 1.0 - uFade);
  }
`;

function FluidPlane() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport, camera } = useThree();
  // Size the plane for its own depth — the default viewport is measured at
  // z=0 and leaves bars around a plane that sits further away
  const v = viewport.getCurrentViewport(camera, PLANE_POS);

  useFrame((_, delta) => {
    if (!mat.current || !mesh.current) return;
    mat.current.uniforms.uTime.value += delta;
    const base = THREE.MathUtils.smoothstep(
      smoothed.p,
      FLUID_FADE[0],
      FLUID_FADE[1]
    );
    // The morph fade bottoms out at a dim residual (alpha FLUID_RESIDUAL)
    // through About instead of dead black, then env.below finishes the fade
    // across the Marquee gap. `base` multiplies both terms so the hero at
    // p = 0 stays exactly fade = 0.
    const fade =
      base * (1 - FLUID_RESIDUAL) + FLUID_RESIDUAL * base * smoothed.below;
    mat.current.uniforms.uFade.value = fade;
    // Fully faded → stop paying for the fullscreen FBM pass. Alpha reaches
    // ~0 before the cull, so the switch is invisible.
    mesh.current.visible = fade < 0.995;
  });

  return (
    // renderOrder -1 + no depth write: the fluid is strictly a backdrop. The
    // dust field straddles this plane's depth — letting the plane write depth
    // (or sort against the points by distance) makes the stars flicker in and
    // out depending on which object happens to draw first.
    <mesh ref={mesh} scale={[v.width, v.height, 1]} position={[0, 0, PLANE_Z]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        vertexShader={FLUID_VERT}
        fragmentShader={FLUID_FRAG}
        uniforms={{
          uTime: { value: 0 },
          uAspect: { value: v.width / v.height },
          uFade: { value: 0 },
        }}
      />
    </mesh>
  );
}

/** Eases its children toward the pointer — the whole scene feels held. */
function Rig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.22, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.14, 3, delta);
  });

  return <group ref={group}>{children}</group>;
}

const PORTRAIT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Mirrors the DOM figure's CSS treatment — grayscale + contrast(1.1), the
// ↘ cyan→violet→magenta duotone multiply, and the bottom ink wash — so the
// WebGL→DOM crossfade at the end of the morph is invisible. The texture is
// sampled raw (no colorspace round-trip) for the same reason.
const PORTRAIT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uOpen;   // aperture: 0 closed → 1 fully open
  uniform float uFade;   // 1 visible → 0 handed off to the DOM figure
  uniform float uAspect; // image width / height

  void main() {
    // cover-fit central square crop, with a slight zoom-out as the iris opens
    vec2 uv = vUv - 0.5;
    uv *= mix(1.15, 1.0, uOpen);
    if (uAspect > 1.0) uv.x /= uAspect;
    else uv.y *= uAspect;
    vec3 tex = texture2D(uMap, uv + 0.5).rgb;

    float lum = dot(tex, vec3(0.299, 0.587, 0.114));
    lum = clamp((lum - 0.5) * 1.1 + 0.5, 0.0, 1.0);

    vec3 ink     = vec3(0.027, 0.027, 0.031);
    vec3 cyan    = vec3(0.157, 0.878, 0.816);
    vec3 violet  = vec3(0.545, 0.361, 0.965);
    vec3 magenta = vec3(0.886, 0.420, 0.960);

    float g = clamp((vUv.x + (1.0 - vUv.y)) * 0.5, 0.0, 1.0);
    vec3 grad = g < 0.5 ? mix(cyan, violet, g * 2.0) : mix(violet, magenta, g * 2.0 - 1.0);
    vec3 col = vec3(lum) * grad;
    col = mix(col, ink, 0.4 * (1.0 - vUv.y));

    // iris mask: a hard-ish mechanical edge expanding from the center
    float d = distance(vUv, vec2(0.5));
    float r = uOpen * 0.52;
    float alpha = (1.0 - smoothstep(r - 0.025, r + 0.005, d)) * uFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * The portal iris — a circular portrait that opens like a camera aperture
 * inside the docked ring (uOpen), then hands off to the DOM figure (uFade).
 * Lives in the dock group so it lands with the ring, but outside the flatten
 * group so the spin/z-squash never touch the photo.
 */
function PortraitAperture() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(site.photo);

  const uniforms = useMemo(() => {
    // useTexture suspends until loaded, so the image dimensions are known
    const img = texture.image as { width: number; height: number } | undefined;
    return {
      uMap: { value: texture },
      uOpen: { value: 0 },
      uFade: { value: 1 },
      uAspect: { value: img ? img.width / img.height : 1 },
    };
  }, [texture]);

  useFrame(() => {
    if (!mat.current) return;
    const p = smoothed.p;
    // fully open by the handoff point, then fade to the DOM figure
    const open = phase(p, PORTAL_OPEN_START, PORTAL_OPEN_END);
    mat.current.uniforms.uOpen.value = THREE.MathUtils.smoothstep(open, 0, 1);
    mat.current.uniforms.uFade.value = 1 - phase(p, DOM_HANDOFF_START, DOM_HANDOFF_END);
  });

  return (
    <mesh position={[0, 0, -0.02]}>
      <circleGeometry args={[PORTRAIT_RADIUS, 64]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        vertexShader={PORTRAIT_VERT}
        fragmentShader={PORTRAIT_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * The glass lens — a "lens finding its subject" move driven by the smoothed
 * morph progress `p`:
 *
 *   FLATTEN:  the tilted idle torus rights itself to face the camera and its
 *     z-scale squashes to a slim rim (pure deformation matrix — zero CPU
 *     geometry work). It never scales up past idle; the screen is never
 *     engulfed.
 *   TRAVEL:   it glides from the hero center onto the DOM portrait's live
 *     rect, shrinking to fit, with a moderate z-spin that decays before the
 *     dock so the landing is dead calm.
 *   IRIS → DISSOLVE: the PortraitAperture opens inside the seated ring, the
 *     DOM figure takes over, and the ring fades out with a slight expansion —
 *     nothing WebGL is left over the photo at rest.
 *
 * The frame's rect is measured every frame, so the docking ring rides the
 * figure through its parallax. Lives outside Rig: pointer sway is applied
 * locally, weighted out as the ring docks, so the dock never drifts.
 */
function GlassRing() {
  const dock = useRef<THREE.Group>(null);
  const flat = useRef<THREE.Group>(null);
  const ringMesh = useRef<THREE.Mesh>(null);
  const glassBg = useMemo(() => makeGlassBg(), []);
  // Morph target: same outer silhouette, much slimmer tube — blended in as
  // the ring travels so it lands as a fine rim, not a fat donut. Identical
  // segment counts keep the vertex order aligned, and torus normals depend
  // only on the parametric angles, so the base normals stay exact.
  const ringGeometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.62, 0.14, 32, 96);
    const thin = new THREE.TorusGeometry(0.62 + 0.14 - THIN_TUBE, THIN_TUBE, 32, 96);
    geo.morphAttributes.position = [thin.getAttribute("position")];
    return geo;
  }, []);
  useEffect(() => () => ringGeometry.dispose(), [ringGeometry]);
  const frameEl = useRef<Element | null>(null);
  const spinZ = useRef(0);
  const sway = useRef({ x: 0, y: 0 });
  const { viewport, camera, size } = useThree();

  useFrame((state, delta) => {
    const g = dock.current;
    const f = flat.current;
    if (!g || !f) return;
    const t = state.clock.elapsedTime;

    const p = smoothed.p;

    // Idle state — byte-identical to the original behaviour at p = 0
    const idleRotX = 0.35 + Math.sin(t * 0.2) * 0.08;
    const idleBobY = Math.sin(t * 0.35) * 0.04;
    sway.current.y = THREE.MathUtils.damp(sway.current.y, state.pointer.x * 0.22, 3, delta);
    sway.current.x = THREE.MathUtils.damp(sway.current.x, -state.pointer.y * 0.14, 3, delta);

    // ── Upright + flatten ───────────────────────────────────────────────
    const flatten = phase(p, FLATTEN[0], FLATTEN[1]);
    const flatE = THREE.MathUtils.smoothstep(flatten, 0, 1);
    // Tilt and pointer sway ease out together — the lens faces its subject
    g.rotation.x = THREE.MathUtils.lerp(idleRotX + sway.current.x, 0, flatE);
    g.rotation.y = THREE.MathUtils.lerp(sway.current.y, 0, flatE);
    // Squash to a slim rim (pure deformation matrix — zero CPU geometry work)
    f.scale.z = THREE.MathUtils.lerp(1, DOCK_THICKNESS, flatE);

    // Glide spin: peaks mid-journey, decays to idle well before the dock
    // (the torus is z-symmetric, so the landing never jitters)
    const spinT = phase(p, 0, 0.6);
    spinZ.current +=
      delta * THREE.MathUtils.lerp(IDLE_SPIN, TRAVEL_SPIN, Math.sin(spinT * Math.PI));
    f.rotation.z = spinZ.current;

    // ── Travel: dock onto the live DOM rect ─────────────────────────────
    const dockT = phase(p, TRAVEL[0], TRAVEL[1]);
    // smootherstep: gentle pick-up while flattening, settled before the iris
    const dockE = dockT * dockT * dockT * (dockT * (dockT * 6 - 15) + 10);

    let dockX = 0,
      dockY = 0,
      dockScale = 1;
    if (dockE > 0.001) {
      // Re-query when the cached node has been detached (a remounted About
      // figure would otherwise report an all-zero rect forever)
      if (!frameEl.current?.isConnected) {
        frameEl.current = document.querySelector(MORPH_TARGET_SELECTOR);
      }
      const el = frameEl.current;
      if (el) {
        const v = viewport.getCurrentViewport(camera, RING_POS);
        const r = el.getBoundingClientRect();
        dockX = ((r.left + r.width / 2) / size.width - 0.5) * v.width;
        dockY = -((r.top + r.height / 2) / size.height - 0.5) * v.height;
        // The figure is a circle: ring outer edge tracks its width
        const pxPerUnit = size.height / v.height;
        dockScale = (r.width * RING_FIT) / pxPerUnit / TORUS_OUTER_DIAMETER;
      }
    }

    g.position.set(
      THREE.MathUtils.lerp(0, dockX, dockE),
      THREE.MathUtils.lerp(idleBobY * (1 - dockE), dockY, dockE),
      0
    );
    g.scale.setScalar(THREE.MathUtils.lerp(1, dockScale, dockE));

    // ── Dissolve: the ring fades out over the revealed figure ───────────
    // Expansion + opacity live on the flatten group / ring material only, so
    // the PortraitAperture (sibling in the dock group) never drifts during
    // its crossfade to the DOM figure.
    const dis = phase(p, DISSOLVE_START, 1);
    const disE = THREE.MathUtils.smoothstep(dis, 0, 1);
    f.scale.x = f.scale.y = 1 + disE * DISSOLVE_EXPAND;
    const mesh = ringMesh.current;
    if (mesh) {
      // Tube thinning rides the travel: full-bodied in the hero, a fine rim
      // by the time it seats on the photo
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = dockE;
      const m = mesh.material as THREE.MeshPhysicalMaterial;
      m.opacity = 1 - disE;
      // Glow rises exactly as the fluid backdrop fades, recedes as the iris
      // opens (the portrait takes focus), and dies with the ring
      const irisE = phase(p, PORTAL_OPEN_START, PORTAL_OPEN_END);
      const glow =
        Math.min(phase(p, FLUID_FADE[0], FLUID_FADE[1]), 1 - disE) * (1 - 0.5 * irisE);
      m.emissiveIntensity = glow * GLOW_MAX;
      mesh.visible = dis < 0.999; // skip the transmission pass once gone
    }
  });

  return (
    <group ref={dock} rotation={[0.35, 0, 0]}>
      <group ref={flat}>
        {/* morphTargetInfluences must exist before the first frame: the
            transmission material renders its buffer in a child-registered
            frame callback that runs ahead of this component's own */}
        <mesh ref={ringMesh} geometry={ringGeometry} morphTargetInfluences={[0]}>
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            transparent
            transmission={1}
            thickness={1}
            roughness={0.08}
            ior={1.4}
            chromaticAberration={0.85}
            anisotropicBlur={0.3}
            distortion={0.4}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#d5f2f0"
            emissive="#1cc8ba"
            emissiveIntensity={0}
            background={glassBg}
          />
        </mesh>
      </group>
      <Suspense fallback={null}>
        <PortraitAperture />
      </Suspense>
    </group>
  );
}

// Deterministic PRNG — render-pure, and the dust field is stable across
// re-renders instead of reshuffling
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Drifting additive dust, like the reference's particle fields. Dims through
 * the morph, then flies radially outward (a pure group-scale write — zero
 * attribute churn) as the ring dissolves, cleaning up the focal field.
 */
function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const rand = mulberry32(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.9 + rand() * 2.4;
      const theta = rand() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = (rand() - 0.5) * 2.6;
      // Centered on the group origin — the group itself is pushed back. The
      // slow y-spin must happen about the cloud's own center; rotating an
      // off-center slab swings it aside like a door until every star piles
      // up on one edge of the frame.
      arr[i * 3 + 2] = (rand() - 0.5) * 1.6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    // Bounded sway, never an unbounded spin: the dust is a wide flat slab
    // (±3.3 in x but only ±0.8 in z), so accumulated y-rotation eventually
    // turns it edge-on and the whole field collapses into a narrow band.
    // Oscillating a few degrees keeps it alive with zero long-run drift.
    points.current.rotation.y = Math.sin(t * 0.05) * 0.12;
    points.current.rotation.z = Math.sin(t * 0.023) * 0.06;
    // Below-fold recovery: the dissolve burst relaxes back to 1× and the
    // dust settles at a dim residual as #work approaches. Every term reduces
    // to the original hero/morph behaviour while smoothed.below === 0.
    const recover = THREE.MathUtils.smoothstep(smoothed.below, 0, 1);
    const burstRaw = phase(smoothed.p, DISSOLVE_START, 1);
    const burst = burstRaw * (1 - recover);
    points.current.scale.setScalar(1 + burst * PARTICLE_BURST);
    // Parallax is gated by `recover`, NOT applied from raw page progress:
    // pageProgress is nonzero all through the morph, and an ungated drift
    // there would break the hero/morph-untouched invariant.
    points.current.position.y = smoothed.scroll * STAR_PARALLAX * recover;
    if (mat.current) {
      const heroOp =
        0.5 * (1 - 0.5 * phase(smoothed.p, 0.15, 0.6)) * (1 - burstRaw);
      mat.current.opacity = Math.max(heroOp, STAR_RESIDUAL * recover);
    }
  });

  return (
    // NOT at PLANE_Z: sitting exactly on the fluid plane's depth makes the
    // transparent-sort order between the two a tie, and the stars blink out
    <points ref={points} position={[0, 0, -0.9]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={0.018}
        sizeAttenuation
        color="#9be8e0"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroCanvasInner({ active }: { active: boolean }) {
  // Client-only file: safe to read the viewport. The transmission pass is
  // the expensive part — phones get the fluid and dust alone. Read once per
  // mount by design: HeroCanvas remounts this scene (key) when the
  // breakpoint flips, so the value can't go stale.
  const isMobile = !window.matchMedia(BP_DESKTOP).matches;

  // The DOM-side handoff (PortraitReveal) only holds the figure invisible
  // while the WebGL iris can actually cover for it
  useEffect(() => {
    morph.canvasLive = !isMobile;
    return () => {
      morph.canvasLive = false;
    };
  }, [isMobile]);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 2.6], fov: 45 }}
      // alpha: the fluid fades to transparent as the torus travels over the
      // About section. eventSource: the wrapper is pointer-events-none, so
      // the pointer (Rig / ring sway) is read from the body instead.
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <MorphSmoother />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      {/* coloured speculars give the glass its iridescent edges */}
      <pointLight position={[2.2, 1.2, 2]} intensity={6} color={`rgb(${ACCENT_RGB})`} />
      <pointLight position={[-2.2, -1, 1.6]} intensity={5} color={`rgb(${MAGENTA_RGB})`} />
      <FluidPlane />
      {!isMobile && <GlassRing />}
      <Rig>
        <Particles count={isMobile ? 200 : 550} />
      </Rig>
    </Canvas>
  );
}
