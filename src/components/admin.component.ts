
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem } from '../services/config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-800 text-white p-4 rounded-full shadow-2xl hover:bg-gray-700 transition-transform hover:scale-110 border-2 border-white"
      title="Admin Panel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Admin Panel Overlay -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto">
        <!-- Backdrop -->
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Sidebar Container -->
        <div class="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in">
          
          <!-- Close Button -->
          <button (click)="togglePanel()" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-20">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>

          @if (!isAuthenticated()) {
            <!-- Login Form -->
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
              <div class="bg-brand-cream p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">Login Admin</h2>
                <p class="text-gray-500 text-sm mt-1">Masukkan password untuk mengelola website.</p>
              </div>
              
              <div class="w-full max-w-xs space-y-3">
                <div class="relative">
                  <input 
                    [type]="showPassword() ? 'text' : 'password'" 
                    [(ngModel)]="passwordInput" 
                    (keyup.enter)="login()"
                    placeholder="Password" 
                    class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange text-center pr-10 shadow-sm"
                  >
                  <button 
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                     @if (showPassword()) {
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                     } @else {
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                     }
                  </button>
                </div>
                
                @if (loginError()) {
                  <p class="text-red-500 text-xs font-bold">{{ loginError() }}</p>
                }
                <button 
                  (click)="login()" 
                  class="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg"
                >
                  Masuk
                </button>
              </div>
            </div>

          } @else {
            
            <!-- Dashboard View -->
            <div class="flex flex-col h-full bg-gray-50">
              
              <!-- Header -->
              <div class="p-6 border-b bg-white flex justify-between items-center shadow-sm z-10">
                <div class="flex items-center gap-3">
                  @if (currentView() !== 'dashboard') {
                    <button (click)="currentView.set('dashboard')" class="p-2 hover:bg-gray-100 rounded-full transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  }
                  <h2 class="text-xl font-bold text-gray-800">
                    {{ getTitle() }}
                  </h2>
                </div>
                <button (click)="logout()" class="text-xs text-red-500 underline ml-2">Logout</button>
              </div>

              <!-- Main Content Area -->
              <div class="flex-1 overflow-y-auto p-6">
                
                <!-- DASHBOARD MENU -->
                @if (currentView() === 'dashboard') {
                  <div class="grid grid-cols-2 gap-4">
                    <button (click)="currentView.set('intro')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange col-span-2">
                       <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <span class="font-bold text-gray-700">Intro Video</span>
                    </button>

                    <button (click)="currentView.set('branding')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Branding</span>
                    </button>

                    <button (click)="currentView.set('tampilan')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Tampilan</span>
                    </button>

                    <button (click)="currentView.set('about')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Tentang</span>
                    </button>

                    <button (click)="currentView.set('menu')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Daftar Menu</span>
                    </button>

                    <button (click)="currentView.set('kontak')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Info Cabang</span>
                    </button>

                    <button (click)="currentView.set('ai')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition gap-3 group border border-transparent hover:border-brand-orange">
                      <div class="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Asisten AI</span>
                    </button>
                  </div>
                }

                <!-- INTRO VIEW -->
                @if (currentView() === 'intro') {
                  <div class="space-y-6 animate-slide-in">
                     <div>
                       <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Konfigurasi Video Intro</h3>
                       <div class="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 mb-4">
                         <strong>Catatan:</strong> Video diputar otomatis. Max 100MB.
                       </div>
                       
                       <div class="space-y-4">
                         <div class="flex items-center gap-2">
                            <input type="checkbox" [(ngModel)]="config().intro.enabled" id="introEnabled" class="w-4 h-4 text-brand-orange rounded">
                            <label for="introEnabled" class="text-sm font-bold text-gray-700">Aktifkan Intro Video</label>
                         </div>

                         <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Durasi (Detik)</label>
                           <input type="number" [(ngModel)]="config().intro.duration" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                         </div>

                         <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Upload Video Intro</label>
                           <div class="mb-2 w-full h-48 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                              @if (config().intro.videoUrl) {
                                <video [src]="config().intro.videoUrl" controls class="w-full h-full object-contain bg-black"></video>
                              } @else {
                                <span class="text-gray-400 text-sm">Belum ada video</span>
                              }
                           </div>
                           <div class="flex gap-2">
                             <label class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer text-sm w-full text-center flex items-center justify-center font-bold">
                               Pilih Video (Max 100MB)
                               <input type="file" (change)="onFileSelected($event, 'introVideo')" class="hidden" accept="video/*">
                             </label>
                           </div>
                           <button *ngIf="config().intro.videoUrl" (click)="config().intro.videoUrl = ''" class="text-xs text-red-500 underline mt-2">Hapus Video</button>
                         </div>
                       </div>
                     </div>
                  </div>
                }

                <!-- BRANDING VIEW -->
                @if (currentView() === 'branding') {
                  <div class="space-y-6 animate-slide-in">
                    <div>
                      <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Logo & Nama</h3>
                      <div class="space-y-3">
                         <div>
                            <label class="block text-xs mb-1 text-gray-600 font-bold">Nama Brand (Teks Logo)</label>
                            <input type="text" [(ngModel)]="config().branding.logoText" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                         </div>
                         <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Upload Gambar/Video Logo (Opsional)</label>
                           <div class="flex gap-2 items-center">
                             <div class="w-16 h-16 bg-white rounded border flex items-center justify-center overflow-hidden">
                                @if (config().branding.logoImage) {
                                  @if (isVideo(config().branding.logoImage)) {
                                     <video [src]="config().branding.logoImage" class="w-full h-full object-cover" autoplay muted loop></video>
                                  } @else {
                                     <img [src]="config().branding.logoImage" class="w-full h-full object-contain">
                                  }
                                } @else {
                                  <span class="text-xs text-gray-400">None</span>
                                }
                             </div>
                             <label class="flex-1 bg-white border border-gray-300 rounded px-2 py-2 cursor-pointer text-xs hover:bg-gray-50">
                                Pilih File (Img/Vid)
                                <input type="file" (change)="onFileSelected($event, 'logo')" class="hidden" accept="image/*,video/*">
                             </label>
                           </div>
                           <button *ngIf="config().branding.logoImage" (click)="config().branding.logoImage = ''" class="text-xs text-red-500 underline mt-1">Hapus Logo</button>
                         </div>
                      </div>
                    </div>

                    <div>
                      <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Tipografi</h3>
                      <div class="grid grid-cols-1 gap-4">
                        <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Font Judul (Heading)</label>
                           <select [(ngModel)]="config().branding.fontHeading" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                             <option value="Playfair Display">Playfair Display</option>
                             <option value="Montserrat">Montserrat</option>
                             <option value="Oswald">Oswald</option>
                             <option value="Lora">Lora</option>
                             <option value="Raleway">Raleway</option>
                           </select>
                        </div>
                        <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Font Isi (Body)</label>
                           <select [(ngModel)]="config().branding.fontBody" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                             <option value="Lato">Lato</option>
                             <option value="Open Sans">Open Sans</option>
                             <option value="Roboto">Roboto</option>
                             <option value="Merriweather">Merriweather</option>
                             <option value="Source Sans Pro">Source Sans Pro</option>
                           </select>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAMPILAN VIEW -->
                @if (currentView() === 'tampilan') {
                  <div class="space-y-6 animate-slide-in">
                    <!-- Colors and Hero settings -->
                    <div>
                      <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Warna Tema</h3>
                      <div class="grid grid-cols-1 gap-4">
                        <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Warna Utama (Brown)</label>
                          <input type="text" [(ngModel)]="config().colors.brown" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                        </div>
                        <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Warna Aksen (Orange)</label>
                          <input type="text" [(ngModel)]="config().colors.orange" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Hero Header</h3>
                       <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Judul Besar</label>
                          <input type="text" [(ngModel)]="config().hero.title" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                        </div>
                        <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Teks Highlight</label>
                          <input type="text" [(ngModel)]="config().hero.highlight" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                        </div>
                        <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Background Hero</label>
                           <div class="flex gap-2">
                             <label class="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer text-xs flex items-center font-bold flex-1 justify-center">
                               Upload BG Hero
                               <input type="file" (change)="onFileSelected($event, 'heroBg')" class="hidden" accept="image/*,video/*">
                             </label>
                           </div>
                        </div>
                    </div>
                  </div>
                }

                 <!-- ABOUT VIEW -->
                @if (currentView() === 'about') {
                  <div class="space-y-6 animate-slide-in">
                    <div>
                      <h3 class="font-bold mb-3 text-sm uppercase text-gray-500">Konten Tentang Kami</h3>
                      <div class="space-y-3">
                        <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Judul Bagian</label>
                          <input type="text" [(ngModel)]="config().about.title" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                        </div>
                        <div>
                          <label class="block text-xs mb-1 text-gray-600 font-bold">Cerita / Deskripsi</label>
                          <textarea [(ngModel)]="config().about.description" rows="6" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm"></textarea>
                        </div>
                        <div>
                           <label class="block text-xs mb-1 text-gray-600 font-bold">Gambar Tentang</label>
                           <div class="flex gap-2">
                             <label class="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer text-xs flex items-center font-bold flex-1 justify-center">
                               Upload Image
                               <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="hidden" accept="image/*,video/*">
                             </label>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- MENU VIEW -->
                @if (currentView() === 'menu') {
                  <div class="space-y-6 animate-slide-in">
                    
                    <!-- Branch Selector for Menu -->
                    <div class="bg-brand-cream p-4 rounded-lg">
                       <label class="block text-xs mb-2 text-gray-800 font-bold">Pilih Cabang untuk Edit Menu:</label>
                       <!-- Updated to use signal binding -->
                       <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm font-bold">
                         @for (branch of config().branches; track $index) {
                           <option [value]="$index">{{ branch.name }}</option>
                         }
                       </select>
                    </div>

                    <button (click)="addMenuItem()" class="w-full py-3 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700 transition shadow">
                      + Tambah Menu ke Cabang Ini
                    </button>

                    <div class="space-y-4">
                       @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                        <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative group">
                          <button (click)="removeMenuItem($index)" class="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-2 rounded z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                          <div class="grid grid-cols-1 gap-4">
                            <div class="flex gap-4 items-start">
                              <div class="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group/img">
                                @if (isVideo(item.image)) {
                                  <video [src]="item.image" class="w-full h-full object-cover" autoplay muted loop></video>
                                } @else {
                                  <img [src]="item.image" class="w-full h-full object-cover">
                                }
                                <label class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition">
                                    <span class="text-white text-xs font-bold">Ganti</span>
                                    <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="hidden" accept="image/*,video/*">
                                </label>
                              </div>
                              <div class="flex-1 space-y-3">
                                <input type="text" [(ngModel)]="item.name" placeholder="Nama Menu" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm font-bold shadow-sm">
                                <input type="text" [(ngModel)]="item.price" placeholder="Harga" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm text-brand-orange shadow-sm">
                              </div>
                            </div>
                            <input type="text" [(ngModel)]="item.desc" placeholder="Deskripsi" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm">
                            <div class="flex gap-2 items-center">
                              <input type="text" [(ngModel)]="item.category" placeholder="Kategori" class="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm">
                              
                              <label class="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                <input type="checkbox" [(ngModel)]="item.favorite" class="w-4 h-4 text-brand-gold rounded border-gray-300 focus:ring-brand-orange">
                                <span class="text-xs font-bold text-gray-600">Favorit?</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- KONTAK VIEW (Branches Management) -->
                @if (currentView() === 'kontak') {
                   <div class="space-y-6 animate-slide-in">
                     
                     <div class="bg-brand-cream p-4 rounded-lg space-y-3">
                       <label class="block text-xs mb-1 text-gray-800 font-bold">Pilih Cabang untuk Edit Info:</label>
                       <!-- Updated to use signal binding -->
                       <div class="flex gap-2">
                         <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-bold">
                           @for (branch of config().branches; track $index) {
                             <option [value]="$index">{{ branch.name }}</option>
                           }
                         </select>
                         <button (click)="addNewBranch()" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-bold text-xs shadow" title="Tambah Cabang">
                            + Baru
                         </button>
                         <button 
                           (click)="deleteCurrentBranch()" 
                           [disabled]="config().branches.length <= 1"
                           class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-bold text-xs shadow disabled:opacity-50 disabled:cursor-not-allowed" 
                           title="Hapus Cabang"
                         >
                            Hapus
                         </button>
                       </div>
                     </div>

                     <div class="space-y-4">
                       <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Nama Cabang</label>
                        <input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm font-bold shadow-sm">
                       </div>
                       <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Alamat Lengkap</label>
                        <textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" rows="2" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"></textarea>
                      </div>
                       <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Link Google Maps</label>
                        <input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm">
                      </div>
                      <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">No. WhatsApp Admin (Format: 628...)</label>
                        <input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm" placeholder="Contoh: 628123456789">
                      </div>
                      <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Nomor Telepon (Tampilan)</label>
                        <input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm">
                      </div>
                      <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Jam Operasional</label>
                        <input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm">
                      </div>
                       <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Gambar Peta / File 3D (.glb)</label>
                        <div class="mb-2 w-full h-32 bg-gray-200 rounded overflow-hidden relative">
                              @if (is3D(config().branches[selectedBranchIndex()].mapImage)) {
                                 <model-viewer 
                                   [src]="config().branches[selectedBranchIndex()].mapImage" 
                                   auto-rotate 
                                   camera-controls 
                                   class="w-full h-full bg-gray-800">
                                 </model-viewer>
                              } @else {
                                 <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                              }
                         </div>
                         <div class="flex gap-2">
                           <label class="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer text-xs flex items-center font-bold flex-1 justify-center">
                               Upload Map (Img/3D)
                               <input type="file" (change)="onFileSelected($event, 'mapImage')" class="hidden" accept="image/*,.glb,.gltf">
                           </label>
                         </div>
                      </div>
                   </div>
                   </div>
                }
                
                <!-- AI VIEW -->
                @if (currentView() === 'ai') {
                   <div class="space-y-4 animate-slide-in">
                     <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                       <p class="text-xs text-blue-800 leading-relaxed">
                         <strong>Info:</strong> Asisten AI otomatis membaca menu dari semua cabang.
                       </p>
                     </div>
                     <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Instruksi Sistem (Kepribadian AI)</label>
                        <textarea [(ngModel)]="config().ai.systemInstruction" rows="8" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm"></textarea>
                      </div>
                      <div>
                        <label class="block text-xs mb-1 text-gray-600 font-bold">Pesan Pembuka Chat</label>
                        <input type="text" [(ngModel)]="config().ai.initialMessage" class="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm">
                      </div>
                   </div>
                }
              </div>

              <!-- Footer Actions (Visible on all views except dashboard) -->
              @if (currentView() !== 'dashboard') {
                <div class="p-4 border-t bg-white">
                   <button (click)="saveChanges()" class="w-full py-3 bg-brand-brown text-white rounded-lg font-bold shadow hover:bg-opacity-90 transition">
                     Simpan & Terapkan
                   </button>
                   <div class="text-center mt-2">
                     <button (click)="currentView.set('dashboard')" class="text-xs text-gray-500 underline">Kembali ke Dashboard</button>
                   </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  isOpen = signal(false);
  
  // View State Management
  currentView = signal<'dashboard'|'branding'|'intro'|'tampilan'|'about'|'menu'|'kontak'|'ai'>('dashboard');
  
  isAuthenticated = signal(false);
  passwordInput = signal('');
  loginError = signal('');
  showPassword = signal(false);

  // New: Selected Branch for editing (Use Signal for consistency)
  selectedBranchIndex = signal(0);

  constructor() {
    // Monitor open state to toggle body class for cursor
    effect(() => {
      if (this.isOpen()) {
        document.body.classList.add('admin-mode');
      } else {
        document.body.classList.remove('admin-mode');
      }
    });
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    this.loginError.set('');
    this.passwordInput.set('');
    this.showPassword.set(false);
  }
  
  getTitle(): string {
    const map: any = {
      'dashboard': 'Panel Admin',
      'branding': 'Pengaturan Branding',
      'intro': 'Intro Video',
      'tampilan': 'Pengaturan Tampilan',
      'about': 'Tentang Kami',
      'menu': 'Daftar Menu Cabang',
      'kontak': 'Info Cabang',
      'ai': 'Konfigurasi AI'
    };
    return map[this.currentView()] || 'Admin';
  }

  login() {
    if (this.passwordInput() === 'admin123') {
      this.isAuthenticated.set(true);
      this.loginError.set('');
    } else {
      this.loginError.set('Password salah!');
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentView.set('dashboard');
  }

  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({
      name: 'Menu Baru',
      desc: 'Deskripsi menu baru',
      price: 'Rp 0',
      category: 'Makanan',
      image: 'https://picsum.photos/200/200',
      favorite: false
    });
  }

  removeMenuItem(index: number) {
    if(confirm('Hapus menu ini?')) {
      this.config().branches[this.selectedBranchIndex()].menu.splice(index, 1);
    }
  }

  // --- Branch Management Logic ---
  addNewBranch() {
    const newId = 'cabang-' + (this.config().branches.length + 1);
    this.config().branches.push({
      id: newId,
      name: 'Cabang Baru',
      address: 'Alamat Cabang Baru',
      googleMapsUrl: '',
      phone: '-',
      whatsappNumber: '62',
      hours: '09.00 - 21.00',
      mapImage: 'https://picsum.photos/400/300',
      menu: []
    });
    // Switch to new branch
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }

  deleteCurrentBranch() {
    if (this.config().branches.length <= 1) {
      alert('Minimal harus ada 1 cabang!');
      return;
    }
    
    if (confirm('Yakin ingin menghapus cabang ini? Data tidak bisa dikembalikan.')) {
      this.config().branches.splice(this.selectedBranchIndex(), 1);
      // Reset selection to first branch to avoid out of bounds
      this.selectedBranchIndex.set(0);
    }
  }

  saveChanges() {
    this.configService.updateConfig({...this.config()});
    alert('Pengaturan berhasil disimpan!');
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
  
  is3D(url: string) {
    return this.configService.is3D(url);
  }

  // --- File Upload Logic ---
  onFileSelected(event: any, type: 'logo'|'heroBg'|'aboutImage'|'mapImage'|'menuItem'|'introVideo', index?: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result;
        
        // Update specific config based on type
        const currentConfig = this.config();
        
        switch (type) {
          case 'logo':
            currentConfig.branding.logoImage = result;
            break;
          case 'heroBg':
            currentConfig.hero.bgImage = result;
            break;
          case 'aboutImage':
            currentConfig.about.image = result;
            break;
          case 'introVideo':
            currentConfig.intro.videoUrl = result;
            break;
          case 'mapImage':
            currentConfig.branches[this.selectedBranchIndex()].mapImage = result;
            break;
          case 'menuItem':
            if (typeof index === 'number') {
              currentConfig.branches[this.selectedBranchIndex()].menu[index].image = result;
            }
            break;
        }
        
        // Trigger update
        this.configService.updateConfig({...currentConfig});
      };
      reader.readAsDataURL(file);
    }
  }
}
