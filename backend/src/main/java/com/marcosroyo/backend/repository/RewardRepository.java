package com.marcosroyo.backend.repository;

import com.marcosroyo.backend.model.Reward;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardRepository extends JpaRepository<Reward, Long> {

  List<Reward> findByAssignedToIdAndIsRedeemedFalse(Long userId);

  List<Reward> findByAssignedToIdAndIsRedeemedTrue(Long userId);

  List<Reward> findByIsRedeemedFalse();

  List<Reward> findByIsRedeemedTrue();

  List<Reward> findByAssignedToId(Long userId);
}
