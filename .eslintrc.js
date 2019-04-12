module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: 'airbnb',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "no-plusplus": 0,
        "class-methods-use-this": 0,
        "react/sort-comp": 0,
        "no-bitwise": 0,
    },
};
