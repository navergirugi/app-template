import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Linking, Alert } from 'react-native';
import { Config } from './src/constants/Config';

// Components
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainWebView } from './src/screens/MainWebView';
import { InAppNotification } from './src/components/InAppNotification';

// Types
type ScreenType = 'Splash' | 'Onboarding' | 'Login' | 'Main';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Splash');
  const [tutorialData, setTutorialData] = useState<any[]>([]);
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);

  // In-App Notification State
  const [notification, setNotification] = useState({
    visible: false,
    title: '',
    message: ''
  });

  // Mock State (In-Memory Storage)
  // 앱을 끄면 초기화됨 (사용자 합의 사항)
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  // Mock Notification Trigger
  useEffect(() => {
    // 10초 후에 가상의 푸시 알림 도착 시뮬레이션
    const timer = setTimeout(() => {
      setNotification({
        visible: true,
        title: '깜짝 선물 도착! 🎁',
        message: '지금 접속하시면 할인 쿠폰을 드려요! (탭해서 확인)'
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Deep Link & Push Logic
  useEffect(() => {
    // 1. 앱 실행 시 초기 URL 체크 (Cold Start)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // 2. 앱 실행 중 URL 이벤트 리스너 (Warm Start)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('[App] Deep Link Detected:', url);
    // URL 스킴 파싱 (예: myapp://open?url=...)
    // 여기서는 간단히 전체 URL 혹은 쿼리 파라미터를 사용한다고 가정
    // 실제로는 url-parse 등을 사용하거나 정규식 사용

    // 테스트용: myapp://test -> Config.MAIN_URL로 이동 (테스트 버튼처럼 동작)
    if (url.includes('test')) {
      Alert.alert('Deep Link', '테스트 링크로 진입했습니다!');
      setInitialUrl('https://m.naver.com/news'); // 뉴스 페이지로 강제 이동 예시
      setCurrentScreen('Main');
      return;
    }

    // 일반적인 웹뷰 이동: myapp://webview?url=https...
    if (url.includes('webview')) {
      const targetUrl = url.split('url=')[1];
      if (targetUrl) {
        setInitialUrl(targetUrl);
        setCurrentScreen('Main');
      }
    }
  };

  // Mock API Logic
  const checkToken = async (): Promise<boolean> => {
    console.log('[App] Checking Token...');
    // 실제로는 AsyncStorage 등에서 토큰을 불러와 유효성 검사
    return new Promise(resolve => {
      // 50% 확률로 토큰이 있다/없다 시뮬레이션 하거나, 현재는 false(없음) 고정
      resolve(hasToken);
    });
  };

  const exchangeToken = async (loginInfo?: any): Promise<void> => {
    console.log('[App] Exchanging App Token with API...', loginInfo ? 'With Login Info' : 'No Login Info');
    // 실제 API 호출 로직: await api.post('/auth/exchange', { appToken: Config.APP_TOKEN, ...loginInfo });
    return new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기 시뮬레이션
  };

  const fetchTutorialData = async (): Promise<any[]> => {
    console.log(`[App] Fetching Tutorial Data... Mock Mode: ${Config.USE_MOCK_API}`);

    if (Config.USE_MOCK_API) {
      // Mock 데이터 사용 (json 파일 import)
      return new Promise(resolve => {
        setTimeout(() => {
          // require를 사용하여 동적으로 로드 (혹은 상단 import 사용 가능)
          const mockData = require('./src/mocks/tutorial.json');
          resolve(mockData);
        }, 500);
      });
    }

    // 실제 API 호출 로직 (API가 구현되면 이곳을 활성화)
    // const res = await api.get('/tutorial');
    // return res.data;

    console.log('[App] Real API Call - Not Implemented yet, returning default.');
    return new Promise(resolve => setTimeout(() => resolve(Config.DEFAULT_ONBOARDING_DATA), 1000));
  };

  const checkOnboarding = async (): Promise<boolean> => {
    console.log('[App] Checking Onboarding Record...');
    return new Promise(resolve => resolve(hasOnboarded));
  };

  const handleSplashFinish = (nextScreen: ScreenType, fetchedTutorialData?: any[]) => {
    console.log(`[App] Splash Finished. Next: ${nextScreen}`);
    if (fetchedTutorialData) {
      setTutorialData(fetchedTutorialData);
    }
    // Deep Link가 이미 들어와서 Main으로 가야한다면 덮어쓰기 로직 필요
    // 여기서는 간단히 Splash가 정해준대로 가되, initialUrl이 있으면 Main으로 보낼 수도 있음
    if (initialUrl) {
      setCurrentScreen('Main');
    } else {
      setCurrentScreen(nextScreen);
    }
  };

  const handleOnboardingFinish = () => {
    setHasOnboarded(true); // 기록 저장
    // Config.REQUIRE_LOGIN 설정에 따라 분기
    if (Config.REQUIRE_LOGIN) {
      setCurrentScreen('Login');
    } else {
      setCurrentScreen('Main');
    }
  };

  const handleLoginSuccess = () => {
    setHasToken(true); // 토큰 저장
    setCurrentScreen('Main');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {currentScreen === 'Splash' && (
        <SplashScreen
          onFinish={handleSplashFinish}
          checkToken={checkToken}
          checkOnboarding={checkOnboarding}
          exchangeToken={exchangeToken}
          fetchTutorialData={fetchTutorialData}
        />
      )}

      {currentScreen === 'Onboarding' && (
        <OnboardingScreen
          onFinish={handleOnboardingFinish}
          data={tutorialData}
        />
      )}

      {currentScreen === 'Login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {currentScreen === 'Main' && (
        <MainWebView url={initialUrl} />
      )}

      {/* 인앱 알림 컴포넌트 (Global) */}
      <InAppNotification
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        onPress={() => {
          console.log('[App] Notification Pressed');
          setNotification(prev => ({ ...prev, visible: false }));
          // 알림 클릭 시 특정 화면으로 이동하거나 동작 처리
          Alert.alert('알림 클릭', '이벤트 페이지로 이동합니다.');
        }}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
