const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "{activeTab !== 'packages' && (",
  "{activeTab !== 'packages' && activeTab !== 'support' && ("
);

fs.writeFileSync('components/AdminDashboard.tsx', code);
