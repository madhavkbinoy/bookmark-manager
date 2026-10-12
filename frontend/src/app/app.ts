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
