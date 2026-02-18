# UX/UI Design - HR Leave Management System

## Personas

### 1. Anna (Employee)
- **Wiek:** 28 lat
- **Rola:** Programistka backendu
- **Potrzeby:** Szybko złożyć wniosek, zobaczyć ile dni urlopu zostało
- **Pain points:** Nie chce przeklikiwać wielu ekranów
- **Device:** Laptop + telefon (często sprawdza w przerwach)

### 2. Tomek (Manager)
- **Wiek:** 35 lat  
- **Rola:** Tech Lead zespołu 8 osob
- **Potrzeby:** Zobaczyć wnioski zespołu, szybko zaakceptować/odrzucić
- **Pain points:** Dostaje za dużo maili, chce wszystko w jednym miejscu
- **Device:** Laptop w biurze, tablet w domu

### 3. Kasia (HR Admin)
- **Wiek:** 42 lat
- **Rola:** HR Business Partner
- **Potrzeby:** Generować raporty, zarządzać polityką urlopową
- **Pain points:** Ręczne zliczanie dni urlopowych w Excelu
- **Device:** Laptop (główne narzędzie pracy)

---

## User Flows

### Flow 1: Złożenie wniosku urlopowego (Anna)
1. Logowanie → Dashboard
2. Klik "New Request" lub "+" na dashboardzie
3. Wybór typu urlopu (dropdown)
4. Kalendarz → wybór dat (start/end)
5. Auto-sprawdzenie dostępności dni
6. Pole "Reason" (optional)
7. Submit → Toast success
8. Przekierowanie do listy wniosków

### Flow 2: Akceptacja wniosku (Tomek)
1. Logowanie → Dashboard
2. Widget "Pending Approvals" pokazuje liczbę
3. Klik w widget → lista wniosków do akceptacji
4. Klik w wniosek → szczegóły + timeline
5. Przyciski "Approve" / "Reject" + komentarz
6. Toast z potwierdzeniem
7. Dashboard odświeża liczbę

### Flow 3: Raport miesięczny (Kasia)
1. Logowanie → Admin Dashboard
2. Menu "Reports" → wybór zakresu dat
3. Filtry: department, typ urlopu, status
4. Generate → tabela wyników
5. Export CSV / PDF

---

## Sitemap

```
├── /login                    (public)
├── /dashboard                (3 wersje: employee/manager/hr)
│   ├── My Requests
│   ├── New Request (wizard)
│   └── Calendar View
├── /requests/:id             (szczegóły wniosku)
├── /approvals                (tylko manager+hr)
│   ├── Pending
│   └── All
├── /team                     (manager: widok zespołu)
│   ├── Calendar
│   └── Members
├── /reports                  (tylko HR)
│   ├── Monthly Summary
│   ├── By Person
│   └── By Department
├── /profile
│   ├── Personal Info
│   ├── Leave Balance
│   └── Settings
└── /admin                    (tylko HR)
    ├── Users
    ├── Departments
    ├── Leave Types
    └── Settings
```

---

## Wireframes

### Login Page
```
+----------------------------------+
|                                  |
|        🏢 LOGO FIRMY            |
|                                  |
|    HR Leave Management          |
|                                  |
|  +----------------------------+  |
|  | Email                      |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [•••••] Password          |  |
|  +----------------------------+  |
|                                  |
|  [    Sign In    ]              |
|                                  |
|  Forgot password?               |
+----------------------------------+
```

### Dashboard - Employee View
```
+------+------------------------------------------+
|      |  Welcome Anna! 👋                       |
|  📋  |  Today: Mon, Feb 17, 2026              |
|  👤  |                                          |
|  📅  |  ┌────────────────────────────────┐   |
|  ⚙️  |  |  Remaining Days:              |   |
+------+  |  18/26 days 🟢                  |   |
           +--------------------------------+   |
                                                 |
           ┌────────────────────────────────┐   |
           |  ➕ New Leave Request          |   |
           └────────────────────────────────┘   |
                                                 |
           Recent Requests:                      |
           ┌──────────────┬──────────┬─────────┐|
           | Type         | Dates    | Status||
           ├──────────────┼──────────┼─────────┤|
           | Vacation     | Jul 5-12 |   🟡   ||
           │ Sick Leave  | Jan 15   |   🟢   ││
           └──────────────┴──────────┴─────────┘│
+------------------------------------------+
```

### Dashboard - Manager View
```
+------+------------------------------------------+
|      |  Welcome Tomek! 👋                      |
|  📋  |                                          |
|  👥  |  ┌──────────┐  ┌──────────┐  ┌────────┐ |
|  📅  |  |⏳ Pending|  |📊 Team   |  |📈 This │ |
|  ⚙️  |  |    3     │  │   8      │  │ Month  │ |
+------+  └──────────┘  └──────────┘  └────────┘ │
           Click to approve →                     |
           ┌────────────────────────────────┐    |
           | [Anna] Vacation Jul 15-20     |    |
           | [Mark] Sick Leave Feb 18      |    |
           | [Lisa] Paternity May 1-14     |    |
           └────────────────────────────────┘    |
                                                  |
           Team Calendar Preview →                |
+-------------------------------------------+
```

### New Request Form (Wizard)
```
Step 1 of 3: Select Type          [Vacation 🏖️]
                                     [Sick 🏥]
                                     [Remote 🏠]
                                     [Other 📋]

Step 2 of 3: Select Dates

    February 2026
 Su Mo Tu We Th Fr Sa
       1  2  3  4  5
  6  7  8  9 10 11 12
 13 14 15 16 [17]18 19   ← Start: Feb 17
 20 21 22 23 24 25 [26]   ← End: Feb 26

 Duration: 10 days | Balance after: 8 days

Step 3 of 3: Confirm
 Reason (optional): [________________________]
 
 [🔙 Back]  [Submit Request ✓]
```

### Request Details (with Approval Timeline)
```
+------------------------------------------+
| ← Back to Requests                       |
|                                          |
| Request #1042                    🟡    |
| =================================        |
|                                          |
| Type:           Vacation 🏖️              |
| Dates:          Jul 15, 2026 - Jul 26, 2026 |
| Duration:       10 working days          |
| Reason:         Family trip to Spain     |
|                                          |
| Approval Status:                         |
| ━━━━━━━━━━━━━━━━━━━━━━━━━━━━             |
| ●─────────○─────────○                    |
| Submitted    Manager    HR               |
| ✓ Submitted: Feb 1, 2026                 |
| ⏳ Manager Review: Tomek                 |
| ○ HR Review: Pending                     |
|                                          |
| [ Approve ✓ ]   [ Reject ✗ ]            |
+------------------------------------------+
```

### Reports - HR Admin View
```
+------------------------------------------+
| Reports > Monthly Summary                |
|                                          |
| Period: [February 2026 ▼]              |
| Department: [All ▼]                      │
|                                          |
| ┌────────────┐ ┌───────────┐ ┌────────┐│
| │ Total      │ │ Approved  │ │ Pending││
| │ Requests   │ │           │ │        ││
| │    47     │ │    38     │ │   9   ││
| └────────────┘ └───────────┘ └────────┘│
|                                          |
| Breakdown by Type:                      │
| ████████████████████ Vacation: 25       │
| ██████████ Sick: 12                     │
| ██████ Remote: 7                        │
| ████ Other: 3                           │
|                                          |
| [ Export CSV 📥 ]  [ Export PDF 📄 ]    │
+------------------------------------------+
```

---

## Design System

### Colors
```css
/* Primary */
--color-primary-50: #EFF6FF;   /* hover bg */
--color-primary-100: #DBEAFE;  /* light bg */
--color-primary-500: #3B82F6;  /* primary */
--color-primary-600: #2563EB;  /* primary hover */
--color-primary-700: #1D4ED8;  /* primary active */

/* Semantic */
--color-success: #22C55E