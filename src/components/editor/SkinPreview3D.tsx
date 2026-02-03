'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SKIN_WIDTH, SKIN_HEIGHT } from '@/constants/skin';
import { BodyPartKey } from '@/types';

interface SkinPreview3DProps {
  skinData: Uint8ClampedArray;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  selectedPart: BodyPartKey;
}

const PART_TO_INDEX: Record<BodyPartKey, number> = {
  head: 0,
  body: 1,
  rightArm: 2,
  leftArm: 3,
  rightLeg: 4,
  leftLeg: 5,
};

export function SkinPreview3D({ skinData, autoRotate, setAutoRotate, selectedPart }: SkinPreview3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
  } | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textureRef = useRef<{
    texture: THREE.CanvasTexture;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imageData: ImageData;
  } | null>(null);
  const rotationRef = useRef({ x: 0.2, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(autoRotate);
  const outlineMeshesRef = useRef<THREE.LineSegments[]>([]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(45, 300 / 400, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 400);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const canvas = document.createElement('canvas');
    canvas.width = SKIN_WIDTH;
    canvas.height = SKIN_HEIGHT;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(SKIN_WIDTH, SKIN_HEIGHT);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    textureRef.current = { texture, canvas, ctx, imageData };

    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });

    const group = new THREE.Group();

    const outlineMaterial = new THREE.LineBasicMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.9,
    });
    const outlineMeshes: THREE.LineSegments[] = [];

    const createUVs = (x: number, y: number, w: number, h: number) => {
      const u1 = x / SKIN_WIDTH;
      const v1 = 1 - (y + h) / SKIN_HEIGHT;
      const u2 = (x + w) / SKIN_WIDTH;
      const v2 = 1 - y / SKIN_HEIGHT;
      return [u1, v2, u2, v2, u1, v1, u2, v1];
    };

    const createBodyPart = (
      width: number,
      height: number,
      depth: number,
      uvData: number[][],
      position: [number, number, number]
    ) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const uvAttribute = geometry.attributes.uv;
      const uvs = uvAttribute.array as Float32Array;

      let uvIndex = 0;
      for (let face = 0; face < 6; face++) {
        const faceUVs = uvData[face];
        for (let i = 0; i < 4; i++) {
          uvs[uvIndex++] = faceUVs[i * 2];
          uvs[uvIndex++] = faceUVs[i * 2 + 1];
        }
      }
      uvAttribute.needsUpdate = true;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);

      // Create outline using EdgesGeometry (no diagonal lines)
      const outlineBoxGeometry = new THREE.BoxGeometry(
        width + 0.3,
        height + 0.3,
        depth + 0.3
      );
      const edgesGeometry = new THREE.EdgesGeometry(outlineBoxGeometry);
      outlineBoxGeometry.dispose(); // No longer needed after EdgesGeometry creation
      const outlineMesh = new THREE.LineSegments(edgesGeometry, outlineMaterial);
      outlineMesh.position.set(...position);
      outlineMesh.visible = false;
      outlineMeshes.push(outlineMesh);

      return mesh;
    };

    // Head
    const headUVs = [
      createUVs(0, 8, 8, 8),
      createUVs(16, 8, 8, 8),
      createUVs(8, 0, 8, 8),
      createUVs(16, 0, 8, 8),
      createUVs(8, 8, 8, 8),
      createUVs(24, 8, 8, 8),
    ];
    group.add(createBodyPart(8, 8, 8, headUVs, [0, 14, 0]));

    // Body
    const bodyUVs = [
      createUVs(16, 20, 4, 12),
      createUVs(28, 20, 4, 12),
      createUVs(20, 16, 8, 4),
      createUVs(28, 16, 8, 4),
      createUVs(20, 20, 8, 12),
      createUVs(32, 20, 8, 12),
    ];
    group.add(createBodyPart(8, 12, 4, bodyUVs, [0, 4, 0]));

    // Right Arm
    const rightArmUVs = [
      createUVs(40, 20, 4, 12),
      createUVs(48, 20, 4, 12),
      createUVs(44, 16, 4, 4),
      createUVs(48, 16, 4, 4),
      createUVs(44, 20, 4, 12),
      createUVs(52, 20, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, rightArmUVs, [-6, 4, 0]));

    // Left Arm
    const leftArmUVs = [
      createUVs(32, 52, 4, 12),
      createUVs(40, 52, 4, 12),
      createUVs(36, 48, 4, 4),
      createUVs(40, 48, 4, 4),
      createUVs(36, 52, 4, 12),
      createUVs(44, 52, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, leftArmUVs, [6, 4, 0]));

    // Right Leg
    const rightLegUVs = [
      createUVs(0, 20, 4, 12),
      createUVs(8, 20, 4, 12),
      createUVs(4, 16, 4, 4),
      createUVs(8, 16, 4, 4),
      createUVs(4, 20, 4, 12),
      createUVs(12, 20, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, rightLegUVs, [-2, -8, 0]));

    // Left Leg
    const leftLegUVs = [
      createUVs(16, 52, 4, 12),
      createUVs(24, 52, 4, 12),
      createUVs(20, 48, 4, 4),
      createUVs(24, 48, 4, 4),
      createUVs(20, 52, 4, 12),
      createUVs(28, 52, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, leftLegUVs, [2, -8, 0]));

    // Add outline meshes to group
    outlineMeshes.forEach(mesh => group.add(mesh));
    outlineMeshesRef.current = outlineMeshes;

    scene.add(group);
    sceneRef.current = { scene, camera, group };

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (autoRotateRef.current && !isDragging.current) {
        rotationRef.current.y += 0.01;
      }
      group.rotation.y = rotationRef.current.y;
      group.rotation.x = rotationRef.current.x;
      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      rotationRef.current = {
        x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x + deltaY * 0.01)),
        y: rotationRef.current.y + deltaX * 0.01
      };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose all geometries in group (body parts and outlines)
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
        }
      });
      // Dispose materials and texture
      material.dispose();
      texture.dispose();
      outlineMaterial.dispose();
      outlineMeshesRef.current = [];
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!textureRef.current) return;
    const { texture, canvas, ctx, imageData } = textureRef.current;

    for (let i = 0; i < skinData.length; i++) {
      imageData.data[i] = skinData[i];
    }
    ctx.putImageData(imageData, 0, 0);
    texture.needsUpdate = true;
  }, [skinData]);

  // Update outline visibility based on selected part
  useEffect(() => {
    const outlineMeshes = outlineMeshesRef.current;
    if (outlineMeshes.length === 0) return;

    const selectedIndex = PART_TO_INDEX[selectedPart];
    outlineMeshes.forEach((mesh, index) => {
      mesh.visible = index === selectedIndex;
    });
  }, [selectedPart]);

  return (
    <div>
      <div ref={containerRef} style={{ cursor: 'grab' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
        <button
          className={`pixel-btn ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? 'Stop' : 'Rotate'}
        </button>
      </div>
    </div>
  );
}
