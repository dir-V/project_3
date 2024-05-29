import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const Rasterise = ({ imageOption,  canvasRef }) => {
  const instancedMeshRef = useRef();
  const tileSize = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tiles = 100;
  const totalTiles = tiles * tiles;
  const zMin = -150;
  const zMax = 150;
  const threshold = 0;
  // let imagePath = './src/assets/r.png'
  let texture;
  
  function image (imageOption){
    let imagePath;
    switch (imageOption) {
        case 0:   
            imagePath = './src/assets/r.png';
            break;
        case 1:
            imagePath = './src/assets/n.png';
            break;
        case 2:
            imagePath = './src/assets/p.png';
            break;
        default:
            imagePath = './src/assets/g2.png';
        }
    return imagePath;
}
  let imagePath = image(imageOption);
  // let texture = useLoader(TextureLoader, imagePath);
  const { geometry, colors, initialPositions } = useMemo(() => {
    texture = useLoader(TextureLoader, imagePath);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

    const tileSizeValue = canvas.width / tiles;
    tileSize.current = tileSizeValue;
    const geom = new THREE.SphereGeometry(tileSizeValue * 0.15, 16, 16);
    const colorArray = [];
    const positions = [];

    for (let i = 0; i < totalTiles; i++) {
      const x = i % tiles;
      const y = Math.floor(i / tiles);
      const imgX = Math.floor(x * tileSizeValue);
      const imgY = Math.floor(y * tileSizeValue);
      const c = context.getImageData(imgX, imgY, texture.image.width / tiles, texture.image.height / tiles).data;
      const b = (c[0] + c[1] + c[2]) / (255 * 3);

      if (b > threshold) {
        colorArray.push(c[0] / 255, c[1] / 255, c[2] / 255);
        const z = THREE.MathUtils.mapLinear(b, 0, 1, zMin, zMax);
        dummy.position.set((x * tileSizeValue - canvas.width / 2), (canvas.height / 1.7 - y * tileSizeValue), z);
        dummy.updateMatrix();
        positions.push(dummy.matrix.clone());
      }
    }

    return {
      geometry: geom,
      colors: new Float32Array(colorArray),
      initialPositions: positions
    };
  }, [texture]);

  useEffect(() => {
    if (instancedMeshRef.current) {
      instancedMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      initialPositions.forEach((matrix, i) => {
        instancedMeshRef.current.setMatrixAt(i, matrix);
      });

      instancedMeshRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [initialPositions, colors]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      attribute vec3 instanceColor;
      varying vec3 vColor;
      void main() {
        vColor = instanceColor;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
    vertexColors: true
  }), []);

  return (
      <instancedMesh ref={instancedMeshRef} args={[geometry, material, initialPositions.length]} rotateY={1}>
        <sphereGeometry args={[tileSize.current * 0.15, 16, 16]} />
        <primitive attach="material" object={material} />
      </instancedMesh>
  );
}

export default Rasterise;
