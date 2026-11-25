const staticCard = document.querySelector('#static-card');
if (staticCard) {
    staticCard.remove();
}

const listContainer = document.querySelector('#events-list');
const countElement = document.querySelector('#events-count');


const events = [
    { 
        title: 'Цирк Шапіто "Промінь"', 
        category: 'розваги', 
        badgeText: 'Розваги',
        date: '15 жовтня 2026, 18:00',
        image: 'assets/img/circus.jpg',
        description: 'Захоплююча програма для всієї родини: акробати, клоуни та дресировані тварини.'
    },
    { 
        title: 'Концерт гурту "Океан Ельзи"', 
        category: 'музика', 
        badgeText: 'Музика',
        date: '20 жовтня 2026, 19:00',
        image: 'assets/img/ocean.jpg',
        description: 'Великий стадіонний концерт з улюбленими хітами та новими піснями.'
    },
    { 
        title: 'Вистава "Кайдашева сім\'я"', 
        category: 'театр',
        badgeText: 'Театр',
        date: '25 жовтня 2026, 18:30',
        image: 'assets/img/vystava.jpg',
        description: 'Класична українська трагікомедія у сучасному прочитанні.'
    },
    { 
        title: 'Симфонічний вечір', 
        category: 'музика',
        badgeText: 'Музика',
        date: '30 жовтня 2026, 19:00',
        image: 'assets/img/symphony.jpg',
        description: 'Вечір класичної музики у виконанні міського симфонічного оркестру.'
    },
    { 
        title: 'Стендап шоу', 
        category: 'розваги',
        badgeText: 'Розваги',
        date: '1 листопада 2026, 20:00',
        image: 'assets/img/standup.jpg',
        description: 'Найкращі коміки міста з новою програмою.'
    }
];

function renderEvents(eventsArray) {
    if (!listContainer) return;

    listContainer.innerHTML = ''; 

    for (const event of eventsArray) {
        const card = document.createElement('article');
        card.classList.add('card');
        card.dataset.category = event.category;

        const category = document.createElement('p');
        category.classList.add('event-badge');
        category.textContent = event.badgeText;

        if (event.category === 'музика') {
            category.classList.add('badge-music');
        } else if (event.category === 'театр') {
            category.classList.add('badge-theatre');
        } else if (event.category === 'розваги') {
            category.classList.add('badge-entertainment');
        }

        const title = document.createElement('h3');
        title.textContent = event.title;

        const dateDiv = document.createElement('div');
        dateDiv.classList.add('event-date');
        dateDiv.textContent = event.date;

        const img = document.createElement('img');
        img.src = event.image;
        img.alt = event.title; 

        const desc = document.createElement('p');
        desc.textContent = event.description;

        card.append(category, title, dateDiv, img, desc);
        listContainer.append(card);
    }

    if (countElement) {
        countElement.textContent = `Загальна кількість подій: ${eventsArray.length}`;
    }
}

renderEvents(events);