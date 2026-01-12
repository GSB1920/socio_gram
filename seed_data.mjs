import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZj6W9VSePY9MyFRIUgIygnHZszhJEz6w",
  authDomain: "sociogram-c69fe.firebaseapp.com",
  projectId: "sociogram-c69fe",
  storageBucket: "sociogram-c69fe.firebasestorage.app",
  messagingSenderId: "492943905224",
  appId: "1:492943905224:web:6fd84f4c7d4a9c48c3b0fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const users = [
  {
    username: "Gaurav",
    fullName: "Gaurav",
    bio: "Just me.",
    img: "https://ui-avatars.com/api/?name=Gaurav&background=random",
    posts: [],
    reels: []
  },
  {
    username: "lens_chaser",
    fullName: "Alex Rivera",
    bio: "Capturing moments 📸 | NYC based | Canon Shooter",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Sunset vibes 🌅 #nyc #sunset" },
      { type: "image", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Mountain escape 🏔️" }
    ],
    reels: [
      { url: "https://videos.pexels.com/video-files/3209828/3209828-hd_720_1366_25fps.mp4", caption: "City lights at night ✨" }
    ]
  },
  {
    username: "wanderlust_jen",
    fullName: "Jennifer Wu",
    bio: "Travel | Lifestyle | Coffee ☕️\nCurrently in Bali 🌴",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Bali breakfast 🥑 #travel #food" },
      { type: "image", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Beach days are the best days 🌊" }
    ],
    reels: [
      { url: "https://videos.pexels.com/video-files/4782135/4782135-hd_720_1366_25fps.mp4", caption: "Walking through the rice terraces 🌾" }
    ]
  },
  {
    username: "tasty_bites",
    fullName: "Gourmet Gary",
    bio: "Eating my way through the world 🍔\nFood Critic & Lover",
    img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Best pizza in town! 🍕" },
      { type: "image", url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Morning essentials 🥐🍳" }
    ],
    reels: []
  },
  {
    username: "art_by_anna",
    fullName: "Anna K.",
    bio: "Digital Artist 🎨 | Commissions Open\nCheck my link in bio!",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "New sketch process ✏️" }
    ],
    reels: [
      { url: "https://videos.pexels.com/video-files/3048536/3048536-hd_720_1366_25fps.mp4", caption: "Painting time 🖌️ #art #process" }
    ]
  },
  {
    username: "tech_guru",
    fullName: "Marcus Chen",
    bio: "Tech Reviewer 📱 | Gadget Head\nYouTube: TechWithMarcus",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Coding setup 💻 #setup #dev" },
      { type: "image", url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Electronics everywhere" }
    ],
    reels: []
  },
  {
    username: "carryminati",
    fullName: "Ajey Nagar",
    bio: "Youtuber | Streamer | Gamer 🎮\nSub to my channel!",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Gaming setup upgraded! 🕹️" }
    ],
    reels: []
  },
  {
    username: "bhuvan.bam22",
    fullName: "Bhuvan Bam",
    bio: "Actor | Musician | Youtuber\nBB Ki Vines",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Music recording session 🎤" }
    ],
    reels: []
  },
  {
    username: "zakirkhan_208",
    fullName: "Zakir Khan",
    bio: "Stand-up Comedian | Writer | Poet\nSakht Launda",
    img: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Live show tonight! 🎭" }
    ],
    reels: []
  },
  {
    username: "prajakta.koli",
    fullName: "Prajakta Koli",
    bio: "MostlySane | Youtuber | Actor\nGood vibes only ✨",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Fashion week look 👗" }
    ],
    reels: []
  },
  {
    username: "kushakapila",
    fullName: "Kusha Kapila",
    bio: "Digital Creator | Actor\nBillu ki mummy",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    posts: [
      { type: "image", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", caption: "Shoot day 🎬" }
    ],
    reels: []
  }
];

async function seedData() {
  console.log("🌱 Starting seed...");

  for (const user of users) {
    console.log(`Processing user: ${user.username}`);

    // 1. Create User
    // We use setDoc with merge: true to avoid overwriting if exists, 
    // but here we want to ensure these fields are set.
    const userRef = doc(db, "users", user.username); // Using username as ID for simplicity in lookups
    await setDoc(userRef, {
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      email: `${user.username}@example.com`,
      img: user.img, // Store as 'img' to match your app's usage
      photoURL: user.img, // Standard firebase field
      followers: Math.floor(Math.random() * 1000) + 50,
      following: Math.floor(Math.random() * 500) + 20,
      createdAt: serverTimestamp()
    }, { merge: true });

    // 2. Create Posts (Static Images)
    for (const post of user.posts) {
      await addDoc(collection(db, "staticImage"), {
        username: user.username,
        caption: post.caption,
        staticImageLink: post.url,
        likeCount: Math.floor(Math.random() * 200),
        likes: Math.floor(Math.random() * 200), // redundant but safe
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
        likedBy: [],
        createdAt: serverTimestamp(),
        type: 'image'
      });
    }

    // 3. Create Reels (SFC)
    for (const reel of user.reels) {
      await addDoc(collection(db, "sfc"), {
        username: user.username,
        caption: reel.caption,
        videoUrl: reel.url, // App uses videoUrl or sfcLink? Let's check...
        sfcLink: reel.url, // Adding both to be safe based on recent file reads
        likeCount: Math.floor(Math.random() * 500),
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
        likedBy: [],
        createdAt: serverTimestamp(),
        type: 'sfc'
      });
    }
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seedData().catch(console.error);
