import { useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
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

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
    error: "",
    success: "",
  });

  const router = useRouter();
  const db = getFirestore();

  async function handleSignup(e) {
    e.preventDefault();
    setSignupForm({ ...signupForm, error: "", success: "" });
    setLoading(true);
    try {
      const usersRef = collection(db, "users");

      // Check email or username not taken
      const q = query(usersRef, where("email", "==", signupForm.email));
      const q2 = query(usersRef, where("username", "==", signupForm.username));
      const [emailSnap, usernameSnap] = await Promise.all([getDocs(q), getDocs(q2)]);
      
      if (!signupForm.email || !signupForm.password || !signupForm.username || !signupForm.fullName) {
        setSignupForm(f => ({ ...f, error: "All fields are required." }));
        setLoading(false);
        return;
      }
      if (!emailSnap.empty) {
        setSignupForm(f => ({ ...f, error: "Email already in use." }));
        setLoading(false);
        return;
      }
      if (!usernameSnap.empty) {
        setSignupForm(f => ({ ...f, error: "Username already in use." }));
        setLoading(false);
        return;
      }

      // Save user with hashed password
      const hashed = await hashPassword(signupForm.password);

      await addDoc(usersRef, {
        email: signupForm.email.toLowerCase(),
        fullName: signupForm.fullName,
        username: signupForm.username,
        password: hashed,
        createdAt: Date.now(),
      });

      setSignupForm({ email: "", fullName: "", username: "", password: "", error: "", success: "Sign up successful!" });
      router.push("/signIn");
    } catch (error) {
      console.error(error);
      setSignupForm(f => ({ ...f, error: "Sign up failed. Try again." }));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-[350px]">
        {/* Main Signup Box */}
        <div className="bg-white border border-zinc-300 rounded-sm p-8 mb-4">
          <div className="flex justify-center mb-4">
            <h1 className="text-[3rem] font-bold italic" style={{ fontFamily: 'Billabong, "Brush Script MT", cursive' }}>
              Socio Gram
            </h1>
          </div>
          
          <h2 className="text-zinc-500 font-semibold text-center mb-6 text-[17px] leading-5">
            Sign up to see photos and videos from your friends.
          </h2>

          <button type="button" className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-[4px] py-1.5 font-semibold text-sm flex items-center justify-center mb-4">
             <Facebook className="w-5 h-5 mr-2" fill="currentColor" />
             Log in with Facebook
          </button>

          <div className="flex items-center mb-4">
              <div className="h-[1px] bg-zinc-300 flex-1"></div>
              <span className="px-4 text-[13px] font-semibold text-zinc-500">OR</span>
              <div className="h-[1px] bg-zinc-300 flex-1"></div>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Mobile Number or Email"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={signupForm.fullName}
              onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={signupForm.username}
              onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-zinc-400 placeholder-zinc-500"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
            
            <p className="text-[12px] text-zinc-500 text-center mt-2 leading-4">
              People who use our service may have uploaded your contact information to Socio Gram. <a href="#" className="font-semibold text-[#00376b]">Learn More</a>
            </p>
            <p className="text-[12px] text-zinc-500 text-center mt-2 leading-4">
              By signing up, you agree to our <a href="#" className="font-semibold text-[#00376b]">Terms</a> , <a href="#" className="font-semibold text-[#00376b]">Privacy Policy</a> and <a href="#" className="font-semibold text-[#00376b]">Cookies Policy</a> .
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#0095f6] text-white rounded-[4px] py-1.5 font-semibold text-sm mt-4 ${
                loading ? "opacity-70" : "hover:bg-[#1877f2]"
              }`}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
            
            {signupForm.error && (
              <p className="text-red-500 text-xs text-center mt-2">{signupForm.error}</p>
            )}
          </form>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-zinc-300 rounded-sm p-5 text-center">
          <p className="text-sm">
            Have an account?{" "}
            <Link href="/signIn" className="text-[#0095f6] font-semibold">
              Log in
            </Link>
          </p>
        </div>

        {/* Get the app */}
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
