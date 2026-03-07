// Audio-System: Prozedurale Sounds und Musik via Web Audio API
class AudioManager {
    constructor() {
        this.ctx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicPlaying = false;
        this.musicNodes = [];
        this.currentTrack = 'zone_pink';
        this._overrideTrack = null;
        this._overrideTimeout = null;
        this._sectionIndex = 0;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25;
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    // --- Sound Effects ---

    _tone(freq, dur, type, vol, dest) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = vol;
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.connect(g);
        g.connect(dest || this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
        return osc;
    }

    playJump() {
        if (!this.ctx) return;
        // Aufsteigender Sprung-Sound mit Frequenz-Sweep
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        g.gain.setValueAtTime(0.13, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g); g.connect(this.sfxGain);
        osc.start(now); osc.stop(now + 0.15);
        // Kleiner "Boing"-Effekt
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(500, now + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        g2.gain.setValueAtTime(0.08, now + 0.04);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc2.connect(g2); g2.connect(this.sfxGain);
        osc2.start(now + 0.04); osc2.stop(now + 0.14);
    }

    playPowerUp() {
        [523, 659, 784, 1047, 1319].forEach((n, i) => {
            setTimeout(() => this._tone(n, 0.12, 'square', 0.18), i * 50);
        });
    }

    playEat() {
        this._tone(250, 0.06, 'sawtooth', 0.18);
        setTimeout(() => this._tone(400, 0.1, 'square', 0.12), 50);
    }

    playHurt() {
        this._tone(180, 0.25, 'sawtooth', 0.25);
        setTimeout(() => this._tone(120, 0.3, 'sawtooth', 0.2), 80);
    }

    playGameOver() {
        [380, 320, 260, 180, 140].forEach((n, i) => {
            setTimeout(() => this._tone(n, 0.5, 'triangle', 0.25), i * 220);
        });
    }

    playScore() {
        this._tone(880, 0.06, 'square', 0.1);
        setTimeout(() => this._tone(1100, 0.06, 'square', 0.08), 40);
    }

    playBlockHit() {
        this._tone(600, 0.05, 'square', 0.15);
        setTimeout(() => this._tone(900, 0.08, 'square', 0.12), 30);
        setTimeout(() => this._tone(1200, 0.1, 'square', 0.1), 70);
    }

    // --- Sprach-Stimme (Formant-Synthese fuer niedliche Lama-Stimme) ---

    // Spricht eine Silbenfolge mit Tonhoehen-Kontur
    // pattern: Array von {freq, dur} - Grundfrequenz und Dauer pro Silbe
    _speakPattern(pattern) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        let t = now;

        pattern.forEach(syl => {
            // Grundton (Stimme)
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(syl.freq, t);
            // Leichte Vibrato-artige Schwankung
            osc.frequency.setValueAtTime(syl.freq * 1.02, t + syl.dur * 0.3);
            osc.frequency.setValueAtTime(syl.freq * 0.98, t + syl.dur * 0.6);
            osc.frequency.setValueAtTime(syl.freq, t + syl.dur * 0.9);
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.1, t + 0.02);
            g.gain.setValueAtTime(0.1, t + syl.dur * 0.7);
            g.gain.exponentialRampToValueAtTime(0.001, t + syl.dur);

            // Formant-Filter fuer Vokal-Charakter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = syl.formant || 800;
            filter.Q.value = 3;

            osc.connect(filter);
            filter.connect(g);
            g.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + syl.dur + 0.01);

            // Zweiter Formant fuer natuerlicheren Klang
            const osc2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.value = syl.freq * 2;
            g2.gain.setValueAtTime(0.001, t);
            g2.gain.linearRampToValueAtTime(0.03, t + 0.02);
            g2.gain.exponentialRampToValueAtTime(0.001, t + syl.dur);

            const filter2 = this.ctx.createBiquadFilter();
            filter2.type = 'bandpass';
            filter2.frequency.value = (syl.formant || 800) * 1.5;
            filter2.Q.value = 2;

            osc2.connect(filter2);
            filter2.connect(g2);
            g2.connect(this.sfxGain);
            osc2.start(t);
            osc2.stop(t + syl.dur + 0.01);

            t += syl.dur + 0.02; // kleine Pause zwischen Silben
        });
    }

    // Vordefinierte Sprueche
    speakStart() {
        // "Los gehts!" - aufsteigende, froehliche Melodie
        this._speakPattern([
            { freq: 280, dur: 0.12, formant: 600 },   // Lo
            { freq: 320, dur: 0.15, formant: 900 },   // os
            { freq: 380, dur: 0.12, formant: 700 },   // gehts
            { freq: 440, dur: 0.2,  formant: 1000 },  // !
        ]);
    }

    speakHurt() {
        // "Aua!" - kurzer Schmerzlaut
        this._speakPattern([
            { freq: 400, dur: 0.12, formant: 900 },   // Au
            { freq: 300, dur: 0.18, formant: 700 },   // a!
        ]);
    }

    speakWarning() {
        // "Vorsicht!" - warnend
        this._speakPattern([
            { freq: 350, dur: 0.1,  formant: 600 },   // Vor
            { freq: 420, dur: 0.12, formant: 1100 },  // sich
            { freq: 350, dur: 0.15, formant: 800 },   // t!
        ]);
    }

    speakYippie() {
        // "Jippie!" - freudiger Ausruf
        this._speakPattern([
            { freq: 400, dur: 0.1,  formant: 1200 },  // Ji
            { freq: 500, dur: 0.12, formant: 1000 },  // ppi
            { freq: 550, dur: 0.2,  formant: 900 },   // ie!
        ]);
    }

    speakYummy() {
        // "Mjam!" - beim Essen
        this._speakPattern([
            { freq: 250, dur: 0.08, formant: 500 },   // Mj
            { freq: 320, dur: 0.15, formant: 900 },   // am!
        ]);
    }

    speakOhNo() {
        // "Oh nein!" - Game Over
        this._speakPattern([
            { freq: 350, dur: 0.15, formant: 700 },   // Oh
            { freq: 280, dur: 0.12, formant: 900 },   // ne
            { freq: 220, dur: 0.25, formant: 800 },   // in!
        ]);
    }

    speakWow() {
        // "Wow!" - bei Power-ups
        this._speakPattern([
            { freq: 300, dur: 0.1,  formant: 600 },   // W
            { freq: 420, dur: 0.2,  formant: 900 },   // ow!
        ]);
    }

    speakZone() {
        // "Ooh!" - staunend bei neuer Zone
        this._speakPattern([
            { freq: 320, dur: 0.15, formant: 700 },   // Oo
            { freq: 400, dur: 0.2,  formant: 1000 },  // oh!
        ]);
    }

    // --- Musik-System ---

    setZoneTrack(trackName) {
        if (this.currentTrack === trackName) return;
        this.currentTrack = trackName;
        // Wenn kein Override aktiv ist, sanft zum neuen Zone-Track wechseln
        if (!this._overrideTrack) {
            this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
            this.musicNodes = [];
            if (this._musicTimeout) clearTimeout(this._musicTimeout);
            this._sectionIndex = 0;
            this._scheduleNextSection();
        }
    }

    startMusic() {
        if (!this.ctx || this.musicPlaying) return;
        this.musicPlaying = true;
        this._sectionIndex = 0;
        this._scheduleNextSection();
    }

    stopMusic() {
        this.musicPlaying = false;
        this._overrideTrack = null;
        if (this._overrideTimeout) clearTimeout(this._overrideTimeout);
        if (this._musicTimeout) clearTimeout(this._musicTimeout);
        this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this.musicNodes = [];
    }

    playTemporaryTrack(trackName, durationMs) {
        this._overrideTrack = trackName;
        this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        this.musicNodes = [];
        if (this._musicTimeout) clearTimeout(this._musicTimeout);
        if (this._overrideTimeout) clearTimeout(this._overrideTimeout);
        this._sectionIndex = 0;
        this._scheduleNextSection();
        this._overrideTimeout = setTimeout(() => {
            this._overrideTrack = null;
            this._sectionIndex = 0;
            // Zurueck zum Zone-Track
            this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
            this.musicNodes = [];
            if (this._musicTimeout) clearTimeout(this._musicTimeout);
            this._scheduleNextSection();
        }, durationMs);
    }

    _scheduleNextSection() {
        if (!this.musicPlaying) return;
        const track = this._overrideTrack || this.currentTrack;
        const section = this._getSection(track);
        const duration = this._playSection(section);
        this._sectionIndex++;
        this._musicTimeout = setTimeout(() => this._scheduleNextSection(), duration);
    }

    _getSection(track) {
        const sections = this._tracks[track] || this._tracks.zone_pink;
        return sections[this._sectionIndex % sections.length];
    }

    // ============================================================
    //  MUSIK-TRACKS - Einzigartige Kompositionen pro Zone/Power-Up
    // ============================================================
    get _tracks() {
        return {
            // --------------------------------------------------------
            // ZONE 1: Rosa Zuckerguss - Suess, verspielt, Spieluhr-Gefuehl
            // Tonart: C-Dur, leicht und huepfend
            // --------------------------------------------------------
            zone_pink: [
                {
                    tempo: 0.19,
                    melody:     [523,659,784,1047, 880,784,659,784, 1047,880,784,659, 523,659,784,523],
                    melodyType: 'square',
                    bass:       [262,262,330,330, 392,392,330,330, 262,262,392,392, 262,330,262,262],
                    bassType:   'triangle',
                    arp:        [784,880,784,880, 1047,880,1047,880, 784,880,784,880, 659,784,659,784],
                    perc:       [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,1,0,0],
                    melodyVol: 0.07, bassVol: 0.08
                },
                {
                    tempo: 0.21,
                    melody:     [784,880,1047,880, 784,659,523,659, 784,659,523,440, 523,659,784,880],
                    melodyType: 'square',
                    bass:       [196,262,330,262, 196,196,262,262, 330,262,196,220, 262,330,392,330],
                    bassType:   'triangle',
                    perc:       [1,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.09
                },
                {
                    tempo: 0.17,
                    melody:     [1047,988,880,784, 880,1047,1319,1047, 880,784,659,784, 880,1047,880,784],
                    melodyType: 'triangle',
                    bass:       [262,262,220,196, 220,262,330,262, 220,196,165,196, 220,262,220,196],
                    bassType:   'sine',
                    arp:        [659,784,659,523, 659,784,880,784, 659,523,440,523, 659,784,659,523],
                    perc:       [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
                    melodyVol: 0.06, bassVol: 0.08
                }
            ],

            // --------------------------------------------------------
            // ZONE 2: Schokoladen-Grotte - Dunkel, mysterioees, tief
            // Tonart: D-Moll, langsamer, basslastig
            // --------------------------------------------------------
            zone_choco: [
                {
                    tempo: 0.24,
                    melody:     [294,349,440,349, 294,262,294,349, 392,349,294,262, 220,262,294,262],
                    melodyType: 'triangle',
                    bass:       [147,147,175,175, 147,131,147,175, 196,175,147,131, 110,131,147,131],
                    bassType:   'sawtooth',
                    perc:       [1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.1
                },
                {
                    tempo: 0.26,
                    melody:     [440,392,349,294, 262,294,349,392, 440,523,494,440, 392,349,294,349],
                    melodyType: 'sawtooth',
                    bass:       [175,175,147,147, 131,147,175,196, 220,262,247,220, 196,175,147,175],
                    bassType:   'triangle',
                    arp:        [587,523,587,523, 494,523,587,659, 698,659,698,659, 587,523,494,523],
                    perc:       [1,0,0,1, 0,0,0,1, 0,0,1,0, 0,1,0,0],
                    melodyVol: 0.06, bassVol: 0.1
                },
                {
                    tempo: 0.22,
                    melody:     [349,294,262,294, 349,440,523,440, 349,294,220,262, 294,349,440,349],
                    melodyType: 'triangle',
                    bass:       [175,147,131,147, 175,220,262,220, 175,147,110,131, 147,175,220,175],
                    bassType:   'sawtooth',
                    perc:       [1,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.11
                }
            ],

            // --------------------------------------------------------
            // ZONE 3: Minz-Kristalle - Kristallin, schimmernd, aetherisch
            // Tonart: E-Dur Pentatonik, hohe Toene, Sine-Wellen
            // --------------------------------------------------------
            zone_mint: [
                {
                    tempo: 0.2,
                    melody:     [659,784,988,1175, 988,784,659,784, 988,1175,1319,1175, 988,784,659,988],
                    melodyType: 'sine',
                    bass:       [165,165,196,196, 247,247,196,196, 165,165,247,247, 330,247,196,165],
                    bassType:   'sine',
                    arp:        [1319,1175,988,1175, 1319,1568,1319,1175, 988,1175,1319,1568, 1319,1175,988,1175],
                    perc:       [0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1],
                    melodyVol: 0.08, bassVol: 0.07
                },
                {
                    tempo: 0.23,
                    melody:     [1319,1175,988,784, 659,784,988,1175, 1319,1568,1319,1175, 988,784,988,1175],
                    melodyType: 'sine',
                    bass:       [330,330,247,196, 165,196,247,330, 330,392,330,247, 247,196,247,330],
                    bassType:   'triangle',
                    perc:       [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
                    melodyVol: 0.07, bassVol: 0.06
                },
                {
                    tempo: 0.18,
                    melody:     [988,1175,1319,1175, 988,784,988,1175, 1568,1319,1175,988, 1175,1319,1568,1319],
                    melodyType: 'sine',
                    bass:       [247,330,330,330, 247,196,247,330, 392,330,247,247, 330,330,392,330],
                    bassType:   'sine',
                    arp:        [659,784,659,784, 659,523,659,784, 988,784,659,659, 784,784,988,784],
                    perc:       [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
                    melodyVol: 0.07, bassVol: 0.07
                }
            ],

            // --------------------------------------------------------
            // ZONE 4: Erdbeer-Tal - Warm, pastoral, fliessend
            // Tonart: G-Dur, mittleres Tempo, froehlich-melodisch
            // --------------------------------------------------------
            zone_strawberry: [
                {
                    tempo: 0.2,
                    melody:     [392,440,494,587, 659,587,494,440, 392,494,587,659, 784,659,587,494],
                    melodyType: 'triangle',
                    bass:       [196,196,247,247, 330,330,247,247, 196,247,294,330, 392,330,294,247],
                    bassType:   'triangle',
                    arp:        [587,659,587,659, 784,659,587,659, 587,659,784,784, 988,784,784,659],
                    perc:       [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.09
                },
                {
                    tempo: 0.22,
                    melody:     [659,587,494,440, 392,440,494,587, 659,784,659,587, 494,587,659,784],
                    melodyType: 'square',
                    bass:       [330,294,247,220, 196,220,247,294, 330,392,330,294, 247,294,330,392],
                    bassType:   'triangle',
                    perc:       [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1],
                    melodyVol: 0.06, bassVol: 0.09
                },
                {
                    tempo: 0.18,
                    melody:     [784,880,784,659, 587,494,587,659, 784,659,587,494, 587,659,784,988],
                    melodyType: 'triangle',
                    bass:       [392,440,392,330, 294,247,294,330, 392,330,294,247, 294,330,392,494],
                    bassType:   'sine',
                    arp:        [494,587,494,440, 392,330,392,440, 494,440,392,330, 392,440,494,659],
                    perc:       [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.08
                }
            ],

            // --------------------------------------------------------
            // ZONE 5: Karamell-Kammer - Warm, jazzig, synkopiert
            // Tonart: Bb-Dur mit Jazz-Toenen, swingend
            // --------------------------------------------------------
            zone_caramel: [
                {
                    tempo: 0.2,
                    melody:     [466,523,587,698, 784,698,587,659, 587,523,466,523, 587,698,784,698],
                    melodyType: 'triangle',
                    bass:       [233,233,294,294, 349,349,330,330, 294,262,233,262, 294,349,392,349],
                    bassType:   'sawtooth',
                    perc:       [1,0,1,0, 0,1,0,1, 1,0,0,1, 0,1,0,1],
                    melodyVol: 0.07, bassVol: 0.08
                },
                {
                    tempo: 0.22,
                    melody:     [698,784,880,784, 698,587,523,587, 698,659,587,523, 466,523,587,698],
                    melodyType: 'square',
                    bass:       [349,392,440,392, 349,294,262,294, 349,330,294,262, 233,262,294,349],
                    bassType:   'triangle',
                    arp:        [880,932,880,784, 698,784,698,784, 880,784,698,659, 587,659,698,880],
                    perc:       [0,1,0,1, 1,0,1,0, 0,1,0,1, 1,0,1,0],
                    melodyVol: 0.06, bassVol: 0.09
                },
                {
                    tempo: 0.19,
                    melody:     [523,587,659,698, 784,880,784,698, 659,587,523,466, 523,587,698,784],
                    melodyType: 'triangle',
                    bass:       [262,294,330,349, 392,440,392,349, 330,294,262,233, 262,294,349,392],
                    bassType:   'sawtooth',
                    perc:       [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,0,1,0],
                    melodyVol: 0.07, bassVol: 0.09
                }
            ],

            // --------------------------------------------------------
            // POWER-UP: Unbesiegbar - Episch, heroisch, triumphierend
            // Schnelles Tempo, kraftvolle Akkorde, Fanfaren-Charakter
            // --------------------------------------------------------
            invincible: [
                {
                    tempo: 0.11,
                    melody:     [784,988,1175,1319, 1568,1319,1175,1319, 1568,1760,1568,1319, 1175,1319,1568,1760],
                    melodyType: 'square',
                    bass:       [392,494,587,659, 784,659,587,659, 784,880,784,659, 587,659,784,880],
                    bassType:   'sawtooth',
                    arp:        [1175,1319,1175,1319, 1568,1319,1568,1319, 1175,1319,1175,1319, 1568,1760,1568,1760],
                    perc:       [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
                    melodyVol: 0.08, bassVol: 0.07
                },
                {
                    tempo: 0.1,
                    melody:     [1568,1760,2093,1760, 1568,1319,1568,1760, 2093,1760,1568,1319, 1568,1760,2093,2349],
                    melodyType: 'square',
                    bass:       [784,880,1047,880, 784,659,784,880, 1047,880,784,659, 784,880,1047,1175],
                    bassType:   'sawtooth',
                    arp:        [1319,1568,1319,1568, 1175,1047,1175,1319, 1568,1319,1175,1047, 1175,1319,1568,1760],
                    perc:       [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
                    melodyVol: 0.09, bassVol: 0.07
                }
            ],

            // --------------------------------------------------------
            // POWER-UP: Flug - Luftig, schwebend, traeumerisch
            // Langsam, weiche Sine-Toene, kein Schlagzeug
            // --------------------------------------------------------
            flying: [
                {
                    tempo: 0.28,
                    melody:     [659,784,880,1047, 880,784,659,784, 880,1047,1175,1047, 880,784,880,1047],
                    melodyType: 'sine',
                    bass:       [262,330,392,440, 392,330,262,330, 392,440,494,440, 392,330,392,440],
                    bassType:   'sine',
                    arp:        [1175,1319,1175,1319, 1047,1175,1047,1175, 1319,1175,1319,1175, 1047,988,1047,1175],
                    perc:       [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
                    melodyVol: 0.09, bassVol: 0.07
                },
                {
                    tempo: 0.3,
                    melody:     [1047,880,784,880, 1047,1175,1047,880, 784,659,784,880, 1047,1175,1319,1175],
                    melodyType: 'sine',
                    bass:       [440,392,330,392, 440,494,440,392, 330,262,330,392, 440,494,523,494],
                    bassType:   'sine',
                    perc:       [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
                    melodyVol: 0.08, bassVol: 0.07
                }
            ],

            // --------------------------------------------------------
            // POWER-UP: Speed - Treibend, pulsierend, intensiv
            // Sehr schnelles Tempo, doppelte Percussion
            // --------------------------------------------------------
            speed: [
                {
                    tempo: 0.1,
                    melody:     [523,659,784,659, 523,659,784,880, 1047,880,784,659, 784,880,1047,880],
                    melodyType: 'square',
                    bass:       [262,330,392,330, 262,330,392,440, 523,440,392,330, 392,440,523,440],
                    bassType:   'triangle',
                    arp:        [784,880,784,880, 1047,880,1047,1175, 1319,1175,1047,880, 1047,1175,1319,1175],
                    perc:       [1,0,1,1, 0,1,1,0, 1,1,0,1, 1,0,1,1],
                    melodyVol: 0.07, bassVol: 0.09
                },
                {
                    tempo: 0.09,
                    melody:     [880,1047,880,784, 659,784,880,1047, 1175,1047,880,1047, 1175,1319,1175,1047],
                    melodyType: 'square',
                    bass:       [440,523,440,392, 330,392,440,523, 587,523,440,523, 587,659,587,523],
                    bassType:   'triangle',
                    perc:       [1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,1,0],
                    melodyVol: 0.07, bassVol: 0.1
                }
            ]
        };
    }

    _playSection(section) {
        if (!this.ctx || !this.musicPlaying) return 1000;
        const now = this.ctx.currentTime;
        const t = section.tempo;
        const len = section.melody.length;

        // Melodie
        section.melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = section.melodyType;
            osc.frequency.value = freq;
            g.gain.value = section.melodyVol;
            g.gain.setValueAtTime(section.melodyVol, now + i * t);
            g.gain.exponentialRampToValueAtTime(0.001, now + (i + 0.85) * t);
            osc.connect(g); g.connect(this.musicGain);
            osc.start(now + i * t);
            osc.stop(now + (i + 1) * t);
            this.musicNodes.push(osc);
        });

        // Bass
        section.bass.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = section.bassType;
            osc.frequency.value = freq;
            g.gain.value = section.bassVol;
            g.gain.setValueAtTime(section.bassVol, now + i * t);
            g.gain.exponentialRampToValueAtTime(0.001, now + (i + 0.85) * t);
            osc.connect(g); g.connect(this.musicGain);
            osc.start(now + i * t);
            osc.stop(now + (i + 1) * t);
            this.musicNodes.push(osc);
        });

        // Arpeggio (optionale dritte Stimme)
        if (section.arp) {
            section.arp.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                g.gain.value = 0.03;
                g.gain.setValueAtTime(0.03, now + i * t);
                g.gain.exponentialRampToValueAtTime(0.001, now + (i + 0.5) * t);
                osc.connect(g); g.connect(this.musicGain);
                osc.start(now + i * t);
                osc.stop(now + (i + 0.6) * t);
                this.musicNodes.push(osc);
            });
        }

        // Perkussion (Noise-Bursts)
        section.perc.forEach((hit, i) => {
            if (!hit) return;
            const bufSize = this.ctx.sampleRate * 0.03;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let s = 0; s < bufSize; s++) data[s] = (Math.random() * 2 - 1) * 0.3;
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const g = this.ctx.createGain();
            g.gain.value = 0.06;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * t + 0.04);
            src.connect(g); g.connect(this.musicGain);
            src.start(now + i * t);
            this.musicNodes.push(src);
        });

        return len * t * 1000;
    }
}

window.audioManager = new AudioManager();
