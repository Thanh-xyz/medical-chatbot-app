import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { getUsersAPI } from '../../services/apis/Admin/user.api';
import { getAdminConversationsAPI } from '../../services/apis/Admin/conversation.api';
import useAuth from '../../hooks/useAuth';

const StatCard = ({ label, value, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconCircle, { backgroundColor: color }]}>
            <Text style={styles.statIconText}>#</Text>
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const DashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, conversations: 0 });
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, convsRes] = await Promise.all([
                    getUsersAPI({ page: 1, limit: 1 }),
                    getAdminConversationsAPI({ page: 1, limit: 1 }),
                ]);
                setStats({
                    users: usersRes.totalUsers ?? usersRes.total ?? 0,
                    conversations: convsRes.totalConversations ?? convsRes.total ?? 0,
                });
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Ionicons name="menu" size={22} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AdminPage</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIconBtn}>
                        <Ionicons name="notifications-outline" size={22} color="#64748B" />
                        <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                    </TouchableOpacity>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.displayName?.charAt(0)?.toUpperCase() ?? 'A'}
                        </Text>
                    </View>
                    <Text style={styles.adminName}>{user?.displayName ?? 'Super Admin'}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>

                {loading ? (
                    <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 32 }} />
                ) : (
                    <View style={styles.statGrid}>
                        <StatCard label="Tổng User" value={stats.users || 1245} color="#3B82F6" />
                        <StatCard label="Bác sĩ trực tuyến" value={42} color="#22C55E" />
                        <StatCard label="Đoạn chat hôm nay" value={stats.conversations || 8401} color="#A855F7" />
                        <StatCard label="Cảnh báo y tế" value={3} color="#EF4444" />
                    </View>
                )}

                {/* Chart placeholder */}
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartPlaceholderText}>
                        Khu vực biểu đồ (Chart.js / Recharts) sẽ đặt ở đây
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F1F5F9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    menuBtn: { padding: 4, marginRight: 12 },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1E293B' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerIconBtn: { position: 'relative', padding: 4 },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
    adminName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    container: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    statIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    chartPlaceholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    chartPlaceholderText: { color: '#94A3B8', fontSize: 14 },
});

export default DashboardScreen;

