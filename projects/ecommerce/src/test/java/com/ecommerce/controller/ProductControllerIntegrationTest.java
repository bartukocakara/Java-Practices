package com.ecommerce.controller;

import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;NON_KEYWORDS=USER;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.show-sql=false",
        "app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
        "app.jwt.expiration-ms=86400000",
        "springdoc.swagger-ui.enabled=false",
        "springdoc.api-docs.enabled=false"
    }
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestInstance(TestInstance.Lifecycle.PER_CLASS) // ← required for @BeforeAll on non-static method
class ProductControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    // Shared state across ordered tests
    private String adminToken;
    private Long categoryId;
    private Long productId;

    @BeforeAll
    void seedAdmin() {
        User admin = User.builder()
            .username("testadmin")
            .email("testadmin@test.com")
            .password(passwordEncoder.encode("Admin1234!"))
            .role(User.Role.ROLE_ADMIN)
            .build();
        userRepository.save(admin);
    }

    @Test
    @Order(1)
    void step1_login_setsAdminToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "testadmin",
                      "password": "Admin1234!"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andReturn();

        AuthResponse auth = objectMapper.readValue(
            result.getResponse().getContentAsString(), AuthResponse.class);
        adminToken = auth.token();
        assertNotNull(adminToken, "Token must not be null after login");
    }

    @Test
    @Order(2)
    void step2_getProducts_noAuth_returnsOk() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @Order(3)
    void step3_createCategory_returnsCreated() throws Exception {
        assertNotNull(adminToken, "adminToken must be set by step1");

        MvcResult result = mockMvc.perform(post("/api/categories")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Electronics",
                      "description": "Gadgets and devices"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value("Electronics"))
            .andReturn();

        categoryId = objectMapper.readTree(
            result.getResponse().getContentAsString()).get("id").asLong();
        assertNotNull(categoryId);
    }

    @Test
    @Order(4)
    void step4_createProduct_returnsCreated() throws Exception {
        assertNotNull(adminToken,  "adminToken must be set by step1");
        assertNotNull(categoryId,  "categoryId must be set by step3");

        MvcResult result = mockMvc.perform(post("/api/products")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "MacBook Pro",
                      "description": "Apple laptop",
                      "price": 1999.99,
                      "stock": 50,
                      "categoryId": %d
                    }
                    """.formatted(categoryId)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("MacBook Pro"))
            .andExpect(jsonPath("$.price").value(1999.99))
            .andExpect(jsonPath("$.stock").value(50))
            .andReturn();

        productId = objectMapper.readTree(
            result.getResponse().getContentAsString()).get("id").asLong();
        assertNotNull(productId);
    }

    @Test
    @Order(5)
    void step5_createProduct_withoutToken_returns403() throws Exception {
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Unauthorized",
                      "description": "Should fail",
                      "price": 9.99,
                      "stock": 1,
                      "categoryId": 1
                    }
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    void step6_getProductById_returnsProduct() throws Exception {
        assertNotNull(productId, "productId must be set by step4");

        mockMvc.perform(get("/api/products/" + productId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(productId))
            .andExpect(jsonPath("$.name").value("MacBook Pro"));
    }

    @Test
    @Order(7)
    void step7_getProducts_withPagination_returnsPagedResult() throws Exception {
        mockMvc.perform(get("/api/products?page=0&size=5&sortBy=name&direction=asc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.totalPages").value(greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.size").value(5));
    }

    @Test
    @Order(8)
    void step8_filterProducts_byPriceRange_returnsResults() throws Exception {
        mockMvc.perform(get("/api/products/filter?minPrice=100&maxPrice=3000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(9)
    void step9_createProduct_invalidPrice_returns400() throws Exception {
        assertNotNull(adminToken, "adminToken must be set by step1");

        mockMvc.perform(post("/api/products")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Bad Product",
                      "description": "Invalid price",
                      "price": -5.00,
                      "stock": 10,
                      "categoryId": %d
                    }
                    """.formatted(categoryId)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @Order(10)
    void step10_deleteProduct_returnsNoContent() throws Exception {
        assertNotNull(adminToken, "adminToken must be set by step1");
        assertNotNull(productId,  "productId must be set by step4");

        mockMvc.perform(delete("/api/products/" + productId)
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isNoContent());
    }

    @Test
    @Order(11)
    void step11_getDeletedProduct_returns404() throws Exception {
        assertNotNull(productId, "productId must be set by step4");

        mockMvc.perform(get("/api/products/" + productId))
            .andExpect(status().isNotFound());
    }
}