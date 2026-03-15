package com.ecommerce.service;

import com.github.slugify.Slugify;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SlugService {

    private final ProductRepository productRepository;

    private final Slugify slugify = Slugify.builder()
        .lowerCase(true)
        .underscoreSeparator(false)
        .build();

    // Generate slug from name + id — guaranteed unique
    public String generateSlug(String name, Long id) {
        String base = slugify.slugify(name);
        return base + "-" + id;
    }

    // Generate slug and verify uniqueness — for cases without id yet
    public String generateUniqueSlug(String name) {
        String base = slugify.slugify(name);
        String slug = base;
        int counter = 1;

        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + counter;
            counter++;
        }

        return slug;
    }

    // Regenerate slug when product name changes
    public String regenerateSlug(String newName, Long id) {
        return generateSlug(newName, id);
    }
}