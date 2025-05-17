const ENDPOINTS = {
    USERS: {
        GET_ALL: (userId, isAdmin) =>`/users?userId=${userId}&isAdmin=${isAdmin}`,
        GET_USER: (id) => `/users/${id}`,
        CREATE_USER: () => `/users`,
        POST_LOGIN_USER: () => `/users/login`,
        PUT_UPDATE_USER: (id) => `/users/${id}`,
        POST_ADD_POINTS_TO_USER: (id) => `/users/${id}/add-points`,
        POST_SUBSTRACT_POINTS_FROM_USER: (id) => `/users/${id}/subtract-points`,
        DELETE_USER: (id, isAdmin) => `/users/${id}?isAdmin=${isAdmin}`,
    },
    TASKS: {
        GET_ALL: (userId, isAdmin) =>`/tasks?userId=${userId}&isAdmin=${isAdmin}`,
        GET_ALL_COMPLETED: (userId, isAdmin) =>`/tasks/completed?userId=${userId}&isAdmin=${isAdmin}`,
        GET_ALL_INCOMPLETE: (userId, isAdmin) =>`/tasks/incomplete?userId=${userId}&isAdmin=${isAdmin}`,
        GET_BY_ID: (taskId) => `/tasks/${taskId}`,
        CREATE_TASK: (assignedUserId, isAdmin) => `/tasks?assignedUserId=${assignedUserId}&isAdmin=${isAdmin}`,
        COMPLETE_TASK: (taskId) => `/tasks/${taskId}/complete`,
        DELETE_TASK: (taskId, isAdmin) => `/tasks/${taskId}?isAdmin=${isAdmin}`
    },
    REWARDS: {
        GET_ALL: (userId, isAdmin) =>`/rewards?userId=${userId}&isAdmin=${isAdmin}`,
        GET_ALL_REDEEMED: (userId, isAdmin) =>`/rewards/redeemed?userId=${userId}&isAdmin=${isAdmin}`,
        GET_ALL_INCOMPLETE: (userId, isAdmin) =>`/rewards/available?userId=${userId}&isAdmin=${isAdmin}`,
        GET_BY_ID: (taskId) => `/rewards/${taskId}`,
        CREATE_REWARD: (assignedUserId, isAdmin) => `/rewards?assignedUserId=${assignedUserId}&isAdmin=${isAdmin}`,
        REDEEM_REWARD: (taskId) => `/rewards/${taskId}/redeem`,
        DELETE_REWARD: (taskId, isAdmin) => `/rewards/${taskId}?isAdmin=${isAdmin}`
    }
};

export default ENDPOINTS;