import axios from 'axios';
import ENDPOINTS from "./endpoints";

const BASE_URL = 'http://192.168.1.150:8080/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const apiService = {
    users: {
        login: async (username, password) => {
            try {
                const response = await api.post('/users/login', { username, password });
                return response;
            } catch (error) {
                throw error;
            }
        },

        getUserInfo: async (username) => {
            try {
                const response = await api.get(`/users/${username}`);
                return response;
            } catch (error) {
                throw error;
            }
        },

        getAll: async (userId, isAdmin) => {
            try {
                const response = await api.get(`/users?userId=${userId}&isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        },

        updatePoints: async (userId, points) => {
            try {
                const response = await api.put(`/users/${userId}/points`, { points });
                return response;
            } catch (error) {
                throw error;
            }
        },

        getUser: (id) => api.get(ENDPOINTS.USERS.GET_USER(id)),
        createUser: (userData) => api.post(ENDPOINTS.USERS.CREATE_USER(), userData),
        postLoginUser: (credentials) => api.post(ENDPOINTS.USERS.POST_LOGIN_USER(), credentials),
        putUpdateUser: (id, userData) => api.put(ENDPOINTS.USERS.PUT_UPDATE_USER(id), userData),
        postAddPointsToUser: (id) => api.post(ENDPOINTS.USERS.POST_ADD_POINTS_TO_USER(id)),
        postSubtractPointsFromUser: (id) => api.post(ENDPOINTS.USERS.POST_SUBSTRACT_POINTS_FROM_USER(id)),
        deleteUser: (id, isAdmin) => api.delete(ENDPOINTS.USERS.DELETE_USER(id, isAdmin))
    },

    tasks: {
        getAll: async (userId, isAdmin) => {
            try {
                const response = await api.get(`/tasks?userId=${userId}&isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        },

        getAllCompleted: (userId, isAdmin) => api.get(ENDPOINTS.TASKS.GET_ALL_COMPLETED(userId, isAdmin)),
        getAllIncomplete: (userId, isAdmin) => api.get(ENDPOINTS.TASKS.GET_ALL_INCOMPLETE(userId, isAdmin)),
        getById: (taskId) => api.get(ENDPOINTS.TASKS.GET_BY_ID(taskId)),
        createTask: async (assignedUserId, isAdmin, taskData) => {
            try {
                const payload = {
                    title: taskData.title,
                    description: taskData.description,
                    rewardPoints: taskData.rewardPoints,
                    isDaily: taskData.isDaily
                };
                
                const response = await api.post(`/tasks?assignedUserId=${assignedUserId}&isAdmin=${isAdmin}`, payload);
                return response;
            } catch (error) {
                throw error;
            }
        },
        completeTask: async (taskId, userId, isAdmin) => {
            try {
                // Obtener fecha actual en formato ISO (AAAA-MM-DD)
                const currentDate = new Date().toISOString().split('T')[0];
                
                const response = await api.put(`/tasks/${taskId}/complete?userId=${userId}&isAdmin=${isAdmin}&clientDate=${currentDate}`);
                return response;
            } catch (error) {
                throw error;
            }
        },
        deleteTask: async (taskId, isAdmin) => {
            try {
                const response = await api.delete(`/tasks/${taskId}?isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        },
        checkDailyTasks: async (userId, currentDate) => {
            try {
                const response = await api.get(`/tasks/check-daily?userId=${userId}&currentDate=${currentDate}`);
                return response;
            } catch (error) {
                throw error;
            }
        },
        resetDailyTasksAdmin: async (isAdmin) => {
            try {
                const response = await api.post(`/tasks/reset-daily?isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        }
    },

    rewards: {
        getAll: async (userId, isAdmin) => {
            try {
                const response = await api.get(`/rewards?userId=${userId}&isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        },

        getAllRedeemed: async (userId, isAdmin) => {
            try {
                const response = await api.get(ENDPOINTS.REWARDS.GET_ALL_REDEEMED(userId, isAdmin));
                return response;
            } catch (error) {
                throw error;
            }
        },

        getAllCompleted: (userId, isAdmin) => api.get(ENDPOINTS.REWARDS.GET_ALL_COMPLETED(userId, isAdmin)),
        getAllIncomplete: (userId, isAdmin) => api.get(ENDPOINTS.REWARDS.GET_ALL_INCOMPLETE(userId, isAdmin)),
        getById: (taskId) => api.get(ENDPOINTS.REWARDS.GET_BY_ID(taskId)),
        createReward: async (userId, isAdmin, rewardData) => {
            try {
                const response = await api.post(ENDPOINTS.REWARDS.CREATE_REWARD(userId, isAdmin), rewardData);
                return response;
            } catch (error) {
                throw error;
            }
        },
        redeemReward: async (rewardId, userId, isAdmin) => {
            try {
                const response = await api.put(`/rewards/${rewardId}/redeem?userId=${userId}&isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        },
        deleteReward: async (rewardId, isAdmin) => {
            try {
                const response = await api.delete(`/rewards/${rewardId}?isAdmin=${isAdmin}`);
                return response;
            } catch (error) {
                throw error;
            }
        }
    }
};

export default apiService;