# Cloud Pickers — הקמת חשבונות ספקים

מדריך להגדרת Google Drive / Dropbox / OneDrive בכפתור "העלה ממקור חיצוני" שב-TopicPage. כל ספק עצמאי — אפשר להגדיר רק חלק. ספק שלא הוגדר פשוט לא יוצג בתפריט.

לאחר ההקמה, מלא את המפתחות ב-`.env.local` (לפיתוח) וב-Vercel → Settings → Environment Variables (לפרודקשן).

---

## Google Drive

**משתני סביבה:** `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`

1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/) ופתח/בחר פרויקט.
2. **APIs & Services → Library** — הפעל את שני אלה:
   - **Google Picker API**
   - **Google Drive API**
3. **APIs & Services → OAuth consent screen** — הגדר אפליקציה (External, Testing מספיק לשימוש פרטי). הוסף את עצמך כ-Test User.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5173`, וכן ה-domain ב-Vercel (`https://YOUR-PROJECT.vercel.app`).
   - העתק את ה-Client ID → `VITE_GOOGLE_CLIENT_ID`.
5. **Credentials → Create Credentials → API key**
   - מומלץ להגביל את המפתח: **Application restrictions → HTTP referrers** עם `localhost:5173/*` ו-`YOUR-PROJECT.vercel.app/*`. **API restrictions → Google Picker API**.
   - העתק את ה-API key → `VITE_GOOGLE_API_KEY`.

הערה: קבצי Google Docs/Sheets/Slides מיוצאים אוטומטית כ-PDF בעת ההעלאה.

---

## Dropbox

**משתנה סביבה:** `VITE_DROPBOX_APP_KEY`

1. היכנס ל-[Dropbox App Console](https://www.dropbox.com/developers/apps).
2. **Create app**:
   - Choose an API: **Scoped access**
   - Choose the type of access: **Full Dropbox** (או **App folder** לפי העדפה — Chooser עובד עם שניהם)
   - Name your app: לדוגמה `got-schooled`.
3. בלשונית **Settings**:
   - **Chooser/Saver/Embedder domains** — הוסף `localhost:5173` ו-`YOUR-PROJECT.vercel.app`.
   - העתק את ה-**App key** → `VITE_DROPBOX_APP_KEY`.

לא צריך להגיש לבדיקה (production approval) — Chooser זמין מיידית.

---

## OneDrive

**משתנה סביבה:** `VITE_ONEDRIVE_CLIENT_ID`

1. היכנס ל-[Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade).
2. **New registration**:
   - Name: לדוגמה `got-schooled-onedrive`.
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**.
   - Redirect URI: **Single-page application (SPA)** → `http://localhost:5173`. אחרי הדפלוי הוסף גם `https://YOUR-PROJECT.vercel.app`.
3. בלשונית **Overview** העתק את ה-**Application (client) ID** → `VITE_ONEDRIVE_CLIENT_ID`.
4. **API permissions → Add a permission → Microsoft Graph → Delegated permissions** → סמן `Files.Read` (קריאה בלבד מספיקה לבחירת קובץ).

---

## בדיקה מהירה

לאחר עדכון `.env.local`:

```bash
npm run dev
```

נווט לכל נושא בתוך מקצוע. תחת "העלאת קבצים" אמור להופיע כפתור **"העלה ממקור חיצוני ▾"** שמציג רק את הספקים שהוגדרו. לחיצה על ספק פותחת את ה-picker שלו, ובסיום הקובץ הנבחר עולה ל-Supabase Storage ומופיע ב-`<FileList>`.
