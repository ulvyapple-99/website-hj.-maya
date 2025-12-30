
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
  soldOut?: boolean; // NEW: Fitur Stok Habis
  spicyLevel?: number; // NEW: 0 = No, 1-3 = Pedas
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
  // NEW: Branch specific social media
  instagramLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  menu: MenuItem[];
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number; // 1-5
  role: string;
}

// NEW: Granular Style Options (The "50 Features")
export interface StyleOptions {
  // Typography Sizes
  titleFontSize?: string;     // e.g. '3rem'
  subtitleFontSize?: string;  // e.g. '1.2rem'
  bodyFontSize?: string;      // e.g. '1rem'
  
  // Dimensions & Spacing
  sectionPaddingY?: string;   // e.g. '80px'
  elementGap?: string;        // e.g. '20px'
  containerMaxWidth?: string; // e.g. '1280px'
  
  // Visuals
  borderRadius?: string;      // e.g. '12px'
  boxShadow?: string;         // e.g. '0 4px 6px rgba(0,0,0,0.1)'
  borderWidth?: string;       // e.g. '1px'
  
  // Component Specifics (Optional keys based on context)
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  buttonRadius?: string;
  inputHeight?: string;
  imageHeight?: string;
  mapHeight?: string;
  iconSize?: string;
  navHeight?: string;
  logoHeight?: string;
}

export interface PageStyle extends StyleOptions {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface AppConfig {
  features: {
    showHero: boolean;
    showAbout: boolean;
    showMenu: boolean;
    showReservation: boolean;
    showLocation: boolean;
    showGallery: boolean;
    showTestimonials: boolean;
    enableOrdering: boolean; 
  };
  global: {
    logoText: string;
    logoImage: string;
    favicon: string; 
    metaDescription: string;
    navbarColor: string;
    navbarTextColor: string;
    // New Global Styles
    navHeight: string;
    navLogoHeight: string;
    navLinkFontSize: string;
    navLinkGap: string;
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
    buttonText1: string;
    buttonText2: string;
    bgImage: string;
    overlayOpacity: number; 
    style: PageStyle; // Enhanced with StyleOptions
  };
  about: {
    title: string;
    description: string;
    image: string;
    imagePosition: 'left' | 'right'; 
    stats: {
      val1: string; label1: string;
      val2: string; label2: string;
      val3: string; label3: string;
    };
    style: PageStyle; // Enhanced
  };
  menuPage: {
    title: string;
    subtitle: string;
    style: PageStyle; // Enhanced
    // Specific Menu Styles
    cardImageHeight: string;
    cardBorderRadius: string;
    itemTitleSize: string;
    itemPriceSize: string;
    gridGap: string;
  };
  reservation: {
    title: string;
    subtitle: string;
    minPaxRegular: number;
    minPaxRamadan: number;
    whatsappTemplate: string; 
    style: PageStyle; // Enhanced
    // Specific Reservation Styles
    cardBorderRadius: string;
    inputHeight: string;
    inputBorderRadius: string;
    buttonHeight: string;
  };
  locationPage: {
    title: string;
    subtitle: string;
    style: PageStyle; // Enhanced
    // Specific Location Styles
    cardBorderRadius: string;
    mapHeight: string;
  };
  footer: {
    description: string;
    copyrightText: string; 
    instagramLink: string;
    facebookLink: string;
    tiktokLink: string;
    style: PageStyle; // Enhanced
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
    // New AI Styles
    buttonColor: string;
    buttonSize: string;
    windowWidth: string;
    headerColor: string;
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
    features: {
        showHero: true,
        showAbout: true,
        showMenu: true,
        showReservation: true,
        showLocation: true,
        showGallery: true,
        showTestimonials: true,
        enableOrdering: true
    },
    global: {
      logoText: 'Hj. Maya Group',
      logoImage: '', 
      favicon: '',
      metaDescription: 'Sate Maranggi Paling Enak di Cimahi',
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723',
      navHeight: '80px',
      navLogoHeight: '40px',
      navLinkFontSize: '16px',
      navLinkGap: '32px'
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
      overlayOpacity: 0.5,
      style: {
        backgroundColor: '#2D1810',
        textColor: '#FFFFFF',
        accentColor: '#FF6F00',
        fontFamily: 'Playfair Display',
        titleFontSize: '4.5rem',
        subtitleFontSize: '1.25rem',
        buttonPaddingX: '40px',
        buttonPaddingY: '16px',
        buttonRadius: '50px'
      }
    },
    about: {
      title: 'Resep Warisan Keluarga',
      description: 'Sate Maranggi Hj. Maya Cimahi menghadirkan cita rasa otentik yang telah melegenda.',
      image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=1000&auto=format&fit=crop',
      imagePosition: 'left',
      stats: {
        val1: '100%', label1: 'Daging Segar',
        val2: '4.9', label2: 'Rating Rasa',
        val3: '1980', label3: 'Sejak'
      },
      style: {
        backgroundColor: '#FFF8E1',
        textColor: '#4E342E',
        accentColor: '#D84315',
        fontFamily: 'Lato',
        titleFontSize: '3rem',
        bodyFontSize: '1.125rem',
        sectionPaddingY: '80px',
        borderRadius: '16px'
      }
    },
    menuPage: {
      title: 'Menu Andalan',
      subtitle: 'Pilihan menu favorit pelanggan setia Hj. Maya',
      style: {
        backgroundColor: '#FFFFFF', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display',
        titleFontSize: '3rem',
        subtitleFontSize: '1.125rem'
      },
      cardImageHeight: '100%', // Aspect square handled by CSS usually, but can be forced
      cardBorderRadius: '12px',
      itemTitleSize: '1.125rem',
      itemPriceSize: '0.875rem',
      gridGap: '24px'
    },
    reservation: {
      title: 'Reservasi Tempat',
      subtitle: 'Booking meja untuk acara keluarga, arisan, atau buka bersama.',
      minPaxRegular: 5,
      minPaxRamadan: 5,
      whatsappTemplate: 'Halo Admin {branch}, saya mau reservasi meja untuk {pax} orang pada tanggal {date} jam {time} a.n {name}.',
      style: {
        backgroundColor: '#EFEBE9',
        textColor: '#3E2723', 
        accentColor: '#D84315',
        fontFamily: 'Lato',
        titleFontSize: '2.25rem',
        sectionPaddingY: '40px'
      },
      cardBorderRadius: '16px',
      inputHeight: '42px',
      inputBorderRadius: '8px',
      buttonHeight: '48px'
    },
    locationPage: {
      title: 'Kunjungi Kami',
      subtitle: 'Nikmati suasana makan yang nyaman di lokasi kami.',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFF8E1',
        accentColor: '#FFD54F',
        fontFamily: 'Playfair Display',
        titleFontSize: '2.25rem',
        sectionPaddingY: '80px'
      },
      cardBorderRadius: '16px',
      mapHeight: '200px'
    },
    footer: {
      description: 'Menyajikan cita rasa Sate Maranggi asli Cimahi sejak 1980. Bumbu meresap, daging empuk, sambal nikmat.',
      copyrightText: 'All Rights Reserved.',
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/', // Fallback global
      facebookLink: 'https://facebook.com',
      tiktokLink: 'https://tiktok.com',
      style: {
        backgroundColor: '#1A120B',
        textColor: '#D7CCC8',
        accentColor: '#FF6F00',
        fontFamily: 'Lato',
        sectionPaddingY: '60px',
        titleFontSize: '1.5rem',
        bodyFontSize: '0.875rem'
      }
    },
    instagramProfile: {
      username: 'satemaranggihjmayacimahi',
      postsCount: '633',
      followersCount: '2,903',
      followingCount: '21',
      bio: 'Sate Maranggi Hj. Maya Cimahi 🍢\n📍Jl. Mahar Martanegara No.123, Utama, Cimahi\nBuka Setiap Hari 10.00 - 22.00 WIB\nInfo & Reservasi klik link dibawah 👇',
      profilePic: 'https://ui-avatars.com/api/?name=HM&background=D84315&color=fff&size=128&rounded=true'
    },
    branches: [
      {
        id: 'tn',
        name: 'Tuang Ngeunah',
        address: 'Jl. Kolonel Masturi No. 123, Cimahi Utara',
        googleMapsUrl: 'https://maps.app.goo.gl/xxx',
        phone: '0812-1111-2222',
        whatsappNumber: '6281211112222',
        hours: '10.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/tuang/600/400',
        instagramLink: 'https://instagram.com/tuangngeunah',
        facebookLink: 'https://facebook.com/tuangngeunah',
        tiktokLink: 'https://tiktok.com/@tuangngeunah',
        menu: [
           { name: 'Sate Maranggi Premium', desc: 'Daging pilihan terbaik', price: 'Rp 50.000', category: 'Sate', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', favorite: true, soldOut: false, spicyLevel: 0 }
        ]
      },
      {
        id: 'cimahi',
        name: 'Hj. Maya Cimahi',
        address: 'Jl. Mahar Martanegara No.123, Utama, Cimahi',
        googleMapsUrl: 'https://maps.app.goo.gl/xxx',
        phone: '0812-2233-4455',
        whatsappNumber: '6281222334455',
        hours: '09.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/cimahi/600/400',
        instagramLink: 'https://instagram.com/satemaranggihjmayacimahi',
        facebookLink: '',
        tiktokLink: '',
        menu: [
           { name: 'Sate Maranggi Campur', desc: 'Sate Sapi + Jando', price: 'Rp 45.000', category: 'Sate', image: 'https://images.unsplash.com/photo-1603083544234-814b73b22228?w=800', favorite: true, soldOut: false, spicyLevel: 0 }
        ]
      },
      {
        id: 'pasteur',
        name: 'Hj. Maya Pasteur',
        address: 'Jl. Dr. Djunjunan No. 45, Pasteur, Bandung',
        googleMapsUrl: 'https://maps.app.goo.gl/xxx',
        phone: '0812-9988-7766',
        whatsappNumber: '6281299887766',
        hours: '10.00 - 23.00 WIB',
        mapImage: 'https://picsum.photos/seed/pasteur/600/400',
        instagramLink: 'https://instagram.com/satemaranggihjmayapasteur',
        facebookLink: '',
        tiktokLink: '',
        menu: [
           { name: 'Sop Iga Bakar', desc: 'Iga bakar dengan kuah sop segar', price: 'Rp 65.000', category: 'Sop', image: 'https://images.unsplash.com/photo-1544025162-d76690b6d012?w=800', favorite: true, soldOut: false, spicyLevel: 1 }
        ]
      }
    ],
    gallery: [
       'https://images.unsplash.com/photo-1544025162-d76690b6d012?w=500',
       'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500',
       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500'
    ],
    testimonials: [],
    ai: {
      systemInstruction: 'Anda adalah asisten restoran.',
      initialMessage: 'Halo, ada yang bisa dibantu?',
      buttonColor: '#D84315',
      buttonSize: '56px',
      windowWidth: '340px',
      headerColor: '#D84315'
    }
  });

  constructor() {
    this.initFirebase();

    effect(() => {
       const c = this.config();
       const root = document.documentElement;
       root.style.setProperty('--color-brand-brown', c.hero.style.backgroundColor);
       // Set Favicon Dynamically
       if (c.global.favicon) {
         const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
         if (!link) {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = c.global.favicon;
            document.head.appendChild(newLink);
         } else {
            link.href = c.global.favicon;
         }
       }
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
        
        // Deep Merge & Fallback for new properties
        this.config.update(current => {
          // Helper to merge style properties safely
          const mergeStyle = (currentStyle: any, newStyle: any) => ({ ...currentStyle, ...newStyle });

          return {
            ...current,
            ...data,
            features: { ...current.features, ...(data.features || {}) },
            global: { ...current.global, ...(data.global || {}) },
            intro: { ...current.intro, ...(data.intro || {}) },
            hero: { 
                ...current.hero, 
                ...(data.hero || {}),
                style: mergeStyle(current.hero.style, data.hero?.style)
            },
            about: { 
                ...current.about, 
                ...(data.about || {}),
                stats: { ...current.about.stats, ...(data.about?.stats || {}) },
                style: mergeStyle(current.about.style, data.about?.style)
            },
            menuPage: { 
                ...current.menuPage, 
                ...(data.menuPage || {}),
                style: mergeStyle(current.menuPage.style, data.menuPage?.style)
            },
            reservation: { 
                ...current.reservation, 
                ...(data.reservation || {}),
                style: mergeStyle(current.reservation.style, data.reservation?.style)
            },
            locationPage: { 
                ...current.locationPage, 
                ...(data.locationPage || {}),
                style: mergeStyle(current.locationPage.style, data.locationPage?.style)
            },
            footer: { 
                ...current.footer, 
                ...(data.footer || {}),
                style: mergeStyle(current.footer.style, data.footer?.style)
            },
            branches: data.branches || current.branches,
            instagramProfile: data.instagramProfile || current.instagramProfile,
            gallery: data.gallery || current.gallery,
            testimonials: data.testimonials || current.testimonials,
            ai: { ...current.ai, ...(data.ai || {}) }
          };
        });
      } else {
        console.log("Config doc missing, using default.");
      }
    }, (error) => {
       console.error("Firestore Listen Error:", error);
       this.firestoreError.set(error.message);
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
      b.menu.map(m => `  - ${m.name} (${m.price}) ${m.soldOut ? '[HABIS]' : ''}`).join('\n')
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
