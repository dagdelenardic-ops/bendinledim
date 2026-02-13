import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.tagOnArticle.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();

  // Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Haber", nameEn: "News", slug: "haber", color: "#d97706" },
    }),
    prisma.category.create({
      data: { name: "Tur", nameEn: "Tour", slug: "tur", color: "#dc2626" },
    }),
    prisma.category.create({
      data: { name: "İnceleme", nameEn: "Review", slug: "inceleme", color: "#7c3aed" },
    }),
    prisma.category.create({
      data: { name: "Röportaj", nameEn: "Interview", slug: "roportaj", color: "#059669" },
    }),
    prisma.category.create({
      data: { name: "Ekipman", nameEn: "Gear", slug: "ekipman", color: "#2563eb" },
    }),
    prisma.category.create({
      data: { name: "Derinlemesine", nameEn: "Deep Dive", slug: "derinlemesine", color: "#d946ef" },
    }),
  ]);

  const [haber, tur, inceleme, roportaj, ekipman, derinlemesine] = categories;

  // Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Vinil", slug: "vinil" } }),
    prisma.tag.create({ data: { name: "Festival", slug: "festival" } }),
    prisma.tag.create({ data: { name: "Analog", slug: "analog" } }),
    prisma.tag.create({ data: { name: "Neo-Soul", slug: "neo-soul" } }),
    prisma.tag.create({ data: { name: "Stüdyo", slug: "studyo" } }),
    prisma.tag.create({ data: { name: "Pedalboard", slug: "pedalboard" } }),
    prisma.tag.create({ data: { name: "Canlı Performans", slug: "canli-performans" } }),
    prisma.tag.create({ data: { name: "Türkçe Müzik", slug: "turkce-muzik" } }),
  ]);

  // Articles
  await prisma.article.create({
    data: {
      title: "Vinilin Rönesansı: Z Kuşağı Neden Dijitali Bırakıp Analoga Dönüyor?",
      titleEn: "The Renaissance of Vinyl: Why Gen Z is ditching digital for analog",
      slug: "vinilin-ronesansi-z-kusagi-neden-dijitali-birakip-analoga-donuyor",
      content: `Müzik endüstrisi son yıllarda beklenmedik bir dönüşüme tanık oluyor. Spotify ve Apple Music gibi platformların hakimiyetine rağmen, vinil plak satışları rekor seviyelere ulaştı.\n\nZ kuşağı, dijital müzik çağında büyümüş olmasına rağmen, fiziksel müzik formatlarına olan ilgisiyle şaşırtıyor. Plak mağazaları yeniden açılıyor, pikap satışları artıyor ve vinil koleksiyonculuğu bir yaşam tarzı haline geliyor.\n\nBu trendin arkasında birkaç önemli neden var. İlk olarak, vinil dinleme deneyimi dijitalden farklı. Plağı zarfından çıkarmak, iğneyi yerleştirmek ve o hafif çıtırtıyı duymak - bunların hepsi ritüele dönüşen bir deneyim sunuyor.\n\nİkinci olarak, albüm kapağı sanatı vinil formatında gerçek boyutlarıyla takdir edilebiliyor. Spotify'da küçük bir kare olan kapak, 30x30 cm'lik bir vinil zarfında tam bir sanat eserine dönüşüyor.\n\nÜçüncü olarak, vinil koleksiyonculuğu sosyal bir aktivite haline geldi. Plak mağazalarında saatlerce geçirilen zaman, diğer müzikseverlerle tanışma fırsatı sunuyor.\n\nTürkiye'de de bu trend kendini gösteriyor. İstanbul'daki bağımsız plak mağazaları son iki yılda yüzde 40 büyüme kaydetti.`,
      excerpt: "Z kuşağı dijital müzik çağında büyümüş olmasına rağmen, vinil plak satışlarını rekor seviyelere taşıyor.",
      imageUrl: "https://images.unsplash.com/photo-1539375665275-f0680c4fe59e?w=800&q=80",
      author: "Editör Ekibi",
      readTime: 8,
      featured: true,
      editorsPick: false,
      published: true,
      categoryId: haber.id,
      tags: { create: [{ tagId: tags[0].id }, { tagId: tags[2].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Dünya Turu Tarihleri Açıklandı: Retro-Fütürizm 2024",
      slug: "dunya-turu-tarihleri-aciklandi-retro-futurizm-2024",
      content: `Yılın en beklenen müzik turnesinin tarihleri nihayet açıklandı. Retro-Fütürizm konseptiyle yola çıkan bu turne, 30 ülkede 75 konser ile müzikseverleri bekliyor.\n\nTurne, İstanbul'da Eylül ayında KüçükÇiftlik Park'ta gerçekleşecek konserle Türkiye'ye de uğrayacak. Biletler önümüzdeki hafta satışa çıkıyor.\n\nSahne tasarımı, retro synth estetiği ile gelecekçi hologram teknolojisini bir araya getiriyor.`,
      excerpt: "30 ülkede 75 konser: Retro-Fütürizm turnesinin tarihleri ve Türkiye ayağı açıklandı.",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      author: "Editör Ekibi",
      readTime: 5,
      featured: false,
      published: true,
      categoryId: tur.id,
      tags: { create: [{ tagId: tags[1].id }, { tagId: tags[6].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Yaz Festivali Kadrosu: Sürpriz Headliner Belli Oldu",
      slug: "yaz-festivali-kadrosu-surpriz-headliner-belli-oldu",
      content: `Bu yazın en büyük müzik festivalinin kadrosu açıklandı ve sürpriz isim herkesi şaşırttı.\n\nFestival organizatörleri, bu yılki etkinliğin şimdiye kadarki en büyük festival olacağını duyurdu. Üç gün boyunca beş farklı sahnede toplam 120 sanatçı performans sergileyecek.\n\nBilet satışları rekor kırarak ilk saatte tükendi.`,
      excerpt: "Bu yazın en büyük festivalinin sürpriz headliner'ı açıklandı, biletler ilk saatte tükendi.",
      imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
      author: "Editör Ekibi",
      readTime: 4,
      featured: false,
      published: true,
      categoryId: haber.id,
      tags: { create: [{ tagId: tags[1].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Sürpriz Albüm: Gece Melodileri Ekipman Rehberi",
      slug: "surpriz-album-gece-melodileri-ekipman-rehberi",
      content: `Bu hafta beklenmedik bir şekilde çıkan 'Gece Melodileri' albümü müzik dünyasını salladı.\n\nProdüktör ekibi, analog synthesizer'lar, vintage mikrofon preamp'ları ve tape machine'ler kullanarak modern bir ses elde etmeyi başarmış.`,
      excerpt: "Gece Melodileri albümünün arkasındaki analog ekipmanlar ve prodüksiyon sırları.",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
      author: "Editör Ekibi",
      readTime: 7,
      featured: false,
      published: true,
      categoryId: inceleme.id,
      tags: { create: [{ tagId: tags[2].id }, { tagId: tags[5].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Radarın Altında: 2024'ün Yükselen Neo-Soul Yıldızları",
      slug: "radarin-altinda-2024un-yukselen-neo-soul-yildizlari",
      content: `Neo-soul müzik sahnesinde yeni bir dalga yükseliyor. 2024 yılında keşfetmeniz gereken isimleri sizin için derledik.\n\nBu sanatçılar, D'Angelo ve Erykah Badu'nun mirasını modern bir yorumla taşıyorlar.\n\nİlk durağımız İstanbul'un yeraltı müzik sahnesinden çıkan genç yetenekler.`,
      excerpt: "2024'ün en dikkat çekici neo-soul sanatçıları ve Türkiye'nin yükselen isimleri.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      author: "Sarah Miller",
      readTime: 5,
      featured: false,
      editorsPick: true,
      published: true,
      categoryId: roportaj.id,
      tags: { create: [{ tagId: tags[3].id }, { tagId: tags[7].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Pedalboard Sırrı: Neden Analog Canlı Performansta Daha İyi?",
      slug: "pedalboard-sirri-neden-analog-canli-performansta-daha-iyi",
      content: `Dijital efekt işlemcilerin bu kadar gelişmesine rağmen, profesyonel gitaristlerin çoğu hâlâ analog pedalları tercih ediyor.\n\nAnalog pedalların sıcak tonu, doğal kompresyonu ve dinamik tepkisi dijitalden farklı bir his veriyor.\n\nDave Chen, 20 yıllık canlı performans deneyimiyle analog pedalların neden vazgeçilmez olduğunu anlatıyor.`,
      excerpt: "Profesyonel gitaristler neden hâlâ analog pedalları tercih ediyor?",
      imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
      author: "Dave Chen",
      readTime: 12,
      featured: false,
      editorsPick: true,
      published: true,
      categoryId: ekipman.id,
      tags: { create: [{ tagId: tags[2].id }, { tagId: tags[5].id }, { tagId: tags[6].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: "Stüdyonun İçinden: Yılın Albümü Nasıl Yapıldı?",
      slug: "studyonun-icinden-yilin-albumu-nasil-yapildi",
      content: `Yılın albümü seçilen yapımın arkasındaki hikaye, stüdyo süreçleri ve yaratıcı kararlar hakkında derinlemesine bir bakış.\n\nAlbüm, İstanbul'un tarihi bir semtindeki dönüştürülmüş bir depoda kaydedildi.\n\nKayıt süreci altı ay sürdü. Bu süre zarfında 200'den fazla parça kaydedildi ve bunlardan sadece 12'si albüme girdi.`,
      excerpt: "Yılın albümünün arkasındaki hikaye: 6 aylık kayıt süreci ve İstanbul'daki tarihi stüdyo.",
      imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80",
      author: "Editör Ekibi",
      readTime: 15,
      featured: false,
      editorsPick: true,
      published: true,
      categoryId: derinlemesine.id,
      tags: { create: [{ tagId: tags[4].id }, { tagId: tags[7].id }] },
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
