/* =========================================================
   ITUS102 - Practical 4
   DOM Manipulation and Event Handling - ShopEase Online Store
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   TASK 2: Accessing elements using different DOM methods
   --------------------------------------------------------- */
const siteTitle     = document.getElementById("site-title");          // getElementById
const productItems  = document.getElementsByClassName("product-item"); // getElementsByClassName (live HTMLCollection)
const allSections   = document.getElementsByTagName("section");        // getElementsByTagName
const productList   = document.querySelector("#product-list");         // querySelector
const addButtons    = document.querySelectorAll(".add-btn");           // querySelectorAll (static NodeList)

const messageBox    = document.getElementById("message");
const menuToggle    = document.getElementById("menu-toggle");
const mainMenu      = document.getElementById("main-menu");
const themeToggle   = document.getElementById("theme-toggle");
const searchInput   = document.getElementById("search-input");
const categorySel   = document.getElementById("category-select");
const resultCount   = document.getElementById("result-count");
const cartList      = document.getElementById("cart-list");
const emptyNote     = document.getElementById("empty-cart-note");
const cartTotalEl   = document.getElementById("cart-total");
const cartCountEl   = document.getElementById("cart-count");
const clearCartBtn  = document.getElementById("clear-cart");
const addForm       = document.getElementById("add-form");
const previewBox    = document.getElementById("preview-box");
const previewImg    = document.getElementById("preview-img");
const previewCap    = document.getElementById("preview-caption");
const closePreview  = document.getElementById("close-preview");
const feedbackText  = document.getElementById("feedback-text");
const charCount     = document.getElementById("char-count");
const livePreview   = document.getElementById("live-preview");
const keyDisplay    = document.getElementById("key-display");

// Cart is stored as an array of objects: { name, price }
let cart = [];

console.log("Total sections on page:", allSections.length);
console.log("Initial product count:", productItems.length);

/* ---------------------------------------------------------
   TASK 6: Feedback messages (auto-hide after 3 seconds)
   --------------------------------------------------------- */
let messageTimer = null;

function showMessage(text, type = "info") {
  messageBox.textContent = text;                 // modify content
  messageBox.className = "message " + type;      // modify attribute (class)
  clearTimeout(messageTimer);
  messageTimer = setTimeout(function () {
    messageBox.textContent = "";
    messageBox.className = "message";
  }, 3000);
}

/* ---------------------------------------------------------
   TASK 3: Modify content, attributes and CSS styles
   --------------------------------------------------------- */
// Change heading content and style dynamically on load
siteTitle.textContent = "🛒 ShopEase - Online Store";
siteTitle.style.letterSpacing = "1px";
siteTitle.setAttribute("title", "Welcome to ShopEase");

/* ---------------------------------------------------------
   TASK 7a: Dynamic menu (click event)
   --------------------------------------------------------- */
menuToggle.addEventListener("click", function () {
  const isHidden = mainMenu.classList.toggle("hidden");
  menuToggle.setAttribute("aria-expanded", String(!isHidden));
  menuToggle.textContent = isHidden ? "☰ Menu" : "✖ Close";
});

/* ---------------------------------------------------------
   TASK 7b: Theme switching (click event + classList)
   --------------------------------------------------------- */
themeToggle.addEventListener("click", function () {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  showMessage(isDark ? "Dark theme enabled" : "Light theme enabled", "info");
});

/* ---------------------------------------------------------
   TASK 5: mouseover / mouseout - highlight product cards
   (event delegation on the parent list)
   --------------------------------------------------------- */
productList.addEventListener("mouseover", function (event) {
  const card = event.target.closest(".product-item");
  if (card) {
    card.classList.add("highlight");
  }
});

productList.addEventListener("mouseout", function (event) {
  const card = event.target.closest(".product-item");
  if (card) {
    card.classList.remove("highlight");
  }
});

/* ---------------------------------------------------------
   TASK 4 + 5: Create and append elements (Add to Cart)
   click event on "Add to Cart" buttons
   --------------------------------------------------------- */
function attachAddHandler(button) {
  button.addEventListener("click", function () {
    const card = button.closest(".product-item");
    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    cart.push({ name: name, price: price });
    renderCart();
    showMessage(name + " added to cart.", "success");
  });
}

addButtons.forEach(attachAddHandler);

/* Render the cart: create li elements, append, remove on click */
function renderCart() {
  cartList.innerHTML = "";   // clear existing items

  cart.forEach(function (item, index) {
    // CREATE elements
    const li = document.createElement("li");
    const label = document.createElement("span");
    const removeBtn = document.createElement("button");

    label.textContent = item.name + " - ₹" + item.price;
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("type", "button");

    // REMOVE element when button clicked
    removeBtn.addEventListener("click", function () {
      const removed = cart.splice(index, 1)[0];
      li.remove();           // remove element from DOM
      renderCart();          // refresh numbering and totals
      showMessage(removed.name + " removed from cart.", "error");
    });

    // APPEND elements
    li.appendChild(label);
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });

  updateCartSummary();
}

function updateCartSummary() {
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price;
  }
  cartTotalEl.textContent = total;
  cartCountEl.textContent = cart.length;
  emptyNote.style.display = cart.length === 0 ? "block" : "none";
}

clearCartBtn.addEventListener("click", function () {
  if (cart.length === 0) {
    showMessage("Cart is already empty.", "info");
    return;
  }
  cart = [];
  renderCart();
  showMessage("Cart cleared.", "error");
});

/* ---------------------------------------------------------
   TASK 4 + 5: REPLACE element on double-click
   Double-click product name -> replace <h3> with <input>
   Press Enter or leave field (blur) -> replace back with <h3>
   --------------------------------------------------------- */
productList.addEventListener("dblclick", function (event) {
  const heading = event.target.closest(".product-name");
  if (!heading) return;

  const card = heading.closest(".product-item");
  const input = document.createElement("input");
  input.type = "text";
  input.value = heading.textContent;
  input.className = "edit-input";

  heading.replaceWith(input);   // replace h3 with input
  input.focus();
  input.select();

  function saveName() {
    const newName = input.value.trim() || card.dataset.name;
    const newHeading = document.createElement("h3");
    newHeading.className = "product-name";
    newHeading.textContent = newName;

    card.dataset.name = newName;
    card.querySelector(".product-img").alt = newName;

    input.replaceWith(newHeading);   // replace input with h3
    showMessage("Product name updated to \"" + newName + "\".", "success");
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      input.removeEventListener("blur", saveName);
      saveName();
    }
  });
  input.addEventListener("blur", saveName, { once: true });
});

/* ---------------------------------------------------------
   TASK 5: keyup + keydown (Search with live filtering)
   TASK 5: change event (Category filter)
   --------------------------------------------------------- */
function filterProducts() {
  const text = searchInput.value.trim().toLowerCase();
  const category = categorySel.value;
  let visible = 0;

  // querySelectorAll used again to get current products
  document.querySelectorAll(".product-item").forEach(function (card) {
    const nameMatch = card.dataset.name.toLowerCase().includes(text);
    const catMatch = category === "all" || card.dataset.category === category;

    if (nameMatch && catMatch) {
      card.style.display = "";        // show (modify CSS style)
      visible++;
    } else {
      card.style.display = "none";    // hide
    }
  });

  resultCount.textContent = "Showing " + visible + " product" + (visible === 1 ? "" : "s");
  return visible;
}

searchInput.addEventListener("keyup", function () {
  const visible = filterProducts();
  if (visible === 0) {
    showMessage("No products match your search.", "error");
  }
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    searchInput.value = "";
    filterProducts();
    showMessage("Search cleared.", "info");
  }
});

categorySel.addEventListener("change", function () {
  filterProducts();
  showMessage("Category: " + categorySel.value, "info");
});

/* ---------------------------------------------------------
   TASK 4: Create new product dynamically (form submit)
   --------------------------------------------------------- */
addForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nameInput = document.getElementById("new-name");
  const priceInput = document.getElementById("new-price");
  const catInput = document.getElementById("new-category");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  // Validation feedback
  if (name === "" || !(price > 0)) {
    showMessage("Please enter a valid name and price.", "error");
    return;
  }

  // CREATE all elements
  const li = document.createElement("li");
  li.className = "product-item";
  li.dataset.name = name;
  li.dataset.price = price;
  li.dataset.category = catInput.value;

  const img = document.createElement("img");
  img.className = "product-img";
  img.alt = name;
  img.src = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='140'>" +
    "<rect width='200' height='140' fill='%23e5e7eb'/>" +
    "<text x='100' y='90' font-size='60' text-anchor='middle'>🆕</text></svg>";

  const h3 = document.createElement("h3");
  h3.className = "product-name";
  h3.textContent = name;

  const p = document.createElement("p");
  p.className = "price";
  p.textContent = "₹" + price;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "add-btn";
  btn.textContent = "Add to Cart";
  attachAddHandler(btn);   // reuse the same click handler

  // APPEND to the card, then card to the list
  li.append(img, h3, p, btn);
  productList.appendChild(li);

  addForm.reset();
  filterProducts();
  showMessage("New product \"" + name + "\" added.", "success");
});

/* ---------------------------------------------------------
   TASK 7c: Image preview (click event, attribute change)
   --------------------------------------------------------- */
productList.addEventListener("click", function (event) {
  if (event.target.classList.contains("product-img")) {
    previewImg.setAttribute("src", event.target.src);   // change attribute
    previewImg.setAttribute("alt", event.target.alt);
    previewCap.textContent = event.target.alt;
    previewBox.classList.remove("hidden");
    previewBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

closePreview.addEventListener("click", function () {
  previewBox.classList.add("hidden");
});

/* ---------------------------------------------------------
   TASK 7d: Live content updates (keyup + keydown)
   --------------------------------------------------------- */
feedbackText.addEventListener("keyup", function () {
  const value = feedbackText.value;
  charCount.textContent = value.length;
  livePreview.textContent = value.trim() === "" ? "(nothing typed yet)" : value;

  // Change style when near the limit
  charCount.style.color = value.length > 130 ? "red" : "";
});

feedbackText.addEventListener("keydown", function (event) {
  keyDisplay.textContent = event.key === " " ? "Space" : event.key;
});

/* ---------------------------------------------------------
   Initial state
   --------------------------------------------------------- */
updateCartSummary();
filterProducts();
showMessage("Welcome to ShopEase! Start shopping.", "info");
