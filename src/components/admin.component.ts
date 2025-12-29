
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial, FirebaseConfig } from '../services/config.service';

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
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900 animate-ping"></span>
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900"></span>
      }
      <div class="absolute inset-0 rounded-full border border-white/20"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Global Upload Indicator -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-brand-orange border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah & Mengompres...</p>
      </div>
    }

    <!-- Main Panel -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto font-sans">
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative w-full max-w-4xl bg-gray-50 h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
          
          <!-- Top Bar -->
          <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
             <div class="flex items-center gap-4">
                <button *ngIf="currentView() !== 'dashboard'" (click)="currentView.set('dashboard')" class="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                   <h2 class="text-xl font-bold text-gray-900 tracking-tight">{{ getTitle() }}</h2>
                   <div class="flex items-center gap-2 text-xs font-medium">
                     @if(firestoreError()) { 
                       <span class="text-red-600 bg-red-100 px-2 py-0.5 rounded">⚠ Terputus (Permission Denied)</span> 
                     } @else { 
                       <span class="text-green-600 flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-full"></span> Terhubung ke Database</span> 
                     }
                   </div>
                </div>
             </div>
             
             <div class="flex items-center gap-3">
                @if (isAuthenticated()) {
                  <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Simpan Perubahan
                  </button>
                  <button (click)="logout()" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 transition">Log Out</button>
                }
                <button (click)="togglePanel()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500">✕</button>
             </div>
          </div>

          <!-- Alert Error -->
          @if (firestoreError()) {
            <div class="bg-red-50 border-b border-red-200 p-4">
              <div class="flex gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <div>
                   <h4 class="font-bold text-red-800 text-sm">Masalah Izin Database</h4>
                   <p class="text-red-600 text-xs mt-1">Anda belum mengupload Rules yang benar di Firebase Console. Copy code dari file 'firestore.rules' ke tab Rules di Firebase.</p>
                 </div>
              </div>
            </div>
          }

          <div class="flex-1 overflow-y-auto p-0 bg-gray-50">
            @if (!isAuthenticated()) {
              <!-- LOGIN SCREEN -->
              <div class="flex flex-col items-center justify-center h-full p-8 space-y-6">
                 <div class="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center text-3xl">🔐</div>
                 <h2 class="text-2xl font-bold text-gray-800">Login Administrator</h2>
                 <div class="w-full max-w-sm space-y-4">
                    <input type="email" [(ngModel)]="emailInput" placeholder="Email Admin" class="input">
                    <input type="password" [(ngModel)]="passwordInput" placeholder="Password" class="input">
                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow hover:bg-blue-700 transition disabled:opacity-50">
                      {{ isLoggingIn() ? 'Memproses...' : 'Masuk Dashboard' }}
                    </button>
                    <p class="text-red-500 text-xs font-bold text-center" *ngIf="loginError()">{{ loginError() }}</p>
                    <div class="border-t pt-4 text-center">
                       <button (click)="currentView.set('setup')" class="text-gray-400 text-xs hover:text-gray-600">Konfigurasi API Key</button>
                    </div>
                 </div>
              </div>

            } @else {
              
              <!-- DASHBOARD GRID -->
              @if (currentView() === 'dashboard') {
                <div class="p-6">
                   <h3 class="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Menu Utama</h3>
                   <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <!-- 1. Desain & Tampilan -->
                      <div (click)="currentView.set('design')" class="card-menu group">
                         <div class="icon-bg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">🎨</div>
                         <h4 class="font-bold">Tampilan</h4>
                         <p class="desc">Logo, Warna, Font, Intro</p>
                      </div>
                      
                      <!-- 2. Menu Makanan -->
                      <div (click)="currentView.set('menu')" class="card-menu group">
                         <div class="icon-bg bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">🍱</div>
                         <h4 class="font-bold">Menu Makanan</h4>
                         <p class="desc">Produk, Harga, Foto</p>
                      </div>
                      
                      <!-- 3. Galeri & Testimoni -->
                      <div (click)="currentView.set('media')" class="card-menu group">
                         <div class="icon-bg bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white">📸</div>
                         <h4 class="font-bold">Galeri & Review</h4>
                         <p class="desc">Foto IG & Testimoni</p>
                      </div>

                      <!-- 4. Cabang & Lokasi -->
                      <div (click)="currentView.set('kontak')" class="card-menu group">
                         <div class="icon-bg bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white">📍</div>
                         <h4 class="font-bold">Cabang</h4>
                         <p class="desc">Alamat, Maps, WA</p>
                      </div>
                   </div>

                   <h3 class="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Pengaturan Lanjutan</h3>
                   <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <!-- 5. AI Assistant -->
                      <div (click)="currentView.set('ai')" class="card-menu group">
                         <div class="icon-bg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white">🤖</div>
                         <h4 class="font-bold">AI Assistant</h4>
                         <p class="desc">Prompt & Kepribadian</p>
                      </div>

                      <!-- 6. Reservasi Logic -->
                      <div (click)="currentView.set('logic')" class="card-menu group">
                         <div class="icon-bg bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white">⚙️</div>
                         <h4 class="font-bold">Logika Reservasi</h4>
                         <p class="desc">Min Pax, Mode Puasa</p>
                      </div>

                      <!-- 7. Footer & Social -->
                      <div (click)="currentView.set('social')" class="card-menu group">
                         <div class="icon-bg bg-gray-100 text-gray-600 group-hover:bg-gray-800 group-hover:text-white">🔗</div>
                         <h4 class="font-bold">Sosial Media</h4>
                         <p class="desc">Link Footer & Copyright</p>
                      </div>
                      
                      <!-- 8. Database -->
                      <div (click)="currentView.set('setup')" class="card-menu group">
                         <div class="icon-bg bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white">🔥</div>
                         <h4 class="font-bold">Database</h4>
                         <p class="desc">API Key & Config</p>
                      </div>
                   </div>
                </div>
              }

              <!-- 1. EDITOR DESAIN (Lengkap) -->
              @if (currentView() === 'design') {
                <div class="p-6 space-y-8">
                   <!-- Intro / Splash Screen -->
                   <div class="section-box">
                      <h4 class="section-title">Splash Screen (Intro Video)</h4>
                      <div class="flex items-center gap-4 mb-4">
                         <label class="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1 rounded">
                            <input type="checkbox" [(ngModel)]="config().intro.enabled" class="rounded">
                            <span class="text-sm font-bold">Aktifkan Intro</span>
                         </label>
                      </div>
                      
                      @if(config().intro.enabled) {
                        <div class="grid grid-cols-2 gap-4 animate-fade-in">
                           <div>
                              <label class="label">Video Intro (URL / Upload)</label>
                              <input type="file" (change)="onFileSelected($event, 'introVideo')" class="input text-xs mb-1">
                              <input type="text" [(ngModel)]="config().intro.videoUrl" placeholder="https://..." class="input">
                           </div>
                           <div>
                              <label class="label">Durasi (Detik)</label>
                              <input type="number" [(ngModel)]="config().intro.duration" class="input">
                           </div>
                           <div>
                              <label class="label">Efek Keluar</label>
                              <select [(ngModel)]="config().intro.fadeOut" class="input bg-white">
                                 <option value="fade">Fade Out</option>
                                 <option value="slide-up">Slide Up</option>
                                 <option value="slide-down">Slide Down</option>
                                 <option value="zoom-out">Zoom Out</option>
                                 <option value="none">Langsung Hilang</option>
                              </select>
                           </div>
                        </div>
                      }
                   </div>

                   <!-- Typography -->
                   <div class="section-box">
                      <h4 class="section-title">Tipografi & Font</h4>
                      <div class="grid grid-cols-2 gap-4">
                         <div>
                            <label class="label">Font Judul (Heading)</label>
                            <select [(ngModel)]="config().hero.style.fontFamily" class="input bg-white font-bold">
                               <option value="Playfair Display">Playfair Display (Serif)</option>
                               <option value="Oswald">Oswald (Condensed)</option>
                               <option value="Montserrat">Montserrat (Modern)</option>
                               <option value="Lora">Lora (Elegant)</option>
                            </select>
                         </div>
                         <div>
                            <label class="label">Font Teks (Body)</label>
                            <select [(ngModel)]="config().about.style.fontFamily" class="input bg-white">
                               <option value="Lato">Lato (Clean)</option>
                               <option value="Open Sans">Open Sans (Neutral)</option>
                               <option value="Roboto">Roboto (Standard)</option>
                               <option value="Source Sans Pro">Source Sans Pro</option>
                            </select>
                         </div>
                      </div>
                      <p class="text-xs text-gray-400 mt-2">*Perubahan font akan diterapkan setelah disimpan & refresh.</p>
                   </div>

                   <!-- Navbar & Logo -->
                   <div class="section-box">
                      <h4 class="section-title">Navbar & Logo</h4>
                      <div class="grid grid-cols-2 gap-4">
                         <div><label class="label">Teks Logo</label><input type="text" [(ngModel)]="config().global.logoText" class="input"></div>
                         <div><label class="label">Warna Navbar</label><input type="color" [(ngModel)]="config().global.navbarColor" class="w-full h-10"></div>
                         <div><label class="label">Warna Teks Navbar</label><input type="color" [(ngModel)]="config().global.navbarTextColor" class="w-full h-10"></div>
                         <div>
                            <label class="label">Upload Logo (Image/Video)</label>
                            <input type="file" (change)="onFileSelected($event, 'logo')" class="input text-xs">
                         </div>
                      </div>
                   </div>

                   <!-- Hero Section -->
                   <div class="section-box">
                      <h4 class="section-title">Halaman Utama (Hero)</h4>
                      <div class="space-y-3">
                         <div><label class="label">Judul Utama</label><input type="text" [(ngModel)]="config().hero.title" class="input text-lg font-bold"></div>
                         <div><label class="label">Teks Highlight (Berwarna)</label><input type="text" [(ngModel)]="config().hero.highlight" class="input text-orange-600 font-bold"></div>
                         <div><label class="label">Sub Judul</label><textarea [(ngModel)]="config().hero.subtitle" class="input h-20"></textarea></div>
                         <div>
                            <label class="label">Background Hero (Gambar/Video)</label>
                            <input type="file" (change)="onFileSelected($event, 'heroBg')" class="input text-xs mb-2">
                            <div class="h-24 bg-gray-100 rounded overflow-hidden">
                               <img *ngIf="!isVideo(config().hero.bgImage)" [src]="config().hero.bgImage" class="w-full h-full object-cover">
                               <video *ngIf="isVideo(config().hero.bgImage)" [src]="config().hero.bgImage" class="w-full h-full object-cover"></video>
                            </div>
                         </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div><label class="label">Warna Dominan</label><input type="color" [(ngModel)]="config().hero.style.backgroundColor" class="w-full h-10"></div>
                            <div><label class="label">Warna Aksen</label><input type="color" [(ngModel)]="config().hero.style.accentColor" class="w-full h-10"></div>
                         </div>
                      </div>
                   </div>
                </div>
              }

              <!-- 2. EDITOR MENU (Lengkap) -->
              @if (currentView() === 'menu') {
                <div class="p-6 h-full flex flex-col">
                   <!-- Branch Selector Tabs -->
                   <div class="flex overflow-x-auto gap-2 pb-4 border-b">
                      @for (branch of config().branches; track $index) {
                         <button (click)="selectedBranchIndex.set($index)" 
                            class="px-4 py-2 rounded-lg whitespace-nowrap text-sm font-bold border transition"
                            [class.bg-gray-800]="selectedBranchIndex() === $index"
                            [class.text-white]="selectedBranchIndex() === $index"
                            [class.bg-white]="selectedBranchIndex() !== $index">
                            {{ branch.name }}
                         </button>
                      }
                   </div>

                   <div class="flex-1 overflow-y-auto pt-4 space-y-4">
                      <div class="flex justify-between items-center">
                         <h4 class="font-bold text-lg">Daftar Menu</h4>
                         <button (click)="addMenuItem()" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center gap-2">
                           <span>+</span> Tambah Menu
                         </button>
                      </div>
                      
                      @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                         <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start group hover:border-blue-300 transition relative">
                            <!-- Image -->
                            <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer hover:opacity-80 transition">
                               <img [src]="item.image" class="w-full h-full object-cover">
                               <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="absolute inset-0 opacity-0 cursor-pointer" title="Ganti Foto">
                            </div>
                            
                            <!-- Fields -->
                            <div class="flex-1 grid gap-2">
                               <div class="flex gap-2">
                                  <input type="text" [(ngModel)]="item.name" class="input font-bold" placeholder="Nama Makanan">
                                  <input type="text" [(ngModel)]="item.price" class="input w-32 text-right" placeholder="Harga (Rp)">
                               </div>
                               <textarea [(ngModel)]="item.desc" class="input text-xs h-12 resize-none" placeholder="Deskripsi pendek..."></textarea>
                               
                               <div class="flex gap-3 items-center mt-1">
                                  <input type="text" [(ngModel)]="item.category" class="input text-xs w-1/3" placeholder="Kategori (e.g Sate)">
                                  <label class="flex items-center gap-2 cursor-pointer bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                     <input type="checkbox" [(ngModel)]="item.favorite">
                                     <span class="text-xs font-bold text-yellow-700">⭐ Favorite / Best Seller</span>
                                  </label>
                               </div>
                            </div>

                            <!-- Delete -->
                            <button (click)="removeMenuItem($index)" class="text-gray-300 hover:text-red-500 transition p-2">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                         </div>
                      }
                   </div>
                </div>
              }

              <!-- 3. SOCIAL & FOOTER -->
              @if (currentView() === 'social') {
                <div class="p-6 space-y-6">
                   <div class="section-box">
                      <h4 class="section-title">Link Sosial Media (Footer)</h4>
                      <div class="space-y-3">
                         <div>
                            <label class="label flex items-center gap-2"><span class="text-blue-600">Facebook</span> URL</label>
                            <input type="text" [(ngModel)]="config().footer.facebookLink" class="input">
                         </div>
                         <div>
                            <label class="label flex items-center gap-2"><span class="text-pink-600">Instagram</span> URL</label>
                            <input type="text" [(ngModel)]="config().footer.instagramLink" class="input">
                         </div>
                         <div>
                            <label class="label flex items-center gap-2"><span class="text-black">TikTok</span> URL</label>
                            <input type="text" [(ngModel)]="config().footer.tiktokLink" class="input">
                         </div>
                      </div>
                   </div>
                   
                   <div class="section-box">
                      <h4 class="section-title">Tampilan Footer</h4>
                      <div class="grid grid-cols-2 gap-4">
                         <div><label class="label">Background Footer</label><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="w-full h-10"></div>
                         <div><label class="label">Warna Teks</label><input type="color" [(ngModel)]="config().footer.style.textColor" class="w-full h-10"></div>
                      </div>
                   </div>
                </div>
              }

              <!-- 4. LOGIKA RESERVASI -->
              @if (currentView() === 'logic') {
                 <div class="p-6 space-y-6">
                    <div class="section-box">
                       <h4 class="section-title">Aturan Reservasi</h4>
                       <p class="text-sm text-gray-500 mb-4">Pengaturan ini mempengaruhi validasi di formulir reservasi pelanggan.</p>
                       <div class="grid grid-cols-2 gap-6">
                          <div>
                             <label class="label">Min. Pax (Reguler)</label>
                             <input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="input text-lg font-bold">
                             <p class="text-xs text-gray-400 mt-1">Minimal orang untuk hari biasa.</p>
                          </div>
                          <div>
                             <label class="label">Min. Pax (Buka Puasa)</label>
                             <input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="input text-lg font-bold">
                             <p class="text-xs text-gray-400 mt-1">Minimal orang jika mode Ramadhan aktif.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              }

              <!-- 5. AI ASSISTANT CONFIG -->
              @if (currentView() === 'ai') {
                 <div class="p-6 space-y-6">
                    <div class="section-box border-purple-200 bg-purple-50">
                       <h4 class="section-title text-purple-900">Kepribadian AI (Persona)</h4>
                       <div>
                          <label class="label">Instruksi Sistem (System Prompt)</label>
                          <textarea [(ngModel)]="config().ai.systemInstruction" class="input h-40 font-mono text-sm" placeholder="Contoh: Kamu adalah pelayan ramah bernama Maya..."></textarea>
                          <p class="text-xs text-gray-500 mt-2">Jelaskan bagaimana AI harus menjawab, nada bicara, dan informasi apa yang boleh diberikan.</p>
                       </div>
                    </div>
                    
                    <div class="section-box">
                       <h4 class="section-title">Sapaan Awal</h4>
                       <div>
                          <label class="label">Pesan Pembuka (Bubble Chat)</label>
                          <input type="text" [(ngModel)]="config().ai.initialMessage" class="input">
                       </div>
                    </div>
                 </div>
              }

              <!-- 6. CABANG & LOKASI -->
              @if (currentView() === 'kontak') {
                 <div class="p-6 space-y-6">
                    <div class="flex justify-between items-center mb-4">
                       <div class="flex overflow-x-auto gap-2">
                          @for (branch of config().branches; track $index) {
                             <button (click)="selectedBranchIndex.set($index)" 
                                class="px-4 py-2 rounded border text-sm font-bold"
                                [class.bg-gray-800]="selectedBranchIndex() === $index"
                                [class.text-white]="selectedBranchIndex() === $index">
                                {{ branch.name }}
                             </button>
                          }
                       </div>
                       <div class="flex gap-2">
                          <button (click)="addBranch()" class="bg-blue-600 text-white px-3 py-1 rounded text-xs">+ Baru</button>
                          <button (click)="removeBranch()" class="bg-red-600 text-white px-3 py-1 rounded text-xs" *ngIf="config().branches.length > 1">Hapus</button>
                       </div>
                    </div>

                    <div class="bg-white p-6 rounded-xl border space-y-4">
                       <div><label class="label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="input font-bold"></div>
                       <div><label class="label">Alamat Lengkap</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="input h-20"></textarea></div>
                       
                       <div class="grid grid-cols-2 gap-4">
                          <div><label class="label">Telepon</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="input"></div>
                          <div><label class="label">WhatsApp (Format: 628...)</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="input font-mono"></div>
                       </div>
                       
                       <div><label class="label">Jam Operasional</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="input" placeholder="09.00 - 22.00 WIB"></div>
                       <div><label class="label">Link Google Maps</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="input text-blue-600 underline"></div>
                       
                       <div>
                          <label class="label">Gambar Peta / Model 3D (.glb)</label>
                          <input type="file" (change)="onFileSelected($event, 'branchMap')" class="input text-xs">
                          <div class="mt-2 h-40 bg-gray-100 rounded overflow-hidden">
                             <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover opacity-80">
                          </div>
                       </div>
                    </div>
                 </div>
              }

              <!-- 7. MEDIA (Galeri & Testimoni) -->
              @if (currentView() === 'media') {
                 <div class="p-6 space-y-8">
                    <!-- Instagram Stats -->
                    <div class="section-box">
                       <h4 class="section-title">Statistik Profil Instagram</h4>
                       <div class="grid grid-cols-3 gap-4">
                          <div><label class="label">Posts</label><input type="text" [(ngModel)]="config().instagramProfile.postsCount" class="input"></div>
                          <div><label class="label">Followers</label><input type="text" [(ngModel)]="config().instagramProfile.followersCount" class="input"></div>
                          <div><label class="label">Following</label><input type="text" [(ngModel)]="config().instagramProfile.followingCount" class="input"></div>
                       </div>
                       <div class="mt-3"><label class="label">Bio Instagram</label><textarea [(ngModel)]="config().instagramProfile.bio" class="input"></textarea></div>
                    </div>

                    <!-- Gallery Upload -->
                    <div class="section-box">
                       <h4 class="section-title">Galeri Foto</h4>
                       <input type="file" (change)="onFileSelected($event, 'gallery')" class="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                       <div class="grid grid-cols-4 gap-2">
                          @for (img of config().gallery; track $index) {
                             <div class="relative group aspect-square bg-gray-200 rounded overflow-hidden">
                                <img [src]="img" class="w-full h-full object-cover">
                                <button (click)="removeGalleryImage($index)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow">✕</button>
                             </div>
                          }
                       </div>
                    </div>

                    <!-- Testimonials -->
                    <div class="section-box">
                       <div class="flex justify-between items-center mb-4">
                          <h4 class="section-title">Testimoni Pelanggan</h4>
                          <button (click)="addTestimonial()" class="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold">+ Tambah</button>
                       </div>
                       <div class="space-y-4">
                          @for (t of config().testimonials; track $index) {
                             <div class="border p-4 rounded-xl bg-gray-50 relative group hover:bg-white hover:shadow-md transition">
                                <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-lg px-2">×</button>
                                <div class="grid grid-cols-2 gap-2 mb-2">
                                   <input type="text" [(ngModel)]="t.name" class="input font-bold" placeholder="Nama">
                                   <input type="text" [(ngModel)]="t.role" class="input text-xs" placeholder="Role (e.g Food Blogger)">
                                </div>
                                <textarea [(ngModel)]="t.text" class="input text-sm mb-2 h-20" placeholder="Isi ulasan..."></textarea>
                                <div class="flex items-center gap-2">
                                   <span class="text-xs font-bold text-gray-500">Rating:</span>
                                   <input type="number" [(ngModel)]="t.rating" class="input w-16" min="1" max="5">
                                   <span class="text-yellow-500 text-lg">★</span>
                                </div>
                             </div>
                          }
                       </div>
                    </div>
                 </div>
              }

              <!-- 8. SETUP DATABASE -->
              @if (currentView() === 'setup') {
                 <div class="p-6">
                    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
                      <h3 class="text-2xl font-bold mb-6 flex items-center gap-2">
                         <span class="text-orange-500">🔥</span> Konfigurasi Firebase
                      </h3>
                      <div class="space-y-4">
                         <div><label class="label">API Key</label><input type="text" [(ngModel)]="tempConfig.apiKey" class="input bg-gray-50 font-mono"></div>
                         <div><label class="label">Auth Domain</label><input type="text" [(ngModel)]="tempConfig.authDomain" class="input bg-gray-50 font-mono"></div>
                         <div><label class="label">Project ID</label><input type="text" [(ngModel)]="tempConfig.projectId" class="input bg-gray-50 font-mono font-bold text-blue-600 border-blue-300"></div>
                         <div><label class="label">Storage Bucket</label><input type="text" [(ngModel)]="tempConfig.storageBucket" class="input bg-gray-50 font-mono"></div>
                         <div><label class="label">Messaging Sender ID</label><input type="text" [(ngModel)]="tempConfig.messagingSenderId" class="input bg-gray-50 font-mono"></div>
                         <div><label class="label">App ID</label><input type="text" [(ngModel)]="tempConfig.appId" class="input bg-gray-50 font-mono"></div>
                      </div>
                      <div class="flex gap-4 pt-6 mt-6 border-t">
                         <button (click)="saveFirebaseSetup()" class="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 shadow flex-1">Simpan & Reload Website</button>
                         <button (click)="resetFirebaseSetup()" class="text-red-500 font-bold text-sm px-4 hover:bg-red-50 rounded">Reset Default</button>
                      </div>
                    </div>
                 </div>
              }

            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .label { display: block; font-size: 0.7rem; font-weight: 800; color: #6b7280; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.6rem; font-size: 0.9rem; transition: all 0.2s; }
    .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .card-menu { background: white; border: 1px solid #e5e7eb; padding: 1.25rem; border-radius: 1rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .card-menu:hover { border-color: #d1d5db; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }
    .icon-bg { width: 3rem; height: 3rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem; transition: all 0.2s; }
    .desc { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
    .section-box { background: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; }
    .section-title { font-weight: 800; font-size: 1rem; color: #1f2937; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f3f4f6; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  isAuthenticated = this.configService.isAdmin;
  isFirebaseReady = this.configService.isFirebaseReady;
  firestoreError = this.configService.firestoreError;
  
  isOpen = signal(false);
  emailInput = signal('');
  passwordInput = signal('');
  isLoggingIn = signal(false);
  isUploading = signal(false);
  loginError = signal('');
  
  // Expanded Views
  currentView = signal<'dashboard'|'design'|'media'|'menu'|'kontak'|'setup'|'ai'|'logic'|'social'>('dashboard');
  selectedBranchIndex = signal(0);
  
  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) document.body.classList.add('admin-mode');
    else document.body.classList.remove('admin-mode');
  }

  getTitle() {
     const t = this.currentView();
     const map: Record<string, string> = {
       dashboard: 'Panel Admin',
       design: 'Desain & Tampilan',
       media: 'Galeri & Testimoni',
       menu: 'Manajemen Menu',
       kontak: 'Cabang & Lokasi',
       setup: 'Database Config',
       ai: 'Konfigurasi AI',
       logic: 'Logika Bisnis',
       social: 'Sosial Media'
     };
     return map[t] || 'Admin';
  }

  async login() {
    if (!this.emailInput() || !this.passwordInput()) return;
    this.isLoggingIn.set(true);
    this.loginError.set('');
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.currentView.set('dashboard');
    } catch (err: any) {
      this.loginError.set("Gagal Login: " + err.message);
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
  }

  saveFirebaseSetup() { this.configService.saveStoredFirebaseConfig(this.tempConfig); }
  resetFirebaseSetup() { if(confirm('Kembali ke database default?')) this.configService.resetStoredFirebaseConfig(); }

  // Generic File Uploader
  async onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;
     this.isUploading.set(true); 
     try {
       const url = await this.configService.uploadFile(file);
       const c = this.config();
       
       if (type === 'logo') c.global.logoImage = url;
       if (type === 'heroBg') c.hero.bgImage = url;
       if (type === 'aboutImage') c.about.image = url;
       if (type === 'introVideo') c.intro.videoUrl = url;
       
       if (type === 'branchMap') c.branches[this.selectedBranchIndex()].mapImage = url;
       if (type === 'menuItem' && typeof index === 'number') c.branches[this.selectedBranchIndex()].menu[index].image = url;
       
       if (type === 'gallery') { if(!c.gallery) c.gallery = []; c.gallery.push(url); }
       
       this.config.set({...c});
     } catch (err: any) { alert("Error upload: " + err.message); } 
     finally { this.isUploading.set(false); }
  }

  isVideo(url: string) { return this.configService.isVideo(url); }

  // --- CRUD HELPERS ---
  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({ name: 'Menu Baru', desc: '', price: 'Rp 25.000', category: 'Umum', image: 'https://picsum.photos/200', favorite: false });
  }
  removeMenuItem(i: number) { if(confirm('Hapus menu ini?')) this.config().branches[this.selectedBranchIndex()].menu.splice(i, 1); }
  
  removeGalleryImage(i: number) { if(confirm('Hapus foto ini?')) this.config().gallery.splice(i, 1); }
  
  addTestimonial() { 
     if(!this.config().testimonials) this.config.update(c => ({...c, testimonials: []}));
     this.config().testimonials.push({ name: 'Pelanggan', text: 'Makanannya enak...', rating: 5, role: 'Foodie' }); 
  }
  removeTestimonial(i: number) { if(confirm('Hapus testimoni ini?')) this.config().testimonials.splice(i, 1); }
  
  addBranch() {
    this.config().branches.push({ id: 'b-'+Date.now(), name: 'Cabang Baru', address: '', googleMapsUrl: '', phone: '', whatsappNumber: '', hours: '', mapImage: 'https://picsum.photos/400/300', menu: [] });
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }
  removeBranch() { if(confirm('Hapus cabang ini beserta menunya?')) { this.config().branches.splice(this.selectedBranchIndex(), 1); this.selectedBranchIndex.set(0); } }
}
