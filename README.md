# 🔖 Bookmark Manager

A small full-stack app built to learn and demonstrate **Angular + Django REST Framework** end to end.

Create folders (e.g. "College", "Jobs") and save bookmarks (title + URL) inside them, with full create / read / update / delete for both.

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | **Angular 22** (standalone components, signals), TypeScript, plain CSS |
| Backend | **Django 6** + **Django REST Framework** |
| Database | **SQLite** (Django's default) |
| Connection | REST API + JSON, with **django-cors-headers** allowing `localhost:4200` |

```
Angular (localhost:4200)  ── HTTP + JSON ──►  Django REST Framework (localhost:8000)  ──►  SQLite
     components → services → HttpClient          urls → views → serializers → models
```

## Features
- Folders: list, add, rename, delete (deleting a folder also deletes its bookmarks)
- Bookmarks: list the selected folder's bookmarks, add, edit inline (the row turns into inputs), delete
- Links open in a new tab
- Validation by Django: a bad URL or duplicate folder name returns **400**, and the message is shown in the UI

---

## Project structure

```
bookmark-manager/
├── README.md
├── backend/                          ← Django project "config", app "bookmarks"
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py               ← DRF, CORS, installed apps
│   │   └── urls.py                   ← /api/ → bookmarks/urls.py
│   └── bookmarks/
│       ├── models.py                 ← Folder, Bookmark
│       ├── serializers.py            ← JSON ⇄ Python + validation
│       ├── views.py                  ← ModelViewSets (+ ?folder= filter)
│       └── urls.py                   ← DefaultRouter
└── frontend/                         ← Angular app
    └── src/
        ├── index.html, main.ts, styles.css
        └── app/
            ├── app.config.ts         ← provideHttpClient()
            ├── app.ts / app.html     ← parent: holds the selected folder
            ├── models.ts             ← Folder, Bookmark interfaces
            ├── folder.service.ts     ← HTTP calls for /api/folders/
            ├── bookmark.service.ts   ← HTTP calls for /api/bookmarks/
            ├── folder-list/          ← left sidebar component
            └── bookmark-list/        ← right side component
```

---

## How to run it

### Requirements
- **Python 3.12+**, which Django 6 needs (developed with 3.13)
- **Node.js 22.22+, 24.15+ or 26+**, which Angular 22 needs (developed with 26)

Check with `python3 --version` and `node --version`. On a Mac, install missing tools with `brew install python@3.13` / `brew install node`.

> ⚠️ On macOS, `python3` may be the old built-in 3.9. If so, create the venv with the Homebrew Python instead: `/opt/homebrew/bin/python3.13 -m venv venv`.

### 1. Backend: first time only
```bash
cd backend
python3 -m venv venv                  # create a private Python environment (needs Python 3.12+)
source venv/bin/activate              # switch it on (Windows: venv\Scripts\activate)
pip install -r requirements.txt       # install Django, DRF, django-cors-headers
python manage.py migrate              # create the database tables (db.sqlite3)
```

### 2. Frontend: first time only
```bash
cd frontend
npm install                           # download Angular's packages into node_modules
```

### 3. Start both servers (every time)
Use **two terminals**:

**Terminal 1: backend**
```bash
cd backend
source venv/bin/activate
python manage.py runserver            # → http://localhost:8000
```

**Terminal 2: frontend**
```bash
cd frontend
npx ng serve                          # → http://localhost:4200   (or: npm start)
```

### 4. Open it
- The app: **http://localhost:4200**
- The API (DRF's browsable API): **http://localhost:8000/api/**

Stop either server with **Ctrl + C**.

> If port 8000 is busy, run `python manage.py runserver 8001` and change `apiUrl` in `folder.service.ts` and `bookmark.service.ts` to match.

---

## API

| Method | URL | What it does | Success | Errors |
|---|---|---|---|---|
| GET | `/api/folders/` | list all folders | 200 | |
| POST | `/api/folders/` | create a folder `{"name": "Jobs"}` | 201 | 400 (blank / duplicate name) |
| GET | `/api/folders/{id}/` | get one folder | 200 | 404 |
| PUT | `/api/folders/{id}/` | rename `{"name": "Careers"}` | 200 | 400, 404 |
| DELETE | `/api/folders/{id}/` | delete the folder **and its bookmarks** | 204 | 404 |
| GET | `/api/bookmarks/` | list all bookmarks | 200 | |
| GET | `/api/bookmarks/?folder={id}` | list one folder's bookmarks | 200 | |
| POST | `/api/bookmarks/` | create `{"title": "...", "url": "https://...", "folder": 5}` | 201 | 400 (bad URL, blank title, unknown folder) |
| GET | `/api/bookmarks/{id}/` | get one bookmark | 200 | 404 |
| PUT | `/api/bookmarks/{id}/` | update (send title, url **and** folder) | 200 | 400, 404 |
| DELETE | `/api/bookmarks/{id}/` | delete a bookmark | 204 | 404 |

Example error:
```json
POST /api/bookmarks/  {"title": "x", "url": "hello", "folder": 5}
→ 400 {"url": ["Enter a valid URL."]}
```

### Data model
- **Folder**: `id`, `name` (unique), `created_at`
- **Bookmark**: `id`, `title`, `url` (URLField, validated), `folder` (ForeignKey → Folder, `on_delete=CASCADE`), `created_at`
- One folder has many bookmarks (one-to-many).

---

## Data flow: what happens when I click "Save"?

Example: you're editing a bookmark in the "Jobs" folder (id 5), you change its URL, and you click **Save**.

```
 ANGULAR (browser, localhost:4200)                         DJANGO (localhost:8000)
 ─────────────────────────────────                         ───────────────────────
 1. bookmark-list.component.html
    (click)="saveEdit(bookmark)"
          │
 2. bookmark-list.component.ts → saveEdit()
    reads editTitle(), editUrl() (kept in sync with the
    text boxes by [(ngModel)]) and folder().id
          │
 3. bookmark.service.ts → update(3, title, url, 5)
    prepares  PUT http://localhost:8000/api/bookmarks/3/
              body {"title": "...", "url": "...", "folder": 5}
          │
 4. .subscribe({ next, error }) sends it
          │      (browser first sends a CORS "preflight" OPTIONS;
          │       django-cors-headers allows localhost:4200)
          └──────────────── HTTP PUT + JSON ──────────────────►
                                                           5. config/urls.py: "api/" → bookmarks/urls.py
                                                           6. bookmarks/urls.py: DefaultRouter:
                                                              "bookmarks/3/" + PUT → BookmarkViewSet.update
                                                           7. views.py: finds bookmark 3, hands the JSON
                                                              to BookmarkSerializer
                                                           8. serializers.py → is_valid()?
                                                              ✅ valid   → models.py / ORM runs
                                                                 UPDATE bookmarks_bookmark SET ... WHERE id=3
                                                                 → 200 + the updated bookmark as JSON
                                                              ❌ invalid → 400 {"url": ["Enter a valid URL."]}
                                                                 (database not touched)
          ┌──────────────── JSON + status code ◄───────────────
          │      (CorsMiddleware adds Access-Control-Allow-Origin)
 9. back in saveEdit():
    ✅ next  → editingId.set(null)        (row closes)
              loadBookmarks(5)            (GET /api/bookmarks/?folder=5)
              → bookmarks.set(data)
    ❌ error → editErrors.set(err.error)  (Django's message)
          │
10. Signals changed → Angular redraws the template:
    ✅ the row shows the new title/URL
    ❌ "URL: Enter a valid URL." appears inside the row, inputs stay open
```

**In one sentence:** a click runs a component function, which calls a service, which sends an HTTP request. Django routes it, validates it with a serializer, saves it through the ORM, and returns JSON. Angular stores the result in a signal, and the screen updates.

Every other action follows the same pattern. Only the HTTP method changes: **GET** to load, **POST** to add, **PUT** to rename/edit, **DELETE** to delete.

---

## Notes
- This is a **local learning/demo project**: there's no login, and it runs only on the development servers.
- The Django `SECRET_KEY` in `settings.py` is the auto-generated development key. For a real deployment, move it to an environment variable, set `DEBUG = False`, configure `ALLOWED_HOSTS`, and use PostgreSQL.
- `db.sqlite3` is not committed. Run `python manage.py migrate` to create a fresh, empty database.
