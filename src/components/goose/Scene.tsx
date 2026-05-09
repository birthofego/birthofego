'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface SceneProps {
  gooseBloodied: boolean;
  gooseVisible?: boolean;
  seatsOccupied: [boolean, boolean, boolean]; // A, B, C alive
  onReady?: () => void;
  cameraTarget?: 'table' | 'dolly';
  dollyProgress?: number;
  gooseLunge?: boolean;
  redFlash?: boolean;
}

/* ── Colors ────────────────────────────────────────────── */
const COL = {
  floor: 0x1a1612,
  wall: 0x12100e,
  table: 0x3a2a1a,
  tableLeg: 0x2a1a0a,
  suit: 0x1a1a22,
  skin: 0xc4956a,
  hat: 0x222228,
  tie: [0xb91c2c, 0x8b1a1a, 0x991122] as number[],
  gooseBody: 0xe8e2d0,
  gooseBeak: 0xd97706,
  gooseBeakBlood: 0xb91c2c,
  gooseEye: 0x0a0a0a,
  gooseFeet: 0xd97706,
  lamp: 0x333333,
  ceiling: 0x0e0c0a,
};

function buildGoose(): { group: THREE.Group; beakMesh: THREE.Mesh; eyeMeshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: COL.gooseBody });

  // ── Body — plump elongated ellipsoid ──
  const bodyGeo = new THREE.SphereGeometry(0.32, 10, 8);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(0.9, 0.65, 1.2); // wide + long
  body.position.set(0, 0.22, 0);
  group.add(body);

  // ── Tail — small cone pointing backward ──
  const tailGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(0, 0.32, 0.32);
  tail.rotation.x = 0.6;
  group.add(tail);

  // ── Chest puff — slightly lighter sphere at front ──
  const chestMat = new THREE.MeshLambertMaterial({ color: 0xf0ece0 });
  const chestGeo = new THREE.SphereGeometry(0.18, 8, 6);
  const chest = new THREE.Mesh(chestGeo, chestMat);
  chest.scale.set(0.8, 0.9, 0.7);
  chest.position.set(0, 0.18, -0.2);
  group.add(chest);

  // ── Neck — S-curved using 5 stacked tapered cylinders ──
  const neckSegments = 5;
  for (let n = 0; n < neckSegments; n++) {
    const t = n / (neckSegments - 1); // 0 → 1
    const radius = 0.07 - t * 0.015; // tapers up
    const nGeo = new THREE.CylinderGeometry(radius, radius + 0.005, 0.14, 6);
    const nMesh = new THREE.Mesh(nGeo, bodyMat);
    // S-curve: goes forward, then tilts back
    const forwardCurve = Math.sin(t * Math.PI * 0.8) * 0.12;
    nMesh.position.set(0, 0.38 + n * 0.13, -0.18 - forwardCurve);
    nMesh.rotation.x = (t - 0.3) * 0.3;
    group.add(nMesh);
  }

  // ── Head — slightly flattened sphere ──
  const headGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.scale.set(0.9, 0.85, 1.0);
  head.position.set(0, 1.0, -0.28);
  group.add(head);

  // ── Beak — orange cone, more prominent ──
  const beakGeo = new THREE.ConeGeometry(0.045, 0.16, 4);
  const beakMat = new THREE.MeshLambertMaterial({ color: COL.gooseBeak });
  const beakMesh = new THREE.Mesh(beakGeo, beakMat);
  beakMesh.position.set(0, 0.96, -0.44);
  beakMesh.rotation.x = -Math.PI / 2;
  group.add(beakMesh);

  // ── Beak nub (nostrils bump) ──
  const nubGeo = new THREE.SphereGeometry(0.03, 4, 4);
  const nubMat = new THREE.MeshLambertMaterial({ color: 0xc06b06 });
  const nub = new THREE.Mesh(nubGeo, nubMat);
  nub.position.set(0, 0.99, -0.38);
  group.add(nub);

  // ── Eyes — beady, slightly forward-facing ──
  const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const eyeMatL = new THREE.MeshBasicMaterial({ color: COL.gooseEye });
  const eyeMatR = new THREE.MeshBasicMaterial({ color: COL.gooseEye });

  const eyeL = new THREE.Mesh(eyeGeo, eyeMatL);
  eyeL.position.set(-0.07, 1.03, -0.35);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMatR);
  eyeR.position.set(0.07, 1.03, -0.35);
  group.add(eyeR);

  // ── Eye highlights (tiny white dots) ──
  const hlGeo = new THREE.SphereGeometry(0.008, 4, 4);
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hlL = new THREE.Mesh(hlGeo, hlMat);
  hlL.position.set(-0.06, 1.04, -0.37);
  group.add(hlL);
  const hlR = new THREE.Mesh(hlGeo, hlMat);
  hlR.position.set(0.08, 1.04, -0.37);
  group.add(hlR);

  // ── Wings — flat box on each side ──
  const wingGeo = new THREE.BoxGeometry(0.04, 0.18, 0.28);
  const wingL = new THREE.Mesh(wingGeo, bodyMat);
  wingL.position.set(-0.25, 0.25, 0);
  wingL.rotation.z = 0.15;
  group.add(wingL);

  const wingR = new THREE.Mesh(wingGeo, bodyMat);
  wingR.position.set(0.25, 0.25, 0);
  wingR.rotation.z = -0.15;
  group.add(wingR);

  // ── Feet — orange paddles ──
  const footMat = new THREE.MeshLambertMaterial({ color: COL.gooseFeet });
  const footGeo = new THREE.BoxGeometry(0.1, 0.025, 0.14);
  const footL = new THREE.Mesh(footGeo, footMat);
  footL.position.set(-0.1, 0.01, -0.08);
  group.add(footL);
  const footR = new THREE.Mesh(footGeo, footMat);
  footR.position.set(0.1, 0.01, -0.08);
  group.add(footR);

  return { group, beakMesh, eyeMeshes: [eyeL, eyeR] };
}

function buildMafioso(tieColor: number, headTilt: number): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.7, 1.2, 0.45);
  const bodyMat = new THREE.MeshLambertMaterial({ color: COL.suit });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.3;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const headMat = new THREE.MeshLambertMaterial({ color: COL.skin });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.1;
  head.rotation.z = headTilt;
  group.add(head);

  // Hat (fedora)
  const hatMat = new THREE.MeshLambertMaterial({ color: COL.hat });
  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.2, 8), hatMat);
  hatCrown.position.y = 2.4;
  group.add(hatCrown);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 8), hatMat);
  brim.position.y = 2.3;
  group.add(brim);

  // Tie
  const tieMat = new THREE.MeshLambertMaterial({ color: tieColor });
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.05), tieMat);
  tie.position.set(0, 1.55, 0.2);
  group.add(tie);

  return group;
}

export default function Scene({
  gooseBloodied,
  gooseVisible = true,
  seatsOccupied,
  onReady,
  cameraTarget = 'table',
  dollyProgress = 1,
  gooseLunge = false,
  redFlash = false,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderTarget: THREE.WebGLRenderTarget;
    fullscreenQuad: THREE.Mesh;
    fullscreenScene: THREE.Scene;
    fullscreenCam: THREE.OrthographicCamera;
    gooseGroup: THREE.Group;
    beakMesh: THREE.Mesh;
    eyeMeshes: THREE.Mesh[];
    mafiaGroups: THREE.Group[];
    flickerLight: THREE.PointLight;
    clock: THREE.Clock;
    animId: number;
  }>(undefined);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x0c0c0e);
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Low-res PS1 render
    const rtW = Math.floor(w / 3);
    const rtH = Math.floor(h / 3);
    const renderTarget = new THREE.WebGLRenderTarget(rtW, rtH, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    const fsScene = new THREE.Scene();
    const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ map: renderTarget.texture })
    );
    fsScene.add(fsQuad);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c0c0e, 6, 14);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50);
    camera.position.set(0, 1.8, 3.2);
    camera.lookAt(0, 1.2, 0);

    // ── Room ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshLambertMaterial({ color: COL.floor })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 6),
      new THREE.MeshLambertMaterial({ color: COL.wall })
    );
    wall.position.set(0, 3, -5);
    scene.add(wall);

    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshLambertMaterial({ color: COL.ceiling })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 5;
    scene.add(ceil);

    // ── Table ──
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.12, 8),
      new THREE.MeshLambertMaterial({ color: COL.table })
    );
    table.position.set(0, 1.0, 0);
    scene.add(table);

    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 1.0, 6),
      new THREE.MeshLambertMaterial({ color: COL.tableLeg })
    );
    leg.position.set(0, 0.5, 0);
    scene.add(leg);

    // ── Lamp ──
    const lampShade = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.6),
      new THREE.MeshLambertMaterial({ color: COL.lamp })
    );
    lampShade.position.set(0, 3.5, 0);
    scene.add(lampShade);

    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    wire.position.set(0, 4.25, 0);
    scene.add(wire);

    // ── Lighting ──
    const mainLight = new THREE.PointLight(0xffb060, 1.5, 8);
    mainLight.position.set(0, 3.4, 0);
    scene.add(mainLight);

    scene.add(new THREE.AmbientLight(0x202030, 0.15));

    const flickerLight = new THREE.PointLight(0xffaa44, 0.4, 6);
    flickerLight.position.set(-3, 2.5, -2);
    scene.add(flickerLight);

    // ── Mafia NPCs ──
    const mafiaGroups: THREE.Group[] = [];
    const seatAngles = [Math.PI, Math.PI * 0.6, Math.PI * 1.4];
    const seatDist = 2.2;
    const headTilts = [-0.08, 0, 0.06];

    for (let i = 0; i < 3; i++) {
      const mafioso = buildMafioso(COL.tie[i], headTilts[i]);
      const angle = seatAngles[i];
      mafioso.position.set(
        Math.sin(angle) * seatDist,
        0,
        Math.cos(angle) * seatDist
      );
      mafioso.lookAt(0, 0, 0);
      scene.add(mafioso);
      mafiaGroups.push(mafioso);
    }

    // ── The Goose ──
    const { group: gooseGroup, beakMesh, eyeMeshes } = buildGoose();
    gooseGroup.position.set(0, 1.08, 0);
    gooseGroup.rotation.y = Math.PI; // face the player
    gooseGroup.visible = false; // hidden until placed in prologue
    scene.add(gooseGroup);

    const clock = new THREE.Clock();

    const refs = {
      renderer, scene, camera, renderTarget,
      fullscreenQuad: fsQuad, fullscreenScene: fsScene, fullscreenCam: fsCam,
      gooseGroup, beakMesh, eyeMeshes, mafiaGroups, flickerLight, clock,
      animId: 0,
    };
    sceneRef.current = refs;

    // ── Animation loop ──
    function animate() {
      refs.animId = requestAnimationFrame(animate);
      const t = refs.clock.getElapsedTime();

      // Head-bob idle
      refs.camera.position.y = 1.8 + Math.sin(t * 1.57) * 0.03;

      // Mafia breathing
      refs.mafiaGroups.forEach((g, i) => {
        if (!g.visible) return;
        g.scale.y = 1.0 + Math.sin(t * 1.2 + i * 2.1) * 0.02;
      });

      // Goose idle: head bob + sway + wing flap
      const gooseHead = refs.gooseGroup.children;
      refs.gooseGroup.rotation.y = Math.PI + Math.sin(t * 0.6) * 0.12;
      // Subtle neck sway on neck segments (children 4-8)
      for (let n = 4; n <= 8 && n < gooseHead.length; n++) {
        gooseHead[n].rotation.z = Math.sin(t * 1.0 + n * 0.4) * 0.04;
      }
      // Wing flap (children ~16-17)
      const wingIdxL = gooseHead.length - 6; // approximate
      const wingIdxR = gooseHead.length - 5;
      if (gooseHead[wingIdxL]) {
        gooseHead[wingIdxL].rotation.z = 0.15 + Math.sin(t * 2.0) * 0.04;
      }
      if (gooseHead[wingIdxR]) {
        gooseHead[wingIdxR].rotation.z = -0.15 - Math.sin(t * 2.0) * 0.04;
      }

      // Flickering light
      if (Math.random() < 0.02) {
        refs.flickerLight.intensity = 0.1 + Math.random() * 0.6;
      }

      // Render low-res then upscale
      renderer.setRenderTarget(refs.renderTarget);
      renderer.render(refs.scene, refs.camera);
      renderer.setRenderTarget(null);
      renderer.render(refs.fullscreenScene, refs.fullscreenCam);
    }

    animate();
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    initScene();
    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.renderer.dispose();
        sceneRef.current.renderTarget.dispose();
        if (containerRef.current) {
          const canvas = containerRef.current.querySelector('canvas');
          if (canvas) containerRef.current.removeChild(canvas);
        }
      }
    };
  }, [initScene]);

  // Seat occupancy — hide dead mafia with fade
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.mafiaGroups.forEach((g, i) => {
      g.visible = seatsOccupied[i];
    });
  }, [seatsOccupied]);

  // Goose visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.gooseGroup.visible = gooseVisible;
  }, [gooseVisible]);

  // Beak blood
  useEffect(() => {
    if (!sceneRef.current) return;
    const mat = sceneRef.current.beakMesh.material as THREE.MeshLambertMaterial;
    mat.color.setHex(gooseBloodied ? COL.gooseBeakBlood : COL.gooseBeak);
  }, [gooseBloodied]);

  // Goose lunge
  useEffect(() => {
    if (!sceneRef.current || !gooseLunge) return;
    const g = sceneRef.current.gooseGroup;
    const start = performance.now();
    function lunge(now: number) {
      const elapsed = now - start;
      if (elapsed < 200) {
        const t = elapsed / 200;
        g.scale.set(1 + t * 0.4, 1 + t * 0.4, 1 + t * 0.4);
      } else if (elapsed < 400) {
        g.visible = false;
      } else {
        g.visible = gooseVisible;
        g.scale.set(1, 1, 1);
        return;
      }
      requestAnimationFrame(lunge);
    }
    requestAnimationFrame(lunge);
  }, [gooseLunge, gooseVisible]);

  // Dolly for prologue
  useEffect(() => {
    if (!sceneRef.current || cameraTarget !== 'dolly') return;
    const cam = sceneRef.current.camera;
    const z = 8 + (3.2 - 8) * dollyProgress;
    cam.position.z = z;
    cam.position.y = 1.8 + (1 - dollyProgress) * 0.5;
    cam.lookAt(0, 1.2, 0);
  }, [cameraTarget, dollyProgress]);

  return (
    <div
      ref={containerRef}
      className="goose-scene"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {redFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(185, 28, 44, 0.6)',
          mixBlendMode: 'multiply',
          pointerEvents: 'none', zIndex: 2,
        }} />
      )}
    </div>
  );
}
