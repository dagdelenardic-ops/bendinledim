import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Clean
    await prisma.tagOnArticle.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.article.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();

    const [haber, tur, inceleme, roportaj, ekipman, derinlemesine] =
      await Promise.all([
        prisma.category.create({
          data: {
            name: "Haber",
            nameEn: "News",
            slug: "haber",
            color: "#d97706",
          },
        }),
        prisma.category.create({
          data: {
            name: "Tur",
            nameEn: "Tour",
            slug: "tur",
            color: "#dc2626",
          },
        }),
        prisma.category.create({
          data: {
            name: "İnceleme",
            nameEn: "Review",
            slug: "inceleme",
            color: "#7c3aed",
          },
        }),
        prisma.category.create({
          data: {
            name: "Röportaj",
            nameEn: "Interview",
            slug: "roportaj",
            color: "#059669",
          },
        }),
        prisma.category.create({
          data: {
            name: "Ekipman",
            nameEn: "Gear",
            slug: "ekipman",
            color: "#2563eb",
          },
        }),
        prisma.category.create({
          data: {
            name: "Derinlemesine",
            nameEn: "Deep Dive",
            slug: "derinlemesine",
            color: "#d946ef",
          },
        }),
      ]);

    const tags = await Promise.all([
      prisma.tag.create({ data: { name: "Vinil", slug: "vinil" } }),
      prisma.tag.create({ data: { name: "Festival", slug: "festival" } }),
      prisma.tag.create({ data: { name: "Analog", slug: "analog" } }),
      prisma.tag.create({ data: { name: "Neo-Soul", slug: "neo-soul" } }),
      prisma.tag.create({ data: { name: "Stüdyo", slug: "studyo" } }),
      prisma.tag.create({ data: { name: "Pedalboard", slug: "pedalboard" } }),
      prisma.tag.create({
        data: { name: "Canlı Performans", slug: "canli-performans" },
      }),
      prisma.tag.create({
        data: { name: "Türkçe Müzik", slug: "turkce-muzik" },
      }),
    ]);

    const articles = [
      {
        title:
          "Vinilin Rönesansı: Z Kuşağı Neden Dijitali Bırakıp Analoga Dönüyor?",
        titleEn:
          "The Renaissance of Vinyl: Why Gen Z is ditching digital for analog",
        slug: "vinilin-ronesansi-z-kusagi-neden-dijitali-birakip-analoga-donuyor",
        content:
          "Müzik endüstrisi son yıllarda beklenmedik bir dönüşüme tanık oluyor. Spotify ve Apple Music gibi platformların hakimiyetine rağmen, vinil plak satışları rekor seviyelere ulaştı.\n\nZ kuşağı, dijital müzik çağında büyümüş olmasına rağmen, fiziksel müzik formatlarına olan ilgisiyle şaşırtıyor. Plak mağazaları yeniden açılıyor, pikap satışları artıyor ve vinil koleksiyonculuğu bir yaşam tarzı haline geliyor.\n\nBu trendin arkasında birkaç önemli neden var. İlk olarak, vinil dinleme deneyimi dijitalden farklı. Plağı zarfından çıkarmak, iğneyi yerleştirmek ve o hafif çıtırtıyı duymak bunların hepsi ritüele dönüşen bir deneyim sunuyor.\n\nİkinci olarak, albüm kapağı sanatı vinil formatında gerçek boyutlarıyla takdir edilebiliyor. Dijitalde birkaç santimetreye sıkışan görsel dünya, plakta adeta poster etkisi yaratıyor.\n\nÜçüncü olarak, vinil koleksiyonculuğu sosyal bir aktivite haline geldi. Plak fuarları, takas etkinlikleri ve özel dinleme geceleri yeni bir topluluk kültürü oluşturuyor.\n\nTürkiye'de de bu trend kendini gösteriyor. İstanbul, İzmir ve Ankara'daki bağımsız plak mağazaları son iki yılda ciddi büyüme kaydetti.",
        excerpt:
          "Z kuşağı dijital müzik çağında büyümüş olmasına rağmen, vinil plak satışlarını rekor seviyelere taşıyor.",
        imageUrl:
          "https://images.unsplash.com/photo-1539375665275-f0680c4fe59e?w=800&q=80",
        author: "Editör Ekibi",
        readTime: 8,
        featured: true,
        published: true,
        categoryId: haber.id,
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[2].id }] },
      },
      {
        title: "Dünya Turu Tarihleri Açıklandı: Retro-Fütürizm 2024",
        slug: "dunya-turu-tarihleri-aciklandi-retro-futurizm-2024",
        content:
          "Yılın en beklenen müzik turnesinin tarihleri nihayet açıklandı. Retro-Fütürizm konseptiyle yola çıkan bu turne, 30 ülkede 75 konser ile müzikseverleri bekliyor.\n\nTurne, İstanbul'da Eylül ayında KüçükÇiftlik Park'ta gerçekleşecek konserle Türkiye'ye de uğrayacak. Biletlerin ön satışta tükenmesi bekleniyor.\n\nSahne tasarımı, retro synth estetiği ile gelecekçi hologram teknolojisini bir araya getiriyor. Görsel ekip, her şehir için farklı açılış sekansları hazırladıklarını açıkladı.\n\nTurneye eşlik edecek canlı ekip de genişletildi. Davul ve basın yanı sıra analog synthesizer performansları için ayrı bir sahne bölümü kuruldu.\n\nOrganizasyon şirketi, karbon ayak izini azaltmak için tren taşımacılığı ve yerel ekipman kiralama modeline geçileceğini duyurdu.",
        excerpt:
          "30 ülkede 75 konser: Retro-Fütürizm turnesinin tarihleri ve Türkiye ayağı açıklandı.",
        imageUrl:
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        author: "Editör Ekibi",
        readTime: 5,
        published: true,
        categoryId: tur.id,
        tags: { create: [{ tagId: tags[1].id }, { tagId: tags[6].id }] },
      },
      {
        title: "Yaz Festivali Kadrosu: Sürpriz Headliner Belli Oldu",
        slug: "yaz-festivali-kadrosu-surpriz-headliner-belli-oldu",
        content:
          "Bu yazın en büyük müzik festivalinin kadrosu açıklandı ve sürpriz isim herkesi şaşırttı. Ana sahnede uluslararası isimlerin yanında bağımsız yerli gruplar da güçlü bir yer buldu.\n\nFestival organizatörleri, bu yılki etkinliğin şimdiye kadarki en büyük festival olacağını duyurdu. Üç gün boyunca beş farklı sahnede toplam 120 sanatçı performans sergileyecek.\n\nYeni eklenen gece programı ile elektronik ve ambient odaklı setler sabaha kadar devam edecek. Sessiz disko alanı da ilk kez bu yıl kurulacak.\n\nBilet satışları rekor kırarak ilk saatte tükendi. Organizasyon, sınırlı sayıda ek günlük bilet için ikinci bir satış penceresi açmayı değerlendiriyor.\n\nUlaşım tarafında şehir merkezinden ring seferleri ve kamp alanına 24 saat shuttle hizmeti planlandı.",
        excerpt:
          "Bu yazın en büyük festivalinin sürpriz headliner'ı açıklandı, biletler ilk saatte tükendi.",
        imageUrl:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        author: "Editör Ekibi",
        readTime: 4,
        published: true,
        categoryId: haber.id,
        tags: { create: [{ tagId: tags[1].id }] },
      },
      {
        title: "Sürpriz Albüm: Gece Melodileri Ekipman Rehberi",
        slug: "surpriz-album-gece-melodileri-ekipman-rehberi",
        content:
          "Bu hafta beklenmedik bir şekilde çıkan 'Gece Melodileri' albümü müzik dünyasını salladı. Albümün en çok konuşulan tarafı ise modern düzenlemelerle sıcak analog dokuyu birlikte sunabilmesi oldu.\n\nProdüktör ekibi, analog synthesizer'lar, vintage mikrofon preamp'ları ve tape machine'ler kullanarak modern bir ses elde etmeyi başarmış.\n\nKayıt zincirinin merkezinde iki farklı preamp karakteri kullanılmış. Vokallerde daha parlak bir ton, davul overhead kanallarında ise daha yuvarlak bir frekans dengesi tercih edilmiş.\n\nMix aşamasında dijital tarafta minimum eklenti kullanılmış; çoğu renk, donanımsal kompresör ve teyp saturasyonu ile verilmiş.\n\nSonuç olarak albüm, kulaklıkta detay veren ama hoparlörde de geniş alan hissini koruyan bir referans mix örneği olarak gösteriliyor.",
        excerpt:
          "Gece Melodileri albümünün arkasındaki analog ekipmanlar ve prodüksiyon sırları.",
        imageUrl:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
        author: "Editör Ekibi",
        readTime: 7,
        published: true,
        categoryId: inceleme.id,
        tags: { create: [{ tagId: tags[2].id }, { tagId: tags[5].id }] },
      },
      {
        title: "Radarın Altında: 2024'ün Yükselen Neo-Soul Yıldızları",
        slug: "radarin-altinda-2024un-yukselen-neo-soul-yildizlari",
        content:
          "Neo-soul müzik sahnesinde yeni bir dalga yükseliyor. 2024 yılında keşfetmeniz gereken isimleri sizin için derledik.\n\nBu sanatçılar, D'Angelo ve Erykah Badu'nun mirasını modern bir yorumla taşıyorlar. RnB, caz armonileri ve elektronik dokular bir arada kullanılıyor.\n\nİlk durağımız İstanbul'un yeraltı müzik sahnesinden çıkan genç yetenekler. Küçük sahnelerde başlayan canlı performanslar artık uluslararası seçki listelerine giriyor.\n\nAnkara ve İzmir ekseninde kurulan kolektifler de dikkat çekiyor. Özellikle canlı nefesliler ve lo-fi davul estetiği yeni işlerin ortak noktası.\n\nBu yükselişin en önemli tarafı ise sürdürülebilir bir dinleyici kitlesi oluşması. Konserler dolarken bağımsız yayınlar da düzenli dinlenme rakamlarına ulaşıyor.",
        excerpt:
          "2024'ün en dikkat çekici neo-soul sanatçıları ve Türkiye'nin yükselen isimleri.",
        imageUrl:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        author: "Sarah Miller",
        readTime: 5,
        editorsPick: true,
        published: true,
        categoryId: roportaj.id,
        tags: { create: [{ tagId: tags[3].id }, { tagId: tags[7].id }] },
      },
      {
        title:
          "Pedalboard Sırrı: Neden Analog Canlı Performansta Daha İyi?",
        slug: "pedalboard-sirri-neden-analog-canli-performansta-daha-iyi",
        content:
          "Dijital efekt işlemcilerin bu kadar gelişmesine rağmen, profesyonel gitaristlerin çoğu hâlâ analog pedalları tercih ediyor. Bunun temel nedeni sahnede güvenilirlik ve dokunsal kontrol hissi.\n\nAnalog pedalların sıcak tonu, doğal kompresyonu ve dinamik tepkisi dijitalden farklı bir his veriyor. Özellikle drive katmanlarında pena vuruşuna verilen tepki daha organik algılanıyor.\n\nDave Chen, 20 yıllık canlı performans deneyimiyle analog pedalların neden vazgeçilmez olduğunu anlatıyor. Ona göre kritik nokta, sahnede menüler arasında kaybolmadan hızlı karar verebilmek.\n\nMüzisyenlerin çoğu hibrit kurulumlara geçse de çekirdek ton zincirinde analog pedalları koruyor. Dijital sistemler daha çok zaman tabanlı efektlerde kullanılıyor.\n\nTeknik ekipler de analog setupların arıza anında daha hızlı çözülebildiğini belirtiyor. Bu da turne operasyonlarında önemli bir avantaj sağlıyor.",
        excerpt:
          "Profesyonel gitaristler neden hâlâ analog pedalları tercih ediyor?",
        imageUrl:
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
        author: "Dave Chen",
        readTime: 12,
        editorsPick: true,
        published: true,
        categoryId: ekipman.id,
        tags: {
          create: [
            { tagId: tags[2].id },
            { tagId: tags[5].id },
            { tagId: tags[6].id },
          ],
        },
      },
      {
        title: "Stüdyonun İçinden: Yılın Albümü Nasıl Yapıldı?",
        slug: "studyonun-icinden-yilin-albumu-nasil-yapildi",
        content:
          "Yılın albümü seçilen yapımın arkasındaki hikaye, stüdyo süreçleri ve yaratıcı kararlar hakkında derinlemesine bir bakış.\n\nAlbüm, İstanbul'un tarihi bir semtindeki dönüştürülmüş bir depoda kaydedildi. Mekanın yüksek tavanı ve taş duvarları doğal bir ambience verdiği için yapay reverb kullanımı minimumda tutuldu.\n\nKayıt süreci altı ay sürdü. 200'den fazla parça kaydedildi ve bunlardan sadece 12'si albüme girdi. Seçim sürecinde şarkıların teknik kusursuzluğundan çok duygu geçişi öne alındı.\n\nDavul kayıtlarında tek take performanslara özellikle alan açıldı. Prodüktör, tempo dalgalanmalarının parçaların canlılığını artırdığını savunuyor.\n\nMix ve mastering etapları için üç farklı dinleme ortamında test yapıldı: stüdyo monitörü, kulaklık ve küçük bluetooth hoparlör. Böylece albümün her cihazda benzer enerji vermesi hedeflendi.",
        excerpt:
          "Yılın albümünün arkasındaki hikaye: 6 aylık kayıt süreci ve İstanbul'daki tarihi stüdyo.",
        imageUrl:
          "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80",
        author: "Editör Ekibi",
        readTime: 15,
        editorsPick: true,
        published: true,
        categoryId: derinlemesine.id,
        tags: { create: [{ tagId: tags[4].id }, { tagId: tags[7].id }] },
      },
    ];

    const createdArticles = [];
    for (const article of articles) {
      const createdArticle = await prisma.article.create({ data: article });
      createdArticles.push(createdArticle);
    }

    const articleBySlug = new Map(
      createdArticles.map((article) => [article.slug, article.id])
    );

    const comments = [
      {
        slug: "vinilin-ronesansi-z-kusagi-neden-dijitali-birakip-analoga-donuyor",
        author: "Merve A.",
        content:
          "Plak dinleme deneyimi gerçekten farklı. Özellikle albüm kapaklarını büyük görmek çok keyifli.",
      },
      {
        slug: "vinilin-ronesansi-z-kusagi-neden-dijitali-birakip-analoga-donuyor",
        author: "Cem K.",
        content:
          "Kadıköy'deki yeni plakçıları geziyorum, yazıdaki gözlemler birebir doğru.",
      },
      {
        slug: "dunya-turu-tarihleri-aciklandi-retro-futurizm-2024",
        author: "Ekin Y.",
        content:
          "İstanbul tarihi kesinleşirse bilet alarmı kuracağım. Sahne tasarımı kısmı çok heyecan verici.",
      },
      {
        slug: "yaz-festivali-kadrosu-surpriz-headliner-belli-oldu",
        author: "Burak T.",
        content:
          "Gece programı eklenmesi harika olmuş. Ulaşım için ring planı da iyi düşünülmüş.",
      },
      {
        slug: "surpriz-album-gece-melodileri-ekipman-rehberi",
        author: "Selin D.",
        content:
          "Ekipman zinciri detaylarını daha çok görmek isterim. Özellikle vokal preamp seçimi çok iyiymiş.",
      },
      {
        slug: "radarin-altinda-2024un-yukselen-neo-soul-yildizlari",
        author: "Onur P.",
        content:
          "Bu listedeki iki ismi canlı izledim, sahnede gerçekten çok güçlüler.",
      },
      {
        slug: "pedalboard-sirri-neden-analog-canli-performansta-daha-iyi",
        author: "Arda G.",
        content:
          "Hibrit setup kullanıyorum, drive tarafında analog gerçekten daha iyi tepki veriyor.",
      },
      {
        slug: "studyonun-icinden-yilin-albumu-nasil-yapildi",
        author: "Buse N.",
        content:
          "Tek take performans yaklaşımı çok doğru. Albümdeki canlılık hissi buradan geliyor.",
      },
    ];

    await prisma.comment.createMany({
      data: comments
        .map((comment) => {
          const articleId = articleBySlug.get(comment.slug);
          if (!articleId) return null;
          return {
            articleId,
            author: comment.author,
            content: comment.content,
            approved: true,
          };
        })
        .filter((comment) => comment !== null),
    });

    return NextResponse.json({
      message: "Seed completed!",
      articleCount: articles.length,
      commentCount: comments.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
