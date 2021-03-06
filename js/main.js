//------------------------------------1
const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');

/*Чтоб не делать каждый раз при запровсе товаров запрос на сервер
можно поставить таймер, на повторное получение данных через 
некоторое время
ДОДЕЛАТЬ ВСТАВИТЬ ТАЙМЕР
*/
//Флаг - откуда получать товыры с сервера или из переменной
let needUpdate = true;

const checkGetGoods = () => {
	const data = [];


	return async () => {

		//есть данные запрос не нужен
		if (!needUpdate) {
			setTimeout(() => {
				needUpdate = true;
			}, 50000);
			return data;
		}

		const result = await fetch('db/db.json');

		if (!result.ok) {
			throw `ОШИБКА ${result.status}`

		} else {
			needUpdate = false;
			setTimeout(() => {
				needUpdate = true;
			}, 50000);
		}
		data.push(...(await result.json()));
		return data;
	}
}

const getGoods = checkGetGoods();

const cart = {
	cartGoods: [
		/*{ id: "333", name: "Часы Dior", price: 999, count: 2 },
		{ id: "334", name: "Кеды Dior", price: 19, count: 3 },*/
	],
	renderCard() {
		cartTableGoods.textContent = '';
		const trGoods = this.cartGoods.map(({ id, name, price, count }) => {
			const tr = document.createElement('tr');
			tr.classList.add('cart-item');
			tr.dataset.id = id;
			tr.innerHTML = `<td>${name}</td>
              <td>${price}$</td>
              <td><button class="cart-btn-minus">-</button></td>
              <td>${count}</td>
              <td><button class="cart-btn-plus">+</button></td>
              <td>${price * count}$</td>
              <td><button class="cart-btn-delete">x</button></td>`;
			return tr;
		});

		this.TotalCount();

		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + (item.price * item.count);
		}, 0);

		cardTableTotal.textContent = totalPrice;

		cartTableGoods.append(...trGoods);
	},
	TotalCount() {
		const totalCount = this.cartGoods.reduce((sum, item) => {
			return sum + item.count
		}, 0);

		cartCount.textContent = totalCount;
	},
	addCartGood(id) {

		const goodItem = this.cartGoods.find((item) => item.id === id);
		if (goodItem) this.plusGood(id);
		else {
			getGoods()
				.then((res) => res.find((good) => good.id === id))
				.then((res) => {
					this.cartGoods = [...this.cartGoods, { ...res, count: 1 }];
					this.renderCard();
				})
		}

	},
	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCard();
	},
	clsearCard() {
		this.cartGoods = [];
		this.renderCard();
	},
	minusGood(id) {
		let reCount = [];

		this.cartGoods.forEach((item) => {

			if (item.id === id && item.count !== 0) {
				const count = --item.count;
				if (!count) this.deleteGood(id);
				else reCount = [...reCount, { ...item, count: count }];
			} else reCount = [...reCount, { ...item }];

		});

		this.cartGoods = [...reCount];
		this.renderCard();
	},
	plusGood(id) {
		let reCount = [];

		this.cartGoods.forEach((item) => {

			if (item.id === id) {
				const count = ++item.count;
				reCount = [...reCount, { ...item, count: count }];
			} else reCount = [...reCount, { ...item }];

		});

		this.cartGoods = [...reCount];
		this.renderCard();
	}
}

//Начальное значение корзины
cart.TotalCount();

const openModal = () => {
	cart.renderCard();
	modalCart.classList.add('show');
	document.addEventListener('keydown', escapeHandler);
}

const closeModal = () => {
	modalCart.classList.remove('show');
	document.removeEventListener('keydown', escapeHandler);
}

const escapeHandler = event => {
	if (event.code === 'Escape') closeModal();
}

modalCart.addEventListener('click', (e) => {
	const target = e.target;

	if (target.tagName === 'BUTTON' && !target.closest('.cart-clear') && !target.closest('.cart-buy') && !target.closest('.modal-close')) {
		const id = target.closest('.cart-item').dataset.id;

		if (target.classList.contains('cart-btn-delete')) cart.deleteGood(id);
		if (target.classList.contains('cart-btn-plus')) cart.plusGood(id);
		if (target.classList.contains('cart-btn-minus')) cart.minusGood(id);
	}

	if (e, target.closest('.cart-clear')) cart.clsearCard();

	//есть класс || есть родитель с классом
	if (e.target.classList.contains('modal-close') || !e.target.closest('.modal')) {
		closeModal();
	}
})

document.body.addEventListener('click', (e) => {
	const addToCard = e.target.closest('.add-to-cart');

	if (addToCard) cart.addCartGood(addToCard.dataset.id)

})

buttonCart.addEventListener('click', openModal);

//scroll smoothly
//Плавный скрол, встроенная js функция
(() => {
	const scrollLinks = document.querySelectorAll('a.scroll-link ');

	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', (event) => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
		})
	}
})()

//----------------------------2
//goods





const crateCard = ({ name, label, img, description, price, id }) => {
	const card = document.createElement('div');
	card.classList.add('col-lg-3', 'col-sm-6'); //можно и className
	card.innerHTML = `<div class="goods-card">
	${label ?
			`<span class="label">${label}</span>`
			: ''
		}
						<img src="db/${img}" alt="image: ${name}" class="goods-image">
						<h3 class="goods-title">${name} Hoodie</h3>
						<p class="goods-description">${description}</p>
						<button class="button goods-card-btn add-to-cart" data-id="${id}">
							<span class="button-price">$${price}</span>
						</button>
					</div>`

	return card;
}

const renderCards = (dataCards) => {
	longGoodsList.textContent = ''; //быстрее чем innerHTML
	const cards = dataCards.map(card => crateCard(card));
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
}

const filterCards = (field, value) => {
	getGoods().then((res) => res.filter((good) => good[field] === value))
		.then((res) => renderCards(res))

}

navigationLink.forEach(link => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.dataset.type;
		if (value === 'All') getGoods().then((res) => renderCards(res));
		else filterCards(field, value);
	})
})



more.addEventListener('click', (event) => {
	event.preventDefault();
	getGoods().then((res) => renderCards(res))
})


//-------------------------------3

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser,
})

modalForm.addEventListener('submit', event => {
	event.preventDefault(); //Не перезагружаем страницу

	let error = false;
	const name = modalForm.querySelector('input[name="nameCustomer"]').value.trim();
	const phone = modalForm.querySelector('input[name="phoneCustomer"]').value.trim();

	if (cart.cartGoods.length) {
		if (name && phone) {
			//Формируем объет с данными
			//В консоли пустой объетк
			const formData = new FormData(modalForm);
			//Добавляем товыры в body POST
			formData.append('cart', JSON.stringify(cart.cartGoods));
			postData(formData)
				.then(respons => {
					if (!respons.ok) {
						error = true;
						throw new Error(`Ошибка ответа от сервера ${respons.status}`);
					} else alert('Ваш заказ создан');
				})
				.catch(err => {
					alert(`Произошла ошибка отправки на сервер ${err}`);
				})
				.finally(() => {
					if (!error) {
						closeModal();
						modalForm.reset(); //Очистить офрму
						cart.clsearCard();
					}
				})

		} else {
			alert('Заполните все поля формы');
		}
	} else {
		alert('Корзина пуста');
	}
});


