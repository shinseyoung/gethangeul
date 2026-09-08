export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FCFCFB', hi: '#FFFFFF', lo: '#F1F2F1' },
        // the ground a card floats on — cards need something to float above
        ground: { DEFAULT: '#EDF1F9', deep: '#DFE6F5' },
        rule: { DEFAULT: '#E4E5E3', strong: '#CDCFCC' },
        ink: { DEFAULT: '#17181A', 2: '#43464A', 3: '#7E8286', 4: '#ABAFB3' },
        accent: { DEFAULT: '#1F63E8', deep: '#1546A8' },
        // 단청 pigments — these carry meaning (a season, a mood). The accent carries state.
        pig: {
          cheong: '#4F7A8A',
          nok: '#5B7A5C',
          hwang: '#B8901F',
          ja: '#6E5A7A',
          jeok: '#A83B27',
          hoe: '#5A6470',
          rose: '#B8607A',
          ram: '#3E6BA8',
          hwangto: '#C9971F',
          galsaek: '#C4744A',
        },
      },
      fontFamily: {
        disp: ["'Instrument Serif'", "'Gowun Batang'", "'Disp Fallback'", "'Times New Roman'", 'serif'],
        body: ["'Newsreader'", "'Gowun Batang'", "'Noto Sans Thai'", "'Body Fallback'", 'Georgia', 'serif'],
        brush: ['Chungju', "'Nanum Brush Script'", "'Gowun Batang'", 'serif'],
        ko: ["'Gowun Batang'", 'serif'],
        th: ["'Noto Sans Thai'", "'Newsreader'", 'sans-serif'],
      },
      letterSpacing: { eyebrow: '0.2em' },
    },
  },
  plugins: [],
}
