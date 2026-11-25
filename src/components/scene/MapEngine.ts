import * as THREE from "three";
import type { Map3DData } from "@/lib/usMap";

/**
 * Live 3D map of the U.S. built entirely from code: every grid point is a small metal pillar,
 * the 13 states ASFRA serves are raised and turn royal blue as they connect, joined by blue arcs.
 * Drawn on white: "dim" fades the whole canvas toward the white page instead of darkening it.
 * A cue list pinned to page sections ([data-cue]) drives the camera from the scroll, and scrolling
 * through the hero first brings the map in (the first screen is copy only), then connects the states
 * one by one, each sending a ripple across the map. Further down, the camera tours
 * the states one at a time, and a state picked in the quote form is brought into focus.
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
  dim: number; // 0 full, 1 nearly faded out (so text on top stays readable)
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Pt = { x: number; z: number };
/**
 * p: how far the states have connected in the hero; r: how far the map has come in (0 on the first screen);
 * tour: point the states tour is looking at; pick: state chosen in the quote form.
 */
type Ctx = { p: number; r: number; tour: Pt; pick: Pt | null };
type CueSet = Record<string, (mobile: boolean, c: Ctx) => Cue>;

const CUES: CueSet = {
  // The map drops in from above as it appears, then the camera orbits and pushes in as the states connect.
  hero: (m, { p, r }) => {
    const e = smooth(p);
    const away = 1 - r;
    return m
      ? { polar: lerp(40, 36, e) - away * 14, azimuth: lerp(-10, 10, e), distance: lerp(36, 33, e) + away * 10, tx: 0, tz: 0.3, ox: 0, oy: -0.07, explode: 0, dim: 0 }
      : { polar: lerp(46, 40, e) - away * 14, azimuth: lerp(-16, 8, e), distance: lerp(19, 16, e) + away * 6, tx: 0.2, tz: 0.2, ox: 0, oy: 0, explode: 0, dim: 0 };
  },
  pinned: (m) =>
    m
      ? { polar: 40, azimuth: 16, distance: 22, tx: 2.4, tz: 1.1, ox: 0, oy: 0.08, explode: 0.55, dim: 0.35 }
      : { polar: 38, azimuth: 18, distance: 9.5, tx: 2.4, tz: 1.1, ox: 0, oy: 0, explode: 0.55, dim: 0.35 },
  services: (m) => ({ polar: 14, azimuth: 0, distance: m ? 40 : 15, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0.15, dim: 0.82 }),
  audiences: (m) => ({ polar: 32, azimuth: -28, distance: m ? 40 : 14, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0, dim: 0.86 }),
  // Close-up that travels from state to state while the section is pinned.
  states: (m, { tour }) =>
    m
      ? { polar: 40, azimuth: 0, distance: 19, tx: tour.x, tz: tour.z, ox: 0, oy: -0.1, explode: 1, dim: 0.08 }
      : { polar: 42, azimuth: -6, distance: 13, tx: tour.x, tz: tour.z, ox: -0.14, oy: -0.04, explode: 1, dim: 0.05 },
  // Far and dark behind the form; once a state is picked, the camera goes to it.
  quote: (m, { pick }) =>
    pick
      ? m
        ? { polar: 36, azimuth: 10, distance: 22, tx: pick.x, tz: pick.z, ox: 0, oy: 0.3, explode: 0, dim: 0.45 }
        : { polar: 36, azimuth: 12, distance: 16, tx: pick.x, tz: pick.z, ox: -0.1, oy: -0.14, explode: 0, dim: 0.45 }
      : { polar: 30, azimuth: 20, distance: m ? 42 : 22, tx: 0, tz: 0, ox: 0, oy: 0, explode: 0, dim: 0.9 },
};

/** States whose positions the service icons fly out from (spread west to east). */
const FLY_FROM = [0, 1, 4, 7, 10, 12];

const S = 0.012; // world units per map pixel
const BG = new THREE.Color("#ffffff");
const ROYAL = new THREE.Color("#005dff");
const BASE = new THREE.Color("#d2dbec"); // the rest of the country
const CREST = new THREE.Color("#4d8dff"); // a ripple passing over it
const STATE_OFF = new THREE.Color("#a9bce3"); // a served state not connected yet
const CAP_OFF = new THREE.Color("#e4ebf7");
const CAP_ON = new THREE.Color("#6aa5ff");
const CAP_FOCUS = new THREE.Color("#bcd6ff");
const RIPPLE_LIFE = 3.2; // seconds


type StateGroup = { index: number; instances: number[]; order: number; x: number; z: number };

export class MapEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
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
    color: ROYAL,
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
  });
  private nodeMat = new THREE.MeshBasicMaterial({ color: ROYAL, toneMapped: false });

  private mobile = false;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private anchors: { id: string; top: number; height: number }[] = [];
  private cur: Cue;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  private intro = 0;
  private energy = 0; // eased copy of the hero scroll progress
  private glow: number[] = [];
  private lit = 0;
  private lastEmit = "";
  private focus: number[] = [];
  private pick = -1;
  private tourIdx = -1;
  private flyOn = false;
  private fly = new Float32Array(FLY_FROM.length * 2);
  private v3 = new THREE.Vector3();
  private ripples: { x: number; z: number; t: number }[] = [];
  private reveal = 0;

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
    this.renderer.setClearColor(BG, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    this.scene.background = BG;
    this.scene.fog = new THREE.Fog(BG, 18, 44);

    this.buildStudio();
    this.baseX = new Float32Array(0);
    this.buildMap();
    this.buildFloorGlow();
    this.cur = CUES.hero(this.mobile, { p: 0, r: 0, tour: { x: 0, z: 0 }, pick: null });

    this.resize(true);
    this.measureAnchors();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("asfra:pick", this.onPick as EventListener);
    this.renderer.compileAsync(this.scene, this.camera).catch(() => {});
    this.clock.start();
    this.loop();
  }

  /** Small photo studio (softbox + strips) baked into the environment so the metal has something to reflect. */
  private buildStudio() {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color("#eef3ff");
    const panel = (w: number, h: number, intensity: number, pos: [number, number, number], tint = "#ffffff") => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      studio.add(m);
    };
    panel(22, 14, 3.2, [-22, 20, 20]); // key softbox, off-axis
    panel(2.4, 34, 6, [30, 4, 12], "#ffffff"); // strip, edge line
    panel(2.4, 34, 1.5, [-28, 6, -16], "#0a2f87"); // dark strip so the metal keeps some depth
    panel(40, 6, 1.2, [0, 30, -10], "#3d6bff"); // overhead blue wash
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(studio, 0.04).texture;
    pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#b8c6e2", 0.8));
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

    const baseMat = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.2, roughness: 0.6, envMapIntensity: 0.6 });
    this.base = new THREE.InstancedMesh(pillar, baseMat, baseIdx.length);
    this.baseX = new Float32Array(baseIdx.length * 2);
    baseIdx.forEach((gi, k) => {
      const x = (grid[gi] - cx) * S;
      const z = (grid[gi + 1] - cy) * S;
      this.baseX[k * 2] = x;
      this.baseX[k * 2 + 1] = z;
      this.base.setColorAt(k, BASE);
    });

    const activeMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff", // tinted per pillar: pale until its state connects, then royal
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
    this.focus = new Array(stateCount).fill(0);

    const minX = -cx * S;
    const spanX = width * S;
    activeIdx.forEach((gi, k) => {
      const x = (grid[gi] - cx) * S;
      const z = (grid[gi + 1] - cy) * S;
      const state = grid[gi + 2];
      this.activeData.push({ x, z, state, xn: (x - minX) / spanX });
      this.states[state].instances.push(k);
      this.active.setColorAt(k, STATE_OFF);
      this.caps.setColorAt(k, CAP_OFF);
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
      new THREE.LineBasicMaterial({ color: ROYAL, transparent: true, opacity: 0.45 }),
    );
    this.pins.frustumCulled = false;
    this.scene.add(this.pins);

    const linkMat = this.linkMat;
    const pulseGeo = new THREE.SphereGeometry(0.045, 12, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: "#0a2f87", toneMapped: false });
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

  /** Soft blue shade pooled under the map. */
  private buildFloorGlow() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(0,93,255,0.14)");
    grad.addColorStop(0.5, "rgba(0,93,255,0.06)");
    grad.addColorStop(1, "rgba(0,93,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 18),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    this.scene.add(plane);
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
    this.measureAnchors();
  }

  private onResize = () => this.resize();

  /** Document positions of the sections that carry a camera cue. Re-run after layout changes. */
  measureAnchors = () => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cue]"));
    this.anchors = els
      .map((el) => {
        // A GSAP-pinned section is measured through its spacer, which keeps its place in the page.
        const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
        const r = box.getBoundingClientRect();
        return { id: el.dataset.cue!, top: r.top + window.scrollY, height: r.height };
      })
      .filter((a) => CUES[a.id])
      .sort((a, b) => a.top - b.top);
  };

  private onPick = (e: CustomEvent<string>) => {
    this.pick = this.data.nodes.findIndex((n) => n.code === e.detail);
  };

  /** Height of the ripples passing over a point: rings that travel outward and fade. */
  private rippleAt(x: number, z: number, time: number) {
    let a = 0;
    for (const r of this.ripples) {
      const age = time - r.t;
      const d = Math.hypot(x - r.x, z - r.z) - age * 5.5;
      a += Math.exp(-(d * d) / 0.3) * (1 - age / RIPPLE_LIFE);
    }
    return Math.min(1.4, a);
  }

  private statePt(i: number): Pt {
    return { x: this.states[i].x, z: this.states[i].z };
  }

  private anchor(id: string) {
    return this.anchors.find((a) => a.id === id);
  }

  /** 0 -> 1 while the states section is pinned: the tour runs across it. */
  private tourProgress() {
    const a = this.anchor("states");
    if (!a) return 0;
    return clamp01((window.scrollY - a.top) / Math.max(1, a.height - window.innerHeight));
  }

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

  private targetCue(ctx: Ctx): Cue {
    const a = this.anchors;
    if (!a.length) return CUES.hero(this.mobile, ctx);
    // A section takes over the camera as it reaches the upper part of the screen.
    const probe = window.scrollY + window.innerHeight * 0.22;
    let i = 0;
    while (i < a.length - 1 && probe >= a[i + 1].top) i++;
    const from = CUES[a[i].id](this.mobile, ctx);
    if (i === a.length - 1 || probe < a[0].top) return from;
    const to = CUES[a[i + 1].id](this.mobile, ctx);
    // Hold each cue, blend in the last stretch before the next section (long pinned sections hold longer).
    const blend = Math.min((a[i + 1].top - a[i].top) * 0.4, window.innerHeight * 0.9);
    const t = smooth(clamp01((probe - (a[i + 1].top - blend)) / Math.max(1, blend)));
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
    this.renderer.render(this.scene, this.camera);
    this.watchFps(dt);
  };

  private update(dt: number, time: number) {
    // Hero: the first screen is copy only. Scrolling brings the map in (reveal), then connects the states.
    const span = this.heroSpan();
    const vh0 = window.innerHeight;
    const onHome = this.anchors[0]?.id === "hero";
    const revealTarget = onHome ? smooth(clamp01((window.scrollY - vh0 * 0.1) / (vh0 * 0.4))) : 1;
    this.reveal = lerp(this.reveal, revealTarget, 1 - Math.exp(-dt * 8));
    const p = clamp01((window.scrollY - vh0 * 0.45) / Math.max(1, span - vh0 * 0.45));
    this.energy = lerp(this.energy, p, 1 - Math.exp(-dt * 6));

    // States tour: dwell on each state, travel between neighbours.
    const n = this.states.length;
    const q = this.tourProgress() * (n - 1);
    const i0 = Math.min(n - 2, Math.floor(q));
    const step = smooth(clamp01((q - i0 - 0.25) / 0.5));
    const a0 = this.statePt(i0);
    const a1 = this.statePt(i0 + 1);
    const tour = { x: lerp(a0.x, a1.x, step), z: lerp(a0.z, a1.z, step) };
    const ctx: Ctx = { p, r: this.reveal, tour, pick: this.pick >= 0 ? this.statePt(this.pick) : null };

    // Camera eases toward the scroll cue.
    const target = this.targetCue(ctx);
    const k = 1 - Math.exp(-dt * 3.2);
    (Object.keys(this.cur) as (keyof Cue)[]).forEach((key) => (this.cur[key] = lerp(this.cur[key], target[key], k)));
    const c = this.cur;

    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 1 - Math.exp(-dt * 2.5));
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 1 - Math.exp(-dt * 2.5));

    const polar = THREE.MathUtils.degToRad(c.polar + this.pointer.y * 2.5);
    const az = THREE.MathUtils.degToRad(c.azimuth + this.pointer.x * 5 + Math.sin(time * 0.12) * 2);
    const dist = c.distance;
    const ty = c.explode * 1.1; // look at the lifted states, not the floor under them
    this.camera.position.set(
      c.tx + dist * Math.sin(polar) * Math.sin(az),
      ty + dist * Math.cos(polar),
      c.tz + dist * Math.sin(polar) * Math.cos(az),
    );
    this.camera.lookAt(c.tx, ty, c.tz);
    this.camera.setViewOffset(this.width, this.height, -c.ox * this.width, c.oy * this.height, this.width, this.height);
    // Fades in on load, then fades toward the white page behind text-heavy sections.
    this.canvas.style.opacity = String(Math.min(1, time * 1.2) * this.reveal * (1 - c.dim * 0.88));
    // Fog follows the camera, so a far camera (phones) doesn't wash the whole map out to white.
    const fog = this.scene.fog as THREE.Fog;
    fog.near = dist - 2;
    fog.far = dist + 24;
    this.scene.environmentRotation.set(this.pointer.y * 0.2, -this.pointer.x * 0.8 + time * 0.03, 0);

    // Intro: the map builds itself from west to east, then the links draw.
    this.intro = Math.min(1, time / 2.6); // wall-clock, so slow frames don't stretch the intro
    const introBuilding = this.intro < 1;

    this.ripples = this.ripples.filter((r) => time - r.t < RIPPLE_LIFE);
    const rippling = this.ripples.length > 0;
    if (introBuilding || rippling || this.base.userData.dirty !== false) {
      const n = this.base.count;
      for (let i = 0; i < n; i++) {
        const x = this.baseX[i * 2];
        const z = this.baseX[i * 2 + 1];
        const g = ease(clamp01(this.intro * 1.7 - (x + 6) / 12 * 0.7));
        const r = rippling ? this.rippleAt(x, z, time) : 0;
        this.tmp.position.set(x, 0, z);
        this.tmp.scale.set(1, Math.max(0.0001, (0.05 + r * 0.32) * g), 1);
        this.tmp.updateMatrix();
        this.base.setMatrixAt(i, this.tmp.matrix);
        this.base.setColorAt(i, this.col.copy(BASE).lerp(CREST, Math.min(1, r)));
      }
      this.base.instanceMatrix.needsUpdate = true;
      if (this.base.instanceColor) this.base.instanceColor.needsUpdate = true;
      this.base.userData.dirty = introBuilding || rippling;
    }

    // Scroll-to-connect: the first state is on from the start, each scroll step draws the next link
    // and lights the state at its end, west to east, until all of them are connected.
    const steps = this.states.length;
    const reach = 1 + clamp01(this.energy * 1.08) * (steps - 1); // continuous count of connected states
    const lit = Math.min(steps, Math.floor(reach + 1e-4));
    // Each newly connected state sends a ripple across the map.
    for (let s = this.lit; s < lit; s++) {
      if (this.reveal > 0.5) this.ripples.push({ ...this.statePt(s), t: time });
    }
    if (this.ripples.length > 5) this.ripples.splice(0, this.ripples.length - 5);
    this.lit = lit;

    // Which state is in focus: the one the tour is on, or the one picked in the form.
    const vh = window.innerHeight;
    const sa = this.anchor("states");
    const qa = this.anchor("quote");
    const inTour = !!sa && window.scrollY > sa.top - vh * 0.3 && window.scrollY < sa.top + sa.height - vh * 0.7;
    const inQuote = !!qa && window.scrollY > qa.top - vh * 0.8;
    const tourIdx = inTour ? Math.round(i0 + step) : -1;
    const focusIdx = tourIdx >= 0 ? tourIdx : inQuote ? this.pick : -1;
    if (tourIdx !== this.tourIdx) {
      this.tourIdx = tourIdx;
      window.dispatchEvent(new CustomEvent("asfra:tour", { detail: tourIdx }));
    }

    // Exploded view: each state lifts with a delay by its order, the first to leave returns last.
    const lifts: number[] = [];
    for (const st of this.states) {
      const delay = (1 - st.order) * 0.42;
      const t = ease(clamp01((c.explode - delay) / 0.58));
      this.focus[st.index] = lerp(this.focus[st.index], st.index === focusIdx ? 1 : 0, 1 - Math.exp(-dt * 5));
      lifts.push(t * 1.05 + ease(this.focus[st.index]) * 0.6);
      const on = st.index < this.lit ? 1 : 0;
      this.glow[st.index] = lerp(this.glow[st.index], on, 1 - Math.exp(-dt * 8));
    }

    const wave = this.energy;
    for (let k2 = 0; k2 < this.activeData.length; k2++) {
      const p = this.activeData[k2];
      const grow = ease(clamp01(this.intro * 1.6 - p.xn * 0.6 - 0.15));
      const rip = rippling ? this.rippleAt(p.x, p.z, time) * 0.2 : 0;
      const h = (0.16 + Math.sin(time * 5 - p.xn * 9) * 0.04 * wave + rip) * grow + 0.0001;
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
      const f = this.focus[p.state];
      this.active.setColorAt(k2, this.col.copy(STATE_OFF).lerp(ROYAL, Math.max(gl, f)));
      this.col
        .copy(CAP_OFF)
        .lerp(CAP_ON, gl)
        .lerp(CAP_FOCUS, f * 0.8)
        .multiplyScalar(1 + Math.sin(time * 2 + p.xn * 6) * 0.04 * gl);
      this.caps.setColorAt(k2, this.col);
    }
    this.active.instanceMatrix.needsUpdate = true;
    this.caps.instanceMatrix.needsUpdate = true;
    if (this.active.instanceColor) this.active.instanceColor.needsUpdate = true;
    if (this.caps.instanceColor) this.caps.instanceColor.needsUpdate = true;

    // Links ride above the map, pins drop from each node to its state.
    const linkY = 0.75 + c.explode * 0.65;
    this.linkGroup.position.y = linkY;
    const draw = ease(clamp01((this.intro - 0.45) / 0.5));
    const pos = this.pins.geometry.getAttribute("position") as THREE.BufferAttribute;
    this.states.forEach((st, i) => {
      const node = this.nodes[i];
      node.scale.setScalar((0.6 + this.glow[i] * 0.8 + this.focus[i] * 0.5) * draw + 0.0001);
      pos.setXYZ(i * 2, st.x, linkY, st.z);
      pos.setXYZ(i * 2 + 1, st.x, lifts[i] + 0.17, st.z);
    });
    pos.needsUpdate = true;
    (this.pins.material as THREE.LineBasicMaterial).opacity = 0.45 * draw;

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

    this.emitFly(span);

    // The on-screen counter follows along; it hides once the page has moved past the hero.
    const show = this.intro > 0.6 && this.reveal > 0.9 && window.scrollY < span + window.innerHeight * 0.25;
    const key = `${Math.round(this.energy * 100)}|${this.lit}|${show}`;
    if (key !== this.lastEmit) {
      this.lastEmit = key;
      window.dispatchEvent(new CustomEvent("asfra:energy", { detail: { e: this.energy, lit: this.lit, total: steps, show } }));
    }
  }

  /**
   * Hero -> services hand-off: screen positions of a few states and how far the service icons have flown
   * from them toward the services panel (0 -> 1). Sent only while it is happening.
   */
  private emitFly(span: number) {
    const next = this.anchors[1];
    if (!next || this.anchors[0]?.id !== "hero") return;
    const f = clamp01((window.scrollY - span) / Math.max(1, next.top - span));
    const on = f > 0 && f < 1;
    if (!on && !this.flyOn) return;
    this.flyOn = on;
    this.camera.updateMatrixWorld();
    FLY_FROM.forEach((si, k) => {
      this.nodes[si].getWorldPosition(this.v3).project(this.camera);
      this.fly[k * 2] = ((this.v3.x + 1) / 2) * this.width;
      this.fly[k * 2 + 1] = ((1 - this.v3.y) / 2) * this.height;
    });
    window.dispatchEvent(new CustomEvent("asfra:fly", { detail: { f, pts: this.fly } }));
  }

  /** Adaptive quality: lower the resolution, then give up and show the static map. */
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
    } else if (fps < 20) {
      this.onFail();
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("asfra:pick", this.onPick as EventListener);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}
