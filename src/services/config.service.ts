
import { Injectable, signal, effect, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, Firestore, onSnapshot } from 'firebase/firestore';

// INTERFACES
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
  category: string;
  image: string;
  favorite?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  whatsappNumber: string;
  hours: string;
  mapImage: string;
  menu: MenuItem[];
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number; // 1-5
  role: string;
}

export interface PageStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface AppConfig {
  global: {
    logoText: string;
    logoImage: string;
    navbarColor: string;
    navbarTextColor: string;
  };
  intro: {
    enabled: boolean;
    videoUrl: string;
    duration: number;
    fadeOut: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom-out';
  };
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    buttonText1: string; // NEW
    buttonText2: string; // NEW
    bgImage: string;
    style: PageStyle;
  };
  about: {
    title: string;
    description: string;
    image: string;
    stats: {
      val1: string; label1: string;
      val2: string; label2: string;
      val3: string; label3: string;
    };
    style: PageStyle;
  };
  menuPage: {
    title: string;
    subtitle: string;
    style: PageStyle;
  };
  reservation: {
    title: string;
    subtitle: string;
    minPaxRegular: number;
    minPaxRamadan: number;
    style: PageStyle;
  };
  locationPage: {
    title: string;
    subtitle: string;
    style: PageStyle;
  };
  footer: {
    description: string; // NEW
    instagramLink: string;
    facebookLink: string;
    tiktokLink: string;
    style: PageStyle;
  };
  instagramProfile: {
    username: string;
    postsCount: string;
    followersCount: string;
    followingCount: string;
    bio: string;
    profilePic: string;
  };
  branches: Branch[]; 
  gallery: string[];
  testimonials: Testimonial[];
  ai: {
    systemInstruction: string;
    initialMessage: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private app: FirebaseApp | undefined;
  private auth: Auth | undefined;
  private db: Firestore | undefined;
  
  private DOC_ID = 'main_config';

  // Auth State
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => this.currentUser() !== null);
  isFirebaseReady = signal(false);
  
  // Error State
  firestoreError = signal<string | null>(null);

  // Kredensial Default
  private defaultFirebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyDKnk7ypRSI5UFB-eI3WW-ZwakRfMSbz0U", 
    authDomain: "sate-maranggi-app.firebaseapp.com",
    projectId: "sate-maranggi-app",
    storageBucket: "sate-maranggi-app.firebasestorage.app",
    messagingSenderId: "463298798562",
    appId: "1:463298798562:web:1f409a1aceb1e9cacb0fbb"
  };

  config = signal<AppConfig>({
    global: {
      logoText: 'Hj. Maya Cimahi',
      logoImage: '', 
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723'
    },
    intro: {
      enabled: false,
      videoUrl: '', 
      duration: 5,
      fadeOut: 'fade'
    },
    hero: {
      title: 'Sate Maranggi',
      highlight: 'Asli Hj. Maya',
      subtitle: 'Legenda Kuliner Cimahi. Nikmati sensasi Sate Jando yang lumer dan Sate Sapi empuk dengan sambal oncom khas yang bikin nagih.',
      buttonText1: 'Lihat Menu Kami',
      buttonText2: 'Reservasi Meja',
      bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop',
      style: {
        backgroundColor: '#2D1810',
        textColor: '#FFFFFF',
        accentColor: '#FF6F00',
        fontFamily: 'Playfair Display'
      }
    },
    about: {
      title: 'Resep Warisan Keluarga',
      description: 'Sate Maranggi Hj. Maya Cimahi menghadirkan cita rasa otentik yang telah melegenda.',
      image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=1000&auto=format&fit=crop',
      stats: {
        val1: '100%', label1: 'Daging Segar',
        val2: '4.9', label2: 'Rating Rasa',
        val3: '1980', label3: 'Sejak'
      },
      style: {
        backgroundColor: '#FFF8E1',
        textColor: '#4E342E',
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    menuPage: {
      title: 'Menu Andalan',
      subtitle: 'Pilihan menu favorit pelanggan setia Hj. Maya',
      style: {
        backgroundColor: '#FFFFFF', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display'
      }
    },
    reservation: {
      title: 'Reservasi Tempat',
      subtitle: 'Booking meja untuk acara keluarga, arisan, atau buka bersama.',
      minPaxRegular: 5,
      minPaxRamadan: 5,
      style: {
        backgroundColor: '#EFEBE9',
        textColor: '#3E2723', 
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    locationPage: {
      title: 'Kunjungi Kami',
      subtitle: 'Nikmati suasana makan yang nyaman di lokasi kami.',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFF8E1',
        accentColor: '#FFD54F',
        fontFamily: 'Playfair Display'
      }
    },
    footer: {
      description: 'Menyajikan cita rasa Sate Maranggi asli Cimahi sejak 1980. Bumbu meresap, daging empuk, sambal nikmat.',
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/',
      facebookLink: 'https://facebook.com',
      tiktokLink: 'https://tiktok.com',
      style: {
        backgroundColor: '#1A120B',
        textColor: '#D7CCC8',
        accentColor: '#FF6F00',
        fontFamily: 'Lato'
      }
    },
    instagramProfile: {
      username: 'satemaranggihjmayacimahi',
      postsCount: '1,245',
      followersCount: '15.4K',
      followingCount: '89',
      bio: 'Sate Maranggi Asli Hj. Maya 🍢',
      profilePic: 'https://ui-avatars.com/api/?name=Hj+Maya&background=D84315&color=fff&size=128'
    },
    branches: [
      {
        id: 'pusat',
        name: 'Pusat Cimahi',
        address: 'Jl. Mahar Martanegara No.123, Utama, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat',
        googleMapsUrl: 'https://maps.app.goo.gl/xxx',
        phone: '0812-2233-4455',
        whatsappNumber: '6281222334455',
        hours: '09.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/mapcimahi/600/400',
        menu: [
           { name: 'Sate Maranggi Campur', desc: 'Sate Sapi + Jando', price: 'Rp 45.000', category: 'Sate', image: 'https://images.unsplash.com/photo-1603083544234-814b73b22228?w=800', favorite: true }
        ]
      }
    ],
    gallery: [],
    testimonials: [],
    ai: {
      systemInstruction: 'Anda adalah asisten restoran.',
      initialMessage: 'Halo, ada yang bisa dibantu?'
    }
  });

  constructor() {
    this.initFirebase();

    effect(() => {
       const c = this.config();
       const root = document.documentElement;
       root.style.setProperty('--color-brand-brown', c.hero.style.backgroundColor);
    });
  }

  getStoredFirebaseConfig(): FirebaseConfig | null {
    const stored = localStorage.getItem('custom_firebase_config');
    return stored ? JSON.parse(stored) : null;
  }

  saveStoredFirebaseConfig(config: FirebaseConfig) {
    localStorage.setItem('custom_firebase_config', JSON.stringify(config));
    window.location.reload(); 
  }

  resetStoredFirebaseConfig() {
    localStorage.removeItem('custom_firebase_config');
    window.location.reload();
  }

  private initFirebase() {
    try {
      const customConfig = this.getStoredFirebaseConfig();
      const configToUse = customConfig || this.defaultFirebaseConfig;

      this.app = initializeApp(configToUse);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      
      this.isFirebaseReady.set(true);
      console.log(`✅ Firebase initialized with project: ${configToUse.projectId}`);
      
      onAuthStateChanged(this.auth, (user) => {
          this.currentUser.set(user);
      });

      this.subscribeToConfig();

    } catch (e) {
      console.error("❌ Firebase Init Error:", e);
      this.isFirebaseReady.set(false);
    }
  }

  async loginAdmin(email: string, pass: string) {
    if (!this.auth) throw new Error("Firebase belum terhubung.");
    await signInWithEmailAndPassword(this.auth, email, pass);
  }

  async logoutAdmin() {
    if (!this.auth) return;
    await signOut(this.auth);
  }

  subscribeToConfig() {
    if (!this.db) return; 

    const docRef = doc(this.db, 'settings', this.DOC_ID);
    
    onSnapshot(docRef, (docSnap) => {
      this.firestoreError.set(null); // Clear error on success

      if (docSnap.exists()) {
        const data = docSnap.data() as AppConfig;
        
        // Merge with existing config structure to ensure no undefined errors
        this.config.update(current => ({
            ...current,
            ...data,
            global: { ...current.global, ...(data.global || {}) },
            hero: { 
                ...current.hero, 
                ...(data.hero || {}),
                buttonText1: data.hero?.buttonText1 || current.hero.buttonText1,
                buttonText2: data.hero?.buttonText2 || current.hero.buttonText2
            },
            menuPage: { ...current.menuPage, ...(data.menuPage || {}) },
            about: { 
                ...current.about, 
                ...(data.about || {}),
                stats: { ...current.about.stats, ...(data.about?.stats || {}) }
            },
            reservation: { ...current.reservation, ...(data.reservation || {}) },
            locationPage: { ...current.locationPage, ...(data.locationPage || {}) },
            footer: { 
                ...current.footer, 
                ...(data.footer || {}),
                description: data.footer?.description || current.footer.description
            },
            instagramProfile: data.instagramProfile || current.instagramProfile,
            branches: data.branches || current.branches,
            gallery: data.gallery || current.gallery,
            testimonials: data.testimonials || current.testimonials,
            ai: { ...current.ai, ...(data.ai || {}) }
        }));
      } else {
        // Document doesn't exist yet, we can try to create it with default
        console.log("Config doc missing, using default.");
      }
    }, (error) => {
      // Handle Permission Error
      if (error.code === 'permission-denied') {
         this.firestoreError.set("PERMISSION_DENIED: Database terkunci. Harap deploy 'firestore.rules' di Firebase Console.");
      } else {
        console.error("Firestore Listen Error:", error);
        this.firestoreError.set(error.message);
      }
    });
  }

  async updateConfig(newConfig: AppConfig) {
    this.config.set(newConfig);

    if (!this.db) {
        alert("Error: Tidak terhubung ke database.");
        return;
    }

    try {
       await setDoc(doc(this.db, 'settings', this.DOC_ID), newConfig);
       alert("Data berhasil disimpan ke Server Firebase!"); 
    } catch (error: any) {
      console.error("Error saving config:", error);
      if (error.code === 'permission-denied') {
          alert("GAGAL MENYIMPAN: Akses Ditolak! Pastikan Rules sudah benar dan Anda sudah Login.");
      } else {
          alert("Gagal menyimpan ke server: " + error.message);
      }
    }
  }
  
  // --- LOCAL FILE HANDLING ---
  
  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error("Canvas error")); return; }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => reject(new Error("Invalid image"));
        };
        reader.onerror = (e) => reject(e);
    });
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '628123456789';
    let p = phone.replace(/[^0-9]/g, ''); 
    if (p.startsWith('08')) p = '62' + p.substring(1);
    return p;
  }

  getMenuContext(): string {
    return this.config().branches.map(b => 
      `CABANG: ${b.name}\n` + 
      b.menu.map(m => `  - ${m.name} (${m.price})`).join('\n')
    ).join('\n\n');
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:video')) return true;
    return url.endsWith('.mp4') || url.endsWith('.webm') || (url.includes('firebasestorage') && (url.includes('video')));
  }

  is3D(url: string): boolean {
    if (!url) return false;
    return url.endsWith('.glb') || url.endsWith('.gltf') || url.startsWith('data:model') || url.includes('gltf');
  }
}
