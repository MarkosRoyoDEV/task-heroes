package com.marcosroyo.backend.controller;

import com.marcosroyo.backend.dto.LoginRequest;
import com.marcosroyo.backend.dto.PointsRequest;
import com.marcosroyo.backend.dto.UserDto;
import com.marcosroyo.backend.model.User;
import com.marcosroyo.backend.service.UserService;
import java.util.List;
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
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

  @Autowired
  private UserService userService;

  @GetMapping
  public ResponseEntity<List<UserDto>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Optional<UserDto>> getUserById(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
  }

  @PostMapping
  public ResponseEntity<UserDto> createUser(@RequestBody User user) {
    return ResponseEntity.ok(userService.createUser(user));
  }

  @PostMapping("/login")
  public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {

    boolean success = userService.login(loginRequest.username, loginRequest.password);

    if (success) {
      return ResponseEntity.ok("Login correcto");
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login fallido");
    }
  }

  @PutMapping("{id}")
  public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
    try {
      UserDto updated = userService.updateUser(id, user);
      if (updated != null) {
        return ResponseEntity.ok(updated);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error al actualizar el usuario: " + e.getMessage());
    }
  }

  @PostMapping("/{id}/add-points")
  public ResponseEntity<?> addPoints(@PathVariable Long id,
      @RequestBody PointsRequest pointsRequest) {
    try {
      if (pointsRequest.points <= 0) {
        return ResponseEntity.badRequest().body("Se requiere un valor positivo para 'points'");
      }

      UserDto updated = userService.addPointsToUser(id, pointsRequest.points);
      if (updated != null) {
        return ResponseEntity.ok(updated);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error al añadir puntos: " + e.getMessage());
    }
  }

  @PostMapping("/{id}/subtract-points")
  public ResponseEntity<?> subtractPoints(@PathVariable Long id,
      @RequestBody PointsRequest pointsRequest) {
    try {
      if (pointsRequest.points <= 0) {
        return ResponseEntity.badRequest().body("Se requiere un valor positivo para 'points'");
      }

      UserDto updated = userService.subtractPointsFromUser(id, pointsRequest.points);
      if (updated != null) {
        return ResponseEntity.ok(updated);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error al restar puntos: " + e.getMessage());
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam boolean isAdmin) {
    if (userService.deleteUser(id, isAdmin)) {
      return ResponseEntity.noContent().build();
    } else {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
  }
}
