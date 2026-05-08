// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- 保留你原有的定义 ---
        'secondary': '#F9F9FB',
        'brand-purple': '#9C27B0',
        'text-main': '#262626',
        'highlight-purple': 'rgba(243, 229, 245, 0.5)',
        'status-error': '#FF4D4F',

        // --- 统一后的标准定义 (供新版代码直接引用) ---
        'primary': '#9C27B0', // 将 primary 修正为你最爱的粉紫色
        'dark': '#262626',    // 对应你的 text-main
        'panel': '#F9F9FB',   // 对应你的 secondary
        'bg': '#F5F5F7',      // 全局浅灰底色
      },
      borderRadius: {
        'card': '40px',       // 统一主容器圆角
        'button': '28px',     // 统一组件圆角
      },
      animation: {
        'flash-purple': 'flash-purple 0.4s ease-out', // 标签插入时的闪烁效果
      },
      keyframes: {
        'flash-purple': {
          '0%': { borderColor: 'transparent', boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)' },
          '50%': { borderColor: '#9C27B0', boxShadow: '0 0 15px rgba(156, 39, 176, 0.2)' },
          '100%': { borderColor: 'transparent', boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)' },
        }
      }
    }
  },
  plugins: [],
}