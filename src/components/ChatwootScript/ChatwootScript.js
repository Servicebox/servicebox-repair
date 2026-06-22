'use client';

import Script from 'next/script';

const BRAND_CSS = `
  .branding--link,
  a[href*="chatwoot"],
  [class*="powered-by"],
  [class*="woot-widget-bubble__footer"],
  [class*="woot-widget-footer"] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
  }
`;

function injectBrandHide(sr) {
  if (sr.querySelector('#cw-no-brand')) return;
  const s = document.createElement('style');
  s.id = 'cw-no-brand';
  s.textContent = BRAND_CSS;
  sr.appendChild(s);
}

function watchWidget(widget) {
  const sr = widget.shadowRoot;
  if (!sr) return;
  injectBrandHide(sr);
  new MutationObserver(() => injectBrandHide(sr))
    .observe(sr, { childList: true, subtree: true });
}

function waitForWidget() {
  const el = document.querySelector('chatwoot-widget');
  if (el) { watchWidget(el); return; }
  new MutationObserver((_, obs) => {
    const w = document.querySelector('chatwoot-widget');
    if (!w) return;
    obs.disconnect();
    watchWidget(w);
  }).observe(document.body, { childList: true, subtree: true });
}

export default function ChatwootScript() {
  return (
    <Script
      id="chatwoot-sdk"
      strategy="afterInteractive"
      src="https://service-box-35.ru/packs/js/sdk.js"
      onLoad={() => {
        if (typeof window === 'undefined' || !window.chatwootSDK) return;

        window.chatwootSettings = {
          hideMessageBubble: false,
          position: 'right',
          locale: 'ru',
        };

        window.chatwootSDK.run({
          websiteToken: 'dPQfRWS8ASmV5yq6tZkAPubu',
          baseUrl: 'https://service-box-35.ru',
        });

        window.addEventListener('chatwoot:ready', waitForWidget);
        setTimeout(waitForWidget, 3000);
      }}
    />
  );
}
