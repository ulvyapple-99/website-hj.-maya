
import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: true,
  template: `
    <section id="gallery" class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-serif font-bold text-brand-brown">Galeri Instagram</h2>
            <p class="text-gray-500 mt-1">@satemaranggihjmayacimahi</p>
          </div>
          <a href="https://www.instagram.com/satemaranggihjmayacimahi/" target="_blank" class="text-brand-orange hover:text-brand-brown font-medium flex items-center gap-1">
            Follow Kami
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Simulated Instagram Grid -->
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/sate1/400/400" alt="Sate Close up" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 125
            </div>
          </div>
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/resto1/400/400" alt="Suasana Resto" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
             <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 89
            </div>
          </div>
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/ketan/400/400" alt="Ketan Bakar" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
             <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 210
            </div>
          </div>
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/happy/400/400" alt="Pelanggan" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
             <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 156
            </div>
          </div>
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/grill/400/400" alt="Proses Bakar" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
             <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 302
            </div>
          </div>
          <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img src="https://picsum.photos/seed/es/400/400" alt="Es Kelapa" class="w-full h-full object-cover transition duration-300 group-hover:scale-110">
             <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold">
              ❤️ 95
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class GalleryComponent {}
