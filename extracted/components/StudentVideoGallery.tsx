
import React, { useState, useEffect } from 'react';
import { Video, FileText, Download, Play, ChevronLeft, ChevronRight, Paperclip, FileSpreadsheet, Monitor } from 'lucide-react';
import { VideoResource } from '../types';
import { mockDb } from '../services/mockDb';

interface StudentVideoGalleryProps {
  onBack: () => void;
}

export default function StudentVideoGallery({ onBack }: StudentVideoGalleryProps) {
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(null);

  useEffect(() => {
    // Fetch videos and sort by newest first
    const allVideos = mockDb.getVideoResources();
    const sorted = [...allVideos].sort((a, b) => {
      const timeA = a?.createdAt?.seconds || 0;
      const timeB = b?.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    setVideos(sorted);
    if (sorted.length > 0) {
      setSelectedVideo(sorted[0]);
    }
  }, []);

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Assume it's a direct link or other embeddable if not YT
    return url;
  };

  const getFileIcon = (type: 'pdf' | 'word' | 'excel') => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-500" size={20}/>;
      case 'word': return <FileText className="text-blue-500" size={20}/>; // Using FileText for Word too, distinct by color
      case 'excel': return <FileSpreadsheet className="text-green-500" size={20}/>;
      default: return <Paperclip className="text-gray-500" size={20}/>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-[#4A3728] dark:hover:text-white transition-colors">
        <ChevronLeft size={20}/> Ana Menü
      </button>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFBF0] dark:bg-[#2d2d2d] rounded-full border border-[#D4AF37]/20">
          <Monitor className="text-[#D4AF37]" size={16} />
          <span className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest">Eğitim Videoları</span>
        </div>
        <h2 className="text-4xl font-bold font-serif text-[#4A3728] dark:text-white">Video Galeri</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Ders anlatımları, soru çözümleri ve rehberlik videolarını buradan izleyebilir, ilgili dökümanları indirebilirsiniz.</p>
      </div>

      {selectedVideo ? (
        <div className="space-y-10">
          {/* Main Video Player Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
            <div className="aspect-video w-full bg-black relative">
              <iframe 
                src={getEmbedUrl(selectedVideo.videoUrl)} 
                className="w-full h-full" 
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold font-serif text-[#4A3728] dark:text-white">{selectedVideo.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{selectedVideo.description}</p>
              </div>

              {selectedVideo.attachments.length > 0 && (
                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                  <h4 className="text-xs font-bold text-[#4A3728] dark:text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Paperclip size={14}/> Ders Materyalleri
                  </h4>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedVideo.attachments.map(att => (
                      <a 
                        key={att.id} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-transparent hover:border-[#D4AF37]/30 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#333] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          {getFileIcon(att.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#4A3728] dark:text-white truncate">{att.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{att.type} Dosyası</p>
                        </div>
                        <Download size={16} className="text-gray-300 group-hover:text-[#D4AF37]"/>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Video List */}
          {videos.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[#4A3728] dark:text-white px-2">Diğer Videolar</h4>
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-6 w-max px-2">
                  {videos.filter(v => v.id !== selectedVideo.id).map(video => (
                    <div 
                      key={video.id} 
                      onClick={() => { setSelectedVideo(video); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      className="w-72 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden cursor-pointer group hover:border-[#D4AF37] transition-all flex-shrink-0"
                    >
                      <div className="h-40 bg-black relative flex items-center justify-center">
                        {/* Placeholder thumbnail logic if no image provided */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                        <Video size={32} className="text-white/30 relative z-0"/>
                        <Play size={32} className="text-white absolute z-20 opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"/>
                        <span className="absolute bottom-2 right-2 z-20 text-[10px] bg-black/60 text-white px-2 py-1 rounded font-bold">İzle</span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h5 className="font-bold text-[#4A3728] dark:text-white text-sm line-clamp-2 group-hover:text-[#D4AF37] transition-colors">{video.title}</h5>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                           <span>{video?.createdAt?.seconds ? new Date(video.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span>
                           {video.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip size={10}/> {video.attachments.length} Ek</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 space-y-4">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Video size={40}/>
          </div>
          <p className="text-gray-400 italic">Henüz video eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
