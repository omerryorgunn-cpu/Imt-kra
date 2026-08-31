const fs = require('fs');
let code = fs.readFileSync('components/AuthScreen.tsx', 'utf8');

code = code.replace(
  "const [loginEmail, setLoginEmail] = useState('');",
  "const [loginEmail, setLoginEmail] = useState('');\n  const [loginError, setLoginError] = useState('');"
);

code = code.replace(
  "if (!user) { alert(\"Hatalı e-posta/kullanıcı adı veya şifre.\"); setLoading(false); return; }",
  "if (!user) { setLoginError(\"Hatalı e-posta/kullanıcı adı veya şifre.\"); setLoading(false); return; }"
);

code = code.replace(
  "if (user.isBanned) { alert(\"Üyeliğiniz yönetici tarafından iptal edilmiştir.\"); setLoading(false); return; }",
  "if (user.isBanned) { setLoginError(\"Üyeliğiniz yönetici tarafından iptal edilmiştir.\"); setLoading(false); return; }"
);

code = code.replace(
  "alert(\"Abonelik süreniz dolmuştur. Lütfen yönetici ile iletişime geçin.\");",
  "setLoginError(\"Abonelik süreniz dolmuştur. Lütfen yönetici ile iletişime geçin.\");"
);

fs.writeFileSync('components/AuthScreen.tsx', code);
