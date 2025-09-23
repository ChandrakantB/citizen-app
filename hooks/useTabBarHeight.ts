import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  
  const getTabBarHeight = () => {
    if (Platform.OS === 'web') return 70;
    
    // Check if device has home indicator (iPhone X and newer)
    const hasHomeIndicator = insets.bottom > 0;
    
    if (hasHomeIndicator) {
      // iPhone X+ style devices - less padding needed
      return 85;
    } else {
      // Older devices or Android with navigation buttons
      return 75;
    }
  };

  const getContentBottomPadding = () => {
    return getTabBarHeight() + insets.bottom + 20; // Extra 20px buffer
  };

  return {
    tabBarHeight: getTabBarHeight(),
    contentBottomPadding: getContentBottomPadding(),
    safeAreaBottom: insets.bottom,
  };
};
