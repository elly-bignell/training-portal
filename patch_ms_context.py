import pathlib, subprocess

path = pathlib.Path.home() / "training-portal" / "app" / "call-flowchart" / "page.tsx"
src = path.read_text()

old = "We're a digital marketing agency based in South Australia, but we're operational all over the country."
new = "We're Australia's leading digital marketing agency based in SA, but we're operational all over the country."
assert old in src, "PATCH — MS context line not found"
src = src.replace(old, new)

path.write_text(src)
print(f"✅  Patch applied to {path}")

repo = pathlib.Path.home() / "training-portal"
subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
subprocess.run(["git", "commit", "-m", "Update MS Reason for Call context line"], cwd=repo, check=True)
subprocess.run(["git", "push"], cwd=repo, check=True)
print("🚀  Pushed to Vercel")
