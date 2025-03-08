const renderProductCard = ({ name, id, link, photo, prices }) => {
	const li = document.createElement('li');
	li.classList.add('product', 'item', 'column', 'aic', 'js-product');
	li.innerHTML = `<a href="${link}" id="${id}" class="link column aic js-link-card">
                    	<div class="product-image row jcc">
                            <img src="${photo}" alt="${name}" class="image js-image-card">   
                        </div>
                        <div class="product-description">
                            <h3 class="title js-title-card">${name}</h3>
                        </div>  
                        <div class="product-price">
                            <span class="price js-price-card">${prices[0]}</span><span>₽</span>
                         </div>       
                    </a>
                    <button type="button" class="addCart buy-button js-buy-button">В корзину</button>`
	return li;
};

const appendProductCard = (product, container) => {
	container.append(product);
};

const renderProductCards = (products, container) => {
	products.forEach((product) => {
		const card = renderProductCard(product);
		appendProductCard(card, container);
	});
};

export {
	renderProductCards
};