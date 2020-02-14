function show_page() {
    show_page_secured()
}

// storing products in an array, functions can access
let products; // global variable on this page, a list of products read from db

async function show_page_secured() {
    glPageContent.innerHTML = '<h1>Show Products</h1>'
    glPageContent.innerHTML += `
        <a href='/home' class="btn btn-outline-primary">Home</a>
        <a href='/add' class="btn btn-outline-primary">Add a Product</a>
        <br>
    `;

    // nonblocking synchronous function call, so set up try/catch block
    try {
        // array will store all product info
        products = []
        // snapshot (of this collection in the database)
        const snapshot = await firebase.firestore().collection(COLLECTION).get()

        // read all the products from the collection
        snapshot.forEach( doc => {
            // read each key-value in document and then store it into a var
            const {name, summary, price, image, image_url} = doc.data()
            // construct a javascript object:
            // like primary key in SQL, each NoSQL document has a document id
            // here, variable docId is storing the doc.id
            const p = {docId: doc.id, name, summary, price, image, image_url}
            // push into products array:
            products.push(p)
        })
    } catch (e) {
        glaPageContent.innerHTML = 'Firestore access error. Try again later!<br>' + e
        // return think of as 'stop here'
        return
    }

    //console.log(products)

    if (products.length === 0) {
        // using += will allow to keep the navigation menu on the top
        glPageContent += '<h1>No products in the database</h1>'
        return
    }

    for (let index = 0; index < products.length; index++) {
        // define p (this caused error): 'products at index'
        const p = products[index]
        // skip any deleted elements
        if (!p) continue
        // use .innerHTML for <complex> HTML, along with back quote
        // add id attribute to card div: unique id is doc id provided by firestore
        // add display: inline-block so the images will not display as a column
        // manually added button: 2 functions here
        glPageContent.innerHTML += `
        <div id="${p.docId}" class="card" style="width: 18rem; display: inline-block">
            <img src="${p.image_url}" class="card-img-top">
            <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.price}<br/>${p.summary}</p>
            <button class="btn btn-primary" type="button"
                onclick="editProduct(${index})">Edit</button>
            <button class="btn btn-danger" type="button"
                onclick="deleteProduct(${index})">Delete</button>
            </div>
        </div>
        `;
    }
}

// index is provided
async function deleteProduct(index) {
    try {
        // delete db information
        const p = products[index]
        // delete (1) Firestore doc, (2) Storage image
        await firebase.firestore().collection(COLLECTION).doc(p.docId).delete()
        const imageRef = firebase.storage().ref().child(IMAGE_FOLDER + p.image)
        await imageRef.delete()

        // delete visual in web browser
        // card id ... get the card tag (unique id)
        const card = document.getElementById(p.docId)
        // remove by unique id (card)
        card.parentNode.removeChild(card)

        // add code to for loop: if (!p) continue
        delete products[index]
    } catch (e) {
        glPageContent.innerHTML = 'Delete Error: <br>' + JSON.stringify(e)
    }
}