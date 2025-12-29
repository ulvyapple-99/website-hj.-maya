
import { Injectable, signal, effect, computed } from '@angular/core';

// INTERFACES
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
    bgImage: string;
    style: PageStyle;
  };
  about: {
    title: string;
    description: string;
    image: string;
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
    instagramLink: string;
    facebookLink: string;
    tiktokLink: string;
    style: PageStyle;
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
  private STORAGE_KEY = 'app_config_data_local_v2';
  private USER_KEY = 'app_user_session_local';

  // Auth State (Mocked for Local Mode)
  currentUser = signal<{email: string} | null>(null);
  isAdmin = computed(() => this.currentUser() !== null);

  // Initial State - PRE-FILLED WITH COMPLETE DATA
  // This ensures the site looks good on Mobile immediately after deployment
  config = signal<AppConfig>({
    global: {
      logoText: 'Hj. Maya',
      logoImage: '', 
      navbarColor: '#FFFFFF',
      navbarTextColor: '#4E342E'
    },
    intro: {
      enabled: false, // Disabled by default for faster loading
      videoUrl: '', 
      duration: 5,
      fadeOut: 'fade'
    },
    hero: {
      title: 'Sate Maranggi',
      highlight: 'Asli Hj. Maya',
      subtitle: 'Kelembutan daging pilihan dengan bumbu rempah warisan yang meresap sempurna. Legenda kuliner Cimahi & Bandung.',
      bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop', // High quality BBQ image
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFFFFF',
        accentColor: '#FF6F00', // Amber-900
        fontFamily: 'Playfair Display'
      }
    },
    about: {
      title: 'Cita Rasa Legendaris',
      description: 'Sate Maranggi Hj. Maya berdiri sejak tahun 1980-an, bermula dari resep keluarga yang dijaga keasliannya. Kami menggunakan daging sapi dan ayam pilihan yang dimarinasi (direndam) dengan bumbu rempah rahasia selama berjam-jam sebelum dibakar. Tanpa saus kacang pun, sate kami sudah nikmat luar biasa. Disajikan dengan ketan bakar, sambal oncom, dan sambal tomat segar.',
      image: 'https://images.unsplash.com/photo-1603083544234-814b73b22228?q=80&w=800&auto=format&fit=crop', // Chef grilling image
      style: {
        backgroundColor: '#FFF8E1',
        textColor: '#4E342E',
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    menuPage: {
      title: 'Menu Favorit',
      subtitle: 'Pesan sekarang untuk makan di tempat atau bawa pulang.',
      style: {
        backgroundColor: '#FFFFFF', 
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display'
      }
    },
    reservation: {
      title: 'Reservasi Tempat',
      subtitle: 'Pastikan ketersediaan tempat untuk acara spesial Anda.',
      minPaxRegular: 20,
      minPaxRamadan: 10,
      style: {
        backgroundColor: '#EFEBE9',
        textColor: '#3E2723', 
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    locationPage: {
      title: 'Lokasi Cabang',
      subtitle: 'Kunjungi cabang terdekat Sate Maranggi Hj. Maya.',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFF8E1',
        accentColor: '#FFD54F',
        fontFamily: 'Playfair Display'
      }
    },
    footer: {
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/',
      facebookLink: 'https://facebook.com',
      tiktokLink: 'https://tiktok.com',
      style: {
        backgroundColor: '#271C19',
        textColor: '#A1887F',
        accentColor: '#FF6F00',
        fontFamily: 'Lato'
      }
    },
    branches: [
      {
        id: 'pusat',
        name: 'Pusat: Cimahi',
        address: 'Jl. Mahar Martanegara No.123, Utama, Kec. Cimahi Sel., Kota Cimahi',
        googleMapsUrl: 'https://goo.gl/maps/xyz',
        phone: '0812-3456-7890',
        whatsappNumber: '6281234567890',
        hours: '10.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/mapcimahi/600/400',
        menu: [
           { name: 'Sate Maranggi Sapi (10 Tsk)', desc: 'Daging sapi has dalam, empuk, bumbu meresap.', price: 'Rp 50.000', category: 'Makanan', image: 'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=800&auto=format&fit=crop', favorite: true },
           { name: 'Sate Maranggi Ayam (10 Tsk)', desc: 'Daging ayam fillet juicy dengan bumbu khas.', price: 'Rp 40.000', category: 'Makanan', image: 'https://images.unsplash.com/photo-1532634960-936d5c64366e?q=80&w=800&auto=format&fit=crop', favorite: false },
           { name: 'Sate Maranggi Kambing (10 Tsk)', desc: 'Kambing muda, tidak prengus, super empuk.', price: 'Rp 60.000', category: 'Makanan', image: 'https://images.unsplash.com/photo-1603083544234-814b73b22228?q=80&w=800&auto=format&fit=crop', favorite: true },
           { name: 'Ketan Bakar', desc: 'Pendamping wajib sate, gurih dengan serundeng.', price: 'Rp 10.000', category: 'Pelengkap', image: 'https://picsum.photos/seed/ketan/800/600', favorite: true },
           { name: 'Nasi Timbel Komplit', desc: 'Nasi, ayam goreng, tahu, tempe, sambal, lalap.', price: 'Rp 35.000', category: 'Makanan', image: 'https://picsum.photos/seed/timbel/800/600', favorite: false },
           { name: 'Sop Iga Sapi', desc: 'Kuah kaldu bening segar, daging iga lepas tulang.', price: 'Rp 55.000', category: 'Makanan', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=800&auto=format&fit=crop', favorite: true },
           { name: 'Es Kelapa Muda', desc: 'Kelapa murni langsung dari batoknya.', price: 'Rp 15.000', category: 'Minuman', image: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?q=80&w=800&auto=format&fit=crop', favorite: false },
        ]
      },
      {
         id: 'pasteur',
         name: 'Cabang: Pasteur',
         address: 'Jl. Dr. Djunjunan No.155, Sukagalih, Kec. Sukajadi, Kota Bandung',
         googleMapsUrl: 'https://goo.gl/maps/abc',
         phone: '0821-9988-7766',
         whatsappNumber: '6282199887766',
         hours: '11.00 - 23.00 WIB',
         mapImage: 'https://picsum.photos/seed/mappasteur/600/400',
         menu: [
            { name: 'Paket Hemat Berdua', desc: '20 Sate Sapi + 2 Nasi + 2 Es Teh.', price: 'Rp 120.000', category: 'Paket', image: 'https://picsum.photos/seed/paket1/800/600', favorite: true },
            { name: 'Sate Maranggi Sapi (10 Tsk)', desc: 'Daging sapi has dalam.', price: 'Rp 55.000', category: 'Makanan', image: 'https://picsum.photos/seed/sate1/800/600', favorite: true },
         ]
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76690b6d015?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529563021427-d8f8ead97f4c?q=80&w=800&auto=format&fit=crop'
    ],
    testimonials: [
      { name: 'Ridwan Kamil', text: 'Salah satu sate maranggi terbaik di Bandung Raya. Bumbunya nendang!', rating: 5, role: 'Tokoh Publik' },
      { name: 'Nagita Slavina', text: 'Suka banget sama sambal oncomnya, beda dari yang lain.', rating: 5, role: 'Artis' },
      { name: 'Budi Santoso', text: 'Tempatnya luas, cocok buat bukber atau makan keluarga besar.', rating: 4, role: 'Local Guide' }
    ],
    ai: {
      systemInstruction: `Anda adalah asisten virtual "Si Maya", maskot dari restoran Sate Maranggi Hj. Maya. Gaya bicara Anda ramah, sunda halus, dan membantu. Anda bertugas merekomendasikan menu.`,
      initialMessage: 'Sampurasun! Cari sate yang empuk atau mau rekomendasi menu best seller?'
    }
  });

  constructor() {
    this.initializeAuth();
    this.loadFromStorage();

    // Effect for CSS vars fallback
    effect(() => {
       const c = this.config();
       const root = document.documentElement;
       root.style.setProperty('--color-brand-brown', c.hero.style.backgroundColor);
    });
  }

  initializeAuth() {
    // Check if we have a fake session
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  // --- AUTH LOGIC (MOCKED - No Firebase) ---

  async loginAdmin(email: string, pass: string) {
    // Simple simulation
    if (pass.length > 3) {
      const user = { email };
      this.currentUser.set(user);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return true;
    } else {
      throw new Error("Password salah (min 4 karakter)");
    }
  }

  async logoutAdmin() {
    this.currentUser.set(null);
    localStorage.removeItem(this.USER_KEY);
  }

  // --- DATA LOGIC (LocalStorage Only) ---

  async loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as AppConfig;
          // Merge stored data with defaults (careful not to overwrite if structure changed)
          this.config.update(current => ({...current, ...data}));
        }
      }
    } catch (error) {
      console.warn("Error loading config:", error);
    }
  }

  async updateConfig(newConfig: AppConfig) {
    // 1. Update Local Signal
    this.config.set(newConfig);

    // 2. Persist to LocalStorage
    try {
       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
       console.log("Config saved to LocalStorage!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Gagal menyimpan (Mungkin kuota LocalStorage penuh).");
    }
  }

  // --- FILE HANDLING (Base64 only - No Firebase Storage) ---
  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    return new Promise((resolve, reject) => {
      // Limit file size to avoid LocalStorage quota exceeded (approx 5MB limit usually)
      if (file.size > 500000) { // 500KB limit recommended for base64 in localstorage
         if(!confirm("Ukuran gambar cukup besar (>500KB). Ini mungkin memenuhi penyimpanan browser. Lanjut?")) {
            reject("File too big");
            return;
         }
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  // --- HELPERS ---

  getMenuContext(): string {
    return this.config().branches.map(b => 
      `CABANG: ${b.name}\n` + 
      b.menu.map((m, i) => `  - ${m.name} (${m.category}) : ${m.desc} [${m.price}] ${m.favorite ? '(FAVORIT)' : ''}`).join('\n')
    ).join('\n\n');
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm');
  }

  is3D(url: string): boolean {
    if (!url) return false;
    return url.endsWith('.glb') || url.endsWith('.gltf') || url.startsWith('data:model') || url.includes('gltf');
  }
}
