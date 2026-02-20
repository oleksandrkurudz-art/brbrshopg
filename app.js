(() => {
  const tg = window.Telegram?.WebApp;
  const BOOKING_WEBHOOK_URL = "https://oleksandrkurudz1.app.n8n.cloud/webhook-test/barber-booking";
  if (tg) {
    tg.ready();
    tg.expand();
  }

  const state = {
    step: "barbers",
    barberId: null,
    serviceId: null,
    category: "all",
    dateISO: null,
    time: null,
    customerName: "",
    customerPhone: "+380",
    submitted: false,
  };

  const barbers = [
    { id: "yana", name: "Яна", role: "Барбер", image: "./img/Яна.jpg" },
    { id: "natan", name: "Натан", role: "Барбер", image: "./img/Натан.jpeg" },
    { id: "ira", name: "Іра", role: "Барбер", image: "./img/Іра.jpg" },
    { id: "alyona", name: "Альона", role: "Барбер", image: "./img/Альона.png" },
    { id: "viktoriia", name: "Вікторія", role: "Барбер", image: "./img/Вікторія.jpg" },
  ];

  const services = [
    { id: "haircut", title: "Стрижка", category: "hair", durationMin: 45, price: 400, icon: "./img/Стрижка.png" },
    { id: "beard", title: "Стрижка бороди", category: "beard", durationMin: 40, price: 350, icon: "./img/Стрижка бороди.png" },
    { id: "clipper", title: "Стрижка машинкою", category: "hair", durationMin: 35, price: 350, icon: "./img/Стрижка машинкою.png" },
    { id: "long-hair", title: "Подовжена стрижка", category: "hair", durationMin: 60, price: 450, icon: "./img/Подовжина стрижка.png" },
    { id: "royal-shave", title: "Королівське гоління", category: "beard", durationMin: 40, price: 300, icon: "./img/Королівське гоління.png" },
    { id: "shaver", title: "Гоління шейвером", category: "beard", durationMin: 30, price: 250, icon: "./img/Гоління шейвером.png" },
    { id: "kids", title: "Дитяча стрижка", category: "add", durationMin: 40, price: 350, icon: "./img/Дитяча стрижка.png" },
    { id: "combo", title: "Стрижка + борода", category: "combo", durationMin: 75, price: 700, icon: "./img/Стрижка + борода.png" },
    { id: "combo-clipper", title: "Стрижка машинкою + борода", category: "combo", durationMin: 70, price: 650, icon: "./img/Стрижка машинкою + борода.png" },
    { id: "full", title: "Повний фарш", category: "combo", durationMin: 90, price: 900, icon: "./img/Повний фарш.png" },
  ];

  const categories = [
    { id: "all", label: "Всі" },
    { id: "hair", label: "Стрижка" },
    { id: "beard", label: "Борода" },
    { id: "combo", label: "Комплексні" },
    { id: "add", label: "Додаткові" },
  ];

  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  const screenTitle = document.getElementById("screenTitle");
  const backBtn = document.getElementById("backBtn");
  const bottomSheet = document.getElementById("bottomSheet");
  const screens = {
    barbers: document.getElementById("barbersScreen"),
    services: document.getElementById("servicesScreen"),
    datetime: document.getElementById("datetimeScreen"),
    confirm: document.getElementById("confirmScreen"),
  };

  backBtn.addEventListener("click", () => {
    if (state.step === "services") {
      setStep("barbers");
    } else if (state.step === "datetime") {
      setStep("services");
    } else if (state.step === "confirm") {
      setStep("datetime");
    }
  });

  function setStep(step) {
    state.step = step;
    for (const [key, node] of Object.entries(screens)) {
      node.classList.toggle("active", key === step);
    }

    const titles = {
      barbers: "Виберіть барбера",
      services: "Послуги",
      datetime: "Дата та час",
      confirm: "Підтвердження",
    };

    screenTitle.textContent = titles[step];
    backBtn.classList.toggle("hidden", step === "barbers" || state.submitted);

    render();
  }

  function selectedBarber() {
    return barbers.find((b) => b.id === state.barberId) || null;
  }

  function selectedService() {
    return services.find((s) => s.id === state.serviceId) || null;
  }

  function availableServices() {
    if (state.category === "all") return services;
    return services.filter((s) => s.category === state.category);
  }

  function makeDays() {
    const out = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const weekday = date.toLocaleDateString("uk-UA", { weekday: "short" });
      const day = date.toLocaleDateString("uk-UA", { day: "2-digit" });
      const month = date.toLocaleDateString("uk-UA", { month: "short" });
      out.push({
        iso: date.toISOString().slice(0, 10),
        weekday,
        day,
        month,
      });
    }
    return out;
  }

  function formatMoney(value) {
    return `${value} грн`;
  }

  function renderBarbers() {
    screens.barbers.innerHTML = `
      <div class="list">
        ${barbers
          .map(
            (barber) => `
          <article class="card barber-card ${state.barberId === barber.id ? "selected" : ""}" data-barber="${barber.id}">
            <img class="barber-photo" src="${barber.image}" alt="${barber.name}" />
            <div>
              <p class="barber-name">${barber.name}</p>
              <p class="barber-role">${barber.role}</p>
            </div>
            <span class="select-dot"></span>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    screens.barbers.querySelectorAll("[data-barber]").forEach((node) => {
      node.addEventListener("click", () => {
        state.barberId = node.dataset.barber;
        renderBarbers();
        renderBottom();
      });
    });
  }

  function renderServices() {
    screens.services.innerHTML = `
      <div class="chips">
        ${categories
          .map(
            (cat) => `<button class="chip ${cat.id === state.category ? "active" : ""}" type="button" data-category="${cat.id}">${cat.label}</button>`
          )
          .join("")}
      </div>
      <div class="list">
        ${availableServices()
          .map(
            (service) => `
            <article class="card service-card ${service.id === state.serviceId ? "selected" : ""}" data-service="${service.id}">
              <img class="service-media" src="${service.icon}" alt="${service.title}" />
              <div class="service-content">
                <div class="service-head">
                  <span class="service-title">${service.title}</span>
                  <span class="service-price">${formatMoney(service.price)}</span>
                </div>
                <div class="service-meta">Тривалість: ${service.durationMin} хв</div>
              </div>
            </article>
          `
          )
          .join("")}
      </div>
    `;

    screens.services.querySelectorAll("[data-category]").forEach((node) => {
      node.addEventListener("click", () => {
        state.category = node.dataset.category;
        renderServices();
      });
    });

    screens.services.querySelectorAll("[data-service]").forEach((node) => {
      node.addEventListener("click", () => {
        state.serviceId = node.dataset.service;
        renderServices();
        renderBottom();
      });
    });
  }

  function renderDatetime() {
    const days = makeDays();
    const barber = selectedBarber();
    const service = selectedService();
    screens.datetime.innerHTML = `
      <article class="card summary-item summary-media">
        <img src="${barber?.image || ""}" alt="${barber?.name || "Барбер"}" />
        <div>
          <p class="summary-title">Барбер</p>
          <p><strong>${barber?.name || "-"}</strong></p>
        </div>
      </article>
      <article class="card summary-item summary-media">
        <img src="${service?.icon || ""}" alt="${service?.title || "Послуга"}" />
        <div>
          <p class="summary-title">Послуга</p>
          <p><strong>${service?.title || "-"}</strong></p>
          <p class="service-meta">${service ? `${formatMoney(service.price)} • ${service.durationMin} хв` : "-"}</p>
        </div>
      </article>
      <div class="day-row">
        ${days
          .map(
            (day) => `
            <button class="slot day-slot ${day.iso === state.dateISO ? "active" : ""}" type="button" data-day="${day.iso}">
              ${day.weekday}
              <small>${day.day} ${day.month}</small>
            </button>
          `
          )
          .join("")}
      </div>
      <div class="time-row">
        ${times
          .map(
            (time) => `<button class="slot ${time === state.time ? "active" : ""}" type="button" data-time="${time}">${time}</button>`
          )
          .join("")}
      </div>
    `;

    screens.datetime.querySelectorAll("[data-day]").forEach((node) => {
      node.addEventListener("click", () => {
        state.dateISO = node.dataset.day;
        renderDatetime();
        renderBottom();
      });
    });

    screens.datetime.querySelectorAll("[data-time]").forEach((node) => {
      node.addEventListener("click", () => {
        state.time = node.dataset.time;
        renderDatetime();
        renderBottom();
      });
    });
  }

  function renderConfirm() {
    const barber = selectedBarber();
    const service = selectedService();
    const date = state.dateISO ? new Date(`${state.dateISO}T00:00:00`) : null;
    const dateLabel = date ? date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" }) : "-";

    screens.confirm.innerHTML = `
      <div class="summary-grid">
        <article class="card summary-item summary-media">
          <img src="${barber?.image || ""}" alt="${barber?.name || "Барбер"}" />
          <div>
            <p class="summary-title">Барбер</p>
            <p><strong>${barber?.name || "-"}</strong></p>
          </div>
        </article>
        <article class="card summary-item summary-media">
          <img src="${service?.icon || ""}" alt="${service?.title || "Послуга"}" />
          <div>
            <p class="summary-title">Послуга</p>
            <p><strong>${service?.title || "-"}</strong></p>
            <p class="service-meta">${service ? `${formatMoney(service.price)} • ${service.durationMin} хв` : "-"}</p>
          </div>
        </article>
        <article class="card summary-item">
          <strong>Дата:</strong> ${dateLabel}<br />
          <strong>Час:</strong> ${state.time || "-"}
        </article>
        <article class="card summary-item">
          <div class="field">
            <label for="customerName">Ім'я</label>
            <input id="customerName" value="${escapeHtml(state.customerName)}" placeholder="Введіть ім'я" />
          </div>
          <div class="field" style="margin-top:10px;">
            <label for="customerPhone">Телефон</label>
            <input id="customerPhone" value="${escapeHtml(state.customerPhone)}" placeholder="+380..." />
            <span class="error" id="confirmError"></span>
          </div>
        </article>
      </div>
    `;

    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");

    nameInput.addEventListener("input", () => {
      state.customerName = nameInput.value;
      renderBottom();
    });

    phoneInput.addEventListener("input", () => {
      state.customerPhone = phoneInput.value.startsWith("+") ? phoneInput.value : `+380${phoneInput.value.replace(/\D/g, "")}`;
      phoneInput.value = state.customerPhone;
      renderBottom();
    });
  }

  function renderSuccess() {
    screens.confirm.innerHTML = `
      <section class="success">
        <div class="success-mark">✓</div>
        <h2>Запис створено</h2>
        <p>Очікуйте підтвердження від адміністратора.</p>
      </section>
    `;
  }

  function renderBottom() {
    const service = selectedService();
    const buttonByStep = {
      barbers: { text: "Послуги →", enabled: Boolean(state.barberId), onClick: () => setStep("services") },
      services: { text: "Вибрати час →", enabled: Boolean(state.serviceId), onClick: () => setStep("datetime") },
      datetime: { text: "Підтвердити →", enabled: Boolean(state.dateISO && state.time), onClick: () => setStep("confirm") },
      confirm: { text: "Надіслати заявку", enabled: canSubmit(), onClick: submitBooking },
    };

    const cfg = buttonByStep[state.step];
    const infoLeft = service ? `${service.durationMin} хв` : "";
    const infoRight = service ? formatMoney(service.price) : "";

    bottomSheet.innerHTML = `
      <div class="bottom-inner">
        <div class="bottom-info">
          <span>${infoLeft}</span>
          <strong>${infoRight}</strong>
        </div>
        <button class="primary-btn" id="bottomAction" ${cfg.enabled ? "" : "disabled"}>${cfg.text}</button>
      </div>
    `;

    const actionBtn = document.getElementById("bottomAction");
    actionBtn.addEventListener("click", cfg.onClick);
  }

  function canSubmit() {
    return Boolean(state.customerName.trim() && normalizePhone(state.customerPhone));
  }

  function normalizePhone(value) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("380")) return `+${digits}`;
    if (digits.startsWith("0")) return `+38${digits}`;
    if (digits.length >= 9) return `+380${digits}`;
    return "";
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function submitBooking() {
    const phone = normalizePhone(state.customerPhone);
    const errorNode = document.getElementById("confirmError");

    if (!state.customerName.trim()) {
      if (errorNode) errorNode.textContent = "Вкажіть ім'я";
      return;
    }

    if (!phone) {
      if (errorNode) errorNode.textContent = "Вкажіть коректний номер телефону.";
      return;
    }

    const payload = {
      type: "booking_request",
      createdAt: new Date().toISOString(),
      telegramUser: tg?.initDataUnsafe?.user || null,
      booking: {
        barber: selectedBarber(),
        service: selectedService(),
        date: state.dateISO,
        time: state.time,
        customerName: state.customerName.trim(),
        customerPhone: phone,
      },
    };

    try {
      const response = await fetch(BOOKING_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}`);
      }
    } catch (e) {
      if (errorNode) errorNode.textContent = "Помилка відправки. Спробуйте ще раз.";
      console.error("Webhook error:", e);
      return;
    }

    state.submitted = true;
    backBtn.classList.add("hidden");
    renderSuccess();
    bottomSheet.innerHTML = "";
  }

  function render() {
    if (state.step === "barbers") renderBarbers();
    if (state.step === "services") renderServices();
    if (state.step === "datetime") renderDatetime();
    if (state.step === "confirm") renderConfirm();
    if (!state.submitted) renderBottom();
  }

  setStep("barbers");
})();



