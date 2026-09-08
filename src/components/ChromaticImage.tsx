import React, { useEffect, useRef, useState } from 'react';

/**
 * Adapted from the Aceternity component. Three changes were needed to run here:
 * this is not a Next.js app so the "use client" directive is gone, there is no
 * shadcn `cn` helper so classes are joined locally, and the pointer is tracked
 * on the window rather than the container — as a page background it sits behind
 * the content, so it would otherwise never receive a pointermove at all.
 */

export type ChromaticImageProps = {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  zoom?: number;
  displacement?: number;
  chromaticShift?: number;
  tilt?: number;
};

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uPointer;
uniform float uImageAspect;
uniform float uCanvasAspect;
uniform float uProgress;
uniform float uZoom;
uniform float uWarp;
uniform float uChromatic;
varying vec2 vUv;

vec2 cover(vec2 uv) {
  if (uImageAspect > uCanvasAspect) {
    uv.x = (uv.x - 0.5) * uCanvasAspect / uImageAspect + 0.5;
  } else {
    uv.y = (uv.y - 0.5) * uImageAspect / uCanvasAspect + 0.5;
  }
  return uv;
}

void main() {
  float strength = uProgress;
  vec2 movement = (uPointer - vec2(0.5)) * vec2(uCanvasAspect, 1.0);
  vec2 direction = movement / max(length(movement), 0.2);

  vec2 baseUv = mix(vUv, vec2(0.5), uZoom * uProgress * 0.28);
  float band = sin(vUv.y * 24.0 + uPointer.x * 5.0);
  float fineBand = sin(vUv.y * 71.0 - uPointer.y * 4.0);
  baseUv.x += (band * 0.72 + fineBand * 0.28) * uWarp * strength * 0.16;
  baseUv.y += direction.y * uWarp * strength * 0.12;
  baseUv = cover(baseUv);

  vec2 split = direction * uChromatic * strength;
  split.x += band * uChromatic * strength * 0.35;
  float red = texture2D(uImage, clamp(baseUv + split, 0.0, 1.0)).r;
  float green = texture2D(uImage, clamp(baseUv, 0.0, 1.0)).g;
  float blue = texture2D(uImage, clamp(baseUv - split, 0.0, 1.0)).b;
  float alpha = texture2D(uImage, clamp(baseUv, 0.0, 1.0)).a;
  gl_FragColor = vec4(red, green, blue, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const approach = (current: number, target: number, speed: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-speed * delta));

function parseColor(color: string): [number, number, number] {
  const value = color.startsWith('#') ? color.slice(1) : '111111';
  const hex = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

export default function ChromaticImage({
  src,
  alt,
  children,
  className,
  imageClassName,
  style,
  backgroundColor = '#111111',
  zoom = 0.2,
  displacement = 0.05,
  chromaticShift = 0.01,
  tilt = 0.3,
}: ChromaticImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    setReady(false);
    // Give the canvas its resting transform now. Going from no transform to a
    // 3D one hands the element its own compositing layer and Chrome re-snaps it
    // by a fraction of a pixel — the twitch on load.
    canvas.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const position = gl.getAttribLocation(program, 'aPosition');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      image: gl.getUniformLocation(program, 'uImage'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      imageAspect: gl.getUniformLocation(program, 'uImageAspect'),
      canvasAspect: gl.getUniformLocation(program, 'uCanvasAspect'),
      progress: gl.getUniformLocation(program, 'uProgress'),
      zoom: gl.getUniformLocation(program, 'uZoom'),
      warp: gl.getUniformLocation(program, 'uWarp'),
      chromatic: gl.getUniformLocation(program, 'uChromatic'),
    };

    gl.uniform1i(uniforms.image, 0);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1f(uniforms.warp, displacement);
    gl.uniform1f(uniforms.chromatic, chromaticShift);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const [red, green, blue] = parseColor(backgroundColor);
    gl.clearColor(red, green, blue, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    const pointer = { x: 0.5, y: 0.5 };
    const pointerTarget = { x: 0.5, y: 0.5 };
    let progress = 0;
    let progressTarget = 0;
    let imageLoaded = false;
    let disposed = false;
    let frame = 0;
    let isRendering = false;
    let previousTime = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderWidth = Math.round(width * pixelRatio);
      const renderHeight = Math.round(height * pixelRatio);
      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
      }
      gl.uniform1f(uniforms.canvasAspect, width / height);
    };

    const render = (time: number) => {
      if (disposed) return;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      progress = approach(progress, progressTarget, 10, delta);
      pointer.x = approach(pointer.x, pointerTarget.x, 12, delta);
      pointer.y = approach(pointer.y, pointerTarget.y, 12, delta);

      gl.uniform1f(uniforms.progress, reduceMotion ? 0 : progress);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (imageLoaded) gl.drawArrays(gl.TRIANGLES, 0, 3);

      const rotateX = reduceMotion ? 0 : (0.5 - pointer.y) * tilt * 18;
      const rotateY = reduceMotion ? 0 : (pointer.x - 0.5) * tilt * 18;
      // no resting scale: at progress 0 the canvas has to sit exactly where the
      // plain image sat, or the handover reads as a jump
      const lift = 1 + 0.025 * progress;
      canvas.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${lift})`;

      const settled =
        Math.abs(progress - progressTarget) < 0.001 &&
        Math.abs(pointer.x - pointerTarget.x) < 0.001 &&
        Math.abs(pointer.y - pointerTarget.y) < 0.001;
      if (settled) isRendering = false;
      else frame = requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (isRendering) return;
      isRendering = true;
      previousTime = performance.now();
      frame = requestAnimationFrame(render);
    };

    // window, not container: as a page background this element sits underneath
    // the content, so a container-scoped listener would never fire
    const updatePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = 1 - (event.clientY - bounds.top) / bounds.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      pointerTarget.x = Math.min(1, Math.max(0, x));
      pointerTarget.y = Math.min(1, Math.max(0, y));
      progressTarget = inside ? 1 : 0;
      requestRender();
    };

    const resetPointer = () => {
      pointerTarget.x = 0.5;
      pointerTarget.y = 0.5;
      progressTarget = 0;
      requestRender();
    };

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1f(uniforms.imageAspect, image.naturalWidth / image.naturalHeight);
      imageLoaded = true;
      // Paint the first frame *before* the canvas is revealed. setReady flips
      // the two opacities on React's next commit, and a canvas that has not
      // drawn yet is one frame of bare ground — the blink on reload.
      resize();
      gl.uniform1f(uniforms.progress, 0);
      gl.uniform2f(uniforms.pointer, 0.5, 0.5);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      setReady(true);
    };
    image.onerror = () => setReady(false);
    image.src = src;

    const resizeObserver = new ResizeObserver(() => { resize(); requestRender(); });
    resizeObserver.observe(container);
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('blur', resetPointer);
    resize();
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('blur', resetPointer);
      canvas.style.transform = '';
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [backgroundColor, displacement, chromaticShift, src, tilt, zoom]);

  return (
    <div
      ref={containerRef}
      style={style}
      /* only supply `relative` when the caller has not positioned this itself —
         two position utilities collide and the element collapses to zero height */
      className={cx(
        !/\b(absolute|fixed|sticky)\b/.test(className ?? '') && 'relative',
        'isolate overflow-hidden',
        className,
      )}
    >
      {/* The plain image is what shows if WebGL is unavailable. The handover
          used to cross-fade, and since both layers were half-transparent at the
          midpoint the page showed through: the picture dipped and came back.
          They are the same crop in the same box, so it just swaps. */}
      <img
        src={src}
        alt={alt}
        /* Exactly the container, so the picture is the picture — it used to be
           laid out 5% oversize to give the tilt somewhere to go, which cropped
           the artwork for no reason anyone could see. max-w-none still matters:
           the base reset caps images at 100% of their container. */
        className={cx(
          'absolute inset-0 h-full w-full max-w-none object-cover object-center',
          ready ? 'opacity-0' : 'opacity-100',
          imageClassName,
        )}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cx(
          'absolute inset-0 h-full w-full will-change-transform',
          ready ? 'opacity-100' : 'opacity-0',
        )}
      />
      {children}
    </div>
  );
}
