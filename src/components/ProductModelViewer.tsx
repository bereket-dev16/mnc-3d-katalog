"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group } from "three";

type ProductModelViewerProps = {
  isReady: boolean;
  label: string;
  onReady: (src: string) => void;
  src?: string | null;
};

type ModelAssetProps = {
  src: string;
  onLoaded: (src: string) => void;
};

function ModelAsset({ onLoaded, src }: ModelAssetProps) {
  const gltf = useGLTF(src) as unknown as { scene: Group };
  const modelTransform = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const targetHeight = 1.92;
    const floorY = -1.05;
    const scale = size.y > 0 ? targetHeight / size.y : 1;

    return {
      position: [
        -center.x * scale,
        floorY - box.min.y * scale,
        -center.z * scale,
      ] as [number, number, number],
      scale,
    };
  }, [gltf.scene]);

  useEffect(() => {
    onLoaded(src);
  }, [onLoaded, src]);

  return (
    <group
      position={modelTransform.position}
      scale={modelTransform.scale}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

export function ProductModelViewer({
  isReady,
  label,
  onReady,
  src,
}: ProductModelViewerProps) {
  return (
    <div
      className="stage-model-viewer"
      data-active={src ? "true" : "false"}
      data-ready={isReady ? "true" : "false"}
      aria-label={`${label} 3D model görünümü`}
      aria-hidden={!src || !isReady}
      role="img"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onPointerCancel={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <Canvas
        camera={{ fov: 34, position: [0, 0, 4.85] }}
        className="stage-model-canvas"
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.45} />
        <hemisphereLight
          color="#ffffff"
          groundColor="#d8d8d8"
          intensity={0.55}
        />
        <Suspense fallback={null}>
          {src ? (
            <ModelAsset
              onLoaded={onReady}
              src={src}
            />
          ) : null}
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.45}
          enableDamping
          enablePan={false}
          enableZoom
          makeDefault
          maxDistance={6.4}
          maxPolarAngle={Math.PI * 0.72}
          minDistance={3.35}
          minPolarAngle={Math.PI * 0.28}
          rotateSpeed={0.75}
          target={[0, -0.08, 0]}
          zoomSpeed={0.65}
        />
      </Canvas>
    </div>
  );
}
