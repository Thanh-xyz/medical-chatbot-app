import {
    MOCK_ADMIN,
    MOCK_CLIENTS,
    MOCK_CONVERSATIONS,
    MOCK_MESSAGES,
} from './mockData';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Mutable state (persists within a session)
let _clients = [...MOCK_CLIENTS];
let _conversations = [...MOCK_CONVERSATIONS];
let _messages = { ...MOCK_MESSAGES };
let _convIdCounter = 100;
let _msgIdCounter = 200;

// ─── Client Auth ──────────────────────────────────────────────────────────────
export const loginClientAPI = async ({ email, password }) => {
    await delay();
    const user = _clients.find((u) => u.email === email);
    if (user && password === 'user123') {
        return { user, accessToken: 'mock-client-token', refreshToken: 'mock-refresh-client' };
    }
    throw { response: { data: { message: 'Invalid email or password.' } } };
};

export const registerClientAPI = async ({ fullName, email, password }) => {
    await delay();
    if (_clients.find((u) => u.email === email)) {
        throw { response: { data: { message: 'Email already in use.' } } };
    }
    const newUser = {
        _id: `user_${Date.now()}`,
        fullName,
        email,
        role: 'client',
        isActive: true,
        createdAt: new Date().toISOString(),
    };
    _clients.push(newUser);
    return newUser;
};

export const logoutClientAPI = async () => {
    await delay(200);
    return { message: 'Logged out.' };
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export const loginAdminAPI = async ({ email, password }) => {
    await delay();
    if (email === MOCK_ADMIN.email && password === 'admin123') {
        return { user: MOCK_ADMIN, accessToken: 'mock-admin-token', refreshToken: 'mock-refresh-admin' };
    }
    throw { response: { data: { message: 'Invalid admin credentials.' } } };
};

export const logoutAdminAPI = async () => {
    await delay(200);
    return { message: 'Logged out.' };
};

// ─── Client Account ───────────────────────────────────────────────────────────
export const getClientAccountAPI = async () => {
    await delay();
    return _clients[0];
};

export const updateClientAccountAPI = async ({ fullName }) => {
    await delay();
    _clients[0] = { ..._clients[0], fullName };
    return _clients[0];
};

export const changeClientPasswordAPI = async ({ currentPassword }) => {
    await delay();
    if (currentPassword !== 'user123') {
        throw { response: { data: { message: 'Current password is incorrect.' } } };
    }
    return { message: 'Password updated.' };
};

// ─── Admin Account ────────────────────────────────────────────────────────────
export const getAdminAccountAPI = async () => {
    await delay();
    return MOCK_ADMIN;
};

export const updateAdminAccountAPI = async ({ fullName }) => {
    await delay();
    MOCK_ADMIN.fullName = fullName;
    return MOCK_ADMIN;
};

export const changeAdminPasswordAPI = async ({ currentPassword }) => {
    await delay();
    if (currentPassword !== 'admin123') {
        throw { response: { data: { message: 'Current password is incorrect.' } } };
    }
    return { message: 'Password updated.' };
};

// ─── Client Conversations ─────────────────────────────────────────────────────
export const getConversationsAPI = async () => {
    await delay();
    // Return only conversations belonging to mock client
    return _conversations.filter((c) => c.user._id === _clients[0]._id);
};

export const createConversationAPI = async () => {
    await delay();
    const newConv = {
        _id: `conv_${++_convIdCounter}`,
        title: 'New conversation',
        user: _clients[0],
        messageCount: 0,
        createdAt: new Date().toISOString(),
    };
    _conversations.unshift(newConv);
    _messages[newConv._id] = [];
    return newConv;
};

export const deleteConversationAPI = async (conversationId) => {
    await delay();
    _conversations = _conversations.filter((c) => c._id !== conversationId);
    delete _messages[conversationId];
    return { message: 'Deleted.' };
};

export const getMessagesAPI = async (conversationId) => {
    await delay();
    return _messages[conversationId] ?? [];
};

export const sendMessageAPI = async (conversationId, content) => {
    await delay(600);

    const userMsg = {
        _id: `msg_${++_msgIdCounter}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
    };

    const botReply = {
        _id: `msg_${++_msgIdCounter}`,
        role: 'assistant',
        content: generateBotReply(content),
        createdAt: new Date().toISOString(),
    };

    if (!_messages[conversationId]) _messages[conversationId] = [];
    _messages[conversationId].push(userMsg, botReply);

    // Update title on first message
    const conv = _conversations.find((c) => c._id === conversationId);
    if (conv && conv.messageCount === 0) {
        conv.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
    }
    if (conv) conv.messageCount += 2;

    return [userMsg, botReply];
};

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const getUsersAPI = async ({ search = '' } = {}) => {
    await delay();
    const filtered = _clients.filter(
        (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );
    return { users: filtered, total: filtered.length };
};

export const getUserByIdAPI = async (userId) => {
    await delay();
    const user = _clients.find((u) => u._id === userId);
    if (!user) throw { response: { data: { message: 'User not found.' } } };
    return user;
};

export const createUserAPI = async (data) => {
    await delay();
    const newUser = { _id: `user_${Date.now()}`, isActive: true, createdAt: new Date().toISOString(), ...data };
    _clients.push(newUser);
    return newUser;
};

export const updateUserAPI = async (userId, data) => {
    await delay();
    const idx = _clients.findIndex((u) => u._id === userId);
    if (idx === -1) throw { response: { data: { message: 'User not found.' } } };
    _clients[idx] = { ..._clients[idx], ...data };
    return _clients[idx];
};

export const deleteUserAPI = async (userId) => {
    await delay();
    _clients = _clients.filter((u) => u._id !== userId);
    return { message: 'Deleted.' };
};

// ─── Admin Conversations ──────────────────────────────────────────────────────
export const getAdminConversationsAPI = async ({ search = '' } = {}) => {
    await delay();
    const filtered = _conversations.filter((c) =>
        (c.title ?? '').toLowerCase().includes(search.toLowerCase())
    );
    return { conversations: filtered, total: filtered.length, totalConversations: filtered.length };
};

export const getAdminConversationByIdAPI = async (id) => {
    await delay();
    const conv = _conversations.find((c) => c._id === id);
    if (!conv) throw { response: { data: { message: 'Not found.' } } };
    return conv;
};

export const deleteAdminConversationAPI = async (id) => {
    await delay();
    _conversations = _conversations.filter((c) => c._id !== id);
    delete _messages[id];
    return { message: 'Deleted.' };
};

export const getAdminMessagesAPI = async (conversationId) => {
    await delay();
    return _messages[conversationId] ?? [];
};

// ─── Simple bot reply generator ───────────────────────────────────────────────
const generateBotReply = (input) => {
    const text = input.toLowerCase();
    if (text.includes('headache') || text.includes('migraine')) {
        return 'Headaches can have many causes. Ensure you\'re well-hydrated, rested, and in a low-stress environment. If headaches are frequent or severe, please consult a doctor.';
    }
    if (text.includes('blood pressure') || text.includes('hypertension')) {
        return 'For healthy blood pressure, maintain a low-sodium diet, exercise regularly, limit alcohol, and avoid smoking. Always follow your doctor\'s medication plan.';
    }
    if (text.includes('fever') || text.includes('temperature')) {
        return 'A fever above 38°C (100.4°F) suggests your body is fighting an infection. Rest, stay hydrated, and take paracetamol/ibuprofen if needed. See a doctor if it exceeds 39.5°C or lasts more than 3 days.';
    }
    if (text.includes('cold') || text.includes('flu') || text.includes('cough')) {
        return 'For cold/flu symptoms: rest, drink plenty of fluids, and consider over-the-counter remedies for symptom relief. See a doctor if symptoms worsen or persist beyond 10 days.';
    }
    if (text.includes('stomach') || text.includes('nausea') || text.includes('vomit')) {
        return 'Nausea or stomach discomfort can be caused by eating habits, infections, or stress. Try small sips of water, ginger tea, or bland foods like crackers. If symptoms are severe or include blood, seek medical attention immediately.';
    }
    if (text.includes('sleep') || text.includes('insomnia')) {
        return 'For better sleep: maintain a consistent sleep schedule, avoid screens 1 hour before bed, limit caffeine after noon, and create a dark/cool sleep environment. Chronic insomnia should be discussed with a doctor.';
    }
    if (text.includes('diabetes') || text.includes('blood sugar')) {
        return 'Blood sugar management involves a balanced diet (low in simple carbs), regular exercise, stress management, and adherence to any prescribed medications. Regular monitoring and doctor check-ups are important.';
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        return 'Hello! I\'m MedBot, your AI medical assistant. I can help answer general health questions, but please remember I\'m not a substitute for professional medical advice. What can I help you with today?';
    }
    return 'Thank you for your question. Based on what you\'ve shared, I recommend consulting with a healthcare professional for a proper evaluation. Is there anything more specific you\'d like to know about this condition?';
};
