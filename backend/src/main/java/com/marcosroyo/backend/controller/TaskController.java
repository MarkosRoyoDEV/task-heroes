package com.marcosroyo.backend.controller;

import com.marcosroyo.backend.dto.TaskDto;
import com.marcosroyo.backend.model.Task;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.service.TaskService;
import com.marcosroyo.backend.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

  @Autowired
  private TaskService taskService;
  
  @Autowired
  private UserRepository userRepo;

  @GetMapping
  public ResponseEntity<List<TaskDto>> getAllTasks(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(taskService.getAllTasks(userId, isAdmin));
  }

  @GetMapping("/incomplete")
  public ResponseEntity<List<TaskDto>> getIncompleteTasks(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(taskService.getIncompleteTasks(userId, isAdmin));
  }

  @GetMapping("/completed")
  public ResponseEntity<List<TaskDto>> getCompletedTasks(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(taskService.getCompletedTasks(userId, isAdmin));
  }

  @GetMapping("/{taskId}")
  public ResponseEntity<TaskDto> getTaskById(@PathVariable Long taskId) {
    return ResponseEntity.ok(taskService.getTaskById(taskId));
  }

  @PostMapping
  public ResponseEntity<TaskDto> createTask(@RequestBody Task task,
      @RequestParam(required = false) Long assignedUserId,
      @RequestParam boolean isAdmin) {
    if (!isAdmin) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    if (assignedUserId != null) {
      User user = new User();
      user.setId(assignedUserId);
      task.setAssignedTo(user);
    }

    TaskDto createdTask = taskService.createTask(task);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
  }

  @PutMapping("/{taskId}/complete")
  public ResponseEntity<Object> completeTask(
      @PathVariable Long taskId,
      @RequestParam(required = false, defaultValue = "0") Long userId,
      @RequestParam(required = false, defaultValue = "false") boolean isAdmin,
      @RequestParam(required = false) String clientDate) {
    try {
      // Parsear fecha del cliente si se proporciona, si no usar fecha del servidor
      java.time.LocalDate completionDate = null;
      if (clientDate != null && !clientDate.isEmpty()) {
          try {
              completionDate = java.time.LocalDate.parse(clientDate);
          } catch (Exception e) {
              // Ignorar errores de parseo de fecha
          }
      }
      
      // Completar la tarea usando la fecha parseada o null (que usará la fecha del servidor)
      TaskDto completedTask = taskService.completeTask(taskId, completionDate);
      
      // Obtener los puntos actualizados del usuario
      int updatedPoints = 0;
      if (completedTask != null && completedTask.getAssignedUserId() != null) {
          Optional<User> userOpt = userRepo.findById(completedTask.getAssignedUserId());
          if (userOpt.isPresent()) {
              updatedPoints = userOpt.get().getPoints();
          }
      }
      
      // Devolver un objeto con la tarea y los puntos actualizados
      return ResponseEntity.ok(Map.of(
          "task", completedTask,
          "points", updatedPoints
      ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
          "error", e.getMessage()
      ));
    }
  }

  @GetMapping("/check-daily")
  public ResponseEntity<Object> checkAndResetDailyTasks(
      @RequestParam Long userId,
      @RequestParam String currentDate) {
    try {
      // Parsear la fecha enviada por el cliente
      java.time.LocalDate clientDate = java.time.LocalDate.parse(currentDate);
      
      // Obtener la fecha del servidor
      java.time.LocalDate serverDate = java.time.LocalDate.now();
      
      // Devolver información sobre las tareas reseteadas y las fechas
      return ResponseEntity.ok(Map.of(
          "serverDate", serverDate.toString(),
          "clientDate", clientDate.toString(),
          "tasksReset", taskService.checkAndResetDailyTasksForUser(userId, clientDate)
      ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error al procesar la fecha: " + e.getMessage());
    }
  }

  @PostMapping("/reset-daily")
  public ResponseEntity<String> resetDailyTasks(@RequestParam boolean isAdmin) {
    if (!isAdmin) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    
    int count = taskService.resetDailyTasks();
    return ResponseEntity.ok("Reset " + count + " daily tasks");
  }

  @DeleteMapping("/{taskId}")
  public ResponseEntity<?> deleteTask(@PathVariable Long taskId, @RequestParam boolean isAdmin) {
    if (taskService.deleteTask(taskId, isAdmin)) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
  }

}
