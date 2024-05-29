import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { gsap } from 'gsap';
import { PerspectiveCamera, useTexture } from '@react-three/drei';

const ImageSpheres = ({ imageOption }) => {
  const { scene, gl: renderer } = useThree();
  const animationRef = useRef(0);
  const instancedMeshRef = useRef();
  const initialPositionsRef = useRef([]);
  const [animateMeshDone, setAnimateMeshDone] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const tiles = 100;
  const threshold = 0;
  const zMin = -150;
  const zMax = 150;
  const totalTiles = tiles * tiles;
  let tileSize;

  const vertexShader = useMemo(() => `
    attribute vec3 instanceColor;
    varying vec3 vColor;
    void main() {
      vColor = instanceColor;
      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `, []);

  const fragmentShader = useMemo(() => `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {},
    vertexColors: true
  }), [vertexShader, fragmentShader]);

  const getImagePath = (imageOption) => {
    switch (imageOption) {
      case 0:
        return './src/assets/r.png';
      case 1:
        return './src/assets/n.png';
      case 2:
        return './src/assets/p.png';
      default:
        return './src/assets/g2.png';
    }
  };
  
  const createMesh = async (imagePath) => {
    const imgTexture = await new THREE.TextureLoader().loadAsync(imagePath);
   
    imgTexture.minFilter = THREE.LinearFilter;
    imgTexture.magFilter = THREE.LinearFilter;
    imgTexture.needsUpdate = true;

    let canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    let context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(imgTexture.image, 0, 0, canvas.width, canvas.height);
    tileSize = canvas.width / tiles;

    const geometry = new THREE.SphereGeometry(tileSize * 0.15, 16, 16);
    const colors = [];
    const initialPositions = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < totalTiles; i++) {
      let x = i % tiles;
      let y = Math.floor(i / tiles);
      let imgX = Math.floor(x * tileSize);
      let imgY = Math.floor(y * tileSize);
      let c = context.getImageData(imgX, imgY, imgTexture.image.width / tiles, imgTexture.image.height / tiles).data;
      let b = (c[0] + c[1] + c[2]) / (255 * 3);
      if (b > threshold) {
        colors.push(c[0] / 255, c[1] / 255, c[2] / 255);
        let z = THREE.MathUtils.mapLinear(b, 0, 1, zMin, zMax);
        dummy.position.set((x * tileSize - canvas.width / 2), (canvas.height / 1.8 - y * tileSize), z);
        dummy.updateMatrix();
        initialPositions.push(new THREE.Vector3().setFromMatrixPosition(dummy.matrix));
      }
    }

    const instancedMesh = new THREE.InstancedMesh(geometry, material, initialPositions.length);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    const colorArray = new Float32Array(colors);
    instancedMesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colorArray, 3));
    initialPositionsRef.current = initialPositions;
    instancedMeshRef.current = instancedMesh;
    animationRef.current += 1;
    console.log(animationRef.current)
  };

  const animateMesh = () => {
    let matrix = new THREE.Matrix4();
    let position = new THREE.Vector3();
    let direction = new THREE.Vector3();
    const initialPositions = initialPositionsRef.current;
    const instancedMesh = instancedMeshRef.current;
    if (instancedMesh && !animateMeshDone) {
      let allAtTarget = true;
      const time = performance.now() * 0.001;
      for (let i = 0; i < initialPositions.length; i++) {
        instancedMesh.getMatrixAt(i, matrix);
        position.setFromMatrixPosition(matrix);

        const initialPosition = initialPositions[i];
        direction.copy(initialPosition).sub(position).normalize();

        position.x += Math.sin(time + i) * 0.7;
        position.y -= Math.cos(time + i) * 0.7;
        position.z += Math.sin(time + i) * 1;

        position.add(direction.multiplyScalar(1.2));

        const distance = position.distanceTo(initialPosition);
        if (distance >= 5) {
          allAtTarget = false;
        } else {
          position.copy(initialPosition);
        }
        matrix.setPosition(position);
        instancedMesh.setMatrixAt(i, matrix);
      }
      if (allAtTarget) {
        setAnimateMeshDone(true);
        console.log("done!");
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.rotation.y += 0.0065;
    }
  };

  const collapseMeshAnimation = () => {
    let matrix = new THREE.Matrix4();
    let position = new THREE.Vector3();
    const instancedMesh = instancedMeshRef.current;
    const initialPositions = initialPositionsRef.current;
    if (instancedMesh) {
      let allAtOrigin = true;
      for (let i = 0; i < initialPositions.length; i++) {
        instancedMesh.getMatrixAt(i, matrix);
        position.setFromMatrixPosition(matrix);
        const origin = new THREE.Vector3(0,0,0)
        position.lerp(origin, 0.08);
        const distance = position.distanceTo(origin);
        if (distance >= 1) {
          allAtOrigin = false;
        } else {
          position.copy(origin);
        }
        matrix.setPosition(position);
        instancedMesh.setMatrixAt(i, matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (allAtOrigin) {
        console.log("allAtOrigin")
        animationRef.current -= 1
        setCollapsed(true);
        setAnimateMeshDone(false);
        scene.remove(instancedMeshRef.current);
        instancedMeshRef.current.geometry.dispose();
        instancedMeshRef.current.material.dispose();
        createMesh(getImagePath(imageOption))
      }
    }
  };

  useFrame(() => {
    if(!collapsed){
      collapseMeshAnimation();
    }else if (!animateMeshDone) {
      animateMesh(); 
    } else {
      instancedMeshRef.current.rotation.y += 0.0065;
    }
  });

  useEffect(() => {
    if(animationRef.current === 0)
      createMesh(getImagePath(imageOption))
    return () => {
      setCollapsed(false)
    };
  }, [imageOption]);


  return null;
};

export default ImageSpheres;
