document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы из DOM
    const coneForm = document.getElementById('coneForm');
    const resultDiv = document.getElementById('result');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
    const renderer = new THREE.WebGLRenderer();
    let coneMesh; // Переменная для хранения меша конуса
    const coneMaterial = new THREE.MeshLambertMaterial({
        color: 0x55D7FF, // Включаем проволочный режим
    });

    // Устанавливаем размер рендера и добавляем его в DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Устанавливаем фон сцены
    scene.background = new THREE.Color('#353535')

    // Установка позиции камеры
    camera.position.set(-7, -40, 15);
    camera.lookAt(0, 35, 0);

    // Создаем и добавляем направленный свет
    const light = new THREE.DirectionalLight(0xFFFFFF, 1, 100);
    light.position.copy(camera.position);
    scene.add(light);

    // Создаем цель для света (направление света)
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0, 0);

    // Устанавливаем цель для света
    light.target = lightTarget;
    scene.add(lightTarget);

    // Функция анимации для отрисовки сцены
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    // Запуск анимации
    animate();

    // Обработчик формы для отправки запроса на сервер
    coneForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Получаем параметры конуса из формы
        const height = parseFloat(document.getElementById('height').value);
        const radius = parseFloat(document.getElementById('radius').value);
        const segments = parseInt(document.getElementById('segments').value);

        // Формируем данные для отправки на сервер
        const requestData = {
            height,
            radius,
            segments,
        };

        try {
            // Отправляем POST-запрос на сервер
            const response = await fetch('http://localhost:8080/calculateCone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                resultDiv.innerHTML = `Результат: ${data.message}`;

                // Получаем данные о треугольниках и нормалях
                const triangles = data.triangles;
                // Очищаем текущую геометрию конуса
                if (coneMesh) {
                    scene.remove(coneMesh);
                }
                let coneGeometry = new THREE.BufferGeometry();

                // Создаем новые буферы для позиций вершин и нормалей
                const positions = new Float32Array(triangles.length * 3 * 3);
                const normals = new Float32Array(triangles.length * 3 * 3);

                // Заполняем буферы данными о вершинах и нормалях
                for (let i = 0; i < triangles.length; i++) {
                    for (let j = 0; j < 3; j++) {
                        positions[i * 9 + j * 3] = triangles[i][j].x;
                        positions[i * 9 + j * 3 + 1] = triangles[i][j].y;
                        positions[i * 9 + j * 3 + 2] = triangles[i][j].z;

                        normals[i * 9 + j * 3] = triangles[i][3].normal.x;
                        normals[i * 9 + j * 3 + 1] = triangles[i][3].normal.y;
                        normals[i * 9 + j * 3 + 2] = triangles[i][3].normal.z;
                    }
                }

                // Создаем буферные атрибуты для вершин и нормалей
                const positionAttribute = new THREE.BufferAttribute(positions, 3);
                const normalAttribute = new THREE.BufferAttribute(normals, 3);

                // Устанавливаем атрибуты вершин и нормалей в геометрию
                coneGeometry.setAttribute('position', positionAttribute);
                coneGeometry.setAttribute('normal', normalAttribute);

                // Создаем новый меш на основе обновленной геометрии и материала
                coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);

                // Добавляем обновленный меш в сцену
                scene.add(coneMesh);
            } else {
                resultDiv.innerHTML = 'Ошибка при вычислениях.';
            }
        } catch (error) {
            console.error('Ошибка:', error);
            resultDiv.innerHTML = 'Произошла ошибка при отправке запроса.';
        }
    });
});
