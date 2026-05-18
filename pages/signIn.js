import { useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";
import { Facebook } from "lucide-react";
import "../lib/firebase";
import { useUser } from "@/contexts/UserContext";

function hashPassword(password) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)).then((buf) =>
    Array.from(new Uint8Array(buf))
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    userOrEmail: "",
    password: "",
    error: "",
  });

  const router = useRouter();
  const db = getFirestore();
  const { login } = useUser();

  async function handleLogin(e) {
    e.preventDefault();
    setLoginForm({ ...loginForm, error: "" });
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const qEmail = query(usersRef, where("email", "==", loginForm.userOrEmail.toLowerCase()));
      const qUser = query(usersRef, where("username", "==", loginForm.userOrEmail));
      
      const [emailSnap, userSnap] = await Promise.all([getDocs(qEmail), getDocs(qUser)]);
      let userDoc = null;

      if (!emailSnap.empty) userDoc = emailSnap.docs[0];
      else if (!userSnap.empty) userDoc = userSnap.docs[0];

      if (!userDoc) {
        setLoginForm(f => ({ ...f, error: "Invalid username or password." }));
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const hashed = await hashPassword(loginForm.password);

      if (userData.password !== hashed) {
        setLoginForm(f => ({ ...f, error: "Invalid username or password." }));
        setLoading(false);
        return;
      }

      login(userData);
      router.push("/");
    } catch (error) {
      console.error(error);
      setLoginForm(f => ({ ...f, error: "Something went wrong. Please try again." }));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-[350px]">
        {/* Main Login Box */}
        <div className="bg-white border border-zinc-300 rounded-sm p-8 mb-4">
          <div className="flex justify-center mb-8">
            <h1 className="text-[3rem] font-bold italic" style={{ fontFamily: 'Billabong, "Brush Script MT", cursive' }}>
              Socio Gram
            </h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Phone number, username, or email"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={loginForm.userOrEmail}
              onChange={(e) => setLoginForm({ ...loginForm, userOrEmail: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            
            <button
              type="submit"
              disabled={loading || !loginForm.userOrEmail || !loginForm.password}
              className={`w-full bg-[#0095f6] text-white rounded-[4px] py-1.5 font-semibold text-sm mt-2 ${
                loading || !loginForm.userOrEmail || !loginForm.password ? "opacity-70" : "hover:bg-[#1877f2]"
              }`}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            
            {loginForm.error && (
              <p className="text-red-500 text-xs text-center mt-2">{loginForm.error}</p>
            )}

            <div className="flex items-center my-4">
              <div className="h-[1px] bg-zinc-300 flex-1"></div>
              <span className="px-4 text-[13px] font-semibold text-zinc-500">OR</span>
              <div className="h-[1px] bg-zinc-300 flex-1"></div>
            </div>

            <button type="button" className="flex items-center justify-center text-[#385185] font-semibold text-sm hover:text-opacity-80">
              <Facebook className="w-5 h-5 mr-2" fill="currentColor" />
              Log in with Facebook
            </button>

            <button type="button" className="text-xs text-[#00376b] mt-3 text-center w-full">
              Forgot password?
            </button>
          </form>
        </div>

        {/* Sign Up Box */}
        <div className="bg-white border border-zinc-300 rounded-sm p-5 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link href="/signUp" className="text-[#0095f6] font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Get the app (Optional placeholder) */}
        <div className="mt-4 text-center">
            <p className="text-sm text-zinc-600 mb-4">Get the app.</p>
            <div className="flex justify-center space-x-2">
                <img src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png" alt="Get it on Google Play" className="h-10" />
                <img src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png" alt="Get it from Microsoft" className="h-10" />
            </div>
        </div>
      </div>
      
       {/* Footer */}
       <footer className="mt-16 flex flex-col items-center gap-4 text-xs text-zinc-500">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span>Meta</span>
            <span>About</span>
            <span>Blog</span>
            <span>Jobs</span>
            <span>Help</span>
            <span>API</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Locations</span>
            <span>Socio Gram Lite</span>
            <span>Threads</span>
            <span>Contact Uploading & Non-Users</span>
            <span>Meta Verified</span>
        </div>
        <div>
            © 2026 Socio Gram
        </div>
      </footer>
    </div>
  );
}
