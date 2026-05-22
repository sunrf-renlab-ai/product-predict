// Data shim — exposes the globals the prototype JSX expects (PROJECT, AGENTS,
// ACTIVITY, ISSUES, DELIGHTS, SENTIMENT_CURVE, ROUTES_HEAT, PAST_RUNS, RUN_META)
// sourced from window.__PP_RUN__ (a real run.json injected by report.ts).
//
// When __PP_RUN__ is null we fall back to a minimal placeholder so the viewer
// still renders an empty state instead of crashing.
(function () {
  var R = window.__PP_RUN__;
  if (!R) {
    window.PROJECT = { name: "(no run)", description: "Load a run.json to populate this view." };
    window.AGENTS = [];
    window.ACTIVITY = [];
    window.ISSUES = [];
    window.DELIGHTS = [];
    window.SENTIMENT_CURVE = [];
    window.ROUTES_HEAT = [];
    window.PAST_RUNS = [];
    window.RUN_META = null;
    return;
  }

  window.PROJECT = {
    name: R.target.title || R.target.url,
    org: hostOf(R.target.url),
    branch: "—",
    commit: shortId(R.id),
    stack: ["Web"],
    description: R.target.url,
    pages: countPages(R),
    components: 0,
    routes: (R.routesHeat || []).map(function (r) { return r.path; }),
  };

  window.AGENTS = R.agents || [];
  window.ACTIVITY = R.activity || [];
  window.ISSUES = R.issues || [];
  window.DELIGHTS = R.delights || [];
  window.FEATURES = R.features || [];
  window.SENTIMENT_CURVE = R.sentimentCurve || [];
  window.ROUTES_HEAT = R.routesHeat || [];
  // Single-run viewer — recent runs is just this one for now.
  window.PAST_RUNS = [{
    id: "r-" + shortId(R.id),
    name: R.target.title || R.target.url,
    branch: "—",
    commit: shortId(R.id),
    agents: (R.agents || []).length,
    status: "done",
    time: fmtRelative(R.finishedAt),
    score: R.metrics ? R.metrics.predictedNps : null,
  }];

  window.RUN_META = R;

  function hostOf(url) {
    try { return new URL(url).host; } catch { return "—"; }
  }
  function countPages(r) {
    var paths = new Set();
    (r.activity || []).forEach(function (e) {
      if (e.url) { try { paths.add(new URL(e.url).pathname); } catch {} }
    });
    return paths.size || (r.routesHeat || []).length;
  }
  function shortId(id) { return String(id || "").replace(/^run-/, ""); }
  function fmtRelative(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    var min = Math.round((Date.now() - d.getTime()) / 60000);
    if (min < 1) return "刚刚";
    if (min < 60) return min + " 分钟前";
    var hr = Math.round(min / 60);
    if (hr < 24) return hr + " 小时前";
    return Math.round(hr / 24) + " 天前";
  }
})();
