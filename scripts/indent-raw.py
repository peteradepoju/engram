"""Adds 2 spaces to every line of code inside String.raw props in the given lesson files.
MDX strips up to 2 leading spaces from those lines, so new lessons are written normally and then
run through this once. Usage: python3 scripts/indent-raw.py content/w003/d1.mdx ..."""
import re, sys
for f in sys.argv[1:]:
    s = open(f).read()
    def fix(m):
        lines = m.group(2).split("\n")
        return m.group(1) + "\n".join(("  " + l) if l.strip() else l for l in lines) + "`"
    s = re.sub(r"(String\.raw`)(.*?)`", fix, s, flags=re.S)
    open(f, "w").write(s)
    print("indented", f)
