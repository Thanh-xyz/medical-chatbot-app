import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const THINKING_STAGES = [
    'Đang phân tích câu hỏi sức khỏe...',
    'Đang tra cứu cơ sở dữ liệu y khoa...',
    'Đang tổng hợp thông tin phù hợp...',
    'Bác sĩ Ảo đang soạn khuyến nghị...',
];

const DOT_COLORS = ['#2563EB', '#06B6D4', '#14B8A6'];

const ThinkingBubble = ({ isDarkMode }) => {
    const dots = useRef([new Animated.Value(0.35), new Animated.Value(0.35), new Animated.Value(0.35)]).current;
    const [stageIndex, setStageIndex] = useState(0);

    useEffect(() => {
        const animations = dots.map((dot, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 140),
                    Animated.timing(dot, { toValue: 1, duration: 260, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.35, duration: 260, useNativeDriver: true }),
                ])
            )
        );
        animations.forEach((animation) => animation.start());
        return () => animations.forEach((animation) => animation.stop());
    }, [dots]);

    useEffect(() => {
        const timer = setInterval(() => {
            setStageIndex((current) => (current + 1) % THINKING_STAGES.length);
        }, 1800);

        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.row}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>AI</Text>
            </View>
            <View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                        borderColor: isDarkMode ? '#334155' : '#D8E3EC',
                    },
                ]}
            >
                <View style={styles.dots}>
                    {dots.map((dot, index) => (
                        <Animated.View
                            key={DOT_COLORS[index]}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: DOT_COLORS[index],
                                    opacity: dot,
                                    transform: [{ scale: dot }],
                                },
                            ]}
                        />
                    ))}
                </View>
                <Text
                    style={[styles.text, { color: isDarkMode ? '#CBD5E1' : '#64748B' }]}
                    numberOfLines={1}
                >
                    {THINKING_STAGES[stageIndex]}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#2563EB',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        minHeight: 56,
        maxWidth: '82%',
        flexShrink: 1,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#0F172A',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        gap: 12,
    },
    text: { flex: 1, fontSize: 13, fontWeight: '700', fontStyle: 'italic' },
    dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dot: { width: 8, height: 8, borderRadius: 4 },
});

export default ThinkingBubble;
