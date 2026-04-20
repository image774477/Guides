# Design Spec: pragmata-guide

**Дата:** 2026-04-20  
**Slug:** `pragmata-guide`  
**Путь:** `docs/guides/pragmata-guide/index.html`  
**URL:** `https://image774477.github.io/Guides/guides/pragmata-guide/`

---

## 1. Контекст и цель

Новый гайд по игре PRAGMATA (Capcom, релиз 16–17 апреля 2026) добавляется в существующий статический проект guides. Гайд — полный маршрут к 100% / платине. Платформы: PS5 (36 трофеев), Xbox Series X|S (35 ачивок), PC/Steam (35 ачивок), Nintendo Switch 2 (без трофейной системы).

Файл создаётся по существующей архитектуре:
- один slug = одна папка = `index.html`
- все shared assets переиспользуются без изменений
- шаблон: `docs/templates/guide-template.html`
- reference-гайд: `docs/guides/hades-2-platinum/index.html`

---

## 2. Контентный формат: A+

**A** — roadmap-структура: основные шаги организованы по крупным этапам/секторам.  
**+** — локальная B-детализация точечно там, где без неё игрок реально ошибётся:
- единственный missable трофей (Sweeper bot)
- PoNR (вход в Experimental Pragmatics)
- Unknown Signal unlock logic (нужен первый pod)
- Lunatic prep + отдельный свежий запуск
- Defender bot (Confuse node)
- LunaDigger mechanics

Не нужно: покомнатный разбор всех зон, перечисление каждого Safe Box без навигационной ценности.

---

## 3. Структура страницы

### Shell (шаблон, без изменений)

```
Header
  - cover: <img src="cover.webp" alt="..."> с placeholder (src=""), подставить файл позже
  - h1: PRAGMATA
  - subtitle: Полный гайд к 100% / платине
  - badges: PS5 · Xbox Series X|S · PC · Switch 2 · Умеренные спойлеры · дата
  - guide-status badge (JS)

Resume banner (hidden, JS)

Meta summary (dl)
  - Оценка времени: 40–60 часов
  - Missables: 1 (Sweeper bot)
  - Точка невозврата: есть (Experimental Pragmatics)
  - Платформы: PS5 / Xbox / PC / Switch 2
  - Версия: v1.0 (launch week, проверить hotfix перед публикацией)

Quick actions
  - Содержание
  - Вернуться к моему месту
  - Только сюжет
  - Скрыть спойлеры
  - Чеклист 100%  ← поведение идентично «Награда 100%» в Hades II: disabled до 100%, затем открывает achievement modal; только label другой

Progress bar (JS)

TOC (mobile overlay / desktop scroll)
  └─ Перед стартом
  └─ 1. Shelter — хаб
  └─ 2. Solar Power Plant
  └─ 3. Mass Production Array
  └─ 4. Terra Dome
  └─ 5. Lunum Mines
  └─ 6. Experimental Pragmatics
  └─ 7. Central Port
  └─ Фаза 2 — Unknown Signal / Cleanup
  └─ Фаза 3 — Lunatic
  └─ Чеклист 100%
  └─ Частые ошибки

Quick route → «Roadmap к 100%»
  Три фазы, 2–4 строки каждая. Без детализации. Карта маршрута.
```

---

### Основные sections и шаги

#### section: Перед стартом

| step | type | содержание |
|------|------|-----------|
| step-pre-1 | critical | **Единственный missable** — трофей «От меня не уйдешь!» (Sweeper bot). Убить первого при встрече, держать manual save. B-детализация: возможные точки спавна (MPA 03/04, Lunum Mines 02/03), нестабильный respawn. |
| step-pre-2 | critical | **Lunatic — только свежая игра.** NG+ не работает для Lunar Supremacy по текущим данным. |
| step-pre-3 | optional | **DLC — только косметика.** Shelter Variety Pack (костюмы, жесты, BGM) не влияет на маршрут, missables и трофеи. |
| step-pre-4 | optional | **Платформенные различия.** PS5: 36 трофеев + Platinum. PC/Xbox: 35 achievements. Switch 2: нет trophy-системы. Русский подтверждён для PS5 и Steam; для Xbox проверить вручную. |

#### section: Shelter — как работает хаб (Фаза 1)

| step | type | содержание |
|------|------|-----------|
| step-s1 | critical | Первый визит в убежище, разговор с Diana → трофей «Лёгкая беседа» |
| step-s2 | critical | Подарить первый REM сразу → трофей «Это мне?» |
| step-s3 | optional | Unit Printer — распечатать доступное оружие/навыки. В main story распечатать всё доступное для «Вошел во вкус». |
| step-s4 | optional | Stamp Boards и Cabin Coins (из Safe Boxes, наград Diana, Training Sim). Трофей «Бинго!» при закрытии первой board. |
| step-s5 | optional | Training Sim — первый запуск, трофей «Знакомство с симулятором». |

#### section: Сектор 1 — Solar Power Plant

| step | type | содержание |
|------|------|-----------|
| step-spp-1 | critical | Сюжетный маршрут. Трофей «Восстановление питания» — автоматически. |
| step-spp-2 | collectible | Escape Hatches — открывать все по пути (27 всего, трофей «Искусство побега» в конце игры). |
| step-spp-3 | collectible | Safe Boxes — собирать доступные. Синие кристаллы / filament masses — **пропустить**, вернуться после Lim Eraser. |
| step-spp-4 | boss | Sector Guard — первый серьёзный boss check. |

#### section: Сектор 2 — Mass Production Array

| step | type | содержание |
|------|------|-----------|
| step-mpa-1 | critical | Jammers — убивать первыми в каждом бою (нарушают hack-ритм Diana). |
| step-mpa-2 | critical | **[MISSABLE]** Sweeper bot. B-детализация: спавны в MPA 03/04; замедлять Overdrive Protocol или Stasis Net; если respawn не происходит — держать ротацию manual saves. Единственный потенциально missable трофей. |
| step-mpa-3 | critical | Lim Eraser — получить. Открывает синие кристаллы / filament masses. |
| step-mpa-4 | optional | Backtracking: вернуться в SPP и MPA с Lim Eraser, забрать blue-crystal collectibles. |
| step-mpa-5 | critical | Comms Tower → трофей «Замурчательный проводник» автоматически. |
| step-mpa-6 | optional | Трофей «Одним махом» (Lim Recycler × 3 врага): лучшее место — Training Sim 10 «Mouse Trap» или MPA 05. |
| step-mpa-7 | optional | Трофей «БОЛЬШЕ 6000!» (6000 ед. урона за 1 сек): Training Mission 07 «Project Pierce». |

#### section: Сектор 3 — Terra Dome

| step | type | содержание |
|------|------|-----------|
| step-td-1 | critical | Holo-Walls — первая открытая → трофей «Глаз-алмаз» автоматически. |
| step-td-2 | critical | Trapped girl → трофей «Еще одна прагмата». Stop code → трофей «Ценные данные памяти». |
| step-td-3 | collectible | Высокая плотность collectibles. Что брать сейчас, что за красными кристаллами → пропустить до Cleansing. |
| step-td-4 | optional | Shelter-возврат: проверить Stamp Board на Cabin Coins → трофей «Бинго!» если board закрыта. |

#### section: Сектор 4 — Lunum Mines

| step | type | содержание |
|------|------|-----------|
| step-lm-1 | boss | LunaDigger. B-детализация: держать дистанцию от sparkles на земле, наносить урон в редкие burst-окна, не жадничать, готовить быстрое оружие. |
| step-lm-2 | critical | **[MISSABLE]** Sweeper bot — Lunum Mines 02/03, если ещё не убит в MPA. Сделать manual save перед зоной. |
| step-lm-3 | critical | Defender bot. B-детализация: первая встреча в Lunum Mines 03; провести hack через Confuse node (не убивать до взлома); трофей «Не одолжишь на минутку?». |
| step-lm-4 | critical | Nexus Tower → трофей «Миссия раскрыта» автоматически. |

#### section: Experimental Pragmatics

| step | type | содержание |
|------|------|-----------|
| step-ep-1 | critical | **[PoNR]** Вход в Experimental Pragmatics. Обычный hub-цикл прерывается до Unknown Signal. Tracked collectibles для этого сегмента не подтверждены — это story-only зона. |
| step-ep-2 | critical | Fix up Diana → Cleansing (трофей «Пробуждение»). Cleansing открывает красные кристаллы / dead filament. |
| step-ep-3 | collectible | Backtracking: теперь доступны red-crystal collectibles в Terra Dome, Lunum Mines и ранних зонах. Если есть время — вернуться. |

#### section: Сектор 5 — Central Port

| step | type | содержание |
|------|------|-----------|
| step-cp-1 | critical | Финальный tracked-сектор. Cleansing работает — собирать red-crystal collectibles по ходу. |
| step-cp-2 | collectible | Escape Hatches и Safe Boxes — закрывать всё доступное. |
| step-cp-3 | boss | Sentinel → трофей «Атака часового» автоматически. |
| step-cp-4 | critical | Финал → трофей «Наша клятва» автоматически. До этого распечатать всё доступное для «Вошел во вкус». |

#### section: Фаза 2 — Unknown Signal / Cleanup

| step | type | содержание |
|------|------|-----------|
| step-us-1 | critical | Войти в Unknown Signal → **сразу пройти первый Sim Pod**. Только после этого открывается free-roam по старым секторам через трамвай. |
| step-us-2 | collectible | Cleanup по секторам: Safe Boxes, Pure Lunum, REM, Storage Expanders, Cartridge Holders, Training Data. |
| step-us-3 | collectible | Mini Cabins — все 15 (не входят в sector %, легко забыть). Трофей «Величайший миниохотник». |
| step-us-4 | collectible | Escape Hatches — все 27. Трофей «Искусство побега». |
| step-us-5 | optional | Red Zones — все. Трофей «Любитель красных зон». |
| step-us-6 | optional | Training Sim — все 30 missions (трофей «Повелитель симулятора»). Нужны все Training Data. |
| step-us-7 | optional | Shelter: REM-series → трофей «Непревзойденный репликатор». Diana hide-and-seek → трофей «Кто не спрятался». Фото → трофей «Спасибо за всё!». |
| step-us-8 | critical | 10 challenge pods → Black Box → усиленные боссы → повторный финал → трофей «Идеальный кандидат». |
| step-us-9 | optional | Трофей «Пушки — для слабаков!» (3000 ед. hack-урона): через Offense Mode chip + offensive nodes или финальный scripted hack. |
| step-us-10 | optional | Трофей «Отчаянная храбрость»: спуститься к LunaDigger и отбить его. |
| step-us-11 | optional | Трофей «Генеральная уборка»: Cleansing по 3+ corrupted enemies одновременно, лучшее место — Central Port. |

#### section: Фаза 3 — Lunatic

| step | type | содержание |
|------|------|-----------|
| step-lun-1 | critical | Начать **свежую New Game** на сложности Лунатизм (Lunatic). NG+ не подходит по текущим данным. |
| step-lun-2 | critical | Перед финальным боссом: B-детализация — рекомендуемый набор (Jackhammer, Photon Laser, Charge Piercer), приоритет diana-hack damage, Deletion Protocol, полный запас боеприпасов. |
| step-lun-3 | boss | Финальный босс на Lunatic → трофей «Превосходство на Луне». |

---

### Трофейный аккордеон

**Заголовок секции:** «Чеклист 100%»  
**id:** `#checklist-100`  
**TOC-ссылка:** «Чеклист 100%»

Формат: такой же аккордеон с `<details>` / `<summary>`, как в hades-2-platinum, с локальным `<style>` в `<head>`. Каждый трофей: название (EN + RU официальное), описание, практическое условие, missable-метка, best time.

Категории:
- Сюжетные (автоматические)
- Shelter / Diana
- Коллекционные / исследование
- Боевые
- Постгейм / Unknown Signal
- Lunatic
- Платина (PS5 only)

Все 36 трофеёв (PS5) / 35 достижений (PC/Xbox) взяты из исследовательского отчёта с официальными русскими названиями из Steam.

---

### После основного контента

```
section: Частые ошибки (#section-mistakes)
  - Не убить Sweeper bot при первой встрече
  - Попытаться закрыть Lunatic через NG+
  - Не пройти первый Sim Pod перед cleanup в Unknown Signal
  - Недооценить взлом Diana — это основной damage gate, не вспомогательная механика
  - Jammers — не убивать первыми → бои затягиваются
  - Синие/красные кристаллы — паника из-за «недоступных» предметов без Lim Eraser / Cleansing
  - Не проверить Stamp Board после сбора Cabin Coins
  - Mini Cabins не в sector % — их легко забыть
  - Откладывать диалоги с Diana — ряд трофеев завязан на повторные взаимодействия

section: Что дальше (#section-next)
  - Ссылка на hades-2-platinum (единственный существующий гайд)

Footer
  © 2026 image774477

Mobile action bar (JS)
Achievement modal (JS)
Lightbox (JS)
```

---

## 4. Метаданные

```html
<title>Полный гайд к 100% — PRAGMATA | Guides</title>
<meta name="description" content="Пошаговый маршрут к 100% и платиновому трофею в PRAGMATA (Capcom). Все трофеи и достижения, Sweeper bot, Lunatic, Unknown Signal и cleanup на PS5, Xbox и PC.">
<link rel="canonical" href="https://image774477.github.io/Guides/guides/pragmata-guide/">
<!-- OG и Twitter card по шаблону -->
<meta property="og:image" content="https://image774477.github.io/Guides/guides/pragmata-guide/cover.webp">
```

---

## 5. data-guide-id и data-total-steps

```html
<main class="guide-content" id="guide-content"
      data-guide-id="pragmata-guide"
      data-total-steps="35">
```

`data-total-steps` = количество шагов с `<input type="checkbox" data-step="...">` в маршрутных sections (не трофеи). Уточнить точное число при финальной вёрстке.

---

## 6. Файлы и изменения

### Создать

| Путь | Описание |
|------|----------|
| `docs/guides/pragmata-guide/index.html` | Новый гайд |

**Cover-подход:** `<img>` для обложки оставляется закомментированным в HTML до появления реального файла. Пустой `src=""` не используется (вызывает лишний запрос в ряде браузеров). Когда файл `cover.webp` будет готов — раскомментировать строку. Пример в коде:
```html
<!-- <img class="guide-header__cover" src="cover.webp" alt="PRAGMATA — обложка" width="1200" height="675"> -->
```

### Shared файлы — не трогать

Никаких изменений в:
- `docs/assets/css/reset.css`
- `docs/assets/css/theme.css`
- `docs/assets/css/guide.css`
- `docs/assets/js/progress.js`
- `docs/assets/js/ui.js`
- `docs/assets/js/guide.js`
- `docs/templates/guide-template.html`

Локальный `<style>` для trophy accordion — только внутри `<head>` нового `index.html`, не в shared CSS.

---

## 7. Slug

`pragmata-guide`

URL: `https://image774477.github.io/Guides/guides/pragmata-guide/`

---

## 7b. Правило финального текста

**В `index.html` — только читательский контент.** Никаких служебных пометок:
- «по текущим данным» / «проверить вручную» / «не подтверждено»
- «возможно» / «если не уверен»
- TODO / внутренние комментарии для разработчика или редактора

Правило для каждого факта:
1. Факт подтверждён → формулируем нормально для игрока.
2. Факт не доведён до уверенности → **не попадает в финальный HTML** в служебном виде.

Спорные места из раздела «Риски» (Lunatic+NG+, Xbox language matrix, hotfix) решаются **до публикации**, а не выносятся в страницу как оговорки.

Пример:
- ❌ `NG+ не подходит по текущим данным`
- ✅ `Для этого трофея начинайте новую игру на Lunatic. NG+ не подходит.`

---

## 8. Риски и оговорки

| Риск | Статус | Что делать |
|------|--------|-----------|
| Sweeper bot respawn — единственный missable, нестабильный спавн | Высокая уверенность | Явная missable-метка + manual save совет |
| Lunatic + NG+ совместимость | Спорный, best evidence = «нет» | Отметить как «по текущим данным» в шаге |
| Chapter select | Не подтверждён | Не упоминать |
| Xbox language matrix (русский?) | Требует ручной проверки | Пометить в platform-note |
| Gameplay hotfix после launch week | Возможен | Пометить версию как «launch week, проверить» |
| Experimental Pragmatics tracked collectibles | Не подтверждены | Написать «story-only зона» без конкретики |
| Точное число шагов (data-total-steps) | Уточнить при вёрстке | Обновить атрибут по факту |

---

## 9. Критерии готовности

- [ ] Страница открывается по прямой ссылке
- [ ] Нет критических ошибок в консоли
- [ ] Нет горизонтального скролла на мобильном
- [ ] TOC работает (мобильный overlay + десктопный scroll)
- [ ] Quick actions работают (все 5 кнопок)
- [ ] Якоря и `scroll-margin-top` корректны
- [ ] Чекбоксы сохраняются в localStorage
- [ ] Resume banner появляется при повторном открытии
- [ ] Режим «только сюжет» скрывает optional шаги
- [ ] Спойлеры скрываются глобально
- [ ] Deep link копируется
- [ ] Trophy accordion открывается/закрывается, чекбоксы работают
- [ ] Lightbox работает на изображениях
- [ ] Mobile action bar работает
