package com.marcosroyo.backend.dto;

public class UserDto {

  private Long id;
  private String username;
  private boolean admin;
  private int points;

  public UserDto(Long id, String username, boolean admin, int points) {
    this.id = id;
    this.username = username;
    this.admin = admin;
    this.points = points;
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
}
