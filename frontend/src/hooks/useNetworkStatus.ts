import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(connected);
      setIsConnected(state.isConnected);
    });

    NetInfo.fetch().then((state: NetInfoState) => {
      const connected = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(connected);
      setIsConnected(state.isConnected);
    });

    return unsubscribe;
  }, []);

  return { isOnline, isConnected };
};
