from rest_framework import serializers

from .models import Bookmark, Folder


# Translates between a Folder object and JSON, and checks incoming data.
# ModelSerializer reads the Folder model and builds the fields + validation for us.
class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder                              # which model to translate
        fields = ['id', 'name', 'created_at']       # which fields appear in the JSON
        read_only_fields = ['id', 'created_at']     # the server sets these; the client can't change them


# Same idea for Bookmark.
# "folder" appears in the JSON as the folder's id number, e.g. "folder": 2
class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'title', 'url', 'folder', 'created_at']
        read_only_fields = ['id', 'created_at']
