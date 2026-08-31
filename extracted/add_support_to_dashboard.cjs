const fs = require('fs');
let code = fs.readFileSync('components/StudentDashboard.tsx', 'utf8');

// 1. Add import
if (!code.includes("import StudentSupportView from './StudentSupportView';")) {
  code = code.replace(
    "import StudentVideoGallery from './StudentVideoGallery';",
    "import StudentVideoGallery from './StudentVideoGallery';\nimport StudentSupportView from './StudentSupportView';"
  );
}

// 2. Add to subView state
code = code.replace(
  "const [subView, setSubView] = useState<'menu' | 'readings' | 'exams' | 'results' | 'settings' | 'dictionary' | 'vocabulary' | 'announcements' | 'membership' | 'videos'>('menu');",
  "const [subView, setSubView] = useState<'menu' | 'readings' | 'exams' | 'results' | 'settings' | 'dictionary' | 'vocabulary' | 'announcements' | 'membership' | 'videos' | 'support'>('menu');"
);

// 3. Add to menu cards
const menuAnchor = "{id: 'settings', label: 'Ayarlar', sub: 'Profil & Görünüm', icon: SettingsIcon, bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:ring-purple-200'}";
const menuAdd = "{id: 'settings', label: 'Ayarlar', sub: 'Profil & Görünüm', icon: SettingsIcon, bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:ring-purple-200'},\n              {id: 'support', label: 'Sorun Çöz', sub: 'Destek & İletişim', icon: MessageCircle, bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:ring-rose-200'}";
code = code.replace(menuAnchor, menuAdd);

// 4. Add the component rendering
const renderAnchor = "{showAITutor && (";
const renderAdd = `{subView === 'support' && (
        <StudentSupportView user={user} onBack={() => setSubView('menu')} />
      )}

      {showAITutor && (`;
code = code.replace(renderAnchor, renderAdd);

fs.writeFileSync('components/StudentDashboard.tsx', code);
