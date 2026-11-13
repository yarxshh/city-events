const API_URL = './holidays.json';
const LOCAL_STORAGE_KEY = 'events_backup';
const DB_NAME = 'EventsDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedEvents';

function saveToLocalStorage(items) {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items)); } 
    catch (error) { console.error(error); }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function migrateFromLocalStorage() {
    const isMigrated = localStorage.getItem('migrated_to_idb') === 'true';
    if (isMigrated) return;
    const localData = loadFromLocalStorage();
    if (localData.length > 0) {
        const dbItems = await getAllItems();
        if (dbItems.length === 0) {
            for (const item of localData) await addItem(item);
        }
    }
    localStorage.setItem('migrated_to_idb', 'true');
}

const routes = [
    { path: '/', view: 'home' },
    { path: '/saved', view: 'saved' },
    { path: '/events/:id', view: 'details' }
];

function matchRoute(path) {
    const pathParts = path.split('/').filter(Boolean);
    for (const route of routes) {
        const routeParts = route.path.split('/').filter(Boolean);
        if (routeParts.length !== pathParts.length) continue;

        let params = {};
        const isMatch = routeParts.every((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = pathParts[i];
                return true;
            }
            return part === pathParts[i];
        });

        if (isMatch) return { view: route.view, params };
    }
    return null;
}

function navigate(e, path) {
    if (e) e.preventDefault();
    window.location.hash = path;
}


function EventCard({ event, onAddFavorite, onDeleteFavorite, isSaved, showDetailsLink = true }) {
    const [barWidth, setBarWidth] = React.useState(0);

    const daysLeft = React.useMemo(() => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = eventDate - today;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }, [event.date]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (daysLeft < 0) {
                setBarWidth(100); 
            } else {
                const percent = Math.max(0, 100 - (daysLeft / 365) * 100);
                setBarWidth(percent);
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [daysLeft]);

    let categoryClass = '';
    switch (event.category) {
        case 'музика': categoryClass = 'music'; break;
        case 'театр': categoryClass = 'theater'; break;
        case 'розваги': categoryClass = 'entertainment'; break;
        default: categoryClass = '';
    }

    return (
        <article className={`card ${categoryClass}`} data-category={event.category}>
            <h3>{event.title}</h3>
            <p>Категорія: {event.category}</p>
            <p>Дата: {event.date}</p>
            
            <div className="progress-container" title="Індикатор наближення події">
                <div 
                    className={`progress-fill ${daysLeft < 0 ? 'past' : ''}`} 
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>

            <p style={{ fontWeight: 'bold', color: daysLeft >= 0 ? '#6A1B9A' : '#D84315' }}>
                {daysLeft >= 0 ? `Днів до події: ${daysLeft}` : `Подія минула (${Math.abs(daysLeft)} дн. тому)`}
            </p>
            
            {onAddFavorite && (
                <button
                    onClick={() => onAddFavorite(event)}
                    disabled={isSaved}
                    style={{
                        marginTop: '10px', backgroundColor: isSaved ? '#cccccc' : '#6A1B9A', color: '#ffffff',
                        border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: isSaved ? 'default' : 'pointer', fontWeight: 'bold'
                    }}
                >
                    {isSaved ? 'Уже в обраному' : 'Додати в обране'}
                </button>
            )}
            {onDeleteFavorite && (
                <button
                    onClick={() => onDeleteFavorite(event.id)}
                    style={{
                        marginTop: '10px', backgroundColor: '#D84315', color: '#ffffff',
                        border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Видалити з обраного
                </button>
            )}

            {showDetailsLink && (
                <a 
                    href={`#/events/${event.id}`} 
                    className="details-link" 
                    data-link
                    onClick={(e) => navigate(e, `/events/${event.id}`)}
                >
                    Деталі події
                </a>
            )}
        </article>
    );
}

function App() {
    const [events, setEvents] = React.useState([]);
    const [savedEvents, setSavedEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [filter, setFilter] = React.useState('all');
    const [newTitle, setNewTitle] = React.useState('');
    const [newCategory, setNewCategory] = React.useState('');
    const [newDate, setNewDate] = React.useState('');

    const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');

    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash.slice(1) || '/');
        };
        window.addEventListener('hashchange', handleHashChange);
        
        const handleDocumentClick = (e) => {
            const link = e.target.closest('a[data-link]');
            if (!link) return;
            e.preventDefault();
            const href = link.getAttribute('href').replace('#', '');
            navigate(null, href);
        };
        document.addEventListener('click', handleDocumentClick);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const fetchApiEvents = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Помилка мережі: ${response.status}`);
            const data = await response.json();
            const mappedEvents = data.map((item, index) => ({
                id: `api-${index}-${item.date}`,
                title: item.localName,
                category: 'розваги',
                date: item.date
            }));
            setEvents(mappedEvents);
        } catch (err) {
            console.error(err);
            setError('Не вдалося завантажити події з API.');
        } finally {
            setLoading(false);
        }
    };

    const loadSavedEvents = async () => {
        try {
            await migrateFromLocalStorage();
            const items = await getAllItems();
            setSavedEvents(items);
        } catch (err) {
            console.error(err);
            setError('Не вдалося отримати доступ до IndexedDB.');
        }
    };

    React.useEffect(() => {
        fetchApiEvents();
        loadSavedEvents();
    }, []);

    const handleAddEvent = (e) => {
        e.preventDefault();
        const newEvent = {
            id: `manual-${Date.now()}`, title: newTitle.trim(), category: newCategory, date: newDate
        };
        setEvents([...events, newEvent]);
        setNewTitle(''); setNewCategory(''); setNewDate('');
    };

    const handleAddFavorite = async (event) => {
        try {
            await addItem(event);
            const updated = await getAllItems();
            setSavedEvents(updated);
            saveToLocalStorage(updated);
        } catch (err) {
            setError('Не вдалося додати подію в IndexedDB.');
        }
    };

    const handleDeleteFavorite = async (id) => {
        try {
            await deleteItem(id);
            const updated = await getAllItems();
            setSavedEvents(updated);
            saveToLocalStorage(updated);
        } catch (err) {
            setError('Не вдалося видалити подію з IndexedDB.');
        }
    };

    const savedIds = new Set(savedEvents.map(e => e.id));

    const renderHome = () => {
        const filteredEvents = filter === 'all' ? events : events.filter(event => event.category === filter);
        return (
            <React.Fragment>
                <section id="add-event-section">
                    <h2>Додати нову подію</h2>
                    <form onSubmit={handleAddEvent}>
                        <label htmlFor="event-title">Назва події:</label>
                        <input type="text" id="event-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required pattern=".{3,}" />
                        <label htmlFor="event-category">Категорія:</label>
                        <select id="event-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required>
                            <option value="">Виберіть категорію</option>
                            <option value="музика">Музика</option>
                            <option value="театр">Театр</option>
                            <option value="розваги">Розваги</option>
                        </select>
                        <label htmlFor="event-date">Дата:</label>
                        <input type="date" id="event-date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
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
                    <h2>Загальний список подій</h2>
                    <div id="api-controls" style={{ marginBottom: '20px' }}>
                        <button onClick={fetchApiEvents} disabled={loading}>Оновити дані з API</button>
                        <span style={{ display: loading ? 'inline' : 'none', marginLeft: '10px', fontWeight: 'bold', color: '#6A1B9A' }}>Завантаження...</span>
                        <div style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{error}</div>
                    </div>
                    <div className="cards-container">
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} onAddFavorite={handleAddFavorite} isSaved={savedIds.has(event.id)} />
                        ))}
                    </div>
                </section>
            </React.Fragment>
        );
    };

    const renderSaved = () => (
        <section>
            <h2>Збережені події</h2>
            {savedEvents.length === 0 ? (
                <p>Немає збережених подій в обраному.</p>
            ) : (
                <div className="cards-container">
                    {savedEvents.map(event => (
                        <EventCard key={event.id} event={event} onDeleteFavorite={handleDeleteFavorite} showDetailsLink={true} />
                    ))}
                </div>
            )}
        </section>
    );

    const renderDetails = (params) => {
        const eventId = params.id;
        const event = events.find(e => e.id === eventId) || savedEvents.find(e => e.id === eventId);

        if (!event) {
            return (
                <section>
                    <h2>Подію не знайдено</h2>
                    <p>Можливо, ви оновили сторінку і дані з API ще не завантажились.</p>
                    <a href="#/" data-link className="details-link" onClick={(e) => navigate(e, '/')}>Повернутися на головну</a>
                </section>
            );
        }

        return (
            <section>
                <h2>Деталі події</h2>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <EventCard 
                        event={event} 
                        onAddFavorite={handleAddFavorite} 
                        onDeleteFavorite={handleDeleteFavorite}
                        isSaved={savedIds.has(event.id)}
                        showDetailsLink={false}
                    />
                    <br/>
                    <a href="#/" data-link className="details-link" onClick={(e) => navigate(e, '/')}>← Назад до списку</a>
                </div>
            </section>
        );
    };

    const render404 = () => (
        <section style={{ textAlign: 'center', padding: '50px 0' }}>
            <h1>404</h1>
            <h2>Сторінку не знайдено</h2>
            <p>Маршрут <strong>{currentPath}</strong> не існує.</p>
            <a href="#/" data-link className="details-link" onClick={(e) => navigate(e, '/')}>На головну сторінку</a>
        </section>
    );

    const match = matchRoute(currentPath);

    let content;
    if (!match) {
        content = render404();
    } else if (match.view === 'home') {
        content = renderHome();
    } else if (match.view === 'saved') {
        content = renderSaved();
    } else if (match.view === 'details') {
        content = renderDetails(match.params);
    }

    return <React.Fragment>{content}</React.Fragment>;
}

const rootNode = document.getElementById('react-root');
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);