import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

const HomeNav = ({ animateCamera, canvasRef, handleOptionSel }) => {
  const titleRef = useRef(null);
  const optionsRef = useRef([]);
  

  useEffect(() => {
    const title = titleRef.current;
    const options = optionsRef.current;
    const canvas = canvasRef.current;
    const tl = gsap.timeline();

    tl.set([title, options, canvas], {
      opacity: 0,
      scale: 1,
      pointerEvents: "none",
    })
      .fromTo(
        canvas,
        { x: "0vw", y: "0vh" },
        {
          x: "0vw",
          y: "0vh",
          opacity: 1,
          duration: 2,
          ease: "power1.out",
          delay:0.5
        },
        '=0.5'
      )
      .set(title, { opacity: 1, onComplete: animateCamera,})
      .fromTo(
        title,
        { x: "0vw", y: "0vh" },
        {
          x: "-32vw",
          y: "-27vh",
          scale: 0.65,
          duration: 1,
          ease: "power4.inOut",
          delay: 1.2,
        }
      )
  
      .fromTo(
        options,
        { x: "-32vw", y: "-27vh" },
        {
          x: "-32vw",
          y: "-20vh",
          opacity: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: "power1.out",
          pointerEvents: "auto",
        },
        "-=0.1"
      )
  }, []);

  return (
      <div className="flex absolute z-20 flex-col h-full w-full text-center text-slate-200 justify-center items-center font-avante">
        <h1 ref={titleRef} className="text-9xl tracking-tightest">
          PROJECT_3
        </h1>
        <div className="flex flex-col space-y-36 h-8 m-0 p-0">
          <Link
            to="/explore"
            ref={(el) => (optionsRef.current[0] = el)}
            onMouseEnter={() => handleOptionSel(0)}
            onMouseLeave={() => handleOptionSel(null)}
            className="text-5xl tracking-tightest hover:text-slate-500 mt-4"
          >
            EXPLORE
          </Link>
          <Link
            to="/contact"
            ref={(el) => (optionsRef.current[1] = el)}
            onMouseEnter={() => handleOptionSel(1)}
            onMouseLeave={() => handleOptionSel(null)}
            className="text-5xl tracking-tightest hover:text-slate-500"
          >
            CONTACT
          </Link>

          <Link
            to="/about"
            ref={(el) => (optionsRef.current[2] = el)}
            onMouseEnter={() => handleOptionSel(2)}
            onMouseLeave={() => handleOptionSel(null)}
            className="text-5xl tracking-tightest hover:text-slate-500"
          >
            ABOUT
          </Link>
        </div>
      </div>
  );
};

export default HomeNav;
