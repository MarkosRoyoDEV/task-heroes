package com.marcosroyo.backend.scheduler;

import com.marcosroyo.backend.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyTaskScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DailyTaskScheduler.class);

    @Autowired
    private TaskService taskService;

    /**
     * Resetea todas las tareas diarias a incompletas a la medianoche todos los días.
     * La expresión cron "0 0 0 * * ?" significa "a las 00:00:00am todos los días".
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetDailyTasks() {
        logger.info("Running scheduled daily task reset");
        int resetCount = taskService.resetDailyTasks();
        logger.info("Reset {} daily tasks", resetCount);
    }
} 