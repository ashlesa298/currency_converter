const result = document.getElementById("result");

// Currency → Country code for flags
const currencyToCountry = {
  USD: "us", INR: "in", EUR: "eu", GBP: "gb", AUD: "au",
  CAD: "ca", SGD: "sg", JPY: "jp", CNY: "cn", RUB: "ru",
  ZAR: "za", BRL: "br", MXN: "mx", CHF: "ch", SEK: "se",
  NOK: "no", NZD: "nz", KRW: "kr", HKD: "hk"
};

// Custom dropdown with flags
function createDropdown(id, currencies, defaultCurrency) {
  const container = document.getElementById(id);

  const selected = document.createElement("div");
  selected.classList.add("selected");
  container.appendChild(selected);

  const options = document.createElement("div");
  options.classList.add("options");

  for (let code in currencies) {
    let countryCode = currencyToCountry[code] || "un"; // fallback flag
    let option = document.createElement("div");
    option.classList.add("option");
    option.innerHTML = `<img src="https://flagcdn.com/24x18/${countryCode}.png"> ${currencies[code]} (${code})`;
    option.dataset.value = code;

    option.addEventListener("click", () => {
      selected.innerHTML = option.innerHTML;
      selected.dataset.value = code;
      options.style.display = "none";
    });

    options.appendChild(option);

    if (code === defaultCurrency) {
      selected.innerHTML = option.innerHTML;
      selected.dataset.value = code;
    }
  }

  container.appendChild(options);

  selected.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });
}

// Load currencies
async function loadCurrencies() {
  const res = await fetch("https://api.frankfurter.app/currencies");
  const data = await res.json();

  createDropdown("fromCurrency", data, "USD");
  createDropdown("toCurrency", data, "INR");
}

// Convert function
async function convertCurrency() {
  let amount = document.getElementById("amount").value;
  if (amount === "" || amount <= 0) {
    result.innerText = "Please enter a valid amount!";
    return;
  }

  let from = document.querySelector("#fromCurrency .selected").dataset.value;
  let to = document.querySelector("#toCurrency .selected").dataset.value;

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await res.json();

    const converted = Object.values(data.rates)[0];
    result.innerText = `${amount} ${from} = ${converted} ${to}`;

    // Save last conversion to localStorage (offline mode)
    localStorage.setItem("lastConversion", JSON.stringify({ amount, from, to, converted }));

  } catch (err) {
    // Offline fallback
    const saved = JSON.parse(localStorage.getItem("lastConversion"));
    if (saved) {
      result.innerText = `Offline Mode: Last saved → ${saved.amount} ${saved.from} = ${saved.converted} ${saved.to}`;
    } else {
      result.innerText = "No internet & no saved data!";
    }
  }
}

// Dark/Light Theme Toggle
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  let theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  localStorage.setItem("theme", theme);
}

loadCurrencies();
