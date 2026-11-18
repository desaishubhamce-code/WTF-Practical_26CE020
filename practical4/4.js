
function selectElements() {
    var message = document.getElementById("message");
    var demoItems = document.getElementsByClassName("demo");
    var paragraphs = document.getElementsByTagName("p");
    var firstProduct = document.querySelector("li");
    var allProducts = document.querySelectorAll("li");

    document.getElementById("selectionResult").innerHTML =
        "Message: " + message.innerHTML +
        "<br>Demo paragraphs: " + demoItems.length +
        "<br>Total paragraphs: " + paragraphs.length +
        "<br>First product: " + firstProduct.innerHTML +
        "<br>Products in list: " + allProducts.length;
}

function changeContent() {
    document.getElementById("content").innerHTML =
        "Welcome! Explore our latest products at CartCraft Store.";

    document.getElementById("contentMessage").innerHTML =
        "Text has been changed successfully.";
}

function changeStyle() {
    var text = document.getElementById("content");

    text.style.color = "#a04480";
    text.style.fontSize = "22px";
    text.style.fontWeight = "bold";

    document.getElementById("contentMessage").innerHTML =
        "New style applied successfully.";
}

function resetStyle() {
    var text = document.getElementById("content");

    text.style.color = "";
    text.style.fontSize = "";
    text.style.fontWeight = "";

    document.getElementById("contentMessage").innerHTML =
        "Original style restored.";
}

function changeLink() {
    var link = document.getElementById("shopLink");

    link.setAttribute("href", "https://www.wikipedia.org");
    link.innerHTML = "Open Wikipedia";
    link.setAttribute("target", "_blank");

    document.getElementById("contentMessage").innerHTML =
        "Link has been changed.";
}

function addProduct() {
    var product = document.getElementById("productName").value;

    if (product != "") {
        var newItem = document.createElement("li");

        newItem.innerHTML = product;
        document.getElementById("productList").appendChild(newItem);

        document.getElementById("listMessage").innerHTML =
            "Product added successfully.";

        document.getElementById("productName").value = "";
    } else {
        document.getElementById("listMessage").innerHTML =
            "Please enter a product name.";
    }
}

function replaceProduct() {
    var list = document.getElementById("productList");

    if (list.children.length > 0) {
        var newItem = document.createElement("li");

        newItem.innerHTML = "Travel Mug";
        list.replaceChild(newItem, list.children[0]);

        document.getElementById("listMessage").innerHTML =
            "First product has been replaced.";
    } else {
        document.getElementById("listMessage").innerHTML =
            "No product available to replace.";
    }
}

function removeProduct() {
    var list = document.getElementById("productList");

    if (list.children.length > 0) {
        list.removeChild(list.lastElementChild);

        document.getElementById("listMessage").innerHTML =
            "Last product has been removed.";
    } else {
        document.getElementById("listMessage").innerHTML =
            "Product list is empty.";
    }
}

function changeTheme() {
    document.body.classList.toggle("darkTheme");
}


function changeImage() {
    var choice = document.getElementById("imageChoice").value;

    if (choice == "Backpack") {
        document.getElementById("productImage").src =
            "backpack.webp";
    }
    else if (choice == "Bottle") {
        document.getElementById("productImage").src =
            "bottle.webp";
    }
    else if (choice == "headphones") {
        document.getElementById("productImage").src =
            "headphone.webp";
    }

    document.getElementById("productImage").alt = choice + " preview";

    document.getElementById("imageMessage").innerHTML =
        "Preview selected: " + choice;
}


function mouseOver() {
    document.getElementById("eventBox").style.backgroundColor = "#e5d5f5";

    document.getElementById("eventMessage").innerHTML =
        "Mouse entered the box.";
}

function mouseOut() {
    document.getElementById("eventBox").style.backgroundColor = "";

    document.getElementById("eventMessage").innerHTML =
        "Mouse moved outside the box.";
}

function doubleClick() {
    document.getElementById("eventBox").style.borderColor = "#d34b83";

    document.getElementById("eventMessage").innerHTML =
        "You double-clicked the box.";
}

function keyDown() {
    document.getElementById("keyMessage").innerHTML =
        "You are pressing a key.";
}

function keyUp() {
    var typedText = document.getElementById("userName").value;

    document.getElementById("keyMessage").innerHTML =
        "You entered: " + typedText;
}

function changeCategory() {
    var category = document.getElementById("category").value;

    if (category == "") {
        document.getElementById("categoryMessage").innerHTML =
            "Please select a category.";
    } else {
        document.getElementById("categoryMessage").innerHTML =
            "Selected category: " + category;
    }
}

function submitForm(event) {
    event.preventDefault();

    var customer = document.getElementById("customerName").value;
    var product = document.getElementById("customerProduct").value;

    if (customer != "" && product != "") {
        document.getElementById("formMessage").innerHTML =
            "Thank you " + customer + "! Your selected product is " + product + ".";
    } else {
        document.getElementById("formMessage").innerHTML =
            "Please enter your name and product.";
    }
}
