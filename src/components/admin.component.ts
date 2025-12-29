
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch } from '../services/config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-black transition-all hover:scale-105 border border-gray-700 group"
      title="Admin Panel"
    >
      <div class="absolute inset-0 rounded-full border border-white/20"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Admin Panel Overlay -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto font-sans">
        <!-- Backdrop -->
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Sidebar Container -->
        <div class="relative w-full max-w-2xl bg-gray-50 h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
          
          <!-- Sticky Header -->
          <div class="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
             <div class="flex items-center gap-3">
                @if (currentView() !== 'dashboard' && isAuthenticated()) {
                  <button (click)="currentView.set('dashboard')" class="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 border border-transparent hover:border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                }
                <div>
                   <h2 class="text-xl font-bold text-gray-900 tracking-tight">{{ getTitle() }}</h2>
                   <p class="text-xs text-gray-500 font-medium">Sistem Manajemen Konten</p>
                </div>
             </div>
             
             <div class="flex items-center gap-3">
                @if (isAuthenticated()) {
                  <button (click)="logout()" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 rounded hover:bg-red-50 transition border border-transparent hover:border-red-100">
                    Keluar
                  </button>
                }
                <button (click)="togglePanel()" class="text-gray-400 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
          </div>

          <!-- Content Scroll Area -->
          <div class="flex-1 overflow-y-auto bg-gray-50/50">
            @if (!isAuthenticated()) {
              <!-- Login Form -->
              <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                <div class="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <div class="bg-brand-cream w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Selamat Datang</h2>
                  <p class="text-gray-500 text-sm mt-2 mb-8">Silakan masuk untuk mengakses panel.</p>
                  
                  <div class="space-y-5">
                      <div class="relative group">
                        <input 
                          [type]="showPassword() ? 'text' : 'password'" 
                          [(ngModel)]="passwordInput" 
                          placeholder="Password" 
                          class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm text-center pr-10 outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition shadow-sm group-hover:border-gray-400"
                          style="background-color: #ffffff !important; color: #000000 !important;"
                        >
                        <button 
                          type="button"
                          (click)="togglePasswordVisibility()" 
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange focus:outline-none z-10 p-1 transition"
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
                      <button (click)="login()" class="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Masuk Dashboard</button>
                  </div>
                </div>
                <p class="text-xs text-gray-400">© {{ currentYear }} Sate Maranggi Hj. Maya</p>
              </div>

            } @else {
              
              <div class="p-6 md:p-8 space-y-8 pb-32">
                
                <!-- DASHBOARD GRID -->
                @if (currentView() === 'dashboard') {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
                    
                    <!-- Design Editor Card -->
                    <button (click)="currentView.set('design')" class="md:col-span-2 group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       </div>
                       <div class="relative z-10 flex items-center gap-4">
                          <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">Editor Tampilan</h3>
                            <p class="text-sm text-gray-500 mt-1 max-w-sm">Ubah teks, warna, font, gambar background, dan layout halaman utama.</p>
                          </div>
                       </div>
                    </button>

                    <!-- Menu Card -->
                    <button (click)="currentView.set('menu')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left flex flex-col justify-between h-40">
                      <div class="flex justify-between items-start">
                         <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:rotate-6 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                         </div>
                         <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Produk</span>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800 group-hover:text-green-700">Daftar Menu</h3>
                        <p class="text-xs text-gray-500 mt-1">Kelola makanan & harga.</p>
                      </div>
                    </button>

                    <!-- Cabang Card -->
                    <button (click)="currentView.set('kontak')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left flex flex-col justify-between h-40">
                      <div class="flex justify-between items-start">
                         <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:rotate-6 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <span class="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Lokasi</span>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800 group-hover:text-orange-700">Cabang & Kontak</h3>
                        <p class="text-xs text-gray-500 mt-1">Alamat, maps & WhatsApp.</p>
                      </div>
                    </button>

                    <!-- Video Intro Card -->
                    <button (click)="currentView.set('intro')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left flex flex-col justify-between h-40">
                      <div class="flex justify-between items-start">
                         <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:rotate-6 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800 group-hover:text-purple-700">Video Intro</h3>
                        <p class="text-xs text-gray-500 mt-1">Splash screen & animasi.</p>
                      </div>
                    </button>

                    <!-- AI Card -->
                    <button (click)="currentView.set('ai')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left flex flex-col justify-between h-40">
                      <div class="flex justify-between items-start">
                         <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:rotate-6 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         </div>
                         <span class="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Bot</span>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800 group-hover:text-teal-700">Asisten AI</h3>
                        <p class="text-xs text-gray-500 mt-1">Prompt & pesan bot.</p>
                      </div>
                    </button>

                  </div>
                }

                <!-- DESIGN EDITOR -->
                @if (currentView() === 'design') {
                   <div class="animate-fade-in space-y-8">
                     
                     <!-- Page Selector -->
                     <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm sticky top-0 z-10">
                        <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-blue-800">Bagian yang Diedit</label>
                        <div class="relative">
                          <select [(ngModel)]="designSection" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-base cursor-pointer appearance-none" style="background-color: #ffffff !important; color: #000000 !important;">
                            <option value="global">🎨 Global (Logo, Navbar, Font)</option>
                            <option value="hero">🏠 Halaman Beranda (Hero)</option>
                            <option value="about">ℹ️ Bagian Tentang (About)</option>
                            <option value="menuPage">🍲 Halaman Menu</option>
                            <option value="reservation">📅 Halaman Reservasi</option>
                            <option value="locationPage">📍 Halaman Lokasi</option>
                            <option value="footer">🦶 Footer (Bawah)</option>
                          </select>
                          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                          </div>
                        </div>
                     </div>

                     <!-- GLOBAL SETTINGS -->
                     @if (designSection() === 'global') {
                        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                           <div class="border-b pb-4">
                             <h3 class="font-bold text-lg text-gray-800">Identitas Brand</h3>
                             <p class="text-sm text-gray-500">Logo dan navigasi utama website.</p>
                           </div>
                           
                           <div>
                              <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nama Brand / Logo Text</label>
                              <input type="text" [(ngModel)]="config().global.logoText" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                           </div>
                           
                           <div>
                              <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Logo Image (Opsional)</label>
                              <div class="flex items-center gap-4">
                                 <div class="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                   <img *ngIf="config().global.logoImage" [src]="config().global.logoImage" class="w-full h-full object-contain">
                                   <span *ngIf="!config().global.logoImage" class="text-xs text-gray-400 font-bold">No IMG</span>
                                 </div>
                                 <div class="flex-1">
                                    <input type="file" (change)="onFileSelected($event, 'logo')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" style="background-color: #ffffff !important; color: #000000 !important;">
                                    <p class="text-xs text-gray-400 mt-1">Format: PNG/JPG (Transparan direkomendasikan)</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div class="grid grid-cols-2 gap-6">
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Warna Navbar</label>
                                <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="config().global.navbarColor" class="w-10 h-10 p-0.5 rounded border cursor-pointer" style="background-color: #ffffff !important;">
                                  <input type="text" [(ngModel)]="config().global.navbarColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                </div>
                              </div>
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Warna Teks Navbar</label>
                                <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="config().global.navbarTextColor" class="w-10 h-10 p-0.5 rounded border cursor-pointer" style="background-color: #ffffff !important;">
                                  <input type="text" [(ngModel)]="config().global.navbarTextColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                </div>
                              </div>
                           </div>
                        </div>
                     }

                     <!-- DYNAMIC PAGE EDITOR -->
                     @if (designSection() !== 'global') {
                        <div class="space-y-6">
                          
                           <!-- Content Card -->
                           <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                             <div class="border-b pb-4">
                               <h3 class="font-bold text-lg text-gray-800">Konten Teks & Media</h3>
                             </div>
                             
                             @if (hasProp(activeConfig(), 'title')) {
                               <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Judul Utama</label>
                                  <input type="text" [(ngModel)]="activeConfig().title" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all font-bold" style="background-color: #ffffff !important; color: #000000 !important;">
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'subtitle')) {
                               <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Sub-Judul</label>
                                  <textarea [(ngModel)]="activeConfig().subtitle" rows="2" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'highlight')) {
                               <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-brand-orange">Teks Highlight</label>
                                  <input type="text" [(ngModel)]="activeConfig().highlight" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all border-brand-orange/30 focus:ring-brand-orange" style="background-color: #ffffff !important; color: #000000 !important;">
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'description')) {
                               <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Deskripsi Lengkap</label>
                                  <textarea [(ngModel)]="activeConfig().description" rows="5" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all leading-relaxed" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                               </div>
                             }
                             
                             <!-- Images -->
                             @if (hasProp(activeConfig(), 'bgImage')) {
                                <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Background Image</label>
                                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center group hover:border-blue-400 transition-colors">
                                     <img [src]="activeConfig().bgImage" class="h-40 mx-auto object-cover rounded-lg mb-4 shadow-md group-hover:scale-105 transition-transform">
                                     <input type="file" (change)="onFileSelected($event, 'heroBg')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-auto mx-auto" style="background-color: #ffffff !important;">
                                  </div>
                                </div>
                             }
                             @if (hasProp(activeConfig(), 'image')) {
                                <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Gambar Utama</label>
                                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center group hover:border-blue-400 transition-colors">
                                     <img [src]="activeConfig().image" class="h-40 mx-auto object-cover rounded-lg mb-4 shadow-md group-hover:scale-105 transition-transform">
                                     <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-auto mx-auto" style="background-color: #ffffff !important;">
                                  </div>
                                </div>
                             }

                             <!-- Specifics -->
                             @if (designSection() === 'reservation') {
                                <div class="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Min Pax Reguler</label>
                                     <input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                  <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Min Pax Ramadan</label>
                                     <input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             }
                             @if (designSection() === 'footer') {
                                <div class="space-y-4">
                                  <h4 class="font-bold text-sm text-gray-500 uppercase tracking-wide border-b pb-1">Tautan Sosial Media</h4>
                                  <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Instagram</label>
                                     <input type="text" [(ngModel)]="config().footer.instagramLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                   <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Facebook</label>
                                     <input type="text" [(ngModel)]="config().footer.facebookLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                   <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">TikTok</label>
                                     <input type="text" [(ngModel)]="config().footer.tiktokLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             }
                           </div>

                           <!-- Style Card -->
                           <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                             <div class="border-b pb-4 flex items-center gap-2">
                               <div class="p-1.5 bg-purple-100 text-purple-600 rounded">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                               </div>
                               <h3 class="font-bold text-lg text-gray-800">Gaya Visual</h3>
                             </div>
                             
                             <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Background</label>
                                  <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().backgroundColor" class="w-10 h-10 p-0.5 rounded border cursor-pointer" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().backgroundColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                                <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Warna Teks</label>
                                   <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().textColor" class="w-10 h-10 p-0.5 rounded border cursor-pointer" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().textColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                                <div>
                                  <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Warna Aksen</label>
                                   <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().accentColor" class="w-10 h-10 p-0.5 rounded border cursor-pointer" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().accentColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             </div>

                             <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Typography (Font)</label>
                                <select [(ngModel)]="activeStyle().fontFamily" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                                   <option value="Playfair Display">Playfair Display (Serif/Elegan)</option>
                                   <option value="Lato">Lato (Modern/Clean)</option>
                                   <option value="Montserrat">Montserrat (Tegas)</option>
                                   <option value="Oswald">Oswald (Kuat/Judul)</option>
                                   <option value="Lora">Lora (Klasik)</option>
                                   <option value="Raleway">Raleway (Artistik)</option>
                                   <option value="Open Sans">Open Sans (Netral)</option>
                                   <option value="Roboto">Roboto (Geometris)</option>
                                   <option value="Merriweather">Merriweather (Bacaan Enak)</option>
                                </select>
                             </div>
                           </div>
                        </div>
                     }
                   </div>
                }

                <!-- MENU EDITOR -->
                @if (currentView() === 'menu') {
                   <div class="animate-fade-in space-y-8 pb-10">
                     <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-0 z-10">
                       <div class="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                          <div class="w-full sm:w-auto flex-1">
                            <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-blue-800">Pilih Cabang</label>
                            <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all font-bold" style="background-color: #ffffff !important; color: #000000 !important;">
                              @for (branch of config().branches; track $index) {
                                <option [value]="$index">{{ branch.name }}</option>
                              }
                            </select>
                          </div>
                          <button (click)="addMenuItem()" class="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Tambah Menu
                          </button>
                       </div>
                     </div>

                     <div class="grid grid-cols-1 gap-6">
                       @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                         <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition relative group">
                            <button (click)="removeMenuItem($index)" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full transition z-10">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>

                            <div class="flex flex-col md:flex-row gap-6">
                              <!-- Image Upload -->
                               <div class="w-full md:w-40 h-40 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors">
                                  <img [src]="item.image" class="w-full h-full object-cover">
                                  <label class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold p-2 text-center">
                                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                     Ganti Foto
                                     <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="hidden">
                                  </label>
                               </div>
                               
                               <!-- Inputs -->
                               <div class="flex-1 space-y-4">
                                  <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nama Menu</label>
                                    <input [(ngModel)]="item.name" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all font-bold" placeholder="Contoh: Sate Ayam" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                  <div class="flex gap-4">
                                     <div class="flex-1">
                                        <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Harga</label>
                                        <input [(ngModel)]="item.price" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-green-700 font-bold" placeholder="Rp 15.000" style="background-color: #ffffff !important; color: #000000 !important;">
                                     </div>
                                     <div class="flex-1">
                                        <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Kategori</label>
                                        <input [(ngModel)]="item.category" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" placeholder="Makanan" style="background-color: #ffffff !important; color: #000000 !important;">
                                     </div>
                                  </div>
                                  <div>
                                     <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Deskripsi</label>
                                     <input [(ngModel)]="item.desc" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-sm" placeholder="Keterangan menu..." style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                               </div>
                            </div>
                         </div>
                       }
                     </div>
                   </div>
                }
                
                <!-- CABANG EDITOR -->
                @if (currentView() === 'kontak') {
                   <div class="animate-fade-in space-y-8 pb-10">
                       <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                         <div class="flex justify-between items-center border-b pb-4">
                            <div>
                               <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide mb-0 text-blue-800">Manajemen Cabang</label>
                               <p class="text-xs text-gray-500">Pilih cabang untuk mengedit info detail.</p>
                            </div>
                            <div class="flex gap-2">
                              <button (click)="addBranch()" class="text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-1 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Cabang Baru
                              </button>
                            </div>
                         </div>

                         <div class="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                           <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold cursor-pointer" style="background-color: #ffffff !important; color: #000000 !important;">
                             @for (branch of config().branches; track $index) {
                               <option [value]="$index">{{ branch.name }}</option>
                             }
                           </select>
                           
                           <button (click)="removeBranch()" class="bg-white text-red-500 p-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition border border-gray-200 hover:border-red-200" title="Hapus Cabang Ini">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                         </div>
                       </div>

                       <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                           <div>
                              <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nama Cabang</label>
                              <input [(ngModel)]="config().branches[selectedBranchIndex()].name" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all font-bold text-lg" placeholder="Nama Cabang" style="background-color: #ffffff !important; color: #000000 !important;">
                           </div>
                           
                           <!-- NEW 3D/IMAGE UPLOAD SECTION -->
                           <div>
                             <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Foto Lokasi / Model 3D (.glb)</label>
                             <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center group hover:border-blue-400 transition-colors">
                                @if (configService.is3D(config().branches[selectedBranchIndex()].mapImage)) {
                                   <div class="h-32 bg-gray-200 rounded flex items-center justify-center mb-4 border border-gray-300">
                                      <div class="text-center">
                                        <div class="text-4xl mb-2">📦</div>
                                        <span class="text-xs font-bold text-gray-500">File 3D Loaded</span>
                                      </div>
                                   </div>
                                } @else {
                                   <img [src]="config().branches[selectedBranchIndex()].mapImage" class="h-32 mx-auto object-cover rounded-lg mb-4 shadow-md group-hover:scale-105 transition-transform">
                                }
                                <input type="file" (change)="onFileSelected($event, 'branchMap')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-auto mx-auto" style="background-color: #ffffff !important;">
                                <p class="text-[10px] text-gray-400 mt-2">Support: JPG, PNG, GLB, GLTF</p>
                             </div>
                           </div>

                           <div>
                              <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Alamat Lengkap</label>
                              <textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" rows="3" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" placeholder="Alamat" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                           </div>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">No Telepon (Tampilan)</label>
                                <input [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" placeholder="022-XXXX" style="background-color: #ffffff !important; color: #000000 !important;">
                              </div>
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">No WhatsApp (Sistem)</label>
                                <div class="relative">
                                  <input [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all pl-10 font-mono text-blue-700" placeholder="628123..." style="background-color: #ffffff !important; color: #000000 !important;">
                                  <span class="absolute left-3 top-3 text-gray-400">
                                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" /></svg>
                                  </span>
                                </div>
                                <p class="text-[10px] text-gray-400 mt-1">Gunakan kode negara (62) tanpa +.</p>
                              </div>
                           </div>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Link Google Maps</label>
                                <input [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all text-xs text-blue-600 underline" placeholder="https://maps.google.com/..." style="background-color: #ffffff !important; color: #000000 !important;">
                              </div>
                              <div>
                                <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Jam Operasional</label>
                                <input [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" placeholder="09.00 - 21.00 WIB" style="background-color: #ffffff !important; color: #000000 !important;">
                              </div>
                           </div>
                       </div>
                   </div>
                }

                <!-- INTRO EDITOR -->
                @if (currentView() === 'intro') {
                   <div class="animate-fade-in space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm pb-10">
                      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                         <input type="checkbox" [(ngModel)]="config().intro.enabled" id="introToggle" class="w-6 h-6 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer"> 
                         <label for="introToggle" class="text-base font-bold text-gray-800 cursor-pointer select-none">Aktifkan Video Intro (Splash Screen)</label>
                      </div>
                      
                      <div class="grid md:grid-cols-2 gap-8">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Efek Animasi Keluar</label>
                          <select [(ngModel)]="config().intro.fadeOut" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" style="background-color: #ffffff !important; color: #000000 !important;">
                              <option value="none">Tidak Ada (Langsung Hilang)</option>
                              <option value="fade">Fade Out (Pudar Perlahan)</option>
                              <option value="slide-up">Slide Up (Geser Naik)</option>
                              <option value="slide-down">Slide Down (Geser Turun)</option>
                              <option value="zoom-out">Zoom Out (Mengecil)</option>
                          </select>
                        </div>

                        <div>
                           <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Upload Video</label>
                           <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                              @if (config().intro.videoUrl) {
                                 <video [src]="config().intro.videoUrl" class="h-32 mb-4 rounded shadow bg-black w-full object-cover" controls></video>
                                 <button (click)="config().intro.videoUrl = ''" class="text-red-500 text-xs font-bold hover:underline mb-2">Hapus Video</button>
                              }
                              <input type="file" (change)="onFileSelected($event, 'introVideo')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full" style="background-color: #ffffff !important;">
                           </div>
                        </div>
                      </div>
                   </div>
                }

                <!-- AI EDITOR -->
                @if (currentView() === 'ai') {
                   <div class="animate-fade-in space-y-6 pb-10">
                     <div class="bg-gradient-to-r from-teal-50 to-white p-6 rounded-2xl border border-teal-100 shadow-sm flex items-start gap-4">
                        <div class="p-2 bg-teal-100 text-teal-600 rounded-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                           <h3 class="font-bold text-teal-800">Konfigurasi AI Assistant</h3>
                           <p class="text-sm text-teal-600 mt-1">Atur bagaimana bot menjawab pelanggan. Gunakan bahasa natural untuk instruksi sistem.</p>
                        </div>
                     </div>

                     <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                       <div>
                         <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Instruksi Sistem (Personality & Knowledge)</label>
                         <textarea [(ngModel)]="config().ai.systemInstruction" rows="8" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all font-mono text-sm leading-relaxed" placeholder="Anda adalah asisten..." style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                       </div>
                       
                       <div>
                         <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Pesan Pembuka Chat</label>
                         <input [(ngModel)]="config().ai.initialMessage" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none shadow-sm transition-all" placeholder="Halo! Ada yang bisa saya bantu?" style="background-color: #ffffff !important; color: #000000 !important;">
                       </div>
                     </div>
                   </div>
                }

              </div>

              <!-- Fixed Footer Actions -->
              @if (currentView() !== 'dashboard') {
                <div class="p-6 border-t bg-white sticky bottom-0 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-4 items-center justify-between">
                   <button (click)="currentView.set('dashboard')" class="text-gray-500 hover:text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 order-2 md:order-1">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                     Kembali
                   </button>
                   
                   <button (click)="saveChanges()" class="w-full md:w-auto px-8 py-3 bg-brand-brown text-white rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 transition transform hover:-translate-y-0.5 order-1 md:order-2 flex items-center justify-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                     Simpan Perubahan
                   </button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    /* Custom Scrollbar for the panel */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  isOpen = signal(false);
  isAuthenticated = signal(false);
  passwordInput = signal('');
  showPassword = signal(false);
  loginError = signal('');
  
  currentView = signal<'dashboard'|'design'|'menu'|'kontak'|'intro'|'ai'>('dashboard');
  
  designSection = signal<'global'|'hero'|'about'|'menuPage'|'reservation'|'locationPage'|'footer'>('global');
  selectedBranchIndex = signal(0);
  currentYear = new Date().getFullYear();

  activeConfig = computed(() => {
    const section = this.designSection();
    const c: any = this.config();
    return c[section];
  });

  activeStyle = computed(() => {
    const section = this.designSection();
    if (section === 'global') return null;
    const c: any = this.config();
    return c[section]?.style;
  });

  hasProp(obj: any, prop: string): boolean {
    return obj && Object.prototype.hasOwnProperty.call(obj, prop);
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    // Toggle admin-mode on body to restore default cursor
    if (this.isOpen()) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
  
  getTitle(): string {
    const map: any = {
      'dashboard': 'Panel Admin',
      'design': 'Editor Desain',
      'menu': 'Manajemen Menu',
      'kontak': 'Info Cabang',
      'intro': 'Splash Screen',
      'ai': 'AI Config'
    };
    return map[this.currentView()] || 'Admin Area';
  }

  login() {
    if (this.passwordInput() === 'admin123') this.isAuthenticated.set(true);
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentView.set('dashboard');
    this.passwordInput.set('');
  }

  saveChanges() {
    this.configService.updateConfig({...this.config()});
    alert('Pengaturan berhasil disimpan!');
  }

  onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;
     const reader = new FileReader();
     reader.onload = (e: any) => {
        const res = e.target.result;
        const c = this.config();
        
        if (type === 'logo') c.global.logoImage = res;
        if (type === 'heroBg') c.hero.bgImage = res;
        if (type === 'aboutImage') c.about.image = res;
        if (type === 'introVideo') c.intro.videoUrl = res;
        if (type === 'branchMap') c.branches[this.selectedBranchIndex()].mapImage = res;
        if (type === 'menuItem' && typeof index === 'number') {
           c.branches[this.selectedBranchIndex()].menu[index].image = res;
        }
        this.configService.updateConfig({...c});
     };
     reader.readAsDataURL(file);
  }

  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({
       name: 'Menu Baru', desc: '', price: 'Rp 0', category: 'Umum', image: 'https://picsum.photos/200'
    });
  }
  removeMenuItem(i: number) {
    if(confirm('Hapus menu ini?')) {
      this.config().branches[this.selectedBranchIndex()].menu.splice(i, 1);
    }
  }

  addBranch() {
    const newBranch: Branch = {
      id: 'cabang-' + Date.now(),
      name: 'Cabang Baru',
      address: '',
      googleMapsUrl: '',
      phone: '',
      whatsappNumber: '',
      hours: '09.00 - 21.00',
      mapImage: 'https://picsum.photos/seed/mapNew/400/300',
      menu: []
    };
    this.config().branches.push(newBranch);
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }

  removeBranch() {
    if (this.config().branches.length <= 1) {
      alert('Minimal harus ada satu cabang!');
      return;
    }
    if (confirm('Yakin ingin menghapus cabang ini? Data menu di cabang ini juga akan hilang.')) {
      this.config().branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
    }
  }
}
