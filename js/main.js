import {
    trailVertexShader,
    trailFragmentShader,
    emberVertexShader,
    emberFragmentShader
} from './shaders.js';
import {
    playExplosionSound
} from './audio.js';
import {
    tornadoRadius,
    evaluateTornadoParticle,
    evaluateBreezeParticle,
    evaluateKineticParticle,
    evaluateExplosionParticle,
    evaluateTorusParticle,
    evaluateMurmurationParticle
} from './physics-math.js';
import {
    Clock,
    OrthographicCamera,
    Scene,
    WebGLRenderer,
    Points,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    NormalBlending,
    DynamicDrawUsage,
    Vector3,
    Vector2,
    Matrix4,
    MathUtils,
    CanvasTexture,
    LinearFilter
} from 'three';

// ---------------------------------------------
// Named Configuration Constants
// ---------------------------------------------
// Frustum angle that mirrors the old perspective camera's framing.
const CAMERA_ANGLE_DEG = 75;

const CONFIG = {
    // Camera
    initialZ: 35,
    cameraAngleDeg: CAMERA_ANGLE_DEG, // Orthographic frustum angle that mirrors the old perspective view
    zoomMin: 10,
    zoomMax: 200,
    // Uniform margin (px) reserved on every side of the sculpture so it never
    // touches the options menu (dock / drawer / input bar) or the screen edges.
    fitMargin: 56,
    zoomSpeed: 0.8,
    zoomLerp: 0.08,
    rotationStep: 0.03,
    rotationAutoReturnLerp: 0.02,
    autoReturnGracePeriodMs: 300,   // ms before auto-rotate re-engages after gesture

    // Canvas text rasterization
    canvasWidth: 800,
    canvasHeight: 150,
    fontSize: 44,
    pixelStep: 2,
    pixelThreshold: 120,
    targetWorldWidth: 80.0,

    // Emoji MESSAGE options (picked from the UI list). Emojis render at high
    // resolution with an edge + interior sampling pass so both the silhouette
    // and inner details (eyes, holes, rings) stay recognizable.
    emojiOptions: [
        '😀', '😂', '😍', '🥰', '😎', '🤔', '😭', '😡', '😱', '🥳',
        '👍', '👎', '👏', '🙏', '👌', '💪', '❤️', '🔥', '✨', '🎉'
    ],
    emojiRasterSize: 320,
    emojiPixelStep: 2,     // canvas edge for a single emoji (px)
    emojiFontSize: 280,       // glyph size within the emoji raster (px)
    emojiEdgeStep: 1,         // feature/silhouette edge samples (full density)
    emojiInteriorStep: 2,     // interior fill samples (halves density, keeps detail)
    emojiDensityOverride: 1,  // one particle per sampled cell -> max detail under the cap
    emojiColorEdgeThreshold: 64, // max RGB-channel delta that marks an internal color boundary
    emojiJitterXY: 0.03,      // flatter layout so thin features (tears, eyes) stay continuous
    emojiJitterZ: 0.5,        // per-layer jitter (much smaller than layer spacing)
    emojiDepthCue: 0.06,      // near-flat depth shading for emoji particles
    emojiPointSize: 1.6,      // sprite base size covering interior sample cells
    emojiMotionMix: 0.35,     // how much of the explosion heat palette blends into emoji colors
    emojiDepthLayers: 5,      // number of Z-slices to replicate emoji points across (Approach A)
    emojiDepthRange: 6.0,     // total depth extent of the emoji volume in world units
    emojiIdleRotSpeed: 0.006, // slow idle Y-rotation speed (rad/s) to reveal depth at rest

    // Uploaded image MESSAGE options. Images are contained in a square raster so
    // their aspect ratio is preserved while the largest dimension fits the stage.
    imageRasterSize: 320,
    imagePixelStep: 2,
    imageAlphaThreshold: 16,
    imageJitterXY: 0.03,
    imageJitterZ: 0.5,        // per-layer jitter (smaller than layer spacing)
    imageDepthCue: 0.06,
    imagePointSize: 1.2,
    imageDepthLayers: 4,      // number of Z-slices to replicate image points across
    imageDepthRange: 5.0,     // total depth extent of the image volume in world units

    // Particles
    density: 8,
    jitterXY: 0.08,
    jitterZ: 2.5, // Depth thickness. Safe with the orthographic camera: parallel
                  // projection has no keystone shear, so edge glyphs stay straight
                  // while the sculpture still has 3D volume.

    // Explosion speeds
    explosionSpeedMin: 0.4,
    explosionSpeedRange: 0.8,

    // Explosion coloring & recovery (fixed across presets)
    // heatDistance: world distance at which a particle is fully "hot" (red).
    // Computed as 1/3 of the visible screen height at the default camera depth:
    // (1/3) * 2 * initialZ * tan(fov/2), where fov = 75 and initialZ = 35.
    heatDistance: (2 / 3) * 35 * Math.tan(CAMERA_ANGLE_DEG * Math.PI / 360),
    // maxContractionVelocity: recovery duration = distance / velocity, so bigger
    // explosions take proportionally longer to recover (world units per second).
    maxContractionVelocity: 7,
    contractionDurationFloor: 0.3,
    afterglowDuration: 0.2,

    // Mouse repulsion
    mouseInfluence: 6.0,    // hover/repulsion radius (reduced to 75% of the previous 8.0)
    repulsionStrength: 12.0,

    // Spring physics
    springK: 0.12,
    springDamping: 0.82,

    // Interaction
    tapCount: 5,
    tapWindowMs: 800,               // widened from 500ms
    inputDebounceMs: 150,           // debounce delay

    // Rendering
    pointSize: 0.5,
    pointSizeAttenuationScale: 120.0,
    clearColor: 0x020205,
    maxPixelRatio: 2,

    // Themes
    themes: {
        ember: {
            hot: [1.0, 0.95, 0.75],   // White-hot flame core
            warm: [1.0, 0.45, 0.05],  // Radiant fiery amber / orange
            cold: [0.92, 0.18, 0.05]  // Rich glowing crimson ember
        },
        arctic: {
            hot: [0.92, 0.98, 1.0],   // Glacial white-cyan highlight
            warm: [0.18, 0.75, 1.0],  // Vibrant azure cyan
            cold: [0.05, 0.35, 0.88]  // Deep oceanic polar blue
        },
        toxic: {
            hot: [0.92, 1.0, 0.40],   // Electric chartreuse spark
            warm: [0.35, 0.95, 0.15], // Radiant radioactive neon green
            cold: [0.06, 0.58, 0.22]  // Deep venom emerald
        },
        neon: {
            hot: [1.0, 0.92, 0.98],   // Hyper-bright strobe highlight
            warm: [1.0, 0.08, 0.55],  // Vivid neon magenta / hot pink
            cold: [0.35, 0.05, 0.88]  // Electric ultraviolet violet
        },
        sakura: {
            hot: [1.0, 0.95, 0.96],   // Luminous blossom petal white
            warm: [1.0, 0.45, 0.65],  // Soft cherry blossom pink
            cold: [0.85, 0.18, 0.42]  // Deep floral rose magenta
        }
    },

    // Unique preset configurations for custom particle physics and Web Audio properties.
    // Pattern styles: 0 = uniform sphere (Explode), 1 = screen-space funnel
    // (Tornado), 2 = coherent wind gust (Breeze), 3 = crisp starburst rays (Kinetic),
    // 4 = black hole trefoil torus knot (Torus), 5 = starling flock (Murmuration).
    // Styles 4 and 5 run on the JS kinematics path (worker/CPU), never the GPU shader path.
    presets: {
        KINETIC: {
            description: 'A 3D surf wave rolls through your message — luminous crest, deep blue troughs.',
            expansionDuration: 3.75,
            contractionDuration: 3.75,
            explosionMaxDistMultiplier: 22.0,
            motionStyle: 3, // Cinematic 3D Surf Wave: 3/4 Perspective Glide + Spatial Audio + Luminous Crest
            trailStrength: 0.70,
            emberBudget: 0,
            soundPitch: 45,
            soundDuration: 7.5,
            soundType: 'sine'
        },
        TORNADO: {
            description: 'A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.',
            expansionDuration: 3.5,
            vortexDuration: 4.5,
            equilibriumDuration: 3.5,
            contractionDuration: 3.5,
            explosionMaxDistMultiplier: 26.0,
            motionStyle: 1, // 4-phase ~15s tornado: Phase 1 Ground Accretion -> Phase 2 Organic Funnel -> Phase 3 Mature Canopy -> Phase 4 Dissipation
            spinSpeed: 4.8,
            funnelHeight: 46,
            funnelBottom: -22,
            funnelCrownRadius: 22.0,
            funnelWaistRadius: 4.5,
            funnelTailRadius: 1.8,
            funnelWaistT: 0.38,
            funnelCrownT: 0.82,
            funnelFadeStart: 0.03,
            funnelFadeEnd: 0.30,
            trailStrength: 0.75,
            emberBudget: 90,
            soundPitch: 75,
            soundDuration: 15.0,
            soundType: 'sawtooth'
        },
                                                                        BREEZE: {
            description: 'A wind field bends, rolls and disperses your message like leaves in a gust.',
            expansionDuration: 1.0,
            contractionDuration: 1.6,
            explosionMaxDistMultiplier: 28.0,
            motionStyle: 2, // 4-phase breeze: Straight Fall (1.0s) -> 2s Ground Rest (1.0-3.0s) -> Braided Leaf Breeze (3.0-6.6s) -> Reverse Flow to Floor (6.6-10.2s) -> Reverse Drop Elevation Home (10.2-11.8s)
            trailStrength: 0.60,
            emberBudget: 0,
            soundPitch: 95,
            soundDuration: 11.8,
            soundType: 'sine'
        },
        EXPLODE: {
            description: 'A volumetric blast — particles burst outward, hang in the air, then rush home.',
            expansionDuration: 1.2,
            driftDuration: 3.0,
            contractionDuration: 2.0,
            explosionMaxDistMultiplier: 36.0,
            motionStyle: 0, // uniform sphere
            trailStrength: 0.3,
            emberBudget: 140,
            soundPitch: 110,
            soundDuration: 6.2,
            soundType: 'sine'
        },
        TORUS: {
            description: 'Gravity forges your message into a flowing torus knot of light around a black hole, then lets it rain back home.',
            expansionDuration: 8.0,   // embers fire at jet ignition (8s)
            contractionDuration: 4.0,
            explosionMaxDistMultiplier: 30.0,
            motionStyle: 4, // 3-phase ~16s trefoil torus knot: Collapse (0-3) -> Knot Flow (3-11.5) -> Reformation (11.5-16)
            trailStrength: 0.8,
            emberBudget: 50,
            soundPitch: 40,
            soundDuration: 16.0,
            soundType: 'sine'
        },
        MURMURATION: {
            description: 'Your message takes flight — whip turns, split-and-merge waves, falcon strikes and startle sparks, then it settles home.',
            expansionDuration: 2.0,
            contractionDuration: 2.0,
            explosionMaxDistMultiplier: 30.0,
            motionStyle: 5, // 4-phase ~14s flock: Take-off (0-2) -> Flight: jinks/snap-turn/split/dodges/boil/scouts (2-9) -> Settle (9-12) -> Landing (12-14)
            trailStrength: 0.70,
            emberBudget: 60,
            soundPitch: 70,
            soundDuration: 14.0,
            soundType: 'sine'
        },
        DEFAULT: {
            expansionDuration: 1.2,
            driftDuration: 3.0,
            contractionDuration: 2.0,
            explosionMaxDistMultiplier: 15.0,
            motionStyle: -1, // random per blast
            spokes: 12,
            spokeJitter: 0.03,
            spinSpeed: 0,
            funnelHeight: 0,
            funnelBottom: 0,
            funnelCrownRadius: 0,
            funnelWaistRadius: 0,
            funnelTailRadius: 0,
            funnelWaistT: 0,
            funnelCrownT: 0,
            funnelFadeStart: 0,
            funnelFadeEnd: 0,
            trailStrength: 0.25,
            soundPitch: 140,
            soundDuration: 1.5,
            soundType: 'sine'
        }
    }
};

// ---------------------------------------------
// [1.2] mediaQuery Caching
// ---------------------------------------------
let isMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    isMotionReduced = e.matches;
});

// ---------------------------------------------
// Web Worker for Offloaded Physics Calculation
// ---------------------------------------------
let physicsWorker = null;

// Number of leading particles whose generated blast directions are echoed back from
// the worker to the main thread (and kept by the CPU fallback) for the pattern
// regression tests. Deterministic pattern verification with zero timing sensitivity.
const DIRECTIONS_VERIFY = 384;

// Tracks the actual travel radius in the CPU-fallback path (worker path uses its own).
let fallbackMaxTravelSq = 0;

// Shared gust direction for Breeze wave undulations
let gustX = 1, gustY = 0, gustZ = 0;
let activeBreezeConfig = null;

// Measured world-space bounding box of the current sculpture (set on every
// particle rebuild). Drives the unified max-fit framing for text, emoji, and
// image messages so all three honour the same screen margins.
let contentBox = { w: 80, h: 80 };

// ---------------------------------------------
// Shaders (GPU-Native Kinematics Engine)
// ---------------------------------------------
const vertexShader = `
uniform vec3 uMouse;
uniform float uMouseInfluence;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uPointScale;
uniform float uDepthCue;
uniform vec3 uColorHot;
uniform vec3 uColorWarm;
uniform vec3 uColorCold;
uniform float uExplosionActive;
uniform float uTornadoActive;
uniform float uTornadoFadeStart;
uniform float uTornadoFadeEnd;
uniform float uHeatDistance;
uniform vec3 uHeatCold;
uniform vec3 uHeatWarm;
uniform vec3 uHeatHot;
uniform float uAudioMid;
uniform float uAudioHigh;
uniform float uAudioEnvelope;
uniform float uEmojiMode;
uniform float uEmojiMotionMix;

// GPU Kinematics Uniforms
uniform float uGpuPhysics;
uniform int uMotionStyle;
uniform float uExplosionElapsed;
uniform float uExpDuration;
uniform float uDriftDuration;
uniform float uContractionDuration;
uniform float uMaxDist;
uniform float uSpinSpeed;
uniform float uFunnelBottom;
uniform float uFunnelHeight;
uniform float uFunnelCrownRadius;
uniform float uFunnelWaistRadius;
uniform float uFunnelTailRadius;
uniform float uFunnelWaistT;
uniform float uFunnelCrownExp;
uniform float uBreezeBlowDir;
uniform float uBreezeIntensity;
uniform float uBreezeSwirl;
// Murmuration randomized flight plan (per-blast, written by triggerExplosion)
uniform float uMSweepX;
uniform float uMSweepY;
uniform float uMSweepZ;
uniform float uMFreqX;
uniform float uMFreqY;
uniform float uMFreqZ;
uniform float uMPhX;
uniform float uMPhY;
uniform float uMPhZ;
uniform float uMLaunchDir;
uniform float uMTurnT;
uniform float uMTurnDir;
uniform float uMSplitT;
uniform float uMSplitAng;
uniform float uMDodge1T;
uniform float uMDodge2T;
uniform float uMDodge3T;
uniform float uMDodgeRad;
uniform float uMDodgeStr;
uniform float uMBoilAmp;
uniform float uMBoilFreq;
uniform float uMChurnMult;
uniform float uMFlutterMult;
uniform float uMJinkAmp;
uniform float uMJinkFreq;
uniform float uMJinkPh;
uniform float uMBreathAmp;
uniform float uMScoutAmp;
// Torus knot auto-calibration (world units, from the camera frustum)
uniform float uKnotScale;
uniform vec3 uMouseWorld;
uniform float uMousePushDistance;
uniform float uMouseActive;

attribute vec3 homePosition;
attribute vec4 sourceColor;
attribute float sampleSize;
attribute float funnelT;
attribute vec2 aSourceUV;
attribute vec3 aRandomDir;
attribute float aRandomSpeed;
attribute float aIndex;
attribute vec3 aSeed;
attribute float aCustomDir;

varying vec3 vColor;
varying float vCoverage;
varying float vTornadoFade;
varying vec2 vSourceUV;

float calcTornadoRadius(float u, float waistU, float rTail, float rWaist, float rCrown, float crownExp) {
    if (u <= waistU) {
        float t = u / max(0.01, waistU);
        return rTail + (rWaist - rTail) * (t * t);
    } else {
        float t = (u - waistU) / max(0.01, 1.0 - waistU);
        return rWaist + (rCrown - rWaist) * pow(t, crownExp);
    }
}

vec3 evalTornadoGPU(float i, vec3 home, float u, vec3 seed, float cd, float elapsed, float spinSpeed, float fBottom, float fHeight, float rCrown, float rWaist, float rTail, float waistU, float crownExp) {
    float radiusFunnel = calcTornadoRadius(u, waistU, rTail, rWaist, rCrown, crownExp);
    float baseAngle = atan(seed.z, seed.x);
    float r0 = length(home.xz);

    float t1 = 3.5;
    float t2 = 4.5;
    float t3 = 3.5;
    float t4 = 3.5;

    float discRadius = 14.0 + 0.55 * r0;
    float ripple1 = 0.12 * sin(3.0 * baseAngle - 4.2 * elapsed + 2.5 * u);
    float ripple2 = 0.08 * cos(5.0 * baseAngle + 6.0 * elapsed - 3.8 * u);
    float ripple3 = 0.06 * sin(elapsed * 7.5 + i * 0.03);
    float sheathRipple = 1.0 + ripple1 + ripple2 + ripple3;

    float diffSpin = (4.0 + 15.0 / (r0 + 4.5)) * cd;
    float vortexSpin = (spinSpeed * 2.8 + 4.5 * (1.0 - u)) * cd;

    if (elapsed < t1) {
        float p1 = elapsed / t1;
        float e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);
        float rDisc = (1.0 - e1) * r0 + e1 * discRadius;
        float angle1 = baseAngle + diffSpin * (0.6 * elapsed + 0.2 * (elapsed * elapsed / t1));
        float rx = cos(angle1) * rDisc;
        float ry = (1.0 - e1) * home.y + e1 * (fBottom + 0.022 * rDisc * rDisc + 3.0 * (u - 0.5));
        float rz = sin(angle1) * rDisc;
        return vec3(rx, ry, rz);
    } else if (elapsed < t1 + t2) {
        float tau = elapsed - t1;
        float p2 = tau / t2;
        float eLift = p2 * p2 * (3.0 - 2.0 * p2);
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2 = tau + (0.6 * t2 / 3.14159265) * (1.0 - cos(3.14159265 * tau / t2));
        float angle2 = angleAtEnd1 + vortexSpin * 1.25 * integral2;
        float currentR = (1.0 - eLift) * discRadius + eLift * (radiusFunnel * sheathRipple);
        float axisX = 2.8 * sin(1.8 * elapsed + 2.2 * u) * u * eLift;
        float axisZ = 2.4 * cos(1.5 * elapsed + 1.8 * u) * u * eLift;
        float rx = axisX + cos(angle2) * currentR;
        float ry = (1.0 - eLift) * (fBottom + 0.022 * discRadius * discRadius) + eLift * (fBottom + fHeight * u) + 5.5 * sin(p2 * 3.14159265) * u;
        float rz = axisZ + sin(angle2) * currentR;
        return vec3(rx, ry, rz);
    } else if (elapsed < t1 + t2 + t3) {
        float tau3 = elapsed - (t1 + t2);
        float p3 = tau3 / t3;
        float bloom = 1.0 + 0.75 * sin(3.14159265 * p3) + 0.35 * p3;
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2End = t2 + (1.2 * t2 / 3.14159265);
        float angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        float integral3 = tau3 - (0.2 / 2.4) * (cos(2.4 * tau3) - 1.0);
        float angle3 = angleAtEnd2 + vortexSpin * 1.1 * integral3;
        float currentR3 = (radiusFunnel * sheathRipple) * bloom;
        float axisX3 = 2.8 * sin(1.8 * (t1 + t2) + 2.2 * u) * u * (1.0 - 0.4 * p3);
        float axisZ3 = 2.4 * cos(1.5 * (t1 + t2) + 1.8 * u) * u * (1.0 - 0.4 * p3);
        float rx = axisX3 + cos(angle3) * currentR3;
        float ry = fBottom + fHeight * u + (1.0 - p3) * 2.0 * u;
        float rz = axisZ3 + sin(angle3) * currentR3;
        return vec3(rx, ry, rz);
    } else {
        float tau4 = elapsed - (t1 + t2 + t3);
        float p4 = min(1.0, tau4 / t4);
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2End = t2 + (1.2 * t2 / 3.14159265);
        float angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        float integral3End = t3 - (0.2 / 2.4) * (cos(2.4 * t3) - 1.0);
        float angleAtEnd3 = angleAtEnd2 + vortexSpin * 1.1 * integral3End;
        float integral4 = 0.85 * tau4 - 0.275 * (tau4 * tau4 / t4);
        float angle4 = angleAtEnd3 + vortexSpin * 1.1 * integral4;
        float reverseFunnelR = (radiusFunnel * sheathRipple) * (1.0 - p4) + discRadius * p4;
        float reverseFunnelY = (fBottom + fHeight * u) * (1.0 - p4) + (fBottom + 0.022 * discRadius * discRadius + 3.0 * (u - 0.5)) * p4;
        float revDiscX = cos(angle4) * reverseFunnelR;
        float revDiscY = reverseFunnelY;
        float revDiscZ = sin(angle4) * reverseFunnelR;
        float returnProg = 0.35 * p4 + 0.65 * pow(p4, 2.2);
        float rx = (1.0 - returnProg) * revDiscX + returnProg * home.x;
        float ry = (1.0 - returnProg) * revDiscY + returnProg * home.y;
        float rz = (1.0 - returnProg) * revDiscZ + returnProg * home.z;
        return vec3(rx, ry, rz);
    }
}

vec3 computeBreezePlumeGPU(float tWind, float curElapsed, float lambda, vec3 gPos, float gx, float intensity, float swirl, float cd, float windSpeedMult, float buoyancy, float liftStart, float seedZ, float t2, float i) {
    float upwindPos = (gPos.x * gx) + 25.0;
    float randOffset = (mod(i * 53.17, 100.0) / 100.0) * 0.30;
    float gustDelay = min(0.75, max(0.0, upwindPos * 0.015 + randOffset));
    float localT = max(0.0, tWind - gustDelay);
    float pLocal = min(1.0, localT / (t2 - gustDelay + 1e-4));

    if (localT <= 0.0) {
        return gPos;
    }

    // -- Option 1: 3D Spiral Ribbons & Braided Filaments --
    float ribbonId = mod(i, 3.0);
    float ribbonPhase = ribbonId * 2.094395; // 2*PI/3
    float braidWavelength = 0.15;
    float braidSpeed = 2.8;
    float braidAngle = braidWavelength * (gPos.x * gx) - braidSpeed * curElapsed + ribbonPhase;
    float braidRadius = (1.8 + 3.8 * buoyancy) * min(1.0, localT / 0.8) * intensity;
    float braidY = braidRadius * sin(braidAngle);
    float braidZ = braidRadius * cos(braidAngle);
    float braidX = gx * (braidRadius * 0.55 * sin(braidAngle * 0.5));

    // -- Option 6: Floating Leaf Flutter & Pendulum Gliding --
    float leafRockFreq = 3.6 + (mod(i * 41.73, 100.0) / 100.0) * 2.0;
    float leafPhase = (mod(i * 67.89, 100.0) / 100.0) * 6.28318;
    float pendulumAngle = leafRockFreq * curElapsed + leafPhase;

    float leafGlideX = gx * (sin(pendulumAngle) * (0.80 + 1.10 * windSpeedMult)) * intensity;
    float leafGlideY = abs(cos(pendulumAngle)) * (0.95 + 1.45 * buoyancy) * intensity;
    float leafGlideZ = sin(pendulumAngle * 0.75 + leafPhase) * (1.30 + 1.80 * windSpeedMult) * intensity;

    float leafWobble = sin(9.5 * curElapsed + i * 0.35) * 0.40 * intensity * min(1.0, localT);

    // -- Swirl / Whirlwind Vortex Dynamics (Randomized from 0.0 to 1.4+) --
    float swirlSign = (mod(i * 29.17, 10.0) > 5.0) ? 1.0 : -1.0;
    float swirlAngle = 0.12 * (gPos.x * gx) - 3.8 * curElapsed * swirlSign + (mod(i * 31.41, 100.0) / 100.0) * 6.28318;
    float swirlEnvelope = sin(3.14159265 * pLocal);
    float swirlRadius = (3.2 + 6.0 * buoyancy) * swirl * intensity * swirlEnvelope;
    float swirlY = swirlRadius * sin(swirlAngle);
    float swirlZ = swirlRadius * cos(swirlAngle);
    float swirlX = gx * (swirlRadius * 0.35 * cos(swirlAngle * 2.0));

    if (lambda > 0.82) {
        // -- Strata C: Ground Skittering Leaves (Tumbling along floor) --
        float groundSpeed = (3.2 + 6.0 * windSpeedMult) * intensity;
        float groundDist = groundSpeed * (localT * 0.85 + 0.08 * localT * localT);
        float groundSkip = (0.35 * abs(sin(pendulumAngle)) + 0.10 * sin(curElapsed * 10.0 + i)) * min(1.0, localT);
        float groundZDrift = (0.75 * sin(pendulumAngle * 0.6) + leafWobble + swirlZ * 0.25) * min(1.0, localT);
        return vec3(gPos.x + gx * groundDist + leafGlideX * 0.4 + swirlX * 0.25, max(gPos.y, gPos.y + groundSkip), gPos.z + groundZDrift);
    } else {
        // -- Strata A & B: Airborne Braided Ribbon Streams + Floating Leaf Gliding + Swirl Vortex --
        float indLiftStart = liftStart * 0.50;
        float liftProg = min(1.0, max(0.0, (pLocal - indLiftStart) / (1.0 - indLiftStart + 1e-4)));
        float eLift = liftProg * liftProg * (3.0 - 2.0 * liftProg);

        float randSpeedVariation = (mod(i * 83.11, 100.0) / 100.0) * 2.4 - 1.2;
        float baseSpeed = max(2.4, 4.2 + 8.5 * windSpeedMult + 3.8 * buoyancy + randSpeedVariation);
        float xDispersal = (localT * baseSpeed + 0.45 * localT * localT * (0.4 + 0.6 * buoyancy)) * intensity;

        float randHeight = (mod(i * 93.41, 100.0) / 100.0) * 2.8;
        float baseLiftHeight = (3.0 + 7.5 * buoyancy + randHeight) * intensity;
        float totalLift = max(0.0, baseLiftHeight + braidY + leafGlideY + leafWobble);

        float rx = gPos.x + gx * xDispersal + braidX + leafGlideX + eLift * swirlX;
        float ry = max(gPos.y, gPos.y + eLift * (totalLift + swirlY));
        float rz = gPos.z + eLift * (braidZ + leafGlideZ + leafWobble + swirlZ);

        return vec3(rx, ry, rz);
    }
}

vec3 evalBreezeGPU(float i, vec3 home, float cd, float elapsed, float gx, float intensity, float swirl) {
    float t1 = 1.0;
    float tPause = 2.0;
    float t2 = 3.6;
    float t3 = 3.6;
    float t4 = 1.6;

    float lambda = mod(i * 37.119, 100.0) / 100.0;
    bool isClash = lambda < 0.22;
    float seedX = mod(i * 19.417, 100.0) - 50.0;
    float seedZ = mod(i * 29.831, 100.0) - 50.0;
    float scatX = isClash ? seedX * 0.05 : 0.0;
    float scatZ = isClash ? seedZ * 0.04 : 0.0;
    float yGround = -11.0;

    vec3 gPos = vec3(home.x + scatX, yGround + (home.y * 0.03), home.z + scatZ);
    float windSpeedMult = 0.55 + (mod(i * 43.71, 100.0) / 100.0) * 0.90;
    float buoyancy = 0.40 + (mod(i * 81.33, 100.0) / 100.0) * 1.10;
    float liftStart = pow(mod(i * 61.19, 100.0) / 100.0, 1.4) * 0.60;

    if (elapsed < t1) {
        float p1 = elapsed / t1;
        float eDrop = p1 * p1;
        float pImpact = max(0.0, (p1 - 0.70) / 0.30);
        float eImpact = pImpact * (2.0 - pImpact);
        float recoil = (isClash ? 1.6 : 0.5) * sin(3.14159265 * pImpact) * (1.0 - pImpact);
        return vec3(home.x + scatX * eImpact, (1.0 - eDrop) * home.y + eDrop * gPos.y + recoil, home.z + scatZ * eImpact);
    } else if (elapsed < t1 + tPause) {
        return gPos;
    } else if (elapsed < t1 + tPause + t2) {
        float tWind = elapsed - (t1 + tPause);
        return computeBreezePlumeGPU(tWind, elapsed, lambda, gPos, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i);
    } else if (elapsed < t1 + tPause + t2 + t3) {
        float p3 = (elapsed - (t1 + tPause + t2)) / t3;
        float smoothP3 = p3 * p3 * (3.0 - 2.0 * p3);
        float tWindRev = t2 * (1.0 - smoothP3);
        return computeBreezePlumeGPU(tWindRev, elapsed, lambda, gPos, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i);
    } else {
        float p4 = min(1.0, (elapsed - (t1 + tPause + t2 + t3)) / t4);
        float eRise = p4 * p4 * (3.0 - 2.0 * p4);
        return mix(gPos, home, eRise);
    }
}

vec3 evalKineticGPU(vec3 home, float cd, float elapsed) {
    float totalDur = 7.5;
    float p = min(1.0, max(0.0, elapsed / totalDur));
    float xPeel = -48.0 + 96.0 * p;
    float dPeel = (home.x + 0.25 * home.y) - xPeel;
    float tubeWidth = 9.2;
    float env = exp(-(dPeel * dPeel) / (2.0 * tubeWidth * tubeWidth));

    float timeEnv = sin(3.14159265 * p);
    float waveEnv = env * (0.35 + 0.65 * timeEnv);

    float theta = (3.14159265 * dPeel) / (2.0 * tubeWidth);
    float cosT = cos(theta);
    float sinT = sin(theta);
    float waveHeight = 16.0;
    float e2y = exp(clamp(2.0 * (home.y / 8.0), -10.0, 10.0));
    float tanhVal = (e2y - 1.0) / (e2y + 1.0);
    float lipBlend = 0.5 + 0.5 * tanhVal;
    float baseWaveZ = waveHeight * (cosT - 0.30 * 2.0 * sinT * cosT);
    float curlZ = 5.0 * lipBlend * max(0.0, cosT);
    float curlY = -3.5 * lipBlend * max(0.0, sinT);

    float deltaZ = waveEnv * (baseWaveZ + curlZ);
    float deltaY = waveEnv * ((waveHeight * 0.14) * sinT + curlY);
    float deltaX = -waveEnv * (waveHeight * 0.06) * sinT;

    return vec3(home.x + deltaX, home.y + deltaY, home.z + deltaZ);
}

vec3 evalExplosionGPU(vec3 home, vec3 rDir, float rSpeed, float maxDist, float expDur, float driftDur, float contrDur, float elapsed) {
    float tDrift = driftDur > 0.0 ? driftDur : 3.0;
    float peakProg = (1.0 - 0.06081006) * 0.82 + 0.18;
    float vLatest = (2.8 * 0.06081006 * 0.82 + 0.18) / max(0.1, expDur);
    float driftPeakProg = peakProg + vLatest * tDrift * 0.78;
    float dist = 0.0;
    if (elapsed < expDur) {
        float u = elapsed / expDur;
        dist = ((1.0 - exp(-2.8 * u)) * 0.82 + 0.18 * u) * maxDist;
    } else if (elapsed < expDur + tDrift) {
        float dtDrift = elapsed - expDur;
        float driftRatio = dtDrift / max(0.01, tDrift);
        float prog = peakProg + vLatest * dtDrift * (1.0 - 0.22 * driftRatio);
        dist = prog * maxDist;
    } else {
        float v = min(1.0, max(0.0, (elapsed - (expDur + tDrift)) / max(0.1, contrDur)));
        float returnProg = max(0.0, 1.0 - pow(v, 2.4));
        dist = driftPeakProg * returnProg * maxDist;
    }
    return home + rDir * (dist * rSpeed);
}

// Style 4: black hole trefoil — vortex suck-in, flowing (2,3) torus knot,
// spiral rain home. Mirrors evaluateTorusParticle in physics-math.js.
vec3 evalTorusGPU(float i, vec3 home, float cd, float elapsed) {
    float t1 = 3.0;
    float T123 = 11.5;
    float t4 = 4.5;

    float hA = mod(i * 37.119, 100.0) / 100.0;
    float hB = mod(i * 61.19, 100.0) / 100.0;
    float hD = mod(i * 29.17, 100.0) / 100.0;
    float hE = mod(i * 53.17, 100.0) / 100.0;
    float hF = mod(i * 91.73, 100.0) / 100.0;

    // Precessing frame: tiltX≈60° puts the knot plane nearly face-on to the
    // camera (nn_z=sin(tiltX)) — projects as the woven 3-lobe clover
    float tiltX = 1.05 + 0.04 * sin(0.35 * elapsed);
    float tiltZ = 0.07 + 0.02 * cos(0.30 * elapsed);
    float cTx = cos(tiltX);
    float sTx = sin(tiltX);
    float cTz = cos(tiltZ);
    float sTz = sin(tiltZ);
    vec3 ex = vec3(cTz, sTz, 0.0);
    vec3 ez = normalize(vec3(-sTz * sTx, cTz * sTx, cTx));
    vec3 nn = cross(ex, ez);

    // Trefoil as (2,3) torus knot — face-on woven clover like the reference.
    float S = uKnotScale > 0.0 ? uKnotScale : 11.0;
    float RK = S * 0.62;
    float rK = S * 0.34;
    float rt = S * 0.15 * (1.0 + 0.03 * sin(1.2 * elapsed));

    // Slow flow along the knot for readability
    float u = hA * 6.28318 + 0.14 * elapsed * cd;

    // Path point and analytic tangent (local frame; z along nn)
    float ringM = RK + rK * cos(3.0 * u);
    vec3 cPath = vec3(ringM * cos(2.0 * u), ringM * sin(2.0 * u), rK * sin(3.0 * u));
    vec3 tanL = vec3(
        -3.0 * rK * sin(3.0 * u) * cos(2.0 * u) - 2.0 * ringM * sin(2.0 * u),
        -3.0 * rK * sin(3.0 * u) * sin(2.0 * u) + 2.0 * ringM * cos(2.0 * u),
        3.0 * rK * cos(3.0 * u));

    mat3 basis = mat3(ex, ez, nn);
    vec3 core = cPath * basis;
    vec3 T = normalize(tanL * basis);

    float phi = hF * 6.28318 + 0.18 * elapsed * cd;
    // Solid rope cross-section — one wall per strand, reads as a single tube
    float rtI = rt * sqrt(hE);
    vec3 tN = normalize(nn - dot(nn, T) * T);
    vec3 tB = cross(T, tN);
    vec3 kp = core + rtI * (cos(phi) * tN + sin(phi) * tB);

    vec3 p;
    if (elapsed < t1) {
        // Phase 1: vortex collapse — home swings around the axis onto the knot
        float p1 = clamp((elapsed - hB * 0.35) / 2.65, 0.0, 1.0);
        float e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);
        // The home endpoint swirls gently around the knot axis mid-flight —
        // small angle so the eye sees ONE tube forming, never orbit rings.
        float aR = 0.9 * cd * sin(3.14159265 * e1);
        float cR = cos(aR), sR = sin(aR);
        float dN = dot(nn, home);
        vec3 cr = cross(nn, home);
        vec3 h2 = home * cR + cr * sR + nn * dN * (1.0 - cR);
        p = mix(h2, kp, e1);
    } else if (elapsed < T123) {
        // Phase 2: knot flow — streaming along the living knot
        p = kp;
    } else {
        // Phase 3: reformation — release swirl, spiral rain back home
        float p4 = clamp((elapsed - T123 - hD * 0.25) / 4.25, 0.0, 1.0);
        float e4 = p4 * p4 * p4 * (p4 * (p4 * 6.0 - 15.0) + 10.0);
        float aR = 0.9 * cd * sin(3.14159265 * e4);
        float cR = cos(aR), sR = sin(aR);
        float dN = dot(nn, kp);
        vec3 cr = cross(nn, kp);
        vec3 k2 = kp * cR + cr * sR + nn * dN * (1.0 - cR);
        p = mix(k2, home, e4);
    }
    // Turntable yaw about the world vertical (Y) axis: exactly ONE full
    // revolution during Knot Flow, holding aligned before and after so the
    // message always lands upright. Shows the knot's full 3D structure.
    float yawU = clamp((elapsed - t1) / (T123 - t1), 0.0, 1.0);
    float yawS = yawU * yawU * yawU * (yawU * (yawU * 6.0 - 15.0) + 10.0);
    float yawA = 6.28318530718 * yawS;
    float cyw = cos(yawA);
    float syw = sin(yawA);
    p = vec3(cyw * p.x + syw * p.z, p.y, -syw * p.x + cyw * p.z);
    return p;
}

// Style 5: starling flock — randomized flight plan + event schedule (snap turns,
// split/merge, randomized predator dodges), sub-swarms, streaming, boil turbulence,
// darting scouts. Mirrors evaluateMurmurationParticle in physics-math.js.
vec3 evalMurmurationGPU(float i, vec3 home, float cd, float elapsed,
        float swX, float swY, float swZ,
        float fX, float fY, float fZ,
        float phX, float phY, float phZ, float launchDir,
        float turnT, float turnDir, float splitT, float splitAng,
        float d1T, float d2T, float d3T, float dodgeRad, float dodgeStr,
        float boilAmp, float boilFreq, float churnMult, float flutterMult,
        float jinkAmp, float jinkFreq, float jinkPh, float breathAmp,
        float scoutAmp) {
    float t1 = 2.0;
    float t2 = 7.0;
    float t3 = 3.0;
    float t4 = 2.0;
    float T12 = 9.0;
    float T123 = 12.0;

    float p1h = mod(i * 37.119, 100.0) / 100.0;
    float p2h = mod(i * 61.19, 100.0) / 100.0;
    float p3h = mod(i * 83.11, 100.0) / 100.0;
    float p4h = mod(i * 53.17, 100.0) / 100.0;
    float p5h = mod(i * 71.53, 100.0) / 100.0;
    float p6h = mod(i * 97.31, 100.0) / 100.0;
    float ph1 = p1h * 6.28318;
    float ph2 = p2h * 6.28318;
    float ph3 = p3h * 6.28318;

    // Launch ripple sweeping across the message
    float delay = (launchDir > 0.0 ? home.x + 50.0 : 50.0 - home.x) * 0.017 + p2h * 0.55;
    float lt = elapsed - delay;
    if (lt <= 0.0) return home;
    float lbRaw = min(1.0, lt / 0.9);
    float lb = lbRaw * lbRaw * (3.0 - 2.0 * lbRaw);
    float hop = sin(lbRaw * 3.14159265) * 2.2;

    float te = elapsed * cd;

    // Flight-end constants keep settle/landing seamless for any plan
    float endCx = swX * sin(fX + phX);
    float endCy = swY * sin(fY + phY);
    float endCz = swZ * sin(fZ + phZ);
    float setCx = endCx * 0.25;
    float setCy = endCy * 0.25 + 1.5;
    float setCz = endCz * 0.25;
    float kvx = swX * fX / 7.0;
    float kvy = swY * fY / 7.0;
    float kvz = swZ * fZ / 7.0;
    float evx = kvx * cos(fX + phX);
    float evy = kvy * cos(fY + phY) - 1.346;
    float evz = kvz * cos(fZ + phZ);
    float evlen = max(length(vec3(evx, evy, evz)), 1e-4);
    vec3 evN = vec3(evx, evy, evz) / evlen;
    float ea = 0.60 * min(1.0, evlen / 10.0);
    float rFlightEnd = (11.0 + breathAmp * (3.4 * sin(0.85 * 9.0 + 0.7) + 1.7 * sin(1.65 * 9.0)));

    // Snap-turn pulse: sharp linear rise/fall window centered on turnT
    float tRise = clamp((elapsed - (turnT - 0.45)) / 0.45, 0.0, 1.0);
    float tFall = clamp((elapsed - turnT) / 0.45, 0.0, 1.0);
    float turnPulse = tRise * (1.0 - tFall);

    // Split-and-merge envelope: 1.2s full-separation plateau around splitT
    float sRise = clamp((elapsed - (splitT - 1.0)) / 0.4, 0.0, 1.0);
    float sFall = clamp((elapsed - (splitT + 0.6)) / 0.4, 0.0, 1.0);
    float splitEnv = sRise * (1.0 - sFall);

    // Shared flock center path + analytic streaming direction
    vec3 C;
    vec3 vDir;
    float churn;
    float blobR;
    float strA;
    if (elapsed < T12) {
        float u = max(0.0, (elapsed - t1) / t2);
        C = vec3(
            swX * sin(u * fX + phX),
            swY * sin(u * fY + phY) + 3.0 * sin(u * 3.14159265),
            swZ * sin(u * fZ + phZ));
        // Whip jinks: higher-frequency lobes on the flight path. The sin(pi*u)
        // envelope zeroes them exactly at take-off and flight-end so the
        // settle/landing end-constants stay valid.
        float jk = jinkAmp * sin(u * 3.14159265);
        C += vec3(
            jk * sin(u * jinkFreq + jinkPh),
            jk * 0.6 * sin(u * jinkFreq * 0.83 + jinkPh + 1.7),
            jk * cos(u * jinkFreq * 0.91 + jinkPh + 3.1));
        churn = 1.0;
        // Breathing flock volume: two superposed pulses swell and contract the
        // whole cloud organically through the flight window.
        blobR = 11.0 + breathAmp * (3.4 * sin(0.85 * elapsed + 0.7) + 1.7 * sin(1.65 * elapsed));
        vec3 dv = vec3(
            kvx * cos(u * fX + phX),
            kvy * cos(u * fY + phY) + 1.346 * cos(u * 3.14159265),
            kvz * cos(u * fZ + phZ));
        vDir = normalize(dv + vec3(1e-6));
        strA = 0.60 * min(1.0, length(dv) / 10.0);
        strA *= 1.0 + 0.55 * turnPulse;   // shear harder through snap turns
    } else if (elapsed < T123) {
        float s0 = (elapsed - T12) / t3;
        float s = s0 * s0 * (3.0 - 2.0 * s0);
        C = vec3(endCx, endCy, endCz) * (1.0 - 0.75 * s) + vec3(0.0, 1.5 * s, 0.0);
        churn = 1.0 - 0.7 * s;
        blobR = rFlightEnd * (1.0 - 0.55 * s);
        vDir = evN;
        strA = ea * (1.0 - 0.75 * s);
    } else {
        float tau4 = elapsed - T123;
        churn = 0.3 * (1.0 - min(1.0, tau4 / t4));
        float sq = min(1.0, tau4 / 1.5); sq = sq * sq * (3.0 - 2.0 * sq);
        vec3 hover = vec3(
            1.6 * sin(te * 1.05 + ph1),
            1.0 + sin(te * 0.83 + ph2),
            1.2 * cos(te * 0.95 + ph3));
        C = vec3(setCx, setCy, setCz) + (hover - vec3(setCx, setCy, setCz)) * sq;
        blobR = rFlightEnd * 0.45;
        vDir = evN;
        strA = ea * 0.25 * (1.0 - min(1.0, tau4 / t4));
    }

    // Flock slot: center-weighted point inside the blob volume
    float slotTh = ph1;
    float cosPhi = 2.0 * p2h - 1.0;
    float sinPhi = sqrt(max(0.0, 1.0 - cosPhi * cosPhi));
    float slotMag = sqrt(p3h);

    // Directional lobes: asymmetric bulges/folds defeat any sphere silhouette
    float lobe = 1.0
        + 0.30 * sin(2.2 * slotTh + 1.8 * cosPhi + 0.45 * te)
        + 0.16 * cos(3.3 * slotTh - 2.4 * cosPhi + 0.62 * te);

    vec3 slot = vec3(
        slotMag * sinPhi * cos(slotTh),
        slotMag * cosPhi * 0.72,
        slotMag * sinPhi * sin(slotTh)) * (blobR * lobe);

    // Sub-swarms: six overlapping clumps wandering semi-independently
    float swId = floor(p5h * 6.0);
    float swScale = blobR / 11.0;
    float swAmp = (4.5 + 3.0 * p1h) * swScale;
    vec3 swarmO = vec3(
        sin(0.71 * swId + 0.50 * te + p5h * 6.28),
        0.7 * sin(1.13 * swId + 0.38 * te + p2h * 6.28),
        0.8 * cos(0.87 * swId + 0.45 * te + p3h * 6.28)) * swAmp;

    // Velocity-aligned streaming: stretch along travel, trail behind
    float along = dot(slot, vDir);
    vec3 perp = slot - vDir * along;
    float back = max(0.0, -along);
    float shell = max(0.0, slotMag - 0.9) / 0.1;
    float trail = (back * 1.7 + shell * 2.6) * strA * (0.55 + 0.45 * p4h) * swScale;
    vec3 streamed = perp * 0.80 + vDir * (along * (1.0 + strA) - trail);

    // Churn field keyed on slot position + wingbeat flutter + boil turbulence
    vec3 F = churnMult * vec3(
        5.6 * sin(0.40 * slot.y + 1.25 * te + ph1),
        4.4 * sin(0.48 * slot.x - 1.05 * te + ph2),
        4.8 * cos(0.36 * slot.x + 0.30 * slot.y + 0.90 * te + ph3));
    float wf = 8.5 + 4.0 * p4h;
    float fl = sin(wf * te + ph1);
    F += flutterMult * vec3(0.5 * fl, 1.3 * fl, 0.4 * sin(wf * 0.87 * te + ph2));
    // Boil turbulence: incommensurate high-frequency layer keyed on the slot,
    // giving individual birds chaotic interior jitter (the "living" look).
    F += boilAmp * vec3(
        sin(boilFreq * te + 1.9 * slot.y + ph2),
        0.8 * sin(boilFreq * 0.87 * te - 1.6 * slot.x + ph3),
        cos(boilFreq * 0.71 * te + 1.3 * (slot.x + slot.y) + ph1));
    F *= churn;

    vec3 P = C + swarmO + streamed + F;

    // Snap-turn bank impulse: whip the whole flock sideways mid-flight
    if (turnPulse > 0.0) {
        vec2 bk = vec2(vDir.y, -vDir.x);
        float bkN = sqrt(dot(bk, bk) + 2.5e-3);
        float bankMag = turnDir * 8.0 * turnPulse;
        P.xy += (bk / bkN) * bankMag;
    }

    // Split & merge: tear the six sub-swarms into two lobes along a random
    // horizontal axis, fly them apart, then pour them back together
    if (splitEnv > 0.0) {
        float sideSign = (swId < 3.0) ? 1.0 : -1.0;
        float sepMag = sideSign * 7.5 * splitEnv * swScale;
        P.x += cos(splitAng) * sepMag;
        P.z += sin(splitAng) * sepMag;
    }

    // Darting scouts: rare individuals streak out of the blob and snap back
    if (p6h > 0.93 && churn > 0.01 && scoutAmp > 0.0) {
        float dartRate = (1.55 + 1.3 * p1h) * 3.14159265;
        float dw = sin(te * dartRate + p6h * 40.0 + ph2);
        if (dw > 0.0) {
            dw *= dw; dw *= dw; dw *= dw;
            float slotLen = max(length(slot), 1e-4);
            float dartMag = scoutAmp * (4.0 + 2.5 * p3h) * dw * churn;
            P += (slot / slotLen) * dartMag;
        }
    }

    // Predator dodges: up to three sweeping exclusion cavities shape-shift
    // the flock at per-blast randomized times with a random strike radius
    // and parting force
    if (elapsed > 2.0 && elapsed < 9.0) {
        float wA = clamp((elapsed - (d1T - 1.1)) / 0.4, 0.0, 1.0);
        wA *= 1.0 - clamp((elapsed - (d1T + 1.1)) / 0.4, 0.0, 1.0);
        float wB = clamp((elapsed - (d2T - 1.1)) / 0.4, 0.0, 1.0);
        wB *= 1.0 - clamp((elapsed - (d2T + 1.1)) / 0.4, 0.0, 1.0);
        float wC = clamp((elapsed - (d3T - 1.1)) / 0.4, 0.0, 1.0);
        wC *= 1.0 - clamp((elapsed - (d3T + 1.1)) / 0.4, 0.0, 1.0);
        float wEnv = max(wA, max(wB, wC));
        float dodgeIdx = (wC >= wA && wC >= wB) ? 2.0 : ((wB >= wA) ? 1.0 : 0.0);
        if (wEnv > 0.001) {
            // The predator rides the flock's own flight path with a lateral
            // weave (phase-offset per attack), so the dodge is guaranteed to
            // cut through the blob.
            float qt = min(8.9, elapsed * 0.92 + 1.1);
            float qU = max(0.0, (qt - 2.0) / 7.0);
            float wo = dodgeIdx * 2.094;
            vec3 Q = vec3(
                swX * sin(qU * fX + phX) + 5.0 * sin(1.7 * elapsed + 1.0 + wo),
                swY * sin(qU * fY + phY) + 3.0 * sin(qU * 3.14159265) + 2.0 * sin(1.3 * elapsed + wo),
                swZ * sin(qU * fZ + phZ) + 4.0 * sin(1.6 * elapsed + 2.0 + wo));
            // Part the flock around the predator: slide particles sideways
            // relative to the flow direction instead of pushing them radially.
            // A radial push compresses displaced particles into a visible rim
            // ring; tangential parting preserves radial density and reads as
            // the flock cleaving around a falcon. Magnitude fades to zero at
            // the cavity rim and on the parting mid-plane, so nothing snaps.
            vec3 dvv = P - Q;
            float d = length(dvv);
            float rad = dodgeRad;
            if (d < rad) {
                float x = d / rad;
                float rise = min(1.0, x / 0.5); rise = rise * rise * (3.0 - 2.0 * rise);
                float fall = clamp((x - 0.6) / 0.4, 0.0, 1.0); fall = fall * fall * (3.0 - 2.0 * fall);
                // In-plane perpendicular to the flock's travel direction,
                // smoothly attenuated so near-vertical turnarounds fade the
                // parting out instead of switching it off abruptly.
                vec2 pv = vec2(vDir.y, -vDir.x);
                pv /= sqrt(dot(pv, pv) + 2.5e-3);
                float sideDist = dot(dvv.xy, pv);
                float part = (sideDist / rad) * (rise * (1.0 - fall)) * 7.0 * dodgeStr * wEnv * (0.75 + 0.5 * p4h);
                P += vec3(pv * part, 0.0);
            }
        }
    }

    // Landing blend to home, then take-off blend from home
    P.y += hop;
    if (elapsed >= T123) {
        float tau4 = elapsed - T123;
        float stg = p2h * 0.5;
        float q = clamp((tau4 - stg) / (t4 - stg), 0.0, 1.0);
        float e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        P = mix(P, home, e4);
    }
    if (lb < 1.0) P = mix(home, P, lb);
    return P;
}

void main() {
    vec3 livePos = position;
    if (uGpuPhysics > 0.5) {
        livePos = homePosition;
        if (uExplosionActive > 0.01 && uExplosionElapsed >= 0.0) {
            if (uMotionStyle == 1) {
                livePos = evalTornadoGPU(aIndex, homePosition, funnelT, aSeed, aCustomDir, uExplosionElapsed, uSpinSpeed, uFunnelBottom, uFunnelHeight, uFunnelCrownRadius, uFunnelWaistRadius, uFunnelTailRadius, uFunnelWaistT, uFunnelCrownExp);
            } else if (uMotionStyle == 2) {
                livePos = evalBreezeGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed, uBreezeBlowDir, uBreezeIntensity, uBreezeSwirl);
            } else if (uMotionStyle == 3) {
                livePos = evalKineticGPU(homePosition, aCustomDir, uExplosionElapsed);
            } else if (uMotionStyle == 4) {
                livePos = evalTorusGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed);
            } else if (uMotionStyle == 5) {
                livePos = evalMurmurationGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed,
                    uMSweepX, uMSweepY, uMSweepZ, uMFreqX, uMFreqY, uMFreqZ,
                    uMPhX, uMPhY, uMPhZ, uMLaunchDir,
                    uMTurnT, uMTurnDir, uMSplitT, uMSplitAng,
                    uMDodge1T, uMDodge2T, uMDodge3T, uMDodgeRad, uMDodgeStr,
                    uMBoilAmp, uMBoilFreq, uMChurnMult, uMFlutterMult,
                    uMJinkAmp, uMJinkFreq, uMJinkPh, uMBreathAmp, uMScoutAmp);
            } else {
                livePos = evalExplosionGPU(homePosition, aRandomDir, aRandomSpeed, uMaxDist, uExpDuration, uDriftDuration, uContractionDuration, uExplosionElapsed);
            }
        }
        if (uMouseActive > 0.5) {
            vec2 diff = livePos.xy - uMouseWorld.xy;
            float d = length(diff);
            if (d < uMouseInfluence && d > 0.001) {
                float f = (1.0 - d / uMouseInfluence) * uMousePushDistance;
                livePos.xy += (diff / d) * f;
            }
        }
    }

    // Smooth spatial gradient across the sculpture blended with mouse hover glow
    float spatialGrad = clamp((homePosition.y + 12.0) / 24.0 + 0.15 * sin(0.12 * homePosition.x), 0.0, 1.0);
    float mouseHeat = clamp(1.0 - distance(uMouse, livePos) / uMouseInfluence, 0.0, 1.0);
    float tMix = clamp(mix(spatialGrad, 1.0, mouseHeat * 0.9), 0.0, 1.0);
    vec3 themeColor = (tMix < 0.5)
        ? mix(uColorCold, uColorWarm, tMix * 2.0)
        : mix(uColorWarm, uColorHot, (tMix - 0.5) * 2.0);

    // Emoji mode keeps the sampled glyph color (eyes, tears, mouth, hearts stay
    // readable); text mode keeps the theme heatmap exactly as before.
    vec3 baseColor = mix(themeColor, sourceColor.rgb, uEmojiMode);

    // Movement heatmap: cooler near the particle's OWN initial position, hotter
    // the further it has been displaced.
    float movement = length(livePos - homePosition);
    float heat = smoothstep(0.05, uHeatDistance, movement);
    vec3 movementColor = (heat < 0.5)
        ? mix(uHeatCold, uHeatWarm, heat * 2.0)
        : mix(uHeatWarm, uHeatHot, (heat - 0.5) * 2.0);

    // Blend the particle's intrinsic themeColor with the kinetic heat and motion
    // so the themed colors remain vivid and animate across the entire trajectory
    vec3 themedMotionColor = mix(themeColor, movementColor, 0.45 * heat);
    vec3 motionColor = mix(themedMotionColor, sourceColor.rgb, uEmojiMode * uEmojiMotionMix);
    vColor = mix(baseColor, motionColor, uExplosionActive);

    // Audio-reactive brightness: mid/high energy brighten the particles, the envelope
    // gives a broad pulse while the blast is sounding.
    float audioBright = 1.0 + 0.35 * uAudioMid + 0.25 * uAudioHigh;
    vColor *= audioBright * (0.85 + 0.30 * uAudioEnvelope);

    // Depth cue: nearer particles (positive z depth) read slightly larger and
    // brighter, so the face-on sculpture still reads volumetric under the
    // orthographic projection.
    float depthCue = 1.0 + uDepthCue * homePosition.z;
    vColor *= depthCue;

    vCoverage = sourceColor.a;
    vSourceUV = aSourceUV;

    // Safe fade for the funnel tail.
    float funnelFade = clamp(
        (funnelT - uTornadoFadeStart) / max(uTornadoFadeEnd - uTornadoFadeStart, 1e-4),
        0.0, 1.0);
    vTornadoFade = mix(1.0, 0.14 + 0.86 * funnelFade, uTornadoActive);

    vec4 mvPosition = modelViewMatrix * vec4(livePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation - corrected for device pixel ratio.
    float effectiveSampleSize = mix(sampleSize, 1.0, uEmojiMode);
    // Style 4 (torus knot): enlarge points so overlapping splats saturate the
    // strand interior — kills the twin-stripe limb artifact of additive blending.
    float stylePointSize = (uMotionStyle == 4) ? 1.3 : 1.0;
    gl_PointSize = uPointSize * uPixelRatio * uPointScale * depthCue * effectiveSampleSize * stylePointSize;
    gl_PointSize *= (1.0 + 0.5 * heat * uExplosionActive + 0.2 * uAudioHigh);
    gl_PointSize *= mix(1.0, 0.76 + 0.24 * funnelFade, uTornadoActive);
}
`;

const fragmentShader = `
uniform float uEmojiMode;
uniform float uUseSourceTexture;
uniform sampler2D uSourceTexture;
varying vec3 vColor;
varying float vCoverage;
varying float vTornadoFade;
varying vec2 vSourceUV;

void main() {
    // Soft circular falloff with a solid bright core for lively, luminous dots
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float softEdge = 1.0 - smoothstep(0.3, 1.0, r);

    // Approach C: sample the source canvas texture at this particle's UV coordinate.
    // Enhanced vibrancy & brightness boost so emojis and images feel luminous and alive.
    if (uUseSourceTexture > 0.5) {
        vec4 texel = texture2D(uSourceTexture, vSourceUV);
        vec3 vibrantColor = min(vec3(1.0), texel.rgb * 1.20);
        vec3 blendedColor = mix(vibrantColor, vColor, uEmojiMode * (1.0 - uUseSourceTexture + 0.001));
        float texAlpha = texel.a * softEdge * vTornadoFade;
        gl_FragColor = vec4(blendedColor, texAlpha);
        return;
    }

    float alpha = 0.9 * softEdge;
    // Emoji particles fade with their source coverage, keeping anti-aliased glyph
    // edges soft; text particles stay fully opaque as before.
    alpha *= mix(1.0, vCoverage, uEmojiMode);
    alpha *= vTornadoFade;
    gl_FragColor = vec4(vColor, alpha);
}
`;

// ---------------------------------------------
// State grouped into named objects
// ---------------------------------------------

// Global configuration state
const state = {
    currentText: 'Bring your message!',
    lastText: 'Bring your message!', // last user-typed text, restored when leaving Emoji/Image
    currentTheme: 'ember',
    currentFont: 'Outfit',
    messageMode: 'text',
    activeImage: null,
    imageName: '',
    activePreset: null,  // Tracks which preset chip is currently selected
    lastRandomPreset: null, // Random preset picked by dbl-tap/Space shortcuts
    activeEmoji: null,   // Set when an emoji is picked from the list; cleared by typing
    lastEmoji: null,     // Remembered last picked emoji, restored when returning to Emoji mode
    lastImage: null,     // Remembered last uploaded image, restored when returning to Image mode
    lastImageName: '',   // Filename of the remembered image (for the picker label)
    audioEnabled: true,  // Controls procedural sound effects synthesis
    gpuPhysics: !(typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('noworker') === '1' || new URLSearchParams(window.location.search).get('gpu') === '0')),

    // Dynamic per-explosion properties
    expansionDuration: CONFIG.presets.DEFAULT.expansionDuration,
    driftDuration: CONFIG.presets.DEFAULT.driftDuration || 3.0,
    contractionDuration: CONFIG.presets.DEFAULT.contractionDuration,
    explosionMaxDistMultiplier: CONFIG.presets.DEFAULT.explosionMaxDistMultiplier,
    motionStyle: CONFIG.presets.DEFAULT.motionStyle,
    activeExpansionDuration: null,
    activeContractionDuration: null,
    activeMaxDist: null,
    actualTravelRadius: 0,   // measured max distance particles actually travelled
    travelApplied: false,    // true once contraction duration is derived from actual travel
    embersSpawned: false,    // true once embers are spawned at peak expansion
    dodgeEmbersFired: false, // true once the murmuration predator-strike sparks fired
    afterglowStartTime: null,
    soundPitch: CONFIG.presets.DEFAULT.soundPitch,
    soundDuration: CONFIG.presets.DEFAULT.soundDuration,
    soundType: CONFIG.presets.DEFAULT.soundType,
    trailStrength: CONFIG.presets.DEFAULT.trailStrength,
    // Per-preset explosion pattern tuning (used by generation + the time-dependent
    // spin/sway applied in both physics paths).
    pattern: {
        spokes:       CONFIG.presets.DEFAULT.spokes,
        spokeJitter:  CONFIG.presets.DEFAULT.spokeJitter,
        spinSpeed:    CONFIG.presets.DEFAULT.spinSpeed,
        funnelHeight: CONFIG.presets.DEFAULT.funnelHeight,
        funnelBottom: CONFIG.presets.DEFAULT.funnelBottom,
        funnelCrownRadius: CONFIG.presets.DEFAULT.funnelCrownRadius,
        funnelWaistRadius: CONFIG.presets.DEFAULT.funnelWaistRadius,
        funnelTailRadius: CONFIG.presets.DEFAULT.funnelTailRadius,
        funnelWaistT: CONFIG.presets.DEFAULT.funnelWaistT,
        funnelCrownT: CONFIG.presets.DEFAULT.funnelCrownT,
        funnelFadeStart: CONFIG.presets.DEFAULT.funnelFadeStart,
        funnelFadeEnd: CONFIG.presets.DEFAULT.funnelFadeEnd,
        trailStrength: 0.25,
        soundPitch: 140,
        soundDuration: 1.5,
        soundType: 'sine'
    },
    heatCold: [0.1, 0.4, 1.0],
    heatWarm: [1.0, 1.0, 0.1],
    heatHot: [1.0, 0.1, 0.1],

    get totalExplosionDuration() {
        const style = (physics && physics.activeStyle >= 0) ? physics.activeStyle : this.motionStyle;
        if (style === 1) {
            // 4-Phase ~15s Tornado Simulation
            const exp = this.expansionDuration || 3.5;
            const vortex = (this.pattern && this.pattern.vortexDuration) ? this.pattern.vortexDuration : 4.5;
            const equil = (this.pattern && this.pattern.equilibriumDuration) ? this.pattern.equilibriumDuration : 3.5;
            const con = this.contractionDuration || 3.5;
            return exp + vortex + equil + con; // 15.0s
        }
        if (style === 2) {
            // 4-Phase Breeze: Straight Fall (1.0s) + Ground Pause (2.0s) + Forward Breeze (3.6s) + Reverse Breeze (3.6s) + Elevation (1.6s) = 11.8s
            return 11.8;
        }
        if (style === 3) {
            // Clean Continuous Surf Wave (7.5s)
            return 7.5;
        }
        if (style === 4) {
            // Trefoil torus knot: Collapse (0-3) -> Knot Flow (3-11.5) -> Reformation (11.5-16) = 16.0s
            return 16.0;
        }
        if (style === 5) {
            // 4-Phase Murmuration: Take-off (2.0s) + Flight (7.0s) + Settle (3.0s) + Landing (2.0s) = 14.0s
            return 14.0;
        }
        const exp = this.activeExpansionDuration || this.expansionDuration;
        const con = this.activeContractionDuration || this.contractionDuration;
        const drift = (style === 0 || style === -1) ? 3.0 : 0.0;
        return exp + drift + con;
    }
};

// Rendering state
const render = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    clock: new Clock(),
    trailPoints: null,
    trailData: null,
    trailLive: null,
    trailPosAttr: null,
    trailLiveAttr: null,
    emberPoints: null,
    emberData: null,
    emberVel: null,
    emberLife: null,
    emberPosAttr: null,
    emberLifeAttr: null,
    targetZ: CONFIG.initialZ,
    autoFit: true, // Keeps the full message fitting the stage until the user zooms manually
    prevTime: 0,
    prevDt: 0,
    prevKFrame: 0,
    prevDampFrame: 0,
};

// Physics state
const physics = {
    posHome: null,      // Rest positions
    posLive: null,      // Resident geometry buffer (never transferred)
    explosionOrigin: null, // Per-particle position at the start of the current blast
    springDisp: null,   // Spring displacement
    springVel: null,    // Spring velocity
    randomDir: null,    // Explosion direction per particle
    randomSpeed: null,  // Explosion speed per particle
    funnelT: null,      // Stable vertical role for the Tornado funnel
    funnelRadialX: null, // Stable radial role in the screen/depth XZ plane
    funnelRadialZ: null,
    activeStyle: -1,    // Actual style selected for the current blast
    slots: [],          // Double-buffered working sets transferred to the worker
    sendQueue: [],      // FIFO of slots currently in flight at the worker
    seq: 0,             // Monotonic token echoed by the worker to pair replies
    sourceGeneration: 0, // Reject worker results from an older text layout
    motionToken: 0,     // Reject worker results from an older blast/recovery phase
    explosionStartTime: -1,
    positionsDirty: false, // true when a fresh worker result (or fallback step) moved particles
    randomized: null,      // { dirs, style } echo of the active blast's generated directions
};

// Particle budget: full density with the worker or GPU, a reduced cap for the main-thread
// CPU fallback so it stays within the frame budget on weaker machines.
function currentParticleCap() {
    const isFallback = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('noworker') === '1');
    if (isFallback) return 15000;
    return (physicsWorker || state.gpuPhysics) ? 30000 : 15000;
}

// Interaction & Input State
const interaction = {
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        '+': false,
        '-': false,
        '=': false,
        ' ': false
    },
    mouseWorld: new Vector3(),
    mouseLocal: new Vector3(),
    invMatrix: new Matrix4(),
    mousePos: { x: -1000, y: -1000, active: false },
    mouseWorldPos: new Vector3(-1000, -1000, 0),
    lastClickTime: 0,
    lastPinchDist: null,
    lastMidpoint: new Vector2(),
    lastGestureEndTime: 0,
    inputDebounceTimer: null,
    toastTimer: null,
    flashTimer: null,
    drawerCloseTimer: null,
    wordmarkTimer: null,      // schedules the next flourish inside the showcase loop
    menuRestoreDesktop: false, // dock body was expanded when the animation started
    menuRestoreMobile: false,  // drawer was open when the animation started
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    pendingPointer: null, // Coalesced latest pointer coords, consumed once per frame
};

// Shader uniforms
const uniforms = {
    uMouse: { value: new Vector3(-1000, -1000, 0) },
    uMouseInfluence: { value: CONFIG.mouseInfluence },
    uPointSize: { value: CONFIG.pointSize },
    uPixelRatio: { value: 1.0 },
    uPointScale: { value: CONFIG.pointSizeAttenuationScale / CONFIG.initialZ },
    uDepthCue: { value: 0.28 },
    uColorHot: { value: new Vector3(1.0, 0.0, 0.0) },
    uColorWarm: { value: new Vector3(1.0, 1.0, 0.0) },
    uColorCold: { value: new Vector3(1.0, 1.0, 1.0) },
    uExplosionActive: { value: 0.0 },
    uTornadoActive: { value: 0.0 },
    uTornadoFadeStart: { value: 0.03 },
    uTornadoFadeEnd: { value: 0.30 },
    // Fixed motion-heat distance for every preset (red = 1/3 screen height at rest).
    uHeatDistance: { value: CONFIG.heatDistance },
    // Per-preset motion heatmap (cold = far, mid = mid, hot = leading edge).
    uHeatCold: { value: new Vector3(0.1, 0.4, 1.0) },
    uHeatWarm: { value: new Vector3(1.0, 1.0, 0.1) },
    uHeatHot: { value: new Vector3(1.0, 0.1, 0.1) },
    // Audio-reactive energy bands (from the shared analyser).
    uAudioMid: { value: 0.0 },
    uAudioHigh: { value: 0.0 },
    uAudioEnvelope: { value: 0.0 },
    // Trail renderer uniforms.
    uPointSizeTrail: { value: 0.4 },
    uTrailStrength: { value: 0.25 },
    // Emoji source-color mode (0 = theme/heat palette, 1 = sampled glyph colors).
    uEmojiMode: { value: 0 },
    uEmojiMotionMix: { value: CONFIG.emojiMotionMix },
    // Approach C: source texture sampling (0 = disabled, 1 = full texture)
    uUseSourceTexture: { value: 0.0 },
    uSourceTexture: { value: null },

    // GPU-Native Kinematics Uniforms
    uGpuPhysics: { value: 1.0 },
    uMotionStyle: { value: 0 },
    uExplosionElapsed: { value: -1.0 },
    uExpDuration: { value: 2.0 },
    uDriftDuration: { value: 3.0 },
    uContractionDuration: { value: 2.0 },
    uMaxDist: { value: 35.0 },
    uSpinSpeed: { value: 5.2 },
    uFunnelBottom: { value: -22.0 },
    uFunnelHeight: { value: 46.0 },
    uFunnelCrownRadius: { value: 22.0 },
    uFunnelWaistRadius: { value: 3.5 },
    uFunnelTailRadius: { value: 0.8 },
    uFunnelWaistT: { value: 0.42 },
    uFunnelCrownExp: { value: 1.4 },
    uBreezeBlowDir: { value: 1.0 },
    uBreezeIntensity: { value: 1.0 },
    uBreezeSwirl: { value: 0.0 },
    // Murmuration randomized flight plan (defaults mirror the JS evaluator's)
    uMSweepX: { value: 24.0 },
    uMSweepY: { value: 4.0 },
    uMSweepZ: { value: 12.0 },
    uMFreqX: { value: 3.456 },
    uMFreqY: { value: 5.341 },
    uMFreqZ: { value: 2.827 },
    uMPhX: { value: 0.4 },
    uMPhY: { value: 0.0 },
    uMPhZ: { value: 1.2 },
    uMLaunchDir: { value: 1.0 },
    uMTurnT: { value: 99.0 },
    uMTurnDir: { value: 1.0 },
    uMSplitT: { value: 99.0 },
    uMSplitAng: { value: 0.0 },
    uMDodge1T: { value: 3.9 },
    uMDodge2T: { value: 7.1 },
    uMDodge3T: { value: 99.0 },
    uMDodgeRad: { value: 8.0 },
    uMDodgeStr: { value: 1.0 },
    uMBoilAmp: { value: 0.0 },
    uMBoilFreq: { value: 14.0 },
    uMChurnMult: { value: 1.0 },
    uMFlutterMult: { value: 1.0 },
    uMJinkAmp: { value: 0.0 },
    uMJinkFreq: { value: 5.5 },
    uMJinkPh: { value: 0.0 },
    uMBreathAmp: { value: 1.0 },
    uMScoutAmp: { value: 0.0 },
    uKnotScale: { value: 11.0 },
    uMouseWorld: { value: new Vector3(-1000, -1000, 0) },
    uMousePushDistance: { value: CONFIG.repulsionStrength },
    uMouseActive: { value: 0.0 }
};

let breezeSeqCounter = 0;
let statusFpsEl = null;
let fpsFrames = 0;
let fpsLastUpdate = 0;

// ---------------------------------------------
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('info', 'success', 'error');
    toast.classList.add(type === 'success' || type === 'error' ? type : 'info');
    toast.classList.add('show');
    clearTimeout(interaction.toastTimer);
    interaction.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ---------------------------------------------
// Screen Reader Accessibility Announcements
// ---------------------------------------------
function announceToScreenReader(message) {
    const el = document.getElementById('sr-announce');
    if (el) {
        el.textContent = message;
    }
}

// ---------------------------------------------
// Impact Flash (procedural, no assets)
// ---------------------------------------------
function flashImpact() {
    const el = document.getElementById('flash');
    if (!el) return;
    el.classList.remove('active');
    // Force reflow so the transition restarts on rapid triggers.
    void el.offsetWidth;
    el.classList.add('active');
    clearTimeout(interaction.flashTimer);
    interaction.flashTimer = setTimeout(() => el.classList.remove('active'), 120);
}

// ---------------------------------------------
// Audio Synthesis (Web Audio API)
// ---------------------------------------------
let audioCtx = null;
let audioMaster = null;    // Shared output gain (all layers route through this)
let audioAnalyser = null;  // Analyser for audio-reactive visuals
let audioFreqData = null;
// Cached broadband noise buffer shared by every explosion's body/crackle layers.
// Lazily build the shared audio graph: master gain -> analyser -> destination.
function ensureAudioGraph() {
    if (audioCtx && audioMaster) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = 1.0;
    audioAnalyser = audioCtx.createAnalyser();
    audioAnalyser.fftSize = 256;
    audioAnalyser.smoothingTimeConstant = 0.6;
    audioMaster.connect(audioAnalyser);
    audioAnalyser.connect(audioCtx.destination);
    audioFreqData = new Uint8Array(audioAnalyser.frequencyBinCount);
}

function computeAudioFreqBand(freqData, from, to, n) {
    let s = 0, c = 0;
    const a = Math.max(0, Math.floor(from * n));
    const b = Math.min(n, Math.floor(to * n));
    for (let i = a; i < b; i++) { s += freqData[i] / 255; c++; }
    return c ? s / c : 0;
}

// Read coarse frequency bands each frame and expose them as shader uniforms so the
// sculpture visually reacts to the sound it generates.
function updateAudioReactive() {
    if (!audioAnalyser || !audioCtx || !audioFreqData) return;
    if (audioCtx.state !== 'running') {
        uniforms.uAudioEnvelope.value = 0;
        return;
    }
    // Optimization: Skip FFT byte copy when simulation is idle and audio has decayed
    if (physics.explosionStartTime < 0 && uniforms.uAudioEnvelope.value < 0.005 && uniforms.uAudioMid.value < 0.005 && uniforms.uAudioHigh.value < 0.005) {
        uniforms.uAudioMid.value = 0;
        uniforms.uAudioHigh.value = 0;
        uniforms.uAudioEnvelope.value = 0;
        return;
    }
    audioAnalyser.getByteFrequencyData(audioFreqData);
    const n = audioFreqData.length;
    const bass = computeAudioFreqBand(audioFreqData, 0.02, 0.25, n);
    const mid  = computeAudioFreqBand(audioFreqData, 0.25, 0.55, n);
    const high = computeAudioFreqBand(audioFreqData, 0.55, 0.92, n);
    // Smooth each band toward its target.
    uniforms.uAudioMid.value  += (mid  - uniforms.uAudioMid.value)  * 0.5;
    uniforms.uAudioHigh.value += (high - uniforms.uAudioHigh.value) * 0.5;
    const env = Math.min(1, bass * 1.3 + mid * 0.5 + high * 0.6);
    uniforms.uAudioEnvelope.value += (env - uniforms.uAudioEnvelope.value) * 0.6;
}



// Low, swelling rumble that plays during the contraction phase, tuned to the actual
// recovery duration so larger explosions audibly resolve more slowly.
function scheduleContractionRumble(duration) {
    try {
        ensureAudioGraph();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const len = Math.max(0.3, duration * 0.55);

        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + len);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + Math.min(0.25, len * 0.3));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

        osc.connect(gain);
        gain.connect(audioMaster);
        osc.start(now);
        osc.stop(now + len + 0.05);

        setTimeout(() => {
            try { osc.disconnect(); gain.disconnect(); } catch (_) { /* ended */ }
        }, (len + 0.1) * 1000);
    } catch (err) {
        console.warn('Rumble synthesis error:', err);
    }
}
const loadedFonts = new Set(['Outfit']);

// ---------------------------------------------
// Font Loading Optimization
// ---------------------------------------------
async function ensureFontLoaded(fontFamily) {
    if (!fontFamily) return;
    const fontSpec = `bold ${CONFIG.fontSize}px "${fontFamily}"`;
    try {
        await document.fonts.load(fontSpec);
    } catch (err) {
        console.warn(`Font load note for "${fontFamily}":`, err);
    }
}

// ---------------------------------------------
// Text Rasterization (Reusing single offscreen canvas)
// ---------------------------------------------
let offscreenCanvas = null;
let offscreenCtx = null;

function sampleTextPoints(text) {
    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }
    const canvas = offscreenCanvas;
    const ctx = offscreenCtx;

    canvas.width  = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${CONFIG.fontSize}px "${state.currentFont}", sans-serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2);

    const imgData = ctx.getImageData(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight).data;
    const W = CONFIG.canvasWidth, H = CONFIG.canvasHeight;
    const step = CONFIG.pixelStep, thr = CONFIG.pixelThreshold;

    // Pass 1: count sampled points and the bounding box, so we can allocate one flat
    // buffer up front and compute the centre/scale once (avoid per-point object churn).
    let rawCount = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
            if (imgData[(y * W + x) * 4] > thr) {
                rawCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (rawCount === 0) return null;

    const scale = CONFIG.targetWorldWidth / Math.max(maxX - minX, 1);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Pass 2: fill a flat interleaved (x, y, z) triple buffer.
    const flat = new Float32Array(rawCount * 3);
    let fi = 0;
    for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
            if (imgData[(y * W + x) * 4] > thr) {
                flat[fi++] = (x - cx) * scale;
                flat[fi++] = (cy - y) * scale;
                flat[fi++] = 0;
            }
        }
    }
    return flat;
}

// ---------------------------------------------
// Uploaded Image Rasterization
// ---------------------------------------------
let imageCanvas = null;
let imageCtx = null;

function sampleImagePoints(image) {
    if (!image) return null;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) return null;

    if (!imageCanvas) {
        imageCanvas = document.createElement('canvas');
        imageCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
    }

    const size = CONFIG.imageRasterSize;
    const canvas = imageCanvas;
    const ctx = imageCtx;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;

    const padding = Math.round(size * 0.04);
    const drawScale = Math.min(
        (size - padding * 2) / sourceWidth,
        (size - padding * 2) / sourceHeight
    );
    const drawWidth = Math.max(1, Math.round(sourceWidth * drawScale));
    const drawHeight = Math.max(1, Math.round(sourceHeight * drawScale));
    const drawX = Math.round((size - drawWidth) / 2);
    const drawY = Math.round((size - drawHeight) / 2);
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const imgData = ctx.getImageData(0, 0, size, size).data;
    const step = CONFIG.imagePixelStep;
    const alphaThreshold = CONFIG.imageAlphaThreshold;
    const basePoints = [];
    const colors = [];
    const covers = [];
    const sizes = [];
    const isEdgeList = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    const alphaOf = (x, y) => {
        if (x < 0 || y < 0 || x >= size || y >= size) return 0;
        return imgData[(y * size + x) * 4 + 3];
    };

    for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
            const i = (y * size + x) * 4;
            const alpha = imgData[i + 3];
            if (alpha <= alphaThreshold) continue;

            basePoints.push(x, y);
            colors.push(imgData[i], imgData[i + 1], imgData[i + 2]);
            covers.push(alpha);
            sizes.push(1);

            const isBoundary = alphaOf(x - step, y) <= alphaThreshold
                || alphaOf(x + step, y) <= alphaThreshold
                || alphaOf(x, y - step) <= alphaThreshold
                || alphaOf(x, y + step) <= alphaThreshold;
            isEdgeList.push(isBoundary);

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    if (basePoints.length === 0) return null;

    const sourceWidthPx = Math.max(maxX - minX, 1);
    const sourceHeightPx = Math.max(maxY - minY, 1);
    const scale = CONFIG.targetWorldWidth / Math.max(sourceWidthPx, sourceHeightPx);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const depthRange = CONFIG.imageDepthRange || 5.0;
    const halfD = depthRange * 0.5;
    const baseCount = basePoints.length / 2;

    const outPts = [];
    const outUVs = [];
    const outColors = [];
    const outCovers = [];
    const outSizes = [];

    // 1. Back Face (drawn first)
    for (let i = 0; i < baseCount; i += 8) {
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        outPts.push((px - cx) * scale, (cy - py) * scale, -halfD);
        outUVs.push(px / size, 1.0 - (py / size));
        outColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        outCovers.push(covers[i]);
        outSizes.push(sizes[i]);
    }

    // 2. Extrusion Side Rims (drawn second)
    for (let i = 0; i < baseCount; i++) {
        if (!isEdgeList[i]) continue;
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        const r = colors[i * 3], g = colors[i * 3 + 1], b = colors[i * 3 + 2];
        const a = covers[i], s = sizes[i];
        const u = px / size, v = 1.0 - (py / size);
        const wx = (px - cx) * scale, wy = (cy - py) * scale;

        outPts.push(wx, wy, -halfD * 0.33);
        outUVs.push(u, v);
        outColors.push(r, g, b);
        outCovers.push(a);
        outSizes.push(s);

        outPts.push(wx, wy, halfD * 0.33);
        outUVs.push(u, v);
        outColors.push(r, g, b);
        outCovers.push(a);
        outSizes.push(s);
    }

    // 3. Front Face (drawn LAST, on top of everything)
    for (let i = 0; i < baseCount; i++) {
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        outPts.push((px - cx) * scale, (cy - py) * scale, halfD);
        outUVs.push(px / size, 1.0 - (py / size));
        outColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        outCovers.push(covers[i]);
        outSizes.push(sizes[i]);
    }

    const flat = new Float32Array(outPts);
    const uvs = new Float32Array(outUVs);
    const colorsOut = new Uint8Array(outColors);
    const coversOut = new Uint8Array(outCovers);
    const sizesOut = new Uint8Array(outSizes);

    return {
        flat,
        uvs,
        colors: colorsOut,
        covers: coversOut,
        sizes: sizesOut,
        featureCount: baseCount,
        frontCount: baseCount,
        bounds: { w: sourceWidthPx, h: sourceHeightPx },
        sourceCanvas: canvas
    };
}

// ---------------------------------------------
// Emoji Rasterization (high-detail two-pass sampling)
// ---------------------------------------------
let emojiCanvas = null;
let emojiCtx = null;

function sampleEmojiPoints(emoji) {
    if (!emojiCanvas) {
        emojiCanvas = document.createElement('canvas');
        emojiCtx = emojiCanvas.getContext('2d', { willReadFrequently: true });
    }
    const canvas = emojiCanvas;
    const ctx = emojiCtx;

    const size = CONFIG.emojiRasterSize;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'white';
    ctx.font = `${CONFIG.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.02);

    const imgData = ctx.getImageData(0, 0, size, size).data;
    const step = CONFIG.emojiPixelStep || 2;
    const alphaThr = CONFIG.pixelThreshold;     // coverage mask (0-255)

    const basePoints = [];
    const colors = [];
    const covers = [];
    const sizes = [];
    const isEdgeList = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    const alphaOf = (x, y) => {
        if (x < 0 || y < 0 || x >= size || y >= size) return 0;
        return imgData[(y * size + x) * 4 + 3];
    };

    // Single uniform raster grid sampling across the entire emoji (equal density everywhere)
    for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
            const i = (y * size + x) * 4;
            const alpha = imgData[i + 3];
            if (alpha <= alphaThr) continue;

            basePoints.push(x, y);
            colors.push(imgData[i], imgData[i + 1], imgData[i + 2]);
            covers.push(alpha);
            sizes.push(1); // Uniform dot size across all regions

            const isBoundary = alphaOf(x - step, y) <= alphaThr
                || alphaOf(x + step, y) <= alphaThr
                || alphaOf(x, y - step) <= alphaThr
                || alphaOf(x, y + step) <= alphaThr;
            isEdgeList.push(isBoundary);

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    if (basePoints.length === 0) return null;

    const scale = CONFIG.targetWorldWidth / Math.max(maxX - minX, 1);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const depthRange = CONFIG.emojiDepthRange || 5.0;
    const halfD = depthRange * 0.5;
    const baseCount = basePoints.length / 2;

    const outPts = [];
    const outUVs = [];
    const outColors = [];
    const outCovers = [];
    const outSizes = [];

    // 1. Back Face (z = -halfD, sampled at 4px stride, drawn first behind)
    for (let i = 0; i < baseCount; i += 4) {
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        outPts.push((px - cx) * scale, (cy - py) * scale, -halfD);
        outUVs.push(px / size, 1.0 - (py / size));
        outColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        outCovers.push(covers[i]);
        outSizes.push(1);
    }

    // 2. Extrusion Side Rims (silhouette perimeter pixels along depth)
    for (let i = 0; i < baseCount; i++) {
        if (!isEdgeList[i]) continue;
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        const r = colors[i * 3], g = colors[i * 3 + 1], b = colors[i * 3 + 2];
        const a = covers[i];
        const u = px / size, v = 1.0 - (py / size);
        const wx = (px - cx) * scale, wy = (cy - py) * scale;

        outPts.push(wx, wy, -halfD * 0.33);
        outUVs.push(u, v);
        outColors.push(r, g, b);
        outCovers.push(a);
        outSizes.push(1);

        outPts.push(wx, wy, halfD * 0.33);
        outUVs.push(u, v);
        outColors.push(r, g, b);
        outCovers.push(a);
        outSizes.push(1);
    }

    // 3. Front Face (z = +halfD, 100% full uniform density, drawn last on top)
    for (let i = 0; i < baseCount; i++) {
        const px = basePoints[i * 2], py = basePoints[i * 2 + 1];
        outPts.push((px - cx) * scale, (cy - py) * scale, halfD);
        outUVs.push(px / size, 1.0 - (py / size));
        outColors.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        outCovers.push(covers[i]);
        outSizes.push(1);
    }

    const flat = new Float32Array(outPts);
    const uvs = new Float32Array(outUVs);
    const colorsOut = new Uint8Array(outColors);
    const coversOut = new Uint8Array(outCovers);
    const sizesOut = new Uint8Array(outSizes);

    return {
        flat,
        uvs,
        colors: colorsOut,
        covers: coversOut,
        sizes: sizesOut,
        featureCount: baseCount,
        frontCount: baseCount,
        bounds: { w: maxX - minX, h: maxY - minY },
        sourceCanvas: canvas
    };
}

// ---------------------------------------------
// Particle Setup (Font Check + Capped Count + Worker Sync)
// ---------------------------------------------
let setupRequestId = 0;

async function setupParticles(text, shouldScatter = false) {
    setupRequestId++;
    const currentRequestId = setupRequestId;

    // Pre-load custom fonts asynchronously on demand
    await ensureFontLoaded(state.currentFont);
    const fontSpec = `bold ${CONFIG.fontSize}px "${state.currentFont}"`;
    if (!document.fonts.check(fontSpec)) {
        try {
            await document.fonts.load(fontSpec);
        } catch (err) {
            console.warn(`Failed to pre-load custom font "${state.currentFont}":`, err);
        }
    }

    // If another setup request started while waiting for fonts, drop this stale execution
    if (currentRequestId !== setupRequestId) return;
    physics.sourceGeneration++;
    physics.motionToken++;
    physics.randomized = null;

    // Living-morph support: capture the current rendered positions so that (when the
    // particle count is unchanged) the particles can flow from the old message into
    // the new one, rather than blinking out and back in.
    const isMorph = !!render.particles;
    let oldLive = null;
    if (isMorph) {
        const pa = render.particles.geometry.attributes.position;
        oldLive = pa ? pa.array : null;
    }

    // Emojis picked from the list and uploaded images use their source pixels;
    // anything typed or loaded as regular text keeps the standard text path.
    const isEmojiMessage = state.messageMode === 'emoji'
        && state.activeEmoji
        && CONFIG.emojiOptions.includes(state.activeEmoji);
    const isImageMessage = state.messageMode === 'image' && !!state.activeImage;
    const emojiData = isEmojiMessage ? sampleEmojiPoints(text) : null;
    const imageData = isImageMessage ? sampleImagePoints(state.activeImage) : null;
    const sourceData = emojiData || imageData;
    const isSourceMessage = !!sourceData;
    const points = sourceData ? sourceData.flat : (isImageMessage ? null : sampleTextPoints(text));
    if (!points) {
        showToast(isImageMessage ? 'The image has no visible pixels!' : 'Text must contain at least one visible character!', 'error');
        return;
    }

    // One particle per sampled cell for source images (max recognizable detail under
    // the particle cap) instead of the text path's density-clone stacking.
    const { jitterXY, jitterZ, explosionSpeedMin, explosionSpeedRange } = CONFIG;
    const density = isSourceMessage ? CONFIG.emojiDensityOverride : CONFIG.density;
    let pointCount = points.length / 3;
    let step = 1;

    // Subsample points if overall particle count budget is exceeded. Emoji features
    // are kept first; image pixels use a regular stride over the source raster.
    const maxParticles = currentParticleCap();
    const maxPoints = Math.floor(maxParticles / density);
    let flat = points;
    let srcColors = null;   // Uint8Array RGB source colors
    let srcCovers = null;   // Uint8Array source coverage
    let srcSizes = null;    // Uint8Array raster cell size per sample
    let srcUVs  = null;    // Float32Array UV coords (Approach C)
    if (isSourceMessage) {
        srcColors = sourceData.colors;
        srcCovers = sourceData.covers;
        srcSizes = sourceData.sizes;
        srcUVs   = sourceData.uvs || null;
        if (pointCount > maxParticles) {
            const keep = [];
            const frontCount = sourceData.frontCount || pointCount;

            if (frontCount <= maxParticles) {
                // Front face fits entirely within budget! Keep 100% of the front face.
                for (let i = 0; i < frontCount; i++) keep.push(i);

                // Allocate remaining budget to side and back points
                const remaining = maxParticles - frontCount;
                const extraCount = pointCount - frontCount;
                if (remaining > 0 && extraCount > 0) {
                    const extraStep = Math.max(1, Math.ceil(extraCount / remaining));
                    for (let i = frontCount; i < pointCount && keep.length < maxParticles; i += extraStep) {
                        keep.push(i);
                    }
                }
            } else {
                // Front face itself exceeds budget (e.g. CPU fallback 15k cap on large image).
                // Use a uniform 2D stride that covers all rows/columns evenly without vertical banding.
                const step = Math.ceil(frontCount / maxParticles);
                for (let i = 0; i < frontCount && keep.length < maxParticles; i += step) {
                    keep.push(i);
                }
            }

            const cFlat = new Float32Array(keep.length * 3);
            const cColors = new Uint8Array(keep.length * 3);
            const cCovers = new Uint8Array(keep.length);
            const cSizes = new Uint8Array(keep.length);
            const cUVs = srcUVs ? new Float32Array(keep.length * 2) : null;
            for (let k = 0; k < keep.length; k++) {
                const i = keep[k];
                cFlat[k * 3] = flat[i * 3];
                cFlat[k * 3 + 1] = flat[i * 3 + 1];
                cFlat[k * 3 + 2] = flat[i * 3 + 2];
                cColors[k * 3] = srcColors[i * 3];
                cColors[k * 3 + 1] = srcColors[i * 3 + 1];
                cColors[k * 3 + 2] = srcColors[i * 3 + 2];
                cCovers[k] = srcCovers[i];
                cSizes[k] = srcSizes[i];
                if (cUVs && srcUVs) {
                    cUVs[k * 2]     = srcUVs[i * 2];
                    cUVs[k * 2 + 1] = srcUVs[i * 2 + 1];
                }
            }
            flat = cFlat;
            srcColors = cColors;
            srcCovers = cCovers;
            srcSizes = cSizes;
            srcUVs  = cUVs;
            pointCount = keep.length;
        }
    } else {
        const count = pointCount * density;
        if (count > maxParticles) {
            step = Math.max(1, Math.ceil(pointCount / maxPoints));
        }
    }

    const sampledCount = Math.ceil(pointCount / step);
    const finalCount = sampledCount * density;

    physics.posHome    = new Float32Array(finalCount * 3);
    physics.posLive    = new Float32Array(finalCount * 3);
    physics.explosionOrigin = new Float32Array(finalCount * 3);
    physics.springDisp = new Float32Array(finalCount * 3);
    physics.springVel  = new Float32Array(finalCount * 3);
    physics.randomDir  = new Float32Array(finalCount * 3);
    physics.randomSpeed = new Float32Array(finalCount);
    physics.funnelT = new Float32Array(finalCount);
    physics.funnelRadialX = new Float32Array(finalCount);
    physics.funnelRadialZ = new Float32Array(finalCount);

    // Stable low-discrepancy roles fill the funnel evenly without per-frame random
    // work. The vertical role is biased slightly toward the broad crown so the
    // narrow tail remains a sparse, fading stream rather than a dense stem.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < finalCount; i++) {
        // Distribute particles across height with dense sampling along the conical vortex
        const verticalSeed = (i * 0.6180339887498949 + 0.5) % 1;
        const shellDist = 0.75 + 0.3 * ((i * 0.7548776662466927 + 0.17) % 1);
        const angle = (i * goldenAngle) % (Math.PI * 2);
        physics.funnelT[i] = Math.pow(verticalSeed, 0.85);
        physics.funnelRadialX[i] = Math.cos(angle) * shellDist;
        physics.funnelRadialZ[i] = Math.sin(angle) * shellDist;
    }

    // Per-particle source appearance: RGBA + raster-cell size. Emojis carry their
    // sampled glyph colors/coverage; text is white/opaque unit-size cells.
    const srcColorArr = new Uint8Array(finalCount * 4);
    const srcSizeArr = new Uint8Array(finalCount);
    // Approach C: UV attribute buffer (2 floats per particle).
    const srcUVArr = new Float32Array(finalCount * 2);

    // Build fresh double-buffered worker working sets below (after resident buffers
    // are populated), since any prior in-flight slots have been transferred away.

    // Emoji/image layouts keep their 2D source continuity: much lower XY/Z jitter
    // than text so thin internal details stay continuous.
    const imageJitter = isEmojiMessage
        ? { xy: CONFIG.emojiJitterXY, z: CONFIG.emojiJitterZ }
        : { xy: CONFIG.imageJitterXY, z: CONFIG.imageJitterZ };
    const jx = isSourceMessage ? imageJitter.xy : jitterXY;
    const jz = isSourceMessage ? imageJitter.z : jitterZ;

    let si = 0;
    for (let i = 0; i < pointCount; i += step, si++) {
        const px = flat[i * 3], py = flat[i * 3 + 1], pz = flat[i * 3 + 2];
        for (let d = 0; d < density; d++) {
            const idx = si * density + d;
            const ix = idx * 3, iy = ix + 1, iz = ix + 2;

            const hx = px + (Math.random() - 0.5) * jx;
            const hy = py + (Math.random() - 0.5) * jx;
            const hz = pz + (Math.random() - 0.5) * jz;

            physics.posHome[ix] = hx;
            physics.posHome[iy] = hy;
            physics.posHome[iz] = hz;

            // Particle Birth Animation: Scatter initial live positions only if requested
            const ox = shouldScatter ? (Math.random() - 0.5) * 45 : 0;
            const oy = shouldScatter ? (Math.random() - 0.5) * 45 : 0;
            const oz = shouldScatter ? (Math.random() - 0.5) * 35 : 0;

            physics.posLive[ix] = hx + ox;
            physics.posLive[iy] = hy + oy;
            physics.posLive[iz] = hz + oz;

            physics.springDisp[ix] = ox;
            physics.springDisp[iy] = oy;
            physics.springDisp[iz] = oz;

            // Spherical distribution for explosion direction
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos((Math.random() * 2) - 1);
            physics.randomDir[ix] = Math.sin(phi) * Math.cos(theta);
            physics.randomDir[iy] = Math.sin(phi) * Math.sin(theta);
            physics.randomDir[iz] = Math.cos(phi);

            physics.randomSpeed[idx] = explosionSpeedMin + Math.random() * explosionSpeedRange;

            // Source appearance aligned with this particle (density clones share it).
            // srcColors is RGB-per-point (3 bytes); the shader attribute is RGBA (4).
            if (srcColors) {
                srcColorArr[idx * 4]     = srcColors[i * 3];
                srcColorArr[idx * 4 + 1] = srcColors[i * 3 + 1];
                srcColorArr[idx * 4 + 2] = srcColors[i * 3 + 2];
                srcColorArr[idx * 4 + 3] = srcCovers[i];
                srcSizeArr[idx] = srcSizes[i];
                // Approach C: copy UV from the source point (density clones share it).
                if (srcUVs) {
                    srcUVArr[idx * 2]     = srcUVs[i * 2];
                    srcUVArr[idx * 2 + 1] = srcUVs[i * 2 + 1];
                }
            } else {
                srcColorArr[idx * 4]     = 255;
                srcColorArr[idx * 4 + 1] = 255;
                srcColorArr[idx * 4 + 2] = 255;
                srcColorArr[idx * 4 + 3] = 255;
                srcSizeArr[idx] = 1;
                // Text particles: UV is zeroed (uUseSourceTexture will be 0 for text).
                srcUVArr[idx * 2] = 0;
                srcUVArr[idx * 2 + 1] = 0;
            }
        }
    }

    // Measure the built sculpture's world-space extent so the camera can frame
    // it at the largest size the available stage (minus margins) allows.
    contentBox = measureContentBox();

    // Refit the camera to the new content: message changes re-zoom to the
    // message type's framing (text/emoji/image all share the same max-fit),
    // pre-user-zoom.
    if (render.autoFit) updateStageLayout();

    // Morph transition: when particle counts match, start particles at their OLD
    // positions so the spring pulls them smoothly into the new glyph. Otherwise use
    // the scatter cloud set above for a dissolve-and-reform morph.
    if (isMorph && !shouldScatter && oldLive && oldLive.length === physics.posLive.length) {
        physics.posLive.set(oldLive);
        physics.springDisp.fill(0);
        physics.springVel.fill(0);
    }
    physics.explosionOrigin.set(physics.posLive);

    // Rebuild double-buffered worker working sets ("slots") to match the current arrays.
    physics.slots = [];
    physics.sendQueue = [];
    for (let s = 0; s < 2; s++) {
        const slot = {
            posLive: new Float32Array(finalCount * 3),
            springDisp: new Float32Array(finalCount * 3),
            springVel: new Float32Array(finalCount * 3),
            inFlight: false,
            needsReset: false
        };
        slot.posLive.set(physics.posLive);
        slot.springDisp.set(physics.springDisp);
        slot.springVel.set(physics.springVel);
        physics.slots.push(slot);
    }
    // Reuse the existing geometry when morphing so the sculpture never disappears;
    // otherwise create it on the first build.
    const isFirstBuild = !render.particles;
    const geo = isFirstBuild
        ? new BufferGeometry()
        : render.particles.geometry;

    const posAttr = new BufferAttribute(physics.posLive, 3);
    posAttr.setUsage(DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    // Per-particle rest/glyph positions, used by the shader to color by displacement.
    geo.setAttribute('homePosition', new BufferAttribute(physics.posHome, 3));
    // Source appearance: emoji glyph colors + coverage (normalized bytes) and the
    // raster-cell size each particle represents (drives sprite size).
    geo.setAttribute('sourceColor', new BufferAttribute(srcColorArr, 4, true));
    geo.setAttribute('sampleSize', new BufferAttribute(srcSizeArr, 1));
    geo.setAttribute('funnelT', new BufferAttribute(physics.funnelT, 1));
    // Approach C: UV attribute for source texture sampling.
    geo.setAttribute('aSourceUV', new BufferAttribute(srcUVArr, 2));

    // Populate initial random vectors
    randomizeExplosionVectors();

    // GPU-Native Kinematics Attributes
    const aIndexArr = new Float32Array(finalCount);
    const aSeedArr = new Float32Array(finalCount * 3);
    const aCustomDirArr = new Float32Array(finalCount);
    for (let i = 0; i < finalCount; i++) {
        aIndexArr[i] = i;
        aSeedArr[i * 3] = physics.funnelRadialX[i];
        aSeedArr[i * 3 + 1] = 0;
        aSeedArr[i * 3 + 2] = physics.funnelRadialZ[i];
        aCustomDirArr[i] = (i % 2 === 0) ? 1.0 : -1.0;
    }
    geo.setAttribute('aRandomDir', new BufferAttribute(new Float32Array(physics.randomDir), 3));
    geo.setAttribute('aRandomSpeed', new BufferAttribute(new Float32Array(physics.randomSpeed), 1));
    geo.setAttribute('aIndex', new BufferAttribute(aIndexArr, 1));
    geo.setAttribute('aSeed', new BufferAttribute(aSeedArr, 3));
    geo.setAttribute('aCustomDir', new BufferAttribute(aCustomDirArr, 1));

    if (isFirstBuild) {
        const mat = new ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            blending: AdditiveBlending,
            depthWrite: false,
            transparent: true,
        });
        render.particles = new Points(geo, mat);
        render.scene.add(render.particles);
    }

    // Source layouts (emoji/image) use the sampled source colors with normal alpha
    // blending (so dark pixels render) and a crisp, low-jitter, low-depth-cue
    // profile. Text keeps the theme/heat additive style unchanged.
    uniforms.uEmojiMode.value = isSourceMessage ? 1 : 0;
    uniforms.uPointSize.value = isEmojiMessage
        ? CONFIG.emojiPointSize
        : (isImageMessage ? CONFIG.imagePointSize : CONFIG.pointSize);
    uniforms.uDepthCue.value = isEmojiMessage
        ? CONFIG.emojiDepthCue
        : (isImageMessage ? CONFIG.imageDepthCue : 0.28);
    render.particles.material.blending = isSourceMessage ? NormalBlending : AdditiveBlending;
    render.particles.material.needsUpdate = true;

    // Approach C: upload the source canvas as a texture and enable texture sampling.
    // Dispose the previous texture first to prevent GPU memory leaks (the memory
    // test already tracks textureCount, so this must stay clean across rebuilds).
    if (uniforms.uSourceTexture.value) {
        uniforms.uSourceTexture.value.dispose();
        uniforms.uSourceTexture.value = null;
    }
    if (isSourceMessage && sourceData && sourceData.sourceCanvas) {
        const tex = new CanvasTexture(sourceData.sourceCanvas);
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.needsUpdate = true;
        uniforms.uSourceTexture.value = tex;
        uniforms.uUseSourceTexture.value = 1.0;
    } else {
        uniforms.uUseSourceTexture.value = 0.0;
    }

    // New layouts always begin face-on so the text itself is not presented at an
    // inherited angle from a previous interaction.
    render.particles.rotation.set(0, 0, 0);

    // Sync initialized positions to the Web Worker. Pass CLONED copies so the worker
    // owns its arrays and the main-thread arrays stay attached for the resident
    // geometry attributes (homePosition) and the CPU fallback (never transferred).
    if (physicsWorker) {
        physicsWorker.postMessage({
            type: 'init',
            data: {
                posHome: physics.posHome.slice(),
                explosionOrigin: physics.explosionOrigin.slice(),
                randomDir: physics.randomDir.slice(),
                randomSpeed: physics.randomSpeed.slice(),
                funnelT: physics.funnelT.slice(),
                funnelRadialX: physics.funnelRadialX.slice(),
funnelRadialZ: physics.funnelRadialZ.slice()
            }
        });
    }

    buildTrailsAndEmbers();
}

// Build (or rebuild) the trail-streak and ember-spark secondary layers to match the
// current particle pool. Reused across morphs; never disposed mid-frame.
function buildTrailsAndEmbers() {
    const n = physics.posLive.length;

    // -- Trail streak layer ----------------------------------------------
    render.trailData = new Float32Array(n);
    render.trailLive = new Float32Array(n);
    render.trailData.set(physics.posLive);
    render.trailLive.set(physics.posLive);

    const tPosAttr = new BufferAttribute(render.trailData, 3);
    tPosAttr.setUsage(DynamicDrawUsage);
    const tLiveAttr = new BufferAttribute(render.trailLive, 3);
    tLiveAttr.setUsage(DynamicDrawUsage);

    if (render.trailPoints) {
        render.scene.remove(render.trailPoints);
        // Release the previous layer's GPU resources so repeated text/font changes do
        // not leak geometries/materials until the next garbage collection.
        render.trailPoints.geometry.dispose();
        render.trailPoints.material.dispose();
    }
    const tgeo = new BufferGeometry();
    tgeo.setAttribute('position', tPosAttr);
    tgeo.setAttribute('livePosition', tLiveAttr);
    tgeo.setAttribute('homePosition', new BufferAttribute(physics.posHome, 3));
    tgeo.setAttribute('funnelT', new BufferAttribute(physics.funnelT, 1));
    render.trailPoints = new Points(tgeo, new ShaderMaterial({
        uniforms,
        vertexShader: trailVertexShader,
        fragmentShader: trailFragmentShader,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true
    }));
    render.trailPoints.frustumCulled = false;
    render.scene.add(render.trailPoints);
    render.trailPosAttr = tPosAttr;
    render.trailLiveAttr = tLiveAttr;

    // -- Ember spark layer (capped) --------------------------------------
    const EC = 300;
    render.emberData = new Float32Array(EC * 3);
    render.emberVel = new Float32Array(EC * 3);
    render.emberLife = new Float32Array(EC);
    render.emberCount = EC;

    const ePosAttr = new BufferAttribute(render.emberData, 3);
    ePosAttr.setUsage(DynamicDrawUsage);
    const eLifeAttr = new BufferAttribute(render.emberLife, 1);
    eLifeAttr.setUsage(DynamicDrawUsage);

    if (render.emberPoints) {
        render.scene.remove(render.emberPoints);
        render.emberPoints.geometry.dispose();
        render.emberPoints.material.dispose();
    }
    const egeo = new BufferGeometry();
    egeo.setAttribute('position', ePosAttr);
    egeo.setAttribute('aLife', eLifeAttr);
    render.emberPoints = new Points(egeo, new ShaderMaterial({
        uniforms: {},
        vertexShader: emberVertexShader,
        fragmentShader: emberFragmentShader,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true
    }));
    render.emberPoints.renderOrder = 2;
    render.scene.add(render.emberPoints);
    render.emberPosAttr = ePosAttr;
    render.emberLifeAttr = eLifeAttr;
}

// Chase the live positions so fast particles leave coloured streaks behind them.
function updateTrails() {
    if (!render.particles || !render.trailData) return;
    if (isMotionReduced && render.trailPoints) { render.trailPoints.visible = false; return; }
    if (state.gpuPhysics && physics.explosionStartTime >= 0) {
        if (render.trailPoints) render.trailPoints.visible = false;
        return;
    }
    if (render.trailPoints) render.trailPoints.visible = true;

    // State-based idle settling gate: when no active explosion, dragging or mouse
    // movement occurs, allow ~20 frames of decay for trails to smoothly converge to rest,
    // then completely bypass the 90,000 float loop and GPU buffer uploads during idle.
    const isActivelyMoving = physics.positionsDirty
        || (physics.explosionStartTime >= 0)
        || (interaction.isDragging)
        || (interaction.mouseLocal && interaction.mouseLocal.x > -500);

    if (!isActivelyMoving) {
        if (render.trailSettleFrames >= 20) {
            return;
        }
        render.trailSettleFrames = (render.trailSettleFrames || 0) + 1;
    } else {
        render.trailSettleFrames = 0;
    }
    physics.positionsDirty = false;

    const pos = render.particles.geometry.attributes.position.array;
    const tPos = render.trailData;
    const tLive = render.trailLive;
    const k = 0.22;
    for (let i = 0; i < pos.length; i++) {
        tPos[i] += (pos[i] - tPos[i]) * k;
        tLive[i] = pos[i];
    }
    render.trailPosAttr.needsUpdate = true;
    render.trailLiveAttr.needsUpdate = true;
}

// Burst ember sparks outward from the expanded particle field at peak, so the sparks
// feel connected to the main sculpture instead of detaching from its centre.
function spawnEmbers() {
    if (!render.emberData || !render.particles) return;
    if (isMotionReduced) return;

    // Scale the spark budget per preset.
    const preset = (state.activePreset && CONFIG.presets[state.activePreset]) || null;
    const budget = preset ? (preset.emberBudget || 90) : 90;
    const E = Math.min(render.emberCount, budget);
    const pos = render.particles.geometry.attributes.position.array;
    const home = physics.explosionOrigin || physics.posHome;
    const n3 = pos.length;

    // Choose source particles on the outer shell of the explosion (displaced from home).
    const candidates = [];
    for (let i = 0; i < n3 / 3; i++) {
        const i3 = i * 3;
        const dx = pos[i3] - home[i3];
        const dy = pos[i3 + 1] - home[i3 + 1];
        const dz = pos[i3 + 2] - home[i3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > 1.0) candidates.push(i);
    }
    if (candidates.length === 0) return;

    for (let i = 0; i < E; i++) {
        const i3 = i * 3;
        const src = candidates[(Math.random() * candidates.length) | 0];
        const s3 = src * 3;
        // Inherit the source particle's current position and outward direction.
        render.emberData[i3]     = pos[s3];
        render.emberData[i3 + 1] = pos[s3 + 1];
        render.emberData[i3 + 2] = pos[s3 + 2];

        const ox = pos[s3] - home[s3];
        const oy = pos[s3 + 1] - home[s3 + 1];
        const oz = pos[s3 + 2] - home[s3 + 2];
        const olen = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        const push = 3 + Math.random() * 14;
        // Outward direction + small tangential jitter.
        render.emberVel[i3]     = (ox / olen) * push + (Math.random() - 0.5) * 4;
        render.emberVel[i3 + 1] = (oy / olen) * push + (Math.random() - 0.5) * 4;
        render.emberVel[i3 + 2] = (oz / olen) * push * 0.5 + (Math.random() - 0.5) * 2;
        render.emberLife[i] = 0.35 + Math.random() * 0.45;
    }
}

// Murmuration predator ride-along position (attack #0 weave) — mirrors the
// evaluator's formula so the burst lands exactly where the falcon is drawn.
function murmurPredatorStrikePos(plan, elapsed) {
    const g = plan || {};
    const swX = (g.mSweepX != null) ? g.mSweepX : 24.0;
    const swY = (g.mSweepY != null) ? g.mSweepY : 4.0;
    const swZ = (g.mSweepZ != null) ? g.mSweepZ : 12.0;
    const fX = (g.mFreqX != null) ? g.mFreqX : 3.456;
    const fY = (g.mFreqY != null) ? g.mFreqY : 5.341;
    const fZ = (g.mFreqZ != null) ? g.mFreqZ : 2.827;
    const phX = (g.mPhX != null) ? g.mPhX : 0.4;
    const phY = (g.mPhY != null) ? g.mPhY : 0.0;
    const phZ = (g.mPhZ != null) ? g.mPhZ : 1.2;
    const qt = Math.min(8.9, elapsed * 0.92 + 1.1);
    const qU = Math.max(0.0, (qt - 2.0) / 7.0);
    return {
        x: swX * Math.sin(qU * fX + phX) + 5.0 * Math.sin(1.7 * elapsed + 1.0),
        y: swY * Math.sin(qU * fY + phY) + 3.0 * Math.sin(qU * Math.PI) + 2.0 * Math.sin(1.3 * elapsed),
        z: swZ * Math.sin(qU * fZ + phZ) + 4.0 * Math.sin(1.6 * elapsed + 2.0)
    };
}

// Murmuration startle sparks: the flock's panicked reflex burst when the
// predator first strikes. Embers originate at the predator's position and
// blast outward independently of the live particle buffer, so the burst is
// identical on the GPU-shader, worker, and CPU physics paths.
function spawnStartleSparks(elapsed) {
    if (!render.emberData || !render.emberPoints) return;
    if (isMotionReduced) return;

    // Scale the spark budget per preset.
    const preset = (state.activePreset && CONFIG.presets[state.activePreset]) || null;
    const budget = preset ? (preset.emberBudget || 60) : 60;
    const E = Math.min(render.emberCount, budget);
    const q = murmurPredatorStrikePos(state.pattern, elapsed);

    for (let i = 0; i < E; i++) {
        const i3 = i * 3;
        render.emberData[i3]     = q.x + (Math.random() - 0.5) * 1.6;
        render.emberData[i3 + 1] = q.y + (Math.random() - 0.5) * 1.6;
        render.emberData[i3 + 2] = q.z + (Math.random() - 0.5) * 1.6;

        let vx = Math.random() * 2 - 1, vy = Math.random() * 2 - 1, vz = Math.random() * 2 - 1;
        const vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
        const push = 5 + Math.random() * 8;
        render.emberVel[i3]     = (vx / vl) * push;
        render.emberVel[i3 + 1] = (vy / vl) * push + 3;   // slight startle uplift
        render.emberVel[i3 + 2] = (vz / vl) * push;
        render.emberLife[i] = 0.35 + Math.random() * 0.45;
    }
    render.emberPosAttr.needsUpdate = true;
    render.emberLifeAttr.needsUpdate = true;
}

function updateEmbers(dt) {
    if (!render.emberData) return;
    if (isMotionReduced && render.emberPoints) { render.emberPoints.visible = false; return; }
    if (render.emberPoints) render.emberPoints.visible = true;

    const E = render.emberCount;
    const drag = Math.pow(0.02, dt);
    let activeCount = 0;
    for (let i = 0; i < E; i++) {
        if (render.emberLife[i] <= 0) continue;
        activeCount++;
        const i3 = i * 3;
        render.emberData[i3]     += render.emberVel[i3] * dt;
        render.emberData[i3 + 1] += render.emberVel[i3 + 1] * dt;
        render.emberData[i3 + 2] += render.emberVel[i3 + 2] * dt;
        // Gently pull embers toward gravity/down + drag.
        render.emberVel[i3 + 1] -= 8 * dt;
        render.emberVel[i3]     *= drag;
        render.emberVel[i3 + 1] *= drag;
        render.emberVel[i3 + 2] *= drag;
        render.emberLife[i] -= dt;
        if (render.emberLife[i] <= 0) render.emberLife[i] = 0;
    }
    if (activeCount > 0) {
        render.emberPosAttr.needsUpdate = true;
        render.emberLifeAttr.needsUpdate = true;
    }
}

// ---------------------------------------------
// Mouse Utilities & Optimization
// ---------------------------------------------
const _vec = new Vector3();

function updateMouse(clientX, clientY) {
    const rect = render.renderer.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;

    if (render.camera.isOrthographicCamera) {
        // Orthographic cameras project along parallel rays: unprojecting the
        // NDC point lands directly on the world z=0 plane of the sculpture.
        _vec.set(nx, ny, 0).unproject(render.camera);
        interaction.mouseWorld.copy(_vec);
        interaction.mouseWorld.z = 0;
    }
}

// ---------------------------------------------
// Explosion Vector & Parameter Randomization
// ---------------------------------------------
function randomizeExplosionVectors() {
    if (!physics.randomDir || !physics.randomSpeed) return;
    const count = physics.randomSpeed.length;
    const { explosionSpeedMin, explosionSpeedRange } = CONFIG;
    const pattern = state.pattern;
    const home = physics.posHome;

    // Pick a randomized explosion pattern for this blast. Pattern styles:
    // 0: uniform sphere (Explode), 1: tornado funnel (Tornado),
    // 2: coherent wind gust (Breeze), 3: crisp starburst rays (Kinetic).
    // Respect a pinned preset style when one is active.
    const style = (typeof state.motionStyle === 'number' && state.motionStyle >= 0)
        ? state.motionStyle
        : Math.floor(Math.random() * 4);

    // Procedural randomized Tornado configuration (style 1)
    if (style === 1) {
        const spinDirection = Math.random() < 0.5 ? 1.0 : -1.0;
        const spinSpeed = (3.8 + Math.random() * 2.8) * spinDirection; // 3.8 - 6.6 rad/s clockwise or counter-clockwise
        const funnelHeight = 38.0 + Math.random() * 16.0;              // 38 - 54 height
        const funnelCrownRadius = 18.0 + Math.random() * 12.0;         // 18 - 30 top canopy spread
        const funnelWaistRadius = 2.4 + Math.random() * 2.8;          // 2.4 - 5.2 vortex eye constriction
        const funnelTailRadius = 0.8 + Math.random() * 1.6;           // 0.8 - 2.4 ground touchdown base
        const funnelWaistT = 0.32 + Math.random() * 0.16;             // 0.32 - 0.48 waist vertical ratio
        const funnelCrownExp = 1.15 + Math.random() * 0.65;           // 1.15 - 1.80 canopy curvature profile

        state.pattern = {
            ...state.pattern,
            spinSpeed,
            funnelHeight,
            funnelCrownRadius,
            funnelWaistRadius,
            funnelTailRadius,
            funnelWaistT,
            funnelCrownExp
        };
    }

    // Procedural randomized 3D breeze configuration (style 2) with varied sequence intensity
    breezeSeqCounter++;
    // Varied dynamic intensity tiers across sequenced triggers:
    // 0: Fresh Billowing Gust (~1.35)
    // 1: Strong Surging Gale (~1.85)
    // 2: Gentle Whispering Draft (~0.90)
    // 3: Sweeping High Ribbon Storm (~2.20)
    const intensityModes = [1.35, 1.85, 0.90, 2.20];
    const baseTier = intensityModes[breezeSeqCounter % intensityModes.length];
    const breezeIntensity = baseTier * (0.92 + Math.random() * 0.16);

    // Alternate / shift blow direction across sequential animations
    const blowFromLeft = (breezeSeqCounter % 2 === 1) ? true : (Math.random() < 0.5);
    const dirX = blowFromLeft ? 1.0 : -1.0;
    let gx = dirX;
    let gy = (Math.random() - 0.5) * 0.08;
    let gz = (Math.random() - 0.5) * 0.05;
    const glen = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
    gx /= glen; gy /= glen; gz /= glen;
    gustX = gx; gustY = gy; gustZ = gz;
    // Varied dynamic swirl levels across sequenced animations:
    // Some triggers have 0.0 (pure smooth ribbon glide, zero swirl),
    // others have soft (0.35), medium (0.85), or powerful whirlwind curl (1.45)!
    const swirlModes = [0.0, 0.85, 1.45, 0.35, 0.0, 1.20];
    const baseSwirl = swirlModes[breezeSeqCounter % swirlModes.length];
    const breezeSwirl = (baseSwirl === 0.0) ? 0.0 : baseSwirl * (0.85 + Math.random() * 0.30);

    activeBreezeConfig = {
        blowDir: dirX,
        intensity: breezeIntensity,
        swirl: breezeSwirl,
        windAngleY: (Math.random() - 0.5) * 0.22,
        windAngleZ: (Math.random() - 0.5) * 0.12,
        strengthMult: breezeIntensity,
        easePower: 1.45 + Math.random() * 0.40,
        seedXi: Math.random() * 100.0,
        peakX: (Math.random() - 0.5) * 22.0,
        peakY: 3.5 + Math.random() * 5.0,
        peakAmp: (16.0 + Math.random() * 7.0) * breezeIntensity,
        peakWidthX: 0.065 + Math.random() * 0.025,
        peakWidthY: 0.11 + Math.random() * 0.035,
        creaseY: -(3.5 + Math.random() * 4.0),
        creaseAmp: 6.5 + Math.random() * 3.0,
        creaseFreq: 0.11 + Math.random() * 0.04,
        billowAmp1: 7.5 + Math.random() * 3.0,
        billowAmp2: 3.0 + Math.random() * 2.0,
        depthAmp: 13.0 + Math.random() * 4.5,
        turbAmp: 3.0 + Math.random() * 1.8,
        shearMult: 0.22 + Math.random() * 0.18
    };
    physics.breeze = activeBreezeConfig;

    // Fibonacci-sphere spoke lattice for style 3 (deterministic per spoke index).
    const spokes = Math.max(2, pattern.spokes || 12);
    const jitter = (pattern.spokeJitter != null) ? pattern.spokeJitter : 0.03;
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;

        let rx, ry, rz;

        if (style === 1) {
            // Tornado directions use screen-up Y and swirl in the visible X/Z
            // funnel plane. The actual target profile is applied in the update loop;
            // these directions keep the blast's semantic debug signal consistent.
            const hx = home[ix], hz = home[iz];
            const r2 = hx * hx + hz * hz;
            let tx, tz;
            if (r2 > 1e-6) {
                const inv = 1 / Math.sqrt(r2);
                tx = -hz * inv;
                tz =  hx * inv;
            } else {
                const a = Math.random() * Math.PI * 2;
                tx = Math.cos(a); tz = Math.sin(a);
            }
            const spinSign = Math.random() < 0.5 ? 1 : -1;
            rx = tx * spinSign + (Math.random() - 0.5) * 0.15;
            ry = 0.72 + (Math.random() - 0.5) * 0.12;
            rz = tz * spinSign + (Math.random() - 0.5) * 0.15;
        } else if (style === 2) {
            // Traveling horizontal wind gust: strictly Left-to-Right or Right-to-Left
            gx = dirX;
            gy = (Math.random() - 0.5) * 0.04;
            gz = (Math.random() - 0.5) * 0.04;
            const gLen = Math.hypot(gx, gy, gz) || 1;
            gx /= gLen; gy /= gLen; gz /= gLen;

            rx = gx * 0.92 + (Math.random() * 2 - 1) * 0.08;
            ry = (Math.random() * 2 - 1) * 0.12;
            rz = (Math.random() * 2 - 1) * 0.12;
            gustX = gx; gustY = gy; gustZ = gz;
        } else if (style === 3) {
            // Starburst rays: each particle snaps onto one of `spokes` crisp 3D
            // directions with tiny angular jitter, so the blast reads as rays.
            const sp = i % spokes;
            const sa = sp * golden;
            const sb = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * (sp + 0.5) / spokes)));
            const sx = Math.sin(sb) * Math.cos(sa);
            const sy = Math.sin(sb) * Math.sin(sa);
            const sz = Math.cos(sb);
            rx = sx + (Math.random() - 0.5) * 2 * jitter;
            ry = sy + (Math.random() - 0.5) * 2 * jitter;
            rz = sz + (Math.random() - 0.5) * 2 * jitter;
        } else {
            // Uniform sphere (style 0): fully symmetric explosion.
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos((Math.random() * 2) - 1);
            rx = Math.sin(phi) * Math.cos(theta);
            ry = Math.sin(phi) * Math.sin(theta);
            rz = Math.cos(phi);
        }

        const len = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        rx /= len; ry /= len; rz /= len;

        if (style === 2) {
            // Strong gust: fast, purposeful speeds so the breeze reads clearly.
            physics.randomSpeed[i] = (explosionSpeedMin + Math.random() * explosionSpeedRange) * (1.4 + Math.random() * 0.9);
        } else if (style === 3) {
            // Rays travel fast and uniformly so the spokes stay crisp.
            physics.randomSpeed[i] = (explosionSpeedMin + Math.random() * explosionSpeedRange) * (1.5 + Math.random() * 0.7);
        } else {
            const speedVar = 0.75 + Math.random() * 0.55;
            physics.randomSpeed[i] = (explosionSpeedMin + Math.random() * explosionSpeedRange) * speedVar;
        }

        physics.randomDir[ix] = rx;
        physics.randomDir[iy] = ry;
        physics.randomDir[iz] = rz;
    }

    // Echo a leading slice of the generated directions for the pattern tests.
    physics.randomized = {
        dirs: physics.randomDir.slice(0, DIRECTIONS_VERIFY * 3),
        style
    };
    physics.activeStyle = style;

    // Upload randomized directions and speeds to GPU attribute buffers
    if (render.particles && render.particles.geometry) {
        const attrDir = render.particles.geometry.attributes.aRandomDir;
        if (attrDir && attrDir.array && attrDir.array.length === physics.randomDir.length) {
            attrDir.copyArray(physics.randomDir);
            attrDir.needsUpdate = true;
        }
        const attrSpd = render.particles.geometry.attributes.aRandomSpeed;
        if (attrSpd && attrSpd.array && attrSpd.array.length === physics.randomSpeed.length) {
            attrSpd.copyArray(physics.randomSpeed);
            attrSpd.needsUpdate = true;
        }
    }
}

function captureExplosionOrigin() {
    if (!render.particles || !physics.explosionOrigin) return;
    const current = render.particles.geometry.attributes.position.array;
    if (current.length !== physics.explosionOrigin.length) return;

    physics.explosionOrigin.set(current);
    physics.posLive.set(current);
    physics.springDisp.fill(0);
    physics.springVel.fill(0);
    physics.motionToken++;

    // The worker's double-buffered slots also hold the previous state (e.g. preset
    // scatter spring displacement). Reset free slots now; flag in-flight ones (their
    // buffers are detached while at the worker) so the dispatch loop resets them. This
    // prevents one slot leaking scatter-scale spring motion into the new blast.
    for (const slot of physics.slots) {
        if (slot.inFlight) {
            slot.needsReset = true;
        } else {
            if (!slot.posLive || !slot.posLive.buffer || slot.posLive.buffer.byteLength === 0) {
                slot.posLive = new Float32Array(current.length);
                slot.springDisp = new Float32Array(current.length);
                slot.springVel = new Float32Array(current.length);
            }
            slot.posLive.set(current);
            slot.springDisp.fill(0);
            slot.springVel.fill(0);
            slot.needsReset = false;
        }
    }
}

// Enable / disable preset animation buttons during active animation
function setAnimationControlsDisabled(disabled) {
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
        chip.disabled = disabled;
        chip.classList.toggle('disabled', disabled);
        if (disabled) {
            chip.setAttribute('aria-disabled', 'true');
        } else {
            chip.removeAttribute('aria-disabled');
        }
    });
}

function triggerExplosion(force = false) {
    if (physics.explosionStartTime >= 0) return;
    physics.explosionStartTime = -1;

    // Every particle explodes from the position the user actually sees, not from
    // the screen center or its eventual text position.
    captureExplosionOrigin();

    // Reset per-blast state
    state.actualTravelRadius = 0;
    state.travelApplied = false;
    state.embersSpawned = false;
    state.dodgeEmbersFired = false;
    state.afterglowStartTime = null;
    fallbackMaxTravelSq = 0;

    // Procedural randomized murmuration flight plan + event schedule (style 5):
    // every blast flies a different choreography — sweep, whip jinks, a snap
    // turn, an optional split-and-merge, 2-3 predator strikes, and per-blast
    // chaos levels. The fields ride state.pattern to the shader uniforms, to
    // the worker via the 'randomize' message, and to the CPU fallback.
    if (state.motionStyle === 5) {
        // Event placement avoids pathological stacking: the snap turn never
        // lands inside the split's +/-1.4s neighborhood, and predator strike
        // centers keep >=1.35s gaps so their parting cavities don't pile up.
        const mSplitT = Math.random() < 0.55 ? (4.3 + Math.random() * 2.0) : 99.0;
        let mTurnT = mSplitT < 90.0 ? 99.0 : (3.3 + Math.random() * 2.6);
        if (mSplitT < 90.0) {
            // Split active: try to place the turn outside its neighborhood.
            const avoidLo = mSplitT - 1.4, avoidHi = mSplitT + 1.4;
            let tt = 3.3 + Math.random() * 2.6;   // [3.3, 5.9]
            if (tt > avoidLo && tt < avoidHi) {
                tt = tt < mSplitT
                    ? Math.max(3.3, avoidLo - 0.8 * Math.random())
                    : Math.min(5.9, avoidHi + 0.8 * Math.random());
                if (tt > avoidLo && tt < avoidHi) tt = 99.0;   // drop rather than stack
            }
            mTurnT = tt;
        }
        const d1 = 3.25 + Math.random() * 0.55;
        const d2 = d1 + 1.35 + Math.random() * 0.7;
        let d3 = 99.0;
        if (Math.random() < 0.45) {
            const cand = d2 + 1.35 + Math.random() * 0.5;
            d3 = cand <= 6.95 ? cand : 99.0;
        }
        state.pattern = {
            ...state.pattern,
            mSweepX: 16.0 + Math.random() * 14.0,
            mSweepY: 3.5 + Math.random() * 4.0,
            mSweepZ: 8.0 + Math.random() * 8.0,
            mFreqX: 2.8 + Math.random() * 1.2,
            mFreqY: 4.6 + Math.random() * 1.4,
            mFreqZ: 2.2 + Math.random() * 1.2,
            mPhX: Math.random() * 6.283,
            mPhY: Math.random() * 6.283,
            mPhZ: Math.random() * 6.283,
            mLaunchDir: Math.random() < 0.5 ? 1.0 : -1.0,
            // Snap turn: sharp lateral whiplash of the whole flock (99.0 = off)
            mTurnT,
            mTurnDir: Math.random() < 0.5 ? 1.0 : -1.0,
            // Split & merge: 55% of blasts tear into two lobes mid-flight
            mSplitT,
            mSplitAng: Math.random() * 6.283,
            // Predator strikes: two guaranteed attacks plus a 45% third one
            mDodge1T: d1,
            mDodge2T: d2,
            mDodge3T: d3,
            mDodgeRad: 6.5 + Math.random() * 3.0,
            mDodgeStr: 0.85 + Math.random() * 0.6,
            // Interior chaos levels
            mBoilAmp: 1.4 + Math.random() * 0.8,
            mBoilFreq: 11.0 + Math.random() * 3.0,
            mChurnMult: 1.2 + Math.random() * 0.6,
            mFlutterMult: 1.25 + Math.random() * 0.6,
            mJinkAmp: 2.5 + Math.random() * 1.7,
            mJinkFreq: 4.5 + Math.random() * 2.5,
            mJinkPh: Math.random() * 6.283,
            mBreathAmp: 1.25 + Math.random() * 0.65,
            // Darting-scout burst strength (0 disables scouts entirely)
            mScoutAmp: 0.85 + Math.random() * 0.45
        };
    }

    // Randomize active timing and distance multipliers per blast
    state.activeMaxDist = state.explosionMaxDistMultiplier * (0.8 + Math.random() * 0.4);
    state.activeExpansionDuration = state.expansionDuration * (0.85 + Math.random() * 0.3);

    // Initial recovery estimate
    state.activeContractionDuration = state.contractionDuration || 4.0;

    const estimatedRecovery = state.activeContractionDuration;

    if (state.gpuPhysics) {
        randomizeExplosionVectors();
    } else if (physicsWorker) {
        // Re-randomize particle trajectory vectors/speeds inside the worker, so the
        // 30k-particle trig loop never hitches the main thread at blast time.
        physicsWorker.postMessage({
            type: 'randomize',
            data: {
                explosionSpeedMin: CONFIG.explosionSpeedMin,
                explosionSpeedRange: CONFIG.explosionSpeedRange,
                motionStyle: state.motionStyle,
                pattern: state.pattern,
                breeze: activeBreezeConfig,
                explosionOrigin: physics.explosionOrigin.slice(),
                motionToken: physics.motionToken,
                sourceGeneration: physics.sourceGeneration
            }
        });
    } else {
        randomizeExplosionVectors();
    }

    physics.explosionStartTime = render.clock.getElapsedTime();
    setAnimationControlsDisabled(true);

    // Tuck the options menu away while the animation plays (it returns when the
    // animation finishes). This runs for every trigger — preset chip, dbl-tap,
    // multi-tap, or Space — so site sparks behave exactly like menu sparks.
    closeMenuForAnimation();

    // Surface which animation is running in the context line, whichever way it
    // was sparked (preset chip, dbl-tap, or Space).
    const presetName = state.activePreset || state.lastRandomPreset;
    const preset = presetName && CONFIG.presets[presetName] ? CONFIG.presets[presetName] : null;
    updateContextLine(preset && preset.description ? preset.description : contextForMode(state.messageMode));

    if (state.motionStyle === 0 || state.motionStyle === -1) {
        flashImpact();
    }
    if (state.audioEnabled) {
        playExplosionSound(state, estimatedRecovery);
    }
    announceToScreenReader(`Explosion triggered for "${state.currentText}"`);
}


// ---------------------------------------------
// URL Parameter Synchronisation (Undo/Redo Support)
// ---------------------------------------------
function updateURLParams(text, theme, font, shouldPush = true) {
    const url = new URL(window.location);
    url.searchParams.set('t', text);
    url.searchParams.set('theme', theme);
    url.searchParams.set('font', font);
    if (shouldPush) {
        window.history.pushState({}, '', url);
    } else {
        window.history.replaceState({}, '', url);
    }
}

// ---------------------------------------------
// Custom UI Event Handlers
// ---------------------------------------------
// Copy a preset's explosion physics/pattern/visual tuning into state and apply the
// explosion-only visual uniforms. The user's theme/font always stay untouched.
function applyPresetPhysics(preset) {
    state.activeExpansionDuration = null;
    state.activeContractionDuration = null;
    state.expansionDuration = preset.expansionDuration;
    state.driftDuration = preset.driftDuration !== undefined ? preset.driftDuration : 0;
    state.contractionDuration = preset.contractionDuration;
    state.explosionMaxDistMultiplier = preset.explosionMaxDistMultiplier;
    state.motionStyle = (preset.motionStyle != null) ? preset.motionStyle : -1;
    physics.activeStyle = state.motionStyle;
    state.soundPitch = preset.soundPitch;
    state.soundDuration = preset.soundDuration;
    state.soundType = preset.soundType;
    state.trailStrength = (preset.trailStrength != null) ? preset.trailStrength : 0.25;

    state.pattern = {
        spokes:       (preset.spokes != null)       ? preset.spokes       : 12,
        spokeJitter:  (preset.spokeJitter != null)  ? preset.spokeJitter  : 0.03,
        spinSpeed:    (preset.spinSpeed != null)    ? preset.spinSpeed    : 0,
        funnelHeight: (preset.funnelHeight != null) ? preset.funnelHeight : 0,
        funnelBottom: (preset.funnelBottom != null) ? preset.funnelBottom : 0,
        funnelCrownRadius: (preset.funnelCrownRadius != null) ? preset.funnelCrownRadius : 0,
        funnelWaistRadius: (preset.funnelWaistRadius != null) ? preset.funnelWaistRadius : 0,
        funnelTailRadius: (preset.funnelTailRadius != null) ? preset.funnelTailRadius : 0,
        funnelWaistT: (preset.funnelWaistT != null) ? preset.funnelWaistT : 0,
        funnelCrownT: (preset.funnelCrownT != null) ? preset.funnelCrownT : 0,
        funnelFadeStart: (preset.funnelFadeStart != null) ? preset.funnelFadeStart : 0,
        funnelFadeEnd: (preset.funnelFadeEnd != null) ? preset.funnelFadeEnd : 0,
        vortexDuration: (preset.vortexDuration != null) ? preset.vortexDuration : 4.5,
        equilibriumDuration: (preset.equilibriumDuration != null) ? preset.equilibriumDuration : 3.5,
        swayAmp:      (preset.swayAmp != null)      ? preset.swayAmp      : 0,
        swayFreq:     (preset.swayFreq != null)     ? preset.swayFreq     : 0,
        gustAmp:      (preset.gustAmp != null)      ? preset.gustAmp      : 0,
        gustFreq:     (preset.gustFreq != null)     ? preset.gustFreq     : 0,
        windDrift:    (preset.windDrift != null)    ? preset.windDrift    : 0,
        turbulence:   (preset.turbulence != null)   ? preset.turbulence   : 0
    };

    // Always preserve and apply the user's selected theme colors during animations
    const currentThemeObj = CONFIG.themes[state.currentTheme] || CONFIG.themes.ember;
    state.heatCold = currentThemeObj.cold;
    state.heatWarm = currentThemeObj.warm;
    state.heatHot  = currentThemeObj.hot;

    uniforms.uHeatCold.value.set(...state.heatCold);
    uniforms.uHeatWarm.value.set(...state.heatWarm);
    uniforms.uHeatHot.value.set(...state.heatHot);
    uniforms.uTornadoFadeStart.value = state.pattern.funnelFadeStart;
    uniforms.uTornadoFadeEnd.value = state.pattern.funnelFadeEnd;
    uniforms.uTrailStrength.value = state.trailStrength;
}

function resetToDefaultExplosion() {
    applyPresetPhysics(CONFIG.presets.DEFAULT);
}

// Apply active preset's settings, or pick a random preset if none is selected.
// Used by dblclick / Space / multi-tap shortcuts.
function applyActiveOrRandomPreset() {
    if (physics.explosionStartTime >= 0) return;
    if (state.activePreset) {
        // Settings already loaded when user clicked the preset chip — nothing to do.
        return;
    }
    // No preset selected: pick a random named preset (exclude DEFAULT).
    const namedPresets = Object.keys(CONFIG.presets).filter(k => k !== 'DEFAULT');
    const pick = namedPresets[Math.floor(Math.random() * namedPresets.length)];
    applyPresetPhysics(CONFIG.presets[pick]);
    state.lastRandomPreset = pick;
}

function selectTheme(themeName, shouldPush = true) {
    const theme = CONFIG.themes[themeName] || CONFIG.themes.ember;
    state.currentTheme = themeName;
    uniforms.uColorHot.value.set(...theme.hot);
    uniforms.uColorWarm.value.set(...theme.warm);
    uniforms.uColorCold.value.set(...theme.cold);
    uniforms.uHeatHot.value.set(...theme.hot);
    uniforms.uHeatWarm.value.set(...theme.warm);
    uniforms.uHeatCold.value.set(...theme.cold);

    document.querySelectorAll('.theme-swatch').forEach(swatch => {
        const on = swatch.getAttribute('data-theme') === themeName;
        swatch.classList.toggle('active', on);
        swatch.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    updateURLParams(state.currentText, state.currentTheme, state.currentFont, shouldPush);
    announceToScreenReader(`Theme changed to ${themeName}`);
}

async function selectFont(fontName, shouldPush = true, shouldScatter = false) {
    state.currentFont = fontName;
    document.querySelectorAll('#font-select, #drawer-font-select').forEach(sel => {
        sel.value = fontName;
    });

    if (state.messageMode !== 'text') {
        state.messageMode = 'text';
        setMessageModeUI('text');
    }
    if (state.activeEmoji) {
        state.activeEmoji = null;
        setEmojiActive(null);
    }

    await ensureFontLoaded(fontName);
    await setupParticles(state.currentText, shouldScatter);
    updateURLParams(state.currentText, state.currentTheme, state.currentFont, shouldPush);
    announceToScreenReader(`Font changed to ${fontName}`);
}

async function updateText(text, shouldPush = true) {
    const val = text.trim();
    const finalVal = val.length > 0 ? val : 'Bring your message!';
    state.currentText = finalVal;

    // Remember the user's text so returning to Text mode after an Emoji/Image
    // pick restores it (emoji/image updates run with a non-text messageMode and
    // therefore never clobber this).
    if (state.messageMode === 'text') {
        state.lastText = finalVal;
    }

    await setupParticles(finalVal, false);
    updateURLParams(state.currentText, state.currentTheme, state.currentFont, shouldPush);
    announceToScreenReader(`Text updated to "${state.currentText}"`);
}

function updateCharCounter(text) {
    const counters = document.querySelectorAll('.char-counter');
    if (!counters.length) return;

    // Count Unicode code points so a single emoji reads as 1/25 (its UTF-16 pair
    // would otherwise count as 2).
    const len = [...text].length;
    counters.forEach(counter => {
        counter.textContent = `${len}/25`;

        counter.classList.remove('warning', 'danger');
        if (len >= 25) {
            counter.classList.add('danger');
        } else if (len >= 20) {
            counter.classList.add('warning');
        }
    });
}

// Set explosion custom physics + sound parameters per preset
async function applyPresetExplosion(presetName, shouldScatter = false) {
    applyPresetPhysics(CONFIG.presets[presetName] || CONFIG.presets.DEFAULT);

    // If particle positions need a full rebuild, do so; otherwise keep the formed sculpture
    if (shouldScatter) {
        await setupParticles(state.currentText, true);
    }
}

// ---------------------------------------------
// Pointer & Gesture Handlers
// ---------------------------------------------
// Any pointer/touch/double-click that starts on UI chrome must not drive the canvas.
const UI_GUARD_SELECTOR = '#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast';
const isUIEvent = (e) => !!e.target.closest(UI_GUARD_SELECTOR);

function onPointerDown(e) {
    if (isUIEvent(e)) return;

    // Desktop mouse drag rotation start
    if (e.pointerType === 'mouse') {
        interaction.isDragging = true;
        interaction.prevMouseX = e.clientX;
        interaction.prevMouseY = e.clientY;
    }

    if (e.pointerType === 'touch' && !e.isPrimary) return;

    const now = performance.now();
    interaction.clickCount = (now - interaction.lastClickTime < CONFIG.tapWindowMs)
        ? interaction.clickCount + 1
        : 1;
    interaction.lastClickTime = now;

    if (interaction.clickCount >= CONFIG.tapCount) {
        applyActiveOrRandomPreset(); // Use active preset or random if none selected
        triggerExplosion();
        interaction.clickCount = 0;
    }
}

function onTouchStart(e) {
    if (isUIEvent(e)) return;
    if (e.touches.length === 1) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        interaction.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        interaction.lastMidpoint.set(
            (e.touches[0].clientX + e.touches[1].clientX) / 2,
            (e.touches[0].clientY + e.touches[1].clientY) / 2
        );
    }
}

function onTouchMove(e) {
    if (isUIEvent(e)) return;
    e.preventDefault();

    if (e.touches.length === 1) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (interaction.lastPinchDist) {
            render.targetZ -= (dist - interaction.lastPinchDist) * 0.15;
            render.autoFit = false;
        }
        interaction.lastPinchDist = dist;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        if (render.particles) {
            render.particles.rotation.y += (midX - interaction.lastMidpoint.x) * 0.005;
            render.particles.rotation.x += (midY - interaction.lastMidpoint.y) * 0.005;
        }
        interaction.lastMidpoint.set(midX, midY);
    }
}

// Reset desktop drag variables
function onPointerUp(e) {
    if (e.pointerType === 'mouse') {
        interaction.isDragging = false;
    }
}

function onTouchEnd() {
    interaction.lastPinchDist = null;
    interaction.lastGestureEndTime = performance.now();
}

// Stage sizing + camera framing relative to the space not occupied by the menu.
function updateStageLayout() {
    const stage = document.getElementById('stage');
    const w = Math.max(stage.clientWidth, 1);
    const h = Math.max(stage.clientHeight, 1);
    render.camera.aspect = w / h;

    // Recompute the frustum from the current camera depth (matches animate(), so
    // the aspect is kept in sync even before the next frame).
    const halfHeight = render.camera.position.z * Math.tan(CONFIG.cameraAngleDeg * Math.PI / 360);
    const halfWidth  = halfHeight * render.camera.aspect;
    render.camera.left   = -halfWidth;
    render.camera.right  =  halfWidth;
    render.camera.top    =  halfHeight;
    render.camera.bottom = -halfHeight;
    render.camera.updateProjectionMatrix();

    render.renderer.setSize(w, h, false); // CSS (stage) controls the element size
    const dpr = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);
    render.renderer.setPixelRatio(dpr);
    uniforms.uPixelRatio.value = dpr;

    // Auto-fit the sculpture to the largest size the stage allows, leaving a
    // margin on every side that accommodates the top bar and the options menu
    // (dock on desktop, input bar on mobile) so the object never touches them.
    if (render.autoFit) {
        render.targetZ = contentAutoZoom(w, h);
    }
}

// Height of the top UI chrome (wordmark + status pill / hamburger row) that
// overlays the stage; used as top clearance so the sculpture never hides behind
// the header.
function topbarHeight() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return 0;
    return topbar.getBoundingClientRect().height;
}

// Height of the bottom UI chrome that overlays the stage (desktop dock or the
// mobile input bar). Framing uses this as bottom clearance so the sculpture is
// never hidden behind the controls. While the dock is collapsed the header row
// is measured directly so mid-transition rects never jitter the framing.
function bottomChromeHeight() {
    const dock = document.getElementById('dock');
    if (dock) {
        if (dock.classList.contains('collapsed')) {
            const row = dock.firstElementChild;
            const rowH = row ? row.getBoundingClientRect().height : 0;
            return rowH + 24; // dock vertical padding (py-3 top + bottom)
        }
        const rect = dock.getBoundingClientRect();
        if (rect.height > 0) return rect.height;
    }
    const inputBar = document.getElementById('input-bar');
    if (inputBar) {
        const rect = inputBar.getBoundingClientRect();
        if (rect.height > 0) return rect.height;
    }
    return 0;
}

// Measure the current sculpture's world-space bounding box (X/Y only; the depth
// layers repeat the same silhouette at different Z).
function measureContentBox() {
    const home = physics.posHome;
    if (!home || home.length === 0) return { w: 80, h: 80 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < home.length; i += 3) {
        const x = home[i], y = home[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    const w = maxX - minX, h = maxY - minY;
    if (!isFinite(w) || !isFinite(h) || w < 1e-6 || h < 1e-6) return { w: 80, h: 80 };
    return { w, h };
}

// Unified max-fit framing for text, emoji, and image messages. The sculpture is
// fitted to the largest size the stage allows while leaving CONFIG.fitMargin on
// every side plus the top bar / bottom chrome clearances, so the object never
// touches the options menu. The per-axis available space converts to a camera
// distance; the larger distance wins so both constraints are satisfied. Only the
// camera distance changes — the raster scale is untouched, so each object's own
// aspect ratio is preserved exactly.
function contentAutoZoom(stageW, stageH) {
    const tanHalf = Math.tan(CONFIG.cameraAngleDeg * Math.PI / 360);
    const box = contentBox;
    const margin = CONFIG.fitMargin;
    const availW = Math.max(stageW - 2 * margin, 1);
    const availH = Math.max(stageH - (topbarHeight() + margin) - (bottomChromeHeight() + margin), 1);
    const zByWidth  = box.w * stageH / (2 * tanHalf * availW);
    const zByHeight = box.h * stageH / (2 * tanHalf * availH);
    return Math.min(CONFIG.zoomMax, Math.max(zByWidth, zByHeight, CONFIG.zoomMin));
}

const CONTEXT_DEFAULT = 'Type a message — your words become thousands of glowing particles.';
const CONTEXT_EMOJI = 'Pick an emoji — it bursts into thousands of glowing, colorful particles.';
const CONTEXT_IMAGE = 'Upload an image — its pixels become thousands of glowing particles.';

// Context hint for the active message type (Text / Emoji / Image).
function contextForMode(mode) {
    if (mode === 'emoji') return CONTEXT_EMOJI;
    if (mode === 'image') return CONTEXT_IMAGE;
    return CONTEXT_DEFAULT;
}

// Update the dock's contextual description line (and its mobile drawer copy).
function updateContextLine(text) {
    const line = document.getElementById('context-line');
    if (line) line.textContent = text;
    const mobile = document.getElementById('mobile-context-line');
    if (mobile) mobile.textContent = text;
}

// Highlight the active preset button, clear others
function setActivePreset(presetName) {
    state.activePreset = presetName;
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
        if (chip.getAttribute('data-text') === presetName) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    const preset = CONFIG.presets[presetName];
    updateContextLine(preset && preset.description ? preset.description : contextForMode(state.messageMode));
}

// Clear all preset highlights
function clearActivePresets() {
    state.activePreset = null;
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
        chip.classList.remove('active');
    });
    updateContextLine(contextForMode(state.messageMode));
}

// Highlight the picked emoji chip (or clear all when null)
function setEmojiActive(emoji) {
    const chips = document.querySelectorAll('.emoji-chip');
    chips.forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-emoji') === emoji);
    });
}

// Toggle the Message type tabs (Text / Emoji / Image) and their follow-up panels.
function setMessageModeUI(mode) {
    const m = (mode === 'emoji' || mode === 'image') ? mode : 'text';
    state.messageMode = m;
    document.querySelectorAll('.message-option').forEach(btn => {
        const on = btn.getAttribute('data-message-mode') === m;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.text-message-mode').forEach(el => {
        el.hidden = m !== 'text';
    });
    document.querySelectorAll('.emoji-message-mode').forEach(el => {
        el.hidden = m !== 'emoji';
    });
    document.querySelectorAll('.image-message-mode').forEach(el => {
        el.hidden = m !== 'image';
    });
    // On mobile the always-visible bottom bar is the Text follow-up: only show it
    // while the Text type is active (Emoji/Image use the drawer panels instead).
    const inputBar = document.getElementById('input-bar');
    if (inputBar) inputBar.style.display = m === 'text' ? '' : 'none';
}

// Empty the stage: removes the current sculpture so no particles render. Used
// when entering Emoji/Image mode with no remembered choice ("render nothing").
// Trails and embers are hidden until the next real sculpture build re-enables them.
function clearSculpture() {
    if (render.particles) {
        render.scene.remove(render.particles);
        render.particles = null;
    }
    if (render.trailPoints) render.trailPoints.visible = false;
    if (render.emberPoints) render.emberPoints.visible = false;
    physics.posHome = new Float32Array(0);
    physics.posLive = new Float32Array(0);
    physics.explosionOrigin = new Float32Array(0);
    physics.springDisp = new Float32Array(0);
    physics.springVel = new Float32Array(0);
    physics.randomDir = new Float32Array(0);
    physics.randomSpeed = new Float32Array(0);
    physics.funnelT = new Float32Array(0);
    physics.funnelRadialX = new Float32Array(0);
    physics.funnelRadialZ = new Float32Array(0);
    physics.slots = [];
    physics.sendQueue = [];
    physics.sourceGeneration++;
    physics.motionToken++;
    contentBox = { w: 80, h: 80 };
}

// Switch the active Message type and rebuild the sculpture for the new source.
async function switchMessageMode(mode) {
    setMessageModeUI(mode);
    clearActivePresets();
    resetToDefaultExplosion();
    if (state.messageMode === 'emoji') {
        state.activeImage = null;
        const emoji = state.lastEmoji && CONFIG.emojiOptions.includes(state.lastEmoji)
            ? state.lastEmoji
            : null;
        if (emoji) {
            state.activeEmoji = emoji;
            setEmojiActive(emoji);
            syncInputValues(emoji);
            await setupParticles(emoji, false);
            updateURLParams(emoji, state.currentTheme, state.currentFont, true);
        } else {
            // No previous emoji choice — render nothing until one is picked.
            state.activeEmoji = null;
            setEmojiActive(null);
            clearSculpture();
        }
    } else if (state.messageMode === 'image') {
        state.activeEmoji = null;
        setEmojiActive(null);
        const imageNameEls = document.querySelectorAll('.image-name');
        if (state.lastImage) {
            state.activeImage = state.lastImage;
            imageNameEls.forEach(el => { el.textContent = state.lastImageName; });
            await setupParticles(state.currentText, false);
        } else {
            // No previously uploaded image: render nothing, show the empty label.
            state.activeImage = null;
            imageNameEls.forEach(el => { el.textContent = 'No file chosen'; });
            clearSculpture();
        }
    } else {
        state.activeEmoji = null;
        state.activeImage = null;
        setEmojiActive(null);
        // An Emoji/Image pick overwrote currentText; bring back the last typed
        // text (or the default message) instead of leaving the pick selected.
        const text = (state.lastText && state.lastText.trim()) || 'Bring your message!';
        state.currentText = text;
        syncInputValues(text);
        await setupParticles(text, false);
        updateURLParams(state.currentText, state.currentTheme, state.currentFont, true);
    }
}

// Turn a chosen image file into the active particle sculpture (local only).
function handleImageUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file!', 'error');
        return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
        URL.revokeObjectURL(url);
        setMessageModeUI('image');
        state.activeImage = img;
        state.lastImage = img; // remember this choice for later Image-mode returns
        state.lastImageName = file.name;
        state.imageName = file.name;
        state.activeEmoji = null;
        setEmojiActive(null);
        clearActivePresets();
        resetToDefaultExplosion();
        document.querySelectorAll('.image-name').forEach(el => { el.textContent = file.name; });
        await setupParticles(state.currentText, false);
        announceToScreenReader(`Image uploaded: ${file.name}`);
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        showToast('Could not read that image!', 'error');
    };
    img.src = url;
}

// ---------------------------------------------
// Mobile Drawer Controls
// ---------------------------------------------
// The drawer auto-closes 1s after any selection is made inside it, unless another
// selection arrives first (the timer resets each time).
const DRAWER_AUTO_CLOSE_MS = 1000;

function scheduleDrawerAutoClose() {
    clearTimeout(interaction.drawerCloseTimer);
    interaction.drawerCloseTimer = setTimeout(closeMobileMenu, DRAWER_AUTO_CLOSE_MS);
}

function cancelDrawerAutoClose() {
    clearTimeout(interaction.drawerCloseTimer);
}

function openMobileMenu() {
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const toggleBtn = document.getElementById('menu-toggle-btn');
    cancelDrawerAutoClose();
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const toggleBtn = document.getElementById('menu-toggle-btn');
    cancelDrawerAutoClose();
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
    const drawer = document.getElementById('drawer');
    if (drawer && drawer.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function collapseDock() {
    const dock = document.getElementById('dock');
    if (!dock || dock.classList.contains('collapsed')) return false;
    dock.classList.add('collapsed');
    const btn = document.getElementById('dock-toggle-btn');
    if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.title = 'Expand controls';
    }
    return true;
}

function expandDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    dock.classList.remove('collapsed');
    const btn = document.getElementById('dock-toggle-btn');
    if (btn) {
        btn.setAttribute('aria-expanded', 'true');
        btn.title = 'Collapse controls';
    }
}

// Refit the sculpture after the dock's 0.4s collapse/expand transition finishes,
// so the camera framing reflects the settled dock height (not the mid-transition
// height measured by an immediate updateStageLayout()).
function refitAfterDockTransition() {
    if (!render.autoFit) return;
    updateStageLayout();
    setTimeout(() => {
        if (render.autoFit) updateStageLayout();
    }, 460);
}

// Close the options menu while an animation plays, remembering whether it should
// be restored once the animation finishes. The sculpture is then refit into the
// newly available space (still keeping its margins) so it fills more of the
// screen while the menu is tucked away.
function closeMenuForAnimation() {
    const dock = document.getElementById('dock');
    interaction.menuRestoreDesktop = !!(dock && !dock.classList.contains('collapsed'));
    collapseDock();
    const drawer = document.getElementById('drawer');
    interaction.menuRestoreMobile = !!(drawer && drawer.classList.contains('open'));
    closeMobileMenu();
    refitAfterDockTransition();
}

// Bring the options menu back once the animation finishes, and refit the
// sculpture so it stays clear of the reopened controls.
function restoreMenuAfterAnimation() {
    if (interaction.menuRestoreMobile) {
        interaction.menuRestoreMobile = false;
        openMobileMenu();
    }
    if (interaction.menuRestoreDesktop) {
        interaction.menuRestoreDesktop = false;
        expandDock();
    }
    refitAfterDockTransition();
}

// ---------------------------------------------
// UI Setup
// ---------------------------------------------
// Mirror the current message text into every input (desktop dock + mobile bar).
function syncInputValues(value) {
    document.querySelectorAll('#text-input, #mobile-text-input').forEach(inp => {
        inp.value = value;
    });
    updateCharCounter(value);
}

// Shared text-input pipeline (debounced rebuild of the sculpture).
function handleTextInputValue(raw) {
    setMessageModeUI('text'); // Typing always means the Text type
    clearActivePresets(); // Typing clears preset active marks
    state.activeEmoji = null; // Typing reverts to the regular text path
    state.activeImage = null; // ... and drops any uploaded image
    setEmojiActive(null);
    resetToDefaultExplosion(); // Typing resets preset physics details
    updateCharCounter(raw);
    clearTimeout(interaction.inputDebounceTimer);
    interaction.inputDebounceTimer = setTimeout(async () => {
        await updateText(raw);
    }, CONFIG.inputDebounceMs);
}

// Capture screenshot ([1.4] safe with preserveDrawingBuffer: false because we run
// in the same tick). Uses toBlob() instead of toDataURL() so PNG encoding runs off
// the main thread and we avoid allocating a large base64 string (lower peak
// memory, no UI freeze).
function captureScreenshot() {
    render.renderer.render(render.scene, render.camera);
    render.renderer.domElement.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const name = (state.messageMode === 'image' && state.imageName
            ? state.imageName
            : state.currentText).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `artz-sculpture-${name || 'kinetic'}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
}

// 1-Click Share functionality: serialize current state into URL and copy to clipboard
async function shareSculptureLink() {
    try {
        const params = new URLSearchParams();
        if (state.activeEmoji) {
            params.set('t', state.activeEmoji);
        } else if (state.messageMode === 'text' && state.currentText) {
            params.set('t', state.currentText);
        }
        if (state.currentTheme && state.currentTheme !== 'ember') {
            params.set('theme', state.currentTheme);
        }
        if (state.currentFont && state.currentFont !== 'Outfit') {
            params.set('font', state.currentFont);
        }
        if (state.activePreset) {
            params.set('preset', state.activePreset);
        }
        const queryString = params.toString();
        const shareUrl = `${window.location.origin}${window.location.pathname}${queryString ? '?' + queryString : ''}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
        } else {
            const tempInput = document.createElement('input');
            tempInput.value = shareUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }
        showToast('Link copied to clipboard!', 'success');
    } catch (err) {
        showToast('Could not copy link', 'error');
    }
}

// Audio/SFX Mute & Volume toggle
function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.setAttribute('aria-pressed', state.audioEnabled.toString());
        btn.title = state.audioEnabled ? 'Toggle Sound (Mute/Unmute)' : 'Sound: MUTED (Click to unmute)';
    });
    document.querySelectorAll('.audio-icon').forEach(icon => {
        icon.textContent = state.audioEnabled ? '??' : '??';
    });
    showToast(state.audioEnabled ? '?? Sound effects enabled' : '?? Sound effects muted');
}

// First-visit hint: dismiss once, remember the choice.
function dismissHint() {
    const hint = document.getElementById('hint');
    if (hint) hint.classList.add('dismissed');
    try { localStorage.setItem('artz-hint-seen', '1'); } catch (_) { /* private mode */ }
}

function setupUI() {
    const textInput = document.getElementById('text-input');
    const mobileInput = document.getElementById('mobile-text-input');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawer = document.getElementById('drawer');
    const dockToggleBtn = document.getElementById('dock-toggle-btn');
    const hintDismissBtn = document.getElementById('hint-dismiss');

    // Wordmark flourish showcase: clicking starts an endless loop that plays
    // the flourishes back to back — ripple-cascade wave, dissolve-and-reform
    // particle burst, staggered gravity-drop bounce, then black hole singularity
    // implosion & quantum burst, repeating — until the user clicks again to stop it.
    const wordmark = document.getElementById('wordmark');
    if (wordmark) {
        const FLOURISHES = [
            { cls: 'is-rippling',  ms: 1400 },
            { cls: 'is-playing',   ms: 1800 },
            { cls: 'is-dropping',  ms: 1600 },
            { cls: 'is-imploding', ms: 1700 },
        ];
        const flourishGapMs = 700; // breathing room between flourishes
        const flourishClasses = () => FLOURISHES.map(f => f.cls);
        const setHint = stopped => {
            wordmark.setAttribute('aria-label', stopped
                ? 'KINETICS — click to play title animation'
                : 'KINETICS — click to stop the title animation');
            wordmark.title = stopped ? 'Click to play' : 'Click to stop';
        };
        let cycling = false;
        let flourishIndex = 0;

        const playNextFlourish = () => {
            const flourish = FLOURISHES[flourishIndex];
            flourishIndex = (flourishIndex + 1) % FLOURISHES.length;
            wordmark.classList.remove(...flourishClasses());
            void wordmark.offsetWidth; // restart the animation
            wordmark.classList.add(flourish.cls);
            interaction.wordmarkTimer =
                setTimeout(playNextFlourish, flourish.ms + flourishGapMs);
        };

        wordmark.addEventListener('click', () => {
            if (isMotionReduced) return;
            cycling = !cycling;
            clearTimeout(interaction.wordmarkTimer);
            if (cycling) {
                flourishIndex = 0;
                setHint(false);
                playNextFlourish();
            } else {
                setHint(true);
                wordmark.classList.remove(...flourishClasses());
            }
        });
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            toggleMobileMenu();
        });
    }

    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Any selection inside the drawer schedules its auto-close (timer resets on
    // each new selection so a quick series of picks keeps it open). Message-type
    // tab navigation and opening the native font dropdown are not selections.
    if (drawer) {
        drawer.addEventListener('click', (e) => {
            if (e.target.closest('.message-option') || e.target.closest('select')) return;
            scheduleDrawerAutoClose();
        });
        drawer.querySelectorAll('select').forEach(sel => {
            sel.addEventListener('change', scheduleDrawerAutoClose);
        });
    }

    // Dock collapse/expand toggle.
    if (dockToggleBtn) {
        dockToggleBtn.addEventListener('click', () => {
            const dock = document.getElementById('dock');
            if (!dock) return;
            if (dock.classList.contains('collapsed')) {
                expandDock();
            } else {
                collapseDock();
            }
            // Refit the sculpture so it keeps its margins around the menu in
            // whichever state the dock ends up in (again once the transition ends).
            refitAfterDockTransition();
        });
    }

    // First-visit hint.
    if (hintDismissBtn) {
        hintDismissBtn.addEventListener('click', dismissHint);
    }
    try {
        if (localStorage.getItem('artz-hint-seen') === '1') dismissHint();
    } catch (_) { /* private mode */ }

    // Status pill: engine label.
    statusFpsEl = document.getElementById('status-fps');
    const statusGpu = document.getElementById('status-gpu');
    if (statusGpu) {
        statusGpu.textContent = state.gpuPhysics ? 'GPU' : (physicsWorker ? 'WORKER' : 'CPU');
    }

    // Context line default.
    updateContextLine(contextForMode(state.messageMode));

    // Sync state to UI elements
    if (textInput) {
        textInput.value = state.currentText;
        updateCharCounter(state.currentText);

        textInput.addEventListener('input', () => {
            if (mobileInput && mobileInput.value !== textInput.value) mobileInput.value = textInput.value;
            handleTextInputValue(textInput.value);
        });
    }

    if (mobileInput) {
        mobileInput.value = state.currentText;
        mobileInput.addEventListener('input', () => {
            if (textInput && textInput.value !== mobileInput.value) textInput.value = mobileInput.value;
            handleTextInputValue(mobileInput.value);
        });
    }

    // Message Text/Image option tabs
    document.querySelectorAll('.message-option').forEach(btn => {
        btn.addEventListener('click', () => {
            switchMessageMode(btn.getAttribute('data-message-mode'));
        });
    });

    // Image upload: rasterize the chosen file into the particle sculpture
    document.querySelectorAll('.image-input').forEach(inputEl => {
        inputEl.addEventListener('change', () => {
            handleImageUpload(inputEl.files && inputEl.files[0]);
            // Reset the hidden native control so choosing the same file again
            // still emits change; the visible filename is managed by .image-name.
            inputEl.value = '';
        });
    });

    // Theme swatches
    document.querySelectorAll('.theme-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            clearActivePresets();
            resetToDefaultExplosion();
            selectTheme(swatch.getAttribute('data-theme'));
        });
    });

    // Font selects (desktop dock + mobile drawer)
    document.querySelectorAll('#font-select, #drawer-font-select').forEach(sel => {
        sel.value = state.currentFont;
        sel.addEventListener('change', async () => {
            clearActivePresets();
            resetToDefaultExplosion();
            await selectFont(sel.value);
        });
    });

    // Capture / Share / Audio (each wired for both dock and drawer copies)
    document.querySelectorAll('.capture-btn').forEach(btn => {
        btn.addEventListener('click', captureScreenshot);
    });
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', shareSculptureLink);
    });
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', toggleAudio);
    });

    // Presets Row
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', async () => {
            if (physics.explosionStartTime >= 0) return;
            const presetVal = chip.getAttribute('data-text');

            // Set custom explosion dynamics and sound properties
            await applyPresetExplosion(presetVal);
            setActivePreset(presetVal); // Highlight the selected preset chip

            // Trigger the unique explosion (menu tuck/restore is handled inside).
            triggerExplosion();
        });
    });

    // Emoji quick-picks: substitute the MESSAGE with a high-detail emoji sculpture
    const emojiChips = document.querySelectorAll('.emoji-chip');
    emojiChips.forEach(chip => {
        chip.addEventListener('click', async () => {
            const emoji = chip.getAttribute('data-emoji');
            if (!emoji) return;

            setMessageModeUI('emoji');
            clearActivePresets();
            resetToDefaultExplosion();
            state.activeEmoji = emoji;
            state.lastEmoji = emoji; // remember this choice for later Emoji-mode returns
            setEmojiActive(emoji);
            syncInputValues(emoji);

            // Quiet morph rebuild (no forced explosion) that updates the share URL.
            await updateText(emoji);
        });
    });
}

// ---------------------------------------------
// Animation Loop
// ---------------------------------------------
// Terminate a broken worker and switch to the CPU fallback without freezing the
// simulation. Unsticks any in-flight double-buffer slots that will never return.
function teardownWorker() {
    if (!physicsWorker) return;
    try { physicsWorker.terminate(); } catch (_) { /* already dead */ }
    physicsWorker = null;
    for (const slot of physics.slots) slot.inFlight = false;
    physics.sendQueue.length = 0;
}

// DPR caps per adaptive quality level (index 0 = lowest resolution / cheapest fill-rate).
const QUALITY_DPR = [1.0, 1.25, 1.5, 2.0];
let adaptiveQuality = { level: QUALITY_DPR.length - 1, slowStreak: 0, fastStreak: 0 };

function applyQualityLevel(level) {
    const dpr = Math.min(window.devicePixelRatio, QUALITY_DPR[level]);
    render.renderer.setPixelRatio(dpr);
    uniforms.uPixelRatio.value = dpr;
}

// React to sustained frame time with hysteresis: drop DPR after a run of slow frames,
// restore it only after a long comfortable run, so resolution doesn't flutter.
function updateAdaptiveQuality(frameMs) {
    const aq = adaptiveQuality;
    if (frameMs > 28) {
        aq.slowStreak++;
        aq.fastStreak = 0;
        if (aq.slowStreak >= 30) {
            aq.slowStreak = 0;
            if (aq.level > 0) { aq.level--; applyQualityLevel(aq.level); }
        }
    } else if (frameMs < 16) {
        aq.fastStreak++;
        aq.slowStreak = 0;
        const maxLevel = QUALITY_DPR.length - 1;
        if (aq.fastStreak >= 120 && aq.level < maxLevel
            && Math.min(window.devicePixelRatio, QUALITY_DPR[aq.level + 1]) > Math.min(window.devicePixelRatio, QUALITY_DPR[aq.level])) {
            aq.fastStreak = 0;
            aq.level++;
            applyQualityLevel(aq.level);
        }
    } else {
        aq.slowStreak = 0;
        aq.fastStreak = 0;
    }
}

function animate() {
    const frameStart = performance.now();
    requestAnimationFrame(animate);

    // Rolling FPS status (refreshed twice a second).
    fpsFrames++;
    if (performance.now() - fpsLastUpdate >= 500) {
        if (statusFpsEl) {
            statusFpsEl.textContent = `${Math.round(fpsFrames * 1000 / (performance.now() - fpsLastUpdate))} FPS`;
        }
        fpsFrames = 0;
        fpsLastUpdate = performance.now();
    }

    const time = render.clock.getElapsedTime();
    const dt = Math.min(time - render.prevTime, 0.05); // cap at 50ms to prevent browser tab freeze math jumps
    render.prevTime = time;

    updateAudioReactive();

    const { keys, invMatrix, lastGestureEndTime } = interaction;
    const { particles, camera } = render;

    // Keyboard rotation & controls
    if (particles) {
        if (keys.ArrowUp) {
            particles.rotation.x -= CONFIG.rotationStep;
            interaction.lastGestureEndTime = performance.now();
        }
        if (keys.ArrowDown) {
            particles.rotation.x += CONFIG.rotationStep;
            interaction.lastGestureEndTime = performance.now();
        }
        if (keys.ArrowLeft) {
            particles.rotation.y -= CONFIG.rotationStep;
            interaction.lastGestureEndTime = performance.now();
        }
        if (keys.ArrowRight) {
            particles.rotation.y += CONFIG.rotationStep;
            interaction.lastGestureEndTime = performance.now();
        }

        const isKeyRotating = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;
        const gestureGraceActive = (performance.now() - lastGestureEndTime) < CONFIG.autoReturnGracePeriodMs;
        if (!isKeyRotating && !interaction.lastPinchDist && !gestureGraceActive && !interaction.isDragging) {
            const lr = CONFIG.rotationAutoReturnLerp;
            particles.rotation.x = MathUtils.lerp(particles.rotation.x, 0, lr);
            particles.rotation.y = MathUtils.lerp(particles.rotation.y, 0, lr);
        }
    }

    // Zoom controls
    if (keys['+'] || keys['=']) {
        render.targetZ -= CONFIG.zoomSpeed;
        render.autoFit = false;
    }
    if (keys['-']) {
        render.targetZ += CONFIG.zoomSpeed;
        render.autoFit = false;
    }
    render.targetZ = MathUtils.clamp(render.targetZ, CONFIG.zoomMin, CONFIG.zoomMax);
    camera.position.z = MathUtils.lerp(camera.position.z, render.targetZ, CONFIG.zoomLerp);
    if (Math.abs(camera.position.z - render.targetZ) < 0.005) {
        camera.position.z = render.targetZ;
    }

    // Orthographic framing: keep the exact view scale the perspective camera had by
    // deriving the frustum height from the camera depth. This eliminates the
    // perspective keystone shear that used to lean off-center glyphs toward the
    // screen center, so true z-depth renders without distortion at any zoom.
    const halfHeight = camera.position.z * Math.tan(CONFIG.cameraAngleDeg * Math.PI / 360);
    const halfWidth  = halfHeight * camera.aspect;
    camera.left   = -halfWidth;
    camera.right  =  halfWidth;
    camera.top    =  halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    uniforms.uPointScale.value = CONFIG.pointSizeAttenuationScale / camera.position.z;

    if (!particles) {
        render.renderer.render(render.scene, camera);
        return;
    }

    // Consume the coalesced pointer (once per frame) — unproject + drag math run here.
    if (interaction.pendingPointer) {
        const p = interaction.pendingPointer;
        updateMouse(p.clientX, p.clientY);
        if (interaction.isDragging && p.pointerType === 'mouse') {
            const dx = p.clientX - interaction.prevMouseX;
            const dy = p.clientY - interaction.prevMouseY;
            if (render.particles) {
                render.particles.rotation.y += dx * 0.005;
                render.particles.rotation.x += dy * 0.005;
            }
            interaction.prevMouseX = p.clientX;
            interaction.prevMouseY = p.clientY;
            interaction.lastGestureEndTime = performance.now();
        }
        interaction.pendingPointer = null;
    }

    // Transform mouse coordinate system to local space
    invMatrix.copy(particles.matrixWorld).invert();
    interaction.mouseLocal.copy(interaction.mouseWorld).applyMatrix4(invMatrix);

    const isExploding = (physics.explosionStartTime >= 0);
    if (isExploding) {
        uniforms.uMouse.value.set(-1000, -1000, 0);
    } else {
        uniforms.uMouse.value.copy(interaction.mouseLocal);
    }

    // Spring mechanics variables calculation
    const posAttr = particles.geometry.attributes.position;
    const pos = posAttr.array;
    const count = posAttr.count;
    const {
        posHome,
        explosionOrigin,
        springDisp,
        springVel,
        randomDir,
        randomSpeed,
        funnelT,
        funnelRadialX,
        funnelRadialZ
    } = physics;
    const mouseInfluence  = CONFIG.mouseInfluence;
    const mouseInfluence2 = mouseInfluence * mouseInfluence;
    const repulsionStr    = CONFIG.repulsionStrength;
    const ml = interaction.mouseLocal;

    // Damp calculations cached unless frame-time delta fluctuates significantly
    let kFrame, dampFrame;
    if (Math.abs(dt - render.prevDt) < 0.0001) {
        kFrame = render.prevKFrame;
        dampFrame = render.prevDampFrame;
    } else {
        kFrame = CONFIG.springK * (dt * 60);
        dampFrame = Math.pow(CONFIG.springDamping, dt * 60);
        render.prevDt = dt;
        render.prevKFrame = kFrame;
        render.prevDampFrame = dampFrame;
    }

    // Explosion calculations & progress interpolation
    let elapsed = -1;
    let progress = 0.0;
    const activeStyle = physics.activeStyle >= 0 ? physics.activeStyle : state.motionStyle;
    const activeExpDuration = state.activeExpansionDuration || state.expansionDuration;
    const activeContrDuration = state.activeContractionDuration || state.contractionDuration;
    const activeMaxDistMult = state.activeMaxDist || state.explosionMaxDistMultiplier;

    if (physics.explosionStartTime >= 0) {
        elapsed = time - physics.explosionStartTime;
        if (elapsed > state.totalExplosionDuration) {
            // Blast fully finished -> begin the afterglow fade back to idle colors.
            physics.explosionStartTime = -1;
            physics.motionToken++;
            springDisp.fill(0);
            springVel.fill(0);
            state.afterglowStartTime = time;
            elapsed = -1;
            if (pos && posHome) {
                pos.set(posHome);
                posAttr.needsUpdate = true;
            }
            if (render.trailPoints && !isMotionReduced) {
                render.trailPoints.visible = true;
            }
            clearActivePresets();
            setAnimationControlsDisabled(false);
            restoreMenuAfterAnimation();
        } else {
            // At peak, lock the contraction duration to the ACTUAL distance travelled
            // so recovery genuinely reflects how far particles flew.
            if (activeStyle === 0 || activeStyle === -1) {
                const tDrift = 3.0;
                if (elapsed >= (activeExpDuration + tDrift) && !state.travelApplied) {
                    state.activeContractionDuration = state.contractionDuration || 2.0;
                    state.travelApplied = true;
                    if (state.audioEnabled) {
                        scheduleContractionRumble(state.activeContractionDuration);
                    }
                }
            }
            // Spawn embers once, at peak, from the expanded particle field.
            // Style 5 skips this (its sparks fire at the predator strike instead).
            if (elapsed >= activeExpDuration && !state.embersSpawned) {
                state.embersSpawned = true;
                if (activeStyle !== 5) spawnEmbers();
            }
            // Murmuration startle sparks: panicked burst at the moment the
            // first predator hits, wherever physics ran — GPU, worker, or CPU.
            const murmurStrikeT = (state.pattern && state.pattern.mDodge1T != null) ? state.pattern.mDodge1T : 3.9;
            if (activeStyle === 5 && !state.dodgeEmbersFired && elapsed >= murmurStrikeT) {
                state.dodgeEmbersFired = true;
                spawnStartleSparks(elapsed);
            }
            const contrDur = state.activeContractionDuration || state.contractionDuration;
            if (elapsed < activeExpDuration) {
                progress = elapsed / activeExpDuration;
            } else {
                progress = 1.0 - (elapsed - activeExpDuration) / contrDur;
            }
        }
    }

    // Explosion color blend: 1 for the whole blast (including recovery), then a brief
    // afterglow fade back to idle theme colors so particles don't snap.
    let activeBlend;
    if (physics.explosionStartTime >= 0) {
        activeBlend = 1.0;
    } else if (state.afterglowStartTime != null) {
        activeBlend = Math.max(0, 1 - (time - state.afterglowStartTime) / CONFIG.afterglowDuration);
        if (activeBlend <= 0) state.afterglowStartTime = null;
    } else {
        activeBlend = 0.0;
    }
    uniforms.uExplosionActive.value = activeBlend;
    uniforms.uTornadoActive.value = physics.explosionStartTime >= 0 && physics.activeStyle === 1 ? 1 : 0;
    if (render.particles) {
        render.particles.frustumCulled = (progress === 0.0);
    }

    // Option 1: Cinematic 3D Camera / Perspective Glide for Kinetic Wave
    if (render.particles && !interaction.isDragging) {
        if (physics.explosionStartTime >= 0 && activeStyle === 3 && elapsed >= 0 && elapsed <= 7.5) {
            const pTilt = elapsed / 7.5;
            const tiltEnv = Math.pow(Math.sin(Math.PI * pTilt), 1.2);
            const targetRotX = 0.26 * tiltEnv;
            const targetRotY = -0.36 * tiltEnv;
            render.particles.rotation.x = targetRotX;
            render.particles.rotation.y = targetRotY;
            if (render.trailPoints) {
                render.trailPoints.rotation.x = targetRotX;
                render.trailPoints.rotation.y = targetRotY;
            }
        }
    }

    // GPU-Native Kinematics vs CPU Fallback (styles 0-5 all run in the shader)
    if (state.gpuPhysics && isExploding) {
        if (render.trailPoints) render.trailPoints.visible = false;
        uniforms.uGpuPhysics.value = 1.0;
        uniforms.uMotionStyle.value = (activeStyle >= 0) ? activeStyle : 0;
        uniforms.uExplosionElapsed.value = (physics.explosionStartTime >= 0) ? elapsed : -1.0;
        uniforms.uExpDuration.value = activeExpDuration;
        uniforms.uDriftDuration.value = (activeStyle === 0 || activeStyle === -1) ? 3.0 : 0.0;
        uniforms.uContractionDuration.value = activeContrDuration;
        uniforms.uMaxDist.value = activeMaxDistMult;
        uniforms.uSpinSpeed.value = (state.pattern && state.pattern.spinSpeed) || 5.2;
        uniforms.uFunnelBottom.value = (state.pattern && state.pattern.funnelBottom) || -22.0;
        uniforms.uFunnelHeight.value = (state.pattern && state.pattern.funnelHeight) || 46.0;
        uniforms.uFunnelCrownRadius.value = (state.pattern && state.pattern.funnelCrownRadius) || 22.0;
        uniforms.uFunnelWaistRadius.value = (state.pattern && state.pattern.funnelWaistRadius) || 3.5;
        uniforms.uFunnelTailRadius.value = (state.pattern && state.pattern.funnelTailRadius) || 0.8;
        uniforms.uFunnelWaistT.value = (state.pattern && state.pattern.funnelWaistT) || 0.42;
        uniforms.uFunnelCrownExp.value = (state.pattern && state.pattern.funnelCrownExp) || 1.4;
        uniforms.uBreezeBlowDir.value = (activeBreezeConfig && activeBreezeConfig.blowDir) || 1.0;
        uniforms.uBreezeIntensity.value = (activeBreezeConfig && activeBreezeConfig.intensity) || 1.0;
        uniforms.uBreezeSwirl.value = (activeBreezeConfig && activeBreezeConfig.swirl != null) ? activeBreezeConfig.swirl : 0.0;
        // Murmuration randomized flight plan (defaults mirror the JS evaluator's)
        uniforms.uMSweepX.value = (state.pattern && state.pattern.mSweepX != null) ? state.pattern.mSweepX : 24.0;
        uniforms.uMSweepY.value = (state.pattern && state.pattern.mSweepY != null) ? state.pattern.mSweepY : 4.0;
        uniforms.uMSweepZ.value = (state.pattern && state.pattern.mSweepZ != null) ? state.pattern.mSweepZ : 12.0;
        uniforms.uMFreqX.value = (state.pattern && state.pattern.mFreqX != null) ? state.pattern.mFreqX : 3.456;
        uniforms.uMFreqY.value = (state.pattern && state.pattern.mFreqY != null) ? state.pattern.mFreqY : 5.341;
        uniforms.uMFreqZ.value = (state.pattern && state.pattern.mFreqZ != null) ? state.pattern.mFreqZ : 2.827;
        uniforms.uMPhX.value = (state.pattern && state.pattern.mPhX != null) ? state.pattern.mPhX : 0.4;
        uniforms.uMPhY.value = (state.pattern && state.pattern.mPhY != null) ? state.pattern.mPhY : 0.0;
        uniforms.uMPhZ.value = (state.pattern && state.pattern.mPhZ != null) ? state.pattern.mPhZ : 1.2;
        uniforms.uMLaunchDir.value = (state.pattern && state.pattern.mLaunchDir != null) ? state.pattern.mLaunchDir : 1.0;
        uniforms.uMTurnT.value = (state.pattern && state.pattern.mTurnT != null) ? state.pattern.mTurnT : 99.0;
        uniforms.uMTurnDir.value = (state.pattern && state.pattern.mTurnDir != null) ? state.pattern.mTurnDir : 1.0;
        uniforms.uMSplitT.value = (state.pattern && state.pattern.mSplitT != null) ? state.pattern.mSplitT : 99.0;
        uniforms.uMSplitAng.value = (state.pattern && state.pattern.mSplitAng != null) ? state.pattern.mSplitAng : 0.0;
        uniforms.uMDodge1T.value = (state.pattern && state.pattern.mDodge1T != null) ? state.pattern.mDodge1T : 3.9;
        uniforms.uMDodge2T.value = (state.pattern && state.pattern.mDodge2T != null) ? state.pattern.mDodge2T : 7.1;
        uniforms.uMDodge3T.value = (state.pattern && state.pattern.mDodge3T != null) ? state.pattern.mDodge3T : 99.0;
        uniforms.uMDodgeRad.value = (state.pattern && state.pattern.mDodgeRad != null) ? state.pattern.mDodgeRad : 8.0;
        uniforms.uMDodgeStr.value = (state.pattern && state.pattern.mDodgeStr != null) ? state.pattern.mDodgeStr : 1.0;
        uniforms.uMBoilAmp.value = (state.pattern && state.pattern.mBoilAmp != null) ? state.pattern.mBoilAmp : 0.0;
        uniforms.uMBoilFreq.value = (state.pattern && state.pattern.mBoilFreq != null) ? state.pattern.mBoilFreq : 14.0;
        uniforms.uMChurnMult.value = (state.pattern && state.pattern.mChurnMult != null) ? state.pattern.mChurnMult : 1.0;
        uniforms.uMFlutterMult.value = (state.pattern && state.pattern.mFlutterMult != null) ? state.pattern.mFlutterMult : 1.0;
        uniforms.uMJinkAmp.value = (state.pattern && state.pattern.mJinkAmp != null) ? state.pattern.mJinkAmp : 0.0;
        uniforms.uMJinkFreq.value = (state.pattern && state.pattern.mJinkFreq != null) ? state.pattern.mJinkFreq : 5.5;
        uniforms.uMJinkPh.value = (state.pattern && state.pattern.mJinkPh != null) ? state.pattern.mJinkPh : 0.0;
        uniforms.uMBreathAmp.value = (state.pattern && state.pattern.mBreathAmp != null) ? state.pattern.mBreathAmp : 1.0;
        uniforms.uMScoutAmp.value = (state.pattern && state.pattern.mScoutAmp != null) ? state.pattern.mScoutAmp : 0.0;
        // Torus knot auto-calibration: scale the trefoil from the live
        // camera frustum so it stays centered and covers over half the stage.
        {
            const cam = render.camera;
            const viewH = cam.top - cam.bottom;
            const viewW = cam.right - cam.left;
            const knotScale = Math.max(1.0, Math.min(viewW, viewH)) * 0.205;
            uniforms.uKnotScale.value = knotScale;
            state.pattern.knotScale = knotScale;   // CPU fallback / snapshot parity
        }
        uniforms.uMouseWorld.value.set(-1000, -1000, 0);
        uniforms.uMousePushDistance.value = 0.0;
        uniforms.uMouseInfluence.value = 0.0;
        uniforms.uMouseActive.value = 0.0;
    } else {
        uniforms.uGpuPhysics.value = 0.0;

        // Offload dense spring calculation loop to Web Worker (with CPU Fallback).
        // Double-buffered dispatch: send any free slot (no busy-wait), so a momentarily
        // slow worker never drops or freezes the simulation — it simply falls a frame
        // behind while the main thread renders the most recent completed result.
        if (physicsWorker) {
            let slot = null;
            for (const s of physics.slots) {
                if (!s.inFlight) { slot = s; break; }
            }
            if (slot) {
                if (slot.needsReset) {
                    slot.posLive.set(physics.explosionOrigin);
                    slot.springDisp.fill(0);
                    slot.springVel.fill(0);
                    slot.needsReset = false;
                }
                slot.inFlight = true;
                slot.seq = physics.seq++;
                physics.sendQueue.push(slot);
                physicsWorker.postMessage({
                    type: 'update',
                    data: {
                        posLive: slot.posLive,
                        springDisp: slot.springDisp,
                        springVel: slot.springVel,
                        count, dt, elapsed,
                        mouseLocal: isExploding ? { x: 99999, y: 99999, z: 99999 } : { x: ml.x, y: ml.y, z: ml.z },
                        kFrame, dampFrame,
                        expansionDuration: activeExpDuration,
                        driftDuration: (activeStyle === 0 || activeStyle === 3 || activeStyle === -1) ? 3.0 : 0.0,
                        contractionDuration: activeContrDuration,
                        explosionMaxDistMultiplier: activeMaxDistMult,
                        mouseInfluence: isExploding ? 0 : mouseInfluence,
                        repulsionStr: isExploding ? 0 : repulsionStr,
                        breeze: activeBreezeConfig,
                        sourceGeneration: physics.sourceGeneration,
                        motionToken: physics.motionToken
                    },
                    seq: slot.seq
                }, [slot.posLive.buffer, slot.springDisp.buffer, slot.springVel.buffer]);
            }
        } else {
            // Local CPU Fallback (Main Thread)
            const pat = state.pattern;
            const _fallbackRes = { x: 0, y: 0, z: 0 };
            const isTornado = activeStyle === 1
                && pat.funnelHeight
                && funnelT
                && funnelRadialX
                && funnelRadialZ;

            const origin = explosionOrigin || posHome;
            const tDrift = (activeStyle === 0 || activeStyle === 3 || activeStyle === -1) ? 3.0 : 0.0;

            for (let i = 0; i < count; i++) {
                const ix = i * 3, iy = ix + 1, iz = ix + 2;
                let bx, by, bz;

                if (elapsed >= 0.0) {
                    if (activeStyle === 1 && isTornado) {
                        evaluateTornadoParticle(
                            i, posHome[ix], posHome[iy], posHome[iz],
                            funnelT[i], funnelRadialX[i], funnelRadialZ[i],
                            (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                            elapsed, pat, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    } else if (activeStyle === 2) {
                        evaluateBreezeParticle(
                            i, posHome[ix], posHome[iy], posHome[iz],
                            (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                            elapsed, activeBreezeConfig, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    } else if (activeStyle === 3) {
                        evaluateKineticParticle(
                            i, posHome[ix], posHome[iy], posHome[iz],
                            (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                            elapsed, pat, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    } else if (activeStyle === 4) {
                        evaluateTorusParticle(
                            i, posHome[ix], posHome[iy], posHome[iz],
                            (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                            elapsed, pat, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    } else if (activeStyle === 5) {
                        evaluateMurmurationParticle(
                            i, posHome[ix], posHome[iy], posHome[iz],
                            (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                            elapsed, pat, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    } else {
                        const maxDist = randomSpeed[i] * activeMaxDistMult;
                        evaluateExplosionParticle(
                            origin[ix], origin[iy], origin[iz],
                            randomDir[ix], randomDir[iy], randomDir[iz],
                            maxDist, activeExpDuration, tDrift, activeContrDuration, elapsed, _fallbackRes
                        );
                        bx = _fallbackRes.x; by = _fallbackRes.y; bz = _fallbackRes.z;
                    }
                } else {
                    bx = posHome[ix];
                    by = posHome[iy];
                    bz = posHome[iz];
                }

                const cur_x = pos[ix], cur_y = pos[iy], cur_z = pos[iz];
                const ddx = cur_x - ml.x;
                const ddy = cur_y - ml.y;
                const ddz = cur_z - ml.z;
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;

                let tdx = 0, tdy = 0, tdz = 0;
                if (!isExploding && d2 < mouseInfluence2 && d2 > 0.00001) {
                    const d    = Math.sqrt(d2);
                    const invD = 1.0 / d;
                    const force = (mouseInfluence - d) / mouseInfluence;
                    const push  = repulsionStr * force;
                    tdx = ddx * invD * push;
                    tdy = ddy * invD * push;
                    tdz = ddz * invD * push;
                }

                springVel[ix] = (springVel[ix] + (tdx - springDisp[ix]) * kFrame) * dampFrame;
                springVel[iy] = (springVel[iy] + (tdy - springDisp[iy]) * kFrame) * dampFrame;
                springVel[iz] = (springVel[iz] + (tdz - springDisp[iz]) * kFrame) * dampFrame;

                springDisp[ix] += springVel[ix];
                springDisp[iy] += springVel[iy];
                springDisp[iz] += springVel[iz];

                pos[ix] = bx + springDisp[ix];
                pos[iy] = by + springDisp[iy];
                pos[iz] = bz + springDisp[iz];

                if (elapsed >= 0.0) {
                    const tx = pos[ix] - origin[ix];
                    const ty = pos[iy] - origin[iy];
                    const tz = pos[iz] - origin[iz];
                    const td2 = tx * tx + ty * ty + tz * tz;
                    if (td2 > fallbackMaxTravelSq) fallbackMaxTravelSq = td2;
                }
            }
            state.actualTravelRadius = Math.sqrt(fallbackMaxTravelSq);
            posAttr.needsUpdate = true;
            physics.positionsDirty = true;
        }
    }

    updateTrails();
    updateEmbers(dt);

    render.renderer.render(render.scene, camera);

    // Adapt rendering resolution to sustained frame-time pressure (cheap, no particle
    // rebuild required).
    updateAdaptiveQuality(performance.now() - frameStart);
}

// ---------------------------------------------
// Initialisation
// ---------------------------------------------
async function init() {
    render.scene  = new Scene();
    render.camera = new OrthographicCamera(-1, 1, 1, -1, -600, 600);
    render.camera.position.z = render.targetZ;

    const dpr = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);
    
    // [1.4] preserveDrawingBuffer defaulted to false for optimized frame double-buffering
    // [4] antialias:false — point sprites get their smooth edges from the shader's soft
    // circular falloff (see fragmentShader), so full-framebuffer MSAA here is wasted cost.
    render.renderer = new WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false
    });
    render.renderer.setClearColor(CONFIG.clearColor, 1);

    const canvas = render.renderer.domElement;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Kinetic particle sculpture — interactive particle animation');
    
    // WebGL context resilience
    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        showToast('WebGL context lost — attempting restoration...');
    }, false);
    canvas.addEventListener('webglcontextrestored', async () => {
        showToast('WebGL context restored');
        await setupParticles(state.currentText, false);
    }, false);

    document.getElementById('stage').appendChild(canvas);

    // Size the renderer/camera to the stage (space excluding the menu) and apply
    // the initial auto-fit zoom before the sculpture is built.
    updateStageLayout();

    // Initialize physics Web Worker. `?noworker=1` forces the CPU fallback so the
    // fallback path can be exercised by the browser test suite.
    const disableWorkerForTest = new URLSearchParams(window.location.search).get('noworker') === '1';
    if (!disableWorkerForTest) {
        try {
            physicsWorker = new Worker(new URL('./physics.worker.js', import.meta.url), {
                type: 'module'
            });
        physicsWorker.onmessage = function (e) {
            const {
                type,
                seq,
                posLive,
                springDisp,
                springVel,
                travelRadius,
                sourceGeneration,
                motionToken
            } = e.data;
            if (type === 'randomized') {
                // The worker echoes a slice of the blast directions it generated so the
                // pattern regression tests can verify them without timing sensitivity.
                // Guard against stale echoes from an older layout or blast phase.
                if (e.data.sourceGeneration !== physics.sourceGeneration
                    || e.data.motionToken !== physics.motionToken) {
                    return;
                }
                physics.randomized = { dirs: e.data.dirs, style: e.data.style };
                physics.activeStyle = e.data.style;
                return;
            }
            if (type === 'update') {
                // Pair the reply with the matching in-flight slot via its sequence token.
                // Stale replies (e.g. from a buffer set invalidated by a text change) are
                // discarded without corrupting the slot queue.
                let idx = -1;
                for (let i = 0; i < physics.sendQueue.length; i++) {
                    if (physics.sendQueue[i].seq === seq) { idx = i; break; }
                }
                if (idx === -1) return;

                const slot = physics.sendQueue.splice(idx, 1)[0];
                slot.inFlight = false;
                slot.posLive = posLive;
                slot.springDisp = springDisp;
                slot.springVel = springVel;

                // Results from an older layout or blast phase must never overwrite
                // the current geometry after a rebuild or a new explosion.
                if (sourceGeneration !== physics.sourceGeneration || motionToken !== physics.motionToken) {
                    return;
                }

                // Track the actual distance particles travelled (used for recovery).
                if (typeof travelRadius === 'number' && travelRadius > 0) {
                    state.actualTravelRadius = travelRadius;
                }

                // The resident geometry buffers are never transferred, so they stay valid
                // during rendering. Copy the freshly computed slot into them.
                const posAttr = render.particles && render.particles.geometry.attributes.position;
                if (posAttr && posAttr.array.length === posLive.length) {
                    posAttr.array.set(posLive);
                    posAttr.needsUpdate = true;
                    physics.positionsDirty = true;
                }
            }
        };
        // Runtime worker failures must not leave the simulation frozen: tear the worker
        // down and switch to the CPU fallback (main-thread arrays remain valid because
        // they are never transferred to the worker).
        physicsWorker.onerror = () => {
            console.error('Physics worker error — switching to CPU fallback.');
            teardownWorker();
        };
        physicsWorker.onmessageerror = () => {
            console.error('Physics worker message error — switching to CPU fallback.');
            teardownWorker();
        };
    } catch (err) {
        console.error('Failed to initialize physics Web Worker:', err);
    }
    }

    // Wait for font assets before rasterizing text
    await document.fonts.ready.catch(() => {});

    // Parse URL params for persistent sculpture sharing
    const searchString = window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
    const urlParams = new URLSearchParams(searchString);
    const initialText = urlParams.get('text') || urlParams.get('t') || urlParams.get('emoji') || 'Bring your message!';
    const initialTheme = urlParams.get('theme') || 'ember';
    const initialFont = urlParams.get('font') || 'Outfit';
    const initialPreset = urlParams.get('preset');
    const disableGpu = urlParams.get('gpu') === '0';
    if (disableGpu) {
        state.gpuPhysics = false;
    }

    state.currentText = initialText;
    state.currentTheme = initialTheme;
    state.currentFont = initialFont;

    // A shared URL whose message is a list emoji keeps the high-detail rendering.
    if (CONFIG.emojiOptions.includes(initialText)) {
        state.activeEmoji = initialText;
        state.lastEmoji = initialText;
        state.messageMode = 'emoji';
        state.lastText = 'Bring your message!';
    } else {
        state.messageMode = 'text';
        state.lastText = initialText;
    }

    // Apply initial state & check if text or param matches a preset
    const upperText = initialText.toUpperCase();
    const targetPreset = initialPreset ? initialPreset.toUpperCase() : (CONFIG.presets[upperText] && upperText !== 'DEFAULT' ? upperText : null);

    if (targetPreset && CONFIG.presets[targetPreset]) {
        selectTheme(initialTheme, false);
        await setupParticles(state.currentText, false);
        await applyPresetExplosion(targetPreset, false);
        setActivePreset(targetPreset);
    } else if (CONFIG.presets[upperText] && upperText !== 'DEFAULT') {
        await applyPresetExplosion(upperText, false);
        setActivePreset(upperText);
    } else {
        selectTheme(initialTheme, false);
        await setupParticles(state.currentText, false);
    }
    setupUI();
    setMessageModeUI(state.messageMode);

    // Event Listeners
    // pointermove only records the latest coordinates; the actual unproject + drag
    // math runs once per frame in animate(), so high-Hz input never fires per-event work.
    window.addEventListener('pointermove', e => {
        interaction.pendingPointer = {
            clientX: e.clientX,
            clientY: e.clientY,
            pointerType: e.pointerType
        };
    });
    window.addEventListener('pointerdown', onPointerDown);
    // First-visit hint dismisses on the first real canvas interaction (pointer or
    // rotation/zoom key), not on clicks inside the UI chrome.
    window.addEventListener('pointerdown', e => {
        if (!isUIEvent(e)) dismissHint();
    });
    window.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key.startsWith('Arrow') || e.key === '+' || e.key === '-' || e.key === '=') dismissHint();
    });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('pointerleave', () => {
        interaction.mouseWorld.set(-1000, -1000, 0);
        uniforms.uMouse.value.set(-1000, -1000, 0);
        interaction.isDragging = false;
    });
    window.addEventListener('dblclick', e => {
        if (isUIEvent(e)) return;
        if (physics.explosionStartTime >= 0) return;
        applyActiveOrRandomPreset(); // Use active preset or random if none selected
        triggerExplosion();
    });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', updateStageLayout);
    
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const drawer = document.getElementById('drawer');
            if (drawer && drawer.classList.contains('open')) {
                closeMobileMenu();
                return;
            }
        }
        interaction.keys[e.key] = true;
        if (e.code === 'Space' || e.key.startsWith('Arrow')) {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
                e.preventDefault();
                if (e.code === 'Space') {
                    if (physics.explosionStartTime < 0) {
                        applyActiveOrRandomPreset(); // Use active preset or random if none selected
                        triggerExplosion();
                    }
                }
            }
        }
    });
    window.addEventListener('keyup', e => interaction.keys[e.key] = false);

    // [2.3] State History navigation back/forward support
    window.addEventListener('popstate', async () => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('t') || 'Bring your message!';
        const theme = params.get('theme') || 'ember';
        const font = params.get('font') || 'Outfit';

        state.currentText = t;
        state.currentTheme = theme;
        state.currentFont = font;
        const isEmojiState = CONFIG.emojiOptions.includes(t);
        state.activeEmoji = isEmojiState ? t : null;
        if (isEmojiState) state.lastEmoji = t;
        else state.lastText = t;
        setMessageModeUI(isEmojiState ? 'emoji' : 'text'); // History stores text/emoji; images are local-only
        syncInputValues(t);

        // Apply state updates silently to prevent loop recursion. Fonts only apply
        // to text, so the emoji path rebuilds directly without forcing text mode.
        selectTheme(theme, false);
        if (isEmojiState) {
            setEmojiActive(t);
            await setupParticles(t, false);
        } else {
            await selectFont(font, false);
        }

        const upper = t.toUpperCase();
        if (CONFIG.presets[upper] && upper !== 'DEFAULT') {
            setActivePreset(upper);
        } else {
            clearActivePresets();
        }
        setEmojiActive(state.activeEmoji);
    });

    // URL debug auto-explode parameter
    if (import.meta.env.DEV) {
        if (urlParams.get('explode') === 'true') {
            setTimeout(triggerExplosion, 1000);
        }
    }

    animate();
}

// ---------------------------------------------
// Test/Debug hook (used by the Playwright browser suite; harmless in production)
// ---------------------------------------------
window.__artzDebug = {
    _render: () => render,
    triggerExplosion,
    get particleCount() { return physics.posLive ? physics.posLive.length / 3 : 0; },
    get usingWorker() { return !!physicsWorker; },
    get usingGpu() { return state.gpuPhysics; },
    get geometryCount() {
        return render.renderer ? render.renderer.info.memory.geometries : -1;
    },
    get textureCount() {
        return render.renderer ? render.renderer.info.memory.textures : -1;
    },
    get renderCalls() {
        return render.renderer ? render.renderer.info.render.calls : -1;
    },
    snapshot(limit = 96) {
        const home = physics.posHome;
        const origin = physics.explosionOrigin;
        const count = Math.min(limit * 3, home ? home.length : 0);
        let position = render.particles?.geometry.attributes.position.array;
        if (state.gpuPhysics && physics.explosionStartTime >= 0 && home) {
            const elapsed = render.clock.getElapsedTime() - physics.explosionStartTime;
            const activeStyle = physics.activeStyle >= 0 ? physics.activeStyle : state.motionStyle;
            const activeExpDuration = state.activeExpansionDuration || state.expansionDuration;
            const activeContrDuration = state.activeContractionDuration || state.contractionDuration;
            const activeMaxDistMult = state.activeMaxDist || state.explosionMaxDistMultiplier;
            const tDrift = (activeStyle === 0 || activeStyle === 3 || activeStyle === -1) ? 3.0 : 0.0;
            const _res = { x: 0, y: 0, z: 0 };
            const computed = new Float32Array(count);
            for (let i = 0; i < count / 3; i++) {
                const ix = i * 3, iy = ix + 1, iz = ix + 2;
                if (activeStyle === 1) {
                    evaluateTornadoParticle(i, home[ix], home[iy], home[iz], physics.funnelT ? physics.funnelT[i] : 0, physics.funnelRadialX ? physics.funnelRadialX[i] : 0, physics.funnelRadialZ ? physics.funnelRadialZ[i] : 0, (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * 0.35 + 0.85, elapsed, state.pattern, _res);
                } else if (activeStyle === 2) {
                    evaluateBreezeParticle(i, home[ix], home[iy], home[iz], (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * 0.35 + 0.85, elapsed, activeBreezeConfig, _res);
                } else if (activeStyle === 3) {
                    evaluateKineticParticle(i, home[ix], home[iy], home[iz], (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * 0.35 + 0.85, elapsed, state.pattern, _res);
                } else if (activeStyle === 4) {
                    evaluateTorusParticle(i, home[ix], home[iy], home[iz], (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * 0.35 + 0.85, elapsed, state.pattern, _res);
                } else if (activeStyle === 5) {
                    evaluateMurmurationParticle(i, home[ix], home[iy], home[iz], (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * 0.35 + 0.85, elapsed, state.pattern, _res);
                } else {
                    const maxDist = (physics.randomSpeed ? physics.randomSpeed[i] : 1.0) * activeMaxDistMult;
                    const orig = origin || home;
                    evaluateExplosionParticle(orig[ix], orig[iy], orig[iz], physics.randomDir ? physics.randomDir[ix] : 0, physics.randomDir ? physics.randomDir[iy] : 0, physics.randomDir ? physics.randomDir[iz] : 0, maxDist, activeExpDuration, tDrift, activeContrDuration, elapsed, _res);
                }
                computed[ix] = _res.x;
                computed[iy] = _res.y;
                computed[iz] = _res.z;
            }
            position = computed;
        }
        return {
            position: position ? Array.from(position.slice(0, count)) : [],
            home: home ? Array.from(home.slice(0, count)) : [],
            explosionOrigin: origin ? Array.from(origin.slice(0, count)) : [],
            funnelT: physics.funnelT ? Array.from(physics.funnelT.slice(0, limit)) : [],
            activeStyle: physics.activeStyle,
            funnelProfile: {
                height: state.pattern.funnelHeight || 0,
                bottom: state.pattern.funnelBottom || 0,
                tailRadius: tornadoRadius(0.05, state.pattern),
                waistRadius: tornadoRadius(0.5, state.pattern),
                crownRadius: tornadoRadius(0.95, state.pattern),
                fadeStart: state.pattern.funnelFadeStart || 0,
                fadeEnd: state.pattern.funnelFadeEnd || 0
            },
            rotation: render.particles
                ? [render.particles.rotation.x, render.particles.rotation.y, render.particles.rotation.z]
                : [0, 0, 0],
            sourceGeneration: physics.sourceGeneration,
            motionToken: physics.motionToken,
            explosionActive: physics.explosionStartTime >= 0,
            elapsed: physics.explosionStartTime >= 0
                ? render.clock.getElapsedTime() - physics.explosionStartTime
                : -1,
            expDuration: state.activeExpansionDuration || state.expansionDuration,
            conDuration: state.activeContractionDuration || state.contractionDuration,
            randomized: physics.randomized
                ? { style: physics.randomized.style, dirs: Array.from(physics.randomized.dirs) }
                : { style: -1, dirs: [] }
        };
    },
    triggerExplosion,
};

init();
