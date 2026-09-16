import os

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.db.database import settings


os.environ.setdefault("CLOUDINARY_URL", settings.cloudinary_url)
cloudinary.reset_config()


class ImageProcessor:

    @staticmethod
    def upload(photo: UploadFile) -> str:
        result = cloudinary.uploader.upload(
            photo.file,
            folder="recetas",
        )

        return result["secure_url"]
