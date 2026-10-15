# کامپایلر Raz — Gen2

Raz یک زبان اسکریپتی است که فعلاً به C++17 تبدیل می‌شود. فایل ورودی می‌تواند کد سطح فایل داشته باشد و به تعریف `main` احتیاج ندارد. کامپایلر فعال در `compiler/razc/bin/razc` است؛ سورس اصلی نیز به ماژول‌های کوچک‌تر در `compiler/razc/src/` تقسیم شده است.

## ساختار

```text
compiler/razc/
├── compiler.raz             # ورودی و گراف include کامپایلر
├── bin/razc                 # کامپایلر فعال Gen2
└── src/
    ├── core/                # lexer، parser و RIR
    ├── model/               # AST و مدل‌های مشترک
    ├── source/              # include، module resolution و define
    ├── validation/          # تحلیل معنایی و اعتبارسنجی RIR
    ├── targets/cpp17/       # backend C++17
    └── driver/              # CLI کامپایلر

library/raz/std/              # کتابخانهٔ استاندارد Raz
 tests/run-tests.raz          # test runner نوشته‌شده با Raz
 tests/manifest.json          # سناریوها و انتظار خروجی C++
 tests/run-tests              # ساخت دستی test runner به باینری native
 raz.env                      # تنظیمات سراسری پروژه
```

سورس‌ها و کتابخانه‌های نسل قدیمی دیگر بخشی از ساختار فعال نیستند. برای حفظ تاریخچه، از commit و tag در Git استفاده می‌شود؛ کپی دائمی نسل‌های قدیمی داخل پروژه لازم نیست.

## Build کامپایلر

ساخت compiler candidate عمداً ساده و قابل‌مشاهده است. در ریشهٔ پروژه اجرا کن:

```sh
./compiler/razc/bin/razc compiler/razc/compiler.raz \
  --emit-cpp compiler/razc/build/compiler.cpp

. ./options
g++ -std=c++17 $CXXFLAGS -I library/raz \
  compiler/razc/build/compiler.cpp -o compiler/razc/build/razc-candidate

./compiler/razc/build/razc-candidate --version
```

ابتدا candidate را بررسی کن؛ بعد از موفق‌شدن تست‌ها می‌توان آن را دستی به `compiler/razc/bin/razc` ارتقا داد. باینری فعال را خودکار و بدون بررسی جایگزین نکن.

## تست‌ها بدون Node.js

`tests/manifest.json` تعریف تست‌ها را نگه می‌دارد. اجرای آن در خود Raz انجام می‌شود:

```sh
./tests/run-tests             # فقط ساخت tests/run-tests.out
./tests/run-tests.out         # اجرای تست‌ها
```

Runner فایل JSON را با `std.json` می‌خواند و همهٔ سناریوها را تا حد تولید C++ ادامه می‌دهد. فایل‌های `.cpp` کنار سورس‌های `.raz` باقی می‌مانند تا خروجی‌ها دستی بررسی شوند. Runner کد C++ را نمی‌سازد یا اجرا نمی‌کند؛ سناریوهای منفی فقط ردشدن سورس نامعتبر را کنترل می‌کنند. گزینه‌های پیش‌فرض GNU C++ در فایل `options` هستند و بیلدهای تولیدی به‌صورت static و stripped ساخته می‌شوند.

`raz.env` با syntax سادهٔ assignment نوشته شده است و launcherهای Shell و درایور native آن را می‌خوانند. مقدارهای فعلی:

```sh
RAZC=./compiler/razc/bin/razc
CXX=g++
RAZ_LIBRARY=./library/raz
RAZ_TEST_MANIFEST=./tests/manifest.json
```

## دو روش فراخوانی

فراخوانی با پرانتز همچنان پشتیبانی می‌شود:

```raz
print("hello");
let result = add(20, 22);
```

فراخوانی کوتاه بدون پرانتز فقط یک آرگومان می‌پذیرد:

```raz
print "hello";
let result = calculate 40;
let total = add(20, 22);
```

فراخوانی چندآرگومانی باید پرانتز داشته باشد. نام تابع به‌تنهایی آن را اجرا نمی‌کند؛ می‌توان آن را به‌عنوان function value ذخیره کرد و بعد فراخواند:

```raz
let callback = meaning;
let answer = callback();
let other = meaning();
```

`include` در مرحلهٔ پیش‌پردازش انجام می‌شود و هر دو شکل را می‌پذیرد:

```raz
include "src/module.raz";
include("src/module.raz");
```

مسیر include نسبت به فایل شامل‌کننده محاسبه می‌شود. `include` مسیر ثابت و رشته‌ای در زمان کامپایل است، نه تابعی برای بارگذاری runtime. فراخوانی native همچنان از نشانگر صریح `name!(...)` استفاده می‌کند.

## کتابخانه‌های جدید

- `std.json`: parser JSON نوشته‌شده با Raz. سند به شکل جدول گره‌ها نگهداری می‌شود؛ آرایه و شیء با index به فرزندانشان اشاره می‌کنند. kindها: `0=null`، `1=string`، `2=number`، `3=boolean`، `4=array`، `5=object`.
- `std.process`: تابع `exec(command)` که خروجی استاندارد و خطا را جمع می‌کند، منتظر پایان فرایند می‌ماند و کد خروجی را از `exitCode()` می‌دهد. در این نسخه اجرای command از shell انجام می‌شود؛ ورودی command باید قابل‌اعتماد باشد.

نمونهٔ API JSON:

```raz
use std.json;
let doc = jsonParse("{\"ok\":true,\"items\":[1,2]}");
let items = jsonObjectGet(doc, doc.root, "items");
let count = jsonArrayLength(doc, items);
```

## محدوده و محدودیت‌ها

- Backend فعلی C++17 است؛ کامپایلر C++ واقعی مسئول بررسی نحوی و نوعی نهایی C++ تولیدشده است.
- `std.process.exec` synchronous است و خروجی stdout/stderr را با هم برمی‌گرداند؛ API stream/poll/timeout هنوز وجود ندارد.
- رشته‌های JSON escapeهای رایج را decode می‌کنند. escapeهای `\\uXXXX` در این نسخه به‌شکل متنی نگه داشته می‌شوند؛ تبدیل کامل Unicode هنوز پیاده‌سازی نشده است.
- `new Struct()` مقدار پیش‌فرض می‌سازد؛ سازنده با آرگومان فعلاً رد می‌شود تا بی‌صدا نادیده گرفته نشود.
- فراخوانی بدون پرانتز از جداکنندهٔ خط و comma استفاده می‌کند. اگر عبارت مبهم است، شکل پرانتزی صریح‌تر است.
