import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ShardSceneProps {
  score: number; // 0 - 100
  scoreLevel: string;
  isReducedMotion?: boolean;
  isLightMode?: boolean;
  className?: string;
}

interface ShardData {
  baseX: number;
  baseY: number;
  baseZ: number;
  vaultX: number;
  vaultY: number;
  vaultZ: number;
  chaosX: number;
  chaosY: number;
  chaosZ: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  scale: number;
  baseColor: THREE.Color;
}

export const ShardScene: React.FC<ShardSceneProps> = ({
  score,
  scoreLevel,
  isReducedMotion = false,
  isLightMode = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Interaction HUD states
  const [isInteracting, setIsInteracting] = useState(false);
  const [explosionSlider, setExplosionSlider] = useState(0); // 0 to 1 manually override
  const [shardFormationName, setShardFormationName] = useState('Drifting');

  // Refs for animation loop without closures
  const scoreRef = useRef(score);
  const reducedMotionRef = useRef(isReducedMotion);
  const sliderRef = useRef(explosionSlider);

  useEffect(() => {
    scoreRef.current = score;
    if (score >= 80) setShardFormationName('LockLogic Vault Crystal');
    else if (score >= 60) setShardFormationName('Neural Violet Lattice');
    else if (score >= 40) setShardFormationName('Stabilizing Gate');
    else setShardFormationName('Compromised / Fracture');
  }, [score]);

  useEffect(() => {
    reducedMotionRef.current = isReducedMotion;
  }, [isReducedMotion]);

  useEffect(() => {
    sliderRef.current = explosionSlider;
  }, [explosionSlider]);

  useEffect(() => {
    if (sceneRef.current?.fog) {
      (sceneRef.current.fog as THREE.FogExp2).color.setHex(isLightMode ? 0xF4F5F8 : 0x0A0B0F);
    }
  }, [isLightMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mountRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(isLightMode ? 0xF4F5F8 : 0x0A0B0F, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // 2. Studio Environment for PBR Reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 3. Studio Lighting Rig - Robotic Lime & Violet contrast
    const ambientLight = new THREE.AmbientLight(0x0e111a, 1.1);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x7C5CFF, 0x0A0B0F, 1.6);
    scene.add(hemiLight);

    const limeKeyLight = new THREE.DirectionalLight(0xC6FF3D, 2.6);
    limeKeyLight.position.set(8, 10, 12);
    scene.add(limeKeyLight);

    const violetRimLight = new THREE.DirectionalLight(0x7C5CFF, 2.5);
    violetRimLight.position.set(-10, -6, -8);
    scene.add(violetRimLight);

    const cyanAccentLight = new THREE.DirectionalLight(0x00E5FF, 1.8);
    cyanAccentLight.position.set(0, -8, 6);
    scene.add(cyanAccentLight);

    const corePointLight = new THREE.PointLight(0xC6FF3D, 3.2, 22);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // 4. Instanced Shard Geometry & Material
    const SHARD_COUNT = 240;

    // Triangular wedge with sharp robotic bevels
    const geom = new THREE.ConeGeometry(0.32, 1.05, 3);
    geom.computeVertexNormals();

    // Machined titanium / robotic glass with subtle emissive edge response
    const shardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.92,
      roughness: 0.15,
      transmission: 0.45,
      ior: 1.65,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const instancedMesh = new THREE.InstancedMesh(geom, shardMaterial, SHARD_COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // Initialize Shard Physics Data
    const shards: ShardData[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < SHARD_COUNT; i++) {
      // 1. Base Drift position (ellipsoid cloud)
      const u = (Math.random() - 0.5) * 2;
      const t = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5) * 6.5 + 1.2;
      const bx = Math.sqrt(1 - u * u) * Math.cos(t) * r * 1.3;
      const by = Math.sqrt(1 - u * u) * Math.sin(t) * r * 0.9;
      const bz = u * r * 0.9;

      // 2. LockLogic Padlock / Vault Crystal formation
      // Upper 40% of shards form the circuit shackle arch
      // Lower 60% of shards form the padlock vault block
      let vx = 0;
      let vy = 0;
      let vz = (Math.random() - 0.5) * 1.4;

      if (i < SHARD_COUNT * 0.4) {
        // Padlock Shackle arch (semicircular arch from -2.4 to +2.4)
        const angle = ((i / (SHARD_COUNT * 0.4)) * Math.PI) - (Math.PI / 2); // -PI/2 to PI/2
        const radius = 2.4 + (Math.random() - 0.5) * 0.4;
        vx = Math.cos(angle + Math.PI / 2) * radius;
        vy = Math.sin(angle + Math.PI / 2) * radius + 1.2;
      } else {
        // Padlock Vault Body (rounded box)
        const bodyIndex = i - (SHARD_COUNT * 0.4);
        const totalBody = SHARD_COUNT * 0.6;
        const norm = bodyIndex / totalBody;
        vx = ((norm % 0.33) / 0.33 - 0.5) * 5.6 + (Math.random() - 0.5) * 0.3;
        vy = (Math.floor(norm / 0.33) / 3 - 0.5) * 3.4 - 1.2 + (Math.random() - 0.5) * 0.3;
      }

      // 3. Chaos / Exploded positions (blasted outward radially with high variance)
      const dir = new THREE.Vector3(bx, by, bz).normalize();
      const blastDist = 9.5 + Math.random() * 8.5;
      const cx = dir.x * blastDist + (Math.random() - 0.5) * 4;
      const cy = dir.y * blastDist + (Math.random() - 0.5) * 4;
      const cz = dir.z * blastDist + (Math.random() - 0.5) * 4;

      shards.push({
        baseX: bx,
        baseY: by,
        baseZ: bz,
        vaultX: vx,
        vaultY: vy,
        vaultZ: vz,
        chaosX: cx,
        chaosY: cy,
        chaosZ: cz,
        x: bx,
        y: by,
        z: bz,
        vx: 0,
        vy: 0,
        vz: 0,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.02,
        vry: (Math.random() - 0.5) * 0.02,
        vrz: (Math.random() - 0.5) * 0.02,
        scale: 0.6 + Math.random() * 0.7,
        baseColor: new THREE.Color(0xC6FF3D),
      });
    }

    // 5. Pre-allocated Math helpers for zero-GC loop
    const _mat4 = new THREE.Matrix4();
    const _pos = new THREE.Vector3();
    const _quat = new THREE.Quaternion();
    const _scale = new THREE.Vector3();
    const _euler = new THREE.Euler();
    const _color = new THREE.Color();

    // 6. Interactive Drag & Pointer Kinematics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let flingVx = 0;
    let flingVy = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
      flingVx = 0;
      flingVy = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const dx = clientX - prevMouseX;
        const dy = clientY - prevMouseY;
        flingVx = dx * 0.006;
        flingVy = dy * 0.006;
        targetRotY += flingVx;
        targetRotX += flingVy;
        prevMouseX = clientX;
        prevMouseY = clientY;

        // Apply drag perturbation directly to nearby shards
        const forceX = flingVx * 12;
        const forceY = -flingVy * 12;
        for (let i = 0; i < shards.length; i += 4) {
          shards[i].vx += (Math.random() - 0.5) * forceX;
          shards[i].vy += (Math.random() - 0.5) * forceY;
          shards[i].vz += (Math.random() - 0.5) * (Math.abs(forceX) + Math.abs(forceY));
        }
      } else {
        // Parallax hover tilt
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = normX * 0.35;
        targetRotX = normY * 0.25;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    const canvasElem = canvas;
    canvasElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvasElem.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 7. Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      const currentScore = scoreRef.current;
      const isRedMotion = reducedMotionRef.current;
      const manualSlider = sliderRef.current;

      // Color interpolation:
      // Critical / Vulnerable (<40): Danger red #FF3B5C jitter & crack
      // Moderate (40-59): Warning Amber #FFB800 & Cyan #00E5FF
      // Strong (60-79): Neural Violet #7C5CFF & Cyan #00E5FF
      // Fortress (80-100): Primary Electric Lime #C6FF3D
      let targetColorHex = 0xC6FF3D;
      if (currentScore < 20) targetColorHex = 0xFF3B5C; // Danger red
      else if (currentScore < 40) targetColorHex = 0xFF6B4A; // High-risk red-orange
      else if (currentScore < 60) targetColorHex = 0xFFB800; // Warning amber
      else if (currentScore < 80) targetColorHex = 0x7C5CFF; // Neural violet
      else targetColorHex = 0xC6FF3D; // Electric Lime Vault

      const destColor = new THREE.Color(targetColorHex);

      // Light color follows score
      corePointLight.color.lerp(destColor, 0.08);
      corePointLight.intensity = 1.0 + (currentScore / 100) * 3.5;

      // Inertia & Damped Rotation
      if (!isDragging) {
        targetRotY += flingVx;
        targetRotX += flingVy;
        flingVx *= 0.94;
        flingVy *= 0.94;
      }

      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 4, dt);
      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX, 4, dt);

      instancedMesh.rotation.y = currentRotY + (isRedMotion ? 0 : time * 0.18);
      instancedMesh.rotation.x = currentRotX;

      // Formations blend factor
      // score >= 80 -> vaultFactor = 1.0 (Assembles into LockLogic Padlock)
      // score < 40 -> chaosFactor is high
      const vaultFactor = Math.max(0, (currentScore - 45) / 55);
      const weaknessFactor = Math.max(0, (40 - currentScore) / 40);
      const totalExplode = Math.max(weaknessFactor, manualSlider);

      // Update individual shard positions with spring physics & jitter
      for (let i = 0; i < SHARD_COUNT; i++) {
        const s = shards[i];

        // Compute destination position based on active factors
        let targetX = THREE.MathUtils.lerp(s.baseX, s.vaultX, vaultFactor);
        let targetY = THREE.MathUtils.lerp(s.baseY, s.vaultY, vaultFactor);
        let targetZ = THREE.MathUtils.lerp(s.baseZ, s.vaultZ, vaultFactor);

        if (totalExplode > 0.01) {
          targetX = THREE.MathUtils.lerp(targetX, s.chaosX, totalExplode);
          targetY = THREE.MathUtils.lerp(targetY, s.chaosY, totalExplode);
          targetZ = THREE.MathUtils.lerp(targetZ, s.chaosZ, totalExplode);
        }

        // Add crack/jitter if password is weak (danger red vibration)
        if (weaknessFactor > 0.1 && !isRedMotion) {
          const jitterAmount = weaknessFactor * 0.22;
          targetX += (Math.random() - 0.5) * jitterAmount;
          targetY += (Math.random() - 0.5) * jitterAmount;
          targetZ += (Math.random() - 0.5) * jitterAmount;
        }

        // Ambient gentle breathing drift
        if (!isRedMotion && vaultFactor < 0.9) {
          const wave = Math.sin(time * 0.8 + i * 0.3) * 0.12;
          targetY += wave;
        }

        // Spring acceleration towards target position
        const springK = 3.6;
        const damping = 0.82;
        const ax = (targetX - s.x) * springK;
        const ay = (targetY - s.y) * springK;
        const az = (targetZ - s.z) * springK;

        s.vx = (s.vx + ax * dt) * damping;
        s.vy = (s.vy + ay * dt) * damping;
        s.vz = (s.vz + az * dt) * damping;

        s.x += s.vx;
        s.y += s.vy;
        s.z += s.vz;

        // Rotation progression
        if (!isRedMotion) {
          s.rx += s.vrx * (1 + totalExplode * 3);
          s.ry += s.vry * (1 + totalExplode * 3);
          s.rz += s.vrz * (1 + totalExplode * 3);
        }

        // Instance Matrix assembly
        _pos.set(s.x, s.y, s.z);
        _euler.set(s.rx, s.ry, s.rz);
        _quat.setFromEuler(_euler);
        const curScale = s.scale * (1 + vaultFactor * 0.2);
        _scale.set(curScale, curScale, curScale);

        _mat4.compose(_pos, _quat, _scale);
        instancedMesh.setMatrixAt(i, _mat4);

        // Instance Color update
        s.baseColor.lerp(destColor, 0.05);
        _color.copy(s.baseColor);
        // Add subtle robotic iridescent tint variation (lime to violet/cyan)
        if (i % 3 === 0) {
          _color.offsetHSL(0.04, 0, 0.08);
        } else if (i % 5 === 0) {
          _color.offsetHSL(-0.04, 0, -0.06);
        }

        instancedMesh.setColorAt(i, _color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasElem.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvasElem.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      geom.dispose();
      shardMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[460px] overflow-hidden select-none ${className}`}
      aria-label="3D Interactive Shard Shield Simulation"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Atmospheric radial gradient backing matching theme */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${
            score >= 80
              ? 'rgba(198, 255, 61, 0.12)'
              : score >= 60
              ? 'rgba(124, 92, 255, 0.14)'
              : score >= 40
              ? 'rgba(255, 184, 0, 0.1)'
              : 'rgba(255, 59, 92, 0.16)'
          } 0%, transparent 70%)`,
        }}
      />

      {/* Sleek robotics HUD per guidelines */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-[#12141B]/90 border border-white/10 backdrop-blur-md text-xs text-[#F4F5F7] shadow-xl transition-all">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#C6FF3D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]" />
          SYS.FORMATION // {shardFormationName.toUpperCase()}
        </span>
        <span className="text-white/20">|</span>
        <span className="text-[#8E92A0] hidden sm:inline font-mono text-[11px]">FLING.INERTIA // ACTIVE</span>
        <span className="text-white/20 hidden sm:inline">|</span>
        <button
          onClick={() => setExplosionSlider(s => (s > 0 ? 0 : 0.85))}
          className="text-[#C6FF3D] hover:underline transition-colors font-mono text-[11px] cursor-pointer"
        >
          {explosionSlider > 0 ? 'ASSEMBLE_VAULT()' : 'DISPERSE_SHARDS()'}
        </button>
      </div>
    </div>
  );
};
