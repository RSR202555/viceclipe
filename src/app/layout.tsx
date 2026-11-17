import type { Metadata, Viewport } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '@/components/providers/AntdProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'VICE CLIPPER | The GTA 6 Content Hub',
  description:
    'A plataforma definitiva da comunidade de GTA 6. Feed de vídeos curtos, descoberta de conteúdos, criadores, tendências e inteligência artificial para edição de clipes.',
  keywords: [
    'GTA 6',
    'Grand Theft Auto VI',
    'Vice City',
    'Leonida',
    'Clips',
    'Vice Clipper',
    'Gameplay',
    'Clipper IA',
    'Criadores',
  ],
  authors: [{ name: 'VICE CLIPPER Team' }],
};

export const viewport: Viewport = {
  themeColor: '#070611',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070611] text-white min-h-screen selection:bg-vice-pink selection:text-white font-sans antialiased">
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
