
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial } from '../services/config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-none hover:shadow-2xl opacity-5 hover:opacity-100 transition-all duration-500 hover:scale-110 border border-transparent hover:border-gray-500 group"
      title="Admin Panel"
    >
      <div class="absolute inset-0 rounded-full border border-white/20"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Global Upload Loading Indicator -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/50 backdrop-blur flex items-center justify-center flex-col text-white">
         <svg class="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <p class="font-bold">Mengupload ke Server...</p>
      </div>
    }

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
                  
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Login Admin</h2>
                  <p class="text-gray-500 text-sm mt-2 mb-8">Masuk dengan Akun Firebase Anda.</p>
                  
                  <div class="space-y-4">
                      <!-- Email Input -->
                      <div class="relative group">
                        <input 
                          type="email" 
                          [(ngModel)]="emailInput" 
                          placeholder="Email Admin" 
                          class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition shadow-sm group-hover:border-gray-400"
                        >
                      </div>

                      <!-- Password Input -->
                      <div class="relative group">
                        <input 
                          [type]="showPassword() ? 'text' : 'password'" 
                          [(ngModel)]="passwordInput" 
                          placeholder="Password" 
                          class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm pr-10 outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition shadow-sm group-hover:border-gray-400"
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

                      <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50">
                        {{ isLoggingIn() ? 'Memproses...' : 'Masuk Dashboard' }}
                      </button>

                      <div *ngIf="loginError()" class="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">
                        {{ loginError() }}
                      </div>
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

                    <!-- Deployment / Status Card (NEW) -->
                    <button (click)="currentView.set('deployment')" class="md:col-span-2 group relative overflow-hidden bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-700 hover:shadow-lg transition-all text-left">
                       <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       </div>
                       <div class="relative z-10 flex items-center gap-4">
                          <div class="w-14 h-14 rounded-full bg-gray-700 text-green-400 flex items-center justify-center border border-gray-600 group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-lg text-white group-hover:text-green-400 transition-colors">Status & Server</h3>
                            <p class="text-sm text-gray-400 mt-1 max-w-sm">Cek kenapa website "Not Found" di URL asli.</p>
                          </div>
                       </div>
                    </button>

                    <!-- Media Card -->
                    <button (click)="currentView.set('media')" class="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Galeri</h3>
                            <p class="text-xs text-gray-500">Foto & Ulasan</p>
                          </div>
                       </div>
                    </button>

                    <!-- Menu Card -->
                    <button (click)="currentView.set('menu')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Menu</h3>
                            <p class="text-xs text-gray-500">Makanan & Harga</p>
                          </div>
                       </div>
                    </button>

                    <!-- Cabang Card -->
                    <button (click)="currentView.set('kontak')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Lokasi</h3>
                            <p class="text-xs text-gray-500">Info Cabang</p>
                          </div>
                       </div>
                    </button>

                    <!-- Video Intro Card -->
                    <button (click)="currentView.set('intro')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Intro</h3>
                            <p class="text-xs text-gray-500">Video Splash</p>
                          </div>
                       </div>
                    </button>
                    
                    <!-- AI -->
                     <button (click)="currentView.set('ai')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">AI Bot</h3>
                            <p class="text-xs text-gray-500">Config AI</p>
                          </div>
                       </div>
                    </button>

                  </div>
                }

                <!-- NEW: DEPLOYMENT HELP VIEW -->
                @if (currentView() === 'deployment') {
                  <div class="animate-fade-in space-y-8">
                     <div class="bg-gray-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-8 opacity-10">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-48 w-48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>
                        </div>
                        
                        <div class="relative z-10">
                          <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
                             <span class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                             Status Website: Development Mode
                          </h2>
                          <p class="text-gray-300 mb-6 max-w-lg leading-relaxed">
                             Website ini sekarang berjalan di <strong>Local Preview</strong> (komputer/browser kamu).
                             Jika kamu membuka link <code>sate-maranggi-app.firebaseapp.com</code> dan melihat error "Site Not Found", itu wajar!
                          </p>
                          
                          <div class="bg-black/30 p-4 rounded-xl border border-gray-700 mb-6">
                             <h4 class="font-bold text-yellow-400 mb-2">Kenapa "Site Not Found"?</h4>
                             <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                                <li>Kode website belum dikirim (deploy) ke server Firebase Hosting.</li>
                                <li>Yang kamu lihat sekarang adalah preview editor, bukan website live.</li>
                                <li>Kamu bisa mengedit konten di sini, tapi pengunjung belum bisa melihatnya di URL asli.</li>
                             </ul>
                          </div>

                          <div class="space-y-4">
                             <h3 class="font-bold text-lg">Cara Membuat Website Online:</h3>
                             <p class="text-sm text-gray-400">Jalankan perintah ini di Terminal (Command Prompt):</p>
                             
                             <div class="bg-black p-4 rounded-lg font-mono text-xs text-green-400 border border-gray-700">
                                1. Login Firebase<br>
                                <span class="text-white">$ firebase login</span><br><br>
                                
                                2. Build Project (Membuat file siap pakai)<br>
                                <span class="text-white">$ npm run build</span><br><br>
                                
                                3. Deploy (Kirim ke internet)<br>
                                <span class="text-white">$ firebase deploy --only hosting</span>
                             </div>
                             
                             <p class="text-xs text-gray-500 italic mt-2">
                                *Pastikan kamu sudah menginstall Firebase CLI dan memiliki akses owner ke project ini.
                             </p>
                          </div>
                        </div>
                     </div>
                  </div>
                }

                <!-- NEW: MEDIA EDITOR (Gallery & Testimonial) -->
                @if (currentView() === 'media') {
                  <div class="animate-fade-in space-y-8">
                     <!-- Gallery Section -->
                     <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <div class="border-b pb-4 flex justify-between items-center">
                          <div>
                            <h3 class="font-bold text-lg text-gray-800">Galeri Foto</h3>
                            <p class="text-sm text-gray-500">Tampil di halaman utama.</p>
                          </div>
                          <label class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition">
                             + Upload Foto
                             <input type="file" (change)="onFileSelected($event, 'gallery')" class="hidden" accept="image/*">
                          </label>
                        </div>

                        @if (config().gallery && config().gallery.length > 0) {
                           <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
                              @for (img of config().gallery; track $index) {
                                <div class="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                   <img [src]="img" class="w-full h-full object-cover">
                                   <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                      <button (click)="removeGalleryImage($index)" class="bg-red-600 text-white p-2 rounded-full hover:scale-110 transition">
                                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                      </button>
                                   </div>
                                </div>
                              }
                           </div>
                        } @else {
                           <div class="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                              Belum ada foto. Upload sekarang!
                           </div>
                        }
                     </div>

                     <!-- Testimonials Section -->
                     <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <div class="border-b pb-4 flex justify-between items-center">
                          <div>
                            <h3 class="font-bold text-lg text-gray-800">Testimoni Pelanggan</h3>
                            <p class="text-sm text-gray-500">Ulasan yang ditampilkan.</p>
                          </div>
                          <button (click)="addTestimonial()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                             + Tambah Review
                          </button>
                        </div>

                        <div class="space-y-4">
                           @if (config().testimonials && config().testimonials.length > 0) {
                              @for (t of config().testimonials; track $index) {
                                 <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div>
                                          <label class="text-xs font-bold text-gray-500 uppercase">Nama</label>
                                          <input [(ngModel)]="t.name" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm font-bold">
                                       </div>
                                       <div>
                                          <label class="text-xs font-bold text-gray-500 uppercase">Role / Status</label>
                                          <input [(ngModel)]="t.role" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                                       </div>
                                    </div>
                                    <div class="mt-2">
                                       <label class="text-xs font-bold text-gray-500 uppercase">Isi Review</label>
                                       <textarea [(ngModel)]="t.text" rows="2" class="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"></textarea>
                                    </div>
                                    <div class="mt-2 flex items-center gap-2">
                                       <label class="text-xs font-bold text-gray-500 uppercase">Rating (1-5)</label>
                                       <input type="number" [(ngModel)]="t.rating" min="1" max="5" class="w-20 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-bold">
                                    </div>
                                    
                                    <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-500 opacity-20 group-hover:opacity-100 transition">
                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                    </button>
                                 </div>
                              }
                           } @else {
                              <div class="text-center py-6 text-gray-400 italic">Belum ada review.</div>
                           }
                        </div>
                     </div>
                  </div>
                }

                <!-- EXISTING DESIGN EDITOR -->
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
                           <!-- ... Identitas Brand fields ... -->
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
                             
                             <!-- ... rest of dynamic editor ... -->
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
                           
                           <!-- ... Style Card ... -->
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

                <!-- INTRO EDITOR (Partial snippet) -->
                @if (currentView() === 'intro') {
                   <div class="animate-fade-in space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm pb-10">
                      <!-- ... settings ... -->
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
  isAuthenticated = this.configService.isAdmin;
  
  isOpen = signal(false);
  emailInput = signal('');
  passwordInput = signal('');
  showPassword = signal(false);
  isLoggingIn = signal(false);
  isUploading = signal(false);
  loginError = signal('');
  
  // NEW: Added 'deployment' to type
  currentView = signal<'dashboard'|'design'|'media'|'menu'|'kontak'|'intro'|'ai'|'deployment'>('dashboard');
  
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
      'media': 'Galeri & Ulasan',
      'menu': 'Manajemen Menu',
      'kontak': 'Info Cabang',
      'intro': 'Splash Screen',
      'ai': 'AI Config',
      'deployment': 'Status Server' // NEW
    };
    return map[this.currentView()] || 'Admin Area';
  }

  async login() {
    if (!this.emailInput() || !this.passwordInput()) {
      this.loginError.set('Isi email dan password.');
      return;
    }

    this.isLoggingIn.set(true);
    this.loginError.set('');

    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.currentView.set('dashboard');
      this.passwordInput.set('');
      this.emailInput.set('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        this.loginError.set('Email atau password salah.');
      } else if (err.code === 'auth/too-many-requests') {
        this.loginError.set('Terlalu banyak percobaan. Coba nanti.');
      } else if (err.code === 'auth/operation-not-allowed') {
        this.loginError.set('Login Email belum diaktifkan di Firebase Console!');
      } else {
        this.loginError.set('Gagal login: ' + err.message);
      }
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    await this.configService.logoutAdmin();
    this.currentView.set('dashboard');
  }

  async saveChanges() {
    await this.configService.updateConfig({...this.config()});
    alert('Pengaturan berhasil disimpan ke Database!');
  }

  // UPDATED: Use ConfigService Upload Logic
  async onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;

     this.isUploading.set(true); // Show loading spinner
     
     try {
       // Upload to Firebase Storage via service
       const url = await this.configService.uploadFile(file, 'uploads');
       
       if (!url) {
         this.isUploading.set(false);
         return; // config not set
       }

       // Update Config with new URL
       const c = this.config();
       
       if (type === 'logo') c.global.logoImage = url;
       if (type === 'heroBg') c.hero.bgImage = url;
       if (type === 'aboutImage') c.about.image = url;
       if (type === 'introVideo') c.intro.videoUrl = url;
       if (type === 'branchMap') c.branches[this.selectedBranchIndex()].mapImage = url;
       if (type === 'menuItem' && typeof index === 'number') {
          c.branches[this.selectedBranchIndex()].menu[index].image = url;
       }
       // NEW: Gallery
       if (type === 'gallery') {
          if (!c.gallery) c.gallery = [];
          c.gallery.push(url);
       }
       
       // Update UI (don't save to DB yet until user clicks Save)
       this.config.set({...c});

     } catch (err) {
       console.error(err);
       // Error handled in service (alerts user)
     } finally {
       this.isUploading.set(false); // Hide loading spinner
     }
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

  // NEW: Gallery & Testimonial Logic
  removeGalleryImage(index: number) {
    if(confirm('Hapus foto ini dari galeri?')) {
      this.config().gallery.splice(index, 1);
    }
  }

  addTestimonial() {
    if (!this.config().testimonials) this.config.update(c => ({...c, testimonials: []}));
    this.config().testimonials.push({
      name: 'Pelanggan Baru',
      text: 'Masukan ulasan pelanggan disini...',
      rating: 5,
      role: 'Pelanggan'
    });
  }

  removeTestimonial(index: number) {
    if(confirm('Hapus testimoni ini?')) {
      this.config().testimonials.splice(index, 1);
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
