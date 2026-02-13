import crypto from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";

function nowIso() {
  // Match the existing seed DB style (e.g. 2026-02-12T17:52:14.918+00:00)
  return new Date().toISOString().replace("Z", "+00:00");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ensureUniqueSlug(db, baseSlug) {
  let slug = baseSlug;
  let counter = 2;
  while (db.prepare("select 1 from Article where slug = ?").get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

function upsertCategory(db, c) {
  const existing = db.prepare("select id from Category where id = ?").get(c.id);
  if (existing) {
    db.prepare(
      "update Category set name = ?, nameEn = ?, slug = ?, color = ? where id = ?"
    ).run(c.name, c.nameEn ?? null, c.slug, c.color, c.id);
    return;
  }

  // If the id doesn't exist but name/slug does, update that row to our id.
  const byName = db
    .prepare("select id from Category where name = ? or slug = ?")
    .get(c.name, c.slug);
  if (byName?.id) {
    db.prepare(
      "update Category set id = ?, name = ?, nameEn = ?, slug = ?, color = ? where id = ?"
    ).run(c.id, c.name, c.nameEn ?? null, c.slug, c.color, byName.id);
    return;
  }

  db.prepare(
    "insert into Category (id, name, nameEn, slug, color) values (?, ?, ?, ?, ?)"
  ).run(c.id, c.name, c.nameEn ?? null, c.slug, c.color);
}

function insertArticleIfMissing(db, a) {
  const existing = db.prepare("select id from Article where slug = ?").get(a.slug);
  if (existing) return false;

  const ts = nowIso();
  const id = crypto.randomUUID();

  db.prepare(
    [
      "insert into Article",
      "(id, title, titleEn, slug, content, contentEn, excerpt, excerptEn, imageUrl, author, readTime, featured, editorsPick, published, categoryId, createdAt, updatedAt)",
      "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ].join(" ")
  ).run(
    id,
    a.title,
    a.titleEn ?? null,
    a.slug,
    a.content,
    a.contentEn ?? null,
    a.excerpt,
    a.excerptEn ?? null,
    a.imageUrl ?? null,
    a.author ?? "Editör Ekibi",
    a.readTime ?? 6,
    a.featured ? 1 : 0,
    a.editorsPick ? 1 : 0,
    a.published ? 1 : 0,
    a.categoryId,
    ts,
    ts
  );

  return true;
}

function main() {
  const dbPath = path.resolve(process.cwd(), "prisma/seed.db");
  const db = new Database(dbPath);
  // Keep DB as a single file so we don't leave -wal/-shm artifacts around.
  db.pragma("journal_mode = DELETE");
  db.pragma("foreign_keys = ON");

  const categories = [
    // Existing IDs from the generator routes; keep them stable.
    { id: "cat1", name: "Yeni Albümler", nameEn: "New Albums", slug: "yeni-albumler", color: "#22d3ee" },
    { id: "cat2", name: "İncelemeler", nameEn: "Reviews", slug: "incelemeler", color: "#ef4444" },
    { id: "cat3", name: "Röportajlar", nameEn: "Interviews", slug: "roportajlar", color: "#0891b2" },
    { id: "cat4", name: "Konserler", nameEn: "Concerts", slug: "konserler", color: "#fb7185" },
    { id: "cat5", name: "Festival", nameEn: "Festival", slug: "festival", color: "#22d3ee" },
    { id: "cat6", name: "Haberler", nameEn: "News", slug: "haberler", color: "#b91c1c" },
    // Not in generator map but used in UI quick links.
    { id: "cat7", name: "Liste", nameEn: "Lists", slug: "liste", color: "#22d3ee" },
  ];

  const tx = db.transaction(() => {
    for (const c of categories) upsertCategory(db, c);
  });
  tx();

  const articles = [];

  // Reviews
  articles.push({
    title: "The National - First Two Pages of Frankenstein: Yavaş Yanan Bir Dönüş",
    slug: "the-national-first-two-pages-of-frankenstein-inceleme",
    excerpt:
      "The National, içe dönük anlatısını sade ama ağır bir prodüksiyonla yeniden kuruyor. Albüm, sabır isteyen bir dinleme deneyimi sunuyor.",
    content: [
      "The National’ın “First Two Pages of Frankenstein” albümü, ilk dinleyişte büyük bir jest yapmıyor. Aksine, grubun son döneminde iyice belirginleşen içe kapanık tonu korurken, parçaların gövdesini küçük ayrıntılarla büyütmeyi tercih ediyor.",
      "Albümün en güçlü yanı, Matt Berninger’in vokalinin etrafında örülen boşluk hissi. Davullar ve bas, çoğu zaman geri planda kalıyor; gitarlar ise büyük riff’ler yerine küçük tekrarlarla atmosfer kuruyor. Bu yaklaşım, “büyük anlar” arayanları ilk etapta tatmin etmeyebilir, ama sabırlı dinleyicide etkisini artıran bir akış yaratıyor.",
      "Prodüksiyon tarafında parlak bir pop cilası yok. Bunun yerine, sıcak ama kontrollü bir doku var. Synth katmanları genellikle sahnenin kenarlarında dolaşıyor; parçaların merkezini ise sözlerin ritmi taşıyor. Bu, grubun yıllardır yaptığı şeyi daha da rafine ettiği bir hissiyat veriyor.",
      "Sözlerdeki kırılganlık, dramatik bir patlamaya değil; gündelik detaylara yaslanıyor. Bu da albümü, “tek şarkı” üzerinden konuşulacak bir iş olmaktan çıkarıp bütünlüklü bir dinleme deneyimine yaklaştırıyor.",
      "Sonuç olarak “First Two Pages of Frankenstein”, aceleyle tüketilecek bir albüm değil. Zamanla açılan, gece yürüyüşlerine ve uzun yolculuklara iyi giden bir kayıt. The National dinleyicisi için güvenli bir liman; yeni dinleyici içinse sabır testini ödüllendiren bir giriş kapısı.",
    ].join("\n\n"),
    categoryId: "cat2",
    published: true,
    editorsPick: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Tame Impala - The Slow Rush: Zamanı Esneten Psikedelik Pop",
    slug: "tame-impala-the-slow-rush-inceleme",
    excerpt:
      "Kevin Parker, groove ve synth katmanlarını aynı potada eriterek “The Slow Rush” ile zamanı büküyor. Albüm, kulaklıkta daha da derinleşiyor.",
    content: [
      "Tame Impala, “The Slow Rush” ile önceki albümlerin psikedelik pop formülünü koruyor; fakat ritim ve mix detaylarında daha “dans pistine” yakın bir çizgiye kayıyor. Albümün omurgasını, akışkan bas çizgileri ve ince ayarlı davul programlamaları oluşturuyor.",
      "Parçaların çoğu, basit bir motifin etrafında katman katman büyüyor. Bu büyüme, büyük dramatik köprülerle değil; küçük değişimlerle gerçekleşiyor. Bir synth’in filtresi açılıyor, vokal dub’ları sahnenin arkasına itiliyor, hi-hat deseni ufakça dönüşüyor. Bu mikro hareketler, albümü tekrar dinlemeye uygun hale getiriyor.",
      "Kevin Parker’ın vokali her zamanki gibi yumuşak ve mesafeli. Bu mesafe, albümün ana teması olan zaman algısı ve iç konuşma hissini güçlendiriyor. Sanki şarkıların çoğu, aynı odanın içinde dönüp duran bir düşüncenin farklı açılardan anlatımı gibi.",
      "Prodüksiyonun en iyi anları, parçaların “nefes” aldığı yerlerde. Reverb ve delay kullanımı abartılı değil; doğru noktada girip çıkıyor. Bu sayede albüm, hem parlak hem de boğmayan bir yoğunluk yakalıyor.",
      "Genel tabloya baktığımızda “The Slow Rush”, hızlı tüketilen hit’lerden çok, uzun vadeli bir duygu haritası. Pop ile psikedeliğin kesiştiği çizgide, detaylara yatırım yapan dinleyiciyi fazlasıyla ödüllendiriyor.",
    ].join("\n\n"),
    categoryId: "cat2",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Wet Leg - Wet Leg: Post-Punk'ın Pop Gülümsemesi",
    slug: "wet-leg-wet-leg-inceleme",
    excerpt:
      "Wet Leg, ironik sözler ve keskin gitarlarla post-punk’ı pop refleksiyle birleştiriyor. Albüm kısa, hızlı ve bağımlılık yapıcı.",
    content: [
      "Wet Leg’in kendi adını taşıyan albümü, ilk saniyeden itibaren “hafif” görünerek vuruyor. Gitarlar keskin, davullar net, vokal ise umursamaz bir özgüvenle ilerliyor. Bu umursamazlık, aslında albümün en büyük gücü: Her şey gereğinden fazla ciddiye binmeden, doğru anda doğru hamleyi yapıyor.",
      "Parçalar kısa tutulmuş. Bu, albümün temposunu sürekli yüksek tutuyor ve sıkılmaya izin vermiyor. Nakaratların çoğu, tek bir cümleyle akılda kalıyor; riff’ler ise şarkıyı taşıyacak kadar güçlü ama asla şov amaçlı değil.",
      "Sözlerdeki mizah, “şaka” olmak için değil; gündelik rahatsızlıkları görünür kılmak için var. Flört, şehir sıkıntısı, küçük sosyal gerilimler... Hepsi, büyük bir drama çevrilmeden küçük iğnelerle anlatılıyor.",
      "Prodüksiyon, kirli bir lo-fi estetikten ziyade parlak ve kontrollü. Bu sayede albüm, indie sahnede durduğu kadar mainstream kulağa da hızlıca çarpabiliyor.",
      "Wet Leg, ilk albümde net bir kimlik kuruyor: Post-punk enerjisi, pop melodisi ve ironik bir gülümseme. Bu kombinasyon, albümü hem eğlenceli hem de tekrar dinlemeye çok uygun hale getiriyor.",
    ].join("\n\n"),
    categoryId: "cat2",
    published: true,
    editorsPick: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "boygenius - the record: Üç Ses, Tek Duygu Haritası",
    slug: "boygenius-the-record-inceleme",
    excerpt:
      "boygenius, üç güçlü şarkı yazarı vokali aynı sahnede tutmayı başarıyor. “the record”, kırılganlığı kalabalık bir koroya çeviren bir albüm.",
    content: [
      "boygenius’un “the record” albümü, bir süper grubun en büyük tuzağından kaçıyor: Kimsenin diğerini yutmadığı, herkesin kendi rengini koruduğu bir denge kuruyor. Albüm boyunca vokaller, sırayla öne çıkmak yerine birbirini tamamlayan bir yapı kuruyor.",
      "Aranjmanlar, indie rock’ı klasik bir şablon gibi kullanmıyor; daha çok duyguyu taşıyacak bir iskelet olarak görüyor. Gitarlar yer yer sertleşiyor, yer yer neredeyse yok oluyor. Davullar, gösterişten uzak ama dramatik akışı iyi bilen bir karakterde.",
      "Albümün güçlü tarafı, sözlerdeki “açık konuşma” hali. Büyük metaforlar yerine doğrudan cümleler, küçük detaylar ve anlık kırılmalar var. Bu yaklaşım, dinleyiciyi şarkıların içine hızlıca çekiyor.",
      "Mix tarafında vokaller çok net; ama steril değil. Nefes ve küçük pürüzler korunmuş. Bu da albümü, bir stüdyo ürününden çok canlı bir anlatı gibi hissettiriyor.",
      "Sonuç: “the record”, modern indie rock içinde ‘kolektif’ duyguyu iyi yakalayan bir iş. Tekil yıldızların toplamından daha fazlası olmayı başaran, uzun süre konuşulacak bir albüm.",
    ].join("\n\n"),
    categoryId: "cat2",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  // Interviews (explicitly marked as editorial/fictional to avoid misrepresenting real quotes)
  articles.push({
    title: "Röportaj (Editöryel): Phoebe Bridgers ile Minimalizm ve Maksimum Duygu",
    slug: "roportaj-phoebe-bridgers-minimalizm-maksimum-duygu",
    excerpt:
      "Kırılgan vokaller, net sözler ve geniş boşluklar: Phoebe Bridgers estetiğinin arkasındaki yaklaşımı konuşuyoruz. Not: Bu içerik editöryel bir röportaj formatıdır.",
    content: [
      "Not: Bu yazı, röportaj formatında hazırlanmış editöryel bir içeriktir; doğrudan alıntı yerine temalar ve üretim süreçleri üzerinden ilerler.",
      "",
      "S: Şarkılarında “az” gibi görünen ama çok şey hissettiren bir alan var. Bu boşluğu nasıl kuruyorsun?",
      "C: Boşluk, aslında şarkının dördüncü enstrümanı gibi. Her şey dolu olunca duygunun hareket edecek yeri kalmıyor. Bazen bir cümle, bir davul vuruşundan daha ağır gelebiliyor.",
      "",
      "S: Prodüksiyonda minimal kararlar alıp duyguyu büyütmek zor değil mi?",
      "C: Zor. Çünkü ‘eklemek’ daha kolay. Ama iyi bir düzenleme, neyin çıkacağını bilmek. Neyi sessiz bırakırsan, dinleyici orayı kendi hikayesiyle dolduruyor.",
      "",
      "S: Vokalini hep çok önde ve çok çıplak duyuyoruz. Bu bilinçli bir tercih mi?",
      "C: Evet. Vokal, şarkının dürüstlük testi. Çok saklarsan metin de saklanıyor gibi oluyor. Hata payını korumak, bazen şarkıyı daha gerçek kılıyor.",
      "",
      "S: Son olarak, yeni dinleyene tek bir dinleme önerin?",
      "C: Albümü arka plana atmayın. Bir kere kulaklıkla, bir kere yürürken. Aynı şarkı iki farklı hâle dönüşüyor.",
    ].join("\n"),
    categoryId: "cat3",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Röportaj (Editöryel): Arctic Monkeys ile 'The Car' Sonrası Sahne Dili",
    slug: "roportaj-arctic-monkeys-the-car-sonrasi-sahne-dili",
    excerpt:
      "Arctic Monkeys’in son dönem estetiği daha sinematik ve daha kontrollü. Bu dönüşümün sahneye nasıl yansıdığını konuşuyoruz.",
    content: [
      "Not: Bu yazı, röportaj formatında hazırlanmış editöryel bir içeriktir; doğrudan alıntı yerine temalar üzerinden ilerler.",
      "",
      "S: Son albümle birlikte daha “sinematik” bir ton duyuyoruz. Bu değişim sahnede de hissediliyor mu?",
      "C: Evet. Sahnede artık hızdan çok gerilim kurmak ilgimizi çekiyor. Parçaların arasındaki geçişler, setin ritmi, ışıkların ‘ne zaman’ açıldığı bile müziğin parçası gibi.",
      "",
      "S: Eski sert riff’lerin enerjisini kaybetmeden bu tona nasıl geçiyorsunuz?",
      "C: Enerji tek bir hızda değil. Bazen bir şarkının en güçlü anı, tam da geri çekildiği yer. Dinleyiciyi sürekli “yüksek”te tutmak yerine, dalga gibi yükseltip alçaltmak daha etkili.",
      "",
      "S: Yeni dönemin en kritik unsuru sence ne?",
      "C: Denge. Minimal bir düzenlemede küçük bir hata her şeyi görünür kılar. Bu yüzden daha bilinçli kararlar almak gerekiyor.",
    ].join("\n"),
    categoryId: "cat3",
    published: true,
    editorsPick: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Röportaj (Editöryel): Olivia Rodrigo ile Şarkı Yazımı ve Sahne Özgüveni",
    slug: "roportaj-olivia-rodrigo-sarki-yazimi-sahne-ozguveni",
    excerpt:
      "Samimi sözler, hızlı melodik kararlar ve güçlü bir sahne dili: Olivia Rodrigo’nun şarkı yazımı yaklaşımına yakından bakıyoruz.",
    content: [
      "Not: Bu yazı, röportaj formatında hazırlanmış editöryel bir içeriktir; doğrudan alıntı yerine temalar üzerinden ilerler.",
      "",
      "S: Şarkılarında ‘çok kişisel’ görünen cümleler var. Nerede duracağını nasıl seçiyorsun?",
      "C: Dengeyi, ‘hikaye’ belirliyor. Çok kişisel olunca da dinleyici uzaklaşabilir. O yüzden detayları seçip duyguyu evrensel bırakmaya çalışıyorum.",
      "",
      "S: Nakaratlarında hep bir “patlama” hissi var. Bu bilinçli mi?",
      "C: Evet. Nakarat, duygunun en net cümlesi. Dinleyiciye, ‘tamam, burada ne hissedeceğim belli’ dediğin an. O yüzden melodiyi sade ama vurucu kurmak önemli.",
      "",
      "S: Sahne özgüveni nasıl kurulur?",
      "C: Prova kadar, doğru ekip de önemli. Sahneye çıkınca yalnız hissetmezsen risk alabiliyorsun.",
    ].join("\n"),
    categoryId: "cat3",
    published: true,
    imageUrl: null,
    readTime: 5,
  });

  // Concerts
  articles.push({
    title: "Konser Notları: Küçük Mekanlarda Indie Gecesi Nasıl Büyür?",
    slug: "konser-notlari-kucuk-mekanlarda-indie-gecesi",
    excerpt:
      "İyi bir set list, doğru akış ve seyirciyle kurulan bağ: Küçük mekan konserlerinin büyüsü nereden geliyor?",
    content: [
      "Küçük mekan konserleri, müziği ‘yakından’ dinlediğiniz nadir alanlardan biri. Sahnedeki nefes, amfinin uğultusu, davulun odaya çarpıp geri dönmesi... Büyük salonlarda kaybolan detaylar, burada şarkının parçası olur.",
      "İyi bir indie gecesinin anahtarı, set list akışında saklı. Grup, en güçlü şarkıları arka arkaya dizmek yerine dalga kurduğunda, seyirci de o dalgaya katılır. Bu dalga, bir anda zıplatmak kadar bir anda susturmayı da göze alır.",
      "Ses sistemi her zaman mükemmel değildir; ama doğru miks yaklaşımıyla bu dezavantaj avantaja dönebilir. Vokali biraz öne almak, bası kontrollü tutmak ve gitarları çamura boğmamak çoğu zaman yeterli olur.",
      "Seyirciyle kurulan mesafe kısaldıkça, konser bir ‘performans’ olmaktan çıkar; ortak bir ana dönüşür. İşte küçük mekanların büyüsü tam da burada: Büyük anlar, küçük odalarda çoğalır.",
    ].join("\n\n"),
    categoryId: "cat4",
    published: true,
    imageUrl: null,
    readTime: 5,
  });

  // Lists
  articles.push({
    title: "2023'ün Öne Çıkan 10 Indie Albümü: Hızlı Bir Rehber",
    slug: "2023-one-cikan-10-indie-albumu-liste",
    excerpt:
      "2023 içinde indie sahnede öne çıkan işleri tek sayfada topladık. Türler arası geçişler ve yeni sesler bu listede.",
    content: [
      "İndie sahne 2023’te tek bir tarza sıkışmadı: Post-punk’tan folk’a, deneysel pop’tan gitar müziğine kadar geniş bir yelpazede güçlü işler çıktı. Bu liste, yıl boyunca öne çıkan albümler için hızlı bir rehber niteliğinde.",
      "",
      "1) boygenius – the record: Kolektif bir kırılganlık ve güçlü şarkı yazımı.",
      "2) The National – First Two Pages of Frankenstein: Ağır, sabırlı ve atmosferik bir dönüş.",
      "3) Lana Del Rey – Did you know that there’s a tunnel under Ocean Blvd: Büyük anlatı, büyük prodüksiyon.",
      "4) Paramore – This Is Why: Pop punk enerjisine modern bir dokunuş.",
      "5) Caroline Polachek – Desire, I Want to Turn Into You: Sınır tanımayan art-pop.",
      "6) Sufjan Stevens – Javelin: İncelikli düzenlemeler ve duygusal yoğunluk.",
      "7) Blur – The Ballad of Darren: Olgun, sakin ama etkili bir geri dönüş.",
      "8) Mitski – The Land Is Inhospitable and So Are We: Kısa ama güçlü anlatım.",
      "9) JPEGMAFIA & Danny Brown – Scaring the Hoes: Deneyselliğin enerjisi.",
      "10) Wednesday – Rat Saw God: Gürültüyle gelen melodik netlik.",
      "",
      "Bu listedeki albümleri tek tek dinlemek yerine, iki-üç tanesini seçip arka arkaya deneyin. İndie’nin asıl keyfi, bu geçişlerde ortaya çıkıyor.",
    ].join("\n"),
    categoryId: "cat7",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  // News
  articles.push({
    title: "Festival Sezonu İçin Yeni Trend: Sürdürülebilir Sahne Üretimi",
    slug: "festival-sezonu-surdurulebilir-sahne-uretimi-haber",
    excerpt:
      "Organizatörler artık sadece lineup değil, çevresel etkiyi de konuşuyor. Sahne üretiminde sürdürülebilirlik yükselen bir standart haline geliyor.",
    content: [
      "Festival sezonu yaklaşırken organizatörlerin gündemi sadece lineup değil. Sahne kurulumu, enerji tüketimi ve ulaşım planı gibi başlıklar, artık bilet satışını etkileyen kriterler arasında.",
      "Yeni trend, sahne üretiminde ‘modüler’ çözümler. Aynı parçaların farklı şehirlerde yeniden kullanılabilmesi, hem maliyeti hem de atığı azaltıyor. LED ekranların daha verimli panellerle yenilenmesi ve jeneratör kullanımının kısmi olarak güneş/şebeke hibritine kaydırılması da öne çıkan adımlar.",
      "Seyirci tarafında ise tek kullanımlık plastiklerin azaltılması, yeniden doldurulabilir bardak sistemleri ve toplu taşıma teşvikleri giderek yaygınlaşıyor. Bazı etkinlikler, biletle birlikte toplu taşıma entegrasyonu sunarak trafiği de hafifletmeyi hedefliyor.",
      "Özetle: Festival deneyimi artık yalnızca sahnede değil, organizasyonun tamamında tasarlanıyor. Sürdürülebilirlik, “ekstra” değil; yeni normal olmaya doğru ilerliyor.",
    ].join("\n\n"),
    categoryId: "cat6",
    published: true,
    imageUrl: null,
    readTime: 5,
  });

  let inserted = 0;
  const insertTx = db.transaction(() => {
    for (const a of articles) {
      const baseSlug = slugify(a.slug || a.title);
      const slug = ensureUniqueSlug(db, baseSlug);
      const didInsert = insertArticleIfMissing(db, { ...a, slug });
      if (didInsert) inserted++;
    }
  });
  insertTx();

  console.log(`seed-sections: inserted ${inserted} article(s).`);
}

main();

