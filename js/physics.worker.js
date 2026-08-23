// ---------------------------------------------
// Physics Web Worker — Multi-threaded Particle Engine
// ---------------------------------------------
// Offloads O(N) spring relaxation, explosion trajectory calculations, and mouse
// repulsion from the main UI thread, ensuring a rock-solid 60 FPS even with 30k+
// particles. Operates via double-buffered Float32Arrays transferred with zero-copy.

import {
    evaluateTornadoParticle,
    evaluateBreezeParticle,
    evaluateKineticParticle,
    evaluateExplosionParticle,
    evaluateTorusParticle,
    evaluateMurmurationParticle
} from './physics-math.js';

let posHome = null;             // Initial rest coordinates (persistent Float32Array)
let explosionOrigin = null;     // Captured on-screen particle coordinates at blast trigger
let randomDir = null;           // Pre-computed normalized explosion direction unit vectors
let randomSpeed = null;         // Per-particle speed multipliers
let funnelT = null;             // Tornado: normalized vertical positions [0, 1]
let funnelRadialX = null;       // Tornado: unit radial vector X
let funnelRadialZ = null;       // Tornado: unit radial vector Z
let activeStyle = -1;
let activeWorkerBreeze = null;  // Cached pattern style for the current explosion
let pattern = {};               // Pattern parameters from CONFIG.presets
let maxTravelSq = 0;            // Peak squared displacement measured during the current blast
let lastMotionToken = -1;       // Generation tracker for distinct blast phases

const DIRECTIONS_VERIFY = 384;
const _workerRes = { x: 0, y: 0, z: 0 };

self.onmessage = function (e) {
    const { type, data, seq } = e.data;

    if (type === 'init') {
        posHome = data.posHome;
        explosionOrigin = data.explosionOrigin || data.posHome;
        randomDir = data.randomDir;
        randomSpeed = data.randomSpeed;
        funnelT = data.funnelT;
        funnelRadialX = data.funnelRadialX;
        funnelRadialZ = data.funnelRadialZ;
        lastMotionToken = -1;
        return;
    }

    if (type === 'randomize') {
        const {
            explosionSpeedMin,
            explosionSpeedRange,
            motionStyle,
            pattern: patternData,
            explosionOrigin: nextOrigin,
            motionToken,
            sourceGeneration,
            breeze: breezeConfig
        } = data;
        if (!randomDir || !randomSpeed) return;
        explosionOrigin = nextOrigin || posHome;
        pattern = patternData || {};
        activeWorkerBreeze = breezeConfig || null;
        activeStyle = (typeof motionStyle === 'number' && motionStyle >= 0)
            ? motionStyle
            : Math.floor(Math.random() * 4);
        lastMotionToken = -1;
        const count = randomSpeed.length;
        maxTravelSq = 0;

        const style = activeStyle;
        let gx = 0, gy = 0, gz = 0;
        if (style === 2) {
            const dirSign = Math.random() < 0.5 ? 1 : -1;
            gx = dirSign;
            gy = (Math.random() - 0.5) * 0.04;
            gz = (Math.random() - 0.5) * 0.04;
            const gLen = Math.hypot(gx, gy, gz) || 1;
            gx /= gLen; gy /= gLen; gz /= gLen;
        }

        const spokes = Math.max(2, pattern.spokes || 12);
        const jitter = (pattern.spokeJitter != null) ? pattern.spokeJitter : 0.03;
        const golden = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < count; i++) {
            const ix = i * 3, iy = ix + 1, iz = ix + 2;
            let rx, ry, rz;

            if (style === 1) {
                const hx = posHome[ix], hz = posHome[iz];
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
                rx = gx * 0.92 + (Math.random() * 2 - 1) * 0.08;
                ry = (Math.random() * 2 - 1) * 0.12;
                rz = (Math.random() * 2 - 1) * 0.12;
            } else if (style === 3) {
                const sp = i % spokes;
                const sa = sp * golden;
                const sb = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * (sp + 0.5) / spokes)));
                const sx = Math.sin(sb) * Math.cos(sa);
                const sy = Math.sin(sb) * Math.sin(sa);
                const sz = Math.cos(sb);
                const jx = (Math.random() * 2 - 1) * jitter;
                const jy = (Math.random() * 2 - 1) * jitter;
                const jz = (Math.random() * 2 - 1) * jitter;
                rx = sx + jx; ry = sy + jy; rz = sz + jz;
            } else {
                const u = Math.random();
                const v = Math.random();
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);
                const sinPhi = Math.sin(phi);
                rx = sinPhi * Math.cos(theta);
                ry = sinPhi * Math.sin(theta);
                rz = Math.cos(phi);
            }

            const len = Math.hypot(rx, ry, rz) || 1;
            randomDir[ix] = rx / len;
            randomDir[iy] = ry / len;
            randomDir[iz] = rz / len;
            randomSpeed[i] = explosionSpeedMin + Math.random() * explosionSpeedRange;
        }

        const verifyCount = Math.min(count, DIRECTIONS_VERIFY);
        const sample = new Float32Array(verifyCount * 3);
        sample.set(randomDir.subarray(0, verifyCount * 3));
        self.postMessage({
            type: 'randomized',
            dirs: sample,
            style: activeStyle,
            motionToken,
            sourceGeneration
        }, [sample.buffer]);
        return;
    }

    if (type === 'update') {
        const {
            posLive,
            springDisp,
            springVel,
            count,
            dt,
            elapsed,
            mouseLocal,
            kFrame,
            dampFrame,
            expansionDuration,
            driftDuration,
            contractionDuration,
            explosionMaxDistMultiplier,
            mouseInfluence,
            repulsionStr,
            sourceGeneration: updateSourceGeneration,
            motionToken
        } = data;

        if (!posHome) return;

        if (typeof motionToken === 'number' && motionToken !== lastMotionToken) {
            lastMotionToken = motionToken;
            maxTravelSq = 0;
        }

        const isExploding = (elapsed >= 0);
        const origin = explosionOrigin || posHome;

        const mx = (!isExploding && mouseLocal) ? mouseLocal.x : 99999;
        const my = (!isExploding && mouseLocal) ? mouseLocal.y : 99999;
        const mz = (!isExploding && mouseLocal) ? mouseLocal.z : 99999;
        const mouseInfSq = (!isExploding && mouseInfluence > 0) ? mouseInfluence * mouseInfluence : 0;

        const isTornado = activeStyle === 1
            && pattern.funnelHeight
            && funnelT
            && funnelRadialX
            && funnelRadialZ;

        const dt60 = dt * 60;

        for (let i = 0; i < count; i++) {
            const ix = i * 3, iy = ix + 1, iz = ix + 2;
            let bx, by, bz;

            if (isExploding) {
                if (activeStyle === 1 && isTornado) {
                    evaluateTornadoParticle(
                        i, posHome[ix], posHome[iy], posHome[iz],
                        funnelT[i], funnelRadialX[i], funnelRadialZ[i],
                        (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                        elapsed, pattern, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                } else if (activeStyle === 2) {
                    evaluateBreezeParticle(
                        i, posHome[ix], posHome[iy], posHome[iz],
                        (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                        elapsed, data.breeze || activeWorkerBreeze, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                } else if (activeStyle === 3) {
                    evaluateKineticParticle(
                        i, posHome[ix], posHome[iy], posHome[iz],
                        (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                        elapsed, pattern, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                } else if (activeStyle === 4) {
                    evaluateTorusParticle(
                        i, posHome[ix], posHome[iy], posHome[iz],
                        (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                        elapsed, pattern, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                } else if (activeStyle === 5) {
                    evaluateMurmurationParticle(
                        i, posHome[ix], posHome[iy], posHome[iz],
                        (randomSpeed ? randomSpeed[i] : 1.0) * 0.35 + 0.85,
                        elapsed, pattern, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                } else {
                    const maxDist = randomSpeed[i] * explosionMaxDistMultiplier;
                    evaluateExplosionParticle(
                        origin[ix], origin[iy], origin[iz],
                        randomDir[ix], randomDir[iy], randomDir[iz],
                        maxDist, expansionDuration, driftDuration || 3.0, contractionDuration, elapsed, _workerRes
                    );
                    bx = _workerRes.x; by = _workerRes.y; bz = _workerRes.z;
                }

                const dxFromOrigin = bx - origin[ix];
                const dyFromOrigin = by - origin[iy];
                const dzFromOrigin = bz - origin[iz];
                const distSq = dxFromOrigin * dxFromOrigin + dyFromOrigin * dyFromOrigin + dzFromOrigin * dzFromOrigin;
                if (distSq > maxTravelSq) maxTravelSq = distSq;
            } else {
                bx = posHome[ix];
                by = posHome[iy];
                bz = posHome[iz];
            }

            const currentX = bx + springDisp[ix];
            const currentY = by + springDisp[iy];
            const currentZ = bz + springDisp[iz];

            const dx = currentX - mx;
            const dy = currentY - my;
            const dz = currentZ - mz;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < mouseInfSq && distSq > 0.001) {
                const dist = Math.sqrt(distSq);
                const force = (1 - dist / mouseInfluence) * repulsionStr * 60.0;
                const invDist = 1 / dist;
                springVel[ix] += dx * invDist * force * dt;
                springVel[iy] += dy * invDist * force * dt;
                springVel[iz] += dz * invDist * force * dt;
            }

            springVel[ix] = (springVel[ix] - springDisp[ix] * kFrame) * dampFrame;
            springVel[iy] = (springVel[iy] - springDisp[iy] * kFrame) * dampFrame;
            springVel[iz] = (springVel[iz] - springDisp[iz] * kFrame) * dampFrame;

            springDisp[ix] += springVel[ix] * dt60;
            springDisp[iy] += springVel[iy] * dt60;
            springDisp[iz] += springVel[iz] * dt60;

            posLive[ix] = bx + springDisp[ix];
            posLive[iy] = by + springDisp[iy];
            posLive[iz] = bz + springDisp[iz];
        }

        self.postMessage({
            type: 'update',
            posLive,
            springDisp,
            springVel,
            travelRadius: Math.sqrt(maxTravelSq),
            sourceGeneration: updateSourceGeneration,
            motionToken,
            seq
        }, [posLive.buffer, springDisp.buffer, springVel.buffer]);
    }
};
