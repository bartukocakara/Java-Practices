package com.example.scheduler;

import com.example.config.LoggingConfig;
import com.example.service.ExchangeRateService;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class ExchangeRateScheduler {

    private static final Logger LOGGER = LoggingConfig.getLogger(ExchangeRateScheduler.class);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final ExchangeRateService rateService;

    public ExchangeRateScheduler(ExchangeRateService rateService) {
        this.rateService = rateService;
    }

    public void start() {
        // Initial delay 24h, then every 24h after that
        scheduler.scheduleAtFixedRate(() -> {
            LOGGER.info("[SCHEDULER] Starting scheduled exchange rate refresh...");
            rateService.refreshAll();
            LOGGER.info("[SCHEDULER] Refresh complete.");
        }, 24, 24, TimeUnit.HOURS);

        LOGGER.info("[SCHEDULER] Exchange rate scheduler started. Refresh every 24 hours.");
    }

    public void stop() {
        scheduler.shutdownNow();
        LOGGER.info("[SCHEDULER] Exchange rate scheduler stopped.");
    }
}