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
