const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^(next|req|res|_)',
        caughtErrorsIgnorePattern: '^_?',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true
      }]
    }
  },
  {
    ignores: ['node_modules/', 'backups/', 'tests/**.snap']
  }
];
