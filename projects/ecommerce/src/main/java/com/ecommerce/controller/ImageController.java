package com.ecommerce.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images")
@Slf4j
public class ImageController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping("/{subfolder}/{filename}")
    public ResponseEntity<Resource> serveImage(
            @PathVariable String subfolder,
            @PathVariable String filename) {

        try {
            // Sanitize inputs — prevent path traversal attacks
            if (filename.contains("..") || subfolder.contains("..")) {
                return ResponseEntity.badRequest().build();
            }

            Path filePath = Paths.get(uploadDir)
                .resolve(subfolder)
                .resolve(filename)
                .normalize();

            log.debug("Serving image from: {}", filePath.toAbsolutePath());

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Image not found: {}", filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            String contentType = determineContentType(filename);

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL,
                    CacheControl.maxAge(7, TimeUnit.DAYS)
                        .cachePublic()
                        .getHeaderValue())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + filename + "\"")
                .body(resource);

        } catch (MalformedURLException e) {
            log.error("Malformed URL for file: {}/{}", subfolder, filename);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error serving image {}/{}: {}", subfolder, filename, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".svg"))  return "image/svg+xml";
        return "image/jpeg";
    }
}