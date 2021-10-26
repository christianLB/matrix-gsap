export const fragment = `
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 vTextureCoord;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform sampler2D uSampler;

#define HASHSCALE1 .1031

//From Dave_Hoskins (https://www.shadertoy.com/view/4djSRW)
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

// Convert Noise2d() into a "star field" by stomping everthing below fThreshhold to zero.
float NoisyStarField( in vec2 vSamplePos, float fThreshhold )
{
    float StarVal = hash12( vSamplePos );
    if ( StarVal >= fThreshhold )
        StarVal = pow( (StarVal - fThreshhold)/(1.0 - fThreshhold), 6.0 );
    else
        StarVal = 0.0;
    return StarVal;
}

// Stabilize NoisyStarField() by only sampling at integer values.
float StableStarField( in vec2 vSamplePos, float fThreshhold )
{
    // Linear interpolation between four samples.
    // Note: This approach has some visual artifacts.
    // There must be a better way to "anti alias" the star field.
    float fractX = fract( vSamplePos.x );
    float fractY = fract( vSamplePos.y );
    vec2 floorSample = floor( vSamplePos );    
    float v1 = NoisyStarField( floorSample, fThreshhold );
    float v2 = NoisyStarField( floorSample + vec2( 0.0, 1.0 ), fThreshhold );
    float v3 = NoisyStarField( floorSample + vec2( 1.0, 0.0 ), fThreshhold );
    float v4 = NoisyStarField( floorSample + vec2( 1.0, 1.0 ), fThreshhold );

    float StarVal =   v1 * ( 1.0 - fractX ) * ( 1.0 - fractY )
        			+ v2 * ( 1.0 - fractX ) * fractY
        			+ v3 * fractX * ( 1.0 - fractY )
        			+ v4 * fractX * fractY;
	return StarVal;
}

void main( void )
{
	// Sky Background Color
	vec3 vColor = vec3( 0.1, 0.2, 0.4 ) * gl_FragCoord.y / dimensions.y;

    // Note: Choose fThreshhold in the range [0.99, 0.9999].
    // Higher values (i.e., closer to one) yield a sparser starfield.
    float StarFieldThreshhold = 0.97;

    // Stars with a slow spin.
    float fSpinRate = 0.001;
    vec2 vInputPos = ( 2.0 * gl_FragCoord.xy/dimensions.y ) - vec2( 1.0, 1.0 );
    float fSampleAngle = fSpinRate * float( time * 10.0 ) + atan( vInputPos.y, vInputPos.x );
    vec2 vSamplePos = ( 0.5 * length( vInputPos ) * vec2( cos( fSampleAngle ), sin( fSampleAngle ) ) + vec2( 0.5, 0.5 ) ) * dimensions.y;
    float StarVal = StableStarField( vSamplePos, StarFieldThreshhold );
    vColor += vec3( StarVal );
	
	gl_FragColor = vec4(vColor, 1.0);
}`