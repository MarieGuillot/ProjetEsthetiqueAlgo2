precision mediump float;

varying vec2 vTexCoord;
uniform float uAspectRatio;
uniform float uNoiseScale;
uniform float uNoiseSeed;

// Here you can see the implementation behind the noise function of p5 ;)
// We have to reimplement it because we are not in p5 anymore. Shaders are written in their own language called glsl and they don't have a built-in noise function.
// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd

// Golden white noise thanks to https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
#define PHI 1.61803398874989484820459
float random (in vec2 st) {
    return fract(tan(distance(st*PHI, st)*uNoiseSeed)*st.x);
}
// Perlin noise
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
// Fractal noise
#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    vec2 uv = vTexCoord;
    uv.x *= uAspectRatio;
    uv.y = 1. - uv.y;
    
    gl_FragColor = vec4(vec3(fbm((uv+0.5) * uNoiseScale)), 0.6);
}