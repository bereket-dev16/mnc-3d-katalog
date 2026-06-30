"use client";

import { Component, Suspense, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group } from "three";

type ProductModelViewerProps = {
  autoRotate?: boolean;
  isReady: boolean;
  label: string;
  modelHeight?: number;
  modelMaxWidth?: number;
  modelOffsetY?: number;
  onError?: (src: string) => void;
  onReady: (src: string) => void;
  src?: string | null;
};

type ModelAssetProps = {
  modelHeight: number;
  modelMaxWidth?: number;
  modelOffsetY: number;
  src: string;
  onLoaded: (src: string) => void;
};

const defaultCameraPosition: [number, number, number] = [0, 0, 4.85];
const defaultOrbitTarget: [number, number, number] = [0, -0.08, 0];

class ModelLoadBoundary extends Component<
  {
    children: ReactNode;
    onError?: (src: string) => void;
    src: string | null | undefined;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    if (this.props.src) {
      this.props.onError?.(this.props.src);
    }
  }

  componentDidUpdate(previousProps: Readonly<{ src: string | null | undefined }>) {
    if (previousProps.src !== this.props.src && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;

    return this.props.children;
  }
}

function ModelAsset({
  modelHeight,
  modelMaxWidth,
  modelOffsetY,
  onLoaded,
  src,
}: ModelAssetProps) {
  const gltf = useGLTF(src) as unknown as { scene: Group };
  const modelTransform = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const floorY = -1.05;
    const heightScale = size.y > 0 ? modelHeight / size.y : Infinity;
    const widthScale =
      modelMaxWidth && size.x > 0 ? modelMaxWidth / size.x : Infinity;
    const scale = Math.min(heightScale, widthScale);
    const safeScale = Number.isFinite(scale) ? scale : 1;

    return {
      position: [
        -center.x * safeScale,
        floorY - box.min.y * safeScale + modelOffsetY,
        -center.z * safeScale,
      ] as [number, number, number],
      scale: safeScale,
    };
  }, [gltf.scene, modelHeight, modelMaxWidth, modelOffsetY]);

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

function SceneInvalidator({
  isReady,
  src,
}: Pick<ProductModelViewerProps, "isReady" | "src">) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();

    const frameId = window.requestAnimationFrame(() => invalidate());

    return () => window.cancelAnimationFrame(frameId);
  }, [invalidate, isReady, src]);

  return null;
}

function CameraResetter({ src }: Pick<ProductModelViewerProps, "src">) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!src) return;

    camera.position.set(...defaultCameraPosition);
    camera.lookAt(...defaultOrbitTarget);
    camera.updateMatrixWorld();
    invalidate();

    const frameId = window.requestAnimationFrame(() => invalidate());

    return () => window.cancelAnimationFrame(frameId);
  }, [camera, invalidate, src]);

  return null;
}

const autoRotateFrameMs = 1000 / 24;

function AutoRotateTicker({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return undefined;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;

      invalidate();
    }, autoRotateFrameMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, invalidate]);

  return null;
}

function DemandOrbitControls({ autoRotate }: { autoRotate: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  return (
    <OrbitControls
      autoRotate={autoRotate}
      autoRotateSpeed={0.36}
      enableDamping={false}
      enablePan={false}
      enableZoom
      makeDefault
      maxDistance={6.4}
      maxPolarAngle={Math.PI * 0.72}
      minDistance={3.35}
      minPolarAngle={Math.PI * 0.28}
      onChange={() => invalidate()}
      rotateSpeed={0.75}
      target={defaultOrbitTarget}
      zoomSpeed={0.65}
    />
  );
}

export function ProductModelViewer({
  autoRotate = false,
  isReady,
  label,
  modelHeight = 1.92,
  modelMaxWidth,
  modelOffsetY = 0,
  onError,
  onReady,
  src,
}: ProductModelViewerProps) {
  const shouldAutoRotate = Boolean(src && isReady && autoRotate);

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
        camera={{ fov: 34, position: defaultCameraPosition }}
        className="stage-model-canvas"
        dpr={[1, 1.25]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
      >
        <SceneInvalidator
          isReady={isReady}
          src={src}
        />
        <CameraResetter src={src} />
        <AutoRotateTicker enabled={shouldAutoRotate} />
        <ambientLight intensity={1.45} />
        <hemisphereLight
          color="#ffffff"
          groundColor="#d8d8d8"
          intensity={0.55}
        />
        <ModelLoadBoundary
          key={`model-boundary-${src ?? "empty"}`}
          onError={onError}
          src={src}
        >
          <Suspense fallback={null}>
            {src ? (
              <ModelAsset
                modelHeight={modelHeight}
                modelMaxWidth={modelMaxWidth}
                modelOffsetY={modelOffsetY}
                onLoaded={onReady}
                src={src}
              />
            ) : null}
          </Suspense>
        </ModelLoadBoundary>
        {src ? (
          <DemandOrbitControls
            key={`orbit-controls-${src}`}
            autoRotate={shouldAutoRotate}
          />
        ) : null}
      </Canvas>
    </div>
  );
}
