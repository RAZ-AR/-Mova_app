// Получаем canvas и контекст
const canvas = document.getElementById('lava-canvas');
const ctx = canvas.getContext('2d');

// Устанавливаем размеры canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Пастельные цвета для лавовой лампы
const colors = [
    { r: 255, g: 181, b: 216 }, // Розовый
    { r: 255, g: 201, b: 224 }, // Светло-розовый
    { r: 181, g: 216, b: 255 }, // Голубой
    { r: 197, g: 224, b: 255 }, // Светло-голубой
    { r: 245, g: 230, b: 211 }, // Бежевый
    { r: 255, g: 228, b: 196 }, // Светло-бежевый
    { r: 229, g: 212, b: 255 }, // Лавандовый
    { r: 217, g: 197, b: 255 }, // Светло-лавандовый
    { r: 197, g: 255, b: 229 }, // Мятный
    { r: 212, g: 255, b: 237 }  // Светло-мятный
];

// Класс для создания blob'ов (шариков лавовой лампы)
class Blob {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 150 + 80; // Размер от 80 до 230
        this.baseRadius = this.radius;
        this.speedY = (Math.random() - 0.5) * 0.8; // Медленная вертикальная скорость
        this.speedX = (Math.random() - 0.5) * 0.5; // Медленная горизонтальная скорость
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.5; // Прозрачность от 0.5 до 0.8
    }

    update(time) {
        // Движение вверх-вниз (как в лавовой лампе)
        this.y += this.speedY;
        this.x += this.speedX;

        // Пульсация размера
        this.radius = this.baseRadius + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 20;

        // Если blob выходит за границы, возвращаем его с другой стороны
        if (this.y - this.radius > canvas.height) {
            this.y = -this.radius;
            this.x = Math.random() * canvas.width;
        }
        if (this.y + this.radius < 0) {
            this.y = canvas.height + this.radius;
            this.x = Math.random() * canvas.width;
        }
        if (this.x - this.radius > canvas.width) {
            this.x = -this.radius;
        }
        if (this.x + this.radius < 0) {
            this.x = canvas.width + this.radius;
        }
    }

    draw() {
        // Создаем радиальный градиент для blob'а
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        const c = this.color;
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Создаем массив blob'ов
const blobs = [];
const blobCount = 12; // Количество blob'ов

for (let i = 0; i < blobCount; i++) {
    blobs.push(new Blob());
}

// Фоновый градиент
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FFF5F7');
    gradient.addColorStop(0.5, '#FAF0E6');
    gradient.addColorStop(1, '#F0E6F6');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Применяем эффект размытия через SVG фильтр
function setupBlurEffect() {
    const filterCanvas = document.createElement('canvas');
    filterCanvas.width = canvas.width;
    filterCanvas.height = canvas.height;
    return filterCanvas;
}

let time = 0;

// Основная функция анимации
function animate() {
    time++;

    // Очищаем canvas и рисуем фон
    drawBackground();

    // Применяем эффект размытия
    ctx.filter = 'blur(40px)';

    // Обновляем и рисуем все blob'ы
    blobs.forEach(blob => {
        blob.update(time);
        blob.draw();
    });

    // Сбрасываем фильтр
    ctx.filter = 'none';

    // Добавляем дополнительный слой с меньшим размытием для глубины
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(60px) brightness(1.1)';

    blobs.forEach(blob => {
        blob.draw();
    });

    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

// Запускаем анимацию
animate();
