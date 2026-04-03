import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ChatScreen from '../screens/Client/ChatScreen';
import SettingScreen from '../screens/Client/SettingScreen';
import ClientSidebar from '../components/Client/Sidebar';
import { ChatProvider, useChatContext } from '../store/ChatContext';

const Drawer = createDrawerNavigator();

const ClientDrawerContent = (props) => {
    const { conversations, activeConversation, selectConversation, startNewConversation, removeConversation } = useChatContext();
    return (
        <ClientSidebar
            navigation={props.navigation}
            conversations={conversations}
            activeId={activeConversation?._id}
            onSelect={(conv) => {
                selectConversation(conv);
                props.navigation.closeDrawer();
            }}
            onNew={() => {
                startNewConversation();
                props.navigation.closeDrawer();
            }}
            onDelete={removeConversation}
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
    }, []);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <ClientDrawerContent {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="Chat" component={ChatScreen} />
            <Drawer.Screen name="ClientSettings" component={SettingScreen} />
        </Drawer.Navigator>
    );
};

const ClientNavigator = () => (
    <ChatProvider>
        <ClientDrawer />
    </ChatProvider>
);

export default ClientNavigator;

