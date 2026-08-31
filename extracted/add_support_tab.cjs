const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

const packagesAnchor = "      {/* PACKAGES TAB */}";
const supportBlock = `      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-[#4A3728] dark:text-white">Destek Talepleri & Sorun Bildirimleri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTickets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">Bekleyen destek talebi bulunmuyor.</div>
            ) : (
              supportTickets.map(ticket => (
                <div key={ticket.id} className={\`bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border shadow-sm flex flex-col gap-4 transition-all \${ticket.status === 'closed' ? 'opacity-60 border-gray-100 dark:border-white/5' : 'border-amber-200 dark:border-amber-900/50'}\`}>
                   <div className="flex justify-between items-start">
                      <div>
                        <span className={\`text-[10px] font-bold uppercase px-2 py-1 rounded-lg \${ticket.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600'}\`}>
                          {ticket.status === 'closed' ? 'Kapalı' : 'Açık'}
                        </span>
                        <div className="text-xs text-gray-400 mt-2 font-mono">ID: {ticket.id}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)} className={\`p-2 rounded-xl transition-all \${ticket.status === 'closed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'}\`}>
                           <CheckCircle size={16} />
                        </button>
                        <button type="button" onClick={() => handleDeleteSupportTicket(ticket.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                           <Trash2 size={16} />
                        </button>
                      </div>
                   </div>
                   
                   <div>
                     <h4 className="font-bold text-gray-800 dark:text-white text-lg">{ticket.senderName}</h4>
                     <p className="text-xs text-[#D4AF37] font-semibold">{ticket.senderContact}</p>
                   </div>
                   
                   <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl text-sm text-gray-600 dark:text-gray-300 min-h-[100px] whitespace-pre-wrap">
                     {ticket.content}
                   </div>
                   
                   {ticket.imageUrl && (
                     <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-black">
                       <a href={ticket.imageUrl} target="_blank" rel="noreferrer">
                         <img src={ticket.imageUrl} className="w-full h-48 object-contain hover:scale-105 transition-transform cursor-pointer" alt="Support Attachment" />
                       </a>
                     </div>
                   )}
                   
                   <div className="text-right text-[10px] text-gray-400 font-bold mt-auto pt-2">
                      {new Date(ticket.createdAt.seconds * 1000).toLocaleString('tr-TR')}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

` + packagesAnchor;

code = code.replace(packagesAnchor, supportBlock);
fs.writeFileSync('components/AdminDashboard.tsx', code);
