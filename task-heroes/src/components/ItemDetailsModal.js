import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ItemStatusBadge from './ItemStatusBadge';
import apiService from '../api/apiService';

const ItemDetailsModal = ({ visible, onClose, item, onDelete, onComplete, onRedeem, type, isUserView = false }) => {
    const { isAdmin } = useAuth();
    
    if (!item) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAction = () => {
        if (isUserView) {
            if (type === 'task' && !item.completed) {
                try {
                    onComplete(item.id);
                } catch (error) {
                    // Ignorar error
                }
            } else if (type === 'reward' && !item.redeemed) {
                try {
                    onRedeem(item.id);
                } catch (error) {
                    // Ignorar error
                }
            }
        } else {
            onDelete(item.id);
        }
    };

    const getActionButtonConfig = () => {
        if (isUserView) {
            if (type === 'task') {
                return {
                    label: item.completed ? 'Completada' : 'Marcar como completada',
                    color: item.completed ? '#4CAF50' : '#007AFF',
                    disabled: item.completed
                };
            } else {
                return {
                    label: item.redeemed ? 'Canjeada' : 'Canjear recompensa',
                    color: item.redeemed ? '#2196F3' : '#9C27B0',
                    disabled: item.redeemed
                };
            }
        } else {
            return {
                label: 'Eliminar',
                color: '#FF5252',
                disabled: false
            };
        }
    };

    const buttonConfig = getActionButtonConfig();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{item.title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Descripción</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detalles</Text>
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Puntos:</Text>
                                    <Text style={styles.detailValue}>{item.points || item.price || 0}</Text>
                                </View>
                                {item.assignedUsername && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Asignado a:</Text>
                                        <Text style={styles.detailValue}>{item.assignedUsername}</Text>
                                    </View>
                                )}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Estado:</Text>
                                    <ItemStatusBadge 
                                        status={type === 'task' ? item.completed : item.redeemed} 
                                        type={type}
                                    />
                                </View>
                                {type === 'task' && item.daily && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Tipo:</Text>
                                        <Text style={styles.detailValue}>Tarea diaria</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {!buttonConfig.disabled && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: buttonConfig.color }]}
                            onPress={handleAction}
                        >
                            <Text style={styles.actionButtonText}>{buttonConfig.label}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    detailsContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        padding: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    actionButton: {
        margin: 15,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ItemDetailsModal; 