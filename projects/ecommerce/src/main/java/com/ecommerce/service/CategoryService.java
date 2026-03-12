package com.ecommerce.service;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryFlatResponse;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Full tree — all root categories with nested children
    public List<CategoryResponse> getTree() {
        return categoryRepository.findByParentIsNull()
            .stream()
            .map(this::toResponseWithChildren)
            .toList();
    }

    // Flat list of all categories
    public List<CategoryFlatResponse> getAll() {
        return categoryRepository.findAll()
            .stream()
            .map(c -> toFlatResponse(c, computeDepth(c)))
            .toList();
    }

    // Single category with its direct children
    public CategoryResponse getById(Long id) {
        Category category = findOrThrow(id);
        return toResponseWithChildren(category);
    }

    // Direct children of a category
    public List<CategoryResponse> getChildren(Long parentId) {
        findOrThrow(parentId); // validate parent exists
        return categoryRepository.findByParentId(parentId)
            .stream()
            .map(this::toResponseWithChildren)
            .toList();
    }

    // All descendants (recursive) as flat list
    public List<CategoryFlatResponse> getDescendants(Long rootId) {
        findOrThrow(rootId);
        return categoryRepository.findAllDescendants(rootId)
            .stream()
            .map(row -> new CategoryFlatResponse(
                ((Number) row[0]).longValue(),   // id
                (String) row[1],                  // name
                (String) row[2],                  // description
                row[3] != null ? ((Number) row[3]).longValue() : null, // parentId
                null,                             // parentName not in CTE
                ((Number) row[4]).intValue(),     // depth
                false                             // hasChildren — enriched below
            ))
            .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category parent = null;

        if (request.parentId() != null) {
            parent = findOrThrow(request.parentId());

            // Prevent duplicate name within same parent
            if (categoryRepository.existsByNameAndParentId(request.name(), request.parentId()))
                throw new IllegalArgumentException(
                    "Category '" + request.name() + "' already exists under this parent");
        } else {
            // Prevent duplicate root category name
            if (categoryRepository.existsByNameAndParentIsNull(request.name()))
                throw new IllegalArgumentException(
                    "Root category '" + request.name() + "' already exists");
        }

        Category category = Category.builder()
            .name(request.name())
            .description(request.description())
            .parent(parent)
            .build();

        return toResponseWithChildren(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findOrThrow(id);

        // Prevent circular reference — new parent cannot be a descendant
        if (request.parentId() != null) {
            if (request.parentId().equals(id))
                throw new IllegalArgumentException("A category cannot be its own parent");

            if (isDescendant(id, request.parentId()))
                throw new IllegalArgumentException(
                    "Cannot set a descendant as parent — this would create a cycle");

            Category newParent = findOrThrow(request.parentId());
            category.setParent(newParent);
        } else {
            category.setParent(null); // promote to root
        }

        category.setName(request.name());
        category.setDescription(request.description());

        return toResponseWithChildren(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);

        // Reassign children to grandparent before deleting
        Category grandParent = category.getParent();
        for (Category child : category.getChildren()) {
            child.setParent(grandParent);
            categoryRepository.save(child);
        }

        categoryRepository.delete(category);
    }

    // --- Helpers ---

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    // Check if targetId is a descendant of rootId
    private boolean isDescendant(Long rootId, Long targetId) {
        List<Object[]> descendants = categoryRepository.findAllDescendants(rootId);
        return descendants.stream()
            .anyMatch(row -> ((Number) row[0]).longValue() == targetId);
    }

    private int computeDepth(Category category) {
        int depth = 0;
        Category current = category;
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
        }
        return depth;
    }

    // Recursively build response with nested children
    public CategoryResponse toResponseWithChildren(Category c) {
        return new CategoryResponse(
            c.getId(),
            c.getName(),
            c.getDescription(),
            c.getParent() != null ? c.getParent().getId() : null,
            c.getParent() != null ? c.getParent().getName() : null,
            c.getChildren().stream().map(this::toResponseWithChildren).toList()
        );
    }

    private CategoryFlatResponse toFlatResponse(Category c, int depth) {
        return new CategoryFlatResponse(
            c.getId(),
            c.getName(),
            c.getDescription(),
            c.getParent() != null ? c.getParent().getId() : null,
            c.getParent() != null ? c.getParent().getName() : null,
            depth,
            !c.getChildren().isEmpty()
        );
    }
}