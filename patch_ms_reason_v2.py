import pathlib, subprocess

path = pathlib.Path.home() / "training-portal" / "app" / "call-flowchart" / "page.tsx"
src = path.read_text()

# ── 1. Enable line breaks in FlowCard script rendering ───────────────────────
old = '<p className="text-sm mt-2 leading-relaxed opacity-80 italic">&ldquo;{node.script}&rdquo;</p>'
new = '<p className="text-sm mt-2 leading-relaxed opacity-80 italic whitespace-pre-line">&ldquo;{node.script}&rdquo;</p>'
assert old in src, "PATCH 1 — FlowCard script <p> not found"
src = src.replace(old, new)

# ── 2. Update MS Reason for Call script ──────────────────────────────────────
old = "We're Australia's leading digital marketing agency based in SA, but we're operational all over the country. The reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we've helped 1000's of clients just like you get in front of people who need you but don't know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?"
new = "We are Marketing Sweet, 'Sweet' is spelt like the lolly. We're a full service agency that specialises in all aspects of web design and digital marketing.\\n\\nThe reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we've helped 1000's of clients just like you get in front of people who need you but don't know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?"
assert old in src, "PATCH 2 — MS reason for call script not found"
src = src.replace(old, new)

path.write_text(src)
print(f"✅  Both patches applied to {path}")

repo = pathlib.Path.home() / "training-portal"
subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
subprocess.run(["git", "commit", "-m", "Update MS Reason for Call intro line with blank line break"], cwd=repo, check=True)
subprocess.run(["git", "push"], cwd=repo, check=True)
print("🚀  Pushed to Vercel")
