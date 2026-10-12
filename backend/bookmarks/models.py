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
