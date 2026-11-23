const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data', 'events.json');

function readEvents() {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(rawData);
}

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/events', (req, res) => {
    try {
        const events = readEvents();
        res.status(200).json(events);
    } catch (error) {
        console.error('Помилка читання файлу подій', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера при читанні даних' });
    }
});

app.get('/api/events/:id', (req, res) => {
    try {
        const events = readEvents();
        const event = events.find((item) => String(item.id) === req.params.id);

        if (!event) {
            return res.status(404).json({
                error: `Подію з id "${req.params.id}" не знайдено`
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Помилка пошуку події', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({
        error: `API-ендпоінт ${req.originalUrl} не знайдено`
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`Список подій (API): http://localhost:${PORT}/api/events`);
});