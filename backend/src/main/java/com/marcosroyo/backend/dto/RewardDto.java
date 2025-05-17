package com.marcosroyo.backend.dto;

public class RewardDto {

  private Long id;
  private String title;
  private String description;
  private int price;
  private boolean isRedeemed;
  private Long userId;

  public RewardDto() {
  }

  public RewardDto(Long id, String title, String description, int price, boolean isRedeemed,
      Long userId) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.isRedeemed = isRedeemed;
    this.userId = userId;
  }

  public Long getId() {
    return id;
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

  public int getPrice() {
    return price;
  }

  public void setPrice(int price) {
    this.price = price;
  }

  public boolean isRedeemed() {
    return isRedeemed;
  }

  public void setRedeemed(boolean redeemed) {
    isRedeemed = redeemed;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }
}
