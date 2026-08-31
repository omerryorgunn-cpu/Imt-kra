const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "const [activeTab, setActiveTab] = useState<'exams' | 'readings' | 'results' | 'pre-reg' | 'users' | 'packages' | 'videos'>('exams');",
  "const [activeTab, setActiveTab] = useState<'exams' | 'readings' | 'results' | 'pre-reg' | 'users' | 'packages' | 'videos' | 'support'>('exams');"
);

code = code.replace(
  "const [videoResources, setVideoResources] = useState<VideoResource[]>([]);",
  "const [videoResources, setVideoResources] = useState<VideoResource[]>([]);\n  const [supportTickets, setSupportTickets] = useState<any[]>([]);"
);

code = code.replace(
  "setVideoResources(mockDb.getVideoResources());",
  "setVideoResources(mockDb.getVideoResources());\n    setSupportTickets(mockDb.getSupportTickets());"
);

fs.writeFileSync('components/AdminDashboard.tsx', code);
