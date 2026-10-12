from django.contrib import admin
from django.urls import include, path

# The main list of URLs for the whole project.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bookmarks.urls')),  # every address starting with /api/ is handled by bookmarks/urls.py
]
