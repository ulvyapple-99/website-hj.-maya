
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

// NEW: Reusable Text Style Interface
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
    button1Style: TextStyle; 
    buttonText2: string;
    button2Style: TextStyle; 
    bgImage: string;
    overlayOpacity: number; 
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
    titleStyle: TextStyle; // NEW
    subtitle: string;
    subtitleStyle: TextStyle; // NEW
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
    titleStyle: TextStyle; // NEW
    subtitle: string;
    subtitleStyle: TextStyle; // NEW
    style: PageStyle;
    cardBorderRadius: string;
    mapHeight: string;
  };
  testimonialStyles: { // NEW SECTION
    reviewStyle: TextStyle;
    nameStyle: TextStyle;
    roleStyle: TextStyle;
  };
  footer: {
    description: string;
    descriptionStyle: TextStyle; // NEW
    copyrightText: string;
    copyrightStyle: TextStyle; // NEW
    brandStyle: TextStyle; // NEW
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

  // Auth State
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => this.currentUser() !== null);
  isFirebaseReady = signal(false);
  
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
      logoText: 'Hj. Maya Group',
      logoStyle: { fontFamily: 'Playfair Display', fontSize: '1.25rem', color: 'inherit' },
      logoImage: '', 
      favicon: '',
      metaDescription: 'Sate Maranggi Paling Enak di Cimahi',
      metaStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#000000' },
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723',
      navHeight: '80px',
      navLogoHeight: '40px',
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
      badgeText: 'Est. 1980',
      badgeStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#D84315' },
      title: 'Sate Maranggi',
      titleStyle: { fontFamily: 'Playfair Display', fontSize: '4.5rem', color: '#FFFFFF' },
      highlight: 'Asli Hj. Maya',
      highlightStyle: { fontFamily: 'Playfair Display', fontSize: 'inherit', color: '#FFD54F' },
      subtitle: 'Legenda Kuliner Cimahi. Nikmati sensasi Sate Jando yang lumer dan Sate Sapi empuk dengan sambal oncom khas yang bikin nagih.',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1.25rem', color: '#F3F4F6' },
      buttonText1: 'Lihat Menu Kami',
      button1Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
      buttonText2: 'Reservasi Meja',
      button2Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
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
      titleStyle: { fontFamily: 'Lato', fontSize: '3rem', color: '#D84315' },
      description: 'Sate Maranggi Hj. Maya Cimahi menghadirkan cita rasa otentik yang telah melegenda.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '1.125rem', color: '#4E342E' },
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
      titleStyle: { fontFamily: 'Playfair Display', fontSize: '3rem', color: '#D84315' },
      subtitle: 'Pilihan menu favorit pelanggan setia Hj. Maya',
      subtitleStyle: { fontFamily: 'Playfair Display', fontSize: '1.125rem', color: '#3E2723' },
      style: {
        backgroundColor: '#FFFFFF', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display',
        titleFontSize: '3rem',
        subtitleFontSize: '1.125rem'
      },
      cardImageHeight: '100%', 
      cardBorderRadius: '12px',
      itemTitleSize: '1.125rem',
      itemPriceSize: '0.875rem',
      gridGap: '24px'
    },
    packagesPage: {
      title: 'Paket Hemat',
      titleStyle: { fontFamily: 'Playfair Display', fontSize: '2.5rem', color: '#D84315' },
      subtitle: 'Pilihan paket makan bersama untuk keluarga dan rombongan.',
      subtitleStyle: { fontFamily: 'Playfair Display', fontSize: '1rem', color: '#3E2723' },
      style: {
        backgroundColor: '#FFF3E0', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display',
        titleFontSize: '2.5rem',
        subtitleFontSize: '1rem'
      },
      cardBorderRadius: '16px'
    },
    reservation: {
      title: 'Reservasi Tempat',
      titleStyle: { fontFamily: 'Lato', fontSize: '2.25rem', color: '#D84315' }, // Default
      subtitle: 'Booking meja untuk acara keluarga, arisan, atau buka bersama.',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#3E2723' }, // Default
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
      titleStyle: { fontFamily: 'Playfair Display', fontSize: '2.25rem', color: '#3E2723' }, // Default
      subtitle: 'Nikmati suasana makan yang nyaman di lokasi kami.',
      subtitleStyle: { fontFamily: 'Playfair Display', fontSize: '1rem', color: '#3E2723' }, // Default
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
    testimonialStyles: {
      reviewStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#4B5563' },
      nameStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#111827' },
      roleStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#D84315' }
    },
    footer: {
      description: 'Menyajikan cita rasa Sate Maranggi asli Cimahi sejak 1980. Bumbu meresap, daging empuk, sambal nikmat.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#9CA3AF' }, // Default
      copyrightText: 'All Rights Reserved.',
      copyrightStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#6B7280' }, // Default
      brandStyle: { fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#E5E7EB' }, // Default
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/', 
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
        ],
        packages: [
          { name: 'Paket Keluarga A', price: 'Rp 250.000', description: 'Cocok untuk 4 orang', image: 'https://picsum.photos/seed/paka/400/300', items: ['40 Tusuk Sate Campur', '4 Nasi Timbel', '1 Karedok', '4 Teh Manis'] }
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
        ],
        packages: []
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
        ],
        packages: []
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
       
       // Handle Favicon
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

       // Handle PWA Manifest Dynamic Generation
       this.updateManifest(c);

       // Handle Analytics Injection
       if (c.global.analyticsId) {
          this.injectAnalytics(c.global.analyticsId);
       }
    });
  }

  // --- ANALYTICS ---
  private injectAnalytics(id: string) {
    if (document.getElementById('analytics-script')) return;
    
    // Google Analytics Stub
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
      this.firestoreError.set(null);

      if (docSnap.exists()) {
        const data = docSnap.data() as AppConfig;
        
        // Deep Merge helper
        const mergeStyle = (currentStyle: any, newStyle: any) => ({ ...currentStyle, ...newStyle });
        const mergeText = (currentT: any, newT: any) => ({ ...currentT, ...newT });

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
            intro: { ...current.intro, ...(data.intro || {}) },
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

  async updateConfig(newConfig: AppConfig) {
    this.config.set(newConfig);

    if (!this.db) {
        alert("Error: Tidak terhubung ke database.");
        return;
    }

    try {
       await setDoc(doc(this.db, 'settings', this.DOC_ID), newConfig);
       // NOTE: Alert replaced by Toast in components usually, but pure service log here
       console.log("Config saved successfully");
    } catch (error: any) {
      console.error("Error saving config:", error);
      throw error;
    }
  }
  
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
