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
