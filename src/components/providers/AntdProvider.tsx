'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { viceThemeConfig } from '@/theme/themeConfig';
import { AuthProvider } from '@/context/AuthContext';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={viceThemeConfig} locale={ptBR}>
      <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
}
