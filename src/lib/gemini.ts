import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function translateText(
  text: string,
  targetLang: "en" | "tr" = "en"
): Promise<string> {
  const langName = targetLang === "en" ? "English" : "Turkish";
  const result = await model.generateContent(
    `Translate the following text to ${langName}. Only return the translated text, nothing else:\n\n${text}`
  );
  return result.response.text();
}

export async function completeContent(
  partialText: string,
  style: "news" | "review" | "interview" | "opinion" = "news"
): Promise<string> {
  const styleGuide: Record<string, string> = {
    news: "haber yazısı formatında, objektif ve bilgilendirici",
    review: "müzik inceleme formatında, detaylı ve eleştirel",
    interview: "röportaj formatında, akıcı ve ilgi çekici",
    opinion: "köşe yazısı formatında, kişisel ve düşündürücü",
  };

  const result = await model.generateContent(
    `Sen bir müzik gazetecisisin. Aşağıdaki yarım kalmış Türkçe metni ${styleGuide[style]} bir şekilde tamamla. Sadece devam eden metni yaz, baştan yazma:\n\n${partialText}`
  );
  return result.response.text();
}

export async function improveContent(text: string): Promise<string> {
  const result = await model.generateContent(
    `Sen bir müzik editörüsün. Aşağıdaki Türkçe metni düzelt ve iyileştir. Yazım hatalarını düzelt, cümle yapısını geliştir, ama anlamı ve tonu koru. Sadece düzeltilmiş metni döndür:\n\n${text}`
  );
  return result.response.text();
}

export async function generateExcerpt(content: string): Promise<string> {
  const result = await model.generateContent(
    `Aşağıdaki makale içeriğinden 1-2 cümlelik kısa bir özet çıkar. Sadece özeti yaz:\n\n${content}`
  );
  return result.response.text();
}
