// Estado da aplicação
let currentDay = 0;

// Elementos DOM
const timeline = document.getElementById("timeline");
const dayTitle = document.getElementById("day-title");
const dayDate = document.getElementById("day-date");
const tabButtons = document.querySelectorAll(".tab-button");

// Inicialização da página
document.addEventListener("DOMContentLoaded", function() {
    initializeEventListeners();
    renderSchedule(currentDay);
});

// Configurar event listeners
function initializeEventListeners() {
    // Event listeners para os botões de navegação
    tabButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            switchDay(index);
        });
    });

    // Event listener para teclas de navegação
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && currentDay > 0) {
            switchDay(currentDay - 1);
        } else if (e.key === "ArrowRight" && currentDay < scheduleData.length - 1) {
            switchDay(currentDay + 1);
        }
    });

    // Mobile menu toggle
    /* const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
    const mobileNav = document.querySelector(".mobile-nav");

    if (mobileMenuIcon && mobileNav) {
        mobileMenuIcon.addEventListener("click", () => {
            mobileNav.classList.toggle("active");
        });

        // Close mobile menu when a link is clicked
        mobileNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileNav.classList.remove("active");
            });
        });
    } */
}

// Alternar entre os dias
function switchDay(dayIndex) {
    if (dayIndex === currentDay) return;
    
    // Atualizar estado
    currentDay = dayIndex;
    
    // Atualizar botões ativos
    updateActiveTab();
    
    // Renderizar novo cronograma com animação
    animateScheduleChange(() => {
        renderSchedule(currentDay);
    });
}

// Atualizar botão ativo
function updateActiveTab() {
    tabButtons.forEach((button, index) => {
        button.classList.toggle("active", index === currentDay);
    });
}

// Animação de transição entre cronogramas
function animateScheduleChange(callback) {
    timeline.classList.add("fade-out");
    
    setTimeout(() => {
        callback();
        timeline.classList.remove("fade-out");
        timeline.classList.add("fade-in");
        
        setTimeout(() => {
            timeline.classList.remove("fade-in");
        }, 300);
    }, 150);
}

// Renderizar cronograma do dia
function renderSchedule(dayIndex) {
    const dayData = scheduleData[dayIndex];
    
    // Atualizar cabeçalho
    dayTitle.textContent = dayData.day;
    dayDate.textContent = formatDate(dayData.date);
    
    // Limpar timeline
    timeline.innerHTML = "";
    
    // Renderizar eventos
    dayData.events.forEach((event, eventIndex) => {
        const eventElement = createEventElement(event, eventIndex);
        timeline.appendChild(eventElement);
    });
    
    // Adicionar animação de entrada aos elementos
    animateEventEntrance();
}

// Criar elemento de evento
function createEventElement(event, eventIndex) {
    const eventItem = document.createElement("div");
    eventItem.className = "event-item";
    
    // Verificar se é um intervalo
    if (event.time.toLowerCase().includes("intervalo")) {
        eventItem.classList.add("interval");
        eventItem.innerHTML = `
            <div class="event-time">
                <i class="fas fa-coffee"></i>
                ${event.time}
            </div>
        `;
        return eventItem;
    }
    
    // Verificar se tem detalhes expandíveis
    const hasDetails = event.details && event.details.length > 0;
    if (hasDetails) {
        eventItem.classList.add("expandable");
    }
    
    // Criar conteúdo do evento
    eventItem.innerHTML = `
        <div class="event-time">
            <i class="fas fa-clock"></i>
            ${event.time}
        </div>
        <div class="event-content">
            <div class="event-description">${event.description}</div>
            ${hasDetails ? createEventDetails(event.details) : ""}
        </div>
    `;
    
    // Adicionar event listener para expansão
    if (hasDetails) {
        eventItem.addEventListener("click", () => {
            toggleEventDetails(eventItem);
        });
    }
    
    return eventItem;
}

// Criar detalhes do evento
function createEventDetails(details) {
    const detailsList = details.map(detail => `<li>${detail}</li>`).join("");
    return `
        <div class="event-details">
            <ul>
                ${detailsList}
            </ul>
        </div>
    `;
}

// Alternar detalhes do evento
function toggleEventDetails(eventElement) {
    eventElement.classList.toggle("expanded");
    
    // Adicionar feedback visual
    const eventContent = eventElement.querySelector(".event-content");
    eventContent.style.transform = "scale(0.98)";
    
    setTimeout(() => {
        eventContent.style.transform = "scale(1)";
    }, 100);
}

// Animar entrada dos eventos
function animateEventEntrance() {
    const eventItems = timeline.querySelectorAll(".event-item");
    
    eventItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            item.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        }, index * 50);
    });
}

// Formatar data
function formatDate(dateString) {
    const [day, month, year] = dateString.split("/");
    const date = new Date(year, month - 1, day);
    
    const options = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
    };
    
    return date.toLocaleDateString("pt-BR", options);
}

// Funcionalidades adicionais

// Busca de eventos
function searchEvents(query) {
    const allEvents = scheduleData.flatMap(day => 
        day.events.map(event => ({
            ...event,
            dayIndex: scheduleData.indexOf(day),
            dayTitle: day.day
        }))
    );
    
    return allEvents.filter(event => 
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        (event.details && event.details.some(detail => 
            detail.toLowerCase().includes(query.toLowerCase())
        ))
    );
}

// Filtrar eventos por tipo
function filterEventsByType(type) {
    const keywords = {
        "oficinas": ["oficina"],
        "apresentacoes": ["apresentação", "apresentacao"],
        "exposicoes": ["exposição", "exposicao"],
        "palestras": ["palestra", "seminário", "seminario"]
    };
    
    if (!keywords[type]) return [];
    
    const allEvents = scheduleData.flatMap(day => 
        day.events.map(event => ({
            ...event,
            dayIndex: scheduleData.indexOf(day),
            dayTitle: day.day
        }))
    );
    
    return allEvents.filter(event => 
        keywords[type].some(keyword => 
            event.description.toLowerCase().includes(keyword)
        )
    );
}

// Exportar cronograma para impressão
function printSchedule() {
    const printWindow = window.open("", "_blank");
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Gerar conteúdo para impressão
function generatePrintContent() {
    let content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ConCAC 2025 - Cronograma</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2563eb; text-align: center; }
                h2 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                .event { margin-bottom: 15px; padding: 10px; border-left: 3px solid #0ea5e9; }
                .time { font-weight: bold; color: #2563eb; }
                .description { margin-top: 5px; }
                .details { margin-top: 10px; padding-left: 20px; }
                .details li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <h1>ConCAC 2025 - Cronograma do Evento</h1>
    `;
    
    scheduleData.forEach(day => {
        content += `<h2>${day.day} - ${day.date}</h2>`;
        
        day.events.forEach(event => {
            content += `
                <div class="event">
                    <div class="time">${event.time}</div>
                    <div class="description">${event.description}</div>
            `;
            
            if (event.details && event.details.length > 0) {
                content += "<ul class=\"details\">";
                event.details.forEach(detail => {
                    content += `<li>${detail}</li>`;
                });
                content += "</ul>";
            }
            
            content += "</div>";
        });
    });
    
    content += "</body></html>";
    return content;
}

// Adicionar funcionalidade de scroll suave
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Detectar scroll e mostrar botão de voltar ao topo
window.addEventListener("scroll", () => {
    const scrollButton = document.getElementById("scroll-top-button");
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = "block";
        } else {
            scrollButton.style.display = "none";
        }
    }
});

// Adicionar suporte a gestos touch para dispositivos móveis
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && currentDay > 0) {
            // Swipe para a direita - dia anterior
            switchDay(currentDay - 1);
        } else if (swipeDistance < 0 && currentDay < scheduleData.length - 1) {
            // Swipe para a esquerda - próximo dia
            switchDay(currentDay + 1);
        }
    }
}

// Adicionar indicadores de carregamento
function showLoading() {
    timeline.innerHTML = "<div class=\"loading\"></div>";
}

function hideLoading() {
    const loading = timeline.querySelector(".loading");
    if (loading) {
        loading.remove();
    }
}

// Funcionalidade de favoritos (localStorage)
function toggleFavorite(eventIndex, dayIndex) {
    const favorites = getFavorites();
    const eventId = `${dayIndex}-${eventIndex}`;
    
    if (favorites.includes(eventId)) {
        const index = favorites.indexOf(eventId);
        favorites.splice(index, 1);
    } else {
        favorites.push(eventId);
    }
    
    localStorage.setItem("concac-favorites", JSON.stringify(favorites));
    updateFavoriteButtons();
}

function getFavorites() {
    const favorites = localStorage.getItem("concac-favorites");
    return favorites ? JSON.parse(favorites) : [];
}

function updateFavoriteButtons() {
    const favorites = getFavorites();
    const favoriteButtons = document.querySelectorAll(".favorite-button");
    
    favoriteButtons.forEach(button => {
        const eventId = button.dataset.eventId;
        button.classList.toggle("active", favorites.includes(eventId));
    });
}

// Utilitários de acessibilidade
function announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Adicionar suporte a teclado para navegação
document.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("expandable")) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleEventDetails(e.target);
            announceToScreenReader("Detalhes do evento expandidos");
        }
    }
});

// Função para destacar eventos atuais
function highlightCurrentEvents() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const eventItems = timeline.querySelectorAll(".event-item");
    
    eventItems.forEach(item => {
        const timeText = item.querySelector(".event-time").textContent;
        const eventTime = parseEventTime(timeText);
        
        if (eventTime && isEventCurrent(eventTime, currentTime)) {
            item.classList.add("current-event");
        } else {
            item.classList.remove("current-event");
        }
    });
}

function parseEventTime(timeText) {
    const match = timeText.match(/(\d{1,2})h/);
    return match ? parseInt(match[1]) * 60 : null;
}

function isEventCurrent(eventTime, currentTime) {
    return Math.abs(eventTime - currentTime) < 60; // Dentro de 1 hora
}

// Atualizar eventos atuais a cada minuto
setInterval(highlightCurrentEvents, 60000);



