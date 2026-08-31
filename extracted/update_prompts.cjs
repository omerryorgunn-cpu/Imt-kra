const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

code = code.replace(
  "Arapça kelimelerin hareke ve anlamlarını detaylandır.\`,",
  "Arapça kelimelerin hareke ve anlamlarını detaylandır.\n        ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma.\`,"
);

code = code.replace(
  "Tonun yapıcı, profesyonel ve teşvik edici olsun.",
  "Tonun yapıcı, profesyonel ve teşvik edici olsun.\n      ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma."
);

code = code.replace(
  "Sadece JSON formatında yanıt ver.\"",
  "Sadece JSON formatında yanıt ver. ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma.\""
);

code = code.replace(
  "Çıktıyı sadece JSON olarak ver.\"",
  "Çıktıyı sadece JSON olarak ver. ÖNEMLİ: İletişim dilini ve çıktılarını yalnızca Türkçe, Arapça ve gerekliyse İngilizce olarak sınırlandır. Başka hiçbir dil kullanma.\""
);

fs.writeFileSync('services/geminiService.ts', code);
