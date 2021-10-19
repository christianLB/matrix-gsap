import gsap from 'gsap';
import { chunk } from 'lodash'

export const random0255 = () => gsap.utils.random(0, 255, 1)
export const randomRGB = () => `rgb(${random0255()}, ${random0255()}, ${random0255()})`

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