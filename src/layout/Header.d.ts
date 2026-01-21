import React from 'react';

export interface HeaderProps {
  navigate?: (name: string, params?: any) => void;
  setActive?: (name: string) => void;
  goBack?: () => void;
  showBackButton?: boolean;
}

declare const Header: React.FC<HeaderProps>;
export default Header;
