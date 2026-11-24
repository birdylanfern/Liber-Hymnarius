/* Multi-stop Web Audio organ playback (Flute, Wind, Classic Pipe) with toggleable
 * multi-pipe legato (zero pitch-gliding), pause/resume, seek, tempo, and pitch transposition. */
var ChantPlayer = (function () {
  'use strict';

  var NOTE_NAMES = ['C', 'C\u266f', 'D', 'E\u266d', 'E', 'F', 'F\u266f', 'G', 'A\u266d', 'A', 'B\u266d', 'B'];
  // exsurge.Step: Do=0, Du=1, Re=2, Me=3, Mi=4, Fa=5, Fu=6, So=7, La=9, Te=10, Ti=11
  var NATURAL_STEP = { 0: 0, 1: 0, 2: 2, 3: 2, 4: 4, 5: 5, 6: 5, 7: 7, 9: 9, 10: 11, 11: 11 };

  var ORGAN_MODES = {
    flute: {
      label: 'Flute Organ',
      lowpass: 2900,
      wet: 0.28,
      attack: 0.028,
      release: 0.12,
      peak: 0.36,
      detuneCents: 1.1,
      oct4Gain: 0.14,
      oct2Gain: 0,
      chiffGain: 0.04,
      chiffMult: 2.35,
      chiffQ: 2.6,
      chiffDecay: 0.072,
      windBedGain: 0,
      windDriftCents: 0
    },
    wind: {
      label: 'Wind Organ',
      lowpass: 2500,
      wet: 0.24,
      attack: 0.052,
      release: 0.13,
      peak: 0.34,
      detuneCents: 1.8,
      oct4Gain: 0.08,
      oct2Gain: 0,
      chiffGain: 0.105,
      chiffMult: 1.85,
      chiffQ: 1.35,
      chiffDecay: 0.11,
      windBedGain: 0.022,
      windDriftCents: 3.0
    },
    classic: {
      label: 'Classic Pipe Organ',
      lowpass: 5400,
      wet: 0.36,
      attack: 0.020,
      release: 0.14,
      peak: 0.31,
      detuneCents: 2.0,
      oct4Gain: 0.34,
      oct2Gain: 0.14,
      chiffGain: 0.052,
      chiffMult: 3.0,
      chiffQ: 2.8,
      chiffDecay: 0.06,
      windBedGain: 0,
      windDriftCents: 0
    }
  };

  var MIN_TRANSPOSE = -12;
  var MAX_TRANSPOSE = 12;
  var MIN_BPM = 80;
  var MAX_BPM = 200;
  var DEFAULT_BPM = 143;
  var MIN_REVERB = 0;
  var MAX_REVERB = 100;
  var DEFAULT_REVERB = 50;

  var ctx = null;
  var masterGain = null;
  var voiceBus = null;
  var warmthFilter = null;
  var wetGainNode = null;
  var waves = {};
  var noiseBuffer = null;

  var state = {
    events: [],
    noteEvents: [],
    baseOffset: 48,
    transpose: 0,
    organ: 'flute',
    legato: false,
    bpm: DEFAULT_BPM,
    reverb: DEFAULT_REVERB,
    playing: false,
    paused: false,
    cursor: 0,
    currentNoteIdx: 0,
    currentNoteEndTime: 0,
    nextNoteTime: 0,
    timerId: null,
    finishTimerId: null,
    sessionId: 0,
    activeVoices: [],
    previewVoice: null,
    activeSvgIdx: -1,
    scoreEl: null,
    onChange: null
  };

  function clampTranspose(val) {
    return Math.max(MIN_TRANSPOSE, Math.min(MAX_TRANSPOSE, val | 0));
  }

  function clampBpm(val) {
    var n = parseInt(val, 10);
    if (isNaN(n)) return DEFAULT_BPM;
    return Math.max(MIN_BPM, Math.min(MAX_BPM, n));
  }

  function clampReverb(val) {
    var n = parseInt(val, 10);
    if (isNaN(n)) return DEFAULT_REVERB;
    return Math.max(MIN_REVERB, Math.min(MAX_REVERB, n));
  }

  function validOrgan(name) {
    return Object.prototype.hasOwnProperty.call(ORGAN_MODES, name) ? name : 'flute';
  }

  function beatSec() {
    return 60 / state.bpm;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function midiToName(midi) {
    var pc = ((midi % 12) + 12) % 12;
    var oct = Math.floor(midi / 12) - 1;
    return NOTE_NAMES[pc] + oct;
  }

  function naturalStep(step) {
    return NATURAL_STEP[step] !== undefined ? NATURAL_STEP[step] : step;
  }

  // ---------- GABC / exsurge sequence extraction ----------
  function extractSequence(scoreOrScores) {
    var scores = Array.isArray(scoreOrScores) ? scoreOrScores : (scoreOrScores ? [scoreOrScores] : []);
    var events = [];
    var noteEvents = [];
    var hasNotes = false;

    for (var s = 0; s < scores.length; s++) {
      var sc = scores[s];
      var activeAccidentals = {};
      var notations = (sc && sc.notations) || [];
      var prevNote = null;

      if (s > 0 && hasNotes && notations.length) {
        events.push({ type: 'pause', beats: 1.6, eventIndex: events.length });
      }

      for (var i = 0; i < notations.length; i++) {
        var n = notations[i];
        if (!n) continue;

        if (typeof exsurge !== 'undefined') {
          if (n instanceof exsurge.Clef) {
            activeAccidentals = {};
            prevNote = null;
            continue;
          }
          if (n instanceof exsurge.Accidental) {
            if (n.pitch) {
              var accKey = n.pitch.octave * 12 + naturalStep(n.pitch.step);
              activeAccidentals[accKey] = n.accidentalType;
            }
            continue;
          }
          if (n instanceof exsurge.Divider) {
            activeAccidentals = {};
            prevNote = null;
            if (hasNotes) {
              var pauseBeats = 0.6;
              if (n instanceof exsurge.DoubleBar) pauseBeats = 1.35;
              else if (n instanceof exsurge.FullBar) pauseBeats = 1.0;
              else if (n instanceof exsurge.HalfBar) pauseBeats = 0.68;
              else if (n instanceof exsurge.QuarterBar || n instanceof exsurge.Virgula) pauseBeats = 0.4;
              events.push({ type: 'pause', beats: pauseBeats, eventIndex: events.length });
            }
            continue;
          }
        }

        if (n.notes && n.notes.length) {
          for (var k = 0; k < n.notes.length; k++) {
            var nt = n.notes[k];
            if (!nt || !nt.pitch) continue;
            var rawInt = typeof nt.pitch.toInt === 'function'
              ? nt.pitch.toInt()
              : (nt.pitch.octave * 12 + nt.pitch.step);
            var natInt = nt.pitch.octave * 12 + naturalStep(nt.pitch.step);
            var pitchInt = activeAccidentals[natInt] !== undefined
              ? (natInt + activeAccidentals[natInt])
              : rawInt;

            var isQuilisma = typeof exsurge !== 'undefined' && exsurge.NoteShape &&
                             nt.shape === exsurge.NoteShape.Quilisma;
            if (isQuilisma && prevNote && prevNote.beats < 1.5) {
              prevNote.beats = 1.5;
            }

            var beats = 1.0;
            if (nt.morae && nt.morae.length > 0) {
              beats = 2.0;
            } else if (nt.episemata && nt.episemata.length > 0) {
              beats = 1.35;
            }

            var playIdx = noteEvents.length;
            var ev = {
              type: 'note',
              playIdx: playIdx,
              eventIndex: events.length,
              pitchInt: pitchInt,
              beats: beats,
              scoreIndex: s,
              notationIndex: i,
              noteIndexInNotation: k
            };
            events.push(ev);
            noteEvents.push(ev);
            prevNote = ev;
            hasNotes = true;
          }
        }
      }
    }

    var baseOffset = 48;
    if (noteEvents.length) {
      var sum = 0;
      for (var j = 0; j < noteEvents.length; j++) sum += noteEvents[j].pitchInt;
      var avgMidi = (sum / noteEvents.length) + 48;
      if (avgMidi > 74) baseOffset = 36;
      else if (avgMidi < 56) baseOffset = 60;
    }

    return { events: events, noteEvents: noteEvents, baseOffset: baseOffset };
  }

  // ---------- Web Audio Multi-Stop Organ Synthesizer ----------
  function createImpulseResponse(audioCtx, duration, decay) {
    var length = Math.floor(audioCtx.sampleRate * duration);
    var impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = impulse.getChannelData(ch);
      var lp = 0;
      for (var i = 0; i < length; i++) {
        var env = Math.pow(1 - i / length, decay);
        var white = Math.random() * 2 - 1;
        lp = lp * 0.72 + white * 0.28;
        var fadeIn = Math.min(1, i / (audioCtx.sampleRate * 0.025));
        data[i] = lp * env * fadeIn;
      }
    }
    return impulse;
  }

  function makeWave(audioCtx, harmonics) {
    var real = new Float32Array(harmonics.length);
    var imag = new Float32Array(harmonics);
    return audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function applyOrganBusSettings() {
    if (!ctx || !warmthFilter || !wetGainNode) return;
    var cfg = ORGAN_MODES[state.organ] || ORGAN_MODES.flute;
    var now = ctx.currentTime;
    var wet = cfg.wet * (state.reverb / 50);
    warmthFilter.frequency.setTargetAtTime(cfg.lowpass, now, 0.03);
    wetGainNode.gain.setTargetAtTime(wet, now, 0.03);
  }

  function ensureAudio() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();

      waves.fluteMain = makeWave(ctx, [0, 1.0, 0.24, 0.095, 0.032, 0.012, 0.005, 0.002]);
      waves.fluteOct = makeWave(ctx, [0, 1.0, 0.14, 0.03]);

      waves.windMain = makeWave(ctx, [0, 1.0, 0.16, 0.24, 0.055, 0.045, 0.015]);
      waves.windOct = makeWave(ctx, [0, 1.0, 0.10, 0.06]);

      waves.classicMain = makeWave(ctx, [0, 1.0, 0.56, 0.42, 0.28, 0.19, 0.12, 0.075, 0.045, 0.025]);
      waves.classicOct = makeWave(ctx, [0, 1.0, 0.45, 0.26, 0.14, 0.07]);
      waves.classicSup = makeWave(ctx, [0, 1.0, 0.30, 0.12]);

      var nLen = Math.floor(ctx.sampleRate * 1.5);
      noiseBuffer = ctx.createBuffer(1, nLen, ctx.sampleRate);
      var nData = noiseBuffer.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0;
      for (var i = 0; i < nLen; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        nData[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
      }

      voiceBus = ctx.createGain();
      voiceBus.gain.value = 1.0;

      warmthFilter = ctx.createBiquadFilter();
      warmthFilter.type = 'lowpass';
      warmthFilter.frequency.value = 2900;
      warmthFilter.Q.value = 0.5;

      var dryGain = ctx.createGain();
      dryGain.gain.value = 0.76;

      wetGainNode = ctx.createGain();
      wetGainNode.gain.value = 0.28;

      var convolver = ctx.createConvolver();
      convolver.buffer = createImpulseResponse(ctx, 1.55, 2.7);

      var compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.15;

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.84;

      voiceBus.connect(warmthFilter);
      warmthFilter.connect(dryGain);
      warmthFilter.connect(convolver);
      convolver.connect(wetGainNode);
      dryGain.connect(compressor);
      wetGainNode.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      applyOrganBusSettings();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  // Plays an independent physical organ pipe voice (no pitch bending).
  function playOrganPipe(pitchInt, startTime, holdSec, attackSec, releaseSec, chiffScale, trackAsMain) {
    var audioCtx = ensureAudio();
    if (!audioCtx) return null;

    var mode = state.organ;
    var cfg = ORGAN_MODES[mode] || ORGAN_MODES.flute;
    var freq = midiToFreq(pitchInt + state.baseOffset + state.transpose);

    var mainWave = waves[mode + 'Main'] || waves.fluteMain;
    var octWave = waves[mode + 'Oct'] || waves.fluteOct;

    var oscs = [];
    var osc1 = audioCtx.createOscillator();
    osc1.setPeriodicWave(mainWave);
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.detune.setValueAtTime(-cfg.detuneCents, startTime);
    oscs.push({ osc: osc1, mult: 1 });

    var osc2 = audioCtx.createOscillator();
    osc2.setPeriodicWave(mainWave);
    osc2.frequency.setValueAtTime(freq, startTime);
    osc2.detune.setValueAtTime(cfg.detuneCents, startTime);
    oscs.push({ osc: osc2, mult: 1 });

    var gMain = audioCtx.createGain();
    gMain.gain.value = 0.5;

    var env = audioCtx.createGain();
    var att = Math.max(0.012, attackSec);
    var rel = Math.max(0.04, releaseSec);
    var endTime = startTime + Math.max(att + 0.01, holdSec);
    var stopAt = endTime + rel + 0.03;

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(cfg.peak, startTime + att);
    env.gain.setValueAtTime(cfg.peak, endTime);
    env.gain.exponentialRampToValueAtTime(0.0001, endTime + rel);

    osc1.connect(gMain);
    osc2.connect(gMain);
    gMain.connect(env);

    if (cfg.oct4Gain > 0) {
      var osc4ft = audioCtx.createOscillator();
      osc4ft.setPeriodicWave(octWave);
      osc4ft.frequency.setValueAtTime(freq * 2, startTime);
      var g4ft = audioCtx.createGain();
      g4ft.gain.value = cfg.oct4Gain;
      osc4ft.connect(g4ft);
      g4ft.connect(env);
      oscs.push({ osc: osc4ft, mult: 2 });
    }

    if (cfg.oct2Gain > 0) {
      var osc2ft = audioCtx.createOscillator();
      osc2ft.setPeriodicWave(waves.classicSup);
      osc2ft.frequency.setValueAtTime(freq * 4, startTime);
      var g2ft = audioCtx.createGain();
      g2ft.gain.value = cfg.oct2Gain;
      osc2ft.connect(g2ft);
      g2ft.connect(env);
      oscs.push({ osc: osc2ft, mult: 4 });
    }

    var lfo = null;
    if (cfg.windDriftCents > 0) {
      lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.45, startTime);
      var lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(cfg.windDriftCents, startTime);
      lfo.connect(lfoGain);
      for (var oi = 0; oi < oscs.length; oi++) lfoGain.connect(oscs[oi].osc.detune);
      lfo.start(startTime);
      lfo.stop(stopAt);
    }

    env.connect(voiceBus);

    for (var s = 0; s < oscs.length; s++) {
      oscs[s].osc.start(startTime);
      oscs[s].osc.stop(stopAt);
    }

    var effectiveChiff = cfg.chiffGain * (chiffScale || 0);
    if (effectiveChiff > 0.001 && noiseBuffer) {
      var chiffSrc = audioCtx.createBufferSource();
      chiffSrc.buffer = noiseBuffer;
      chiffSrc.loop = true;
      var bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(Math.min(3400, Math.max(550, freq * cfg.chiffMult)), startTime);
      bp.Q.value = cfg.chiffQ;

      var cEnv = audioCtx.createGain();
      cEnv.gain.setValueAtTime(0.0001, startTime);
      cEnv.gain.linearRampToValueAtTime(effectiveChiff, startTime + Math.min(0.02, att));
      cEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + cfg.chiffDecay);

      chiffSrc.connect(bp);
      bp.connect(cEnv);
      cEnv.connect(voiceBus);
      chiffSrc.start(startTime, Math.random() * 0.5);
      chiffSrc.stop(startTime + cfg.chiffDecay + 0.03);
    }

    var windSrc = null;
    if (cfg.windBedGain > 0 && noiseBuffer) {
      windSrc = audioCtx.createBufferSource();
      windSrc.buffer = noiseBuffer;
      windSrc.loop = true;

      var windBp = audioCtx.createBiquadFilter();
      windBp.type = 'bandpass';
      windBp.frequency.setValueAtTime(Math.min(2200, Math.max(480, freq * 1.75)), startTime);
      windBp.Q.value = 1.45;

      var windEnv = audioCtx.createGain();
      windEnv.gain.setValueAtTime(0.0001, startTime);
      windEnv.gain.linearRampToValueAtTime(cfg.windBedGain, startTime + att * 0.9);
      windEnv.gain.setValueAtTime(cfg.windBedGain, endTime);
      windEnv.gain.exponentialRampToValueAtTime(0.0001, endTime + rel * 0.85);

      windSrc.connect(windBp);
      windBp.connect(windEnv);
      windEnv.connect(voiceBus);
      windSrc.start(startTime, Math.random() * 0.8);
      windSrc.stop(stopAt);
    }

    var voice = {
      pitchInt: pitchInt,
      oscs: oscs,
      lfo: lfo,
      windSrc: windSrc,
      env: env
    };

    if (trackAsMain) {
      state.activeVoices.push(voice);
      osc1.onended = function () {
        var idx = state.activeVoices.indexOf(voice);
        if (idx >= 0) state.activeVoices.splice(idx, 1);
      };
    }
    return voice;
  }

  function stopVoiceNow(v, fadeSec) {
    if (!ctx || !v) return;
    var now = ctx.currentTime;
    try {
      v.env.gain.cancelScheduledValues(now);
      v.env.gain.setValueAtTime(Math.max(0.0001, v.env.gain.value), now);
      v.env.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
      for (var i = 0; i < v.oscs.length; i++) v.oscs[i].osc.stop(now + fadeSec + 0.02);
      if (v.lfo) v.lfo.stop(now + fadeSec + 0.02);
      if (v.windSrc) v.windSrc.stop(now + fadeSec + 0.02);
    } catch (e) { /* already stopped */ }
  }

  function silenceAllVoices() {
    state.activeVoices.forEach(function (v) { stopVoiceNow(v, 0.045); });
    state.activeVoices = [];
    stopPreview();
  }

  function stopPreview() {
    if (!state.previewVoice) return;
    stopVoiceNow(state.previewVoice, 0.04);
    state.previewVoice = null;
  }

  // ---------- Highlighting ----------
  function clearHighlight() {
    if (!state.scoreEl) return;
    var prev = state.scoreEl.querySelectorAll('.playing, .cued');
    for (var i = 0; i < prev.length; i++) {
      prev[i].classList.remove('playing');
      prev[i].classList.remove('cued');
    }
    state.activeSvgIdx = -1;
  }

  function highlightNote(playIdx, isCue) {
    if (!state.scoreEl) return;
    clearHighlight();
    if (playIdx < 0) return;
    var el = state.scoreEl.querySelector('[data-play-idx="' + playIdx + '"]');
    if (el) {
      el.classList.add(isCue ? 'cued' : 'playing');
      state.activeSvgIdx = playIdx;
    }
  }

  // ---------- Scheduler ----------
  function notify() {
    if (typeof state.onChange === 'function') state.onChange(getStatus());
  }

  function schedule() {
    if (!state.playing || !ctx) return;
    var sid = state.sessionId;
    var lookahead = 0.14;
    var cfg = ORGAN_MODES[state.organ] || ORGAN_MODES.flute;
    var bSec = beatSec();

    while (state.cursor < state.events.length && state.nextNoteTime < ctx.currentTime + lookahead) {
      var ev = state.events[state.cursor];
      var dur = ev.beats * bSec;

      if (ev.type === 'note') {
        var prevEv = state.cursor > 0 ? state.events[state.cursor - 1] : null;
        var nextEv = state.cursor + 1 < state.events.length ? state.events[state.cursor + 1] : null;
        var isPhraseStart = !prevEv || prevEv.type === 'pause';
        var isPhraseEnd = !nextEv || nextEv.type === 'pause';
        var sameAsNext = nextEv && nextEv.type === 'note' && nextEv.pitchInt === ev.pitchInt;
        var sameAsPrev = prevEv && prevEv.type === 'note' && prevEv.pitchInt === ev.pitchInt;

        var holdSec, attackSec, releaseSec, chiffScale;
        if (state.legato) {
          // True organ finger-legato: overlapping separate pipes (no pitch bending)
          attackSec = isPhraseStart ? cfg.attack : 0.022;
          chiffScale = isPhraseStart ? 1.0 : (sameAsPrev ? 0.35 : 0.0);
          if (isPhraseEnd) {
            holdSec = dur;
            releaseSec = cfg.release;
          } else if (sameAsNext) {
            holdSec = Math.max(0.05, dur - 0.025);
            releaseSec = 0.045;
          } else {
            holdSec = dur + 0.008;
            releaseSec = 0.065;
          }
        } else {
          // Articulated non-legato: clear separation between notes
          attackSec = cfg.attack;
          chiffScale = isPhraseStart ? 1.0 : 0.72;
          if (isPhraseEnd) {
            holdSec = dur;
            releaseSec = cfg.release;
          } else {
            holdSec = Math.max(0.06, dur * 0.82);
            releaseSec = Math.min(0.065, dur * 0.15);
          }
        }

        playOrganPipe(ev.pitchInt, state.nextNoteTime, holdSec, attackSec, releaseSec, chiffScale, true);

        (function (idx, when, endWhen, session) {
          var delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
          setTimeout(function () {
            if (state.playing && state.sessionId === session) {
              state.currentNoteIdx = idx;
              state.currentNoteEndTime = endWhen;
              highlightNote(idx, false);
              notify();
            }
          }, delayMs);
        })(ev.playIdx, state.nextNoteTime, state.nextNoteTime + dur, sid);
      } else if (ev.type === 'pause') {
        (function (when, session) {
          var delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
          setTimeout(function () {
            if (state.playing && state.sessionId === session) clearHighlight();
          }, delayMs);
        })(state.nextNoteTime, sid);
      }

      state.nextNoteTime += dur;
      state.cursor++;
    }

    if (state.cursor >= state.events.length) {
      var finishMs = Math.max(0, (state.nextNoteTime - ctx.currentTime) * 1000) + 180;
      clearInterval(state.timerId);
      state.timerId = null;
      state.finishTimerId = setTimeout(function () {
        if (state.sessionId === sid) stop();
      }, finishMs);
    }
  }

  function play(startNoteIdx) {
    if (!state.noteEvents.length) return;
    stopPreview();
    var audioCtx = ensureAudio();
    if (!audioCtx) return;

    clearInterval(state.timerId);
    clearTimeout(state.finishTimerId);
    state.timerId = null;
    state.finishTimerId = null;
    if (state.playing) {
      silenceAllVoices();
      clearHighlight();
    }

    if (typeof startNoteIdx === 'number' && !isNaN(startNoteIdx)) {
      var clamped = Math.max(0, Math.min(state.noteEvents.length - 1, startNoteIdx | 0));
      state.currentNoteIdx = clamped;
      state.cursor = state.noteEvents[clamped].eventIndex;
    } else if (state.cursor >= state.events.length) {
      state.currentNoteIdx = 0;
      state.cursor = 0;
    }

    state.sessionId++;
    state.playing = true;
    state.paused = false;
    state.nextNoteTime = audioCtx.currentTime + 0.04;
    state.currentNoteEndTime = state.nextNoteTime;
    notify();
    schedule();
    state.timerId = setInterval(schedule, 25);
  }

  function pause() {
    if (!state.playing) return;
    state.sessionId++;
    clearInterval(state.timerId);
    clearTimeout(state.finishTimerId);
    state.timerId = null;
    state.finishTimerId = null;
    state.playing = false;
    state.paused = true;
    silenceAllVoices();

    if (state.noteEvents.length) {
      var idx = Math.max(0, Math.min(state.noteEvents.length - 1, state.currentNoteIdx));
      state.currentNoteIdx = idx;
      state.cursor = state.noteEvents[idx].eventIndex;
      highlightNote(idx, true);
    }
    notify();
  }

  function stop() {
    state.sessionId++;
    clearInterval(state.timerId);
    clearTimeout(state.finishTimerId);
    state.timerId = null;
    state.finishTimerId = null;
    var hadActivity = state.playing || state.paused || state.cursor > 0 || state.currentNoteIdx > 0;
    state.playing = false;
    state.paused = false;
    state.cursor = 0;
    state.currentNoteIdx = 0;
    silenceAllVoices();
    clearHighlight();
    if (hadActivity) notify();
  }

  function toggle() {
    if (state.playing) pause();
    else play();
  }

  function seekToNote(noteIdx, withPreview) {
    if (!state.noteEvents.length) return;
    var idx = Math.max(0, Math.min(state.noteEvents.length - 1, noteIdx | 0));
    if (state.playing) {
      play(idx);
      return;
    }
    state.currentNoteIdx = idx;
    state.cursor = state.noteEvents[idx].eventIndex;
    state.paused = idx > 0;
    highlightNote(idx, true);
    if (withPreview) {
      stopPreview();
      var audioCtx = ensureAudio();
      if (audioCtx) {
        var cfg = ORGAN_MODES[state.organ] || ORGAN_MODES.flute;
        state.previewVoice = playOrganPipe(state.noteEvents[idx].pitchInt, audioCtx.currentTime + 0.01, 0.24, cfg.attack, cfg.release, 1.0, false);
      }
    }
    notify();
  }

  // ---------- Settings & Controls ----------
  function setTranspose(val, preview) {
    var next = clampTranspose(val);
    if (next === state.transpose && !preview) return;
    state.transpose = next;

    if (state.playing && ctx) {
      var now = ctx.currentTime;
      state.activeVoices.forEach(function (v) {
        var newFreq = midiToFreq(v.pitchInt + state.baseOffset + state.transpose);
        try {
          for (var i = 0; i < v.oscs.length; i++) {
            v.oscs[i].osc.frequency.cancelScheduledValues(now);
            v.oscs[i].osc.frequency.setTargetAtTime(newFreq * v.oscs[i].mult, now, 0.015);
          }
        } catch (e) { /* ignore */ }
      });
    } else if (preview && state.noteEvents.length) {
      stopPreview();
      var audioCtx = ensureAudio();
      if (audioCtx) {
        var cfg = ORGAN_MODES[state.organ] || ORGAN_MODES.flute;
        var refIdx = Math.max(0, Math.min(state.noteEvents.length - 1, state.currentNoteIdx));
        state.previewVoice = playOrganPipe(state.noteEvents[refIdx].pitchInt, audioCtx.currentTime + 0.01, 0.34, cfg.attack, cfg.release, 1.0, false);
      }
    }
    notify();
  }

  function shiftPitch(delta) {
    setTranspose(state.transpose + delta, true);
  }

  function resetPitch() {
    setTranspose(0, true);
  }

  function setOrgan(organName, preview) {
    var next = validOrgan(organName);
    var changed = next !== state.organ;
    state.organ = next;
    applyOrganBusSettings();
    if (state.playing && changed) {
      play(state.currentNoteIdx);
      return;
    }
    if (preview && !state.playing && state.noteEvents.length) {
      stopPreview();
      var audioCtx = ensureAudio();
      if (audioCtx) {
        var cfg = ORGAN_MODES[state.organ] || ORGAN_MODES.flute;
        var refIdx = Math.max(0, Math.min(state.noteEvents.length - 1, state.currentNoteIdx));
        state.previewVoice = playOrganPipe(state.noteEvents[refIdx].pitchInt, audioCtx.currentTime + 0.01, 0.38, cfg.attack, cfg.release, 1.0, false);
      }
    }
    notify();
  }

  function setLegato(enabled) {
    state.legato = !!enabled;
    notify();
  }

  function setBpm(bpm) {
    state.bpm = clampBpm(bpm);
    notify();
  }

  function setReverb(reverb) {
    state.reverb = clampReverb(reverb);
    applyOrganBusSettings();
    notify();
  }

  // ---------- Score Binding ----------
  function loadScore(score) {
    stop();
    var parsed = extractSequence(score);
    state.events = parsed.events;
    state.noteEvents = parsed.noteEvents;
    state.baseOffset = parsed.baseOffset;
    state.currentNoteIdx = 0;
    state.cursor = 0;
    state.paused = false;
    notify();
  }

  function bindSvg(scoreOrScores, container) {
    state.scoreEl = container || null;
    var scores = Array.isArray(scoreOrScores) ? scoreOrScores : (scoreOrScores ? [scoreOrScores] : []);
    if (!scores.length || !container) return;
    for (var i = 0; i < state.noteEvents.length; i++) {
      var ev = state.noteEvents[i];
      var sc = scores[ev.scoreIndex || 0];
      var notation = sc && sc.notations && sc.notations[ev.notationIndex];
      var nt = notation && notation.notes && notation.notes[ev.noteIndexInNotation];
      if (nt && nt.svgNode && nt.svgNode.setAttribute) {
        nt.svgNode.setAttribute('data-play-idx', String(ev.playIdx));
      }
    }
    if ((state.playing || state.paused) && state.activeSvgIdx >= 0) {
      var active = container.querySelector('[data-play-idx="' + state.activeSvgIdx + '"]');
      if (active) active.classList.add(state.playing ? 'playing' : 'cued');
    }
  }

  function getStatus() {
    var total = state.noteEvents.length;
    var hasNotes = total > 0;
    var startMidi = hasNotes ? (state.noteEvents[0].pitchInt + state.baseOffset + state.transpose) : null;
    return {
      playing: state.playing,
      paused: state.paused,
      hasNotes: hasNotes,
      currentNoteIdx: state.currentNoteIdx,
      totalNotes: total,
      organ: state.organ,
      legato: state.legato,
      bpm: state.bpm,
      minBpm: MIN_BPM,
      maxBpm: MAX_BPM,
      reverb: state.reverb,
      minReverb: MIN_REVERB,
      maxReverb: MAX_REVERB,
      transpose: state.transpose,
      minTranspose: MIN_TRANSPOSE,
      maxTranspose: MAX_TRANSPOSE,
      startNoteName: startMidi !== null ? midiToName(startMidi) : '\u2013'
    };
  }

  function init(opts) {
    opts = opts || {};
    if (typeof opts.transpose === 'number') state.transpose = clampTranspose(opts.transpose);
    if (typeof opts.organ === 'string') state.organ = validOrgan(opts.organ);
    if (typeof opts.legato === 'boolean') state.legato = opts.legato;
    if (typeof opts.bpm === 'number') state.bpm = clampBpm(opts.bpm);
    if (typeof opts.reverb === 'number') state.reverb = clampReverb(opts.reverb);
    if (typeof opts.onChange === 'function') state.onChange = opts.onChange;
    notify();
  }

  return {
    init: init,
    loadScore: loadScore,
    bindSvg: bindSvg,
    play: play,
    pause: pause,
    stop: stop,
    toggle: toggle,
    seekToNote: seekToNote,
    setOrgan: setOrgan,
    setLegato: setLegato,
    setBpm: setBpm,
    setReverb: setReverb,
    setTranspose: setTranspose,
    shiftPitch: shiftPitch,
    resetPitch: resetPitch,
    getStatus: getStatus
  };
})();
