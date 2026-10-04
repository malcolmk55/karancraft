# معماری بک‌اند و پایگاه داده — نسخه‌ی توسعه‌یافته

> این سند معماری فنی بک‌اند، ساختار پایگاه داده، و استراتژی مهاجرت از حالت فعلی (localStorage) به یک سیستم واقعی سمت سرور را تشریح می‌کند. مرجع فاز ۱ در `02-technical-spec.md` و نقشه‌راه کلی در `03-mvp-roadmap.md` است.

## ۱. وضعیت فعلی و نیاز به تغییر

### مشکلات حالت فعلی:
- **localStorage** تنها محل ذخیره‌ی داده‌هاست — بدون سرور، بدون پایگاه داده.
- داده‌ها فقط روی مرورگر کاربر ذخیره می‌شوند و با پاک شدن کش مرورگر از بین می‌روند.
- امکان دسترسی هم‌زمان از چند دستگاه وجود ندارد.
- هیچ مکانیزم احراز هویت واقعی وجود ندارد.
- امنیت داده‌ی سلامت بیمار تأمین نمی‌شود.

### هدف:
ساخت یک بک‌اند واقعی با پایگاه داده‌ی رابطه‌ای، API ساختاریافته، احراز هویت، و حفاظت قوی از داده‌ها.

## ۲. پشته‌ی فنی پیشنهادی

| لایه | انتخاب پیشنهادی | دلیل |
|------|-----------------|------|
| فریم‌ورک | Next.js (API Routes / Route Handlers) | سازگار با فرانت‌اند فعلی، بدون نیاز به سرویس جدا |
| ORM | Prisma | تایپ‌سیف، مهاجرت خودکار، سازگاری عالی با TypeScript |
| پایگاه داده | PostgreSQL | پشتیبانی از JSON ساختاریافته، رمزنگاری، عملکرد بالا |
| کش (اختیاری) | Redis | برای نشست‌ها (sessions) و جست‌وجوی سریع |
| احراز هویت | NextAuth.js / Auth.js | سازگاری بومی با Next.js، پشتیبانی از JWT و session |

> نکته: اگر در آینده نیاز به میکروسرویس‌ها باشد، می‌توان بک‌اند را به یک سرویس مستقل (مثلاً NestJS یا FastAPI) منتقل کرد. طراحی API باید از همان ابتدا طوری باشد که این انتقال بدون شکستن فرانت‌اند ممکن باشد.

## ۳. موجودیت‌های داده (Data Entities)

### ۳.۱. موجودیت‌های هسته‌ای (از فاز ۱ گسترش یافته)

```
User (کاربر سیستم)
├── id                  UUID, PK
├── email               UNIQUE, NOT NULL
├── passwordHash        NOT NULL
├── role                ENUM: admin | doctor | receptionist
├── isActive            BOOLEAN, DEFAULT true
├── lastLoginAt         TIMESTAMP
├── createdAt           TIMESTAMP
├── updatedAt           TIMESTAMP
└── twoFactorEnabled    BOOLEAN, DEFAULT false  [آینده]

Doctor (پزشک — پروفایل تخصصی)
├── id                  UUID, PK
├── userId              FK → User.id, UNIQUE
├── fullName            NOT NULL
├── medicalCouncilNumber  UNIQUE
├── specialties         SpecialtyType[]
├── bio                 TEXT (اختیاری)
├── avatar              URL (اختیاری)
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

Receptionist (منشی مطب)
├── id                  UUID, PK
├── userId              FK → User.id, UNIQUE
├── fullName            NOT NULL
├── officeId            FK → MedicalOffice.id
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

MedicalOffice (مطب)
├── id                  UUID, PK
├── name                NOT NULL
├── address             TEXT
├── phone               VARCHAR
├── city                VARCHAR
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

DoctorOffice (ارتباط پزشک-مطب — چند به چند)
├── id                  UUID, PK
├── doctorId            FK → Doctor.id
├── officeId            FK → MedicalOffice.id
├── role                ENUM: owner | member
├── joinedAt            TIMESTAMP
└── UNIQUE(doctorId, officeId)
```

### ۳.۲. موجودیت‌های بیمار و ویزیت (گسترش‌یافته)

```
Patient (بیمار)
├── id                  UUID, PK
├── fullName            NOT NULL
├── nationalId          VARCHAR, NULLABLE, INDEX
├── phone               VARCHAR, NOT NULL
├── birthDate           DATE, NULLABLE
├── sex                 ENUM: male | female | other
├── bloodType           VARCHAR, NULLABLE
├── allergies           TEXT[], NULLABLE
├── chronicConditions   TEXT[], NULLABLE
├── notes               TEXT, NULLABLE (رمزنگاری‌شده)
├── createdByDoctorId   FK → Doctor.id
├── createdByOfficeId   FK → MedicalOffice.id
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

Visit (ویزیت / مراجعه)
├── id                  UUID, PK
├── patientId           FK → Patient.id
├── doctorId            FK → Doctor.id
├── officeId            FK → MedicalOffice.id
├── specialty           ENUM: general | internal | ...
├── visitDate           TIMESTAMP
├── status              ENUM: draft | finalized
├── durationSeconds     INTEGER
├── chiefComplaintIds   TEXT[]
├── customChiefComplaints TEXT[]  [فاز ۲: متن‌های سفارشی خارج از الگو]
├── vitals              JSONB
├── examFindingsIds     TEXT[]
├── customExamFindings  TEXT[]    [فاز ۲: متن‌های سفارشی خارج از الگو]
├── diagnosisIds        TEXT[]
├── customDiagnoses     TEXT[]    [فاز ۲: متن‌های سفارشی خارج از الگو]
├── itemModifiers       JSONB     [یادداشت‌های متصل به شناسه‌ها]
├── planNotes           TEXT
├── freeTextFallback    TEXT, NULLABLE
├── createdAt           TIMESTAMP
├── updatedAt           TIMESTAMP
└── finalizedAt         TIMESTAMP, NULLABLE
```

### ۳.۳. موجودیت‌های ارتباطات و اشتراک‌گذاری

```
DoctorConnection (ارتباط بین پزشکان)
├── id                  UUID, PK
├── requesterId         FK → Doctor.id
├── receiverId          FK → Doctor.id
├── status              ENUM: pending | accepted | rejected | blocked
├── requestedAt         TIMESTAMP
├── respondedAt         TIMESTAMP, NULLABLE
└── UNIQUE(requesterId, receiverId)

SharedPatient (اشتراک‌گذاری بیمار)
├── id                  UUID, PK
├── patientId           FK → Patient.id
├── ownerDoctorId       FK → Doctor.id
├── sharedWithDoctorId  FK → Doctor.id
├── accessLevel         ENUM: read_only | read_write
├── patientConsent      BOOLEAN, DEFAULT false  [بسته به الزامات قانونی]
├── sharedAt            TIMESTAMP
├── revokedAt           TIMESTAMP, NULLABLE
├── isActive            BOOLEAN, DEFAULT true
└── UNIQUE(patientId, ownerDoctorId, sharedWithDoctorId)
```

### ۳.۴. موجودیت‌های اشتراک و پرداخت

```
SubscriptionPlan (طرح اشتراک)
├── id                  UUID, PK
├── name                ENUM: trial | bronze | silver | gold
├── displayName         VARCHAR  (مثلاً «برنزی», «نقره‌ای», «طلایی»)
├── maxPatients         INTEGER  (20, 100, 500, -1 برای نامحدود)
├── priceMonthly        DECIMAL
├── priceAnnual         DECIMAL
├── features            JSONB    (لیست قابلیت‌های فعال)
├── isActive            BOOLEAN
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

DoctorSubscription (اشتراک فعال پزشک)
├── id                  UUID, PK
├── doctorId            FK → Doctor.id
├── planId              FK → SubscriptionPlan.id
├── status              ENUM: active | expired | cancelled | past_due
├── currentPeriodStart  TIMESTAMP
├── currentPeriodEnd    TIMESTAMP
├── trialEndsAt         TIMESTAMP, NULLABLE
├── autoRenew           BOOLEAN, DEFAULT true
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP

PaymentTransaction (تراکنش‌های پرداخت)
├── id                  UUID, PK
├── doctorId            FK → Doctor.id
├── subscriptionId      FK → DoctorSubscription.id
├── amount              DECIMAL, NOT NULL
├── currency            VARCHAR, DEFAULT 'IRR'
├── gateway             VARCHAR  (مثلاً zarinpal, idpay)
├── gatewayRefId        VARCHAR, NULLABLE
├── status              ENUM: pending | success | failed | refunded
├── paidAt              TIMESTAMP, NULLABLE
├── createdAt           TIMESTAMP
└── updatedAt           TIMESTAMP
```

### ۳.۵. موجودیت‌های امنیتی و لاگ

```
AuditLog (لاگ ممیزی)
├── id                  UUID, PK
├── userId              FK → User.id
├── action              VARCHAR  (مثلاً patient.create, visit.finalize, patient.share)
├── entityType          VARCHAR  (مثلاً Patient, Visit)
├── entityId            UUID
├── metadata            JSONB    (جزئیات تغییرات — قبل/بعد)
├── ipAddress           VARCHAR
├── userAgent           VARCHAR
├── createdAt           TIMESTAMP
└── INDEX(userId, action, createdAt)
```

## ۴. معماری API

### ۴.۱. ساختار مسیرها (Route Structure)

```
/api/v1/
├── auth/
│   ├── login           POST
│   ├── logout          POST
│   ├── refresh         POST
│   └── me              GET
│
├── admin/
│   ├── users/          GET, POST
│   ├── users/:id       GET, PATCH, DELETE
│   ├── offices/        GET, POST
│   ├── offices/:id     GET, PATCH, DELETE
│   └── audit-logs/     GET
│
├── doctors/
│   ├── profile         GET, PATCH
│   ├── offices/        GET
│   ├── search          GET    (جست‌وجوی پزشکان برای ارتباط)
│   ├── connections/    GET, POST
│   ├── connections/:id PATCH  (قبول/رد درخواست)
│   └── subscription/   GET
│
├── patients/
│   ├── /               GET, POST
│   ├── /:id            GET, PATCH, DELETE
│   ├── /:id/visits     GET
│   ├── /:id/share      POST   (اشتراک‌گذاری با پزشک متصل)
│   └── /:id/share/:shareId  DELETE (لغو اشتراک‌گذاری)
│
├── visits/
│   ├── /               GET, POST
│   ├── /:id            GET, PATCH
│   ├── /:id/finalize   POST
│   └── /:id/voice      POST   [فاز AI]
│
├── templates/
│   ├── /               GET
│   └── custom          POST
│
└── subscriptions/
    ├── plans           GET
    ├── subscribe       POST
    ├── cancel          POST
    └── payment/verify  POST
```

### ۴.۲. اصول طراحی API

- **نسخه‌بندی:** همه‌ی مسیرها با `/api/v1/` شروع می‌شوند تا در آینده بتوان نسخه‌ی ۲ را بدون شکستن کلاینت‌های قدیمی اضافه کرد.
- **احراز هویت:** هر درخواست (به‌جز `auth/login`) باید توکن معتبر داشته باشد.
- **مجوزدهی:** هر endpoint بررسی می‌کند که نقش کاربر اجازه‌ی آن عمل را دارد (middleware سطح مسیر).
- **پاسخ استاندارد:** همه‌ی پاسخ‌ها ساختار یکسان دارند:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 },
  "errors": []
}
```

## ۵. امنیت و حفاظت از داده‌ها

> **داده‌ی سلامت بیمار حساس‌ترین نوع داده‌ی شخصی است.** حتی قبل از رعایت الزامات رسمی (مشابه HIPAA)، حداقل‌های زیر باید از ابتدا رعایت شوند.

### ۵.۱. رمزنگاری

| لایه | روش |
|------|-----|
| انتقال (Transit) | TLS 1.3 الزامی برای همه‌ی ارتباطات |
| ذخیره (At Rest) | رمزنگاری دیسک در سطح دیتابیس (PostgreSQL TDE یا رمزنگاری سطح ابر) |
| فیلدهای حساس | رمزنگاری سطح اپلیکیشن (AES-256) برای فیلدهای خاص مثل `nationalId`، `notes`، `allergies` |

### ۵.۲. کنترل دسترسی

- **اصل حداقل دسترسی (Least Privilege):** هر کاربر فقط به داده‌هایی دسترسی دارد که مستقیماً مربوط به نقش اوست.
- **Row-Level Security:** هر پزشک فقط بیماران خودش و بیمارانی که با او به اشتراک گذاشته شده‌اند را می‌بیند.
- **منشی:** فقط بیماران مطب خودش را می‌بیند و فقط اطلاعات پایه‌ی بیمار را ایجاد/ویرایش می‌کند (نه ویزیت و تشخیص).
- **ادمین:** دسترسی مدیریتی به همه‌ی داده‌ها با لاگ ممیزی کامل.

### ۵.۳. لاگ ممیزی (Audit Trail)

هر عملیات حساس شامل موارد زیر لاگ می‌شود:
- ایجاد، ویرایش، و حذف پرونده‌ی بیمار
- نهایی‌سازی ویزیت
- اشتراک‌گذاری و لغو اشتراک‌گذاری بیمار
- ورود و خروج کاربر
- تغییر نقش و دسترسی
- دسترسی ادمین به داده‌های حساس

### ۵.۴. پشتیبان‌گیری و بازیابی

- پشتیبان‌گیری خودکار روزانه از پایگاه داده
- نگهداری حداقل ۳۰ روز پشتیبان
- تست بازیابی ماهانه
- پشتیبان‌های رمزنگاری‌شده

### ۵.۵. الزامات آینده

- بررسی قوانین حفاظت از داده‌ی سلامت در ایران پیش از عرضه‌ی تجاری
- آمادگی برای الزامات مشابه HIPAA (آمریکا) یا GDPR (اروپا) در صورت گسترش بین‌المللی
- جزئیات بیشتر در `04-open-decisions-log.md` بند ۶

## ۶. استراتژی بهینه‌سازی هزینه‌های زیرساخت (Cost Optimization)

برای پایین نگه‌داشتن هزینه‌های نگهداری (Maintenance) ضمن حفظ پایداری و کیفیت، رویکردهای زیر اتخاذ می‌شود:

### ۶.۱. احراز هویت دومرحله‌ای (2FA): TOTP به جای SMS
ارسال پیامک (SMS) در ایران به دلیل قطعی‌های مکرر، مسدود بودن پیامک‌های تبلیغاتی و هزینه‌های رو به افزایش، پایداری و توجیه اقتصادی پایینی برای ورود روزمره دارد. 
- **رویکرد پیشنهادی:** استفاده از **TOTP (Google Authenticator / Authy)** به عنوان روش اصلی و **کاملاً رایگان** برای ورود پزشکان و ادمین‌ها.
- **مزیت:** امنیت بسیار بالاتر نسبت به SMS (مقاوم در برابر SIM Swapping) و کاهش هزینه ارسال پیامک به صفر. پیامک صرفاً به عنوان یک روش ریکاوری (پولی) در نظر گرفته می‌شود.

### ۶.۲. زیرساخت و سرور (Hosting & Database)
خرید یا اجاره سرورهای اختصاصی گران‌قیمت (Dedicated Servers) در ابتدای کار توجیه ندارد.
- **رویکرد پیشنهادی:** استفاده از پلتفرم‌های ابری مدیریت‌شده (PaaS) داخلی مانند **لیارا (Liara)** یا **آروان‌کلاد (ArvanCloud)** برای هاستینگ Next.js و دیتابیس PostgreSQL.
- **مزیت:** پرداخت به اندازه مصرف (Pay-as-you-go)، بک‌آپ‌گیری خودکار دیتابیس، عدم نیاز به استخدام نیروی DevOps برای نگهداری اولیه، و حضور داده‌ها در داخل کشور جهت تطابق با قوانین حریم خصوصی.

## ۷. استراتژی مهاجرت از localStorage

### مرحله ۱: آماده‌سازی
- راه‌اندازی PostgreSQL و Prisma
- تعریف schema بر اساس موجودیت‌های بالا
- ایجاد migration اولیه

### مرحله ۲: لایه‌ی انتزاعی (Abstraction Layer)
- ایجاد یک لایه‌ی سرویس (`services/`) که هم API بک‌اند و هم localStorage را پشتیبانی کند
- با یک فلگ (feature flag) می‌توان بین دو حالت سوییچ کرد
- این کار امکان توسعه‌ی تدریجی و تست را فراهم می‌کند

### مرحله ۳: مهاجرت داده
- ابزار خودکار برای خواندن داده از localStorage و درج در دیتابیس
- اعتبارسنجی داده‌ها در هنگام مهاجرت
- امکان بازگشت (rollback) در صورت مشکل

### مرحله ۴: حذف localStorage
- پس از اطمینان از صحت عملکرد بک‌اند، وابستگی به localStorage حذف شود
- فایل‌های `lib/storage.ts` و `lib/mock-data.ts` آرشیو و سپس حذف شوند

---

> **قابلیت گسترش:** این سند برای افزودن موجودیت‌ها و مسیرهای جدید طراحی شده و با هر فاز جدید محصول باید به‌روزرسانی شود.
