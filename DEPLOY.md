# מדריך — הקמת Got Schooled על Supabase + Vercel

## סקירה כללית

האפליקציה עוברת מ-IndexedDB מקומי ל-Supabase (Postgres + Storage + Auth).
הפריסה ב-Vercel אוטומטית לכל push ל-`main`.

---

## שלב 1 — הקמת Supabase

### א. הרצת ה-migration

1. כנס ל-Supabase Dashboard של הפרויקט
2. SQL Editor → New query
3. העתק את כל התוכן של [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)
4. הרץ. תקבל "Success. No rows returned."

ה-migration יוצר:
- 11 טבלאות עם RLS (כל משתמש רואה רק את הנתונים שלו)
- Storage bucket בשם `user-files` עם RLS לפי תיקייה (`<user_id>/<file_id>`)
- Trigger אוטומטי שיוצר רשומות `settings` + `profile` לכל משתמש חדש

### ב. הגדרת Auth

Authentication → Providers → Email:
- **Enable Email provider**: ✓
- **Confirm email**: ביטול (לא נרצה אישור מייל לשני המשתמשים)
- **Secure email change**: ✓ (ברירת מחדל)
- **Secure password change**: ✓

Authentication → URL Configuration:
- **Site URL**: כתובת ה-Vercel (למשל `https://assaf-degree.vercel.app`)
- **Redirect URLs**: הוסף `https://*.vercel.app/**` ו-`http://localhost:5173/**` (למקרה של dev)

### ג. יצירת המשתמשים

Authentication → Users → Add user → Create new user:

**משתמש 1**:
- Email: `evyatarcohen51@gmail.com`
- Password: `IamGroot1!`
- Auto Confirm User: ✓

**משתמש 2**:
- Email: `Asf20c@gmail.com`
- Password: `IamGroot1!`
- Auto Confirm User: ✓

ה-trigger יוצר אוטומטית את שורות `settings` ו-`profile` עם `must_change_password = true` —
האפליקציה תכריח אותם להחליף סיסמה בכניסה הראשונה.

### ד. שליפת ה-credentials

Project Settings → API → Project API Keys:
- **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
- **anon public key**: `eyJ...` (זה ה-key הציבורי, מותר ב-frontend)

---

## שלב 2 — Env vars מקומיים (לפיתוח)

צור `/home/evyatar/projects/Assaf-Degree/.env.local`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

הקובץ ב-`.gitignore` ולא ייכנס ל-Git.

```bash
cd ~/projects/Assaf-Degree
npm run dev
```

פתח `http://localhost:5173` — אמור להיות דף Login.

---

## שלב 3 — Vercel deployment

### א. חיבור הפרויקט

1. Vercel Dashboard → Add New → Project
2. Import הריפו `Assaf-Degree` מ-GitHub
3. Framework: Vite (אוטומטי)
4. Build Command: `npm run build` (אוטומטי)
5. Output Directory: `dist` (אוטומטי)

### ב. Env vars ב-Vercel

Settings → Environment Variables → הוסף שניים (Production + Preview + Development):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | אותו URL מ-Supabase |
| `VITE_SUPABASE_ANON_KEY` | אותו anon key |

### ג. Deploy

לחץ Deploy. Vercel ירוץ build וייתן URL ציבורי.

החל מעכשיו, כל `git push origin main` יפעיל deploy אוטומטי.

### ד. עדכון Site URL ב-Supabase

חזור ל-Supabase → Authentication → URL Configuration → Site URL:
שים את הכתובת הציבורית של Vercel (מה ש-Vercel נתן לך, למשל `https://assaf-degree.vercel.app`).

זה חשוב כדי שקישור איפוס סיסמה יוביל למקום הנכון.

---

## שלב 4 — אימות

1. פתח את הקישור של Vercel
2. Login עם `evyatarcohen51@gmail.com` / `IamGroot1!`
3. תופנה לדף "הגדרת סיסמה ראשונית" — הכנס סיסמה חדשה
4. תופנה לדף ההגדרות — מלא מוסד / שנה / סמסטר / מקצועות / מערכת שעות
5. שמור — נכנס לדף הבית
6. **בדיקת sync**: פתח את אותו URL בטאבלט (כל מכשיר), Login עם אותו אקאונט — תראה את אותם נתונים
7. **בדיקת realtime**: שינוי במחשב יופיע בטאבלט בתוך שנייה
8. **בדיקת Forgot password**: בדף Login → "שכחתי סיסמה" → הזן מייל → תקבל מייל עם קישור איפוס

---

## תזכורות במייל (Resend + Vercel Cron)

האפליקציה תומכת בתזכורות אוטומטיות במייל למועדים קרובים. דורש שתי הגדרות חיצוניות.

### א. חשבון Resend

1. הרשמה: https://resend.com/signup (חינם, עד 100 מיילים ביום)
2. אחרי אימות מייל → Dashboard → **API Keys** → **Create API Key** → תן שם וגישה Full
3. שמור את ה-key (מתחיל ב-`re_`)
4. **From address**:
   - לבדיקה: `Got Schooled <onboarding@resend.dev>` (תקף מיד, ללא verify)
   - לפרודקשן: לאמת דומיין משלך תחת **Domains** ולהגדיר From `Got Schooled <noreply@yourdomain.com>`

### ב. Service Role Key של Supabase

API ה-cron צריך לעקוף RLS כדי לקרוא deadlines של כל המשתמשים. זה דורש את **Service Role Key** של Supabase (לעולם לא ב-frontend!).

Project Settings → API → **service_role secret** → העתק.

### ג. Vercel Env Vars (Production)

ב-Vercel Project → Settings → Environment Variables, הוסף:

| Name | Value |
|---|---|
| `SUPABASE_URL` | אותו URL כמו `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | ה-service_role secret מ-Supabase |
| `RESEND_API_KEY` | ה-key מ-Resend |
| `REMINDER_FROM` | `Got Schooled <onboarding@resend.dev>` (או הדומיין שלך) |

עשה **Redeploy** אחרי הוספת ה-env vars.

### ד. Vercel Cron

`vercel.json` כבר מגדיר cron יומי ב-6:00 UTC (9:00 שעון ישראל בקיץ, 8:00 בחורף):

```json
"crons": [{ "path": "/api/send-reminders", "schedule": "0 6 * * *" }]
```

Vercel free tier: עד 2 cron jobs, ריצה יומית. כדי לעבור לקצב גבוה יותר → upgrade.

### ה. בדיקה ידנית

אפשר להפעיל את ה-API ישירות:
```bash
curl https://YOUR-PROJECT.vercel.app/api/send-reminders
```
אמור להחזיר `{"ok": true, "sent": N, ...}`. בדוק בתיבת הדואר של המשתמש שמייל הגיע.

### ו. התנהגות הלוגיקה

- **תזכורת חד-פעמית**: לאחר שליחה — `reminder_sent_at` מתעדכן, ה-cron לא ישלח שוב.
- **תזכורת חוזרת** (כל יום/שבוע/חודש): לאחר שליחה — `reminder_email_at` מתקדם בכמות הימים שהוגדרה. אם cron החמיץ ימים, מתקדם עד שזה בעתיד.
- מיילים נשלחים רק כשתאריך התזכורת ≤ עכשיו, ונבחרים לפי `user_id` של ה-deadline ושולפים את המייל מ-`profile.email`.

---

## פתרון בעיות

| בעיה | פתרון |
|---|---|
| "Missing Supabase env vars" בעת `npm run dev` | בדוק ש-`.env.local` קיים ושיש בו את שני המשתנים |
| Login אומר "Invalid login credentials" | ודא שהמשתמש נוצר ב-Supabase ו-`Auto Confirm User` היה מסומן |
| לא רואה נתונים אחרי login | ודא שה-migration רץ בלי שגיאות; פתח Table Editor → `settings` ובדוק שיש שורה עם ה-`user_id` שלך |
| קבצים לא עולים | בדוק שה-Storage bucket `user-files` קיים (Storage → Buckets) |
| Forgot password לא עובד | בדוק Site URL ב-Authentication → URL Configuration |
| `useFirstRunGuard` בלולאה | ודא ש-`bootstrapped` מתעדכן ל-`true` בעת שמירת ההגדרות הראשונה |
| תזכורות במייל לא נשלחות | (1) `curl /api/send-reminders` ידנית כדי לראות שגיאות. (2) ודא ש-4 ה-env vars של reminders הוגדרו ב-Vercel. (3) Resend Dashboard → Logs לראות אם המיילים נשלחים. (4) בדוק שהמיילים לא הולכים לספאם. |

---

## מבנה Supabase

```
auth.users               ← Supabase Auth (מנוהל)
public.settings          ← הגדרות לכל משתמש (1:1)
public.profile           ← פרופיל אישי (1:1)
public.years             ← שנות לימודים
public.semesters         ← סמסטרים
public.subjects          ← מקצועות
public.homework          ← שיעורי בית
public.schedule_slots    ← שיעורים שבועיים
public.files             ← מטא-דאטה של קבצים (הקובץ עצמו ב-Storage)
public.notes             ← הערות חופשיות לכל מקצוע
public.recent_files      ← קבצים שנפתחו לאחרונה
public.deadlines         ← מועדים קרובים

storage.buckets          ← bucket אחד: 'user-files'
storage.objects          ← path: '<user_id>/<file_id>'
```

כל הטבלאות עם RLS — `auth.uid() = user_id`. אי אפשר לקרוא נתונים של משתמש אחר.
