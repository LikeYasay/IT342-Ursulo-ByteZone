package edu.cit.ursulo.bytezone.uploads;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryUploadService {

    private final Cloudinary cloudinary;

    public CloudinaryUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file, String folder) {
        validateImage(file);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary did not return an image URL");
            }

            return secureUrl.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read image file");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image to Cloudinary");
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        long maxSize = 5 * 1024 * 1024;

        if (file.getSize() > maxSize) {
            throw new RuntimeException("Image file must not exceed 5MB");
        }
    }
}