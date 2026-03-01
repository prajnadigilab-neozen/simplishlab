# Issue Tracker & Fixes Log
This document logs all encountered issues, their solutions, and the timestamp of their occurrence or resolution, starting from the beginning of the project's tracking history.

## [2026-02-28T15:06:57+05:30] Assessment "Next Lesson" Auto-Navigation
**Feature Addition:** Upon completing an assessment quiz, students were stranded on a static completion screen with only a button to return to the Dashboard or Library, interrupting learning flow.
**Implementation:** Refactored `AssessmentInterface.jsx` to natively calculate the student's current curriculum sequence positional `$Index`. Passed a global `onNextLesson` router prop down from `App.jsx`. When a quiz is finished, a background query calculates the canonical `display_order` hierarchy of all lessons (`Basic` -> `Expert`) and conditionally injects a "Continue to Next Lesson" button that hot-loads the very next coaching module. If the final lesson in the app is reached, it renders a custom golden "🌟 Curriculum Complete!" victory shield.

## [2026-02-28T15:00:44+05:30] Assessment "Submit" API 500 Internal Server Error
**Issue:** When clicking the "Submit Assessment" button at the end of a quiz, an Axios 500 Internal Server Error would crash the system without saving metrics.
**Solution:** The backend route `put('/assessments/submit')` explicitly enforces a `multipart/form-data` upload (to optionally receive audio/image processing binaries). The frontend `AssessmentInterface.jsx` was transmitting a raw JSON payload (`{ userId, assessmentId, answers }`). Thus, the `upload.any()` parser failed to interpret the payload, nullifying the `assessmentId` and throwing an exception in the Supabase query. Refactored the `AssessmentInterface.jsx` submit logic to securely natively map the answers payload into `const formData = new FormData()` structure before broadcasting to the backend.

## [2026-02-28T14:43:13+05:30] Dashboard "Continue" Next Lesson Sequence
**Issue:** The "Continue" (Pick up where you left off) card on the dashboard consistently pulled a seemingly random uncompleted lesson from the raw curriculum array instead of guiding the student in order.
**Solution:** The algorithm inside `Dashboard.jsx`'s `currentLesson` selection only grabbed the first uncompleted lesson without checking priority or curriculum hierarchy. Integrated a strict client-side sorting algorithm to organize lessons by `Level` and `Display Order`. Rewrote the selection priority matrix to explicitly search for partially complete lessons first, next canonical unstarted lessons second, and gracefully falling back to the start of the curriculum if 100% finished.


## [2026-02-28T14:33:42+05:30] My Library Module Reorganization
**Feature Update:** The "My Library" page exhibited all lessons in a continuous, unstructured grid. Students could not discern which lessons belonged to which difficulty tiers.
**Implementation:** Overhauled `Library.jsx` to map elements according to their officially assigned `Level` instead of rendering a flat data blob. Built animated, collapsible Module Header Wrappers (e.g., "Basic English") that natively inherit the progression locks built earlier. If a module is locked, it cannot be expanded. Furthermore, updated individual lesson cards to cross-reference `lesson.progress === 100` with the `lesson.score` from the backend data payload, ensuring complete and tested lessons publicly wear an "Assessment Score: X%" badge in place of the default "Learn" button.


## [2026-02-28T14:30:08+05:30] "Failed to load resource: 400 Bad Request" on LessonCreate
**Issue:** Submitting a completely new lesson through `LessonCreate.jsx` would immediately throw an AxiosError 400.
**Solution:** The backend router `lessonController.uploadLesson` had a lingering mandate that required at least 1 file to be attached to the multipart form upload. This restrictive condition was removed (`if (!pdfUrl && ...)`). The logic was updated to strictly require only the `title` and `level`, allowing entirely text-based or quiz-only lessons to successfully propagate through the creation pipeline.


## [2026-02-28T14:24:25+05:30] Library Lesson Progression Enforcement
**Feature Update:** My Library initially pre-loaded and allowed access to all curriculum modules ("Basic", "Intermediate", "Advanced", "Expert") simultaneously for all students without restriction.
**Implementation:** Refactored `Library.jsx` to inherit the linear progression algorithm from `Dashboard.jsx`. Re-routed data queries for students to securely fetch their specific completion data through `lessonApi.getMyProgress()`. My Library now intrinsically averages a module's progress logic; if the module's completion falls under 100%, the subsequent modules will visually lock (80% grayscale + padlock icon) and disable interactivity.


## [2026-02-28T14:10:01+05:30] Automated Daily Cleanup & Admin System Logs UI
**Feature Addition:** Deployed an automated script (`dailyCleanup.js`) using Node Cron to clear out junk files and orphaned data every night at Midnight. 
**Implementation:** Added a `system_logs` table to store execution reports natively in Supabase. Developed a dedicated Super Admin ONLY router endpoint (`/api/v1/auth/logs`) serving the daily run metrics. Updated the `UserManagement.jsx` frontend to render these system logs in a new tabbed interface, boosting administrative observability.



## [2026-02-28T14:04:24+05:30] "User Already Exists" Registration Error
**Issue:** Users deleted manually from the PostgreSQL `public.users` database table could not re-register, encountering an "User already exists. Please Sign In." error.
**Solution:** The error occurred because the users were hard-deleted from `public.users` but left behind in Supabase's internal authentication service (`auth.users`), occupying the phone numbers. Created and ran a Node script (`cleanupOrphanedUsers.js`) to programmatically delete these orphaned users from Supabase Auth via the Admin API.

## [2026-02-28T11:44:29+05:30] CoachingPage Progress Update 500 Error
**Issue:** Making POST requests to `/api/v1/lessons/:id/progress` triggered a 500 Internal Server error (`AxiosError: Request failed with status code 500`) when unmounting the audio coaching page.
**Solution:** The backend `lessonController.js` upsert payload included a `last_accessed_at` field which wasn't present in the `user_progress` database table schema. Removed `last_accessed_at` from the upsert payload as Supabase natively handles tracking via the `updated_at` column.

## [2026-02-28T11:44:29+05:30] Dashboard Crash on Login
**Issue:** `ReferenceError: isAdmin is not defined` occurred in `Dashboard.jsx`, resulting in a blank screen upon login for Admin users.
**Solution:** The `isAdmin` block variable declaration was enclosed inside a `useEffect` hook, but the variable was evaluated globally in the return render block. The variable was moved outside the `useEffect` hook to ensure the JS runtime could correctly evaluate the role constraints.

## [2026-02-27T08:00:00Z] Duplicate Export Causes React Failure
**Issue:** `LessonCreate.jsx` crashed with a 500 Internal Server Error due to a duplicate `export default LessonCreate` statement.
**Solution:** Traced the file contents and strictly removed the duplicate export block to restore frontend compilation stability.

## [2026-02-27T09:00:00Z] Assessment Question Visibility RLS Issue
**Issue:** Standard users (students) could not view the assessment questions; they were hidden from the UI due to missing database permission policies.
**Solution:** Added the missing `SELECT` Row Level Security (RLS) policy for the `assessments` table in `supabase_schema.sql` to grant authenticated users access to read definitions.

## [2026-02-26T10:31:55Z] Payment API Creation 404 Error
**Issue:** A 404 Not Found error occurred when attempting to create a payment order via the API endpoint `/v1/payments/create-order`.
**Solution:** Corrected the URL path construction logic within `PaymentGateway.jsx` matching the precise routing on the backend definitions.

## [2026-02-26T08:12:41Z] Dark Mode Text Visibility Failure
**Issue:** Vital text descriptions on the SIMPLISH landing page were completely invisible when the client operating system was set to dark mode due to hardcoded background inheritance limits.
**Solution:** Stripped static background and text hex values from the global styles, adopting a flexible system mapping to `var(--bg-main)` and `var(--text-main)`.

## [2026-02-26T03:04:14Z] Profile Update Triggers Unexpected Logout
**Issue:** Applying changes to the user profile caused an unexpected JWT 401 interceptor trigger, logging the user out instantly after form submission.
**Solution:** Debugged frontend request authorization headers alongside session validation controllers to ensure token stability correctly refreshed after profile modifications.

## [2026-02-25T15:09:23Z] Admin Features Hidden Due to Sync Error
**Issue:** Failed `GET /auth/profile` 404 requests sequentially blocked user Role Population (`super_admin` vs `user`), making features like "Lesson Upload" invisible for the platform owner.
**Solution:** Reimplemented the missing REST endpoint connecting mapped internal Database Roles back down to the React global state context layer.

## [2026-02-25T05:10:28Z] Placement Test Infinite Loading
**Issue:** The initial placement test evaluation stalled perpetually on page load.
**Solution:** Corrected state management triggers wrapping the Placement module evaluation hooks, successfully resolving race conditions during user initialization.

## [2026-02-21T04:08:08Z] User Session Authentication Errors (422/406)
**Issue:** Application console logged a series of authentication breaking errors including:
1. "Invalid Refresh Token: Refresh Token Not Found"
2. "Failed to load resource: 422" (Signup failure)
3. "Failed to load resource: 406" (Profile fetch failure)
**Solution:** Addressed database schema validation mismatches and refined `authService.ts` to seamlessly handle authentication token renewals and session tracking logic correctly without abandoning the user context.
