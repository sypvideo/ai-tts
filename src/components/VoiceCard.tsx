import { DUBBING_VOICES, Voice } from '../constants/voicesData';

interface Props {
  selectedVoice: string;
  onSelect: (id: string) => void;
}

export default function VoiceSidebar({ selectedVoice, onSelect }: Props) {
  return (
    <div className="w-[320px] h-full bg-white/40 backdrop-blur-md border-r border-white/50 flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500">
          核心音色库
        </h2>
        <p className="text-xs text-gray-400 mt-1">已精选 28 款商业级高保音色</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {DUBBING_VOICES.map((voice) => (
          <div 
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4
              ${selectedVoice === voice.id 
                ? 'bg-white shadow-physical ring-1 ring-pink-400/30' 
                : 'hover:bg-white/50 opacity-70 hover:opacity-100'}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${voice.color} shadow-lg flex-shrink-0 flex items-center justify-center text-white font-bold`}>
              {voice.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{voice.name}</h3>
              <p className="text-[10px] text-gray-400 truncate">{voice.scene}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}