import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const SettingRow = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
        <View style={[styles.settingIcon, { backgroundColor: (danger ? COLORS.danger : COLORS.primary) + '15' }]}>
            <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
        </View>
        <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
    </TouchableOpacity>
);

const AdminSettingScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionHeader}>Admin Panel</Text>

                <View style={styles.card}>
                    <SettingRow
                        icon="people-outline"
                        label="Manage Users"
                        onPress={() => navigation.navigate('AdminUserList')}
                    />
                    <SettingRow
                        icon="chatbubbles-outline"
                        label="Manage Conversations"
                        onPress={() => navigation.navigate('AdminConversationList')}
                    />
                    <SettingRow
                        icon="mail-outline"
                        label="View Messages"
                        onPress={() => navigation.navigate('AdminMessageList')}
                    />
                </View>

                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.card}>
                    <SettingRow
                        icon="person-outline"
                        label="My Account"
                        onPress={() => navigation.navigate('AdminAccount')}
                    />
                    <SettingRow
                        icon="log-out-outline"
                        label="Sign Out"
                        onPress={() =>
                            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Sign Out', style: 'destructive', onPress: () => navigation.navigate('AdminLogin') },
                            ])
                        }
                        danger
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    container: { padding: 16 },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
});

export default AdminSettingScreen;
