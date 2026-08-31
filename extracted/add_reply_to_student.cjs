const fs = require('fs');
let code = fs.readFileSync('components/StudentSupportView.tsx', 'utf8');

const anchor = "                </div>\n              ))\n            )}";
const newCode = `                   {ticket.reply && (
                     <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl">
                       <h5 className="text-xs font-bold text-green-800 dark:text-green-300 mb-1 flex items-center gap-1"><CheckCircle size={14}/> Yönetici Yanıtı:</h5>
                       <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{ticket.reply}</p>
                     </div>
                   )}
                </div>
              ))
            )}`;

code = code.replace(anchor, newCode);
fs.writeFileSync('components/StudentSupportView.tsx', code);
