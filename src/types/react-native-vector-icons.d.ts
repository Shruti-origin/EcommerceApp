declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';

  export interface IconProps {
    name?: string;
    size?: number;
    color?: string;
    style?: any;
    [key: string]: any;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module 'react-native-vector-icons/FontAwesome5' {
  import { ComponentType } from 'react';

  export interface IconProps {
    name?: string;
    size?: number;
    color?: string;
    style?: any;
    solid?: boolean;
    brand?: boolean;
    [key: string]: any;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}
