
// pixi.tsx
import React, { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import { PixiPlugin } from "gsap/PixiPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

import gsap from 'gsap'
import test from '../spark3.png'
import space from '../space.jpg'
import desertImage from '../desert.jpg'
import boat from '../boat.png'
import * as effects  from './gsapeffects'
import { GlowFilter } from '@pixi/filter-glow';
import { ReflectionFilter } from '@pixi/filter-reflection'
import { Layer, Stage } from '@pixi/layers'
import { ShockwaveFilter } from "@pixi/filter-shockwave"
import { fragment, vertex } from './frag'
import { fragment as spaceFragment } from './space'

gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI)



export default function PixiMatrix() {
    useEffect(() => {
        if (process.browser) {
            let type = "WebGL";
            if (!PIXI.utils.isWebGLSupported()) {
                type = "canvas";
            }
            //utils.sayHello(type);
        }
        
        const w = 1280
        const h = 768
        let globalX = w / 2
        let globalY = h / 2
        let app = new PIXI.Application({ width: w, height: h });
        document.querySelector('#root').appendChild(app.view)
        
        const globals = {
            circleRadius: 150
        }

        let { circleRadius } = globals
       
        //boat
        const boatSprite = PIXI.Sprite.from(boat)
        boatSprite.width = 100
        boatSprite.height = 50
        boatSprite.x = w / 2 - 75
        boatSprite.y = h - 272
        gsap.to(boatSprite, {
            ease: 'power1',
            duration: gsap.utils.random(5, 10, 1, true),
            repeat: -1,
            repeatRefresh: true,
            yoyo: true,
            pixi: {
                rotation: -6,
                y: '+=10'    
            }
        })
        gsap.to(boatSprite, {
            ease: 'power4.InOut',
            duration: gsap.utils.random(10, 20, 1, true),
            repeat: -1,
            repeatRefresh: true,
            pixi: {
                x: gsap.utils.random(0, w - boatSprite.width, 1, true)    
            }
        })
        
        //background///////////////////////////////////////////////////////
        const background = PIXI.Sprite.from(space);
        const spaceFilter = new PIXI.Filter(vertex, spaceFragment, {
            time: 0.5,
            mouse: [globalX, globalY],
            dimensions: [w, h],
        });
        gsap.to(spaceFilter.uniforms, {
            ease: 'circle',
            time: 40,
            duration: 40,
            repeat: -1, yoyo: true
        })
        background.width = w;
        background.height = h;

        //filters 
        const waveFilter = new ShockwaveFilter([w / 2, h / 2], { radius: 250 }, 0)

        //trail layers
        app.stage = new Stage()
        const layer = new Layer()

        app.stage.filterArea = app.renderer.screen;
        app.stage.filters = [];

        layer.useRenderTexture = true;
        // this flag is required, or you'll get
        // "glDrawElements: Source and destination textures of the draw are the same."
        layer.useDoubleBuffer = true;
        const trailSprite = new PIXI.Sprite(layer.getRenderTexture());
        trailSprite.alpha = .1;

        //appending 
        app.stage.addChild(background);
        layer.addChild(boatSprite)
        layer.addChild(trailSprite);
        
        //reflection
        const reflect = new ReflectionFilter()
        reflect.boundary = 0.7
        reflect.alpha = [1, 0.5]
        layer.filters = [reflect]
        
        background.filters = [reflect, spaceFilter]
        app.stage.addChild(layer);
        const showLayer = new PIXI.Sprite(layer.getRenderTexture());
        app.stage.addChild(showLayer);
        //const sample = 'abcdegghijklmnopqrstuvwxyz'.split('')
        const tileSize = 50;
        
        
        //circle 
        const desert = PIXI.Sprite.from(desertImage)
        desert.anchor.set(0.5)
        
        const circleCont = new PIXI.Container()
        circleCont.addChild(desert)
        circleCont.x = w / 2;
        circleCont.y = h / 2;
        const circle = new PIXI.Graphics();

        circle.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        circle.beginFill(0xDE3249, 1);
        circle.drawCircle(w / 2, h / 2, circleRadius);
        circle.endFill();
        circleCont.mask = circle
        //layer.addChildAt(circleCont, 0)
        const glowFilter = new GlowFilter({ distance: 15, innerStrength: 15 })
        
        circleCont.filters = [glowFilter]
        desert.filters = [waveFilter]
        ////////////////////////////////////////////////////////////////////////////////////////////////
        
        const star = ({ size = 70, filter = null }) => {
            //const filter = new PIXI.filters.ColorMatrixFilter();
            let obj = PIXI.Sprite.from(test);
            
            filter.uniforms.dimensions = [size, size]
            obj.width = size
            obj.height = size
            obj.anchor.set(0.5);
            obj.filters = [filter];
            //app.stage.addChild(obj);
            layer.addChild(obj)
            return obj
        }

        const stars = ({ amount, size = 70 }) => {
            //custom filter 
            // Build the filter customFilter. fragment shader string is in a separate file.
            const filter = new PIXI.Filter(vertex, fragment, {
                time: 0.5,
                mouse: [globalX, globalY],
                dimensions: [size, size],
            });
            const filterTween = gsap.to(filter.uniforms, {
                duration: 5,
                time: 12.0,
                ease: 'linear',
                rotation: gsap.utils.random(1, 360, 1, true),
                repeat: -1,
                //paused:true
            })
            
            const arr = { sprites: [], filter, amount, filterTween }
            for (let i = 0; i < amount; i++) {
                arr.sprites.push(star({ size, filter }))
            }
            //blinking
            arr.blinking = gsap.to(arr.sprites, {
                pixi: {
                    brightness: 1, //gsap.utils.random(1, 1, .1, true),
                    colorize: effects.randomRGB
                },
                //stagger: {amount: 5, repeat: -1, from:'random'},
                //ease: 'elastic',
                //yoyo: true,
                //duration: .1,//gsap.utils.random(.1, 1, 1, true),
                //repeat: -1,
                repeatRefresh: true,
                paused: true
            }, 0)
            
            return arr
        }

        const tilesX = 80
        const tilesY = 5
        const stars1 = stars({ amount: 40, size: 100 })
        const stars2 = stars({ amount: 40, size: 115 })
        const stars3 = stars({ amount: 40, size: 120 })
        const stars4 = stars({ amount: 40, size: 125 })
        const stars5 = stars({ amount: 40, size: 130 })

        const stars7 = stars({ amount: 40, size: 135 })
        const stars8 = stars({ amount: 40, size: 145 })
        const stars9 = stars({ amount: 40, size: 155 })
        const stars10 = stars({ amount: 40, size: 160 })
        const stars11 = stars({ amount: 40, size: 165 })
        
        const stars6 = stars({ amount: 5, size: 155 })
        //const cols = [...Array(tilesX)].map(() => {
        //    return orbs({amount: tilesY})
        //})

        const centerPoint = () => {
            return { x: w / 2, y: h / 2 }
        }
        
                   
        // shuffle(cols).slice(0, tilesX).forEach(col => {
        //     const randomDelay = gsap.utils.random(1, 5, 1, true)
        //     const randomStagger = gsap.utils.random(3, 20, .5, true)
        //     gsap.to(col, {
        //         stagger: {
        //             amount: randomStagger(),
        //             repeat: 1,
        //             yoyo: true
        //         },
        //         delay: randomDelay(),
        //         repeatDelay: randomDelay(),
        //         repeatRefresh: true,
        //         //pixi: {brightness: 3 },
        //         pixi: {tint: randomRGB() },
        //         repeat: -1,
        //     })
        // })

        
        //Main timeline
        const tl = gsap.timeline()
        // tl.arrangeCircle(_stars1, { duration: 2, stagger: .01, radiusX: 200, radiusY: 200, offset: 0, center: centerPoint() })
        // tl.arrangeCircle(_stars1, { duration: 2, stagger: 0, radiusX: 800, radiusY: 100, offset: 0, center: centerPoint() })
        // tl.arrangeCircle(_stars1, { duration: 2, stagger: 0, radiusX: 10, radiusY: 10, offset: 0, center: centerPoint() })
        // tl.arrangeGrid(_stars1, { duration: 10, columns: 5})
        let cp = centerPoint()
        //tl.arrangeCircle(stars2.sprites, { duration: 0, stagger: 0, radiusX: 400, radiusY: 400, offset: 0, center: cp }, 0)
        //tl.arrangeCircle(stars3.sprites, { duration: 0, stagger: 0, radiusX: 200, radiusY: 200, offset: 0, center: cp }, 0)
        //tl.blinkStagger(stars1.sprites, { duration: 0.3, }, 0)
        // tl.blinkStagger(stars2.sprites, { duration: 0.4, }, 0)
        // tl.blinkStagger(stars3.sprites, { duration: 0.5, }, 0)
        // tl.blinkStagger(stars4.sprites, { duration: 0.6, }, 0)
        // tl.blinkStagger(stars5.sprites, { duration: 0.7, }, 0)
        // tl.blinkStagger(stars6.sprites, { duration: 0.8, }, 0)
        tl.set(
            [stars2.sprites,
            stars3.sprites,
            stars4.sprites,
            stars5.sprites,
            stars6.sprites], {
                pixi: {
                    x: function () { return gsap.utils.random(0, w, 0.1, true) },
                    y: function () { return gsap.utils.random(0, h - 300, 0.1, true) },
                    
                }
            }, 0
        )
        
        tl.linear(stars1.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 10}, m: 0, s: 27.5}, 1)
        tl.linear(stars2.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 20}, m: 0, s: 28})
        tl.linear(stars3.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 30}, m: 0, s: 28.5})
        tl.linear(stars4.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 40}, m: 0, s: 29})
        tl.linear(stars5.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 50}, m: 0, s: 29.5})
        
        tl.linear(stars7.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 60 }, m: 0, s: 30 })
        tl.linear(stars8.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 70}, m: 0, s: 30.5})
        tl.linear(stars9.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 80}, m: 0, s: 30.5})
        tl.linear(stars10.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 90 }, m: 0, s: 30.5 })
        tl.linear(stars11.sprites, { duration: 0.2, center: { x: 0, y: cp.y + 100}, m: 0, s: 30})
        
        
        
        
        
        // gsap.to(background, {
        //     duration: 1,
        //     repeatRefresh: true,
        //     pixi: {
        //         colorize: 'purple'
        //     }
        // })
        
        
        
        

        const inc = 2
        const dur = 10000
        // tl.atom(stars1.sprites, { duration: dur, radiusX: 200, radiusY: 300, center: cp, maxRadiusX: 300, maxRadiusY: 400, xPI: 4, xPI: 9}, 2)
        // tl.atom(stars2.sprites, { duration: dur, radiusX: 300, radiusY: 200, center: cp, maxRadiusX: 400, maxRadiusY: 300, xPI: 5, xPI: 8}, 2)
        // tl.atom(stars3.sprites, { duration: dur, radiusX: 200, radiusY: 300, center: cp, maxRadiusX: 300, maxRadiusY: 400, xPI: 6, xPI: 7}, 2)
        // tl.atom(stars4.sprites, { duration: dur, radiusX: 300, radiusY: 200, center: cp, maxRadiusX: 400, maxRadiusY: 300, xPI: 7, xPI: 6}, 2)
        // tl.atom(stars5.sprites, { duration: dur, radiusX: 200, radiusY: 300, center: cp, maxRadiusX: 300, maxRadiusY: 400, xPI: 8, xPI: 5}, 2)
        // tl.atom(stars6.sprites, { duration: dur, radiusX: 300, radiusY: 200, center: cp, maxRadiusX: 400, maxRadiusY: 300, xPI: 9, xPI: 4}, 2)

        // const startPoint = {
        //     x: 0,
        //     y: cp.y
        // }
        // let off = 1
        // const PI = 3.14159265
        // gsap.to(stars1.sprites, {
        //     pixi: {
        //         ...startPoint
        //     }
        // })
        
        // const path = () => {
        //     let dir = 1
        //     return [...Array(15)].map((a, i) => {
        //         dir *= -1
        //         return {
        //             x: 0 + i * 100,
        //             y: cp.y + 100 * dir
        //         }
        //     })
        // }
        // gsap.set(stars1.sprites, {
        //     duration: 0,
        //     delay: 1,
        //     repeatRefresh: true,
        //     //stagger: {amount: 0},
        //     motionPath: {
        //         path: path(),
        //         curviness: 2,
        //         end: function (i) {
        //             const l = 1 / stars1.amount 
        //             return 1 - i * l 
        //         }
        //         //alignOrigin: [0.5, 0.5],
        //         //autoRotate: true
        //     },
        //     // pixi: {
        //     //     x: function (i) {
        //     //         const f = startPoint.y + 100 * off * Math.cos((i + off) * PI * 2 / stars1.amount)
        //     //         return f
        //     //     },
        //     //     y: function (i) {
        //     //         const f = startPoint.x + 100 * Math.sin((i + off) * PI * 2 / stars1.amount)
        //     //         return f
        //     //     },
        //     // }
        // })

        // //galaxy
        // const _2PI = 2 * Math.PI;
        // const PI = Math.PI;
        // let Rx = 270
        // let Ry = 100
        // let off = 0
        // let xPI = Math.PI * 1 
        // let yPI = Math.PI * 1
        
        // tl.to(stars1.sprites, {
        //     ease: 'none',
        //     repeat: -1,
            
        //     onRepeat: function () {
        //         //xPI += 1.1
        //         //yPI += 1.1
        //         //Rx += 1.1
        //         //Ry *= 1
        //     },
            
        //     onUpdate: function () {
        //         off += 0.0003
        //         gsap.to(stars1.sprites, {
        //             duration: 1,
        //             ease: 'none',
        //             pixi: {
        //                 x: function (i) {
        //                     const f = (w / 2) + Rx * Math.sin((i + off ) * (_2PI * i * off  / stars1.amount))
        //                     return f
        //                 },
        //                 y: function (i) {
        //                     const f = (h / 2) + Ry * Math.cos((i + off ) * (_2PI * i  * off / stars1.amount))
        //                     return f
        //                 },
        //                 //colorize: randomRGB,
        //                 //brightness: gsap.utils.random(1, 3, .1, true),
        //             },
        //         })
        //     },
        //     repeatRefresh: true,
        //     paused:true
        // }, 0)

        

        //falling
        // const step = (2 * Math.PI) / stars1.amount
        // const i = gsap.utils.random(0, stars1.amount, 1, true)
      
        // gsap.fromTo(stars1.sprites, {
        //     pixi: () => {
        //         const _i = i()
        //         return {
        //         x: function () {
        //             return globalX + circleRadius * Math.cos(_i * step)
        //         },
        //         y: function () { return globalY + circleRadius * Math.sin(_i * step) },
        //         //alpha: 1,
                
        //         //scale: gsap.utils.random(.01, .08, .001, true),
        //     }}
        // },
        //     {
        //     ease: 'circle',
        //     duration: gsap.utils.random(1, 5, .01, true),
        //         pixi: {
        //             y: function() {return `+=${gsap.utils.random(50, 150, 1)}`},
        //             //colorize: gsap.utils.random(['yellow', 'orange', 'white'], true),
        //             //brightness: gsap.utils.random(0.9, 1.1, .1, true),
        //             //alpha: 0,
        //         },
        //     stagger: {
        //         each: .01,
        //         from: 'random',
        //         repeat: -1,
        //         repeatRefresh: true,
               
        //         },
        //     paused: true
        // })
        
        const tl2 = gsap.timeline()
        
        
        
        //reflection wavyness
        gsap.to(reflect, {
            time: 100,
            duration: 30,
            ease: 'circle',
            repeat: -1,
            }
        )
        //waves
        gsap.to(waveFilter, {
            time: 10,
            duration: gsap.utils.random(5, 10, .1),
            ease: 'power1.InOut',
            repeat: -1,
            paused:true,
            }
        )

        //Glowing
        gsap.to(glowFilter, {
            //distance: 1,
            ease: 'sine',
            innerStrength: 5,
            duration: 2,
            yoyo: true,
            repeat: -1,
            paused: true
        })

        
        

        const norm0100 = gsap.utils.mapRange(0,1,0, 200)
        // gsap.to(_stars1, {
        //     duration: 5,
        //     onUpdate: function () {
        //         circle.clear()
        //         circle.beginFill(0xDE3249, 1);
        //         circle.drawCircle(w / 2 + Math.round(norm0100(this.progress())), h / 2, 300)
        //         circle.endFill();        
        //         //circle.moveTo(w  / 2 + this.progress(), h / 2 +  this.progress())
        //     },
        //     repeat: -1,
        //     yoyo: true,
        //     pixi: {
        //         x: '+=200',
        //     }
        // })

        app.stage.on('pointermove', onDragMove);
        app.stage.on('click', onClick);
        app.stage.interactive = true
        function onDragMove(e) {
            const { x, y } = e.data.global
            globalX = x;
            globalY = y;
            updateCircle()
            updateFilters()
        }
        
        function updateFilters() {
            //customFilter.uniforms.mouse = [globalX, globalX]
            waveFilter.center = [globalX, globalY]
        }

        function updateCircle() {
            return
            circle.clear()
            circle.beginFill(0xDE3249, 1);
            circle.drawCircle(globalX, globalY, circleRadius)
            circle.endFill();
        }

        //vaiven
        let direction = 1
        const vaiven = gsap.to(globals, {
            duration: 15,
            repeat: -1, yoyo: true,
            ease: 'circle',
            onUpdate: function () {
                if (circleRadius === 200) direction = -1
                if (circleRadius === 150) direction = 1
                circleRadius = circleRadius + 1 * direction
                updateCircle()
            },
            paused: true,
        })

        const mousePoint = () => {
            return {x: globalX, y: globalY}
        }

        //expand
        let scene = 1

        function onClick(e) {
            const tl = new gsap.timeline().timeScale(3)
            const rndH = gsap.utils.random(10, 150, 1, true)
            tl.wave(stars1.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars2.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars3.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars4.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars5.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars7.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars8.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars9.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars10.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            tl.wave(stars11.sprites, { each: 0.123, from:'end', height: rndH(), repeat: 0},0)
            //console.log(globalX / w, globalY / h)
            // gsap.effects.arrangeSpiral(stars1.sprites, {
            //     ease: 'none',
            //     modifX: globalX / w,
            //     modifY: globalY / h,
            //     duration: 1,
            //     center: mousePoint()
            // })
            // gsap.effects.linear(stars1.sprites, {
            //     m:  gsap.utils.random(0, 1, .1),
            //     s: 15,
            //     center: mousePoint(),
            //     duration: 1,
            //     onStart: function (i) {
            //         gsap.to(stars1.sprites, {
            //             delay: .1,
            //             duration: 0.6,
            //             ease: 'linear',
            //             pixi: {
            //                 y: function() {return `+=${gsap.utils.random(50, 300, 1)}`} ,
            //                 //brightness: 0,
            //                 //colorize: effects.randomRGB
            //             },
            //             stagger: {
            //                 repeat: -1,
            //                 amount: 0.6,
            //                 from: 'start'
            //             }
            //         })
            //     }
            // })        
                
            
            return
            vaiven.pause()
            gsap.to(globals, {
            circleRadius: 50000,
            duration: 2,
            ease: 'expo',
                onUpdate: function () {
                    circleRadius = circleRadius + 100 * this.progress()
                    updateCircle()
                },
                onComplete: function () {
                    circleRadius = 0
                    updateCircle()
                    let entering, leaving
                    entering = scene === 1 ? desert : background
                    leaving = scene === 1 ? background : desert

                    app.stage.addChildAt(entering, 0)
                    entering.anchor.set(0, 0)
                    leaving.anchor.set(0.5)
                    circleCont.removeChild(entering)
                    circleCont.addChildAt(leaving,0)
                    // app.stage.addChildAt(desert, 0)
                    // desert.anchor.set(0, 0)
                    // background.anchor.set(0.5)
                    // circleCont.removeChild(desert)
                    // circleCont.addChildAt(background,0)
                    scene = scene === 1 ? 2 : 1
                    gsap.to(globals, {
                        duration: 2,
                        ease: 'expo',
                        onUpdate: function () {
                            circleRadius = circleRadius + 4 * this.progress()
                            updateCircle()
                        },
                        
                    })
                }
            })
        }
        // gsap.to(_stars1, {
        //     pixi: {
        //         brightness: gsap.utils.random(1, 3, .1, true),
        //     },
        //     stagger: {
        //         amount: 1,
        //         repeat: -1,
        //     },
        //     ease: 'elastic',
        //     duration: gsap.utils.random(0, .5, .1, true),
        //     repeatRefresh: true,
        //     repeat: -1,
        //     yoyo: true
        // })
        // gsap.to(filter, {
        //     startAt: {
        //         brightness: .1
        //     },
        //     stagger: .1,
        //     ease: 'elastic',
        //     brightness: 3,
        //     duration: 1,
        //     repeat: -1,
        //     yoyo: true
        // })
    //     let count = 0;
    // app.ticker.add((delta) => {
    //     count += 0.1;
    //     filter.brightness(count)
    //     if (count >= 1) {
    //         count = 0
    //     }
    //     // const { matrix } = filter;

    //     // matrix[1] = Math.sin(count) * 3;
    //     // matrix[2] = Math.cos(count);
    //     // matrix[3] = Math.cos(count) * 1.5;
    //     // matrix[4] = Math.sin(count / 3) * 2;
    //     // matrix[5] = Math.sin(count / 2);
    //     // matrix[6] = Math.sin(count / 4);
    // });

       
    }, []);
  return <></>;
}