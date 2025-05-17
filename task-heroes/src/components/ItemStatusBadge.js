import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ItemStatusBadge = ({ status, type }) => {
    const getStatusConfig = () => {
        if (type === 'task') {
            return {
                icon: status ? 'checkmark-circle' : 'time',
                color: status ? '#4CAF50' : '#FFA000',
                text: status ? 'Completada' : 'Pendiente'
            };
        } else {
            return {
                icon: status ? 'gift' : 'gift-outline',
                color: status ? '#2196F3' : '#9C27B0',
                text: status ? 'Canjeada' : 'Disponible'
            };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.container, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    text: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
    }
});

export default ItemStatusBadge; 