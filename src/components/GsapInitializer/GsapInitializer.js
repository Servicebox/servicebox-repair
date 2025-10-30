// components/GsapInitializer/GsapInitializer.js
'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollToPlugin from "gsap/ScrollToPlugin";

export default function GsapInitializer() {
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
  }, []);

  return null;
}