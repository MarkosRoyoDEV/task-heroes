package com.marcosroyo.backend.dto.mapper;

import com.marcosroyo.backend.dto.UserDto;
import com.marcosroyo.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserDtoMapper {

  public UserDto toDto(User user) {
    return new UserDto(user.getId(), user.getUsername(), user.isAdmin(), user.getPoints());
  }
}
