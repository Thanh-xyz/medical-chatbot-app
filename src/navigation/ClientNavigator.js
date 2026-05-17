import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ChatScreen from '../screens/Client/ChatScreen';
import SettingScreen from '../screens/Client/SettingScreen';
import UpgradeScreen from '../screens/Client/UpgradeScreen';
import UsagePolicyScreen from '../screens/Client/UsagePolicyScreen';
import PrivacyPolicyScreen from '../screens/Client/PrivacyPolicyScreen';
import ClientSidebar from '../components/Client/Sidebar';
import { ChatProvider, useChatContext } from '../store/ChatContext';

const Drawer = createDrawerNavigator();

const ClientDrawerContent = (props) => {
    const {
        conversations,
        activeConversation,
        loadingConversations,
        error,
        selectConversation,
        startNewConversation,
        removeConversation,
        renameConversation
    } = useChatContext();
    return (
        <ClientSidebar
            navigation={props.navigation}
            conversations={conversations}
            activeId={activeConversation?._id}
            loading={loadingConversations}
            error={error}
            onSelect={(conv) => {
                selectConversation(conv);
                props.navigation.closeDrawer();
            }}
            onNew={() => {
                startNewConversation();
                props.navigation.closeDrawer();
            }}
            onDelete={removeConversation}
            onRename={renameConversation}
            onSettings={() => {
                props.navigation.navigate('ClientSettings');
                props.navigation.closeDrawer();
            }}
        />
    );
};

const ClientDrawer = () => {
    const { fetchConversations } = useChatContext();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <ClientDrawerContent {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="Chat" component={ChatScreen} />
            <Drawer.Screen name="ClientSettings" component={SettingScreen} />
            <Drawer.Screen name="ClientUpgrade" component={UpgradeScreen} />
            <Drawer.Screen name="ClientUsagePolicy" component={UsagePolicyScreen} />
            <Drawer.Screen name="ClientPrivacyPolicy" component={PrivacyPolicyScreen} />
        </Drawer.Navigator>
    );
};

const ClientNavigator = () => (
    <ChatProvider>
        <ClientDrawer />
    </ChatProvider>
);

export default ClientNavigator;
