import { Alert, Linking, Share } from 'react-native';
import { Config } from '../constants/Config';

export type BridgeMessage = {
    command: string;
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
    handleMessage: async (event: any, navigationFuncs: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data) as BridgeMessage;
            console.log('[Bridge] Received:', data);

            switch (data.command) {
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
                    console.warn('[Bridge] Unknown Command:', data.command);
            }
        } catch (e) {
            console.error('[Bridge] Parse Error', e);
        }
    }
};
