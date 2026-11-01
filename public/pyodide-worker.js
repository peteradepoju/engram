/* Module worker: runs Python (Pyodide) off the main thread so the page never freezes.
   The page terminates this worker to stop an endless loop. Each lesson page has its own
   namespace ("scope"), so cells on a page share variables like a notebook. */
const INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let pyodide = null;
let ready = null;
const scopes = new Map();

const FIG_CAPTURE = `
def __engram_figs():
    import sys
    if "matplotlib" not in sys.modules:
        return []
    import io, base64
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        fig = plt.figure(n)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
`;

function boot() {
  if (ready) return ready;
  ready = (async () => {
    const { loadPyodide } = await import(INDEX_URL + "pyodide.mjs");
    pyodide = await loadPyodide({ indexURL: INDEX_URL });
    pyodide.runPython("import os; os.environ['MPLBACKEND'] = 'AGG'");
    pyodide.runPython(FIG_CAPTURE);
    postMessage({ type: "ready", version: pyodide.version });
  })();
  return ready;
}

function scope(name) {
  if (!scopes.has(name)) {
    const ns = pyodide.globals.get("dict")();
    ns.set("__name__", "__main__");
    scopes.set(name, ns);
  }
  return scopes.get(name);
}

// Runs are handled one at a time, in order: output and namespaces must not interleave.
let queue = Promise.resolve();
self.onmessage = (e) => { queue = queue.then(() => handle(e.data)); };

async function handle(m) {
  try {
    await boot();
  } catch (err) {
    ready = null;
    postMessage({ type: "boot-error", error: String(err) });
    if (m.id) postMessage({ id: m.id, type: "done", ok: false, error: "Python could not start: " + String(err), figs: [], results: null });
    return;
  }
  try {
    if (m.type === "boot") return;
    if (m.type === "reset") { scopes.delete(m.scope); postMessage({ id: m.id, type: "done", ok: true }); return; }

    const emit = (stream) => (text) => postMessage({ id: m.id, type: "out", stream, text });
    pyodide.setStdout({ batched: emit("stdout") });
    pyodide.setStderr({ batched: emit("stderr") });

    const all = [m.code, m.tests || ""].join("\n");
    await pyodide.loadPackagesFromImports(all, { messageCallback: () => {} });

    const ns = scope(m.scope || "default");
    let value = null;
    let error = null;
    try {
      const r = await pyodide.runPythonAsync(m.code, { globals: ns });
      if (r !== undefined && r !== null && m.showValue) value = String(r);
      if (r && r.destroy) r.destroy();
    } catch (err) {
      error = cleanError(String(err));
    }

    // Checks run after the learner's code, in the same namespace. Each test_ function is one check.
    let results = null;
    if (m.tests && !error) {
      ns.set("__engram_tests_src", m.tests);
      const py = `
def __engram_run_tests():
    import traceback
    _ns = {}
    _ns.update(globals())
    exec(compile(__engram_tests_src, "<checks>", "exec"), _ns)
    out = []
    for name, fn in list(_ns.items()):
        if name.startswith("test_") and callable(fn) and getattr(getattr(fn, "__code__", None), "co_filename", "") == "<checks>":
            doc = (fn.__doc__ or name[5:].replace("_", " ")).strip()
            try:
                fn()
                out.append((doc, True, ""))
            except AssertionError as ex:
                out.append((doc, False, str(ex) or "Not quite yet."))
            except Exception as ex:
                out.append((doc, False, f"{type(ex).__name__}: {ex}"))
    return out
__engram_run_tests()
`;
      try {
        const r = await pyodide.runPythonAsync(py, { globals: ns });
        results = r.toJs().map(([name, ok, msg]) => ({ name, ok, msg }));
        r.destroy();
      } catch (err) {
        results = [{ name: "checks", ok: false, msg: cleanError(String(err)) }];
      }
    }

    // stdout is block-buffered in Pyodide: flush now so output reaches this cell, not the next one.
    try { pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()"); } catch (_) {}
    const figsProxy = pyodide.globals.get("__engram_figs")();
    const figs = figsProxy.toJs();
    figsProxy.destroy();
    postMessage({ id: m.id, type: "done", ok: !error, error, value, figs, results });
  } catch (err) {
    postMessage({ id: m.id, type: "done", ok: false, error: cleanError(String(err)), figs: [], results: null });
  }
}

function cleanError(s) {
  // Drop Pyodide's internal frames and keep the part that matters to a learner.
  const lines = s.split("\n");
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  const kept = start >= 0 ? lines.slice(start) : lines;
  return kept.filter((l) => !l.includes("/lib/python3")).join("\n").trim();
}
