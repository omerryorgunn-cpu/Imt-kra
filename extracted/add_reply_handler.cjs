const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

const anchor = "const handleToggleTicketStatus = (id: string, currentStatus: string) => {";
const newCode = `const handleReplyTicket = (id: string) => {
    if (!replyText.trim()) return;
    mockDb.updateSupportTicket(id, {
      reply: replyText,
      repliedAt: { seconds: Date.now() / 1000 },
      status: 'closed'
    });
    setReplyingToTicketId(null);
    setReplyText('');
    loadData();
  };

  ` + anchor;

code = code.replace(anchor, newCode);
fs.writeFileSync('components/AdminDashboard.tsx', code);
