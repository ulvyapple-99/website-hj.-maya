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
  items: string[]; 
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
  socialLinkColor?: string;
  menu: MenuItem[];
  packages?: PackageItem[];
  // Reservation Settings per branch
  minPaxRegular: number;
  minPaxRamadan: number;
  maxPax: number;
  tableTypes: string[];
  enableSpecialRequest: boolean;
  bookingLeadTimeHours: number;
  requireEmail: boolean;
  enableDownPaymentCalc: boolean;
  downPaymentPercentage: number;
  termsAndConditions: string;
  whatsappTemplate: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  role: string;
}

export interface PageStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  titleFontSize?: string;
  subtitleFontSize?: string;
  bodyFontSize?: string;
  sectionPaddingY?: string;
  borderRadius?: string;
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  buttonRadius?: string;
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
    metaKeywords: string; 
    metaStyle: TextStyle; 
    navbarColor: string;
    navbarTextColor: string;
    navHeight: string;
    navLogoHeight: string;
    navLinkFontSize: string;
    navLinkGap: string;
    analyticsId: string;
    maintenanceMode: boolean; 
    customCss: string; 
    customJs: string; 
    scrollbarColor: string; 
    floatingWhatsapp: string; 
    enableSmoothScroll: boolean; 
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
    fallbackImage: string; 
    overlayOpacity: number; 
    textAlign: 'left' | 'center' | 'right'; 
    height: string; 
    bgPosition: string; 
    textShadow: string; 
    gradientDirection: string; 
    blurLevel: string; 
    socialProofText: string; 
    style: PageStyle;
  };
  about: {
    title: string;
    titleStyle: TextStyle; 
    description: string;
    descriptionStyle: TextStyle; 
    image: string;
    imageAlt: string; 
    imagePosition: 'left' | 'right'; 
    stats: {
      val1: string; label1: string;
      val2: string; label2: string;
      val3: string; label3: string;
    };
    statsStyle: TextStyle; 
    statsLabelStyle: TextStyle; 
    ctaText: string; 
    ctaLink: string; 
    quote: string; 
    founderName: string; 
    trustedLogos: string[]; 
    showPattern: boolean; 
    enableGlassEffect: boolean; 
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
    cardBackgroundColor: string;
    cardTextColor: string;
    priceColor: string;
    priceFontSize: string;
    buttonText: string;
  };
  reservation: {
    title: string;
    titleStyle: TextStyle;
    subtitle: string;
    subtitleStyle: TextStyle;
    style: PageStyle;
    cardBorderRadius: string;
    cardBackgroundColor: string; 
    cardTextColor: string;
    inputHeight: string;
    inputBorderRadius: string;
    buttonHeight: string;
    labelStyle: TextStyle;
    inputStyle: TextStyle;
    summaryStyle: TextStyle;
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
  attendancePage: {
    url: string;
    title: string;
    subtitle: string;
    buttonText: string;
    note: string;
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
  
  firestoreError = signal<string | null>(null);

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
      metaDescription: 'Sate Maranggi Hj. Maya Cimahi - Kelezatan Daging Sapi Pilihan, Resep Warisan Keluarga sejak 1980an.',
      metaKeywords: 'sate maranggi, kuliner cimahi, sate enak, hj maya, sate sapi',
      metaStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#000000' },
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723',
      navHeight: '80px',
      navLogoHeight: '50px',
      navLinkFontSize: '16px',
      navLinkGap: '32px',
      analyticsId: '',
      maintenanceMode: false,
      customCss: '',
      customJs: '',
      scrollbarColor: '#D84315',
      floatingWhatsapp: '6281223456789',
      enableSmoothScroll: true
    },
    intro: {
      enabled: false,
      videoUrl: '', 
      duration: 5,
      fadeOut: 'fade'
    },
    hero: {
      badgeText: 'THE BEST SATE IN TOWN',
      badgeStyle: { fontFamily: 'Oswald', fontSize: '0.875rem', color: '#ff8800' },
      title: 'Sate Maranggi & Sop',
      titleStyle: { fontFamily: 'Oswald', fontSize: '4.5rem', color: '#FFFFFF' },
      highlight: 'Hj. Maya',
      highlightStyle: { fontFamily: 'Great Vibes', fontSize: 'inherit', color: '#FF7043' },
      subtitle: 'Rasakan kelezatan daging sapi pilihan dengan bumbu rempah rahasia yang meresap sempurna.',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1.25rem', color: '#F3F4F6' },
      buttonText1: 'Lihat Menu',
      button1Link: '/menu',
      button1Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
      buttonText2: 'Booking Meja',
      button2Link: '/reservation',
      button2Style: { fontFamily: 'Lato', fontSize: '1rem', color: '#FFFFFF' },
      bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920',
      fallbackImage: '',
      overlayOpacity: 0.6,
      textAlign: 'center',
      height: '95vh',
      bgPosition: 'center center',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      gradientDirection: 'radial',
      blurLevel: '0px',
      socialProofText: '⭐ 4.8/5 dari 500+ Review Google',
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
      title: 'Warisan Kuliner Cimahi',
      titleStyle: { fontFamily: 'Oswald', fontSize: '3rem', color: '#3E2723' },
      description: 'Sate Maranggi Hj. Maya menghadirkan cita rasa autentik yang telah melegenda. Daging sapi pilihan yang dimarinasi dengan bumbu rempah alami, dibakar dengan kematangan sempurna, disajikan dengan sambal oncom dan ketan bakar yang khas.\n\nKami berkomitmen menjaga kualitas rasa dan pelayanan untuk kepuasan pelanggan setia kami.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '1.125rem', color: '#5D4037' },
      image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=1000',
      imageAlt: 'Sate Maranggi Hj. Maya Authentic Grill',
      imagePosition: 'right',
      stats: {
        val1: '100%', label1: 'Daging Segar',
        val2: '15+', label2: 'Tahun',
        val3: '3', label3: 'Cabang'
      },
      statsStyle: { fontFamily: 'Oswald', fontSize: '2rem', color: '#D84315' },
      statsLabelStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#3E2723' },
      ctaText: 'Lihat Menu Kami',
      ctaLink: '/menu',
      quote: 'Kualitas rasa adalah janji kami kepada setiap pelanggan.',
      founderName: 'Hj. Maya',
      trustedLogos: [],
      showPattern: true,
      enableGlassEffect: false,
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
      subtitle: 'Hidangan best seller pilihan pelanggan',
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
      title: 'Paket Botram & Keluarga',
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
      cardBorderRadius: '16px',
      cardBackgroundColor: '#FFFFFF',
      cardTextColor: '#3E2723',
      priceColor: '#FFFFFF',
      priceFontSize: '1rem',
      buttonText: 'Pesan Paket Ini'
    },
    reservation: {
      title: 'Reservasi Tempat',
      titleStyle: { fontFamily: 'Oswald', fontSize: '2.25rem', color: '#3E2723' },
      subtitle: 'Amankan meja Anda untuk acara spesial',
      subtitleStyle: { fontFamily: 'Lato', fontSize: '1rem', color: '#5D4037' },
      style: {
        backgroundColor: '#F5F5F5',
        textColor: '#3E2723', 
        accentColor: '#D84315',
        fontFamily: 'Lato',
        titleFontSize: '2.25rem',
        sectionPaddingY: '60px'
      },
      cardBorderRadius: '16px',
      cardBackgroundColor: '#FFFFFF', 
      cardTextColor: '#3E2723',
      inputHeight: '48px',
      inputBorderRadius: '8px',
      buttonHeight: '52px',
      labelStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#5D4037' },
      inputStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#1F2937' },
      summaryStyle: { fontFamily: 'Oswald', fontSize: '1.5rem', color: '#FFFFFF' }
    },
    locationPage: {
      title: 'Lokasi Outlet',
      titleStyle: { fontFamily: 'Oswald', fontSize: '2.5rem', color: '#FFFFFF' },
      subtitle: 'Kunjungi cabang terdekat kami',
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
      description: 'Sate Maranggi Hj. Maya.\nCita Rasa Legendaris Cimahi.',
      descriptionStyle: { fontFamily: 'Lato', fontSize: '0.875rem', color: '#BCAAA4' },
      copyrightText: 'All rights reserved.',
      copyrightStyle: { fontFamily: 'Lato', fontSize: '0.75rem', color: '#8D6E63' },
      brandStyle: { fontFamily: 'Oswald', fontSize: '1.5rem', color: '#FFFFFF' },
      socialMediaHeaderStyle: { fontFamily: 'Oswald', fontSize: '1.125rem', color: '#FF7043' },
      instagramLink: 'https://instagram.com/satemaranggihjmayacimahi',
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
      followersCount: '2900',
      followingCount: '21',
      bio: 'Sate Maranggi Hj. Maya Cimahi\nFood & Beverage\n📍 Jl. Mahar Martanegara No. 123, Cimahi\nBuka Setiap Hari 10.00 - 22.00',
      profilePic: 'https://ui-avatars.com/api/?name=Hj+Maya&background=D84315&color=fff'
    },
    attendancePage: {
      url: 'https://gen-lang-client-0329168072.web.app/',
      title: 'Portal Absensi Karyawan',
      subtitle: 'Silakan klik tombol di bawah untuk melanjutkan ke halaman absensi online. Pastikan Anda masuk dengan akun yang terdaftar.',
      buttonText: 'Buka Halaman Absensi',
      note: 'Jika mengalami kendala, hubungi Manajer Cabang.'
    },
    branches: [
      {
        id: 'cimahi',
        name: 'Pusat Cimahi',
        address: 'Jl. Mahar Martanegara No.123, Utama, Kec. Cimahi Sel., Kota Cimahi',
        googleMapsUrl: 'https://maps.google.com',
        phone: '0812-2345-6789',
        whatsappNumber: '6281223456789',
        hours: '10.00 - 22.00',
        mapImage: 'https://picsum.photos/600/400',
        instagramLink: 'https://instagram.com/satemaranggihjmayacimahi',
        socialLinkColor: '#FFFFFF',
        menu: [
           { name: 'Sate Sapi (10 Tusuk)', price: 'Rp 45.000', desc: 'Sate sapi maranggi empuk dengan bumbu meresap.', category: 'Sate', image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=400', favorite: true, spicyLevel: 1 },
           { name: 'Sate Kambing (10 Tusuk)', price: 'Rp 50.000', desc: 'Sate kambing muda, tidak prengus.', category: 'Sate', image: 'https://images.unsplash.com/photo-1603088549155-6ae9395b928f?q=80&w=400', favorite: false, spicyLevel: 2 },
           { name: 'Sate Ayam (10 Tusuk)', price: 'Rp 35.000', desc: 'Sate ayam full daging.', category: 'Sate', image: 'https://images.unsplash.com/photo-1533267638706-e7e231154546?q=80&w=400', favorite: false },
           { name: 'Sop Iga Sapi', price: 'Rp 40.000', desc: 'Sop iga dengan kuah kaldu gurih.', category: 'Sop', image: 'https://images.unsplash.com/photo-1551025595-6f98d1d6431f?q=80&w=400', favorite: true },
           { name: 'Ketan Bakar', price: 'Rp 8.000', desc: 'Pelengkap sate paling pas.', category: 'Side', image: 'https://images.unsplash.com/photo-1626508035297-003616688757?q=80&w=400', favorite: true }
        ],
        packages: [
           { name: 'Paket Botram 4', price: 'Rp 250.000', description: 'Cukup untuk 4-5 orang', items: ['40 Tusuk Sate Sapi', '4 Nasi Timbel', '1 Sop Iga Besar', '4 Es Teh Manis', 'Lalapan & Sambal'], image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400' },
           { name: 'Paket Keluarga 10', price: 'Rp 600.000', description: 'Pesta sate untuk keluarga besar', items: ['100 Tusuk Sate Campur', '2 Bakul Nasi', '3 Sop Iga Besar', '10 Minuman', 'Buah Potong'], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400' }
        ],
        minPaxRegular: 5,
        minPaxRamadan: 10,
        maxPax: 100,
        tableTypes: ['Indoor (AC)', 'Outdoor (Smoking Area)', 'Lesehan', 'VIP Room'],
        enableSpecialRequest: true,
        bookingLeadTimeHours: 2,
        requireEmail: false,
        enableDownPaymentCalc: true,
        downPaymentPercentage: 50,
        termsAndConditions: '1. DP 50% wajib dibayarkan maksimal 1x24 jam setelah konfirmasi admin.\n2. Pembatalan H-1 uang muka hangus.\n3. Datang tepat waktu, toleransi keterlambatan 15 menit.',
        whatsappTemplate: 'Halo Admin *{branch}*,\nSaya mau reservasi meja:\n\nNama: *{name}*\nKontak: {contact}\nTanggal: {date}\nJam: {time}\nJumlah: {pax} orang\nArea: {tableType}\nCatatan: {notes}\n\nMohon konfirmasinya.'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400',
      'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=400',
      'https://images.unsplash.com/photo-1551025595-6f98d1d6431f?q=80&w=400'
    ],
    testimonials: [
      { name: 'Budi Santoso', role: 'Local Guide', rating: 5, text: 'Sate maranggi terbaik di Cimahi! Dagingnya empuk banget.' },
      { name: 'Siti Aminah', role: 'Food Blogger', rating: 5, text: 'Sambal oncomnya juara, pas banget sama ketan bakarnya.' }
    ],
    ai: {
      systemInstruction: 'Anda adalah asisten virtual Sate Maranggi Hj. Maya. Jawablah dengan ramah dan sopan. Rekomendasikan menu best seller kami yaitu Sate Sapi dan Sop Iga.',
      initialMessage: 'Sampurasun! Ada yang bisa dibantu akang/teteh?',
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
       
       this.injectFont(c.global.logoStyle.fontFamily);
       this.injectFont(c.global.metaStyle.fontFamily);
       this.injectFont(c.hero.titleStyle.fontFamily);
       this.injectFont(c.hero.highlightStyle.fontFamily);
       this.injectFont(c.hero.badgeStyle.fontFamily);
       this.injectFont(c.hero.subtitleStyle.fontFamily);
       this.injectFont(c.hero.button1Style.fontFamily);
       this.injectFont(c.hero.button2Style.fontFamily);
       
       // Inject Font for Reservation Granular Styles
       this.injectFont(c.reservation?.labelStyle?.fontFamily);
       this.injectFont(c.reservation?.inputStyle?.fontFamily);
       this.injectFont(c.reservation?.summaryStyle?.fontFamily);

       root.style.scrollBehavior = c.global.enableSmoothScroll ? 'smooth' : 'auto';

       const scrollCss = `
         ::-webkit-scrollbar { width: 10px; }
         ::-webkit-scrollbar-track { background: #f1f1f1; }
         ::-webkit-scrollbar-thumb { background: ${c.global.scrollbarColor}; border-radius: 5px; }
         ::-webkit-scrollbar-thumb:hover { background: ${c.global.scrollbarColor}dd; }
       `;
       this.injectStyle('scrollbar-style', scrollCss);

       this.injectStyle('custom-user-css', c.global.customCss || '');
       
       document.title = c.global.logoText;
       this.setMeta('description', c.global.metaDescription);
       this.setMeta('keywords', c.global.metaKeywords || 'sate maranggi, kuliner cimahi, sate enak');
       this.setMeta('og:title', c.global.logoText, 'property');
       this.setMeta('og:description', c.global.metaDescription, 'property');
       this.setMeta('og:image', c.global.logoImage || c.hero.bgImage, 'property');
       this.setMeta('theme-color', c.global.navbarColor);

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
       if (c.global.analyticsId) {
          this.injectAnalytics(c.global.analyticsId);
       }
    });
  }
  
  private injectFont(fontName: string) {
    if (!fontName) return;
    const id = `font-${fontName.replace(/\s+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;700&display=swap`;
    document.head.appendChild(link);
  }

  private injectStyle(id: string, css: string) {
    let style = document.getElementById(id) as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = css;
  }

  private setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
     let meta = document.querySelector(`meta[${attr}="${name}"]`);
     if (!meta) {
       meta = document.createElement('meta');
       meta.setAttribute(attr, name);
       document.head.appendChild(meta);
     }
     meta.setAttribute('content', content);
  }

  private loadLocalConfig() {
    try {
      const local = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        this.config.update(c => ({
            ...c,
            ...parsed,
            intro: { ...c.intro, ...(parsed.intro || {}) },
            packagesPage: { ...c.packagesPage, ...(parsed.packagesPage || {}) },
            global: { ...c.global, ...(parsed.global || {}) },
            hero: { ...c.hero, ...(parsed.hero || {}), 
               badgeStyle: this.ensureStyle(parsed.hero?.badgeStyle, c.hero.badgeStyle),
               titleStyle: this.ensureStyle(parsed.hero?.titleStyle, c.hero.titleStyle),
               highlightStyle: this.ensureStyle(parsed.hero?.highlightStyle, c.hero.highlightStyle),
               subtitleStyle: this.ensureStyle(parsed.hero?.subtitleStyle, c.hero.subtitleStyle),
               button1Style: this.ensureStyle(parsed.hero?.button1Style, c.hero.button1Style),
               button2Style: this.ensureStyle(parsed.hero?.button2Style, c.hero.button2Style),
            },
            about: { ...c.about, ...(parsed.about || {}) },
            reservation: { 
                ...c.reservation, 
                ...(parsed.reservation || {}),
                titleStyle: this.ensureStyle(parsed.reservation?.titleStyle, c.reservation.titleStyle),
                subtitleStyle: this.ensureStyle(parsed.reservation?.subtitleStyle, c.reservation.subtitleStyle),
                labelStyle: this.ensureStyle(parsed.reservation?.labelStyle, c.reservation.labelStyle),
                inputStyle: this.ensureStyle(parsed.reservation?.inputStyle, c.reservation.inputStyle),
                summaryStyle: this.ensureStyle(parsed.reservation?.summaryStyle, c.reservation.summaryStyle),
            } 
        }));
      }
    } catch(e) {}
  }

  private ensureStyle(source: any, defaultStyle: TextStyle): TextStyle {
      return {
          fontFamily: source?.fontFamily || defaultStyle.fontFamily,
          fontSize: source?.fontSize || defaultStyle.fontSize,
          color: source?.color || defaultStyle.color
      };
  }

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
  }

  getStoredFirebaseConfig(): FirebaseConfig | null {
    const stored = localStorage.getItem('custom_firebase_config');
    return stored ? JSON.parse(stored) : null;
  }

  saveStoredFirebaseConfig(config: FirebaseConfig) {
    localStorage.setItem('custom_firebase_config', JSON.stringify(config));
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
      
      onAuthStateChanged(this.auth, (user) => {
          this.currentUser.set(user);
      });

      this.subscribeToConfig();

    } catch (e) {
      console.error("Firebase Init Error:", e);
      this.isFirebaseReady.set(false);
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(v => this.sanitizeObject(v));

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
    } catch(e) {}

    if (this.isDemoMode()) return;
    if (!this.db) return;

    try {
       let cleanConfig = this.sanitizeObject(JSON.parse(JSON.stringify(newConfig)));
       await setDoc(doc(this.db, 'settings', this.DOC_ID), cleanConfig);
    } catch (error: any) {
      console.error("Error saving config:", error);
      throw error;
    }
  }
  
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
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
                const MAX_DIMENSION = 1600; 
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
                let dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                if (dataUrl.length > 950000) dataUrl = canvas.toDataURL('image/jpeg', 0.65);
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

  async loginAdmin(email: string, pass: string) {
    if (this.auth) {
      try {
        await signInWithEmailAndPassword(this.auth, email, pass);
        this.isDemoMode.set(false);
        return;
      } catch (error: any) {}
    }
    if (email === 'admin@admin.com' && pass === 'admin') {
      this.isDemoMode.set(true);
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
        const data = docSnap.data() as any; // Use any to handle old structure
        const current = this.config();
        const ensure = (obj: any, def: any) => ({ ...def, ...(obj || {}) });
        const text = (obj: any) => ensure(obj, {fontFamily:'Lato',fontSize:'1rem',color:'#000'});

        const updatedBranches = (data.branches || current.branches).map((branch: any) => {
            const oldGlobalSettings = data.reservation || {};
            return {
                ...branch,
                minPaxRegular: branch.minPaxRegular ?? oldGlobalSettings.minPaxRegular ?? 5,
                minPaxRamadan: branch.minPaxRamadan ?? oldGlobalSettings.minPaxRamadan ?? 10,
                maxPax: branch.maxPax ?? oldGlobalSettings.maxPax ?? 100,
                tableTypes: branch.tableTypes ?? oldGlobalSettings.tableTypes ?? ['Indoor (AC)', 'Outdoor (Smoking Area)', 'Lesehan', 'VIP Room'],
                enableSpecialRequest: branch.enableSpecialRequest ?? oldGlobalSettings.enableSpecialRequest ?? true,
                bookingLeadTimeHours: branch.bookingLeadTimeHours ?? oldGlobalSettings.bookingLeadTimeHours ?? 2,
                requireEmail: branch.requireEmail ?? oldGlobalSettings.requireEmail ?? false,
                enableDownPaymentCalc: branch.enableDownPaymentCalc ?? oldGlobalSettings.enableDownPaymentCalc ?? true,
                downPaymentPercentage: branch.downPaymentPercentage ?? oldGlobalSettings.downPaymentPercentage ?? 50,
                termsAndConditions: branch.termsAndConditions ?? oldGlobalSettings.termsAndConditions ?? '',
                whatsappTemplate: branch.whatsappTemplate ?? oldGlobalSettings.whatsappTemplate ?? '',
                socialLinkColor: branch.socialLinkColor ?? current.footer.brandStyle.color
            };
        });

        this.config.update(current => ({
            ...current,
            ...data,
            features: ensure(data.features, current.features),
            global: { ...current.global, ...(data.global || {}), logoStyle: text(data.global?.logoStyle), metaStyle: text(data.global?.metaStyle) },
            intro: ensure(data.intro, current.intro),
            hero: { ...current.hero, ...(data.hero || {}), badgeStyle: text(data.hero?.badgeStyle), titleStyle: text(data.hero?.titleStyle), highlightStyle: text(data.hero?.highlightStyle), subtitleStyle: text(data.hero?.subtitleStyle), button1Style: text(data.hero?.button1Style), button2Style: text(data.hero?.button2Style), style: ensure(data.hero?.style, current.hero.style) },
            about: { ...current.about, ...(data.about || {}), titleStyle: text(data.about?.titleStyle), descriptionStyle: text(data.about?.descriptionStyle), stats: ensure(data.about?.stats, current.about.stats), statsStyle: text(data.about?.statsStyle), statsLabelStyle: text(data.about?.statsLabelStyle), ctaText: data.about?.ctaText || 'Lihat Menu', ctaLink: data.about?.ctaLink || '/menu', quote: data.about?.quote || '', founderName: data.about?.founderName || '', trustedLogos: data.about?.trustedLogos || [], showPattern: data.about?.showPattern ?? true, enableGlassEffect: data.about?.enableGlassEffect ?? false, style: ensure(data.about?.style, current.about.style) },
            menuPage: { ...current.menuPage, ...(data.menuPage || {}), titleStyle: text(data.menuPage?.titleStyle), subtitleStyle: text(data.menuPage?.subtitleStyle), style: ensure(data.menuPage?.style, current.menuPage.style) },
            packagesPage: { ...current.packagesPage, ...(data.packagesPage || {}), titleStyle: text(data.packagesPage?.titleStyle), subtitleStyle: text(data.packagesPage?.subtitleStyle), style: ensure(data.packagesPage?.style, current.packagesPage.style) },
            reservation: { ...current.reservation, ...(data.reservation || {}), titleStyle: text(data.reservation?.titleStyle), subtitleStyle: text(data.reservation?.subtitleStyle), labelStyle: text(data.reservation?.labelStyle), inputStyle: text(data.reservation?.inputStyle), summaryStyle: text(data.reservation?.summaryStyle), style: ensure(data.reservation?.style, current.reservation.style) },
            locationPage: { ...current.locationPage, ...(data.locationPage || {}), titleStyle: text(data.locationPage?.titleStyle), subtitleStyle: text(data.locationPage?.subtitleStyle), labelStyle: text(data.locationPage?.labelStyle), branchNameStyle: text(data.locationPage?.branchNameStyle), branchDetailStyle: text(data.locationPage?.branchDetailStyle), style: ensure(data.locationPage?.style, current.locationPage.style) },
            testimonialStyles: { ...current.testimonialStyles, reviewStyle: text(data.testimonialStyles?.reviewStyle), nameStyle: text(data.testimonialStyles?.nameStyle), roleStyle: text(data.testimonialStyles?.roleStyle) },
            footer: { ...current.footer, ...(data.footer || {}), descriptionStyle: text(data.footer?.descriptionStyle), copyrightStyle: text(data.footer?.copyrightStyle), brandStyle: text(data.footer?.brandStyle), socialMediaHeaderStyle: text(data.footer?.socialMediaHeaderStyle), style: ensure(data.footer?.style, current.footer.style) },
            attendancePage: ensure(data.attendancePage, current.attendancePage),
            branches: updatedBranches,
            instagramProfile: data.instagramProfile || current.instagramProfile,
            gallery: data.gallery || current.gallery,
            testimonials: data.testimonials || current.testimonials,
            ai: ensure(data.ai, current.ai)
        }));
      }
    }, (error) => {
       console.error("Firestore Listen Error:", error);
       this.firestoreError.set(error.message);
    });
  }
}
