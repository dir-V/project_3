import { useEffect, useRef } from 'react';
import p5 from 'p5';

const Rasterise = ({ imagePath, canvasRef }) => {
    

    useEffect(() => {
        const sketch = (p) => {
            let img;
            let threshold = 0;
            let sf = 1.25;
            let tileSize;
            const tiles = 100;
            const zMin = -150;
            const zMax = 100;
            const totalTiles = tiles*tiles
      
            p.preload = () => {
              img = p.loadImage(imagePath);
    
            };
      
            p.setup = () => {
              p.createCanvas(900, 900, p.WEBGL);
              img.resize(Math.floor(800/sf), Math.floor(800/sf));
              tileSize = p.width / tiles;
            };
      
            p.draw = () => {
              p.translate(-p.width / 2, -p.height / 2);
              p.background("#09090b");
              p.fill(225);
              p.stroke(225);
              p.push();
              p.translate(p.width / 2, p.height / 2, 0);
              p.rotateY(p.radians(p.frameCount));
             
              
              for(let i =0 ; i< totalTiles; i++){
                let x = i % Math.floor(tiles);
                let y = i / Math.floor(tiles);

                let imgX = Math.floor((x*tileSize)/sf);
                let imgY = Math.floor((y*tileSize)/sf);
                let c = img.get(imgX, imgY);
                let b = p.map(p.brightness(c), 0, 255, 1, 0);

                if (p.brightness(c) > threshold) {
                  let z = p.map(b, 0, 1, zMin, zMax);
                  p.push();
                  p.translate(
                    (x * tileSize - p.width / 2)/sf,
                    (y * tileSize - p.height / 2)/sf,
                    z
                  );
                  p.sphere(tileSize * b * 0.01, 2, 2);
                  p.pop();
                }
              }
              
              // for (let x = 0; x < tiles; x++) {
              //   for (let y = 0; y < tiles; y++) {
              //     let c = img.get(p.int(x * tileSize/sf), p.int(y * tileSize/sf));
              //     let b = p.map(p.brightness(c), 0, 255, 1, 0);
              //     if (p.brightness(c) > threshold) {
              //       let z = p.map(b, 0, 1, zMin, zMax);
              //       p.push();
              //       p.translate(
              //         (x * tileSize - p.width / 2)/sf,
              //         (y * tileSize - p.height / 2)/sf,
              //         z
              //       );
              //       p.sphere(tileSize * b * 0.01, 2, 2);
              //       p.pop();
              //     }
              //   }
              // }
              p.pop();
            };
          }; 
          const p5I = new p5(sketch, canvasRef.current)
      
          return () => {
            p5I.remove();
          };
        }, [canvasRef, imagePath]);
      
        return <div ref={canvasRef} className="flex justify-center items-center w-1/2 opacity-0"></div>;
      };

export default Rasterise;