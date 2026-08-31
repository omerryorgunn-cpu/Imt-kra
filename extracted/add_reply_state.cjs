const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "const [searchText, setSearchText] = useState('');",
  "const [searchText, setSearchText] = useState('');\n  const [replyingToTicketId, setReplyingToTicketId] = useState<string | null>(null);\n  const [replyText, setReplyText] = useState('');"
);

fs.writeFileSync('components/AdminDashboard.tsx', code);
