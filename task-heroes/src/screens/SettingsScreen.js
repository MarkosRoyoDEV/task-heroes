import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { CommonActions } from '@react-navigation/native';

const SettingsScreen = ({ navigation, route }) => {
  const { user: selectedUser } = route.params || {};
  const { user: loggedInUser, logout, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Admin settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // User settings
  const [newUsername, setNewUsername] = useState(selectedUser?.username || '');

  useEffect(() => {
    if (!selectedUser) {
      Alert.alert('Error', 'No se ha seleccionado ningún usuario');
      navigation.goBack();
    }

    // Agregar listener para detectar cuando el teclado aparece/desaparece
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Limpiar listeners al desmontar
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [selectedUser]);

  const handleSaveChanges = async () => {
    if (selectedUser.admin) {
      // Administrador cambiando contraseña
      await handleAdminPasswordChange();
    } else {
      // Usuario normal cambiando nombre de usuario
      await handleUsernameChange();
    }
  };

  const handleAdminPasswordChange = async () => {
    // Validación
    if (!currentPassword) {
      Alert.alert('Error', 'Debes introducir tu contraseña actual');
      return;
    }
    
    if (!newPassword) {
      Alert.alert('Error', 'Debes introducir una nueva contraseña');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 4) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      
      // Verificar la contraseña actual
      const loginCheck = await apiService.users.login(selectedUser.username, currentPassword);
      if (!loginCheck?.data) {
        Alert.alert('Error', 'La contraseña actual es incorrecta');
        setLoading(false);
        return;
      }
      
      // Actualizar la contraseña
      const updateData = {
        ...selectedUser,
        password: newPassword
      };
      
      const response = await apiService.users.putUpdateUser(selectedUser.id, updateData);
      
      if (response?.data) {
        setSuccess(true);
        
        // Limpiar campos
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        Alert.alert('Éxito', 'Contraseña actualizada correctamente');
        
        // Si el usuario actual es el admin, hacer logout
        if (loggedInUser && loggedInUser.id === selectedUser.id) {
          Alert.alert(
            'Sesión cerrada',
            'Tu contraseña ha sido cambiada. Por favor, inicia sesión nuevamente.',
            [{ text: 'OK', onPress: () => logout() }]
          );
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async () => {
    // Validación
    if (!newUsername || newUsername.trim() === '') {
      Alert.alert('Error', 'Debes introducir un nombre de usuario');
      return;
    }
    
    if (newUsername === selectedUser.username) {
      Alert.alert('Sin cambios', 'El nombre de usuario es el mismo');
      return;
    }
    
    if (newUsername.length < 3) {
      Alert.alert('Error', 'El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      
      // Actualizar el nombre de usuario
      const updateData = {
        ...selectedUser,
        username: newUsername
      };
      
      const response = await apiService.users.putUpdateUser(selectedUser.id, updateData);
      
      if (response?.data) {
        setSuccess(true);
        
        // Si el usuario actual es el que se está modificando, hacer logout
        if (loggedInUser && loggedInUser.id === selectedUser.id) {
          Alert.alert(
            'Sesión cerrada',
            'Tu nombre de usuario ha sido cambiado. Por favor, inicia sesión nuevamente.',
            [{ 
              text: 'OK', 
              onPress: () => {
                // Nos desconectamos y volvemos a Login 
                logout();
              } 
            }]
          );
        } else {
          // Volver a la pantalla anterior y notificar éxito
          Alert.alert(
            'Éxito', 
            'Nombre de usuario actualizado correctamente',
            [{ 
              text: 'OK', 
              onPress: async () => {
                // Primero vamos a recargar manualmente la lista de usuarios
                try {
                  const refreshResponse = await apiService.users.getAll();
                  if (refreshResponse?.data) {
                    console.log('Lista de usuarios actualizada');
                  }
                } catch (error) {
                  console.error('Error recargando usuarios:', error);
                }
                // Volver a la pantalla anterior
                navigation.goBack();
              } 
            }]
          );
        }
      }
    } catch (error) {
      console.error('Error actualizando nombre de usuario:', error);
      Alert.alert('Error', 'No se pudo actualizar el nombre de usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        enabled={true}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Configuración</Text>
          </View>
          
          <View style={styles.userInfoCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {selectedUser?.username ? selectedUser.username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.usernameText}>{selectedUser?.username}</Text>
            <Text style={styles.roleText}>
              {selectedUser?.admin ? 'Administrador' : 'Usuario'}
            </Text>
          </View>
          
          {selectedUser?.admin ? (
            // Configuración para administrador
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
              
              <Text style={styles.inputLabel}>Contraseña Actual</Text>
              <TextInput
                style={styles.input}
                placeholder="Introduce tu contraseña actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Introduce tu nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          ) : (
            // Configuración para usuario normal
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Cambiar Nombre de Usuario</Text>
              
              <Text style={styles.inputLabel}>Nuevo Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Introduce tu nuevo nombre de usuario"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSaveChanges}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>

          {/* Espacio adicional para evitar que el botón quede oculto por el teclado */}
          {keyboardVisible && <View style={styles.keyboardSpacing} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#b3d9ff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyboardSpacing: {
    height: 120, // Espacio adicional para teclado
  },
});

export default SettingsScreen;
