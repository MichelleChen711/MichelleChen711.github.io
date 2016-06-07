

     // IMPLEMENT A VECTOR NORMALIZE FUNCTION IN JAVASCRIPT.

     function normalize(vec) {
        var norm = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        for (var i = 0 ; i < 3 ; i++)
           vec[i] /= norm;
     }

     // SPECIFY HOW MANY LIGHT SOURCES FOR THE FRAGMENT SHADER TO LOOP THROUGH.

     var nLights = 2;

     // MAINTAIN AN ARRAY OF LIGHT DIRECTION VALUES.

     var lDirValues;

     // UPDATE FUNCTION IS CALLED BY THE LIBRARY BEFORE RENDERING, ONCE PER ANIMATION FRAME.

     var update = function() {

        // AT EACH ANIMATION FRAME, COMPUTE THE LIGHT DIRECTIONS.

        var x = 1;

        var lDir0 = [x,1,1];
        var lDir1 = [-1,-1,-1];

       
        normalize(lDir0);
        normalize(lDir1);

        lDirValues = [];
        lDirValues.push(lDir0[0], lDir0[1], lDir0[2]);
        lDirValues.push(lDir1[0], lDir1[1], lDir1[2]);

        sphereValues = [];

        var sphere0 = [0, 0, -3, 0.4];
        var sphere1 = [0.7 * Math.sin(time), .4, -3 + Math.cos(time), 0.13];
        

        sphereValues.push(sphere0[0], sphere0[1], sphere0[2], sphere0[3]);
        sphereValues.push(sphere1[0], sphere1[1], sphere1[2], sphere1[3]);
        //sphereValues.push(sphere2[0], sphere2[1], sphere2[2], sphere2[3]);

        // HERE WE ARE SETTING SOME UNIFORM VARIABLES THAT THE LIBRARY DOES NOT KNOW ABOUT.

        gl.uniform3fv(uVar('uLDir')   , lDirValues); // Set light directions uniform variable.
        gl.uniform1i (uVar('uNLights'), nLights);    // Set number of lights uniform variable.
        gl.uniform4fv(uVar('uSphere'), sphereValues);
     }
  </script>

  <script id='my_vertex_shader' type='x-shader/x-vertex'>
     attribute vec3 aPosition;
     varying   vec3 vPosition;
     void main() {
        gl_Position = vec4(aPosition, 1.0);
        vPosition = aPosition;
     }
  </script>

  <script id='my_fragment_shader' type='x-shader/x-fragment'>
     precision mediump float;

     // PROCEDURAL SOLID TEXTURE PRIMITIVES: NOISE, FRACTAL AND TURBULENCE.

     vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
     vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
     vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
     vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
     vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
     float noise(vec3 P) {
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0); gx1 = fract(gx1);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;
        vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);
     }
     float fractal(vec3 P) {
        float f = 0., s = 1.;
        for (int i = 0 ; i < 9 ; i++) {
           f += noise(s * P) / s;
           s *= 2.;
           P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);
        }
        return f;
     }
     float turbulence(vec3 P) {
        float f = 0., s = 1.;
        for (int i = 0 ; i < 9 ; i++) {
           f += abs(noise(s * P)) / s;
           s *= 2.;
           P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);
        }
        return f;
     }

     uniform vec3  uCursor;
     uniform vec3  uLDir[20];  // WE ADDED THIS UNIFORM
     uniform int   uNLights;   // WE ADDED THIS UNIFORM
     uniform float uTime;
     varying vec3  vPosition;

     // NOTE: YOU SHOULD IMPLEMENT ALL THE FOLLOWING THINGS AS ARRAYS OF UNIFORM VARS.

     vec3  ambient;
     vec3  diffuse;
     vec3  lColor[2];
     vec3  specular;
     uniform vec4 uSphere[2];
     float power;

     // COMPUTE THE INTERSECTION OF A RAY WITH A SPHERE, IF ANY.

     float raySphere(vec3 V, vec3 W, vec4 sph) {
        vec3 D = V - sph.xyz;
        float b = 2. * dot(W, D);
        float c = dot(D, D) - sph.w * sph.w;
        float discr = b * b - 4. * c;
        return discr >= 0. ? (-b - sqrt(discr)) / 2. : 10000.;
     }

     // FRACTAL BUMP TEXTURE FOR EROSION

     float texture(vec3 p) {
        float t = -.6 + turbulence(p + vec3(uTime * .1, 0., 0.)) * fractal(p + vec3(0., uTime * .2, 0.));
        //float t = -.5 + turbulence(p + vec3(uTime * .1, 0., 0.));
        //float t = fractal(p);
        return .1 * min(0., t + .1);
        //return .03 * max(0., sin(10. * p.x + 10. * t));
     }

     // SOLID MARBLING TEXTURE FOR COLOR VARIATION

     float texture2(vec3 p) {
        return .5 + .5 * sin(10. * p.x + 10. * fractal(p));
     }
     float texture3(vec3 p) {
        return -.5 + turbulence(p + vec3(uTime));
     }

     vec3 shadeSphere(vec3 point, vec3 W, vec4 sphere) {
        vec3 normal = (point - sphere.xyz) / sphere.w;

        float c = cos(.3 * uTime), s = sin(.3 * uTime);
        vec3 p = vec3(c * normal.x - s * normal.z, normal.y, s * normal.x + c * normal.z);

        //vec3 shade = ambient * (1. - 10. * turbulence(5. * normal + vec3(0.,0.,uTime)));

        // COMPUTE GRADIENT OF "BUMPY" TEXTURE, THEN SUBTRACT THAT GRADIENT FROM NORMAL.

        float t0 = texture(p);
        float tx = texture(p + vec3(.01, 0., 0.));
        float ty = texture(p + vec3(0., .01, 0.));
        float tz = texture(p + vec3(0., 0., .01));

        normal = normalize(normal - vec3(tx-t0, ty-t0, tz-t0) / .01);

        float tt = 50. * t0;

        // MODULATE SPECULARITY BY EROSION TEXTURE.

        vec3 shininess = max(0., .5 + tt) * specular;

        //vec3 shade = ambient * mix(vec3(0.,0.,1.), vec3(1.,.5,0.), tt);

        // MODULATE AMBIENT COLOR BY SOLID MARBLING TEXTURE.
        vec3 shade = ambient;
        if (sphere == uSphere[0]){
           shade = ambient * mix(vec3(0.8,1.,1.), vec3(1.,1.,1.), texture2(p));
        }else{
           shade = ambient * mix(vec3(2.,0.,0.), vec3(4.,2.,0.), texture3(p));
        }

        // LOOP THROUGH THE FIRST uNlights LIGHT SOURCES.

        int shadow = 0;

        //Loop through lights
        for (int i = 0 ; i < 20 ; i++){
           if (i < uNLights) {
              shadow = 0;
              //Loop through spheres 
              
              for (int j = 0; j < 20; j++){
                 if (j < 2){
                    float shadowRay = raySphere(point + vec3(.1,.1,.1), normalize(-uLDir[i]), uSphere[j]);
                    if (shadowRay < .1){
                       shadow = 1;
                    }
                 }
              }
              
              if (shadow == 0){
                 vec3 R = 2. * dot(normal, uLDir[i]) * normal - uLDir[i];
                 shade += lColor[i] * (diffuse * max(0., dot(normal, uLDir[i])) +
                                    shininess * pow(max(0., dot(-W, R)), power));
              }

              for (int k = 0; k < 20; k++){
                 if (k < 2){
                    vec3 W_prime = 2. * dot(normal, -W) * normal - (-W);
                    float reflectionRay = raySphere(point + vec3(.1,.1,.1) * W_prime, normalize(W_prime), uSphere[k]);
                    if (reflectionRay < 10000.){
                       shade += reflectionRay * .08;
                    }
                 }
              }
              
           }
        }
        return shade;
     }

     void main(void) {

        //lColor[0] = vec3(.6,.6,1.);
        lColor[0] = vec3(.0,.3,.8);
        lColor[1] = vec3(0.,0.,0.);

        //sphere = vec4(0., 0., -3., .85);

        ambient = vec3(.1, .1, .1);
        diffuse = vec3(.2, .2, .2);
        specular = vec3(.5, .5, .5);
        power = 20.;

        // COMPUTE V AND W TO CREATE THE RAY FOR THIS PIXEL,
        // USING vPosition.x AND vPosition.y.

        vec3 V = vec3(0., 0., 0.);
        vec3 W = normalize(vec3(vPosition.xy, -3.));

        vec3 color = vec3(0.,0.,0.);         // BACKGROUND COLOR
        
        float smallest_t = 10000.;

        for(int i = 0; i < 20 ; i++) {
           if (i < 2){
              float t = raySphere(V, W, uSphere[i]);
              
              if (t < 10000.) {
                 if (t < smallest_t) {
                    smallest_t = t;
                    color = shadeSphere(V + t * W, W, uSphere[i]);
                 }
              }
           }
        }



        color = sqrt(color);                   // DO GAMMA CORRECTION.

        gl_FragColor = vec4(color, 1.);        // SET OPACITY TO 1.
     }
  </script>

  <script>
  start_gl('canvas1', document.getElementById('my_vertex_shader'  ).innerHTML,
                      document.getElementById('my_fragment_shader').innerHTML);