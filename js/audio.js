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
        // Surfer's Hollow Barrel Tube Synthesizer (~7.5s)
        // Option 2: Spatialized Stereo Panning (Left -> Center -> Right across the screen)
        const totalKineticDur = 7.5;

        // Stereo Panner across stage
        const panner = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
        if (panner) {
            panner.pan.setValueAtTime(-0.85, now);
            panner.pan.linearRampToValueAtTime(0.85, now + totalKineticDur);
            panner.connect(master);
        }
        const targetOutput = panner || master;

        // 1. Hollow Barrel Whitewater & Tube Air Rush (Bandpass Filtered Noise)
        const waveNoise = ctx.createBufferSource();
        waveNoise.buffer = createNoiseBuffer(ctx);
        waveNoise.loop = true;

        const waveFilter = ctx.createBiquadFilter();
        waveFilter.type = 'bandpass';
        waveFilter.frequency.setValueAtTime(120, now);
        waveFilter.frequency.exponentialRampToValueAtTime(320, now + 2.2);  // Peeling wall
        waveFilter.frequency.exponentialRampToValueAtTime(680, now + 4.5);  // Hollow barrel peak
        waveFilter.frequency.linearRampToValueAtTime(220, now + 6.0);       // Closeout
        waveFilter.frequency.exponentialRampToValueAtTime(35, now + totalKineticDur);
        waveFilter.Q.value = 2.2;

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.0001, now);
        waveGain.gain.exponentialRampToValueAtTime(0.16, now + 1.8);
        waveGain.gain.linearRampToValueAtTime(0.48, now + 4.5);             // Peak barrel roar
        waveGain.gain.linearRampToValueAtTime(0.18, now + 6.0);             // Closeout fizz
        waveGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        waveNoise.connect(waveFilter);
        waveFilter.connect(waveGain);
        waveGain.connect(targetOutput);
        waveNoise.start(now);
        waveNoise.stop(now + totalKineticDur + 0.1);

        // 2. Heavy Subterranean Surf Swell (Sub-bass Oscillator)
        const subSwell = ctx.createOscillator();
        subSwell.type = 'sine';
        subSwell.frequency.setValueAtTime(36, now);
        subSwell.frequency.linearRampToValueAtTime(46, now + 2.2);
        subSwell.frequency.linearRampToValueAtTime(64, now + 4.5);          // Wave mass inside barrel
        subSwell.frequency.linearRampToValueAtTime(32, now + 6.0);
        subSwell.frequency.exponentialRampToValueAtTime(18, now + totalKineticDur);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.exponentialRampToValueAtTime(0.22, now + 1.8);
        subGain.gain.linearRampToValueAtTime(0.55, now + 4.5);             // Peak wave body
        subGain.gain.linearRampToValueAtTime(0.16, now + 6.0);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + totalKineticDur);

        subSwell.connect(subGain);
        subGain.connect(targetOutput);
        subSwell.start(now);
        subSwell.stop(now + totalKineticDur + 0.1);

        setTimeout(() => {
            try {
                waveNoise.disconnect();
                waveFilter.disconnect();
                waveGain.disconnect();
                subSwell.disconnect();
                subGain.disconnect();
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


