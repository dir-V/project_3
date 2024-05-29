import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import ImageSpheres from './ImageSpheres';
import './App.css'; 
import HomeNav from './HomeNav';
import Explore from './Explore';
import About from './About';
import Contact from './Contact';
import { Route, Routes } from 'react-router-dom';
import Rasterise from './Rasterise';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
const App = () => {
  // const titleRef = useRef(null);
  // const optionsRef = useRef([]);
  const canvasRef = useRef(null);
  const [imageOption, setImageOption] = useState(null);
  const handleOptionSel = (i) => {
    setImageOption(i)
  }

  

  // useEffect(() => {
  //   const title = titleRef.current;
  //   const options = optionsRef.current;
  //   const canvas = canvasRef.current;
  //   const tl = gsap.timeline();

  //   tl.set(title, {opacity: 0})
  //     // .set(title, {opacity: 1, delay: 1.1})
  //     // .to(title, { x:'-35vw', y:'-30vh', scale: 0.65, duration: 1, ease: 'power4.inOut', delay: 1.1})
  //     // .fromTo(options, { x: '-35vw', y: '-30vh'}, { x: '-35vw', y: '-20vh', opacity: 1, duration: 0.5, stagger: 0.2, ease: 'power1.out' }, '=0.5')
  //     // .fromTo(canvas, { x: '0vw', y: '-80vh'}, {x: '40vw', y: '-85vh', opacity: 1, duration: 0.5, ease: 'power1.out' }, '=0.5');
  //     .set(title, {opacity: 1, delay: 1.1})
  //     .to(title, { x:'-30vw', y:'0vh', scale: 0.65, duration: 1, ease: 'power4.inOut', delay: 1.1})
  //     .fromTo(options, { x: '0vw', y:'0vh'}, { x: '-30vw', y: '0vh', opacity: 1, duration: 0.5, stagger: 0.2, ease: 'power1.out' }, '=0.5');
  // }, []);

  return (
    <>
    <HomeNav canvasRef={canvasRef} handleOptionSel={handleOptionSel} />
    <div ref = {canvasRef} className='absolute z-10 h-full w-full'>
      <Canvas>
        <PerspectiveCamera 
        makeDefault 
        position={[0,0,450]}
        lookAt={[0,0,0]}
        args={[70, window.innerWidth/window.innerHeight, 0.1, 1000]}
        />
      <ImageSpheres imageOption={imageOption}/>
      </Canvas>
    </div>
       {/* <Routes>
        <Route path="/" element={<><HomeNav canvasRef={canvasRef} handleOptionSel={handleOptionSel} /><ImageSpheres canvasRef ={canvasRef} imageOption={imageOption}/></>} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
    </Routes> */}
    </>
    
  );
};

export default App;