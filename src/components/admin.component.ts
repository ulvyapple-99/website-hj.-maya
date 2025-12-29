
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
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-none hover:shadow-2xl opacity-10 hover:opacity-100 transition-all duration-500 hover:scale-110 border border-transparent hover:border-gray-500 group"
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

    <!-- Upload Indicator -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-brand-orange border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah...</p>
      </div>
    }

    <!-- Panel Content -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto font-sans">
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative w-full max-w-6xl bg-gray-50 h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
          
          <!-- Top Bar -->
          <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
             <div class="flex items-center gap-4">
                <h2 class="text-xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
                <div class="flex items-center gap-2 text-xs font-medium">
                  @if(firestoreError()) { 
                    <span class="text-red-600 bg-red-100 px-2 py-0.5 rounded">⚠ Offline</span> 
                  } @else { 
                    <span class="text-green-600 flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-full"></span> Online</span> 
                  }
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

          <div class="flex-1 flex overflow-hidden">
            @if (!isAuthenticated()) {
               <div class="w-full flex flex-col items-center justify-center p-10 space-y-6">
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
                       <button (click)="currentTab.set('database')" class="text-gray-400 text-xs hover:text-gray-600">Konfigurasi API Key</button>
                    </div>
                 </div>
               </div>
            } @else {
               <!-- Sidebar Navigation -->
               <div class="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
                  <nav class="p-4 space-y-1">
                     <button *ngFor="let tab of tabs" (click)="currentTab.set(tab.id)"
                       class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                       [class.bg-gray-100]="currentTab() === tab.id"
                       [class.text-gray-900]="currentTab() === tab.id"
                       [class.text-gray-600]="currentTab() !== tab.id"
                       [class.hover:bg-gray-50]="currentTab() !== tab.id">
                        <span>{{ tab.icon }}</span>
                        {{ tab.label }}
                     </button>
                  </nav>
               </div>

               <!-- Main Content Area -->
               <div class="flex-1 overflow-y-auto p-8 bg-gray-50">
                  
                  <!-- TAB: GLOBAL -->
                  @if (currentTab() === 'global') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Identitas Website</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Nama Website / Logo Text</label><input type="text" [(ngModel)]="config().global.logoText" class="input"></div>
                              <div>
                                 <label class="label">Logo Image</label>
                                 <div class="flex gap-2">
                                    <input type="file" (change)="onFileSelected($event, 'logo')" class="input text-xs">
                                    <button *ngIf="config().global.logoImage" (click)="config().global.logoImage=''" class="text-red-500 text-xs font-bold">Hapus</button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Navbar Style</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Warna Background Navbar</label><input type="color" [(ngModel)]="config().global.navbarColor" class="w-full h-10"></div>
                              <div><label class="label">Warna Teks Navbar</label><input type="color" [(ngModel)]="config().global.navbarTextColor" class="w-full h-10"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Intro Screen (Loading)</h3>
                           <div class="flex items-center gap-2 mb-4">
                              <input type="checkbox" [(ngModel)]="config().intro.enabled" class="w-4 h-4">
                              <span class="font-bold text-sm">Aktifkan Video Intro</span>
                           </div>
                           @if (config().intro.enabled) {
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="label">Video URL</label><input type="text" [(ngModel)]="config().intro.videoUrl" class="input"></div>
                                 <div><label class="label">Upload Video</label><input type="file" (change)="onFileSelected($event, 'introVideo')" class="input text-xs"></div>
                                 <div><label class="label">Durasi (Detik)</label><input type="number" [(ngModel)]="config().intro.duration" class="input"></div>
                                 <div>
                                    <label class="label">Efek Keluar</label>
                                    <select [(ngModel)]="config().intro.fadeOut" class="input bg-white">
                                       <option value="fade">Fade Out</option>
                                       <option value="slide-up">Slide Up</option>
                                       <option value="zoom-out">Zoom Out</option>
                                    </select>
                                 </div>
                              </div>
                           }
                        </div>
                     </div>
                  }

                  <!-- TAB: HERO -->
                  @if (currentTab() === 'hero') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten Utama</h3>
                           <div class="space-y-4">
                              <div><label class="label">Judul Besar (Headline)</label><input type="text" [(ngModel)]="config().hero.title" class="input text-lg font-bold"></div>
                              <div><label class="label">Teks Highlight (Warna Beda)</label><input type="text" [(ngModel)]="config().hero.highlight" class="input text-orange-600 font-bold"></div>
                              <div><label class="label">Sub Judul</label><textarea [(ngModel)]="config().hero.subtitle" class="input h-20"></textarea></div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="label">Teks Tombol 1</label><input type="text" [(ngModel)]="config().hero.buttonText1" class="input"></div>
                                 <div><label class="label">Teks Tombol 2</label><input type="text" [(ngModel)]="config().hero.buttonText2" class="input"></div>
                              </div>
                           </div>
                        </div>
                        
                        <div class="section-box">
                           <h3 class="section-title">Background & Style</h3>
                           <div class="mb-4">
                              <label class="label">Background Image / Video</label>
                              <input type="file" (change)="onFileSelected($event, 'heroBg')" class="input text-xs mb-2">
                              <input type="text" [(ngModel)]="config().hero.bgImage" class="input text-xs text-gray-400" placeholder="URL Gambar">
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color (Fallback)</label><input type="color" [(ngModel)]="config().hero.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().hero.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color (Tombol/Highlight)</label><input type="color" [(ngModel)]="config().hero.style.accentColor" class="w-full h-10"></div>
                              <div>
                                 <label class="label">Font Family</label>
                                 <select [(ngModel)]="config().hero.style.fontFamily" class="input bg-white">
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Oswald">Oswald</option>
                                    <option value="Montserrat">Montserrat</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: ABOUT -->
                  @if (currentTab() === 'about') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten About</h3>
                           <div class="space-y-3">
                              <div><label class="label">Judul</label><input type="text" [(ngModel)]="config().about.title" class="input font-bold"></div>
                              <div><label class="label">Deskripsi Lengkap</label><textarea [(ngModel)]="config().about.description" class="input h-32"></textarea></div>
                              <div><label class="label">Gambar / Video</label><input type="file" (change)="onFileSelected($event, 'aboutImage')" class="input text-xs"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Statistik (Angka di Bawah)</h3>
                           <div class="grid grid-cols-3 gap-4">
                              <div><label class="label">Angka 1</label><input type="text" [(ngModel)]="config().about.stats.val1" class="input font-bold"></div>
                              <div><label class="label">Label 1</label><input type="text" [(ngModel)]="config().about.stats.label1" class="input text-xs"></div>
                              
                              <div><label class="label">Angka 2</label><input type="text" [(ngModel)]="config().about.stats.val2" class="input font-bold"></div>
                              <div><label class="label">Label 2</label><input type="text" [(ngModel)]="config().about.stats.label2" class="input text-xs"></div>
                              
                              <div><label class="label">Angka 3</label><input type="text" [(ngModel)]="config().about.stats.val3" class="input font-bold"></div>
                              <div><label class="label">Label 3</label><input type="text" [(ngModel)]="config().about.stats.label3" class="input text-xs"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style Section About</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().about.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().about.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().about.style.accentColor" class="w-full h-10"></div>
                              <div><label class="label">Font Family</label><select [(ngModel)]="config().about.style.fontFamily" class="input bg-white"><option value="Lato">Lato</option><option value="Open Sans">Open Sans</option></select></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: MENU -->
                  @if (currentTab() === 'menu') {
                     <div class="space-y-6 h-full flex flex-col">
                        <div class="section-box">
                           <h3 class="section-title">Header Halaman Menu</h3>
                           <div class="grid grid-cols-2 gap-4 mb-4">
                              <div><label class="label">Judul</label><input type="text" [(ngModel)]="config().menuPage.title" class="input"></div>
                              <div><label class="label">Sub Judul</label><input type="text" [(ngModel)]="config().menuPage.subtitle" class="input"></div>
                           </div>
                           <div class="grid grid-cols-4 gap-2">
                              <div><label class="label">BG Color</label><input type="color" [(ngModel)]="config().menuPage.style.backgroundColor" class="w-full h-8"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().menuPage.style.textColor" class="w-full h-8"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().menuPage.style.accentColor" class="w-full h-8"></div>
                              <div><label class="label">Font</label><select [(ngModel)]="config().menuPage.style.fontFamily" class="input h-8 text-xs"><option value="Playfair Display">Playfair</option></select></div>
                           </div>
                        </div>

                        <div class="flex-1 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
                           <!-- Branch Tabs -->
                           <div class="flex border-b bg-gray-50 overflow-x-auto">
                              @for (branch of config().branches; track $index) {
                                 <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-6 py-3 text-sm font-bold border-r hover:bg-white transition"
                                    [class.bg-white]="selectedBranchIndex() === $index"
                                    [class.text-blue-600]="selectedBranchIndex() === $index">
                                    {{ branch.name }}
                                 </button>
                              }
                           </div>
                           
                           <!-- Menu List -->
                           <div class="flex-1 overflow-y-auto p-4 space-y-3">
                              <div class="flex justify-between items-center mb-2">
                                 <h4 class="font-bold text-gray-500 text-xs uppercase">Daftar Item Menu</h4>
                                 <button (click)="addMenuItem()" class="bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-green-700">+ Tambah Item</button>
                              </div>
                              
                              @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                                 <div class="flex gap-4 p-3 border rounded-lg bg-gray-50 group hover:border-blue-300 transition">
                                    <div class="w-16 h-16 bg-gray-200 rounded relative flex-shrink-0 cursor-pointer overflow-hidden">
                                       <img [src]="item.image" class="w-full h-full object-cover">
                                       <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="absolute inset-0 opacity-0" title="Ubah Foto">
                                    </div>
                                    <div class="flex-1 grid gap-2">
                                       <div class="flex gap-2">
                                          <input type="text" [(ngModel)]="item.name" class="input font-bold" placeholder="Nama">
                                          <input type="text" [(ngModel)]="item.price" class="input w-24 text-right" placeholder="Harga">
                                       </div>
                                       <div class="flex gap-2 items-center">
                                          <input type="text" [(ngModel)]="item.category" class="input text-xs w-24" placeholder="Kategori">
                                          <label class="flex items-center gap-1 cursor-pointer select-none">
                                             <input type="checkbox" [(ngModel)]="item.favorite">
                                             <span class="text-xs font-bold text-yellow-600">Favorite</span>
                                          </label>
                                       </div>
                                       <textarea [(ngModel)]="item.desc" class="input text-xs h-10 resize-none" placeholder="Deskripsi"></textarea>
                                    </div>
                                    <button (click)="removeMenuItem($index)" class="self-start text-gray-300 hover:text-red-500 p-1">✕</button>
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: RESERVATION -->
                  @if (currentTab() === 'reservation') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Halaman Reservasi</h3>
                           <div class="space-y-3">
                              <div><label class="label">Judul</label><input type="text" [(ngModel)]="config().reservation.title" class="input"></div>
                              <div><label class="label">Sub Judul</label><input type="text" [(ngModel)]="config().reservation.subtitle" class="input"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Logika & Aturan</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                 <label class="label">Min. Pax (Reguler)</label>
                                 <input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="input font-bold text-lg">
                                 <p class="text-xs text-gray-400 mt-1">Batas minimum orang hari biasa.</p>
                              </div>
                              <div>
                                 <label class="label">Min. Pax (Puasa)</label>
                                 <input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="input font-bold text-lg">
                                 <p class="text-xs text-gray-400 mt-1">Batas minimum saat event puasa.</p>
                              </div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style Section Reservasi</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().reservation.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().reservation.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().reservation.style.accentColor" class="w-full h-10"></div>
                              <div><label class="label">Font Family</label><select [(ngModel)]="config().reservation.style.fontFamily" class="input bg-white"><option value="Lato">Lato</option></select></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: LOCATION -->
                  @if (currentTab() === 'location') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Halaman Lokasi</h3>
                           <div class="space-y-3">
                              <div><label class="label">Judul</label><input type="text" [(ngModel)]="config().locationPage.title" class="input"></div>
                              <div><label class="label">Sub Judul</label><input type="text" [(ngModel)]="config().locationPage.subtitle" class="input"></div>
                           </div>
                           <div class="grid grid-cols-4 gap-2 mt-4">
                              <div><label class="label">BG Color</label><input type="color" [(ngModel)]="config().locationPage.style.backgroundColor" class="w-full h-8"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().locationPage.style.textColor" class="w-full h-8"></div>
                              <div><label class="label">Accent Color</label><input type="color" [(ngModel)]="config().locationPage.style.accentColor" class="w-full h-8"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <div class="flex justify-between items-center mb-4">
                              <h3 class="section-title mb-0">Daftar Cabang</h3>
                              <div class="flex gap-2">
                                 <button (click)="addBranch()" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">+ Cabang Baru</button>
                                 <button (click)="removeBranch()" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Hapus</button>
                              </div>
                           </div>

                           <div class="flex gap-2 mb-4 overflow-x-auto">
                              @for (branch of config().branches; track $index) {
                                 <button (click)="selectedBranchIndex.set($index)" 
                                    class="px-4 py-2 border rounded text-sm font-bold"
                                    [class.bg-gray-800]="selectedBranchIndex() === $index"
                                    [class.text-white]="selectedBranchIndex() === $index">
                                    {{ branch.name }}
                                 </button>
                              }
                           </div>

                           <div class="space-y-4 border-t pt-4">
                              <div><label class="label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="input font-bold"></div>
                              <div><label class="label">Alamat Lengkap</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="input h-20"></textarea></div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="label">No. Telepon</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="input"></div>
                                 <div><label class="label">WhatsApp</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="input font-mono"></div>
                              </div>
                              <div><label class="label">Jam Operasional</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="input"></div>
                              <div><label class="label">Google Maps URL</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="input text-blue-600"></div>
                              <div>
                                 <label class="label">Gambar Peta / Model 3D</label>
                                 <input type="file" (change)="onFileSelected($event, 'branchMap')" class="input text-xs">
                                 <div class="h-32 bg-gray-100 mt-2 rounded overflow-hidden">
                                    <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: FOOTER -->
                  @if (currentTab() === 'footer') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Konten Footer</h3>
                           <div class="space-y-3">
                              <div><label class="label">Deskripsi Singkat</label><textarea [(ngModel)]="config().footer.description" class="input h-24"></textarea></div>
                              <div><label class="label">Facebook Link</label><input type="text" [(ngModel)]="config().footer.facebookLink" class="input"></div>
                              <div><label class="label">Instagram Link</label><input type="text" [(ngModel)]="config().footer.instagramLink" class="input"></div>
                              <div><label class="label">TikTok Link</label><input type="text" [(ngModel)]="config().footer.tiktokLink" class="input"></div>
                           </div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Style Footer</h3>
                           <div class="grid grid-cols-2 gap-4">
                              <div><label class="label">Background Color</label><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="w-full h-10"></div>
                              <div><label class="label">Text Color</label><input type="color" [(ngModel)]="config().footer.style.textColor" class="w-full h-10"></div>
                              <div><label class="label">Accent Color (Link)</label><input type="color" [(ngModel)]="config().footer.style.accentColor" class="w-full h-10"></div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: MEDIA -->
                  @if (currentTab() === 'media') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box">
                           <h3 class="section-title">Profil Instagram (Tampilan Web)</h3>
                           <div class="grid grid-cols-3 gap-4 mb-3">
                              <div><label class="label">Posts</label><input type="text" [(ngModel)]="config().instagramProfile.postsCount" class="input"></div>
                              <div><label class="label">Followers</label><input type="text" [(ngModel)]="config().instagramProfile.followersCount" class="input"></div>
                              <div><label class="label">Following</label><input type="text" [(ngModel)]="config().instagramProfile.followingCount" class="input"></div>
                           </div>
                           <div><label class="label">Username</label><input type="text" [(ngModel)]="config().instagramProfile.username" class="input"></div>
                           <div class="mt-2"><label class="label">Bio</label><textarea [(ngModel)]="config().instagramProfile.bio" class="input"></textarea></div>
                           <div class="mt-2"><label class="label">Profile Pic</label><input type="file" (change)="onFileSelected($event, 'logo')" class="input text-xs"></div>
                        </div>

                        <div class="section-box">
                           <h3 class="section-title">Galeri Foto</h3>
                           <input type="file" (change)="onFileSelected($event, 'gallery')" class="mb-4">
                           <div class="grid grid-cols-4 gap-2">
                              @for (img of config().gallery; track $index) {
                                 <div class="relative aspect-square group">
                                    <img [src]="img" class="w-full h-full object-cover rounded">
                                    <button (click)="removeGalleryImage($index)" class="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100">✕</button>
                                 </div>
                              }
                           </div>
                        </div>

                        <div class="section-box">
                           <div class="flex justify-between items-center mb-4">
                              <h3 class="section-title">Testimoni</h3>
                              <button (click)="addTestimonial()" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">+ Baru</button>
                           </div>
                           <div class="space-y-4">
                              @for (t of config().testimonials; track $index) {
                                 <div class="border p-3 rounded bg-gray-50 relative">
                                    <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-red-500 font-bold">✕</button>
                                    <div class="grid grid-cols-2 gap-2 mb-2">
                                       <input type="text" [(ngModel)]="t.name" class="input font-bold" placeholder="Nama">
                                       <input type="text" [(ngModel)]="t.role" class="input text-xs" placeholder="Role">
                                    </div>
                                    <textarea [(ngModel)]="t.text" class="input text-sm h-16" placeholder="Isi Testimoni"></textarea>
                                    <div class="flex items-center gap-2 mt-2">
                                       <span class="text-xs font-bold">Rating:</span>
                                       <input type="number" [(ngModel)]="t.rating" class="input w-16" min="1" max="5">
                                    </div>
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: AI -->
                  @if (currentTab() === 'ai') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="section-box bg-purple-50 border-purple-100">
                           <h3 class="section-title text-purple-900">Konfigurasi AI Assistant</h3>
                           <div class="space-y-4">
                              <div>
                                 <label class="label">Instruksi Sistem (Prompt Utama)</label>
                                 <textarea [(ngModel)]="config().ai.systemInstruction" class="input h-64 font-mono text-sm" placeholder="Contoh: Anda adalah Maya, asisten restoran yang ramah..."></textarea>
                                 <p class="text-xs text-gray-500 mt-2">Instruksi ini menentukan kepribadian AI dan bagaimana ia menjawab pertanyaan pelanggan.</p>
                              </div>
                              <div>
                                 <label class="label">Pesan Pembuka</label>
                                 <input type="text" [(ngModel)]="config().ai.initialMessage" class="input">
                              </div>
                           </div>
                        </div>
                     </div>
                  }

                  <!-- TAB: DATABASE -->
                  @if (currentTab() === 'database') {
                     <div class="space-y-6 max-w-3xl">
                        <div class="bg-white p-8 rounded-xl border shadow-sm">
                           <h3 class="text-xl font-bold mb-6">Konfigurasi Firebase</h3>
                           <div class="space-y-4">
                              <div><label class="label">API Key</label><input type="text" [(ngModel)]="tempConfig.apiKey" class="input bg-gray-50 font-mono"></div>
                              <div><label class="label">Auth Domain</label><input type="text" [(ngModel)]="tempConfig.authDomain" class="input bg-gray-50 font-mono"></div>
                              <div><label class="label">Project ID</label><input type="text" [(ngModel)]="tempConfig.projectId" class="input bg-gray-50 font-mono font-bold text-blue-600"></div>
                              <div><label class="label">Storage Bucket</label><input type="text" [(ngModel)]="tempConfig.storageBucket" class="input bg-gray-50 font-mono"></div>
                              <div><label class="label">Messaging Sender ID</label><input type="text" [(ngModel)]="tempConfig.messagingSenderId" class="input bg-gray-50 font-mono"></div>
                              <div><label class="label">App ID</label><input type="text" [(ngModel)]="tempConfig.appId" class="input bg-gray-50 font-mono"></div>
                           </div>
                           <div class="flex gap-4 pt-6 mt-6 border-t">
                              <button (click)="saveFirebaseSetup()" class="bg-green-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-green-700">Simpan & Reload</button>
                              <button (click)="resetFirebaseSetup()" class="text-red-500 text-sm font-bold">Reset Default</button>
                           </div>
                        </div>
                     </div>
                  }

               </div>
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
    .section-box { background: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
    .section-title { font-weight: 800; font-size: 1rem; color: #1f2937; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f3f4f6; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  isAuthenticated = this.configService.isAdmin;
  firestoreError = this.configService.firestoreError;
  
  isOpen = signal(false);
  emailInput = signal('');
  passwordInput = signal('');
  isLoggingIn = signal(false);
  isUploading = signal(false);
  loginError = signal('');
  
  currentTab = signal('global');
  selectedBranchIndex = signal(0);
  
  tabs = [
    { id: 'global', label: 'Global & Intro', icon: '🌍' },
    { id: 'hero', label: 'Hero / Utama', icon: '🏠' },
    { id: 'about', label: 'About Us', icon: '📖' },
    { id: 'menu', label: 'Menu Makanan', icon: '🍱' },
    { id: 'reservation', label: 'Reservasi', icon: '📅' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'media', label: 'Galeri & Testimoni', icon: '📸' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'database', label: 'Database', icon: '🔥' },
  ];
  
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

  async login() {
    if (!this.emailInput() || !this.passwordInput()) return;
    this.isLoggingIn.set(true);
    this.loginError.set('');
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.currentTab.set('global');
    } catch (err: any) {
      this.loginError.set("Gagal Login: " + err.message);
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() { await this.configService.logoutAdmin(); }

  async saveChanges() { await this.configService.updateConfig({...this.config()}); }

  saveFirebaseSetup() { this.configService.saveStoredFirebaseConfig(this.tempConfig); }
  resetFirebaseSetup() { if(confirm('Reset ke default?')) this.configService.resetStoredFirebaseConfig(); }

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

  // --- CRUD ---
  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({ name: 'Menu Baru', desc: '', price: 'Rp 0', category: 'Umum', image: 'https://picsum.photos/200', favorite: false });
  }
  removeMenuItem(i: number) { if(confirm('Hapus menu?')) this.config().branches[this.selectedBranchIndex()].menu.splice(i, 1); }
  removeGalleryImage(i: number) { if(confirm('Hapus foto?')) this.config().gallery.splice(i, 1); }
  
  addTestimonial() { 
     if(!this.config().testimonials) this.config.update(c => ({...c, testimonials: []}));
     this.config().testimonials.push({ name: 'User', text: 'Review...', rating: 5, role: 'Customer' }); 
  }
  removeTestimonial(i: number) { if(confirm('Hapus testimoni?')) this.config().testimonials.splice(i, 1); }
  
  addBranch() {
    this.config().branches.push({ id: 'b-'+Date.now(), name: 'Baru', address: '', googleMapsUrl: '', phone: '', whatsappNumber: '', hours: '', mapImage: '', menu: [] });
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }
  removeBranch() { if(confirm('Hapus cabang?')) { this.config().branches.splice(this.selectedBranchIndex(), 1); this.selectedBranchIndex.set(0); } }
}
