/* ds-loader.js — namespace bootstrap for specimen cards & UI kits.
   Prefers the compiled _ds_bundle.js; if absent (project not yet marked
   as a Design System), compiles the component .jsx sources in-browser.
   Exposes window.__dsReady: Promise<namespace>. Load AFTER React + Babel. */
(function () {
  var FILES = [
    "components/icons/Icon.jsx",
    "components/actions/Button.jsx",
    "components/forms/Input.jsx",
    "components/forms/ConsentCheckbox.jsx",
    "components/quiz/OptionCard.jsx",
    "components/quiz/ProgressBar.jsx",
    "components/journey/StepTimeline.jsx",
    "components/journey/StatusChip.jsx",
    "components/journey/SupplyMeter.jsx",
    "components/journey/TrendChart.jsx",
    "components/journey/PhotoCompare.jsx",
    "components/commerce/PlanCard.jsx",
    "components/commerce/PriceAnchorCard.jsx",
    "components/commerce/OrderCard.jsx",
    "components/commerce/TierCard.jsx",
    "components/commerce/MedicationCard.jsx",
    "components/trust/DoctorCard.jsx",
    "components/trust/TrustBar.jsx",
    "components/content/FAQAccordion.jsx",
    "components/content/ArticleCard.jsx",
    "components/content/Footer.jsx",
    "components/content/Testimonials.jsx",
    "components/messaging/MessageBubble.jsx",
    "ui_kits/dara-web/HomeScreen.jsx",
    "ui_kits/dara-web/HeroAnimation.jsx",
    "ui_kits/dara-web/HomeDesktop.jsx",
    "ui_kits/dara-web/LandingBeratDesktop.jsx",
    "ui_kits/dara-web/QuizFlow.jsx",
    "ui_kits/dara-web/PlanReveal.jsx",
    "ui_kits/dara-web/CheckoutScreen.jsx",
    "ui_kits/dara-web/PortalDashboard.jsx",
    "ui_kits/dara-web/TriageFlow.jsx",
    "ui_kits/dara-web/InjectionGuide.jsx",
    "ui_kits/dara-web/LandingBeratBadan.jsx",
    "ui_kits/dara-web/LandingPilKB.jsx",
    "ui_kits/dara-web/ArticlePage.jsx",
    "ui_kits/dara-web/PlanRevealKB.jsx",
    "ui_kits/dara-web/PortalKB.jsx",
    "ui_kits/dara-web/StatusStates.jsx",
    "ui_kits/dara-web/LandingKulit.jsx",
    "ui_kits/dara-web/LandingRambut.jsx",
    "ui_kits/dara-web/LandingMental.jsx",
    "ui_kits/dara-web/QuizMental.jsx",
    "ui_kits/dara-web/PortalSkinHair.jsx",
    "ui_kits/dara-web/PortalMental.jsx",
    "ui_kits/dara-web/QuizDerm.jsx",
    "ui_kits/dara-web/PlanRevealDerm.jsx",
    "ui_kits/dara-web/PlanRevealMental.jsx",
    "ui_kits/dara-admin/AdminConsults.jsx"
  ];

  var script = document.currentScript;
  var ROOT = script.src.slice(0, script.src.lastIndexOf("/") + 1);

  function findNS() {
    var names = Object.getOwnPropertyNames(window);
    for (var i = 0; i < names.length; i++) {
      try {
        var v = window[names[i]];
        if (v && typeof v === "object" && v.Button && v.OptionCard && v.PlanCard) return v;
      } catch (e) {}
    }
    return null;
  }

  function normalize(base, rel) {
    if (rel.charAt(0) !== ".") return rel;
    var parts = base.split("/").slice(0, -1).concat(rel.split("/"));
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === "." || p === "") continue;
      if (p === "..") out.pop();
      else out.push(p);
    }
    return out.join("/");
  }

  function compileAll() {
    var sources = {};
    return Promise.all(
      FILES.map(function (f) {
        return fetch(ROOT + f).then(function (r) {
          if (!r.ok) throw new Error("fetch failed: " + f);
          return r.text().then(function (t) { sources[f] = t; });
        });
      })
    ).then(function () {
      var registry = {};
      function evaluate(path) {
        if (registry[path]) return registry[path].exports;
        var code = Babel.transform(sources[path], {
          presets: [["react", { runtime: "classic" }], ["env", { modules: "commonjs" }]],
        }).code;
        var module = { exports: {} };
        registry[path] = module;
        var req = function (rel) {
          if (rel === "react") return window.React;
          if (rel === "react-dom") return window.ReactDOM;
          var target = normalize(path, rel);
          if (!(target in sources)) throw new Error("Unknown module: " + rel + " from " + path);
          return evaluate(target);
        };
        new Function("require", "module", "exports", code)(req, module, module.exports);
        return module.exports;
      }
      var ns = {};
      FILES.forEach(function (f) {
        var ex = evaluate(f);
        Object.keys(ex).forEach(function (k) {
          if (/^[A-Z]/.test(k)) ns[k] = ex[k];
        });
      });
      window.DaraDS = ns;
      return ns;
    });
  }

  window.__dsReady = new Promise(function (resolve, reject) {
    var existing = findNS();
    if (existing) return resolve(existing);
    fetch(ROOT + "_ds_bundle.js", { method: "HEAD" }).then(function (r) {
      var type = (r.headers.get("content-type") || "").toLowerCase();
      if (!r.ok || type.indexOf("javascript") === -1) throw new Error("no bundle");
      var s = document.createElement("script");
      s.src = ROOT + "_ds_bundle.js";
      s.onload = function () {
        var ns = findNS();
        if (ns) resolve(ns);
        else compileAll().then(resolve, reject);
      };
      s.onerror = function () {
        s.remove();
        compileAll().then(resolve, reject);
      };
      document.head.appendChild(s);
    }).catch(function () {
      compileAll().then(resolve, reject);
    });
  });

  /* Classic-runtime preset for inline <script type="text/babel" data-presets="react-classic"> blocks
     (default automatic runtime emits import "react/jsx-runtime", which can't run inline). */
  if (window.Babel && Babel.registerPreset) {
    Babel.registerPreset("react-classic", {
      presets: [[Babel.availablePresets.react, { runtime: "classic" }]],
    });
  }
})();
