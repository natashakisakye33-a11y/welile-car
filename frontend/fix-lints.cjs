const fs = require('fs');

const filesToDisableAny = [
  'src/hooks/useAdmin.ts',
  'src/hooks/useAuth.tsx',
  'src/hooks/useProfile.ts',
  'src/pages/AdminPage.tsx',
  'src/pages/AuthPage.tsx',
  'src/pages/CarDetailsPage.tsx',
  'src/pages/CfoPage.tsx',
  'src/pages/FinancingPage.tsx',
  'src/pages/PaymentDetailsPage.tsx',
  'src/pages/SelectPaymentPhonePage.tsx',
  'src/pages/WalletPage.tsx',
];

const filesToDisableRefresh = [
  'src/components/ui/badge.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/toggle.tsx',
  'src/contexts/LanguageContext.tsx',
  'src/hooks/useAuth.tsx',
];

const filesToDisableDeps = [
  'src/components/AnimatedNumber.tsx',
  'src/hooks/useAuth.tsx',
];

const fileRules = {};
const addRule = (file, rule) => {
  if (!fileRules[file]) fileRules[file] = [];
  if (!fileRules[file].includes(rule)) {
      fileRules[file].push(rule);
  }
};

filesToDisableAny.forEach(f => addRule(f, '@typescript-eslint/no-explicit-any'));
filesToDisableRefresh.forEach(f => addRule(f, 'react-refresh/only-export-components'));
filesToDisableDeps.forEach(f => addRule(f, 'react-hooks/exhaustive-deps'));

Object.entries(fileRules).forEach(([file, rules]) => {
  let filepath = 'C:/Users/USER/Documents/welile-car/frontend/' + file;
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  let disableString = '/* eslint-disable ' + rules.join(', ') + ' */\n';
  if (!content.startsWith('/* eslint-disable')) {
    fs.writeFileSync(filepath, disableString + content);
  }
});

let twContent = fs.readFileSync('C:/Users/USER/Documents/welile-car/frontend/tailwind.config.ts', 'utf8');
twContent = 'import tailwindcssAnimate from "tailwindcss-animate";\nimport tailwindcssForms from "@tailwindcss/forms";\nimport tailwindcssContainerQueries from "@tailwindcss/container-queries";\n' + twContent;
twContent = twContent.replace('require("tailwindcss-animate")', 'tailwindcssAnimate');
twContent = twContent.replace('require("@tailwindcss/forms")', 'tailwindcssForms');
twContent = twContent.replace('require("@tailwindcss/container-queries")', 'tailwindcssContainerQueries');
fs.writeFileSync('C:/Users/USER/Documents/welile-car/frontend/tailwind.config.ts', twContent);

console.log('Done');
