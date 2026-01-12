import "@/styles/globals.css";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

function AuthGuard({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access restricted pages
      if (!user && router.pathname !== '/signIn' && router.pathname !== '/signUp') {
        router.push('/signIn');
      }
      // If user is logged in and trying to access auth pages
      if (user && (router.pathname === '/signIn' || router.pathname === '/signUp')) {
        router.push('/');
      }
    }
  }, [user, loading, router.pathname]);

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
         <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-500 rounded-full animate-spin"></div>
       </div>
     ); 
  }

  // If on auth pages and not logged in, render them
  if (!user && (router.pathname === '/signIn' || router.pathname === '/signUp')) {
      return children;
  }

  // If logged in, render the app
  if (user) {
      return children;
  }

  // Default fallback (should be handled by redirects, but good for safety)
  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </UserProvider>
  );
}
