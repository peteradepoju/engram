"""Checks every lesson's Python: plain cells must run, exercise solutions must pass their
tests, and exercise starters must not pass. Run: python3 scripts/validate.py [w001d1 ...]"""
import os, re, sys, tempfile, traceback, contextlib, io, textwrap

ROOT = os.path.join(os.path.dirname(__file__), "..", "content")
RAW = re.compile(r'(\w+)=\{String\.raw`(.*?)`\}', re.S)

def cells(src):
    for m in re.finditer(r"<PyCell(.*?)/>", src, re.S):
        props = {k: textwrap.dedent(v) for k, v in RAW.findall(m.group(1))}
        ident = re.search(r'\bid="([^"]+)"', m.group(1))
        yield ident.group(1) if ident else None, props

DATA = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "data"))
import builtins
builtins.dataset = lambda name: os.path.join(DATA, name)   # same helper the browser and Colab provide

def run_tests(ns, tests):
    exec(tests, ns)
    fails = []
    for name, fn in list(ns.items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
            except Exception as e:
                fails.append(f"{name}: {e}")
    for name in [n for n in ns if n.startswith("test_")]:
        del ns[name]
    return fails

def check(lesson):
    path = os.path.join(ROOT, lesson[:4], lesson[4:] + ".mdx")
    src = open(path).read()
    problems = []
    work = tempfile.mkdtemp()
    cwd = os.getcwd(); os.chdir(work)
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    ns = {"__name__": "__main__"}
    try:
        for i, (ident, p) in enumerate(cells(src)):
            label = ident or f"cell {i + 1}"
            code = p.get("code", "")
            tests = p.get("tests")
            sol = p.get("solution")
            out = io.StringIO()
            if tests:
                # The starter must not pass.
                trial = dict(ns)
                try:
                    with contextlib.redirect_stdout(out):
                        exec(code, trial)
                    if not run_tests(trial, tests):
                        problems.append(f"{label}: starter code already passes the tests")
                except Exception:
                    pass
                if not sol:
                    problems.append(f"{label}: exercise has no solution")
                    continue
                try:
                    with contextlib.redirect_stdout(out):
                        exec(sol, ns)
                    fails = run_tests(ns, tests)
                    if fails:
                        problems.append(f"{label}: solution fails: {fails}")
                except Exception:
                    problems.append(f"{label}: solution errors:\n{traceback.format_exc(limit=2)}")
            else:
                try:
                    with contextlib.redirect_stdout(out):
                        exec(code, ns)
                except Exception:
                    problems.append(f"{label}: cell errors:\n{traceback.format_exc(limit=2)}")
            plt.close("all")
    finally:
        os.chdir(cwd)
    return problems

def all_lessons():
    for w in sorted(d for d in os.listdir(ROOT) if re.fullmatch(r"w\d{3}", d)):
        for f in sorted(os.listdir(os.path.join(ROOT, w))):
            if re.fullmatch(r"d[1-6]\.mdx", f):
                yield w + f[:2]

if __name__ == "__main__":
    targets = sys.argv[1:] or list(all_lessons())
    bad = 0
    for t in targets:
        probs = check(t)
        print(("OK  " if not probs else "FAIL") + " " + t)
        for p in probs:
            print("     " + p); bad += 1
        # Style rule: no em dashes in lesson text.
        text = open(os.path.join(ROOT, t[:4], t[4:] + ".mdx")).read()
        if "—" in text:
            print("     contains an em dash"); bad += 1
    sys.exit(1 if bad else 0)
