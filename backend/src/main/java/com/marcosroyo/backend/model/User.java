package com.marcosroyo.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  private String password;

  @Column(name = "is_admin")
  private boolean admin = false;

  private int points = 0;

  @OneToMany(mappedBy = "assignedTo")
  private List<Task> tasks = new ArrayList<>();

  @OneToMany(mappedBy = "assignedTo")
  private List<Reward> rewards = new ArrayList<>();

  public User() {

  }

  public User(String username) {
    this.username = username;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public boolean isAdmin() {
    return admin;
  }

  public void setAdmin(boolean admin) {
    this.admin = admin;
  }

  public int getPoints() {
    return points;
  }

  public void setPoints(int points) {
    this.points = points;
  }

  public void addPoints(int points) {
    if (points > 0) {
      this.points += points;
    }
  }

  public void substractPoints(int points) {
    if (points > 0 && this.points >= points) {
      this.points -= points;
    }
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public List<Task> getTasks() {
    return tasks;
  }

  public void setTasks(List<Task> tasks) {
    this.tasks = tasks;
  }

  public List<Reward> getRewards() {
    return rewards;
  }

  public void setRewards(List<Reward> rewards) {
    this.rewards = rewards;
  }
}
