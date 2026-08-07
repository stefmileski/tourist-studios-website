// Prism Lens FX – ExtendScript v2
// Uses the QE (Quick Edit) DOM to ADD effects, standard API to SET properties.
// app.enableQE() exposes the global `qe` object which has addVideoEffect().

try { app.enableQE(); } catch (e) {}

// ─── Effect names for QE DOM (display names as shown in Effects panel) ─────
var QE_FX = {
    lumetri:     "Lumetri Color",
    gaussBlur:   "Gaussian Blur",
    channelBlur: "Channel Blur",
    lensFlare:   "Lens Flare",
    mirror:      "Mirror",
    sharpen:     "Sharpen",
    ripple:      "Ripple"
};

// ─── Match names for the standard components API lookup ───────────────────
var MATCH = {
    lumetri:     "AE.Lumetri",
    gaussBlur:   "AE.ADBE Gaussian Blur 2",
    channelBlur: "AE.ADBE ChnlBlur",
    lensFlare:   "AE.ADBE Lens Flare Smooth",
    mirror:      "AE.ADBE Mirror",
    sharpen:     "AE.ADBE Sharpen",
    ripple:      "AE.ADBE Ripple"
};

// ─── Standard API helpers ─────────────────────────────────────────────────

function getSelectedClips() {
    if (!app.project || !app.project.activeSequence) {
        return { error: "No active sequence. Open a sequence first." };
    }
    var sel = app.project.activeSequence.getSelection();
    if (!sel || sel.length === 0) {
        return { error: "No clips selected. Select clips in the timeline first." };
    }
    return { clips: sel };
}

// Find a component on a TrackItem by its match name.
function findComp(clip, matchName) {
    try {
        var comps = clip.components;
        for (var i = 0; i < comps.numItems; i++) {
            if (comps[i].matchName === matchName) return comps[i];
        }
    } catch (e) {}
    return null;
}

// Recursive search for a property by displayName (handles Lumetri's nested groups).
function findProp(collection, name) {
    if (!collection) return null;
    try {
        for (var i = 0; i < collection.numItems; i++) {
            var p = collection[i];
            if (!p) continue;
            if (p.displayName === name) return p;
            if (p.properties && p.properties.numItems > 0) {
                var sub = findProp(p.properties, name);
                if (sub) return sub;
            }
        }
    } catch (e) {}
    return null;
}

function setCompProp(comp, propName, value) {
    if (!comp) return false;
    try {
        var prop = findProp(comp.properties, propName);
        if (prop) { prop.setValue(value, true); return true; }
    } catch (e) {}
    return false;
}

// ─── QE DOM helpers ───────────────────────────────────────────────────────

// Walk a QE track and return the nth real clip, skipping gap items.
// QE tracks include gap clips (empty items); the standard API's clips[] does not.
// Gaps have no name, so we skip nameless items to align indices.
function getQEClipByRealIndex(qtrack, realIndex) {
    var realIdx = 0;
    for (var qi = 0; qi < qtrack.numItems; qi++) {
        var candidate = qtrack.getItemAt(qi);
        var candName = "";
        try { candName = candidate.name; } catch (e) {}
        if (candName !== "" && candName !== null && candName !== undefined) {
            if (realIdx === realIndex) return candidate;
            realIdx++;
        }
    }
    return null;
}

// Add an effect to every selected video clip via QE DOM.
// Uses standard API to find track+clip index, then name-walks the QE track to
// skip gap items and land on the correct QE clip (fixes the 67 vs 72 count mismatch).
function qeAddToAllSelected(displayName) {
    var added = 0;
    try {
        var qseq   = qe.project.getActiveSequence();
        var effect = qe.project.getVideoEffectByName(displayName);
        if (!qseq || !effect) return 0;

        var sel    = app.project.activeSequence.getSelection();
        var tracks = app.project.activeSequence.videoTracks;
        if (!sel || sel.length === 0) return 0;

        // Build lookup of selected clip times from the standard API
        var selSet = [];
        for (var s = 0; s < sel.length; s++) {
            try { selSet.push({ st: sel[s].start.seconds, en: sel[s].end.seconds }); }
            catch (e) {}
        }

        // Walk standard video tracks; find selected clips; apply via QE
        for (var t = 0; t < tracks.numTracks; t++) {
            var stdTrack = tracks[t];
            for (var c = 0; c < stdTrack.clips.numItems; c++) {
                var stdClip = stdTrack.clips[c];
                var hit = false;
                try {
                    var cst = stdClip.start.seconds, cen = stdClip.end.seconds;
                    for (var si = 0; si < selSet.length; si++) {
                        if (Math.abs(cst - selSet[si].st) < 0.001 &&
                            Math.abs(cen - selSet[si].en) < 0.001) { hit = true; break; }
                    }
                } catch (e) {}

                if (hit) {
                    try {
                        var qtrack = qseq.getVideoTrackAt(t);
                        // Skip gap items when counting — QE index != standard index
                        var qclip = getQEClipByRealIndex(qtrack, c);
                        if (qclip) { qclip.addVideoEffect(effect); added++; }
                    } catch (e) {}
                }
            }
        }
    } catch (e) {}
    return added;
}

// Ensure an effect exists on a standard clip.
// If missing, adds it via QE (once for all selected), then re-fetches via standard API.
function ensureEffect(stdClip, matchName, displayName) {
    var comp = findComp(stdClip, matchName);
    if (!comp) {
        qeAddToAllSelected(displayName);
        comp = findComp(stdClip, matchName);
    }
    return comp; // may still be null if QE failed
}

// ─── Per-effect helpers ───────────────────────────────────────────────────

function applyLumetri(clip, s) {
    var c = ensureEffect(clip, MATCH.lumetri, QE_FX.lumetri);
    if (!c) return false;
    if (s.temperature !== undefined) setCompProp(c, "Temperature",  s.temperature);
    if (s.tint        !== undefined) setCompProp(c, "Tint",         s.tint);
    if (s.exposure    !== undefined) setCompProp(c, "Exposure",      s.exposure);
    if (s.contrast    !== undefined) setCompProp(c, "Contrast",      s.contrast);
    if (s.highlights  !== undefined) setCompProp(c, "Highlights",    s.highlights);
    if (s.shadows     !== undefined) setCompProp(c, "Shadows",       s.shadows);
    if (s.whites      !== undefined) setCompProp(c, "Whites",        s.whites);
    if (s.blacks      !== undefined) setCompProp(c, "Blacks",        s.blacks);
    if (s.saturation  !== undefined) setCompProp(c, "Saturation",    s.saturation);
    if (s.vibrance    !== undefined) setCompProp(c, "Vibrance",      s.vibrance);
    if (s.vignette    !== undefined) setCompProp(c, "Amount",        s.vignette);
    if (s.vigMidpoint !== undefined) setCompProp(c, "Midpoint",      s.vigMidpoint);
    if (s.vigRoundness!== undefined) setCompProp(c, "Roundness",     s.vigRoundness);
    if (s.vigFeather  !== undefined) setCompProp(c, "Feather",       s.vigFeather);
    return true;
}

function applyGaussBlur(clip, amount) {
    var c = ensureEffect(clip, MATCH.gaussBlur, QE_FX.gaussBlur);
    if (!c) return false;
    setCompProp(c, "Blurriness", amount);
    setCompProp(c, "Repeat Edge Pixels", 1);
    return true;
}

function applyChannelBlur(clip, redAmt, blueAmt) {
    var c = ensureEffect(clip, MATCH.channelBlur, QE_FX.channelBlur);
    if (!c) return false;
    setCompProp(c, "Red Blurriness",   redAmt);
    setCompProp(c, "Blue Blurriness",  blueAmt);
    setCompProp(c, "Green Blurriness", 0);
    setCompProp(c, "Edge Behavior",    1);
    return true;
}

function applyLensFlare(clip, lensType, brightness) {
    var c = ensureEffect(clip, MATCH.lensFlare, QE_FX.lensFlare);
    if (!c) return false;
    setCompProp(c, "Lens Type",        lensType);
    setCompProp(c, "Flare Brightness", brightness);
    return true;
}

// ─── Effect recipes ───────────────────────────────────────────────────────

function applyDreamFX(clip, n) {
    applyGaussBlur(clip, n * 12);
    applyLumetri(clip, { exposure: 0.2*n, contrast: -15*n, highlights: -10*n,
        shadows: 20*n, temperature: 8*n, saturation: 90 + 10*n });
    return "Dream FX";
}

function applyCineSoftFX(clip, n) {
    applyGaussBlur(clip, n * 6);
    applyLumetri(clip, { contrast: -8*n, highlights: -5*n, shadows: 5*n, saturation: 95 });
    return "Cine Soft FX";
}

function applyNostalgiaFX(clip, n) {
    applyLumetri(clip, { exposure: -0.1*n, contrast: -20*n, highlights: -20*n,
        shadows: 30*n, temperature: 12*n, tint: 5*n,
        saturation: 80 - 10*n, vibrance: -15*n, vignette: -0.4*n });
    return "Nostalgia FX";
}

function applyMoodyFX(clip, n) {
    applyLumetri(clip, { exposure: -0.3*n, contrast: 25*n, highlights: -30*n,
        shadows: -15*n, blacks: -20*n, temperature: -10*n, tint: -5*n,
        saturation: 85, vignette: -0.6*n, vigFeather: 50 });
    return "Moody FX";
}

function applyRoseFX(clip, n) {
    applyLumetri(clip, { exposure: 0.1*n, contrast: -10*n, highlights: -5*n,
        shadows: 15*n, temperature: 18*n, tint: 10*n, saturation: 105, vibrance: 10*n });
    return "Rose FX";
}

function applyStarburstFX(clip, n) {
    applyLensFlare(clip, 0, 80 + n * 20);
    applyLumetri(clip, { highlights: 10*n, whites: 10*n });
    return "Starburst FX";
}

function applyFlareLight(clip, n) {
    applyLensFlare(clip, 1, 60 + n * 30);
    return "Flare FX";
}

function applySolarFlare(clip, n) {
    applyLensFlare(clip, 2, 75 + n * 25);
    applyLumetri(clip, { exposure: 0.3*n, highlights: 20*n, temperature: 15*n });
    return "Solar Flare FX";
}

function applyChromaticFlareFX(clip, n) {
    applyChannelBlur(clip, n * 8, n * 8);
    applyLensFlare(clip, 1, 55 + n * 20);
    return "Chromatic Flare FX";
}

function applyPrismFX(clip, n) {
    applyChannelBlur(clip, n * 5, n * 5);
    return "Linear Prism FX";
}

function applyHaloFX(clip, n) {
    applyGaussBlur(clip, n * 8);
    applyLumetri(clip, { highlights: 30*n, whites: 15*n, exposure: 0.1*n });
    return "Halo FX";
}

function applyRadiantFX(clip, n) {
    applyGaussBlur(clip, n * 15);
    applyLumetri(clip, { exposure: 0.15*n, highlights: 25*n, whites: 10*n });
    return "Radiant FX";
}

function applyVignetteFX(clip, n) {
    applyLumetri(clip, { vignette: -0.8*n, vigMidpoint: 40, vigRoundness: 0, vigFeather: 60 });
    return "Vignette FX";
}

function applyPinholeFX(clip, n) {
    applyLumetri(clip, { contrast: 20*n, highlights: -20*n, shadows: -10*n,
        blacks: -30*n, saturation: 80, vignette: -1.0*n,
        vigMidpoint: 25, vigRoundness: -50, vigFeather: 30 });
    return "Pinhole FX";
}

function applyGhostFX(clip, n) {
    applyGaussBlur(clip, n * 15);
    applyLumetri(clip, { exposure: -0.2*n, contrast: -20*n, shadows: 20*n,
        saturation: 70, vignette: -0.3*n });
    return "Ghost FX";
}

function applyKaleidoscopeFX(clip, n) {
    var c = ensureEffect(clip, MATCH.mirror, QE_FX.mirror);
    if (c) setCompProp(c, "Reflection Angle", 0);
    return "Kaleidoscope FX";
}

function applySplitDiopter(clip, n) {
    applyGaussBlur(clip, n * 20);
    return "Split Diopter FX";
}

function applyCrystalFX(clip, n) {
    applyChannelBlur(clip, n * 5, n * 5);
    var c = ensureEffect(clip, MATCH.sharpen, QE_FX.sharpen);
    if (c) setCompProp(c, "Sharpen Amount", n * 30);
    applyLumetri(clip, { contrast: 15*n, vibrance: 20*n, saturation: 110 });
    return "Crystal FX";
}

function applyWaterRippleFX(clip, n) {
    var c = ensureEffect(clip, MATCH.ripple, QE_FX.ripple);
    if (c) {
        setCompProp(c, "Ripple Height", n * 10);
        setCompProp(c, "Ripple Width",  n * 40);
    }
    return "Ripple FX";
}

function removeAllFX(clip) {
    try {
        var comps = clip.components;
        var indices = [];
        for (var i = 0; i < comps.numItems; i++) {
            var mn = comps[i].matchName;
            for (var key in MATCH) {
                if (MATCH.hasOwnProperty(key) && MATCH[key] === mn) {
                    indices.push(i); break;
                }
            }
        }
        for (var j = indices.length - 1; j >= 0; j--) {
            try { comps[indices[j]].remove(); } catch (e) {}
        }
    } catch (e) {}
    return "Removed FX";
}

// ─── Diagnostic ──────────────────────────────────────────────────────────

function runDiagnostic() {
    var lines = [];
    function log(msg) { lines.push(msg); }

    // 1. App
    try { log("app: " + (typeof app !== "undefined" ? "OK" : "MISSING")); }
    catch(e) { log("app: ERROR " + e.message); }

    // 2. Active sequence
    try {
        var seq = app.project.activeSequence;
        log("activeSequence: " + (seq ? seq.name : "NULL"));
    } catch(e) { log("activeSequence: ERROR " + e.message); }

    // 3. Selection
    try {
        var sel = app.project.activeSequence.getSelection();
        log("selection: " + (sel ? sel.length + " clips" : "NULL"));
        if (sel && sel.length > 0) {
            log("clip[0].matchName: " + (sel[0].matchName || "N/A"));
            log("clip[0].type: " + sel[0].type);
            var comps = sel[0].components;
            log("clip[0].components: " + (comps ? comps.numItems : "NULL"));
        }
    } catch(e) { log("selection: ERROR " + e.message); }

    // 4. enableQE
    try { app.enableQE(); log("enableQE: OK"); }
    catch(e) { log("enableQE: ERROR " + e.message); }

    // 5. qe global
    try { log("qe global: " + (typeof qe !== "undefined" ? "OK" : "MISSING")); }
    catch(e) { log("qe: ERROR " + e.message); }

    // 6. qe.project
    try { log("qe.project: " + (qe.project ? "OK" : "NULL")); }
    catch(e) { log("qe.project: ERROR " + e.message); }

    // 7. getActiveSequence via QE
    try {
        var qseq = qe.project.getActiveSequence();
        log("qe.getActiveSequence: " + (qseq ? "OK" : "NULL"));
        if (qseq) {
            log("numVideoTracks: " + qseq.numVideoTracks);
            if (qseq.numVideoTracks > 0) {
                var trk = qseq.getVideoTrackAt(0);
                log("track[0]: " + (trk ? "OK" : "NULL"));
                if (trk) {
                    log("track.numItems: " + trk.numItems);
                    if (trk.numItems > 0) {
                        var qitem = trk.getItemAt(0);
                        log("qitem[0]: " + (qitem ? "OK" : "NULL"));
                        if (qitem) {
                            log("qitem.isSelected: " + (typeof qitem.isSelected));
                            try { log("qitem.isSelected(): " + qitem.isSelected()); }
                            catch(e2) { log("qitem.isSelected(): ERROR " + e2.message); }
                            log("qitem.addVideoEffect: " + (typeof qitem.addVideoEffect));
                            // Probe time properties so we can match to standard clips
                            var tProps = ["start","end","duration","inPoint","outPoint","startTime","endTime","sequenceStart"];
                            for (var tp = 0; tp < tProps.length; tp++) {
                                try {
                                    var tv = qitem[tProps[tp]];
                                    if (tv !== undefined && tv !== null) {
                                        var ts = (typeof tv === "object") ?
                                            "obj{seconds=" + tv.seconds + "}" : String(tv);
                                        log("qitem." + tProps[tp] + ": " + ts);
                                    }
                                } catch(e3) {}
                            }
                        }
                    }
                }
            }
        }
    } catch(e) { log("qe.getActiveSequence: ERROR " + e.message); }

    // 8. getVideoEffectByName
    try {
        var fx = qe.project.getVideoEffectByName("Gaussian Blur");
        log("getVideoEffectByName('Gaussian Blur'): " + (fx ? "OK" : "NULL - effect not found"));
    } catch(e) { log("getVideoEffectByName: ERROR " + e.message); }

    // 9. Probe qitem name + ticks to detect gap vs real clip
    try {
        log("qitem.name: " + qitem.name);
        try { log("qitem.start.ticks: " + qitem.start.ticks); } catch(e) {}
        try { log("String(qitem.start): " + String(qitem.start)); } catch(e) {}
    } catch(e) { log("qitem name/ticks probe: ERROR " + e.message); }

    // 10. Standard API indexing + before/after components test
    try {
        var trks  = app.project.activeSequence.videoTracks;
        var trks3 = trks;
        var sel3  = app.project.activeSequence.getSelection();
        var qseq3 = qe.project.getActiveSequence();
        var gauss3= qe.project.getVideoEffectByName("Gaussian Blur");

        log("videoTracks.numTracks: " + trks3.numTracks);
        var trk0 = trks3[0];
        log("videoTracks[0]: " + (trk0 ? "OK" : "NULL"));
        if (trk0) {
            log("clips.numItems: " + trk0.clips.numItems);
            var c0 = trk0.clips[0];
            if (c0) { log("clips[0].start.seconds: " + c0.start.seconds); }
        }

        var selSet3 = [];
        for (var si3 = 0; si3 < sel3.length; si3++) {
            try { selSet3.push({ st: sel3[si3].start.seconds, en: sel3[si3].end.seconds }); }
            catch(e) {}
        }
        log("selSet built: " + selSet3.length + " entries");

        var matchCount = 0;
        for (var t3 = 0; t3 < trks3.numTracks; t3++) {
            var stdTrk3 = trks3[t3];
            for (var c3 = 0; c3 < stdTrk3.clips.numItems; c3++) {
                var stdC3 = stdTrk3.clips[c3];
                var hit3 = false;
                try {
                    var cst3 = stdC3.start.seconds, cen3 = stdC3.end.seconds;
                    for (var sx = 0; sx < selSet3.length; sx++) {
                        if (Math.abs(cst3 - selSet3[sx].st) < 0.001 &&
                            Math.abs(cen3 - selSet3[sx].en) < 0.001) { hit3 = true; break; }
                    }
                } catch(e) {}
                if (hit3) {
                    matchCount++;
                    log("MATCH track=" + t3 + " stdClip=" + c3 + " start=" + stdC3.start.seconds.toFixed(3));

                    // Count components before
                    var compsBefore = 0;
                    try { compsBefore = stdC3.components.numItems; } catch(e) {}
                    log("  components before: " + compsBefore);

                    // Walk QE items on same track, counting only real clips (non-gap)
                    // to find the QE item whose non-gap index == c3
                    try {
                        var qtrk3 = qseq3.getVideoTrackAt(t3);
                        var realIdx = 0;
                        var qclp3 = null;
                        for (var qi = 0; qi < qtrk3.numItems; qi++) {
                            var candidate = qtrk3.getItemAt(qi);
                            var candName = "";
                            try { candName = candidate.name; } catch(e) {}
                            // Gap clips typically have no name or a name matching "[Video]"
                            if (candName !== "" && candName !== null && candName !== undefined) {
                                if (realIdx === c3) { qclp3 = candidate; break; }
                                realIdx++;
                            }
                        }
                        log("  QE real-clip idx walked to: " + realIdx + " (qclp found=" + !!qclp3 + ")");
                        if (qclp3 && gauss3) {
                            var ret = qclp3.addVideoEffect(gauss3);
                            log("  addVideoEffect returned: " + ret);
                            // Check components after
                            var compsAfter = 0;
                            try { compsAfter = stdC3.components.numItems; } catch(e) {}
                            log("  components after: " + compsAfter);
                            log("  effect actually added: " + (compsAfter > compsBefore));
                        }
                    } catch(e) { log("  QE walk ERROR: " + e.message); }
                }
            }
        }
        log("Total matches: " + matchCount);
    } catch(e) { log("full match test: ERROR " + e.message); }

    // 11. Component + property inspector — shows real match names & prop names
    try {
        var inspSel = app.project.activeSequence.getSelection();
        if (inspSel && inspSel.length > 0) {
            var inspClip = inspSel[0];

            // Add Gaussian Blur + Lumetri via QE so we can inspect them
            qeAddToAllSelected("Gaussian Blur");
            qeAddToAllSelected("Lumetri Color");

            var comps = inspClip.components;
            log("--- Components on clip[0] (" + comps.numItems + " total) ---");
            for (var ci = 0; ci < comps.numItems; ci++) {
                var comp = comps[ci];
                log("comp[" + ci + "] matchName='" + comp.matchName + "' display='" + comp.displayName + "'");

                // Dump first 8 properties of each effect component
                try {
                    var cprops = comp.properties;
                    for (var pi = 0; pi < Math.min(cprops.numItems, 8); pi++) {
                        var cp = cprops[pi];
                        var cpVal = "";
                        try { cpVal = cp.getValue(); } catch(e) {}
                        log("  prop[" + pi + "] '" + cp.displayName + "' = " + cpVal);
                    }
                } catch(e) {}
            }
        }
    } catch(e) { log("component inspector: ERROR " + e.message); }

    return JSON.stringify({ success: true, message: lines.join("\n") });
}

// ─── Dispatch ─────────────────────────────────────────────────────────────

function applyEffect(effectId, intensityRaw) {
    var n = parseFloat(intensityRaw) || 0.7;
    var result = getSelectedClips();
    if (result.error) return JSON.stringify({ success: false, message: result.error });

    var clips = result.clips;
    var label = "";

    for (var i = 0; i < clips.length; i++) {
        var clip = clips[i];
        if (!clip) continue;
        // Skip pure audio clips
        try { if (clip.type === 2) continue; } catch (e) {}

        switch (effectId) {
            case "dream":          label = applyDreamFX(clip, n);         break;
            case "cinesoft":       label = applyCineSoftFX(clip, n);      break;
            case "nostalgia":      label = applyNostalgiaFX(clip, n);     break;
            case "moody":          label = applyMoodyFX(clip, n);         break;
            case "rose":           label = applyRoseFX(clip, n);          break;
            case "starburst":      label = applyStarburstFX(clip, n);     break;
            case "flare":          label = applyFlareLight(clip, n);      break;
            case "solarflare":     label = applySolarFlare(clip, n);      break;
            case "chromaticflare": label = applyChromaticFlareFX(clip, n);break;
            case "prism":          label = applyPrismFX(clip, n);         break;
            case "halo":           label = applyHaloFX(clip, n);          break;
            case "radiant":        label = applyRadiantFX(clip, n);       break;
            case "vignette":       label = applyVignetteFX(clip, n);      break;
            case "pinhole":        label = applyPinholeFX(clip, n);       break;
            case "ghost":          label = applyGhostFX(clip, n);         break;
            case "kaleidoscope":   label = applyKaleidoscopeFX(clip, n);  break;
            case "splitdiopter":   label = applySplitDiopter(clip, n);    break;
            case "crystal":        label = applyCrystalFX(clip, n);       break;
            case "ripple":         label = applyWaterRippleFX(clip, n);   break;
            case "remove":         label = removeAllFX(clip);             break;
            case "diagnostic":     return runDiagnostic();
            default: label = "Unknown effect: " + effectId;
        }
    }

    var msg = label + " applied to " + clips.length + " clip(s)";
    return JSON.stringify({ success: true, message: msg });
}
