import { GoogleGenAI, Type } from "@google/genai";
import { TextAnalysis, Exam, Question } from "../types";

const getApiKey = () => {
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key === "undefined" || key === "null") {
    return "AI_KEY_PLACEHOLDER";
  }
  return key;
};

export const getAITutorResponse = async (userMessage: string, history: { role: 'user' | 'model', content: string }[]) => {
  try {
    const key = getApiKey();
    if (key === "AI_KEY_PLACEHOLDER") {
      return "Sistem yöneticisi tarafından henüz geçerli bir Yapay Zeka API Anahtarı (GEMINI_API_KEY) tanımlanmamıştır. Lütfen daha sonra tekrar deneyiniz.";
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `Sen 'İMTİKRA' platformunun uzman Arapça asistanısın. 
        Kullanıcılara YDS, YÖKDİL ve YDT sınavlarına hazırlıkta yardımcı oluyorsun. 
        Arapça kelime köklerini, gramer kurallarını (Nahiv/Sarf) açıkla. 
        Cevaplarını samimi, öğretici ve profesyonel bir dille ver. 
        Arapça kelimelerin hareke ve anlamlarını detaylandır.
        ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma.`,
        temperature: 0.7,
      },
    });

    return response.text || "Üzgünüm, şu an yanıt veremiyorum.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Yapay zeka servisinde bir sorun oluştu. Lütfen tekrar deneyin.";
  }
};

export const generatePerformanceReport = async (studentName: string, exam: Exam, studentAnswers: Record<number, string> = {}) => {
  try {
    const key = getApiKey();
    if (key === "AI_KEY_PLACEHOLDER") {
      return "Sınav analiz raporu oluşturulamıyor: Geçerli bir Yapay Zeka API Anahtarı tanımlanmamıştır.";
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    // Prepare data for the model
    const analysisData = exam.questions.map((q, idx) => {
      const studentAns = studentAnswers[idx];
      const isCorrect = studentAns === q.correctOption;
      return {
        questionNumber: idx + 1,
        topic: q.topic || "Genel",
        isCorrect: isCorrect,
        studentAnswer: studentAns || "Boş",
        correctAnswer: q.correctOption
      };
    });

    // Group by topic failures
    const topicStats: Record<string, { total: number, wrong: number }> = {};
    analysisData.forEach(d => {
      if (!topicStats[d.topic]) topicStats[d.topic] = { total: 0, wrong: 0 };
      topicStats[d.topic].total++;
      if (!d.isCorrect) topicStats[d.topic].wrong++;
    });

    const prompt = `
      Öğrenci Adı: ${studentName}
      Sınav: ${exam.title} (${exam.category})
      
      Soru Analizi:
      ${JSON.stringify(analysisData)}

      Lütfen bu öğrenci için "İMTİKRA Sınav Analiz Raporu" başlıklı, Markdown formatında profesyonel bir geri bildirim raporu yaz.
      
      Rapor şu bölümleri içermelidir:
      1. **Genel Performans Özeti**: Sınavdaki başarısı hakkında motive edici kısa bir özet.
      2. **Konu Bazlı Eksiklikler**: Öğrencinin en çok yanlış yaptığı konuları (${JSON.stringify(topicStats)}) analiz et ve hangi konulara ağırlık vermesi gerektiğini söyle.
      3. **Çalışma Tavsiyeleri**: Eksik olduğu konular (özellikle Nahiv, Sarf, Kelime Bilgisi vb.) için spesifik çalışma önerileri ver.
      
      Tonun yapıcı, profesyonel ve teşvik edici olsun.
      ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Analiz oluşturulamadı.";

  } catch (error) {
    console.error("Analysis Generation Error:", error);
    throw error;
  }
};

export const getDictionaryLookup = async (word: string) => {
  try {
    const key = getApiKey();
    if (key === "AI_KEY_PLACEHOLDER") {
      throw new Error("Sözlük sorgusu yapılamıyor: Geçerli bir Yapay Zeka API Anahtarı tanımlanmamıştır.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Şu kelimeyi Arapça-Türkçe veya Türkçe-Arapça sözlük bağlamında analiz et: "${word}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            translation: { type: Type.STRING },
            root: { type: Type.STRING, description: "Kelimenin kökü (eğer Arapça ise)" },
            type: { type: Type.STRING, description: "İsim, Fiil, Sıfat vb." },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING, description: "Örnek cümle" },
                  translation: { type: Type.STRING, description: "Cümlenin çevirisi" }
                },
                required: ["sentence", "translation"]
              }
            },
            synonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Eş anlamlılar"
            },
            antonyms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Zıt anlamlılar"
            },
            notes: { type: Type.STRING, description: "Kullanım notları veya önemli gramer bilgisi" }
          },
          required: ["word", "translation", "type", "examples", "synonyms", "antonyms"]
        },
        systemInstruction: "Sen uzman bir Arapça-Türkçe leksikografsın. Verilen kelimeyi YDS/YÖKDİL seviyesinde analiz et. Eğer kelime Arapça ise mutlaka hareke kullan. Örnek cümleler öğretici ve günlük/akademik dilden olsun. Sadece JSON formatında yanıt ver. ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma."
      }
    });

    // Handle JSON parsing safely (strip potential markdown)
    let jsonText = response.text || "{}";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Dictionary Lookup Error:", error);
    throw error;
  }
};

export const analyzeArabicText = async (text: string): Promise<TextAnalysis> => {
  try {
    const key = getApiKey();
    if (key === "AI_KEY_PLACEHOLDER") {
      throw new Error("Metin analizi yapılamıyor: Geçerli bir Yapay Zeka API Anahtarı tanımlanmamıştır.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Şu Arapça metni analiz et, kategorize et ve tam Türkçe çevirisini yap: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullTranslation: { type: Type.STRING, description: "Metnin tam Türkçe tercümesi" },
            prepositions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING, description: "Fiil + Harf-i Cer yapısı" },
                  meaning: { type: Type.STRING, description: "Türkçe anlamı" }
                },
                required: ["phrase", "meaning"]
              }
            },
            patterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING, description: "Cümle kalıbı veya tamlama" },
                  meaning: { type: Type.STRING, description: "Türkçe anlamı" }
                },
                required: ["phrase", "meaning"]
              }
            },
            conjunctions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "Edat veya bağlaç" },
                  meaning: { type: Type.STRING, description: "Türkçe anlamı" }
                },
                required: ["word", "meaning"]
              }
            },
            vocabulary: {
              type: Type.ARRAY,
              description: "Metindeki en az 15-20 anahtar kelime",
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "Önemli anahtar kelime" },
                  meaning: { type: Type.STRING, description: "Türkçe anlamı" }
                },
                required: ["word", "meaning"]
              }
            },
            wordMapList: {
              type: Type.ARRAY,
              description: "Metindeki her kelimenin tek tek çevirisi",
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "Arapça kelime" },
                  value: { type: Type.STRING, description: "Türkçe karşılığı" }
                },
                required: ["key", "value"]
              }
            }
          },
          required: ["fullTranslation", "prepositions", "patterns", "conjunctions", "vocabulary", "wordMapList"]
        },
        systemInstruction: "Sen profesyonel bir Arapça dil uzmanısın. Modern Arapça metinleri YDS/YÖKDİL düzeyinde analiz eder, harf-i cerli fiilleri, edatları, bağlaçları ve tam tercümesini mükemmel şekilde tespit edersin. ÖNEMLİ: Vocabulary kısmına metinden en az 15 adet, mümkünse 20 adet önemli kelime ekle ki kelime kartları zengin olsun. Çıktıyı sadece JSON olarak ver. ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma."
      }
    });

    // Handle JSON parsing safely
    let jsonText = response.text || "{}";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const rawResult = JSON.parse(jsonText);
    
    const wordMap: Record<string, string> = {};
    if (Array.isArray(rawResult.wordMapList)) {
      rawResult.wordMapList.forEach((item: any) => {
        wordMap[item.key] = item.value;
      });
    }

    return {
      fullTranslation: rawResult.fullTranslation || "",
      prepositions: rawResult.prepositions || [],
      patterns: rawResult.patterns || [],
      conjunctions: rawResult.conjunctions || [],
      vocabulary: rawResult.vocabulary || [],
      wordMap: wordMap
    };
  } catch (error) {
    console.error("Text Analysis Error:", error);
    throw error;
  }
};