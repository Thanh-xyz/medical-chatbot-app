import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Admin/DashboardScreen';
import UserListScreen from '../screens/Admin/UserListScreen';
import UserDetailScreen from '../screens/Admin/UserDetailScreen';
import UserEditScreen from '../screens/Admin/UserEditScreen';
import ConversationListScreen from '../screens/Admin/ConversationListScreen';
import ConversationDetailScreen from '../screens/Admin/ConversationDetailScreen';
import MessageListScreen from '../screens/Admin/MessageListScreen';
import AdminSettingScreen from '../screens/Admin/AdminSettingScreen';
import AdminAccountScreen from '../screens/Admin/AdminAccountScreen';
import AdminSidebar from '../components/Admin/Sidebar';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack for user management (detail/edit pushed on top)
const UserStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminUserList" component={UserListScreen} />
        <Stack.Screen name="AdminUserDetail" component={UserDetailScreen} />
        <Stack.Screen name="AdminUserEdit" component={UserEditScreen} />
    </Stack.Navigator>
);

// Stack for conversation management
const ConversationStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminConversationList" component={ConversationListScreen} />
        <Stack.Screen name="AdminConversationDetail" component={ConversationDetailScreen} />
    </Stack.Navigator>
);

const AdminDrawerContent = (props) => {
    const state = props.state;
    const activeRoute = state?.routes?.[state.index]?.name;
    return <AdminSidebar navigation={props.navigation} activeRoute={activeRoute} />;
};

const AdminNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <AdminDrawerContent {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="AdminDashboard" component={DashboardScreen} />
            <Drawer.Screen name="AdminUsers" component={UserStack} />
            <Drawer.Screen name="AdminConversations" component={ConversationStack} />
            <Drawer.Screen name="AdminMessageList" component={MessageListScreen} />
            <Drawer.Screen name="AdminSetting" component={AdminSettingScreen} />
            <Drawer.Screen name="AdminAccount" component={AdminAccountScreen} />
        </Drawer.Navigator>
    );
};

export default AdminNavigator;
