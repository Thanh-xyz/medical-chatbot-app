import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const AdminHeader = ({ title, onMenuPress, onLogout }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                    <Ionicons name="menu" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <Text style={styles.title}>{title}</Text>

                <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: COLORS.primary,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
    },
    title: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    iconButton: {
        padding: 4,
    },
});

export default AdminHeader;
