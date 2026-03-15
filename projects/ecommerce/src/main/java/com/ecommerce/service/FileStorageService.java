package com.ecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File is empty");

        if (file.getSize() > MAX_SIZE)
            throw new IllegalArgumentException("File size exceeds 5MB limit");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType))
            throw new IllegalArgumentException("Only JPEG, PNG, WebP and GIF images are allowed");

        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, subfolder);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalName = file.getOriginalFilename();
            String extension    = getExtension(originalName);
            String filename     = UUID.randomUUID() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored file: {}", filePath);

            // Return relative URL
            return "/api/images/" + subfolder + "/" + filename;

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            // Convert URL back to file path
            String relativePath = imageUrl.replace("/api/images/", "");
            Path filePath = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", imageUrl);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }
}