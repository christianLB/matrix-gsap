export const fragment = `
precision mediump float;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 vTextureCoord;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform sampler2D uSampler;

vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom;

    // Here is where the offset is happening
    _st.x += step(1., mod(_st.y,2.0)) * .5;

    return fract(_st);
}

float box(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
    uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
    return uv.x*uv.y;
}

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c,-s,s,c);
}

float Star(vec2 uv, float a, float sparkle) {
    vec2 av1 = abs(uv);
    vec2 av2 = abs(uv*Rot(a));
    vec2 av = min(av1, av2);

    vec3 col = vec3(0);
    float d = length(uv);
    float star = av1.x*av1.y;
    star = max(av1.x*av1.y, av2.x*av2.y);
    star = max(0., 1.0-star*1e3);

    float m = min(5., 1e-2/d);

    return m+pow(star, 4.)*sparkle;
}


float dist(vec2 p0, vec2 pf){return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));}

void main( void ) {

    vec2 pixelCoord = vTextureCoord * filterArea.xy;
    vec2 st = gl_FragCoord.xy / dimensions;
    float PI = 3.1415926535;
    float pct = 0.0;

    // a. The DISTANCE from the pixel to the center
    pct = distance(st,vec2(0.5));

    float sin_t = sin(time);
    float cos_t = cos(time);

    vec3 color = vec3(1.0);

    // Apply the brick tiling
    //st = brickTile(st,10.0);

    //color = vec3(box(st,vec2(0.970,0.970)));
    float speed = 2.0;
    color = vec3(
        Star(
            st - 0.5,
            0.5 + sin(time * PI * speed),
            0.9 + sin(time * PI * speed)
        )
    );

    vec4 cola = vec4(color.rgb, 0.0);
    vec4 colb = vec4(color.rgb, 0.1);

    if (pct > 0.48) 
        pct = 0.0;
    
    vec4 colfin = mix(
        cola,
        colb,
        smoothstep(0.0, 0.01, pct) * smoothstep(0.5, 0.0, pct)
    );
    gl_FragColor = vec4(colfin);
}`

export const vertex = null