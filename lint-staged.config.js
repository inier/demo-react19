// lint-staged.config.mjs

// https://github.com/okonet/lint-staged

export default {
    '.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --format table --fix'],
    'src/**/*.{}': ['prettier --write', 'stylelint --fix'],
    '.{css,sass,scss,less}': ['prettier --write', 'stylelint --syntax scss --fix'],
    '.{html,json}': ['prettier --write'],
    '.{md,markdown}': ['lint-md --fix'],
};
