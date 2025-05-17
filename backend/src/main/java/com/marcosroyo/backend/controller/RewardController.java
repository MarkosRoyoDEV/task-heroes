package com.marcosroyo.backend.controller;

import com.marcosroyo.backend.dto.RewardDto;
import com.marcosroyo.backend.model.Reward;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.repository.UserRepository;
import com.marcosroyo.backend.service.RewardService;
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
@RequestMapping("/rewards")
@CrossOrigin(origins = "*")
public class RewardController {

  @Autowired
  private RewardService rewardService;

  @Autowired
  private UserRepository userRepo;

  @GetMapping
  public ResponseEntity<List<RewardDto>> getAllRewards(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(rewardService.getAllRewards(userId, isAdmin));
  }

  @GetMapping("/available")
  public ResponseEntity<List<RewardDto>> getAvailableRewards(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(rewardService.getAvailableRewards(userId, isAdmin));
  }

  @GetMapping("/redeemed")
  public ResponseEntity<List<RewardDto>> getRedeemedRewards(@RequestParam Long userId,
      @RequestParam boolean isAdmin) {
    return ResponseEntity.ok(rewardService.getRedeemedRewards(userId, isAdmin));
  }

  @GetMapping("/{rewardId}")
  public ResponseEntity<RewardDto> getRewardById(@PathVariable Long rewardId) {
    return ResponseEntity.ok(rewardService.getRewardById(rewardId));
  }

  @PostMapping
  public ResponseEntity<RewardDto> createReward(@RequestBody Reward reward,
      @RequestParam(required = false) Long assignedUserId,
      @RequestParam boolean isAdmin) {
    if (!isAdmin) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    if (assignedUserId != null) {
      Optional<User> userOpt = userRepo.findById(assignedUserId);
      if (userOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      }
      reward.setAssignedTo(userOpt.get());
    } else if (reward.getAssignedTo() != null && reward.getAssignedTo().getId() != null) {
      Optional<User> userOpt = userRepo.findById(reward.getAssignedTo().getId());
      if (userOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      }
      reward.setAssignedTo(userOpt.get());
    }

    RewardDto createdReward = rewardService.createReward(reward);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdReward);
  }

  @PutMapping("/{id}/redeem")
  public ResponseEntity<Object> redeemReward(
      @PathVariable Long id,
      @RequestParam(required = false, defaultValue = "0") Long userId,
      @RequestParam(required = false, defaultValue = "false") boolean isAdmin) {
    try {
      // Obtener la recompensa canjeada
      RewardDto redeemedReward = rewardService.redeemReward(id);
      
      // Obtener los puntos actualizados del usuario asignado
      int updatedPoints = 0;
      if (redeemedReward != null && redeemedReward.getUserId() != null) {
        Long assignedUserId = redeemedReward.getUserId();
        Optional<User> user = userRepo.findById(assignedUserId);
        if (user.isPresent()) {
          updatedPoints = user.get().getPoints();
        }
      }
      
      // Devolver un objeto con la recompensa y los puntos actualizados
      return ResponseEntity.ok(Map.of(
          "reward", redeemedReward,
          "points", updatedPoints
      ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteReward(@PathVariable Long id, @RequestParam boolean isAdmin) {
    if (rewardService.deleteReward(id, isAdmin)) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
  }
}
