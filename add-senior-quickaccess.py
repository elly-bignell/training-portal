#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 add-senior-quickaccess.py

content = open('app/page.tsx').read()

# Find where the Senior Team Members section currently exists (from previous edit)
# and replace it with proper quick access cards matching the trainee style

# The current senior section has minimal cards (just dashboard + scorecard)
# Replace it with full cards matching trainee style but without schedule/exam links

old = '''          {/* Senior Team Members */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 mt-6">Senior Team Members</h3>
          <div className="space-y-4">
            {trainees.filter((t) => ["lucas-tirri", "felipe-garcia", "dylan-munro", "thomas-rennie"].includes(t.slug)).map((trainee) => {
              const module1Attempts = getTraineeExamAttempts(trainee.slug, "exam-module-1");
              const module1Passed = module1Attempts.some((a) => a.passed);
              const module1BestScore = module1Attempts.length > 0
                ? Math.max(...module1Attempts.map((a) => a.percentage))
                : null;

              const scheduleSlug: Record<string, string> = {
                "cindy-rose-rondez-manrique": "cindy",
                "krishna-patel": "krishna",
                "connie-matthews": "connie",
              };
              const hasSchedule = trainee.slug in scheduleSlug;

              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={`/trainees/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={`/scorecard/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>'''

new = '''          {/* Senior Team Quick Access */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 mt-6">Senior Team Quick Access</h3>
          <div className="space-y-4">
            {trainees.filter((t) => ["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(t.slug)).map((trainee) => {
              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={`/trainees/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={`/scorecard/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>'''

if old in content:
    content = content.replace(old, new, 1)
    open('app/page.tsx', 'w').write(content)
    print("Done — updated Senior Team Quick Access with Lucas, Felipe & Dylan")
else:
    print("ERROR: Could not find the Senior Team Members section. Trying alternate approach...")
    # Alternate: the section might not exist yet, add it before the closing </div> of the Quick Access panel
    # Look for the end of the trainees filter section
    alt_old = '''            })}
          </div>
        </div>

        {/* Performance vs Standards Summary */}'''
    
    alt_new = '''            })}
          </div>

          {/* Senior Team Quick Access */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 mt-6">Senior Team Quick Access</h3>
          <div className="space-y-4">
            {trainees.filter((t) => ["lucas-tirri", "felipe-garcia", "dylan-munro"].includes(t.slug)).map((trainee) => {
              return (
              <div key={trainee.slug} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
                    {trainee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{trainee.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Training Dashboard</span>
                    <Link href={`/trainees/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Activity Scorecard</span>
                    <Link href={`/scorecard/${trainee.slug}`} className="text-blue-600 hover:underline">Open →</Link>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Performance vs Standards Summary */}'''
    
    if alt_old in content:
        content = content.replace(alt_old, alt_new, 1)
        open('app/page.tsx', 'w').write(content)
        print("Done (alt approach) — added Senior Team Quick Access")
    else:
        print("ERROR: Could not find insertion point. Manual edit needed.")
