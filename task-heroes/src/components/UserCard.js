import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserCard = ({ user, onDeleteUser }) => {
    if (!user) return null;

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{user.username || 'Usuario sin nombre'}</Text>
                <View style={styles.userDetails}>
                    {!user.admin && (
                        <View style={styles.pointsContainer}>
                            <Ionicons name="star" size={16} color="#FFC107" />
                            <Text style={styles.pointsText}>{user.points || 0} pts</Text>
                        </View>
                    )}
                    {user.admin && (
                        <View style={styles.adminContainer}>
                            <Ionicons name="shield" size={16} color="#FF5722" />
                            <Text style={styles.adminText}>Admin</Text>
                        </View>
                    )}
                </View>
            </View>
            {!user.admin && onDeleteUser && (
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => onDeleteUser(user)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F7FA',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '',
        marginBottom: 4,
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    pointsText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    adminContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    adminText: {
        fontSize: 12,
        color: '#FF5722',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#FEF0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default UserCard; 