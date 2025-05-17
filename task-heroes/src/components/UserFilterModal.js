import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserFilterModal = ({ visible, onClose, users, selectedUserId, onSelectUser }) => {
  // Filtrar los usuarios para excluir administradores
  const filteredUsers = users.filter(user => !user.admin);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por usuario</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUserId === null && styles.selectedUserItem
            ]}
            onPress={() => {
              onSelectUser(null);
              onClose();
            }}
          >
            <Text style={[
              styles.userName,
              selectedUserId === null && styles.selectedUserName
            ]}>Todos los usuarios</Text>
            {selectedUserId === null && (
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
          
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedUserId === item.id && styles.selectedUserItem
                ]}
                onPress={() => {
                  onSelectUser(item.id);
                  onClose();
                }}
              >
                <Text style={[
                  styles.userName,
                  selectedUserId === item.id && styles.selectedUserName
                ]}>{item.username}</Text>
                {selectedUserId === item.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedUserItem: {
    backgroundColor: '#f0f8ff',
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  selectedUserName: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default UserFilterModal; 