import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: 'AdminDashboard' },
    { label: 'Users', icon: 'people-outline', route: 'AdminUsers' },
    { label: 'Conversations', icon: 'chatbubbles-outline', route: 'AdminConversations' },
    { label: 'Messages', icon: 'mail-outline', route: 'AdminMessageList' },
    { label: 'Settings', icon: 'settings-outline', route: 'AdminSetting' },
    { label: 'My Account', icon: 'person-circle-outline', route: 'AdminAccount' },
];

const AdminSidebar = ({ navigation, activeRoute }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Brand */}
            <View style={styles.brandRow}>
                <View style={styles.brandIcon}>
                    <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.brandText}>MedBot</Text>
                <TouchableOpacity
                    style={styles.collapseBtn}
                    onPress={() => navigation.closeDrawer()}
                >
                    <Ionicons name="chevron-back" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
                {menuItems.map((item) => {
                    const isActive =
                        activeRoute === item.route ||
                        (item.route === 'AdminUsers' && activeRoute?.startsWith('AdminUser')) ||
                        (item.route === 'AdminConversations' && activeRoute?.startsWith('AdminConversation'));
                    return (
                        <TouchableOpacity
                            key={item.route}
                            style={[styles.menuItem, isActive && styles.menuItemActive]}
                            onPress={() => navigation.navigate(item.route)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={18}
                                color={isActive ? '#FFFFFF' : '#94A3B8'}
                            />
                            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    brandIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    brandText: {
        flex: 1,
        color: '#F1F5F9',
        fontSize: 17,
        fontWeight: '700',
    },
    collapseBtn: { padding: 4 },
    menu: { flex: 1, paddingTop: 12, paddingHorizontal: 8 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginVertical: 2,
    },
    menuItemActive: {
        backgroundColor: '#2563EB',
    },
    menuLabel: {
        color: '#94A3B8',
        fontSize: 15,
        marginLeft: 12,
    },
    menuLabelActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default AdminSidebar;
