import gsap from 'gsap';


export const random0255 = () => gsap.utils.random(0, 255, 1)
export const randomRGB = () => `rgb(${random0255()}, ${random0255()}, ${random0255()})`
export const randomFrom = gsap.utils.random(['center', 'edges', 'end', 'random', 'start'], true)
export const randomEase = gsap.utils.random(['expo', 'linear', 'sine', 'power1', 'power2', 'circ', 'elastic', 'bounce'], true)
const PI = Math.PI
const _2PI = 2 * PI
//a function that sums two numbers


//gsap effect to make elements arrange in spiral
gsap.registerEffect({ name: 'arrangeSpiral' 
    , effect: (target, config) => {
        
        const {
            direction = 'clockwise',
            radius = 100,
            angle = 0,
            center,
            modifX,
            modifY,
        } = config;
        const deg = direction === 'clockwise' ? angle : -angle;
        const rad = deg //* Math.PI / 1;
        let offset = 0
        let offx = 0.5
        let offy = 0.5
        return gsap.to(target, {
            ease: 'linear',
            repeat: -1,
            duration: 0.5,
            repeatRefresh: true,
            pixi: {
                x: function (i) {
                    //let modifX =  0.7
                    const a = Math.cos(i * offset + offset * modifX ) 
                    return center.x + a * radius 
                },
                y: function (i) {
                    //let modifY = 4420.31
                    const a = Math.sin(i * offset + offset * modifY) 
                    return center.y + a * radius 
                },
                colorize: randomRGB,
                rotation: deg,
            },
            onRepeat: function() {
                offset += 0.1
            }
        }).timeScale(1).seek(0.5);
    }
});

gsap.registerEffect({
    name: 'arrangeGrid',
    effect: (targets, config) => {
        const { columns, duration, ease, stagger, center, delay, repeatDelay } = config
        const rows = Math.floor(targets.length / columns)
        return gsap.to(targets, {
            ease,
            stagger,
            delay,
            repeatDelay,
            duration,
            pixi: {
                y: function (i, tg) { return center.x + i % columns * tg.height },
                x: function (i, tg) { return center.y + Math.floor(i / columns) * tg.width }
            }
        });
    },
    defaults: { columns: 10, stagger: 0, delay: 0, repeatDelay: 0, duration: 0, ease: 'linear', center:{x:0, y:0}},
    extendTimeline: true
})


gsap.registerEffect({
    name: "arrangeRow",
    effect: (targets, config) => {
        const { stagger, ease, duration, offset, center, rowIndex } = config
        const step = (2 * Math.PI) / targets.length
        return gsap.to(targets, {
            ease,
            stagger,
            duration,
            pixi: {
                x: function (i, tg) { return i * tg.width },
                y: function (i, tg) { return center.y + rowIndex * tg.height }
            }
        });
    },
    defaults: { duration: 1, stagger: 0, rowIndex: 0, center: { x:0, y:0 }},
    extendTimeline: true
});


gsap.registerEffect({
    name: "arrangeCircle",
    effect: (targets, config) => {
        const { stagger, ease, duration, offset, center, radiusX, radiusY } = config
        const step = (2 * Math.PI) / targets.length
        return gsap.to(targets, {
            ease,
            stagger,
            duration,
            pixi: {
                x: function (i) {
                    return center.x + radiusX * Math.cos((i + offset) * step)
                },
                y: function (i) {
                    return center.y + radiusY * Math.sin((i + offset) * step)
                }
            }
        });
    },
    defaults: { duration: 1, stagger: 0, radiusX: 0, radiusY: 0, offset: 0, center: { x: 0, y: 0 } },
    extendTimeline: true
});

gsap.registerEffect({
    name: "linear",
    effect: (targets, config) => {
        const { m, s, duration, onStart, center, ease, grid, axis, repeat, from } = config
        return gsap.to(targets, {
            ease: 'power1',
            duration,
            startAt: {
                pixi: {
                    ...center,
                    brightness: 1,
                }
            },
            pixi: {
                x: function (i) {
                    return Math.abs(center.x + m + s * i)
                },
                y: function (i) {
                    return Math.abs(i * -m + center.y)
                }
            },
            onStart
        })
    },
    defaults: { duration: 1, repeat: -1, grid: null, from: 0, stagger: 0, axis: null, offset: 0, center: { x: 0, y: 0 }, ease: 'linear', m: 0, s: 0, onStart: null },
    extendTimeline: true
});

gsap.registerEffect({
    name: "wave",
    effect: (targets, config) => {
        const { duration, each, height, amount, ease, grid, axis, repeat, from } = config
        const y0 = targets[0].position.y
        const colorize =  randomRGB()
        return gsap.to(targets,
            {
                stagger: {
                    each,
                    //amount,
                    repeat: 1,
                    repeatRefresh: true,
                    from,
                    grid,
                    axis,
                    yoyo: true,
                },
                ease: 'sine.In',
                duration: duration,
                repeat,
                pixi: {
                    y: function (i) {
                        const r = y0 - this.targets()[0].position.y
                        return `-=${height - r}`
                    },
                   colorize
                },
            })
    },
    defaults: {duration: 1, height: 0, repeat: -1, each: null, amount: null, grid: null, from: 0, stagger: 0, axis: null, offset: 0, center: { x: 0, y: 0 }, ease:'linear' },
    extendTimeline: true
});

gsap.registerEffect({
    name: "blinkStagger",
    effect: (targets, config) => {
        const { duration, ease, grid, axis, repeat, from } = config
        return gsap.to(targets,
            {
                stagger: {
                    each: duration,
                    repeat: 1,
                    from,
                    grid,
                    axis,
                    yoyo: true,
                },
                ease,
                duration: duration,
                repeat,
                pixi: { brightness: 3 },
            })
    },
    defaults: { duration: 1, repeat: -1, grid: null, from: 0, stagger: 0, axis: null, offset: 0, center: { x: 0, y: 0 }, ease:'linear' },
    extendTimeline: true
});

gsap.registerEffect({
    name: "atom",
    effect: (targets, config) => {
        const PI = Math.PI
        const _2PI = PI * 2
        const step = _2PI / targets.length
        const { stagger, ease, duration, center, xPI, yPI } = config
        let { radiusX, radiusY, offset } = config
        let { maxRadiusX = radiusX, maxRadiusY = radiusY } = config
        let dirX = 1
        let dirY = -1
        const tl = gsap.timeline()
        return tl.to(targets, {
            repeat: -1,
            repeatRefresh: true,
            ease,
            //stagger,
            duration,
            onRepeat: function () {
                offset += 1
            },
            onUpdate: function () {
                if (radiusX >= maxRadiusX || radiusX <= -maxRadiusX) {
                    dirX *= -1
                }
                if (radiusY >= maxRadiusY || radiusY <= -maxRadiusY) {
                    dirY *= -1
                }
                
                radiusX += PI * xPI * dirX
                radiusY -= PI * yPI * dirY

                gsap.to(targets, {
                    duration: 1,
                    ease: 'none',
                    pixi: {
                        x: function (i) {
                            const f = center.x + radiusX * Math.sin((i + offset) * step)
                            return f
                        },
                        y: function (i) {
                            const f = center.y + radiusY * Math.cos((i + offset) * step)
                            return f
                        },
                    },
                })
            },
        });
    },
    defaults: { duration: 1, stagger: 0, radiusX: 0, radiusY: 0, offset: 0, xPI: 3, yPI: 5, center: { x: 0, y: 0 } },
    extendTimeline: true
});



export const rotateCenter = (config) => {
    const { targets, duration = 1, radiusX, radiusY, offset = 0, center = { x: 0, y: 0 } } = config
    const step = (2 * Math.PI) / targets.length
 
    gsap.to(targets, {
        duration,
        ease: "linear",
        repeatRefresh: true,
        onUpdate: function (o) {
            
            const t = this.progress()
            gsap.set(targets, {
                pixi: {
                    x: function (i, tg) {
                        return center.x + radiusX * Math.cos((i + offset + t) * step)
                    },
                    y: function (i) {
                        return center.y + radiusY * Math.sin((i + offset + t) * step)
                    },
                    rotation: function (i, tg) {
                        return Math.atan2(tg.y, tg.x)
                    },
                },
            })
        },
        onComplete: () => {
            rotateCenter({...config, offset: offset + 1})
        }
    })
}