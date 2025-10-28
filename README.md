# Chat App - Vue 3 + Supabase

Modern, gerçek zamanlı chat uygulaması. Vue 3, Pinia ve Supabase ile geliştirilmiştir.

## Özellikler

- Grup Sohbetleri: Çoklu kullanıcı ile grup sohbetleri
- İkili Sohbetler: Birebir özel mesajlaşma
- Gerçek Zamanlı: Supabase Realtime ile anlık mesaj senkronizasyonu
- Kimlik Doğrulama: Supabase Auth ile güvenli giriş
- Responsive Tasarım: Mobil ve masaüstü uyumlu
- Açık/Koyu Tema: Tema değiştirme desteği
- Hybrid Mode: Supabase olmadan da çalışabilir (mock mode)

## Gereksinimler

- Node.js 20.19.0+ veya 22.12.0+
- pnpm (veya npm/yarn)
- Self-hosted Supabase instance (opsiyonel)

## Hızlı Başlangıç

1. Bağımlılıkları yükleyin: pnpm install
2. Uygulamayı başlatın: pnpm dev
3. Tarayıcıda açın: http://localhost:5173

Detaylı kurulum için SUPABASE_SETUP.md dosyasına bakın.

## Proje Yapısı

- src/stores/ - Pinia state management
- src/views/ - Sayfa bileşenleri
- src/components/ - Tekrar kullanılabilir bileşenler
- src/lib/ - Utility fonksiyonlar (Supabase client)
- supabase/migrations/ - Database şemaları

## Kullanılan Teknolojiler

- Vue 3.5.22
- Pinia 3.0.3
- Vue Router 4.6.3
- Supabase (PostgreSQL, Auth, Realtime)
- Vite 7.1.11
