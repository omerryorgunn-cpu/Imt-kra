const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

const anchor = `<div className="text-right text-[10px] text-gray-400 font-bold mt-auto pt-2">`;
const newCode = `                   {ticket.reply && (
                     <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
                       <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">Yönetici Yanıtı:</h5>
                       <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">{ticket.reply}</p>
                     </div>
                   )}

                   {!ticket.reply && replyingToTicketId === ticket.id && (
                     <div className="mt-4 space-y-2">
                       <textarea
                         value={replyText}
                         onChange={e => setReplyText(e.target.value)}
                         placeholder="Yanıtlama mesajınız..."
                         className="w-full p-3 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none dark:text-white"
                         rows={3}
                       />
                       <div className="flex justify-end gap-2">
                         <button onClick={() => { setReplyingToTicketId(null); setReplyText(''); }} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">İptal</button>
                         <button onClick={() => handleReplyTicket(ticket.id)} className="px-3 py-1.5 bg-[#4A3728] dark:bg-[#D4AF37] text-white dark:text-[#4A3728] text-xs font-bold rounded-lg transition-all">Gönder & Kapat</button>
                       </div>
                     </div>
                   )}

                   {!ticket.reply && replyingToTicketId !== ticket.id && (
                     <div className="mt-2">
                       <button onClick={() => setReplyingToTicketId(ticket.id)} className="text-xs font-bold text-[#D4AF37] hover:underline">Yanıtla</button>
                     </div>
                   )}

                   ` + anchor;

code = code.replace(anchor, newCode);
fs.writeFileSync('components/AdminDashboard.tsx', code);
