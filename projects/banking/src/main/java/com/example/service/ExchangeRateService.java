package com.example.service;

import com.example.config.LoggingConfig;
import com.example.model.ExchangeRate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class ExchangeRateService {

    private static final Logger LOGGER = LoggingConfig.getLogger(ExchangeRateService.class);
    private static final String API_URL = "https://v6.exchangerate-api.com/v6/%s/latest/%s";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    // Cache: "USD->EUR" -> ExchangeRate
    private final Map<String, ExchangeRate> cache = new ConcurrentHashMap<>();

    public ExchangeRateService(String apiKey) {
        this.apiKey    = apiKey;
        this.httpClient = HttpClient.newHttpClient();
        this.mapper     = new ObjectMapper();
    }

    /**
     * Returns the rate for base -> target.
     * Pulls from cache; fetches from API if missing.
     */
    public ExchangeRate getRate(String base, String target) throws Exception {
        String key = base + "->" + target;
        ExchangeRate cached = cache.get(key);
        if (cached != null) {
            LOGGER.fine("[RATES] Cache hit: " + key + " = " + cached.rate());
            return cached;
        }
        return fetchAndCache(base, target);
    }

    /**
     * Refreshes ALL currently cached base currencies from the API.
     * Called by the scheduler every 24 hours.
     */
    public void refreshAll() {
        if (cache.isEmpty()) {
            LOGGER.info("[RATES] Refresh skipped — cache is empty, nothing to refresh yet.");
            return;
        }

        // Collect distinct base currencies from cached keys
        cache.keySet().stream()
            .map(k -> k.split("->")[0])
            .distinct()
            .forEach(base -> {
                try {
                    fetchAllRatesForBase(base);
                    LOGGER.info("[RATES] Refreshed all rates for base: " + base);
                } catch (Exception e) {
                    LOGGER.warning("[RATES] Failed to refresh rates for base " + base + ": " + e.getMessage());
                }
            });
    }

    private ExchangeRate fetchAndCache(String base, String target) throws Exception {
        LOGGER.info("[RATES] Cache miss — fetching from API: " + base + " -> " + target);
        fetchAllRatesForBase(base);

        ExchangeRate result = cache.get(base + "->" + target);
        if (result == null)
            throw new Exception("Currency not supported: " + target);
        return result;
    }

    /**
     * One API call fetches ALL rates for a base currency — cache them all at once
     * to avoid hammering the API with individual requests.
     */
    private void fetchAllRatesForBase(String base) throws Exception {
        String url = String.format(API_URL, apiKey, base);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200)
            throw new Exception("API error: HTTP " + response.statusCode());

        JsonNode root = mapper.readTree(response.body());

        if (!"success".equals(root.path("result").asText()))
            throw new Exception("API returned failure: " + root.path("error-type").asText());

        JsonNode rates = root.path("conversion_rates");
        LocalDateTime now = LocalDateTime.now();

        rates.fields().forEachRemaining(entry -> {
            String target = entry.getKey();
            BigDecimal rate = new BigDecimal(entry.getValue().asText());
            cache.put(base + "->" + target, new ExchangeRate(base, target, rate, now));
        });

        LOGGER.info("[RATES] Cached " + rates.size() + " rates for base: " + base);
    }
}