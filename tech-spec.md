# Bilagun Dynasty — Техническая спецификация

## Зависимости

### Production

| Пакет | Версия | Назначение |
|-------|--------|------------|
| react | ^19.0.0 | UI-фреймворк |
| react-dom | ^19.0.0 | DOM-рендеринг |
| gsap | ^3.12.7 | Единственная библиотека анимаций — timelines, ScrollTrigger |
| lenis | ^1.2.3 | Плавная прокрутка (lerp 0.08) |
| @codaww/preload | ^1.0.2 | Прелоад изображений |
| lucide-react | ^0.469.0 | Иконки (стрелки, соцсети, меню, почта, карта) |

### Dev

| Пакет | Версия | Назначение |
|-------|--------|------------|
| vite | ^6.0.0 | Сборка |
| @vitejs/plugin-react | ^4.3.0 | React-интеграция для Vite |
| typescript | ^5.7.0 | Типизация |
| tailwindcss | ^3.4.19 | Стилизация |
| @types/react | ^19.0.0 | Типы React |
| @types/react-dom | ^19.0.0 | Типы ReactDOM |

### Шрифты (Google Fonts, подключение через `<link>` в index.html)

- Inter: 400, 500, 600, 700
- Geist Mono: 400

---

## Инвентарь компонентов

### Layout

| Компонент | Источник | Переиспользование |
|-----------|----------|-------------------|
| Navbar | Пользовательский | Глобальный — фиксированная навигация + языковой переключатель |
| Footer | Пользовательский | Глобальный — 3 колонки, навигация, контакты, copyright |
| LanguageSwitcher | Пользовательский | Внутри Navbar + в мобильном меню |
| MobileMenu | Пользовательский | Полноэкранное overlay-меню |

### Секции (по порядку на странице)

| Компонент | Источник |
|-----------|----------|
| HeroSection | Пользовательский — логотип-триптих, индикатор прокрутки, кинетическая лента |
| AboutSection | Пользовательский — sticky-заголовок + две колонки |
| RufoRibadoSection | Пользовательский — изображение + текст с характеристиками |
| OurDogsSection | Пользовательский — шапка + кинетическая лента + сетка карточек |
| AchievementsSection | Пользовательский — статистика + таблица + кинетическая лента |
| GallerySection | Пользовательский — фильтры + masonry-сетка |
| ContactSection | Пользовательский — контактная инфо + форма |

### Переиспользуемые компоненты

| Компонент | Источник | Переиспользование |
|-----------|----------|-------------------|
| KineticStrip | Пользовательский | Hero, OurDogs, Achievements — горизонтальная лента с translateX анимацией |
| ScrollReveal | Пользовательский | Все контентные секции — обёртка для fade-up анимации через ScrollTrigger |
| DogCard | Пользовательский | OurDogsSection — 3 экземпляра |
| FilterBar | Пользовательский | GallerySection — кнопки фильтров |
| ContactForm | Пользовательский | ContactSection — форма с тремя состояниями |
| AnimatedCounter | Пользовательский | AchievementsSection — 4 цифры с анимацией от 0 до значения |

---

## Хуки

| Хук | Назначение |
|-----|------------|
| useLenis | Инициализация Lenis, предоставление instance для scrollTo через контекст |
| useScrollReveal | Обёртка для ScrollTrigger fade-up — принимает ref, настраивает trigger, tween, cleanup |
| useLanguage | Context hook: текущий язык, функция переключения, localStorage persistence |

---

## Реализация анимаций

| Анимация | Библиотека | Подход | Сложность |
|----------|------------|--------|-----------|
| Hero entrance timeline | GSAP timeline | Timeline с 6 последовательными tween (BI→LA→GUN→подпись→индикатор→лента), autoplay on mount | Medium |
| Кинетическая лента | GSAP | Одна анимация translateX на repeat:-1, бесшовный цикл через дублирование контента (2×). Скорость варьируется 15-25s. Нечётные ленты — влево, чётные — вправо. | Medium |
| Scroll reveal (fade-up) | GSAP ScrollTrigger | Стандартный tween: opacity 0→1, y 40→0. Сквозная обёртка ScrollReveal для переиспользования. Stagger для дочерних элементов. | Low |
| AnimatedCounter | GSAP ScrollTrigger | Tween от 0 до target с snap, duration 1.5s, trigger при появлении в viewport. | Low |
| Hero parallax | GSAP ScrollTrigger | Логотип и лента движутся с parallax factor 0.15 относительно прокрутки (scrub) | Medium |
| Scroll pulse (индикатор) | CSS @keyframes | Чистый CSS — scale 1→1.1→1, 2s, infinite. Не требует GSAP. | Low |
| Карточка собаки hover | CSS transition | Scale изображения 1→1.05, transition 0.4s. Чистый CSS. | Low |
| Навигация scroll | Lenis | scrollTo по якорным ссылкам, через Lenis instance | Low |
| Мобильное меню | GSAP | Timeline: overlay opacity 0→1, пункты stagger fade-up | Low |

---

## Архитектура состояний

### Мультиязычность

- **Хранение**: React Context (`LanguageContext`) + localStorage
- **Структура данных**: Flat объект translations с ключами по языку (`translations.es.about.title`)
- **Типизация**: `type Language = 'es' | 'en' | 'ru'`
- **Поведение**: Instant switch — контент заменяется без анимации. При загрузке читается localStorage, fallback — 'es'

### Состояние формы

- **Состояния**: 'idle' | 'loading' | 'success' | 'error'
- **Управление**: useState внутри ContactForm
- **Валидация**: Required fields + email regex перед отправкой

### Фильтры галереи

- **Состояние**: Активный фильтр ('all' | 'breeders' | 'litters' | 'shows')
- **Поведение**: CSS-driven фильтрация — класс .hidden для скрытия, transition opacity 0.3s

---

## Прочие решения

### Прелоад изображений

- Пакет `@codaww/preload` используется для прелоада критических изображений (портреты собак) перед первым рендером
- Изображения галереи загружаются lazy через `loading="lazy"` атрибут

### Шрифты

- Подключение через `<link rel="preconnect">` + `<link>` в index.html
- `font-display: swap` для всех шрифтов

### SEO / Meta

- Open Graph теги в index.html (og:title, og:description, og:image)
- Schema.org Organization + Pet JSON-LD скрипт
- Мультиязычные meta-title/description обновляются через document.title и meta теги при смене языка
