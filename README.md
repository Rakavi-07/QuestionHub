# QuestionHub

The official previous year question paper repository for **SRM Physiotherapy
(BPT)** students at SRM Institute of Science and Technology.

QuestionHub is exclusively for the Physiotherapy program — there is no
Department concept anywhere in the app.

---

## 1. Frontend (`/src`)

React 19 + Vite + Tailwind CSS v4 + React Router + Framer Motion + Lucide.

### Setup

```bash
npm install
cp .env.example .env     # set VITE_API_URL to your backend URL
npm run dev
```

### Structure

```
src/
  api/            axios.js (base URL + auth header + 401 auto-logout), auth.js (register/login calls)
  assets/
  components/     Navbar, Footer, PrimaryButton, InputField, SelectField,
                   FeatureCard, ThemeToggle, StatusBanner, PaperStackIllustration
  hooks/          useTheme.js — dark mode toggle w/ localStorage persistence
  layouts/        AuthLayout.jsx — shared split-screen layout for login pages
  pages/          LandingPage, StudentLogin, AdminLogin, StudentRegister,
                   StudentDashboard, AdminDashboard, NotFound
  routes/         routes.jsx (route table), ProtectedRoute.jsx (client-side guard)
  utils/          auth.js (JWT/session storage), subjects.js (hardcoded curriculum)
```

### Routes

| Route                | Page                                     |
|-----------------------|-------------------------------------------|
| `/`                   | Landing Page                              |
| `/student/login`      | Student Login                             |
| `/admin/login`        | Admin Login                               |
| `/register`           | Student Registration                      |
| `/dashboard/student`  | Student Dashboard (placeholder, protected)|
| `/dashboard/admin`    | Admin Dashboard (placeholder, protected)  |
| `*`                   | 404 Not Found                             |

### Registration form

Full Name, Register Number, Official Email, Current Year (1st–5th Year /
Internship), Current Semester (Semester 1–8), Password, Confirm Password.
**No Department field.** On submit, the form is replaced in-place by a
success card ("Registration Submitted Successfully...") with a **Back to
Login** button — no auto-redirect.

### Login screens

Both Student and Admin login show a `StatusBanner` driven by the backend
response:
- **Pending** → "Your account is awaiting admin approval."
- **Rejected** → "Your registration has been rejected. Please contact the department."
- **Invalid credentials** → "Incorrect email or password."
- **Approved** → navigates to the relevant dashboard placeholder.

The JWT is stored in `localStorage`. Any `401` response automatically clears
the session and redirects to `/student/login`.

### Dropdowns

`SelectField` uses solid backgrounds, explicit `<option>` styling, and
`color-scheme: light dark` so every dropdown is clearly readable in both
light and dark mode. It's the single reusable component used everywhere a
select appears (currently Year and Semester on registration).

---

## 2. Backend (`/server`)

Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt, MVC-style:

```
server/
  config/
    db.js              MongoDB Atlas connection (Mongoose)
    cloudinary.js       Cloudinary SDK configured only — no upload logic yet
  controllers/
    authController.js  registerStudent, loginStudent, loginAdmin
  middleware/
    authMiddleware.js   protect (JWT verify) + requireRole('Admin' | 'Student')
    errorMiddleware.js  notFound + centralized errorHandler
  models/
    Student.js          fullName, registerNumber, email, year, semester,
                         password (hashed), status, role, createdAt
                         (no department field)
    Admin.js            name, email, password (hashed), role, createdAt
  routes/
    authRoutes.js
  utils/
    generateToken.js    signs a JWT with { id, role }
    seedAdmin.js        creates the default admin on first boot
    subjects.js         hardcoded Semester -> Subject list (see below)
  server.js
  .env.example
```

### Setup

```bash
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET at minimum
npm run dev            # nodemon, or `npm start` for plain node
```

On first successful boot, if no Admin document exists yet, one is created
automatically:

```
email:    admin@srmist.edu.in
password: Admin@123
```

(hashed with bcrypt before being stored — change this password once an
admin-facing settings page exists in a later phase).

### API

| Method | Endpoint                    | Access             | Notes |
|--------|------------------------------|--------------------|-------|
| POST   | `/api/auth/register`         | Public             | Only `@srmist.edu.in` emails accepted. No department. Semester validated against 1–8. Creates student with `status: Pending`. |
| POST   | `/api/auth/student/login`    | Public             | `401` invalid credentials, `403` pending/rejected (with a `status` field), or `200` + JWT + student. |
| POST   | `/api/auth/admin/login`      | Public             | `401` invalid credentials or `200` + JWT + admin. |
| GET    | `/api/auth/me`               | Private            | Returns the authenticated user — validates a stored token. |
| GET    | `/api/auth/student-only`     | Private (Student)  | Sample role-protected route. |
| GET    | `/api/auth/admin-only`       | Private (Admin)    | Sample role-protected route. |

Protected routes expect `Authorization: Bearer <token>`. `protect` verifies
the JWT and loads the user; `requireRole('Admin')` / `requireRole('Student')`
then restrict access by role.

### Hardcoded Physiotherapy curriculum (`server/utils/subjects.js`)

Semesters 1–8, each mapped to its subject codes and names (e.g. Semester 4 →
`BPT19401 Exercise Therapy II`, etc.) — this is the single source of truth
admins will pick Semester → Subject from once uploads are implemented.
**One Subject → One PDF**, containing all previous years for that subject
(no per-year files, no Year/Month filter). This file is not wired into any
route yet — it's ready for the upload/dashboard phases.

### Verification performed for this pass

Registration, login (pending/rejected/approved/invalid-credentials cases),
JWT issuance, protected routes, and role-based access control were all
exercised directly against the real controllers, middleware, and routes
(with the database layer mocked, since no live MongoDB Atlas cluster is
reachable in this environment) — all checks passed. Before running against
your own Atlas cluster, confirm:

1. `server/.env` has a valid `MONGODB_URI` (Atlas connection string, correct
   user/password, IP allow-list includes your server's IP or `0.0.0.0/0` for
   testing).
2. `JWT_SECRET` is set to a long random string.
3. `npm run dev` inside `/server` logs `MongoDB connected: ...` followed by
   `QuestionHub API listening on port 5000`.
4. The frontend's `.env` `VITE_API_URL` points at that same server.

### Not implemented yet (by design)

- Admin/Student dashboards (real ones)
- Question paper upload, storage, browse-by-semester/subject, download, saved papers
- Cloudinary uploads (SDK is configured, nothing calls it yet)

---

## Design notes (unchanged)

- **Palette**: Blue `#2563EB` (primary), Indigo `#4F46E5` (secondary), Emerald
  `#10B981` (accent), light gray/white canvas, full dark mode.
- **Type**: Space Grotesk (display), Inter (body), IBM Plex Mono (codes/IDs).
- **Signature element**: the fanned "question paper" card stack used across
  the hero, auth screens, and 404 page.
