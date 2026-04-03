import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminLoginScreen from '../screens/Auth/AdminLoginScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientLogin" component={LoginScreen} />
            <Stack.Screen name="ClientRegister" component={RegisterScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
