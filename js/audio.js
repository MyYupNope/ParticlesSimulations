// ---------------------------------------------
// Web Audio Procedural Sound Synthesizer
// ---------------------------------------------

let audioCtx = null;
let noiseBuffer = null;

function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function createNoiseBuffer(ctx) {
    if (noiseBuffer) return noiseBuffer;
    const len = ctx.sampleRate * 2.0;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noiseBuffer = buf;
    return buf;
}

export function playExplosionSound(stateParam, estimatedRecovery) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const s = (typeof stateParam === 'object' && stateParam !== null)
        ? stateParam
        : { soundDuration: stateParam || estimatedRecovery };

    const motionStyle = (s.motionStyle != null)
        ? s.motionStyle
        : (typeof state !== 'undefined' && state && state.motionStyle != null ? state.motionStyle : 0);

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.40, now + 0.02);
    master.connect(ctx.destination);

    const dur = s.soundDuration || estimatedRecovery || 1.5;
    const pitch = s.soundPitch || 140;
    const type = s.soundType || 'sine';

    if (motionStyle === 1) {
        // 4-Phase 15s atmospheric cyclone vortex audio howl (sweeping dual bandpass noise filters)
        const totalTornadoDur = 15.0;
        const wind = ctx.createBufferSource();
        wind.buffer = createNoiseBuffer(ctx);
        wind.loop = true;
        const windFilt = ctx.createBiquadFilter();
        windFilt.type = 'bandpass';
        windFilt.frequency.setValueAtTime(60, now);
        windFilt.frequency.linearRampToValueAtTime(180, now + 3.5);  // Phase 1 Ground rumble
        windFilt.frequency.exponentialRampToValueAtTime(580, now + 6.0); // Phase 2 Mid-ascent scream
        windFilt.frequency.linearRampToValueAtTime(320, now + 8.0);  // Phase 2 Funnel crest
        windFilt.frequency.linearRampToValueAtTime(220, now + 11.5); // Phase 3 Canopy roar
        windFilt.frequency.exponentialRampToValueAtTime(45, now + totalTornadoDur); // Phase 4 Dissipation
        windFilt.Q.value = 2.8;

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.0001, now);
        windGain.gain.exponentialRampToValueAtTime(0.18, now + 3.0);
        windGain.gain.linearRampToValueAtTime(0.38, now + 6.0);
        windGain.gain.linearRampToValueAtTime(0.24, now + 11.5);
        windGain.gain.exponentialRampToValueAtTime(0.0001, now + totalTornadoDur);

        wind.connect(windFilt);
        windFilt.connect(windGain);
        windGain.connect(master);
        wind.start(now);
        wind.stop(now + totalTornadoDur + 0.1);
        setTimeout(() => {
            try {
                wind.disconnect();
                windFilt.disconnect();
                windGain.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalTornadoDur + 0.2) * 1000);
        return;
    }

    if (motionStyle === 2) {
        // 4-Phase atmospheric breeze audio: Floor Thud -> 2s Rest -> Wind Gust Lift -> Reverse Wind Settle -> Elevation Shimmer
        const totalBreezeDur = 11.8;
        const wind = ctx.createBufferSource();
        wind.buffer = createNoiseBuffer(ctx);
        wind.loop = true;
        const windFilt = ctx.createBiquadFilter();
        windFilt.type = 'bandpass';
        windFilt.frequency.setValueAtTime(90, now);
        windFilt.frequency.linearRampToValueAtTime(130, now + 1.0);      // Phase 1: Floor impact & recoil
        windFilt.frequency.linearRampToValueAtTime(75, now + 3.0);       // Ground Pause: Quiet floor rest
        windFilt.frequency.exponentialRampToValueAtTime(620, now + 6.6); // Phase 2: Peak forward wind lift
        windFilt.frequency.exponentialRampToValueAtTime(100, now + 10.2);// Phase 3: Reverse wind subsiding to floor
        windFilt.frequency.exponentialRampToValueAtTime(50, now + totalBreezeDur);
        windFilt.Q.value = 1.2;

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.0001, now);
        windGain.gain.exponentialRampToValueAtTime(0.14, now + 1.0);
        windGain.gain.exponentialRampToValueAtTime(0.01, now + 3.0);     // Quiet ground pause
        windGain.gain.linearRampToValueAtTime(0.32, now + 6.6);          // Wind surge at peak
        windGain.gain.linearRampToValueAtTime(0.05, now + 10.2);         // Reverse landing
        windGain.gain.exponentialRampToValueAtTime(0.0001, now + totalBreezeDur);

        wind.connect(windFilt);
        windFilt.connect(windGain);
        windGain.connect(master);
        wind.start(now);
        wind.stop(now + totalBreezeDur + 0.1);
        setTimeout(() => {
            try {
                wind.disconnect();
                windFilt.disconnect();
                windGain.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalBreezeDur + 0.2) * 1000);
        return;
    }

    if (motionStyle === 3) {
        // -- 4-Layer Ocean Beach Wave Synthesizer (~7.5s) --
        // Simulates: Deep Ocean Swell -> Cresting Wave Crash -> Shoreline Foam Fizz on Sand -> Receding Backwash
        const totalKineticDur = 7.5;

        // Stereo Panner (Left -> Center -> Right across the shoreline)
        const panner = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
        if (panner) {
            panner.pan.setValueAtTime(-0.75, now);
            panner.pan.linearRampToValueAtTime(0.75, now + totalKineticDur);
            panner.connect(master);
        }
        const targetOutput = panner || master;

        // -- 1. Deep Ocean Mass & Gathering Swell (Sub-bass + Low-frequency Water Body) --
        const subSwell = ctx.createOscillator();
        subSwell.type = 'sine';
        subSwell.frequency.setValueAtTime(32, now);
        subSwell.frequency.linearRampToValueAtTime(48, now + 2.5);          // Swell lifting
        subSwell.frequency.linearRampToValueAtTime(58, now + 4.2);          // Wave crest mass
        subSwell.frequency.linearRampToValueAtTime(36, now + 5.8);          // Spreading onto shore
        subSwell.frequency.exponentialRampToValueAtTime(20, now + totalKineticDur);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.exponentialRampToValueAtTime(0.24, now + 2.0);
        subGain.gain.linearRampToValueAtTime(0.48, now + 4.2);              // Peak wave power
        subGain.gain.linearRampToValueAtTime(0.18, now + 5.8);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        subSwell.connect(subGain);
        subGain.connect(targetOutput);
        subSwell.start(now);
        subSwell.stop(now + totalKineticDur + 0.1);

        // -- 2. Breaking Surf & Rolling Whitewater (Dynamic Sweeping Low-pass Noise) --
        const surfNoise = ctx.createBufferSource();
        surfNoise.buffer = createNoiseBuffer(ctx);
        surfNoise.loop = true;

        const surfFilter = ctx.createBiquadFilter();
        surfFilter.type = 'lowpass';
        surfFilter.frequency.setValueAtTime(140, now);
        surfFilter.frequency.exponentialRampToValueAtTime(420, now + 2.2);   // Rising swell rush
        surfFilter.frequency.exponentialRampToValueAtTime(1250, now + 4.2);  // Breaking surf roar
        surfFilter.frequency.linearRampToValueAtTime(550, now + 5.6);        // Spreading wash
        surfFilter.frequency.exponentialRampToValueAtTime(75, now + totalKineticDur); // Backwash hum
        surfFilter.Q.value = 1.1;

        const surfGain = ctx.createGain();
        surfGain.gain.setValueAtTime(0.0001, now);
        surfGain.gain.exponentialRampToValueAtTime(0.18, now + 1.8);
        surfGain.gain.linearRampToValueAtTime(0.52, now + 4.2);              // Peak crest break
        surfGain.gain.linearRampToValueAtTime(0.22, now + 5.6);
        surfGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        surfNoise.connect(surfFilter);
        surfFilter.connect(surfGain);
        surfGain.connect(targetOutput);
        surfNoise.start(now);
        surfNoise.stop(now + totalKineticDur + 0.1);

        // -- 3. Shoreline Foam Fizz & Sea Spray on Sand (Crisp High-pass/Bandpass Shimmer) --
        const foamNoise = ctx.createBufferSource();
        foamNoise.buffer = createNoiseBuffer(ctx);
        foamNoise.loop = true;

        const foamFilter = ctx.createBiquadFilter();
        foamFilter.type = 'bandpass';
        foamFilter.frequency.setValueAtTime(1400, now);
        foamFilter.frequency.exponentialRampToValueAtTime(2400, now + 3.8);  // Whitecap foam forming
        foamFilter.frequency.exponentialRampToValueAtTime(3200, now + 4.6);  // Sizzling sea foam on sand
        foamFilter.frequency.linearRampToValueAtTime(1800, now + 6.0);       // Bubbles popping
        foamFilter.frequency.exponentialRampToValueAtTime(600, now + totalKineticDur);
        foamFilter.Q.value = 1.4;

        const foamGain = ctx.createGain();
        foamGain.gain.setValueAtTime(0.0001, now);
        foamGain.gain.exponentialRampToValueAtTime(0.04, now + 2.5);
        foamGain.gain.linearRampToValueAtTime(0.38, now + 4.4);              // Crisp foam crash & sizzle
        foamGain.gain.linearRampToValueAtTime(0.26, now + 5.4);              // Sizzling wash
        foamGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        foamNoise.connect(foamFilter);
        foamFilter.connect(foamGain);
        foamGain.connect(targetOutput);
        foamNoise.start(now);
        foamNoise.stop(now + totalKineticDur + 0.1);

        // -- 4. Receding Undertow Backwash (Gentle Filtering Water Drain) --
        const backwashNoise = ctx.createBufferSource();
        backwashNoise.buffer = createNoiseBuffer(ctx);
        backwashNoise.loop = true;

        const backwashFilter = ctx.createBiquadFilter();
        backwashFilter.type = 'bandpass';
        backwashFilter.frequency.setValueAtTime(700, now + 4.5);
        backwashFilter.frequency.exponentialRampToValueAtTime(280, now + 6.2);
        backwashFilter.frequency.exponentialRampToValueAtTime(90, now + totalKineticDur);
        backwashFilter.Q.value = 1.8;

        const backwashGain = ctx.createGain();
        backwashGain.gain.setValueAtTime(0.0001, now);
        backwashGain.gain.setValueAtTime(0.0001, now + 4.5);
        backwashGain.gain.linearRampToValueAtTime(0.18, now + 5.5);          // Undertow rush
        backwashGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        backwashNoise.connect(backwashFilter);
        backwashFilter.connect(backwashGain);
        backwashGain.connect(targetOutput);
        backwashNoise.start(now + 4.5);
        backwashNoise.stop(now + totalKineticDur + 0.1);

        setTimeout(() => {
            try {
                subSwell.disconnect();
                subGain.disconnect();
                surfNoise.disconnect();
                surfFilter.disconnect();
                surfGain.disconnect();
                foamNoise.disconnect();
                foamFilter.disconnect();
                foamGain.disconnect();
                backwashNoise.disconnect();
                backwashFilter.disconnect();
                backwashGain.disconnect();
                if (panner) panner.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalKineticDur + 0.2) * 1000);
        return;
    }

    if (motionStyle === 4) {
        // -- Torus Knot Synthesizer (~16s) --
        // Suck-in Riser -> Knot Lock Thump -> Flowing Energy Hum -> Release Shimmer
        const totalSingDur = 16.0;

        // 1. Gravitational sub-bass drone (the black hole's mass)
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(28, now);
        drone.frequency.linearRampToValueAtTime(52, now + 3.0);      // Infall deepens the tone
        drone.frequency.setValueAtTime(52, now + 11.5);
        drone.frequency.exponentialRampToValueAtTime(24, now + totalSingDur);

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.0001, now);
        droneGain.gain.exponentialRampToValueAtTime(0.30, now + 2.6); // Peak as the knot locks
        droneGain.gain.linearRampToValueAtTime(0.22, now + 11.5);
        droneGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        drone.connect(droneGain);
        droneGain.connect(master);
        drone.start(now);
        drone.stop(now + totalSingDur + 0.1);

        // 2. Vortex suck-in: sweeping bandpass noise through the collapse
        const suck = ctx.createBufferSource();
        suck.buffer = createNoiseBuffer(ctx);
        suck.loop = true;

        const suckFilt = ctx.createBiquadFilter();
        suckFilt.type = 'bandpass';
        suckFilt.frequency.setValueAtTime(70, now);
        suckFilt.frequency.exponentialRampToValueAtTime(760, now + 3.0); // Spiral-in rush
        suckFilt.frequency.exponentialRampToValueAtTime(120, now + 3.8); // Settles into the knot
        suckFilt.Q.value = 1.8;

        const suckGain = ctx.createGain();
        suckGain.gain.setValueAtTime(0.0001, now);
        suckGain.gain.exponentialRampToValueAtTime(0.26, now + 2.9);
        suckGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

        suck.connect(suckFilt);
        suckFilt.connect(suckGain);
        suckGain.connect(master);
        suck.start(now);
        suck.stop(now + 4.1);

        // 3. Knot lock thump (+3s): the moment the trefoil snaps into place
        const lockT = now + 3.0;
        const thump = ctx.createOscillator();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(95, lockT);
        thump.frequency.exponentialRampToValueAtTime(36, lockT + 0.45);

        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(0.0001, lockT);
        thumpGain.gain.exponentialRampToValueAtTime(0.28, lockT + 0.03);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, lockT + 0.55);

        thump.connect(thumpGain);
        thumpGain.connect(master);
        thump.start(lockT);
        thump.stop(lockT + 0.6);

        // 4. Flowing energy hum (3s -> 11.5s): LFO-breathing bandpassed noise
        const flow = ctx.createBufferSource();
        flow.buffer = createNoiseBuffer(ctx);
        flow.loop = true;

        const flowFilt = ctx.createBiquadFilter();
        flowFilt.type = 'bandpass';
        flowFilt.frequency.setValueAtTime(430, now + 3.0);
        flowFilt.frequency.linearRampToValueAtTime(560, now + 11.5);
        flowFilt.Q.value = 2.2;

        const flowGain = ctx.createGain();
        flowGain.gain.setValueAtTime(0.0001, now + 3.0);
        flowGain.gain.linearRampToValueAtTime(0.15, now + 4.2);
        flowGain.gain.linearRampToValueAtTime(0.12, now + 10.5);
        flowGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        const pulseLfo = ctx.createOscillator();
        pulseLfo.type = 'sine';
        pulseLfo.frequency.value = 0.9;                               // Slow energy pulse
        const pulseDepth = ctx.createGain();
        pulseDepth.gain.setValueAtTime(0.055, now + 3.0);
        pulseDepth.gain.linearRampToValueAtTime(0.0, now + 11.5);
        pulseLfo.connect(pulseDepth);
        pulseDepth.connect(flowGain.gain);

        flow.connect(flowFilt);
        flowFilt.connect(flowGain);
        flowGain.connect(master);
        flow.start(now + 3.0);
        flow.stop(now + totalSingDur + 0.1);
        pulseLfo.start(now + 3.0);
        pulseLfo.stop(now + totalSingDur + 0.1);

        // 5. Reformation shimmer (11.5s -> end): glassy descending gliss
        const shim = ctx.createOscillator();
        shim.type = 'triangle';
        shim.frequency.setValueAtTime(1350, now + 11.5);
        shim.frequency.exponentialRampToValueAtTime(310, now + totalSingDur);

        const shimGain = ctx.createGain();
        shimGain.gain.setValueAtTime(0.0001, now + 11.5);
        shimGain.gain.exponentialRampToValueAtTime(0.07, now + 11.9);
        shimGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        shim.connect(shimGain);
        shimGain.connect(master);
        shim.start(now + 11.5);
        shim.stop(now + totalSingDur + 0.1);

        setTimeout(() => {
            try {
                drone.disconnect();
                droneGain.disconnect();
                suck.disconnect();
                suckFilt.disconnect();
                suckGain.disconnect();
                thump.disconnect();
                thumpGain.disconnect();
                flow.disconnect();
                flowFilt.disconnect();
                flowGain.disconnect();
                pulseLfo.disconnect();
                pulseDepth.disconnect();
                shim.disconnect();
                shimGain.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalSingDur + 0.2) * 1000);
        return;
    }

    if (motionStyle === 5) {
        // -- Starling Flock Synthesizer (~14s) --
        // Airframe Whoosh -> LFO Wingbeat Flutter -> Takeoff Chirps -> Settling Tail
        const totalMurDur = 14.0;

        // 1. Airframe body: low-pass noise following the flock's energy envelope
        const air = ctx.createBufferSource();
        air.buffer = createNoiseBuffer(ctx);
        air.loop = true;

        const airFilt = ctx.createBiquadFilter();
        airFilt.type = 'lowpass';
        airFilt.frequency.setValueAtTime(220, now);
        airFilt.frequency.linearRampToValueAtTime(920, now + 3.2);   // Flight climb
        airFilt.frequency.linearRampToValueAtTime(680, now + 9.0);   // Cruising flock
        airFilt.frequency.linearRampToValueAtTime(180, now + 12.0);  // Settling descent
        airFilt.frequency.exponentialRampToValueAtTime(90, now + totalMurDur);

        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.0001, now);
        airGain.gain.exponentialRampToValueAtTime(0.20, now + 3.0);
        airGain.gain.linearRampToValueAtTime(0.16, now + 9.0);
        airGain.gain.exponentialRampToValueAtTime(0.0001, now + totalMurDur);

        air.connect(airFilt);
        airFilt.connect(airGain);
        airGain.connect(master);
        air.start(now);
        air.stop(now + totalMurDur + 0.1);

        // 2. Wingbeats: bandpassed noise amplitude-modulated by a ~10Hz LFO
        const wings = ctx.createBufferSource();
        wings.buffer = createNoiseBuffer(ctx);
        wings.loop = true;

        const wingsFilt = ctx.createBiquadFilter();
        wingsFilt.type = 'bandpass';
        wingsFilt.frequency.value = 760;
        wingsFilt.Q.value = 1.1;

        const wingsGain = ctx.createGain();
        wingsGain.gain.setValueAtTime(0.0001, now);
        wingsGain.gain.linearRampToValueAtTime(0.10, now + 3.0);
        wingsGain.gain.linearRampToValueAtTime(0.08, now + 9.0);
        wingsGain.gain.linearRampToValueAtTime(0.0001, now + 12.5);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(8.0, now);
        lfo.frequency.linearRampToValueAtTime(12.5, now + 9.0);      // Excited flight flutter
        lfo.frequency.linearRampToValueAtTime(7.0, now + totalMurDur);

        const lfoDepth = ctx.createGain();
        lfoDepth.gain.setValueAtTime(0.0, now);
        lfoDepth.gain.linearRampToValueAtTime(0.085, now + 3.0);
        lfoDepth.gain.linearRampToValueAtTime(0.06, now + 9.0);
        lfoDepth.gain.linearRampToValueAtTime(0.0, now + 12.5);

        lfo.connect(lfoDepth);
        lfoDepth.connect(wingsGain.gain);

        wings.connect(wingsFilt);
        wingsFilt.connect(wingsGain);
        wingsGain.connect(master);
        wings.start(now);
        wings.stop(now + totalMurDur + 0.1);
        lfo.start(now);
        lfo.stop(now + totalMurDur + 0.1);

        // 3. Takeoff chirps: three short descending blips as the flock lifts
        for (let k = 0; k < 3; k++) {
            const ct = now + 0.25 + k * 0.24;
            const chirp = ctx.createOscillator();
            chirp.type = 'sine';
            chirp.frequency.setValueAtTime(2350 + k * 190, ct);
            chirp.frequency.exponentialRampToValueAtTime(1750 + k * 140, ct + 0.09);

            const chirpGain = ctx.createGain();
            chirpGain.gain.setValueAtTime(0.0001, ct);
            chirpGain.gain.exponentialRampToValueAtTime(0.09, ct + 0.02);
            chirpGain.gain.exponentialRampToValueAtTime(0.0001, ct + 0.11);

            chirp.connect(chirpGain);
            chirpGain.connect(master);
            chirp.start(ct);
            chirp.stop(ct + 0.12);
        }

        setTimeout(() => {
            try {
                air.disconnect();
                airFilt.disconnect();
                airGain.disconnect();
                wings.disconnect();
                wingsFilt.disconnect();
                wingsGain.disconnect();
                lfo.disconnect();
                lfoDepth.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalMurDur + 0.2) * 1000);
        return;
    }

    // -- Multi-Layer Explosion Synthesizer (EXPLODE & Default) --
    const explosionDur = Math.max(1.8, dur);

    // 1. Initial Shockwave Detonation Crack (Transient Noise Burst)
    const crackNoise = ctx.createBufferSource();
    crackNoise.buffer = createNoiseBuffer(ctx);

    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(1200, now);
    crackFilter.frequency.exponentialRampToValueAtTime(180, now + 0.25);
    crackFilter.Q.value = 1.2;

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.75, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    crackNoise.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(master);
    crackNoise.start(now);
    crackNoise.stop(now + 0.4);

    // 2. Rolling Blast Wave & Expanding Fireball Rumble (Low-Pass Noise)
    const rumbleNoise = ctx.createBufferSource();
    rumbleNoise.buffer = createNoiseBuffer(ctx);
    rumbleNoise.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(450, now);
    rumbleFilter.frequency.exponentialRampToValueAtTime(65, now + explosionDur);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.65, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + explosionDur);

    rumbleNoise.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(master);
    rumbleNoise.start(now);
    rumbleNoise.stop(now + explosionDur + 0.05);

    // 3. Deep Detonation Sub-Bass Impact Boom (Pitch-dropping sub-bass)
    const subOsc = ctx.createOscillator();
    subOsc.type = type || 'sine';
    subOsc.frequency.setValueAtTime(Math.max(pitch, 120), now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + Math.min(1.2, explosionDur));

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.70, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + explosionDur);

    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(now);
    subOsc.stop(now + explosionDur + 0.05);

    setTimeout(() => {
        try {
            crackNoise.disconnect();
            crackFilter.disconnect();
            crackGain.disconnect();
            rumbleNoise.disconnect();
            rumbleFilter.disconnect();
            rumbleGain.disconnect();
            subOsc.disconnect();
            subGain.disconnect();
            master.disconnect();
        } catch (_) {}
    }, (explosionDur + 0.1) * 1000);
}


