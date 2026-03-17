import pathlib, sys

path = pathlib.Path.home() / "training-portal" / "app" / "call-flowchart" / "page.tsx"
src = path.read_text()
original = src

# ── 1. Rename "Send Examples & Confirm Email" → "Go For Booking" ──────────────
old = (
    '              node={{ id: "q-email", type: "script", label: "Send Examples & Confirm Email",'
    ' script: "I\'d love to send you some examples of our work for you to have a look at.'
    ' Is your best email [xyz@xyz.com.au]?" }}'
)
new = (
    '              node={{ id: "q-email", type: "script", label: "Go For Booking",'
    ' script: "I\'d love to show you some examples of our work and explain our pricing.'
    " I'll only need you for 5-10 minutes. Does XYZday at XYZtime work for you?\" }}"
)
assert old in src, "PATCH 1 — target string not found"
src = src.replace(old, new)

# ── 2. Rename "Qualify Their Interest" → "Send Examples & Confirm Email" ──────
old = (
    '              node={{ id: "q-qualify", type: "script", label: "Qualify Their Interest",'
    ' script: "Awesome, and do you mind if I ask you a quick question?'
    " Is this something you're genuinely interested in or are you being polite?\" }}"
)
new = (
    '              node={{ id: "q-qualify", type: "script", label: "Send Examples & Confirm Email",'
    ' script: "Awesome, I\'ll book that in. We\'ll do it over Zoom so we can obviously show you visually.'
    " I'll also send you a few links to some of our work in the meantime and a bit about us."
    ' Is your best email XYZ@xyz.com.au?" }}'
)
assert old in src, "PATCH 2 — target string not found"
src = src.replace(old, new)

# ── 3. Insert new "Qualify Their Interest" node + Arrow before the DecisionLabel ─
old = (
    """            <DecisionLabel text="Are they genuinely interested?" />"""
)
new = (
    """            <Arrow />
            <FlowCard
              node={{ id: "q-qualify-int", type: "script", label: "Qualify Their Interest", script: "Great! Do you mind if I ask you a quick question? Is this something you're genuinely interested in or are you being polite?" }}
              isActive={activeNode === "q-qualify-int"}
              onClick={() => toggle("q-qualify-int")}
            />

            <DecisionLabel text="Are they genuinely interested?" />"""
)
assert old in src, "PATCH 3 — target string not found"
src = src.replace(old, new, 1)  # only first occurrence (Quodo section)

# ── 4. Change "Genuinely Interested" Book card → Warm Close ───────────────────
old = (
    '                  node={{ id: "q-interested", type: "outcome-book", label: "Book",'
    ' script: "In that case, I recommend having a chat on [day] at [time].'
    " I can run you through our examples and the production side of things and discuss pricing."
    ' Does that time work? I\'ll only need you for about 15 minutes." }}'
)
new = (
    '                  node={{ id: "q-interested", type: "outcome-book", label: "Warm Close",'
    ' script: "Okay great — well thank you for your time and we look forward to seeing you'
    " at XYZtime on XYZday! Have a great rest of your day.\" }}"
)
assert old in src, "PATCH 4 — target string not found"
src = src.replace(old, new)

# ── Write ─────────────────────────────────────────────────────────────────────
path.write_text(src)
print(f"✅  All 4 patches applied to {path}")
