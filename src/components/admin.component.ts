
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial, FirebaseConfig, PackageItem } from '../services/config.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Trigger Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20 group"
      title="Admin Dashboard"
    >
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      }
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Upload Loading Overlay -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center flex-col text-white">
         <div class="w-16 h-16 border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin mb-4"></div>
         <p class="font-bold tracking-widest uppercase">Mengunggah...</p>
      </div>
    }

    <!-- MAIN PANEL -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] bg-[#F3F4F6] font-sans text-gray-800 flex overflow-hidden animate-fade-in">
        
        <!-- LOGIN OVERLAY -->
        @if (!isAuthenticated()) {
           <div class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4">
              <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div class="bg-orange-600 p-8 text-center">
                    <h2 class="text-2xl font-bold text-white">Admin Portal</h2>
                    <p class="text-orange-100 text-sm">Masuk untuk mengelola website</p>
                  </div>
                  <div class="p-8 space-y-6">
                    <div class="space-y-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                          <input type="email" [(ngModel)]="emailInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                          <input type="password" [(ngModel)]="passwordInput" class="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition">
                        </div>
                    </div>
                    <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-lg hover:bg-black transition disabled:opacity-50">
                       {{ isLoggingIn() ? 'Memproses...' : 'Masuk' }}
                    </button>
                    @if (loginError()) { <p class="text-red-500 text-center text-sm">{{ loginError() }}</p> }
                    <button (click)="togglePanel()" class="w-full text-sm text-gray-500 hover:underline text-center">Batal</button>
                  </div>
              </div>
           </div>
        } 
        
        <!-- DASHBOARD CONTENT -->
        @else {
          <!-- SIDEBAR -->
          <aside class="w-72 bg-[#111827] text-gray-400 flex flex-col h-full flex-shrink-0 border-r border-gray-800">
             <div class="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0B0F19]">
                <span class="font-bold text-white text-lg tracking-wide">CMS Panel</span>
             </div>
             
             <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                @for (tab of tabs; track tab.id) {
                   <button (click)="currentTab.set(tab.id)"
                     class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                     [class.bg-orange-600]="currentTab() === tab.id"
                     [class.text-white]="currentTab() === tab.id"
                     [class.hover:bg-gray-800]="currentTab() !== tab.id"
                     [class.shadow-lg]="currentTab() === tab.id">
                      <span class="text-xl w-6">{{ tab.icon }}</span>
                      <span>{{ tab.label }}</span>
                   </button>
                }
             </nav>

             <div class="p-4 border-t border-gray-800">
                <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold transition">
                   Log Out
                </button>
             </div>
          </aside>

          <!-- MAIN AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB] relative">
             <!-- HEADER -->
             <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 z-10">
                <div>
                  <h1 class="text-xl font-bold text-gray-900">{{ getActiveTabLabel() }}</h1>
                  <p class="text-xs text-gray-500">Kelola pengaturan website Anda secara real-time</p>
                </div>
                
                <div class="flex items-center gap-3">
                   <button (click)="saveChanges()" class="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Simpan
                   </button>
                   <button (click)="togglePanel()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-xl">✕</button>
                </div>
             </header>

             <!-- CONTENT SCROLL -->
             <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="max-w-6xl mx-auto space-y-8 pb-24">

                   <!-- ==========================
                        TAB: GLOBAL & INTRO
                        ========================== -->
                   @if (currentTab() === 'global') {
                      <!-- Intro Section -->
                      <section class="admin-card">
                        <div class="admin-card-header">
                           <span class="text-2xl">🎬</span>
                           <h3 class="font-bold text-gray-900">Intro Loading Screen</h3>
                        </div>
                        <div class="p-6">
                           <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                              <div><h3 class="font-bold text-gray-900">Aktifkan Intro Video</h3><p class="text-sm text-gray-500">Tampilkan video saat website pertama kali dibuka.</p></div>
                              <label class="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" [(ngModel)]="config().intro.enabled" class="sr-only peer">
                                 <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-orange-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                              </label>
                           </div>
                           @if (config().intro.enabled) {
                              <div class="grid md:grid-cols-12 gap-6">
                                 <div class="md:col-span-5">
                                    <label class="form-label">Upload Video (.mp4)</label>
                                    <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition relative group min-h-[160px] flex flex-col justify-center items-center cursor-pointer">
                                       <input type="file" (change)="onFileSelected($event, 'introVideo')" accept="video/*" class="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full">
                                       <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                       </div>
                                       <span class="text-sm font-bold text-gray-600">Klik upload video</span>
                                    </div>
                                    @if (config().intro.videoUrl) { <div class="mt-2 text-xs text-green-600 font-bold">✓ Video Terupload</div> }
                                 </div>
                                 <div class="md:col-span-7 space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                       <div><label class="form-label">Durasi (Detik)</label><input type="number" [(ngModel)]="config().intro.duration" class="form-input"></div>
                                       <div><label class="form-label">Efek Animasi</label>
                                          <select [(ngModel)]="config().intro.fadeOut" class="form-select">
                                             <option value="fade">Fade Out</option><option value="slide-up">Slide Up</option><option value="slide-down">Slide Down</option><option value="zoom-out">Zoom Out</option>
                                          </select>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           }
                        </div>
                      </section>
                      
                      <!-- Identity Section -->
                      <section class="admin-card">
                         <div class="admin-card-header"><span class="text-2xl">🆔</span><h3 class="font-bold text-gray-900">Identitas & Style</h3></div>
                         <div class="p-6 space-y-6">
                           <div class="grid md:grid-cols-2 gap-6">
                              <div><label class="form-label">Nama Brand</label><input type="text" [(ngModel)]="config().global.logoText" class="form-input font-bold text-lg"></div>
                              <div class="grid grid-cols-2 gap-4">
                                 <div><label class="form-label">Warna Navbar</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.navbarColor" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.navbarColor" class="form-input"></div></div>
                                 <div><label class="form-label">Warna Teks</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.navbarTextColor" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.navbarTextColor" class="form-input"></div></div>
                              </div>
                           </div>
                           <div class="grid md:grid-cols-3 gap-6 pt-4 border-t">
                              <div><label class="form-label">Font Logo</label><select [(ngModel)]="config().global.logoStyle.fontFamily" class="form-select"><option value="Oswald">Oswald</option><option value="Playfair Display">Playfair</option><option value="Great Vibes">Great Vibes</option><option value="Lato">Lato</option></select></div>
                              <div><label class="form-label">Size Logo</label><input type="text" [(ngModel)]="config().global.logoStyle.fontSize" class="form-input"></div>
                              <div><label class="form-label">Warna Logo</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().global.logoStyle.color" class="h-10 w-12 rounded cursor-pointer border"><input type="text" [(ngModel)]="config().global.logoStyle.color" class="form-input"></div></div>
                           </div>
                        </div>
                      </section>
                   }

                   <!-- ==========================
                        TAB: PACKAGES (COMPLETELY OVERHAULED & EXTENSIVE)
                        ========================== -->
                   @if (currentTab() === 'packages') {
                      <div class="space-y-8">
                         
                         <!-- Header & Page Style -->
                         <div class="admin-card">
                            <div class="admin-card-header">Header & Styling Halaman</div>
                            <div class="p-6 space-y-6">
                               <!-- Title -->
                               <div class="border-b pb-6">
                                  <div class="flex justify-between items-center mb-2"><label class="form-label text-base text-gray-700">Judul Halaman</label></div>
                                  <input type="text" [(ngModel)]="config().packagesPage.title" class="form-input font-bold text-lg mb-3" placeholder="Paket Botram">
                                  
                                  <div class="grid grid-cols-3 gap-4">
                                     <div><label class="form-label">Font Judul</label><select [(ngModel)]="config().packagesPage.titleStyle.fontFamily" class="form-select"><option value="Oswald">Oswald</option><option value="Playfair Display">Playfair</option><option value="Lato">Lato</option><option value="Great Vibes">Great Vibes</option></select></div>
                                     <div><label class="form-label">Size Judul</label><input type="text" [(ngModel)]="config().packagesPage.titleStyle.fontSize" class="form-input"></div>
                                     <div><label class="form-label">Warna Judul</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.titleStyle.color" class="h-9 w-10 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().packagesPage.titleStyle.color" class="form-input px-2"></div></div>
                                  </div>
                               </div>

                               <!-- Subtitle -->
                               <div>
                                  <div class="flex justify-between items-center mb-2"><label class="form-label text-base text-gray-700">Sub-Judul</label></div>
                                  <input type="text" [(ngModel)]="config().packagesPage.subtitle" class="form-input mb-3" placeholder="Makan hemat...">
                                  
                                  <div class="grid grid-cols-3 gap-4">
                                     <div><label class="form-label">Font Sub</label><select [(ngModel)]="config().packagesPage.subtitleStyle.fontFamily" class="form-select"><option value="Lato">Lato</option><option value="Open Sans">Open Sans</option></select></div>
                                     <div><label class="form-label">Size Sub</label><input type="text" [(ngModel)]="config().packagesPage.subtitleStyle.fontSize" class="form-input"></div>
                                     <div><label class="form-label">Warna Sub</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.subtitleStyle.color" class="h-9 w-10 rounded border cursor-pointer"><input type="text" [(ngModel)]="config().packagesPage.subtitleStyle.color" class="form-input px-2"></div></div>
                                  </div>
                               </div>

                               <!-- Global Page Style -->
                               <div class="border-t pt-6 grid grid-cols-2 gap-4">
                                  <div><label class="form-label">Background Halaman</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.style.backgroundColor" class="h-9 w-10 rounded border"><input type="text" [(ngModel)]="config().packagesPage.style.backgroundColor" class="form-input text-xs"></div></div>
                                  <div><label class="form-label">Warna Aksen</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.style.accentColor" class="h-9 w-10 rounded border"><input type="text" [(ngModel)]="config().packagesPage.style.accentColor" class="form-input text-xs"></div></div>
                               </div>
                            </div>
                         </div>

                         <!-- Card Styling -->
                         <div class="admin-card">
                            <div class="admin-card-header">Desain Kartu Paket</div>
                            <div class="p-6 grid md:grid-cols-2 gap-8">
                               <div class="space-y-4">
                                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Visual Kartu</h4>
                                  <div class="grid grid-cols-2 gap-4">
                                     <div><label class="form-label">Card Background</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.cardBackgroundColor" class="h-9 w-10 border rounded"><input type="text" [(ngModel)]="config().packagesPage.cardBackgroundColor" class="form-input text-xs"></div></div>
                                     <div><label class="form-label">Card Text Color</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.cardTextColor" class="h-9 w-10 border rounded"><input type="text" [(ngModel)]="config().packagesPage.cardTextColor" class="form-input text-xs"></div></div>
                                     <div><label class="form-label">Border Radius</label><input type="text" [(ngModel)]="config().packagesPage.cardBorderRadius" class="form-input" placeholder="16px"></div>
                                  </div>
                               </div>
                               
                               <div class="space-y-4">
                                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Tipografi Konten</h4>
                                  <div class="grid grid-cols-2 gap-4">
                                     <div><label class="form-label">Warna Harga (Overlay)</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().packagesPage.priceColor" class="h-9 w-10 border rounded"><input type="text" [(ngModel)]="config().packagesPage.priceColor" class="form-input text-xs"></div></div>
                                     <div><label class="form-label">Size Font Harga</label><input type="text" [(ngModel)]="config().packagesPage.priceFontSize" class="form-input" placeholder="1rem"></div>
                                     <div class="col-span-2"><label class="form-label">Teks Tombol Pesan</label><input type="text" [(ngModel)]="config().packagesPage.buttonText" class="form-input font-bold" placeholder="Pesan Sekarang"></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <!-- Packages List Database -->
                         <div class="admin-card">
                            <div class="admin-card-header flex justify-between items-center bg-gray-50 border-b border-gray-200">
                               <span>Database Paket</span>
                               <div class="flex gap-2">
                                  @for (branch of config().branches; track $index) {
                                     <button (click)="selectedBranchIndex.set($index)" 
                                       class="px-3 py-1.5 rounded text-xs font-bold border transition"
                                       [class.bg-orange-600]="selectedBranchIndex() === $index"
                                       [class.text-white]="selectedBranchIndex() === $index"
                                       [class.border-transparent]="selectedBranchIndex() === $index">
                                       {{ branch.name }}
                                     </button>
                                  }
                               </div>
                            </div>
                            <div class="p-6 bg-gray-50">
                               <div class="flex justify-between items-center mb-6">
                                  <h4 class="font-bold text-gray-800">Paket di Cabang: {{ config().branches[selectedBranchIndex()].name }}</h4>
                                  <button (click)="addPackage()" class="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition">+ Tambah Paket Baru</button>
                               </div>

                               <div class="grid md:grid-cols-2 gap-6">
                                  @for (pkg of config().branches[selectedBranchIndex()].packages; track $index) {
                                     <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative group">
                                        
                                        <button (click)="removePackage($index)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm z-20 border hover:bg-red-50" title="Hapus Paket">✕</button>

                                        <!-- Image & Basic Info -->
                                        <div class="flex gap-4 mb-4">
                                           <div class="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative border">
                                              <img [src]="pkg.image || 'https://picsum.photos/200'" class="w-full h-full object-cover">
                                              <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition flex-col gap-1">
                                                 <span class="text-xl">📷</span>
                                                 <span>UBAH</span>
                                                 <input type="file" (change)="onFileSelected($event, 'packageItem', $index)" class="hidden">
                                              </label>
                                           </div>
                                           <div class="flex-1 space-y-2">
                                              <div><label class="form-label">Nama Paket</label><input type="text" [(ngModel)]="pkg.name" class="form-input font-bold" placeholder="Paket Keluarga"></div>
                                              <div><label class="form-label">Harga</label><input type="text" [(ngModel)]="pkg.price" class="form-input font-mono text-sm" placeholder="Rp 150.000"></div>
                                           </div>
                                        </div>
                                        
                                        <!-- Desc -->
                                        <div class="mb-3">
                                            <label class="form-label">Deskripsi Singkat</label>
                                            <textarea [(ngModel)]="pkg.description" class="form-input text-xs min-h-[50px]" placeholder="Cocok untuk 4 orang..."></textarea>
                                        </div>

                                        <!-- Items List -->
                                        <div>
                                            <label class="form-label flex justify-between">
                                                <span>Item Dalam Paket</span>
                                                <span class="text-[9px] text-gray-400 lowercase font-normal">(pisahkan dengan baris baru atau koma)</span>
                                            </label>
                                            <textarea [ngModel]="pkg.items.join('\n')" (ngModelChange)="updatePackageItems(pkg, $event)" class="form-input text-xs h-24 font-mono bg-yellow-50/50" placeholder="10 Tusuk Sate&#10;2 Nasi Timbel&#10;..."></textarea>
                                        </div>
                                     </div>
                                  }
                               </div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: LOCATION
                        ========================== -->
                   @if (currentTab() === 'location') {
                       <div class="space-y-6">
                          <div class="admin-card p-6">
                             <h3 class="font-bold border-b pb-2 mb-4">Pengaturan Halaman</h3>
                             <div class="grid md:grid-cols-3 gap-4">
                                <div><label class="form-label">Judul</label><input type="text" [(ngModel)]="config().locationPage.title" class="form-input font-bold"></div>
                                <div><label class="form-label">Sub-Judul</label><input type="text" [(ngModel)]="config().locationPage.subtitle" class="form-input"></div>
                                <div><label class="form-label">Bg Color</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().locationPage.style.backgroundColor" class="h-9 w-10 border rounded"><input type="text" [(ngModel)]="config().locationPage.style.backgroundColor" class="form-input"></div></div>
                             </div>
                          </div>

                          <div class="admin-card">
                             <div class="admin-card-header flex justify-between items-center bg-gray-50">
                                <span>Data Cabang</span>
                                <button (click)="addBranch()" class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-bold">+ Cabang Baru</button>
                             </div>
                             <div class="flex overflow-x-auto border-b border-gray-200 bg-white">
                                 @for (branch of config().branches; track $index) {
                                    <button (click)="selectedBranchIndex.set($index)" class="px-6 py-3 text-sm font-bold border-b-2 transition hover:bg-gray-50" [class.border-orange-500]="selectedBranchIndex()===$index" [class.border-transparent]="selectedBranchIndex()!==$index">{{branch.name}}</button>
                                 }
                             </div>
                             <div class="p-6 grid md:grid-cols-2 gap-8">
                                 <div class="space-y-4">
                                    <div><label class="form-label">Nama Cabang</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].name" class="form-input"></div>
                                    <div><label class="form-label">Alamat</label><textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" class="form-input h-20"></textarea></div>
                                    <div class="grid grid-cols-2 gap-4">
                                       <div><label class="form-label">No. WA (62..)</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="form-input"></div>
                                       <div><label class="form-label">Jam Buka</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="form-input"></div>
                                    </div>
                                    
                                    <h4 class="font-bold text-xs uppercase mt-4 text-gray-500 border-b pb-1">Link Sosial Media</h4>
                                    <div><label class="form-label">Instagram</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].instagramLink" class="form-input text-xs"></div>
                                    <div><label class="form-label">Facebook</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].facebookLink" class="form-input text-xs"></div>
                                    
                                    <button (click)="removeBranch()" class="text-red-600 text-xs underline font-bold mt-4">Hapus Cabang Ini</button>
                                 </div>
                                 <div class="space-y-4">
                                    <label class="form-label">Foto Lokasi / Peta</label>
                                    <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border">
                                       <img [src]="config().branches[selectedBranchIndex()].mapImage" class="w-full h-full object-cover">
                                       <label class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition">Upload<input type="file" (change)="onFileSelected($event, 'branchMap')" class="hidden"></label>
                                    </div>
                                    <div><label class="form-label">Google Maps Link</label><input type="text" [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="form-input text-xs"></div>
                                 </div>
                             </div>
                          </div>
                       </div>
                   }

                   <!-- ==========================
                        TAB: MEDIA (Gallery & Testimonial)
                        ========================== -->
                   @if (currentTab() === 'media') {
                      <div class="space-y-8">
                         <!-- Instagram Profile -->
                         <div class="admin-card">
                            <div class="admin-card-header">Profil Instagram</div>
                            <div class="p-6 grid md:grid-cols-2 gap-6">
                               <div class="space-y-4">
                                  <div><label class="form-label">Username</label><input type="text" [(ngModel)]="config().instagramProfile.username" class="form-input font-bold"></div>
                                  <div><label class="form-label">Bio</label><textarea [(ngModel)]="config().instagramProfile.bio" class="form-input h-20"></textarea></div>
                                  <div class="grid grid-cols-3 gap-2">
                                     <div><label class="form-label">Posts</label><input type="text" [(ngModel)]="config().instagramProfile.postsCount" class="form-input text-center"></div>
                                     <div><label class="form-label">Followers</label><input type="text" [(ngModel)]="config().instagramProfile.followersCount" class="form-input text-center"></div>
                                     <div><label class="form-label">Following</label><input type="text" [(ngModel)]="config().instagramProfile.followingCount" class="form-input text-center"></div>
                                  </div>
                               </div>
                               <div>
                                  <label class="form-label">Foto Profil</label>
                                  <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 relative group mx-auto">
                                     <img [src]="config().instagramProfile.profilePic" class="w-full h-full object-cover">
                                     <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer">Ubah<input type="file" (change)="onFileSelected($event, 'instaProfile')" class="hidden"></label>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <!-- Gallery Grid -->
                         <div class="admin-card">
                            <div class="admin-card-header flex justify-between">
                               <span>Galeri Foto</span>
                               <label class="bg-gray-900 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer hover:bg-black transition">+ Upload Foto<input type="file" (change)="onFileSelected($event, 'galleryImage')" class="hidden"></label>
                            </div>
                            <div class="p-6">
                               <div class="grid grid-cols-3 md:grid-cols-5 gap-4">
                                  @for (img of config().gallery; track $index) {
                                     <div class="aspect-square relative group rounded overflow-hidden">
                                        <img [src]="img" class="w-full h-full object-cover">
                                        <button (click)="removeGalleryImage($index)" class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs transition">HAPUS</button>
                                     </div>
                                  }
                               </div>
                            </div>
                         </div>

                         <!-- Testimonials -->
                         <div class="admin-card">
                            <div class="admin-card-header flex justify-between">
                               <span>Testimoni Pelanggan</span>
                               <button (click)="addTestimonial()" class="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold">+ Tambah</button>
                            </div>
                            <div class="p-6 space-y-4">
                               @for (testi of config().testimonials; track $index) {
                                  <div class="border rounded-xl p-4 relative bg-white">
                                     <button (click)="removeTestimonial($index)" class="absolute top-2 right-2 text-gray-300 hover:text-red-500">✕</button>
                                     <div class="grid md:grid-cols-4 gap-4">
                                        <div class="md:col-span-1 space-y-2">
                                           <input type="text" [(ngModel)]="testi.name" class="form-input font-bold" placeholder="Nama">
                                           <input type="text" [(ngModel)]="testi.role" class="form-input text-xs" placeholder="Status/Role">
                                           <input type="number" [(ngModel)]="testi.rating" min="1" max="5" class="form-input w-16" placeholder="Rate">
                                        </div>
                                        <div class="md:col-span-3">
                                           <textarea [(ngModel)]="testi.text" class="form-input h-full" placeholder="Isi ulasan..."></textarea>
                                        </div>
                                     </div>
                                  </div>
                               }
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: FOOTER
                        ========================== -->
                   @if (currentTab() === 'footer') {
                      <div class="grid lg:grid-cols-2 gap-8">
                         <div class="admin-card">
                            <div class="admin-card-header">Konten Footer</div>
                            <div class="p-6 space-y-4">
                               <div><label class="form-label">Deskripsi Singkat</label><textarea [(ngModel)]="config().footer.description" class="form-input h-24"></textarea></div>
                               <div><label class="form-label">Teks Copyright</label><input type="text" [(ngModel)]="config().footer.copyrightText" class="form-input"></div>
                               <div><label class="form-label">Link Instagram Utama</label><input type="text" [(ngModel)]="config().footer.instagramLink" class="form-input"></div>
                            </div>
                         </div>
                         <div class="admin-card">
                            <div class="admin-card-header">Styling</div>
                            <div class="p-6 space-y-4">
                               <div><label class="form-label">Background Color</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.style.backgroundColor" class="h-9 w-12 rounded border"><input type="text" [(ngModel)]="config().footer.style.backgroundColor" class="form-input"></div></div>
                               <div><label class="form-label">Text Color</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().footer.style.textColor" class="h-9 w-12 rounded border"><input type="text" [(ngModel)]="config().footer.style.textColor" class="form-input"></div></div>
                               <div><label class="form-label">Brand Font Size</label><input type="text" [(ngModel)]="config().footer.brandStyle.fontSize" class="form-input"></div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: AI ASSISTANT
                        ========================== -->
                   @if (currentTab() === 'ai') {
                      <div class="admin-card">
                         <div class="admin-card-header">Konfigurasi AI Assistant</div>
                         <div class="p-6 grid md:grid-cols-2 gap-8">
                            <div class="space-y-4">
                               <div><label class="form-label">Instruksi Sistem (System Prompt)</label><textarea [(ngModel)]="config().ai.systemInstruction" class="form-input h-40 text-sm font-mono"></textarea><p class="text-[10px] text-gray-400 mt-1">Panduan kepribadian dan pengetahuan untuk AI.</p></div>
                               <div><label class="form-label">Pesan Pembuka</label><input type="text" [(ngModel)]="config().ai.initialMessage" class="form-input"></div>
                            </div>
                            <div class="space-y-4">
                               <div><label class="form-label">Warna Tombol Chat</label><div class="flex gap-2"><input type="color" [(ngModel)]="config().ai.buttonColor" class="h-9 w-12 rounded border"><input type="text" [(ngModel)]="config().ai.buttonColor" class="form-input"></div></div>
                               <div><label class="form-label">Ukuran Tombol</label><input type="text" [(ngModel)]="config().ai.buttonSize" class="form-input" placeholder="60px"></div>
                               <div><label class="form-label">Lebar Jendela Chat</label><input type="text" [(ngModel)]="config().ai.windowWidth" class="form-input" placeholder="360px"></div>
                            </div>
                         </div>
                      </div>
                   }

                   <!-- ==========================
                        TAB: DATABASE
                        ========================== -->
                   @if (currentTab() === 'database') {
                      <div class="admin-card">
                         <div class="admin-card-header bg-red-50 border-b border-red-100 text-red-800">
                             <span>🔥 Konfigurasi Firebase (Advanced)</span>
                         </div>
                         <div class="p-6 space-y-4">
                             <p class="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                                ⚠️ <b>PERINGATAN:</b> Ubah pengaturan ini hanya jika Anda ingin menghubungkan website ke project Firebase Anda sendiri. Refresh halaman setelah menyimpan.
                             </p>
                             <div class="grid md:grid-cols-2 gap-4">
                                <div><label class="form-label">API Key</label><input type="text" [(ngModel)]="tempConfig.apiKey" class="form-input font-mono text-xs"></div>
                                <div><label class="form-label">Auth Domain</label><input type="text" [(ngModel)]="tempConfig.authDomain" class="form-input font-mono text-xs"></div>
                                <div><label class="form-label">Project ID</label><input type="text" [(ngModel)]="tempConfig.projectId" class="form-input font-mono text-xs"></div>
                                <div><label class="form-label">Storage Bucket</label><input type="text" [(ngModel)]="tempConfig.storageBucket" class="form-input font-mono text-xs"></div>
                                <div><label class="form-label">Messaging Sender ID</label><input type="text" [(ngModel)]="tempConfig.messagingSenderId" class="form-input font-mono text-xs"></div>
                                <div><label class="form-label">App ID</label><input type="text" [(ngModel)]="tempConfig.appId" class="form-input font-mono text-xs"></div>
                             </div>
                             <div class="pt-4 flex gap-3">
                                <button (click)="saveFirebaseSetup()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition">Simpan & Reload</button>
                                <button (click)="configService.resetStoredFirebaseConfig()" class="text-gray-500 hover:underline text-sm">Reset ke Default</button>
                             </div>
                         </div>
                      </div>
                   }

                </div>
             </div>
          </main>
        }
      </div>
    }
  `,
  styles: [`
    .admin-card { @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden; }
    .admin-card-header { @apply bg-gray-50 px-6 py-4 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center gap-2; }
    .form-label { @apply block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5; }
    .form-input { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm; }
    .form-select { @apply w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white shadow-sm appearance-none cursor-pointer; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  toastService = inject(ToastService);
  config = this.configService.config;
  
  isOpen = signal(false);
  currentTab = signal('global');
  isUploading = signal(false);
  
  // Login
  emailInput = signal('');
  passwordInput = signal('');
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);
  
  // UI State
  selectedBranchIndex = signal(0);
  
  isAuthenticated = computed(() => this.configService.currentUser() !== null || this.configService.isDemoMode());
  firestoreError = this.configService.firestoreError;

  tabs = [
    { id: 'global', label: 'Global & Intro', icon: '🌍' },
    { id: 'hero', label: 'Hero Banner', icon: '🏠' },
    { id: 'about', label: 'Tentang Kami', icon: '📖' },
    { id: 'menu', label: 'Daftar Menu', icon: '🍽️' },
    { id: 'packages', label: 'Paket Hemat', icon: '📦' },
    { id: 'location', label: 'Lokasi', icon: '📍' },
    { id: 'media', label: 'Galeri & Testimoni', icon: '📷' },
    { id: 'footer', label: 'Footer', icon: '🔗' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'database', label: 'Database', icon: '🔥' }
  ];

  // Temp for DB
  tempConfig: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

  constructor() {
    const current = this.configService.getStoredFirebaseConfig();
    if (current) this.tempConfig = {...current};

    effect(() => {
       if (this.isOpen()) {
         document.body.classList.add('admin-mode');
       } else {
         document.body.classList.remove('admin-mode');
       }
    });
  }

  getActiveTabLabel() {
    return this.tabs.find(t => t.id === this.currentTab())?.label || 'Dashboard';
  }

  togglePanel() {
    this.isOpen.update(v => !v);
  }

  async login() {
    this.isLoggingIn.set(true);
    this.loginError.set(null);
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.toastService.show('Login Berhasil', 'success');
    } catch (e: any) {
      this.loginError.set(e.message || 'Login gagal');
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    await this.configService.logoutAdmin();
    this.togglePanel();
  }

  async saveChanges() {
    try {
      await this.configService.updateConfig(this.config());
      this.toastService.show('Disimpan!', 'success');
    } catch (e: any) {
       console.error(e);
       this.toastService.show('Gagal menyimpan.', 'error');
    }
  }

  async onFileSelected(event: any, type: string, index?: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    try {
      const base64 = await this.configService.uploadFile(file);
      
      this.config.update(c => {
        const newC = { ...c };
        if (type === 'introVideo') newC.intro.videoUrl = base64;
        if (type === 'heroBg') newC.hero.bgImage = base64;
        if (type === 'aboutImage') newC.about.image = base64;
        if (type === 'logoImage') newC.global.logoImage = base64;
        if (type === 'favicon') newC.global.favicon = base64;
        if (type === 'instaProfile') newC.instagramProfile.profilePic = base64;
        if (type === 'galleryImage') newC.gallery.push(base64);
        
        if (type === 'menuItem' && typeof index === 'number') {
           newC.branches[this.selectedBranchIndex()].menu[index].image = base64;
        }
        if (type === 'packageItem' && typeof index === 'number') {
           if (newC.branches[this.selectedBranchIndex()].packages?.[index]) {
             newC.branches[this.selectedBranchIndex()].packages![index].image = base64;
           }
        }
        if (type === 'branchMap') {
           newC.branches[this.selectedBranchIndex()].mapImage = base64;
        }
        return newC;
      });
      
      this.toastService.show('Upload Berhasil', 'success');
    } catch (e) {
      this.toastService.show('Gagal Upload', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  removeGalleryImage(index: number) {
    if(!confirm('Hapus foto ini?')) return;
    this.config.update(c => {
       const newC = {...c};
       newC.gallery.splice(index, 1);
       return newC;
    });
  }

  addMenuItem() {
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.unshift({
        name: 'Menu Baru',
        desc: '',
        price: 'Rp 0',
        category: 'Umum',
        image: 'https://picsum.photos/200',
        favorite: false,
        soldOut: false,
        spicyLevel: 0
      });
      return newC;
    });
  }

  removeMenuItem(index: number) {
    if(!confirm('Hapus menu ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].menu.splice(index, 1);
      return newC;
    });
  }

  addPackage() {
    this.config.update(c => {
      const newC = { ...c };
      const currentBranch = newC.branches[this.selectedBranchIndex()];
      if (!currentBranch.packages) currentBranch.packages = [];
      
      currentBranch.packages.unshift({
        name: 'Paket Baru',
        price: 'Rp 0',
        description: 'Deskripsi...',
        image: 'https://picsum.photos/400/300',
        items: ['Item 1', 'Item 2']
      });
      return newC;
    });
  }

  removePackage(index: number) {
    if(!confirm('Hapus paket ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches[this.selectedBranchIndex()].packages?.splice(index, 1);
      return newC;
    });
  }

  updatePackageItems(pkg: PackageItem, text: string) {
    pkg.items = text.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
  }

  addBranch() {
    const id = prompt("ID Cabang (contoh: 'jakarta'):");
    if (!id) return;
    
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.push({
        id: id.toLowerCase().replace(/\s/g, '-'),
        name: 'Cabang Baru',
        address: '-',
        googleMapsUrl: '',
        phone: '',
        whatsappNumber: '',
        hours: '10.00 - 22.00',
        mapImage: 'https://picsum.photos/600/400',
        menu: [],
        packages: []
      });
      this.selectedBranchIndex.set(newC.branches.length - 1);
      return newC;
    });
  }

  removeBranch() {
    if (this.config().branches.length <= 1) return;
    if(!confirm('Hapus cabang ini?')) return;
    this.config.update(c => {
      const newC = { ...c };
      newC.branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
      return newC;
    });
  }

  addTestimonial() {
     this.config.update(c => {
        const newC = {...c};
        newC.testimonials.push({ name: 'Pelanggan', role: 'Foodie', rating: 5, text: 'Enak banget!' });
        return newC;
     });
  }

  removeTestimonial(index: number) {
     if(!confirm('Hapus testimoni ini?')) return;
     this.config.update(c => {
        const newC = {...c};
        newC.testimonials.splice(index, 1);
        return newC;
     });
  }

  saveFirebaseSetup() { 
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
  }

  isVideo(url: string) { return this.configService.isVideo(url); }
}
