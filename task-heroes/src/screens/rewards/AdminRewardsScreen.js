import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api/apiService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RewardCard from '../../components/RewardCard';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import CreateItemModal from '../../components/CreateItemModal';
import UserFilterModal from '../../components/UserFilterModal';
import StyledFlatList from '../../components/StyledFlatList';

const AdminRewardsScreen = ({ navigation }) => {
    const [rewards, setRewards] = useState([]);
    const [filteredRewards, setFilteredRewards] = useState([]);
    const [showRedeemed, setShowRedeemed] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isUserFilterModalVisible, setIsUserFilterModalVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newReward, setNewReward] = useState({
        title: '',
        description: '',
        points: '',
        assignedUserId: ''
    });
    const { user, isAdmin } = useAuth();
    const [assignedUsernames, setAssignedUsernames] = useState({});
    const [selectedReward, setSelectedReward] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            loadRewards();
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
        if (Array.isArray(rewards)) {
            const filtered = rewards.filter(reward => {
                // Filter by redemption status
                const redemptionMatch = reward && reward.redeemed === showRedeemed;
                
                // Filter by user if a user is selected
                const userMatch = selectedUserId === null || reward.userId === selectedUserId;
                
                return redemptionMatch && userMatch;
            });
            setFilteredRewards(filtered);
        }
    }, [showRedeemed, selectedUserId, rewards]);

    const loadRewards = async () => {
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
            const response = await apiService.rewards.getAll(user.id, isAdmin);
            if (response?.data && Array.isArray(response.data)) {
                const formattedRewards = response.data
                    .filter(reward => reward && typeof reward === 'object')
                    .map(reward => ({
                        ...reward,
                        id: reward.id,
                        redeemed: Boolean(reward.redeemed),
                        points: Number(reward.price || 0),
                        assignedUserId: reward.userId,
                        assignedUsername: usernameMap[reward.userId] || 'Sin asignar'
                    }));
                setRewards(formattedRewards);
            } else {
                setRewards([]);
            }
        } catch (error) {
            console.error('Error loading rewards:', error);
            setError('Error al cargar las recompensas');
            setRewards([]);
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

    const handleCreateReward = async (rewardData) => {
        try {
            const response = await apiService.rewards.createReward(rewardData.assignedUserId, isAdmin, {
                ...rewardData,
                assignedUserId: rewardData.assignedUserId,
                price: parseInt(rewardData.points)
            });
            if (response) {
                await loadUsers();
                await loadRewards();
                setIsCreateModalVisible(false);
            }
        } catch (error) {
            console.error('Error creating reward:', error);
            setError('Error al crear la recompensa');
        }
    };

    const handleRewardPress = (reward) => {
        if (reward && reward.id) {
            setSelectedReward(reward);
            setIsDetailsModalVisible(true);
        }
    };

    const handleDeleteReward = async (rewardId) => {
        try {
            await apiService.rewards.deleteReward(rewardId, isAdmin);
            setRewards(prevRewards => prevRewards.filter(reward => reward && reward.id !== rewardId));
            setIsDetailsModalVisible(false);
        } catch (error) {
            console.error('Error deleting reward:', error);
            setError('Error al eliminar la recompensa');
        }
    };

    const renderRewardItem = ({ item }) => {
        if (!item || !item.id) {
            return null;
        }
        
        return (
            <TouchableOpacity
                onPress={() => handleRewardPress(item)}
                style={styles.rewardItemContainer}
            >
                <RewardCard reward={item} />
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
                        loadRewards();
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
                    style={[styles.filterButton, !showRedeemed && styles.filterButtonActive]}
                    onPress={() => setShowRedeemed(!showRedeemed)}
                >
                    <Text style={[styles.filterButtonText, !showRedeemed && styles.filterButtonTextActive]}>
                        Disponibles
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, showRedeemed && styles.filterButtonActive]}
                    onPress={() => setShowRedeemed(!showRedeemed)}
                >
                    <Text style={[styles.filterButtonText, showRedeemed && styles.filterButtonTextActive]}>
                        Canjeadas
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
                data={filteredRewards}
                renderItem={renderRewardItem}
                keyExtractor={item => item?.id?.toString() || Math.random().toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {showRedeemed ? 'No hay recompensas canjeadas' : 'No hay recompensas disponibles'}
                            {selectedUserId !== null ? ' para este usuario' : ''}
                        </Text>
                    </View>
                )}
            />

            <CreateItemModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateReward}
                type="reward"
                users={users}
            />

            <ItemDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                item={selectedReward}
                onDelete={() => selectedReward && handleDeleteReward(selectedReward.id)}
                type="reward"
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
    rewardItemContainer: {
        marginHorizontal: 15,
        marginVertical: 8,
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
    userFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userFilterIcon: {
        marginRight: 4,
    },
});

export default AdminRewardsScreen;
