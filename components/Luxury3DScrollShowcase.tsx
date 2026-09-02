'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { Sparkles, Gem, ShieldCheck, Eye, RotateCw, ArrowRight, Check } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { brandConfig } from '@/lib/brandConfig';

type MetalType = 'yellow_gold' | 'platinum' | 'rose_gold' | 'white_gold';

const METAL_CONFIGS: Record<MetalType, { name: string; color: number; roughness: number; metalness: number; badge: string; hex: string }> = {
  yellow_gold: {
    name: '18K Yellow Gold',
    color: 0xdfb75c,
    roughness: 0.15,
    metalness: 0.96,
    badge: 'Au 750 • Champagne Lustre',
    hex: '#DFB75C',
  },
  platinum: {
    name: '950 Pure Platinum',
    color: 0xe5e9ec,
    roughness: 0.12,
    metalness: 0.98,
    badge: 'Pt 950 • High Density',
    hex: '#E5E9EC',
  },
  rose_gold: {
    name: '18K Rose Gold',
    color: 0xe6a287,
    roughness: 0.16,
    metalness: 0.95,
    badge: 'Au 750 • French Rouge',
    hex: '#E6A287',
  },
  white_gold: {
    name: '18K White Gold',
    color: 0xf0f0f2,
    roughness: 0.14,
    metalness: 0.97,
    badge: 'Au 750 • Rhodium Finish',
    hex: '#F0F0F2',
  },
};

export default function Luxury3DScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { openChat } = useChat();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('yellow_gold');
  const [caratSize, setCaratSize] = useState<number>(2.5);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // 3D Engine references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const ringGroupRef = useRef<THREE.Group | null>(null);
  const diamondMeshRef = useRef<THREE.Mesh | null>(null);
  const metalMeshesRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Drag interaction state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  // Update 3D Materials when user changes metal type
  useEffect(() => {
    const config = METAL_CONFIGS[selectedMetal];
    metalMeshesRef.current.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.setHex(config.color);
        mesh.material.roughness = config.roughness;
        mesh.material.metalness = config.metalness;
        mesh.material.needsUpdate = true;
      }
    });
  }, [selectedMetal]);

  // Update Diamond Carat Scale
  useEffect(() => {
    if (diamondMeshRef.current) {
      const scaleFactor = Math.cbrt(caratSize / 2.5);
      diamondMeshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  }, [caratSize]);

  // Setup Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. CAMERA
    const aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // 4. LIGHTS (Studio luxury illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Warm Gold Key Light
    const keyLight = new THREE.DirectionalLight(0xfff3db, 3.2);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    // Cool Diamond Fill Light
    const fillLight = new THREE.DirectionalLight(0xd9ecff, 2.5);
    fillLight.position.set(-5, -3, 4);
    scene.add(fillLight);

    // Back Rim Sparkle Light
    const rimLight = new THREE.PointLight(0xffecd1, 2.8, 20);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // Dynamic Prismatic Spotlights
    const prismLight1 = new THREE.PointLight(0xa5d8ff, 2.2, 10);
    prismLight1.position.set(-3, 2, 2);
    scene.add(prismLight1);

    const prismLight2 = new THREE.PointLight(0xffd8a8, 2.2, 10);
    prismLight2.position.set(3, -2, 2);
    scene.add(prismLight2);

    // 5. 3D JEWELRY OBJECT (Solitaire Ring Group)
    const ringGroup = new THREE.Group();
    ringGroupRef.current = ringGroup;
    scene.add(ringGroup);

    metalMeshesRef.current = [];

    // Metal Material Base
    const initialMetal = METAL_CONFIGS[selectedMetal];
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: initialMetal.color,
      roughness: initialMetal.roughness,
      metalness: initialMetal.metalness,
      envMapIntensity: 2.2,
    });

    // A. Ring Shank (The Band)
    const bandGeometry = new THREE.TorusGeometry(1.6, 0.18, 36, 120);
    const bandMesh = new THREE.Mesh(bandGeometry, metalMaterial);
    bandMesh.rotation.x = Math.PI / 2;
    ringGroup.add(bandMesh);
    metalMeshesRef.current.push(bandMesh);

    // B. Cathedral Bridge Support
    const bridgeGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 24);
    const bridgeLeft = new THREE.Mesh(bridgeGeom, metalMaterial);
    bridgeLeft.position.set(-0.55, 1.45, 0);
    bridgeLeft.rotation.z = -0.38;
    ringGroup.add(bridgeLeft);
    metalMeshesRef.current.push(bridgeLeft);

    const bridgeRight = new THREE.Mesh(bridgeGeom, metalMaterial);
    bridgeRight.position.set(0.55, 1.45, 0);
    bridgeRight.rotation.z = 0.38;
    ringGroup.add(bridgeRight);
    metalMeshesRef.current.push(bridgeRight);

    // C. Solitaire Crown Base & Prongs (4-Claw Cathedral Head)
    const crownBaseGeom = new THREE.TorusGeometry(0.48, 0.08, 16, 32);
    const crownBase = new THREE.Mesh(crownBaseGeom, metalMaterial);
    crownBase.position.set(0, 1.85, 0);
    crownBase.rotation.x = Math.PI / 2;
    ringGroup.add(crownBase);
    metalMeshesRef.current.push(crownBase);

    // 4 Claws
    const prongGeom = new THREE.CylinderGeometry(0.06, 0.09, 0.75, 16);
    const prongPositions = [
      { x: 0.36, y: 2.15, z: 0.36, rx: 0.12, rz: -0.12 },
      { x: -0.36, y: 2.15, z: 0.36, rx: 0.12, rz: 0.12 },
      { x: 0.36, y: 2.15, z: -0.36, rx: -0.12, rz: -0.12 },
      { x: -0.36, y: 2.15, z: -0.36, rx: -0.12, rz: 0.12 },
    ];

    prongPositions.forEach((pos) => {
      const prong = new THREE.Mesh(prongGeom, metalMaterial);
      prong.position.set(pos.x, pos.y, pos.z);
      prong.rotation.x = pos.rx;
      prong.rotation.z = pos.rz;
      ringGroup.add(prong);
      metalMeshesRef.current.push(prong);
    });

    // D. Micro-Pavé Diamonds on Shoulder
    const paveDiamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0,
      ior: 2.417,
      reflectivity: 0.9,
      clearcoat: 1.0,
      metalness: 0,
    });

    const paveGeom = new THREE.OctahedronGeometry(0.07, 1);
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const angle = (i * 0.12);
      const px = Math.sin(angle) * 1.62;
      const py = Math.cos(angle) * 1.62;
      const paveLeft = new THREE.Mesh(paveGeom, paveDiamondMat);
      paveLeft.position.set(px, py, 0.08);
      ringGroup.add(paveLeft);

      const paveRight = new THREE.Mesh(paveGeom, paveDiamondMat);
      paveRight.position.set(px, py, -0.08);
      ringGroup.add(paveRight);
    }

    // E. Master Brilliant-Cut Solitaire Diamond (Centerpiece)
    // Double cone / octahedron luxury faceted diamond
    const diamondGeometry = new THREE.OctahedronGeometry(0.72, 2);
    
    // Deform vertices slightly to give classic flat table and deep brilliant pavilion
    const posAttr = diamondGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i);
      if (y > 0.3) {
        // Flatten table facet
        posAttr.setY(i, 0.42);
      } else if (y < -0.1) {
        // Elongate pavilion point
        posAttr.setY(i, y * 1.35);
      }
    }
    diamondGeometry.computeVertexNormals();

    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 2.417, // True Optical Diamond Refractive Index
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      metalness: 0.05,
      specularIntensity: 2.5,
      specularColor: new THREE.Color(0xfff3db),
    });

    const diamondMesh = new THREE.Mesh(diamondGeometry, diamondMaterial);
    diamondMesh.position.set(0, 2.18, 0);
    ringGroup.add(diamondMesh);
    diamondMeshRef.current = diamondMesh;

    // F. Floating Diamond Sparkle Particles
    const particlesCount = 140;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xffe9b3,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    setIsLoaded(true);

    // 6. RENDER LOOP
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating diamond particle shimmer
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
        particlesRef.current.rotation.x = elapsedTime * 0.02;
      }

      // Smooth auto-rotation when idle or in interactive step
      if (ringGroupRef.current) {
        if (isAutoRotating && !isDragging.current) {
          ringGroupRef.current.rotation.y += 0.004;
        }

        // Apply manual drag offset smoothly
        ringGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          ringGroupRef.current.rotation.x,
          manualRotation.current.x,
          0.08
        );
        ringGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          ringGroupRef.current.rotation.y,
          manualRotation.current.y,
          0.08
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. RESIZE HANDLER
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
    };
  }, []);

  // Handle Scroll Animations linked to the section
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !ringGroupRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate total section scroll progress (0.0 to 1.0)
    const totalDistance = rect.height - windowHeight;
    if (totalDistance <= 0) return;

    const currentScroll = -rect.top;
    const progress = Math.min(Math.max(currentScroll / totalDistance, 0), 1);
    setScrollProgress(progress);

    // Determine current storytelling milestone (0 to 3)
    if (progress < 0.28) {
      setActiveStep(0);
    } else if (progress < 0.58) {
      setActiveStep(1);
    } else if (progress < 0.82) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }

    // Interpolate 3D Ring Rotation & Camera based on scroll progress
    if (!isDragging.current) {
      // 3D Scrollytelling Rotation Phases:
      // Phase 0 (0-28%): Front perspective, gentle tilt
      // Phase 1 (28-58%): Top-down crown view into the 57 diamond facets
      // Phase 2 (58-82%): Side cathedral profile showcasing 18K solid gold shank
      // Phase 3 (82-100%): Full 360 degree spin into user interactive inspection
      const targetRotY = progress * Math.PI * 3.5;
      let targetRotX = 0.2;

      if (progress >= 0.28 && progress < 0.58) {
        targetRotX = 0.75; // Look down into diamond table
      } else if (progress >= 0.58 && progress < 0.82) {
        targetRotX = -0.25; // Tilt up to admire undercarriage prongs
      } else if (progress >= 0.82) {
        targetRotX = 0.15; // Neutral for interactive 360 viewer
      }

      manualRotation.current.y = targetRotY;
      manualRotation.current.x = targetRotX;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Mouse / Touch Drag to Rotate 3D Model
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsAutoRotating(false);
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    manualRotation.current.y += deltaX * 0.01;
    manualRotation.current.x += deltaY * 0.01;

    // Constrain pitch rotation to avoid flipping upside down
    manualRotation.current.x = Math.max(-1.2, Math.min(1.2, manualRotation.current.x));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch Support for Mobile Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      setIsAutoRotating(false);
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

    manualRotation.current.y += deltaX * 0.012;
    manualRotation.current.x += deltaY * 0.012;
    manualRotation.current.x = Math.max(-1.2, Math.min(1.2, manualRotation.current.x));

    previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const scrollToStep = (index: number) => {
    if (!containerRef.current) return;
    const targets = [0, 0.38, 0.68, 0.95];
    const targetProgress = targets[index];
    const totalDistance = containerRef.current.scrollHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + targetProgress * totalDistance;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#110F0D] text-[#F5F2ED] selection:bg-[#C5A059] selection:text-black"
      style={{ height: '350vh' }} // Extended height for buttery smooth scroll storytelling
    >
      {/* Sticky Fullscreen 3D Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background Ambient Radial Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.12)_0%,rgba(17,15,13,0.95)_70%)]" />

        {/* 3D WebGL Canvas Layer */}
        <div
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="w-full h-full block touch-none" />
        </div>

        {/* Top Header Overlay */}
        <div className="relative z-20 px-6 sm:px-12 pt-8 flex items-center justify-between border-b border-white/10 bg-[#110F0D]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C5A059] font-medium">
                3D Interactive Scrollytelling Experience
              </p>
              <h2 className="serif text-xl sm:text-2xl text-white font-light tracking-wide">
                The Solitaire Masterpiece 360°
              </h2>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[#C5A059]" />
              Scroll or Drag to Rotate in 3D
            </span>
            <span className="text-white/30">|</span>
            <span className="font-mono text-[#C5A059]">Place Vendôme Paris</span>
          </div>
        </div>

        {/* Dynamic Storytelling Milestone Text Overlay */}
        <div className="relative z-20 px-6 sm:px-12 my-auto pointer-events-none max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Active Phase Details Card */}
          <div className="lg:col-span-5 pointer-events-auto bg-[#1C1815]/85 backdrop-blur-md border border-[#C5A059]/30 p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in duration-500">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-semibold">
                  <Gem className="w-3 h-3" />
                  <span>Phase 01 • Architecture</span>
                </div>
                <h3 className="serif text-2xl sm:text-3xl text-white font-light leading-snug">
                  The French Cathedral <br />
                  <span className="italic text-[#C5A059]">Solitaire Silhouette</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                  Engineered with an ultra-thin knife-edge band to create the mesmerizing optical illusion of a floating diamond. Hand-balanced in Paris to sit comfortably and securely on the finger.
                </p>
                <div className="pt-2 flex items-center gap-6 text-[11px] text-white/60">
                  <span>• 1.6mm Comfort Shank</span>
                  <span>• 4-Claw Cathedral Head</span>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Phase 02 • Diamond Optics</span>
                </div>
                <h3 className="serif text-2xl sm:text-3xl text-white font-light leading-snug">
                  57 Facets of <br />
                  <span className="italic text-[#C5A059]">Uncompromising Fire</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                  Each pavilion and crown facet is laser-aligned under microscope to achieve maximum internal light reflection, producing brilliant prismatic rainbow flashes under direct light.
                </p>
                <div className="pt-2 flex items-center gap-6 text-[11px] text-white/60">
                  <span>• D-Color VVS1 Clarity</span>
                  <span>• 2.417 Index of Refraction</span>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Phase 03 • Metallurgy</span>
                </div>
                <h3 className="serif text-2xl sm:text-3xl text-white font-light leading-snug">
                  Solid 18K Gold & <br />
                  <span className="italic text-[#C5A059]">Micro-Pavé Setting</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                  Forged from 100% recycled French fine gold alloyed with noble metals for lifetime resistance to scratches. Micro-pavé diamonds are set by master goldsmiths under 20x magnification.
                </p>
                <div className="pt-2 flex items-center gap-6 text-[11px] text-white/60">
                  <span>• French State Hallmark</span>
                  <span>• Conflict-Free Origin</span>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-semibold">
                  <Eye className="w-3 h-3" />
                  <span>Phase 04 • 3D Studio Customizer</span>
                </div>
                <h3 className="serif text-2xl sm:text-3xl text-white font-light leading-snug">
                  Customize & <br />
                  <span className="italic text-[#C5A059]">Inspect in Real-Time</span>
                </h3>

                {/* Metal Selection Buttons */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">Select Precious Alloy:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(METAL_CONFIGS) as MetalType[]).map((metalKey) => {
                      const m = METAL_CONFIGS[metalKey];
                      const isSelected = selectedMetal === metalKey;
                      return (
                        <button
                          key={metalKey}
                          onClick={() => setSelectedMetal(metalKey)}
                          className={`px-3 py-2 text-left border flex items-center justify-between text-[11px] transition-colors ${
                            isSelected
                              ? 'border-[#C5A059] bg-[#C5A059]/20 text-white font-medium'
                              : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: m.hex }} />
                            <span>{m.name}</span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-[#C5A059]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Carat Size Switcher */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">Diamond Carat Scale:</span>
                  <div className="flex gap-2">
                    {[1.5, 2.5, 3.5].map((carats) => (
                      <button
                        key={carats}
                        onClick={() => setCaratSize(carats)}
                        className={`flex-1 py-1.5 text-center text-[11px] font-mono border transition-colors ${
                          caratSize === carats
                            ? 'border-[#C5A059] bg-[#C5A059] text-black font-bold'
                            : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                        }`}
                      >
                        {carats.toFixed(1)} ct
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concierge Action */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      openChat({
                        subject: `Bespoke Solitaire Inquiry (${METAL_CONFIGS[selectedMetal].name} - ${caratSize}ct)`,
                        initialMessage: `I am inquiring about the ${caratSize} Carat Solitaire Ring in ${METAL_CONFIGS[selectedMetal].name} showcased in the 3D Studio.`,
                        type: 'product_modification',
                      })
                    }
                    className="w-full py-3 bg-[#C5A059] hover:bg-[#d8b566] text-[#110F0D] text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                  >
                    <span>Inquire with Master Goldsmith</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Floating Specs Box */}
          <div className="hidden lg:block lg:col-span-7 space-y-4 text-right pointer-events-none">
            <div className="inline-block bg-[#110F0D]/70 backdrop-blur-md border border-white/10 p-4 px-6 text-left">
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] block">Selected Configuration</span>
              <p className="serif text-base text-white">{METAL_CONFIGS[selectedMetal].name}</p>
              <p className="text-xs font-mono text-white/70">{caratSize.toFixed(2)}ct Flawless Diamond</p>
              <p className="text-[10px] text-white/50 mt-1">{METAL_CONFIGS[selectedMetal].badge}</p>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Progress & Milestone Navigation Bar */}
        <div className="relative z-20 px-6 sm:px-12 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-[#110F0D]/80 backdrop-blur-md">
          {/* Milestone Steps Quick Jump */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
            {['01. Architecture', '02. 57 Facets', '03. Metallurgy', '04. 3D Studio'].map((label, idx) => (
              <button
                key={idx}
                onClick={() => scrollToStep(idx)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-xs cursor-pointer whitespace-nowrap ${
                  activeStep === idx
                    ? 'bg-[#C5A059] text-black font-semibold'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Scroll Progress Bar */}
          <div className="flex items-center gap-4 w-full sm:w-64">
            <span className="text-[9px] font-mono text-[#C5A059] shrink-0">
              {Math.round(scrollProgress * 100)}%
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#DFB75C] transition-all duration-150"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <span className="text-[9px] uppercase tracking-wider text-white/40 shrink-0">
              3D Scrollytelling
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
