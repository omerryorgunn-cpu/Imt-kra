const fs = require('fs');
let code = fs.readFileSync('components/AuthScreen.tsx', 'utf8');

code = code.replace(
  "setLoading(true);",
  "setLoginError(''); setLoading(true);"
);

fs.writeFileSync('components/AuthScreen.tsx', code);
