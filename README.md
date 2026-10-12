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

## 15 likely interview questions (with simple answers)

**1. Explain your project in one minute.**
It's a bookmark manager with an Angular frontend and a Django REST Framework backend that talk through a JSON REST API. Django has two models, Folder and Bookmark, linked by a ForeignKey. DRF serializers validate and convert data, and ModelViewSets with a router give full CRUD. Angular has two services that call the API with HttpClient, and two components (a folder sidebar and a bookmark list) that keep their state in signals.

**2. What's the difference between Django and Django REST Framework?**
Django is the web framework: server, URLs, ORM, database. On its own it's built to return HTML pages. DRF sits on top and makes it easy to build a **JSON API**: serializers, ViewSets, routers, validation errors as 400s, and the browsable API.

**3. What is a serializer?**
A translator between Python objects and JSON. Going out, it turns a Folder into `{"id": 1, "name": "Jobs"}`. Coming in, it **validates** the JSON before saving. I used `ModelSerializer`, which builds the fields and rules from the model, so `unique=True` and `URLField` automatically produce 400 errors.

**4. What is a ModelViewSet, and what does the router do?**
A `ModelViewSet` is one class that already contains list, create, retrieve, update and delete. I only give it a `queryset` and a `serializer_class`. The `DefaultRouter` generates the URLs: `folders/` (GET, POST) and `folders/<id>/` (GET, PUT, DELETE), and maps each URL + method to the right function.

**5. How does the `?folder=` filter work?**
I overrode `get_queryset()` in `BookmarkViewSet`. It reads `self.request.query_params.get('folder')`, and if it's there, returns `Bookmark.objects.filter(folder=folder_id)`. Angular's `getByFolder(id)` adds `?folder=id` to the URL.

**6. What is a ForeignKey, and what does `on_delete=CASCADE` do?**
A ForeignKey links each bookmark to one folder. In the database it's a `folder_id` column, which makes it a one-to-many relationship. `CASCADE` means that deleting a folder also deletes all its bookmarks, so no bookmark points to a folder that doesn't exist.

**7. What are migrations?**
Migrations turn model changes into database changes. `makemigrations` writes a migration file describing the change, and `migrate` runs the SQL on the database. I run both every time I change `models.py`.

**8. What is CORS, and why did you need it?**
Browsers block JavaScript from reading responses from a different **origin** (protocol + host + port). Angular runs on port 4200 and Django on 8000, so they're different origins. `django-cors-headers` makes Django send `Access-Control-Allow-Origin: http://localhost:4200`, so the browser allows it. CORS is enforced by the browser, not the server.

**9. How are the frontend and backend connected?**
Only through HTTP + JSON. Angular's services use `HttpClient` to send GET/POST/PUT/DELETE requests to URLs like `http://localhost:8000/api/folders/`. Django answers with JSON and a status code. The field names match on both sides: the serializer fields and the TypeScript interfaces in `models.ts`.

**10. What is an Angular component?**
One piece of the screen: a TypeScript class (its data and functions) plus an HTML template. I have `App` (the parent), `FolderListComponent` (sidebar) and `BookmarkListComponent` (bookmark list). The template displays the class's data and calls its functions on clicks.

**11. What is a service, and why use one?**
A service is a class for logic that isn't about the screen. Here, that's calling the API. `FolderService` and `BookmarkService` wrap HttpClient, so components stay simple, the API URL lives in one place, and any component can reuse them. `@Injectable({ providedIn: 'root' })` makes Angular create one shared instance.

**12. What is dependency injection?**
A class doesn't create the things it needs. Angular gives them to it. I register HttpClient once with `provideHttpClient()` in `app.config.ts`, and services get it with `inject(HttpClient)`. Components get services the same way, with `inject(FolderService)`.

**13. What are signals?**
Signals are boxes that hold state, and Angular watches them. You read one with `folders()` and change it with `folders.set(data)`. When a signal changes, Angular automatically re-renders the parts of the template that use it. So I never touch the screen directly: I update a signal, and the UI follows.

**14. How do the two components share the selected folder?**
Through their parent, `App`. FolderList has an **output** (`folderSelected`) and calls `emit(folder)` when you click a folder. App stores it in a `selectedFolder` signal and passes it down to BookmarkList's **input** (`[folder]="folder"`). In BookmarkList, an `effect()` reloads the bookmarks every time that input changes.

**15. What happens when Django returns a 400 error, and what does `subscribe` do?**
Service methods return an **Observable**, a prepared request. `subscribe()` actually sends it and handles the reply **asynchronously**. I pass `{ next, error }`: `next` runs on success (reload the list), and `error` runs on a 400. `err.error` contains Django's JSON (e.g. `{"url": ["Enter a valid URL."]}`), which I put in a signal so the message appears under the right field.

### Bonus: modern vs older Angular
This project uses current Angular style. If an interviewer uses older terms:

| This project | Older equivalent |
|---|---|
| standalone components (`imports: [...]`) | NgModules (`app.module.ts`) |
| `signal()` | plain properties + Zone.js |
| `input()` / `output()` | `@Input()` / `@Output()` + `EventEmitter` |
| `@if` / `@for` | `*ngIf` / `*ngFor` |
| `inject(Service)` | constructor injection |
| `provideHttpClient()` | `HttpClientModule` |

---

## Notes
- This is a **local learning/demo project**: there's no login, and it runs only on the development servers.
- The Django `SECRET_KEY` in `settings.py` is the auto-generated development key. For a real deployment, move it to an environment variable, set `DEBUG = False`, configure `ALLOWED_HOSTS`, and use PostgreSQL.
- `db.sqlite3` is not committed. Run `python manage.py migrate` to create a fresh, empty database.
