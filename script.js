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

// Пастельные цвета для лавовой лампы - БОЛЕЕ ЯРКИЕ
const colors = [
    { r: 255, g: 150, b: 200 }, // Розовый
    { r: 255, g: 180, b: 210 }, // Светло-розовый
    { r: 150, g: 200, b: 255 }, // Голубой
    { r: 180, g: 210, b: 255 }, // Светло-голубой
    { r: 255, g: 220, b: 180 }, // Бежевый
    { r: 255, g: 230, b: 200 }, // Светло-бежевый
    { r: 220, g: 180, b: 255 }, // Лавандовый
    { r: 200, g: 170, b: 255 }, // Светло-лавандовый
    { r: 180, g: 255, b: 220 }, // Мятный
    { r: 200, g: 255, b: 230 }  // Светло-мятный
];

// Класс для создания blob'ов (шариков лавовой лампы)
class Blob {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 120 + 100; // Размер от 100 до 220
        this.baseRadius = this.radius;
        this.speedY = (Math.random() - 0.5) * 1.2; // Чуть быстрее
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.4 + 0.6; // Более непрозрачные: от 0.6 до 1.0
    }

    update(time) {
        // Движение вверх-вниз (как в лавовой лампе)
        this.y += this.speedY;
        this.x += this.speedX;

        // Пульсация размера
        this.radius = this.baseRadius + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 30;

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

    draw(useBlur = false) {
        // Создаем радиальный градиент для blob'а
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        const c = this.color;
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity})`);
        gradient.addColorStop(0.4, `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity * 0.7})`);
        gradient.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Создаем массив blob'ов
const blobs = [];
const blobCount = 15; // Больше blob'ов

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

let time = 0;

// Основная функция анимации
function animate() {
    time++;

    // Очищаем canvas и рисуем фон
    drawBackground();

    // Рисуем blob'ы БЕЗ размытия (базовый слой)
    ctx.filter = 'none';
    blobs.forEach(blob => {
        blob.update(time);
        blob.draw();
    });

    // Добавляем слой с размытием для эффекта лавовой лампы
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(50px) brightness(1.15)';

    blobs.forEach(blob => {
        blob.draw();
    });

    // Еще один слой с большим размытием для мягкости
    ctx.filter = 'blur(80px) brightness(1.1)';

    blobs.forEach(blob => {
        blob.draw();
    });

    // Сбрасываем фильтры
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

// Запускаем анимацию
animate();

// Добавляем console.log для отладки
console.log('Lava lamp animation started!');
console.log('Canvas size:', canvas.width, 'x', canvas.height);
console.log('Number of blobs:', blobs.length);
