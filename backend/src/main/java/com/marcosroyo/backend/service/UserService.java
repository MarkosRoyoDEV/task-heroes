package com.marcosroyo.backend.service;

import com.marcosroyo.backend.dto.UserDto;
import com.marcosroyo.backend.dto.mapper.UserDtoMapper;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  @Autowired
  private UserDtoMapper userDtoMapper;

  @Autowired
  private UserRepository userRepo;

  public List<UserDto> getAllUsers() {
    return userRepo.findAll()
        .stream()
        .map(userDtoMapper::toDto)
        .toList();
  }

  public Optional<UserDto> getUserById(Long id) {
    return userRepo.findById(id)
        .map(userDtoMapper::toDto);
  }

  public UserDto createUser(User user) {
    if (userRepo.findByUsername(user.getUsername()).isPresent()) {
      throw new IllegalArgumentException("El nombre de usuario ya esta en uso");
    }

    boolean nUsers = userRepo.count() == 0;

    if (nUsers) {      // Primer usuario es admin, tendra password
      if (user.getPassword() == null || user.getPassword().isEmpty()) {
        throw new IllegalArgumentException("El primer usuario debe tener contraseña.");
      }
      user.setAdmin(true);
    } else { // El resto de usuarios no seran admin nunca
      if (user.isAdmin()) {
        throw new IllegalArgumentException("Solo el primer usuario puede ser administrador");
      }
      if (user.getPassword() != null && !user.getPassword().isEmpty()) {
        throw new IllegalArgumentException(
            "Los usuarios no administradores no deben tener contraseña.");
      }
      user.setAdmin(false);
      user.setPassword(null);
    }

    System.out.println("Usuario guardado: " + user.getUsername() + " con admin " + user.isAdmin());
    return userDtoMapper.toDto(userRepo.save(user));
  }

  public boolean login(String username, String password) {
    Optional<User> userOpt = userRepo.findAll()
        .stream()
        .filter(u -> u.getUsername().equals(username))
        .findFirst();

    if (userOpt.isPresent()) {
      User user = userOpt.get();
      if (user.isAdmin()) {
        return user.getPassword() != null && user.getPassword().equals(password);
      } else {
        // Si no es admin, logea sin contraseña, por lo que devuelve true automaticamente
        return true;
      }
    }
    return false;
  }

  public UserDto updateUser(Long id, User updatedUser) {
    Optional<User> existingUserOpt = userRepo.findById(id);
    if (existingUserOpt.isEmpty()) {
      return null;
    }

    User existingUser = existingUserOpt.get();

    User existingUserWithSameUsername = userRepo.findByUsername(updatedUser.getUsername())
        .orElse(null);
    if (existingUserWithSameUsername != null && !existingUserWithSameUsername.getId().equals(id)) {
      throw new IllegalArgumentException("El nombre de usuario ya está en uso");
    }

    boolean isBecomingAdmin = updatedUser.isAdmin() && !existingUser.isAdmin();

    if (isBecomingAdmin) {
      boolean adminExists = userRepo.findAll()
          .stream()
          .anyMatch(u -> u.isAdmin() && !u.getId()
              .equals(id));
      if (adminExists) {
        throw new IllegalArgumentException(
            "Ya existe un administrador. No se puede dar privilegio de administrador a otro usuario");
      }
    }

    // Solo los admins tienen psswd
    if (!updatedUser.isAdmin() && updatedUser.getPassword() != null && !updatedUser.getPassword()
        .isEmpty()) {
      throw new IllegalArgumentException("Solo los administradores pueden tener contraseña");
    }

    // Actualizamos datos basicos
    existingUser.setUsername(updatedUser.getUsername());
    existingUser.setAdmin(updatedUser.isAdmin());

    // Gestionamos contraseñas segun rol
    if (updatedUser.isAdmin()) {
      existingUser.setPassword(updatedUser.getPassword());
    } else {
      existingUser.setPassword(null);
    }

    // Los puntos se modifican y actualizan en metodos especificos

    return userDtoMapper.toDto(userRepo.save(existingUser));  // En todos los métodos que guardan
  }

  public UserDto addPointsToUser(Long id, int points) {
    Optional<User> userOpt = userRepo.findById(id);
    if (userOpt.isEmpty()) {
      return null;
    }

    User user = userOpt.get();

    // Solo añadimos puntos a usuarios no administradores
    if (!user.isAdmin()) {
      user.addPoints(points);
      return userDtoMapper.toDto(userRepo.save(user));  // En todos los métodos que guardan
    } else {
      throw new IllegalArgumentException("Los administradores no pueden acumular puntos");
    }
  }

  public UserDto subtractPointsFromUser(Long id, int points) {
    Optional<User> userOpt = userRepo.findById(id);
    if (userOpt.isEmpty()) {
      return null;
    }

    User user = userOpt.get();

    // Solo restamos puntos a usuarios no administradores
    if (!user.isAdmin()) {
      // Verificar que tenga suficientes puntos
      if (user.getPoints() < points) {
        throw new IllegalArgumentException("El usuario no tiene suficientes puntos para restar");
      }
      user.substractPoints(points);
      return userDtoMapper.toDto(userRepo.save(user));
    } else {
      throw new IllegalArgumentException("Los administradores no pueden tener puntos");
    }
  }

  public boolean deleteUser(Long userId, boolean isAdmin) {
    if (isAdmin) {
      if (userRepo.existsById(userId)) {
        userRepo.deleteById(userId);
        return true;
      }
    }
    return false;
  }
}
