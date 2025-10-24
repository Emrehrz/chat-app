<script setup>
const today = new Date().toLocaleDateString('tr-TR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
</script>

<template>
  <section class="client-welcome">
    <div class="welcome-container">
      <div class="welcome-header">
        <h1>Merhaba <span class="wave">👋</span></h1>
        <div class="welcome-badge">Yeni Proje</div>
      </div>

      <p class="lead">
        Bu proje üzerinde çalışmaya yeni başladım. Aşağıda projenin mevcut durumu ve iletişim
        bilgileri kısa bir şekilde yer almaktadır.
      </p>

      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Durum</span>
          <span class="status-value">Başlangıç aşaması</span>
        </div>
        <div class="status-item">
          <span class="status-label">Tarih</span>
          <span class="status-value">{{ today }}</span>
        </div>
        <div class="status-item status-item-full">
          <span class="status-label">Kalan not</span>
          <span class="status-value">İlk kurulum, temel sayfalar ve taslak içerik hazırlandı.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.client-welcome {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid rgba(230, 238, 247, 0.6);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: clamp(1.5rem, 5vw, 2.5rem);
  border-radius: 16px;
  margin: clamp(1rem, 3vw, 2rem) auto;
  max-width: min(95vw, 1100px);
}

.welcome-container {
  width: 100%;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wave {
  display: inline-block;
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(14deg);
  }

  20% {
    transform: rotate(-8deg);
  }

  30% {
    transform: rotate(14deg);
  }

  40% {
    transform: rotate(-4deg);
  }

  50% {
    transform: rotate(10deg);
  }

  60% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

.welcome-badge {
  background: #22c55e;
  color: white;
  padding: 0.4em 0.8em;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.lead {
  margin: 0 0 2rem 0;
  color: #475569;
  font-size: clamp(1rem, 2.5vw, 1.125rem);
  line-height: 1.6;
  max-width: 65ch;
}

.status-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(230, 238, 247, 0.8);
  transition: all 0.2s ease;
}

.status-item:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.status-item-full {
  grid-column: 1 / -1;
}

.status-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
