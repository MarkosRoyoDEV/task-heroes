package com.marcosroyo.backend.service;

import com.marcosroyo.backend.dto.RewardDto;
import com.marcosroyo.backend.dto.mapper.RewardDtoMapper;
import com.marcosroyo.backend.exceptions.ResourceNotFoundException;
import com.marcosroyo.backend.model.Reward;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.repository.RewardRepository;
import com.marcosroyo.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RewardService {

  @Autowired
  private RewardRepository rewardRepo;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private RewardDtoMapper rewardDtoMapper;

  public List<RewardDto> getAllRewards(Long userId, boolean isAdmin) {
    List<Reward> rewards = isAdmin ? rewardRepo.findAll() : rewardRepo.findByAssignedToId(userId);
    return rewards.stream().map(rewardDtoMapper::toDto).collect(Collectors.toList());
  }

  public RewardDto getRewardById(Long id) {
    Reward reward = rewardRepo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Recompensa no encontrada"));
    return rewardDtoMapper.toDto(reward);
  }

  public List<RewardDto> getAvailableRewards(Long userId, boolean isAdmin) {
    List<Reward> rewards = isAdmin
        ? rewardRepo.findByIsRedeemedFalse()
        : rewardRepo.findByAssignedToIdAndIsRedeemedFalse(userId);

    return rewards.stream().map(rewardDtoMapper::toDto).collect(Collectors.toList());
  }

  public List<RewardDto> getRedeemedRewards(Long userId, boolean isAdmin) {
    List<Reward> rewards = isAdmin
        ? rewardRepo.findByIsRedeemedTrue()
        : rewardRepo.findByAssignedToIdAndIsRedeemedTrue(userId);

    return rewards.stream().map(rewardDtoMapper::toDto).collect(Collectors.toList());
  }

  public RewardDto createReward(Reward reward) {
    User user = null;
    if (reward.getAssignedTo() != null && reward.getAssignedTo().getId() != null) {
      user = userRepo.findById(reward.getAssignedTo().getId())
          .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
      reward.setAssignedTo(user);
    } else {
      reward.setAssignedTo(null);
    }

    Reward savedReward = rewardRepo.save(reward);
    return rewardDtoMapper.toDto(savedReward);
  }

  public RewardDto redeemReward(Long rewardId) {
    Reward reward = rewardRepo.findById(rewardId)
        .orElseThrow(() -> new RuntimeException("Recompensa no encontrada"));

    if (!reward.isRedeemed()) {
      reward.setRedeemed(true);
      User assignedUser = reward.getAssignedTo();
      if (assignedUser != null) {
        assignedUser.substractPoints(reward.getPrice());
        userRepo.save(assignedUser);
      }
      reward = rewardRepo.save(reward);
    }
    return rewardDtoMapper.toDto(reward);
  }

  public boolean deleteReward(Long rewardId, boolean isAdmin) {
    if (isAdmin) {
      if (rewardRepo.existsById(rewardId)) {
        rewardRepo.deleteById(rewardId);
        return true;
      }
    }
    return false;
  }
}
