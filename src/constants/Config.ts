export const Config = {
    // 앱 기본 설정
    SPLASH_TIME: 3000, // 스플래시 기본 유지 시간 (ms)
    SPLASH_IMAGES: [
        'https://images.unsplash.com/photo-1620912189865-1e8a33da4c5e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop'
    ], // 스플래시 이미지 배열 (여러장은 롤링)

    REQUIRE_LOGIN: true, // 로그인 강제 여부
    SHOW_TUTORIAL: true, // 튜토리얼 노출 여부

    // 웹뷰 설정
    MAIN_URL: 'https://m.naver.com', // 메인으로 띄울 웹사이트
    ALLOWED_DOMAINS: ['naver.com', 'nid.naver.com'], // 허용할 도메인 (부분 일치 체크)

    // API 설정
    API_URL: 'https://api.example.com',
    APP_TOKEN: 'mock-app-token-12345',
    USE_MOCK_API: true, // true면 mock.json 사용, false면 실제 API 호출

    // 앱 버전 및 업데이트 설장
    APP_VERSION: '1.0.0',

    // 브릿지 메시지 타입 정의
    BRIDGE_CMD: {
        LOGIN: 'LOGIN',
        OPEN_BROWSER: 'OPEN_BROWSER',
        SHARE: 'SHARE',
        CONSOLE_LOG: 'CONSOLE_LOG'
    },

    // 온보딩 데이터 (기본값 - API 실패시 사용 혹은 초기값)
    DEFAULT_ONBOARDING_DATA: [
        {
            id: 1,
            title: '환영합니다!',
            description: '우리 앱을 사용해주셔서 감사합니다.',
            image: 'https://images.unsplash.com/photo-1596464716127-f9a87ae52620?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 2,
            title: '편리한 기능',
            description: '웹과 앱의 장점을 모두 경험하세요.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 3,
            title: '시작하기',
            description: '지금 바로 시작해보세요!',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop'
        }
    ]
};
