import random, subprocess

random.seed(7)

FIRST_NAMES_F = ["Amahle","Buhle","Cebisa","Dimpho","Esethu","Fikile","Gcobisa","Hlumelo","Ivy","Jabulile",
    "Karabo","Lindiwe","Mihlali","Nandi","Onke","Palesa","Qhawe","Refiloe","Sinazo","Thandeka",
    "Unathi","Vuyokazi","Wandisile","Xoliswa","Yolanda","Zanele","Aphelele","Bongiwe","Chuma","Ntombi"]
FIRST_NAMES_M = ["Aphiwe","Bandile","Chumani","Dumisani","Ethan","Fezile","Gcobani","Hlulani","Ibrahim","Jongikhaya",
    "Kwanele","Lonwabo","Mihlali","Ntando","Odwa","Phumlani","Qamani","Reneilwe","Sipho","Thabo",
    "Ukho","Vuyo","Wandile","Xolani","Yandisa","Zola","Anelisa","Bonga","Cwenga","Nkosinathi"]
SURNAMES = ["Adonisi","Bhengu","Cekiso","Dlamini","Ebrahim","Faku","Gxothiwe","Hlongwane","Jack","Kani",
    "Langa","Mabaso","Ndlovu","Ngwazi","Ntuli","Oliphant","Peter","Qina","Radebe","Sithole",
    "Tshabalala","Vambe","Willemse","Xaba","Yekani","Zulu","Bam","Cakata","Dyantyi","Godlo",
    "Hlathi","Jama","Khumalo","Mahlangu","Nkosi","Sizani","Tofile","Vava","Wana","Zenani"]
RESIDENCES = ["Residence Block 1", "Residence Block 2", "Not allocated", "Not allocated"]

def make_name(used):
    while True:
        gender = random.choice("MF")
        first = random.choice(FIRST_NAMES_M if gender == "M" else FIRST_NAMES_F)
        last = random.choice(SURNAMES)
        if (first, last) not in used:
            used.add((first, last))
            return f"{first} {last}"

CURRENT_YEAR = 2026
ACADEMIC_YEAR_ID = {2023: 1, 2024: 2, 2025: 3, 2026: 4}
SEMESTER_ID = {(4, 1): 1, (4, 2): 2}  # only current-year semesters get enrollments/timetable

# qualification_id -> (department_id, duration_years, students_to_generate) — sums to 1000
QUAL_PLAN = {
    1:  (1, 4, 77),   # BSc Biological Sciences Extended
    4:  (1, 3, 96),   # BSc Biological Sciences
    8:  (1, 1, 38),   # BSc Hons Botany
    9:  (1, 1, 29),   # BSc Hons Geography
    10: (1, 1, 38),   # BSc Hons Zoology
    19: (2, 3, 96),   # BSc Applied Mathematics
    20: (2, 3, 96),   # BSc Applied Statistical Science
    21: (2, 3, 116),  # BSc Computer Science
    25: (2, 1, 38),   # BSc Hons Computer Science
    27: (3, 4, 77),   # BSc Extended Chemistry
    28: (3, 4, 77),   # BSc Extended Physics
    29: (3, 3, 97),   # BSc Chemistry
    30: (3, 3, 87),   # BSc Physics
    31: (3, 1, 38),   # BSc Hons Chemistry
}

DEPT_VENUES = {
    1: ["BES Lecture Hall 1", "BES Lecture Hall 2", "Life Sciences Lab A", "Life Sciences Lab B"],
    2: ["Maths & Computing Hall 1", "Maths & Computing Hall 2", "Computer Lab 1", "Computer Lab 2"],
    3: ["Chem/Phys Lecture Hall", "Chemistry Lab 1", "Physics Lab 1", "Chem/Phys Hall 2"],
}
DEPT_STAFF = {1: [1, 2, 3], 2: [4, 5, 6, 7], 3: [8, 9, 10]}
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
START_TIMES = ["08:00:00", "09:00:00", "10:00:00", "11:00:00", "13:00:00", "14:00:00", "15:00:00"]


def run_sql(q):
    out = subprocess.run(["mysql", "-u", "root", "-D", "campusmobi", "-N", "-B", "-e", q],
                          capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return [line.split("\t") for line in out.stdout.strip().split("\n") if line]


qm_rows = run_sql("SELECT qualification_id, module_id, year_level, semester FROM qualification_modules")
qm_by_qual_year = {}
for qid, mid, yl, sem in qm_rows:
    qm_by_qual_year.setdefault((int(qid), int(yl)), []).append((int(mid), int(sem)))

# Extended (4-year) programmes only have a dedicated Year 1 curriculum in the
# prospectus — from Year 2 onward they join the mainstream 3-year programme's
# curriculum, shifted by one year (standard structure for a foundation/
# extended year). Year N of an extended programme (N>=2) therefore uses Year
# N-1 of its mainstream counterpart.
EXTENDED_TO_MAINSTREAM = {1: 4, 27: 29, 28: 30}

def modules_for(qid, year_of_study):
    key = (qid, year_of_study)
    if key in qm_by_qual_year:
        return qm_by_qual_year[key]
    mainstream_qid = EXTENDED_TO_MAINSTREAM.get(qid)
    if mainstream_qid and year_of_study >= 2:
        return qm_by_qual_year.get((mainstream_qid, year_of_study - 1), [])
    return []

used_names = set()
seq_counter = {}


def next_student_number(enroll_year):
    seq_counter.setdefault(enroll_year, 0)
    seq_counter[enroll_year] += 1
    yy = str(enroll_year)[2:]
    return f"{yy}{seq_counter[enroll_year]:07d}"


roster_rows = []
enrollment_rows = []
timetable_seen = set()  # (module_id, semester_id, department_id)

for qid, (dept_id, duration, n_students) in QUAL_PLAN.items():
    for _ in range(n_students):
        full_name = make_name(used_names)
        max_years_in = min(duration, CURRENT_YEAR - 2023 + 1)
        years_in = random.randint(1, max_years_in)
        enroll_year = CURRENT_YEAR - years_in + 1
        year_of_study = years_in
        student_number = next_student_number(enroll_year)
        residence = random.choice(RESIDENCES)

        roster_rows.append((student_number, full_name, qid, year_of_study, residence))

        for mid, sem in modules_for(qid, year_of_study):
            sem_targets = [1, 2] if sem == 0 else [sem]
            for s in sem_targets:
                sem_id = SEMESTER_ID[(4, s)]
                enrollment_rows.append((student_number, mid, sem_id))
                timetable_seen.add((mid, sem_id, dept_id))

# Timetable: one section per (module, semester, department) actually used
slot_cursor = {}
timetable_lines = []
for tid, (mid, sem_id, dept_id) in enumerate(sorted(timetable_seen), start=1):
    idx = slot_cursor.get(dept_id, 0)
    day = DAYS[idx % len(DAYS)]
    start = START_TIMES[idx % len(START_TIMES)]
    h, m, s = map(int, start.split(":"))
    end = f"{h+2:02d}:{m:02d}:{s:02d}" if h + 2 < 24 else "17:00:00"
    slot_cursor[dept_id] = idx + 1
    venue = random.choice(DEPT_VENUES[dept_id])
    staff_id = random.choice(DEPT_STAFF[dept_id])
    session_type = random.choice(["lecture", "lecture", "tutorial", "practical"])
    timetable_lines.append((mid, sem_id, dept_id, staff_id, session_type, day, start, end, venue))

# ---------------------------------------------------------------------
out = []
out.append("USE campusmobi;")
out.append("SET FOREIGN_KEY_CHECKS = 0;\n")

out.append("-- 1,000 real students on the Faculty of Natural Sciences roster —")
out.append("-- eligible to register, not yet claimed by a CampusMobi account.")
out.append("INSERT INTO student_roster (student_number, full_name, qualification_id, year_of_study, residence) VALUES")
vals = [f"('{sn}', '{name.replace(chr(39), chr(39)*2)}', {qid}, {yos}, '{res}')"
        for sn, name, qid, yos, res in roster_rows]
CHUNK = 200
for i in range(0, len(vals), CHUNK):
    out.append("INSERT INTO student_roster (student_number, full_name, qualification_id, year_of_study, residence) VALUES"
                if i > 0 else "")
    out.append(",\n".join(vals[i:i + CHUNK]) + ";\n")
out = [l for l in out if l != ""]

out.append("-- Current-year (2026) module enrollments, driving the Timetable screen")
vals = [f"('{sn}', {mid}, {sem})" for sn, mid, sem in enrollment_rows]
for i in range(0, len(vals), CHUNK):
    out.append("INSERT INTO module_enrollments (student_number, module_id, semester_id) VALUES")
    out.append(",\n".join(vals[i:i + CHUNK]) + ";\n")

out.append("-- Timetable sections for every module actually being taken this year")
out.append("INSERT INTO timetable_slots (module_id, semester_id, department_id, staff_id, session_type, day_of_week, start_time, end_time, venue) VALUES")
vals = [f"({mid}, {sem}, {dept}, {staff}, '{stype}', '{day}', '{start}', '{end}', '{venue}')"
        for mid, sem, dept, staff, stype, day, start, end, venue in timetable_lines]
out.append(",\n".join(vals) + ";\n")

out.append("SET FOREIGN_KEY_CHECKS = 1;")

with open("/home/claude/campusmobi_app/campusmobi/db/init/04_app_seed.sql", "w") as f:
    f.write("\n".join(out))

print("roster:", len(roster_rows))
print("enrollments:", len(enrollment_rows))
print("timetable slots:", len(timetable_lines))
