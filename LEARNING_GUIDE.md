# Bookmark Manager: The Complete Learning Guide

**Angular + Django REST Framework, explained from the very beginning, line by line.**

This guide contains everything about this project: what every file does, what every line means, how the frontend and backend talk to each other, and exactly what happens when you click something. Read it top to bottom the first time, then jump to any section when revising.

---

## Table of contents

- [Part 0: The big picture](#part-0-the-big-picture)
- [Part 1: Setting up the project (every command explained)](#part-1-setting-up-the-project-every-command-explained)
- [Part 2: Backend concepts you need first](#part-2-backend-concepts-you-need-first)
- [Part 3: The backend, file by file, line by line](#part-3-the-backend-file-by-file-line-by-line)
  - [3.1 settings.py](#31-configsettingspy-the-project-settings)
  - [3.2 models.py (+ migrations and the real SQL)](#32-bookmarksmodelspy-what-the-data-is)
  - [3.3 serializers.py](#33-bookmarksserializerspy-the-translator-and-checker)
  - [3.4 views.py](#34-bookmarksviewspy-what-to-do-with-a-request)
  - [3.5 bookmarks/urls.py](#35-bookmarksurlspy-the-router)
  - [3.6 config/urls.py](#36-configurlspy-the-reception-desk)
  - [3.7 The database](#37-dbsqlite3-the-database)
  - [3.8 Testing the backend with the browsable API](#38-testing-the-backend-in-the-browser-drfs-browsable-api)
  - [3.9 Two full backend traces](#39-two-full-backend-traces)
- [Part 4: Frontend concepts you need first](#part-4-frontend-concepts-you-need-first)
- [Part 5: The frontend, file by file, line by line](#part-5-the-frontend-file-by-file-line-by-line)
  - [5.1 index.html](#51-srcindexhtml-the-empty-page)
  - [5.2 main.ts](#52-srcmaints-the-starting-point)
  - [5.3 app.config.ts](#53-srcappappconfigts-app-wide-settings)
  - [5.4 models.ts](#54-srcappmodelsts-describing-the-data)
  - [5.5 folder.service.ts](#55-srcappfolderservicets-talking-to-django-about-folders)
  - [5.6 folder-list.component.ts](#56-folder-listcomponentts-the-sidebars-code)
  - [5.7 folder-list.component.html](#57-folder-listcomponenthtml-the-sidebars-html)
  - [5.8 app.ts + app.html](#58-appts--apphtml-the-parent-that-connects-both-sides)
  - [5.9 bookmark.service.ts](#59-bookmarkservicets-talking-to-django-about-bookmarks)
  - [5.10 bookmark-list.component.ts](#510-bookmark-listcomponentts-the-right-sides-code)
  - [5.11 bookmark-list.component.html](#511-bookmark-listcomponenthtml-the-right-sides-html)
  - [5.12 styles.css](#512-srcstylescss-the-look)
- [Part 6: How the frontend is connected to the backend](#part-6-how-the-frontend-is-connected-to-the-backend)
- [Part 7: End-to-end walkthroughs: what happens when you click](#part-7-end-to-end-walkthroughs-what-happens-when-you-click)
- [Part 8: Cheat sheets](#part-8-cheat-sheets)
- [Part 9: Interview answers](#part-9-interview-answers)
- [Part 10: Troubleshooting](#part-10-troubleshooting)
- [Appendix: Full source code of every file](#appendix-full-source-code-of-every-file)

---

# Part 0: The big picture

## What the app does

A **Bookmark Manager**. You create **folders** (e.g. "College", "Jobs") and save **bookmarks** (a title + a URL) inside them. You can create, read, update and delete (**CRUD**) both folders and bookmarks. There's no login, no nested folders, and no automatic page-title fetching.

## The two halves

| | Backend | Frontend |
|---|---|---|
| Built with | **Django + Django REST Framework (DRF)** | **Angular 22** (standalone components) |
| Language | Python | TypeScript (compiled to JavaScript) |
| Runs | on your computer, at **http://localhost:8000** | inside the **browser tab**, served from **http://localhost:4200** |
| Its job | **store and check** data in a database | **show** the data and **react** to your clicks |
| Database | **SQLite** (one file: `db.sqlite3`) | none |
| Started with | `python manage.py runserver` | `npx ng serve` |

**They are two completely separate programs.** They share no code. They only talk by sending **HTTP requests** with **JSON** data, the same way a browser talks to any website.

```
           BROWSER (localhost:4200)                               SERVER (localhost:8000)
┌─────────────────────────────────────────────┐          ┌──────────────────────────────────────┐
│ Angular app                                 │          │ Django + DRF                          │
│   components (what you see)                 │          │   urls → views → serializers → models │
│   services  ──► HttpClient ─────────────────┼── HTTP ──►   /api/folders/   /api/bookmarks/      │
│                             ◄───────────────┼── JSON ──┤                         │             │
│                                             │          │                    db.sqlite3          │
└─────────────────────────────────────────────┘          └──────────────────────────────────────┘
```

## Project structure

```
bookmark app/
├── LEARNING_GUIDE.md            ← this file
├── backend/                     ← Django project
│   ├── venv/                    ← private Python + installed packages (never edit)
│   ├── requirements.txt         ← list of Python packages
│   ├── manage.py                ← Django's command-line tool
│   ├── db.sqlite3               ← the database (one file)
│   ├── config/                  ← project settings
│   │   ├── settings.py          ⭐ switched on DRF + CORS + our app
│   │   ├── urls.py              ⭐ sends /api/... to the app
│   │   ├── __init__.py, asgi.py, wsgi.py   (ignore)
│   └── bookmarks/               ← our app
│       ├── models.py            ⭐ Folder + Bookmark tables
│       ├── serializers.py       ⭐ JSON ⇄ Python + validation
│       ├── views.py             ⭐ what happens on each request
│       ├── urls.py              ⭐ router: URL → view
│       ├── migrations/          (auto-generated database instructions)
│       └── __init__.py, admin.py, apps.py, tests.py   (ignore)
└── frontend/                    ← Angular project
    ├── package.json             ← list of npm packages
    ├── node_modules/            ← installed packages (never edit)
    ├── angular.json, tsconfig*.json, .editorconfig, .prettierrc   (tool settings, ignore)
    └── src/
        ├── index.html           ⭐ the one HTML page
        ├── main.ts              ⭐ starts Angular
        ├── styles.css           ⭐ all the CSS
        └── app/
            ├── app.config.ts    ⭐ switches on HttpClient
            ├── app.ts / app.html / app.css   ⭐ root component (the parent)
            ├── models.ts        ⭐ TypeScript interfaces
            ├── folder.service.ts      ⭐ HTTP calls for folders
            ├── bookmark.service.ts    ⭐ HTTP calls for bookmarks
            ├── folder-list/
            │   ├── folder-list.component.ts     ⭐ sidebar code
            │   └── folder-list.component.html   ⭐ sidebar HTML
            └── bookmark-list/
                ├── bookmark-list.component.ts   ⭐ right side code
                └── bookmark-list.component.html ⭐ right side HTML
```

## How to run it

**Terminal 1: backend**
```bash
cd "/Users/madhavbinoy/Documents/PROJECTS/bookmark app/backend"
source venv/bin/activate          # prompt now starts with (venv)
python manage.py runserver        # → http://localhost:8000
```

**Terminal 2: frontend**
```bash
cd "/Users/madhavbinoy/Documents/PROJECTS/bookmark app/frontend"
npx ng serve                      # or: npm start  → http://localhost:4200
```

Open **http://localhost:4200** to use the app. Open **http://localhost:8000/api/** to see the raw API.

Stop either server with **Ctrl + C** in its terminal.

---

# Part 1: Setting up the project (every command explained)

## 1.1 Checking the tools

| Tool | What we found | Notes |
|---|---|---|
| Python | `python3` = 3.9.6 (the old version built into macOS) | Too old. But **Homebrew had already installed Python 3.13**, so we used that. |
| Node.js | v26.7.0 (npm 11.19) | Supported by Angular 22. |

If you ever need them on a new Mac: `brew install python@3.13` and `brew install node`.

## 1.2 The virtual environment (venv)

```bash
cd "/Users/madhavbinoy/Documents/PROJECTS/bookmark app"
mkdir backend
cd backend
/opt/homebrew/bin/python3.13 -m venv venv
source venv/bin/activate
```
1. `cd ...`: move into the project folder.
2. `mkdir backend`: create the `backend` folder.
3. `cd backend`: move into it.
4. `/opt/homebrew/bin/python3.13 -m venv venv`: create a **virtual environment**, a **private Python just for this project**, in a folder called `venv`. Anything installed goes in there, not into your whole Mac. We use the full path to Python 3.13 because `python3` would give the old 3.9.
5. `source venv/bin/activate`: switch it on. Your prompt shows **`(venv)`**, and `python --version` shows **3.13.15**.

The activation only lasts for **one Terminal window**. Every new Terminal needs `cd .../backend` + `source venv/bin/activate` again.

## 1.3 Installing the 3 packages

```bash
pip install django djangorestframework django-cors-headers
pip freeze > requirements.txt
```
- **`pip`** is Python's package downloader. It installs into `venv`.
- **`pip freeze > requirements.txt`** saves the exact list of installed packages to a file (the "shopping list"). On another machine: `pip install -r requirements.txt`.

What got installed:
```
Django==6.1.2                 ← the framework
djangorestframework==3.18.3   ← DRF
django-cors-headers==4.9.0    ← CORS permission slip
asgiref==3.12.1               ← helper Django needs (dependency, installed automatically)
sqlparse==0.6.0               ← helper Django needs (dependency, installed automatically)
```
You asked for 3 packages but got 5. Packages that other packages need are called **dependencies**.

### What each package does (think of a shop that only takes phone orders)

- **Django = the shop itself.** The main web framework. It gives you a **web server** (listens on `localhost:8000`), a way to describe **database tables in Python** (the ORM), and **URLs** (which code runs for which address). By itself, Django is designed to send back **HTML pages**.
- **Django REST Framework (DRF) = the phone line.** Angular wants **JSON data**, not HTML pages. DRF converts database rows ⇄ JSON, **validates** incoming data (returns **400** for bad data), gives you full CRUD in a few lines, and provides the **browsable API** (a web page for testing your API).
- **django-cors-headers = the permission slip.** Angular (port 4200) and Django (port 8000) count as **two different websites** to the browser, which blocks one from reading the other's data. This package makes Django add a header saying "`localhost:4200` is allowed."

**One-liners for the interview:** Django = the web framework. DRF = turns Django into a JSON API. django-cors-headers = lets the Angular app on another port call that API.

## 1.4 Creating the Django project

```bash
django-admin startproject config .
```
- `django-admin` = Django's setup tool.
- `startproject config` = create a project whose settings folder is called `config`.
- **`.`** = put it **right here** in `backend/` (without it, Django creates an extra nested folder).

It created `manage.py` and `config/` (`settings.py`, `urls.py`, `__init__.py`, `asgi.py`, `wsgi.py`).

The three that matter:
- **`manage.py`**: the remote control (`runserver`, `migrate`, `makemigrations`, `shell`, ...).
- **`config/settings.py`**: the project's settings (apps, database, CORS).
- **`config/urls.py`**: the project's main URL list.

Ignore `__init__.py` (marks a Python package), `asgi.py` and `wsgi.py` (only used when deploying to a real server).

**Project vs app:**
- **Project** (`config`) = the whole website + settings. There is only one.
- **App** (`bookmarks`) = one feature area with its own models and API. A project can have many apps.

## 1.5 Starting the server for the first time

```bash
python manage.py runserver
```
- Starts Django's **development server** on **http://localhost:8000**.
- At this point the homepage showed Django's **rocket 🚀 "The install worked successfully! Congratulations!"** page.
- Each request is logged, e.g. `"GET / HTTP/1.1" 200 12149` → method `GET`, path `/`, status `200` (OK), size in bytes.
- "Watching for file changes": it **auto-restarts** when you save a Python file.
- A red *"You have unapplied migrations"* warning is normal until you run `migrate`.

> Note from setup: port 8000 was once busy with another project (TUMORSEG's uvicorn server). If that happens, stop the other server, or run `python manage.py runserver 8001`.

## 1.6 Creating the app

```bash
python manage.py startapp bookmarks
```
It created `bookmarks/` with `models.py`, `views.py`, `migrations/`, `admin.py`, `apps.py`, `tests.py`, `__init__.py`. We later **added** `serializers.py` and `urls.py` ourselves. Creating the folder isn't enough: the app must also be **registered** in `settings.py` (see 3.1).

## 1.7 Creating the Angular project

```bash
npx @angular/cli@22 new frontend --style=css --routing=false --ssr=false --skip-git --skip-tests --ai-config=none
```
- **`npx @angular/cli@22`**: run Angular's official setup tool (the **CLI**) without installing it permanently.
- **`new frontend`**: create an app in a folder called `frontend`.
- `--style=css` plain CSS · `--routing=false` single page, no routing · `--ssr=false` normal browser app · `--skip-git` no Git setup · `--skip-tests` no test files · `--ai-config=none` no AI config files.
- It then ran **`npm install`** automatically to download Angular's packages into `node_modules`.

**Django ↔ Angular comparison:**
| Django | Angular | Meaning |
|---|---|---|
| `venv/` | `node_modules/` | downloaded packages, never edit |
| `requirements.txt` | `package.json` | the list of packages |
| `django-admin startproject` | `ng new` | create the project |
| `python manage.py runserver` | `ng serve` | start the dev server |

## 1.8 Starting the Angular dev server

```bash
npx ng serve
```
Output:
```
✔ Building...
main.js      | 47.73 kB   ← all your TypeScript, compiled into JavaScript
styles.css   | 95 bytes
Watch mode enabled. Watching for file changes...
  ➜  Local:   http://localhost:4200/
```
- **Building** = converting TypeScript → JavaScript (browsers don't understand TypeScript).
- **Watch mode** = rebuilds and **refreshes the browser** automatically when you save.

## 1.9 Which Angular version?

**Angular 22.2.2** (CLI 22.2.2, TypeScript 6.0.3, RxJS 7.8.2, Node 26.7.0). Check with `npx ng version` inside `frontend/`. See [Part 8](#modern-angular-vs-older-angular) for how modern Angular differs from older tutorials.

---

# Part 2: Backend concepts you need first

## 2.1 The ORM: "you don't write SQL"

We **do** use a real database (SQLite), and it **does** run SQL. But **Django writes the SQL for you**. You write Python, and Django's **ORM** (Object-Relational Mapper) translates it.

**Creating a table:** you write a class:
```python
class Folder(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```
and `migrate` runs:
```sql
CREATE TABLE "bookmarks_folder" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" varchar(100) NOT NULL UNIQUE, "created_at" datetime NOT NULL);
```

**Reading and writing:**
| What you want | Python you write | SQL Django runs |
|---|---|---|
| Get all folders | `Folder.objects.all()` | `SELECT * FROM bookmarks_folder;` |
| Get folder 3 | `Folder.objects.get(id=3)` | `SELECT * FROM bookmarks_folder WHERE id = 3;` |
| Add a folder | `Folder.objects.create(name="Jobs")` | `INSERT INTO bookmarks_folder (name, ...) VALUES ('Jobs', ...);` |
| Filter | `Bookmark.objects.filter(folder=5)` | `SELECT * FROM bookmarks_bookmark WHERE folder_id = 5;` |
| Delete | `folder.delete()` | `DELETE FROM bookmarks_folder WHERE id = 3;` |

**Why it's useful:** one language (Python), it's **safer** (protects against **SQL injection**), and you can **switch databases** without rewriting queries.

> **Interview:** "Django's ORM lets me define tables as Python classes and query them with Python methods. Django generates the SQL, so I don't write it by hand, but there's still a real database underneath. In this project it's SQLite."

## 2.2 Why SQLite?

- **The whole database is one file** (`db.sqlite3`).
- **No separate database server** to install, start or configure (unlike PostgreSQL or MySQL).
- **Built into Python** and **Django's default**, so there's zero setup.
- **Not built for big websites** where many users write at the same time. Production apps usually use **PostgreSQL**.
- Switching later is mostly a **settings change**, thanks to the ORM.

> **Interview:** "I used SQLite because it's Django's default and needs no setup: a single file, no server. That's fine for a demo. For production I'd switch to PostgreSQL, which is mostly a settings change because I use the ORM."

## 2.3 CORS: what it does and why we need it

**The danger it prevents:** you're logged into your bank in one tab, and evil-site.com in another tab runs `fetch("https://yourbank.com/api/balance")`. If browsers allowed that, any site could read your private data from other sites.

**The rule (Same-Origin Policy):** a page's JavaScript may only read responses from **its own origin**. An **origin = protocol + host + port**.
| Address | Origin |
|---|---|
| `http://localhost:4200` | Angular |
| `http://localhost:8000` | Django |

The ports differ, so these are **different origins**, and the browser blocks Angular from reading Django's responses.

**CORS (Cross-Origin Resource Sharing)** is how a **server** says "I trust that other origin." It does this with a **response header**:
```
Access-Control-Allow-Origin: http://localhost:4200
```

**In our app:**
1. Angular (4200) sends `GET http://localhost:8000/api/folders/`.
2. Django answers, and `CorsMiddleware` attaches the header above.
3. The **browser** checks: "page is from 4200, server allows 4200" ✅, then hands the data to Angular.

**Without it**, the console shows:
```
Access to XMLHttpRequest at 'http://localhost:8000/api/folders/' from origin
'http://localhost:4200' has been blocked by CORS policy
```

**Preflight:** for POST, PUT and DELETE with JSON, the browser first sends a small **`OPTIONS`** request asking for permission. django-cors-headers answers it automatically:
```
access-control-allow-origin: http://localhost:4200
access-control-allow-methods: DELETE, GET, OPTIONS, PATCH, POST, PUT
access-control-allow-headers: accept, authorization, content-type, ...
```

**Two common mistakes:**
- CORS is **enforced by the browser**, not the server. Django sends the data either way, and the browser decides whether JavaScript may see it. That's why `curl` and the DRF browsable API work without CORS.
- CORS is **not security for your data**. It only controls which *websites* may call your API from a browser. It's not login or permissions.

> **Interview:** "Browsers block JavaScript from reading responses from a different origin (protocol, host or port). Angular runs on 4200 and Django on 8000, so I used django-cors-headers to add `Access-Control-Allow-Origin: http://localhost:4200`. Only that origin is allowed."

## 2.4 HTTP methods, status codes, REST, JSON

**HTTP methods** (what you want to do):
| Method | Meaning | Our use |
|---|---|---|
| `GET` | "give me" | list folders / bookmarks |
| `POST` | "create this" | create a folder / bookmark |
| `PUT` | "replace/update this" | rename a folder / edit a bookmark |
| `DELETE` | "delete this" | delete a folder / bookmark |

**Status codes** (how it went):
| Code | Meaning | When we see it |
|---|---|---|
| `200 OK` | worked, here's the data | GET, PUT |
| `201 Created` | created, here's the new item | POST |
| `204 No Content` | done, nothing to send back | DELETE |
| `400 Bad Request` | your data is invalid | blank name, duplicate name, bad URL |
| `404 Not Found` | no such address / item | wrong URL, folder id that doesn't exist |
| `405 Method Not Allowed` | that method isn't allowed here | e.g. POST to a URL that only allows GET |
| `500 Server Error` | the server crashed | e.g. `?folder=abc` (see 3.4) |

**REST** = a style of API where **URLs name things** (`/api/folders/`, `/api/folders/5/`) and **HTTP methods say what to do** with them.

**JSON** = plain text for data that both Python and JavaScript understand:
```json
{"id": 5, "name": "Job", "created_at": "2026-10-10T11:39:04Z"}
```

## 2.5 The restaurant picture (the whole backend)

| File | Restaurant role | What it says |
|---|---|---|
| `models.py` | the **storage room** | "A Folder has a name and a date." |
| `serializers.py` | the **translator + checker** at the counter | "Turn a Folder into JSON; check incoming JSON is valid." |
| `views.py` | the **waiter** | "When someone asks for folders, fetch them." |
| `urls.py` | the **menu** | "The address `folders/` goes to that waiter." |
| `settings.py` | the **rules of the restaurant** | "We use DRF, and we let Angular (4200) order from us." |

---

# Part 3: The backend, file by file, line by line

## The order a request travels

```
           REQUEST  (e.g. GET /api/bookmarks/?folder=3)
              │
              ▼
 ① settings.py        Django starts up: which apps, which database, CORS rules
 ② CORS middleware    stamps the "4200 is allowed" label on the response
 ③ config/urls.py     "starts with api/?"  → go to bookmarks/urls.py
 ④ bookmarks/urls.py  router: "bookmarks/ + GET"  → BookmarkViewSet.list
 ⑤ views.py           the view decides WHAT data and does the action
 ⑥ serializers.py     checks incoming JSON / turns objects into JSON
 ⑦ models.py          describes the tables; the ORM writes the SQL
 ⑧ db.sqlite3         the actual data on disk
              │
              ▼
           RESPONSE (JSON + status code, e.g. 200)
```

---

## 3.1 `config/settings.py`: the project settings

Django reads this **once, when the server starts**. We made **3 changes**. The rest was generated.

### Change 1: switch on 3 apps
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',   # Django REST Framework: lets us build a JSON API
    'corsheaders',      # lets the Angular app (port 4200) call this API
    'bookmarks',        # our own app
]
```
- **`INSTALLED_APPS`** = Django's list of **switched-on apps**. Installing with pip only downloads, and creating a folder only creates files. Django uses them only when they're on this list.
- The **first 6** came with the project (Django's built-in features). That's why `migrate` creates `auth`, `admin` and `sessions` tables too.
- **`'rest_framework'`**: DRF. Without it, serializers/ViewSets don't work and there's no browsable API page.
- **`'corsheaders'`**: the CORS package.
- **`'bookmarks'`**: our app. Without it, Django ignores `models.py`, and `makemigrations` finds nothing.

### Change 2: the CORS middleware
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # adds the CORS "permission slip" to every response (keep it near the top)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```
- **Middleware** = code that wraps **every** request and response, like security at a door that everyone passes through, in and out.
- **`CorsMiddleware`** goes **first** so it handles every request before anything else can answer. On the way out, it adds `Access-Control-Allow-Origin`. It also answers the browser's **preflight** `OPTIONS` requests.

### Change 3: who is allowed
```python
# CORS: which websites are allowed to call this API from the browser.
# Only our Angular app, which runs on port 4200.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',
]
```
Only the Angular app gets permission. Any other website is still blocked.

### Generated lines worth knowing
```python
ROOT_URLCONF = 'config.urls'
```
"The **first** URL list to check is `config/urls.py`." Django never looks at `bookmarks/urls.py` by itself. It only gets there through `config/urls.py`.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
- **`ENGINE`**: which database type (SQLite).
- **`NAME`**: where the file is: `backend/db.sqlite3` (`BASE_DIR` = the `backend` folder).

### Checking settings
```bash
python manage.py check
# System check identified no issues (0 silenced).
```

---

## 3.2 `bookmarks/models.py`: what the data is

### What a model is
A **model** = a Python class that describes **one database table**. The **class** is the table, and **each line** is a column. Models are used in **two ways**:
1. **Once, to create tables:** `makemigrations` writes a migration file, then `migrate` runs its SQL.
2. **On every request:** through the ORM (`Folder.objects.all()`, `.filter()`, `.save()`, `.delete()`).

> **Interview:** "Models define the data structure; each model is a database table."

### The file
```python
from django.db import models


# A Folder groups bookmarks together, e.g. "College" or "Jobs".
# This class becomes a database table. Django adds an "id" column automatically.
class Folder(models.Model):
    name = models.CharField(max_length=100, unique=True)  # text, max 100 characters, no two folders can share a name
    created_at = models.DateTimeField(auto_now_add=True)  # date + time, filled in automatically when the folder is created

    def __str__(self):
        # How a folder is shown as text (for example when you print it)
        return self.name


# A Bookmark is one saved link (title + URL) that lives inside a Folder.
class Bookmark(models.Model):
    title = models.CharField(max_length=200)              # text, max 200 characters
    url = models.URLField()                               # text that must be a valid web address (checked for us)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)  # which folder it belongs to; delete folder = delete its bookmarks
    created_at = models.DateTimeField(auto_now_add=True)  # filled in automatically when the bookmark is created

    def __str__(self):
        return self.title
```

### Line by line: `Folder`
- **`from django.db import models`**: brings in Django's model tools.
- **`class Folder(models.Model):`**: creates a class. `(models.Model)` makes it a Django model, which means "this is a database table." The table is named **`bookmarks_folder`** (app name + model name).
- **`name = models.CharField(max_length=100, unique=True)`**
  - `CharField` = a **short text** column.
  - `max_length=100` = at most 100 characters.
  - `unique=True` = **no duplicates**. The database itself refuses a second "Jobs", and DRF uses this rule to send a **400** automatically.
- **`created_at = models.DateTimeField(auto_now_add=True)`**
  - `DateTimeField` = a **date + time** column.
  - `auto_now_add=True` = Django fills it **once, when the row is created**. The client never sends it.
- **`def __str__(self): return self.name`**: how a folder looks as text: `Jobs` instead of `Folder object (1)`. A convenience.
- **`id`**: we didn't write it. **Django adds it automatically**, a number counting up (1, 2, 3, …). It's the **primary key**, the unique ID of each row, and it appears in URLs like `/api/folders/1/`.

Resulting table:
| id | name | created_at |
|---|---|---|
| *(auto)* | text, unique, ≤100 chars | *(auto)* |

### Line by line: `Bookmark`
- **`title = models.CharField(max_length=200)`**: text up to 200 characters. **Not** unique.
- **`url = models.URLField()`**: in the database it's **plain text** (`varchar(200)`), but Django/DRF **check it's a valid web address** before saving: `https://google.com` ✅, `hello world` ❌ → 400 `"Enter a valid URL."`.
- **`folder = models.ForeignKey(Folder, on_delete=models.CASCADE)`**: **the link between the two tables.**
  - "Each bookmark belongs to **one** folder." One folder has **many** bookmarks, which is called a **one-to-many relationship**.
  - In the database, Django creates a column called **`folder_id`** that stores the **folder's id**.
  - In Python, `bookmark.folder` gives you a whole Folder object. In the database, only the id number is stored.
- **`on_delete=models.CASCADE`**: "what happens to the bookmarks if their folder is deleted?" **CASCADE = delete them too** (like a waterfall). Without it, bookmarks would point to a folder that no longer exists.
- **`created_at`** and **`__str__`**: same as Folder.

Example data:

**bookmarks_folder**
| id | name |
|---|---|
| 2 | Jobs |
| 3 | College |

**bookmarks_bookmark**
| id | title | url | folder_id |
|---|---|---|---|
| 1 | LinkedIn | https://linkedin.com | **2** ← in "Jobs" |
| 2 | Indeed | https://indeed.com | **2** ← in "Jobs" |
| 3 | Moodle | https://moodle.ac.uk | **3** ← in "College" |

### Migrations: turning models into real tables

**Command 1: `python manage.py makemigrations`**
```
Migrations for 'bookmarks':
  bookmarks/migrations/0001_initial.py
    + Create model Folder
```
Django compares `models.py` with what it knows and writes a **migration**, a **to-do note for the database**. Nothing in the database changes yet. Migrations are numbered (`0001`, `0002`, …), which makes them a **history of changes**. They can be shared with teammates through Git.

**Command 2 (just to look): `python manage.py sqlmigrate bookmarks 0001`**
```sql
CREATE TABLE "bookmarks_folder" (
    "id"         integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"       varchar(100) NOT NULL UNIQUE,
    "created_at" datetime     NOT NULL
);
```
| Python (you wrote) | SQL (Django wrote) |
|---|---|
| *(nothing, automatic)* | `id integer PRIMARY KEY AUTOINCREMENT` |
| `CharField(max_length=100, unique=True)` | `varchar(100) NOT NULL UNIQUE` |
| `DateTimeField(auto_now_add=True)` | `datetime NOT NULL` |

**Command 3: `python manage.py migrate`**
```
Applying bookmarks.0001_initial... OK
```
**Runs** the notes on the database and creates `db.sqlite3`. The other lines (`admin`, `auth`, `sessions`…) are Django's built-in tables.

**The Bookmark migration (`0002_bookmark.py`)**, as shown by `sqlmigrate bookmarks 0002`:
```sql
CREATE TABLE "bookmarks_bookmark" (
    "id"         integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"      varchar(200) NOT NULL,
    "url"        varchar(200) NOT NULL,
    "created_at" datetime     NOT NULL,
    "folder_id"  bigint       NOT NULL REFERENCES "bookmarks_folder" ("id")
);
CREATE INDEX ... ON "bookmarks_bookmark" ("folder_id");
```
- The column is **`folder_id`**, not `folder`.
- **`REFERENCES bookmarks_folder(id)`** = the database rule "`folder_id` must be the id of an existing folder." This is what makes it a **foreign key**.
- **`CREATE INDEX`** = a speed-up Django added automatically, so "all bookmarks in folder 2" is fast. Our `?folder=` filter uses it.
- `migrate` only ran **0002**. It remembers 0001 already ran, so existing data is untouched.

**The rule to remember:** every time you change `models.py`: **`makemigrations`** (write the note), then **`migrate`** (apply it).

> **Interview:** "makemigrations creates migration files from model changes; migrate applies them to the database."

---

## 3.3 `bookmarks/serializers.py`: the translator and checker

### What a serializer is
A **serializer** is a **translator** between Python objects and JSON, and it **checks** incoming data before anything is saved.

- **Out (serializing):** `Folder object` → `{"id": 1, "name": "Jobs", "created_at": "..."}`
- **In (deserializing):** `{"name": "Jobs"}` → **checked** → ✅ saved, or ❌ **400** with error messages

You can't send a Python object over the internet. It must become text (JSON) first.

### The file
```python
from rest_framework import serializers

from .models import Bookmark, Folder


# Translates between a Folder object and JSON, and checks incoming data.
# ModelSerializer reads the Folder model and builds the fields + validation for us.
class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder                              # which model to translate
        fields = ['id', 'name', 'created_at']       # which fields appear in the JSON
        read_only_fields = ['id', 'created_at']     # the server sets these; the client can't change them


# Same idea for Bookmark.
# "folder" appears in the JSON as the folder's id number, e.g. "folder": 2
class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'title', 'url', 'folder', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### Line by line
- **`from rest_framework import serializers`**: DRF's serializer tools.
- **`from .models import Bookmark, Folder`**: our models. The **dot** = "from this same app folder."
- **`class FolderSerializer(serializers.ModelSerializer):`**: our translator. **`ModelSerializer`** is the shortcut: it **reads the model** and builds the fields and validation rules itself.
- **`class Meta:`**: a "settings box" inside the class.
- **`model = Folder`**: translate Folder objects.
- **`fields = ['id', 'name', 'created_at']`**: these fields appear in the JSON.
- **`read_only_fields = ['id', 'created_at']`**: these are **sent out only, never accepted in**. If a client sends `"id": 999`, it's ignored. So the client can only send **`name`**.

**BookmarkSerializer** follows the same pattern. The client sends **`title`, `url`, `folder`**. `folder` appears as the **folder's id number** (`"folder": 2`), which is the `folder_id` column. When Angular creates a bookmark it sends `{"title": "Google", "url": "https://google.com", "folder": 2}`.

### The checks it builds from the model (we wrote none of them)
| Model says | Serializer checks | If it fails (400) |
|---|---|---|
| `name = CharField(...)` | required, not blank | `{"name": ["This field may not be blank."]}` |
| `max_length=100` | ≤ 100 characters | `{"name": ["Ensure this field has no more than 100 characters."]}` |
| `unique=True` | no other folder has this name | `{"name": ["folder with this name already exists."]}` |
| `title = CharField(max_length=200)` | required, ≤ 200 chars | `{"title": ["This field may not be blank."]}` |
| `url = URLField()` | looks like a real web address | `{"url": ["Enter a valid URL."]}` |
| `folder = ForeignKey(Folder)` | that folder id exists | `{"folder": ["Invalid pk \"9999\" - object does not exist."]}` |
| missing fields | must be sent | `{"title": ["This field is required."]}` |

### Tested in Django's shell (`python manage.py shell`)
| Test | Result |
|---|---|
| Folder object → JSON | `{'id': 1, 'name': 'Jobs', 'created_at': '2026-10-09T14:30:28Z'}` ✅ |
| `{"name": "Jobs"}` again | ❌ `folder with this name already exists.` |
| `{"name": ""}` | ❌ `This field may not be blank.` |
| `{"name": "College"}` | ✅ valid |
| bookmark with url `hello world` | ❌ `Enter a valid URL.` |
| bookmark with folder `9999` | ❌ `Invalid pk "9999" - object does not exist.` |
| bookmark without title and folder | ❌ `This field is required.` (both) |

Note: SQLite never reuses ids, so after test data is deleted, new folders get higher ids (e.g. 5 instead of 1). That's normal.

> **Interview:** "A serializer converts model instances to JSON for responses, and converts incoming JSON back into validated data for saving. I used DRF's ModelSerializer, which builds the fields and validation rules from the model, so max length, unique names and valid URLs return a 400 automatically."

---

## 3.4 `bookmarks/views.py`: what to do with a request

### What a view is
A view is the code that runs when a request arrives. Its job is always: **take a request in → do something → send a response back.**
1. **Receive** the request (URL, method, any data).
2. **Do the work** using the model (read/write the database).
3. **Prepare** the answer (with DRF, the serializer).
4. **Return** a response (JSON + status code).

**A view written by hand, without shortcuts:**
```python
from django.http import JsonResponse

def folder_list(request):                                   # 1. a request comes in
    folders = Folder.objects.all()                          # 2. get the data from the database
    data = [{"id": f.id, "name": f.name} for f in folders]  # 3. turn it into JSON-ready data
    return JsonResponse(data, safe=False)                   # 4. send the response back
```
To support list, create, get one, update and delete by hand, you'd write 5 of these, plus validation and the 400/404 handling. **`ModelViewSet` has all of that already written inside it.**

### The file
```python
from rest_framework import viewsets

from .models import Bookmark, Folder
from .serializers import BookmarkSerializer, FolderSerializer


# One class that handles every folder request:
#   list all, create, get one, update, delete.
class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()       # which data this API works with: all folders
    serializer_class = FolderSerializer   # how to turn that data into JSON (and check incoming JSON)


# Same as above, for bookmarks, plus one extra:
# GET /api/bookmarks/?folder=2 returns only the bookmarks in folder 2.
class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer

    # DRF calls this to decide which bookmarks to work with on each request.
    def get_queryset(self):
        bookmarks = Bookmark.objects.all()                    # start with every bookmark
        folder_id = self.request.query_params.get('folder')   # read "?folder=2" from the URL (None if it's not there)
        if folder_id:
            bookmarks = bookmarks.filter(folder=folder_id)    # keep only the ones in that folder
        return bookmarks
```

### Line by line: `FolderViewSet`
- **`from rest_framework import viewsets`**: DRF's ViewSet classes.
- **`from .models import ...` / `from .serializers import ...`**: the data and the translators. The view **connects** them.
- **`class FolderViewSet(viewsets.ModelViewSet):`**: our view. **`ModelViewSet` already contains 5 functions**: `list`, `create`, `retrieve`, `update`, `destroy`.
- **`queryset = Folder.objects.all()`**: "**which data?**" All folders (`SELECT * FROM bookmarks_folder`). `retrieve`, `update` and `destroy` also search inside this to find, say, folder 5. If it's not there → **404**.
- **`serializer_class = FolderSerializer`**: "**how do I translate it?**"

**What `ModelViewSet` gives for free:**
| Action | HTTP request | What it does | Status |
|---|---|---|---|
| **list** | `GET /folders/` | return all folders | 200 |
| **create** | `POST /folders/` | check JSON → save → return it | 201 / 400 |
| **retrieve** | `GET /folders/2/` | return folder 2 | 200 / 404 |
| **update** | `PUT /folders/2/` | check JSON → change folder 2 | 200 / 400 / 404 |
| **destroy** | `DELETE /folders/2/` | delete folder 2 | 204 / 404 |

**What those built-in functions roughly look like inside (simplified):**
```python
def list(self, request):                          # GET /folders/
    folders = Folder.objects.all()                #   get all rows
    return Response(FolderSerializer(folders, many=True).data)   # send JSON, 200

def create(self, request):                        # POST /folders/
    s = FolderSerializer(data=request.data)       #   give the JSON to the serializer
    if not s.is_valid():                          #   check it
        return Response(s.errors, status=400)     #   bad → 400 + error message
    s.save()                                      #   good → save to database
    return Response(s.data, status=201)           #   send the new folder, 201

def destroy(self, request, pk):                   # DELETE /folders/2/
    Folder.objects.get(id=pk).delete()            #   delete row 2
    return Response(status=204)                   #   204 = done, nothing to send back
```
So **our view = DRF's ready-made functions + our 2 settings** (`queryset`, `serializer_class`).

### Line by line: `BookmarkViewSet`
- The first 3 lines are the same as Folder: full CRUD for bookmarks. The `queryset` line is also read by the **router** to name the URLs, which is why it stays even though we override `get_queryset`.
- **`def get_queryset(self):`**: DRF's built-in version just returns `queryset`. We **replace** it. DRF calls it **at the start of every request** to ask, "which bookmarks are we working with?"
  - **`self`** = this view object. It holds the current request as `self.request`.
- **`bookmarks = Bookmark.objects.all()`**: start with all bookmarks. (No SQL runs yet. Django waits until the data is needed, so adding a filter is cheap.)
- **`folder_id = self.request.query_params.get('folder')`**
  - **`query_params`** = everything after the `?` in the URL, like a dictionary. `/api/bookmarks/?folder=3` → `{'folder': '3'}`.
  - **`.get('folder')`** → `'3'`, or **`None`** if absent.
- **`if folder_id: bookmarks = bookmarks.filter(folder=folder_id)`**: only if a folder was given, keep that folder's bookmarks. SQL: `WHERE folder_id = 3`.
- **`return bookmarks`**: DRF continues with the normal list/update/etc.

| Request | Result |
|---|---|
| `GET /api/bookmarks/` | all bookmarks |
| `GET /api/bookmarks/?folder=2` | only folder 2's bookmarks |

**What is `?folder=2`?** A **query parameter**: extra info after a `?` in a URL (like `google.com/search?q=cats`).

**Known limit:** `?folder=abc` (not a number) makes Django crash with **500** instead of a neat 400. Angular always sends a number, so it never happens in the app. A fix would be checking `folder_id.isdigit()` first.

> **Interview:** "A view receives an HTTP request and returns an HTTP response. In between, it uses the model to read or write data and the serializer to convert it. I used ModelViewSet for full CRUD, and overrode get_queryset to filter bookmarks by a folder query parameter."

---

## 3.5 `bookmarks/urls.py`: the router

```python
from rest_framework.routers import DefaultRouter

from .views import BookmarkViewSet, FolderViewSet

# The router creates the URLs for our ViewSets automatically:
#   folders/          -> list all (GET), create (POST)
#   folders/<id>/     -> get one (GET), update (PUT), delete (DELETE)
#   bookmarks/        -> list all (GET, supports ?folder=<id>), create (POST)
#   bookmarks/<id>/   -> get one (GET), update (PUT), delete (DELETE)
router = DefaultRouter()
router.register('folders', FolderViewSet)
router.register('bookmarks', BookmarkViewSet)

urlpatterns = router.urls  # Django looks for a list called "urlpatterns"
```

### Line by line
- **`from rest_framework.routers import DefaultRouter`**: DRF's **router**, which writes URL rules for ViewSets.
- **`from .views import ...`**: our two views.
- **`router = DefaultRouter()`**: an empty router.
- **`router.register('folders', FolderViewSet)`**: "the word `folders` in the URL belongs to `FolderViewSet`." The same goes for `bookmarks`.
- **`urlpatterns = router.urls`**: Django always looks for a list named `urlpatterns`, so we hand it the router's URLs.

### The lookup table the router builds
Every request has an **address** and a **method**. Django must answer: "for this address + method, which function do I run?"

| Path (after `api/`) | Method | Function in the view |
|---|---|---|
| `folders/` | GET | `list` |
| `folders/` | POST | `create` |
| `folders/5/` | GET | `retrieve` |
| `folders/5/` | PUT | `update` |
| `folders/5/` | DELETE | `destroy` |
| `bookmarks/` | GET | `list` (+ `?folder=` filter) |
| `bookmarks/` | POST | `create` |
| `bookmarks/7/` | GET / PUT / DELETE | `retrieve` / `update` / `destroy` |

- The **5** in `folders/5/` is the **pk** (primary key = id). The router passes it to the view.
- `DefaultRouter` also creates the **`/api/` home page** listing both endpoints.
- (It also adds `PATCH` → `partial_update` and `.json` format URLs, which we don't use.)

**Key idea:** the **address + method** decide the function. That's how one URL (`folders/`) can both list (GET) and create (POST).

---

## 3.6 `config/urls.py`: the reception desk

```python
from django.contrib import admin
from django.urls import include, path

# The main list of URLs for the whole project.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bookmarks.urls')),  # every address starting with /api/ is handled by bookmarks/urls.py
]
```

### Line by line
- **`from django.contrib import admin`**: Django's admin site (it came with the project; we don't use it).
- **`from django.urls import include, path`**: **`path`** makes one URL rule. **`include`** means "for the rest of this address, look in another URL file."
- **`urlpatterns = [...]`**: the required name.
- **`path('admin/', admin.site.urls)`**: addresses starting with `admin/` → admin site.
- **`path('api/', include('bookmarks.urls'))`**: addresses starting with `api/` → **cut off `api/`** and continue in `bookmarks/urls.py`.

### The office-building picture
- **`config/urls.py` = the reception desk** on the ground floor.
- **`bookmarks/urls.py` = a desk on one floor.**

A request for `/api/folders/`:
1. Django starts at reception (because `ROOT_URLCONF = 'config.urls'`).
2. It checks **top to bottom**: starts with `admin/`? ❌. Starts with `api/`? ✅
3. `include('bookmarks.urls')` → **remove the matched part**: `api/folders/` → `folders/`
4. At the floor desk, the router table says: `folders/` + POST → `FolderViewSet.create`.
5. If nothing matches anywhere → **404 Not Found**.

```
Request path:  /api/folders/
config/urls.py      →  matches "api/"     →  remaining: "folders/"  →  go to bookmarks/urls.py
bookmarks/urls.py   →  matches "folders/" + POST  →  run FolderViewSet.create
```

**Why two files?** Organisation. Reception only says "everything under `/api/` belongs to bookmarks," and the app handles its own details. A bigger project would have one line per app here. If you deleted the `api/` line, `/api/folders/` would 404, even though the view, serializer and model are all fine.

> **Interview:** "config/urls.py is the root URL configuration. Every request starts there. It uses include() to pass everything under /api/ to my app's urls.py, where DRF's router maps URLs to my ViewSets."

---

## 3.7 `db.sqlite3`: the database

One file holding our two tables, plus Django's built-in ones. Every ORM call ends up here. You never open it directly. Use the API or `python manage.py shell`.

---

## 3.8 Testing the backend in the browser: DRF's browsable API

With the server running:

1. **http://localhost:8000/api/** shows:
   ```json
   {"folders": "http://localhost:8000/api/folders/", "bookmarks": "http://localhost:8000/api/bookmarks/"}
   ```
2. **http://localhost:8000/api/folders/** shows "Folder List" and `[]` (empty).
3. **Create:** at the bottom, use the **Raw data** tab, enter `{"name": "Jobs"}`, and click **POST** → **201 Created**, `{"id": 2, "name": "Jobs", "created_at": "..."}`.
4. **Duplicate:** POST `{"name": "Jobs"}` again → **400** `{"name": ["folder with this name already exists."]}`.
5. **Blank:** POST `{"name": ""}` → **400** `"This field may not be blank."`.
6. **Rename:** open `/api/folders/2/`, send `{"name": "Careers"}`, click **PUT** → **200**.
7. **Delete:** red **DELETE** button → **204 No Content**.
8. **Bookmarks:** at `/api/bookmarks/`, POST `{"title": "LinkedIn", "url": "https://linkedin.com", "folder": 2}` → **201**.
9. **Bad URL:** `{"title": "x", "url": "hello", "folder": 2}` → **400** `"Enter a valid URL."`.
10. **Filter:** `/api/bookmarks/?folder=2` → only folder 2's bookmarks.
11. **Cascade:** delete folder 2, and its bookmarks are gone from `/api/bookmarks/`.

Results we got with curl:
```
POST {"name":"Jobs"}      → 201 {"id":1,"name":"Jobs","created_at":"..."}
POST duplicate            → 400 {"name":["folder with this name already exists."]}
POST {"name":""}          → 400 {"name":["This field may not be blank."]}
PUT  {"name":"Careers"}   → 200
DELETE /folders/1/        → 204
CORS header present       → access-control-allow-origin: http://localhost:4200
POST bookmark             → 201 {"id":2,"title":"LinkedIn","url":"https://linkedin.com","folder":3,...}
POST url "hello"          → 400 {"url":["Enter a valid URL."]}
GET ?folder=3             → only LinkedIn
PUT bookmark              → 200
DELETE bookmark           → 204
DELETE folder w/ bookmark → 204, and its bookmark disappeared (CASCADE)
```

---

## 3.9 Two full backend traces

### Trace 1: "Show me folder 5's bookmarks"
Angular sends **`GET http://localhost:8000/api/bookmarks/?folder=5`**

| # | Where | What happens |
|---|---|---|
| 1 | CorsMiddleware | Notes the request came from `localhost:4200`, which is allowed. |
| 2 | config/urls.py | `api/bookmarks/` starts with `api/` → `bookmarks/` goes to `bookmarks/urls.py`. (`?folder=5` isn't used for matching; it travels with the request.) |
| 3 | bookmarks/urls.py | `bookmarks/` + **GET** → `BookmarkViewSet.list` |
| 4 | views.py `list` | Calls **our** `get_queryset()` |
| 5 | views.py `get_queryset` | `query_params.get('folder')` → `'5'` → `.filter(folder='5')` |
| 6 | models / ORM | `SELECT * FROM bookmarks_bookmark WHERE folder_id = 5` |
| 7 | serializers.py | `BookmarkSerializer` → `[{"id":4,"title":"LinkedIn",...,"folder":5}]` |
| 8 | view | Sends it with **200 OK** |
| 9 | CorsMiddleware | Adds `Access-Control-Allow-Origin: http://localhost:4200` |
| 10 | Browser | Sees the header ✅ → gives the JSON to Angular |

### Trace 2: "Save a new bookmark" (with a typo, then fixed)
Angular sends **`POST /api/bookmarks/`** with `{"title": "Indeed", "url": "indeed", "folder": 5}`

| # | Where | What happens |
|---|---|---|
| 1 | config/urls.py | `api/` → `bookmarks/urls.py` |
| 2 | bookmarks/urls.py | `bookmarks/` + **POST** → `BookmarkViewSet.create` |
| 3 | view `create` | `BookmarkSerializer(data=...)`, then `is_valid()` |
| 4 | serializer | title ✅ · url `"indeed"` ❌ · folder 5 exists ✅ |
| 5 | view | **400** `{"url": ["Enter a valid URL."]}` |
| — | database | **Never touched.** |

Fixed to `"https://indeed.com"`:
| # | Where | What happens |
|---|---|---|
| 4 | serializer | all ✅ |
| 5 | view | `serializer.save()` |
| 6 | ORM | `INSERT INTO bookmarks_bookmark (title, url, folder_id, created_at) VALUES ('Indeed', 'https://indeed.com', 5, now)` → id 6 |
| 7 | serializer | new object → JSON (with `id` and `created_at`) |
| 8 | view | **201 Created** |

### Backend cheat sheet
| File | One-line job | Interview phrase |
|---|---|---|
| `settings.py` | switches on DRF, CORS, our app; picks SQLite | "configuration" |
| `config/urls.py` | sends `/api/...` to the app | "root URLconf with include" |
| `bookmarks/urls.py` | address + method → view function | "DefaultRouter generates the routes" |
| `views.py` | runs the action, connects model ⇄ serializer | "ModelViewSet gives CRUD; get_queryset for filtering" |
| `serializers.py` | JSON ⇄ objects, validation → 400 | "ModelSerializer derives validation from the model" |
| `models.py` | the tables and their rules | "ORM; ForeignKey with CASCADE, one-to-many" |
| `db.sqlite3` | the data | "SQLite, Django's default" |

---

# Part 4: Frontend concepts you need first

## 4.1 What the frontend is
The frontend is **a program that runs inside your browser**. The browser only understands **HTML, CSS and JavaScript**. We write **TypeScript** (JavaScript **with types**), and `ng serve` compiles it into JavaScript (`main.js`).

## 4.2 What happens when you open `localhost:4200`
```
1. Browser asks localhost:4200 for the page
2. ng serve sends back index.html  (a nearly empty page)
3. index.html loads the JavaScript (main.js = all our code, compiled)
4. main.ts runs first → it starts Angular
5. Angular draws the App component into <app-root>
6. App contains FolderList (and BookmarkList, once a folder is selected) → they draw themselves
7. FolderList asks Django for folders → the list appears
```

## 4.3 Components
A **component** = **one piece of the screen**:
| Part | File | Job |
|---|---|---|
| code | `*.component.ts` | holds the **data** (signals) + the **functions** (what happens on clicks) |
| HTML | `*.component.html` | **what it looks like**, using that data |

They work together: the HTML **shows** the code's data, and the HTML **calls** the code's functions. Our components are **App** (the whole page, the parent), **FolderListComponent** (left sidebar) and **BookmarkListComponent** (right side).

## 4.4 Signals: the component's memory
A **signal** is a **box that holds a value, and the screen watches the box**.
- **Read:** `this.folders()` (with **brackets**)
- **Replace:** `this.folders.set(newValue)`
- When the value changes, **Angular automatically redraws** every part of the HTML that uses it.

> **You never change the screen directly. You change a signal, and the screen follows.**

`signal<Folder[]>([])`: the `<...>` says **what type** the box holds, and the `(...)` is the **starting value**.

## 4.5 Bindings: connecting HTML and code
| Syntax | Name | Direction | Example |
|---|---|---|---|
| `{{ x }}` | interpolation | code → screen (text) | `{{ folder.name }}` |
| `[prop]="x"` | property binding | code → screen / parent → child (**input**) | `[href]="bookmark.url"`, `[folder]="folder"` |
| `[class.name]="cond"` | class binding | adds a CSS class if true | `[class.selected]="..."` |
| `(event)="f()"` | event binding | screen → code / child → parent (**output**) | `(click)="addFolder()"` |
| `[(ngModel)]="sig"` | two-way binding ("banana in a box") | both ways | `[(ngModel)]="newName"` |
| `@if (c) { } @else { }` | control flow | show one part or the other | `@if (error()) {...}` |
| `@for (x of list; track x.id) { } @empty { }` | control flow | repeat per item / empty message | `@for (folder of folders(); ...)` |

**Bracket rule of thumb:** `( )` = something happens on screen, so tell the code. `[ ]` = the code sets something on screen. `[( )]` = both.

## 4.6 Dependency injection (provide / inject)

**The shared office printer:**
- **Without DI:** every worker buys and sets up their own printer. Wasteful, and changes must be repeated 10 times.
- **With DI:** the **office manager** buys **one** printer, sets it up, and puts it in the hallway. Workers just say "**Manager, give me the printer.**"

In our app: **printer = HttpClient**, **manager = Angular**, **workers = our services**.

1. **Provide** (once, at the start): `provideHttpClient()` in `app.config.ts`, meaning "Angular, create one HttpClient and keep it ready."
2. **Inject** (whoever needs it): `private http = inject(HttpClient);`, meaning "Angular, give me the HttpClient."

You never write `new HttpClient()`. It needs other things inside it to work, and Angular knows how to build it.

- **Dependency** = something your code **needs** to work.
- **Injection** = it's **given to you** from outside.

The chain in this app:
```
app.config.ts  provideHttpClient()          → FolderService/BookmarkService  inject(HttpClient)
@Injectable({providedIn:'root'}) services   → components                      inject(FolderService) / inject(BookmarkService)
```

> **Interview:** "Dependency injection means a class doesn't create the things it needs; Angular provides them. I register HttpClient once with provideHttpClient() and my services get it with inject(HttpClient). One instance is shared across the app."

## 4.7 Observables and `.subscribe()`: "prepare" vs "send"

Service methods like `getAll()` **don't send anything**. They return an **Observable**, a **prepared request waiting for someone to say "go."**
```ts
const request = folderService.getAll();   // prepared, NOT sent
folderService.getAll().subscribe((data) => {
  // NOW it's sent. This code runs LATER, when Django answers.
});
```
**The envelope picture:** `getAll()` writes the letter and puts it in an envelope. `.subscribe(...)` posts it, and the code inside is what you'll do when the reply arrives.

**Asynchronous:** a network request takes time. JavaScript doesn't freeze while it waits. It carries on, and runs your subscribe code when the answer arrives.

**Two forms of subscribe:**
```ts
// only success
.subscribe((data) => { ... })

// success AND failure
.subscribe({
  next:  (data) => { ... },   // 2xx: it worked
  error: (err)  => { ... },   // 4xx/5xx: it failed. err.error = the JSON body Django sent
})
```

## 4.8 Parent ↔ child: input and output
Components can't see each other's data. Shared data lives in the **common parent** (App):
```
                 App
        (remembers selectedFolder)
          ▲ output        │ input
          │ "Job was      ▼ "Job is
          │  clicked"       selected"
   FolderList          BookmarkList
```
- **`input()`**: data coming **in** from the parent. Read it like a signal: `this.folder()`.
- **`output()`**: events going **out** to the parent. Send with `this.folderSelected.emit(value)`.
- In the parent's HTML: `[inputName]="value"` sends down, and `(outputName)="doSomething($event)"` listens. **`$event`** = whatever was emitted.

## 4.9 Lifecycle: `ngOnInit`, `constructor`, `effect`
- **`constructor()`**: runs once when the component object is created.
- **`ngOnInit()`**: Angular calls it **once**, right after the component is placed on screen (a **lifecycle hook**). It's good for loading data once.
- **`effect(() => {...})`**: runs the code **now**, and **again whenever a signal it reads changes**. Good for "reload whenever the input changes."

## 4.10 TypeScript basics used in this project
| Thing | Meaning |
|---|---|
| `import { X } from '...'` | bring in X. `'@angular/...'` = a package; `'./x'` = our file in the same folder; `'../x'` = one folder up |
| `export` | let other files import this |
| `class X { }` | a container of data (**properties**) + functions (**methods**) |
| `this` | "this object itself" (inside a class) |
| `private` | only usable inside this class |
| `@Something({...})` | a **decorator**: a label giving a class special meaning |
| `name: string` | `name` is text. Types: `number`, `string`, `boolean` |
| `Folder[]` | a **list** of Folders |
| `<Folder[]>` | "of type list-of-Folders" (a **generic**) |
| `number \| null` | a number **or** null (`\|` = "or") |
| `null` / `undefined` | "nothing" |
| `(x) => { ... }` | an **arrow function** (a small nameless function) |
| `` `.../${id}/` `` | a **template string** (backticks; `${}` inserts a value) |
| `===` | "is exactly equal to" |
| `!x` | "not x" |
| `a?.b` | safe access: if `a` is null/undefined, give `undefined` instead of crashing |
| `list.length` | how many items |
| `text[0]` | first character (counting starts at 0) |
| `// ...` | comment (ignored) |

---

# Part 5: The frontend, file by file, line by line

## 5.1 `src/index.html`: the empty page

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Bookmark Manager</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <!-- The "Inter" font from Google Fonts (just a font, not a library) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```
- **`<!doctype html>`**: "this is a modern HTML page."
- **`<meta charset="utf-8">`**: the standard character set, so emojis display.
- **`<title>`**: the browser tab text.
- **`<base href="/">`**: all relative links start from the site root. Angular needs it.
- **`<meta name="viewport" ...>`**: fit phone screens properly.
- **`<link rel="icon" ...>`**: the tab icon.
- **The 3 font `<link>`s**: download the **Inter** font from Google Fonts (a font file, not code). Without internet, it falls back to Arial.
- **`<app-root></app-root>`** ⭐ an empty tag that **Angular finds and fills** with the whole app.

**Key idea:** the page is almost empty. Everything you see is drawn by Angular inside `<app-root>`.

---

## 5.2 `src/main.ts`: the starting point

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```
- **`import { bootstrapApplication } from '@angular/platform-browser';`**: Angular's function to **start an app** ("bootstrap" = start up).
- **`import { appConfig } from './app/app.config';`**: our settings.
- **`import { App } from './app/app';`**: our root component.
- **`bootstrapApplication(App, appConfig)`** ⭐ "Start Angular, draw `App`, and use `appConfig`." Angular reads App's `selector: 'app-root'`, finds `<app-root>`, and draws App there.
- **`.catch((err) => console.error(err));`**: if starting fails, print the error in the browser console.

Django comparison: like `python manage.py runserver`, the thing that starts everything.

---

## 5.3 `src/app/app.config.ts`: app-wide settings

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(), // switches on HttpClient so our services can call the Django API
  ]
};
```
- **`ApplicationConfig`**: the **type** for a settings object.
- **`provideBrowserGlobalErrorListeners`**: generated. It reports unexpected errors to the console. Leave it.
- **`provideHttpClient`**: switches on HttpClient.
- **`export const appConfig: ApplicationConfig = {`**: a constant named `appConfig` with the shape of an Angular settings object. `export` lets `main.ts` import it.
- **`providers: [ ... ]`**: a list of **tools Angular creates once and shares** with whoever asks (the "provide" half of dependency injection).
- **`provideHttpClient(),`** ⭐ creates an HttpClient for the services to inject. **Without it:** `No provider for HttpClient!`.

**What HttpClient does:** sends HTTP requests (GET/POST/PUT/DELETE), **turns your object into JSON** before sending, and **turns Django's JSON back into an object** when the answer arrives.

Django comparison: `providers: [provideHttpClient()]` ≈ `INSTALLED_APPS = [..., 'rest_framework']`.

### How 5.1–5.3 connect
```
index.html           has an empty  <app-root>
     ▲ fills it
main.ts              bootstrapApplication(App, appConfig)
                          │          └──► app.config.ts  (switch on HttpClient)
                          └─────────────► app.ts         (the App component, selector 'app-root')
```

---

## 5.4 `src/app/models.ts`: describing the data

```ts
// These interfaces describe the shape of the JSON that Django sends us.
// They match the fields in our Django serializers.

// Matches FolderSerializer: ['id', 'name', 'created_at']
export interface Folder {
  id: number;
  name: string;
  created_at: string; // dates arrive as text in JSON, e.g. "2026-10-10T09:40:52Z"
}

// Matches BookmarkSerializer: ['id', 'title', 'url', 'folder', 'created_at']
export interface Bookmark {
  id: number;
  title: string;
  url: string;
  folder: number; // the id of the folder this bookmark belongs to
  created_at: string;
}
```

### What an interface is
A **description of an object's shape**: which fields it has and each field's type. Like a **form template** ("FOLDER: id (a number), name (some text), created_at (some text)"). It's **not** a folder itself.

### Line by line
- **`export interface Folder {`**: describes a Folder. `export` lets other files `import { Folder } from './models'`.
- **`id: number;`**: read it as "`id` is a number." The pattern is always `fieldName: type;`.
- **`name: string;`**: text.
- **`created_at: string;`**: a date, but **JSON has no date type**, so it arrives as text.
- **`export interface Bookmark {`**: `title` and `url` are text. **`folder: number;`** is the folder's **id** (Django's ForeignKey, sent as a number).

### It mirrors the Django serializers
| Django serializer field | Angular interface | Example |
|---|---|---|
| `'id'` | `id: number` | `5` |
| `'name'` | `name: string` | `"Job"` |
| `'created_at'` | `created_at: string` | `"2026-10-10T09:40:52Z"` |
| `'title'` / `'url'` | `title: string` / `url: string` | `"GitHub"` |
| `'folder'` (ForeignKey) | `folder: number` | `5` |

**Rule:** if you add a field to a serializer, add it here too.

### Where they're used
```ts
this.http.get<Folder[]>(this.apiUrl)   // "the answer is a LIST of Folders"
folders = signal<Folder[]>([]);        // "this box holds a LIST of Folders"
startEdit(bookmark: Bookmark) { ... }  // "this function receives ONE Bookmark"
```

### Why bother
- A typo like `folder.nmae` is **underlined in red** in VS Code (*Property 'nmae' does not exist on type 'Folder'*) **before** you run the app. Without the interface, the app would silently show nothing.
- Typing `folder.` **suggests** `id`, `name`, `created_at`.

### It does nothing at runtime
It stores no data, fetches nothing, and **disappears** when compiled. It's a **label on a box**, not the box's contents.

| Django `models.py` | Angular `models.ts` |
|---|---|
| real **database tables** | only **descriptions** of JSON |
| creates SQL | creates nothing |

> **Interview:** "models.ts holds TypeScript interfaces for Folder and Bookmark. They mirror my DRF serializers, so the compiler and editor catch mistakes like typos or wrong types before the app runs. They don't exist at runtime."

---

## 5.5 `src/app/folder.service.ts`: talking to Django about folders

### Why a service?
A **service** is a class that holds code **not about the screen**, here meaning **talking to Django**. It keeps components simple, allows **reuse**, and puts the API address in **one place**. `FolderService` is the **messenger** between the screen and `/api/folders/`.

### The file
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder } from './models';

// A service holds code that talks to the backend, so components don't have to.
// providedIn: 'root' means Angular creates ONE FolderService for the whole app.
@Injectable({ providedIn: 'root' })
export class FolderService {
  private http = inject(HttpClient); // ask Angular for the HttpClient (dependency injection)
  private apiUrl = 'http://localhost:8000/api/folders/'; // the Django folder endpoint

  // GET /api/folders/  -> Django FolderViewSet.list
  getAll() {
    return this.http.get<Folder[]>(this.apiUrl);
  }

  // POST /api/folders/  -> Django FolderViewSet.create
  create(name: string) {
    return this.http.post<Folder>(this.apiUrl, { name: name });
  }

  // PUT /api/folders/5/  -> Django FolderViewSet.update
  update(id: number, name: string) {
    return this.http.put<Folder>(`${this.apiUrl}${id}/`, { name: name });
  }

  // DELETE /api/folders/5/  -> Django FolderViewSet.destroy
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
```

### Imports
| What | From | Used for |
|---|---|---|
| `Injectable` | Angular | to mark this class as a service |
| `inject` | Angular | to ask Angular for a tool |
| `HttpClient` | Angular | the tool that sends HTTP requests |
| `Folder` | our `models.ts` | to say what Django sends back |

### The class
- **`@Injectable({ providedIn: 'root' })`**: a **decorator**: "this class is a service Angular can hand out." **`providedIn: 'root'`** = create **one** FolderService for the whole app and share it.
- **`export class FolderService {`**: `export` lets components import it.

### The 2 properties
- **`private http = inject(HttpClient);`**: "Angular, give me the HttpClient" (provided in `app.config.ts`). **`private`** means components can't reach `folderService.http` directly; they must use the 4 methods.
- **`private apiUrl = 'http://localhost:8000/api/folders/';`**: the Django address, written **once**. It's exactly what Django's router created: `/api/` (config/urls.py) + `folders/` (router).
- **`this`** = "this object itself." `this.http` = my http property. You must write `this.` inside methods.

### The 4 methods: each is one Django endpoint
The pattern:
```ts
methodName(inputs) {
  return this.http.METHOD<WhatComesBack>(URL, body);
}
```
- **inputs** = values given when calling the method. **`return`** = hand the result back to the caller.

**`getAll()`**: no inputs. `this.http.get<Folder[]>(this.apiUrl)` → **`GET /api/folders/`**. `<Folder[]>` = Django answers with a list of Folders. Django: `FolderViewSet.list` → `200 [...]`.

**`create(name: string)`**: one text input. `this.http.post<Folder>(this.apiUrl, { name: name })` → **`POST /api/folders/`**. `{ name: name }` = the **body**: "a field called `name` whose value is the `name` input." HttpClient converts it to JSON `{"name": "Job"}`. `<Folder>` = one new folder comes back. Django: `create` → `201` or `400`.

**`update(id: number, name: string)`**: two inputs. The URL is a **template string**: `` `${this.apiUrl}${id}/` `` → with `id = 5` → **`http://localhost:8000/api/folders/5/`**. Backticks `` ` `` + `${...}` insert values. `this.http.put(...)` → **`PUT /api/folders/5/`** with `{"name": "Careers"}`. Django: `update` → `200` or `400`.

**`delete(id: number)`**: `this.http.delete(...)` → **`DELETE /api/folders/5/`**. No body. No `<...>` type, because Django sends back nothing (`204`). Django: `destroy` (+ CASCADE).

| Method | HTTP | URL | Body | Django | Success |
|---|---|---|---|---|---|
| `getAll()` | GET | `/api/folders/` | none | `list` | 200 + list |
| `create(name)` | POST | `/api/folders/` | `{"name": ...}` | `create` | 201 + folder |
| `update(id, name)` | PUT | `/api/folders/5/` | `{"name": ...}` | `update` | 200 + folder |
| `delete(id)` | DELETE | `/api/folders/5/` | none | `destroy` | 204 |

### ⭐ These methods only *prepare* the request
They return an **Observable**. The request is only sent when a **component** calls `.subscribe(...)` (see 4.7). If a component calls `getAll()` but never subscribes, Django receives nothing.

---

## 5.6 `folder-list.component.ts`: the sidebar's code

```ts
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Folder } from '../models';
import { FolderService } from '../folder.service';

// The left sidebar: shows the list of folders.
@Component({
  selector: 'app-folder-list',                // use it in HTML as <app-folder-list />
  imports: [FormsModule],                     // gives us [(ngModel)] for the text box
  templateUrl: './folder-list.component.html', // its HTML
})
export class FolderListComponent implements OnInit {
  private folderService = inject(FolderService); // ask Angular for our FolderService

  selectedId = input<number | undefined>();  // IN:  the parent (App) tells us which folder is selected
  folderSelected = output<Folder | null>();  // OUT: we tell the parent when the selection changes

  folders = signal<Folder[]>([]); // the folders shown on screen (starts as an empty list)
  newName = signal('');           // whatever is typed in the "New folder" box
  error = signal('');             // an error message from Django to show on screen
  editingId = signal<number | null>(null); // id of the folder being renamed (null = none)
  editName = signal('');                   // the text in the rename box

  // Angular calls ngOnInit once, when the component first appears on screen.
  ngOnInit() {
    this.loadFolders();
  }

  // Ask Django for all folders and show them.
  loadFolders() {
    this.folderService.getAll().subscribe((data) => {
      this.folders.set(data); // Django answered: store the folders, and the screen updates
    });
  }

  // Runs when a folder name is clicked: tell the parent (App) which folder was picked.
  selectFolder(folder: Folder) {
    this.folderSelected.emit(folder);
  }

  // Runs when the "Add" button is clicked.
  addFolder() {
    this.folderService.create(this.newName()).subscribe({
      next: () => {
        this.newName.set('');  // success: clear the text box
        this.error.set('');    // and any old error
        this.loadFolders();    // reload the list so the new folder appears
      },
      error: (err) => {
        // Django sent 400, e.g. {"name": ["folder with this name already exists."]}
        this.error.set(err.error.name);
      },
    });
  }

  // Runs when "Rename" is clicked: turn this folder's row into a text box.
  startRename(folder: Folder) {
    this.editingId.set(folder.id);  // remember which folder we're renaming
    this.editName.set(folder.name); // fill the box with the current name
  }

  // Runs when "Cancel" is clicked: go back to normal, change nothing.
  cancelRename() {
    this.editingId.set(null);
    this.error.set('');
  }

  // Runs when "Save" is clicked: send the new name to Django.
  saveRename(folder: Folder) {
    this.folderService.update(folder.id, this.editName()).subscribe({
      next: (updated) => {
        this.editingId.set(null); // success: close the text box
        this.error.set('');
        this.loadFolders();       // reload so the new name appears
        if (folder.id === this.selectedId()) {
          this.folderSelected.emit(updated); // it's the selected one: give App the new name too
        }
      },
      error: (err) => {
        this.error.set(err.error.name); // e.g. duplicate or blank name
      },
    });
  }

  // Runs when "Delete" is clicked.
  deleteFolder(folder: Folder) {
    // Ask first, because Django will also delete every bookmark inside (CASCADE)
    if (!confirm(`Delete "${folder.name}" and all its bookmarks?`)) {
      return; // user clicked Cancel: stop here
    }
    this.folderService.delete(folder.id).subscribe(() => {
      this.loadFolders(); // reload so the folder disappears
      if (folder.id === this.selectedId()) {
        this.folderSelected.emit(null); // the selected folder is gone: select nothing
      }
    });
  }
}
```

### Imports
| What | Used for |
|---|---|
| `Component` | the `@Component` decorator |
| `OnInit` | promises an `ngOnInit` function |
| `inject` | dependency injection |
| `input`, `output` | talk to the parent (App) |
| `signal` | the component's memory |
| `FormsModule` | gives the HTML `[(ngModel)]` |
| `Folder` | our interface |
| `FolderService` | our messenger to Django |

`'../models'`: **`..`** = up one folder (this file is in `app/folder-list/`).

### The decorator
- **`selector: 'app-folder-list'`**: the HTML tag name. `<app-folder-list />` in App's HTML puts this component there.
- **`imports: [FormsModule]`**: tools this component's HTML may use (needed for `[(ngModel)]`).
- **`templateUrl`**: its HTML file.

### The class
- **`export class FolderListComponent implements OnInit`**: `implements OnInit` = a promise to Angular that the class has `ngOnInit()`. TypeScript checks it.
- **`private folderService = inject(FolderService);`**: get the messenger.

### Talking to the parent
- **`selectedId = input<number | undefined>();`**: data **in** from App: which folder is selected (for the highlight). `undefined` = nothing yet. Read with `this.selectedId()`.
- **`folderSelected = output<Folder | null>();`**: an event **out** to App. Send with `.emit(...)`. `null` = "nothing selected."

### The 5 signals (the sidebar's memory)
| Signal | Holds | Starts as | Used in the HTML for |
|---|---|---|---|
| `folders` | `Folder[]` | `[]` | the list |
| `newName` | text | `''` | the "New folder name" box |
| `error` | text | `''` | the red error message |
| `editingId` | number or `null` | `null` | which row shows the rename box |
| `editName` | text | `''` | the rename box |

`signal('')`: TypeScript guesses "text" from `''`, so no `<...>` is needed.

### `ngOnInit()`
Angular calls it **once** when the component appears → `this.loadFolders()` → the list loads straight away.

### `loadFolders()` ⭐ the first real Django call
```ts
this.folderService.getAll().subscribe((data) => {
  this.folders.set(data);
});
```
1. `getAll()` prepares `GET /api/folders/`.
2. `.subscribe(...)` **sends it**.
3. `(data) => {...}` is an **arrow function** that runs **later**, when Django answers. `data` = the JSON, already converted to `Folder[]`.
4. `this.folders.set(data)` → the signal changes → **Angular redraws the list**.

It's its own function because it's needed **many times**: on start, and after add, rename and delete.

```
time ──────────────────────────────────────────────────────────────►
 getAll().subscribe(...)   request leaves         Django answers
 (request sent)            ─────── network ─────► [{"id":5,"name":"Job"},…]
 JavaScript carries on                                   │
 (screen shows "No folders yet")                         ▼
                                          (data) => folders.set(data)
                                                         ▼
                                          screen redraws: Job, College, School
```

### The 6 action functions
| Function | Runs when you click… | Talks to Django? |
|---|---|---|
| `selectFolder` | a folder **name** | ❌ (tells App instead) |
| `addFolder` | **+ Add** | ✅ POST |
| `startRename` | **Rename** | ❌ (only changes the screen) |
| `cancelRename` | **Cancel** | ❌ |
| `saveRename` | **Save** | ✅ PUT |
| `deleteFolder` | **Delete** | ✅ DELETE |

**`selectFolder(folder)`**: `this.folderSelected.emit(folder)` = "send this event out to my parent now." FolderList doesn't store the selection; it **announces** it, and App stores it.

**`addFolder()`** ⭐
- `this.newName()` = what you typed (kept in sync by `[(ngModel)]`).
- `create(...)` → `POST /api/folders/` with `{"name": "Job"}`.
- `.subscribe({ next, error })`, because the request can go two ways:
  - **`next`** (201): `newName.set('')` (the box empties on screen), `error.set('')`, `loadFolders()`.
  - **`error`** (400): `err.error` = Django's JSON body, e.g. `{"name": ["folder with this name already exists."]}`. `err.error.name` = that message → `this.error.set(...)` → the red box appears.
- The message **comes from Django** (`unique=True` + the serializer). Angular never wrote "already exists."

**`startRename(folder)`**: `editingId.set(folder.id)` (only that row switches to a text box) and `editName.set(folder.name)` (the box starts with the current name). No Django call.

**`cancelRename()`**: `editingId.set(null)` (every row returns to normal) and clears the error. No Django call.

**`saveRename(folder)`**: the same shape as `addFolder`.
- `update(folder.id, this.editName())` → `PUT /api/folders/5/` with `{"name": "Careers"}`.
- **`next: (updated) => {...}`**: `updated` = the folder Django returned. Close the box, clear the error, reload. **`if (folder.id === this.selectedId())`** (`===` = exactly equal) → if the renamed folder is the **selected** one, `emit(updated)` so App has the **new name** for the right-hand heading.
- **`error`**: show Django's message. The box **stays open** (`editingId` isn't reset) so you can fix it.

**`deleteFolder(folder)`**
- `confirm(...)` = the browser's **OK/Cancel pop-up**, returning `true` (OK) or `false` (Cancel). The message is a template string: *Delete "Job" and all its bookmarks?*
- `if (!confirm(...)) { return; }`: `!` = "not." If the user did **not** click OK → **`return`** leaves the function immediately, and nothing is sent.
- `delete(folder.id).subscribe(() => {...})` → `DELETE /api/folders/5/` → Django deletes the folder **and its bookmarks** (CASCADE) → `204`. Only a success function (nothing to validate).
- `loadFolders()` refreshes. If the deleted folder was the selected one → `emit(null)` → App shows "Pick a folder."
- **Why the pop-up?** CASCADE means one mis-click would lose all of the folder's bookmarks.

### The pattern behind every action
```
1. read what you need        (this.newName(), folder.id, this.editName())
2. call the service           (create / update / delete)
3. .subscribe({
     next:  success → reset signals + loadFolders()   (+ tell App if needed)
     error: failure → error.set(err.error.name)
   })
```
Screen-only functions (`startRename`, `cancelRename`, `selectFolder`) just **change a signal** or **emit**.

### Who changes each signal
| Signal | Changed by |
|---|---|
| `folders` | `loadFolders` |
| `newName` | your typing (`[(ngModel)]`), `addFolder` (clears it) |
| `error` | `addFolder`, `saveRename` (set/clear), `cancelRename` (clear) |
| `editingId` | `startRename` (set), `cancelRename` / `saveRename` (back to null) |
| `editName` | `startRename` (fills it), your typing |

---

## 5.7 `folder-list.component.html`: the sidebar's HTML

```html
<h2 class="section-title">Folders</h2>

<!-- Form to add a new folder -->
<div class="form-row">
  <input [(ngModel)]="newName" placeholder="New folder name" />
  <button class="btn-primary" (click)="addFolder()">＋ Add</button>
</div>

<!-- Only shown when there is an error -->
@if (error()) {
  <p class="error">{{ error() }}</p>
}

<ul class="folder-list">
  <!-- Repeat this <li> once for every folder in the list -->
  @for (folder of folders(); track folder.id) {
    <!-- [class.selected] adds the CSS class "selected" only to the chosen folder -->
    <li class="folder" [class.selected]="folder.id === selectedId()">
      @if (editingId() === folder.id) {
        <!-- This folder is being renamed: show a text box -->
        <input [(ngModel)]="editName" />
        <button class="btn-primary" (click)="saveRename(folder)">Save</button>
        <button class="btn-ghost" (click)="cancelRename()">Cancel</button>
      } @else {
        <!-- Normal view: the name (click it to select the folder) and buttons -->
        <span class="folder-name" (click)="selectFolder(folder)">
          <span class="folder-icon">📁</span>{{ folder.name }}
        </span>
        <button class="btn-ghost" (click)="startRename(folder)">Rename</button>
        <button class="btn-danger" (click)="deleteFolder(folder)">Delete</button>
      }
    </li>
  } @empty {
    <li class="empty-row">No folders yet. Add one above ☝️</li>
  }
</ul>
```
This HTML can use **everything in the `.ts` class**. `<!-- -->` = comments. `class="..."` (no brackets) = CSS names, used for styling only.

### The title
`<h2 class="section-title">Folders</h2>`: plain HTML.

### The add form
- **`<div class="form-row">`**: a plain box grouping the input and button.
- **`<input [(ngModel)]="newName" placeholder="New folder name" />`**: **two-way binding**. You type "Job" → `newName` = "Job". Code does `newName.set('')` → the box empties. `placeholder` = grey hint text. Requires `FormsModule`.
- **`<button (click)="addFolder()">`**: **event binding**. A click runs `addFolder()`.

### The error message
- **`@if (error()) { ... }`**: shown only if the condition is true. `''` counts as false, any message as true.
- **`{{ error() }}`**: **interpolation**, which shows the value as text.
- It updates by itself when `error` changes.

### The list
- **`<ul>`** = a list, **`<li>`** = one item.
- **`@for (folder of folders(); track folder.id)`**: repeat the block **once per folder**. Inside, **`folder`** = this row's folder. **`track folder.id`** = each row's unique id, so Angular updates only the rows that changed (required).
- **`@empty { ... }`**: shown when the list is empty.

### One row
- **`[class.selected]="folder.id === selectedId()"`**: **class binding**. Add the CSS class `selected` only if this row's folder is the selected one (`selectedId` = the input from App). The CSS then makes it glow.
- **`@if (editingId() === folder.id) { ... } @else { ... }`**: "is this row being renamed?" It's asked for **every** row. Only the row matching `editingId` shows the rename look.

**Normal look:**
- **`<span class="folder-name" (click)="selectFolder(folder)">`**: clicking the **name** selects. The click is on the name only, so clicking Rename/Delete doesn't also select.
- **`📁 {{ folder.name }}`**: icon + name.
- **`(click)="startRename(folder)"`** / **`(click)="deleteFolder(folder)"`**: each passes **this row's folder**, so the function knows **which row** was clicked.

**Rename look:**
- **`<input [(ngModel)]="editName" />`**: the rename box (filled by `startRename`).
- **Save** → `saveRename(folder)` → PUT. **Cancel** → `cancelRename()`.

### Every connection
| In the HTML | Connects to | Direction |
|---|---|---|
| `[(ngModel)]="newName"` | `newName` | ⇄ |
| `(click)="addFolder()"` | `addFolder()` | screen → code |
| `@if (error())` + `{{ error() }}` | `error` | code → screen |
| `@for (folder of folders() ...)` | `folders` | code → screen |
| `[class.selected]="folder.id === selectedId()"` | `selectedId` input | code → screen |
| `@if (editingId() === folder.id)` | `editingId` | code → screen |
| `{{ folder.name }}` | the loop's `folder` | code → screen |
| `(click)="selectFolder(folder)"` | `selectFolder()` | screen → code |
| `(click)="startRename(folder)"` | `startRename()` | screen → code |
| `(click)="deleteFolder(folder)"` | `deleteFolder()` | screen → code |
| `[(ngModel)]="editName"` | `editName` | ⇄ |
| `(click)="saveRename(folder)"` | `saveRename()` | screen → code |
| `(click)="cancelRename()"` | `cancelRename()` | screen → code |

### One complete loop: rename "Job" to "Careers"
```
SCREEN                                   CODE (.ts)
──────                                   ──────────
click [Rename] on Job row  ──(click)──►  startRename(Job)
                                           editingId.set(5), editName.set("Job")
Job row switches to a text box ◄──@if──  editingId() === 5 is now true
box shows "Job"            ◄─ngModel──   editName = "Job"

type "Careers"             ──ngModel──►  editName = "Careers"
click [Save]               ──(click)──►  saveRename(Job)
                                           folderService.update(5, "Careers").subscribe
                                           ── PUT /api/folders/5/ ──► Django ── 200 ──►
                                           next: editingId.set(null), loadFolders()
row returns to normal      ◄──@if──      editingId() is null
shows "Careers"            ◄──@for──     folders.set(fresh list from Django)
```

---

## 5.8 `app.ts` + `app.html`: the parent that connects both sides

### The problem
FolderList knows **when** you click a folder. BookmarkList needs to know **which** folder. Components can't see each other's data, so **App**, the parent of both, is the **middleman**.

### `app.ts`
```ts
import { Component, signal } from '@angular/core';
import { Folder } from './models';
import { FolderListComponent } from './folder-list/folder-list.component';
import { BookmarkListComponent } from './bookmark-list/bookmark-list.component';

// The root component: the whole page. It holds the other components.
@Component({
  selector: 'app-root',                                  // fills <app-root> in index.html
  imports: [FolderListComponent, BookmarkListComponent], // components used in app.html must be listed here
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  selectedFolder = signal<Folder | null>(null); // the folder picked in the sidebar (null = none yet)
}
```
- **Imports:** `Component`, `signal`, `Folder`, and the **two child components**.
- **`selector: 'app-root'`**: fills `<app-root>` in `index.html`. App is the **root** component that `main.ts` starts.
- **`imports: [FolderListComponent, BookmarkListComponent]`** ⭐ a component must list **every component it uses in its HTML**. Remove one and Angular complains it doesn't know `<app-bookmark-list>`.
- **`templateUrl` / `styleUrl`**: its HTML and CSS (`app.css` is empty, because all CSS is in `styles.css`).
- **`selectedFolder = signal<Folder | null>(null);`**: **the single source of truth** for "which folder is selected." It starts as `null`.

### `app.html`
```html
<!-- Soft coloured blobs that float in the background (pure decoration) -->
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>
<div class="blob blob-3"></div>

<header class="hero">
  <div class="logo">🔖</div>
  <div>
    <h1>Bookmark Manager</h1>
    <p class="tagline">Angular&nbsp;+&nbsp;Django REST Framework</p>
  </div>
</header>

<!-- Two columns: folders on the left, bookmarks on the right -->
<div class="layout">

  <aside class="card sidebar">
    <app-folder-list
      [selectedId]="selectedFolder()?.id"
      (folderSelected)="selectedFolder.set($event)"
    />
  </aside>

  <main class="card content">
    @if (selectedFolder(); as folder) {
      <app-bookmark-list [folder]="folder" />
    } @else {
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>Pick a folder</h2>
        <p>Choose a folder on the left to see its bookmarks.</p>
      </div>
    }
  </main>

</div>
```

**Decoration (no logic):** the 3 `blob` divs (glowing background), the header (logo, title, tagline; `&nbsp;` = a non-breaking space), and the layout boxes (`<aside>` = side panel, `<main>` = main area).

**Left side ⭐**
```html
<app-folder-list
  [selectedId]="selectedFolder()?.id"
  (folderSelected)="selectedFolder.set($event)"
/>
```
- **`[selectedId]="selectedFolder()?.id"`**: data **down** into FolderList's input. **`?.`** = safe access: if `selectedFolder()` is `null`, give `undefined` instead of crashing.
- **`(folderSelected)="selectedFolder.set($event)"`**: listen to FolderList's output. **`$event`** = what was emitted:
  - `selectFolder` → the clicked folder
  - `saveRename` → the renamed folder
  - `deleteFolder` → `null`

**Right side**
- **`@if (selectedFolder(); as folder)`**: if a folder is selected, call it **`folder`** inside the block.
- **`<app-bookmark-list [folder]="folder" />`**: show BookmarkList and send the folder **down** into its required input.
- **`@else`**: the 📂 "Pick a folder" message.

### The full selection flow
```
START:   selectedFolder = null
         → FolderList gets selectedId = undefined → no row highlighted
         → @if is false → right side shows "Pick a folder"

YOU CLICK "Job"
 1. FolderList  (click)="selectFolder(folder)"      → selectFolder(Job)
 2. FolderList  this.folderSelected.emit(Job)       ── output ──► up to App
 3. App         (folderSelected)="selectedFolder.set($event)"   $event = Job
 4. App's signal changed → Angular redraws App's HTML:
      a. [selectedId] sends 5 down → FolderList's [class.selected] → Job glows
      b. @if is true → <app-bookmark-list [folder]="Job"> appears
 5. BookmarkList receives folder = Job → loads Job's bookmarks from Django

YOU CLICK "College" → App's signal = College → [folder] input changes → BookmarkList reloads

YOU DELETE the selected folder → FolderList emits null → App's signal = null
 → highlight disappears, @if false → "Pick a folder"
```

**Why App holds the selection:** both sides need it (highlight + loading). **Shared data goes in the common parent.** App has no service and makes **no** HTTP calls. It only remembers and passes the selection around.

---

## 5.9 `bookmark.service.ts`: talking to Django about bookmarks

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bookmark } from './models';

// Talks to Django's bookmark API. Same idea as FolderService.
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private http = inject(HttpClient); // ask Angular for the HttpClient
  private apiUrl = 'http://localhost:8000/api/bookmarks/'; // the Django bookmark endpoint

  // GET /api/bookmarks/?folder=5  -> only the bookmarks in folder 5
  getByFolder(folderId: number) {
    return this.http.get<Bookmark[]>(`${this.apiUrl}?folder=${folderId}`);
  }

  // POST /api/bookmarks/  with {"title": ..., "url": ..., "folder": 5}
  create(title: string, url: string, folderId: number) {
    return this.http.post<Bookmark>(this.apiUrl, { title: title, url: url, folder: folderId });
  }

  // PUT /api/bookmarks/3/  with the full bookmark data
  update(id: number, title: string, url: string, folderId: number) {
    return this.http.put<Bookmark>(`${this.apiUrl}${id}/`, { title: title, url: url, folder: folderId });
  }

  // DELETE /api/bookmarks/3/
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
```

### Same as FolderService
`@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, `private apiUrl`, template strings, and **methods only prepare; `.subscribe()` sends**.

| | FolderService | BookmarkService |
|---|---|---|
| imports | `Folder` | `Bookmark` |
| `apiUrl` | `.../api/folders/` | `.../api/bookmarks/` |
| list | `getAll()` | **`getByFolder(folderId)`** |
| create | `create(name)` | **`create(title, url, folderId)`** |
| update | `update(id, name)` | **`update(id, title, url, folderId)`** |
| delete | `delete(id)` | same |

### Difference 1: `getByFolder(folderId)` uses the filter
`` `${this.apiUrl}?folder=${folderId}` `` → **`http://localhost:8000/api/bookmarks/?folder=5`**. `?folder=5` is a **query parameter**. Django's `get_queryset` reads it with `query_params.get('folder')`. **Same word on both sides.** We only ask for the folder being shown.

### Difference 2: `create` sends 3 fields
`{ title: title, url: url, folder: folderId }` → `{"title": "GitHub", "url": "https://github.com", "folder": 5}`. **`folder`** is named as in `BookmarkSerializer`, and its value is the folder's id. **This is what puts the bookmark inside the folder.** Django checks title (required, ≤200), url (valid URL) and folder (must exist).

### Difference 3: `update` sends ALL 3 fields
**PUT means "replace the whole bookmark,"** so DRF expects **every** writable field. Leave out `folder` and you get **400** `"folder": ["This field is required."]`. (Folder's `update` only sends `name` because that's Folder's only field.)

| Method | HTTP | URL | Body | Django |
|---|---|---|---|---|
| `getByFolder(5)` | GET | `/api/bookmarks/?folder=5` | none | `list` + `get_queryset` |
| `create(t, u, 5)` | POST | `/api/bookmarks/` | `{"title","url","folder":5}` | `create` |
| `update(3, t, u, 5)` | PUT | `/api/bookmarks/3/` | `{"title","url","folder":5}` | `update` |
| `delete(3)` | DELETE | `/api/bookmarks/3/` | none | `destroy` |

---

## 5.10 `bookmark-list.component.ts`: the right side's code

```ts
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bookmark, Folder } from '../models';
import { BookmarkService } from '../bookmark.service';

// The right side: shows the bookmarks of the selected folder.
@Component({
  selector: 'app-bookmark-list',                 // use it in HTML as <app-bookmark-list />
  imports: [FormsModule],                        // gives us [(ngModel)] for the text boxes
  templateUrl: './bookmark-list.component.html',
})
export class BookmarkListComponent {
  private bookmarkService = inject(BookmarkService); // ask Angular for our BookmarkService

  folder = input.required<Folder>(); // IN: the selected folder, given to us by App (required)
  bookmarks = signal<Bookmark[]>([]); // the bookmarks shown on screen
  newTitle = signal('');              // what's typed in the "Title" box
  newUrl = signal('');                // what's typed in the "URL" box
  errors = signal<any>({});           // Django's 400 errors, e.g. {"url": ["Enter a valid URL."]}
  editingId = signal<number | null>(null); // id of the bookmark being edited (null = none)
  editTitle = signal('');                  // the text in the edit "Title" box
  editUrl = signal('');                    // the text in the edit "URL" box
  editErrors = signal<any>({});            // Django's 400 errors while editing

  constructor() {
    // effect() runs this code now, and again every time folder() changes
    // (i.e. whenever you click a different folder in the sidebar).
    effect(() => {
      this.loadBookmarks(this.folder().id);
      this.errors.set({}); // switching folders clears old error messages
      this.editingId.set(null); // and closes any open edit
    });
  }

  // Ask Django for this folder's bookmarks and show them.
  loadBookmarks(folderId: number) {
    this.bookmarkService.getByFolder(folderId).subscribe((data) => {
      this.bookmarks.set(data);
    });
  }

  // Runs when the "Add" button is clicked.
  addBookmark() {
    this.bookmarkService.create(this.newTitle(), this.newUrl(), this.folder().id).subscribe({
      next: () => {
        this.newTitle.set(''); // success: clear both boxes
        this.newUrl.set('');
        this.errors.set({});
        this.loadBookmarks(this.folder().id); // reload so the new bookmark appears
      },
      error: (err) => {
        this.errors.set(err.error); // 400: keep Django's error object to show next to each box
      },
    });
  }

  // Runs when "Edit" is clicked: turn this row into text boxes.
  startEdit(bookmark: Bookmark) {
    this.editingId.set(bookmark.id);    // remember which bookmark we're editing
    this.editTitle.set(bookmark.title); // fill the boxes with the current values
    this.editUrl.set(bookmark.url);
    this.editErrors.set({});
  }

  // Runs when "Cancel" is clicked: go back to normal, change nothing.
  cancelEdit() {
    this.editingId.set(null);
  }

  // Runs when "Save" is clicked: send the new title + url to Django.
  saveEdit(bookmark: Bookmark) {
    this.bookmarkService.update(bookmark.id, this.editTitle(), this.editUrl(), this.folder().id).subscribe({
      next: () => {
        this.editingId.set(null); // success: close the text boxes
        this.loadBookmarks(this.folder().id); // reload so the changes appear
      },
      error: (err) => {
        this.editErrors.set(err.error); // 400: show the errors, keep the boxes open
      },
    });
  }

  // Runs when "Delete" is clicked.
  deleteBookmark(bookmark: Bookmark) {
    this.bookmarkService.delete(bookmark.id).subscribe(() => {
      this.loadBookmarks(this.folder().id); // reload so the bookmark disappears
    });
  }
}
```

It follows the **same pattern as FolderList**. Here's what's different.

### Imports and decorator
The same as FolderList, plus **`effect`**. There's no `OnInit` or `output` (not needed). `selector: 'app-bookmark-list'`, `imports: [FormsModule]`.

### `folder = input.required<Folder>();` ⭐
- Data **in** from App: `<app-bookmark-list [folder]="folder" />`.
- **`.required`**: App **must** provide it. This component makes no sense without a folder. It's safe because App only shows it inside `@if (selectedFolder(); as folder)`.
- `this.folder()` → the folder · `this.folder().id` → 5 · `this.folder().name` → "Job".

### The signals
```ts
bookmarks = signal<Bookmark[]>([]);       // the list
newTitle = signal('');                    // add form: Title box
newUrl = signal('');                      // add form: URL box
errors = signal<any>({});                 // add form errors
editingId = signal<number | null>(null);  // which bookmark is being edited
editTitle = signal('');                   // edit: Title box
editUrl = signal('');                     // edit: URL box
editErrors = signal<any>({});             // edit errors (shown inside the row)
```
| FolderList | BookmarkList | Why |
|---|---|---|
| `folders` | `bookmarks` | different data |
| `newName` | `newTitle` + `newUrl` | 2 fields |
| `error` (text) | **`errors` (object)** | errors can be on several fields |
| `editingId` | `editingId` | same idea |
| `editName` | `editTitle` + `editUrl` | 2 fields |
| *(shared `error`)* | **`editErrors`** | edit errors appear inside the row |

**Why `errors` is an object `{}`:** Django can complain about **both** fields at once:
```json
{"title": ["This field may not be blank."], "url": ["Enter a valid URL."]}
```
We store the **whole object**, and the HTML shows `errors().title` and `errors().url` separately. `{}` = no errors. `<any>` = don't check the shape (its keys depend on Django), which is the simplest choice.

### `constructor()` + `effect(...)` ⭐
```ts
constructor() {
  effect(() => {
    this.loadBookmarks(this.folder().id);
    this.errors.set({});
    this.editingId.set(null);
  });
}
```
- The **constructor** runs once when the component is created.
- **`effect`** runs the code **now**, and **again whenever a signal it reads changes**. It reads `this.folder()`, so it re-runs **every time you pick a different folder**.
- Inside: load bookmarks for the (new) folder, clear old errors, close any open edit.

| | FolderList | BookmarkList |
|---|---|---|
| Loads data… | **once** | **every time the folder changes** |
| Uses | `ngOnInit()` | `effect()` |

With `ngOnInit`, clicking a second folder would still show the first folder's bookmarks.

```
click "Job"     → App: [folder]=Job         → effect runs → loadBookmarks(5)
click "College" → App: [folder]=College     → effect runs again → loadBookmarks(6)
rename "Job"    → App: [folder]=updated Job → effect runs → reload (heading shows new name)
```

### `loadBookmarks(folderId)`
The same as `loadFolders`, but it takes **`folderId`**. `getByFolder(5)` → `GET /api/bookmarks/?folder=5` → `bookmarks.set(data)` → the list redraws. Django: `list` → `get_queryset` → `WHERE folder_id = 5`.

### `addBookmark()`
- `this.newTitle()`, `this.newUrl()` (typed values) and ⭐ **`this.folder().id`** (from the input) **puts the bookmark in the selected folder**.
- `create(...)` → `POST /api/bookmarks/` with `{"title", "url", "folder": 5}`.
- **`next`** (201): clear both boxes and errors, reload.
- **`error`** (400): **`this.errors.set(err.error)`** stores the **whole** object (compare `addFolder`, which takes only `err.error.name`).

### `startEdit(bookmark)` / `cancelEdit()`
Like rename: set `editingId` (only this row switches), fill **both** edit boxes with current values, clear edit errors. Cancel → `editingId = null`. No Django calls.

### `saveEdit(bookmark)`
- `update(id, editTitle(), editUrl(), folder().id)` → `PUT /api/bookmarks/3/` with **all 3 fields** (PUT replaces everything).
- **`next`** (200): close the boxes, reload.
- **`error`** (400): goes into **`editErrors`**, so the message appears **inside that row**. The boxes stay open.

### `deleteBookmark(bookmark)`
`DELETE /api/bookmarks/3/` → `204` → reload. **No confirm pop-up**: deleting one bookmark is low-risk (unlike a folder, whose CASCADE removes everything inside).

### FolderList vs BookmarkList
| | FolderList | BookmarkList |
|---|---|---|
| Talks to | FolderService | BookmarkService |
| Input from App | `selectedId` (optional) | `folder` (**required**) |
| Output to App | `folderSelected` | none |
| Loads with | `ngOnInit` (once) | `effect` (every folder change) |
| Errors | one text: `error` | objects: `errors`, `editErrors` |
| Edit mode | `editingId` + `editName` | `editingId` + `editTitle` + `editUrl` |
| Delete asks first? | yes (CASCADE) | no |

---

## 5.11 `bookmark-list.component.html`: the right side's HTML

```html
<div class="content-header">
  <h2 class="folder-title">{{ folder().name }}</h2>
  <!-- How many bookmarks are in this folder -->
  <span class="count">{{ bookmarks().length }}</span>
</div>

<!-- Form to add a new bookmark to this folder -->
<div class="form-row">
  <input [(ngModel)]="newTitle" placeholder="Title" />
  <input [(ngModel)]="newUrl" placeholder="https://..." />
  <button class="btn-primary" (click)="addBookmark()">＋ Add bookmark</button>
</div>

<!-- Django's error messages, one per field (only shown if that field had an error) -->
@if (errors().title) {
  <p class="error">Title: {{ errors().title }}</p>
}
@if (errors().url) {
  <p class="error">URL: {{ errors().url }}</p>
}

<ul class="bookmark-list">
  <!-- One <li> per bookmark in this folder -->
  @for (bookmark of bookmarks(); track bookmark.id) {
    <li class="bookmark">
      @if (editingId() === bookmark.id) {
        <!-- This bookmark is being edited: the row turns into text boxes -->
        <input [(ngModel)]="editTitle" placeholder="Title" />
        <input [(ngModel)]="editUrl" placeholder="https://..." />
        <button class="btn-primary" (click)="saveEdit(bookmark)">Save</button>
        <button class="btn-ghost" (click)="cancelEdit()">Cancel</button>
        @if (editErrors().title) {
          <p class="error">Title: {{ editErrors().title }}</p>
        }
        @if (editErrors().url) {
          <p class="error">URL: {{ editErrors().url }}</p>
        }
      } @else {
        <!-- A coloured circle with the first letter of the title -->
        <div class="avatar">{{ bookmark.title[0] }}</div>
        <!-- Normal view. target="_blank" opens the link in a new tab -->
        <a class="bookmark-link" [href]="bookmark.url" target="_blank" rel="noopener">
          <span class="bookmark-title">{{ bookmark.title }}</span>
          <span class="bookmark-url">{{ bookmark.url }}</span>
        </a>
        <button class="btn-ghost" (click)="startEdit(bookmark)">Edit</button>
        <button class="btn-danger" (click)="deleteBookmark(bookmark)">Delete</button>
      }
    </li>
  } @empty {
    <li class="empty-row">No bookmarks here yet. Add your first one above ✨</li>
  }
</ul>
```

### Header
- **`{{ folder().name }}`**: the input from App, e.g. "Job". It updates when you pick another folder.
- **`{{ bookmarks().length }}`**: **`.length`** = how many items. 3 bookmarks → **3** in the pill.

### Add form
Two text boxes two-way bound to `newTitle` and `newUrl`, and **+ Add bookmark** → `addBookmark()`. On success, both boxes empty.

### Add-form errors (per field)
- **`@if (errors().title)`**: "the `title` part of Django's error object." If missing (`undefined`) → false → hidden.
- Two separate `@if`s, so each message appears only if Django complained about **that** field.

| You send | Django's 400 body | What appears |
|---|---|---|
| title ✅, url `hello` | `{"url": [...]}` | only "URL: Enter a valid URL." |
| both empty | `{"title": [...], "url": [...]}` | both messages |
| all valid | (201) | nothing |

### The list
`@for (bookmark of bookmarks(); track bookmark.id)` gives one row per bookmark, and `@empty` shows the message.

### One row: `@if (editingId() === bookmark.id)` edit look / `@else` normal look

**Normal look:**
- **`{{ bookmark.title[0] }}`**: the **first letter** (`[0]` = first; counting starts at 0). `"GitHub"[0]` → `G`. The CSS makes it the coloured badge.
- **`<a [href]="bookmark.url" target="_blank" rel="noopener">`**:
  - `<a>` = a link.
  - **`[href]="bookmark.url"`**: **property binding** sets the address from the data. Without brackets, `href="bookmark.url"` would literally link to the text "bookmark.url".
  - **`target="_blank"`**: open in a **new tab**.
  - **`rel="noopener"`**: safety; the new tab can't control your app's tab.
  - Inside: the title and the URL.
- **Edit** → `startEdit(bookmark)`. **Delete** → `deleteBookmark(bookmark)`. Each passes **this row's** bookmark.

**Edit look:**
- Two boxes bound to `editTitle` and `editUrl` (filled by `startEdit`).
- **Save** → `saveEdit(bookmark)` → PUT. **Cancel** → `cancelEdit()`.
- **`editErrors`** messages appear **inside this row**.

### Every connection
| In the HTML | Connects to | Direction |
|---|---|---|
| `{{ folder().name }}` | `folder` input | code → screen |
| `{{ bookmarks().length }}` | `bookmarks` | code → screen |
| `[(ngModel)]="newTitle"` / `"newUrl"` | add-form signals | ⇄ |
| `(click)="addBookmark()"` | `addBookmark()` | screen → code |
| `@if (errors().title)` / `.url` | `errors` | code → screen |
| `@for (bookmark of bookmarks() ...)` | `bookmarks` | code → screen |
| `@if (editingId() === bookmark.id)` | `editingId` | code → screen |
| `{{ bookmark.title[0] }}`, `{{ bookmark.title }}`, `{{ bookmark.url }}` | the loop's `bookmark` | code → screen |
| `[href]="bookmark.url"` | the loop's `bookmark` | code → screen |
| `(click)="startEdit(bookmark)"` | `startEdit()` | screen → code |
| `(click)="deleteBookmark(bookmark)"` | `deleteBookmark()` | screen → code |
| `[(ngModel)]="editTitle"` / `"editUrl"` | edit signals | ⇄ |
| `(click)="saveEdit(bookmark)"` | `saveEdit()` | screen → code |
| `(click)="cancelEdit()"` | `cancelEdit()` | screen → code |
| `@if (editErrors().title)` / `.url` | `editErrors` | code → screen |

### One complete loop: fix a bad URL while editing
```
SCREEN                                    CODE (.ts)
──────                                    ──────────
click [Edit] on GitHub     ──(click)──►   startEdit(GitHub): editingId=3, editTitle/editUrl filled
row becomes 2 boxes        ◄──@if────     editingId() === 3

change URL to "hello"      ──ngModel──►   editUrl = "hello"
click [Save]               ──(click)──►   saveEdit(GitHub) → update(3,"GitHub","hello",5)
                                            ── PUT /api/bookmarks/3/ ──► Django ── 400 {"url":[...]}
                                            error: editErrors.set({url: [...]})
"URL: Enter a valid URL."  ◄──@if────     editErrors().url exists
(boxes stay open)

fix to "https://github.com" ─ngModel─►    editUrl updated
click [Save]               ──(click)──►   saveEdit → PUT ── 200
                                            next: editingId=null, loadBookmarks(5)
row back to normal         ◄──@if/@for─   editingId null, bookmarks = fresh list
```

---

## 5.12 `src/styles.css`: the look

All CSS lives in **one global file**. Components could each have their own CSS, but one file is simpler. **No Angular logic depends on it.** It only changes the look. Theme: a dark "aurora" background, frosted-glass cards, gradient accents.

| Section | What it does | Key CSS |
|---|---|---|
| `:root { --bg: ...; --accent-1: ...; }` | **CSS variables**: all colours defined once and reused as `var(--accent-1)` | custom properties |
| `* { box-sizing: border-box; }` | widths include padding, so sizing is predictable | |
| `body` | dark background, Inter font, page padding | |
| `.blob`, `.blob-1/2/3`, `@keyframes float` | 3 big blurred circles (`filter: blur(110px)`) slowly drifting behind everything (`z-index: -1`) | `position: fixed`, animation |
| `.hero`, `.logo`, `h1` | header layout. Gradient logo square. Gradient text via `background-clip: text` | flexbox, gradient |
| `.layout` | **two columns side by side** | `display: flex; gap: 24px;` |
| `.card` | frosted glass: see-through white, border, rounded corners, `backdrop-filter: blur(20px)`, deep shadow | |
| `.sidebar { width: 360px }`, `.content { flex: 1 }` | fixed-width left column; right takes the rest | |
| `@media (max-width: 800px)` | on phones, stack the two cards | media query |
| `.section-title`, `.content-header`, `.folder-title`, `.count` | small uppercase "FOLDERS" title, big folder heading, gradient count pill | |
| `.form-row`, `input`, `input:focus` | inputs side by side; dark see-through boxes; purple glow when focused | |
| `button`, `.btn-primary`, `.btn-ghost`, `.btn-danger` | gradient main buttons, see-through secondary, red delete; press effect `transform: scale(0.96)` | `:hover`, `:active` |
| `ul`, `li` | no bullets; each row is a flex line; rows slide in (`fadeUp`) | |
| `li .btn-ghost/.btn-danger { opacity: .35 }` + `li:hover ... { opacity: 1 }` | row buttons stay faint until you hover the row | |
| `.folder-name`, `.folder-icon` | clickable name (`cursor: pointer`); icon tilts on hover | |
| **`.folder.selected`** | **the glowing highlight**, activated by Angular's `[class.selected]` | |
| `.bookmark`, `.bookmark:hover` | bookmark cards that **lift** on hover (`translateY(-2px)`) | |
| `.avatar` | the coloured letter badge | |
| `.bookmark-link`, `.bookmark-title`, `.bookmark-url` | title + URL stacked; long URLs end with "…" (`text-overflow: ellipsis`) | |
| `.error` + `@keyframes shake` | red error box that shakes briefly | |
| `.empty-row`, `.empty-state`, `.empty-icon` + `@keyframes bob` | "nothing here" messages; the 📂 gently bobs | |
| `@keyframes fadeUp` | elements fade in while sliding up | |
| `@media (prefers-reduced-motion: reduce)` | turns animations off for people who disable motion in system settings | accessibility |

**How the CSS links to Angular:**
| Angular (HTML) | CSS |
|---|---|
| `class="layout"`, `"card sidebar"`, `"card content"` | `.layout`, `.card`, `.sidebar`, `.content` |
| `[class.selected]="..."` (added only when true) | `.folder.selected` |
| `<p class="error">` | `.error` |
| `class="btn-primary"` etc. | `.btn-primary` etc. |

> **Interview:** "It's plain CSS in one global stylesheet, no UI library. I used CSS variables for the colour theme, flexbox for the layout, backdrop-filter for the glass effect, and keyframe animations. Angular's class binding, [class.selected], drives the selected-folder highlight."

---

# Part 6: How the frontend is connected to the backend

**Two separate programs that only talk through HTTP + JSON.** There's no shared code and no direct link.

```
Angular (browser, localhost:4200)                Django (localhost:8000)
─────────────────────────────────                ───────────────────────
FolderList / BookmarkList
      │ calls
      ▼
FolderService / BookmarkService
      │ uses
      ▼
HttpClient ── GET/POST/PUT/DELETE + JSON ──►  /api/folders/  /api/bookmarks/
           ◄── JSON + status code ──────────  ViewSets → Serializers → Models → SQLite
```

## The 5 connection points

**1. The URL, written in the services**: the only place Angular "knows" where Django is.
```ts
private apiUrl = 'http://localhost:8000/api/folders/';     // folder.service.ts
private apiUrl = 'http://localhost:8000/api/bookmarks/';   // bookmark.service.ts
```
It matches `config/urls.py` (`api/`) + the router (`folders`, `bookmarks`).

**2. HttpClient**: switched on in `app.config.ts`, used in the services.
| Angular | Django |
|---|---|
| `http.get(url)` | `list` / `retrieve` |
| `http.post(url, body)` | `create` |
| `http.put(url + id, body)` | `update` |
| `http.delete(url + id)` | `destroy` |

**3. JSON field names**: both sides must agree.
| Django `serializers.py` | Angular `models.ts` |
|---|---|
| `['id', 'name', 'created_at']` | `id`, `name`, `created_at` |
| `['id', 'title', 'url', 'folder', 'created_at']` | `id`, `title`, `url`, `folder`, `created_at` |

The filter name matches too: Angular sends `?folder=5`, and Django reads `query_params.get('folder')`.

**4. Status codes**: how Django says "it worked."
| Django returns | Angular runs |
|---|---|
| `200` / `201` / `204` | `next:` in `.subscribe(...)` → reload the list |
| `400` + `{"url": ["Enter a valid URL."]}` | `error:` → `err.error` → red message |

**5. CORS**: the browser's permission.
```python
INSTALLED_APPS = [..., 'corsheaders', ...]
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ['http://localhost:4200']
```

## One request, both sides
```
Angular:  folderService.create("Job").subscribe(...)
            → POST http://localhost:8000/api/folders/   body {"name":"Job"}
Django:   urls → FolderViewSet.create → FolderSerializer checks → INSERT → 201 {"id":9,"name":"Job",...}
            (+ CORS header)
Angular:  next: → loadFolders() → GET /api/folders/ → folders.set(data) → screen updates
```

## What breaks if a connection point is wrong
| Problem | What you'd see |
|---|---|
| Django not running | Console: `ERR_CONNECTION_REFUSED`; empty list |
| Wrong URL in a service | `404 Not Found` |
| CORS settings removed | Console: `blocked by CORS policy` |
| Field name mismatch (e.g. `nmae`) | `400 "name": ["This field is required."]` |
| `provideHttpClient()` removed | `No provider for HttpClient!`; the app doesn't start |

> **Interview:** "The frontend and backend are separate apps on different ports, connected only through a REST API. Angular's services use HttpClient to send GET, POST, PUT and DELETE requests with JSON to DRF endpoints like /api/folders/. DRF validates, saves, and returns JSON with a status code, which Angular handles in subscribe: success reloads the list, and a 400 shows the error. Because they're different origins, I enabled CORS on Django for localhost:4200."

---

# Part 7: End-to-end walkthroughs: what happens when you click

## The map of all the pieces
```
                         BROWSER (localhost:4200)                                         SERVER (localhost:8000)
┌───────────────────────────────────────────────────────────────────┐            ┌─────────────────────────────────────┐
│ index.html ─ <app-root>                                           │            │ CorsMiddleware (settings.py)        │
│ main.ts ─ bootstrapApplication(App, appConfig)                    │            │ config/urls.py   "api/" →           │
│ app.config.ts ─ provideHttpClient()                               │            │ bookmarks/urls.py router →          │
│                                                                   │   HTTP     │ views.py   ViewSets                 │
│ App (app.ts/html) ─ selectedFolder signal                         │  + JSON    │ serializers.py  check + JSON        │
│   ├─ FolderList (.ts/.html) ─► FolderService ─► HttpClient ───────┼───────────►│ models.py  ORM → SQL                │
│   └─ BookmarkList (.ts/.html) ─► BookmarkService ─► HttpClient ───┼───────────►│ db.sqlite3                          │
│ models.ts ─ Folder / Bookmark interfaces (shape of the JSON)      │◄───────────┤                                     │
└───────────────────────────────────────────────────────────────────┘            └─────────────────────────────────────┘
```

## 7.1 You open http://localhost:4200 → the folders appear

| # | 📄 File | What happens |
|---|---|---|
| 1 | `index.html` | Browser loads the almost-empty page with `<app-root>` and the compiled JavaScript. |
| 2 | `main.ts` | `bootstrapApplication(App, appConfig)` starts Angular. |
| 3 | `app.config.ts` | `provideHttpClient()` makes HttpClient available. |
| 4 | `app.ts` | App created. `selectedFolder = signal(null)`. |
| 5 | `app.html` | Draws the header + `<app-folder-list>`. `@if (selectedFolder())` false → "Pick a folder". |
| 6 | `folder-list.component.ts` | FolderList created: `inject(FolderService)`, `folders = []`. |
| 7 | `folder-list.component.ts` | Angular calls `ngOnInit()` → `loadFolders()`. |
| 8 | `folder.service.ts` | `getAll()` prepares `GET http://localhost:8000/api/folders/`. |
| 9 | `folder-list.component.ts` | `.subscribe(...)` sends it. JavaScript carries on. |
| | | ─────────── **network** ─────────── |
| 10 | `settings.py` (CorsMiddleware) | Request from `localhost:4200`: allowed. |
| 11 | `config/urls.py` | `api/` matched → `folders/` → `bookmarks/urls.py`. |
| 12 | `bookmarks/urls.py` | `folders/` + GET → `FolderViewSet.list`. |
| 13 | `views.py` | `queryset = Folder.objects.all()`. |
| 14 | `models.py` → `db.sqlite3` | `SELECT * FROM bookmarks_folder`. |
| 15 | `serializers.py` | `FolderSerializer` → JSON. |
| 16 | `views.py` → CorsMiddleware | `200 [{"id":5,"name":"Job",...}, ...]` + `Access-Control-Allow-Origin`. |
| | | ─────────── **network** ─────────── |
| 17 | browser | CORS check ✅ → JSON to HttpClient. |
| 18 | `models.ts` | Data typed as `Folder[]`. |
| 19 | `folder-list.component.ts` | `this.folders.set(data)`. |
| 20 | `folder-list.component.html` | `@for` draws one row per folder → **Job, College, School appear**. |

## 7.2 You add a folder

**Success: type "Job", click + Add**
```
1. folder-list.html     you type → [(ngModel)] → newName = "Job"
2. folder-list.html     (click)="addFolder()"
3. folder-list.ts       folderService.create(this.newName())
4. folder.service.ts    prepares POST /api/folders/  body {"name":"Job"}
5. folder-list.ts       .subscribe({next, error}) sends it
6. browser + Django     CORS preflight OPTIONS → allowed ✅, then the POST
7. config/urls → bookmarks/urls   folders/ + POST → FolderViewSet.create
8. serializers.py       FolderSerializer.is_valid() ✅
9. models.py → db       INSERT INTO bookmarks_folder (name, created_at) VALUES ('Job', now)
10. views.py            201 {"id":9,"name":"Job",...}
11. folder-list.ts      next: newName.set(''), error.set(''), loadFolders()
12. folder-list.html    box empties; GET /api/folders/ → folders.set(...) → "Job" appears
```

**Failure: "Job" already exists**
```
8. serializers.py       unique=True → ❌
9. views.py             400 {"name":["folder with this name already exists."]}   (nothing saved)
10. folder-list.ts      error: this.error.set(err.error.name)
11. folder-list.html    @if (error()) → red box: "folder with this name already exists."
```
An empty box gives the same path with "This field may not be blank."

## 7.3 You rename a folder
```
1. click [Rename] on Job   → startRename(Job): editingId = 5, editName = "Job"   (no network)
2. @if (editingId() === folder.id) → Job's row becomes a text box
3. type "Careers"           → [(ngModel)] → editName = "Careers"
4. click [Save]             → saveRename(Job) → folderService.update(5, "Careers")
5. CORS preflight ✅ → PUT http://localhost:8000/api/folders/5/  {"name":"Careers"}
6. Django: router "folders/5/ + PUT" → FolderViewSet.update → serializer checks
     ✅ → UPDATE bookmarks_folder SET name='Careers' WHERE id=5 → 200 {"id":5,"name":"Careers",...}
     ❌ → 400 {"name":[...]}
7a. 200 → next: editingId = null, loadFolders() → row shows "Careers"
          if Job was the selected folder → emit(updated) → App updates → right-hand heading shows "Careers"
7b. 400 → error message shown, box stays open
```
**Cancel** → `cancelRename()` → `editingId = null` → nothing saved.

## 7.4 You delete a folder
```
1. click [Delete] on College → deleteFolder(College)
2. confirm("Delete "College" and all its bookmarks?") → Cancel → return (nothing happens)
                                                       → OK ↓
3. folderService.delete(6)
4. CORS preflight ✅ → DELETE http://localhost:8000/api/folders/6/
5. Django: router "folders/6/ + DELETE" → FolderViewSet.destroy
     → DELETE FROM bookmarks_bookmark WHERE folder_id = 6   ← CASCADE
     → DELETE FROM bookmarks_folder   WHERE id = 6
     → 204 No Content
6. subscribe → loadFolders() → College is gone
7. if College was selected → emit(null) → App: selectedFolder = null → "Pick a folder"
```

## 7.5 You click a folder → its bookmarks appear

| # | 📄 File | What happens |
|---|---|---|
| 1 | `folder-list.component.html` | `<span (click)="selectFolder(folder)">` → `selectFolder(Job)` |
| 2 | `folder-list.component.ts` | `this.folderSelected.emit(Job)` → output up to App |
| 3 | `app.html` | `(folderSelected)="selectedFolder.set($event)"`, `$event` = Job |
| 4 | `app.ts` | `selectedFolder` = Job |
| 5 | `app.html` | a) `[selectedId]` sends 5 down. b) `@if (...; as folder)` true → `<app-bookmark-list [folder]="folder">` |
| 6 | `folder-list.component.html` | `[class.selected]` true on Job → glows |
| 7 | `bookmark-list.component.ts` | created with input `folder = Job` |
| 8 | `bookmark-list.component.ts` | `effect` runs → `loadBookmarks(5)` |
| 9 | `bookmark.service.ts` | `getByFolder(5)` → `GET /api/bookmarks/?folder=5` |
| 10 | `bookmark-list.component.ts` | `.subscribe(...)` sends it |
| | | ─────────── **network** ─────────── |
| 11 | `config/urls.py` → `bookmarks/urls.py` | `bookmarks/` + GET → `BookmarkViewSet.list` |
| 12 | `views.py` | `get_queryset()`: `query_params.get('folder')` → `"5"` → `.filter(folder="5")` |
| 13 | `models.py` → `db.sqlite3` | `SELECT * FROM bookmarks_bookmark WHERE folder_id = 5` |
| 14 | `serializers.py` | `BookmarkSerializer` → JSON → 200 (+ CORS) |
| | | ─────────── **network** ─────────── |
| 15 | `bookmark-list.component.ts` | `this.bookmarks.set(data)` |
| 16 | `bookmark-list.component.html` | heading "Job", count pill, `@for` draws the cards |

**Then you click "College":** App's signal changes → the `[folder]` input changes → **the effect runs again** → `GET ?folder=6` → the list switches. (The component isn't recreated; only its input changes.)

## 7.6 You add a bookmark

**With a mistake in the URL**
| # | 📄 File | What happens |
|---|---|---|
| 1 | `bookmark-list.component.html` | type "GitHub" / "github" → `newTitle`, `newUrl` |
| 2 | `bookmark-list.component.html` | `(click)="addBookmark()"` |
| 3 | `bookmark-list.component.ts` | `create(this.newTitle(), this.newUrl(), this.folder().id)` → `create("GitHub", "github", 5)` |
| 4 | `bookmark.service.ts` | `POST /api/bookmarks/` with `{"title":"GitHub","url":"github","folder":5}` |
| 5 | `bookmark-list.component.ts` | `.subscribe({ next, error })` sends it |
| | | ─────────── **network** ─────────── |
| 6 | browser + CorsMiddleware | preflight OPTIONS ✅, then the POST |
| 7 | `config/urls.py` → `bookmarks/urls.py` | `bookmarks/` + POST → `BookmarkViewSet.create` |
| 8 | `views.py` → `serializers.py` | `is_valid()`: title ✅, folder ✅, **url ❌** (`URLField`) |
| 9 | `views.py` | **`400 {"url": ["Enter a valid URL."]}`**. Database never touched. |
| | | ─────────── **network** ─────────── |
| 10 | `bookmark-list.component.ts` | `error:` → `this.errors.set(err.error)` |
| 11 | `bookmark-list.component.html` | `@if (errors().url)` → red box "URL: Enter a valid URL." (shakes) |

**Fixed to `https://github.com`**
| # | 📄 File | What happens |
|---|---|---|
| 8 | `serializers.py` | all ✅ |
| 9 | `views.py` → `models.py` → `db.sqlite3` | `INSERT INTO bookmarks_bookmark (title, url, folder_id, created_at) VALUES ('GitHub', 'https://github.com', 5, now)` → id 12 |
| 10 | `views.py` | `201 {"id":12,"title":"GitHub",...,"folder":5}` |
| | | ─────────── **network** ─────────── |
| 11 | `bookmark-list.component.ts` | `next:` → clear both boxes and errors → `loadBookmarks(5)` |
| 12 | `bookmark-list.component.html` | boxes empty, error gone |
| 13 | (7.5 steps 9–16) | `GET ?folder=5` → GitHub appears, count +1 |

Both boxes empty → **two** messages: "Title: This field may not be blank." and "URL: This field may not be blank."

## 7.7 You edit a bookmark
```
1. click [Edit] on LinkedIn → startEdit: editingId = 3, editTitle/editUrl filled   (no network)
2. @if (editingId() === bookmark.id) → that row becomes two boxes
3. change the URL → [(ngModel)] → editUrl updated
4. click [Save] → saveEdit → bookmarkService.update(3, "LinkedIn", "https://linkedin.com/jobs", 5)
5. PUT http://localhost:8000/api/bookmarks/3/  {"title":"LinkedIn","url":"https://linkedin.com/jobs","folder":5}
6. Django: router "bookmarks/3/ + PUT" → BookmarkViewSet.update → BookmarkSerializer checks
     ✅ → UPDATE bookmarks_bookmark SET title=..., url=..., folder_id=5 WHERE id=3 → 200
     ❌ → 400 {"url": ["Enter a valid URL."]}
7a. 200 → editingId = null → loadBookmarks(5) → row shows new values
7b. 400 → editErrors set → message inside the row, boxes stay open
```
**Cancel** → `cancelEdit()` → `editingId = null`, nothing saved. Switching folders also closes any open edit (the `effect`).

## 7.8 You delete a bookmark
```
1. click [Delete] on Indeed → deleteBookmark(Indeed) → bookmarkService.delete(4)
2. DELETE http://localhost:8000/api/bookmarks/4/
3. Django: router "bookmarks/4/ + DELETE" → BookmarkViewSet.destroy
     → DELETE FROM bookmarks_bookmark WHERE id = 4 → 204 No Content
4. subscribe → loadBookmarks(5) → GET ?folder=5 → Indeed is gone, count −1
```

## 7.9 You click a bookmark link
```
<a [href]="bookmark.url" target="_blank" rel="noopener">
→ the browser opens the URL in a NEW TAB. No Angular code, no Django request.
```

## The 6 ideas that explain the entire frontend
1. **Components** = one piece of screen = `.ts` (memory + functions) + `.html` (what you see).
2. **Signals** = memory. **Change a signal → Angular redraws.** You never edit the screen directly.
3. **Bindings** connect HTML and code: `{{ }}` show · `( )` events · `[ ]` set · `[( )]` both · `@if` · `@for`.
4. **Services** prepare HTTP requests. **`.subscribe({ next, error })`** sends them and handles the reply **later**.
5. **Dependency injection** (`provide…` / `inject(...)`): Angular creates HttpClient and the services, and hands them out.
6. **Parent ↔ child**: App holds shared state (`selectedFolder`). Outputs go **up** (`emit`), inputs go **down** (`[folder]`).

**The whole app in one sentence:**
> A click runs a component function, which calls a service, which sends an HTTP request. Django checks and saves it and returns JSON. The component puts that JSON into a signal, and Angular redraws the screen.

---

# Part 8: Cheat sheets

## Angular template syntax
| Syntax | Name | Meaning |
|---|---|---|
| `{{ x }}` | interpolation | show `x` as text |
| `(click)="f()"` | event binding | when clicked, run `f()` |
| `(output)="f($event)"` | output listening | `$event` = what the child emitted |
| `[prop]="x"` | property binding | set a property / child input from code |
| `[class.name]="cond"` | class binding | add the class if `cond` is true |
| `[(ngModel)]="sig"` | two-way binding | text box ⇄ signal (needs `FormsModule`) |
| `@if (c) { } @else { }` | control flow | show one part or the other |
| `@if (x; as y) { }` | control flow | if `x` is truthy, call it `y` inside |
| `@for (x of list; track x.id) { } @empty { }` | control flow | repeat per item / empty message |

## Signals, inputs, outputs
| Thing | Create | Read | Change |
|---|---|---|---|
| signal | `x = signal(start)` | `this.x()` | `this.x.set(v)` |
| input | `x = input<T>()` / `input.required<T>()` | `this.x()` | (parent sets it with `[x]="..."`) |
| output | `x = output<T>()` | — | `this.x.emit(v)` (parent listens with `(x)="..."`) |

## HttpClient
| Call | HTTP | Typical status |
|---|---|---|
| `http.get<T>(url)` | GET | 200 |
| `http.post<T>(url, body)` | POST | 201 / 400 |
| `http.put<T>(url, body)` | PUT | 200 / 400 |
| `http.delete(url)` | DELETE | 204 |

## Django commands
| Command | What it does |
|---|---|
| `python -m venv venv` | create a virtual environment |
| `source venv/bin/activate` | switch it on |
| `pip install ...` / `pip freeze > requirements.txt` | install / save the package list |
| `django-admin startproject config .` | create the project here |
| `python manage.py startapp bookmarks` | create an app |
| `python manage.py runserver` | start the dev server (8000) |
| `python manage.py makemigrations` | write migration files from model changes |
| `python manage.py sqlmigrate bookmarks 0001` | show the SQL a migration will run |
| `python manage.py migrate` | apply migrations to the database |
| `python manage.py check` | check settings for problems |
| `python manage.py shell` | interactive Python with Django loaded |

## Angular commands
| Command | What it does |
|---|---|
| `npx @angular/cli@22 new frontend ...` | create the project |
| `npx ng serve` / `npm start` | start the dev server (4200) |
| `npx ng version` | show versions |

## Every file in one line
| File | Job |
|---|---|
| `backend/config/settings.py` | switches on DRF, CORS, our app; SQLite; allowed origin 4200 |
| `backend/config/urls.py` | `/api/` → `bookmarks/urls.py` |
| `backend/bookmarks/models.py` | Folder + Bookmark tables (ForeignKey, CASCADE) |
| `backend/bookmarks/serializers.py` | JSON ⇄ objects + validation (→ 400) |
| `backend/bookmarks/views.py` | ModelViewSets (CRUD) + `?folder=` filter |
| `backend/bookmarks/urls.py` | router: `folders/`, `bookmarks/` → ViewSets |
| `frontend/src/index.html` | the empty page with `<app-root>` |
| `frontend/src/main.ts` | starts Angular with App + appConfig |
| `frontend/src/app/app.config.ts` | `provideHttpClient()` |
| `frontend/src/app/models.ts` | `Folder`, `Bookmark` interfaces |
| `frontend/src/app/folder.service.ts` | HTTP calls for `/api/folders/` |
| `frontend/src/app/bookmark.service.ts` | HTTP calls for `/api/bookmarks/` |
| `frontend/src/app/app.ts` / `app.html` | parent: holds `selectedFolder`, connects both sides |
| `frontend/src/app/folder-list/*` | sidebar: list, add, rename, delete, select |
| `frontend/src/app/bookmark-list/*` | right side: list, add, inline edit, delete |
| `frontend/src/styles.css` | all the styling |

## Modern Angular vs older Angular
| What we used (modern, Angular 22) | Older equivalent you may hear about |
|---|---|
| Standalone components (`imports: [...]` in `@Component`) | NgModules (`app.module.ts`, `declarations: [...]`) |
| Signals (`signal()`, `.set()`, `folders()`) | plain class properties + Zone.js change detection |
| `input()` / `output()` | `@Input()` / `@Output()` + `EventEmitter` |
| `@if` / `@for` / `@empty` | `*ngIf` / `*ngFor` |
| `inject(FolderService)` | constructor injection: `constructor(private folderService: FolderService) {}` |
| `provideHttpClient()` in `app.config.ts` | `HttpClientModule` in `app.module.ts` |
| file names like `app.ts` | `app.component.ts` |

> **Interview:** "I used current Angular: standalone components, signals for state, the new input()/output() functions and the built-in @if/@for control flow. It's what the Angular team recommends now and needs less boilerplate. I also know the older equivalents: NgModules, @Input/@Output with EventEmitter, *ngIf/*ngFor, and constructor injection."

---

# Part 9: Interview answers

### The 60-second explanation
> "It's a bookmark manager with an Angular frontend and a Django REST Framework backend, talking over a JSON REST API.
>
> On the backend, I have two models, Folder and Bookmark, with a ForeignKey and cascade delete. ModelSerializers handle JSON conversion and validation, so a bad URL or a duplicate folder name returns a 400. ModelViewSets with a DefaultRouter give full CRUD. I override get_queryset to filter bookmarks by ?folder=, and django-cors-headers allows the Angular origin.
>
> On the frontend, two services wrap HttpClient, one per resource. FolderList and BookmarkList are standalone components holding their state in signals. App is the parent: FolderList emits the selected folder through an output, App stores it, and passes it to BookmarkList as an input. An effect reloads the bookmarks whenever that input changes. Every action follows the same pattern: call the service, subscribe, and on success reload the list, or on a 400 show Django's error messages."

### Answers collected from the lessons
| Topic | Answer |
|---|---|
| Django vs DRF vs cors-headers | Django is the web framework; DRF turns it into a JSON API; django-cors-headers lets the Angular app on another port call it. |
| ORM | Tables are Python classes, queries are Python methods; Django writes the SQL. There's still a real database (SQLite). |
| Why SQLite | Default, zero setup, one file. Fine for a demo; PostgreSQL for production, mostly a settings change thanks to the ORM. |
| Models | Define the data structure; each model is a table. |
| makemigrations vs migrate | makemigrations writes migration files from model changes; migrate applies them to the database. |
| ForeignKey / CASCADE | Each bookmark belongs to one folder (one-to-many); deleting a folder deletes its bookmarks. |
| Serializer | Converts models ⇄ JSON and validates input; ModelSerializer derives fields and rules from the model, so bad data returns 400. |
| View / ViewSet | A view takes a request and returns a response, using the model and serializer. ModelViewSet gives list/create/retrieve/update/destroy. |
| Filtering | Overrode get_queryset to read `?folder=` from query_params and filter. |
| Router / URLs | config/urls.py includes the app's urls under /api/; DefaultRouter maps URL + method to ViewSet functions. |
| CORS | Browsers block cross-origin reads; 4200 and 8000 are different origins; django-cors-headers adds Access-Control-Allow-Origin for 4200 only. Enforced by the browser. |
| Component | One piece of the UI: a TypeScript class (state + functions) plus an HTML template. |
| Signals | Reactive state; change a signal and Angular re-renders what uses it. |
| Interface (models.ts) | Describes the shape of the JSON; mirrors the serializers; catches mistakes at compile time; gone at runtime. |
| Service | A class that talks to the backend so components don't; provided once with providedIn: 'root'. |
| Dependency injection | Classes get what they need from Angular (provideHttpClient / inject) instead of creating it. |
| Observable / subscribe | HttpClient methods return a prepared request; subscribe sends it and handles next (success) and error (e.g. 400) asynchronously. |
| Parent/child | Shared state lives in the parent; output() sends events up (emit), input() sends data down. |
| ngOnInit vs effect | ngOnInit runs once (load folders); effect re-runs when a signal it reads changes (reload bookmarks when the folder input changes). |
| Two-way binding | `[(ngModel)]` keeps a text box and a signal in sync. |
| Frontend ↔ backend | Separate apps; HTTP + JSON via HttpClient to DRF endpoints; status codes drive next/error; CORS allows the origin. |

*(The 15 likely interview questions with full answers will be in README.md, Step 6.)*

---

# Part 10: Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Error: That port is already in use` when starting Django | another program is on 8000 (we once had TUMORSEG's uvicorn there) | stop the other server, or `python manage.py runserver 8001` (and change `apiUrl` in both services to match) |
| VS Code: `Import "rest_framework" could not be resolved` (yellow) | VS Code is looking at the system Python, not the venv. The code is fine. | **Cmd+Shift+P** → "Python: Select Interpreter" → choose the one with `backend/venv` |
| `python3 --version` shows 3.9 | macOS's built-in Python | use the venv (`source venv/bin/activate`) or `/opt/homebrew/bin/python3.13` |
| Browser console: `blocked by CORS policy` | Django not sending the header | check `corsheaders` in INSTALLED_APPS, `CorsMiddleware` at the top of MIDDLEWARE, `CORS_ALLOWED_ORIGINS` includes `http://localhost:4200` |
| Browser console: `ERR_CONNECTION_REFUSED` | Django isn't running | start it with `python manage.py runserver` |
| `No provider for HttpClient!` | `provideHttpClient()` missing | add it to `app.config.ts` |
| `'app-bookmark-list' is not a known element` | component not in the parent's `imports` | add it to `imports: [...]` in `app.ts` |
| `Can't bind to 'ngModel'` | `FormsModule` not imported | add `FormsModule` to the component's `imports` |
| New folder gets id 5, not 1 | SQLite never reuses ids after deletes | normal, nothing to fix |
| "You have unapplied migrations" | tables not created | `python manage.py migrate` |
| Changed `models.py` but nothing happened | no migration | `makemigrations`, then `migrate` |
| `?folder=abc` gives 500 | non-number filter (known limit) | not reachable from the app; could check `folder_id.isdigit()` |
| See what Angular sent/received | — | DevTools (**Cmd+Option+I**) → **Network** tab → click a request → Headers / Response; **Console** tab for errors |

---

# Appendix: Full source code of every file

Every important file, exactly as it is in the project.

## backend/config/settings.py (only the parts we changed or use)
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',   # Django REST Framework: lets us build a JSON API
    'corsheaders',      # lets the Angular app (port 4200) call this API
    'bookmarks',        # our own app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # adds the CORS "permission slip" to every response (keep it near the top)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS: which websites are allowed to call this API from the browser.
# Only our Angular app, which runs on port 4200.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',
]
```

## backend/config/urls.py
```python
from django.contrib import admin
from django.urls import include, path

# The main list of URLs for the whole project.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bookmarks.urls')),  # every address starting with /api/ is handled by bookmarks/urls.py
]
```

## backend/bookmarks/models.py
```python
from django.db import models


# A Folder groups bookmarks together, e.g. "College" or "Jobs".
# This class becomes a database table. Django adds an "id" column automatically.
class Folder(models.Model):
    name = models.CharField(max_length=100, unique=True)  # text, max 100 characters, no two folders can share a name
    created_at = models.DateTimeField(auto_now_add=True)  # date + time, filled in automatically when the folder is created

    def __str__(self):
        # How a folder is shown as text (for example when you print it)
        return self.name


# A Bookmark is one saved link (title + URL) that lives inside a Folder.
class Bookmark(models.Model):
    title = models.CharField(max_length=200)              # text, max 200 characters
    url = models.URLField()                               # text that must be a valid web address (checked for us)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)  # which folder it belongs to; delete folder = delete its bookmarks
    created_at = models.DateTimeField(auto_now_add=True)  # filled in automatically when the bookmark is created

    def __str__(self):
        return self.title
```

## backend/bookmarks/serializers.py
```python
from rest_framework import serializers

from .models import Bookmark, Folder


# Translates between a Folder object and JSON, and checks incoming data.
# ModelSerializer reads the Folder model and builds the fields + validation for us.
class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder                              # which model to translate
        fields = ['id', 'name', 'created_at']       # which fields appear in the JSON
        read_only_fields = ['id', 'created_at']     # the server sets these; the client can't change them


# Same idea for Bookmark.
# "folder" appears in the JSON as the folder's id number, e.g. "folder": 2
class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'title', 'url', 'folder', 'created_at']
        read_only_fields = ['id', 'created_at']
```

## backend/bookmarks/views.py
```python
from rest_framework import viewsets

from .models import Bookmark, Folder
from .serializers import BookmarkSerializer, FolderSerializer


# One class that handles every folder request:
#   list all, create, get one, update, delete.
class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()       # which data this API works with: all folders
    serializer_class = FolderSerializer   # how to turn that data into JSON (and check incoming JSON)


# Same as above, for bookmarks, plus one extra:
# GET /api/bookmarks/?folder=2 returns only the bookmarks in folder 2.
class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer

    # DRF calls this to decide which bookmarks to work with on each request.
    def get_queryset(self):
        bookmarks = Bookmark.objects.all()                    # start with every bookmark
        folder_id = self.request.query_params.get('folder')   # read "?folder=2" from the URL (None if it's not there)
        if folder_id:
            bookmarks = bookmarks.filter(folder=folder_id)    # keep only the ones in that folder
        return bookmarks
```

## backend/bookmarks/urls.py
```python
from rest_framework.routers import DefaultRouter

from .views import BookmarkViewSet, FolderViewSet

# The router creates the URLs for our ViewSets automatically:
#   folders/          -> list all (GET), create (POST)
#   folders/<id>/     -> get one (GET), update (PUT), delete (DELETE)
#   bookmarks/        -> list all (GET, supports ?folder=<id>), create (POST)
#   bookmarks/<id>/   -> get one (GET), update (PUT), delete (DELETE)
router = DefaultRouter()
router.register('folders', FolderViewSet)
router.register('bookmarks', BookmarkViewSet)

urlpatterns = router.urls  # Django looks for a list called "urlpatterns"
```

## backend/requirements.txt
```
asgiref==3.12.1
Django==6.1.2
django-cors-headers==4.9.0
djangorestframework==3.18.3
sqlparse==0.6.0
```

## frontend/src/index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Bookmark Manager</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <!-- The "Inter" font from Google Fonts (just a font, not a library) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

## frontend/src/main.ts
```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

## frontend/src/app/app.config.ts
```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(), // switches on HttpClient so our services can call the Django API
  ]
};
```

## frontend/src/app/models.ts
```ts
// These interfaces describe the shape of the JSON that Django sends us.
// They match the fields in our Django serializers.

// Matches FolderSerializer: ['id', 'name', 'created_at']
export interface Folder {
  id: number;
  name: string;
  created_at: string; // dates arrive as text in JSON, e.g. "2026-10-10T09:40:52Z"
}

// Matches BookmarkSerializer: ['id', 'title', 'url', 'folder', 'created_at']
export interface Bookmark {
  id: number;
  title: string;
  url: string;
  folder: number; // the id of the folder this bookmark belongs to
  created_at: string;
}
```

## frontend/src/app/folder.service.ts
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder } from './models';

// A service holds code that talks to the backend, so components don't have to.
// providedIn: 'root' means Angular creates ONE FolderService for the whole app.
@Injectable({ providedIn: 'root' })
export class FolderService {
  private http = inject(HttpClient); // ask Angular for the HttpClient (dependency injection)
  private apiUrl = 'http://localhost:8000/api/folders/'; // the Django folder endpoint

  // GET /api/folders/  -> Django FolderViewSet.list
  getAll() {
    return this.http.get<Folder[]>(this.apiUrl);
  }

  // POST /api/folders/  -> Django FolderViewSet.create
  create(name: string) {
    return this.http.post<Folder>(this.apiUrl, { name: name });
  }

  // PUT /api/folders/5/  -> Django FolderViewSet.update
  update(id: number, name: string) {
    return this.http.put<Folder>(`${this.apiUrl}${id}/`, { name: name });
  }

  // DELETE /api/folders/5/  -> Django FolderViewSet.destroy
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
```

## frontend/src/app/bookmark.service.ts
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bookmark } from './models';

// Talks to Django's bookmark API. Same idea as FolderService.
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private http = inject(HttpClient); // ask Angular for the HttpClient
  private apiUrl = 'http://localhost:8000/api/bookmarks/'; // the Django bookmark endpoint

  // GET /api/bookmarks/?folder=5  -> only the bookmarks in folder 5
  getByFolder(folderId: number) {
    return this.http.get<Bookmark[]>(`${this.apiUrl}?folder=${folderId}`);
  }

  // POST /api/bookmarks/  with {"title": ..., "url": ..., "folder": 5}
  create(title: string, url: string, folderId: number) {
    return this.http.post<Bookmark>(this.apiUrl, { title: title, url: url, folder: folderId });
  }

  // PUT /api/bookmarks/3/  with the full bookmark data
  update(id: number, title: string, url: string, folderId: number) {
    return this.http.put<Bookmark>(`${this.apiUrl}${id}/`, { title: title, url: url, folder: folderId });
  }

  // DELETE /api/bookmarks/3/
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
```

## frontend/src/app/app.ts
```ts
import { Component, signal } from '@angular/core';
import { Folder } from './models';
import { FolderListComponent } from './folder-list/folder-list.component';
import { BookmarkListComponent } from './bookmark-list/bookmark-list.component';

// The root component: the whole page. It holds the other components.
@Component({
  selector: 'app-root',                                  // fills <app-root> in index.html
  imports: [FolderListComponent, BookmarkListComponent], // components used in app.html must be listed here
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  selectedFolder = signal<Folder | null>(null); // the folder picked in the sidebar (null = none yet)
}
```

## frontend/src/app/app.html
```html
<!-- Soft coloured blobs that float in the background (pure decoration) -->
<div class="blob blob-1"></div>
<div class="blob blob-2"></div>
<div class="blob blob-3"></div>

<header class="hero">
  <div class="logo">🔖</div>
  <div>
    <h1>Bookmark Manager</h1>
    <p class="tagline">Angular&nbsp;+&nbsp;Django REST Framework</p>
  </div>
</header>

<!-- Two columns: folders on the left, bookmarks on the right -->
<div class="layout">

  <aside class="card sidebar">
    <!-- The folder sidebar.
         [selectedId]     sends data DOWN into the component (which folder is selected)
         (folderSelected) listens for events coming UP from it ($event = the folder that was clicked) -->
    <app-folder-list
      [selectedId]="selectedFolder()?.id"
      (folderSelected)="selectedFolder.set($event)"
    />
  </aside>

  <main class="card content">
    <!-- The bookmark list: only shown once a folder is selected -->
    @if (selectedFolder(); as folder) {
      <app-bookmark-list [folder]="folder" />
    } @else {
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>Pick a folder</h2>
        <p>Choose a folder on the left to see its bookmarks.</p>
      </div>
    }
  </main>

</div>
```

## frontend/src/app/folder-list/folder-list.component.ts
See [section 5.6](#56-folder-listcomponentts-the-sidebars-code). The full file is shown there.

## frontend/src/app/folder-list/folder-list.component.html
See [section 5.7](#57-folder-listcomponenthtml-the-sidebars-html). The full file is shown there.

## frontend/src/app/bookmark-list/bookmark-list.component.ts
See [section 5.10](#510-bookmark-listcomponentts-the-right-sides-code). The full file is shown there.

## frontend/src/app/bookmark-list/bookmark-list.component.html
See [section 5.11](#511-bookmark-listcomponenthtml-the-right-sides-html). The full file is shown there.

## frontend/src/styles.css
Explained section by section in [5.12](#512-srcstylescss-the-look). Open the file itself for the full ~400 lines; every section has a comment.

---

*End of guide. Open any file in the project alongside the matching section here, and try explaining it out loud as if to an interviewer.*
