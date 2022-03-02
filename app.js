/*Select the elements from the index.js at first 
so you can be less verbose later in the document
*/ 

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];

//gets products from wherever
class Products{
    async getProducts(){
   
    try{
        //local data has the same shape as the server/ Contentful data
        let result = await fetch('products.json');
        let data = await result.json();
        let products = data.items;

        /*Array destructuring. refer to products.json for original shape*/
        products = products.map(item => {
            const {title, price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title, price, id, image}
        })
        
        return products;

    }catch(error){
        console.log(error);
    }
    }
}

//display products
class UI {
    displayProducts(products){
        let result = '';
        console.log(products);
        products.forEach(product => {
            result += `
            <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="${product.title}-image" class="product-img">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!--send single product-->
            `
        })

        productsDOM.innerHTML = result;
    }
}

//local storage
class Storage{

}

document.addEventListener("DOMContentLoaded", () =>{
    const ui = new UI()
    const products = new Products();

    //get all products
    products.getProducts().then(products => ui.displayProducts(products))

})