# MNC Ürün Evreni

MNC İlaç ürünleri için Next.js App Router, TypeScript ve Tailwind CSS ile hazırlanmış full-screen ürün seçim sahnesi. Bu revizyonda klasik katalog, kategori filtresi, ürün grid’i ve ürün detay sayfaları yoktur; deneyim tek bir hero/canvas hissi veren `/urun-katalog` ekranında çalışır.

## Local Çalıştırma

```bash
pnpm dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın. `/` otomatik olarak `/urun-katalog` sayfasına yönlenir.

Kontrol komutları:

```bash
pnpm lint
pnpm build
```

## Ürün Görselleri

Transparan PNG ürün görsellerini şu klasöre ekleyin:

```txt
public/products/
```

Bu sürümde kullanılan dosya adları:

- `UMBRELLA-MAGNEZYUM.png`
- `PAPIOMEX.png`
- `PREFOLIC-PLUS.png`
- `PLENTYFERT-MEN.png`
- `PLENTYFERT-WOMEN.png`
- `PREFOLIC.png`
- `UMBRELLA-PLUS-PREMIUM.png`
- `TEST-PLUS.png`
- `JOINT-1500.png`
- `UMBRELLA-PROBIYOTIK.png`
- `OMEGA-3.png`
- `OMEGA-3-6-9.png`
- `UMBRELLA-B12.png`
- `COCOSH-PLUS.png`
- `PLENTYFERT-SACHET.png`
- `UMBRELLA-SITIKOLIN-OMEGA-3.png`
- `UMBRELLA-KIDS.png`
- `UMBRELLA-VITAMIN-C.png`
- `WAGIBOREX.png`

Görsel yoksa sahne kırılmaz; ürün figürü yerine cam/transparan ambalaj hissi veren fallback mockup gösterilir.

## Ürün Datası

Ürünler buradan düzenlenir:

```txt
src/data/products.ts
```

`externalUrl` alanları MNC ürün sayfalarındaki mevcut ürün URL’lerine bağlandı. Ürün linkleri değişirse her ürün için bu alanı güncelleyin.

## Route Yapısı

- `/urun-katalog`: full-screen interaktif ürün seçim sahnesi.
- `/sitemap.xml`: katalog sayfası için sitemap.

Şimdilik `/urunler/[slug]` ürün detay sayfaları kullanılmaz.

## Vercel Deploy

1. Projeyi GitHub, GitLab veya Bitbucket reposuna gönderin.
2. Vercel üzerinde yeni proje olarak içe aktarın.
3. Build komutu: `pnpm build`
4. Install komutu: `pnpm install`
5. Final domain hazır olduğunda `NEXT_PUBLIC_SITE_URL=https://alanadiniz.com` ortam değişkenini ekleyin.

## Gelecek 3D Hazırlığı

Bu sürüm Three.js, WebGL, GLB veya model-viewer kullanmaz. İleride gerçek 3D dosyalar hazırlanırsa sadece ilgili ürünlerde lazy-loaded ayrı bir 3D viewer eklenebilir. Mevcut v1 deneyimi hafif, hızlı ve 2D PNG tabanlı kalmalıdır.
