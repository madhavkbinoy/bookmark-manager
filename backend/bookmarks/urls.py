from rest_framework.routers import DefaultRouter

from .views import BookmarkViewSet, FolderViewSet

# The router creates the URLs for our ViewSets automatically:
#   folders/          -> list all (GET), create (POST)
#   folders/<id>/     -> get one (GET), update (PUT), delete (DELETE)
#   bookmarks/        -> list all (GET, supports ?folder=<id>), create (POST)
#   bookmarks/<id>/   -> get one (GET), update (PUT), delete (DELETE)
router = DefaultRouter()
router.register('folders', FolderViewSet)
router.register('bookmarks', BookmarkViewSet)

urlpatterns = router.urls  # Django looks for a list called "urlpatterns"
