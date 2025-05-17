import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CreateItemModal = ({
    visible,
    onClose,
    onSubmit,
    type = 'task',
    users = []
}) => {
    // Filtrar los usuarios para excluir administradores
    const filteredUsers = users.filter(user => !user.admin);
    
    const [item, setItem] = useState({
        title: '',
        description: '',
        points: '',
        assignedUserId: '',
        isDaily: false
    });
    const [showUserSelect, setShowUserSelect] = useState(false);

    const handleSubmit = () => {
        if (!item.title || !item.description || !item.points || !item.assignedUserId) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        onSubmit({
            ...item,
            points: parseInt(item.points),
            assignedUserId: item.assignedUserId,
            isDaily: item.isDaily
        });
    };

    const handleUserSelect = (userId) => {
        const selectedUser = filteredUsers.find(user => user.id === userId);
        setItem(prev => {
            const newItem = {
                ...prev,
                assignedUserId: userId
            };
            return newItem;
        });
        setShowUserSelect(false);
    };

    const getSelectedUserName = () => {
        const selectedUser = filteredUsers.find(user => user.id === item.assignedUserId);
        return selectedUser ? selectedUser.username : 'Seleccionar usuario';
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {type === 'task' ? 'Crear Tarea' : 'Crear Recompensa'}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollContent}>
                            <Text style={styles.label}>Título</Text>
                            <TextInput
                                style={styles.input}
                                value={item.title}
                                onChangeText={(text) => setItem({ ...item, title: text })}
                                placeholder="Ingrese el título"
                            />

                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={item.description}
                                onChangeText={(text) => setItem({ ...item, description: text })}
                                placeholder="Ingrese la descripción"
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={styles.label}>
                                {type === 'task' ? 'Puntos de Recompensa' : 'Precio'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={item.points}
                                onChangeText={(text) => setItem({ ...item, points: text })}
                                placeholder="Ingrese los puntos"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Asignar a</Text>
                            <TouchableOpacity 
                                style={styles.userSelect}
                                onPress={() => setShowUserSelect(!showUserSelect)}
                            >
                                <Text style={[
                                    styles.userSelectText,
                                    !item.assignedUserId && styles.placeholderText
                                ]}>
                                    {getSelectedUserName()}
                                </Text>
                                <Ionicons 
                                    name={showUserSelect ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#666" 
                                />
                            </TouchableOpacity>

                            {showUserSelect && (
                                <View style={styles.usersContainer}>
                                    {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
                                        <TouchableOpacity
                                            key={user.id}
                                            style={[
                                                styles.userOption,
                                                item.assignedUserId === user.id && styles.selectedUser
                                            ]}
                                            onPress={() => handleUserSelect(user.id)}
                                        >
                                            <Text style={[
                                                styles.userOptionText,
                                                item.assignedUserId === user.id && styles.selectedUserText
                                            ]}>
                                                {user.username || 'Usuario sin nombre'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {type === 'task' && (
                                <View style={styles.checkboxContainer}>
                                    <TouchableOpacity
                                        style={[styles.checkbox, item.isDaily && styles.checkboxChecked]}
                                        onPress={() => setItem({...item, isDaily: !item.isDaily})}
                                    >
                                        {item.isDaily && <Ionicons name="checkmark" size={18} color="#fff" />}
                                    </TouchableOpacity>
                                    <Text style={styles.checkboxLabel}>Tarea diaria (se reinicia cada día)</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>
                                    {type === 'task' ? 'Crear Tarea' : 'Crear Recompensa'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
    },
    scrollContent: {
        padding: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    userSelect: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    userSelectText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    usersContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        maxHeight: 200,
    },
    userOption: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedUser: {
        backgroundColor: '#007AFF',
    },
    userOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedUserText: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: '#3B9AE1',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
    },
});

export default CreateItemModal; 