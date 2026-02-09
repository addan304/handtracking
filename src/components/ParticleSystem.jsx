import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useHand } from '../context/HandContext';
import tex1Asset from '../assets/couple1.jpeg';
import tex2Asset from '../assets/couple2.jpeg';

const ParticleShaderMaterial = {
    vertexShader: `
    uniform float uTime;
    uniform float uOpenness;
    uniform float uPhotoMix;
    uniform float uHasStarted;
    attribute vec3 aRandom;
    
    varying float vAlpha;
    varying vec3 vColor;
    uniform vec3 uColor;
    uniform vec3 uColor2;
    uniform float uIsMobile;

    vec3 noise3d(vec3 p) {
        return vec3(sin(p.x*10.0 + uTime), sin(p.y*10.0 + uTime), sin(p.z*10.0 + uTime)) * 0.1;
    }
    
    void main() {
      vec3 textPos = position;
      float effectiveScatter = mix(1.0, uOpenness, uHasStarted);
      
      // VORTEX MATH (Swirl around photos)
      // Spreading particles more by increasing radius range
      float swirlRadius = mix(3.0, 8.5, aRandom.y); 
      float swirlSpeed = uTime * mix(1.5, 3.0, aRandom.x); // Slightly slower for elegance
      float angle = aRandom.x * 6.28 + swirlSpeed;
      
      // Adding more spread to prevent clumping
      vec3 swirlPos = vec3(
        cos(angle) * swirlRadius,
        sin(angle) * swirlRadius,
        (aRandom.z - 0.5) * 10.0 // Extra depth
      );

      vec3 targetPos = mix(textPos, swirlPos, uPhotoMix);
      
      float dispersionScale = effectiveScatter * 5.0;
      vec3 scatter = (aRandom - 0.5) * dispersionScale;
      vec3 explosion = normalize(targetPos + noise3d(targetPos * 0.1)) * dispersionScale * 1.0;
      vec3 animatedPos = targetPos + scatter + explosion;
      
      vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Dynamic point size: Smaller on mobile to prevent "thick" blur
      float baseSize = mix(uIsMobile > 0.5 ? 3.0 : 4.5, 6.0, uPhotoMix);
      gl_PointSize = baseSize * (45.0 / -mvPosition.z);
      
      // Reduced alpha on mobile text to prevent "additive glow" clumping
      float baseAlpha = uIsMobile > 0.5 ? 0.4 : 0.7;
      vAlpha = mix(baseAlpha, 0.45, uPhotoMix);
      vColor = mix(uColor, uColor2, aRandom.z);
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float edge = smoothstep(0.5, 0.45, dist);
      gl_FragColor = vec4(vColor, edge * vAlpha);
    }
  `
};

function getTextParticles(text, count) {
    const isMobile = window.innerWidth <= 768;
    const width = 1024, height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
    // Medium-bold for better clarity (pure bold was too thick on mobile)
    ctx.font = '600 110px Arial, sans-serif'; ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    const lineHeight = 115;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = height / 2 - totalHeight / 2;

    lines.forEach((l, i) => ctx.fillText(l, width / 2, startY + i * lineHeight));

    const data = ctx.getImageData(0, 0, width, height).data;
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 100) {
            const idx = i / 4;
            pixels.push({
                x: (idx % width) - width / 2,
                y: -(Math.floor(idx / width) - height / 2)
            });
        }
    }

    const pos = new Float32Array(count * 3);
    // Responsive scale factor for mobile portrait vs desktop
    const s = isMobile ? 0.007 : 0.009;

    for (let i = 0; i < count; i++) {
        const p = pixels.length > 0 ? pixels[Math.floor((i / count) * pixels.length)] : { x: 0, y: 0 };
        pos[i * 3] = p.x * s;
        pos[i * 3 + 1] = p.y * s;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return pos;
}

export default function ParticleSystem({ pattern, color, count = 2000, hasStarted = false }) {
    const isMobile = window.innerWidth <= 768;
    const meshRef = useRef();
    const photoGroupRef = useRef();
    const handState = useHand();
    const [tex1, tex2] = useLoader(THREE.TextureLoader, [tex1Asset, tex2Asset]);

    const positions = useMemo(() => {
        const text = "HAPPY\nVALENTINE'S DAY\nBEBE";
        return getTextParticles(text, count);
    }, [count]);

    const randoms = useMemo(() => {
        const r = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) r[i] = Math.random();
        return r;
    }, [count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uColor2: { value: new THREE.Color('#FF1493') },
        uOpenness: { value: 1.0 },
        uPhotoMix: { value: 0 },
        uHasStarted: { value: 0 },
        uIsMobile: { value: isMobile ? 1.0 : 0.0 }
    }), [isMobile]);

    const heartShape = useMemo(() => {
        const heart = new THREE.Shape();
        heart.moveTo(0, 0);
        heart.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
        heart.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
        heart.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
        heart.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
        return heart;
    }, []);

    const heartsRef = useRef();

    useEffect(() => {
        uniforms.uColor.value.set(pattern === 'text_valentine' ? '#FF00FF' : color);
    }, [color, pattern]);

    useEffect(() => {
        uniforms.uHasStarted.value = hasStarted ? 1.0 : 0.0;
        if (hasStarted) uniforms.uOpenness.value = 1.0;
    }, [hasStarted]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        uniforms.uTime.value += delta;
        const { isDetected, handCount, position: handPos, openness: handOpennessVal } = handState.current;

        let targetMix = handCount >= 2 ? 1.0 : 0.0;
        uniforms.uPhotoMix.value = THREE.MathUtils.lerp(uniforms.uPhotoMix.value, targetMix, 0.1);

        let targetOpen = (!hasStarted || (pattern !== 'text_valentine' || handOpennessVal > 0.4)) ? 1.0 : 0.0;
        uniforms.uOpenness.value = THREE.MathUtils.lerp(uniforms.uOpenness.value, targetOpen, 0.15);

        if (isDetected && hasStarted) {
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, handPos.x, 0.1);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, handPos.y, 0.1);
            photoGroupRef.current.position.copy(meshRef.current.position);
        } else {
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.05);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.05);
            photoGroupRef.current.position.copy(meshRef.current.position);
        }

        const mixVal = uniforms.uPhotoMix.value;
        photoGroupRef.current.scale.setScalar(mixVal);
        // Slightly slower rotation speed as requested
        photoGroupRef.current.rotation.z += delta * 2.5 * mixVal;

        photoGroupRef.current.children.forEach((child, i) => {
            const angleOffset = (i / photoGroupRef.current.children.length) * Math.PI * 2;
            const time = state.clock.elapsedTime * 1.5 + angleOffset;
            const radius = 3.8 + (i * 0.2); // Spread radii for more "Amazing" feel
            child.position.x = Math.cos(time) * radius;
            child.position.y = Math.sin(time) * radius;
            child.position.z = Math.sin(time * 0.8 + i) * 2.5;
            child.lookAt(0, 0, 0);
            child.rotation.y += Math.PI;
        });

        meshRef.current.rotation.y += delta * (0.2 + mixVal * 0.5);

        // Hearts Animation Logic
        if (heartsRef.current) {
            const showHearts = (1.0 - uniforms.uOpenness.value) * (1.0 - uniforms.uPhotoMix.value);
            const targetScale = THREE.MathUtils.lerp(heartsRef.current.scale.x, showHearts, 0.1);
            heartsRef.current.scale.setScalar(targetScale);
            heartsRef.current.position.copy(meshRef.current.position);
            heartsRef.current.rotation.y += delta * 0.8;

            heartsRef.current.children.forEach((h, i) => {
                const t = state.clock.elapsedTime + i * 2.0;
                h.position.y = Math.sin(t) * 0.4;
                h.rotation.x = Math.PI; // Flip heart correctly
            });
        }
    });

    return (
        <group>
            {/* Enchanting Floating Hearts during Text Display */}
            <group ref={heartsRef} scale={[0, 0, 0]}>
                {[...Array(6)].map((_, i) => (
                    <mesh key={i} position={[
                        Math.cos((i / 6) * Math.PI * 2) * 3.5,
                        0,
                        Math.sin((i / 6) * Math.PI * 2) * 3.5
                    ]}>
                        <shapeGeometry args={[heartShape]} />
                        <meshBasicMaterial color="#FF69B4" side={THREE.DoubleSide} transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>

            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
                </bufferGeometry>
                <shaderMaterial
                    transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={uniforms}
                    vertexShader={ParticleShaderMaterial.vertexShader}
                    fragmentShader={ParticleShaderMaterial.fragmentShader}
                />
            </points>

            <group ref={photoGroupRef} scale={[0, 0, 0]}>
                {/* Increased photo count to 12 as requested */}
                {[...Array(12)].map((_, i) => (
                    <mesh key={i}>
                        <planeGeometry args={[2.2, 2.8]} />
                        <meshBasicMaterial map={i % 2 === 0 ? tex1 : tex2} side={THREE.DoubleSide} transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
