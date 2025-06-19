// frontend/src/lib/utils.js
/**
 * Funções utilitárias para formatação e validação.
 */

/**
 * Formata um valor numérico para o formato de moeda brasileira.
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como moeda.
 */
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Exemplo de como você poderia ter um validador de e-mail (já que a validação é básica no front)
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}