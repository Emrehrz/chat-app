# Supabase Setup Guide

Chat uygulamasını self-hosted Supabase'e bağlamak için adım adım rehber.

## Önkoşullar

- Docker ve Docker Compose
- Node.js 20+
- Git

## Adım 1: Supabase CLI Kurulumu

npm install -g supabase

## Adım 2: Supabase Başlatma

supabase start

Çıktıda göreceğiniz bilgileri not edin:

- API URL: http://localhost:54321
- anon key: eyJhbGc...

## Adım 3: Environment Variables

.env dosyasını oluşturun:

VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key>

## Adım 4: Database Migration

supabase db push

Veya manuel olarak:

1. http://localhost:54323 (Supabase Studio)
2. SQL Editor'e gidin
3. supabase/migrations/001_initial_schema.sql içeriğini yapıştırın
4. Run butonuna tıklayın

## Adım 5: Kontrol

Supabase Studio'da Table Editor'de şu tabloları göreceksiniz:

- profiles
- chats
- chat_members
- messages

## Adım 6: Test Kullanıcısı

Supabase Studio > Authentication > Users > Add user

Email: test@example.com
Password: password123

## Adım 7: Uygulamayı Başlatma

pnpm install
pnpm dev

Tarayıcıda: http://localhost:5173

## Sorun Giderme

### Supabase is not configured

- .env dosyasını kontrol edin
- Dev server'ı yeniden başlatın

### Database bağlantı hatası

supabase status
supabase stop
supabase start

### Migration hatası

supabase db reset

## Production Deploy

1. https://supabase.com'da hesap oluşturun
2. Yeni proje oluşturun
3. Settings > API'den URL ve key alın
4. .env dosyasını güncelleyin
5. Migration'ı SQL Editor'de çalıştırın
6. pnpm build
7. dist/ klasörünü deploy edin

## Kaynaklar

- Supabase Docs: https://supabase.com/docs
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Supabase Auth: https://supabase.com/docs/guides/auth
