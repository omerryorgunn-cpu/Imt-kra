const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

const anchor = "const handleDeleteVideo = (id: string) => {";
const newCode = `  const handleDeleteSupportTicket = (id: string) => {
    safeConfirm("Bu destek talebini silmek istediğinize emin misiniz?", () => {
      mockDb.deleteSupportTicket(id);
      loadData();
    });
  };

  const handleToggleTicketStatus = (id: string, currentStatus: string) => {
    safeConfirm(currentStatus === 'open' ? "Bu destek talebini kapatmak istediğinize emin misiniz?" : "Bu destek talebini tekrar açmak istediğinize emin misiniz?", () => {
      mockDb.updateSupportTicket(id, { status: currentStatus === 'open' ? 'closed' : 'open' });
      loadData();
    });
  };

  ` + anchor;

code = code.replace(anchor, newCode);
fs.writeFileSync('components/AdminDashboard.tsx', code);
