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
