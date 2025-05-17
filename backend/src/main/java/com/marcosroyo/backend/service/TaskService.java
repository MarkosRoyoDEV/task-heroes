package com.marcosroyo.backend.service;

import com.marcosroyo.backend.dto.TaskDto;
import com.marcosroyo.backend.dto.mapper.TaskDtoMapper;
import com.marcosroyo.backend.exceptions.ResourceNotFoundException;
import com.marcosroyo.backend.model.Task;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.repository.TaskRepository;
import com.marcosroyo.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
public class TaskService {

  @Autowired
  private TaskDtoMapper taskDtoMapper;

  @Autowired
  private TaskRepository taskRepo;

  @Autowired
  private UserRepository userRepo;
  
  @Autowired
  private JdbcTemplate jdbcTemplate;

  public List<TaskDto> getAllTasks(Long userId, boolean isAdmin) {

    List<Task> tasks = isAdmin ? taskRepo.findAll() : taskRepo.findByAssignedToId(userId);
    return tasks.stream().map(taskDtoMapper::toDto).collect(Collectors.toList());
  }

  public TaskDto getTaskById(Long id) {
    Task task = taskRepo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
    return taskDtoMapper.toDto(task);
  }

  public List<TaskDto> getIncompleteTasks(Long userId, boolean isAdmin) {
    List<Task> tasks = isAdmin
        ? taskRepo.findByIsCompletedFalse()
        : taskRepo.findByAssignedToIdAndIsCompletedFalse(userId);
    return tasks.stream().map(taskDtoMapper::toDto).collect(Collectors.toList());
  }

  public List<TaskDto> getCompletedTasks(Long userId, boolean isAdmin) {
    List<Task> tasks = isAdmin
        ? taskRepo.findByIsCompletedTrue()
        : taskRepo.findByAssignedToIdAndIsCompletedTrue(userId);
    return tasks.stream().map(taskDtoMapper::toDto).collect(Collectors.toList());
  }

  public TaskDto createTask(Task task) {
    User user = null;
    if (task.getAssignedTo() != null && task.getAssignedTo().getId() != null) {
      user = userRepo.findById(task.getAssignedTo().getId())
          .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
      task.setAssignedTo(user);
    }
    return taskDtoMapper.toDto(taskRepo.save(task));
  }

  /**
   * Completa una tarea y añade puntos al usuario asignado
   * 
   * @param taskId ID de la tarea a completar
   * @return La tarea completada como DTO
   */
  public TaskDto completeTask(Long taskId) {
    return completeTask(taskId, null);
  }
  
  /**
   * Completa una tarea y añade puntos al usuario asignado usando una fecha específica
   * 
   * @param taskId ID de la tarea a completar
   * @param completionDate Fecha de completado (si es null, se usará la fecha del servidor)
   * @return La tarea completada como DTO
   */
  public TaskDto completeTask(Long taskId, java.time.LocalDate completionDate) {
    Task task = taskRepo.findById(taskId)
        .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

    // Establecer la fecha de completado
    java.time.LocalDate today = completionDate != null ? completionDate : java.time.LocalDate.now();
    
    // Verificar si la tarea es diaria y ya fue completada hoy
    if (task.isDaily() && task.isCompleted() && task.getLastCompletedDate() != null) {
      if (task.getLastCompletedDate().equals(today)) {
        // Si es una tarea diaria ya completada en la misma fecha, no hacer nada
        return taskDtoMapper.toDto(task);
      }
    }
    
    // Verifica si la tarea ya estaba completada antes de cambiar su estado
    boolean wasAlreadyCompleted = task.isCompleted();
    
    try {
      // Actualización directa con SQL
      String formattedDate = today.toString();
      
      // Actualiza el estado y la fecha directamente en la base de datos
      String sql = "UPDATE tasks SET is_completed = 1, last_completed_date = ? WHERE id = ?";
      int updatedRows = jdbcTemplate.update(sql, formattedDate, taskId);
      
      if (updatedRows == 0) {
        throw new RuntimeException("No se pudo actualizar el estado de completado de la tarea");
      }
      
      // Obtener la tarea actualizada de la base de datos
      task = taskRepo.findById(taskId)
             .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
      
      // Manejar los puntos del usuario si la tarea no estaba completada previamente
      User assignedUser = task.getAssignedTo();
      if (assignedUser != null && !wasAlreadyCompleted) {
        assignedUser.addPoints(task.getRewardPoints());
        userRepo.save(assignedUser);
      }
    } catch (Exception e) {
      throw e;
    }
    
    return taskDtoMapper.toDto(task);
  }

  public boolean deleteTask(Long taskId, boolean isAdmin) {
    if (isAdmin) {
      if (taskRepo.existsById(taskId)) {
        taskRepo.deleteById(taskId);
        return true;
      }
    }
    return false;
  }
  
  /**
   * Reinicia todas las tareas diarias completadas a incompletas.
   * Este método debería ser llamado por un programador al inicio de cada día.
   * 
   * @return El número de tareas que fueron reiniciadas
   */
  public int resetDailyTasks() {
    List<Task> dailyTasks = taskRepo.findByIsDailyTrueAndIsCompletedTrue();
    
    for (Task task : dailyTasks) {
      task.setCompleted(false);
    }
    
    if (!dailyTasks.isEmpty()) {
      taskRepo.saveAll(dailyTasks);
    }
    
    return dailyTasks.size();
  }
  
  /**
   * Verifica y reinicia las tareas diarias completadas para un usuario específico
   * si la fecha del servidor es diferente a la fecha del cliente.
   * 
   * @param userId ID del usuario
   * @param clientDate Fecha actual del cliente
   * @return Número de tareas reiniciadas
   */
  public int checkAndResetDailyTasksForUser(Long userId, java.time.LocalDate clientDate) {
    java.time.LocalDate serverDate = java.time.LocalDate.now();
    
    // Imprimir fechas para depuración
    System.out.println("Fecha del cliente: " + clientDate);
    System.out.println("Fecha del servidor: " + serverDate);
    
    // Obtener todas las tareas diarias completadas del usuario
    List<Task> userDailyTasks = taskRepo.findByAssignedToIdAndIsDailyTrueAndIsCompletedTrue(userId);
    System.out.println("Tareas diarias completadas encontradas: " + userDailyTasks.size());
    
    int resetCount = 0;
    
    for (Task task : userDailyTasks) {
      // Mostrar información de cada tarea
      System.out.println("Tarea ID: " + task.getId() + 
                         ", Título: " + task.getTitle() + 
                         ", Completada: " + task.isCompleted() + 
                         ", Última fecha completada: " + task.getLastCompletedDate());
      
      // Si la tarea no tiene fecha de completado, no deberíamos hacer nada
      if (task.getLastCompletedDate() == null) {
        System.out.println("  - Sin fecha de completado, ignorando");
        continue;
      }
      
      // Si la última fecha de completado NO es igual a la fecha actual del cliente,
      // significa que fue completada en un día diferente y debe reiniciarse
      if (!task.getLastCompletedDate().equals(clientDate)) {
        System.out.println("  - Fecha diferente: Reiniciando tarea");
        task.setCompleted(false);
        resetCount++;
      } else {
        System.out.println("  - Misma fecha: No se reinicia");
      }
    }
    
    if (resetCount > 0) {
      System.out.println("Guardando " + resetCount + " tareas reiniciadas");
      taskRepo.saveAll(userDailyTasks);
    } else {
      System.out.println("No se reinició ninguna tarea");
    }
    
    return resetCount;
  }

  /**
   * Actualiza una tarea con nuevos valores
   * 
   * @param task Objeto tarea con los valores actualizados
   * @return La tarea actualizada
   */
  public Task updateTask(Task task) {
    // Verificar que la tarea existe
    if (!taskRepo.existsById(task.getId())) {
      throw new ResourceNotFoundException("Tarea con ID " + task.getId() + " no encontrada");
    }
    
    // Asegurarnos de no perder la asociación con el usuario
    if (task.getAssignedTo() == null) {
      Task existingTask = taskRepo.findById(task.getId()).get();
      if (existingTask.getAssignedTo() != null) {
        task.setAssignedTo(existingTask.getAssignedTo());
      }
    }
    
    // Guardar la tarea
    return taskRepo.save(task);
  }
}
