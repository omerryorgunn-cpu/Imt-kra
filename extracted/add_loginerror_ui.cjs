const fs = require('fs');
let code = fs.readFileSync('components/AuthScreen.tsx', 'utf8');

const loginFormAnchor = `<form onSubmit={handleLogin} className="space-y-6">`;
const loginErrorUI = `
              {loginError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <AlertCircle size={18} />
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">`;

code = code.replace(loginFormAnchor, loginErrorUI);
fs.writeFileSync('components/AuthScreen.tsx', code);
