precision mediump float;

varying vec2 vTexCoord;
uniform float uAspectRatio;
uniform float uNoiseScale;
uniform float uNoiseSeed;

// Here you can see the implementation behind the noise function of p5 ;)
// We have to reimplement it because we are not in p5 anymore. Shaders are written in their own language called glsl and they don't have a built-in noise function.
// Based on https://github.com/yiwenl/glsl-fbm/blob/master/2d.glsl
#define NUM_OCTAVES 1

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p + 100.);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}
void main() {
    vec2 uv = vTexCoord;
    uv.x *= uAspectRatio;
    uv.y = 1. - uv.y;
    
    gl_FragColor = vec4(vec3(noise(uv * uNoiseScale + 10. * uNoiseSeed)), 0.5);
}