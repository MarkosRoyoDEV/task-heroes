import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../api/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // Comprobar credenciales de usuario almacenadas al iniciar la aplicación
        const checkUserSession = async () => {
            try {
                setLoading(true);
                
                // Siempre limpiar el almacenamiento al iniciar la aplicación
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('isAdmin');
                
                setUser(null);
                setIsAdmin(false);
                setIsAuthenticated(false);
                
                console.log('User session cleared on app start to force login');
                
                // No necesitamos verificar el almacenamiento local aquí, ya que el componente
                // de navegación se encargará de redirigir a RegisterScreen si es necesario
            } catch (error) {
                console.error('Error checking user session:', error);
                setUser(null);
                setIsAdmin(false);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        
        checkUserSession();
    }, []);

    const login = async (username, password) => {
        try {
            setLoading(true);
            console.log('Login attempt for:', username, 'with password:', password ? '[PROVIDED]' : '[EMPTY]');
            
            // Obtener la lista de usuarios para encontrar al usuario correcto
            const usersResponse = await apiService.users.getAll();
            console.log('Users list for login:', usersResponse?.data?.length || 0, 'users');
            
            if (!usersResponse?.data || !Array.isArray(usersResponse.data)) {
                console.log('No valid users data in response');
                return { success: false, error: 'No hay usuarios disponibles' };
            }
            
            const userData = usersResponse.data.find(u => u.username === username);
            
            if (!userData) {
                console.log('User not found:', username);
                return { success: false, error: 'Usuario no encontrado' };
            }
            
            console.log('User data found:', userData);
            
            // Para usuarios no administradores, permitir el login sin contraseña
            if (!userData.admin) {
                console.log('Non-admin user login - bypassing password check');
                // Guardar en AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                await AsyncStorage.setItem('isAdmin', "false");
                
                // Actualizar estado
                setUser(userData);
                setIsAdmin(false);
                setIsAuthenticated(true);
                
                return { success: true, isAdmin: false };
            }
            
            // Para administradores, verificar la contraseña
            console.log('Admin user login - checking password');
            const response = await apiService.users.login(username, password);
            console.log('Login response:', response);
            
            if (response?.data) {
                // Guardar en AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                await AsyncStorage.setItem('isAdmin', userData.admin.toString());
                
                // Actualizar estado
                setUser(userData);
                setIsAdmin(userData.admin);
                setIsAuthenticated(true);
                
                return { success: true, isAdmin: userData.admin };
            } else {
                console.log('Invalid login response:', response);
                return { success: false, error: 'Credenciales inválidas' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Error al iniciar sesión'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            console.log('Logout started, setting isLoggingOut to true');
            setIsLoggingOut(true);
            
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isAdmin');
            console.log('AsyncStorage cleared');
            
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
            console.log('Auth state cleared');
            
            setLoading(true);
            
            setTimeout(() => {
                console.log('Setting loading to false after delay');
                setLoading(false);
                setTimeout(() => {
                    console.log('Resetting isLoggingOut flag to false');
                    setIsLoggingOut(false);
                }, 300);
            }, 100);
        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);
            setIsLoggingOut(false);
        }
    };

    const updateUserPoints = async (newPoints) => {
        if (user) {
            console.log('Updating user points from', user.points, 'to', newPoints);
            
            try {

                const currentPoints = user.points || 0;
                const pointDifference = newPoints - currentPoints;
                
                const updatedUser = { ...user, points: newPoints };

                setUser(updatedUser);
                
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                
                console.log('User points updated successfully in local storage');
            } catch (error) {
                console.error('Error updating user points:', error);
            }
        }
    };

    const value = {
        user,
        isAdmin,
        loading,
        login,
        logout,
        isAuthenticated,
        updateUserPoints,
        isLoggingOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 