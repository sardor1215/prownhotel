module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: './tailwind.config.js',
    },
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
    ...(process.env.NODE_ENV === 'production' 
      ? {
          'cssnano': {
            preset: ['default', {
              discardComments: {
                removeAll: true,
              },
              normalizeWhitespace: true,
            }]
          }
        } 
      : {})
  },
}