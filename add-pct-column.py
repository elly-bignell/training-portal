#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 add-pct-column.py

content = open('components/PerformanceSummary.tsx').read()

# 1. Header row — add % column after Total (in Calls & Bookings table only)
content = content.replace(
    '''<th className="text-center px-3 py-3 font-semibold">Total</th>
              </tr>
            </thead>

            {teams.map''',
    '''<th className="text-center px-3 py-3 font-semibold">Total</th>
                <th className="text-center px-2 py-3 font-semibold">%</th>
              </tr>
            </thead>

            {teams.map''',
    1
)

# 2. Team header colSpan 8 → 9 (Calls & Bookings table only — there are 3 team headers + 1 grand total)
# Replace all colSpan={8} that are inside the Calls & Bookings section
# The team headers in C&B table
content = content.replace(
    '''<tr className="bg-slate-800">
                    <td colSpan={8} className="px-4 py-2.5">''',
    '''<tr className="bg-slate-800">
                    <td colSpan={9} className="px-4 py-2.5">'''
)

# Grand total header
content = content.replace(
    '''<tr className="bg-slate-900">
                <td colSpan={8} className="px-4 py-2">
                  <span className="text-sm font-bold text-white">All Teams — Daily Total</span>''',
    '''<tr className="bg-slate-900">
                <td colSpan={9} className="px-4 py-2">
                  <span className="text-sm font-bold text-white">All Teams — Daily Total</span>'''
)

# 3. Person BOOKINGS row — add % cell after total
content = content.replace(
    '''<td className={`px-3 py-1.5 text-center font-semibold ${getBookingStatusClass(td.totals.bookings, TEAM_BOOKINGS_TARGET_EOW / 2)}`}>
                            {td.totals.bookings}
                          </td>
                        </tr>
                        {/* Calls row */}''',
    '''<td className={`px-3 py-1.5 text-center font-semibold ${getBookingStatusClass(td.totals.bookings, TEAM_BOOKINGS_TARGET_EOW / 2)}`}>
                            {td.totals.bookings}
                          </td>
                          <td className="px-2 py-1.5 text-center text-xs font-semibold text-gray-600">
                            {td.totals.calls > 0 ? `${Math.round((td.totals.bookings / td.totals.calls) * 100)}%` : <span className="text-gray-300">–</span>}
                          </td>
                        </tr>
                        {/* Calls row */}''',
    1
)

# 4. Person CALLS row — add empty cell after total
content = content.replace(
    '''<td className="px-3 py-1.5 text-center font-semibold text-gray-800">
                            {td.totals.calls}
                          </td>
                        </tr>
                      </React.Fragment>''',
    '''<td className="px-3 py-1.5 text-center font-semibold text-gray-800">
                            {td.totals.calls}
                          </td>
                          <td></td>
                        </tr>
                      </React.Fragment>''',
    1
)

# 5. Team totals row — add % cell after team booking total
content = content.replace(
    '''<td className={`px-3 py-2 text-center text-sm ${getTeamBookingStatusClass(teamWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW)}`}>
                      {teamWeekTotals.bookings}
                      <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW}</span>
                    </td>
                  </tr>
                </tbody>''',
    '''<td className={`px-3 py-2 text-center text-sm ${getTeamBookingStatusClass(teamWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW)}`}>
                      {teamWeekTotals.bookings}
                      <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">
                      {teamWeekTotals.calls > 0 ? `${Math.round((teamWeekTotals.bookings / teamWeekTotals.calls) * 100)}%` : "–"}
                    </td>
                  </tr>
                </tbody>''',
    1
)

# 6. Grand total BOOKINGS row — add % cell
content = content.replace(
    '''<td className={`px-3 py-2 text-center text-sm font-bold ${getTeamBookingStatusClass(grandWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW * 3)}`}>
                  {grandWeekTotals.bookings}
                  <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW * 3}</span>
                </td>
              </tr>
              <tr className="bg-slate-50">''',
    '''<td className={`px-3 py-2 text-center text-sm font-bold ${getTeamBookingStatusClass(grandWeekTotals.bookings, TEAM_BOOKINGS_TARGET_EOW * 3)}`}>
                  {grandWeekTotals.bookings}
                  <span className="text-gray-400 font-normal text-xs">/{TEAM_BOOKINGS_TARGET_EOW * 3}</span>
                </td>
                <td className="px-2 py-2 text-center text-xs font-bold text-slate-800">
                  {grandWeekTotals.calls > 0 ? `${Math.round((grandWeekTotals.bookings / grandWeekTotals.calls) * 100)}%` : "–"}
                </td>
              </tr>
              <tr className="bg-slate-50">''',
    1
)

# 7. Grand total CALLS row — add empty cell
content = content.replace(
    '''<td className="px-3 py-2 text-center text-sm font-bold text-slate-800">
                  {grandWeekTotals.calls}
                </td>
              </tr>
            </tbody>''',
    '''<td className="px-3 py-2 text-center text-sm font-bold text-slate-800">
                  {grandWeekTotals.calls}
                </td>
                <td></td>
              </tr>
            </tbody>''',
    1
)

open('components/PerformanceSummary.tsx', 'w').write(content)
print("Done — added % column (bookings/calls) to Calls & Bookings table")
