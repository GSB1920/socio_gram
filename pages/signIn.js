import { useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import "../lib/firebase"; // ensures firebase is initialized

import { useUser } from "@/contexts/UserContext";

function hashPassword(password) {
  // Simple hash using SHA-256 via browser crypto.subtle API as an example
  // Returns a promise with the hex string
  // In production, use a more secure solution
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)).then((buf) =>
    Array.from(new Uint8Array(buf))
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function SignInPage() {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    username: "",
    error: "",
    success: "",
  });
  const [loginForm, setLoginForm] = useState({
    userOrEmail: "",
    password: "",
    error: "",
  });

  const router = useRouter();
  const db = getFirestore();

  const { login } = useUser();

  // --- SIGNUP ---
  async function handleSignup(e) {
    e.preventDefault();
    setSignupForm({ ...signupForm, error: "", success: "" });
    setLoading(true);
    try {
      const usersRef = collection(db, "users");

      // Check email or username not taken
      const q = query(
        usersRef,
        where("email", "==", signupForm.email)
      );
      const q2 = query(
        usersRef,
        where("username", "==", signupForm.username)
      );
      const [emailSnap, usernameSnap] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);
      if (!signupForm.email || !signupForm.password || !signupForm.username) {
        setSignupForm(f => ({ ...f, error: "All fields are required." }));
        setLoading(false);
        return;
      }
      if (emailSnap.size > 0) {
        setSignupForm(f => ({ ...f, error: "Email already in use." }));
        setLoading(false);
        return;
      }
      if (usernameSnap.size > 0) {
        setSignupForm(f => ({ ...f, error: "Username already in use." }));
        setLoading(false);
        return;
      }

      // Save user with hashed password
      const hashed = await hashPassword(signupForm.password);

      await addDoc(usersRef, {
        email: signupForm.email.toLowerCase(),
        username: signupForm.username,
        password: hashed,
        createdAt: Date.now(),
      });

      setSignupForm({ email: "", password: "", username: "", error: "", success: "Sign up successful! You can now log in." });
      setMode("login");
    } catch (error) {
      setSignupForm(f => ({ ...f, error: "Sign up failed. Try again." }));
    }
    setLoading(false);
  }

  // --- LOGIN ---
  async function handleLogin(e) {
    e.preventDefault();
    setLoginForm({ ...loginForm, error: "" });
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      let userSnap = null;
      // Try to find user by email or username
      const qEmail = query(usersRef, where("email", "==", loginForm.userOrEmail.toLowerCase()));
      const emailSnap = await getDocs(qEmail);
      if (emailSnap.size > 0) {
        userSnap = emailSnap.docs[0];
      } else {
        const qUsername = query(usersRef, where("username", "==", loginForm.userOrEmail));
        const usernameSnap = await getDocs(qUsername);
        if (usernameSnap.size > 0) {
          userSnap = usernameSnap.docs[0];
        }
      }

      if (!userSnap) {
        setLoginForm(f => ({ ...f, error: "User not found." }));
        setLoading(false);
        return;
      }
      // Check password
      const hashed = await hashPassword(loginForm.password);
      if (userSnap.data().password !== hashed) {
        setLoginForm(f => ({ ...f, error: "Incorrect password." }));
        setLoading(false);
        return;
      }

      // Store user data in context and localStorage
      const userData = {
        id: userSnap.id,
        username: userSnap.data().username,
        email: userSnap.data().email,
      };
      login(userData);

      // Upon successful login, redirect to home page
      router.push("/");
    } catch (err) {
      setLoginForm(f => ({ ...f, error: "Login failed, try again." }));
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow p-8">
        <div className="flex justify-between">
          <button
            className={`text-lg font-bold ${mode === "login" ? "text-blue-600" : "text-zinc-700 dark:text-zinc-300"}`}
            onClick={() => setMode("login")}
          >Login</button>
          <button
            className={`text-lg font-bold ${mode === "signup" ? "text-blue-600" : "text-zinc-700 dark:text-zinc-300"}`}
            onClick={() => setMode("signup")}
          >Sign Up</button>
        </div>

        {mode === "signup" && (
          <form className="mt-8 flex flex-col gap-3" onSubmit={handleSignup}>
            <input
              type="email"
              className="px-4 py-2 border border-zinc-400 rounded"
              placeholder="Email"
              value={signupForm.email}
              onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="off"
              required
            />
            <input
              type="text"
              className="px-4 py-2 border border-zinc-400 rounded"
              placeholder="Username"
              value={signupForm.username}
              onChange={e => setSignupForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="off"
              required
            />
            <input
              type="password"
              className="px-4 py-2 border border-zinc-400 rounded"
              placeholder="Password"
              value={signupForm.password}
              onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {signupForm.error && <div className="text-red-600">{signupForm.error}</div>}
            {signupForm.success && <div className="text-green-600">{signupForm.success}</div>}
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
              type="submit"
            >{loading ? "Signing up..." : "Sign Up"}</button>
          </form>
        )}

        {mode === "login" && (
          <form className="mt-8 flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="text"
              className="px-4 py-2 border border-zinc-400 rounded"
              placeholder="Email or Username"
              value={loginForm.userOrEmail}
              onChange={e => setLoginForm(f => ({ ...f, userOrEmail: e.target.value }))}
              autoComplete="off"
              required
            />
            <input
              type="password"
              className="px-4 py-2 border border-zinc-400 rounded"
              placeholder="Password"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {loginForm.error && <div className="text-red-600">{loginForm.error}</div>}
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
              type="submit"
            >{loading ? "Logging in..." : "Login"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
