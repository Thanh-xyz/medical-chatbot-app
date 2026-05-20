export const goBackOrNavigate = (navigation, fallbackRoute = 'Chat') => {
    if (navigation?.canGoBack?.()) {
        navigation.goBack();
        return;
    }

    navigation?.navigate?.(fallbackRoute);
};
