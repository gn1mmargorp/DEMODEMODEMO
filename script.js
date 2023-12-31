/* GENERISANJE UNIKATNOG TOKENA ZA SVAKOG POJEDINACNOG KORISNIKA */
function generateUniqueToken() {
    let token = '';
    let characters = 'qwertyyuiopasdfghjkl;zxcvbnm1234567890!@#$%^&*_+=-<>?,.';
    for (let i = 0; i < characters.length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex)    
    }
    return token;
}
/* CUVAMO TOKEN U GLOBALNU VARIJABLU 'token' I CINIMO GA DOSTUPNIM ZA UPOTREBU U CIJELOM KODU */
let token = generateUniqueToken();




















/* PRIKAZ KORPE KLIKOM NA CART IKONICU I SAKRIVANJE ISTE KLIKOM NA 'X' */
document.querySelector('.cart-icon').addEventListener('click', () => {
    document.querySelector('.cart').style.display = 'flex';
});
document.querySelector('.close-cart-button').addEventListener('click', e => {
    e.target.parentElement.style.display = 'none';
})










/* FUNKCIJA ZA DOHVATANJE PODATAKA SA 'FAKE STORE API'-JA */
async function getFakeStoreData() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/2')
        if (!response.ok) {
            throw new Error('error fetching data')
        }
        const data = await response.json()
        data.description = data.description.length > 120 ? data.description.substr(0, 120).concat('...') : data.description
        const productHTML = document.createElement('div');
        productHTML.classList.add('product');
        productHTML.innerHTML = `
            <img src="https://trickycider.com/cdn/shop/products/HD-GRY_900x.png?v=1626092656"/>
            <p class="title">Thick Hoodie</p>
            <p class="description">${data.description}</p>
            <p class="price">$69.99</p>
            <button id="add-to-cart-button" class="add-to-cart-button">ADD TO CART</button>
        `
        document.getElementById('container').appendChild(productHTML)
        document.getElementById('add-to-cart-button').addEventListener('click', e => {
            shoppingCart.addToCart();
            e.target.disabled = true;
            e.target.innerText = 'ADDED'
        })
    } catch (error) {
        console.log(`Something went wrong while fetching the data: ${error}`)
    } 
}
// PO OTVARANJU STRANICE AUTOMATSKI JE AZURIRAMO PODACIMA SA 'PLATZI FAKE STORE API'-JA
window.addEventListener('load', getFakeStoreData);













/* KREIRAMO KLASU KOJA PREDSTAVLJA KORPU */
class Cart {
    constructor() {
        this.items = [];
    }

    addToCart() {
        const product = document.querySelector('.product');
        const cartContainer = document.querySelector('#cart-products');
        cartContainer.innerHTML = `
            <img src="${product.querySelector('img').getAttribute('src')}"/>
            <p>${product.querySelector('.title').innerText}</p>
            <p>${product.querySelector('.price').innerText}</p>
            <button id="remove-from-cart-button">x</button>
        `;
        document.getElementById('remove-from-cart-button').addEventListener('click', () => {
            shoppingCart.removeFromCart();
            document.getElementById('add-to-cart-button').disabled = false;
            document.getElementById('add-to-cart-button').innerText = 'ADD TO CART';
        })
        this.items.push(`${product.querySelector('.title').innerText}`);
    }

    removeFromCart() {
        const cartContainer = document.querySelector('#cart-products');
        cartContainer.innerHTML = `<p>Your cart is empty</p>`;
        this.items = [];
    }
}
// KREIRAMO INSTANCU KLASE 'Cart'
const shoppingCart = new Cart();













/* KREIRAMO KLASU ZA LOGIN I REGISTRACIJU KORISNIKA */
class User {

    constructor() {
        this.usernameOrEmail = document.querySelector('#username_or_email')
        this.password = document.querySelector('#password');
        this.newUsername = document.querySelector('#new-username');
        this.newEmail = document.querySelector('#new-email');
        this.newPassword = document.querySelector('#new-password');
        this.isLoggedIn = false;
        this.isRegistered = false;
        this.isInLocalStorage();
    }







    register() {
        let loggedInUser = {
            username: this.newUsername.value,
            email: this.newEmail.value,
            password: this.newPassword.value,
            token: token
        }
        if (this.validateOnSignUp()) {
            this.isLoggedIn = true;
            this.isRegistered = true;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            localStorage.setItem('registeredUser', JSON.stringify(loggedInUser));
            document.querySelector('.register-form-wrapper').style.display = 'none';
            location.reload();
        } else {
            alert('Registration failed');
        }
    }



    


    
    
    login() {
        let registeredUser = JSON.parse(localStorage.getItem('registeredUser'));
        if (!this.validateOnLogin()) {
            return false;
        }
        if (registeredUser) {
            if ((this.usernameOrEmail.value !== registeredUser.username || this.usernameOrEmail.value !== registeredUser.email) && this.password.value !== registeredUser.password) {
                alert('There is no such username or email and password in our database, try again')
                return false;
            }
        } else {
            alert('There is no such username or email and password in our database, try again')
            return false;
        }
        
        let loggedInAgain = JSON.parse(localStorage.getItem('registeredUser'));
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInAgain));
        location.reload();
        return true;
    }







    logout() {
        localStorage.removeItem('loggedInUser');
        location.reload();
    }








    deleteAccount() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('registeredUser');
        location.reload();
    }








    validateOnSignUp() {
        if (this.newUsername.value.trim().length < 3 || this.newUsername.value.trim().length > 15) {
            return false;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.newEmail.value)) {
            return false;
        }
        if (this.newPassword.value.trim().length < 8) {
            return false;
        }
        return true;
    }     







    validateOnLogin() {
        if (this.usernameOrEmail.value.trim().length < 3) {
            alert('username or email field must have at least 3 characters')
            return false;
        }
        if (this.password.value.trim().length < 8) {
            alert('password must have at least 8 characters')
            return false;
        }
        return true;
    }



    



    

    /*
    OVA METODA PO OTVARANJU STRANICE AZURIRA SADRZAJ ZACELJA NASE STRANICE NA OSVNOVU STANJA LOCAL STORAGE-A
    (ako je korisnik prijavljen onda prikazujemo 'Log Oout' dugme a ako nije prijavljen prikazujemo 'Log In' i 'Sign Up' dugmad....)
    TAKODJE SE U NJOJ NALAZE EVENT LISTENERI KOJI IZVRSAVAJU LOGIKU DRUGIH METODA IZ OVE KLASE .....
    */
    isInLocalStorage() {
        let loggedInUserData = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUserData) {
            document.querySelector('.login-register').style.display = 'block';
            document.querySelector('.logout-delete').style.display = 'none';
            const signUpBtn = document.querySelector('#register-form button');
            signUpBtn.addEventListener('click', e => {
                e.preventDefault();
                this.register();
                
            })
            const logInBtn = document.querySelector('#login-form button');
            logInBtn.addEventListener('click', e => {
                e.preventDefault();
                    this.login();
                    
            })
            document.querySelector('.login-button').addEventListener('click', () => {
                document.querySelector('.login-form-wrapper').style.display = 'flex';
            })
            document.querySelector('.register-button').addEventListener('click', () => {
                document.querySelector('.register-form-wrapper').style.display = 'flex';
            })
            document.querySelectorAll('.close-form-button').forEach(button => button.addEventListener('click', e => e.target.parentElement.parentElement.style.display = 'none'));
        } else {
            document.querySelector('.login-register').style.display = 'none';
            document.querySelector('.logout-delete').style.display = 'block';
            document.querySelector('.logout-button').addEventListener('click', e => {
                e.preventDefault();
                this.logout()
            })
            document.querySelector('.delete-button').addEventListener('click', e => {
                e.preventDefault();
                this.deleteAccount()
            })
        }
    }





}







/* KREIRANJE INSTANCE KLASE 'User' */
let user = new User(); // da bi sva logika koju smo napisali u klasi 'User' funckionisala, samo je potrebna jos ova linija koda i to je to