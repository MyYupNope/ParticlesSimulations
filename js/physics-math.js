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

function computeBreezePlume(tWind, curElapsed, lambda, gX, gY, gZ, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i, out) {
    // 1. Progressive Gust Front with randomized localized wave arrival
    const upwindPos = (gX * gx) + 25.0;
    const randOffset = (((i * 53.17) % 100.0) / 100.0) * 0.30;
    const gustDelay = Math.min(0.75, Math.max(0.0, upwindPos * 0.015 + randOffset));
    const localT = Math.max(0.0, tWind - gustDelay);
    const pLocal = Math.min(1.0, localT / (t2 - gustDelay + 1e-4));

    if (localT <= 0.0) {
        if (out) { out.x = gX; out.y = gY; out.z = gZ; return out; }
        return { x: gX, y: gY, z: gZ };
    }

    // -- Option 1: 3D Spiral Ribbons & Braided Filaments --
    // 3 distinct interwoven silk ribbons (phases 0, 2pi/3, 4pi/3)
    const ribbonId = i % 3.0;
    const ribbonPhase = ribbonId * 2.094395; // 2*PI/3
    const braidWavelength = 0.15;
    const braidSpeed = 2.8;
    const braidAngle = braidWavelength * (gX * gx) - braidSpeed * curElapsed + ribbonPhase;
    const braidRadius = (1.8 + 3.8 * buoyancy) * Math.min(1.0, localT / 0.8) * intensity;
    const braidY = braidRadius * Math.sin(braidAngle);
    const braidZ = braidRadius * Math.cos(braidAngle);
    const braidX = gx * (braidRadius * 0.55 * Math.sin(braidAngle * 0.5));

    // -- Option 6: Floating Leaf Flutter & Pendulum Gliding --
    // Pendulum rocking phase (simulates leaves/petals rocking back & forth as they catch air pockets)
    const leafRockFreq = 3.6 + (((i * 41.73) % 100.0) / 100.0) * 2.0;
    const leafPhase = (((i * 67.89) % 100.0) / 100.0) * 6.28318;
    const pendulumAngle = leafRockFreq * curElapsed + leafPhase;

    // Rocking side-to-side cross-glide and buoyant apex lift
    const leafGlideX = gx * (Math.sin(pendulumAngle) * (0.80 + 1.10 * windSpeedMult)) * intensity;
    const leafGlideY = Math.abs(Math.cos(pendulumAngle)) * (0.95 + 1.45 * buoyancy) * intensity;
    const leafGlideZ = Math.sin(pendulumAngle * 0.75 + leafPhase) * (1.30 + 1.80 * windSpeedMult) * intensity;

    // High-frequency fluttering edge wobble
    const leafWobble = Math.sin(9.5 * curElapsed + i * 0.35) * 0.40 * intensity * Math.min(1.0, localT);

    // -- Swirl / Whirlwind Vortex Dynamics (Randomized from 0.0 to 1.4+) --
    const swirlSign = (((i * 29.17) % 10.0) > 5.0) ? 1.0 : -1.0;
    const swirlAngle = 0.12 * (gX * gx) - 3.8 * curElapsed * swirlSign + (((i * 31.41) % 100.0) / 100.0) * 6.28318;
    const swirlEnvelope = Math.sin(Math.PI * pLocal);
    const swirlRadius = (3.2 + 6.0 * buoyancy) * (swirl || 0.0) * intensity * swirlEnvelope;
    const swirlY = swirlRadius * Math.sin(swirlAngle);
    const swirlZ = swirlRadius * Math.cos(swirlAngle);
    const swirlX = gx * (swirlRadius * 0.35 * Math.cos(swirlAngle * 2.0));

    if (lambda > 0.82) {
        // -- Strata C: Ground Skittering Leaves (Tumbling along floor) --
        const groundSpeed = (3.2 + 6.0 * windSpeedMult) * intensity;
        const groundDist = groundSpeed * (localT * 0.85 + 0.08 * localT * localT);
        const groundSkip = (0.35 * Math.abs(Math.sin(pendulumAngle)) + 0.10 * Math.sin(curElapsed * 10.0 + i)) * Math.min(1.0, localT);
        const groundZDrift = (0.75 * Math.sin(pendulumAngle * 0.6) + leafWobble + swirlZ * 0.25) * Math.min(1.0, localT);

        const rx = gX + gx * groundDist + leafGlideX * 0.4 + swirlX * 0.25;
        const ry = Math.max(gY, gY + groundSkip);
        const rz = gZ + groundZDrift;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    } else {
        // -- Strata A & B: Airborne Braided Ribbon Streams + Floating Leaf Gliding + Swirl Vortex --
        const indLiftStart = liftStart * 0.50;
        const liftProg = Math.min(1.0, Math.max(0.0, (pLocal - indLiftStart) / (1.0 - indLiftStart + 1e-4)));
        const eLift = liftProg * liftProg * (3.0 - 2.0 * liftProg);

        // Dynamic aerodynamic forward drift along streamlines
        const randSpeedVariation = (((i * 83.11) % 100.0) / 100.0) * 2.4 - 1.2;
        const baseSpeed = Math.max(2.4, 4.2 + 8.5 * windSpeedMult + 3.8 * buoyancy + randSpeedVariation);
        const xDispersal = (localT * baseSpeed + 0.45 * localT * localT * (0.4 + 0.6 * buoyancy)) * intensity;

        // Harmonic plume altitude
        const randHeight = (((i * 93.41) % 100.0) / 100.0) * 2.8;
        const baseLiftHeight = (3.0 + 7.5 * buoyancy + randHeight) * intensity;
        const totalLift = Math.max(0.0, baseLiftHeight + braidY + leafGlideY + leafWobble);

        const rx = gX + gx * xDispersal + braidX + leafGlideX + eLift * swirlX;
        const ry = Math.max(gY, gY + eLift * (totalLift + swirlY));
        const rz = gZ + eLift * (braidZ + leafGlideZ + leafWobble + swirlZ);

        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    }
}

export function evaluateBreezeParticle(i, hx, hy, hz, cd, elapsed, breezeConfig, out) {
    const b = breezeConfig || {};
    const gx = (b.blowDir != null) ? b.blowDir : 1.0;
    const intensity = (b.intensity != null) ? b.intensity : 1.0;
    const swirl = (b.swirl != null) ? b.swirl : 0.0;

    const t1 = 1.0;        // Phase 1: Straight Ground Fall (0 -> 1.0s)
    const tPause = 2.0;    // Ground Rest: 2 seconds on floor (1.0 -> 3.0s)
    const t2 = 3.6;        // Phase 2: Forward Fuzzy Breeze Lift (3.0 -> 6.6s)
    const t3 = 3.6;        // Phase 3: Reverse Breeze Flow to Floor (6.6 -> 10.2s)
    const t4 = 1.6;        // Phase 4: Reverse Drop Elevation Home (10.2 -> 11.8s)

    const lambda = ((i * 37.119) % 100.0) / 100.0;
    const isClash = (lambda < 0.22);

    const seedX = ((i * 19.417) % 100.0) - 50.0;
    const seedZ = ((i * 29.831) % 100.0) - 50.0;

    const scatX = isClash ? seedX * 0.05 : 0.0;
    const scatZ = isClash ? seedZ * 0.04 : 0.0;
    const yGround = -11.0; // Prominently visible in lower canvas

    const gX = hx + scatX;
    const gY = yGround + (hy * 0.03);
    const gZ = hz + scatZ;

    const windSpeedMult = 0.55 + (((i * 43.71) % 100.0) / 100.0) * 0.90;
    const buoyancy = 0.40 + (((i * 81.33) % 100.0) / 100.0) * 1.10;
    const liftStart = Math.pow(((i * 61.19) % 100.0) / 100.0, 1.4) * 0.60;

    if (elapsed < t1) {
        // -- 1) Phase 1: Straight Vertical Fall & Floor Impact --
        const p1 = elapsed / t1;
        const eDrop = p1 * p1;

        const pImpact = Math.max(0.0, (p1 - 0.70) / 0.30);
        const eImpact = pImpact * (2.0 - pImpact);
        const recoil = (isClash ? 1.6 : 0.5) * Math.sin(Math.PI * pImpact) * (1.0 - pImpact);

        const rx = hx + scatX * eImpact;
        const ry = (1.0 - eDrop) * hy + eDrop * gY + recoil;
        const rz = hz + scatZ * eImpact;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    } else if (elapsed < t1 + tPause) {
        // -- 1.5) Ground Pause: 2 full seconds resting flat on visible floor --
        if (out) { out.x = gX; out.y = gY; out.z = gZ; return out; }
        return { x: gX, y: gY, z: gZ };
    } else if (elapsed < t1 + tPause + t2) {
        // -- 2) Phase 2: Forward Fuzzy Breeze Lift --
        const tWind = elapsed - (t1 + tPause);
        return computeBreezePlume(tWind, elapsed, lambda, gX, gY, gZ, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i, out);
    } else if (elapsed < t1 + tPause + t2 + t3) {
        // -- 3) Phase 3: Exact Reverse Breeze Flow back to Ground Floor --
        const p3 = (elapsed - (t1 + tPause + t2)) / t3;
        const smoothP3 = p3 * p3 * (3.0 - 2.0 * p3);
        const tWindRev = t2 * (1.0 - smoothP3);
        return computeBreezePlume(tWindRev, elapsed, lambda, gX, gY, gZ, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i, out);
    } else {
        // -- 4) Phase 4: Reverse Drop (Straight Elevation to Rest) --
        const p4 = Math.min(1.0, (elapsed - (t1 + tPause + t2 + t3)) / t4);
        const eRise = p4 * p4 * (3.0 - 2.0 * p4);

        const rx = (1.0 - eRise) * gX + eRise * hx;
        const ry = (1.0 - eRise) * gY + eRise * hy;
        const rz = (1.0 - eRise) * gZ + eRise * hz;
        if (out) { out.x = rx; out.y = ry; out.z = rz; return out; }
        return { x: rx, y: ry, z: rz };
    }
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
    const t1 = 3.0;      // Collapse end
    const T123 = 11.5;   // Knot Flow end
    const t4 = 4.5;      // Reformation duration

    // Deterministic per-particle hashes in [0,1)
    const hA = ((i * 37.119) % 100.0) / 100.0; // slot along the knot
    const hB = ((i * 61.19) % 100.0) / 100.0;  // collapse delay
    const hD = ((i * 29.17) % 100.0) / 100.0;  // release delay
    const hE = ((i * 53.17) % 100.0) / 100.0;  // tube radius
    const hF = ((i * 91.73) % 100.0) / 100.0;  // tube angle

    // Precessing frame: tiltX≈60° puts the knot plane nearly face-on to the
    // camera (nn_z=sin(tiltX)) — projects as the woven 3-lobe clover
    const tiltX = 1.05 + 0.04 * Math.sin(0.35 * elapsed);
    const tiltZ = 0.07 + 0.02 * Math.cos(0.30 * elapsed);
    const cTx = Math.cos(tiltX), sTx = Math.sin(tiltX);
    const cTz = Math.cos(tiltZ), sTz = Math.sin(tiltZ);
    let exX = cTz, exY = sTz, exZ = 0.0;
    let ezX = -sTz * sTx, ezY = cTz * sTx, ezZ = cTx;
    const ezLen = Math.sqrt(ezX * ezX + ezY * ezY + ezZ * ezZ) || 1.0;
    ezX /= ezLen; ezY /= ezLen; ezZ /= ezLen;
    const nX = exY * ezZ - exZ * ezY;
    const nY = exZ * ezX - exX * ezZ;
    const nZ = exX * ezY - exY * ezX;

    // Trefoil as (2,3) torus knot — face-on woven clover like the reference.
    // Path: ((RK + rK*cos(3u))*cos(2u), (RK + rK*cos(3u))*sin(2u), rK*sin(3u))
    const S = (cfg && cfg.knotScale > 0) ? cfg.knotScale : 11.0;
    const RK = S * 0.62, rK = S * 0.34;
    const rt = S * 0.15 * (1.0 + 0.03 * Math.sin(1.2 * elapsed));

    // Slow flow along the knot for readability
    const u = hA * 6.28318 + 0.14 * elapsed * cd;

    // Path point and analytic tangent (local frame: xy in-plane, z along nn)
    const s3 = Math.sin(3.0 * u), c3 = Math.cos(3.0 * u);
    const ringM = RK + rK * c3;
    const c2 = Math.cos(2.0 * u), s2 = Math.sin(2.0 * u);
    const pLX = ringM * c2;
    const pLY = ringM * s2;
    const pLZ = rK * s3;
    const tLX = -3.0 * rK * s3 * c2 - 2.0 * ringM * s2;
    const tLY = -3.0 * rK * s3 * s2 + 2.0 * ringM * c2;
    const tLZ = 3.0 * rK * c3;

    // Place into world frame (ex, ez in-plane, nn up)
    const kx = pLX * exX + pLY * ezX + pLZ * nX;
    const ky = pLX * exY + pLY * ezY + pLZ * nY;
    const kz = pLX * exZ + pLY * ezZ + pLZ * nZ;
    const twX = tLX * exX + tLY * ezX + tLZ * nX;
    const twY = tLX * exY + tLY * ezY + tLZ * nY;
    const twZ = tLX * exZ + tLY * ezZ + tLZ * nZ;
    const tLen = Math.sqrt(twX*twX + twY*twY + twZ*twZ) || 1.0;
    const tX = twX / tLen, tY = twY / tLen, tZ = twZ / tLen;

    const phi = hF * 6.28318 + 0.18 * elapsed * cd;
    // Solid rope cross-section — one wall per strand, reads as a single tube
    const rtI = rt * Math.sqrt(hE);
    const ndotT = nX * tX + nY * tY + nZ * tZ;
    let nX2 = nX - ndotT * tX, nY2 = nY - ndotT * tY, nZ2 = nZ - ndotT * tZ;
    const nLen = Math.sqrt(nX2*nX2 + nY2*nY2 + nZ2*nZ2) || 1.0;
    nX2/=nLen; nY2/=nLen; nZ2/=nLen;
    const bX = tY*nZ2 - tZ*nY2, bY = tZ*nX2 - tX*nZ2, bZ = tX*nY2 - tY*nX2;
    const cPhi = Math.cos(phi), sPhi = Math.sin(phi);
    const kpx = kx + rtI * (cPhi * nX2 + sPhi * bX);
    const kpy = ky + rtI * (cPhi * nY2 + sPhi * bY);
    const kpz = kz + rtI * (cPhi * nZ2 + sPhi * bZ);

    let px, py, pz;

    if (elapsed < t1) {
        // -- Phase 1: Vortex Collapse — home swings around the axis onto the knot --
        let p1 = (elapsed - hB * 0.35) / 2.65;
        p1 = Math.max(0.0, Math.min(1.0, p1));
        const e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);
        // Gentle swirl: small angle keeps ONE visible structure
        const aR = 0.9 * cd * Math.sin(Math.PI * e1);
        const cR = Math.cos(aR), sR = Math.sin(aR);
        const dN = nX * hx + nY * hy + nZ * hz;
        const cx = nY * hz - nZ * hy;
        const cy = nZ * hx - nX * hy;
        const cz = nX * hy - nY * hx;
        const hx2 = hx * cR + cx * sR + nX * dN * (1.0 - cR);
        const hy2 = hy * cR + cy * sR + nY * dN * (1.0 - cR);
        const hz2 = hz * cR + cz * sR + nZ * dN * (1.0 - cR);
        px = hx2 + (kpx - hx2) * e1;
        py = hy2 + (kpy - hy2) * e1;
        pz = hz2 + (kpz - hz2) * e1;
    } else if (elapsed < T123) {
        // -- Phase 2: Knot Flow — streaming along the living knot --
        px = kpx;
        py = kpy;
        pz = kpz;
    } else {
        // -- Phase 3: Reformation — release swirl, spiral rain back home --
        let p4 = (elapsed - T123 - hD * 0.25) / 4.25;
        p4 = Math.max(0.0, Math.min(1.0, p4));
        const e4 = p4 * p4 * p4 * (p4 * (p4 * 6.0 - 15.0) + 10.0);
        const aR = 0.9 * cd * Math.sin(Math.PI * e4);
        const cR = Math.cos(aR), sR = Math.sin(aR);
        const dN = nX * kpx + nY * kpy + nZ * kpz;
        const cx = nY * kpz - nZ * kpy;
        const cy = nZ * kpx - nX * kpz;
        const cz = nX * kpy - nY * kpx;
        const kx2 = kpx * cR + cx * sR + nX * dN * (1.0 - cR);
        const ky2 = kpy * cR + cy * sR + nY * dN * (1.0 - cR);
        const kz2 = kpz * cR + cz * sR + nZ * dN * (1.0 - cR);
        px = kx2 + (hx - kx2) * e4;
        py = ky2 + (hy - ky2) * e4;
        pz = kz2 + (hz - kz2) * e4;
    }

    // Turntable yaw about the world vertical (Y) axis: exactly ONE full
    // revolution during Knot Flow, holding aligned before and after so the
    // message always lands upright. Shows the knot's full 3D structure.
    const yawU = Math.max(0.0, Math.min(1.0, (elapsed - t1) / (T123 - t1)));
    const yawS = yawU * yawU * yawU * (yawU * (yawU * 6.0 - 15.0) + 10.0);
    const yawA = 6.283185307179586 * yawS;
    const cyw = Math.cos(yawA), syw = Math.sin(yawA);
    const yawX = cyw * px + syw * pz;
    const yawZ = -syw * px + cyw * pz;
    px = yawX;
    pz = yawZ;

    if (out) { out.x = px; out.y = py; out.z = pz; return out; }
    return { x: px, y: py, z: pz };
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
    const t1 = 2.0;      // Take-off
    const t2 = 7.0;      // Flight
    const t3 = 3.0;      // Settle
    const t4 = 2.0;      // Landing
    const T12 = t1 + t2;
    const T123 = t1 + t2 + t3;

    // -- Randomized flight plan (defaults reproduce the original sweep) --
    const c = cfg || {};
    const swX = (c.mSweepX != null) ? c.mSweepX : 24.0;
    const swY = (c.mSweepY != null) ? c.mSweepY : 4.0;
    const swZ = (c.mSweepZ != null) ? c.mSweepZ : 12.0;
    const fX = (c.mFreqX != null) ? c.mFreqX : 3.456;
    const fY = (c.mFreqY != null) ? c.mFreqY : 5.341;
    const fZ = (c.mFreqZ != null) ? c.mFreqZ : 2.827;
    const phX = (c.mPhX != null) ? c.mPhX : 0.4;
    const phY = (c.mPhY != null) ? c.mPhY : 0.0;
    const phZ = (c.mPhZ != null) ? c.mPhZ : 1.2;
    const launchDir = (c.mLaunchDir != null) ? c.mLaunchDir : 1.0;

    // -- Randomized event schedule & chaos levels (defaults reproduce the
    //    pre-upgrade behavior: no snap turn, no split, no boil/jink, the two
    //    original predator windows, unit multipliers) --
    const turnT = (c.mTurnT != null) ? c.mTurnT : 99.0;
    const turnDir = (c.mTurnDir != null) ? c.mTurnDir : 1.0;
    const splitT = (c.mSplitT != null) ? c.mSplitT : 99.0;
    const splitAng = (c.mSplitAng != null) ? c.mSplitAng : 0.0;
    const d1T = (c.mDodge1T != null) ? c.mDodge1T : 3.9;
    const d2T = (c.mDodge2T != null) ? c.mDodge2T : 7.1;
    const d3T = (c.mDodge3T != null) ? c.mDodge3T : 99.0;
    const dodgeRad = (c.mDodgeRad != null) ? c.mDodgeRad : 8.0;
    const dodgeStr = (c.mDodgeStr != null) ? c.mDodgeStr : 1.0;
    const boilAmp = (c.mBoilAmp != null) ? c.mBoilAmp : 0.0;
    const boilFreq = (c.mBoilFreq != null) ? c.mBoilFreq : 14.0;
    const churnMult = (c.mChurnMult != null) ? c.mChurnMult : 1.0;
    const flutterMult = (c.mFlutterMult != null) ? c.mFlutterMult : 1.0;
    const jinkAmp = (c.mJinkAmp != null) ? c.mJinkAmp : 0.0;
    const jinkFreq = (c.mJinkFreq != null) ? c.mJinkFreq : 5.5;
    const jinkPh = (c.mJinkPh != null) ? c.mJinkPh : 0.0;
    const breathAmp = (c.mBreathAmp != null) ? c.mBreathAmp : 1.0;
    const scoutAmp = (c.mScoutAmp != null) ? c.mScoutAmp : 0.0;

    // Flight-end blob radius: breathing depth is randomized per blast, so the
    // frozen t=9s value must scale with it to keep settle/landing seamless.
    const rFlightEnd = 11.0 + breathAmp * (3.4 * Math.sin(0.85 * 9.0 + 0.7) + 1.7 * Math.sin(1.65 * 9.0));

    // Flight-end constants (analytic at u = 1) keep settle/landing seamless for
    // any randomized plan. Cy's second lobe term vanishes at u = 1 (sin(pi)=0).
    const endCx = swX * Math.sin(fX + phX);
    const endCy = swY * Math.sin(fY + phY);
    const endCz = swZ * Math.sin(fZ + phZ);
    const setCx = endCx * 0.25;
    const setCy = endCy * 0.25 + 1.5;
    const setCz = endCz * 0.25;
    const kvx = swX * fX / 7.0, kvy = swY * fY / 7.0, kvz = swZ * fZ / 7.0;
    const evx = kvx * Math.cos(fX + phX);
    const evy = kvy * Math.cos(fY + phY) - 1.346;   // + 3*pi/7 * cos(pi) term
    const evz = kvz * Math.cos(fZ + phZ);
    const evlen = Math.sqrt(evx * evx + evy * evy + evz * evz) || 1.0;
    const evxN = evx / evlen, evyN = evy / evlen, evzN = evz / evlen;
    const ea = 0.60 * Math.min(1.0, evlen / 10.0);

    // Deterministic per-particle hashes in [0,1)
    const p1h = ((i * 37.119) % 100.0) / 100.0;
    const p2h = ((i * 61.19) % 100.0) / 100.0;
    const p3h = ((i * 83.11) % 100.0) / 100.0;
    const p4h = ((i * 53.17) % 100.0) / 100.0;
    const p6h = ((i * 97.31) % 100.0) / 100.0;   // darting-scout selector
    const ph1 = p1h * 6.28318;
    const ph2 = p2h * 6.28318;
    const ph3 = p3h * 6.28318;

    // Launch ripple: particles lift off in a sweep across the message
    const delay = (launchDir > 0.0 ? hx + 50.0 : 50.0 - hx) * 0.017 + p2h * 0.55;
    const lt = elapsed - delay;
    if (lt <= 0.0) {
        if (out) { out.x = hx; out.y = hy; out.z = hz; return out; }
        return { x: hx, y: hy, z: hz };
    }
    let lbRaw = Math.min(1.0, lt / 0.9);
    const lb = lbRaw * lbRaw * (3.0 - 2.0 * lbRaw);
    const hop = Math.sin(lbRaw * Math.PI) * 2.2;

    const te = elapsed * cd;

    // Snap-turn pulse: sharp linear rise/fall window centered on turnT
    const tRise = Math.max(0.0, Math.min(1.0, (elapsed - (turnT - 0.45)) / 0.45));
    const tFall = Math.max(0.0, Math.min(1.0, (elapsed - turnT) / 0.45));
    const turnPulse = tRise * (1.0 - tFall);

    // Split-and-merge envelope: 1.2s full-separation plateau around splitT
    const sRise = Math.max(0.0, Math.min(1.0, (elapsed - (splitT - 1.0)) / 0.4));
    const sFall = Math.max(0.0, Math.min(1.0, (elapsed - (splitT + 0.6)) / 0.4));
    const splitEnv = sRise * (1.0 - sFall);

    // -- Shared flock center path (continuous across flight/settle/landing) --
    // Also derives the analytic flock velocity, used to stream the blob along
    // its direction of travel like a real starling cloud.
    let Cx, Cy, Cz, churn, blobR, vX, vY, vZ, strA;
    if (elapsed < T12) {
        const u = Math.max(0.0, (elapsed - t1) / t2);
        Cx = swX * Math.sin(u * fX + phX);
        Cy = swY * Math.sin(u * fY + phY) + 3.0 * Math.sin(u * Math.PI);
        Cz = swZ * Math.sin(u * fZ + phZ);
        // Whip jinks: higher-frequency lobes on the flight path. The sin(pi*u)
        // envelope zeroes them exactly at take-off and flight-end so the
        // settle/landing end-constants stay valid.
        const jk = jinkAmp * Math.sin(Math.PI * u);
        Cx += jk * Math.sin(u * jinkFreq + jinkPh);
        Cy += jk * 0.6 * Math.sin(u * jinkFreq * 0.83 + jinkPh + 1.7);
        Cz += jk * Math.cos(u * jinkFreq * 0.91 + jinkPh + 3.1);
        churn = 1.0;
        // Breathing flock volume: two superposed pulses swell and contract the
        // whole cloud organically through the flight window.
        blobR = 11.0 + breathAmp * (3.4 * Math.sin(0.85 * elapsed + 0.7) + 1.7 * Math.sin(1.65 * elapsed));
        const dvx = kvx * Math.cos(u * fX + phX);
        const dvy = kvy * Math.cos(u * fY + phY) + 1.346 * Math.cos(u * Math.PI);
        const dvz = kvz * Math.cos(u * fZ + phZ);
        const vlen = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz) || 1.0;
        vX = dvx / vlen; vY = dvy / vlen; vZ = dvz / vlen;
        strA = 0.60 * Math.min(1.0, vlen / 10.0);
        strA *= 1.0 + 0.55 * turnPulse;   // shear harder through snap turns
    } else if (elapsed < T123) {
        const s0 = (elapsed - T12) / t3;
        const s = s0 * s0 * (3.0 - 2.0 * s0);
        Cx = endCx * (1.0 - 0.75 * s);
        Cy = endCy * (1.0 - 0.75 * s) + 1.5 * s;
        Cz = endCz * (1.0 - 0.75 * s);
        churn = 1.0 - 0.7 * s;
        blobR = rFlightEnd * (1.0 - 0.55 * s);   // flock condenses to land
        vX = evxN; vY = evyN; vZ = evzN;
        strA = ea * (1.0 - 0.75 * s);
    } else {
        const tau4 = elapsed - T123;
        churn = 0.3 * (1.0 - Math.min(1.0, tau4 / t4));
        // Continue seamlessly from the settle-end center, relaxing into a tiny
        // per-particle hover orbit as the landing progresses.
        let sq = tau4 / 1.5; sq = Math.min(1.0, sq); sq = sq * sq * (3.0 - 2.0 * sq);
        const hx0 = 1.6 * Math.sin(te * 1.05 + ph1);
        const hy0 = 1.0 + Math.sin(te * 0.83 + ph2);
        const hz0 = 1.2 * Math.cos(te * 0.95 + ph3);
        Cx = setCx + (hx0 - setCx) * sq;
        Cy = setCy + (hy0 - setCy) * sq;
        Cz = setCz + (hz0 - setCz) * sq;
        blobR = rFlightEnd * 0.45;
        vX = evxN; vY = evyN; vZ = evzN;
        strA = ea * 0.25 * (1.0 - Math.min(1.0, tau4 / t4));
    }

    // -- Flock slot: fixed point inside the blob volume --
    // Exponent 0.5 gives volume density falling off from the core (r^-1):
    // dense center, soft rim. (Exponents < 1/3 are shell-weighted and read as
    // a ring — avoid.) The cloud is flattened like a real starling flock.
    const slotTh = ph1;
    const cosPhi = 2.0 * p2h - 1.0;
    const sinPhi = Math.sqrt(Math.max(0.0, 1.0 - cosPhi * cosPhi));
    const slotMag = Math.sqrt(p3h);

    // -- Directional lobes: low-frequency radial modulation of the volume --
    // The cloud constantly bulges and folds asymmetrically (several lobes
    // around the azimuth plus top/bottom asymmetry), so no sphere silhouette
    // can ever be read — this is the anti-"ball" term.
    const lobe = 1.0
        + 0.30 * Math.sin(2.2 * slotTh + 1.8 * cosPhi + 0.45 * te)
        + 0.16 * Math.cos(3.3 * slotTh - 2.4 * cosPhi + 0.62 * te);

    let sx = slotMag * sinPhi * Math.cos(slotTh) * blobR * lobe;
    let sy = slotMag * cosPhi * 0.72 * blobR * lobe;
    let sz = slotMag * sinPhi * Math.sin(slotTh) * blobR * lobe;

    // -- Sub-swarms: six overlapping clumps that wander semi-independently --
    // This is what breaks the silhouette into lumpy, merging sub-clouds.
    const p5h = ((i * 71.53) % 100.0) / 100.0;
    const swId = Math.floor(p5h * 6.0);
    const swScale = blobR / 11.0;
    const swAmp = (4.5 + 3.0 * p1h) * swScale;
    const ox = swAmp * Math.sin(0.71 * swId + 0.50 * te + p5h * 6.28);
    const oy = swAmp * 0.7 * Math.sin(1.13 * swId + 0.38 * te + p2h * 6.28);
    const oz = swAmp * 0.8 * Math.cos(0.87 * swId + 0.45 * te + p3h * 6.28);

    // -- Velocity-aligned streaming --
    // Stretch the blob along its direction of travel and pull the back edge and
    // outer shell into trailing streamers, so the flock shears as it turns.
    const cx0 = sx, cy0 = sy, cz0 = sz;   // pre-transform slot, churn input
    const along = sx * vX + sy * vY + sz * vZ;
    const pxp = sx - vX * along, pyp = sy - vY * along, pzp = sz - vZ * along;
    const back = Math.max(0.0, -along);
    const shell = Math.max(0.0, slotMag - 0.9) / 0.1;
    const trail = (back * 1.7 + shell * 2.6) * strA * (0.55 + 0.45 * p4h) * swScale;
    const stretch = 1.0 + strA;
    sx = pxp * 0.80 + vX * (along * stretch - trail);
    sy = pyp * 0.80 + vY * (along * stretch - trail);
    sz = pzp * 0.80 + vZ * (along * stretch - trail);

    // -- Churn field: coherent swirl keyed on slot position --
    let Fx = churnMult * 5.6 * Math.sin(0.40 * cy0 + 1.25 * te + ph1);
    let Fy = churnMult * 4.4 * Math.sin(0.48 * cx0 - 1.05 * te + ph2);
    let Fz = churnMult * 4.8 * Math.cos(0.36 * cx0 + 0.30 * cy0 + 0.90 * te + ph3);

    // Wingbeat flutter
    const wf = 8.5 + 4.0 * p4h;
    const fl = Math.sin(wf * te + ph1);
    Fx += flutterMult * 0.5 * fl;
    Fy += flutterMult * 1.3 * fl;
    Fz += flutterMult * 0.4 * Math.sin(wf * 0.87 * te + ph2);

    // Boil turbulence: incommensurate high-frequency layer keyed on the slot,
    // giving individual birds chaotic interior jitter (the "living" look).
    Fx += boilAmp * Math.sin(boilFreq * te + 1.9 * cy0 + ph2);
    Fy += boilAmp * 0.8 * Math.sin(boilFreq * 0.87 * te - 1.6 * cx0 + ph3);
    Fz += boilAmp * Math.cos(boilFreq * 0.71 * te + 1.3 * (cx0 + cy0) + ph1);

    Fx *= churn; Fy *= churn; Fz *= churn;

    let Px = Cx + ox + sx + Fx;
    let Py = Cy + oy + sy + Fy;
    let Pz = Cz + oz + sz + Fz;

    // -- Snap-turn bank impulse: whip the whole flock sideways mid-flight --
    if (turnPulse > 0.0) {
        const bkX = vY, bkY = -vX;
        const bkN = Math.sqrt(bkX * bkX + bkY * bkY + 2.5e-3);
        const bankMag = turnDir * 8.0 * turnPulse;
        Px += (bkX / bkN) * bankMag;
        Py += (bkY / bkN) * bankMag;
    }

    // -- Split & merge: tear the six sub-swarms into two lobes along a random
    //    horizontal axis, fly them apart, then pour them back together --
    if (splitEnv > 0.0) {
        const sideSign = (swId < 3.0) ? 1.0 : -1.0;
        const sepMag = sideSign * 7.5 * splitEnv * swScale;
        Px += Math.cos(splitAng) * sepMag;
        Pz += Math.sin(splitAng) * sepMag;
    }

    // -- Darting scouts: rare individuals streak out of the blob and snap back --
    if (p6h > 0.93 && churn > 0.01 && scoutAmp > 0.0) {
        const dartRate = (1.55 + 1.3 * p1h) * Math.PI;
        let dw = Math.sin(te * dartRate + p6h * 40.0 + ph2);
        if (dw > 0.0) {
            dw *= dw; dw *= dw; dw *= dw;   // sin^8: brief hard bursts
            const slotLen = Math.sqrt(cx0 * cx0 + cy0 * cy0 + cz0 * cz0) || 1.0;
            const dartMag = scoutAmp * (4.0 + 2.5 * p3h) * dw * churn;
            Px += (cx0 / slotLen) * dartMag;
            Py += (cy0 / slotLen) * dartMag;
            Pz += (cz0 / slotLen) * dartMag;
        }
    }

    // -- Predator dodges: up to three sweeping exclusion cavities shape-shift
    //    the flock at per-blast randomized times with a random strike radius
    //    and parting force --
    if (elapsed > 2.0 && elapsed < 9.0) {
        // Window envelope per attack: linear rise/fall ramps around its center
        let wA = Math.max(0.0, Math.min(1.0, (elapsed - (d1T - 1.1)) / 0.4));
        wA *= 1.0 - Math.max(0.0, Math.min(1.0, (elapsed - (d1T + 1.1)) / 0.4));
        let wB = Math.max(0.0, Math.min(1.0, (elapsed - (d2T - 1.1)) / 0.4));
        wB *= 1.0 - Math.max(0.0, Math.min(1.0, (elapsed - (d2T + 1.1)) / 0.4));
        let wC = Math.max(0.0, Math.min(1.0, (elapsed - (d3T - 1.1)) / 0.4));
        wC *= 1.0 - Math.max(0.0, Math.min(1.0, (elapsed - (d3T + 1.1)) / 0.4));
        const wEnv = Math.max(wA, Math.max(wB, wC));
        const dodgeIdx = (wC >= wA && wC >= wB) ? 2.0 : ((wB >= wA) ? 1.0 : 0.0);
        if (wEnv > 0.001) {
            // The predator rides the flock's own flight path with a lateral
            // weave (phase-offset per attack), so the dodge is guaranteed to
            // cut through the blob.
            const qt = Math.min(8.9, elapsed * 0.92 + 1.1);
            const qU = Math.max(0.0, (qt - 2.0) / 7.0);
            const wo = dodgeIdx * 2.094;
            const qx = swX * Math.sin(qU * fX + phX) + 5.0 * Math.sin(1.7 * elapsed + 1.0 + wo);
            const qy = swY * Math.sin(qU * fY + phY) + 3.0 * Math.sin(qU * Math.PI) + 2.0 * Math.sin(1.3 * elapsed + wo);
            const qz = swZ * Math.sin(qU * fZ + phZ) + 4.0 * Math.sin(1.6 * elapsed + 2.0 + wo);
            const dx = Px - qx, dy = Py - qy;
            const d = Math.sqrt(dx * dx + dy * dy + (Pz - qz) * (Pz - qz));
            // Part the flock around the predator: slide particles sideways
            // relative to the flow direction instead of pushing them radially.
            // A radial push compresses displaced particles into a visible rim
            // ring; tangential parting preserves radial density and reads as
            // the flock cleaving around a falcon. Magnitude fades to zero at
            // the cavity rim and on the parting mid-plane, so nothing snaps.
            const rad = dodgeRad;
            if (d < rad) {
                const x = d / rad;
                let rise = x / 0.5; rise = Math.min(1.0, rise); rise = rise * rise * (3.0 - 2.0 * rise);
                let fall = (x - 0.6) / 0.4; fall = Math.max(0.0, Math.min(1.0, fall)); fall = fall * fall * (3.0 - 2.0 * fall);
                // In-plane perpendicular to the flock's travel direction,
                // smoothly attenuated so near-vertical turnarounds fade the
                // parting out instead of switching it off abruptly.
                let pvx = vY, pvy = -vX;
                const pn = Math.sqrt(pvx * pvx + pvy * pvy + 0.0025);
                pvx /= pn; pvy /= pn;
                const sideDist = dx * pvx + dy * pvy;
                const part = (sideDist / rad) * (rise * (1.0 - fall)) * 7.0 * dodgeStr * wEnv * (0.75 + 0.5 * p4h);
                Px += pvx * part;
                Py += pvy * part;
            }
        }
    }

    // -- Assemble: landing blend, then take-off blend from home --
    let rx = Px;
    let ry = Py + hop;
    let rz = Pz;

    if (elapsed >= T123) {
        const tau4 = elapsed - T123;
        const st = p2h * 0.5;
        let q = (tau4 - st) / (t4 - st);
        q = Math.max(0.0, Math.min(1.0, q));
        const e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        rx = Px + (hx - Px) * e4;
        ry = (Py + hop) + (hy - Py - hop) * e4;
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
