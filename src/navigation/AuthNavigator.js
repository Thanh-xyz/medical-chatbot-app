import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminLoginScreen from '../screens/Auth/AdminLoginScreen';
import { isAdminApp } from '../config/appVariant';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName={isAdminApp ? 'AdminLogin' : 'ClientLogin'}
            screenOptions={{ headerShown: false }}
        >
            {!isAdminApp && (
                <>
                    <Stack.Screen name="ClientLogin" component={LoginScreen} />
                    <Stack.Screen name="ClientRegister" component={RegisterScreen} />
                </>
            )}
            {isAdminApp && <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />}
        </Stack.Navigator>
    );
};

export default AuthNavigator;
