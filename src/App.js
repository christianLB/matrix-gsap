import React, {Fragment, useState, useEffect} from 'react';
import './App.scss';
import gsap from 'gsap';
import image from './image13.jpg'
const getPixels = require("get-pixels-updated")
const ndarray = require("ndarray")


const sample = 'abcdfghijklmnopqrstuvwyz!"&%=/|¬°[]{}+*~-_¡`;:'.split('');
//const sample = '0'.split('')
const chars = [];

function App() {

  const loadImage = (e) => {
    getPixels(image, function (err, pixels) {
        if (err) {
          console.log('something wrong')
        }
        setPixels(pixels)
      })
  }

  // const delay = async (n) => {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve();
  //     }, n);
  //   });
  // }
  const body = document.querySelector('body')
  const bodyRect = body.getBoundingClientRect()
  const [columns, setColumns ] = useState(Math.floor(1000 / 14))
  const [columnLength, setColumnLength] = useState(Math.floor(600 / 14))

  const glowColors = gsap.utils.interpolate('#EEFFEE', 'green', .1)
  const goldenGlow = gsap.utils.interpolate('#FFFFFF', 'yellow', .1)
  
  const random01 = () => gsap.utils.random(0, 1, .01)
  const random020 = () => gsap.utils.random(0, 20, 1)
  let randomGlow = () => gsap.utils.interpolate('#DDFFDD', 'green', .1);
  let randomFall = () => gsap.utils.random(['black', '#2c842c', '#2c842c', '#2c842c']);
  const [pixels, setPixels] = useState(null)
    
  useEffect(() => {

    

    if (pixels && pixels.data) {
      const app = document.getElementById('app');
      const pixelnd = new ndarray(pixels.data, pixels.shape, pixels.stride, pixels.offset)
      const pixelSize = 15
      const cols = Math.floor(pixels.shape[0] / pixelSize) //columns;
      const colLength = Math.floor(pixels.shape[1] / pixelSize);
      app.style.width = `${cols * pixelSize}px`
      app.style.height = `${colLength * pixelSize}px`;
      app.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`
      app.style.gridTemplateRows = `repeat(${colLength}, ${pixelSize}px)`
      const htmlPixels = []

      const getPixelColor = (index, target) => {
        const classList = target.classList
        const x = target.dataset.x * pixelSize, y = target.dataset.y * pixelSize
        const r = pixelnd.get(x, y, 0)
        const g = pixelnd.get(x, y, 1)
        const b = pixelnd.get(x, y, 2)
        const rgbString = `rgb(${r},${g},${b})`;
        return rgbString
      }

      for (let i=0; i < cols; i++) {
        for (let j = 0; j < colLength; j++) {
          const htmlPixel = document.createElement('i');
          htmlPixel.classList.add(i, j)
          htmlPixel.dataset.x = i
          htmlPixel.dataset.y = j
          htmlPixel.style.fontSize = `${pixelSize}px`
          //htmlPixel.style.overflow = 'hidden'
          htmlPixels.push(htmlPixel)
          app.appendChild(htmlPixel)
        }
      }
      gsap.set('i', {
        width: pixelSize,
        height: pixelSize,
        color: 'black',
      })

      const getSpeed = (amount) => {
        const speeds = [[0,0,0],
          [20, 40, 1],
          [20, 30, 1],
          [10, 20, 1],
          [5, 15, 1],
          [1, 10, 1],
          [1, 5, 1],
          [1, 3, 1],
          [.1, .5, .1],
        ]
        const [ min, max, snap ] = speeds[amount]
        return gsap.utils.random(min, max, snap)
      }
      const randomCol = () => document.querySelectorAll(`[data-x='${gsap.utils.random(0, cols - 1, 1)}']`)
      const randomSlicedCol = () => { //returns random slice of a random column
        const col = randomCol()
        const begin = gsap.utils.random(0, colLength - 1, 1)
        const end = gsap.utils.random(begin, colLength - 1, 1)
        return [...randomCol()].slice(begin, end)
      }
      
      const effect1 = (speed, amount = 1) => {
        [...Array(amount)].forEach(() => {
          const tl2 = gsap.timeline()
          tl2.to(randomSlicedCol(), {
            color: getPixelColor,
            fontWeight: '',
            ease:'bounce',
            textContent: () => gsap.utils.random(sample),
            stagger: { amount: getSpeed(speed) },
            onComplete: () => effect1(speed)
          })
        })
      }
      const effect2 = (speed, amount = 1) => {
        [...Array(amount)].forEach(() => {
          const tl = gsap.timeline()
          tl.to(randomSlicedCol(), {
            color: randomGlow,
            fontWeight:'bold',
            stagger: {
              each: getSpeed(speed), repeat: 1, yoyo: true,
              repeatDelay: speed
            },
            onComplete: () => effect2(speed),
          })  
        })
      }
      const effect3 = (speed, amount = 1) => {
        [...Array(amount)].forEach(() => {
          const tl = gsap.timeline()
          tl.to(randomSlicedCol(), {
            //color: goldenGlow,
            textContent: () => gsap.utils.random(sample),
            stagger: {
              amount: getSpeed(speed), repeat: 1, yoyo: true,
              repeatDelay: speed
            },
            onComplete: () => effect3(speed),
          })  
        })
      }

     effect1(7, cols / 2)
     
     effect2(7, 55)
     effect2(6, 25)
      
     //effect3(7, cols / 2)
    }
  },[pixels])

  // useEffect(() => {
    
  //   requestAnimationFrame(updateMatrix);
  //   animate();
  // }, [columns, columnLength]);
    
    //const glowColors = gsap.utils.interpolate('#FFFFFF', '#a6ffa6', 0.5)
    
  

    
  
  const animate = () => {
    const app = document.getElementById('app')
    let cols = [...document.getElementsByClassName('col')];
    let pixels = [...document.getElementsByTagName('span')]
    let globalDelay = gsap.utils.random(3000, 10000);
    const spans = [...document.getElementsByTagName('span')]

    if (cols) {
        
        
        cols.map(async (v) => {
          let col = [...v.childNodes];
          const begin = gsap.utils.random(0, col.length);
          //gsap transition starts here
          const tl = gsap.timeline({
            repeat: -1,
            repeatRefresh: true,
            repeatDelay: gsap.utils.random(1,2,1)
          })
          tl.to(col.slice(begin, gsap.utils.random(begin, col.length)), {
            color: randomGlow,
            stagger: {
              textContent: 'random([0,1,2])',
              amount: gsap.utils.random(1, 5, 1),
              repeat: 1,
              yoyo: true,
            }, ease: 'bounce'
          })
            // .to(col, {
            //   color: randomFall,
            //   stagger: {
            //     amount: gsap.utils.random(1, 10, 1)
            //   },
            // })
        });
      }
      //delay(globalDelay).then(animate);
    } 
  

  return (
    <>
      <div id="app" className="App"></div>
      <img id="source" src={image} width={994} style={{display: 'none'}}onLoad={loadImage} height={600} />
      <canvas id="canvas2" />
    </>
  );
}

export default App;
