# WalletSync Session, Dashboard, and Stability Fix Plan

## Objective and Current Status

Fix the stale-tab problem where an authenticated user later sees incorrect user information, empty graphs, `NaN`, broken pages, or permanent loading states.

The current uncommitted change set is on `fix/stale-session-data`; no commit has been created.

Current status: **production-build ready, not production-verified**. The implementation has been audited and the main stale-session, stale-data, invalid-number, lifecycle, and crash-recovery paths have been repaired. All edited frontend source files now pass ESLint with zero errors and zero warnings. Deployment still requires the staging/browser acceptance gates in this document.

Latest verification: the production frontend build succeeds; backend syntax checks and `git diff --check` succeed; no commit was created. Render and Vercel dashboards are not authenticated in the available browser session, and neither deployment CLI is installed, so deployment and authenticated browser acceptance tests remain external blockers.

## 1. Safe Working Baseline

- Keep the work on the existing user-selected branch.
- Preserve all existing user changes.
- Record the current behavior before changing it:
  - Login and dashboard loading.
  - Leaving a tab open for several hours.
  - Switching away from and back to the tab.
  - Logging out from another tab.
  - Render cold start.
  - Expired token.
  - Offline and online transitions.
- Capture browser-console errors and failed network requests for each case.

## 2. Repair Authentication and Session Handling

### Files to update

- `expense-manager-frontend/src/store/auth/thunk.js`
- `expense-manager-frontend/src/pages/admin/Layout.jsx`
- `expense-manager-frontend/src/pages/stripe/Success.jsx`
- `expense-manager-frontend/src/helpers/api_helper.js`
- `expense-manager-frontend/src/helpers/commonFunctions.js`

### Required changes

- Make `verifyTokenThunk` safe when called without an argument, or update every caller to pass the token.
- Replace all frontend `/login` redirects with the real frontend route `/sign-in`.
- Verify the token on initial application load.
- Verify the token when the tab becomes visible.
- Verify the token when the browser window regains focus.
- Synchronize logout and cross-account login between browser tabs; a changed token causes a clean reload so old Redux data cannot remain visible.
- Prevent multiple simultaneous token-verification/data-refresh requests.
- Clear the session only for confirmed `401` or `403` responses.
- Do not log the user out because of a timeout, offline state, or Render cold start.
- Remove only WalletSync-owned local-storage keys instead of calling `localStorage.clear()`.
- Decide whether the 30-day JWT is acceptable. If sessions must remain active longer, implement refresh tokens.

### Authentication states

Use explicit states instead of treating an empty user object as authenticated:

- `checking`
- `authenticated`
- `expired`
- `offline`
- `error`

Do not render the authenticated application until the initial session check has completed.

## 3. Add Centralized User-Data Bootstrap

Create a single Redux process, for example `bootstrapUserDataThunk`, to load:

- User profile.
- Accounts and account types.
- Groups and permissions.
- Currencies.
- Categories and labels.
- Payees.
- Planned payments.
- Budgets and templates.
- Notifications.
- Dashboard analytics.

Run this process after:

- Successful login.
- Successful token verification.
- Returning to an idle tab.
- Reconnecting after going offline.
- Switching groups.

Use independent request handling so one failed request does not prevent unrelated data from loading. Keep valid existing Redux data until replacement data loads successfully.

## 4. Repair Dashboard Refresh Logic

### Files to review

- `expense-manager-frontend/src/pages/admin/dashboard/index.jsx`
- `expense-manager-frontend/src/store/dashboard/thunk.js`
- `expense-manager-frontend/src/store/dashboard/slice.js`
- All dashboard widget components.

### Required behavior

When an idle tab becomes active:

1. Verify the token.
2. Reload accounts.
3. Reload dashboard analytics.
4. Reload page-specific data where required.
5. Keep existing graphs visible while refreshing.
6. Show a retry state if refresh fails.

The focus/visibility handler now verifies the token and refreshes accounts, analytics, and missing groups. Refs keep the latest filters without making Redux data changes recreate the lifecycle effect. Repeated focus/visibility events are deduplicated while a refresh is in flight.

## 5. Eliminate `NaN` and Invalid Numeric Values

Create a shared helper:

```js
export const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
```

Use it for:

- Account balances.
- Budget amounts.
- Spending totals.
- Cash-flow values.
- Chart series.
- Percentages.
- Planned payments.
- Transaction amounts.
- Currency conversions.

Every chart must receive finite numeric values only. Missing backend values must become `0`, `[]`, or `null` consistently.

## 6. Improve Loading, Empty, and Error States

Every page and dashboard widget must support:

- Loading state.
- Successful data state.
- Empty data state.
- Expired-session state.
- Offline state.
- Timeout state.
- API error state.
- Retry action.

Do not display:

- Fake email values such as `user@gmail.com`.
- `NaN` or `Infinity`.
- Blank graphs with no explanation.
- Endless loaders.
- A generic page crash when one widget fails.

The `ErrorBoundary` must be connected to a real refetch action. Resetting the component alone is not sufficient.

## 7. Correct React Lifecycle Side Effects

Move these operations into `useEffect` with cleanup:

- `window.message` listener.
- Service-worker registration.
- Notification listeners.
- Firebase `onMessage` listener.
- Online/offline listeners.

Notification permission, token acquisition, and Firebase listener setup are guarded so browser permission denial, unsupported browsers, or Firebase setup failures do not crash the authenticated layout.

Do not register browser listeners during component render. Remove unused imports and variables introduced in `App.jsx`.

## 8. Standardize API Error Handling

The API layer should normalize errors into a consistent shape:

```js
{
  status,
  message,
  code,
  isNetworkError
}
```

Rules:

- `401` or `403`: session handling.
- Timeout or network error: retry/offline handling.
- `400`: display validation message.
- `500`: display server-error state.
- Avoid duplicate toasts for the same request.
- Never automatically logout for network failures.
- Make reducers safe when `action.payload` is missing.

## 9. Improve Backend and Render Reliability

### Backend changes

- Keep `/api/health` for Render health checks.
- Return consistent error response objects.
- Log request ID, route, user ID, and failure reason.
- Handle database timeouts safely.
- Validate analytics input defensively.
- Normalize missing numeric values.
- Validate group and account permissions before returning them.

### CORS changes

Restrict CORS to approved production Vercel domains, preview domains, and localhost. The current implementation uses an explicit allowlist from environment configuration, with localhost and Vercel preview handling.

### Render changes

- Configure the Render health check as `/api/health`.
- Confirm the service starts successfully after sleeping.
- Add controlled retry/backoff for cold-start requests.
- Confirm the JWT secret is persistent across deployments.

## 10. Verify Deployment Environment Variables

Check Vercel and Render values for:

- API base URL.
- Production frontend host.
- JWT secret.
- Database URL.
- Firebase configuration.
- Stripe configuration.
- Allowed frontend origins.
- Render health-check path.

## 11. Add Automated Tests

Test at minimum:

- Missing token argument.
- Expired token.
- Invalid token.
- `401` response.
- `403` response.
- Timeout response.
- Offline response.
- Cross-tab logout.
- Cross-tab login.
- Idle-tab recovery.
- Duplicate focus events.
- Empty account list.
- Missing balance.
- Invalid chart values.
- Empty analytics response.
- Render cold-start retry.
- Browser refresh while authenticated.

## 12. Manual Acceptance Test Matrix

| Scenario | Expected result |
|---|---|
| Leave authenticated tab open for hours | User and existing data remain stable |
| Return to an idle tab | Token and data refresh automatically |
| Render is waking up | Loading/retry state appears; user is not logged out |
| Token expires | Redirect to `/sign-in` |
| Logout in another tab | Current tab logs out once |
| Login in another tab | Current tab refreshes user and data |
| Network goes offline | Offline state appears without session destruction |
| Network returns | Requests retry and data recovers |
| Missing numeric field | `0` or an empty state; never `NaN` |
| One widget fails | Only that widget shows an error |
| Browser refresh | User and graphs load correctly |
| Repeated focus events | No duplicate request storm |

## 13. Expanded Edge-Case Checklist

### Browser and tab lifecycle

- Leave the authenticated tab inactive for 6–12 hours or overnight.
- Put the laptop to sleep and wake it while the tab is open.
- Restore the browser after it has discarded or restored an old tab.
- Test offline → online and online → offline transitions.
- Confirm `visibilitychange` and `focus` refreshes are safe when fired repeatedly or in quick succession.

### API race conditions

- Make several API requests fail or return `401` at the same time and confirm only one session transition occurs.
- Refresh the token while multiple requests are pending.
- Return an older API response after a newer response and confirm the older response cannot overwrite current data.
- Confirm duplicate focus/visibility events do not create duplicate API calls.
- Verify request cancellation, timeout handling, and cleanup when a page is left or unmounted.

### React lifecycle and resource cleanup

- Audit every changed `useEffect` dependency list for stale closures and unintended reruns.
- Unmount pages while requests, timers, debounced callbacks, or notifications are active.
- Confirm no state update occurs after unmount.
- Confirm timers, event listeners, service-worker listeners, Firebase listeners, and subscriptions are removed.
- Repeat navigation and tab activation enough times to detect growing request/listener counts or memory leaks.

### Data and calculations

Test every relevant field with `null`, `undefined`, `""`, `0`, numeric strings, invalid strings, `NaN`, and `Infinity`.

- Confirm division-by-zero and invalid percentages have defined output.
- Confirm invalid dates do not crash formatting, sorting, filtering, or chart labels.
- Confirm empty, partial, malformed, and unexpected API payloads render safe states.
- Confirm zero remains zero and is not treated as missing data.

### Dashboard and graphs

- Empty dataset.
- All values equal to zero.
- Exactly one data point.
- Invalid or partially invalid chart data.
- One failed widget API while other widgets succeed.
- Loading, empty, error, retry, and refreshed states.
- Graph recovery after token expiry, sleep/wake, Render cold start, and network restoration.

No widget failure may blank or crash the entire dashboard. All chart inputs must be finite and intentional.

### Cache and data isolation

- Serve stale Redis data and confirm the UI does not treat it as a current-user response without validation.
- Verify cache keys include the correct user/group/account scope.
- Confirm User A can never receive User B’s cached profile, accounts, analytics, or graphs.
- Check browser, CDN, and API cache headers so an old authenticated response cannot be reused for another user.

### Multi-tab and user switching

- Logout in another tab.
- Login as another user in another tab.
- Refresh or rotate a token in another tab.
- Switch users without closing the browser.
- Confirm the old Redux state, profile, groups, accounts, and graphs are cleared or replaced before the new user is shown.

### Deployment compatibility

- Old frontend tab against the new backend.
- New frontend against the old backend during rollout/rollback.
- Vercel and Render environment-variable presence and values.
- Production CORS and preflight requests.
- API route/version compatibility between frontend and backend.

### Backend resilience

- Render cold start.
- Database connection drop and reconnect.
- Redis unavailable or timing out.
- Database/query timeout.
- Backend restart while requests are in flight.
- Unhandled promise rejection and malformed backend response paths.

## 14. Critical End-to-End Scenario

Run this scenario in a production-like environment with browser DevTools and network logs enabled:

1. Log in as User A.
2. Leave the tab open for 6–12 hours, or simulate the elapsed time and token expiry.
3. Let the token expire.
4. Make the backend temporarily unavailable, including a Render cold start or timeout.
5. Restore network/backend availability.
6. Return to the tab and trigger focus/visibility recovery.
7. Confirm APIs refresh without duplicate storms or stale responses overwriting newer data.
8. Confirm the dashboard loads, graphs calculate, and no `NaN`, `Infinity`, fake email, blank page, or endless loader appears.
9. Log out, then log in as User B.
10. Confirm only User B’s profile, accounts, analytics, and graphs are shown.

This scenario is a release blocker until it passes cleanly.

## 15. Quality Gate Before Production

Do not deploy until all of the following pass:

- Frontend build succeeds. Current verified result: succeeds; Vite reports only existing asset/chunk-size/lottie warnings.
- Lint succeeds or has an explicitly approved baseline. Current result: all edited frontend source files pass with zero errors and zero warnings; the repository-wide lint baseline still fails with unrelated legacy violations.
- Backend starts successfully.
- `/api/health` returns HTTP `200`.
- No fake user email is displayed.
- No `NaN` or `Infinity` appears in the UI.
- Dashboard graphs recover after tab inactivity.
- Network failure does not incorrectly logout users.
- Cross-tab synchronization works.
- Render cold-start recovery works.
- Browser-console errors are resolved.
- Production-like Vercel-to-Render testing succeeds.
- The complete expanded edge-case checklist above passes, or every exception is documented and explicitly accepted.
- The critical end-to-end scenario above passes from a clean browser session.

## Recommended Implementation Order

1. Authentication and redirect fixes.
2. Centralized data bootstrap.
3. Dashboard refresh and request deduplication.
4. Numeric and chart safety.
5. Loading/error/retry UI.
6. React lifecycle cleanup.
7. API retry and error normalization.
8. Backend CORS, logging, and health checks.
9. Automated and manual testing.
10. Staging deployment, then production deployment.
