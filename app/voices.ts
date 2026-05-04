// constants/voicesData.ts

export interface Voice {
  id: string;
  name: string;
  scene: string;
  lang: string;
  gender: '男' | '女';
  category: 'zh' | 'en';
  previewUrl: string;
  color: string;
}

export const DUBBING_VOICES: Voice[] = [
  { id: "zh_female_vv_uranus_bigtts", name: "Vivi 2.0", scene: "情感/ASMR", lang: "中文/多语", gender: "女", category: "zh", previewUrl: "/previews/vivi.mp3", color: "from-pink-400 to-rose-400" },
  { id: "zh_female_xiaohe_uranus_bigtts", name: "小何 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/xiaohe.mp3", color: "from-fuchsia-400 to-purple-500" },
  { id: "zh_male_wennuanahu_uranus_bigtts", name: "温暖阿虎 2.0", scene: "通用场景", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/ahu.mp3", color: "from-blue-400 to-cyan-500" },
  { id: "zh_male_taocheng_uranus_bigtts", name: "小天 2.0", scene: "通用场景", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/xiaotian.mp3", color: "from-sky-400 to-indigo-500" },
  { id: "zh_male_liufei_uranus_bigtts", name: "刘飞 2.0", scene: "通用场景", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/liufei.mp3", color: "from-slate-500 to-gray-600" },
  { id: "en_male_tim_uranus_bigtts", name: "Tim", scene: "多语种", lang: "美式英语", gender: "男", category: "en", previewUrl: "/previews/tim.mp3", color: "from-blue-500 to-blue-700" },
  { id: "en_female_dacey_uranus_bigtts", name: "Dacey", scene: "多语种", lang: "美式英语", gender: "女", category: "en", previewUrl: "/previews/dacey.mp3", color: "from-rose-400 to-pink-600" },
  { id: "en_female_stokie_uranus_bigtts", name: "Stokie", scene: "多语种", lang: "美式英语", gender: "女", category: "en", previewUrl: "/previews/stokie.mp3", color: "from-violet-400 to-purple-600" },
  { id: "zh_female_sophie_uranus_bigtts", name: "魅力苏菲 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/sophie.mp3", color: "from-pink-300 to-rose-400" },
  { id: "zh_female_qingxinnvsheng_uranus_bigtts", name: "清新女声 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/qingxin.mp3", color: "from-teal-300 to-emerald-400" },
  { id: "zh_female_cancan_uranus_bigtts", name: "知性灿灿 2.0", scene: "角色扮演", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/cancan.mp3", color: "from-orange-300 to-amber-400" },
  { id: "zh_female_sajiaoxuemei_uranus_bigtts", name: "撒娇学妹 2.0", scene: "角色扮演", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/xuemei.mp3", color: "from-rose-300 to-red-400" },
  { id: "zh_female_tianmeixiaoyuan_uranus_bigtts", name: "甜美小源 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/xiaoyuan.mp3", color: "from-yellow-400 to-orange-400" },
  { id: "zh_female_tianmeitaozi_uranus_bigtts", name: "甜美桃子 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/taozi.mp3", color: "from-pink-400 to-pink-200" },
  { id: "zh_female_shuangkuaisisi_uranus_bigtts", name: "爽快思思 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/sisi.mp3", color: "from-cyan-300 to-blue-400" },
  { id: "zh_female_peiqi_uranus_bigtts", name: "佩奇猪 2.0", scene: "视频配音", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/peiqi.mp3", color: "from-pink-300 to-rose-200" },
  { id: "zh_female_linjianvhai_uranus_bigtts", name: "邻家女孩 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/linjia.mp3", color: "from-green-300 to-lime-400" },
  { id: "zh_male_shaonianzixin_uranus_bigtts", name: "少年梓辛 2.0", scene: "通用场景", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/zixin.mp3", color: "from-indigo-400 to-blue-500" },
  { id: "zh_male_sunwukong_uranus_bigtts", name: "猴哥 2.0", scene: "视频配音", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/houge.mp3", color: "from-orange-600 to-red-700" },
  { id: "zh_female_yingyujiaoxue_uranus_bigtts", name: "Tina老师 2.0", scene: "教育场景", lang: "中英双语", gender: "女", category: "zh", previewUrl: "/previews/tina.mp3", color: "from-violet-400 to-indigo-500" },
  { id: "zh_female_kefunvsheng_uranus_bigtts", name: "暖阳女声 2.0", scene: "客服场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/kefu.mp3", color: "from-amber-300 to-yellow-500" },
  { id: "zh_female_xiaoxue_uranus_bigtts", name: "儿童绘本 2.0", scene: "有声阅读", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/xiaoxue.mp3", color: "from-sky-300 to-blue-400" },
  { id: "zh_male_dayi_uranus_bigtts", name: "大壹 2.0", scene: "视频配音", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/dayi.mp3", color: "from-gray-400 to-slate-600" },
  { id: "zh_female_mizai_uranus_bigtts", name: "咪仔 2.0", scene: "视频配音", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/mizai.mp3", color: "from-zinc-500 to-neutral-800" },
  { id: "zh_female_jitangnv_uranus_bigtts", name: "鸡汤女 2.0", scene: "视频配音", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/jitang.mp3", color: "from-orange-300 to-yellow-500" },
  { id: "zh_female_meilinvyou_uranus_bigtts", name: "魅力女友 2.0", scene: "通用场景", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/nvyou.mp3", color: "from-rose-400 to-red-500" },
  { id: "zh_female_liuchangnv_uranus_bigtts", name: "流畅女声 2.0", scene: "视频配音", lang: "中文", gender: "女", category: "zh", previewUrl: "/previews/liuchang.mp3", color: "from-zinc-400 to-gray-400" },
  { id: "zh_male_ruyayichen_uranus_bigtts", name: "儒雅逸辰 2.0", scene: "视频配音", lang: "中文", gender: "男", category: "zh", previewUrl: "/previews/yichen.mp3", color: "from-blue-600 to-indigo-800" }
];

export const EMOTION_EFFECTS: Record<string, string> = {
  'happy': '高兴',
  'sad': '悲伤',
  'angry': '愤怒',
  'surprise': '惊讶',
  'fear': '恐惧'
};