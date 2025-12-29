
import { Injectable, signal, effect } from '@angular/core';

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

export interface PageStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string; // Used for buttons, highlights
  fontFamily: string;
}

export interface AppConfig {
  global: {
    logoText: string;
    logoImage: string;
    navbarColor: string; // Navbar bg
    navbarTextColor: string;
  };
  intro: {
    enabled: boolean;
    videoUrl: string;
    duration: number;
    fadeOut: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom-out';
  };
  // Page Specific Configs (Content + Style)
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
  ai: {
    systemInstruction: string;
    initialMessage: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Initial State
  config = signal<AppConfig>({
    global: {
      logoText: 'Hj. Maya',
      logoImage: '', 
      navbarColor: '#FFFFFF',
      navbarTextColor: '#3E2723'
    },
    intro: {
      enabled: true,
      videoUrl: '', 
      duration: 10,
      fadeOut: 'fade'
    },
    hero: {
      title: 'Sate Maranggi',
      highlight: 'Hj. Maya',
      subtitle: 'Cita rasa legendaris dengan 3 cabang di Bandung Raya.',
      bgImage: 'https://picsum.photos/seed/bbq1/1600/900',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFFFFF',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display'
      }
    },
    about: {
      title: 'Warisan Kuliner Legendaris',
      description: 'Bermula dari resep keluarga yang diwariskan turun-temurun...',
      image: 'https://picsum.photos/seed/chef/800/600',
      style: {
        backgroundColor: '#FFFFFF',
        textColor: '#4B5563', // Gray-600
        accentColor: '#3E2723',
        fontFamily: 'Lato'
      }
    },
    menuPage: {
      title: 'Menu & Pesanan',
      subtitle: 'Pilih cabang, pilih menu, dan pesan langsung via WhatsApp!',
      style: {
        backgroundColor: '#FFF8E1', // Cream
        textColor: '#3E2723',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display'
      }
    },
    reservation: {
      title: 'Reservasi & Pesan Menu',
      subtitle: 'Isi data reservasi, masukkan nama tamu, dan pilih menu.',
      minPaxRegular: 25,
      minPaxRamadan: 10,
      style: {
        backgroundColor: '#F3F4F6', // Gray-100
        textColor: '#1F2937', // Gray-800
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    locationPage: {
      title: 'Lokasi Cabang',
      subtitle: 'Nikmati kelezatan Sate Maranggi Hj. Maya di cabang terdekat.',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFF8E1',
        accentColor: '#D84315',
        fontFamily: 'Playfair Display'
      }
    },
    footer: {
      instagramLink: 'https://www.instagram.com/satemaranggihjmayacimahi/',
      facebookLink: '#',
      tiktokLink: '#',
      style: {
        backgroundColor: '#3E2723',
        textColor: '#FFF8E1',
        accentColor: '#D84315',
        fontFamily: 'Lato'
      }
    },
    branches: [
      {
        id: 'pusat',
        name: 'Cabang 1: Cimahi Pusat',
        address: 'Jl. Jend. Amir Machmud No. 123, Cimahi Tengah',
        googleMapsUrl: 'https://maps.google.com',
        phone: '0812-3456-7890',
        whatsappNumber: '6281234567890',
        hours: '10.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/map1/400/300',
        menu: [
           { name: 'Sate Maranggi Sapi', desc: 'Daging sapi murni.', price: 'Rp 50.000', category: 'Makanan', image: 'https://picsum.photos/seed/sate1/800/600', favorite: true },
        ]
      },
      {
         id: 'cibabat',
         name: 'Cabang 2: Cibabat',
         address: 'Jl. Raya Cibabat No. 456',
         googleMapsUrl: '',
         phone: '-',
         whatsappNumber: '62',
         hours: '10.00-22.00',
         mapImage: '',
         menu: []
      }
    ],
    ai: {
      systemInstruction: `Anda adalah asisten virtual restoran Sate Maranggi Hj. Maya.`,
      initialMessage: 'Halo! Mau cari Sate di cabang mana?'
    }
  });

  constructor() {
    // Effect removed or simplified since we use direct style bindings now for flexibility
    effect(() => {
       const c = this.config();
       // Global CSS variables can still be used for common utility classes if needed
       const root = document.documentElement;
       root.style.setProperty('--color-brand-brown', c.hero.style.backgroundColor); // Fallback
    });
  }

  updateConfig(newConfig: AppConfig) {
    this.config.set(newConfig);
  }

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
