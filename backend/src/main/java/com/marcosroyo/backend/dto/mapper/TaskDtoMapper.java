package com.marcosroyo.backend.dto.mapper;

import com.marcosroyo.backend.dto.TaskDto;
import com.marcosroyo.backend.model.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskDtoMapper {

  public TaskDto toDto(Task task) {
    Long userId = (task.getAssignedTo() != null) ? task.getAssignedTo().getId() : null;

    return new TaskDto(
        task.getId(),
        task.getTitle(),
        task.getDescription(),
        task.isCompleted(),
        task.isDaily(),
        task.getLastCompletedDate(),
        task.getRewardPoints(),
        userId
    );
  }
}
