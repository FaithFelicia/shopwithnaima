import React from 'react';
import Header from '@/components/Header';
import AuthClient from '@/app/sign-up-login/components/AuthClient';

export default function AuthPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <AuthClient />
      </main>
    </>
  );
}