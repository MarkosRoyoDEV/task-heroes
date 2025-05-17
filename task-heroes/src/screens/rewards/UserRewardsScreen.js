import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api/apiService';
import TaskCard from '../../components/TaskCard';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import StyledFlatList from '../../components/StyledFlatList';

const UserRewardsScreen = ({ navigation }) => {
    const [rewards, setRewards] = useState([]);
    const [filteredRewards, setFilteredRewards] = useState([]);
    const [showRedeemed, setShowRedeemed] = useState(false);
    const { user, updateUserPoints } = useAuth();
    const [selectedReward, setSelectedReward] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.id) {
            loadRewards();
        }
    }, [user]);

    useEffect(() => {
        if (Array.isArray(rewards)) {
            const filtered = rewards.filter(reward => reward && reward.redeemed === showRedeemed);
            setFilteredRewards(filtered);
        }
    }, [showRedeemed, rewards]);

    const loadRewards = async () => {
        try {
            setLoading(true);
            const response = await apiService.rewards.getAll(user.id, false);
            if (response?.data && Array.isArray(response.data)) {
                const formattedRewards = response.data
                    .filter(reward => reward && typeof reward === 'object')
                    .map(reward => ({
                        ...reward,
                        id: reward.id,
                        redeemed: Boolean(reward.redeemed),
                        points: reward.price || 0 // Mapear price a points para consistencia en la UI
                    }));
                setRewards(formattedRewards);
            } else {
                setRewards([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error loading rewards:', error);
            setError('Error al cargar las recompensas');
            setRewards([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRewardPress = (reward) => {
        if (reward && reward.id) {
            setSelectedReward(reward);
            setIsDetailsModalVisible(true);
        }
    };

    const handleRedeemReward = async (rewardId) => {
        try {
            const rewardToRedeem = rewards.find(r => r.id === rewardId);
            if (!rewardToRedeem) {
                console.error('Reward not found:', rewardId);
                return;
            }
            
            if ((user.points || 0) < (rewardToRedeem.points || 0)) {
                Alert.alert('Puntos insuficientes', 'No tienes suficientes puntos para canjear esta recompensa.');
                return;
            }
            
            const response = await apiService.rewards.redeemReward(rewardId, user.id, false);
            console.log('Respuesta al canjear recompensa:', response.data);
            
            if (response?.data?.points !== undefined) {
                console.log('Actualizando puntos desde respuesta API:', response.data.points);
                updateUserPoints(response.data.points);
            } else {
                console.log('Calculando puntos manualmente');
                const newPoints = Math.max(0, (user.points || 0) - (rewardToRedeem.points || 0));
                console.log('Puntos actuales:', user.points, 'Puntos de recompensa:', rewardToRedeem.points, 'Nuevos puntos:', newPoints);
                updateUserPoints(newPoints);
            }
            
            await loadRewards(); 
            setIsDetailsModalVisible(false);
        } catch (error) {
            console.error('Error redeeming reward:', error);
            Alert.alert('Error', 'No se pudo canjear la recompensa. Inténtalo nuevamente.');
        }
    };

    const renderRewardItem = ({ item }) => {
        if (!item || !item.id) {
            console.log('Invalid reward item:', item);
            return null;
        }
        
        return (
            <TouchableOpacity onPress={() => handleRewardPress(item)}>
                <TaskCard
                    task={item}
                    isUserView={true}
                    status={item.redeemed}
                    type="reward"
                />
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
            </View>

            <StyledFlatList
                data={filteredRewards}
                renderItem={renderRewardItem}
                keyExtractor={item => item?.id?.toString() || Math.random().toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {showRedeemed ? 'No hay recompensas canjeadas' : 'No hay recompensas disponibles'}
                        </Text>
                    </View>
                )}
            />

            <ItemDetailsModal
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
                item={selectedReward}
                type="reward"
                isUserView={true}
                onRedeem={handleRedeemReward}
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
        borderBottomWidth: 0 ,
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

export default UserRewardsScreen;
