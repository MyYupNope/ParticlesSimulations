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
    master.gain.linearRampToValueAtTime(0.60, now + 0.02);
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
        // -- 4-Phase Aero-Elastic Foliage & Wind Storm Synthesizer (~12.0s) --
        // Phase 1: Whispering Foliage Sway (0-2.5s) -> Phase 2: Wind Surge Rush (2.5-7.0s) -> Phase 3: Calming Tailwind (7.0-9.8s) -> Phase 4: Crystal Landing (9.8-12.0s)
        const totalBreezeDur = 12.0;
        const pat = (s && s.pattern) || {};
        const blowDir = (pat.blowDir != null) ? pat.blowDir : 1.0;

        // Stereo Panner (tracking the gust's cross-stage travel)
        const panner = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
        if (panner) {
            const pSign = (blowDir > 0) ? 1.0 : -1.0;
            panner.pan.setValueAtTime(-0.40 * pSign, now);
            panner.pan.linearRampToValueAtTime(0.65 * pSign, now + 6.0);
            panner.pan.linearRampToValueAtTime(0.0, now + 10.5);
            panner.connect(master);
        }
        const audioOut = panner || master;

        // 1. Aerodynamic Wind Noise Body
        const wind = ctx.createBufferSource();
        wind.buffer = createNoiseBuffer(ctx);
        wind.loop = true;

        const windFilt = ctx.createBiquadFilter();
        windFilt.type = 'bandpass';
        windFilt.frequency.setValueAtTime(160, now);
        windFilt.frequency.linearRampToValueAtTime(260, now + 2.5);       // Phase 1: Subtle leafy draft
        windFilt.frequency.exponentialRampToValueAtTime(740, now + 5.5); // Phase 2: Peak wind surge roar
        windFilt.frequency.linearRampToValueAtTime(320, now + 9.8);       // Phase 3: Calming tailwind
        windFilt.frequency.exponentialRampToValueAtTime(60, now + totalBreezeDur);
        windFilt.Q.value = 1.3;

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.0001, now);
        windGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);      // Soft entrance
        windGain.gain.linearRampToValueAtTime(0.15, now + 2.5);           // Sway buildup
        windGain.gain.linearRampToValueAtTime(0.38, now + 5.5);           // Surge peak
        windGain.gain.linearRampToValueAtTime(0.10, now + 9.8);           // Tailwind calm
        windGain.gain.exponentialRampToValueAtTime(0.0001, now + totalBreezeDur);

        // 2. Leaf Flutter Amplitude Modulation LFO (Phase 1 & 2)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(8.5, now);
        lfo.frequency.linearRampToValueAtTime(14.0, now + 5.5);
        lfo.frequency.linearRampToValueAtTime(4.0, now + totalBreezeDur);

        const lfoDepth = ctx.createGain();
        lfoDepth.gain.setValueAtTime(0.04, now);
        lfoDepth.gain.linearRampToValueAtTime(0.10, now + 5.5);
        lfoDepth.gain.linearRampToValueAtTime(0.0, now + 9.8);

        lfo.connect(lfoDepth);
        lfoDepth.connect(windGain.gain);

        wind.connect(windFilt);
        windFilt.connect(windGain);
        windGain.connect(audioOut);
        wind.start(now);
        wind.stop(now + totalBreezeDur + 0.1);
        lfo.start(now);
        lfo.stop(now + totalBreezeDur + 0.1);

        // 3. Resting Crystal Chime (Phase 4: 9.8s -> 12.0s)
        const chime = ctx.createOscillator();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(587.33, now + 9.8); // D5
        chime.frequency.exponentialRampToValueAtTime(440.0, now + totalBreezeDur); // A4

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0.0001, now + 9.8);
        chimeGain.gain.exponentialRampToValueAtTime(0.06, now + 10.3);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + totalBreezeDur);

        chime.connect(chimeGain);
        chimeGain.connect(audioOut);
        chime.start(now + 9.8);
        chime.stop(now + totalBreezeDur + 0.1);

        setTimeout(() => {
            try {
                wind.disconnect();
                windFilt.disconnect();
                windGain.disconnect();
                lfo.disconnect();
                lfoDepth.disconnect();
                chime.disconnect();
                chimeGain.disconnect();
                if (panner) panner.disconnect();
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
        // -- Magnetic Tokamak Fusion Reactor & Solar Plasma Donut Synthesizer (~16s) --
        // Magnetic Pinch & Ignition -> Helical Plasma Containment Surge -> Magnetic Quench & Cold Fusion Crystallization
        const totalSingDur = 16.0;

        // 1. Magnetic Containment Sub-Bass Hum (Tokamak Toroidal Field)
        const subHum = ctx.createOscillator();
        subHum.type = 'sine';
        subHum.frequency.setValueAtTime(55, now);
        subHum.frequency.exponentialRampToValueAtTime(36, now + 1.2);   // Magnetic pinch drop
        subHum.frequency.exponentialRampToValueAtTime(68, now + 2.8);   // Core ignition surge
        subHum.frequency.linearRampToValueAtTime(62, now + 10.5);       // Stable helical containment
        subHum.frequency.exponentialRampToValueAtTime(28, now + totalSingDur);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.exponentialRampToValueAtTime(0.32, now + 2.8);     // Ignition peak
        subGain.gain.linearRampToValueAtTime(0.24, now + 10.5);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        // Poloidal coil AM modulation (3.2Hz helical frequency)
        const coilLfo = ctx.createOscillator();
        coilLfo.type = 'sine';
        coilLfo.frequency.value = 3.2;
        const coilDepth = ctx.createGain();
        coilDepth.gain.setValueAtTime(0.06, now + 2.8);
        coilDepth.gain.linearRampToValueAtTime(0.0, now + 10.5);
        coilLfo.connect(coilDepth);
        coilDepth.connect(subGain.gain);

        subHum.connect(subGain);
        subGain.connect(master);
        subHum.start(now);
        subHum.stop(now + totalSingDur + 0.1);
        coilLfo.start(now);
        coilLfo.stop(now + totalSingDur + 0.1);

        // 2. High-Energy Plasma Surge Roar (Sweeping Bandpass Filtered Noise)
        const plasmaNoise = ctx.createBufferSource();
        plasmaNoise.buffer = createNoiseBuffer(ctx);
        plasmaNoise.loop = true;

        const plasmaFilter = ctx.createBiquadFilter();
        plasmaFilter.type = 'bandpass';
        plasmaFilter.frequency.setValueAtTime(110, now);
        plasmaFilter.frequency.exponentialRampToValueAtTime(680, now + 2.8);   // Magnetic ignition rush
        plasmaFilter.frequency.linearRampToValueAtTime(840, now + 6.5);        // Peak thermal surge
        plasmaFilter.frequency.linearRampToValueAtTime(520, now + 10.5);       // Confinement stability
        plasmaFilter.frequency.exponentialRampToValueAtTime(90, now + totalSingDur); // Magnetic quench
        plasmaFilter.Q.value = 2.2;

        const plasmaGain = ctx.createGain();
        plasmaGain.gain.setValueAtTime(0.0001, now);
        plasmaGain.gain.exponentialRampToValueAtTime(0.28, now + 2.8);
        plasmaGain.gain.linearRampToValueAtTime(0.22, now + 10.5);
        plasmaGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        // 360° Turntable sweeping AM pulse (0.75Hz)
        const rotLfo = ctx.createOscillator();
        rotLfo.type = 'sine';
        rotLfo.frequency.value = 0.75;
        const rotDepth = ctx.createGain();
        rotDepth.gain.setValueAtTime(0.05, now + 2.8);
        rotDepth.gain.linearRampToValueAtTime(0.0, now + 10.5);
        rotLfo.connect(rotDepth);
        rotDepth.connect(plasmaGain.gain);

        plasmaNoise.connect(plasmaFilter);
        plasmaFilter.connect(plasmaGain);
        plasmaGain.connect(master);
        plasmaNoise.start(now);
        plasmaNoise.stop(now + totalSingDur + 0.1);
        rotLfo.start(now);
        rotLfo.stop(now + totalSingDur + 0.1);

        // 3. Ignition Core Blast Thump (at t = 2.8s)
        const ignT = now + 2.8;
        const thump = ctx.createOscillator();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(115, ignT);
        thump.frequency.exponentialRampToValueAtTime(38, ignT + 0.45);

        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(0.0001, ignT);
        thumpGain.gain.exponentialRampToValueAtTime(0.32, ignT + 0.03);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, ignT + 0.55);

        thump.connect(thumpGain);
        thumpGain.connect(master);
        thump.start(ignT);
        thump.stop(ignT + 0.6);

        // 4. Cold Fusion Re-crystallization Chime (13.5s -> 16.0s: E5 -> B4 crystal bell)
        const chimeT = now + 13.5;
        const chime = ctx.createOscillator();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(659.25, chimeT); // E5
        chime.frequency.exponentialRampToValueAtTime(493.88, chimeT + 1.2); // B4

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0.0001, chimeT);
        chimeGain.gain.exponentialRampToValueAtTime(0.12, chimeT + 0.06);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSingDur);

        chime.connect(chimeGain);
        chimeGain.connect(master);
        chime.start(chimeT);
        chime.stop(now + totalSingDur + 0.1);

        setTimeout(() => {
            try {
                subHum.disconnect();
                subGain.disconnect();
                coilLfo.disconnect();
                coilDepth.disconnect();
                plasmaNoise.disconnect();
                plasmaFilter.disconnect();
                plasmaGain.disconnect();
                rotLfo.disconnect();
                rotDepth.disconnect();
                thump.disconnect();
                thumpGain.disconnect();
                chime.disconnect();
                chimeGain.disconnect();
                master.disconnect();
            } catch (_) {}
        }, (totalSingDur + 0.2) * 1000);
        return;
    }

    if (motionStyle === 5) {
        // -- Braided Aurora Currents & Swarm Synthesizer (~14s) --
        // Spatial Stereo Panner -> Laminar Flow Airframe -> 3-Voice Triadic Harmonic Chord Hum -> Touchdown Whisper
        const totalMurDur = 14.0;
        const pat = (s && s.pattern) || {};
        const modeIndex = (pat.mModeIndex != null) ? pat.mModeIndex : Math.floor(Math.random() * 5);
        const pSign = (pat.mLaunchDir != null && pat.mLaunchDir < 0) ? -1.0 : 1.0;

        // Stereo Panner (tracking sweeping macro flight path)
        const panner = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
        if (panner) {
            panner.pan.setValueAtTime(0.0, now);
            panner.pan.linearRampToValueAtTime(-0.60 * pSign, now + 3.0);  // Phase 1: Sweep
            panner.pan.linearRampToValueAtTime(0.65 * pSign, now + 7.5);   // Phase 2: Braid sweep
            panner.pan.linearRampToValueAtTime(-0.45 * pSign, now + 10.5); // Phase 3: Wavefront drift
            panner.pan.linearRampToValueAtTime(0.0, now + 13.0);           // Phase 4: Center landing
            panner.connect(master);
        }
        const audioOut = panner || master;

        // 1. Laminar Flow Airframe: smooth bandpass noise
        const air = ctx.createBufferSource();
        air.buffer = createNoiseBuffer(ctx);
        air.loop = true;

        const airFilt = ctx.createBiquadFilter();
        airFilt.type = 'bandpass';
        airFilt.frequency.setValueAtTime(180, now);
        airFilt.frequency.linearRampToValueAtTime(680, now + 3.5);   // Silk lift
        airFilt.frequency.linearRampToValueAtTime(540, now + 7.5);   // Braid cruise
        airFilt.frequency.linearRampToValueAtTime(720, now + 9.5);   // Aurora surge
        airFilt.frequency.linearRampToValueAtTime(160, now + 12.0);  // Settling descent
        airFilt.frequency.exponentialRampToValueAtTime(60, now + totalMurDur);
        airFilt.Q.value = 1.4;

        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.0001, now);
        airGain.gain.exponentialRampToValueAtTime(0.18, now + 3.0);
        airGain.gain.linearRampToValueAtTime(0.16, now + 7.5);
        airGain.gain.linearRampToValueAtTime(0.20, now + 9.5);       // Wave surge
        airGain.gain.linearRampToValueAtTime(0.08, now + 12.0);
        airGain.gain.exponentialRampToValueAtTime(0.0001, now + totalMurDur);

        air.connect(airFilt);
        airFilt.connect(airGain);
        airGain.connect(audioOut);
        air.start(now);
        air.stop(now + totalMurDur + 0.1);

        // 2. 3-Voice Triadic Harmonic Chords — Distinct palette per choreography mode
        const chordPalettes = [
            [329.63, 415.30, 493.88], // Mode 0: E Major Triad (E4, G#4, B4)
            [293.66, 369.99, 440.00], // Mode 1: D Major Triad (D4, F#4, A4)
            [220.00, 277.18, 329.63], // Mode 2: A Major Triad (A3, C#4, E4)
            [369.99, 440.00, 554.37], // Mode 3: F# Minor Triad (F#4, A4, C#5)
            [261.63, 329.63, 392.00]  // Mode 4: C Major Triad (C4, E4, G4)
        ];
        const chordPitches = chordPalettes[modeIndex % chordPalettes.length];
        const chordOscs = [];
        const chordGains = [];

        chordPitches.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 7.5);
            osc.frequency.linearRampToValueAtTime(freq * 0.95, now + 11.5);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + totalMurDur);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.045, now + 2.5 + idx * 0.3);
            gain.gain.linearRampToValueAtTime(0.065, now + 7.5);
            gain.gain.linearRampToValueAtTime(0.035, now + 11.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + totalMurDur);

            osc.connect(gain);
            gain.connect(audioOut);
            osc.start(now);
            osc.stop(now + totalMurDur + 0.1);

            chordOscs.push(osc);
            chordGains.push(gain);
        });

        // 3. Ethereal Touchdown Shimmer Glissando (11.5s -> end)
        const shimmer = ctx.createOscillator();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(chordPitches[0] * 3.0, now + 11.5);
        shimmer.frequency.exponentialRampToValueAtTime(chordPitches[0], now + totalMurDur);

        const shimmerGain = ctx.createGain();
        shimmerGain.gain.setValueAtTime(0.0001, now + 11.5);
        shimmerGain.gain.exponentialRampToValueAtTime(0.04, now + 11.9);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + totalMurDur);

        shimmer.connect(shimmerGain);
        shimmerGain.connect(audioOut);
        shimmer.start(now + 11.5);
        shimmer.stop(now + totalMurDur + 0.1);

        setTimeout(() => {
            try {
                air.disconnect();
                airFilt.disconnect();
                airGain.disconnect();
                chordOscs.forEach(o => o.disconnect());
                chordGains.forEach(g => g.disconnect());
                shimmer.disconnect();
                shimmerGain.disconnect();
                if (panner) panner.disconnect();
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


