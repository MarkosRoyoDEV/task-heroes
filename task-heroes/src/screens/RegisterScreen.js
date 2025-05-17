import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/apiService';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingFirstUser, setCheckingFirstUser] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    checkIfFirstUser();
  }, []);

  const checkIfFirstUser = async () => {
    try {
      setCheckingFirstUser(true);
      const response = await apiService.users.getAll();
      console.log('Users response for first user check:', response);
      
      // Verificar si no hay usuarios o si la respuesta no contiene datos válidos
      const noUsers = !response?.data || !Array.isArray(response.data) || response.data.length === 0;
      console.log('Is first user:', noUsers);
      
      setIsFirstUser(noUsers);
    } catch (error) {
      console.error('Error checking users:', error);
      // Si hay un error, asumimos que no hay usuarios
      setIsFirstUser(true);
      Alert.alert('Error', 'No se pudo verificar usuarios existentes. Se asumirá que es el primer usuario.');
    } finally {
      setCheckingFirstUser(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre de usuario');
      return;
    }

    if (isFirstUser) {
      if (!password.trim()) {
        Alert.alert('Error', 'Por favor ingresa una contraseña');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
    }

    setLoading(true);
    try {
      console.log('Registering user:', { 
        username, 
        password: isFirstUser ? password : '', 
        admin: isFirstUser 
      });
      
      const userData = {
        username,
        password: isFirstUser ? password : '',
        admin: isFirstUser
      };
      
      const response = await apiService.users.createUser(userData);
      console.log('Registration response:', response);

      if (response?.data) {
        Alert.alert(
          'Éxito',
          `Usuario ${username} registrado ${isFirstUser ? 'como administrador' : 'correctamente'}`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Para el administrador, iniciar sesión con contraseña, para usuarios normales sin contraseña
                await login(username, isFirstUser ? password : '');
              }
            }
          ]
        );
      } else {
        throw new Error('Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Error', 'No se pudo registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (checkingFirstUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isFirstUser ? 'Registrar Administrador' : 'Registrar Usuario'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {isFirstUser && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Text style={styles.adminNote}>
            Serás registrado como administrador del sistema
          </Text>
        </>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isFirstUser ? 'Registrar Administrador' : 'Registrar Usuario'}
          </Text>
        )}
      </TouchableOpacity>
      {!isFirstUser && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#2f2f2f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#3B9AE1',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: '#E0F7FA',
    textAlign: 'center',
  },
  adminNote: {
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default RegisterScreen;
