
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

// Reusable Text Style Interface
export interface TextStyle {
  fontFamily: string;
  fontSize: string;
  color: string;
}

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
  category: string;
  image: string;
  favorite?: boolean;
  soldOut?: boolean;
  spicyLevel?: number;
}

export interface PackageItem {
  name: string;
  price: string;
  description: string;
  image: string;
  items: string[]; // List of items included
  minPax?: number;
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
  instagramLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  menu: MenuItem[];
  packages?: PackageItem[]; // New field
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  role: string;
}

// Granular Style Options
export interface StyleOptions {
  // Typography Sizes
  titleFontSize?: string;
  subtitleFontSize?: string;
  bodyFontSize?: string;
  
  // Dimensions & Spacing
  sectionPaddingY?: string;
  elementGap?: string;
  containerMaxWidth?: string;
  
  // Visuals
  borderRadius?: string;
  boxShadow?: string;
  borderWidth?: string;
  
  // Component Specifics
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
    showPackages: boolean; 
    showReservation: boolean;
    showLocation: boolean;
    showGallery: boolean;
    showTestimonials: boolean;
    enableOrdering: boolean; 
    enableCursor: boolean;
  };
  global: {
    logoText: string;
    logoStyle: TextStyle; 
    logoImage: string;
    favicon: string; 
    metaDescription: string;
    metaStyle: TextStyle; 
    navbarColor: string;
    navbarTextColor: string;
    navHeight: string;
    navLogoHeight: string;
    navLinkFontSize: string;
    navLinkGap: string;
    analyticsId: string;
  };
  intro: {
    enabled: boolean;
    videoUrl: string;
    duration: number;
    fadeOut: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom-out';
  };
  hero: {
    badgeText: string;
    badgeStyle: TextStyle;
    title: string;
    titleStyle: TextStyle; 
    highlight: string;
    highlightStyle: TextStyle; 
    subtitle: string;
    subtitleStyle: TextStyle; 
    buttonText1: string;
    button1Link: string;
    button1Style: TextStyle; 
    buttonText2: string;
    button2Link: string;
    button2Style: TextStyle; 
    bgImage: string;
    overlayOpacity: number; 
    textAlign: 'left' | 'center' | 'right'; 
    style: PageStyle;
  };
  about: {
    title: string;
    titleStyle: TextStyle; 
    description: string;
    descriptionStyle: TextStyle; 
    image: string;
    imagePosition: 'left' | 'right'; 
    stats: {
      val1: string; label1: string;
      val2: string; label2: string;
      val3: string; label3: string;
    };
    statsStyle: TextStyle; 
    statsLabelStyle: TextStyle; 
    style: PageStyle;
  };
  menuPage: {
    title: string;
    titleStyle: TextStyle; 
    subtitle: string;
    subtitleStyle: TextStyle; 
    style: PageStyle;
    cardImageHeight: string;
    cardBorderRadius: string;
    itemTitleSize: string;
    itemPriceSize: string;
    gridGap: string;
  };
  packagesPage: { 
    title: string;
    titleStyle: TextStyle; 
    subtitle: string;
    subtitleStyle: TextStyle; 
    style: PageStyle;
    cardBorderRadius: string;
  };
  reservation: {
    title: string;
    titleStyle: TextStyle;
    subtitle: string;
    subtitleStyle: TextStyle;
    minPaxRegular: number;
    minPaxRamadan: number;
    whatsappTemplate: string; 
    style: PageStyle;
    cardBorderRadius: string;
    inputHeight: string;
    inputBorderRadius: string;
    buttonHeight: string;
  };
  locationPage: {
    title: string;
    titleStyle: TextStyle;
    subtitle: string;
    subtitleStyle: TextStyle;
    labelStyle: TextStyle;
    branchNameStyle: TextStyle;
    branchDetailStyle: TextStyle;
    style: PageStyle;
    cardBorderRadius: string;
    mapHeight: string;
  };
  testimonialStyles: {
    reviewStyle: TextStyle;
    nameStyle: TextStyle;
    roleStyle: TextStyle;
  };
  footer: {
    description: string;
    descriptionStyle: TextStyle;
    copyrightText: string;
    copyrightStyle: TextStyle;
    brandStyle: TextStyle;
    socialMediaHeaderStyle: TextStyle;
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
  private LOCAL_STORAGE_KEY = 'app_config_local';

  // Auth State
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => this.currentUser() !== null || this.isDemoMode());
  isFirebaseReady = signal(false);
  isDemoMode = signal(false);
  
  // Error State
  firestoreError = signal<string | null>(null);

  // Default Config
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
        showPackages: true,
        showReservation: true,
        showLocation: true,
        showGallery: true,
        showTestimonials: true,
        enableOrdering: true,
        enableCursor: true
    },
    global: {
      logoText: 'Sate Maranggi Hj. Maya',
      logoStyle: { fontFamily: 'Oswald', fontSize: '1.5rem', color: '#D84315' },
      logoImage: '', 
      favicon: '',
      metaDescription: 'Sate Maranggi Hj. Maya Cimahi - Kelezatan Daging Sapi Pilihan & Sambal Oncom Legendaris.',
      metaStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#000000' },
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723',
      navHeight: '80px',
      navLogoHeight: '45px',
      navLinkFontSize: '16px',
      navLinkGap: '32px',
      analyticsId: ''
    },
    intro: {
      enabled: false,
      videoUrl: '', 
      duration: 5,
      fadeOut: 'fade'
    },
    hero: {
      badgeText: 'Est. 2006',
      badgeStyle: { fontFamily: 'Oswald', fontSize: '0.875rem', color: '#ff8800' },
      title: 'Sate Maranggi & Sop',
      titleStyle: { fontFamily: 'Oswald', fontSize: '4.5rem', color: '#FFFFFF' },
      highlight: 'Tuang ngeunah Hj. Maya',
      highlightStyle: { fontFamily: 'Great Vibes', fontSize: 'inherit', color: '#FF7043' },
      subtitle: 'Cita rasa legendaris Cimahi. Daging sapi pilihan yang empuk, bumbu meresap sempurna, disajikan dengan Sambal Oncom & Tomat segar.',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1.25rem', color: '#F3F4F6' },
      buttonText1: 'Lihat Menu Kami',
      button1Link: '/menu',
      button1Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
      buttonText2: 'Reservasi Meja',
      button2Link: '/reservation',
      button2Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
      bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop',
      overlayOpacity: 0.6,
      textAlign: 'center',
      style: {
        backgroundColor: '#2D1810',
        textColor: '#FFFFFF',
        accentColor: '#D84315',
        fontFamily: 'Oswald',
        titleFontSize: '4.5rem',
        subtitleFontSize: '1.25rem',
        buttonPaddingX: '40px',
        buttonPaddingY: '16px',
        buttonRadius: '50px'
      }
    },
    about: {
      title: 'Legenda Kuliner Cimahi',
      titleStyle: { fontFamily: 'Oswald', fontSize: '3rem', color: '#3E2723' },
      description: 'Berawal dari resep keluarga yang dijaga keasliannya, Sate Maranggi Hj. Maya telah menjadi ikon kuliner di Cimahi.\n\nKami hanya menggunakan daging sapi pilihan yang dimarinasi dengan rempah-rempah alami, dibakar sempurna, dan disajikan dengan ketan bakar serta sambal oncom khas.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '1.125rem', color: '#5D4037' },
      image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=1000',
      imagePosition: 'right',
      stats: {
        val1: '100%', label1: 'Daging Sapi',
        val2: '40th', label2: 'Pengalaman',
        val3: '3', label3: 'Cabang'
      },
      statsStyle: { fontFamily: 'Oswald', fontSize: '2rem', color: '#D84315' },
      statsLabelStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#3E2723' },
      style: {
        backgroundColor: '#FFF8E1',
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Lato',
        titleFontSize: '3rem',
        bodyFontSize: '1.125rem',
        sectionPaddingY: '80px',
        borderRadius: '24px'
      }
    },
    menuPage: {
      title: 'Menu Favorit',
      titleStyle: { fontFamily: 'Oswald', fontSize: '3rem', color: '#3E2723' },
      subtitle: 'Sate, Sop, dan Hidangan Sunda Pilihan',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1.125rem', color: '#5D4037' },
      style: {
        backgroundColor: '#FFFFFF', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Oswald',
        titleFontSize: '3rem',
        subtitleFontSize: '1.125rem'
      },
      cardImageHeight: '100%', 
      cardBorderRadius: '16px',
      itemTitleSize: '1.125rem',
      itemPriceSize: '0.875rem',
      gridGap: '24px'
    },
    packagesPage: {
      title: 'Paket Botram',
      titleStyle: { fontFamily: 'Oswald', fontSize: '2.5rem', color: '#3E2723' },
      subtitle: 'Makan bareng lebih hemat dan nikmat',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#5D4037' },
      style: {
        backgroundColor: '#FFF3E0', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Oswald',
        titleFontSize: '2.5rem',
        subtitleFontSize: '1rem'
      },
      cardBorderRadius: '16px'
    },
    reservation: {
      title: 'Reservasi Meja',
      titleStyle: { fontFamily: 'Oswald', fontSize: '2.25rem', color: '#3E2723' },
      subtitle: 'Pastikan tempat untuk acara spesial Anda',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#5D4037' },
      minPaxRegular: 5,
      minPaxRamadan: 5,
      whatsappTemplate: 'Halo Admin Sate Hj. Maya {branch}, saya mau reservasi untuk {pax} orang pada tanggal {date} jam {time} a.n {name}.',
      style: {
        backgroundColor: '#F5F5F5',
        textColor: '#3E2723', 
        accentColor: '#D84315',
        fontFamily: 'Lato',
        titleFontSize: '2.25rem',
        sectionPaddingY: '60px'
      },
      cardBorderRadius: '16px',
      inputHeight: '48px',
      inputBorderRadius: '8px',
      buttonHeight: '52px'
    },
    locationPage: {
      title: 'Outlet Kami',
      titleStyle: { fontFamily: 'Oswald', fontSize: '2.5rem', color: '#FFFFFF' },
      subtitle: 'Kunjungi cabang terdekat di kota Anda',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFCCBC' },
      labelStyle: { fontFamily: 'Oswald', fontSize: '0.875rem', color: '#FF7043' },
      branchNameStyle: { fontFamily: 'Oswald', fontSize: '1.5rem', color: '#D84315' },
      branchDetailStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#5D4037' },
      style: {
        backgroundColor: '#1A120B',
        textColor: '#FFF8E1',
        accentColor: '#D84315',
        fontFamily: 'Oswald',
        titleFontSize: '2.5rem',
        sectionPaddingY: '80px'
      },
      cardBorderRadius: '20px',
      mapHeight: '220px'
    },
    testimonialStyles: {
      reviewStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#4B5563' },
      nameStyle: { fontFamily: 'Oswald', fontSize: '1rem', color: '#111827' },
      roleStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#D84315' }
    },
    footer: {
      description: 'Sate Maranggi Hj. Maya.\nCita rasa otentik yang tak terlupakan.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#BCAAA4' },
      copyrightText: 'Created with Passion.',
      copyrightStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#8D6E63' },
      brandStyle: { fontFamily: 'Oswald', fontSize: '1.5rem', color: '#FFFFFF' },
      socialMediaHeaderStyle: { fontFamily: 'Oswald', fontSize: '1.125rem', color: '#FF7043' },
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/', 
      facebookLink: '',
      tiktokLink: '',
      style: {
        backgroundColor: '#261C19',
        textColor: '#D7CCC8',
        accentColor: '#FF7043',
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
      bio: 'Sate Maranggi Hj. Maya Cimahi 🍢\n📍Jl. Mahar Martanegara No.123, Utama, Cimahi\nBuka Setiap Hari 10.00 - 22.00 WIB',
      profilePic: 'https://ui-avatars.com/api/?name=HM&background=D84315&color=fff&size=128&rounded=true'
    },
    branches: [
      {
        id: 'cimahi',
        name: 'Pusat Cimahi',
        address: 'Jl. Mahar Martanegara No.123, Utama, Kec. Cimahi Sel., Kota Cimahi',
        googleMapsUrl: 'https://maps.app.goo.gl/xxx',
        phone: '0812-2345-6789',
        whatsappNumber: '6281223456789',
        hours: '10.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/cimahi/600/400',
        instagramLink: 'https://instagram.com/satemaranggihjmayacimahi',
        facebookLink: '',
        tiktokLink: '',
        menu: [
           { name: 'Sate Maranggi Sapi (10 Tsk)', desc: 'Full daging sapi empuk dengan bumbu meresap', price: 'Rp 50.000', category: 'Sate', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', favorite: true, soldOut: false, spicyLevel: 0 },
           { name: 'Sate Maranggi Jando (10 Tsk)', desc: 'Lemak susu sapi gurih lumer di mulut', price: 'Rp 45.000', category: 'Sate', image: 'https://images.unsplash.com/photo-1603083544234-814b73b22228?w=800', favorite: true, soldOut: false, spicyLevel: 0 },
           { name: 'Ketan Bakar', desc: 'Teman makan sate paling pas', price: 'Rp 10.000', category: 'Pelengkap', image: 'https://images.unsplash.com/photo-1626804475297-411f7e340d86?w=800', favorite: false, soldOut: false, spicyLevel: 0 }
        ],
        packages: [
          { name: 'Paket Berdua', price: 'Rp 120.000', description: 'Hemat untuk pasangan', image: 'https://picsum.photos/seed/dua/400/300', items: ['20 Tusuk Sate', '2 Nasi Timbel', '2 Teh Manis', '1 Karedok'] }
        ]
      }
    ],
    gallery: [
       'https://images.unsplash.com/photo-1544025162-d76690b6d012?w=500',
       'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500',
       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500'
    ],
    testimonials: [
        { name: 'Budi Santoso', role: 'Local Guide', rating: 5, text: 'Sate maranggi paling enak di Cimahi! Dagingnya empuk banget.' },
        { name: 'Siti Aminah', role: 'Food Blogger', rating: 5, text: 'Sambal oncomnya juara. Wajib coba sate jandonya.' }
    ],
    ai: {
      systemInstruction: 'Anda adalah asisten virtual Sate Maranggi Hj. Maya. Jawab dengan ramah, gunakan bahasa Indonesia yang santai tapi sopan. Rekomendasikan Sate Jando dan Sate Sapi.',
      initialMessage: 'Halo! Cari sate maranggi enak? Ada yang bisa saya bantu?',
      buttonColor: '#D84315',
      buttonSize: '60px',
      windowWidth: '360px',
      headerColor: '#D84315'
    }
  });

  constructor() {
    this.loadLocalConfig();
    this.initFirebase();

    effect(() => {
       const c = this.config();
       const root = document.documentElement;
       root.style.setProperty('--color-brand-brown', c.hero.style.backgroundColor);
       root.style.setProperty('--color-brand-orange', c.hero.style.accentColor);
       
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
       this.updateManifest(c);
       if (c.global.analyticsId) {
          this.injectAnalytics(c.global.analyticsId);
       }
    });
  }
  
  private loadLocalConfig() {
    try {
      const local = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        this.config.update(c => ({
            ...c,
            ...parsed,
            intro: { ...c.intro, ...(parsed.intro || {}) }
        }));
        console.log("✅ Config loaded from LocalStorage");
      }
    } catch(e) { console.error("Error loading local config", e); }
  }

  // --- ANALYTICS ---
  private injectAnalytics(id: string) {
    if (document.getElementById('analytics-script')) return;
    const script = document.createElement('script');
    script.id = 'analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
    const inline = document.createElement('script');
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
    `;
    document.head.appendChild(inline);
  }

  logEvent(eventName: string, params: any = {}) {
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
    console.log('[Analytics]', eventName, params);
  }

  // --- PWA ---
  private updateManifest(c: AppConfig) {
    const manifest = {
      name: c.global.logoText,
      short_name: c.global.logoText,
      start_url: "./",
      display: "standalone",
      background_color: c.global.navbarColor,
      theme_color: c.global.navbarColor,
      icons: [
        {
          src: c.global.favicon || "https://ui-avatars.com/api/?name=App&size=192",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: c.global.favicon || "https://ui-avatars.com/api/?name=App&size=512",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    let link: HTMLLinkElement | null = document.querySelector('#manifest-link');
    if (!link) {
      link = document.createElement('link');
      link.id = 'manifest-link';
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = manifestURL;
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
      // Removed Storage init as requested
      
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
    if (this.auth) {
      try {
        await signInWithEmailAndPassword(this.auth, email, pass);
        this.isDemoMode.set(false);
        return;
      } catch (error: any) {
        console.warn("Firebase Login Failed, checking local fallback...", error.code);
      }
    }
    
    if (email === 'admin@admin.com' && pass === 'admin') {
      this.isDemoMode.set(true);
      console.log("✅ Logged in to Local Admin Mode");
      return;
    }

    throw new Error("Login gagal. Cek email/password atau gunakan mode lokal.");
  }

  async logoutAdmin() {
    if (this.isDemoMode()) {
      this.isDemoMode.set(false);
      return;
    }
    if (!this.auth) return;
    await signOut(this.auth);
  }

  subscribeToConfig() {
    if (!this.db) return; 
    const docRef = doc(this.db, 'settings', this.DOC_ID);
    
    onSnapshot(docRef, (docSnap) => {
      if (this.isDemoMode()) return;

      this.firestoreError.set(null);
      if (docSnap.exists()) {
        const data = docSnap.data() as AppConfig;
        
        const mergeStyle = (curr: any, fresh: any) => ({ ...curr, ...(fresh || {}) });
        const mergeText = (curr: any, fresh: any) => ({ ...curr, ...(fresh || {}) });

        this.config.update(current => ({
            ...current,
            ...data,
            features: { ...current.features, ...(data.features || {}) },
            global: { 
                ...current.global, 
                ...(data.global || {}),
                logoStyle: mergeText(current.global.logoStyle, data.global?.logoStyle),
                metaStyle: mergeText(current.global.metaStyle, data.global?.metaStyle)
            },
            intro: { 
                ...current.intro, 
                ...(data.intro || {}),
                fadeOut: (data.intro?.fadeOut) || current.intro.fadeOut || 'fade'
            },
            hero: { 
                ...current.hero, 
                ...(data.hero || {}),
                badgeStyle: mergeText(current.hero.badgeStyle, data.hero?.badgeStyle),
                titleStyle: mergeText(current.hero.titleStyle, data.hero?.titleStyle),
                highlightStyle: mergeText(current.hero.highlightStyle, data.hero?.highlightStyle),
                subtitleStyle: mergeText(current.hero.subtitleStyle, data.hero?.subtitleStyle),
                button1Style: mergeText(current.hero.button1Style, data.hero?.button1Style),
                button2Style: mergeText(current.hero.button2Style, data.hero?.button2Style),
                style: mergeStyle(current.hero.style, data.hero?.style)
            },
            about: { 
                ...current.about, 
                ...(data.about || {}),
                titleStyle: mergeText(current.about.titleStyle, data.about?.titleStyle),
                descriptionStyle: mergeText(current.about.descriptionStyle, data.about?.descriptionStyle),
                stats: { ...current.about.stats, ...(data.about?.stats || {}) },
                statsStyle: mergeText(current.about.statsStyle, data.about?.statsStyle),
                statsLabelStyle: mergeText(current.about.statsLabelStyle, data.about?.statsLabelStyle),
                style: mergeStyle(current.about.style, data.about?.style)
            },
            menuPage: { 
                ...current.menuPage, 
                ...(data.menuPage || {}),
                titleStyle: mergeText(current.menuPage.titleStyle, data.menuPage?.titleStyle),
                subtitleStyle: mergeText(current.menuPage.subtitleStyle, data.menuPage?.subtitleStyle),
                style: mergeStyle(current.menuPage.style, data.menuPage?.style)
            },
            packagesPage: {
                ...current.packagesPage,
                ...(data.packagesPage || {}),
                titleStyle: mergeText(current.packagesPage?.titleStyle, data.packagesPage?.titleStyle),
                subtitleStyle: mergeText(current.packagesPage?.subtitleStyle, data.packagesPage?.subtitleStyle),
                style: mergeStyle(current.packagesPage?.style || {}, data.packagesPage?.style || {})
            },
            reservation: { 
                ...current.reservation, 
                ...(data.reservation || {}),
                titleStyle: mergeText(current.reservation.titleStyle, data.reservation?.titleStyle),
                subtitleStyle: mergeText(current.reservation.subtitleStyle, data.reservation?.subtitleStyle),
                style: mergeStyle(current.reservation.style, data.reservation?.style)
            },
            locationPage: { 
                ...current.locationPage, 
                ...(data.locationPage || {}),
                titleStyle: mergeText(current.locationPage.titleStyle, data.locationPage?.titleStyle),
                subtitleStyle: mergeText(current.locationPage.subtitleStyle, data.locationPage?.subtitleStyle),
                labelStyle: mergeText(current.locationPage.labelStyle, data.locationPage?.labelStyle),
                branchNameStyle: mergeText(current.locationPage.branchNameStyle, data.locationPage?.branchNameStyle),
                branchDetailStyle: mergeText(current.locationPage.branchDetailStyle, data.locationPage?.branchDetailStyle),
                style: mergeStyle(current.locationPage.style, data.locationPage?.style)
            },
            testimonialStyles: {
               ...current.testimonialStyles,
               reviewStyle: mergeText(current.testimonialStyles?.reviewStyle, data.testimonialStyles?.reviewStyle),
               nameStyle: mergeText(current.testimonialStyles?.nameStyle, data.testimonialStyles?.nameStyle),
               roleStyle: mergeText(current.testimonialStyles?.roleStyle, data.testimonialStyles?.roleStyle),
            },
            footer: { 
                ...current.footer, 
                ...(data.footer || {}),
                descriptionStyle: mergeText(current.footer.descriptionStyle, data.footer?.descriptionStyle),
                copyrightStyle: mergeText(current.footer.copyrightStyle, data.footer?.copyrightStyle),
                brandStyle: mergeText(current.footer.brandStyle, data.footer?.brandStyle),
                socialMediaHeaderStyle: mergeText(current.footer.socialMediaHeaderStyle, data.footer?.socialMediaHeaderStyle),
                style: mergeStyle(current.footer.style, data.footer?.style)
            },
            branches: data.branches || current.branches,
            instagramProfile: data.instagramProfile || current.instagramProfile,
            gallery: data.gallery || current.gallery,
            testimonials: data.testimonials || current.testimonials,
            ai: { ...current.ai, ...(data.ai || {}) }
        }));
      } else {
        console.log("Config doc missing, using default.");
      }
    }, (error) => {
       console.error("Firestore Listen Error:", error);
       this.firestoreError.set(error.message);
    });
  }

  // RECURSIVE SANITIZER TO REMOVE UNDEFINED
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(v => this.sanitizeObject(v));
    }

    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        newObj[key] = value === undefined ? null : this.sanitizeObject(value);
      }
    }
    return newObj;
  }

  async updateConfig(newConfig: AppConfig) {
    this.config.set(newConfig);
    
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch(e) { console.error("Local Save Error", e); }

    if (this.isDemoMode()) {
      return;
    }

    if (!this.db) {
        alert("Error: Tidak terhubung ke database.");
        return;
    }

    try {
       let cleanConfig = this.sanitizeObject(JSON.parse(JSON.stringify(newConfig)));
       // Ensure critical sections are objects
       if (!cleanConfig.intro) cleanConfig.intro = {};
       cleanConfig.intro.enabled = cleanConfig.intro.enabled ?? false;

       await setDoc(doc(this.db, 'settings', this.DOC_ID), cleanConfig);
    } catch (error: any) {
      console.error("Error saving config:", error);
      throw error;
    }
  }
  
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // Video check (unchanged, just read as DataURL)
        if (file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event: any) => resolve(event.target.result);
            reader.onerror = reject;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 1. Set Target to HD (1600px) instead of low res
                // This is the key fix for "buram" (blurry)
                const MAX_DIMENSION = 1600; // Safe high quality for Hero
                
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // 2. High Quality JPEG (0.85)
                // This preserves details much better than default 0.7 or 0.5
                let dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                // 3. Firestore Safety Check (Max ~1MB)
                // If image is too complex/large, reduce quality slowly, 
                // avoiding resizing unless absolutely necessary.
                // 950,000 chars is roughly 950KB (safe margin for 1MB limit)
                if (dataUrl.length > 950000) { 
                    // Try lower quality (0.65 is still okay for web bg)
                    dataUrl = canvas.toDataURL('image/jpeg', 0.65);
                }
                
                // If STILL too big (very rare for 1600px jpg), scale down to 1000px
                if (dataUrl.length > 950000) {
                     const scale = 1000 / width;
                     canvas.width = width * scale;
                     canvas.height = height * scale;
                     const ctx2 = canvas.getContext('2d');
                     ctx2?.drawImage(img, 0, 0, canvas.width, canvas.height);
                     // 1000px at 0.7 is guaranteed < 500KB
                     dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                }

                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error("Invalid image"));
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
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
    const lower = url.toLowerCase();
    return lower.endsWith('.glb') || lower.endsWith('.gltf') || lower.startsWith('data:model') || lower.includes('gltf') || lower.includes('glb');
  }
}
