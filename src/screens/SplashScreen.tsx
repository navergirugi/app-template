import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Dimensions, Animated, Alert, Linking } from 'react-native';
import { Config } from '../constants/Config';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: (nextScreen: 'Onboarding' | 'Login' | 'Main', tutorialData?: any[]) => void;
    checkToken: () => Promise<boolean>;
    checkOnboarding: () => Promise<boolean>;
    exchangeToken: (loginInfo?: any) => Promise<void>;
    fetchTutorialData: () => Promise<any[]>;
}

export const SplashScreen: React.FC<Props> = ({
    onFinish,
    checkToken,
    checkOnboarding,
    exchangeToken,
    fetchTutorialData
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        // 이미지 롤링 로직
        if (Config.SPLASH_IMAGES.length > 1) {
            const intervalTime = Config.SPLASH_TIME / Config.SPLASH_IMAGES.length;

            const interval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0.2,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    })
                ]).start();

                setTimeout(() => {
                    setCurrentImageIndex(prev => (prev + 1) % Config.SPLASH_IMAGES.length);
                }, 200);

            }, intervalTime);

            return () => clearInterval(interval);
        }
    }, [fadeAnim]);

    const checkUpdate = async (): Promise<boolean> => {
        // 업데이트 체크 로직
        console.log('[Splash] Checking for Updates...');
        try {
            let updateInfo;
            if (Config.USE_MOCK_API) {
                // Mock Delay
                await new Promise(r => setTimeout(r, 300));
                updateInfo = require('../mocks/update.json');
            } else {
                // Real API Call
                // const res = await api.get('/version'); updateInfo = res.data;
                updateInfo = { forceUpdate: false, latestVersion: Config.APP_VERSION };
            }

            // 버전 비교 (단순 문자열 비교 Mock) for Demo
            if (updateInfo.latestVersion !== Config.APP_VERSION) {
                return new Promise(resolve => {
                    Alert.alert(
                        '업데이트 알림',
                        updateInfo.message || '새로운 버전이 있습니다.',
                        [
                            {
                                text: '나중에',
                                style: 'cancel',
                                onPress: () => {
                                    if (updateInfo.forceUpdate) {
                                        // 강제 업데이트면 앱 종료 혹은 다시 알림 (여기선 다시 알림으로 무한 루프 방지 위해 그냥 둠.. 실제론 BackHandler.exitApp())
                                        Alert.alert('알림', '필수 업데이트입니다.');
                                        resolve(false); // 진행 불가
                                    } else {
                                        resolve(true); // 진행 가능
                                    }
                                }
                            },
                            {
                                text: '업데이트',
                                onPress: () => {
                                    Linking.openURL(updateInfo.storeUrl);
                                    resolve(false); // 스토어로 이동하므로 앱 진입 중단
                                }
                            }
                        ],
                        { cancelable: !updateInfo.forceUpdate }
                    );
                });
            }
            return true;
        } catch (e) {
            console.error('Update Check Failed', e);
            return true; // 에러나면 일단 진입 허용
        }
    };

    useEffect(() => {
        const init = async () => {
            console.log('[Splash] Starting Initialization...');
            const startTime = Date.now();

            // 1. 필수 대기 시간 (Config.SPLASH_TIME)
            const waitPromise = new Promise(resolve => setTimeout(resolve, Config.SPLASH_TIME));

            // 2. 업데이트 체크 (가장 먼저 수행하거나 병렬로 수행 후 확인)
            const canProceed = await checkUpdate();
            if (!canProceed) return; // 업데이트 하러 감

            // 3. 비즈니스 로직 병렬 처리
            // - 토큰 교환 (로그인 정보가 있으면 같이 보냄, 여기서는 Mock으로 null 전달)
            // - 튜토리얼 데이터 미리 가져오기
            // - 기존 토큰/온보딩 체크
            const [_, tokenCheckResult, onboardingCheckResult, tutorialData] = await Promise.all([
                waitPromise,
                checkToken(),
                checkOnboarding(),
                fetchTutorialData(),
                exchangeToken({ some: 'loginInfo' }) // 예시 로그인 정보
            ]);

            const endTime = Date.now();
            console.log(`[Splash] Initialization done in ${endTime - startTime}ms`);
            console.log(`[Splash] Results - hasToken: ${tokenCheckResult}, onboarded: ${onboardingCheckResult}`);

            // 4. 네비게이션 분기 처리

            // 튜토리얼 노출 조건:
            // 1. Config.SHOW_TUTORIAL이 true여야 함
            // 2. 온보딩 기록이 없거나 (항상 보여주기 옵션이 있다면 여기서 체크 가능)

            if (Config.SHOW_TUTORIAL && !onboardingCheckResult) {
                // 튜토리얼로 이동 (데이터 전달)
                onFinish('Onboarding', tutorialData);
            } else if (!tokenCheckResult && Config.REQUIRE_LOGIN) {
                // 로그인 필요 시 로그인으로
                onFinish('Login');
            } else {
                // 바로 메인으로
                onFinish('Main');
            }
        };

        init();
    }, []);

    const currentImageUrl = Config.SPLASH_IMAGES.length > 0
        ? Config.SPLASH_IMAGES[currentImageIndex]
        : 'https://images.unsplash.com/photo-1620912189865-1e8a33da4c5e?q=80&w=1000&auto=format&fit=crop';

    return (
        <View style={styles.container}>
            <Animated.Image
                source={{ uri: currentImageUrl }}
                style={[styles.image, { opacity: fadeAnim }]}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <Text style={styles.text}>My App</Text>
                <Text style={styles.subText}>v{Config.APP_VERSION}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    image: {
        width: width,
        height: height,
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    text: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#f0f0f0',
    },
});
