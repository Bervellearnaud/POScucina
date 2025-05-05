// MENU INITIAL
let menu = [
  { name: "Salade Niçoise", price: 3000 },
  { name: "Salade de pattes au thon", price: 3000 },
  { name: "Salade César", price: 3000 },
  { name: "Sandwich au poulet", price: 3000 },
  { name: "Sandwich au thon", price: 3000 },
  { name: "Sandwich au jambon & fromage", price: 3000 },
  { name: "Chawarma au poulet", price: 3000 },
  { name: "Burger au boeuf", price: 5000 },
  { name: "Pizza végétarienne ", price: 5000 },
  { name: "Pizza margherita", price: 5000 },
  { name: "Pizza au jambon", price: 5000 },
  { name: "Pizza au poulet", price: 5000 },
  { name: "Tchep au poisson", price: 5000 },
  { name: "Riz Lafri au poulet", price: 5000 },
  { name: "Cupcake au chocolat", price: 1000 },
  { name: "Cupcake Nature", price: 1000 },
  { name: "Thé", price: 1000 },
  { name: "Expresso", price: 1000 },
  { name: "Café latté", price: 1000 },
  { name: "Cappuccino", price: 1000 },
  { name: "Chocolat chaud", price: 1000 },
];

// Restauration du menu personnalisé (si existant)
const savedMenu = JSON.parse(localStorage.getItem("customMenu") || "[]");
if (savedMenu.length > menu.length) menu = savedMenu;

// PANIER
let cart = menu.map((item) => ({ ...item, qty: 0 }));

function updateMenu() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = "";
  cart.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">${item.price.toFixed(0)} FCFA</span>
            <input type="number" min="0" value="${
              item.qty
            }" onchange="updateQty(${idx}, this.value)">
        `;
    menuList.appendChild(li);
  });
}

function updateQty(idx, value) {
  let qty = parseInt(value);
  if (isNaN(qty) || qty < 0) qty = 0;
  cart[idx].qty = qty;
  updateCart();
}

function updateCart() {
  const cartList = document.getElementById("cart-list");
  const totalSpan = document.getElementById("total");
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    if (item.qty > 0) {
      total += item.price * item.qty;
      const li = document.createElement("li");
      li.textContent = `${item.name} x${item.qty} - ${(
        item.price * item.qty
      ).toFixed(0)} FCFA`;
      cartList.appendChild(li);
    }
  });
  totalSpan.textContent = total.toFixed(0);
}

// Effacer le panier
function clearCart() {
  cart.forEach((item) => (item.qty = 0));
  updateCart();
  updateMenu();
}

// Générer le ticket HTML
function getTicketHTML() {
  let items = cart.filter((item) => item.qty > 0);
  let total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let html = `<h2>Ticket de caisse</h2><ul>`;
  items.forEach((item) => {
    html += `<li>${item.name} x${item.qty} - ${(item.price * item.qty).toFixed(
      0
    )} FCFA</li>`;
  });
  html += `</ul><p>Total : ${total.toFixed(0)} FCFA</p>`;
  html += `<p>${new Date().toLocaleString()}</p>`;
  return html;
}

// Sauvegarder la transaction dans le localStorage
function saveTransaction() {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  let now = new Date();
  let today = now.toISOString().split("T")[0];
  let items = cart
    .filter((item) => item.qty > 0)
    .map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
    }));
  let total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (items.length === 0) return; // Pas d'enregistrement si panier vide
  transactions.push({
    date: today,
    time: now.toLocaleTimeString(),
    items,
    total,
  });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  showTransactionsForDate(today); // Mise à jour de la liste
}

// Afficher les transactions pour une date donnée
function showTransactionsForDate(dateStr) {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  let filtered = transactions.filter((tx) => tx.date === dateStr);
  let list = document.getElementById("transactions-list");
  if (!list) return;
  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = "<li>Aucune transaction ce jour-là.</li>";
  } else {
    filtered.forEach((tx) => {
      let li = document.createElement("li");
      let itemsStr = tx.items.map((i) => `${i.name} x${i.qty}`).join(", ");
      li.textContent = `[${tx.time}] ${itemsStr} - Total: ${tx.total} FCFA`;
      list.appendChild(li);
    });
  }
  // Appel des statistiques
  showStatsForDate(dateStr);
}

// Statistiques journalières
function showStatsForDate(dateStr) {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  let filtered = transactions.filter((tx) => tx.date === dateStr);

  // Statistiques de base
  let nbVentes = filtered.length;
  let total = filtered.reduce((sum, tx) => sum + tx.total, 0);

  // Calcul top produits
  let productCount = {};
  filtered.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!productCount[item.name]) productCount[item.name] = 0;
      productCount[item.name] += item.qty;
    });
  });

  // Tri top produits
  let topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Affichage
  document.getElementById("stats-sales").textContent = nbVentes;
  document.getElementById("stats-total").textContent = total.toFixed(0);

  let topList = document.getElementById("stats-top-products");
  topList.innerHTML = "";
  if (topProducts.length === 0) {
    topList.innerHTML = "<li>Aucun produit vendu.</li>";
  } else {
    topProducts.forEach(([name, qty]) => {
      let li = document.createElement("li");
      li.textContent = `${name} (${qty})`;
      topList.appendChild(li);
    });
  }
}

// Impression du ticket
function printTicket() {
  const ticketDiv = document.getElementById("ticket");
  ticketDiv.innerHTML = getTicketHTML();
  ticketDiv.style.display = "block";
  saveTransaction();
  setTimeout(() => {
    window.print();
    ticketDiv.style.display = "none";
  }, 150);
}

// Enregistrement du ticket en PDF
function saveTicketPDF() {
  const ticketDiv = document.getElementById("ticket");
  ticketDiv.innerHTML = getTicketHTML();
  ticketDiv.style.display = "block";
  saveTransaction();
  setTimeout(() => {
    html2pdf()
      .set({
        margin: 0.3,
        filename: "ticket-restaurant.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 4, letterRendering: true, useCORS: true },
        jsPDF: { unit: "in", format: [3, 5], orientation: "portrait" },
      })
      .from(ticketDiv)
      .save()
      .then(() => {
        ticketDiv.style.display = "none";
      });
  }, 150);
}

// Ajout d'un produit au menu
function addProductToMenu() {
  const nameInput = document.getElementById("new-product-name");
  const priceInput = document.getElementById("new-product-price");
  const name = nameInput.value.trim();
  const price = parseInt(priceInput.value);

  if (!name || isNaN(price) || price <= 0) {
    alert("Veuillez saisir un nom valide et un prix supérieur à 0.");
    return;
  }

  // Vérifie si le produit existe déjà
  if (menu.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
    alert("Ce produit existe déjà dans le menu.");
    return;
  }

  // Ajoute au menu et au panier
  menu.push({ name, price });
  cart.push({ name, price, qty: 0 });

  // Sauvegarde dans le localStorage pour persistance
  localStorage.setItem("customMenu", JSON.stringify(menu));

  // Rafraîchit l'affichage
  updateMenu();
  nameInput.value = "";
  priceInput.value = "";
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  updateMenu();
  updateCart();

  // Gestion bouton ajout produit
  const addBtn = document.getElementById("add-product-btn");
  if (addBtn) addBtn.addEventListener("click", addProductToMenu);

  // Initialisation du filtre date
  const dateInput = document.getElementById("date-filter");
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  showTransactionsForDate(today);

  dateInput.addEventListener("change", function () {
    showTransactionsForDate(this.value);
  });
});
function exportTransactionsCSV(dateStr) {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  let filtered = transactions.filter((tx) => tx.date === dateStr);

  if (filtered.length === 0) {
    alert("Aucune transaction à exporter pour cette date.");
    return;
  }

  // Génère les lignes CSV
  let csv = "Heure,Produit,Quantité,Prix unitaire,Total ligne\n";
  filtered.forEach((tx) => {
    tx.items.forEach((item) => {
      let lineTotal = item.qty * item.price;
      csv += `"${tx.time}","${item.name}",${item.qty},${item.price},${lineTotal}\n`;
    });
  });
  // Ajoute un résumé total
  let totalDay = filtered.reduce((sum, tx) => sum + tx.total, 0);
  csv += `\n,,,"TOTAL JOUR",${totalDay}\n`;

  // Création et téléchargement du fichier
  let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);

  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `transactions_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Ajoute l'écouteur sur le bouton
document.addEventListener("DOMContentLoaded", function () {
  const exportBtn = document.getElementById("export-csv-btn");
  const dateInput = document.getElementById("date-filter");
  if (exportBtn && dateInput) {
    exportBtn.addEventListener("click", function () {
      exportTransactionsCSV(dateInput.value);
    });
  }
});
