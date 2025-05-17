import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator, AppState } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api/apiService';
import TaskCard from '../../components/TaskCard';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import StyledFlatList from '../../components/StyledFlatList';

const UserTasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const { user, updateUserPoints } = useAuth();
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Cargar las tareas cuando el usuario cambia
    useEffect(() => {
        if (user && user.id) {
            loadTasks();
        }
    }, [user]);

    useEffect(() => {
        if (Array.isArray(tasks)) {
            const filtered = tasks.filter(task => task && task.completed === showCompleted);
            setFilteredTasks(filtered);
        }
    }, [showCompleted, tasks]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const response = await apiService.tasks.getAll(user.id, false);
            if (response?.data && Array.isArray(response.data)) {
                const formattedTasks = response.data
                    .filter(task => task && typeof task === 'object')
                    .map(task => ({
                        ...task,
                        id: task.id,
                        completed: Boolean(task.completed),
                        daily: task.daily !== null ? Boolean(task.daily) : false, // Asegurar que daily tenga un valor
                        points: task.rewardPoints || 0 // Asegurarnos de mapear rewardPoints a points para el UI
                    }));
                setTasks(formattedTasks);
            } else {
                setTasks([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error loading tasks:', error);
            setError('Error al cargar las tareas');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskPress = (task) => {
        if (task && task.id) {
            setSelectedTask(task);
            setIsDetailsModalVisible(true);
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            setLoading(true);
            const response = await apiService.tasks.completeTask(taskId, user.id, false);
            
            if (response?.data) {
                console.log('Respuesta al completar tarea:', response.data);
                
                // Usar los puntos devueltos por el servidor si están disponibles
                if (response.data.points !== undefined) {
                    console.log('Actualizando puntos con valor del servidor:', response.data.points);
                    updateUserPoints(response.data.points);
                } else {
                    // Calcular puntos manualmente si el servidor no los devuelve
                    console.log('Calculando puntos manualmente');
                    updateUserPoints(user.points + (selectedTask?.points || 0));
                }
                
                // Cerrar modal primero
                setIsDetailsModalVisible(false);
                
                // Esperar un poco antes de actualizar la lista para asegurarnos que la BD se actualizó
                setTimeout(async () => {
                    await loadTasks();
                    setLoading(false);
                    
                    // Cambiar automáticamente a la pestaña de completadas
                    setShowCompleted(true);
                }, 500);
            } else {
                setLoading(false);
                Alert.alert('Error', 'No se recibió respuesta al completar la tarea');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'No se pudo completar la tarea: ' + (error.message || 'Error desconocido'));
        }
    };

    const renderTaskItem = ({ item }) => {
        if (!item || !item.id) return null;
        
        return (
            <TouchableOpacity
                onPress={() => handleTaskPress(item)}
                style={styles.taskItemContainer}
            >
                <TaskCard task={item} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        loadTasks();
                    }}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, !showCompleted && styles.filterButtonActive]}
                    onPress={() => setShowCompleted(false)}
                >
                    <Text style={[styles.filterButtonText, !showCompleted && styles.filterButtonTextActive]}>
                        Pendiente
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, showCompleted && styles.filterButtonActive]}
                    onPress={() => setShowCompleted(true)}
                >
                    <Text style={[styles.filterButtonText, showCompleted && styles.filterButtonTextActive]}>
                        Completado
                    </Text>
                </TouchableOpacity>
            </View>

            <StyledFlatList
                data={filteredTasks}
                renderItem={renderTaskItem}
                keyExtractor={item => item?.id?.toString() || Math.random().toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {showCompleted ? 'No hay tareas completadas' : 'No hay tareas pendientes'}
                        </Text>
                    </View>
                )}
            />

            <ItemDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                item={selectedTask}
                onComplete={() => selectedTask && handleCompleteTask(selectedTask.id)}
                type="task"
                isUserView={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2f2f2f',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#2f2f2f',
        borderBottomWidth: 0,
        borderBottomColor: '#eee',
    },
    filterButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B6B',
    },
    filterButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF0000',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default UserTasksScreen;
