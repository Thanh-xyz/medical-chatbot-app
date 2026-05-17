import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useSettings } from '../../store/SettingsContext';
import { getAdminSettingsAPI, updateAdminSettingAPI } from '../../services/apis/Admin/settings.api';

const MODELS = [
    { id: 'qwen', name: 'QWEN', icon: 'chatbox-ellipses-outline', status: 'Đang hoạt động' },
    { id: 'gemini', name: 'GEMINI', icon: 'chatbox-ellipses-outline', status: 'Đang hoạt động' },
    { id: 'claude', name: 'CLAUDE', icon: 'chatbox-ellipses-outline', status: 'Đang hoạt động' },
];

const AdminSettingScreen = ({ navigation }) => {
    const { isDarkMode } = useSettings();
    const [selectedModel, setSelectedModel] = useState('qwen');
    const [temperature, setTemperature] = useState(0.7);
    const [tokenLimit, setTokenLimit] = useState('2000');
    const [maintenance, setMaintenance] = useState(false);
    const [settingsMap, setSettingsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const applySettings = useCallback((modelId, map) => {
        const s = map[modelId];
        if (s) {
            setTemperature(s.temperature ?? 0.7);
            setTokenLimit(String(s.maxTokens ?? 2000));
            setMaintenance(s.maintenanceMode ?? false);
        }
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const list = await getAdminSettingsAPI();
                const map = {};
                list.forEach((s) => { map[s.modelName] = s; });
                setSettingsMap(map);
                applySettings(selectedModel, map);
            } catch {
                Alert.alert('Lỗi', 'Không thể tải cài đặt!');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSelectModel = (modelId) => {
        setSelectedModel(modelId);
        applySettings(modelId, settingsMap);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateAdminSettingAPI(selectedModel, {
                temperature,
                maxTokens: parseInt(tokenLimit, 10) || 2000,
                maintenanceMode: maintenance,
            });
            setSettingsMap((prev) => ({
                ...prev,
                [selectedModel]: { ...prev[selectedModel], temperature, maxTokens: parseInt(tokenLimit, 10) || 2000, maintenanceMode: maintenance },
            }));
            Alert.alert('Thành công', 'Đã lưu cài đặt!');
        } catch {
            Alert.alert('Lỗi', 'Lưu cài đặt thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const bg = isDarkMode ? '#0F172A' : '#F1F5F9';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const currentModelName = MODELS.find((m) => m.id === selectedModel)?.name ?? 'AI';
    const STEPS = 10;
    const stepValue = Math.round(temperature * STEPS);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Cài đặt</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Cấu hình hệ thống quản trị</Text>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
                    <View style={[styles.pageCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.pageBadge}>
                            <Ionicons name="settings-outline" size={13} color="#2563EB" />
                            <Text style={styles.pageBadgeText}>Cấu hình hệ thống</Text>
                        </View>
                        <View style={styles.pageTitleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.pageTitle, { color: textPrimary }]}>Cài đặt Chatbot AI</Text>
                                <Text style={[styles.pageDesc, { color: textMuted }]}>
                                    Quản lý mô hình AI, giới hạn token và trạng thái bảo trì để kiểm soát chất lượng phản hồi trong hệ thống.
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="save-outline" size={15} color="#FFFFFF" />}
                                <Text style={styles.saveHeaderBtnText}>Lưu cài đặt</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="hardware-chip-outline" size={16} color="#2563EB" />
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Chọn mô hình cần cấu hình</Text>
                        </View>
                        <View style={styles.modelGrid}>
                            {MODELS.map((model) => {
                                const active = selectedModel === model.id;
                                return (
                                    <TouchableOpacity
                                        key={model.id}
                                        style={[styles.modelCard, { borderColor: active ? '#2563EB' : borderColor, backgroundColor: active ? (isDarkMode ? '#1E3A5F' : '#EFF6FF') : (isDarkMode ? '#0F172A' : '#F8FAFC') }]}
                                        onPress={() => handleSelectModel(model.id)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.modelName, { color: active ? '#2563EB' : textPrimary }]}>{model.name}</Text>
                                            <Text style={[styles.modelStatus, { color: textMuted }]}>{model.status}</Text>
                                        </View>
                                        <View style={[styles.modelIcon, { backgroundColor: active ? '#2563EB' : (isDarkMode ? '#334155' : '#E2E8F0') }]}>
                                            <Ionicons name={model.icon} size={16} color={active ? '#FFFFFF' : textMuted} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={[styles.paramsCard, { backgroundColor: cardBg, borderColor }]}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="options-outline" size={16} color="#2563EB" />
                                <Text style={[styles.sectionTitle, { color: textPrimary }]}>Thông số AI</Text>
                            </View>

                            <Text style={[styles.paramLabel, { color: textMuted }]}>Chỉ số sáng tạo</Text>
                            <View style={styles.sliderRow}>
                                <Text style={[styles.sliderValue, { color: textPrimary }]}>Temperature: {temperature.toFixed(1)}</Text>
                            </View>
                            <View style={styles.sliderTrack}>
                                {Array.from({ length: STEPS + 1 }).map((_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.sliderSeg, { backgroundColor: i <= stepValue ? '#2563EB' : (isDarkMode ? '#334155' : '#E2E8F0') }]}
                                        onPress={() => setTemperature(i / STEPS)}
                                    />
                                ))}
                            </View>
                            <View style={styles.sliderLabels}>
                                <Text style={[styles.sliderLabel, { color: textMuted }]}>Ổn định</Text>
                                <Text style={[styles.sliderLabel, { color: textMuted }]}>Sáng tạo</Text>
                            </View>

                            <Text style={[styles.paramLabel, { color: textMuted, marginTop: 16 }]}>Giới hạn token / 1 phiên</Text>
                            <View style={[styles.tokenInput, { backgroundColor: inputBg, borderColor }]}>
                                <Ionicons name="timer-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.tokenField, { color: textPrimary }]}
                                    value={tokenLimit}
                                    onChangeText={setTokenLimit}
                                    keyboardType="number-pad"
                                    placeholderTextColor={textMuted}
                                />
                            </View>
                            <Text style={[styles.paramDesc, { color: textMuted }]}>
                                Tổng token của người dùng và AI nếu vượt mức này sẽ bị chặn để bảo vệ hiệu năng hệ thống.
                            </Text>
                        </View>
                        <View style={[styles.maintCard, { backgroundColor: isDarkMode ? '#0D2A1A' : '#F0FDF4', borderColor: isDarkMode ? '#1A4A2A' : '#BBF7D0' }]}>
                            <View style={styles.maintHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <Ionicons name="construct-outline" size={16} color="#10B981" />
                                    <Text style={[styles.sectionTitle, { color: textPrimary }]}>Chế độ bảo trì</Text>
                                </View>
                                <Switch
                                    value={maintenance}
                                    onValueChange={setMaintenance}
                                    thumbColor="#FFFFFF"
                                    trackColor={{ true: '#10B981', false: isDarkMode ? '#334155' : '#E2E8F0' }}
                                />
                            </View>
                            <Text style={[styles.maintDesc, { color: textMuted }]}>
                                Khi bật, mô hình {currentModelName} sẽ tạm dừng phản hồi từ bot.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
    menuBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    container: { padding: 14, paddingBottom: 40, gap: 12 },
    pageCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    pageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
    pageBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    pageTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    pageDesc: { fontSize: 13, lineHeight: 18 },
    saveHeaderBtn: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
    saveHeaderBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
    sectionCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '700' },
    modelGrid: { gap: 10 },
    modelCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14 },
    modelName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    modelStatus: { fontSize: 12 },
    modelIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    bottomRow: { gap: 12 },
    paramsCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    paramLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    sliderRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
    sliderValue: { fontSize: 12, fontWeight: '600' },
    sliderTrack: { flexDirection: 'row', gap: 3, height: 8, marginBottom: 6 },
    sliderSeg: { flex: 1, borderRadius: 4 },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    sliderLabel: { fontSize: 11 },
    tokenInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 8 },
    tokenField: { flex: 1, fontSize: 14 },
    paramDesc: { fontSize: 12, lineHeight: 17 },
    maintCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    maintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    maintDesc: { fontSize: 13, lineHeight: 18 },
});

export default AdminSettingScreen;
