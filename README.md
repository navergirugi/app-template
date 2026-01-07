# React Native WebView App Template

이 프로젝트는 React Native 기반의 하이브리드 앱 템플릿입니다.
웹뷰(WebView)를 기반으로 하여 네이티브 기능(딥링크, 푸시, 인앱 브라우저 등)이 미리 구현되어 있습니다.

## 📚 가이드 문서 바로가기
이 프로젝트를 처음 사용하시나요? 아래 문서들을 먼저 확인하세요.

- **[🚀 앱 설정 및 커스터마이징 가이드 (NEW_APP_GUIDE.md)](./NEW_APP_GUIDE.md)**
  - 앱 이름/아이콘 변경, 스플래시 설정, 패키지명 변경 등 **새 앱을 만들 때 필수적인 내용**이 담겨 있습니다.
- **[🔧 Git 권한 오류 해결 가이드 (GIT_TROUBLESHOOTING.md)](./GIT_TROUBLESHOOTING.md)**
  - `403 Forbidden` 등의 Git 업로드 오류 발생 시 해결 방법입니다.

---

## 1. 개발 환경 준비 (Prerequisites)

*   **Node.js**: 18.x 이상
*   **Java (JDK)**: 17 버전 (React Native 0.73+ 필수)
*   **Android Studio**: Android SDK 및 에뮬레이터 설정 필요
*   **Xcode**: (iOS 개발 시) 15.x 이상

## 2. 설치 및 실행 (Installation & Running)

### 의존성 설치
```bash
npm install
# or
yarn install
```

### iOS 의존성 설치 (Mac Only)
```bash
cd ios
pod install
cd ..
```

### 안드로이드 실행
```bash
npm run android
```

### iOS 실행 (Mac Only)
```bash
npm run ios
```

---

## 3. 스토어 배포 방법 (Deployment)

### 🤖 Android (Google Play Store)

1.  **서명 키(Keystore) 생성**:
    *   이미 `android/app/debug.keystore`가 있지만, **실제 배포 시에는 반드시 본인만의 릴리즈용 Keystore를 생성**해야 니다.
    *   참고: [React Native Signed APK 생성 가이드](https://reactnative.dev/docs/signed-apk-android)

2.  **빌드 (AAB 파일 생성)**:
    구글 플레이 스토어는 이제 APK 대신 **AAB(Android App Bundle)** 형식을 요구합니다.
    ```bash
    cd android
    ./gradlew bundleRelease
    ```
    *   생성된 파일 위치: `android/app/build/outputs/bundle/release/app-release.aab`

3.  **구글 플레이 콘솔 업로드**:
    *   [Google Play Console](https://play.google.com/console) 접속
    *   앱 만들기 -> 프로덕션 -> 새 버전 만들기 -> 위의 `.aab` 파일 업로드

### 🍎 iOS (App Store)

1.  **Xcode 설정**:
    *   `ios/WebviewExample.xcworkspace` 파일을 Xcode로 엽니다.
    *   **Signing & Capabilities** 탭에서 본인의 Apple 개발자 계정(Team)을 선택합니다.

2.  **아카이브(Archive)**:
    *   Xcode 메뉴 -> **Product** -> **Archive** 선택
    *   빌드가 완료되면 Organizer 창이 뜹니다.

3.  **앱스토어 업로드**:
    *   Organizer에서 **Distribute App** 클릭 -> **App Store Connect** 선택 -> Upload
    *   업로드 완료 후 [App Store Connect](https://appstoreconnect.apple.com) 웹사이트에서 심사 제출을 진행합니다.

---

## 4. 폴더 구조 (Structure)

*   `App.tsx`: 메인 진입점 (딥링크, 알림, 네비게이션)
*   `src/constants/Config.ts`: **설정 파일 (URL, 기능 제어)**
*   `src/screens/`: 각 화면 컴포넌트
*   `src/utils/`: 유틸리티 (웹뷰 브릿지 등)

---

## 5. 웹뷰 브릿지 API (WebView Bridge API)

웹(Web)에서 앱(App)의 기능을 호출하거나, 앱에서 웹으로 데이터를 전달할 때 사용하는 인터페이스입니다.

### 5.1. 웹 -> 앱 호출 (Web to App)

웹에서 `window.ReactNativeWebView.postMessage(JSON.stringify(data))`를 통해 호출합니다.

| Command (Type) | Payload | 설명 | 예시 코드 |
| :--- | :--- | :--- | :--- |
| `GET_DEVICE_TOKEN` | 없음 | 디바이스 토큰(FCM 등)을 요청합니다. 앱은 `DEVICE_TOKEN` 타입으로 응답합니다. | `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_DEVICE_TOKEN' }))` |
| `LOGIN` | `{ token: string }` | 로그인 성공 시 토큰을 앱에 전달합니다. (현재는 로깅 용도) | `window.AppBridge.login('jwt_token')` |
| `OPEN_BROWSER` | `{ url: string }` | 외부 브라우저(시스템 브라우저)로 URL을 엽니다. | `window.AppBridge.openBrowser('https://google.com')` |
| `SHARE` | `{ message: string, url: string }` | 시스템 공유하기 창을 띄웁니다. | `window.ReactNativeWebView.postMessage(JSON.stringify({ command: 'SHARE', payload: { message: '공유', url: '...' } }))` |
| `CONSOLE_LOG` | `{ message: string }` | 앱의 네이티브 로그창에 메시지를 출력합니다. | `window.ReactNativeWebView.postMessage(JSON.stringify({ command: 'CONSOLE_LOG', payload: { message: 'Log' } }))` |

### 5.2. 앱 -> 웹 응답 (App to Web)

앱에서 웹의 `window` 객체에 이벤트를 발생시키거나 메시지를 보냅니다.

| Type | Data | 설명 |
| :--- | :--- | :--- |
| `DEVICE_TOKEN` | `{ token: string, deviceType: 'android' \| 'ios' }` | `GET_DEVICE_TOKEN` 요청에 대한 응답입니다. |

**웹에서 응답 받는 방법 (예시):**

```javascript
// 이벤트 리스너 등록
const handleMessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'DEVICE_TOKEN') {
    console.log('Token:', data.token);
    console.log('Type:', data.deviceType);
  }
};

// Android
window.addEventListener('message', handleMessage);
// iOS
document.addEventListener('message', handleMessage);
```
