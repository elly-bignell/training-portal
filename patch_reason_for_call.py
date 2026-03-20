import pathlib, subprocess

path = pathlib.Path.home() / "training-portal" / "app" / "call-flowchart" / "page.tsx"
src = path.read_text()

# ── 1. Quodo: prepend context line ────────────────────────────────────────────
old = 'script: "The reason for my call is I was just having a look at your website and I noticed that you have been around for [X] years. I\'m assuming that most of your work comes through word of mouth and referrals?"'
new = 'script: "Just for some context, we\'re Australia\'s largest privately owned web design company, based in South Australia but operational right across the country. The reason for my call is I was just having a look at your website and I noticed that you have been around for [X] years. I\'m assuming that most of your work comes through word of mouth and referrals?"'
assert old in src, "PATCH 1 — Quodo reason for call not found"
src = src.replace(old, new)

# ── 2. Marketing Sweet: prepend context line ──────────────────────────────────
old = 'script: "The reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we\'ve helped 1000\'s of clients just like you get in front of people who need you but don\'t know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?"'
new = 'script: "We\'re a digital marketing agency based in South Australia, but we\'re operational all over the country. The reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we\'ve helped 1000\'s of clients just like you get in front of people who need you but don\'t know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?"'
assert old in src, "PATCH 2 — MS reason for call not found"
src = src.replace(old, new)

path.write_text(src)
print(f"✅  Both patches applied to {path}")

# ── Git ───────────────────────────────────────────────────────────────────────
repo = pathlib.Path.home() / "training-portal"
subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
subprocess.run(["git", "commit", "-m", "Add context lines to Quodo and MS Reason for Call tiles"], cwd=repo, check=True)
subprocess.run(["git", "push"], cwd=repo, check=True)
print("🚀  Pushed to Vercel")
