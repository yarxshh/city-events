
let events = [];

const listContainer = document.querySelector('#events-list');
const countElement = document.querySelector('#events-count');
const form = document.querySelector('#add-event-form');
const titleInput = document.querySelector('#event-title');
const filterContainer = document.querySelector('#filter-buttons');

const refreshBtn = document.querySelector('#refresh-btn');
const loadingIndicator = document.querySelector('#loading-indicator');
const errorMessage = document.querySelector('#error-message');

const API_URL = 'https://date.nager.at/api/v3/PublicHolidays/2026/UA';

async function loadData() {
    loadingIndicator.style.display = 'inline';
    errorMessage.textContent = '';
    refreshBtn.disabled = true;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Дані про події не знайдено');
            }
            throw new Error(`ой, сервер сказав код: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        const mappedEvents = data.map(item => ({
            title: item.localName,
            category: 'розваги',
            date: item.date
        }));

        events = mappedEvents;
        renderEvents(events);

    } catch (error) {
        console.error('Помилка ', error);

        if (error.message === 'Дані про події не знайдено') {
            errorMessage.textContent = error.message;
        } else if (error.name === 'TypeError') {
            errorMessage.textContent = 'Проблема з мережею. Перевірте з\'єднання.';
        } else {
            errorMessage.textContent = 'Не вдалося завантажити дані. Спробуйте пізніше.';
        }
    } finally {
        loadingIndicator.style.display = 'none';
        refreshBtn.disabled = false;
    }
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', loadData);
}

function renderEvents(eventsArray) {
    if (!listContainer) return;
    listContainer.innerHTML = '';

    for (const event of eventsArray) {
        const card = document.createElement('article');
        card.classList.add('card');
        card.dataset.category = event.category;

        const titleElement = document.createElement('h3');
        titleElement.textContent = event.title;

        const categoryElement = document.createElement('p');
        categoryElement.textContent = `Категорія: ${event.category}`;

        const dateElement = document.createElement('p');
        dateElement.textContent = `Дата: ${event.date}`;

        if (event.category === 'музика') {
            card.classList.add('music');
        } else if (event.category === 'театр') {
            card.classList.add('theater');
        } else if (event.category === 'розваги') {
            card.classList.add('entertainment');
        }

        card.append(titleElement, categoryElement, dateElement);
        listContainer.append(card);
    }

    if (countElement) {
        countElement.textContent = `Загальна кількість подій: ${eventsArray.length}`;
    }
}

renderEvents(events);

titleInput.addEventListener('input', () => {

    if (titleInput.value.length > 0 && titleInput.value.length < 3) {
        titleInput.setCustomValidity('Назва події повинна містити мінімум 3 символи.');
    } else {
        titleInput.setCustomValidity('');
    }
});

form.addEventListener('submit', (event) => {

    event.preventDefault(); 

    const newTitle = document.querySelector('#event-title').value.trim();
    const newCategory = document.querySelector('#event-category').value;
    const newDate = document.querySelector('#event-date').value;

    const newEvent = {
        title: newTitle,
        category: newCategory,
        date: newDate
    };
    events.push(newEvent);

    renderEvents(events); 

    form.reset();
});

if (filterContainer) {

    filterContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const selectedCategory = event.target.dataset.filter;
            
            if (selectedCategory === 'all') {
                renderEvents(events); 
            } else {
                const filteredEvents = events.filter(e => e.category === selectedCategory);
                renderEvents(filteredEvents);
            }
        }
    });
}