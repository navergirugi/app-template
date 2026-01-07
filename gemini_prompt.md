# React Native WebView 하이브리드 앱 프로젝트 분석

이 문서는 `react-native-webview` 프로젝트의 기술 스택, 아키텍처, 핵심 로직, 커스터마이징 방법 등을 상세히 기록하여, 새로운 개발자나 다른 Gemini 채팅 세션에서 프로젝트의 전체 맥락을 빠르게 파악할 수 있도록 돕는 것을 목표로 합니다.

## 1. 프로젝트 개요

-   **프로젝트명**: `react-native-webview`
-   **핵심 아키텍처**: **하이브리드 앱 (Hybrid App)**
    -   React Native를 "네이티브 쉘(Native Shell)"로 사용하고, 핵심 비즈니스 로직과 UI는 웹뷰(WebView) 내에서 실행되는 웹 애플리케이션(`influon-ai` 프로젝트)이 담당합니다.
    -   앱은 웹이 할 수 없는 네이티브 기능(푸시 알림, 위치 정보, 딥링크 등)을 제공하고 웹과 연동하는 "창구" 역할을 합니다.

## 2. 주요 기술 스택

-   **코어**: React Native
-   **웹뷰**: `react-native-webview`
-   **네이티브 권한 관리**: `react-native-permissions`
-   **상태 관리**: `useState` 및 `useEffect`를 사용한 컴포넌트 레벨의 간단한 상태 관리
-   **설정 관리**: 중앙화된 `Config.ts` 파일을 통한 환경 설정

## 3. 앱 실행 흐름 및 화면 구성

앱의 전체적인 화면 전환은 `App.tsx` 파일이 중앙에서 관리합니다.

1.  **`SplashScreen.tsx` (스플래시 화면)**
    -   **역할**: 앱의 첫 로딩 화면. 백그라운드에서 필수 선행 작업을 수행합니다.
    -   **주요 로직**:
        -   `checkToken()`: 저장된 로그인 토큰 유효성 검사 (현재는 Mock)
        -   `checkOnboarding()`: 온보딩(튜토리얼) 완료 여부 확인 (현재는 Mock)
        -   `fetchTutorialData()`: 온보딩에 사용할 데이터 로드
    -   **결과**: 위 작업들의 결과에 따라 다음에 보여줄 화면(`Onboarding`, `Login`, `Main`)을 결정하여 `App.tsx`로 전달합니다.

2.  **`OnboardingScreen.tsx` (온보딩 화면)**
    -   **역할**: 앱 최초 사용자에게 서비스 소개 및 안내를 제공합니다.
    -   **주요 로직**:
        -   `App.tsx`로부터 받은 `tutorialData`를 화면에 렌더링합니다.
        -   사용자가 온보딩을 완료하면 `onFinish` 콜백을 호출하여 다음 화면으로 전환합니다.

3.  **`LoginScreen.tsx` (네이티브 로그인 화면)**
    -   **역할**: 웹뷰를 띄우기 전, 네이티브 레벨에서 로그인이 필요할 경우 사용됩니다.
    -   **주요 로직**:
        -   `Config.REQUIRE_LOGIN` 설정이 `true`일 때만 사용됩니다.
        -   로그인 성공 시 `onLoginSuccess` 콜백을 호출하여 메인 화면으로 전환합니다.
    -   **참고**: 현재 프로젝트는 웹뷰 내에서 로그인을 처리하는 것을 기본 전략으로 하므로, 이 화면은 거의 사용되지 않을 수 있습니다.

4.  **`MainWebView.tsx` (메인 웹뷰 화면)**
    -   **역할**: **이 앱의 가장 핵심적인 화면.** 실제 웹 애플리케이션을 렌더링합니다.
    -   **주요 로직**:
        -   `Config.MAIN_URL`에 정의된 주소의 웹 페이지를 로드합니다.
        -   웹과 앱 간의 통신을 담당하는 **웹뷰 브릿지**(`WebViewBridge`)를 설정합니다.
        -   `onMessage` 핸들러를 통해 웹으로부터 오는 모든 메시지를 `WebViewBridge.handleMessage`로 전달합니다.

## 4. 핵심 로직: 웹뷰 브릿지 (WebViewBridge.ts)

웹(React)과 앱(React Native) 간의 통신을 담당하는 핵심 모듈입니다.

### 4.1. 통신 방식

-   **웹 $\rightarrow$ 앱**: 웹에서 `window.ReactNativeWebView.postMessage(JSON.stringify(data))` 함수를 호출합니다.
-   **앱 $\rightarrow$ 웹**: 앱에서 `webViewRef.current.postMessage(JSON.stringify(data))` 함수를 호출합니다. 웹에서는 `window.addEventListener('message', ...)`로 메시지를 수신합니다.

### 4.2. API 명세

#### 웹 $\rightarrow$ 앱 (Web to App)

웹에서 앱의 네이티브 기능을 호출할 때 사용합니다.

| Command (Type) | Payload | 설명 |
| :--- | :--- | :--- |
| `GET_DEVICE_TOKEN` | 없음 | 푸시 알림을 위한 디바이스 토큰을 앱에 요청합니다. |
| `LOGIN` | `{ token: string }` | 웹에서 로그인 성공 시, 해당 토큰 정보를 앱에 알립니다. (현재는 로그 출력 용도) |
| `OPEN_BROWSER` | `{ url: string }` | 인앱 브라우저가 아닌, 디바이스의 기본 브라우저(사파리, 크롬 등)로 URL을 엽니다. |
| `SHARE` | `{ message: string, url: string }` | OS 기본 공유하기 UI를 띄웁니다. |
| `CONSOLE_LOG` | `{ message: any }` | 웹의 로그를 앱의 네이티브 콘솔(Logcat, Xcode Console)에 출력시킵니다. 디버깅에 유용합니다. |

#### 앱 $\rightarrow$ 웹 (App to Web)

앱이 웹의 요청에 응답하거나, 특정 이벤트를 웹에 알릴 때 사용합니다.

| Type | Data | 설명 |
| :--- | :--- | :--- |
| `DEVICE_TOKEN` | `{ token: string, deviceType: 'android' \| 'ios' }` | `GET_DEVICE_TOKEN` 요청에 대한 응답으로, 디바이스 토큰과 OS 타입을 전달합니다. |

## 5. 주요 네이티브 기능 구현

### 5.1. 중앙 설정 관리 (`Config.ts`)

-   **역할**: 앱의 동작을 제어하는 주요 설정값들을 한곳에서 관리합니다.
-   **주요 설정**:
    -   `MAIN_URL`: 웹뷰가 최초로 로드할 웹 주소.
    -   `ALLOWED_DOMAINS`: 웹뷰 내에서 이동을 허용할 도메인 목록. 이 목록에 없으면 외부 브라우저로 열지 묻는 알림창이 뜹니다.
    -   `REQUIRE_LOGIN`: 네이티브 로그인 화면 사용 여부.
    -   `BRIDGE_CMD`: 웹뷰 브릿지에서 사용하는 명령어 문자열을 상수로 관리합니다.

### 5.2. 딥링크 (Deep Link) 처리

-   **역할**: `myapp://...`과 같은 커스텀 URL 스킴이나 푸시 알림 클릭 시, 특정 콘텐츠로 바로 이동시키는 기능입니다.
-   **구현 위치**: `App.tsx`
-   **동작 방식**:
    1.  **앱 미실행 시 (Cold Start)**: `Linking.getInitialURL()`을 통해 앱을 실행시킨 초기 URL을 가져옵니다.
    2.  **앱 실행 중 (Warm Start)**: `Linking.addEventListener('url', ...)`를 통해 외부로부터 새로운 URL 요청을 감지합니다.
    3.  `handleDeepLink` 함수에서 URL을 분석하여, `initialUrl` 상태를 업데이트하고 `MainWebView`로 전달하여 해당 페이지를 로드합니다.

### 5.3. 권한 관리 (`useLocationPermission.ts`)

-   **역할**: 위치 정보와 같이 민감한 권한을 사용자에게 요청하고 상태를 관리하는 로직을 재사용 가능한 훅(Hook)으로 분리했습니다.
-   **동작 방식**:
    1.  `check()`: 현재 권한 상태(허용, 거부, 미결정 등)를 확인합니다.
    2.  `request()`: 사용자에게 권한 요청 팝업을 띄웁니다.
    3.  사용자가 권한을 영구적으로 거부한 경우, `Linking.openSettings()`를 통해 앱 설정 화면으로 이동을 유도하는 알림창을 보여줍니다.
-   **확장성**: 이 훅의 패턴을 따라 `useCameraPermission`, `useNotificationPermission` 등 다른 권한 훅을 쉽게 만들 수 있습니다.

## 6. 개발 및 커스터마이징 가이드

-   **웹뷰에 띄울 주소 변경**: `src/constants/Config.ts` 파일의 `MAIN_URL` 값을 수정합니다.
-   **새로운 브릿지 기능 추가**:
    1.  `Config.ts`에 새로운 `BRIDGE_CMD` 상수를 추가합니다.
    2.  `WebViewBridge.ts`의 `handleMessage` 함수에 `switch` 케이스를 추가하여 웹으로부터 온 요청을 처리하는 네이티브 로직을 구현합니다.
    3.  (필요 시) 웹에서 쉽게 호출할 수 있도록 `injectedJavaScript`에 헬퍼 함수를 추가합니다.
-   **새로운 딥링크 처리**: `App.tsx`의 `handleDeepLink` 함수에서 새로운 URL 스킴이나 파라미터를 분석하는 로직을 추가합니다.
-   **권한 추가**: `useLocationPermission.ts`를 복사하여 `PERMISSIONS` 객체만 원하는 권한(예: `PERMISSIONS.IOS.CAMERA`)으로 변경하면 새로운 권한 훅을 만들 수 있습니다.
