const API_URL = './holidays.json';

function EventCard({ title, category, date}){
    const daysLeft = React.useMemo(() => {
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = eventDate - today;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }, [date]);

    let categoryClass = '';
    switch (category) {
        case 'музика':
            categoryClass = 'music';
            break;
        case 'театр':
            categoryClass = 'theater';
            break;
        case 'розваги':
            categoryClass = 'entertainment';
            break;
    }

    return( 
        <article className={`card ${categoryClass}`} data-category={category}>
            <h3>{title}</h3>
            <p>Категорія: {category}</p>
            <p>Дата: {date}</p>
            <p style={{ fontWeight: 'bold', color: daysLeft >= 0 ? '#6A1B9A' : '#D84315' }}>
                {daysLeft >= 0 ? `Днів до події: ${daysLeft}` : `Подія минула (${Math.abs(daysLeft)} дн. тому)`} </p>
        </article>
        );
}

function App() {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [filter, setFilter] = React.useState('all');
    const [newTitle, setNewTitle] = React.useState('');
    const [newCategory, setNewCategory] = React.useState('');
    const [newDate, setNewDate] = React.useState('');

    const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Дані про події не знайдено');
            }
            throw new Error(`ой, сервер сказав код: ${response.status}`);
        }
        
        const data = await response.json();
        
        const mappedEvents = data.map((item, index) => ({
            id: `api-${index}-${item.date}`, 
            title: item.localName,
            category: 'розваги',
            date: item.date
        }));
        
        setEvents(mappedEvents);
        
    } catch (error) {
        console.error('Помилка ', error);
        
        if (error.message === 'Дані про події не знайдено') {
            setError(error.message);
        } else if (error.name === 'TypeError') {
            setError("Проблема з мережею. Перевірте з'єднання.");
        } else {
            setError('Не вдалося завантажити дані. Спробуйте пізніше.');
        }
    } finally {
        setLoading(false);
    }
};

    const handleAddEvent = (e) => {
        e.preventDefault();
        const newEvent = {
            id: `manual-${Date.now()}`,
            title: newTitle.trim(),
            category: newCategory,
            date: newDate
        };

        setEvents([...events, newEvent]);
        setNewTitle('');
        setNewCategory('');
        setNewDate('');
    };

    const filteredEvents = filter === 'all' ? events : events.filter(event => event.category === filter);

    return (
        <React.Fragment>
            <section id = "add-event-section">
                <h2>Додати нову подію</h2>
                <form onSubmit={handleAddEvent}>
                    <label htmlFor="event-title">Назва події:</label>
                    <input
                        type="text" id ="event-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required pattern=".{3,}"
                    />
                    <label htmlFor="event-category">Категорія:</label>
                    <select
                        id="event-category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        required
                    >
                        <option value="">Виберіть категорію</option>
                        <option value="музика">Музика</option>
                        <option value="театр">Театр</option>
                        <option value="розваги">Розваги</option>
                    </select>

                    <label htmlFor="event-date">Дата:</label>
                    <input
                        type="date"
                        id="event-date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                    />
                    <button type="submit">Додати подію</button>
                </form>
            </section>
            <section id="filter-section">
                <h2>Фільтр за категорією</h2>
                <div id="filter-buttons">
                    <button onClick={() => setFilter('all')}>Всі події</button>
                    <button onClick={() => setFilter('музика')}>Музика</button>
                    <button onClick={() => setFilter('театр')}>Театр</button>
                    <button onClick={() => setFilter('розваги')}>Розваги</button>
                </div>
            </section>

            <section id="event-section">
                <h2>Список подій</h2>
                
                <div id="api-controls" style={{ marginBottom: '20px' }}>
                    <button onClick={loadData} disabled={loading}>Оновити дані з API</button>
                    <span style={{ display: loading ? 'inline' : 'none', marginLeft: '10px', fontWeight: 'bold', color: '#6A1B9A' }}>
                        Завантаження...
                    </span>
                    <div style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{error}</div>
                </div>

                <div className="cards-container">
                    {filteredEvents.map(event => (
                        <EventCard 
                            key={event.id} 
                            title={event.title} 
                            category={event.category} 
                            date={event.date} 
                        />
                    ))}
                </div>
                <p style={{ fontWeight: 'bold', marginTop: '20px' }}>
                    Загальна кількість подій: {filteredEvents.length}
                </p>
            </section>
        </React.Fragment>
    );
}

const rootNode = document.getElementById('react-root');
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);
