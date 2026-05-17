import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { getUsersAPI } from '../../services/apis/Admin/user.api';
import { getAdminConversationsAPI } from '../../services/apis/Admin/conversation.api';
import { getAllMessagesAPI } from '../../services/apis/Admin/message.api';
import { getBIDashboardsAPI, getBIGuestTokenAPI } from '../../services/apis/Admin/bi.api';
import useAuth from '../../hooks/useAuth';
import { useSettings } from '../../store/SettingsContext';

const AdminDropdown = ({ visible, onClose, user, isDarkMode, toggleDarkMode, navigation, onLogout }) => {
    if (!visible) return null;
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const rowHover = isDarkMode ? '#0F172A' : '#F8FAFC';
    const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'A';

    const go = (route) => { onClose(); navigation.navigate(route); };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={dd.overlay} />
            </TouchableWithoutFeedback>
            <View style={[dd.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={dd.userRow}>
                    <View style={dd.avatar}>
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={dd.avatarImage} />
                        ) : (
                            <Text style={dd.avatarText}>{initials}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[dd.userName, { color: textPrimary }]} numberOfLines={1}>{user?.fullName ?? 'Admin'}</Text>
                        <Text style={[dd.userEmail, { color: textMuted }]} numberOfLines={1}>{user?.email ?? ''}</Text>
                    </View>
                </View>

                <View style={[dd.divider, { backgroundColor: borderColor }]} />
                <TouchableOpacity style={[dd.row, { backgroundColor: rowHover }]} onPress={() => go('AdminAccount')}>
                    <View style={[dd.rowIcon, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="person-outline" size={15} color="#2563EB" />
                    </View>
                    <Text style={[dd.rowLabel, { color: textPrimary }]}>Thông tin cá nhân</Text>
                    <Ionicons name="chevron-forward" size={14} color={textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={[dd.row, { backgroundColor: rowHover }]} onPress={() => go('AdminSetting')}>
                    <View style={[dd.rowIcon, { backgroundColor: '#F0FDF4' }]}>
                        <Ionicons name="settings-outline" size={15} color="#10B981" />
                    </View>
                    <Text style={[dd.rowLabel, { color: textPrimary }]}>Cài đặt hệ thống</Text>
                    <Ionicons name="chevron-forward" size={14} color={textMuted} />
                </TouchableOpacity>

                <View style={[dd.divider, { backgroundColor: borderColor }]} />
                <TouchableOpacity style={[dd.row, { backgroundColor: rowHover }]} onPress={() => { toggleDarkMode(); }}>
                    <View style={[dd.rowIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#FEF3C7' }]}>
                        <Ionicons name={isDarkMode ? 'moon-outline' : 'sunny-outline'} size={15} color={isDarkMode ? '#93C5FD' : '#D97706'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[dd.rowLabel, { color: textPrimary }]}>Chế độ hiển thị</Text>
                        <Text style={[dd.rowSub, { color: textMuted }]}>Đang dùng: {isDarkMode ? 'Tối' : 'Sáng'}</Text>
                    </View>
                    <View style={[dd.modeBadge, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                        <Text style={[dd.modeBadgeText, { color: textMuted }]}>{isDarkMode ? 'Tối' : 'Sáng'}</Text>
                    </View>
                </TouchableOpacity>

                <View style={[dd.divider, { backgroundColor: borderColor }]} />
                <TouchableOpacity style={[dd.row, { backgroundColor: rowHover }]} onPress={onLogout}>
                    <View style={[dd.rowIcon, { backgroundColor: '#FEF2F2' }]}>
                        <Ionicons name="log-out-outline" size={15} color="#EF4444" />
                    </View>
                    <Text style={[dd.rowLabel, { color: '#EF4444' }]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const dd = StyleSheet.create({
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    card: {
        position: 'absolute', top: 70, right: 12,
        width: 260, borderRadius: 14, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
        overflow: 'hidden',
    },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImage: { width: 38, height: 38, borderRadius: 19 },
    avatarText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
    userName: { fontSize: 13, fontWeight: '700' },
    userEmail: { fontSize: 12, marginTop: 1 },
    divider: { height: 1, marginVertical: 2 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
    rowIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
    rowSub: { fontSize: 11, marginTop: 1 },
    modeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    modeBadgeText: { fontSize: 11, fontWeight: '600' },
});

const StatCard = ({ icon, iconBg, iconColor, label, value, trend, trendLabel, isDark }) => {
    const cardBg = isDark ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
    const textMuted = isDark ? '#94A3B8' : '#64748B';
    const borderC = isDark ? '#334155' : '#F1F5F9';
    return (
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderC }]}>
            <View style={styles.statCardTop}>
                <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                {trend && (
                    <View style={styles.trendRow}>
                        <Ionicons name="trending-up-outline" size={11} color="#10B981" />
                        <Text style={styles.trendText}>{trend}</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.statLabel, { color: textMuted }]}>{label}</Text>
            <Text style={[styles.statValue, { color: textPrimary }]}>{value}</Text>
            <Text style={[styles.statSub, { color: textMuted }]}>{trendLabel}</Text>
        </View>
    );
};

const ProgressBar = ({ label, pct, color, isDark }) => {
    const textMuted = isDark ? '#94A3B8' : '#64748B';
    const barBg = isDark ? '#334155' : '#F1F5F9';
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
    return (
        <View style={styles.progRow}>
            <View style={styles.progHeader}>
                <Text style={[styles.progLabel, { color: textMuted }]}>{label}</Text>
                <Text style={[styles.progPct, { color: textMuted }]}>{safePct}%</Text>
            </View>
            <View style={[styles.progBg, { backgroundColor: barBg }]}>
                <View style={[styles.progFill, { width: `${safePct}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

const BI_DASHBOARD_FALLBACKS = [
    { key: 'system', title: 'Tổng quan hệ thống' },
    { key: 'chatbot', title: 'Hiệu năng chatbot' },
    { key: 'safety', title: 'An toàn y tế' },
    { key: 'models', title: 'Quản trị mô hình AI' },
];

const getTotalFromListResponse = (response, listKey) => {
    if (!response) return null;
    return response.pagination?.totalItems
        ?? response.pagination?.total
        ?? response.totalItems
        ?? response.total
        ?? response.totalUsers
        ?? response.totalConversations
        ?? response[listKey]?.length
        ?? response.data?.length
        ?? null;
};

const toDateTime = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

const formatEventTime = (value) => {
    const date = toDateTime(value);
    if (!date) return '';
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
    });
};

const DashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshingBIKey, setRefreshingBIKey] = useState(null);
    const [stats, setStats] = useState({
        users: null,
        conversations: null,
        messages: null,
        aiMessages: null,
        userMessages: null,
        biDashboards: null,
        trends: {},
        performance: null,
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [biDashboards, setBIDashboards] = useState(BI_DASHBOARD_FALLBACKS);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, handleLogout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const initials = user?.displayName?.charAt(0)?.toUpperCase() ?? user?.fullName?.charAt(0)?.toUpperCase() ?? 'A';

    useEffect(() => {
        (async () => {
            try {
                const [usersRes, convsRes, messagesRes, biRes] = await Promise.allSettled([
                    getUsersAPI({ page: 1, limit: 1 }),
                    getAdminConversationsAPI({ page: 1, limit: 1 }),
                    getAllMessagesAPI({ page: 1, limit: 8 }),
                    getBIDashboardsAPI(),
                ]);
                const usersData = usersRes.status === 'fulfilled' ? usersRes.value : null;
                const convsData = convsRes.status === 'fulfilled' ? convsRes.value : null;
                const messagesData = messagesRes.status === 'fulfilled' ? messagesRes.value : null;
                const messages = messagesData?.messages ?? messagesData?.data ?? [];
                const conversations = convsData?.conversations ?? convsData?.data ?? [];
                const dashboards = biRes.status === 'fulfilled' && biRes.value?.dashboards?.length
                    ? biRes.value.dashboards
                    : BI_DASHBOARD_FALLBACKS;
                const aiMessageCount = messages.filter((msg) => ['assistant', 'bot', 'ai'].includes(msg.role)).length;
                const userMessageCount = messages.filter((msg) => msg.role === 'user').length;
                const sampleCount = Math.max(messages.length, 1);
                const aiRate = Math.round((aiMessageCount / sampleCount) * 100);
                const userRate = Math.round((userMessageCount / sampleCount) * 100);
                const reviewRate = Math.max(0, 100 - aiRate - userRate);
                const activity = [
                    ...messages.map((msg) => ({
                        id: msg._id,
                        type: 'message',
                        createdAt: msg.createdAt,
                        color: msg.role === 'user' ? '#2563EB' : '#10B981',
                        text: `${msg.role === 'user' ? 'Người dùng gửi' : 'AI phản hồi'}: ${(msg.content || '').replace(/\s+/g, ' ').slice(0, 90)}`,
                    })),
                    ...conversations.map((conv) => ({
                        id: conv._id,
                        type: 'conversation',
                        createdAt: conv.createdAt,
                        color: '#8B5CF6',
                        text: `Cuộc hội thoại: ${conv.title || conv._id}`,
                    })),
                ]
                    .sort((a, b) => (toDateTime(b.createdAt)?.getTime() || 0) - (toDateTime(a.createdAt)?.getTime() || 0))
                    .slice(0, 5);

                setStats({
                    users: getTotalFromListResponse(usersData, 'users'),
                    conversations: getTotalFromListResponse(convsData, 'conversations'),
                    messages: getTotalFromListResponse(messagesData, 'messages'),
                    aiMessages: aiMessageCount,
                    userMessages: userMessageCount,
                    biDashboards: dashboards.length,
                    trends: {
                        users: usersData?.pagination?.totalPage ? `${usersData.pagination.totalPage} trang` : null,
                        conversations: convsData?.pagination?.totalPage ? `${convsData.pagination.totalPage} trang` : null,
                        messages: messagesData?.pagination?.totalPage ? `${messagesData.pagination.totalPage} trang` : null,
                        biDashboards: 'Superset',
                    },
                    performance: {
                        processingRate: aiRate,
                        aiHandled: aiRate,
                        userMessages: userRate,
                        doctorReview: reviewRate,
                        urgentAlerts: 0,
                        summary: messages.length
                            ? 'Phân bổ được tính từ các tin nhắn mới nhất hệ thống trả về.'
                            : 'Chưa có dữ liệu tin nhắn gần đây từ backend.',
                    },
                });
                setBIDashboards(dashboards);
                setRecentEvents(activity);
            } catch {
                setRecentEvents([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const openBIDashboard = async (dashboard) => {
        if (!dashboard?.key) return;
        setRefreshingBIKey(dashboard.key);
        try {
            await getBIGuestTokenAPI(dashboard.key);
            if (dashboard.supersetUrl) {
                await Linking.openURL(dashboard.supersetUrl);
                return;
            }
            Alert.alert('BI Dashboard', 'Guest token đã được tạo, nhưng backend chưa trả về đường dẫn Superset.');
        } catch (error) {
            Alert.alert(
                'Không thể mở BI Dashboard',
                error?.response?.data?.message || error?.message || 'Vui lòng kiểm tra cấu hình Superset.'
            );
        } finally {
            setRefreshingBIKey(null);
        }
    };

    const formatMetric = (value) => {
        if (value == null) return '--';
        const numberValue = Number(value);
        return Number.isFinite(numberValue) ? numberValue.toLocaleString() : String(value);
    };
    const performance = stats.performance;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Trang quản trị</Text>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveBadgeText}>Đang hoạt động</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={toggleDarkMode}>
                        <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDropdown(true)}>
                        <View style={styles.avatarCircle}>
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatarCircleImage} />
                            ) : (
                                <Text style={styles.avatarText}>{initials}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.headCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headTitle, { color: textPrimary }]}>Tổng quan hệ thống</Text>
                        <Text style={[styles.headSub, { color: textMuted }]}>
                            Theo dõi dữ liệu vận hành từ API admin và các dashboard BI Superset của nền tảng Medical Chatbot.
                        </Text>
                    </View>
                    <View style={styles.uptimeBox}>
                        <Text style={styles.uptimeVal}>{formatMetric(stats.biDashboards)}</Text>
                        <View style={styles.uptimeBarBg}><View style={styles.uptimeBarFill} /></View>
                        <Text style={styles.uptimeNote}>BI dashboard{'\n'}khả dụng</Text>
                    </View>
                </View>
                {loading ? (
                    <ActivityIndicator color="#2563EB" size="large" style={{ marginVertical: 32 }} />
                ) : (
                    <View style={styles.statsGrid}>
                        <StatCard isDark={isDarkMode} icon="people-outline" iconBg="#EFF6FF" iconColor="#2563EB"
                            label="Người dùng" value={formatMetric(stats.users)} trend={stats.trends.users} trendLabel="Tổng tài khoản" />
                        <StatCard isDark={isDarkMode} icon="chatbubble-ellipses-outline" iconBg="#EFF6FF" iconColor="#3B82F6"
                            label="Hội thoại" value={formatMetric(stats.conversations)} trend={stats.trends.conversations} trendLabel="Tổng hội thoại" />
                        <StatCard isDark={isDarkMode} icon="mail-outline" iconBg="#F5F3FF" iconColor="#8B5CF6"
                            label="Tin nhắn" value={formatMetric(stats.messages)} trend={stats.trends.messages} trendLabel="Tổng tin nhắn" />
                        <StatCard isDark={isDarkMode} icon="bar-chart-outline" iconBg="#ECFDF5" iconColor="#10B981"
                            label="BI dashboards" value={formatMetric(stats.biDashboards)} trend={stats.trends.biDashboards} trendLabel="Superset embedded" />
                    </View>
                )}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.cardHead}>
                        <View>
                            <Text style={[styles.cardTitle, { color: textPrimary }]}>Hiệu suất hội thoại</Text>
                            <Text style={[styles.cardSub, { color: textMuted }]}>Phân bổ trạng thái xử lý trong hôm nay</Text>
                        </View>
                        <View style={styles.rtBadge}>
                            <Ionicons name="time-outline" size={13} color={textMuted} />
                            <Text style={[styles.rtText, { color: textMuted }]}>Thời gian thực</Text>
                        </View>
                    </View>
                    <View style={styles.ringRow}>
                        <View style={[styles.ringOuter, { borderColor: '#2563EB' }]}>
                            <View style={[styles.ringInner, { backgroundColor: cardBg }]}>
                                <Text style={[styles.ringPct, { color: textPrimary }]}>{performance?.processingRate == null ? '--' : `${performance.processingRate}%`}</Text>
                                <Text style={[styles.ringLabel, { color: textMuted }]}>Tin nhắn AI</Text>
                                <Text style={[styles.ringSub, { color: textMuted }]}>Mẫu dữ liệu{'\n'}gần đây</Text>
                            </View>
                        </View>
                        <View style={styles.progList}>
                            <ProgressBar isDark={isDarkMode} label="Tin nhắn AI" pct={performance?.aiHandled ?? 0} color="#2563EB" />
                            <ProgressBar isDark={isDarkMode} label="Tin nhắn người dùng" pct={performance?.userMessages ?? 0} color="#10B981" />
                            <ProgressBar isDark={isDarkMode} label="Khác / hệ thống" pct={performance?.doctorReview ?? 0} color="#8B5CF6" />
                        </View>
                    </View>
                    <View style={[styles.statusNote, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                        <Ionicons name="pulse-outline" size={14} color="#2563EB" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.noteTitle, { color: isDarkMode ? '#93C5FD' : '#1D4ED8' }]}>Trạng thái hiệu suất</Text>
                            <Text style={[styles.noteSub, { color: textMuted }]}>{performance?.summary ?? 'Chưa có dữ liệu hiệu suất từ backend.'}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.cardHead}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: textPrimary }]}>BI Dashboard</Text>
                            <Text style={[styles.cardSub, { color: textMuted }]}>Danh sách dashboard Superset từ API admin</Text>
                        </View>
                        <View style={styles.rtBadge}>
                            <Ionicons name="bar-chart-outline" size={13} color={textMuted} />
                            <Text style={[styles.rtText, { color: textMuted }]}>Embedded</Text>
                        </View>
                    </View>
                    <View style={styles.biList}>
                        {biDashboards.map((dashboard) => {
                            const isOpening = refreshingBIKey === dashboard.key;
                            return (
                                <TouchableOpacity
                                    key={dashboard.key}
                                    style={[styles.biItem, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor }]}
                                    onPress={() => openBIDashboard(dashboard)}
                                    disabled={!!refreshingBIKey}
                                >
                                    <View style={[styles.biIcon, { backgroundColor: '#EFF6FF' }]}>
                                        {isOpening ? (
                                            <ActivityIndicator color="#2563EB" size="small" />
                                        ) : (
                                            <Ionicons name="analytics-outline" size={18} color="#2563EB" />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.biTitle, { color: textPrimary }]}>{dashboard.title}</Text>
                                        <Text style={[styles.biSub, { color: textMuted }]} numberOfLines={1}>
                                            {dashboard.supersetUrl || `dashboard:${dashboard.key}`}
                                        </Text>
                                    </View>
                                    <Ionicons name="open-outline" size={18} color={textMuted} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>Hoạt động gần đây</Text>
                    <Text style={[styles.cardSub, { color: textMuted }]}>Những sự kiện quan trọng trong hệ thống</Text>
                    <View style={{ marginTop: 14 }}>
                        {recentEvents.length === 0 ? (
                            <Text style={[styles.emptyText, { color: textMuted }]}>Chưa có hoạt động gần đây từ backend.</Text>
                        ) : (
                            recentEvents.map((ev, index) => (
                                <View key={ev.id ?? ev._id ?? index} style={styles.eventRow}>
                                    <View style={[styles.eventDot, { backgroundColor: ev.color ?? '#2563EB' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.eventText, { color: textPrimary }]}>{ev.text ?? ev.message ?? ev.title}</Text>
                                        <Text style={[styles.eventTime, { color: textMuted }]}>{ev.time ?? formatEventTime(ev.createdAt)}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            <AdminDropdown
                visible={showDropdown}
                onClose={() => setShowDropdown(false)}
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                navigation={navigation}
                onLogout={() => { setShowDropdown(false); handleLogout(); }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    menuBtn: { padding: 4, marginRight: 10 },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, gap: 4 },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
    liveBadgeText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { position: 'relative', padding: 4 },
    avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarCircleImage: { width: 32, height: 32, borderRadius: 16 },
    avatarText: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
    container: { padding: 14, gap: 12 },
    headCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 16, gap: 12, alignItems: 'flex-start' },
    headTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
    headSub: { fontSize: 12, lineHeight: 18 },
    uptimeBox: { alignItems: 'flex-end', minWidth: 90 },
    uptimeVal: { fontSize: 20, fontWeight: '800', color: '#10B981', marginBottom: 4 },
    uptimeBarBg: { width: 80, height: 5, backgroundColor: '#DCFCE7', borderRadius: 3, marginBottom: 6 },
    uptimeBarFill: { width: '100%', height: 5, backgroundColor: '#10B981', borderRadius: 3 },
    uptimeNote: { fontSize: 10, color: '#10B981', textAlign: 'right', lineHeight: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: { width: '47.5%', borderRadius: 12, borderWidth: 1, padding: 14 },
    statCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    trendText: { fontSize: 11, fontWeight: '600', color: '#10B981' },
    statLabel: { fontSize: 12, marginBottom: 2 },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
    statSub: { fontSize: 11 },
    card: { borderRadius: 14, borderWidth: 1, padding: 16 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    cardSub: { fontSize: 12 },
    rtBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rtText: { fontSize: 11 },
    biList: { gap: 10, marginTop: 2 },
    biItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 12,
    },
    biIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    biTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    biSub: { fontSize: 11 },
    ringRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
    ringOuter: { width: 116, height: 116, borderRadius: 58, borderWidth: 13, alignItems: 'center', justifyContent: 'center' },
    ringInner: { alignItems: 'center' },
    ringPct: { fontSize: 21, fontWeight: '800' },
    ringLabel: { fontSize: 10, marginTop: 2 },
    ringSub: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
    progList: { flex: 1, gap: 10 },
    progRow: { gap: 4 },
    progHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    progLabel: { fontSize: 12 },
    progPct: { fontSize: 12, fontWeight: '600' },
    progBg: { height: 6, borderRadius: 3 },
    progFill: { height: 6, borderRadius: 3 },
    statusNote: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 10, padding: 12, marginTop: 8 },
    noteTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
    noteSub: { fontSize: 12, lineHeight: 17 },
    eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    eventDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
    eventText: { fontSize: 13, fontWeight: '500', marginBottom: 2, lineHeight: 18 },
    eventTime: { fontSize: 11 },
    emptyText: { fontSize: 12, lineHeight: 18 },
});

export default DashboardScreen;
