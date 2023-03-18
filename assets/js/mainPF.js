
async function getProducts(){
    
    try{

        const data =await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/");

        const res= await data.json();

            window.localStorage.setItem("products", JSON.stringify(res));
            // console.log(res);
            return res;

    
    }catch(error){
        console.log(error);
       }
     
}

      
function printProduct(product){  
        let prod=`
            <div class="product">  
                <div class="product__img">
                   <img src="${product.image}" alt=""></img>
                </div>
            
                <div class="product__info">
                    
                    <h2 >
                        $${product.price}
                        ${
                            product.quantity!==0
                            ? `<i class='bx bx-plus' id='${product.id}'></i>`
                            : "<span class='soldOut'>sold out</span>"
                         }
                         
                    </h2>
                   
                    <h3><b>Stock: </b>${product.quantity}</h3>
                  
                   <h5><span> ${product.name}</span> </h5>
                </div>
               
            </div> `;
         return prod;
      } 
           
    
     
function printProducts(products){
            const dataHTML=document.querySelector(".products"); //selecciono elemento
            
            let html="";
            for (const prod of products.products){
                html+=printProduct(prod);
              } 
            dataHTML.innerHTML=html;
        }
     
function handleShowCart(){

        
        const  iconCartHTML=document.querySelector(".bx-cart");
        const  cartHTML=document.querySelector(".cart");
        
        let count=0;
        iconCartHTML.addEventListener("click",function(){
            // console.log("clikkkkkk", ++count);
            cartHTML.classList.toggle("cart__show")
        });
    }

 

function addToCartFromProducts(db){
   
    const productsHTML = document.querySelector(".products");
    
    productsHTML.addEventListener("click", function(e){
        if(e.target.classList.contains("bx-plus")){
            const id = Number(e.target.id);
    
            
            const productFind = db.products.find( 
               (product) => product.id === id
               );
            
                if(db.cart[productFind.id]){
                    if(productFind.quantity === db.cart[productFind.id].amount)
                         return alert("No tenemos más en stock");
    
                    db.cart[productFind.id].amount++;
                } else {
                    db.cart[productFind.id] = { ...productFind, amount: 1};
            }
    
            window.localStorage.setItem("cart", JSON.stringify(db.cart));
            printProductsInCart(db);
            printTotal(db)
            handlePrintAmountProducts(db);
            
        }
    
    })
    }

/********************************************/
function printProductsInCart(db){

    const cartProducts = document.querySelector(".cart__products");

    let html= "";

    for (const product in db.cart){
        const {quantity, price, name, image, id, amount} = db.cart[product];
      
        console.log({quantity, price, name, image, id, amount});
        html += `
            <div class="cart__product">
                <div class="cart__product--img">
                    <img src="${image}" alt="imagen" />
                </div>
                <div class="cart__product--body">
                    <h4>${name} | $${price}</h4>
                    <p>Stock: ${quantity} </p>

                    <div class="cart__product--body-op" id="${id}">
                        <i class='bx bx-minus'></i>
                        <span>${amount}_unit</span>
                        <i class='bx bx-plus'></i>
                        <i class='bx bx-trash'></i>
                    </div>
                    </div>
            </div>
        `;
    }

    cartProducts.innerHTML = html;
}


function handleProductsInCart(db){
    
    const cartProducts = document.querySelector(".cart__products");

    cartProducts.addEventListener("click", function (e){
        if(e.target.classList.contains("bx-plus")){
            const id = Number(e.target.parentElement.id);

            const productFind = db.products.find(
                (product) => product.id === id
            );

            if(productFind.quantity === db.cart[productFind.id].amount)
                return alert("Lo sentimos, no disponemos de mas stock");

            db.cart[id].amount++;
        }

        if(e.target.classList.contains("bx-minus")){
            const id = Number(e.target.parentElement.id);
            if(db.cart[id].amount === 1) {
                const response = confirm(
                    "¿Estás seguro que quieres eliminar este producto?"
                );
                if(!response) return;
                delete db.cart[id];
            } else {
            db.cart[id].amount--;
            }
        }

        if(e.target.classList.contains("bx-trash")){
            const id = Number(e.target.parentElement.id);
            const response = confirm(
                "¿Estás seguro que quieres eliminar este producto?"
            );
            if(!response) return;
            delete db.cart[id];
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart));
        printProductsInCart(db);
        printTotal(db);
        handlePrintAmountProducts(db);
    })
}

function printTotal(db){
    
   
    const infoTotal = document.querySelector(".info__total");
    const infoAmount = document.querySelector(".info__amount");

    let totalProducts = 0;
    let amountProducts = 0;

    for (const product in db.cart){
        const {amount, price} = db.cart[product];
        totalProducts += price * amount;
        amountProducts += amount;
    }

    infoAmount.textContent = amountProducts + " units";
    infoTotal.textContent = "$" + totalProducts + ".00";

}

function handleTotal(db){
    
    const btnBuy = document.querySelector(".btn__buy");

    btnBuy.addEventListener("click", function(){
        if(!Object.values(db.cart).length)
        return alert("Tienes que elegir algún producto antes de comprar");

        const response = confirm("¿Estás seguro que quieres comprar?");
        if(!response)return;

        const currentProducts = [];

        for (const product of db.products) {
            const productCart = db.cart[product.id];
            if (product.id === productCart?.id){
                currentProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount,
                });
            } else {
                currentProducts.push(product)
            }
        }

        db.products = currentProducts;
        db.cart = {};

        window.localStorage.setItem("products", JSON.stringify(db.products));
        window.localStorage.setItem("cart", JSON.stringify(db.cart));

        printTotal(db);
        printProductsInCart(db);
        printProducts(db);
        handlePrintAmountProducts(db);


    })
}

function handlePrintAmountProducts(db){
    const amountProducts = document.querySelector(".amountProducts");

    let amount = 0;

    for( const product in db.cart){
        amount += db.cart[product].amount;
    }
  
    amountProducts.textContent = amount;
}



//*************************************
//*************************************** */

async function main(){

    const db = {
        products: 
        JSON.parse(window.localStorage.getItem("products")) || 
        (await getProducts()),
        cart: JSON.parse(window.localStorage.getItem("cart")) || {},
    }
    printProducts(db);// llamado a la funcion

    handleShowCart();// llamado a la funcion
    addToCartFromProducts(db);
    printProductsInCart(db);
    handleProductsInCart(db);
    printTotal(db);
    handleTotal(db);
    handlePrintAmountProducts(db);
        
    
         // hace que el carrito se repliegue al clickear en el ("clikkkkkk", ++count);
        //   const areaCartHTML = document.getElementById("cartOut"); 
        //     //   areaCartHTML=document.querySelector(".cart");
        //       areaCartHTML.addEventListener("click",function(){
        //         areaCartHTML.classList.toggle("cart__show");
              
        // });
           

    // ******************************************
   
    

}



  
main();
     




// // console.log(usuario[0]);
