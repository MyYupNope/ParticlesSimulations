// ─────────────────────────────────────────────
// Web Audio Procedural Sound Synthesizer
// ─────────────────────────────────────────────

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
        // ── 4-Layer Ocean Beach Wave Synthesizer (~7.5s) ──
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

        // ── 1. Deep Ocean Mass & Gathering Swell (Sub-bass + Low-frequency Water Body) ──
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

        // ── 2. Breaking Surf & Rolling Whitewater (Dynamic Sweeping Low-pass Noise) ──
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

        // ── 3. Shoreline Foam Fizz & Sea Spray on Sand (Crisp High-pass/Bandpass Shimmer) ──
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

        // ── 4. Receding Undertow Backwash (Gentle Filtering Water Drain) ──
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

    // ── Multi-Layer Explosion Synthesizer (EXPLODE & Default) ──
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


