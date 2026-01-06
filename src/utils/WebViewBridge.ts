import { Alert, Linking, Share, Platform } from 'react-native';
import { Config } from '../constants/Config';

export type BridgeMessage = {
    type?: string; // 프론트엔드에서 type으로 보내는 경우 호환
    command?: string;
    payload?: any;
};

export const WebViewBridge = {
    // 웹뷰에 주입할 자바스크립트 (window.ReactNativeWebView.postMessage 편의 함수)
    injectedJavaScript: `
        (function() {
            window.AppBridge = {
                send: function(command, payload) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({command: command, payload: payload}));
                },
                login: function(token) {
                    this.send('${Config.BRIDGE_CMD.LOGIN}', { token: token });
                },
                openBrowser: function(url) {
                    this.send('${Config.BRIDGE_CMD.OPEN_BROWSER}', { url: url });
                }
            };
        })();
        true;
    `,

    // 메시지 핸들러
    handleMessage: async (event: any, webViewRef: any) => {
        try {
            const rawData = event.nativeEvent.data;
            const data = JSON.parse(rawData) as BridgeMessage;
            console.log('[Bridge] Received:', data);

            // 프론트엔드에서 { type: 'GET_DEVICE_TOKEN' } 형태로 보낼 때 처리
            const command = data.command || data.type;

            switch (command) {
                case 'GET_DEVICE_TOKEN':
                    // 실제 디바이스 토큰 가져오는 로직 (FCM 등)
                    // 여기서는 Mock 토큰 반환
                    const mockToken = "mock_device_token_" + Platform.OS + "_" + Date.now();
                    const response = JSON.stringify({
                        type: 'DEVICE_TOKEN',
                        token: mockToken,
                        deviceType: Platform.OS
                    });
                    
                    // 웹뷰로 응답 전송
                    webViewRef.current?.postMessage(response);
                    console.log('[Bridge] Sent Device Token:', response);
                    break;

                case Config.BRIDGE_CMD.LOGIN:
                    // 로그인 처리 (토큰 저장 등)
                    Alert.alert('Bridge', `로그인 요청 받음: ${data.payload?.token}`);
                    // navigationFuncs.onLoginSuccess(); // 예시
                    break;

                case Config.BRIDGE_CMD.OPEN_BROWSER:
                    if (data.payload?.url) {
                        await Linking.openURL(data.payload.url);
                    }
                    break;

                case Config.BRIDGE_CMD.SHARE:
                    if (data.payload?.message) {
                        await Share.share({
                            message: data.payload.message,
                            url: data.payload.url
                        });
                    }
                    break;

                case Config.BRIDGE_CMD.CONSOLE_LOG:
                    console.log('[WebLog]', data.payload?.message);
                    break;

                default:
                    console.warn('[Bridge] Unknown Command:', command);
            }
        } catch (e) {
            console.error('[Bridge] Parse Error', e);
        }
    }
};
