import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Config } from '../constants/Config';
import { WebViewBridge } from '../utils/WebViewBridge';

interface Props {
    url?: string; // 외부에서 주입된 URL (DeepLink 등)
}

export const MainWebView: React.FC<Props> = ({ url }) => {
    const webViewRef = useRef<WebView>(null);
    const initialUrl = url || Config.MAIN_URL;

    const handleShouldStartLoadWithRequest = (request: any) => {
        const { url } = request;

        // 1. 메인 URL은 무조건 허용
        if (url === Config.MAIN_URL) return true;
        if (url.startsWith('about:blank')) return true;

        // 2. 도메인 체크
        const isAllowed = Config.ALLOWED_DOMAINS.some(domain => url.includes(domain));

        if (!isAllowed) {
            // 외부 링크는 브라우저로 열기 옵션 제공 또는 차단
            Alert.alert(
                '알림',
                '외부 사이트로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel', onPress: () => false },
                    {
                        text: '이동', onPress: () => {
                            // Linking.openURL(url); // 필요시
                            return false;
                        }
                    }
                ]
            );
            return false;
        }

        return true;
    };

    const handleMessage = (event: any) => {
        // webViewRef를 전달하여 브릿지에서 postMessage를 사용할 수 있게 함
        WebViewBridge.handleMessage(event, webViewRef);
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: initialUrl }}
                style={styles.webview}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                startInLoadingState={true}
                javaScriptEnabled={true}
                injectedJavaScript={WebViewBridge.injectedJavaScript}
                onMessage={handleMessage}
                renderLoading={() => (
                    <ActivityIndicator
                        style={styles.loading}
                        size="large"
                        color="#007AFF"
                    />
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -25,
        marginTop: -25,
    },
});
