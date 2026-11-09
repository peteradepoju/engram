"""Builds a Colab notebook for every lesson from its code cells: public/notebooks/wNNN/dD.ipynb.
Exercises appear as starter code with the prompt and the checks, so they can be done in Colab too."""
import json, os, re, sys, textwrap
sys.path.insert(0, os.path.dirname(__file__))
from validate import cells, all_lessons, ROOT

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "notebooks")

def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": text}

def code(text):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": text.strip("\n")}

DATASET_CELL = """import os, urllib.request
def dataset(name):
    \"\"\"Downloads an Engram dataset the first time it is used and returns its local path.\"\"\"
    if not os.path.exists(name):
        urllib.request.urlretrieve("https://engram-neuroai.vercel.app/data/" + name, name)
    return name
"""

for lesson in all_lessons():
    src = open(os.path.join(ROOT, lesson[:4], lesson[4:] + ".mdx")).read()
    title = re.search(r'title: "([^"]+)"', src).group(1)
    w, d = int(lesson[1:4]), int(lesson[5])
    nb = [md(f"# Week {w}, Day {d}: {title}\n\nCompanion notebook for the Engram lesson at https://engram-neuroai.vercel.app/learn/{lesson[:4]}/{lesson[4:]}.\nRun the cells in order. Exercises have a checks cell after them: run it to test your answer.")]
    if "dataset(" in src:
        nb.append(md("This lesson uses a dataset from the Engram site. Run this cell first: it downloads the file once and defines `dataset()`."))
        nb.append(code(DATASET_CELL))
    for m in re.finditer(r"<PyCell(.*?)/>", src, re.S):
        attrs = m.group(1)
        props = {k: textwrap.dedent(v) for k, v in re.findall(r'(\w+)=\{String\.raw`(.*?)`\}', attrs, re.S)}
        t = re.search(r'title="([^"]+)"', attrs)
        p = re.search(r'prompt="([^"]+)"', attrs)
        if "tests" in props:
            nb.append(md(f"### Exercise: {t.group(1) if t else ''}\n\n{p.group(1) if p else ''}"))
            nb.append(code(props.get("code", "")))
            names = re.findall(r"def (test_\w+)", props["tests"])
            nb.append(code(props["tests"].strip("\n") + "\n\n" + "\n".join(f"{n}()" for n in names) + '\nprint("All checks passed")'))
        else:
            nb.append(code(props.get("code", "")))
    doc = {"cells": nb, "metadata": {"kernelspec": {"display_name": "Python 3", "name": "python3"}, "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 5}
    os.makedirs(os.path.join(OUT, lesson[:4]), exist_ok=True)
    json.dump(doc, open(os.path.join(OUT, lesson[:4], lesson[4:] + ".ipynb"), "w"), indent=1)
    print("wrote", lesson)
