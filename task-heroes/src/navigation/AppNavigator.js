import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';
import { navigationRef } from './navigationRef';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserTasksScreen from '../screens/tasks/UserTasksScreen';
import UserRewardsScreen from '../screens/rewards/UserRewardsScreen';
import AdminTasksScreen from '../screens/tasks/AdminTasksScreen';
import AdminRewardsScreen from '../screens/rewards/AdminRewardsScreen';
import SplashScreen from '../screens/SplashScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Crear navegadores
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack de autenticación (no autenticado)
const AuthStackScreen = () => (
    <AuthStack.Navigator initialRouteName="Login">
        <AuthStack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
        />
        <AuthStack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
                title: 'Registro',
                headerStyle: {
                    backgroundColor: '#000',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#fff'
                },
                headerLeft: () => null
            }}
        />
        <AuthStack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
                headerShown: false
            }}
        />
    </AuthStack.Navigator>
);

// Tabs de usuario
const UserTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'UserTasks') {
                    iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'UserRewards') {
                    iconName = focused ? 'gift' : 'gift-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: {
                backgroundColor: '#9b5858',
                borderTopColor: '#9b5858',
                borderTopWidth: 0,
            },
            tabBarLabelStyle: {
                color: '#fff'
            },
            header: () => <CustomHeader />
        })}
    >
        <Tab.Screen 
            name="UserTasks" 
            component={UserTasksScreen}
            options={{ 
                title: 'Mis Tareas',
            }}
        />
        <Tab.Screen 
            name="UserRewards" 
            component={UserRewardsScreen}
            options={{ 
                title: 'Mis Recompensas',
            }}
        />
    </Tab.Navigator>
);

// Stack de usuario (autenticado, no admin)
const UserStackScreen = () => (
    <UserStack.Navigator>
        <UserStack.Screen 
            name="UserTabsScreen" 
            component={UserTabs}
            options={{ headerShown: false }}
        />
        <UserStack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
                headerShown: false
            }}
        />
    </UserStack.Navigator>
);

const TasksHeaderTitle = () => (
    <View style={styles.headerContainer}>
        <View style={styles.tasksTitleWrapper}>
            <Text style={styles.headerTitleText}>
                Administrar Tareas
            </Text>
        </View>
    </View>
);

const RewardsHeaderTitle = () => (
    <View style={styles.headerContainer}>
        <View style={styles.rewardsTitleWrapper}>
            <Text style={styles.headerTitleText}>
                Administrar Recompensas
            </Text>
        </View>
    </View>
);

const AdminTabs = () => {
    const { logout } = useAuth();
    
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'AdminTasks') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'AdminRewards') {
                        iconName = focused ? 'gift' : 'gift-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#aaa',
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#000',
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    color: '#fff'
                },
                headerStyle: {
                    backgroundColor: '#000',
                },
                headerTintColor: '#fff',
                headerLeft: () => (
                    <TouchableOpacity 
                        onPress={logout}
                        style={{ 
                            marginLeft: 15,
                            width: 30,
                        }}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <View style={{ width: 30, marginRight: 15 }} />
                ),
            })}
        >
            <Tab.Screen 
                name="AdminTasks" 
                component={AdminTasksScreen}
                options={{ 
                    headerTitle: () => <TasksHeaderTitle />,
                    headerShown: true,
                    title: 'Tareas'
                }}
            />
            <Tab.Screen 
                name="AdminRewards" 
                component={AdminRewardsScreen}
                options={{ 
                    headerTitle: () => <RewardsHeaderTitle />,
                    headerShown: true,
                    title: 'Recompensas'
                }}
            />
        </Tab.Navigator>
    );
};

// Stack de admin (autenticado, admin)
const AdminStackScreen = () => {
    return (
        <AdminStack.Navigator>
            <AdminStack.Screen 
                name="AdminTabsScreen" 
                component={AdminTabs}
                options={{ headerShown: false }}
            />
            <AdminStack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                    headerShown: false
                }}
            />
        </AdminStack.Navigator>
    );
};

const AppNavigator = () => {
    const { user, isAdmin, isAuthenticated, logout, isLoggingOut, loading } = useAuth();
    const [showSplash, setShowSplash] = React.useState(true);

    // Efecto para controlar la visualización del SplashScreen al inicio
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000); // Mostrar el splash por 2 segundos
        
        return () => clearTimeout(timer);
    }, []);

    // Mostrar SplashScreen siempre al inicio o mientras se comprueba la autenticación
    if (showSplash || loading) {
        return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator>
                    <Stack.Screen 
                        name="Splash" 
                        component={SplashScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? (
                isAdmin ? <AdminStackScreen /> : <UserStackScreen />
            ) : (
                <AuthStackScreen />
            )}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    headerTitleText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff',
    },
    tasksTitleWrapper: {
        marginLeft: 2,
    },
    rewardsTitleWrapper: {
        marginLeft: 50,
        marginTop: 18,
    },
});

export default AppNavigator;