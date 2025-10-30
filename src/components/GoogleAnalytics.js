// components/GoogleAnalytics.js
'use client';

import Script from 'next/script';

const GoogleAnalytics = () => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-MZ24DLXSSM"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MZ24DLXSSM', {
              page_title: document.title,
              page_location: window.location.href
            });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;