import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  PermissionStatus,
} from 'react-native-permissions';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unavailable');

  // 플랫폼별 위치 권한 정의
  const LOCATION_PERMISSION = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  // 권한 상태 확인
  const checkPermission = useCallback(async () => {
    if (!LOCATION_PERMISSION) return;

    try {
      const result = await check(LOCATION_PERMISSION);
      setPermissionStatus(result);
      return result;
    } catch (error) {
      console.error('Location permission check error:', error);
    }
  }, [LOCATION_PERMISSION]);

  // 권한 요청
  const requestPermission = useCallback(async () => {
    if (!LOCATION_PERMISSION) return;

    try {
      const result = await request(LOCATION_PERMISSION);
      setPermissionStatus(result);

      if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        // 선택 사항: 거부되었을 때 알림 띄우기 로직을 여기서 처리하거나, 
        // UI에서 status를 보고 처리하도록 할 수 있습니다.
        console.log('Location permission denied or blocked');
      }
      return result;
    } catch (error) {
      console.error('Location permission request error:', error);
    }
  }, [LOCATION_PERMISSION]);

  // 설정 화면으로 이동 (거부됨 상태일 때 사용)
  const goToSettings = useCallback(async () => {
    Alert.alert(
      '위치 권한 필요',
      '앱을 사용하기 위해서는 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: openSettings },
      ],
    );
  }, []);

  // 초기 마운트 시 권한 확인
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionStatus,
    checkPermission,
    requestPermission,
    goToSettings,
    isGranted: permissionStatus === RESULTS.GRANTED,
  };
};
