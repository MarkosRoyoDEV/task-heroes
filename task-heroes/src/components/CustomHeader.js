import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const CustomHeader = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  
  // Actualizar los puntos cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setUserPoints(user.points || 0);
    }
  }, [user, user?.points]);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.avatar} 
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.username}>{user?.username || 'Usuario'}</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.points}>{userPoints} pts</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#9b5858',
    borderBottomWidth: 1,
    borderBottomColor: '#894d4d',
    height: 90,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  points: {
    fontSize: 14,
    color: '#f0f0f0',
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  }
});

export default CustomHeader; 