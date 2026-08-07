// Prism Lens FX – Panel JS
// Handles UI interactions and bridges to ExtendScript via CSInterface

(function () {
  "use strict";

  // ── CSInterface setup ──────────────────────────────────────────────────────
  // CSInterface is injected by the CEP runtime; in browser preview it's absent.
  var cs = (typeof CSInterface !== "undefined") ? new CSInterface() : null;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  var intensitySlider = document.getElementById("intensity");
  var intensityLabel  = document.getElementById("intensityLabel");
  var statusEl        = document.getElementById("status");
  var removeBtn       = document.getElementById("removeBtn");

  // ── Intensity ──────────────────────────────────────────────────────────────
  var INTENSITY_MAP = { "1": 0.4, "2": 0.7, "3": 1.0 };
  var INTENSITY_LABELS = { "1": "Subtle", "2": "Medium", "3": "Strong" };

  intensitySlider.addEventListener("input", function () {
    intensityLabel.textContent = INTENSITY_LABELS[this.value];
  });

  function getIntensity() {
    return INTENSITY_MAP[intensitySlider.value] || 0.7;
  }

  // ── Status display ─────────────────────────────────────────────────────────
  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = type || "";
    if (type === "success" || type === "info") {
      setTimeout(function () {
        statusEl.textContent = "Select clips in timeline, then click an effect.";
        statusEl.className = "";
      }, 4000);
    }
  }

  // ── ExtendScript bridge ────────────────────────────────────────────────────
  function runEffect(effectId) {
    var intensity = getIntensity();

    if (!cs) {
      // Browser preview mode – show what would be called
      setStatus("[Preview] Would apply: " + effectId + " @ intensity " + intensity, "info");
      return;
    }

    var script = 'applyEffect("' + effectId + '", ' + intensity + ')';
    setStatus("Applying " + effectId + "…", "info");

    cs.evalScript(script, function (result) {
      try {
        var parsed = JSON.parse(result);
        if (parsed.success) {
          setStatus(parsed.message, "success");
        } else {
          setStatus(parsed.message || "Error applying effect.", "error");
        }
      } catch (e) {
        // evalScript returned a raw string (older CEP versions)
        setStatus(result || "Effect applied.", "success");
      }
    });
  }

  // ── Tab switching ──────────────────────────────────────────────────────────
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = this.dataset.tab;

      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      document.querySelectorAll(".section").forEach(function (s) { s.classList.remove("active"); });

      this.classList.add("active");
      var section = document.getElementById("tab-" + target);
      if (section) section.classList.add("active");
    });
  });

  // ── Effect buttons ─────────────────────────────────────────────────────────
  document.querySelectorAll(".fx-btn[data-effect]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var effectId = this.dataset.effect;
      runEffect(effectId);

      // Visual feedback
      var self = this;
      self.classList.add("applied");
      setTimeout(function () { self.classList.remove("applied"); }, 600);
    });
  });

  // ── Remove button ──────────────────────────────────────────────────────────
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      runEffect("remove");
    });
  }

  // ── Diagnostic button ──────────────────────────────────────────────────────
  var diagBtn = document.getElementById("diagBtn");
  var diagOut = document.getElementById("diagOut");
  if (diagBtn) {
    diagBtn.addEventListener("click", function () {
      setStatus("Running diagnostic…", "info");
      if (!cs) {
        diagOut.textContent = "[Browser preview — connect to Premiere Pro to run diagnostic]";
        diagOut.style.display = "block";
        return;
      }
      cs.evalScript('applyEffect("diagnostic", 0)', function (result) {
        try {
          var parsed = JSON.parse(result);
          diagOut.textContent = parsed.message;
          diagOut.style.display = "block";
          setStatus("Diagnostic complete — see results above", "info");
        } catch (e) {
          diagOut.textContent = result;
          diagOut.style.display = "block";
          setStatus("Diagnostic done", "info");
        }
      });
    });
  }

  // ── Theme sync with Premiere Pro ───────────────────────────────────────────
  if (cs) {
    cs.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, function () {
      var appSkinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      var panelBg = appSkinInfo.panelBackgroundColor.color;
      document.body.style.background =
        "rgb(" + panelBg.red + "," + panelBg.green + "," + panelBg.blue + ")";
    });
  }

})();
