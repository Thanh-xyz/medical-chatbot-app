import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';

const menuItems = [
    { label: 'Tổng quan', icon: 'grid-outline', route: 'AdminDashboard' },
    { label: 'Tài khoản người dùng', icon: 'people-outline', route: 'AdminUsers' },
    { label: 'Tài khoản quản trị', icon: 'shield-outline', route: 'AdminAccountList' },
    { label: 'Cuộc hội thoại', icon: 'chatbubbles-outline', route: 'AdminConversations' },
    { label: 'Tin nhắn', icon: 'mail-outline', route: 'AdminMessageList' },
    { label: 'Nhóm quyền', icon: 'key-outline', route: 'AdminGroupPermissions' },
    { label: 'Cài đặt', icon: 'settings-outline', route: 'AdminSetting' },
    { label: 'Thông tin cá nhân', icon: 'person-outline', route: 'AdminAccount' },
];

const AdminSidebar = ({ navigation, activeRoute }) => {
    const { user } = useAuth();
    const initials = user?.displayName?.charAt(0)?.toUpperCase() ?? user?.fullName?.charAt(0)?.toUpperCase() ?? 'A';

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.brandRow}>
                <View style={styles.brandIcon}>
                    <Ionicons name="pulse-outline" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.brandText}>Quản trị MedBot</Text>
                    <Text style={styles.brandSub}>Nền tảng y tế AI</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.closeDrawer()}>
                    <Ionicons name="chevron-back" size={18} color="#64748B" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
                {menuItems.map((item) => {
                    const isActive =
                        activeRoute === item.route ||
                        (item.route === 'AdminUsers' && activeRoute?.startsWith('AdminUser')) ||
                        (item.route === 'AdminConversations' && activeRoute?.startsWith('AdminConversation')) ||
                        (item.route === 'AdminMessageList' && activeRoute === 'AdminMessageList');
                    return (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.menuItem, isActive && styles.menuItemActive]}
                            onPress={() => { navigation.navigate(item.route); navigation.closeDrawer(); }}
                        >
                            <Ionicons name={item.icon} size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
                    ) : (
                        <Text style={styles.userAvatarText}>{initials}</Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{user?.displayName ?? user?.fullName ?? 'Admin'}</Text>
                    <Text style={styles.userRole}>Quản trị viên</Text>
                </View>
            </View>
            <View style={styles.statusBar}>
                <View style={styles.statusIconBox}>
                    <Ionicons name="pulse-outline" size={13} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.statusTitle}>Hệ thống ổn định</Text>
                    <Text style={styles.statusSub}>Tất cả dịch vụ đang hoạt động</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    brandRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: '#1E293B', gap: 10,
    },
    brandIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    brandText: { color: '#F1F5F9', fontSize: 15, fontWeight: '700' },
    brandSub: { color: '#64748B', fontSize: 11, marginTop: 1 },
    closeBtn: { padding: 4 },
    menu: { flex: 1, paddingTop: 8, paddingHorizontal: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, marginVertical: 2 },
    menuItemActive: { backgroundColor: '#2563EB' },
    menuLabel: { color: '#94A3B8', fontSize: 14, marginLeft: 12 },
    menuLabelActive: { color: '#FFFFFF', fontWeight: '600' },
    userRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10,
    },
    userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    userAvatarImage: { width: 32, height: 32, borderRadius: 16 },
    userAvatarText: { color: '#93C5FD', fontSize: 14, fontWeight: '700' },
    userName: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
    userRole: { color: '#64748B', fontSize: 11, marginTop: 1 },
    statusBar: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, borderTopWidth: 1, borderTopColor: '#1E293B',
        backgroundColor: '#0D1B2A', gap: 10,
    },
    statusIconBox: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#052e16', alignItems: 'center', justifyContent: 'center' },
    statusTitle: { color: '#10B981', fontSize: 12, fontWeight: '600' },
    statusSub: { color: '#64748B', fontSize: 10, marginTop: 1 },
});

export default AdminSidebar;
