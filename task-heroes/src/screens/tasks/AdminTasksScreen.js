import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api/apiService';
import TaskCard from '../../components/TaskCard';
import CreateItemModal from '../../components/CreateItemModal';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import UserFilterModal from '../../components/UserFilterModal';
import StyledFlatList from '../../components/StyledFlatList';
import { Ionicons } from '@expo/vector-icons';

const AdminTasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isUserFilterModalVisible, setIsUserFilterModalVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        points: '',
        assignedUserId: ''
    });
    const { user, isAdmin } = useAuth();
    const [assignedUsernames, setAssignedUsernames] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.id) {
            loadTasks();
            loadUsers();
        }
    }, [user]);

    useEffect(() => {
        if (user && user.id) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => setIsCreateModalVisible(true)}
                        style={{ marginRight: 15 }}
                    >
                        <Ionicons name="add-circle" size={32} color="#fff" />
                    </TouchableOpacity>
                )
            });
        }
    }, [user, navigation]);

    useEffect(() => {
        if (Array.isArray(tasks)) {
            const filtered = tasks.filter(task => {
                // Filter by completion status
                const completionMatch = task && task.completed === showCompleted;
                
                // Filter by user if a user is selected
                const userMatch = selectedUserId === null || task.assignedUserId === selectedUserId;
                
                return completionMatch && userMatch;
            });
            setFilteredTasks(filtered);
        }
    }, [showCompleted, selectedUserId, tasks]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const usersResponse = await apiService.users.getAll(user.id, isAdmin);
            let usernameMap = {};
            if (usersResponse?.data && Array.isArray(usersResponse.data)) {
                setUsers(usersResponse.data);
                usersResponse.data.forEach(u => {
                    if (u && u.id) usernameMap[u.id] = u.username || 'Usuario sin nombre';
                });
                setAssignedUsernames(usernameMap);
            }
            const response = await apiService.tasks.getAll(user.id, isAdmin);
            if (response?.data && Array.isArray(response.data)) {
                const formattedTasks = response.data
                    .filter(task => task && typeof task === 'object')
                    .map(task => ({
                        ...task,
                        id: task.id,
                        completed: Boolean(task.completed),
                        points: Number(task.rewardPoints || 0),
                        assignedUserId: task.assignedUserId,
                        assignedUsername: usernameMap[task.assignedUserId] || 'Sin asignar'
                    }));
                setTasks(formattedTasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            setError('Error al cargar las tareas');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await apiService.users.getAll(user.id, isAdmin);
            if (response?.data && Array.isArray(response.data)) {
                setUsers(response.data);
                const usernameMap = {};
                response.data.forEach(user => {
                    if (user && user.id) {
                        usernameMap[user.id] = user.username || 'Usuario sin nombre';
                    }
                });
                setAssignedUsernames(usernameMap);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            console.log('Creating task with data:', taskData);
            
            const isDaily = Boolean(taskData.isDaily);
            console.log('isDaily value after conversion:', isDaily);
            
            const response = await apiService.tasks.createTask(taskData.assignedUserId, isAdmin, {
                title: taskData.title,
                description: taskData.description,
                rewardPoints: parseInt(taskData.points),
                isDaily: isDaily  // Usamos el valor convertido a booleano
            });
            
            if (response) {
                await loadUsers();
                await loadTasks();
                setIsCreateModalVisible(false);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            setError('Error al crear la tarea');
        }
    };

    const handleTaskPress = (task) => {
        if (task && task.id) {
            setSelectedTask(task);
            setIsDetailsModalVisible(true);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await apiService.tasks.deleteTask(taskId, isAdmin);
            setTasks(prevTasks => prevTasks.filter(task => task && task.id !== taskId));
            setIsDetailsModalVisible(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            setError('Error al eliminar la tarea');
        }
    };

    const renderTaskItem = ({ item }) => {
        if (!item || !item.id) {
            console.log('Invalid task item:', item);
            return null;
        }
        
        return (
            <TouchableOpacity
                onPress={() => handleTaskPress(item)}
                style={styles.taskItemContainer}
            >
                <TaskCard task={item} />
            </TouchableOpacity>
        );
    };

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
    };

    const getSelectedUserName = () => {
        if (selectedUserId === null) return "Todos";
        const selectedUser = users.find(u => u.id === selectedUserId);
        return selectedUser ? selectedUser.username : "Usuario";
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
                    onPress={() => setShowCompleted(!showCompleted)}
                >
                    <Text style={[styles.filterButtonText, !showCompleted && styles.filterButtonTextActive]}>
                        Pendiente
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, showCompleted && styles.filterButtonActive]}
                    onPress={() => setShowCompleted(!showCompleted)}
                >
                    <Text style={[styles.filterButtonText, showCompleted && styles.filterButtonTextActive]}>
                        Completado
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, styles.userFilterButton, selectedUserId !== null && styles.filterButtonActive]}
                    onPress={() => setIsUserFilterModalVisible(true)}
                >
                    <Ionicons 
                        name="person" 
                        size={16} 
                        color={selectedUserId !== null ? "#fff" : "#666"} 
                        style={styles.userFilterIcon} 
                    />
                    <Text 
                        style={[
                            styles.filterButtonText, 
                            selectedUserId !== null && styles.filterButtonTextActive
                        ]} 
                        numberOfLines={1}
                    >
                        {getSelectedUserName()}
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
                            {showCompleted ? 'No hay tareas en estado completado' : 'No hay tareas pendientes'}
                            {selectedUserId !== null ? ' para este usuario' : ''}
                        </Text>
                    </View>
                )}
            />

            <CreateItemModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateTask}
                type="task"
                users={users}
            />

            <ItemDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                item={selectedTask}
                onDelete={() => selectedTask && handleDeleteTask(selectedTask.id)}
                type="task"
                isUserView={false}
            />

            <UserFilterModal
                visible={isUserFilterModalVisible}
                onClose={() => setIsUserFilterModalVisible(false)}
                users={users}
                selectedUserId={selectedUserId}
                onSelectUser={handleUserSelect}
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
        backgroundColor: '#3B9AE1',
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
    taskItemContainer: {
        padding: 10,
    },
    userFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userFilterIcon: {
        marginRight: 4,
    },
});

export default AdminTasksScreen;
