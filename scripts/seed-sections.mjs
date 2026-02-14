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
    { id: "cat4", name: "Konserler", nameEn: "Concerts", slug: "konserler", color: "#ef4444" },
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

  // New albums (variety for homepage + category pages)
  articles.push({
    title: "Fontaines D.C.'den Sert Dönüş: Skinty Fia",
    slug: "fontaines-dc-skinty-fia",
    excerpt:
      "Fontaines D.C., “Skinty Fia” ile post-punk enerjisini karanlık bir atmosfer ve daha geniş bir anlatıyla birleştiriyor.",
    content: [
      "Fontaines D.C., “Skinty Fia” ile ilk bakışta tanıdık bir motoru çalıştırıyor: keskin gitarlar, ritimde inatçı bir yürüyüş ve öne çıkan bir vokal. Ama albüm ilerledikçe, grubun yalnızca “hızlı ve sert” bir post-punk formülüne yaslanmadığı açıkça hissediliyor.",
      "Düzenlemelerdeki en güçlü hamle, sahnenin sürekli ‘dar’ tutulmaması. Parçalar, bazı bölümlerde neredeyse kulak hizasında sertleşirken, bazı anlarda geri çekilip atmosfere alan açıyor. Bu sayede albüm, tek bir duyguya kilitlenmek yerine, gri tonların içinde dolaşabilen bir anlatı kuruyor.",
      "Vokal tarafında ise konuşur gibi ama asla düzleşmeyen bir ifade var. Bu ifade, sözlerdeki yabancılık ve gerilim hissiyle birleştiğinde albümün ana karakterini belirliyor. “Skinty Fia”, bir yandan ritimle sürüklüyor, diğer yandan dinleyiciyi sürekli tetikte tutuyor.",
      "Sonuç olarak albüm, Fontaines D.C.’nin ‘yüksek enerji’ tarafını korurken ses paletini genişlettiği bir dönemeç. Kısa sürede tüketilecek bir tekleme değil; tekrar dinledikçe detay veren, karanlık ama canlı bir kayıt.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Black Country, New Road'un Duygusal Zirvesi: Ants From Up There",
    slug: "black-country-new-road-ants-from-up-there",
    excerpt:
      "Black Country, New Road; kırılgan anlatımı, büyük düzenlemelerle büyüten bir albümle modern art-rock’ın sınırlarını zorluyor.",
    content: [
      "“Ants From Up There”, Black Country, New Road’un dramatik anlatısını büyütürken, dinleyiciyi de o duygusal yoğunluğun içine çeken bir albüm. Parçalar, sadece ritim ve gitar üzerinden değil; dinamik geçişler, enstrüman katmanları ve sahne gibi kurgulanan bölümler üzerinden ilerliyor.",
      "Albümün gücü, iniş çıkışların ‘rastgele’ değil, çok kontrollü olması. Sessiz bir anın ardından gelen yükseliş, sadece sesin artması değil; hikayenin yeni bir noktaya taşınması gibi hissettiriyor. Bu da albümü bir şarkılar toplamından çok, tek bir uzun anlatı gibi dinlettiriyor.",
      "Aranjmanlarda yaylı hissi veren dokular, piyanonun ritimle kurduğu ilişki ve yer yer patlayan gitarlar dikkat çekiyor. Bu çeşitlilik, albümün her parçada farklı bir yüz göstermesini sağlıyor; ama karakter bütünlüğü hiç kaybolmuyor.",
      "“Ants From Up There”, sabır isteyen bir dinleme. Fakat o sabrı ödüllendiriyor: her dönüşte başka bir cümle, başka bir motif ve başka bir duygu katmanı yakalanıyor. Modern indie/art-rock içinde, ‘büyük albüm’ hissini gerçekten taşıyan işlerden biri.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Lana Del Rey'in Yeni Anlatısı: Ocean Blvd ile Büyük Resim",
    slug: "lana-del-rey-ocean-blvd",
    excerpt:
      "Lana Del Rey, “Ocean Blvd” döneminde şarkı yazımını daha açık, daha kişisel ve daha sinematik bir çizgiye taşıyor.",
    content: [
      "Lana Del Rey’in son dönem işleri, büyük prodüksiyon jestlerinden çok, metnin ve melodinin ağırlığına yaslanıyor. “Ocean Blvd” yaklaşımı da bu çizgiyi sürdürüyor: şarkıların merkezinde anlatı var, aranjmanlar ise bu anlatıya alan açacak şekilde kuruluyor.",
      "Albümün en belirgin yanı, sahnenin ‘geniş’ olması. Piyano ve yaylı dokular, bazı parçalarda neredeyse bir film müziği hissi yaratıyor. Fakat bu sinematik etki, abartılı bir dramatizm yerine, kontrollü bir gerilimle ilerliyor.",
      "Sözlerde ise daha az maske, daha fazla doğrudanlık var. Bu doğrudanlık, albümün temposunu yavaşlatıyor gibi görünse de, duyguyu yoğunlaştırıyor. Birkaç cümleyle kurulan sahneler, dinleyicinin aklında uzun süre kalıyor.",
      "“Ocean Blvd”, hızlı tüketim için yazılmış bir albüm değil. Daha çok, aynı hikayeye farklı zamanlarda dönmek gibi. Lana Del Rey’in anlatıcı tarafını sevenler için güçlü bir durak; yeni dinleyiciler içinse ‘yavaş açılan’ ama derin bir giriş.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Mitski'nin Yeni Dönemi: The Land Is Inhospitable ve Kısa Vuruşlar",
    slug: "mitski-the-land-is-inhospitable",
    excerpt:
      "Mitski, daha sade bir anlatı kurarken duyguyu küçültmüyor; aksine kısa ve net şarkılarla daha keskin bir etki yaratıyor.",
    content: [
      "Mitski’nin yeni döneminde dikkat çeken şey, şarkıların ‘az sözle çok şey’ söylemesi. “The Land Is Inhospitable” yaklaşımı, büyük prodüksiyon numaralarına yaslanmadan, küçük melodik kararlarla duyguyu büyütüyor.",
      "Parçalar genellikle kısa, ama bu kısalık acelecilik değil. Tam tersine, şarkıların gereksiz dolaşmadan hedefe gittiği bir ekonomi var. Nakaratların yerleşimi, sözlerin ritmi ve enstrümanların boşluk bırakması; her şeyi daha net hale getiriyor.",
      "Albümün genel hissi, bir “yorgunluk” ya da “kabulleniş” duygusuna yakın. Ancak bu duygu karanlığa saplanmıyor; yer yer ışık alan, yer yer gölgeye kayan bir ton var. Bu ton, Mitski’nin anlatıcı gücünü bir kez daha öne çıkarıyor.",
      "Sonuç: “The Land Is Inhospitable”, büyük anlar yerine küçük vuruşlarla etkileyen bir albüm. Sade gibi görünen ama tekrar dinledikçe ayrıntı veren bir iş; özellikle söz odaklı dinleyici için çok güçlü.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Sufjan Stevens'in Dönüşü: Javelin ile İçe Dönük Zarafet",
    slug: "sufjan-stevens-javelin",
    excerpt:
      "Sufjan Stevens, “Javelin” ile minimal dokuları duygusal bir merkezle birleştiriyor: sessiz ama güçlü bir geri dönüş.",
    content: [
      "Sufjan Stevens albümleri çoğu zaman ‘kısık sesle konuşan’ ama uzun süre akılda kalan işler. “Javelin” de bu geleneği sürdürüyor: düzenlemeler çok kalabalık değil, ancak her katman doğru yerde durduğu için parçalar geniş bir alan hissi taşıyor.",
      "Albümün omurgası, melodik kırılmalar ve küçük ritmik hareketler. Şarkılar, büyük patlamalar yerine yavaşça büyüyor; bir akor değişimi ya da küçük bir synth dokusu bile anlatının yönünü değiştirebiliyor.",
      "Sözlerdeki içe dönüklük, albümün temposunu belirliyor. Bu tempo ‘yavaş’ olabilir, ama durağan değil. Aksine, duygunun adım adım ilerlediği bir yürüyüş gibi. Dinleyici, şarkıların içinde kaybolmak yerine, onlarla birlikte yol alıyor.",
      "“Javelin”, yoğun bir günün sonunda iyi gelen bir albüm: kulaklıkla dinlendiğinde detayları ortaya çıkan, sakin kaldıkça güçlenen bir kayıt. Sufjan’ın üretiminde önemli bir durak olarak anılacak işler arasında.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Paramore'un Yeniden Doğuşu: This Is Why ile Net Bir Çizgi",
    slug: "paramore-this-is-why",
    excerpt:
      "Paramore, “This Is Why” ile pop punk geçmişini inkâr etmeden daha olgun ve ritim odaklı bir sound’a geçiyor.",
    content: [
      "Paramore, “This Is Why” döneminde enerjiyi sadece hızdan değil, groove’dan da alıyor. Gitarların sertliği yerinde dururken, ritim bölümünün daha ‘oynak’ çalıştığı anlar albümün yeni karakterini belirliyor.",
      "Albümün güçlü yanı, pop punk refleksini koruyup daha geniş bir dinleyici kulağına hitap edebilmesi. Nakaratlar hâlâ akılda kalıcı; ama düzenlemeler, tek bir formülün etrafında dönmüyor. Parçalar, küçük prodüksiyon hamleleriyle farklı yerlere açılıyor.",
      "Vokal tarafında Hayley Williams’ın kontrolü ve esnekliği albümün taşıyıcısı. Yüksek enerjili anlarda bile hikâye ‘dağılmıyor’; çünkü vokal çizgisi, şarkıyı toparlayan bir omurga gibi çalışıyor.",
      "“This Is Why”, Paramore’un nostaljiye sıkışmadan büyüdüğünü gösteren bir albüm: hem eski dinleyiciye göz kırpıyor, hem de yeni bir sayfa açıyor.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Caroline Polachek'in Sınır Tanımayan Pop'u: Desire, I Want to Turn Into You",
    slug: "caroline-polachek-desire-i-want-to-turn-into-you",
    excerpt:
      "Caroline Polachek, art-pop ile elektronik dokuları risk almaktan korkmadan birleştiriyor; albüm, sürekli sürprizli bir akış sunuyor.",
    content: [
      "Caroline Polachek albümlerinde en heyecan verici şey, ‘tür’ fikrinin sabit kalmaması. “Desire, I Want to Turn Into You” da bu yaklaşımı sürdürüyor: bir parça elektronik pop’a yaslanırken, bir diğeri neredeyse folk dokusuna yaklaşabiliyor.",
      "Aranjmanlar çoğu zaman katman katman büyüyor; ama kalabalıklaşmıyor. Çünkü her sesin sahnede bir yeri var. Bu düzenleme disiplini, albümün ‘deneysel’ tarafını erişilebilir kılıyor.",
      "Vokal performansı albümün en güçlü yüzü: bazen keskin, bazen kırılgan, bazen de çok parlak. Bu değişkenlik, parçaların ruhunu tek bir renge hapsetmiyor.",
      "Genel olarak bu albüm, art-pop dinleyicisi için büyük bir tatmin. Her dinleyişte yeni bir detay yakalanacak kadar zengin, ama akışı bozmayacak kadar dengeli.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 7,
  });

  articles.push({
    title: "Blur'dan Sakin ve Keskin Bir Dönüş: The Ballad of Darren",
    slug: "blur-the-ballad-of-darren",
    excerpt:
      "Blur, “The Ballad of Darren” ile yüksek gürültü yerine olgun bir melankoli kuruyor; şarkılar basit ama etkili.",
    content: [
      "Blur’un geri dönüş albümü, bir “büyük patlama” değil; daha çok sessiz bir yürüyüş. “The Ballad of Darren”, yaş almış bir grubun hâlâ şarkı yazımında ne kadar güçlü olabileceğini gösteriyor.",
      "Düzenlemeler çoğunlukla sade. Bu sadelik, Damon Albarn’ın anlatısını öne çıkarıyor. Parçalar, küçük melodik kararlarla büyüyor; büyük prodüksiyon gösterileri yerine sözlerin ve armonilerin taşıdığı bir ağırlık var.",
      "Albüm, Britpop nostaljisine yaslanmıyor. Bunun yerine, bugünkü hâlini kabul eden bir ton taşıyor. Bu ton, dinleyicide daha ‘yakın’ bir duygu bırakıyor.",
      "“The Ballad of Darren”, hızlı tüketilecek bir albüm değil; ama tekrar dinledikçe iyi gelen, olgun bir iş. Blur diskografisinde sakin ama kalıcı bir yere oturuyor.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

  articles.push({
    title: "Wednesday'nin Gürültülü Zarafeti: Rat Saw God",
    slug: "wednesday-rat-saw-god",
    excerpt:
      "Wednesday, gürültülü gitarları country dokusuyla yan yana getirip 90'lar indie ruhunu bugüne taşıyor.",
    content: [
      "“Rat Saw God”, Wednesday’nin ‘kirli ama melodik’ çizgisini daha görünür kılan bir albüm. Gitarlar çoğu zaman önde ve gürültülü; fakat şarkıların içinde küçük country dokuları ve hikâye anlatımı da var.",
      "Albümün güçlü yanı, zıtlıkları aynı sahnede tutabilmesi. Bir anda sert bir patlama duyarken, hemen ardından sakin bir cümleyle geri çekiliyor. Bu iniş çıkışlar, albüme canlı bir ritim kazandırıyor.",
      "Vokal anlatımı çok ‘yakın’: sanki bir hikâyeyi masada anlatıyormuş gibi. Bu yakınlık, gürültülü anları daha da etkili kılıyor; çünkü dinleyici şarkıya yabancı kalmıyor.",
      "“Rat Saw God”, indie rock içinde hem nostaljik hem de taze hisseden bir iş. Gürültü seven ama iyi melodiden vazgeçmeyen dinleyici için tam yerinde.",
    ].join("\n\n"),
    categoryId: "cat1",
    published: true,
    imageUrl: null,
    readTime: 6,
  });

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
      const slug = slugify(a.slug || a.title);
      const didInsert = insertArticleIfMissing(db, { ...a, slug });
      if (didInsert) inserted++;
    }
  });
  insertTx();

  // De-dupe / normalize seed content so homepage isn't repetitive.
  // Safe to run multiple times: it only flips flags on known slugs.
  const normalizeTx = db.transaction(() => {
    // Reset flags so we can re-assign a clean, diverse homepage set.
    db.prepare("update Article set featured = 0").run();
    db.prepare("update Article set editorsPick = 0").run();

    // Remove duplicated/near-duplicate seed posts (kept in DB but unpublished).
    const unpublish = [
      // Taylor duplicates
      "taylor-swift-in-indie-folk-donusu-folklore-ve-evermore",
      "taylor-swift-in-folk-donusumu-folklore-ve-evermore",
      "taylor-swift-in-folk-muzige-donusu-buyuluyor",
      "taylor-swift-indie-sulara-yelken-aciyor-folklore-ve-evermore-i-le-donusum",
      "taylor-swift-in-indie-donusumu-folklore-ve-evermore-ile-yeni-bir-cag",
      // Arctic Monkeys duplicates
      "arctic-monkeys-ten-yeni-harika-the-car",
      "arctic-monkeys-ten-yeni-donem-the-car-2022",
      "arctic-monkeys-ten-yeni-lezzet-the-car",
      "arctic-monkeys-ten-yeni-saheser-the-car",
      "arktik-maymunlar-geri-donuyor-the-car-ile-caz-ve-funk-estetigi-kesfi",
      "arctic-monkeys-the-car-caz-dokunuslariyla-bir-donum-noktasi",
      // Olivia duplicates
      "olivia-rodrigo-nun-muzik-dunyasindaki-buyuk-cikisi-sour",
      "olivia-rodrigo-dan-rekor-kiran-cikis-sour",
    ];
    const unpub = db.prepare(
      "update Article set published = 0, featured = 0, editorsPick = 0 where slug = ?"
    );
    for (const slug of unpublish) unpub.run(slug);

    // Featured (hero): keep exactly one.
    db.prepare("update Article set featured = 1 where slug = ?").run(
      "fontaines-dc-skinty-fia"
    );

    // Editors' picks: 4 items, different artists/categories.
    const picks = [
      "wet-leg-wet-leg-inceleme",
      "roportaj-phoebe-bridgers-minimalizm-maksimum-duygu",
      "the-national-first-two-pages-of-frankenstein-inceleme",
      "sufjan-stevens-javelin",
    ];
    const pick = db.prepare(
      "update Article set editorsPick = 1 where slug = ? and published = 1"
    );
    for (const slug of picks) pick.run(slug);
  });
  normalizeTx();

  console.log(`seed-sections: inserted ${inserted} article(s).`);
}

main();
