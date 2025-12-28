// /* =========================
//    config
//    ========================= */

// /**
//  * mode:
//  * - "JAN"  — реальный режим: 1–7 января 2026
//  * - "TEST" — тестовый режим: 7 дней подряд с указанной даты startDate (например, с сегодняшнего дня)
//  */
// const CONFIG = {
//   year: 2026,
//   mode: "TEST", // <-- ПОТОМ СМЕНИ НА "JAN"
//   startDate: new Date(), // старт для TEST (сегодня)
// };

// const STORAGE_KEY = "advent_opened_days_2026";

// /* тексты предложений (замени на свои) */
// const OFFERS = {
//   1: "Тут будет текст-предложение для 1 января.",
//   2: "Тут будет текст-предложение для 2 января.",
//   3: "Тут будет текст-предложение для 3 января.",
//   4: "Тут будет текст-предложение для 4 января.",
//   5: "Тут будет текст-предложение для 5 января.",
//   6: "Тут будет текст-предложение для 6 января.",
//   7: "Тут будет текст-предложение для 7 января.",
// };

// /* =========================
//    storage helpers
//    ========================= */

// function getOpenedDays() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     const parsed = raw ? JSON.parse(raw) : [];
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// function saveOpenedDays(days) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
// }

// /* =========================
//    date helpers
//    ========================= */

// function atStartOfDay(date) {
//   const d = new Date(date);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function daysBetween(a, b) {
//   // a - b in days
//   const ms = atStartOfDay(a) - atStartOfDay(b);
//   return Math.floor(ms / (1000 * 60 * 60 * 24));
// }

// /**
//  * returns:
//  * - allowedDay: 1..7 (какую карточку можно открыть сегодня) или null
//  * - newYearDay: 1..7 (для текста "сегодня X день нового года") или null
//  */
// function getTodayIndex() {
//   const now = new Date();

//   if (CONFIG.mode === "TEST") {
//     const diff = daysBetween(now, CONFIG.startDate);
//     if (diff < 0 || diff > 6) return { allowedDay: null, newYearDay: null };
//     return { allowedDay: diff + 1, newYearDay: diff + 1 };
//   }

//   // JAN mode
//   const y = now.getFullYear();
//   const m = now.getMonth() + 1; // 1..12
//   const d = now.getDate(); // 1..31

//   if (y === CONFIG.year && m === 1 && d >= 1 && d <= 7) {
//     return { allowedDay: d, newYearDay: d };
//   }

//   return { allowedDay: null, newYearDay: null };
// }

// /* =========================
//    dom helpers
//    ========================= */

// function setTodayBanner() {
//   const el = document.getElementById("todayDay");
//   if (!el) return;

//   const { newYearDay } = getTodayIndex();
//   el.textContent = newYearDay ? String(newYearDay) : "—";
// }

// function applyTexts() {
//   document.querySelectorAll(".day-card").forEach((card) => {
//     const day = Number(card.dataset.day);

//     const contentText = card.querySelector(".content__text");
//     if (contentText) contentText.textContent = OFFERS[day] ?? "";

//     const previewText = card.querySelector(".preview__text");
//     if (previewText) {
//       // для прошедших дней в превью — короткая версия
//       const full = OFFERS[day] ?? "";
//       previewText.textContent =
//         full.length > 44 ? full.slice(0, 44) + "…" : full;
//     }
//   });
// }

// function setState(card, state) {
//   card.classList.remove(
//     "day-card--future",
//     "day-card--available",
//     "day-card--opened",
//     "day-card--past"
//   );
//   card.classList.add(state);
// }

// /* =========================
//    state machine
//    ========================= */

// function updateCardsState() {
//   const { allowedDay } = getTodayIndex();
//   const opened = new Set(getOpenedDays());

//   document.querySelectorAll(".day-card").forEach((card) => {
//     const day = Number(card.dataset.day);

//     const openBtn = card.querySelector(".pill--open");
//     const content = card.querySelector(".content");

//     // по умолчанию всё закрываем
//     if (openBtn) openBtn.disabled = true;
//     if (content) content.setAttribute("aria-hidden", "true");

//     // если вне диапазона — все future
//     if (allowedDay === null) {
//       setState(card, "day-card--future");
//       return;
//     }

//     // открыто сегодня (и только если пользователь нажал)
//     if (day === allowedDay && opened.has(day)) {
//       setState(card, "day-card--opened");
//       if (content) content.setAttribute("aria-hidden", "false");
//       return;
//     }

//     // прошлые дни = past
//     if (day < allowedDay) {
//       setState(card, "day-card--past");
//       return;
//     }

//     // сегодняшний день = available
//     if (day === allowedDay) {
//       setState(card, "day-card--available");
//       if (openBtn) openBtn.disabled = false;
//       return;
//     }

//     // будущие дни
//     setState(card, "day-card--future");
//   });
// }

// function bindOpenHandlers() {
//   document.querySelectorAll(".day-card").forEach((card) => {
//     const day = Number(card.dataset.day);
//     const btn = card.querySelector(".pill--open");
//     if (!btn) return;

//     btn.addEventListener("click", () => {
//       const { allowedDay } = getTodayIndex();

//       // защита: можно открыть только сегодня
//       if (allowedDay !== day) return;

//       // защита: если уже открыто — ничего не делаем
//       const opened = new Set(getOpenedDays());
//       if (opened.has(day)) return;

//       // сохраняем факт открытия
//       opened.add(day);
//       saveOpenedDays([...opened]);

//       // обновляем состояния (кнопка исчезнет, контент покажется, появится иконка)
//       updateCardsState();
//     });
//   });
// }

// /* =========================
//    init
//    ========================= */

// applyTexts();
// bindOpenHandlers();
// setTodayBanner();
// updateCardsState();

// // обновление раз в минуту (на случай смены дня)
// setInterval(() => {
//   setTodayBanner();
//   updateCardsState();
// }, 60 * 1000);

/* =========================
   CONFIG
   ========================= */

// ⚠️ ТЕСТОВЫЙ РЕЖИМ
// День 1 = ВЧЕРА (past)
// День 2 = СЕГОДНЯ (available)
const CONFIG = {
  year: 2026,
  mode: "JAN",
};

const STORAGE_KEY = "advent_opened_days_2026";

/* тексты событий */
const OFFERS = {
  1: "Лошадь к нам пришла, сегодня к тебе придёт наездница 💛",
  2: "Время для добрых дел ✨",
  3: "Пора испытать поводья 😉",
  4: "Зайдёт медсестра проверить самочувствие",
  5: "Варим глинтвейн и слушаем музыку",
  6: "Сегодня к тебе придёт монашка, почистить твою душу ✨",
  7: "Ты чист и свеж, розовая девушка благославит тебя на отличный год 🎁",
};

/* =========================
   STORAGE
   ========================= */

function getOpenedDays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOpenedDays(days) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

/* =========================
   DATE HELPERS
   ========================= */

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysDiff(a, b) {
  return Math.floor((startOfDay(a) - startOfDay(b)) / (1000 * 60 * 60 * 24));
}

/**
 * returns:
 * - allowedDay: 1..7 (какую карточку можно открыть сегодня) или null
 * - newYearDay: 1..7 (для текста "сегодня X день нового года") или null
 */
function getTodayIndex() {
  const now = new Date();
  // ===== TEST: ручной выбор "сегодняшнего дня" =====
  // Поставь число 1..7 и смотри все состояния:
  // - дни < числа => past
  // - день == число => available
  // - дни > числа => future
  // const FORCE_TODAY = 7; // <- меняй 1..7
  // return { allowedDay: FORCE_TODAY, newYearDay: FORCE_TODAY };

  // TEST: day 1 = вчера, day 2 = сегодня
  if (CONFIG.mode === "TEST_FROM_YESTERDAY") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const diff = daysDiff(now, yesterday); // 0..6
    if (diff < 0 || diff > 6) return { allowedDay: null, newYearDay: null };

    return { allowedDay: diff + 1, newYearDay: diff + 1 };
  }

  // JAN: 1..7 января указанного года
  if (CONFIG.mode === "JAN") {
    const y = now.getFullYear();
    const m = now.getMonth() + 1; // 1..12
    const d = now.getDate(); // 1..31

    if (y === CONFIG.year && m === 1 && d >= 1 && d <= 7) {
      return { allowedDay: d, newYearDay: d };
    }
    return { allowedDay: null, newYearDay: null };
  }

  // если случайно выставили неизвестный режим
  return { allowedDay: null, newYearDay: null };
}

/* =========================
   DOM HELPERS
   ========================= */

function setTodayBanner() {
  const el = document.getElementById("todayDay");
  if (!el) return;

  const { newYearDay } = getTodayIndex();
  el.textContent = newYearDay ? String(newYearDay) : "—";
}

function applyTexts() {
  document.querySelectorAll(".day-card").forEach((card) => {
    const day = Number(card.dataset.day);

    const contentText = card.querySelector(".day-card__text");
    if (contentText) contentText.textContent = OFFERS[day] ?? "";

    // const previewText = card.querySelector(".day-card__previewText");
    // if (previewText) {
    //   const text = OFFERS[day] ?? "";
    //   previewText.textContent =
    //     text.length > 40 ? text.slice(0, 40) + "…" : text;
    // }
  });
}

function setState(card, state) {
  card.classList.remove(
    "day-card--future",
    "day-card--available",
    "day-card--opened",
    "day-card--past"
  );
  card.classList.add(state);
}

/* =========================
   STATE MACHINE
   ========================= */

function updateCardsState() {
  const { allowedDay } = getTodayIndex();
  const openedDays = new Set(getOpenedDays());

  document.querySelectorAll(".day-card").forEach((card) => {
    const day = Number(card.dataset.day);

    const openBtn = card.querySelector(".day-card__action--open");
    const content = card.querySelector(".day-card__content");

    // по умолчанию всё закрываем
    if (openBtn) {
      openBtn.disabled = true;
      openBtn.setAttribute("disabled", ""); // чтобы точно было disabled по умолчанию
    }
    if (content) content.setAttribute("aria-hidden", "true");

    // вне диапазона
    if (allowedDay === null) {
      setState(card, "day-card--future");
      return;
    }

    // 1) прошлые дни ВСЕГДА past (даже если были открыты)
    if (day < allowedDay) {
      setState(card, "day-card--past");

      // если день был открыт — показываем превью текста события
      const previewText = card.querySelector(".day-card__previewText");
      if (previewText) {
        if (openedDays.has(day)) {
          const text = OFFERS[day] ?? "";
          previewText.textContent =
            text.length > 40 ? text.slice(0, 40) + "…" : text;
          previewText.title = text;
        } else {
          previewText.textContent = "день прошёл";
        }
      }

      return;
    }

    // 2) открыто сегодня (opened) — только если это сегодняшний день
    if (day === allowedDay && openedDays.has(day)) {
      setState(card, "day-card--opened");
      if (content) content.setAttribute("aria-hidden", "false");
      return;
    }

    // сегодняшний день
    if (day === allowedDay) {
      setState(card, "day-card--available");
      if (openBtn) {
        openBtn.disabled = false;
        openBtn.removeAttribute("disabled"); // ключевое
      }
      return;
    }

    // будущие дни
    setState(card, "day-card--future");
  });
}

/* =========================
   INTERACTIONS
   ========================= */

function bindOpenHandlers() {
  document.querySelectorAll(".day-card").forEach((card) => {
    const day = Number(card.dataset.day);
    const btn = card.querySelector(".day-card__action--open");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const { allowedDay } = getTodayIndex();

      // можно открыть только сегодня
      if (allowedDay !== day) return;

      const opened = new Set(getOpenedDays());
      if (opened.has(day)) return;

      opened.add(day);
      saveOpenedDays([...opened]);

      updateCardsState();
    });
  });
}

/* =========================
   INIT
   ========================= */

applyTexts();
bindOpenHandlers();
setTodayBanner();
updateCardsState();

// обновление статусов (на случай смены дня)
setInterval(() => {
  setTodayBanner();
  updateCardsState();
}, 60 * 1000);
