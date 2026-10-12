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
