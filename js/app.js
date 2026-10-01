
console.log('Перевірка підключення');

const events = [
    { title: 'Цирк Шапіто "Промінь"', category: 'розваги' },
    { title: 'Концерт гурту "Океан Ельзи"', category: 'музика' },
    { title: 'Вистава "Кайдашева сім\'я"', category: 'театр' },
    { title: 'Симфонічний вечір', category: 'музика' },
    { title: 'Стендап шоу', category: 'розваги' }
];

// Функція перебирає масив подій та виводить у консоль події заданої категорії
function printEventsByCategory(eventsArray, targetCategory) {
    console.log(`\nПодії у категорії "${targetCategory}"`);
    for (const event of eventsArray) {
        if (event.category === targetCategory) {
            console.log(`- ${event.title}`);
        }
    }
}


printEventsByCategory(events, 'музика');


// Функція класифікує подію за категорією 
function classifyEvent(event) {
    if (event.category === 'музика') {
        console.log(`[Музична подія]: ${event.title}`);
    } else if (event.category === 'театр') {
        console.log(`[Театральна вистава]: ${event.title}`);
    } else if (event.category === 'розваги') {
        console.log(`[Розважальний захід]: ${event.title}`);
    } else {
        console.log(`[Інша подія]: ${event.title}`);
    }
}

console.log('\nКласифікація всіх подій');
for (const event of events) {
    classifyEvent(event);
}


// Стрілкова функція, яка скорочує текст, якщо його довжина перевищує n символів
const shorten = (text, n) => text.length > n ? text.slice(0, n) + '...' : text;

console.log('\nДемонстрація роботи стрілкової функції');
const longEventTitle = 'Дуже довга назва культурної події міста, яка не поміщається в один рядок';
console.log('Оригінал:', longEventTitle);
console.log('Скорочено (20 символів):', shorten(longEventTitle, 20));