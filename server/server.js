const express = require('express');
const app = express();
const port = 8080; // Вы можете выбрать любой доступный порт
const cors = require('cors'); // Подключение пакета cors

app.use(express.json());

// Использование CORS
app.use(cors());

// Обработка GET-запроса на корневой маршрут
app.get('/', (req, res) => {
    res.send('Сервер работает');
});

// Обработка POST-запроса с параметрами конуса
app.post('/calculateCone', (req, res) => {
    // Получите параметры конуса из тела запроса
    const {height, radius, segments} = req.body;

    // Инициализация массива для хранения треугольников
    const triangles = [];

    // Вычисления треугольников для конуса
    for (let i = 0; i < segments; i++) {
        const angle1 = (2 * Math.PI * i) / segments;
        const angle2 = (2 * Math.PI * (i + 1)) / segments;

        const nodeA = {x: 0, y: 0, z: height};
        const nodeB = {
            x: radius * Math.cos(angle1),
            y: radius * Math.sin(angle1),
            z: 0,
        };
        const nodeC = {
            x: radius * Math.cos(angle2),
            y: radius * Math.sin(angle2),
            z: 0,
        };

        triangles.push([nodeA, nodeB, nodeC]);
    }

    for (let i = 0; i < triangles.length; i++) {
        // Здесь calculateNormal - функция для вычисления нормали
        triangles[i].push({normal: calculateNormal(triangles[i])});
    }
    // Отправляем результат клиенту
    res.json({message: 'Вычисления успешно завершены', triangles});
});

function calculateNormal(triangle) {
    // Получите вершины треугольника
    const x1 = triangle[0].x;
    const y1 = triangle[0].y;
    const z1 = triangle[0].z;
    const x2 = triangle[1].x;
    const y2 = triangle[1].y;
    const z2 = triangle[1].z;
    const x3 = triangle[2].x;
    const y3 = triangle[2].y;
    const z3 = triangle[2].z;

    const vx1 = x1 - x2;
    const vy1 = y1 - y2;
    const vz1 = z1 - z2;
    const vx2 = x2 - x3;
    const vy2 = y2 - y3;
    const vz2 = z2 - z3;

    const wrki = Math.sqrt(Math.pow(vy1 * vz2 - vz1 * vy2, 2) + Math.pow(vz1 * vx2 - vx1 * vz2, 2) + Math.pow(vx1 * vy2 - vy1 * vx2, 2));

    const normal = {}

    normal.x = (vy1 * vz2 - vz1 * vy2) / wrki;
    normal.y = (vz1 * vx2 - vx1 * vz2) / wrki;
    normal.z = (vx1 * vy2 - vy1 * vx2) / wrki;

    return normal;
}

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});