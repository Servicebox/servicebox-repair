// app/layout.js
// app/layout.js
'use client';
import './globals.css'
import  'tailwindcss';
import { usePathname } from 'next/navigation';
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Header from '../components/Header/Header';
import BubbleBackground from "../components/BubbleBackground/BubbleBackground";
import Footer from "../components/Footer/Footer";
import CookieConsent from '../components/CookieConsent/CookieConsent';
import { AuthProvider } from "../components/contexts/AuthContext";
import Chat from '../components/Chat/Chat';
import GEOSEO from "../components/GEOSEO/GEOSEO";
import ShopContextProvider from '../components/ShopContext/ShopContext';

config.autoAddCss = false;

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  gsap.registerPlugin(ScrollToPlugin);

  return (
    <html lang="ru">
      <head>
        <title>Ремонт техники в Вологде | ServiceBox</title>
        <meta name="description" content="Профессиональный ремонт iPhone, ноутбуков, компьютеров и другой техники в Вологде" />
        <GEOSEO /> 
      </head>
      <body>
        <AuthProvider>
          <ShopContextProvider>
            <div className="">
              <Header />
              <BubbleBackground />
              <div className="page__wrapper">
                <div className="nav"></div>
                
                {children}
                
                <CookieConsent />
                <Chat />
                <Footer />
              </div>
            </div>
          </ShopContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}