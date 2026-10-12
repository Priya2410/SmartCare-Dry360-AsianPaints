export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      plum: { 50:'#f5f2fb',100:'#ece5f8',200:'#d9ccf0',300:'#b9a2e2',500:'#6b3fb8',600:'#552d9c',700:'#45237f',800:'#331a60',900:'#22113f' },
      saffron: { 50:'#fff5ec',100:'#ffe6d0',300:'#ffb173',500:'#f47b20',600:'#e0640c',700:'#b84d06' },
      ink: '#1d1530',
    },
    fontFamily: { sans: ['"Plus Jakarta Sans"','system-ui','sans-serif'], display: ['"Sora"','"Plus Jakarta Sans"','sans-serif'] },
    boxShadow: { card:'0 1px 2px rgba(34,17,63,.06), 0 8px 24px -12px rgba(34,17,63,.18)', lift:'0 18px 40px -18px rgba(69,35,127,.45)' },
  } },
}
