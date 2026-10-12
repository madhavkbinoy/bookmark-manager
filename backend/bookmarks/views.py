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
