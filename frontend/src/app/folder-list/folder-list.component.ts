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
