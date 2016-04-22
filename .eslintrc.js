module.exports = {
    "rules": {
        "no-console": 0,
        "indent": [2, 2],
        "quotes": [
            2,
            "single",
            "avoid-escape"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "never"
        ]
    },
    "env": {
        "es6": true,
        "node": true
    },
    "globals": {
        "describe": true,
        "context": true,
        "it": true,
        "beforeEach": true,
        "afterEach": true,
        "done": true
    },
    "extends": "eslint:recommended"
};
