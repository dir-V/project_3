import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three';
import { gsap } from 'gsap';
import barba from '@barba/core'
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import _ from 'lodash';

const ImageSpheres = ({ canvasRef, imageOption }) => {
    // new THREE.Color(`rgb(${c[0]},${c[1]},${c[2]})`)
    //   const canvasRef = useRef(null);
    
    // let renderer = new THREE.WebGLRenderer({alpha: true});
    // let scene = new THREE.Scene();
    // let camera = new THREE.PerspectiveCamera(120, 16/9, 0.1, 1000);
    // canvasRef.current.appendChild(renderer.domElement);
    // const [animation, setAnimation] = useState(true);
    // console.log(animation)
    const animationRef = useRef(0)
    const aniFrameRef = useRef()
    const rendererRef = useRef()
    const sceneRef = useRef()
    const cameraRef = useRef()
    const instancedMeshRef = useRef();
    const initialPositionsRef = useRef([]);
    const newCanvasRef = useRef()
    // const debouncedUpdateImageOption = useRef(debounce(updateImageOption, 300)).current;
    const debouncedUp = _.debounce(updateImageOption, 3000)
    

//   useEffect(() => {
    
    // let instancedMesh;
    let imgTexture;
    let tiles = 100;
    let threshold = 0;
    let tileSize;
    const zMin = -150;
    const zMax = 150;
    const totalTiles = tiles * tiles;
    let animateMeshDone = false;
    let imagePath;
   

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


    const start = async () =>  {
        await init();
        animate();
    }

    async function init () {
        console.log("Init!")
        // Scene, Camera, Renderer and Controls initial state
        let scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 450);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;
        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableDamping = true;
        // controls.enablePan = false;
        // controls.enableZoom = false;
        
        imagePath = image(imageOption)
        imgTexture = await new THREE.TextureLoader().loadAsync(imagePath);
        imgTexture.minFilter = THREE.LinearFilter;
        imgTexture.magFilter = THREE.LinearFilter;
        imgTexture.needsUpdate = true;
        canvasRef.current.appendChild(renderer.domElement);
        console.log(canvasRef.current)

        let canvas = document.createElement('canvas')
        canvas.width = 400;
        canvas.height = 400;
        let context = canvas.getContext('2d',{willReadFrequently: true});
        context.drawImage(imgTexture.image, 0, 0,canvas.width, canvas.height);
        tileSize =  canvas.width / tiles;

        let geometry = new THREE.SphereGeometry(tileSize * 0.15, 16, 16);

        const vertexShader = `
        attribute vec3 instanceColor;
        varying vec3 vColor;
        void main() {
          vColor = instanceColor;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;

        const fragmentShader = `
            varying vec3 vColor;
            void main() {
            gl_FragColor = vec4(vColor, 1.0);
            }
        `;

        let material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {},
            vertexColors: true
        });

        // let instancedMesh = new THREE.InstancedMesh(geometry, material, tiles * tiles);
        // instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        // scene.add(instancedMesh)
        // instancedMeshRef.current = instancedMesh
        
        const colors = [];
        const initialPositions = [];
        let dummy = new THREE.Object3D();
        // let dummy = new THREE.Matrix4();

        for (let i = 0; i < totalTiles; i++) {
            let x = i % tiles;
            let y = Math.floor(i / tiles);
            let imgX = Math.floor((x * tileSize));
            let imgY = Math.floor((y * tileSize));
            let c = context.getImageData(imgX, imgY, imgTexture.image.width/tiles, imgTexture.image.height/tiles).data;
            let b = (c[0] + c[1] + c[2]) / (255 * 3);
            if (b > threshold) {
                // let geometry = new THREE.SphereGeometry(tileSize*0.15, 32, 32);
                // let material = new THREE.MeshBasicMaterial({color: new THREE.Color( `rgb(${c[0]},${c[1]},${c[2]})`) });
                colors.push(c[0] / 255, c[1] / 255, c[2] / 255);
                
                // let mesh = new THREE.Mesh(geometry, material);
                let z = THREE.MathUtils.mapLinear(b, 0, 1, zMin, zMax);
                // mesh.position.set((x * tileSize-canvas.width/2),
                // (canvas.height/1.8 - y * tileSize), z);
                // scene.add(mesh);
                dummy.position.set((x * tileSize - canvas.width / 2), (canvas.height/1.7 - y * tileSize), z);
                dummy.updateMatrix();
                
                // instancedMesh.setMatrixAt(i, dummy.matrix);
                // instancedMesh.setMatrixAt(i, new THREE.Matrix4);
                // instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
                initialPositions.push(new THREE.Vector3().setFromMatrixPosition(dummy.matrix))
                
            }
        }
        let instancedMesh = new THREE.InstancedMesh(geometry, material, initialPositions.length);
        console.log(initialPositions.length)
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(instancedMesh)
        instancedMeshRef.current = instancedMesh
        const colorArray = new Float32Array(colors);
        instancedMesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colorArray, 3));
        initialPositionsRef.current = initialPositions;
        instancedMeshRef.current = instancedMesh;
        sceneRef.current = scene;
        animationRef.current += 1
    };


   
    
    const animateMesh = () => {
        let matrix = new THREE.Matrix4();
        let position = new THREE.Vector3();
        let direction = new THREE.Vector3();
        const scene = sceneRef.current;
        const initialPositions = initialPositionsRef.current;
        const instancedMesh = instancedMeshRef.current;
        // const noise = new SimplexNoise();
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
                // instancedMesh.position.y += Math.sin(time + i)*0.45

                const distance = position.distanceTo(initialPosition)
                if (distance >= 5) {
                    allAtTarget = false;
                }else{
                    position.copy(initialPosition);
                }
                matrix.setPosition(position);
                instancedMesh.setMatrixAt(i, matrix);
                
            }
            if(allAtTarget){
                animateMeshDone = true;
                console.log("done!")
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
            // instancedMeshRef.current = instancedMesh
            
        }
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (renderer && scene && camera) {
            scene.rotation.y += 0.0065
            // instancedMesh.rotation.y += 0.005
            renderer.render(scene, camera);
        }
        
    }


    // function collapseMesh() {
    //     let matrix = new THREE.Matrix4();
    //     let position = new THREE.Vector3();
    //     let direction = new THREE.Vector3();
    //     let mesh = instancedMeshRef.current
    //     if(instancedMeshRef.current){
    //         for(let i = 0; i < totalTiles; i++){
    //             mesh.getMatrixAt(i, matrix);
    //             position.setFromMatrixPosition( matrix );
    //             direction.set(position.x, position.y, position.z).normalize();
    //             position.sub(direction.multiplyScalar(1));
    //             matrix.setPosition(position)
    //             mesh.setMatrixAt(i, matrix);
                
    //         }
    //         mesh.instanceMatrix.needsUpdate = true;
    //     }
    //     rendererRef.current.render( scene, camera )
    // }
    
    function animateCamera (){
        tl = gsap.timeline();
    }
    
    const collapseMesh = () => {
        return new Promise((resolve) => {
            const instancedMesh = instancedMeshRef.current;
            const matrix = new THREE.Matrix4();
            const initialPositions = initialPositionsRef.current;
            const noise = new SimplexNoise();
            gsap.to(initialPositions, {
                duration: 0.5,
                x: 0,
                y: 0,
                z: 0,
                ease: 'power1.inOut',
                onUpdate: () => {
                    const time= performance.now()* 0.001
                    for (let i = 0; i < initialPositions.length; i++) {
                        const position = initialPositions[i];
                        const noiseFactorX = noise.noise3d(position.x, position.y, position.z) * 0.1;
                        const noiseFactorY = noise.noise3d(position.x, position.y, position.z + 1) * 0.1;
                        const noiseFactorZ = noise.noise3d(position.x, position.y, position.z + 2) * 0.1;

                        position.x += Math.sin(time + i) * 0.5 + noiseFactorX
                        position.y += Math.cos(time + i) * 0.5 + noiseFactorY
                        position.z += Math.cos(time + i) * 1 + noiseFactorZ

                        matrix.setPosition(position);
                        instancedMesh.setMatrixAt(i, matrix);
                    }
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    const renderer = rendererRef.current;
                    const scene = sceneRef.current;
                    const camera = cameraRef.current;
                    if (renderer && scene && camera) {
                        scene.rotation.y -= 0.0172;
                        renderer.render(scene, camera);
                    }
                },
                onComplete: () =>{
                    resolve();
                    cancelAnimationFrame(aniFrameRef.current);
                    animateMeshDone=false;
                    
                },

            });
        });
    };
    async function animateWave() {
        const time = performance.now() * 0.001;
        const waveFrequency = 1; 
        const waveAmplitude = 10; 
        const speed = 2; 
        const scene = sceneRef.current;
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        const instancedMesh = instancedMeshRef.current;
        const initialPositions = initialPositionsRef.current;
        const rowOffset = 0.5;
        
        const dummy = new THREE.Object3D();
        for (let i = 0; i < initialPositions.length; i++) {
            const position = initialPositions[i];
            const rowIndex = Math.floor(position.y / tileSize);
            
          
            const offset = Math.sin((position.y/800) * waveFrequency + (time * speed) + (rowIndex * rowOffset)) * waveAmplitude;

            if(position.z >= 150 || position.z <= -150){
                dummy.position.set(position.x, position.y, position.z)
            }else{
                dummy.position.set(position.x, position.y, position.z + offset);
            }
            
            dummy.updateMatrix();
    
            
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true; 
        instancedMesh.rotation.y += 0.005;
        await renderer.render(scene, camera);
   
    }
    
   function normalAnimation(){
        let matrix = new THREE.Matrix4();
        let position = new THREE.Vector3();
        const scene = sceneRef.current;
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        const initialPositions = initialPositionsRef.current;
        const instancedMesh = instancedMeshRef.current;
        if (instancedMesh){
        const time = performance.now()*0.0027;
        for(let i =0; i < instancedMesh.count; i++){
            instancedMesh.getMatrixAt(i, matrix);
            position.setFromMatrixPosition(matrix);

            
            // position.z -= Math.cos(time + i)*0.05
            position.z += Math.sin(Math.sqrt(position.x*position.x + position.y * position.y) - time)*0.1
            // position.x += Math.cos(time + i)*0.05
            
            instancedMesh.position.y += Math.sin(time + i)*0.45
            if(position.z >= 150 || position.z <= -150){
                matrix.setPosition(initialPositions[i])
            }else{
                matrix.setPosition(position)
        }
            instancedMesh.setMatrixAt(i, matrix)
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
    }
        if(renderer && scene && camera){
            
            scene.rotation.y += 0.005;
            renderer.render(scene, camera)
        }

    }

    function animate () {
        aniFrameRef.current = requestAnimationFrame(animate);
        if(!animateMeshDone){
            animateMesh();
        }else{
            // animateWave();
            normalAnimation();
        }
    };
 
    useEffect(() =>{
        if (animationRef.current > 0) {
            updateImageOption(imageOption)
            
        }else{
            start();
            
        }
        return () => {
            // if(animationRef.current >= 0){
            //     if(rendererRef.current){
            //         rendererRef.current.dispose();
            //         rendererRef.current.forceContextLoss();
            //     }
            //     if(sceneRef.current){
            //         scene.clear();
            //     }
            //     if(canvasRef !=null) canvasRef.current.removeChild(rendererRef.current.domElement)
            // }
    };

    }, [imageOption])

 

    async function updateImageOption (newImageOption) {
        console.log("Updating...")
        await collapseMesh()
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        sceneRef.current.clear();
        if(canvasRef.current != null)canvasRef.current.removeChild(rendererRef.current.domElement)
        sceneRef.current = null
        rendererRef.current = null
        animationRef.current -= 1
        start();
        
    };


//     return () => {
//         renderer.dispose();
//         renderer.forceContextLoss();
//         scene.clear();
//         if(canvasRef.current != null)canvasRef.current.removeChild(renderer.domElement)
//     };
    
// }, [imageOption]);

//jsx return
  return <div ref={canvasRef} className="absolute z-0"></div>
};

export default ImageSpheres;