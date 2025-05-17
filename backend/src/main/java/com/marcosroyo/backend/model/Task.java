package com.marcosroyo.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;

  @Column(name = "is_completed")
  private boolean isCompleted = false;

  @Column(name = "is_daily")
  private Boolean isDaily = false;

  @Column(name = "last_completed_date")
  private java.time.LocalDate lastCompletedDate;

  @Column(name = "reward_points")
  private int rewardPoints;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User assignedTo;

  public Task() {

  }

  public Task(Long id, String title, String description, boolean isCompleted, Boolean isDaily,
      java.time.LocalDate lastCompletedDate, int rewardPoints,
      User assignedTo) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isCompleted = isCompleted;
    this.isDaily = isDaily;
    this.lastCompletedDate = lastCompletedDate;
    this.rewardPoints = rewardPoints;
    this.assignedTo = assignedTo;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public boolean isCompleted() {
    return isCompleted;
  }

  public void setCompleted(boolean isCompleted) {
    this.isCompleted = isCompleted;
  }

  public Boolean isDaily() {
    return isDaily;
  }

  public void setIsDaily(Boolean isDaily) {
    this.isDaily = isDaily;
  }

  public java.time.LocalDate getLastCompletedDate() {
    return lastCompletedDate;
  }

  public void setLastCompletedDate(java.time.LocalDate lastCompletedDate) {
    this.lastCompletedDate = lastCompletedDate;
  }

  public int getRewardPoints() {
    return rewardPoints;
  }

  public void setRewardPoints(int rewardPoints) {
    this.rewardPoints = rewardPoints;
  }

  public User getAssignedTo() {
    return assignedTo;
  }

  public void setAssignedTo(User assignedTo) {
    this.assignedTo = assignedTo;
  }
}
