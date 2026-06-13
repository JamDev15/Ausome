import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
}

export const OctopusMascot: React.FC<Props> = ({ size = 200 }) => (
  <Image
    source={require('../../../assets/app-icon.png')}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);
