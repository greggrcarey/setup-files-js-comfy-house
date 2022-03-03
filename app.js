/*Select the elements from the index.js at first 
so you can be less verbose later in the document
*/

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];

let buttonsDOM = [];

//gets products from wherever
class Products {
  async getProducts() {
    try {
      //local data has the same shape as the server/ Contentful data
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;

      /*Array destructuring. refer to products.json for original shape*/
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    let result = "";
    //console.log(`displayProducts:`, products);
    products.forEach((product) => {
      result += `
            <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="${product.title}-image" class="product-img">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!--end single product-->
            `;
    });

    productsDOM.innerHTML = result;
  }
  //Gets the html buttons to add items to cart
  //and handles adding items to cart. Should probably refactor
  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    console.log(btns);
    buttonsDOM = btns;

    btns.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        //console.log(event)
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        //get product from products
        //spread operator to add an amount of 1 to the cartItem
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        console.log(`cartItem: `, cartItem);

        //add product to cart
        cart = [...cart, cartItem];
        console.log(`cart: `, cart);

        Storage.saveCart(cart);

        this.setCartValues(cart);

        //display cart values
        this.addCartItem(cartItem);

        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let temptotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      temptotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(temptotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <!--cart item-->
    <img src="${item.image}" alt="${item.title}-image">
    <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    <!--end cart item-->
    `;

    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    /*This syntax only references the button html  
    clearCartBtn.addEventListener("click", this.clearCart);
    */

    clearCartBtn.addEventListener("click", () => {
      //Now _this_ points to the class and calls clearCart() below
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let itemId = removeItem.dataset.id; //uses the data-id attribute in html
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(itemId); //remove item from cart
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let itemId = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === itemId);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let itemId = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === itemId);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(itemId);
        }
      }
    });
  }
  clearCart() {
    let cartItemIds = cart.map((item) => item.id);
    cartItemIds.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    console.log(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setUpApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      //Get the buttons for manipulation after they have been loaded to the DOM
      ui.getBagButtons();
      ui.cartLogic();
    });
});
