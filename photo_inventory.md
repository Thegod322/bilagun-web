# 🐶 Rufo Ribado — Photo Inventory & Restoration Plan

## 📁 Статус ассетов
В папке `app/public/assets` найдено **18 фотографий**, требующих ручной реставрации через Gemini Nano Banano.

### 🖼 Hero & Структурные фото
- `hero-bg.jpg` (98 KB) — требуется апскейл и очистка.
- `rufo-portrait.jpg` (90 KB) — требуется реставрация.

### 🗂 Галерея (Dog Detail Pages)
- `gallery-1.jpg` (77 KB)
- `gallery-2.jpg` (75 KB)
- `gallery-3.jpg` (97 KB)
- `gallery-4.jpg` (155 KB)
- `gallery-5.jpg` (127 KB)
- `gallery-6.jpg` (139 KB)

### 📇 Карточки собак (Dog List / Filter)
- `kenzo-card.jpg` (66 KB)
- `marck-card.jpg` (104 KB)
- `rufo-card.jpg` (104 KB)

### 🌳 Семейное дерево (Family Tree / Pedigree)
- `tree-alba.jpg` (93 KB)
- `tree-argo.jpg` (98 KB)
- `tree-luna.jpg` (94 KB)
- `tree-max.jpg` (97 KB)
- `tree-nora.jpg` (85 KB)
- `tree-rex.jpg` (88 KB)
- `tree-rufo.jpg` (110 KB)

---

## 🏷 Naming Convention (Правила именования после реставрации)

Оператору необходимо сохранять обработанные фотографии, используя следующий формат:
`{имя_собаки}_{тип_фото}_{индекс}.{расширение}`

**Типы фото:**
- `hero` (для главных фонов)
- `portrait` (для больших портретов)
- `card` (для карточек в списке)
- `gallery` (для галереи деталей)
- `tree` (для карточек родословной)

**Примеры:**
- `rufo_hero_01.jpg` (вместо hero-bg.jpg)
- `rufo_portrait_01.jpg` (вместо rufo-portrait.jpg)
- `kenzo_card_01.jpg` (вместо kenzo-card.jpg)
- `marck_gallery_01.jpg` (вместо gallery-1.jpg, если на фото Марк)

---

## ⏳ Оценка времени (Human)
- Всего 18 фото.
- Ожидаемое время работы: **2-4 часа**.
- **Действие:** Использовать Gemini Nano Banano для улучшения качества, апскейла и устранения шумов. После этого заменить оригиналы в папке `app/public/assets`.
