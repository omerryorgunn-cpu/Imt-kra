const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "{ id: 'packages', label: 'Paketler' }",
  "{ id: 'packages', label: 'Paketler' },\n          { id: 'support', label: 'Destek Talepleri' }"
);

fs.writeFileSync('components/AdminDashboard.tsx', code);
