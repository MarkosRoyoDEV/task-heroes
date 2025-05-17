package com.marcosroyo.backend.dto.mapper;

import com.marcosroyo.backend.dto.RewardDto;
import com.marcosroyo.backend.model.Reward;
import org.springframework.stereotype.Component;

@Component
public class RewardDtoMapper {

  public RewardDto toDto(Reward reward) {
    Long userId = reward.getAssignedTo() != null ? reward.getAssignedTo().getId() : null;
    return new RewardDto(
        reward.getId(),
        reward.getTitle(),
        reward.getDescription(),
        reward.getPrice(),
        reward.isRedeemed(),
        userId
    );
  }
}
