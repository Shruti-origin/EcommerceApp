import React from 'react';
import { StyleSheet } from 'react-native';
import VendorProductsFilterNative from './VendorProductsFilterNative';

const VendorShopSectionNative: React.FC<{ vendorId?: string | null; vendorName?: string; navigate?: (name: string, params?: any) => void; goBack?: () => void }> = ({ vendorId, vendorName, navigate, goBack }) => {
  // Delegate vendor product listing and filtering to VendorProductsFilterNative
  return (
    <VendorProductsFilterNative vendorId={vendorId} vendorName={vendorName} navigate={navigate} goBack={goBack} />
  );
};

const styles = StyleSheet.create({});

export default VendorShopSectionNative;
