import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RewardCard = ({ reward }) => {
    if (!reward) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{reward.title || 'Sin título'}</Text>
                <View style={styles.statusContainer}>
                    <Ionicons 
                        name={reward.redeemed ? 'checkmark-circle' : 'gift'} 
                        size={20} 
                        color={reward.redeemed ? '#4CAF50' : '#FFA000'} 
                    />
                    <Text style={[
                        styles.status,
                        { color: reward.redeemed ? '#4CAF50' : '#FFA000' }
                    ]}>
                        {reward.redeemed ? 'Canjeada' : 'Disponible'}
                    </Text>
                </View>
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
                {reward.description || 'Sin descripción'}
            </Text>
            
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    <Text style={styles.points}>
                        {reward.price || reward.points || 0} puntos
                    </Text>
                    {reward.assignedUsername && (
                        <View style={styles.userContainer}>
                            <Ionicons name="person" size={14} color="#666" />
                            <Text style={styles.userText}>{reward.assignedUsername}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E0F7FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        paddingTop: 8,
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    points: {
        fontSize: 14,
        color: '#9b5858',
        fontWeight: '600',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    userText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    }
});

export default RewardCard; 