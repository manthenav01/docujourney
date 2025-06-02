"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
//   AppleAuthProvider,
} from "firebase/auth";
import { Button } from "../../components/ui/Button";
import { Apple } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser;
      if (user) {
        console.log("User ID:", user.uid);
        document.cookie = `userId=${user.uid}; path=/;`;
      }
      router.push("/dashboard");
    } catch (err: any) {
        console.error("Google login error:", err);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  const handleAppleLogin = async () => {
    // try {
    //   const provider = new AppleAuthProvider();
    //   await signInWithPopup(auth, provider);
    // } catch (err: any) {
    //   setError(err.message);
    // }
  };

  const handleEmailPasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        document.cookie = `userId=${user.uid}; path=/;`;
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Failed to sign in. Please check your credentials and try again.");
    }
  };

  return (
    <>
   
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">DocuJourney AI</h1>
        </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
       
        <h2 className="text-xl font-semibold mb-3">Sign In</h2>
         <div className="border-b border-gray-300 mb-6"></div>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <Apple className="w-5 h-5" /> Continue with Apple
          </Button>
          <Button
           variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.69 0 6.64 1.27 8.69 3.35l6.52-6.52C35.64 2.68 30.14 0 24 0 14.73 0 6.91 5.74 3.44 13.99l7.54 5.85C12.6 14.03 17.87 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.42-4.75H24v9.5h12.7c-.55 2.95-2.2 5.45-4.7 7.12l7.23 5.61C43.64 37.03 46.5 30.94 46.5 24z"/><path fill="#FBBC05" d="M10.98 28.84c-.48-1.41-.76-2.91-.76-4.34s.28-2.93.76-4.34l-7.54-5.85C1.15 17.03 0 20.39 0 24s1.15 6.97 3.44 9.69l7.54-5.85z"/><path fill="#34A853" d="M24 48c6.14 0 11.64-2.03 15.54-5.5l-7.23-5.61c-2.02 1.35-4.6 2.14-8.31 2.14-6.13 0-11.4-4.53-13.02-10.64l-7.54 5.85C6.91 42.26 14.73 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg> Continue with Google
          </Button>
        </div>
       
        <div className="flex items-center justify-between mt-4">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="w-full border-gray-300" />
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between text-sm">
            <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
          </div>
          <Button
            variant="default"
            className="w-full"
            onClick={handleEmailPasswordLogin}
          >
            Sign In
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500">
          Don’t have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
