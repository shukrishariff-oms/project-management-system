import openpyxl
from datetime import date

wb = openpyxl.Workbook()
ws = wb.active
ws.append(["Deliverable", "Phase", "Plan Date (YYYY-MM-DD)", "Planned Amount", "Remarks"])
ws.append(["Design Sign-off", "Phase 1", "2026-02-15", 5000, "Initial payment"])
ws.append(["Development Complete", "Phase 2", "2026-03-30", 10000, "Core dev"])
ws.append(["UAT Sign-off", "Phase 3", "2026-04-30", 5000, "Final release"])

wb.save("dummy_payments.xlsx")
print("created dummy_payments.xlsx")
