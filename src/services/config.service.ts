
import { Injectable, signal, effect } from '@angular/core';

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
  category: string;
  image: string; // Can be Image or Video Data URL
  favorite?: boolean; // New: To mark item as featured in slider
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  whatsappNumber: string; // New: For ordering
  hours: string;
  mapImage: string; // Can be Image or 3D Model (.glb)
  menu: MenuItem[];
}

export interface AppConfig {
  branding: {
    logoText: string;
    logoImage: string;
    fontHeading: string;
    fontBody: string;
  };
  intro: {
    enabled: boolean;
    videoUrl: string;
    duration: number;
  };
  colors: {
    brown: string;
    orange: string;
    cream: string;
    gold: string;
  };
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    bgImage: string;
  };
  about: {
    title: string;
    description: string;
    image: string;
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
    branding: {
      logoText: 'Hj. Maya',
      logoImage: '', 
      fontHeading: 'Playfair Display',
      fontBody: 'Lato'
    },
    intro: {
      enabled: true,
      videoUrl: '', 
      duration: 10
    },
    colors: {
      brown: '#3E2723',
      orange: '#D84315',
      cream: '#FFF8E1',
      gold: '#FFD700'
    },
    hero: {
      title: 'Sate Maranggi',
      highlight: 'Hj. Maya',
      subtitle: 'Cita rasa legendaris dengan 3 cabang di Bandung Raya. Daging empuk, bumbu meresap sempurna.',
      bgImage: 'https://picsum.photos/seed/bbq1/1600/900'
    },
    about: {
      title: 'Warisan Kuliner Legendaris',
      description: 'Bermula dari resep keluarga yang diwariskan turun-temurun, Sate Maranggi Hj. Maya menghadirkan cita rasa otentik yang tak terlupakan. Daging pilihan dimarinasi dengan rempah rahasia, dibakar dengan teknik khusus sehingga menghasilkan kelembutan sempurna. Kini hadir lebih dekat dengan Anda melalui 3 cabang strategis di area Cimahi dan Padalarang.',
      image: 'https://picsum.photos/seed/chef/800/600'
    },
    branches: [
      {
        id: 'pusat',
        name: 'Cabang 1: Cimahi Pusat (Alun-Alun)',
        address: 'Jl. Jend. Amir Machmud No. 123, Cimahi Tengah',
        googleMapsUrl: 'https://maps.google.com',
        phone: '0812-3456-7890',
        whatsappNumber: '6281234567890',
        hours: '10.00 - 22.00 WIB',
        mapImage: 'https://picsum.photos/seed/map1/400/300',
        menu: [
           { name: 'Sate Maranggi Sapi (Original)', desc: 'Menu andalan pusat. Daging sapi murni.', price: 'Rp 50.000', category: 'Makanan', image: 'https://picsum.photos/seed/sate1/800/600', favorite: true },
           { name: 'Sop Iga Bakar', desc: 'Iga bakar spesial bumbu kecap.', price: 'Rp 65.000', category: 'Makanan', image: 'https://picsum.photos/seed/iga/800/600', favorite: true }
        ]
      },
      {
        id: 'cibabat',
        name: 'Cabang 2: Cibabat (Jalan Raya)',
        address: 'Jl. Raya Cibabat No. 456, Cimahi Utara',
        googleMapsUrl: 'https://maps.google.com',
        phone: '0813-9876-5432',
        whatsappNumber: '6281398765432',
        hours: '09.00 - 23.00 WIB',
        mapImage: 'https://picsum.photos/seed/map2/400/300',
        menu: [
           { name: 'Sate Maranggi Kambing', desc: 'Spesial kambing muda hanya di cabang Cibabat.', price: 'Rp 60.000', category: 'Makanan', image: 'https://picsum.photos/seed/kambing/800/600', favorite: true },
           { name: 'Gule Kambing', desc: 'Kuah santan gurih.', price: 'Rp 40.000', category: 'Makanan', image: 'https://picsum.photos/seed/gule/800/600' }
        ]
      },
      {
        id: 'padalarang',
        name: 'Cabang 3: Padalarang (Kota Baru)',
        address: 'Ruko Kota Baru Parahyangan No. 88',
        googleMapsUrl: 'https://maps.google.com',
        phone: '0815-1122-3344',
        whatsappNumber: '6281511223344',
        hours: '10.00 - 21.00 WIB',
        mapImage: 'https://picsum.photos/seed/map3/400/300',
        menu: [
           { name: 'Paket Keluarga (20 Tusuk)', desc: 'Sate campur sapi & lemak.', price: 'Rp 100.000', category: 'Paket Hemat', image: 'https://picsum.photos/seed/paket/800/600', favorite: true },
           { name: 'Es Durian', desc: 'Dessert spesial Padalarang.', price: 'Rp 25.000', category: 'Minuman', image: 'https://picsum.photos/seed/durian/800/600' }
        ]
      }
    ],
    ai: {
      systemInstruction: `Anda adalah asisten virtual restoran Sate Maranggi Hj. Maya.
Kami memiliki 3 cabang dengan menu yang sedikit berbeda.
Tugas Anda membantu pelanggan memilih cabang terdekat atau menu yang mereka cari.`,
      initialMessage: 'Halo! Mau cari Sate di cabang Cimahi, Cibabat, atau Padalarang?'
    }
  });

  constructor() {
    effect(() => {
      const c = this.config();
      const root = document.documentElement;
      root.style.setProperty('--color-brand-brown', c.colors.brown);
      root.style.setProperty('--color-brand-orange', c.colors.orange);
      root.style.setProperty('--color-brand-cream', c.colors.cream);
      root.style.setProperty('--color-brand-gold', c.colors.gold);
      root.style.setProperty('--font-heading', `'${c.branding.fontHeading}'`);
      root.style.setProperty('--font-body', `'${c.branding.fontBody}'`);
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
    // Check for common 3D formats or data URI signatures for models
    return url.endsWith('.glb') || url.endsWith('.gltf') || url.startsWith('data:model') || url.includes('gltf');
  }
}
