# 새로운 앱 만들기 및 설정 가이드

이 문서는 이 템플릿을 사용하여 새로운 하이브리드 앱을 만들 때 수정해야 할 부분들을 설명합니다.

## 0. 개발 환경 필수 버전 (Requirements)
이 프로젝트를 실행하기 위해 아래 버전 이상의 개발 환경이 필요합니다. 버전이 맞지 않으면 빌드 에러가 발생할 수 있습니다.
*   **Node.js**: 18.x 이상 (필수)
*   **Java (JDK)**: 17 버전 (React Native 0.73 이상 필수)
    *   *설정 위치 1 (VSCode)*: `.vscode/settings.json`의 `java.jdt.ls.java.home`
    *   *설정 위치 2 (Android Build)*: `android/gradle.properties`의 `org.gradle.java.home` (필요 시 주석 해제하여 사용)
*   **Ruby**: 2.7.6 이상 (iOS CocoaPods 설치 시 필요)
*   **React Native**: 0.73.5
*   **Android Studio**: 최신 버전 권장 (Flamingo 이상)
*   **Xcode**: 15.x 이상 (iOS 17 지원을 위해 필요)

## 1. 기본 설정 (Config.ts)
`src/constants/Config.ts` 파일에서 앱의 핵심 동작을 제어할 수 있습니다.

*   **웹뷰 URL**: `MAIN_URL`, `ALLOWED_DOMAINS` 수정
*   **스플래시**: `SPLASH_TIME`, `SPLASH_IMAGES` 수정
*   **튜토리얼**: `SHOW_TUTORIAL` (true/false)
*   **로그인 강제**: `REQUIRE_LOGIN` (true/false)
*   **Mock 모드**: `USE_MOCK_API` (개발 시 true, 배포 시 false)

## 2. 앱 아이콘 및 이름 변경

### 앱 이름 변경
*   `app.json`: `displayName` 수정
*   `android/app/src/main/res/values/strings.xml`: `app_name` 수정
*   `ios/Info.plist`: `CFBundleDisplayName` 수정

### 아이콘 변경
*   **Android**: `android/app/src/main/res/mipmap-*` 폴더 내의 `ic_launcher.png` 등을 교체하세요. (Android Studio의 Image Asset 기능 사용 권장)
*   **iOS**: `ios/Runner/Assets.xcassets/AppIcon.appiconset` 내의 이미지를 교체하세요.

## 3. 딥링크 및 푸시 설정
`App.tsx`의 `handleDeepLink` 함수에서 URL 스킴을 처리합니다.
*   현재 설정된 스킴 테스트: `myapp://test` -> 뉴스 페이지 이동
*   커스텀 스킴을 추가하려면 `android/app/src/main/AndroidManifest.xml` 및 iOS 설정을 변경해야 합니다.

## 4. 인앱 알림 및 업데이트
*   **인앱 알림**: `src/components/InAppNotification.tsx`를 수정하여 디자인을 변경할 수 있습니다.
*   **업데이트 체크**: `src/mocks/update.json`을 수정하여 강제 업데이트 테스트가 가능합니다. 실제 배포 시에는 `SplashScreen.tsx`의 `checkUpdate` 함수를 실제 API로 연결하세요.

## 5. 앱 배포 (빌드)
*   **Android**:
    ```bash
    cd android
    ./gradlew bundleRelease
    ```
*   **iOS**:
    Xcode를 열어 Archive를 수행하세요.

## 6. 버전 관리 (Git) 경고 파일 처리
*   IDE에서 빨간색으로 보이는 파일들은 주로 Git에 추적되지 않는 파일들입니다.
*   `node_modules/`, `android/build/`, `ios/build/` 등은 빌드 시 생성되므로 Git에 **포함하지 않는 것이 정상**입니다.
*   `src/` 내의 파일이 빨간색이라면 Git Add를 통해 포함시켜야 합니다.
*   .gitignore 파일을 업데이트하여 불필요한 파일들이 빨간색으로(Untracked) 표시되는 것을 줄였습니다.

## 7. 패키지명(Package Name) 및 번들 ID 수정
현재 이 프로젝트는 `react-native-test-app` 기반 구조를 따르고 있어, 일반적인 안드로이드/iOS 프로젝트와 설정 방식이 조금 다릅니다.
`android/app/src/main/AndroidManifest.xml` 파일이 보이지 않는 것은 정상입니다.

**`app.json`** 파일을 열어 아래와 같이 `android`와 `ios` 설정을 추가하여 패키지명을 지정하세요.

```json
{
  "name": "WebviewExample",
  "displayName": "WebviewExample",
  "components": [ ... ],
  "android": {
    "package": "com.mycompany.myapp"
  },
  "ios": {
    "bundleIdentifier": "com.mycompany.myapp"
  },
  ...
}
```
*   **Android**: `android.package` 값을 수정하면 빌드 시 `applicationId`로 적용됩니다.
*   **iOS**: `ios.bundleIdentifier` 값을 수정하면 빌드 시 Bundle Identifier로 적용됩니다.

## 8. 프로젝트 구조 설명
이 템플릿의 주요 파일과 폴더 구조입니다. 수정 시 참고하세요.

*   `App.tsx`: 앱의 진입점. 네비게이션(화면 전환), 딥링크, 푸시 알림, 전역 로직을 관리합니다.
*   `src/constants/Config.ts`: 앱의 모든 설정(URL, 스플래시 시간, 기능 On/Off 등)이 모여 있습니다. **가장 자주 수정하게 될 파일입니다.**
*   `src/screens/`:
    *   `SplashScreen.tsx`: 스플래시 화면, 앱 초기화(업데이트 체크, 토큰 교환 등) 로직.
    *   `OnboardingScreen.tsx`: 튜토리얼 화면.
    *   `LoginScreen.tsx`: 로그인 화면 (로그인 강제 시 사용).
    *   `MainWebView.tsx`: 메인 웹뷰 화면. 브릿지 연동 로직 포함.
*   `src/utils/WebViewBridge.ts`: 웹 <-> 앱 통신을 위한 브릿지 유틸리티.
*   `src/mocks/`: 테스트용 가짜 데이터 (`tutorial.json`, `update.json`).
*   `src/components/`: 재사용 가능한 컴포넌트 (`InAppNotification.tsx` 등).

