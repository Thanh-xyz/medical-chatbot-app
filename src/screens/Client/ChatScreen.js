import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    Modal,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import useChat from '../../hooks/useChat';
import useAuth from '../../hooks/useAuth';

const AI_MODELS = ['Qwen', 'Gemini', 'Claude'];

const ChatScreen = ({ navigation }) => {
    const [inputText, setInputText] = useState('');
    const [selectedModel, setSelectedModel] = useState('Qwen');
    const [attachedImage, setAttachedImage] = useState(null);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const flatListRef = useRef(null);
    const {
        messages,
        activeConversation,
        sendMessage,
        startNewConversation,
        sending,
        loadingMessages,
    } = useChat();
    const { user, handleLogout } = useAuth();

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text && !attachedImage) return;
        if (sending) return;
        if (!activeConversation) {
            await startNewConversation();
        }
        const messageText = attachedImage
            ? (text ? `${text}\n[Image attached]` : '[Image attached]')
            : text;
        setInputText('');
        setAttachedImage(null);
        await sendMessage(messageText);
    };

    const pickImageFromLibrary = async () => {
        setShowAttachMenu(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });
        if (!result.canceled && result.assets?.length > 0) {
            setAttachedImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        setShowAttachMenu(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });
        if (!result.canceled && result.assets?.length > 0) {
            setAttachedImage(result.assets[0].uri);
        }
    };

    const confirmLogout = () => {
        setShowUserMenu(false);
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: () => handleLogout('client') },
        ]);
    };

    const initials = user?.displayName?.charAt(0)?.toUpperCase()
        ?? user?.fullName?.charAt(0)?.toUpperCase()
        ?? 'U';

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        const hasImage = item.content?.includes('[Image attached]');
        const textContent = item.content?.replace('\n[Image attached]', '').replace('[Image attached]', '').trim();
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
                {!isUser && (
                    <View style={styles.botAvatar}>
                        <Ionicons name="medkit" size={13} color="#FFFFFF" />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    {hasImage && (
                        <View style={styles.imageAttachmentBox}>
                            <Ionicons name="image-outline" size={18} color={isUser ? '#BFDBFE' : '#64748B'} />
                            <Text style={[styles.imageAttachmentText, isUser && { color: '#BFDBFE' }]}>
                                Đã gửi ảnh
                            </Text>
                        </View>
                    )}
                    {!!textContent && (
                        <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextBot]}>
                            {textContent}
                        </Text>
                    )}
                    {item.createdAt && (
                        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <LinearGradient colors={['#EFF6FF', '#F0F9FF', '#F0FDF4']} style={styles.gradient}>

                {/* ── Top header ── */}
                <View style={styles.topHeader}>
                    {/* History / drawer */}
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Ionicons name="time-outline" size={22} color="#475569" />
                    </TouchableOpacity>

                    {/* Model selector */}
                    <View style={styles.modelBar}>
                        {AI_MODELS.map((model) => (
                            <TouchableOpacity
                                key={model}
                                style={[styles.modelTab, selectedModel === model && styles.modelTabActive]}
                                onPress={() => setSelectedModel(model)}
                            >
                                <Text style={[styles.modelTabText, selectedModel === model && styles.modelTabTextActive]}>
                                    {model}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* User avatar + menu */}
                    <TouchableOpacity
                        style={styles.avatarBtn}
                        onPress={() => setShowUserMenu(true)}
                    >
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    {/* Messages */}
                    {loadingMessages ? (
                        <View style={styles.centered}>
                            <ActivityIndicator color="#2563EB" size="large" />
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={styles.centered}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="medkit" size={32} color="#2563EB" />
                            </View>
                            <Text style={styles.emptyTitle}>Bác Sĩ Ảo</Text>
                            <Text style={styles.emptySubtitle}>
                                Hỏi tôi bất cứ điều gì về sức khỏe.{'\n'}Tôi sẵn sàng hỗ trợ bạn!
                            </Text>
                            <TouchableOpacity
                                style={styles.newChatBtn}
                                onPress={startNewConversation}
                            >
                                <Ionicons name="add-circle-outline" size={16} color="#2563EB" />
                                <Text style={styles.newChatBtnText}>Bắt đầu cuộc khám mới</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item, index) => item._id ?? `msg-fallback-${index}`}
                            renderItem={renderMessage}
                            contentContainerStyle={styles.messageList}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                    )}

                    {/* Attached image preview */}
                    {attachedImage && (
                        <View style={styles.imagePreviewBar}>
                            <Image source={{ uri: attachedImage }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => setAttachedImage(null)}
                            >
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Input bar */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputRow}>
                            {/* Attach button */}
                            <TouchableOpacity
                                style={styles.attachBtn}
                                onPress={() => setShowAttachMenu(true)}
                            >
                                <Ionicons name="attach" size={22} color="#2563EB" />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.textInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Hỏi bác sĩ bất cứ điều gì..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                maxLength={1000}
                            />

                            {/* Send / mic button */}
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    (inputText.trim() || attachedImage) ? styles.sendBtnActive : styles.sendBtnIdle,
                                ]}
                                onPress={handleSend}
                                disabled={(!inputText.trim() && !attachedImage) || sending}
                            >
                                {sending ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (inputText.trim() || attachedImage) ? (
                                    <Ionicons name="send" size={18} color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="mic-outline" size={20} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.disclaimer}>
                            Trợ lý y tế ảo có thể mắc lỗi. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa.
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>

            {/* ── Attach menu modal ── */}
            <Modal
                visible={showAttachMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAttachMenu(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAttachMenu(false)}
                >
                    <View style={styles.attachMenu}>
                        <Text style={styles.attachMenuTitle}>Đính kèm ảnh</Text>
                        <TouchableOpacity style={styles.attachMenuItem} onPress={pickImageFromLibrary}>
                            <View style={[styles.attachMenuIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="images-outline" size={22} color="#2563EB" />
                            </View>
                            <Text style={styles.attachMenuLabel}>Thư viện ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachMenuItem} onPress={takePhoto}>
                            <View style={[styles.attachMenuIcon, { backgroundColor: '#DCFCE7' }]}>
                                <Ionicons name="camera-outline" size={22} color="#16A34A" />
                            </View>
                            <Text style={styles.attachMenuLabel}>Chụp ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.attachMenuItem, styles.attachMenuCancel]}
                            onPress={() => setShowAttachMenu(false)}
                        >
                            <Text style={styles.attachMenuCancelText}>Huỷ</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── User menu modal ── */}
            <Modal
                visible={showUserMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowUserMenu(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowUserMenu(false)}
                >
                    <View style={styles.userMenu}>
                        {/* User info */}
                        <View style={styles.userMenuHeader}>
                            <View style={styles.userMenuAvatar}>
                                <Text style={styles.userMenuAvatarText}>{initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userMenuName} numberOfLines={1}>
                                    {user?.displayName ?? user?.fullName ?? 'Người dùng'}
                                </Text>
                                <Text style={styles.userMenuEmail} numberOfLines={1}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.userMenuDivider} />

                        {/* History */}
                        <TouchableOpacity
                            style={styles.userMenuItem}
                            onPress={() => {
                                setShowUserMenu(false);
                                navigation.dispatch(DrawerActions.openDrawer());
                            }}
                        >
                            <Ionicons name="time-outline" size={20} color="#475569" />
                            <Text style={styles.userMenuItemText}>Lịch sử khám</Text>
                        </TouchableOpacity>

                        {/* New conversation */}
                        <TouchableOpacity
                            style={styles.userMenuItem}
                            onPress={() => {
                                setShowUserMenu(false);
                                startNewConversation();
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#475569" />
                            <Text style={styles.userMenuItemText}>Khám mới</Text>
                        </TouchableOpacity>

                        {/* Settings */}
                        <TouchableOpacity
                            style={styles.userMenuItem}
                            onPress={() => {
                                setShowUserMenu(false);
                                navigation.navigate('ClientSettings');
                            }}
                        >
                            <Ionicons name="settings-outline" size={20} color="#475569" />
                            <Text style={styles.userMenuItemText}>Cài đặt tài khoản</Text>
                        </TouchableOpacity>

                        <View style={styles.userMenuDivider} />

                        {/* Logout */}
                        <TouchableOpacity style={styles.userMenuItem} onPress={confirmLogout}>
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                            <Text style={[styles.userMenuItemText, { color: '#EF4444' }]}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    gradient: { flex: 1 },

    // ── Header ──
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    modelBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 3,
    },
    modelTab: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 17,
        alignItems: 'center',
    },
    modelTabActive: { backgroundColor: '#2563EB' },
    modelTabText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
    modelTabTextActive: { color: '#FFFFFF', fontWeight: '600' },
    avatarBtn: { marginLeft: 4 },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

    // ── Messages ──
    messageList: { padding: 16, paddingBottom: 4 },
    messageRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowBot: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleUser: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
    bubbleBot: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    messageText: { fontSize: 15, lineHeight: 22 },
    messageTextUser: { color: '#FFFFFF' },
    messageTextBot: { color: '#1E293B' },
    timestamp: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
    timestampUser: { color: 'rgba(255,255,255,0.6)' },
    imageAttachmentBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    imageAttachmentText: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },

    // ── Empty state ──
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyIcon: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
    newChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#DBEAFE',
        borderRadius: 20,
    },
    newChatBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },

    // ── Image preview strip ──
    imagePreviewBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    imagePreview: {
        width: 60,
        height: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    removeImageBtn: { position: 'absolute', top: -4, left: 50 },

    // ── Input bar ──
    inputContainer: {
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 26,
        paddingHorizontal: 6,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    attachBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        flex: 1,
        minHeight: 38,
        maxHeight: 110,
        fontSize: 15,
        color: '#1E293B',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnActive: { backgroundColor: '#2563EB' },
    sendBtnIdle: { backgroundColor: '#F1F5F9' },
    disclaimer: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 6 },

    // ── Attach menu modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    attachMenu: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
    },
    attachMenuTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    attachMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 14,
    },
    attachMenuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachMenuLabel: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
    attachMenuCancel: {
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 4,
        paddingTop: 16,
    },
    attachMenuCancelText: { fontSize: 15, color: '#EF4444', fontWeight: '600', textAlign: 'center' },

    // ── User menu modal ──
    userMenu: {
        position: 'absolute',
        top: 80,
        right: 16,
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    userMenuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    userMenuAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMenuAvatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    userMenuName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    userMenuEmail: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    userMenuDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    userMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    userMenuItemText: { fontSize: 15, color: '#334155' },
});

export default ChatScreen;

