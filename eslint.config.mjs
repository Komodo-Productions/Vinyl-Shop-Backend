// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Configuración base recomendada
  js.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // Configuración específica para migraciones
  {
    files: ["**/migrations/**/*.js"],
    rules: {
      "no-unused-vars": "off", // Desactiva la regla para migraciones
    },
  },
]);
