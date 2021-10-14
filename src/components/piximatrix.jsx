
// pixi.tsx
import React, { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import gsap from 'gsap'
import { PixiPlugin } from "gsap/PixiPlugin"
import test from '../spark3.png'
import space from '../space.jpg'
import desertImage from '../desert.jpg'
import { random } from "gsap/gsap-core"
import { rotateCenter, arrangeGrid, randomRGB, arrangeRow, arrangeCircle } from './gsapeffects'
import {chunk, flatten} from 'lodash'
import { shuffle } from "gsap/src/all"
import { GlowFilter } from '@pixi/filter-glow';
import { ReflectionFilter } from '@pixi/filter-reflection'
import { Layer, Stage } from '@pixi/layers'
import { ShockwaveFilter } from "@pixi/filter-shockwave"
import {fragment, vertex} from './frag'

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
        
        const w = window.innerWidth
        const h = window.innerHeight
        let globalX = w / 2
        let globalY = h / 2
        let app = new PIXI.Application({ width: w, height: h });
        document.querySelector('#root').appendChild(app.view)
        
        const globals = {
            circleRadius: 150
        }

        let { circleRadius } = globals
        //custom filter 
        // Build the filter customFilter
        const customFilter = new PIXI.Filter(vertex, fragment, {
            time: 0.5,
            mouse: [globalX, globalY],
            dimensions: [w, h],
        });
        //background///////////////////////////////////////////////////////
        const background = PIXI.Sprite.from(space);
        background.width = w;
        background.height = h;

        //filters 
        const waveFilter = new ShockwaveFilter([w / 2, h / 2], {radius: 250}, 0)

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
        trailSprite.alpha = .6;


        app.stage.addChild(background);
        layer.addChild(trailSprite);
        
        //reflection
        const reflect = new ReflectionFilter()
        reflect.boundary = 0.7
        reflect.alpha = [1, 0]
        layer.filters = [reflect]
        
        background.filters = [reflect, customFilter]
        app.stage.addChild(layer);
        const showLayer = new PIXI.Sprite(layer.getRenderTexture());
        app.stage.addChild(showLayer);
        const sample = 'abcdegghijklmnopqrstuvwxyz'.split('')
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
        layer.addChild(circleCont)
        const glowFilter = new GlowFilter({ distance: 15, innerStrength: 15 })
        
        circleCont.filters = [glowFilter]
        desert.filters  = [waveFilter]
        ////////////////////////////////////////////////////////////////////////////////////////////////
        
        const orb = () => {
            //const filter = new PIXI.filters.ColorMatrixFilter();
            let obj = PIXI.Sprite.from(test);
            //customFilter.padding = 0.5
            const size = 70
            customFilter.uniforms.dimensions = [size, size]
            obj.width = size
            obj.height = size
            obj.anchor.set(0.5);
            obj.filters = [customFilter];
            //app.stage.addChild(obj);
            layer.addChild(obj)
            return obj
        }

        const orbs = ({ amount }) => {
            const arr = []
            for (let i = 0; i < amount; i++) {
                const o = orb()
                arr.push(o)
                //app.stage.addChild(l)
            }
            return arr
        }

        const tilesX = 35
        const tilesY = 5
        const cols = [...Array(tilesX)].map(() => {
            return orbs({amount: tilesY})
        })
        const allTiles = flatten(cols);
        const centerPoint = () => {
            return { x: w / 2, y: h / 2 }
        }
        
        //const tl = gsap.timeline({repeat: -1, yoyo: true})
        //rotateCenter({ targets: letters4, radiusX: 400, radiusY: 100, duration: .3, offset: 0, center: { x: w / 2, y: h / 2 + 10 } })
        //rotateCenter({targets: letters5, radiusX:300, radiusY: 75, duration:.3, offset:0, center: { x: w / 2, y: h / 2 + 30 }})
        //tl.arrangeCircle(letters6, { duration: .5, stagger: 0, radiusX:400, radiusY: 800, offset:0, center: centerPoint()})
        //tl.arrangeCircle(orbs160, { duration: 0, stagger: 0, radiusX:300, radiusY: 300, offset:0, center: centerPoint()})
        //tl.arrangeCircle(orbs160, { duration: 5, stagger: 0, radiusX:400, radiusY: 400, offset:0, center: centerPoint()})
        //gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'start' })
        //gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'end' })
        // gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'top', axis:'y' })
        // gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'bottom', axis:'x' })
        // gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'start'})
        // gsap.effects.blinkStagger(orbsa, { grid: [tilesX, tilesY], repeat: -1, duration: .2, from:'end'})
            
        shuffle(cols).slice(0, tilesX).forEach(col => {
            const randomDelay = gsap.utils.random(1, 5, 1, true)
            const randomStagger = gsap.utils.random(3, 20, .5, true)
            gsap.to(col, {
                stagger: {
                    amount: randomStagger(),
                    repeat: 1,
                    yoyo: true
                },
                delay: randomDelay(),
                repeatDelay: randomDelay(),
                repeatRefresh: true,
                //pixi: {brightness: 3 },
                pixi: {tint: randomRGB() },
                repeat: -1,
            })
        })
        const randomAlpha = gsap.utils.random(.1, 5, .01, true)
        const randomDuration = gsap.utils.random(.1, .3, .1, true)
        // gsap.set(allTiles, {
        //     pixi:{x:300, y: 300}
        // })
        // gsap.set(allTiles, {
        //     pixi: {
        //         //scale: gsap.utils.random(.2, 13.15, .1, true),
        //         tint: gsap.utils.random(['red', 'green', 'yellow', 'orange', 'violet', 'lime', 'magenta'], true)
        //     },
        // })
        const tl = gsap.timeline()
        // tl.arrangeCircle(allTiles, { duration: 12, stagger: .01, radiusX: 200, radiusY: 200, offset: 0, center: centerPoint() })
        // tl.arrangeCircle(allTiles, { duration: 10, stagger: 0, radiusX: 800, radiusY: 100, offset: 0, center: centerPoint() })
        // tl.arrangeCircle(allTiles, { duration: 12, stagger: 0, radiusX: 10, radiusY: 10, offset: 0, center: centerPoint() })
        // tl.arrangeGrid(allTiles, { duration: 15, columns: tilesY})
        // tl.arrangeCircle(allTiles, { duration: 15, stagger: 0, radiusX: 300, radiusY: 300, offset: 0, center: centerPoint() })
        const _2PI = 2 * Math.PI;
        const PI = Math.PI;
        let off = 0;
        tl.to(allTiles, {
            duration: 0.1,
            ease: 'linear',
            repeat: -1,
            onRepeat: function () {
                off++
            },
            // stagger: {
            //     amount: 2,
            //     repeat: -1,
            // },
            repeatRefresh: true,
            
            pixi: {
                // x: function () { return gsap.utils.random(0, w, 1)},
                // y: function () { return gsap.utils.random(0, h, 1) },
                x: function (i) {
                    return (w / 2) + 300 * Math.sin((i + off) * (_2PI / allTiles.length))
                },
                y: function (i) {
                    return (h / 2) + 90 * Math.cos((i + off) * (PI / allTiles.length))
                },
                colorize: randomRGB,
                brightness: gsap.utils.random(1, 2, .1, true),
            },
            //paused:true
        })

        //falling
        const step = (2 * Math.PI) / allTiles.length
        const i = gsap.utils.random(0, allTiles.length, 1, true)
      
        gsap.fromTo(allTiles, {
            pixi: () => {
                const _i = i()
                return {
                x: function () {
                    return globalX + circleRadius * Math.cos(_i * step)
                },
                y: function () { return globalY + circleRadius * Math.sin(_i * step) },
                //alpha: 1,
                
                //scale: gsap.utils.random(.01, .08, .001, true),
            }}
        },
            {
            ease: 'circle',
            duration: gsap.utils.random(0.5, 1, .01, true),
                pixi: {
                    y: `+=20`,
                    colorize: gsap.utils.random(['yellow', 'orange', 'white'], true),
                    brightness: gsap.utils.random(1, 1.5, .1, true),
                    //alpha: 0,
                },
            stagger: {
                each: .01,
                from: 'random',
                repeat: -1,
                repeatRefresh: true,
               
                },
            paused: true
        })
        
        const tl2 = gsap.timeline()
        
        //blinking
        tl2.to(allTiles, {
            pixi: {
                brightness: gsap.utils.random(1, 1, .1, true),
            },
            //stagger: {amount: 5, repeat: -1, from:'random'},
            //ease: 'elastic',
            //yoyo: true,
            //duration: .1,//gsap.utils.random(.1, 1, 1, true),
            //repeat: -1,
            repeatRefresh: true,
            //paused: true
        },0)
        
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
            time: 0.2,
            duration: gsap.utils.random(5, 10, .1),
            ease: 'linear',
            yoyo: true,
            repeat: -1,
            }
        )

        //Glowing
        gsap.to(glowFilter, {
            //distance: 1,
            ease: 'sine',
            innerStrength: 5,
            duration: 2,
            yoyo: true,
            repeat: -1
        })

        
        

        const norm0100 = gsap.utils.mapRange(0,1,0, 200)
        // gsap.to(allTiles, {
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
            customFilter.uniforms.mouse = [globalX, globalX]
            waveFilter.center = [globalX, globalY]
        }

        function updateCircle() {
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

        gsap.to(customFilter.uniforms, {
            duration: 1,
            time: 5.0,
            ease: 'linear',
            rotation: gsap.utils.random(1, 360,1, true),
            repeat: -1,
            //paused:true
        })

        //expand
        let scene = 1
        function onClick(e) {
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
        // gsap.to(allTiles, {
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