
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="gallery" class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-serif font-bold text-brand-brown">Galeri Foto</h2>
            <p class="text-gray-500 mt-1">Dokumentasi & Momen Terbaik</p>
          </div>
          <a [href]="config().footer.instagramLink" target="_blank" class="text-brand-orange hover:text-brand-brown font-medium flex items-center gap-1">
            Lihat Instagram
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>

        @if (config().gallery.length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (img of config().gallery; track $index) {
              <div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
                <img [src]="img" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                   <span class="text-white font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-300">View</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
            Belum ada foto di galeri.
          </div>
        }
      </div>
    </section>
  `
})
export class GalleryComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
}
