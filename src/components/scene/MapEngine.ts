import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import type { Map3DData } from "@/lib/usMap";

/**
 * Live 3D map of the U.S. built entirely from code: every grid point is a small metal pillar,
 * the 13 states ASFRA serves are raised in royal blue with glowing caps and joined by arcs of light.
 * A cue list pinned to page sections ([data-cue]) drives the camera from the scroll, and scrolling
 * through the hero connects the states one by one (no clicks needed).
 */

export type Cue = {
  polar: number; // degrees from straight down
  azimuth: number; // degrees around the map
  distance: number;
  tx: number; // look-at target, world units
  tz: number;
  ox: number; // screen offset of the map, fraction of width (+ = right)
  oy: number; // screen offset, fraction of height (+ = up)
  explode: number; // 0 together, 1 states lifted apart
  dim: number; // 0 full, 1 nearly dark (so text on top stays readable)
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type CueSet = Record<string, (mobile: boolean, p: number) => Cue>; // p: progress through the hero

const CUES: CueSet = {
  // While the hero scrolls, the camera orbits and pushes in as the states connect.
  hero: (m, p) => {
    const e = smooth(p);
    return m
      ? { polar: lerp(44, 38, e), azimuth: lerp(-8, 12, e), distance: lerp(34, 30, e), tx: -0.1, tz: 0.3, ox: 0, oy: lerp(-0.14, 0.03, e), explode: 0, dim: 0 }
      : { polar: lerp(52, 42, e), azimuth: lerp(-20, 8, e), distance: lerp(21, 18, e), tx: 0.4, tz: 0.2, ox: 0.2, oy: 0.02, explode: 0, dim: 0 };
  },
  pinned: (m) =>
    m
      ? { polar: 40, azimuth: 16, distance: 22, tx: 2.4, tz: 1.1, ox: 0, oy: 0.08, explode: 0.55, dim: 0.35 }
      : { polar: 38, azimuth: 18, distance: 9.5, tx: 2.4, tz: 1.1, ox: 0, oy: 0, explode: 0.55, dim: 0.35 },
  services: (m) => ({ polar: 14, azimuth: 0, distance: m ? 40 : 15, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0.15, dim: 0.82 }),
  audiences: (m) => ({ polar: 32, azimuth: -28, distance: m ? 40 : 14, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0, dim: 0.86 }),
  states: (m) =>
    m
      ? { polar: 44, azimuth: 0, distance: 38, tx: 0.2, tz: 0.4, ox: 0, oy: 0.1, explode: 1, dim: 0.05 }
      : { polar: 46, azimuth: 0, distance: 17.5, tx: 0.3, tz: 0.4, ox: -0.17, oy: -0.04, explode: 1, dim: 0.05 },
  quote: (m) => ({ polar: 30, azimuth: 20, distance: m ? 42 : 22, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0, dim: 0.9 }),
};

const S = 0.012; // world units per map pixel
const NAVY = new THREE.Color("#0e1a3d");
const ROYAL = new THREE.Color("#005dff");
const ICE = new THREE.Color("#9cc0ff");


type StateGroup = { index: number; instances: number[]; order: number; x: number; z: number };

export class MapEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  private base!: THREE.InstancedMesh;
  private active!: THREE.InstancedMesh;
  private caps!: THREE.InstancedMesh;
  private baseX: Float32Array;
  private activeData: { x: number; z: number; state: number; xn: number }[] = [];
  private states: StateGroup[] = [];
  private nodes: THREE.Mesh[] = [];
  private pins!: THREE.LineSegments;
  private links: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; pulse: THREE.Mesh }[] = [];
  private linkGroup = new THREE.Group();
  private linkMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#7fa8ff").multiplyScalar(1.4),
    toneMapped: false,
    transparent: true,
    opacity: 0.95,
  });
  private nodeMat = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });

  private mobile = false;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private anchors: { id: string; top: number }[] = [];
  private cur: Cue;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  private intro = 0;
  private energy = 0; // eased copy of the hero scroll progress
  private glow: number[] = [];
  private lit = 0;
  private lastEmit = "";

  private fpsFrames = 0;
  private fpsTime = 0;
  private fpsChecks = 0;

  private tmp = new THREE.Object3D();
  private col = new THREE.Color();

  constructor(
    private canvas: HTMLCanvasElement,
    private data: Map3DData,
    private onFail: () => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(NAVY, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    this.scene.background = NAVY;
    this.scene.fog = new THREE.Fog(NAVY, 18, 44);

    this.buildStudio();
    this.baseX = new Float32Array(0);
    this.buildMap();
    this.buildFloorGlow();
    this.cur = CUES.hero(this.mobile, 0);

    this.resize(true);
    this.setupPost();
    this.measureAnchors();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    this.renderer.compileAsync(this.scene, this.camera).catch(() => {});
    this.clock.start();
    this.loop();
  }

  /** Small photo studio (softbox + strips) baked into the environment so the metal has something to reflect. */
  private buildStudio() {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color("#0a1230");
    const panel = (w: number, h: number, intensity: number, pos: [number, number, number], tint = "#ffffff") => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      studio.add(m);
    };
    panel(22, 14, 3.2, [-22, 20, 20]); // key softbox, off-axis
    panel(2.4, 34, 7, [30, 4, 12], "#cfe0ff"); // strip, edge line
    panel(2.4, 34, 4, [-28, 6, -16], "#7fa8ff"); // cool strip, other side
    panel(40, 6, 1.2, [0, 30, -10], "#3d6bff"); // overhead blue wash
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(studio, 0.04).texture;
    pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight("#9db8ff", "#0e1a3d", 0.35));
  }

  private buildMap() {
    const { grid, width, height } = this.data;
    const cx = width / 2;
    const cy = height / 2;
    const baseIdx: number[] = [];
    const activeIdx: number[] = [];
    for (let i = 0; i < grid.length; i += 3) (grid[i + 2] >= 0 ? activeIdx : baseIdx).push(i);

    const pillar = new THREE.CylinderGeometry(0.043, 0.047, 1, 10, 1);
    pillar.translate(0, 0.5, 0);

    const baseMat = new THREE.MeshStandardMaterial({ color: "#1c2850", metalness: 0.35, roughness: 0.72, envMapIntensity: 0.45 });
    this.base = new THREE.InstancedMesh(pillar, baseMat, baseIdx.length);
    this.baseX = new Float32Array(baseIdx.length * 2);
    baseIdx.forEach((gi, k) => {
      const x = (grid[gi] - cx) * S;
      const z = (grid[gi + 1] - cy) * S;
      this.baseX[k * 2] = x;
      this.baseX[k * 2 + 1] = z;
    });

    const activeMat = new THREE.MeshPhysicalMaterial({
      color: ROYAL,
      metalness: 0.92,
      roughness: 0.26,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.35,
    });
    this.active = new THREE.InstancedMesh(pillar, activeMat, activeIdx.length);

    const capGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.012, 10, 1);
    const capMat = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
    this.caps = new THREE.InstancedMesh(capGeo, capMat, activeIdx.length);

    const stateCount = this.data.nodes.length;
    this.states = Array.from({ length: stateCount }, (_, i) => ({
      index: i,
      instances: [],
      order: stateCount > 1 ? i / (stateCount - 1) : 0,
      x: (this.data.nodes[i].x - cx) * S,
      z: (this.data.nodes[i].y - cy) * S,
    }));
    this.glow = new Array(stateCount).fill(0);

    const minX = -cx * S;
    const spanX = width * S;
    activeIdx.forEach((gi, k) => {
      const x = (grid[gi] - cx) * S;
      const z = (grid[gi + 1] - cy) * S;
      const state = grid[gi + 2];
      this.activeData.push({ x, z, state, xn: (x - minX) / spanX });
      this.states[state].instances.push(k);
      this.caps.setColorAt(k, ROYAL);
    });

    [this.base, this.active, this.caps].forEach((m) => {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      this.scene.add(m);
    });

    // Nodes, pins and links float above the map.
    const nodeGeo = new THREE.SphereGeometry(0.06, 16, 12);
    for (const st of this.states) {
      const n = new THREE.Mesh(nodeGeo, this.nodeMat);
      n.position.set(st.x, 0, st.z);
      this.linkGroup.add(n);
      this.nodes.push(n);
    }
    const pinGeo = new THREE.BufferGeometry();
    pinGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(stateCount * 6), 3));
    this.pins = new THREE.LineSegments(
      pinGeo,
      new THREE.LineBasicMaterial({ color: "#4d8dff", transparent: true, opacity: 0.55 }),
    );
    this.pins.frustumCulled = false;
    this.scene.add(this.pins);

    const linkMat = this.linkMat;
    const pulseGeo = new THREE.SphereGeometry(0.045, 12, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#cfe0ff").multiplyScalar(1.8), toneMapped: false });
    for (let i = 0; i < stateCount - 1; i++) {
      const a = new THREE.Vector3(this.states[i].x, 0, this.states[i].z);
      const b = new THREE.Vector3(this.states[i + 1].x, 0, this.states[i + 1].z);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y = 0.35 + a.distanceTo(b) * 0.22;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012, 6, false), linkMat);
      mesh.geometry.setDrawRange(0, 0);
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.visible = false;
      this.linkGroup.add(mesh, pulse);
      this.links.push({ curve, mesh, pulse });
    }
    this.scene.add(this.linkGroup);
  }

  /** Soft blue light pooled under the map. */
  private buildFloorGlow() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(0,93,255,0.55)");
    grad.addColorStop(0.5, "rgba(10,47,135,0.25)");
    grad.addColorStop(1, "rgba(14,26,61,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 18),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    this.scene.add(plane);
  }

  private setupPost() {
    this.composer?.dispose();
    this.composer = null;
    this.bloom = null;
    if (this.mobile) return; // phones render straight to screen; bloom is the first thing we cut
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 0.85, 0.55, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.composer.setPixelRatio(this.dpr);
    this.composer.setSize(this.width, this.height);
  }

  private resize(force = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // On phones the address bar changes the height while scrolling; ignore small height-only changes.
    if (!force && w === this.width && Math.abs(h - this.height) < 140) return;
    this.width = w;
    this.height = h;
    this.mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    if (!this.fpsChecks) this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.75 : 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.composer?.setPixelRatio(this.dpr);
    this.composer?.setSize(w, h);
    this.measureAnchors();
  }

  private onResize = () => this.resize();

  /** Document positions of the sections that carry a camera cue. Re-run after layout changes. */
  measureAnchors = () => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cue]"));
    this.anchors = els
      .map((el) => ({ id: el.dataset.cue!, top: el.getBoundingClientRect().top + window.scrollY }))
      .filter((a) => CUES[a.id])
      .sort((a, b) => a.top - b.top);
  };

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };

  /** Scroll distance over which the hero connects the states: done just before the hero stops being pinned. */
  private heroSpan() {
    const a = this.anchors;
    const vh = window.innerHeight;
    if (a.length < 2 || a[0].id !== "hero") return vh * 0.6;
    return Math.max(vh * 0.35, (a[1].top - a[0].top - vh) * 0.9);
  }

  private targetCue(p: number): Cue {
    const a = this.anchors;
    if (!a.length) return CUES.hero(this.mobile, p);
    // A section takes over the camera as it reaches the upper part of the screen.
    const probe = window.scrollY + window.innerHeight * 0.22;
    let i = 0;
    while (i < a.length - 1 && probe >= a[i + 1].top) i++;
    const from = CUES[a[i].id](this.mobile, p);
    if (i === a.length - 1 || probe < a[0].top) return from;
    const to = CUES[a[i + 1].id](this.mobile, p);
    const raw = (probe - a[i].top) / Math.max(1, a[i + 1].top - a[i].top);
    const t = smooth(clamp01((raw - 0.6) / 0.4)); // hold each cue, blend in the last stretch
    const out = { ...from };
    (Object.keys(out) as (keyof Cue)[]).forEach((k) => (out[k] = lerp(from[k], to[k], t)));
    return out;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const time = this.clock.elapsedTime;
    this.update(dt, time);
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
    this.watchFps(dt);
  };

  private update(dt: number, time: number) {
    // Hero scroll progress: drives the connection and the hero camera move.
    const span = this.heroSpan();
    const p = clamp01(window.scrollY / span);
    this.energy = lerp(this.energy, p, 1 - Math.exp(-dt * 6));

    // Camera eases toward the scroll cue.
    const target = this.targetCue(p);
    const k = 1 - Math.exp(-dt * 3.2);
    (Object.keys(this.cur) as (keyof Cue)[]).forEach((key) => (this.cur[key] = lerp(this.cur[key], target[key], k)));
    const c = this.cur;

    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 1 - Math.exp(-dt * 2.5));
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 1 - Math.exp(-dt * 2.5));

    const polar = THREE.MathUtils.degToRad(c.polar + this.pointer.y * 2.5);
    const az = THREE.MathUtils.degToRad(c.azimuth + this.pointer.x * 5 + Math.sin(time * 0.12) * 2);
    const dist = c.distance;
    this.camera.position.set(
      c.tx + dist * Math.sin(polar) * Math.sin(az),
      dist * Math.cos(polar),
      c.tz + dist * Math.sin(polar) * Math.cos(az),
    );
    this.camera.lookAt(c.tx, 0, c.tz);
    this.camera.setViewOffset(this.width, this.height, -c.ox * this.width, c.oy * this.height, this.width, this.height);
    this.renderer.toneMappingExposure = 1.05 - c.dim * 0.78;
    this.scene.environmentRotation.set(this.pointer.y * 0.2, -this.pointer.x * 0.8 + time * 0.03, 0);

    // Intro: the map builds itself from west to east, then the links draw.
    this.intro = Math.min(1, time / 2.6); // wall-clock, so slow frames don't stretch the intro
    const introBuilding = this.intro < 1;

    if (introBuilding || this.base.userData.dirty !== false) {
      const n = this.base.count;
      for (let i = 0; i < n; i++) {
        const x = this.baseX[i * 2];
        const z = this.baseX[i * 2 + 1];
        const g = ease(clamp01(this.intro * 1.7 - (x + 6) / 12 * 0.7));
        this.tmp.position.set(x, 0, z);
        this.tmp.scale.set(1, Math.max(0.0001, 0.05 * g), 1);
        this.tmp.updateMatrix();
        this.base.setMatrixAt(i, this.tmp.matrix);
      }
      this.base.instanceMatrix.needsUpdate = true;
      this.base.userData.dirty = introBuilding;
    }

    // Scroll-to-connect: the first state is on from the start, each scroll step draws the next link
    // and lights the state at its end, west to east, until all of them are connected.
    const steps = this.states.length;
    const reach = 1 + clamp01(this.energy * 1.08) * (steps - 1); // continuous count of connected states
    this.lit = Math.min(steps, Math.floor(reach + 1e-4));

    // Exploded view: each state lifts with a delay by its order, the first to leave returns last.
    const lifts: number[] = [];
    for (const st of this.states) {
      const delay = (1 - st.order) * 0.42;
      const t = ease(clamp01((c.explode - delay) / 0.58));
      lifts.push(t * 1.05);
      const on = st.index < this.lit ? 1 : 0;
      this.glow[st.index] = lerp(this.glow[st.index], on, 1 - Math.exp(-dt * 8));
    }

    const wave = this.energy;
    // Unlit elements (caps, links, nodes) ignore exposure, so they get dimmed by hand.
    // Without bloom (phones) the caps need more of their own brightness to read as lit.
    const lightLevel = (1 - c.dim * 0.85) * (this.composer ? 1 : 1.45);
    for (let k2 = 0; k2 < this.activeData.length; k2++) {
      const p = this.activeData[k2];
      const grow = ease(clamp01(this.intro * 1.6 - p.xn * 0.6 - 0.15));
      const h = (0.16 + Math.sin(time * 5 - p.xn * 9) * 0.04 * wave) * grow + 0.0001;
      const y = lifts[p.state] * grow;
      this.tmp.position.set(p.x, y, p.z);
      this.tmp.scale.set(1, h, 1);
      this.tmp.updateMatrix();
      this.active.setMatrixAt(k2, this.tmp.matrix);
      this.tmp.position.set(p.x, y + h + 0.006, p.z);
      this.tmp.scale.set(1, 1, 1);
      this.tmp.updateMatrix();
      this.caps.setMatrixAt(k2, this.tmp.matrix);
      const gl = this.glow[p.state];
      this.col
        .copy(ROYAL)
        .lerp(ICE, gl * 0.7)
        .multiplyScalar((0.85 + gl * 1.15 + Math.sin(time * 2 + p.xn * 6) * 0.06) * lightLevel);
      this.caps.setColorAt(k2, this.col);
    }
    this.active.instanceMatrix.needsUpdate = true;
    this.caps.instanceMatrix.needsUpdate = true;
    if (this.caps.instanceColor) this.caps.instanceColor.needsUpdate = true;

    // Links ride above the map, pins drop from each node to its state.
    const linkY = 0.75 + c.explode * 0.65;
    this.linkGroup.position.y = linkY;
    const draw = ease(clamp01((this.intro - 0.45) / 0.5));
    const pos = this.pins.geometry.getAttribute("position") as THREE.BufferAttribute;
    this.states.forEach((st, i) => {
      const node = this.nodes[i];
      node.scale.setScalar((0.6 + this.glow[i] * 0.8) * draw + 0.0001);
      pos.setXYZ(i * 2, st.x, linkY, st.z);
      pos.setXYZ(i * 2 + 1, st.x, lifts[i] + 0.17, st.z);
    });
    pos.needsUpdate = true;
    (this.pins.material as THREE.LineBasicMaterial).opacity = 0.55 * draw * lightLevel;
    this.linkMat.opacity = 0.95 * lightLevel;
    this.nodeMat.color.setScalar(lightLevel);

    this.links.forEach((l, i) => {
      const local = clamp01(reach - 1 - i) * draw;
      const idx = l.mesh.geometry.index!.count;
      l.mesh.geometry.setDrawRange(0, Math.floor((local * idx) / 36) * 36);
      // Once a link is drawn, a spark keeps travelling along it.
      const on = clamp01((local - 0.85) / 0.15);
      l.pulse.visible = on > 0.02;
      if (l.pulse.visible) {
        l.pulse.position.copy(l.curve.getPointAt((time * 0.55 + i * 0.13) % 1));
        l.pulse.scale.setScalar(on);
      }
    });

    if (this.bloom) this.bloom.strength = 0.55 + ease(this.energy) * 0.3;

    // The on-screen counter follows along; it hides once the page has moved past the hero.
    const show = this.intro > 0.6 && window.scrollY < span + window.innerHeight * 0.25;
    const key = `${Math.round(this.energy * 100)}|${this.lit}|${show}`;
    if (key !== this.lastEmit) {
      this.lastEmit = key;
      window.dispatchEvent(new CustomEvent("asfra:energy", { detail: { e: this.energy, lit: this.lit, total: steps, show } }));
    }
  }

  /** Adaptive quality: lower the resolution, then drop bloom, then give up and show the static map. */
  private watchFps(dt: number) {
    this.fpsFrames++;
    this.fpsTime += dt;
    if (this.fpsTime < 2) return;
    const fps = this.fpsFrames / this.fpsTime;
    this.fpsFrames = 0;
    this.fpsTime = 0;
    this.fpsChecks++;
    if (document.hidden || this.fpsChecks < 2) return; // ignore the shader warm-up
    if (fps >= 40) return;
    if (this.dpr > 1.01) {
      this.dpr = Math.max(1, this.dpr - 0.5);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.width, this.height, false);
      this.composer?.setPixelRatio(this.dpr);
      this.composer?.setSize(this.width, this.height);
    } else if (this.composer) {
      this.composer.dispose();
      this.composer = null;
      this.bloom = null;
    } else if (fps < 20) {
      this.onFail();
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointer);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.scene.environment?.dispose();
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
