# SE ONE — Website (Next.js, routed i18n, real backend auth)

Next.js 14 (App Router) + TypeScript + Tailwind CSS. Public marketing
site, role-based login/signup wired to a .NET Web API, and two
dashboards (Student / Teacher). Bilingual with real locale-prefixed
URLs (`/fa/...` default, `/en/...`).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your .NET API
npm run dev
```

Visiting `/` redirects to `/fa` (or `/en` if your browser/cookie prefers
it). Every route lives under a locale prefix:

- `/fa` or `/en` — marketing home
- `/fa/about`, `/fa/contact`, `/fa/courses`
- `/fa/login`, `/fa/signup`
- `/fa/dashboard/*` — Student dashboard
- `/fa/teacher/*` — Teacher dashboard

## Routed bilingual URLs — how it works

- `middleware.ts` reads a `se-one-lang` cookie (falls back to the
  browser's `Accept-Language`, then to `fa`) and redirects any
  unprefixed path to `/fa/...` or `/en/...`.
- Every route lives under `app/[lang]/...`. `app/[lang]/layout.tsx` is
  the actual root layout (there's no `app/layout.tsx` — this is the
  standard Next.js pattern for this kind of i18n routing) and sets
  `<html lang dir>` from the URL segment.
- `lib/i18n/LanguageProvider.tsx` reads `lang` from that URL segment
  (not from local storage) and exposes `useLanguage() → { lang, t, href, toggleLang }`.
  - `t("some.dict.path")` — translated string
  - `href("/dashboard")` — turns a locale-agnostic path into
    `/fa/dashboard` or `/en/dashboard` for the current language; use
    this for every internal `<Link>`/`router.push`
  - `toggleLang()` — writes the `se-one-lang` cookie and navigates to
    the same page under the other locale prefix
- `lib/i18n/paths.ts` has the two pure helpers behind this:
  `stripLocale(pathname)` and `withLocale(lang, path)`. Sidebars/Navbar
  use `stripLocale` to match the current nav item regardless of which
  locale prefix is active.
- `lib/i18n/dictionary.ts` — all fa/en strings, unchanged in shape
  from before.

**Adding a new internal link:** always go through `href()` from
`useLanguage()` — never hardcode `href="/something"` on a `<Link>`,
or the locale prefix will be missing and you'll land on a 404 (routes
only exist under `/fa/...` and `/en/...`, not bare `/something`).

## Backend auth — how it's wired to your .NET API

There's no more fake localStorage-only role picker. `lib/api/`
is a small, isolated layer:

- **`lib/api/client.ts`** — a `fetch` wrapper. Reads
  `NEXT_PUBLIC_API_BASE_URL` from env, sends `credentials: "include"`
  (works whether your API uses ASP.NET Identity cookies, JWT bearer
  tokens, or both), and throws a typed `ApiError` on non-2xx responses.
- **`lib/api/auth.ts`** — `login()`, `register()`, `fetchCurrentUser()`,
  `logoutApi()`. **This is the one file you'll need to edit** to match
  your actual controller routes and JSON shapes. It currently assumes:

  ```
  POST /api/auth/login    { email, password }                  -> { token, user: { id, fullName, email, role } }
  POST /api/auth/register { fullName, email, password, role }  -> same shape
  GET  /api/auth/me       (authenticated)                       -> { id, fullName, email, role }
  POST /api/auth/logout   (authenticated)
  ```

  `role` is expected as `"Student"` / `"Teacher"` (or any casing —
  it's lowercased and compared). If your API returns PascalCase JSON
  (`FullName`, `Email`, ...) instead of camelCase, either turn on
  camelCase JSON output in .NET (`PropertyNamingPolicy.CamelCase`) or
  adjust the field lookups in `toAuthResponse()` — everything else in
  the app only depends on the `AuthUser`/`AuthResponse` TypeScript
  shapes, not on these exact field names.

- **`lib/auth-client.ts`** — client-side session storage. After a
  successful `login()`/`register()` call, `storeAuth(authResponse)`
  saves the token + role + name to `localStorage` (and the token is
  sent as `Authorization: Bearer <token>` on subsequent API calls
  automatically, via `client.ts`). `getRole()`/`getName()` read it
  back for the sidebars; `clearSession()` wipes it on logout.

- **Login page** (`/login`) no longer has a role toggle — a real
  account already has a role, so it just calls `login(email,
  password)` and redirects to `/dashboard` or `/teacher` based on
  whatever role the API returns.
- **Signup page** (`/signup`) still has the Student/Teacher card
  picker — that's a real choice being made at registration — and
  sends it in the `register()` call.
- Both pages show a real error banner (from `ApiError.message`) if
  the request fails, and a loading state while it's in flight.

**Security note:** storing the JWT in `localStorage` is convenient but
readable by any script on the page (XSS risk). If your .NET API can
set an httpOnly cookie on login instead, that's more secure — in that
case you can likely delete the manual token storage in `client.ts`
entirely and just rely on `credentials: "include"`, since the browser
will attach the cookie automatically.

## Structure

```
middleware.ts                 locale detection + redirect
app/
  [lang]/
    layout.tsx                  actual root layout (html/lang/dir + fonts)
    (marketing)/                 Navbar + Footer layout
      page.tsx                    home
      about/ contact/ courses/
      login/ signup/               now call lib/api/auth.ts
    (app)/dashboard/               Student dashboard (unchanged structure)
    (teacher)/teacher/             Teacher dashboard (unchanged structure)
  globals.css
lib/
  i18n/
    locales.ts                  locale list + default
    paths.ts                    stripLocale / withLocale
    dictionary.ts                fa + en strings
    LanguageProvider.tsx         URL-driven language context
  api/
    client.ts                   fetch wrapper (base URL, auth header, ApiError)
    auth.ts                     login/register/me/logout — edit this to match your API
  auth-client.ts                localStorage session (token/role/name)
  nav.ts / teacher-nav.ts       sidebar configs (i18n keys, not text)
  data.ts / teacher-data.ts     dashboard mock content
```

## What's still a scope call, not done

- **Route guards**: nothing stops someone from typing `/fa/teacher`
  directly without a token. Add real protection once you're ready —
  typically middleware.ts checking a session cookie, or a client-side
  redirect in each dashboard layout that calls `fetchCurrentUser()` on
  mount and bounces to `/login` on a 401.
- **"Forget Password", social login buttons (Google/Facebook/Apple)**:
  still decorative — no OAuth or reset-flow wired up.
- **Deep dashboard mock content** (assignment titles, chat messages,
  course names inside the dashboards) is still English-only; the
  chrome (nav, titles, buttons) is fully bilingual. See the previous
  README section on this from earlier iterations — same scope note
  still applies.
- Couldn't run `npm install`/`next build` in this sandbox (no registry
  access) — I checked bracket balance and import wiring by hand across
  every file, but please run a real build before shipping, especially
  given how much of the routing structure changed in this pass.

## Mobile-specific layout refinements

Based on real mobile mockups, a few sections diverge from a simple
"stack everything to 1 column" responsive pattern:

- **Navbar (mobile)**: `Log In` (start) — logo (centered, absolute) —
  menu icon (end). The language switcher moved into the slide-down
  menu instead of sitting in the top row.
- **Horizontal snap-scroll carousels on mobile** (grid from `sm:` up):
  home feature cards, testimonials, and the contact page's FAQ and
  response-process cards. Swipe through them; desktop keeps the
  original grid (testimonials also keep their prev/next buttons on
  `sm:` and up).
- **Always-2-column, never full-width-stacked**: the course cards
  (home "Latest Courses" and the reused "Popular Courses" on
  About/Courses) and the "Teaching Philosophy" cards.
- **Always-1-column, never 2-up**: the English-level badges on the
  Courses page — they're full-width stacked cards on mobile instead
  of a tight 2×2 grid.
- **Footer**: the brand block stays full-width on top, but the
  Courses/About/Resources link columns stay side-by-side in a 3-column
  row even on the narrowest phones (smaller type, tighter gaps) rather
  than stacking to one long column.

## Login: phone (OTP) or email

`/login` now has a Phone/Email tab toggle instead of a single email
form:

- **Phone tab**: country-code-prefixed number field → `Continue` calls
  `requestOtp(phone)` (assumed endpoint `POST /api/auth/otp/request`)
  → switches to a 6-box code screen (`components/marketing/auth/OtpInput.tsx`,
  auto-advances focus, backspace goes to the previous box) → `Login`
  calls `verifyOtp(phone, code)` (assumed `POST /api/auth/otp/verify`)
  and redirects by the role the API returns, same as before.
- **Email tab**: unchanged — `login(email, password)`.
- Both of these endpoint assumptions live in `lib/api/auth.ts` next to
  `login()`/`register()` — same "edit this one file" pattern as the
  rest of the auth layer.
- The illustration at the top (`LoginHeroStrip.tsx`) is a simplified,
  original stand-in for the two-figures-plus-navy-panel artwork in the
  mockup — built from basic shapes, not a reproduction of the source
  illustration.
- The signup page's layout/illustration (`ArchFigure`) is unchanged —
  the mockup you sent for it matched what's already built.

## Site completeness pass

A few things that were dead ends or missing got filled in:

- **Navbar "Teacher" link** was pointing nowhere (`href="#"`). Built a
  real public page at `/become-teacher` — "Teach with SE ONE" — with a hero,
  benefits, a how-it-works section, requirements, and a sign-up CTA.
- **"Forget Password?"** on the login page was a dead link. Built
  `/forgot-password` (email → confirmation state) and added
  `requestPasswordReset()` to `lib/api/auth.ts` (same
  documented-assumption pattern as the rest of that file).
- **About page's "Explore Courses" buttons** pointed to `#courses`,
  which didn't scroll anywhere on that page (About's course section
  has no such id) — now they link to the real `/courses` page.
- **Footer's "Contact" and "FAQ" links** now point at the real Contact
  page (FAQ section got an `id="faq"` for the deep link). The rest of
  the footer's catalog links (IELTS Prep, Blog, etc.) are still `#`
  since those pages don't exist yet.
- **Courses page search** now actually filters the course grid by
  title/level/description as you type, with an empty-state message
  when nothing matches (`LatestCourses` takes an optional
  `filterQuery` prop).

## Student ↔ Teacher booking (new)

The core new feature: students can now find and book a teacher based
on time slots the teacher has published themselves.

- **`lib/teachers-directory.ts`** — a shared mock dataset: a directory
  of teacher profiles, each with their own list of open time slots
  (`{ day, time, booked }`). This is the data model meant to carry
  over to a real API — see the comment at the top of that file for
  the assumed endpoints (`GET /api/teachers`, booking, etc.).
- **Student side** — `/dashboard/teachers` ("Find a Teacher", new
  sidebar item): browse teacher cards, expand one to see their open
  slots, and book directly. Booked sessions show up in a "My
  Bookings" summary at the top. Feedback is a toast, not text stuffed
  into the button.
- **Teacher side** — `/teacher/availability` ("Availability", new
  sidebar item): the logged-in teacher's own slot list, with a small
  form to add a slot (day + time range) and a remove button per slot.
  Slots booked by a student are shown read-only with a "Booked by a
  student" badge and no remove button — only open (unbooked) slots
  can be deleted, so a teacher can't silently cancel on a student.
- **Known limitation**: like the rest of the dashboard's mock data,
  these two pages each keep their own local copy of
  `teacherDirectory` in React state. A slot a teacher adds won't
  appear for students in a different tab/session — that requires a
  real backend to persist and share. The data shapes are ready for
  that; the wiring isn't.

## Find a Teacher (student) / Manage Availability (teacher)

The core new feature: students pick a teacher based on the time slots
that teacher has published; teachers manage those slots themselves.

- **`lib/teachers-directory.ts`** — shared mock data model:
  `TeacherProfile` (name, subject, level, rating, bio) each with a list
  of `AvailabilitySlot` (day, time, booked). `CURRENT_TEACHER_ID`
  stands in for "whoever is logged into the teacher dashboard" until
  there's a real session to read it from.
- **`/dashboard/teachers`** (student, "Find a Teacher" in the sidebar)
  — lists every teacher; expanding one shows their slots. Booking an
  open slot marks it booked and adds it to a "My Bookings" summary at
  the top, with a toast confirmation.
- **`/teacher/availability`** (teacher, "Availability" in the sidebar)
  — the logged-in teacher's own slot list. Add a slot (day + free-text
  time range) or remove one they haven't been booked for; slots a
  student has booked show as "Booked by a student" instead of a
  remove button.
- Both pages hold their own local copy of the mock data (`useState`)
  — same pattern as Messages/Assignments elsewhere in the dashboard.
  There's no shared store or persistence, so a slot a teacher adds
  won't appear for students until this is wired to a real backend
  (`GET /api/teachers`, `POST /api/teachers/:id/slots`,
  `POST /api/bookings` — same "one file to edit" pattern as the auth
  layer would apply here once you're ready).

## Other completeness fixes in this pass

- **"Teacher" nav link** was pointing nowhere (`href="#"`) — built a
  real public `/teachers` page ("Teach with SE ONE": hero, benefits,
  how-it-works steps, requirements, signup CTA) and wired the navbar
  to it.
- **"Forget Password?"** on the login page now goes to a real
  `/forgot-password` page (email → confirmation), backed by a
  `requestPasswordReset()` stub in `lib/api/auth.ts` following the
  same documented-assumption pattern as `login()`/`register()`.
- **About page's "Explore Courses" buttons** pointed at `#courses`,
  which doesn't exist on that page (dead anchor) — now link to the
  real `/courses` page.
- **Footer's "Contact" and "FAQ" links** now go to the real Contact
  page (FAQ section has an `id="faq"` anchor); the rest of the footer
  catalog (IELTS Prep, Blog, etc.) is still `#` since those pages
  don't exist yet.
- **Courses page search** is now real: typing filters the course grid
  client-side by title/level/description instead of being decorative.

## Online class calls (student ↔ teacher)

Once a session is booked, both sides get a real way to actually get on
a call for it — not just a "Booked" label.

- **`lib/video-call.ts`** — `getRoomId(teacherId, slotId)` builds a
  deterministic room name from the two ids, and `getJitsiUrl(roomId)`
  points it at Jitsi Meet's free public server (`meet.jit.si`). No
  account, API key, or backend needed — this genuinely works, not just
  a UI mock. Both the student and teacher land in the same room
  because the room name is computed the same way on both sides from
  the same `teacherId`/`slotId` pair.
- **`components/shared/VideoCallRoom.tsx`** — the actual call screen:
  an iframe embed with camera/mic/fullscreen permissions, a header
  showing who you're in class with, and a back button.
- **`/dashboard/call/[roomId]`** (student) and
  **`/teacher/call/[roomId]`** (teacher) — thin pages that read the
  other person's name from a `?with=` query param and render
  `VideoCallRoom`.
- **"Join Online Class"** buttons were added next to each booked slot
  on both the student's "My Bookings" list and the teacher's
  Availability page (next to "Booked by a student").

**Production note:** the public Jitsi server is fine for testing this
end to end, but for a real product you'd likely want a self-hosted
Jitsi instance or a managed provider (Daily.co, Twilio Video, Zoom
SDK) for reliability, recording, and moderation — swapping that in is
a one-line change in `getJitsiUrl()`, everything else in this feature
is provider-agnostic.

## Booking sync across the student ↔ teacher dashboards (important caveat)

The video call technology itself (Jitsi) is fully real — but "does the
teacher know about the student's booking" needed real persistence to
actually be true end to end, since there's still no backend. Fixed
with a **localStorage-backed store** (`lib/slots-store.ts` +
`lib/use-teacher-slots.ts`):

- Each teacher's slots live under `se-one-slots-<teacherId>` in
  `localStorage`, seeded once from `lib/teachers-directory.ts`.
- The teacher's Availability page and the student's Find a Teacher
  page both read/write that same key. A `storage` event listener
  means if you open one dashboard as the student and the other as the
  teacher **in two tabs of the same browser**, booking a slot (or a
  teacher adding/removing one) shows up in the other tab within a
  moment — genuinely testable end to end on one device.
- **This only syncs within the same browser** (localStorage is
  per-origin-per-browser, not shared across devices or people). Two
  different real people on two different computers still won't see
  each other's changes — that needs an actual backend. When you wire
  one up, replace `loadSlots()`/`saveSlots()` with real API calls
  (`GET/POST /api/teachers/:id/slots`) — `useTeacherSlots` and both
  dashboard pages don't need to change shape, just where the data
  comes from.

## Admin dashboard

A third role/dashboard, alongside Student and Teacher — its own
sidebar/topbar shell (`components/admin-layout/`), its own nav config
(`lib/admin-nav.ts`), all under `/admin/*`.

- **`/admin`** — overview: student/teacher/course counts and how many
  courses currently have an active discount.
- **`/admin/students`** — searchable table of students
  (`lib/admin-data.ts`, admin-only mock data — there's no student
  directory elsewhere in the app), each with a **Delete** button
  (confirms, then removes from the table).
- **`/admin/teachers`** — same pattern, but reuses
  `lib/teachers-directory.ts` — that's already the canonical list of
  teacher accounts, so deleting here is deleting a real shared record,
  not a separate copy.
- **`/admin/courses`** — the discount feature: an editable discount %
  per course, backed by `lib/courses-pricing.ts` /
  `lib/use-courses-pricing.ts` (same localStorage + `storage`-event
  cross-tab-sync pattern as the teacher-slots feature). **This one
  actually shows up on the public site** — `LatestCourses.tsx` (used
  on Home, About, Courses) reads the same pricing store and renders a
  strikethrough original price + discounted price + a "-X%" badge
  whenever a course has `discountPercent > 0`. Set a discount in one
  tab, open the Courses page in another tab of the same browser, see
  it applied.
- **`/admin/settings`** — reuses the same `SettingsView` component as
  the other two dashboards.

**Both student and teacher deletion are local-only** (component
`useState`, not persisted) — deleting someone doesn't survive a page
reload. That's a deliberate scope call: real deletion needs a backend
call (`DELETE /api/admin/students/:id` / `.../teachers/:id`) with
consequences (their bookings, messages, etc.) that don't make sense to
fake convincingly client-side. The discount feature *is* persisted
(via localStorage) because it's meaningfully demonstrable without a
backend — you can watch it change the storefront live.

**Reaching the admin dashboard:** there's no self-service "become an
admin" flow, intentionally — admin accounts should be provisioned
directly in your backend, not through public signup. Once
`lib/api/auth.ts` is wired to a real API, logging in with an account
whose role is `"admin"` will redirect here automatically (`login()`
already reads whatever role the server returns). Until then, the same
caveat as `/teacher` applies: nothing stops someone from typing
`/admin` directly in the URL bar — see the "route guards" note under
the auth section above.

## Launch-readiness pass

A general audit for "can this actually launch as a real business," not
just a feature demo. Added:

**Legal pages** — `/privacy-policy` and `/terms`, bilingual, built from
a standard template (`lib/i18n/dictionary.ts` → `legal.*`). **These
need a real lawyer's review before an actual launch** — there's a
visible disclaimer banner on both pages saying exactly that, so it
doesn't get missed. Wired real links: the footer's "Privacy Policy"
item, and the signup page's Terms/Privacy checkbox (previously both
`href="#"`).

**A real purchase flow** — this was a genuine gap: courses showed a
price but clicking a course card did nothing, and there was no way to
actually buy one.
- Course cards now link to `/courses/[courseId]` — a real detail page
  (description, "what you'll learn," what's included, price with any
  active discount applied).
- "Enroll Now" goes to `/checkout/[courseId]` — order summary +
  a card payment form → success screen → link to the dashboard.
- `lib/api/payments.ts` — `mockCharge()` fakes a successful charge
  after a short delay so the flow is fully testable, with detailed
  comments on how to wire a real processor (Stripe, PayPal, ZarinPal,
  etc.) in its place. **No real payment processing happens yet** —
  don't launch with this as-is; it needs a real gateway.

**Branded error states** — `app/[lang]/not-found.tsx` (404) and
`app/[lang]/error.tsx` (React error boundary), both bilingual and
on-brand instead of Next.js's plain defaults.

**Cookie consent banner** — `components/shared/CookieConsent.tsx`,
shown once (remembered via `localStorage`), links to the Privacy
Policy. Basic GDPR-style compliance; doesn't yet distinguish
"necessary vs. analytics" cookie categories, which a stricter EU
compliance posture would want.

**Basic SEO**:
- `app/robots.ts` and `app/sitemap.ts` (the private dashboards and
  `/checkout` are excluded from both — they shouldn't be indexed).
  Set `NEXT_PUBLIC_SITE_URL` in your env once you have a real domain;
  both files fall back to a placeholder otherwise.
- Per-page `<title>`/`<meta description>` on Home, About, Contact,
  Teachers, Privacy, and Terms (all server components, so this was
  straightforward). **Not done** on Login, Signup, and Courses — those
  three page files hold client-side state directly (`"use client"` on
  the page itself), and Next.js only allows `metadata` exports from
  server components. Fixing this means splitting each into a thin
  server `page.tsx` (metadata only) that renders a client child
  component — a clean, mechanical refactor, just not done here for
  time.
- A simple branded favicon (`app/icon.svg`) instead of the Next.js
  default.

## What I'd still flag before an actual launch

Being direct about what "launch as a complete business" still needs
beyond what's in this repo:

- **A real backend.** Nearly everything above says this in some form,
  but it bears repeating as one list: auth, bookings, discounts,
  admin deletions, and payments are all mock/local-only right now.
- **A real payment processor**, wired into `lib/api/payments.ts`.
- **Legal review** of the Privacy Policy and Terms before publishing
  them as binding.
- **Route protection** — `/dashboard`, `/teacher`, and `/admin` have
  no auth guard; anyone can type the URL. Needs middleware or
  layout-level session checks once there's a real backend session to
  check against.
- **Analytics** (GA4, Plausible, etc.) — not added; there's no
  tracking anywhere on the site currently.
- **A real domain + `NEXT_PUBLIC_SITE_URL`** for the sitemap/robots
  files and any social-share (Open Graph) metadata you add later.

## New features added in this pass

**Wishlist / Saved Courses** — a heart button on every course card
(home, courses, about) and on the course detail page, backed by
`lib/wishlist-store.ts` (localStorage). A new "Wishlist" item in the
student sidebar (`/dashboard/wishlist`) lists saved courses with
current pricing/discount applied and a remove button.

**Course reviews & related courses** — the course detail page was
fairly bare before (just a description and a buy button). Added:
- `components/marketing/course-detail/CourseReviews.tsx` — star
  rating summary + individual reviews, from `lib/course-reviews.ts`
  (mock data, a few reviews per course).
- `components/marketing/course-detail/RelatedCourses.tsx` — a "you
  might also like" strip of the other 3 courses, for cross-sell.

**Public Instructors page** (`/our-instructors`) — a real showcase of the
teacher directory (reusing `lib/teachers-directory.ts`, the same data
students pick from when booking), with a CTA at the bottom linking to
the "Teach with SE ONE" recruitment page. Wired the footer's
previously-dead "Our Story" and "Instructors" links to `/about` and
`/our-instructors`.

**Installable as an app (PWA)** — `app/manifest.ts` (Next.js's
file-based convention, auto-linked in `<head>`) with the SE ONE name,
brand colors, and the existing SVG favicon as its icon. Modern mobile
browsers will now offer "Add to Home Screen" / "Install App."

## Still-open ideas (not implemented, for a future pass)

- Metadata on Login, Signup, and Courses pages (blocked on those being
  client components — needs the server/client split refactor
  mentioned above).
- `loading.tsx` skeleton states for slower routes.
- A real blog (footer still links "Learning Blog" nowhere) — would be
  a meaningfully large addition (a whole content model + reader), not
  attempted here.
- "Careers" footer link — still a placeholder; only worth a real page
  once there's something to say.
- Reviews/wishlist are localStorage-only, same caveat as everything
  else mock — real persistence needs the backend.

## UI/UX audit pass

A systematic review across the codebase for the classic bugs that
don't show up until you actually flip to RTL or type real text into a
form. Fixed:

**RTL layout bugs** (fixed `left`/`right`/`ml`/`mr`/`pl`/`pr` that
don't mirror in Persian, vs. logical `start`/`end`/`ms`/`me`/`ps`/`pe`
that do):
- Student dashboard `CourseCard` — the "In Progress" and price badges
  were pinned to physical left/right instead of flipping sides in RTL.
- `MessagesView` — the active-conversation accent border and the
  mobile back button's spacing.
- Table headers in the admin (Students/Teachers/Courses) and
  assignments tables were hard-`text-left`.
- `ClassPanel` (dashboard class list times) and message timestamps
  were hard-`text-right`.
- Settings page's sidebar tab buttons were hard-`text-left`.

**Input direction bugs** — email and password fields (and a few plain
email inputs: newsletter, subscribe banner, contact form) had no
explicit `dir`, so in Persian mode they'd inherit `rtl` and right-align
Latin text while you typed it — a small but very noticeable bug the
first time you actually type an email address on a right-to-left
page. All of these (plus card number/expiry/CVV, phone number, and the
OTP boxes, which were already correct) now force `dir="ltr"`.

**Verified clean** (checked, no changes needed): course description
text has `line-clamp-2` so card heights stay even in a grid regardless
of description length; sidebar labels and topbar titles have
`truncate`; no fixed-pixel-width containers wrap translatable text
(the few `w-[Npx]` uses are all icon circles, avatars, or numeric
inputs); directional arrow icons (`ArrowRight`/`ArrowLeft`/
`ChevronRight`) consistently flip via `rtl:rotate-180` across both the
older and newly-added pages.

This was a code-level review (grep + manual read), not a rendered
visual pass — I don't have a way to actually launch the app and take
screenshots in this environment. Worth a real click-through in both
languages before shipping, especially the RTL/LTR mixing on the
checkout and settings forms.
