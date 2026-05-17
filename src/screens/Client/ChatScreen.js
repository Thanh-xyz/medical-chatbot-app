import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView,
    Platform, StatusBar, Image, Modal, Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import useChat from '../../hooks/useChat';
import useAuth from '../../hooks/useAuth';
import { useSettings } from '../../store/SettingsContext';
import { cancelChatResponseAPI, speechToTextAPI, textToSpeechAPI } from '../../services/apis/Client/chat.api';
import ThinkingBubble from '../../components/Client/ThinkingBubble';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'buổi sáng';
    if (h < 14) return 'buổi trưa';
    if (h < 18) return 'buổi chiều';
    return 'buổi tối';
};

const STOPPED_RESPONSE_MESSAGE = 'Đã dừng câu trả lời đang chạy.';

const ChatScreen = ({ navigation }) => {
    const [inputText, setInputText] = useState('');
    const [attachedImage, setAttachedImage] = useState(null);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isTextChatRunning, setIsTextChatRunning] = useState(false);
    const [voiceState, setVoiceState] = useState('idle');
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [messageActionSheet, setMessageActionSheet] = useState(null);
    const flatListRef = useRef(null);
    const textAbortControllerRef = useRef(null);
    const activeConvIdRef = useRef(null);
    const recordingRef = useRef(null);
    const responseSoundRef = useRef(null);
    const voicePlaybackResolverRef = useRef(null);
    const voiceCanceledRef = useRef(false);
    const voiceTTSAbortControllerRef = useRef(null);
    const copyFeedbackTimerRef = useRef(null);

    const {
        messages, activeConversation,
        sendMessage, appendAssistantMessage, startNewConversation,
        sending, loadingMessages, isLimitReached, error,
    } = useChat();
    const { user, handleLogout } = useAuth();
    const { fontSize, isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F0F4F8';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const placeholderColor = isDarkMode ? '#475569' : '#94A3B8';
    const bubbleBotBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const botTextColor = isDarkMode ? '#E2E8F0' : '#1E293B';
    const msgFontSize = fontSize === 'small' ? 13 : fontSize === 'large' ? 17 : 15;

    const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'U';
    const isVoiceBusy = voiceState === 'recording' || voiceState === 'transcribing' || voiceState === 'thinking' || voiceState === 'speaking';
    const isThinking = sending || voiceState === 'thinking';

    useEffect(() => {
        if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages, isThinking]);

    useEffect(() => () => {
        textAbortControllerRef.current?.abort();
        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync().catch(() => { });
            recordingRef.current = null;
        }
        if (responseSoundRef.current) {
            responseSoundRef.current.unloadAsync().catch(() => { });
            responseSoundRef.current = null;
        }
        voicePlaybackResolverRef.current?.();
        voicePlaybackResolverRef.current = null;
        if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
    }, []);

    const getVoiceStatusText = () => {
        if (voiceState === 'recording') return 'Đang ghi âm... Nhấn micro để dừng và gửi.';
        if (voiceState === 'transcribing') return 'Đang chuyển giọng nói thành văn bản...';
        if (voiceState === 'thinking') return 'Bác sĩ Ảo đang trả lời...';
        if (voiceState === 'speaking') return 'Bác sĩ Ảo đang đọc câu trả lời...';
        return '';
    };

    const showVoiceError = (title, message) => {
        setVoiceState('idle');
        Alert.alert(title, message);
    };

    const stopAssistantVoice = async () => {
        voiceCanceledRef.current = true;
        voiceTTSAbortControllerRef.current?.abort();
        voiceTTSAbortControllerRef.current = null;
        voicePlaybackResolverRef.current?.();
        voicePlaybackResolverRef.current = null;
        const sound = responseSoundRef.current;
        responseSoundRef.current = null;
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch {
            }
        }
        setVoiceState('idle');
    };

    const playAssistantVoice = async (text, conversationId) => {
        if (!text?.trim() || !conversationId) return;

        voiceCanceledRef.current = false;
        const ttsController = new AbortController();
        voiceTTSAbortControllerRef.current = ttsController;

        setVoiceState('speaking');
        try {
            if (responseSoundRef.current) {
                await responseSoundRef.current.unloadAsync().catch(() => { });
                responseSoundRef.current = null;
            }

            if (voiceCanceledRef.current) return;

            const res = await textToSpeechAPI(text, conversationId, { signal: ttsController.signal });

            if (voiceCanceledRef.current) return;

            const audioUrl = res?.audio_url || res?.data?.audio_url;
            if (!audioUrl) throw new Error('Không có audio_url');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            if (voiceCanceledRef.current) return;

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true, volume: 1.0, isLooping: false }
            );

            if (voiceCanceledRef.current) {
                sound.unloadAsync().catch(() => { });
                return;
            }

            responseSoundRef.current = sound;

            return await new Promise((resolve) => {
                voicePlaybackResolverRef.current = resolve;
                let finished = false;
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (!status.isLoaded) {
                        if (status.error && !finished) {
                            finished = true;
                            sound.unloadAsync().catch(() => { });
                            if (responseSoundRef.current === sound) responseSoundRef.current = null;
                            voicePlaybackResolverRef.current = null;
                            setVoiceState('idle');
                            resolve();
                        }
                        return;
                    }
                    if (status.didJustFinish && !finished) {
                        finished = true;
                        sound.unloadAsync().catch(() => { });
                        if (responseSoundRef.current === sound) responseSoundRef.current = null;
                        voicePlaybackResolverRef.current = null;
                        setVoiceState('idle');
                        resolve();
                    }
                });
            });
        } catch (err) {
            const aborted = err?.name === 'AbortError' || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
            if (!aborted) setVoiceState('idle');
        } finally {
            if (voiceTTSAbortControllerRef.current === ttsController) {
                voiceTTSAbortControllerRef.current = null;
            }
        }
    };

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text && !attachedImage) return;
        if (isTextChatRunning || isVoiceBusy || isLimitReached) return;

        let conv = activeConversation;
        if (!conv) conv = await startNewConversation('qwen');
        if (!conv) return;

        const messageText = attachedImage
            ? (text ? `${text}\n[Image attached]` : '[Image attached]')
            : text;
        setInputText('');
        setAttachedImage(null);

        const controller = new AbortController();
        textAbortControllerRef.current = controller;
        activeConvIdRef.current = conv._id;
        setIsTextChatRunning(true);
        try {
            await sendMessage(messageText, 'qwen', {
                signal: controller.signal,
                conversation: conv,
                onConversationReady: (id) => {
                    activeConvIdRef.current = id;
                },
            });
        } finally {
            if (textAbortControllerRef.current === controller) {
                textAbortControllerRef.current = null;
                activeConvIdRef.current = null;
                setIsTextChatRunning(false);
            }
        }
    };

    const handleResend = async (text) => {
        if (!text?.trim() || isTextChatRunning || isVoiceBusy || isLimitReached) return;
        const controller = new AbortController();
        textAbortControllerRef.current = controller;
        activeConvIdRef.current = activeConversation?._id || null;
        setIsTextChatRunning(true);
        try {
            await sendMessage(text, 'qwen', {
                signal: controller.signal,
                conversation: activeConversation,
                onConversationReady: (id) => {
                    activeConvIdRef.current = id;
                },
            });
        } finally {
            if (textAbortControllerRef.current === controller) {
                textAbortControllerRef.current = null;
                activeConvIdRef.current = null;
                setIsTextChatRunning(false);
            }
        }
    };

    const handleEditMessage = (text) => {
        if (!text?.trim() || isTextChatRunning || isVoiceBusy) return;
        setMessageActionSheet(null);
        setInputText(text);
        setAttachedImage(null);
    };

    const handleCopyMessage = async (text, messageId) => {
        if (!text?.trim()) return;

        await Clipboard.setStringAsync(text);
        setCopiedMessageId(messageId);
        if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = setTimeout(() => {
            setCopiedMessageId(null);
            copyFeedbackTimerRef.current = null;
        }, 1400);
    };

    const openMessageActions = (item, text, messageId) => {
        if (!text?.trim()) return;
        setMessageActionSheet({ id: messageId, role: item.role, text });
    };

    const handleStopTextChat = () => {
        textAbortControllerRef.current?.abort();
        appendAssistantMessage?.(STOPPED_RESPONSE_MESSAGE);
        if (activeConvIdRef.current) {
            cancelChatResponseAPI(activeConvIdRef.current).catch(() => { });
        }
        stopAssistantVoice();
        textAbortControllerRef.current = null;
        activeConvIdRef.current = null;
        setIsTextChatRunning(false);
    };

    const startVoiceRecording = async () => {
        if (isTextChatRunning || isVoiceBusy || isLimitReached) return;

        try {
            await stopAssistantVoice();
            voiceCanceledRef.current = false;
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                showVoiceError('Cần quyền micro', 'Vui lòng cấp quyền micro để ghi âm câu hỏi.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await recording.startAsync();
            recordingRef.current = recording;
            setVoiceState('recording');
        } catch {
            recordingRef.current = null;
            showVoiceError('Không thể ghi âm', 'Không thể bắt đầu ghi âm. Vui lòng thử lại.');
        }
    };

    const stopVoiceRecording = async () => {
        const recording = recordingRef.current;
        if (!recording) return;

        recordingRef.current = null;
        setVoiceState('transcribing');

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            const uri = recording.getURI();
            if (!uri) throw new Error('Không tìm thấy file ghi âm.');

            const sttResult = await speechToTextAPI(uri, 'audio/m4a');
            const text = sttResult?.text || sttResult?.data?.text;
            if (!text?.trim()) {
                showVoiceError('Không nghe rõ nội dung', 'Vui lòng thử lại trong môi trường ít tiếng ồn hơn.');
                return;
            }

            setInputText('');
            setVoiceState('thinking');
            const controller = new AbortController();
            textAbortControllerRef.current = controller;
            activeConvIdRef.current = activeConversation?._id || null;

            const chatResult = await sendMessage(text, 'qwen', {
                signal: controller.signal,
                conversation: activeConversation,
                onConversationReady: (id) => {
                    activeConvIdRef.current = id;
                },
            });

            if (textAbortControllerRef.current === controller) {
                textAbortControllerRef.current = null;
                activeConvIdRef.current = null;
            }

            const answer = chatResult?.response;
            if (answer && !answer.includes('Hết hạn mức')) {
                await playAssistantVoice(answer, chatResult.conversationId);
            } else {
                setVoiceState('idle');
            }
        } catch (err) {
            const cancelled = err?.name === 'AbortError' || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
            if (!cancelled) {
                Alert.alert('Không thể xử lý ghi âm', 'Vui lòng kiểm tra kết nối và thử lại.');
            }
            setVoiceState('idle');
        }
    };

    const handleMicPress = async () => {
        if (voiceState === 'recording') {
            await stopVoiceRecording();
            return;
        }
        if (voiceState === 'speaking') {
            await stopAssistantVoice();
            return;
        }
        await startVoiceRecording();
    };

    const pickImageFromLibrary = async () => {
        setShowAttachMenu(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true });
        if (!result.canceled && result.assets?.length > 0) setAttachedImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        setShowAttachMenu(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép quyền camera.'); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
        if (!result.canceled && result.assets?.length > 0) setAttachedImage(result.assets[0].uri);
    };

    const confirmLogout = () => {
        setShowUserMenu(false);
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: () => handleLogout('client') },
        ]);
    };

    const renderMessage = ({ item, index }) => {
        const isUser = item.role === 'user';
        const hasImage = item.content?.includes('[Image attached]');
        const textContent = item.content?.replace('\n[Image attached]', '').replace('[Image attached]', '').trim();
        if (!isUser && textContent === STOPPED_RESPONSE_MESSAGE) {
            return (
                <View style={s.systemMsgRow}>
                    <View style={[
                        s.systemMsgPill,
                        {
                            backgroundColor: isDarkMode ? 'rgba(148,163,184,0.1)' : '#EAF0F6',
                            borderColor,
                        },
                    ]}>
                        <Ionicons name="stop-circle-outline" size={13} color={textMuted} />
                        <Text style={[s.systemMsgText, { color: textMuted }]}>Đã dừng phản hồi</Text>
                    </View>
                </View>
            );
        }

        const messageActionId = item._id ?? `${item.role}-${index}`;
        const BubbleWrap = textContent ? TouchableOpacity : View;
        const bubbleWrapProps = textContent ? {
            onLongPress: () => openMessageActions(item, textContent, messageActionId),
            activeOpacity: 0.85,
        } : {};

        return (
            <View style={[s.msgRow, isUser ? s.msgRowUser : s.msgRowBot]}>
                {!isUser && (
                    <View style={s.botAvatar}>
                        <Ionicons name="medkit" size={13} color="#FFFFFF" />
                    </View>
                )}
                <View style={s.msgBodyCol}>
                    <BubbleWrap {...bubbleWrapProps} style={[s.bubble, isUser ? s.bubbleUser : [s.bubbleBot, { backgroundColor: bubbleBotBg }]]}>
                        {hasImage && (
                            <View style={s.imgBox}>
                                <Ionicons name="image-outline" size={16} color={isUser ? '#BFDBFE' : '#64748B'} />
                                <Text style={[s.imgBoxText, isUser && { color: '#BFDBFE' }]}>Đã gửi ảnh</Text>
                            </View>
                        )}
                        {!!textContent && (
                            <Text style={[s.msgText, { fontSize: msgFontSize }, isUser ? s.msgTextUser : [s.msgTextBot, { color: botTextColor }]]}>
                                {textContent}
                            </Text>
                        )}
                        {item.createdAt && (
                            <Text style={[s.timestamp, isUser && s.timestampUser]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        )}
                    </BubbleWrap>
                    {!isUser && item.risk_level === 'high' && (
                        <View style={s.riskBanner}>
                            <Ionicons name="warning-outline" size={15} color="#DC2626" />
                            <Text style={s.riskText}>Cảnh báo: Triệu chứng có thể nguy hiểm. Đề nghị đến cơ sở y tế gần nhất hoặc gọi cấp cứu ngay!</Text>
                        </View>
                    )}
                    {!isUser && !sending && item.sources?.length > 0 && (
                        <View style={[s.sourcesBox, { borderTopColor: borderColor }]}>
                            <View style={s.sourcesHeader}>
                                <Ionicons name="information-circle-outline" size={13} color={textMuted} />
                                <Text style={[s.sourcesTitle, { color: textMuted }]}>Một số thông tin liên quan:</Text>
                            </View>
                            {item.sources.map((src, i) => (
                                <Text key={i} style={[s.sourceItem, { color: textMuted }]} numberOfLines={1}>
                                    · {src?.name || 'Tài liệu chuyên ngành'}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };
    const InputCard = () => {
        const canSend = !!(inputText.trim() || attachedImage);
        const voiceStatus = getVoiceStatusText();
        return (
            <View style={[s.inputCard, { backgroundColor: inputBg, borderColor, shadowColor: isDarkMode ? '#000' : '#94A3B8' }]}>
                {!!voiceStatus && (
                    <View style={[
                        s.voiceStatus,
                        voiceState === 'recording'
                            ? s.voiceStatusRecording
                            : s.voiceStatusInfo,
                    ]}>
                        <Ionicons
                            name={voiceState === 'recording' ? 'radio-button-on' : voiceState === 'speaking' ? 'volume-high-outline' : 'pulse-outline'}
                            size={15}
                            color={voiceState === 'recording' ? '#DC2626' : '#2563EB'}
                        />
                        <Text style={[
                            s.voiceStatusText,
                            { color: voiceState === 'recording' ? '#B91C1C' : '#1D4ED8' },
                        ]}>
                            {voiceStatus}
                        </Text>
                    </View>
                )}
                <TextInput
                    style={[s.inputField, { color: textPrimary, fontSize: msgFontSize }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Mô tả triệu chứng, đặt câu hỏi sức khỏe..."
                    placeholderTextColor={placeholderColor}
                    multiline
                    maxLength={1000}
                    onSubmitEditing={handleSend}
                    editable={!isTextChatRunning && !isVoiceBusy}
                />
                {attachedImage && (
                    <View style={s.imgPreviewRow}>
                        <Image source={{ uri: attachedImage }} style={s.imgPreview} />
                        <TouchableOpacity style={s.imgRemove} onPress={() => setAttachedImage(null)}>
                            <Ionicons name="close-circle" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={[s.inputToolbar, { borderTopColor: borderColor }]}>
                    <TouchableOpacity style={s.toolBtn} onPress={() => setShowAttachMenu(true)} disabled={isTextChatRunning || isVoiceBusy}>
                        <Ionicons name="attach" size={20} color={textMuted} />
                    </TouchableOpacity>
                    {!inputText.trim() && !attachedImage && (
                        <TouchableOpacity
                            style={[s.toolBtn, (voiceState === 'recording' || voiceState === 'speaking') && s.micRecordingBtn]}
                            onPress={handleMicPress}
                            disabled={voiceState === 'transcribing' || voiceState === 'thinking' || isTextChatRunning || isLimitReached}
                        >
                            <Ionicons
                                name={voiceState === 'recording' || voiceState === 'speaking' ? 'stop' : 'mic-outline'}
                                size={20}
                                color={voiceState === 'recording' || voiceState === 'speaking' ? '#FFFFFF' : textMuted}
                            />
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        style={[s.sendBtn, isTextChatRunning ? s.sendBtnStop : (canSend ? s.sendBtnActive : s.sendBtnIdle)]}
                        onPress={isTextChatRunning ? handleStopTextChat : handleSend}
                        disabled={!isTextChatRunning && (!canSend || isVoiceBusy)}
                    >
                        {isTextChatRunning
                            ? <Ionicons name="stop" size={15} color="#FFFFFF" />
                            : <Ionicons name="arrow-forward" size={18} color={canSend && !isVoiceBusy ? '#FFFFFF' : placeholderColor} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const sheetIsUserMessage = messageActionSheet?.role === 'user';
    const sheetEditDisabled = isTextChatRunning || isVoiceBusy;
    const sheetResendDisabled = sheetEditDisabled || isLimitReached;
    const sheetVoiceDisabled = voiceState === 'recording' || voiceState === 'transcribing' || voiceState === 'thinking';

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={[s.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity style={s.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={22} color={textMuted} />
                </TouchableOpacity>
                <View style={s.headerBrand}>
                    <View style={s.headerBrandIcon}>
                        <Text style={s.headerBrandIconText}>AI</Text>
                    </View>
                    <Text style={[s.headerBrandName, { color: textPrimary }]}>Bác sĩ Ảo</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={[s.planPill, { borderColor }]} onPress={() => navigation.navigate('ClientUpgrade')}>
                    <Text style={[s.planPillFree, { color: textMuted }]}>Gói miễn phí</Text>
                    <View style={s.planDivider} />
                    <Text style={s.planPillUpgrade}>Nâng cấp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.avatarBtn} onPress={() => setShowUserMenu(true)}>
                    <View style={[s.avatarCircle, { overflow: 'hidden' }]}>
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={s.avatarCircleImage} />
                        ) : (
                            <Text style={s.avatarText}>{initials}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                {loadingMessages ? (
                    <View style={s.centered}>
                        <ActivityIndicator color="#2563EB" size="large" />
                    </View>
                ) : messages.length === 0 ? (
                    <View style={s.welcome}>
                        <View style={s.sparkleBox}>
                            <Ionicons name="sparkles" size={28} color="#2563EB" />
                        </View>
                        <Text style={[s.welcomeTitle, { color: textPrimary }]}>
                            Chào {getGreeting()}, hôm nay{'\n'}bạn cần hỗ trợ gì?
                        </Text>
                        <Text style={[s.welcomeSub, { color: textMuted }]}>
                            Mô tả triệu chứng, đặt câu hỏi về sức khỏe hoặc dùng micro để bắt đầu trao đổi.
                        </Text>
                        {InputCard()}
                        {!!error && (
                            <View style={[s.errorBanner, { borderColor: '#FCA5A5', backgroundColor: isDarkMode ? '#2A1214' : '#FEF2F2' }]}>
                                <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
                                <Text style={s.errorText}>{error}</Text>
                            </View>
                        )}
                        {isLimitReached && (
                            <View style={[s.limitBanner, { borderColor: '#FCD34D', backgroundColor: isDarkMode ? '#1C1A09' : '#FFFBEB' }]}>
                                <Ionicons name="alert-circle-outline" size={15} color="#D97706" />
                                <Text style={s.limitText}>Bạn đã đạt hạn mức tin nhắn. Vui lòng bắt đầu cuộc trò chuyện mới.</Text>
                            </View>
                        )}
                        <Text style={[s.disclaimer, { color: placeholderColor }]}>
                            Bác sĩ Ảo có thể mắc sai lầm. Vui lòng kiểm tra lại thông tin.
                        </Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item, idx) => item._id ?? `msg-${idx}`}
                            renderItem={renderMessage}
                            contentContainerStyle={s.msgList}
                            ListFooterComponent={isThinking ? <ThinkingBubble isDarkMode={isDarkMode} /> : null}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                        <View style={[s.inputArea, { backgroundColor: bg }]}>
                            {InputCard()}
                            {!!error && (
                                <View style={[s.errorBanner, { borderColor: '#FCA5A5', backgroundColor: isDarkMode ? '#2A1214' : '#FEF2F2' }]}>
                                    <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
                                    <Text style={s.errorText}>{error}</Text>
                                </View>
                            )}
                            {isLimitReached && (
                                <View style={[s.limitBanner, { borderColor: '#FCD34D', backgroundColor: isDarkMode ? '#1C1A09' : '#FFFBEB' }]}>
                                    <Ionicons name="alert-circle-outline" size={15} color="#D97706" />
                                    <Text style={s.limitText}>Bạn đã đạt hạn mức tin nhắn. Vui lòng bắt đầu cuộc trò chuyện mới.</Text>
                                </View>
                            )}
                            <Text style={[s.disclaimer, { color: placeholderColor }]}>
                                Bác sĩ Ảo có thể mắc sai lầm. Vui lòng kiểm tra lại thông tin.
                            </Text>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>

            <Modal visible={!!messageActionSheet} transparent animationType="fade" onRequestClose={() => setMessageActionSheet(null)}>
                <TouchableWithoutFeedback onPress={() => setMessageActionSheet(null)}>
                    <View style={s.overlay} />
                </TouchableWithoutFeedback>
                <View style={[s.messageSheet, { backgroundColor: cardBg, borderColor }]}>
                    <View style={s.messageSheetHandle} />
                    <Text style={[s.messageSheetTitle, { color: textPrimary }]}>Tuỳ chọn tin nhắn</Text>
                    <Text style={[s.messageSheetPreview, { color: textMuted }]} numberOfLines={2}>
                        {messageActionSheet?.text}
                    </Text>

                    {sheetIsUserMessage && (
                        <>
                            <TouchableOpacity
                                style={[s.messageSheetOption, sheetEditDisabled && s.messageSheetOptionDisabled]}
                                onPress={() => handleEditMessage(messageActionSheet?.text)}
                                disabled={sheetEditDisabled}
                            >
                                <Ionicons name="create-outline" size={18} color={sheetEditDisabled ? '#94A3B8' : '#2563EB'} />
                                <Text style={[s.messageSheetOptionText, { color: sheetEditDisabled ? '#94A3B8' : textPrimary }]}>Sửa lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.messageSheetOption, sheetResendDisabled && s.messageSheetOptionDisabled]}
                                onPress={() => {
                                    const text = messageActionSheet?.text;
                                    setMessageActionSheet(null);
                                    handleResend(text);
                                }}
                                disabled={sheetResendDisabled}
                            >
                                <Ionicons name="refresh-outline" size={18} color={sheetResendDisabled ? '#94A3B8' : '#2563EB'} />
                                <Text style={[s.messageSheetOptionText, { color: sheetResendDisabled ? '#94A3B8' : textPrimary }]}>Gửi lại</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!sheetIsUserMessage && (
                        <TouchableOpacity
                            style={[s.messageSheetOption, sheetVoiceDisabled && s.messageSheetOptionDisabled]}
                            onPress={() => {
                                const text = messageActionSheet?.text;
                                setMessageActionSheet(null);
                                playAssistantVoice(text, activeConversation?._id);
                            }}
                            disabled={sheetVoiceDisabled}
                        >
                            <Ionicons name="volume-high-outline" size={18} color={sheetVoiceDisabled ? '#94A3B8' : '#2563EB'} />
                            <Text style={[s.messageSheetOptionText, { color: sheetVoiceDisabled ? '#94A3B8' : textPrimary }]}>Nghe câu trả lời</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={s.messageSheetOption}
                        onPress={() => {
                            const { text, id } = messageActionSheet || {};
                            setMessageActionSheet(null);
                            handleCopyMessage(text, id);
                        }}
                    >
                        <Ionicons name="copy-outline" size={18} color="#2563EB" />
                        <Text style={[s.messageSheetOptionText, { color: textPrimary }]}>Copy nội dung</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={showAttachMenu} transparent animationType="fade" onRequestClose={() => setShowAttachMenu(false)}>
                <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
                    <View style={[s.attachMenu, { backgroundColor: cardBg }]}>
                        <Text style={[s.attachMenuTitle, { color: textPrimary }]}>Đính kèm ảnh</Text>
                        <TouchableOpacity style={s.attachItem} onPress={pickImageFromLibrary}>
                            <View style={[s.attachIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="images-outline" size={22} color="#2563EB" />
                            </View>
                            <Text style={[s.attachLabel, { color: textPrimary }]}>Thư viện ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.attachItem} onPress={takePhoto}>
                            <View style={[s.attachIcon, { backgroundColor: '#DCFCE7' }]}>
                                <Ionicons name="camera-outline" size={22} color="#16A34A" />
                            </View>
                            <Text style={[s.attachLabel, { color: textPrimary }]}>Chụp ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.attachItem, { marginTop: 4 }]} onPress={() => setShowAttachMenu(false)}>
                            <Text style={{ color: '#EF4444', fontWeight: '600', textAlign: 'center', width: '100%' }}>Huỷ</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal visible={showUserMenu} transparent animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
                <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowUserMenu(false)}>
                    <View style={[s.userMenu, { backgroundColor: cardBg, borderColor }]}>
                        <View style={s.userMenuHead}>
                            <View style={[s.userMenuAvatar, { overflow: 'hidden' }]}>
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={s.userMenuAvatarImage} />
                                ) : (
                                    <Text style={s.userMenuAvatarText}>{initials}</Text>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.userMenuName, { color: textPrimary }]} numberOfLines={1}>
                                    {user?.fullName ?? 'Người dùng'}
                                </Text>
                                <Text style={[s.userMenuSub, { color: textMuted }]} numberOfLines={1}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                        <View style={[s.userMenuDivider, { backgroundColor: borderColor }]} />
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); navigation.dispatch(DrawerActions.openDrawer()); }}>
                            <Ionicons name="time-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Lịch sử khám</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); startNewConversation('qwen'); }}>
                            <Ionicons name="add-circle-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Khám mới</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); navigation.navigate('ClientSettings'); }}>
                            <Ionicons name="settings-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Cài đặt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); navigation.navigate('ClientUpgrade'); }}>
                            <Ionicons name="rocket-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Nâng cấp gói</Text>
                        </TouchableOpacity>
                        <View style={[s.userMenuDivider, { backgroundColor: borderColor }]} />
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); navigation.navigate('ClientUsagePolicy'); }}>
                            <Ionicons name="document-text-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Chính sách sử dụng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.userMenuItem} onPress={() => { setShowUserMenu(false); navigation.navigate('ClientPrivacyPolicy'); }}>
                            <Ionicons name="shield-outline" size={18} color={textMuted} />
                            <Text style={[s.userMenuItemText, { color: textPrimary }]}>Chính sách quyền riêng tư</Text>
                        </TouchableOpacity>
                        <View style={[s.userMenuDivider, { backgroundColor: borderColor }]} />
                        <TouchableOpacity style={s.userMenuItem} onPress={confirmLogout}>
                            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                            <Text style={[s.userMenuItemText, { color: '#EF4444' }]}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {!!copiedMessageId && (
                <View style={[s.copyToast, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                    <Text style={[s.copyToastText, { color: textPrimary }]}>Đã copy tin nhắn</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, gap: 10,
    },
    menuBtn: { padding: 4 },
    headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerBrandIcon: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    },
    headerBrandIconText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    headerBrandName: { fontSize: 15, fontWeight: '700' },
    planPill: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5, gap: 6,
    },
    planPillFree: { fontSize: 12 },
    planDivider: { width: 1, height: 12, backgroundColor: '#E2E8F0' },
    planPillUpgrade: { fontSize: 12, fontWeight: '700', color: '#2563EB', textDecorationLine: 'underline' },
    avatarBtn: { marginLeft: 2 },
    avatarCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    },
    avatarCircleImage: { width: 32, height: 32, borderRadius: 16 },
    avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 14 },
    sparkleBox: {
        width: 58, height: 58, borderRadius: 29,
        backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    welcomeTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', lineHeight: 32 },
    welcomeSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
    inputCard: {
        width: '100%', borderRadius: 16, borderWidth: 1,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
        shadowRadius: 12, elevation: 4,
        overflow: 'hidden',
    },
    voiceStatus: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 10, marginTop: 10,
        paddingHorizontal: 12, paddingVertical: 9,
        borderRadius: 12, borderWidth: 1,
    },
    voiceStatusInfo: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    voiceStatusRecording: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    voiceStatusText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
    inputField: {
        paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
        minHeight: 60, maxHeight: 120, fontSize: 15,
    },
    imgPreviewRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 6 },
    imgPreview: { width: 52, height: 52, borderRadius: 8 },
    imgRemove: { position: 'absolute', left: 44, top: -6 },
    inputToolbar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 8,
        borderTopWidth: 1, gap: 4,
    },
    toolBtn: { padding: 6 },
    micRecordingBtn: { backgroundColor: '#EF4444', borderRadius: 16 },
    modelPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.04)',
    },
    modelPillText: { fontSize: 12, fontWeight: '500' },
    sendBtn: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center', marginLeft: 4,
    },
    sendBtnActive: { backgroundColor: '#2563EB' },
    sendBtnIdle: { backgroundColor: 'transparent' },
    sendBtnStop: { backgroundColor: '#EF4444' },

    disclaimer: { fontSize: 12, textAlign: 'center', marginTop: 2 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    msgList: { padding: 14, paddingBottom: 4 },
    inputArea: { paddingHorizontal: 14, paddingBottom: 8, paddingTop: 4 },
    msgRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    msgRowUser: { justifyContent: 'flex-end' },
    msgRowBot: { justifyContent: 'flex-start' },
    msgBodyCol: { flexShrink: 1, maxWidth: '82%' },
    botAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#2563EB', alignItems: 'center',
        justifyContent: 'center', marginRight: 8,
    },
    bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleUser: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
    bubbleBot: { borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    msgText: { lineHeight: 22 },
    msgTextUser: { color: '#FFFFFF' },
    msgTextBot: {},
    timestamp: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
    timestampUser: { color: 'rgba(255,255,255,0.6)' },
    imgBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
    imgBoxText: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },
    systemMsgRow: { alignItems: 'center', marginBottom: 10 },
    systemMsgPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1, borderRadius: 14,
        paddingHorizontal: 10, paddingVertical: 6,
    },
    systemMsgText: { fontSize: 12, fontWeight: '700' },
    riskBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 6,
        backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
        borderRadius: 10, padding: 10, marginTop: 6,
    },
    riskText: { flex: 1, color: '#DC2626', fontSize: 12, lineHeight: 17 },

    sourcesBox: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, gap: 3 },
    sourcesHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    sourcesTitle: { fontSize: 11, fontWeight: '600' },
    sourceItem: { fontSize: 11, lineHeight: 16 },

    limitBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 8 },
    limitText: { flex: 1, fontSize: 12, color: '#D97706', lineHeight: 17 },
    errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 8 },
    errorText: { flex: 1, fontSize: 12, color: '#DC2626', lineHeight: 17 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    copyToast: {
        position: 'absolute', left: 20, right: 20, bottom: 92,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderWidth: 1, borderRadius: 16,
        paddingHorizontal: 14, paddingVertical: 10,
        shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 5,
    },
    copyToastText: { fontSize: 13, fontWeight: '700' },
    messageSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderWidth: 1, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22,
        gap: 8,
    },
    messageSheetHandle: {
        width: 42, height: 4, borderRadius: 2,
        backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 6,
    },
    messageSheetTitle: { fontSize: 15, fontWeight: '800' },
    messageSheetPreview: {
        fontSize: 13, lineHeight: 18,
        paddingBottom: 6, marginBottom: 2,
    },
    messageSheetOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 12, paddingVertical: 12,
        borderRadius: 12,
    },
    messageSheetOptionDisabled: { opacity: 0.55 },
    messageSheetOptionText: { flex: 1, fontSize: 15, fontWeight: '700' },
    modelCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1,
        padding: 20, gap: 10,
    },
    modelCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    modelOption: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: 12, borderRadius: 10, borderWidth: 1,
    },
    modelOptionActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
    modelOptionDot: { width: 8, height: 8, borderRadius: 4 },
    modelOptionText: { flex: 1, fontSize: 14, fontWeight: '500' },
    attachMenu: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, gap: 10,
    },
    attachMenuTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    attachItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10 },
    attachIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    attachLabel: { fontSize: 15 },
    userMenu: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderWidth: 1, paddingBottom: 20, overflow: 'hidden',
    },
    userMenuHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
    userMenuAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    },
    userMenuAvatarImage: { width: 44, height: 44, borderRadius: 22 },
    userMenuAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    userMenuName: { fontSize: 15, fontWeight: '700' },
    userMenuSub: { fontSize: 13, marginTop: 2 },
    userMenuDivider: { height: 1, marginVertical: 4 },
    userMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 13 },
    userMenuItemText: { fontSize: 15 },
});

export default ChatScreen;
