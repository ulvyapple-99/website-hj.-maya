
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="gallery" class="py-16 bg-white border-t">
      <div class="max-w-4xl mx-auto px-0 md:px-8"> 
        <!-- Note: px-0 on mobile for full width grid like IG -->
        
        <!-- Instagram Header Look -->
        <div class="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b pb-12 px-4 md:px-0">
           <!-- Profile Pic -->
           <div class="w-24 h-24 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex-shrink-0">
              <div class="w-full h-full rounded-full bg-white p-1">
                 <img [src]="config().instagramProfile?.profilePic || 'https://ui-avatars.com/api/?name=HM'" class="w-full h-full rounded-full object-cover">
              </div>
           </div>

           <!-- Info -->
           <div class="flex-1 text-center md:text-left w-full">
              <div class="flex flex-col md:flex-row items-center gap-4 mb-4">
                 <h2 class="text-xl md:text-2xl font-light text-gray-800 truncate max-w-[200px] md:max-w-none">{{ config().instagramProfile?.username }}</h2>
                 <div class="flex gap-2">
                    <a [href]="config().footer.instagramLink" target="_blank" class="bg-blue-500 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition">Follow</a>
                    <button class="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition">Message</button>
                    <button class="bg-gray-100 text-gray-800 px-2 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                 </div>
              </div>

              <!-- Stats -->
              <div class="flex justify-center md:justify-start gap-6 md:gap-10 mb-5 text-sm md:text-base border-t md:border-none pt-3 md:pt-0 border-gray-100 w-full">
                 <div class="text-center md:text-left"><span class="font-bold block md:inline text-gray-900">{{ config().instagramProfile?.postsCount }}</span> <span class="text-gray-500 md:text-gray-900">posts</span></div>
                 <div class="text-center md:text-left"><span class="font-bold block md:inline text-gray-900">{{ config().instagramProfile?.followersCount }}</span> <span class="text-gray-500 md:text-gray-900">followers</span></div>
                 <div class="text-center md:text-left"><span class="font-bold block md:inline text-gray-900">{{ config().instagramProfile?.followingCount }}</span> <span class="text-gray-500 md:text-gray-900">following</span></div>
              </div>

              <!-- Bio -->
              <div class="text-sm px-4 md:px-0 text-left">
                 <p class="font-bold text-gray-900">{{ config().global.logoText }}</p>
                 <p class="whitespace-pre-line text-gray-700 leading-snug">{{ config().instagramProfile?.bio }}</p>
                 @if (config().branches[0]) {
                   <a [href]="config().branches[0].googleMapsUrl" target="_blank" class="text-blue-900 font-bold text-xs uppercase mt-2 block hover:underline">
                     📍 {{ config().branches[0].address }}
                   </a>
                 }
              </div>
           </div>
        </div>

        <!-- Grid Tabs -->
        <div class="flex justify-center gap-12 border-t border-gray-200 -mt-8 pt-0 md:pt-4 mb-1 md:mb-4 bg-white sticky top-16 z-10 md:static">
           <button class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black border-t-2 border-black py-3 md:pt-2 md:-mt-4.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span class="hidden md:inline">Posts</span>
           </button>
           <button class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition py-3 md:pt-2 md:-mt-4.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span class="hidden md:inline">Reels</span>
           </button>
           <button class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition py-3 md:pt-2 md:-mt-4.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              <span class="hidden md:inline">Tagged</span>
           </button>
        </div>

        <!-- The Grid (Gap-0.5 for real IG feel) -->
        @if (config().gallery.length > 0) {
          <div class="grid grid-cols-3 gap-0.5 md:gap-8">
            @for (img of config().gallery; track $index) {
              <div class="relative aspect-square overflow-hidden bg-gray-100 group cursor-pointer">
                <img [src]="img" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                
                <!-- Hover Overlay like Instagram -->
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-6 text-white font-bold">
                   <div class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
                      <span>{{ 100 + $index * 35 }}</span>
                   </div>
                   <div class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" /></svg>
                      <span>{{ 5 + $index * 2 }}</span>
                   </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20">
            <div class="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 class="font-bold text-xl">No Posts Yet</h3>
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
