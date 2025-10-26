// app/loginsignup/page.js
import { Suspense } from 'react';
import LoginSignup from '../../components/LoginSignup/LoginSignup';

function ParentComponent() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginSignup 
        isOpen={isOpen} 
        onClose={onClose} 
        onLoginSuccess={onLoginSuccess} 
      />
    </Suspense>
  );
}