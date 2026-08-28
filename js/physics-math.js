// ---------------------------------------------
// Physics Math Kernel — Shared Calculation Engine
// ---------------------------------------------
// Single source of truth for all particle kinematic trajectories and parametric models.
// Shared across both the Web Worker thread and the main-thread CPU fallback.

export function tornadoRadius(u, p) {
    const bottom = p.funnelBottom || -20;
    const height = p.funnelHeight || 40;
    const waistU = (p.funnelWaistT != null) ? p.funnelWaistT : (p.funnelWaistU || 0.42);
    const rTail = (p.funnelTailRadius != null) ? p.funnelTailRadius : 0.8;
    const rWaist = (p.funnelWaistRadius != null) ? p.funnelWaistRadius : 3.5;
    const rCrown = (p.funnelCrownRadius != null) ? p.funnelCrownRadius : 22.0;
    const crownExp = p.funnelCrownExp || 1.4;

    if (u <= waistU) {
        const t = u / Math.max(0.01, waistU);
        return rTail + (rWaist - rTail) * (t * t);
    } else {
        const t = (u - waistU) / Math.max(0.01, 1 - waistU);
        return rWaist + (rCrown - rWaist) * Math.pow(t, crownExp);
    }
}

const EXP_NEG_2_8 = 0.06081006264583979; // Math.exp(-2.8)

export function evaluateTornadoParticle(i, hx, hy, hz, u, fx, fz, cd, elapsed, pattern, out) {
    const radiusFunnel = tornadoRadius(u, pattern);
    const baseAngle = Math.atan2(fz, fx);
    const r0 = Math.sqrt(hx * hx + hz * hz);

    const t1 = 3.5;                              // Phase 1: Generation & Ground Accretion (0 -> 3.5s)
    const t2 = pattern.vortexDuration || 4.5;    // Phase 2: Organic Ascent & Funnel Growth (3.5 -> 8.0s)
    const t3 = pattern.equilibriumDuration || 3.5;// Phase 3: Maturity & Dynamic Equilibrium (8.0 -> 11.5s)
    const t4 = 3.5;                              // Phase 4: Dissipation & Smooth Return (11.5 -> 15.0s)

    const discRadius = 14.0 + 0.55 * r0;
    const fBottom = pattern.funnelBottom || -22;
    const fHeight = pattern.funnelHeight || 46;

    // Multi-harmonic organic surface ripples (non-cone irregular surface)
    const ripple1 = 0.12 * Math.sin(3.0 * baseAngle - 4.2 * elapsed + 2.5 * u);
    const ripple2 = 0.08 * Math.cos(5.0 * baseAngle + 6.0 * elapsed - 3.8 * u);
    const ripple3 = 0.06 * Math.sin(elapsed * 7.5 + i * 0.03);
    const sheathRipple = 1.0 + ripple1 + ripple2 + ripple3;

    const diffSpin = (4.0 + 15.0 / (r0 + 4.5)) * cd;
    const vortexSpin = ((pattern.spinSpeed || 5.2) * 2.8 + 4.5 * (1.0 - u)) * cd;

    if (elapsed < t1) {
        // -- 1) Generation and Ground Phase (Phase 1: Accretion Revolution) --
        const p1 = elapsed / t1;
        const e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0); // Smooth quintic Hermite
        const rDisc = (1.0 - e1) * r0 + e1 * discRadius;

        // Continuous angular integral (strictly increasing omega > 0)
        const angle1 = baseAngle + diffSpin * (0.6 * elapsed + 0.2 * (elapsed * elapsed / t1));

        const rx = Math.cos(angle1) * rDisc;
        const ry = (1.0 - e1) * hy + e1 * (fBottom + 0.022 * rDisc * rDisc + 3.0 * (u - 0.5));
        const rz = Math.sin(angle1) * rDisc;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    } else if (elapsed < t1 + t2) {
        // -- 2) Ascent and Funnel Growth Phase (Phase 2: Vertical Funnel Vortex) --
        const tau = elapsed - t1;
        const p2 = tau / t2;
        const eLift = p2 * p2 * (3.0 - 2.0 * p2);

        // Continuous angular integral (accelerating vortex, never stalls)
        const angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        const integral2 = tau + (0.6 * t2 / Math.PI) * (1.0 - Math.cos(Math.PI * tau / t2));
        const angle2 = angleAtEnd1 + vortexSpin * 1.25 * integral2;

        const currentR = (1.0 - eLift) * discRadius + eLift * (radiusFunnel * sheathRipple);
        const axisX = 2.8 * Math.sin(1.8 * elapsed + 2.2 * u) * u * eLift;
        const axisZ = 2.4 * Math.cos(1.5 * elapsed + 1.8 * u) * u * eLift;

        const rx = axisX + Math.cos(angle2) * currentR;
        const ry = (1.0 - eLift) * (fBottom + 0.022 * discRadius * discRadius) + eLift * (fBottom + fHeight * u) + 5.5 * Math.sin(p2 * Math.PI) * u;
        const rz = axisZ + Math.sin(angle2) * currentR;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    } else if (elapsed < t1 + t2 + t3) {
        // -- 3) Maturity and Dynamic Equilibrium (Phase 3: Centrifugal Expansion) --
        const tau3 = elapsed - (t1 + t2);
        const p3 = tau3 / t3;
        const bloom = 1.0 + 0.75 * Math.sin(Math.PI * p3) + 0.35 * p3;

        // Continuous angular integral (mature roaring vortex)
        const angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        const integral2End = t2 + (1.2 * t2 / Math.PI);
        const angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        const integral3 = tau3 - (0.2 / 2.4) * (Math.cos(2.4 * tau3) - 1.0);
        const angle3 = angleAtEnd2 + vortexSpin * 1.1 * integral3;

        const currentR3 = (radiusFunnel * sheathRipple) * bloom;
        const axisX3 = 2.8 * Math.sin(1.8 * (t1 + t2) + 2.2 * u) * u * (1.0 - 0.4 * p3);
        const axisZ3 = 2.4 * Math.cos(1.5 * (t1 + t2) + 1.8 * u) * u * (1.0 - 0.4 * p3);

        const rx = axisX3 + Math.cos(angle3) * currentR3;
        const ry = fBottom + fHeight * u + (1.0 - p3) * 2.0 * u;
        const rz = axisZ3 + Math.sin(angle3) * currentR3;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    } else {
        // -- 4) Dissipation Phase (Phase 4: High-Energy Dissipation & Smooth Return) --
        const tau4 = elapsed - (t1 + t2 + t3);
        const p4 = Math.min(1.0, tau4 / t4);

        // Continuous angular integral (sustained non-stalling rotation right up to home)
        const angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        const integral2End = t2 + (1.2 * t2 / Math.PI);
        const angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        const integral3End = t3 - (0.2 / 2.4) * (Math.cos(2.4 * t3) - 1.0);
        const angleAtEnd3 = angleAtEnd2 + vortexSpin * 1.1 * integral3End;
        const integral4 = 0.85 * tau4 - 0.275 * (tau4 * tau4 / t4);
        const angle4 = angleAtEnd3 + vortexSpin * 1.1 * integral4;

        const reverseFunnelR = (radiusFunnel * sheathRipple) * (1.0 - p4) + discRadius * p4;
        const reverseFunnelY = (fBottom + fHeight * u) * (1.0 - p4) + (fBottom + 0.022 * discRadius * discRadius + 3.0 * (u - 0.5)) * p4;

        const revDiscX = Math.cos(angle4) * reverseFunnelR;
        const revDiscY = reverseFunnelY;
        const revDiscZ = Math.sin(angle4) * reverseFunnelR;

        const returnProg = 0.35 * p4 + 0.65 * Math.pow(p4, 2.2);
        const rx = (1.0 - returnProg) * revDiscX + returnProg * hx;
        const ry = (1.0 - returnProg) * revDiscY + returnProg * hy;
        const rz = (1.0 - returnProg) * revDiscZ + returnProg * hz;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    }
}

export function evaluateBreezeParticle(i, hx, hy, hz, cd, elapsed, breezeConfig, out) {
    const b = breezeConfig || {};
    const gx = (b.blowDir != null) ? b.blowDir : 1.0;
    const intensity = (b.intensity != null) ? b.intensity : 1.0;
    const turbAmp = (b.turbAmp != null) ? b.turbAmp : (0.85 + 0.45 * intensity);
    const billowFreq = (b.billowFreq != null) ? b.billowFreq : 0.22;
    const windTilt = (b.windTilt != null) ? b.windTilt : 0.0;

    const t1 = 2.5;  // Phase 1: Gentle Rustle & Elastic Foliage Sway (0.0 -> 2.5s)
    const t2 = 4.5;  // Phase 2: Augmented Wind Surge & Multi-Tier Dispersal (2.5 -> 7.0s)
    const t3 = 2.8;  // Phase 3: Calming Tailwind & Alignment (7.0 -> 9.8s)
    const t4 = 2.2;  // Phase 4: Harmonic Parachute Landing (9.8 -> 12.0s)

    const p1h = ((i * 37.119) % 100.0) / 100.0;
    const p2h = ((i * 61.19) % 100.0) / 100.0;
    const p3h = ((i * 83.11) % 100.0) / 100.0;
    const p4h = ((i * 53.17) % 100.0) / 100.0;

    const te = elapsed * cd;

    // Phase 1: In-place aero-elastic sway & strictly upward leaf flutter (Py >= hy always)
    let rampIn = Math.min(1.0, elapsed / 0.6);
    rampIn = rampIn * rampIn * (3.0 - 2.0 * rampIn);

    const cantilever = Math.pow(Math.max(0.0, (hy + 12.0) / 24.0), 1.3);
    const swayWave = 2.2 * Math.sin(2.8 * te - 0.12 * hx + p1h * 1.5) + 0.8 * Math.sin(5.5 * te + p2h * 3.14159);
    const sway = cantilever * swayWave * gx * intensity * rampIn;
    const flutterUp = Math.abs(Math.sin(8.5 * te + p4h * 6.28)) * 0.45 * cantilever * intensity * rampIn;
    const depthWaft = Math.sin(1.8 * te + p1h * 6.28) * 1.5 * cantilever * intensity * rampIn;

    let Px = hx + sway;
    let Py = hy + flutterUp; // Guaranteed >= hy
    let Pz = hz + depthWaft;

    // Phase 2 & 3: Wind surge dispersal (2.5 -> 9.8s) with peeling arrival wave
    if (elapsed > t1) {
        const tauDisperse = elapsed - t1;
        const sweepCoord = (gx > 0.0) ? (hx + 45.0) : (45.0 - hx);
        const peelDelay = sweepCoord * 0.008 + p2h * 0.35 + p3h * 0.15;
        const ltSurge = Math.max(0.0, tauDisperse - peelDelay);
        let pSurge = Math.min(1.0, ltSurge / 1.2);
        pSurge = pSurge * pSurge * (3.0 - 2.0 * pSurge);

        const surgeActiveDur = t2 + t3;
        const uFlight = Math.min(1.0, ltSurge / surgeActiveDur);
        const sDist = (uFlight * (2.0 - uFlight));
        const flightTimeEnv = Math.sin(Math.min(Math.PI, uFlight * Math.PI));

        if (pSurge > 0.0) {
            const strata = p1h;
            const rockFreq = 3.2 + p3h * 1.8;
            const rockAngle = rockFreq * te + p2h * 6.28;

            let driftX = 0, driftY = 0, driftZ = 0;

            if (strata < 0.45) {
                // Highly Turbulent Canopy Streamers (Anti-Blob, Elongated Vortex Ribbons)
                const speedVar = 0.70 + 0.60 * p3h + 0.30 * Math.sin(0.15 * hx + p1h * 6.28);
                const maxDist = (30.0 + 10.0 * p2h) * intensity * speedVar;
                driftX = gx * (maxDist * sDist);

                // Multi-harmonic vertical vortex waves with positive thermal lift
                const waveY1 = (4.0 + 4.5 * p2h) * Math.sin(billowFreq * (hx + gx * driftX * 0.35) - 2.8 * te + p1h * 6.28);
                const waveY2 = (1.5 + 1.2 * p4h) * Math.sin(0.35 * hx - 4.2 * te + p3h * 6.28);
                const baseLift = (6.0 + 8.0 * p3h) * flightTimeEnv;
                driftY = Math.max(0.0, baseLift + (waveY1 + waveY2) * flightTimeEnv * turbAmp);

                // Broad 3D depth eddy swirling across the camera plane
                const waveZ1 = (4.0 + 4.5 * p4h) * Math.cos(billowFreq * (hx + gx * driftX * 0.3) - 2.4 * te + p2h * 6.28);
                const waveZ2 = 1.6 * Math.sin(6.5 * te + p1h * 6.28);
                driftZ = (waveZ1 + waveZ2) * flightTimeEnv * turbAmp;
            } else if (strata < 0.82) {
                // Mid-Air Tumbling Leaves: 3D pendulum rocking and strictly upward buoyant lift
                const speedVar = 0.80 + 0.40 * p4h;
                const maxDist = (22.0 + 7.0 * p3h) * intensity * speedVar;
                const rockX = Math.sin(rockAngle) * (2.0 + 1.0 * p1h) * (1.0 - uFlight * 0.6);
                driftX = gx * (maxDist * sDist + rockX);

                const rockY = Math.abs(Math.cos(rockAngle)) * (4.5 + 3.0 * p4h) * flightTimeEnv;
                const flutterLift = Math.abs(Math.sin(3.0 * te + p2h * 6.28)) * 1.5 * flightTimeEnv * turbAmp;
                driftY = rockY + flutterLift;

                driftZ = Math.sin(rockAngle * 0.75 + p1h * 6.28) * (3.5 + 2.0 * p2h) * flightTimeEnv * turbAmp;
            } else {
                // Ground Skitterers: Gliding & skipping above starting height
                const maxDist = (18.0 + 5.0 * p2h) * intensity;
                driftX = gx * (maxDist * sDist);
                driftY = Math.abs(Math.sin(rockAngle * 1.5)) * (1.8 + 1.0 * p3h) * (1.0 - uFlight * 0.6);
                driftZ = Math.sin(rockAngle * 0.5) * (2.0 + 0.8 * p4h) * (1.0 - uFlight * 0.6);
            }

            // Blend sway into dispersed flight
            Px = Px + driftX * pSurge;
            Py = Py + driftY * pSurge;
            Pz = Pz + driftZ * pSurge;
        }
    }

    // Strict non-descending invariant: particles NEVER drop below their starting height hy
    Py = Math.max(hy, Py);

    // Phase 4: Precision Harmonic Parachute Landing (9.8 -> 12.0s)
    let rx = Px, ry = Py, rz = Pz;
    if (elapsed >= (t1 + t2 + t3)) {
        const tau4 = elapsed - (t1 + t2 + t3);
        const st = p2h * 0.20;
        let q = Math.max(0.0, Math.min(1.0, (tau4 - st) / (t4 - st)));
        const e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        rx = Px + (hx - Px) * e4;
        ry = Py + (hy - Py) * e4;
        rz = Pz + (hz - Pz) * e4;
    }

    // Final safety clamp: Py >= hy ALWAYS
    ry = Math.max(hy, ry);

    if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
    return { x: rx, y: ry, z: rz };
}

export function evaluateExplosionParticle(ox, oy, oz, rx, ry, rz, maxDist, expDur, driftDur, contrDur, elapsed, out) {
    const tDrift = (driftDur !== undefined && driftDur !== null && driftDur > 0.0) ? driftDur : 3.0;
    const peakProg = (1.0 - EXP_NEG_2_8) * 0.82 + 0.18;
    const vLatest = (2.8 * EXP_NEG_2_8 * 0.82 + 0.18) / Math.max(0.1, expDur);
    const driftPeakProg = peakProg + vLatest * tDrift * 0.78;

    let dist;
    if (elapsed < expDur) {
        const u = elapsed / expDur;
        dist = ((1.0 - Math.exp(-2.8 * u)) * 0.82 + 0.18 * u) * maxDist;
    } else if (elapsed < expDur + tDrift) {
        const dtDrift = elapsed - expDur;
        const driftRatio = dtDrift / Math.max(0.01, tDrift);
        const prog = peakProg + vLatest * dtDrift * (1.0 - 0.22 * driftRatio);
        dist = prog * maxDist;
    } else {
        const v = Math.min(1.0, Math.max(0.0, (elapsed - (expDur + tDrift)) / Math.max(0.1, contrDur)));
        // Fast increasingly accelerated in-fall return
        const returnProg = Math.max(0.0, 1.0 - Math.pow(v, 2.4));
        dist = driftPeakProg * returnProg * maxDist;
    }

    const px = ox + rx * dist;
    const py = oy + ry * dist;
    const pz = oz + rz * dist;
    if (out) { out.x = px; out.y = py; out.z = pz; return out; }
    return { x: px, y: py, z: pz };
}

export function evaluateKineticParticle(i, hx, hy, hz, cd, elapsed, kineticConfig, out) {
    const totalDur = 7.5;
    const p = Math.min(1.0, Math.max(0.0, elapsed / totalDur));

    // Wave travels smoothly and continuously all the way across the entire object (-48 to +48)
    const xPeel = -48.0 + 96.0 * p;

    // Peeling wave distance function (slanted surf angle)
    const dPeel = (hx + 0.25 * hy) - xPeel;
    const tubeWidth = 9.2; // Crisp, well-defined wave tube

    // Gaussian wave packet envelope - strictly local to the wave front
    const env = Math.exp(-(dPeel * dPeel) / (2.0 * tubeWidth * tubeWidth));

    // Smooth temporal envelope: clean entrance on left, smooth exit on right
    const timeEnv = Math.sin(Math.PI * p);
    const waveEnv = env * (0.35 + 0.65 * timeEnv);

    // Continuous wave phase angle
    const theta = (Math.PI * dPeel) / (2.0 * tubeWidth);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Dynamic wave height with curling crest
    const waveHeight = 16.0;

    // Vertical blend for top lip curling
    const lipBlend = 0.5 + 0.5 * Math.tanh(hy / 8.0);

    // Trochoidal wave profile: steep crest, wide trough
    const baseWaveZ = waveHeight * (cosT - 0.30 * Math.sin(2.0 * theta));
    const curlZ = 5.0 * lipBlend * Math.max(0.0, cosT);
    const curlY = -3.5 * lipBlend * Math.max(0.0, sinT);

    // All motion is strictly bound to the active wave envelope (env) so resting areas stay 100% crisp
    const deltaZ = waveEnv * (baseWaveZ + curlZ);
    const deltaY = waveEnv * ((waveHeight * 0.14) * sinT + curlY);
    const deltaX = -waveEnv * (waveHeight * 0.06) * sinT;

    const px = hx + deltaX;
    const py = hy + deltaY;
    const pz = hz + deltaZ;
    if (out) { out.x = px; out.y = py; out.z = pz; return out; }
    return { x: px, y: py, z: pz };
}

// ---------------------------------------------
// Style 4: TORUS — black hole trefoil knot
// ---------------------------------------------
// Timeline (must match CONFIG.presets.TORUS, totalExplosionDuration, and audio):
//   Collapse    0.0 ->  3.0s  vortex suck-in: home spirals onto the knot
//   Knot Flow   3.0 -> 11.5s  particles stream along a breathing trefoil
//                             (2,3) torus knot — flowing core, swirling tube,
//                             precessing frame
//   Reformation 11.5 -> 16.0s release swirl, spiral rain back home
// All per-particle variation derives from index hashes, so the function stays
// stateless and identical on the GPU shader, Web Worker, and CPU fallback.

export function evaluateTorusParticle(i, hx, hy, hz, cd, elapsed, cfg, out) {
    const t1 = 2.8;   // Phase 1: Magnetic Pinch & Core Ignition (0.0 -> 2.8s)
    const t2 = 7.7;   // Phase 2: Helical Plasma Confinement & Flare Surge (2.8 -> 10.5s)
    const t3 = 3.0;   // Phase 3: Magnetic Cooldown & Laminar Quench (10.5 -> 13.5s)
    const t4 = 2.5;   // Phase 4: Cold Fusion Re-crystallization (13.5 -> 16.0s)

    const p1h = ((i * 37.119) % 100.0) / 100.0;
    const p2h = ((i * 61.19) % 100.0) / 100.0;
    const p3h = ((i * 83.11) % 100.0) / 100.0;
    const p4h = ((i * 53.17) % 100.0) / 100.0;

    const te = elapsed * cd;

    // Torus Major & Minor Dimensions
    const scale = (cfg && cfg.knotScale > 0) ? cfg.knotScale : 14.5;
    const R0 = scale;             // Major radius of the plasma ring (~14.5u)
    const r0 = scale * 0.35;       // Minor tube radius (~5.1u)

    // 3-strand helical coil distribution
    const strandId = i % 3.0;
    const strandPhase = strandId * 2.094395; // 2*PI/3

    // Toroidal angle (around main ring) and Poloidal angle (around tube core)
    const theta0 = p1h * 6.283185;
    const phi0 = p2h * 6.283185 + strandPhase;

    // Confinement angular velocities (safety factor q = 4.0 helical pitch)
    const omegaToroidal = 0.75 * cd;
    const omegaPoloidal = 3.20 * cd;

    const theta = theta0 + omegaToroidal * te;
    const phi = phi0 + omegaPoloidal * te;

    // Pulsating coronal flares and magnetic turbulence
    const flareEnv = Math.sin(Math.min(Math.PI, Math.max(0.0, (elapsed - t1) / t2) * Math.PI));
    const flarePulse = Math.pow(Math.abs(Math.sin(3.5 * te + p3h * 6.28318)), 3.0);
    const flareRadius = (3.5 + 4.5 * p4h) * flarePulse * flareEnv;
    const flareZ = (2.2 * Math.cos(2.8 * te + p1h * 6.28318)) * flareEnv;

    const currentR = R0 + (r0 * (0.85 + 0.30 * Math.sqrt(p3h)) + flareRadius) * Math.cos(phi);
    const localX = currentR * Math.cos(theta);
    const localY = currentR * Math.sin(theta);
    const localZ = (r0 * (0.85 + 0.30 * Math.sqrt(p3h)) + flareRadius) * Math.sin(phi) + flareZ;

    // 3D Precession and gimbal nutation
    const tiltX = 0.28 * Math.sin(0.45 * te);
    const tiltZ = 0.22 * Math.cos(0.35 * te);
    const cTx = Math.cos(tiltX), sTx = Math.sin(tiltX);
    const cTz = Math.cos(tiltZ), sTz = Math.sin(tiltZ);

    // Rotate into world plasma orientation
    const kx = localX * cTz - localY * sTz;
    const ky = (localX * sTz + localY * cTz) * cTx - localZ * sTx;
    const kz = (localX * sTz + localY * cTz) * sTx + localZ * cTx;

    let Px, Py, Pz;

    if (elapsed < t1) {
        // Phase 1: Magnetic Pinch & Core Ignition (0.0 -> 2.8s)
        const p1 = elapsed / t1;
        const e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);

        // Subtle magnetic pinch compression during the first 40% of Phase 1
        const pinchEnv = Math.sin(Math.min(Math.PI, p1 * 2.5 * Math.PI));
        const pinchScale = 1.0 - 0.22 * pinchEnv;

        const hxPinch = hx * pinchScale;
        const hyPinch = hy * pinchScale;
        const hzPinch = hz * pinchScale;

        // Spiral transition onto the plasma torus
        const swirlAngle = 1.5 * cd * Math.sin(Math.PI * e1);
        const cS = Math.cos(swirlAngle), sS = Math.sin(swirlAngle);
        const sx = hxPinch * cS - hzPinch * sS;
        const sz = hxPinch * sS + hzPinch * cS;

        Px = sx + (kx - sx) * e1;
        Py = hyPinch + (ky - hyPinch) * e1;
        Pz = sz + (kz - sz) * e1;
    } else if (elapsed < t1 + t2) {
        // Phase 2: Helical Plasma Confinement & Flare Surge (2.8 -> 10.5s)
        Px = kx;
        Py = ky;
        Pz = kz;
    } else if (elapsed < t1 + t2 + t3) {
        // Phase 3: Magnetic Cooldown & Laminar Quench (10.5 -> 13.5s)
        const p3 = (elapsed - (t1 + t2)) / t3;
        const e3 = p3 * p3 * (3.0 - 2.0 * p3);

        // Relax flares and orient toward home grid
        const quenchKx = kx * (1.0 - 0.35 * e3);
        const quenchKy = ky * (1.0 - 0.35 * e3);
        const quenchKz = kz * (1.0 - 0.70 * e3);

        Px = quenchKx;
        Py = quenchKy;
        Pz = quenchKz;
    } else {
        // Phase 4: Cold Fusion Re-crystallization (13.5 -> 16.0s)
        const tau4 = elapsed - (t1 + t2 + t3);
        const st = p2h * 0.25;
        let q = Math.max(0.0, Math.min(1.0, (tau4 - st) / (t4 - st)));
        const e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);

        // Smooth landing onto home text
        Px = kx * (1.0 - 0.35) * (1.0 - e4) + hx * e4;
        Py = ky * (1.0 - 0.35) * (1.0 - e4) + hy * e4;
        Pz = kz * (1.0 - 0.70) * (1.0 - e4) + hz * e4;
    }

    // 360-degree turntable camera yaw during active plasma burn (Phase 2)
    const yawU = Math.max(0.0, Math.min(1.0, (elapsed - t1) / (t2 + t3)));
    const yawS = yawU * yawU * yawU * (yawU * (yawU * 6.0 - 15.0) + 10.0);
    const yawA = 6.283185307179586 * yawS;
    const cyw = Math.cos(yawA), syw = Math.sin(yawA);
    const finalX = cyw * Px + syw * Pz;
    const finalZ = -syw * Px + cyw * Pz;

    if (out) { out.x = finalX; out.y = Py; out.z = finalZ; return out; }
    return { x: finalX, y: Py, z: finalZ };
}

// ---------------------------------------------
// Style 5: MURMURATION — the sculpture takes flight as a starling flock
// ---------------------------------------------
// Timeline (must match CONFIG.presets.MURMURATION, totalExplosionDuration, and audio):
//   Phase 1 Take-off  0.0 -> 2.0s   launch ripple sweeping left to right
//   Phase 2 Flight    2.0 -> 9.0s   Lissajous flock path + whip jinks + churn +
//                                   boil turbulence + darting scouts + snap turns,
//                                   split/merge, and randomized predator dodges
//   Phase 3 Settle    9.0 -> 12.0s  flock decelerates and spirals toward origin
//   Phase 4 Landing  12.0 -> 14.0s staggered glide home with soft touchdown
// Flocking is emulated statelessly: a shared analytic flight plan plus a
// divergence-free style churn field keyed on slot coordinates, so every frame
// is a pure function of (i, home, elapsed, plan).
//
// The flight plan AND the event schedule are randomized per blast:
// triggerExplosion writes mSweep*/mFreq*/mPh*/mLaunchDir plus mTurn*/mSplit*/
// mDodge*/mBoil*/mChurnMult/mFlutterMult/mJink*/mBreathAmp into state.pattern
// (reaching the worker via the 'randomize' message and the CPU fallback via
// state.pattern), so every murmuration flies a different choreography.
// Missing fields fall back to defaults that reproduce the pre-upgrade sweep.

export function evaluateMurmurationParticle(i, hx, hy, hz, cd, elapsed, cfg, out) {
    const t1 = 2.0;  // Phase 1: Launch & Pod Separation (0.0 -> 2.0s)
    const t2 = 7.0;  // Phase 2: Independent Flanking -> Mid-Flight Merge -> Re-separation (2.0 -> 9.0s)
    const t3 = 3.0;  // Phase 3: Settle & Harmonized Swarm (9.0 -> 12.0s)
    const t4 = 2.0;  // Phase 4: Precision Landing (12.0 -> 14.0s)

    const c = cfg || {};
    // Per-blast randomized trajectory & novelty parameters
    const swX = (c.mSweepX != null) ? c.mSweepX : 28.0;
    const swY = (c.mSweepY != null) ? c.mSweepY : 7.0;
    const swZ = (c.mSweepZ != null) ? c.mSweepZ : 16.0;
    const fX = (c.mFreqX != null) ? c.mFreqX : 0.52;
    const fY = (c.mFreqY != null) ? c.mFreqY : 0.95;
    const fZ = (c.mFreqZ != null) ? c.mFreqZ : 0.46;
    const phX = (c.mPhX != null) ? c.mPhX : 0.0;
    const phY = (c.mPhY != null) ? c.mPhY : 1.2;
    const phZ = (c.mPhZ != null) ? c.mPhZ : 2.4;
    const launchDir = (c.mLaunchDir != null) ? c.mLaunchDir : 1.0;
    const turnDir = (c.mTurnDir != null) ? c.mTurnDir : 1.0;
    const breathAmp = (c.mBreathAmp != null) ? c.mBreathAmp : 1.0;
    const jinkAmp = (c.mJinkAmp != null) ? c.mJinkAmp : 1.0;
    const podRot = (c.mPodAngle != null) ? c.mPodAngle : 0.0;
    const mergeCenter = (c.mMergeTime != null) ? c.mMergeTime : 6.8;

    const p1h = ((i * 37.119) % 100.0) / 100.0;
    const p2h = ((i * 61.19) % 100.0) / 100.0;
    const p3h = ((i * 83.11) % 100.0) / 100.0;
    const p4h = ((i * 53.17) % 100.0) / 100.0;

    // Staggered launch delay
    const sweepCoord = (launchDir > 0.0) ? (hx + 45.0) : (45.0 - hx);
    const delay = sweepCoord * 0.010 + p2h * 0.35;
    const lt = elapsed - delay;
    if (lt <= 0.0) {
        if (out) { out.x = hx; out.y = hy; out.z = hz; return out; }
        return { x: hx, y: hy, z: hz };
    }

    let lb = Math.min(1.0, lt / 1.0);
    lb = lb * lb * (3.0 - 2.0 * lb);
    const hop = Math.sin(Math.min(1.0, lt / 1.0) * Math.PI) * 1.8;

    const te = elapsed * cd;

    // Swarm Base Path Center C(t)
    const Cx = swX * Math.sin(fX * te + phX);
    const Cy = swY * Math.sin(fY * te + phY) + 2.5 * Math.cos(0.35 * te);
    const Cz = swZ * Math.cos(fZ * te + phZ);

    // Analytic Velocity / Tangent Vector along Path
    const Vx = swX * fX * Math.cos(fX * te + phX);
    const Vy = swY * fY * Math.cos(fY * te + phY) - 0.88 * Math.sin(0.35 * te);
    const Vz = -swZ * fZ * Math.sin(fZ * te + phZ);
    const speed = Math.sqrt(Vx * Vx + Vy * Vy + Vz * Vz) || 1.0;
    const tx = Vx / speed, ty = Vy / speed, tz = Vz / speed;

    // Smooth Orthogonal Normal & Binormal (singularity-free)
    const roll = (0.50 * te + phX * 0.5) * turnDir;
    const pitch = 0.30 * te + phY * 0.5;
    const nx = Math.cos(roll) * (1.0 - ty * ty * 0.5);
    const ny = Math.sin(pitch) * 0.7;
    const nz = -Math.sin(roll);
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    const unx = nx / nLen, uny = ny / nLen, unz = nz / nLen;

    const bx = uny * tz - unz * ty;
    const by = unz * tx - unx * tz;
    const bz = unx * ty - uny * tx;

    // 2 Distinct Murmuration Pods: Pod +1 and Pod -1
    const podSide = (i % 2 === 0) ? 1.0 : -1.0;

    // Smooth Mid-Flight Merge & Re-separation Bell Curve (Peak at mergeCenter ~6.8s)
    const uM = (elapsed - mergeCenter) / 1.6;
    const mergeEnvelope = Math.exp(-uM * uM);

    // Flocking pod separation: contracts smoothly to 0 during merge, expands during independent flight
    const independentSep = (7.5 + 3.0 * breathAmp) * (1.0 - mergeEnvelope);
    const flankAngle = 0.85 * te * turnDir + podRot;

    const podOffsetX = (unx * Math.cos(flankAngle) + bx * Math.sin(flankAngle)) * (podSide * independentSep);
    const podOffsetY = (uny * Math.cos(flankAngle) + by * Math.sin(flankAngle)) * (podSide * independentSep);
    const podOffsetZ = (unz * Math.cos(flankAngle) + bz * Math.sin(flankAngle)) * (podSide * independentSep);

    // Dynamic 3D Stretching & Concentration:
    const speedFactor = Math.min(1.0, speed / 14.0);
    const stretchLongitudinal = (0.9 + 2.0 * speedFactor * breathAmp) * (1.0 - 0.30 * mergeEnvelope);
    const blobRadiusScale = (1.0 + 0.50 * mergeEnvelope);
    const stretchLateral = blobRadiusScale / Math.sqrt(Math.max(0.4, stretchLongitudinal));

    // True 3D Solid Volumetric Dispersion (Gaussian-like core, NO hollow rings)
    const baseRadius = Math.cbrt(p1h) * (4.8 + 2.4 * p4h) * stretchLateral;
    const theta0 = p2h * 6.283185;
    const cosPhi0 = (p3h - 0.5) * 2.0; // [-1, 1]
    const sinPhi0 = Math.sqrt(Math.max(0.0, 1.0 - cosPhi0 * cosPhi0));

    // Fluid-like 3D Convolution: Bounded phase integration
    const swirlAngle = (2.2 + 1.2 * p1h) * turnDir * te + p2h * 6.28 + 0.12 * hx;
    const thetaConvolute = theta0 + swirlAngle;

    const morphX = 1.0 + 0.25 * Math.sin(1.8 * te + p3h * 3.14);
    const morphY = 1.0 + 0.25 * Math.cos(2.2 * te + p1h * 3.14);

    const localTan = (baseRadius * sinPhi0 * Math.cos(thetaConvolute)) * stretchLongitudinal;
    const localNorm = (baseRadius * sinPhi0 * Math.sin(thetaConvolute) * morphX);
    const localBinorm = (baseRadius * cosPhi0 * morphY);

    // Shearing & Internal Eddy Waves
    const shearWave = Math.sin(0.18 * (hx + Cx) - 2.2 * te + podSide * 1.5) * (1.6 * jinkAmp);
    const churnX = Math.sin(2.4 * te + p1h * 6.28 + hx * 0.08) * (1.2 * jinkAmp);
    const churnY = Math.cos(2.8 * te + p2h * 6.28 + hy * 0.08) * (0.9 * jinkAmp);
    const churnZ = Math.sin(2.1 * te + p3h * 6.28 + hz * 0.08) * (1.2 * jinkAmp);

    // Assemble 3D World Position of the Volumetric Morphing Blob
    let Px = Cx + podOffsetX + tx * localTan + unx * localNorm + bx * (localBinorm + shearWave) + churnX;
    let Py = Cy + podOffsetY + ty * localTan + uny * localNorm + by * (localBinorm + shearWave) + churnY + hop;
    let Pz = Cz + podOffsetZ + tz * localTan + unz * localNorm + bz * (localBinorm + shearWave) + churnZ;

    // Phase 4: Precision Landing Blend (12.0 -> 14.0s)
    let rx = Px, ry = Py, rz = Pz;
    if (elapsed >= (t1 + t2 + t3)) {
        const tau4 = elapsed - (t1 + t2 + t3);
        const st = p2h * 0.35;
        let q = Math.max(0.0, Math.min(1.0, (tau4 - st) / (t4 - st)));
        const e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        rx = Px + (hx - Px) * e4;
        ry = Py + (hy - Py) * e4;
        rz = Pz + (hz - Pz) * e4;
    }

    if (lb < 1.0) {
        rx = hx + (rx - hx) * lb;
        ry = hy + (ry - hy) * lb;
        rz = hz + (rz - hz) * lb;
    }

    if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
    return { x: rx, y: ry, z: rz };
}

// ---------------------------------------------
// Hover Ripples — Shared Interactive Wave Kernel
// ---------------------------------------------
// Expanding ring wavefronts emitted by pointer gestures ("rock throw" hover).
// State is a flat Float32Array of RIPPLE_COUNT quadruples (x, y, age, amp) in
// sculpture-local space. Ages advance on the main thread each frame, so the
// worker and CPU fallback stay clock-free: they read the same array verbatim.

export const RIPPLE_COUNT = 8;
export const RIPPLE_MAX_RADIUS = 40.0; // hard reach cap (u)
export const RIPPLE_HEIGHT = 2.2;      // peak radial push at amp = 1 (u)
export const RIPPLE_Z_LIFT = 0.9;      // depth lift at amp = 1 (u)

// Intensity-driven wavefront profile: the bigger the splash, the faster it
// spreads, the more distant it reaches, and the longer it stays visible.
// Pebble (amp 0.8): 11 u/s, ~17.6u reach, fades near origin.
// Boulder (amp 4.0): 19 u/s, 40u full sweep, still bright at the far edge.
// All engines (worker, CPU fallback, GLSL glow) derive from this single
// pure function so no extra state travels with the slots.
export function rippleProfile(amp) {
    const speed = 9.0 + 2.5 * amp;             // expansion speed (u/s)
    const maxRadius = Math.min(RIPPLE_MAX_RADIUS, 12.0 + 7.0 * amp);
    return {
        speed,
        maxRadius,
        lifetime: maxRadius / speed,           // ring dies exactly at its reach
        decay: 2.2 - 0.3 * amp,                // bigger splashes stay visible en route
        width: 2.0 + 0.75 * amp                // ring half-width (u)
    };
}

export function createRippleState() {
    return new Float32Array(RIPPLE_COUNT * 4);
}

// Write a ripple into slot idx; age starts at 0. Amp <= 0 marks the slot empty.
export function emitRipple(ripples, idx, x, y, amp) {
    const o = idx * 4;
    ripples[o] = x;
    ripples[o + 1] = y;
    ripples[o + 2] = 0;
    ripples[o + 3] = amp;
}

// Advance wavefront ages; expired slots are zeroed (amp = 0 = inactive).
export function ageRipples(ripples, dt) {
    for (let o = 0; o < ripples.length; o += 4) {
        if (ripples[o + 3] <= 0) continue;
        ripples[o + 2] += dt;
        const profile = rippleProfile(ripples[o + 3]);
        const radius = ripples[o + 2] * profile.speed;
        if (ripples[o + 2] > profile.lifetime || radius > profile.maxRadius) {
            ripples[o + 3] = 0;
        }
    }
}

// True when at least one wavefront is still traveling.
export function hasActiveRipples(ripples) {
    for (let o = 3; o < ripples.length; o += 4) {
        if (ripples[o] > 0) return true;
    }
    return false;
}

// Summed target displacement of all active wavefronts at a point:
// a radial XY push (visible under the orthographic camera) plus a small
// Z lift that feeds the depth-cue shading. The sin(pi*s) profile makes a
// smooth 0..1..0 pulse centered on the wavefront, so displacement rises and
// falls cleanly as the ring passes through a particle.
export function rippleOffset(px, py, pz, ripples, out) {
    let dx = 0, dy = 0, dz = 0;
    for (let o = 0; o < ripples.length; o += 4) {
        const amp = ripples[o + 3];
        if (amp <= 0) continue;
        const age = ripples[o + 2];
        const profile = rippleProfile(amp);
        const vx = px - ripples[o];
        const vy = py - ripples[o + 1];
        const dist = Math.sqrt(vx * vx + vy * vy);
        if (dist < 0.0001) continue;
        const ringR = age * profile.speed;
        const s = 1 - Math.abs(dist - ringR) / profile.width;
        if (s <= 0) continue;
        const bump = Math.sin(Math.PI * s) * Math.exp(-profile.decay * age) * amp;
        const radial = bump * RIPPLE_HEIGHT / dist;
        dx += vx * radial;
        dy += vy * radial;
        dz += bump * RIPPLE_Z_LIFT;
    }
    out.x = dx; out.y = dy; out.z = dz;
    return out;
}
