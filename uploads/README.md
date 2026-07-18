# Uploads

Drop training session source files here when you're publishing a new
session. The workflow is documented in **Training Portal - Publishing
Sessions.docx** at the repo root.

When you're publishing a session, this folder should contain THREE files:

- The debrief (usually `Sales Training [N] - [Day DD Month YYYY].docx`)
- The toolkit (usually `Sales Toolkit [N] - [Day DD Month YYYY].pdf`)
- The quiz (usually `Sales Training [N] - [Day DD Month YYYY] - Quiz.docx`)

File names don't have to match that convention exactly — just needs to be
obvious which is which.

Once the session is published successfully, delete the files from this
folder to keep it clean for next time.

This folder is checked into git so it exists on everyone's clone, but the
files inside are ignored via `.gitignore` (the source docs shouldn't
travel with the codebase — they're inputs, not outputs).
