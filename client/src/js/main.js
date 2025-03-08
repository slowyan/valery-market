import { renderProductCards } from './modules/productCards.js';
import products from './products.js';

window.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.querySelector('.js-products-list');
  renderProductCards(products, productContainer);
});
