// Organic Background Fragment Shader
// Harmonia color palette with flowing gradients

uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorDark;
uniform float u_phase;
uniform float u_intensity;

varying vec2 vUv;
varying float vElevation;
varying float vDistortion;

// Simplex 2D noise for fragment effects
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise2D(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(vec4(i, i + 1.0, i + 1.0)).xy;
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Base gradient from dark to slightly lighter
  vec3 baseColor = mix(u_colorDark, u_colorDark * 1.3, vUv.y);

  // Organic flowing pattern
  float pattern = snoise2D(vUv * 3.0 + u_time * 0.1);
  float pattern2 = snoise2D(vUv * 6.0 - u_time * 0.15) * 0.5;
  float combinedPattern = pattern + pattern2;

  // Color based on elevation and pattern
  float colorMix = (vElevation + 0.5) * 0.5 + combinedPattern * 0.2;
  colorMix = clamp(colorMix, 0.0, 1.0);

  // Three-way color blend: dark -> maroon -> gold
  vec3 gradientColor;
  if (colorMix < 0.5) {
    gradientColor = mix(u_colorDark * 1.2, u_colorMaroon, colorMix * 2.0);
  } else {
    gradientColor = mix(u_colorMaroon, u_colorGold, (colorMix - 0.5) * 2.0);
  }

  // Add champagne highlights on peaks
  float highlight = smoothstep(0.3, 0.6, vElevation);
  gradientColor = mix(gradientColor, u_colorChampagne, highlight * 0.3);

  // Subtle vein-like patterns
  float veins = abs(snoise2D(vUv * 15.0 + vec2(u_time * 0.05, 0.0)));
  veins = smoothstep(0.4, 0.5, veins);
  gradientColor = mix(gradientColor, u_colorGold * 0.5, veins * 0.15);

  // Ambient pulsing glow
  float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
  float glow = smoothstep(0.2, 0.5, vElevation) * pulse * 0.2;
  gradientColor += u_colorGold * glow;

  // Edge darkening (vignette effect)
  float vignette = 1.0 - length(vUv - 0.5) * 0.8;
  vignette = smoothstep(0.0, 1.0, vignette);

  // Apply intensity and vignette
  vec3 finalColor = mix(u_colorDark, gradientColor, u_intensity);
  finalColor *= vignette;

  // Subtle film grain for organic texture
  float grain = snoise2D(vUv * 500.0 + u_time * 10.0) * 0.02;
  finalColor += grain;

  gl_FragColor = vec4(finalColor, 1.0);
}
