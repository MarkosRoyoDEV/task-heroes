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
@Table(name = "rewards")
public class Reward {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;
  private int price;

  @Column(name = "is_redeemed")
  private boolean isRedeemed = false;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User assignedTo;

  public Reward() {
  }

  public Reward(String title, String description, int price, boolean isRedeemed, User assignedTo) {
    this.title = title;
    this.description = description;
    this.price = price;
    this.isRedeemed = isRedeemed;
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

  public User getAssignedTo() {
    return assignedTo;
  }

  public void setAssignedTo(User assignedTo) {
    this.assignedTo = assignedTo;
  }
}
