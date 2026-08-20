// ─────────────────────────────────────────────
// Physics Math Kernel — Shared Calculation Engine
// ─────────────────────────────────────────────
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
        // ── 1) Generation and Ground Phase (Phase 1: Accretion Revolution) ──
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
        // ── 2) Ascent and Funnel Growth Phase (Phase 2: Vertical Funnel Vortex) ──
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
        // ── 3) Maturity and Dynamic Equilibrium (Phase 3: Centrifugal Expansion) ──
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
        // ── 4) Dissipation Phase (Phase 4: High-Energy Dissipation & Smooth Return) ──
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

    // ── Option 1: 3D Spiral Ribbons & Braided Filaments ──
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

    // ── Option 6: Floating Leaf Flutter & Pendulum Gliding ──
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

    // ── Swirl / Whirlwind Vortex Dynamics (Randomized from 0.0 to 1.4+) ──
    const swirlSign = (((i * 29.17) % 10.0) > 5.0) ? 1.0 : -1.0;
    const swirlAngle = 0.12 * (gX * gx) - 3.8 * curElapsed * swirlSign + (((i * 31.41) % 100.0) / 100.0) * 6.28318;
    const swirlEnvelope = Math.sin(Math.PI * pLocal);
    const swirlRadius = (3.2 + 6.0 * buoyancy) * (swirl || 0.0) * intensity * swirlEnvelope;
    const swirlY = swirlRadius * Math.sin(swirlAngle);
    const swirlZ = swirlRadius * Math.cos(swirlAngle);
    const swirlX = gx * (swirlRadius * 0.35 * Math.cos(swirlAngle * 2.0));

    if (lambda > 0.82) {
        // ── Strata C: Ground Skittering Leaves (Tumbling along floor) ──
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
        // ── Strata A & B: Airborne Braided Ribbon Streams + Floating Leaf Gliding + Swirl Vortex ──
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
        // ── 1) Phase 1: Straight Vertical Fall & Floor Impact ──
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
        // ── 1.5) Ground Pause: 2 full seconds resting flat on visible floor ──
        if (out) { out.x = gX; out.y = gY; out.z = gZ; return out; }
        return { x: gX, y: gY, z: gZ };
    } else if (elapsed < t1 + tPause + t2) {
        // ── 2) Phase 2: Forward Fuzzy Breeze Lift ──
        const tWind = elapsed - (t1 + tPause);
        return computeBreezePlume(tWind, elapsed, lambda, gX, gY, gZ, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i, out);
    } else if (elapsed < t1 + tPause + t2 + t3) {
        // ── 3) Phase 3: Exact Reverse Breeze Flow back to Ground Floor ──
        const p3 = (elapsed - (t1 + tPause + t2)) / t3;
        const smoothP3 = p3 * p3 * (3.0 - 2.0 * p3);
        const tWindRev = t2 * (1.0 - smoothP3);
        return computeBreezePlume(tWindRev, elapsed, lambda, gX, gY, gZ, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i, out);
    } else {
        // ── 4) Phase 4: Reverse Drop (Straight Elevation to Rest) ──
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
