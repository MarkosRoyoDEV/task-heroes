import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/apiService';
import UserCard from '../components/UserCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import StyledFlatList from '../components/StyledFlatList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationService from '../navigation/navigationRef';

const LoginScreen = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [password, setPassword] = useState('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needRefresh, setNeedRefresh] = useState(true);
    const { login } = useAuth();
    const navigation = useNavigation();
    
    // Estados para el modal de configuración
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [selectedUserForSettings, setSelectedUserForSettings] = useState(null);
    const [settingsPassword, setSettingsPassword] = useState('');
    const [isSettingsPasswordModalVisible, setIsSettingsPasswordModalVisible] = useState(false);

    useEffect(() => {
        if (needRefresh) {
            loadUsers();
            setNeedRefresh(false);
        }
    }, [needRefresh]);

    // Verificar y reiniciar tareas diarias cada vez que la pantalla de login se muestra
    useFocusEffect(
        React.useCallback(() => {
            // Marcar para refrescar usuarios cuando regresamos a esta pantalla
            setNeedRefresh(true);
            
            // Sólo verificaremos tareas diarias si tenemos información almacenada de la fecha anterior
            const checkDailyTasksIfDateChanged = async () => {
                try {
                    // Obtener fecha actual en formato ISO (AAAA-MM-DD)
                    const currentDate = new Date().toISOString().split('T')[0];
                    console.log('Fecha actual:', currentDate);
                    
                    // Verificar si la fecha ha cambiado desde la última vez
                    try {
                        const lastCheckDate = await AsyncStorage.getItem('@last_daily_check_date');
                        console.log('Última fecha de verificación:', lastCheckDate);
                        
                        // Si es primera vez o la fecha ha cambiado
                        if (!lastCheckDate || lastCheckDate !== currentDate) {
                            console.log('La fecha ha cambiado, verificando tareas diarias');
                            
                            // Guardar la fecha actual como última verificación
                            await AsyncStorage.setItem('@last_daily_check_date', currentDate);
                            
                            // Método 1: Usar endpoint admin si hay administrador
                            if (adminUser && adminUser.id) {
                                console.log('Reseteando tareas como administrador');
                                await apiService.tasks.resetDailyTasksAdmin(true);
                            }
                            
                            // Método 2: Verificar para cada usuario
                            const response = await apiService.users.getAll();
                            if (response?.data && Array.isArray(response.data)) {
                                for (const user of response.data) {
                                    if (user && user.id) {
                                        console.log(`Verificando tareas para usuario: ${user.username}`);
                                        await apiService.tasks.checkDailyTasks(user.id, currentDate);
                                    }
                                }
                            }
                        } else {
                            console.log('La fecha no ha cambiado, omitiendo verificación de tareas diarias');
                        }
                    } catch (storageError) {
                        console.error('Error accediendo a AsyncStorage:', storageError);
                    }
                } catch (error) {
                    console.error('Error general al verificar tareas diarias:', error);
                }
            };
            
            checkDailyTasksIfDateChanged();
            
            return () => {
                // Limpieza si es necesaria
            };
        }, [adminUser])
    );

    const loadUsers = async () => {
        try {
            setLoading(true);
            console.log('Loading users for login screen');
            const response = await apiService.users.getAll();
            console.log('Users response:', response);
            
            if (response?.data && Array.isArray(response.data)) {
                console.log('Setting users:', response.data);
                
                // Si no hay usuarios, redireccionar a la pantalla de registro
                if (response.data.length === 0) {
                    console.log('No users found, redirecting to registration screen');
                    navigation.replace('Register');
                    return;
                }
                
                // Encontrar al usuario administrador
                const admin = response.data.find(user => user.admin === true);
                if (admin) {
                    setAdminUser(admin);
                }
                
                setUsers(response.data);
            } else {
                console.log('No users data in response, redirecting to registration');
                navigation.replace('Register');
                return;
            }
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = async (user) => {
        console.log('handleUserSelect called with user:', user);
        try {
            if (user.admin) {
                console.log('Admin user selected, showing password modal');
                setSelectedUser(user);
                setIsPasswordModalVisible(true);
            } else {
                console.log('Non-admin user selected, attempting direct login without password');
                
                // Para usuarios no administradores, iniciar sesión directamente sin contraseña
                setLoading(true);
                const result = await login(user.username, '');
                console.log('Login result:', result);
                
                if (!result.success) {
                    Alert.alert('Error', result.error || 'No se pudo iniciar sesión');
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error in handleUserSelect:', error);
            Alert.alert('Error', 'Ocurrió un error al seleccionar el usuario');
            setLoading(false);
        }
    };

    const handleAdminLogin = async () => {
        console.log('handleAdminLogin called');
        if (!password) {
            Alert.alert('Error', 'Por favor, introduce la contraseña');
            return;
        }

        try {
            setLoading(true);
            console.log('Attempting admin login for:', selectedUser.username);
            const result = await login(selectedUser.username, password);
            console.log('Admin login result:', result);
            if (result.success) {
                setPassword('');
                setIsPasswordModalVisible(false);
            } else {
                Alert.alert('Error', result.error || 'Contraseña incorrecta');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            Alert.alert('Error', 'No se pudo iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (user) => {
        if (!adminUser) {
            Alert.alert('Error', 'No se encontró un usuario administrador para validar la eliminación');
            return;
        }
        
        setUserToDelete(user);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteUser = async () => {
        if (!adminPassword) {
            Alert.alert('Error', 'Por favor, introduce la contraseña de administrador');
            return;
        }

        try {
            setLoading(true);
            
            // Verificar la contraseña del administrador
            const loginResult = await apiService.users.login(adminUser.username, adminPassword);
            
            if (!loginResult?.data) {
                Alert.alert('Error', 'Contraseña de administrador incorrecta');
                setLoading(false);
                return;
            }
            
            // Eliminar el usuario
            await apiService.users.deleteUser(userToDelete.id, true);
            
            // Recargar la lista de usuarios
            await loadUsers();
            
            // Cerrar el modal y limpiar estados
            setIsDeleteModalVisible(false);
            setAdminPassword('');
            setUserToDelete(null);
            
            Alert.alert('Éxito', 'Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error deleting user:', error);
            Alert.alert('Error', 'No se pudo eliminar el usuario');
        } finally {
            setLoading(false);
        }
    };

    // Nueva función para manejar la selección de usuario para configuración
    const handleUserSelectForSettings = (user) => {
        setSelectedUserForSettings(user);
        if (user.admin) {
            // Si es admin, pedir contraseña
            setIsSettingsPasswordModalVisible(true);
        } else {
            // Si no es admin, ir directamente a configuración
            navigateToSettings(user);
        }
    };

    // Función para validar la contraseña del admin para la configuración
    const handleAdminSettingsLogin = async () => {
        if (!settingsPassword) {
            Alert.alert('Error', 'Por favor, introduce la contraseña');
            return;
        }

        try {
            setLoading(true);
            // Verificar contraseña del admin
            const loginResult = await apiService.users.login(selectedUserForSettings.username, settingsPassword);
            
            if (loginResult?.data) {
                // Contraseña correcta, navegar a configuración
                setSettingsPassword('');
                setIsSettingsPasswordModalVisible(false);
                setIsSettingsModalVisible(false);
                navigateToSettings(selectedUserForSettings);
            } else {
                Alert.alert('Error', 'Contraseña incorrecta');
            }
        } catch (error) {
            console.error('Error validando contraseña:', error);
            Alert.alert('Error', 'No se pudo validar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    // Función para navegar a la pantalla de configuración
    const navigateToSettings = (user) => {
        console.log('Navigating to Settings with user:', JSON.stringify(user));
        // Cerrar los modales
        setIsSettingsModalVisible(false);
        setIsSettingsPasswordModalVisible(false);
        
        // Intentar navegar a Settings directamente
        try {
            navigation.navigate('Settings', { 
                user: {
                    id: user.id,
                    username: user.username,
                    admin: user.admin,
                    points: user.points || 0
                } 
            });
            console.log('Navigation call completed');
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'No se pudo navegar a la configuración');
        }
    };

    const renderUserItem = ({ item }) => {
        if (!item || !item.id) {
            console.log('Invalid user item:', item);
            return null;
        }
        
        return (
            <TouchableOpacity 
                onPress={() => {
                    console.log('User card pressed:', item);
                    handleUserSelect(item);
                }}
                style={styles.userCardContainer}
                activeOpacity={0.7}
                disabled={loading}
            >
                <UserCard 
                    user={item} 
                    onDeleteUser={!item.admin ? handleDeleteUser : null}
                />
            </TouchableOpacity>
        );
    };

    const renderRegistrationCard = () => (
        <TouchableOpacity 
            style={styles.registrationCard}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
        >
            <View style={styles.registrationContent}>
                <Ionicons name="person-add" size={32} color="#000" />
                <Text style={styles.registrationText}>Registrar nuevo usuario</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Task Heroes</Text>
                <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => setIsSettingsModalVisible(true)}
                >
                    <Ionicons name="settings-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
            
            <StyledFlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={item => item?.id?.toString() || Math.random().toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
                    </View>
                )}
                ListFooterComponent={renderRegistrationCard}
            />

            {/* Modal para login de administrador */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPasswordModalVisible}
                onRequestClose={() => setIsPasswordModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Contraseña de Administrador</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsPasswordModalVisible(false);
                                    setPassword('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.loginButton]}
                                onPress={handleAdminLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para confirmar eliminación de usuario */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => {
                    setIsDeleteModalVisible(false);
                    setAdminPassword('');
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Eliminar Usuario</Text>
                        <Text style={styles.modalSubtitle}>
                            Para eliminar a "{userToDelete?.username}", ingresa la contraseña del administrador:
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña de administrador"
                            value={adminPassword}
                            onChangeText={setAdminPassword}
                            secureTextEntry
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsDeleteModalVisible(false);
                                    setAdminPassword('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={confirmDeleteUser}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Eliminar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para seleccionar usuario para configuración */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSettingsModalVisible}
                onRequestClose={() => setIsSettingsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Configuración</Text>
                        <Text style={styles.modalSubtitle}>
                            Selecciona un usuario para gestionar su configuración:
                        </Text>
                        
                        <View style={styles.userListContainer}>
                            {users.map(user => (
                                <TouchableOpacity 
                                    key={user.id} 
                                    style={styles.userSettingsItem}
                                    onPress={() => handleUserSelectForSettings(user)}
                                >
                                    <View style={styles.userSettingsItemContent}>
                                        <View style={styles.userAvatar}>
                                            <Text style={styles.userAvatarText}>
                                                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                            </Text>
                                        </View>
                                        <Text style={styles.userSettingsName}>
                                            {user.username}
                                            {user.admin ? ' (Admin)' : ''}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, {marginTop: 15}]}
                            onPress={() => setIsSettingsModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para pedir contraseña de admin para configuración */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSettingsPasswordModalVisible}
                onRequestClose={() => {
                    setIsSettingsPasswordModalVisible(false);
                    setSettingsPassword('');
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verificación</Text>
                        <Text style={styles.modalSubtitle}>
                            Introduce la contraseña de administrador para continuar:
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            value={settingsPassword}
                            onChangeText={setSettingsPassword}
                            secureTextEntry
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsSettingsPasswordModalVisible(false);
                                    setSettingsPassword('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.loginButton]}
                                onPress={handleAdminSettingsLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Continuar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2F2F2F',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: 40,
        marginBottom: 20,
    },
    settingsButton: {
        position: 'absolute',
        right: 15,
        top: 40,
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
        paddingTop: 40,
    },
    userCardContainer: {
        marginHorizontal: 15,
        marginVertical: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2F2F2F',
    },
    emptyText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
    },
    registrationCard: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    registrationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registrationText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#2F2F2F',
        padding: 20,
        borderRadius: 10,
        width: '85%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#FFF',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#AAA',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E63946',
    },
    loginButton: {
        backgroundColor: '#E0F7FA',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    userListContainer: {
        marginTop: 10,
        marginBottom: 5,
        maxHeight: 300,
    },
    userSettingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },
    userSettingsItemContent: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    userSettingsName: {
        fontSize: 16,
        color: '#333',
    },
});

export default LoginScreen;
