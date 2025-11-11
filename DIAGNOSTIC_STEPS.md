# Firestore Write Diagnostic Steps

The app now has enhanced debugging enabled to help diagnose why notes are not being stored in Firestore.

## What Changed
- **AuthContext.jsx**: Added detailed logging for online/offline state, connection events, and admin fetch attempts with error codes.
- **Notes.jsx**: Added network state checks before write attempts, connection logging, and full error details (code, message) for each retry attempt.
- **firebase.config.js**: Exposed the Firebase app on `window.__FIREBASE_APP` for runtime inspection.

## Steps to Reproduce and Collect Diagnostics

### 1. Open the App in Browser
- Start the dev server: `npm run dev` (should already be running on http://localhost:5174/)
- Open http://localhost:5174/ in your browser.

### 2. Open DevTools
- Press **F12** to open Developer Tools.
- Go to the **Console** tab.

### 3. Sign In / Verify Auth
- If not already signed in, sign up or log in with an account.
- Watch the console for logs like:
  - `AuthContext: onAuthStateChanged fired, currentUser= ...`
  - `AuthContext.fetchAdmin: attempting fetch for uid= ...`
  - This will tell us if auth is working and if admin fetch is connecting.

### 4. Check Network Status
- In the **Console**, type and run: `navigator.onLine`
- It should return `true` (if offline, that's the issue).

### 5. Attempt to Add a Note
- Navigate to the **Notes** page.
- Fill in:
  - **Title**: "Test Note"
  - **Note content**: "Testing Firestore writes"
  - Pick a **Color** (any)
- Click **Add Note**.

### 6. Collect Console Output
- **Copy ALL console logs** from after the "Add Note" click. Look for:
  - `Notes.addNote: starting write attempt`
  - `Notes.addNote: navigator.onLine= ...`
  - `Notes.addNote: isOnline from context= ...`
  - `Notes.addNote: auth.app.options= ...`
  - `Notes.addNote: auth.currentUser= ...`
  - `Notes.addNote: user= ...`
  - `Notes.addNote: payload= ...`
  - `Notes.addNote: attempt 1/3`
  - Any error messages with `error code=` and `error message=`.

### 7. Collect Network Request Details
- Go to **DevTools → Network** tab.
- **Filter**: Type `firestore.googleapis.com` in the filter box.
- Click **Add Note** again (or find the previous request).
- You should see a request like `POST firestore.googleapis.com/...batchWrite...`
- **Click the request** and go to the **Response** tab.
- **Copy the full Response body** (it will show the Firestore error).
- Also note the **Status code** (e.g., 200, 403, 500, etc.).

### 8. Check Firestore Rules (Optional Quick Test)
- If you suspect security rules are blocking writes:
  - Go to [Firebase Console](https://console.firebase.google.com/) → Select your project (note-74e09).
  - Go to **Firestore Database** → **Rules**.
  - For a **quick diagnostic test**, replace rules with:
    ```
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```
  - **Publish** the rules.
  - Try adding a note again in the app.
  - If the note appears in Firestore, the problem is the original rules. **Revert the rules immediately after this test.**
  - If the note still doesn't appear, the problem is not the rules.

## What to Report Back
Paste the following here:

1. **Console logs** (from step 6, all the "Notes.addNote" and "AuthContext" messages).
2. **Network Response body** (from step 7, the Firestore API response).
3. **Network Status code** (e.g., 200, 403, 500).
4. **Did the test with permissive rules work?** (if you did step 8).
5. **Browser/OS**: Which browser and OS are you using?
6. **Network check**: Is `navigator.onLine` returning `true`?

---

## Quick Checks You Can Do Independently

### Check Firebase Config
In DevTools Console, run:
```javascript
window.__FIREBASE_APP.options
```
You should see an object with:
- `projectId: "note-74e09"`
- `authDomain: "note-74e09.firebaseapp.com"`
- `apiKey: "..."`

If the `projectId` doesn't match what you see in the Firebase Console, that's the issue.

### Check Current Auth User
```javascript
console.log(window.__FIREBASE_APP)
// Then in the returned object, look at "modules" and "auth" to see if auth is initialized
```

### Test Network Connectivity
```javascript
fetch('https://firestore.googleapis.com/').then(r => console.log('Network OK, status:', r.status)).catch(e => console.log('Network BLOCKED:', e))
```
If this fails, Firestore API is unreachable (firewall, proxy, extension blocking).

---

Once you provide the logs and network response, I can pinpoint the exact issue and provide a targeted fix.
