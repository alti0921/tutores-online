// Tutores On-Line - Lógica de Negocio, Roles y Persistencia Académica

// ================= ESTADO DE LA APLICACIÓN =================
let state = {
    role: null,           // 'student' | 'tutor' | 'admin'
    username: null,       // Usuario activo en sesión
    tutorId: null,        // tutorId asociado (si el rol es tutor)
    tutors: [],
    users: [],
    studentBalance: 100.00,
    studentBookings: [],
    studentTransactions: [],
    platformProfitability: 0.00,
    platformCommissions: 0.00
};

// ================= DATOS DE SEMILLA (SEED DATA) =================
const SEED_USERS = [
    { username: 'estudiante', password: '1234', role: 'student', name: 'Sofía Montenegro' },
    { username: 'tutor', password: '1234', role: 'tutor', tutorId: 'TUT-103', name: 'Msc. Diego López' },
    { username: 'admin', password: '1234', role: 'admin', name: 'Ing. Carlos Ortega' }
];

const SEED_TUTORS = [
    { 
        id: 'TUT-101', 
        name: 'Dr. Carlos Mendoza', 
        subject: 'Cálculo', 
        price: 25.00, 
        rating: 4.8, 
        status: 'active', 
        initials: 'CM', 
        gradient: 'from-blue-600 to-cyan-500',
        level: 'Universitario',
        modality: 'both',
        bio: 'Doctor en Matemáticas Aplicadas con más de 8 años de experiencia en docencia de cálculo vectorial e integrales complejas.',
        diploma: 'Ph.D. en Ciencias Matemáticas - Universidad de Buenos Aires',
        hours: 12,
        earnings: 270.00,
        online: false,
        reviews: [
            { studentName: 'Mateo R.', stars: 5, comment: 'Excelente profesor, explica con peras y manzanas temas complejos.', date: '2026-05-18' },
            { studentName: 'Sofía M.', stars: 4, comment: 'Muy buenas clases de cálculo diferencial.', date: '2026-05-20' }
        ],
        schedules: ['Lun 9:00-11:00', 'Mié 14:00-16:00']
    },
    { 
        id: 'TUT-102', 
        name: 'Dra. Ana Rodríguez', 
        subject: 'Física', 
        price: 20.00, 
        rating: 4.7, 
        status: 'active', 
        initials: 'AR', 
        gradient: 'from-pink-500 to-indigo-500',
        level: 'Secundaria',
        modality: 'presencial',
        bio: 'Licenciada en Educación y Física. Apasionada por ayudar a alumnos de secundaria a perder el miedo a la física clásica.',
        diploma: 'Licenciada en Educación Científica - UNAM',
        hours: 15,
        earnings: 270.00,
        online: false,
        reviews: [
            { studentName: 'Laura G.', stars: 5, comment: 'Gracias a ella aprobé cinemática y dinámica sin problemas.', date: '2026-05-19' }
        ],
        schedules: ['Mar 10:00-12:00', 'Jue 15:00-17:00']
    },
    { 
        id: 'TUT-103', 
        name: 'Msc. Diego López', 
        subject: 'Algoritmos', 
        price: 30.00, 
        rating: 4.9, 
        status: 'active', 
        initials: 'DL', 
        gradient: 'from-amber-500 to-yellow-500',
        level: 'Universitario',
        modality: 'virtual',
        bio: 'Ingeniero de Software y docente. Experto en estructuración de algoritmos complejos, grafos y programación en Python/C++.',
        diploma: 'Master en Ciencias de la Computación - MIT',
        hours: 9,
        earnings: 243.00,
        online: true,
        reviews: [
            { studentName: 'Andrés K.', stars: 5, comment: 'Las clases de recursividad e interfaces gráficas son otro nivel.', date: '2026-05-15' }
        ],
        schedules: ['Lun 16:00-18:00', 'Vie 9:00-11:00']
    }
];

const SEED_STUDENT_BOOKINGS = [
    { 
        id: 'BKG-seed-1', 
        tutorId: 'TUT-102', 
        tutorName: 'Dra. Ana Rodríguez', 
        subject: 'Física', 
        price: 20.00, 
        date: '2026-05-23', 
        time: '15:00', 
        modality: 'presencial', 
        type: 'scheduled', 
        status: 'accepted',
        videoLink: '',
        location: 'Biblioteca Central - Sala A'
    }
];

const SEED_STUDENT_TRANSACTIONS = [
    { id: 'TX-seed-1', type: 'recharge', description: 'Canje de Cupón BIENVENIDA', amount: 200.00, timestamp: '2026-05-22, 09:15', status: 'Completado' },
    { id: 'TX-seed-2', type: 'booking', description: 'Pago Tutoría Física (Ana Rodríguez)', amount: -20.00, timestamp: '2026-05-22, 10:00', status: 'Completado' }
];

// ================= PERSISTENCIA LOCAL STORAGE =================
function saveUsers() { localStorage.setItem('tutores_online_users', JSON.stringify(state.users)); }
function saveTutors() { localStorage.setItem('tutores_online_tutors', JSON.stringify(state.tutors)); }

// Base de Datos de Reservas Global
function loadGlobalBookings() {
    const stored = localStorage.getItem('tutores_online_global_bookings');
    if (stored) {
        return JSON.parse(stored);
    } else {
        const seedGlobal = [...SEED_STUDENT_BOOKINGS].map(b => ({
            ...b,
            studentUsername: 'estudiante',
            studentName: 'Sofía Montenegro'
        }));
        localStorage.setItem('tutores_online_global_bookings', JSON.stringify(seedGlobal));
        return seedGlobal;
    }
}

function saveGlobalBookings(bookings) {
    localStorage.setItem('tutores_online_global_bookings', JSON.stringify(bookings));
}

// Persistencia Independiente por Estudiante
function loadStudentBalance() {
    if (state.role === 'student' && state.username) {
        const key = `tutores_online_balance_${state.username}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            state.studentBalance = parseFloat(stored);
        } else {
            state.studentBalance = 100.00;
            saveStudentBalance();
        }
    } else {
        state.studentBalance = 100.00;
    }
}

function saveStudentBalance() {
    if (state.role === 'student' && state.username) {
        const key = `tutores_online_balance_${state.username}`;
        localStorage.setItem(key, state.studentBalance.toString());
    }
}

function loadStudentBookings() {
    if (state.role === 'student' && state.username) {
        const key = `tutores_online_bookings_${state.username}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            state.studentBookings = JSON.parse(stored);
        } else {
            if (state.username === 'estudiante') {
                state.studentBookings = [...SEED_STUDENT_BOOKINGS];
            } else {
                state.studentBookings = [];
            }
            saveStudentBookings();
        }
    } else {
        state.studentBookings = [];
    }
}

function saveStudentBookings() {
    if (state.role === 'student' && state.username) {
        const studentKey = `tutores_online_bookings_${state.username}`;
        localStorage.setItem(studentKey, JSON.stringify(state.studentBookings));
        
        // Sincronizar con la base de datos de reservas global
        let globalBookings = loadGlobalBookings();
        state.studentBookings.forEach(studentBooking => {
            const idx = globalBookings.findIndex(gb => gb.id === studentBooking.id);
            if (idx !== -1) {
                globalBookings[idx] = { ...globalBookings[idx], ...studentBooking };
            } else {
                globalBookings.push(studentBooking);
            }
        });
        saveGlobalBookings(globalBookings);
    }
}

function loadStudentTransactions() {
    if (state.role === 'student' && state.username) {
        const key = `tutores_online_transactions_${state.username}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            state.studentTransactions = JSON.parse(stored);
        } else {
            if (state.username === 'estudiante') {
                state.studentTransactions = [...SEED_STUDENT_TRANSACTIONS];
            } else {
                state.studentTransactions = [];
            }
            saveStudentTransactions();
        }
    } else {
        state.studentTransactions = [];
    }
}

function saveStudentTransactions() {
    if (state.role === 'student' && state.username) {
        const key = `tutores_online_transactions_${state.username}`;
        localStorage.setItem(key, JSON.stringify(state.studentTransactions));
    }
}

function syncBookingsFromGlobal() {
    if (state.role === 'student' && state.username) {
        const globalBookings = loadGlobalBookings();
        const studentGlobalBookings = globalBookings.filter(b => b.studentUsername === state.username);
        
        state.studentBookings = studentGlobalBookings;
        const studentKey = `tutores_online_bookings_${state.username}`;
        localStorage.setItem(studentKey, JSON.stringify(state.studentBookings));
    }
}

function savePlatformProfitability() { localStorage.setItem('tutores_online_platform_profitability', state.platformProfitability.toString()); }
function savePlatformCommissions() { localStorage.setItem('tutores_online_platform_commissions', state.platformCommissions.toString()); }

// ================= INICIALIZACIÓN DE DATOS Y ESTADOS =================
function initApp() {
    // Cargar credenciales y registros
    const storedUsers = localStorage.getItem('tutores_online_users');
    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    } else {
        state.users = [...SEED_USERS];
        saveUsers();
    }

    // Cargar tutores
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    } else {
        state.tutors = [...SEED_TUTORS];
        saveTutors();
    }

    // Inicializar base de datos de reservas global
    loadGlobalBookings();

    // Cargar ganancias generales plataforma
    const storedProfit = localStorage.getItem('tutores_online_platform_profitability');
    if (storedProfit) {
        state.platformProfitability = parseFloat(storedProfit);
    } else {
        state.platformProfitability = 20.00;
        savePlatformProfitability();
    }

    // Cargar comisiones
    const storedCommissions = localStorage.getItem('tutores_online_platform_commissions');
    if (storedCommissions) {
        state.platformCommissions = parseFloat(storedCommissions);
    } else {
        state.platformCommissions = 2.00;
        savePlatformCommissions();
    }

    // Recuperar sesión para cargar datos de usuario aislados
    const sessionRole = sessionStorage.getItem('tutores_online_role');
    const sessionUser = sessionStorage.getItem('tutores_online_username');
    const sessionTutorId = sessionStorage.getItem('tutores_online_tutorId');
    if (sessionRole && sessionUser) {
        state.role = sessionRole;
        state.username = sessionUser;
        state.tutorId = sessionTutorId;
    }

    // Cargar saldo, reservas y transacciones del estudiante (user-specific si está logueado)
    loadStudentBalance();
    loadStudentBookings();
    loadStudentTransactions();
    if (state.role === 'student') {
        syncBookingsFromGlobal();
    }

    // Setup de Reloj y Listeners
    startClock();
    setupEventListeners();

    // Iniciar simulador de tiempo y notificaciones (Proceso 6.0)
    checkNotificationsSimulation();
    setInterval(checkNotificationsSimulation, 5000);

    // Validar Sesión
    checkUserSession();
}

// ================= TOASTS DE NOTIFICACIÓN =================
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    let borderClass, iconSvg;
    
    if (type === 'success') {
        borderClass = 'border-emerald-500/80';
        iconSvg = `<svg class="w-4 h-4 text-emerald-400 glow-emerald animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === 'warning') {
        borderClass = 'border-amber-500/80';
        iconSvg = `<svg class="w-4 h-4 text-amber-400 glow-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else if (type === 'danger') {
        borderClass = 'border-rose-500/80';
        iconSvg = `<svg class="w-4 h-4 text-rose-400 glow-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else {
        borderClass = 'border-blue-500/80';
        iconSvg = `<svg class="w-4 h-4 text-blue-400 glow-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border ${borderClass} bg-slate-900/90 backdrop-blur-md shadow-2xl text-slate-100 text-xs font-semibold pointer-events-auto toast-slide-in`;
    toast.innerHTML = `
        <div class="flex-shrink-0">${iconSvg}</div>
        <div class="flex-1">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ================= SIMULADOR DE NOTIFICACIONES (PROCESO 6.0) =================
let notifiedBookings = JSON.parse(sessionStorage.getItem('tutores_online_notified_bookings') || '[]');

function loadNotifications() {
    if (!state.username) return [];
    const stored = localStorage.getItem(`tutores_online_notifications_${state.username}`);
    return stored ? JSON.parse(stored) : [];
}

function saveNotifications(notifs) {
    if (!state.username) return;
    localStorage.setItem(`tutores_online_notifications_${state.username}`, JSON.stringify(notifs));
}

function addNotification(text, link) {
    if (!state.username) return;
    const notifs = loadNotifications();
    notifs.push({
        id: 'NOTIF-' + Date.now(),
        text: text,
        link: link,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        read: false
    });
    saveNotifications(notifs);
    updateNotifBellUI();
}

function updateNotifBellUI() {
    const badge = document.getElementById('notif-badge');
    const listEl = document.getElementById('notif-list');
    if (!badge || !listEl) return;
    
    if (!state.username || state.role !== 'student') {
        badge.classList.add('hidden');
        listEl.innerHTML = '<p class="text-slate-500 text-center py-4">Ingresa como estudiante para ver notificaciones.</p>';
        return;
    }
    
    const notifs = loadNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    
    if (notifs.length === 0) {
        listEl.innerHTML = '<p class="text-slate-500 text-center py-4">No tienes notificaciones pendientes.</p>';
        return;
    }
    
    listEl.innerHTML = '';
    [...notifs].reverse().forEach(n => {
        const item = document.createElement('div');
        item.className = `p-2.5 rounded-xl border transition-all ${n.read ? 'bg-slate-950/40 border-slate-900' : 'bg-purple-950/20 border-purple-500/20'}`;
        item.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <p class="text-[11px] text-slate-200 leading-tight">${n.text}</p>
                <span class="text-[8px] text-slate-550 font-mono flex-shrink-0">${n.timestamp}</span>
            </div>
            ${n.link && n.link !== '#' ? `<a href="${n.link}" target="_blank" class="inline-block mt-1 text-[10px] text-purple-400 hover:text-purple-300 font-bold underline">Ir a la clase</a>` : ''}
        `;
        listEl.appendChild(item);
    });
}

function checkNotificationsSimulation() {
    if (state.role !== 'student' || !state.username) {
        updateNotifBellUI();
        return;
    }
    
    // Recargar bookings de forma aislada y sincronizar desde global
    syncBookingsFromGlobal();
    
    const acceptedBookings = state.studentBookings.filter(b => b.status === 'accepted');
    
    acceptedBookings.forEach(booking => {
        if (!notifiedBookings.includes(booking.id)) {
            // Registrar como notificada
            notifiedBookings.push(booking.id);
            sessionStorage.setItem('tutores_online_notified_bookings', JSON.stringify(notifiedBookings));
            
            // Crear notificación
            const text = `Faltan 15 minutos para tu sesión de ${booking.subject} con ${booking.tutorName}. Enlace listo.`;
            addNotification(text, booking.videoLink || '#');
            
            // Lanzar Toast
            showToast("Faltan 15 minutos para tu sesión. Enlace listo.", "warning");
        }
    });
    
    updateNotifBellUI();
}

// ================= RELOJ EN VIVO =================
function startClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    
    const updateTime = () => {
        const now = new Date();
        const options = { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        };
        clockEl.textContent = now.toLocaleDateString('es-ES', options);
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// ================= AUTENTICACIÓN Y VALIDACIÓN (3 ROLES) =================
function checkUserSession() {
    const sessionRole = sessionStorage.getItem('tutores_online_role');
    const sessionUser = sessionStorage.getItem('tutores_online_username');
    const sessionTutorId = sessionStorage.getItem('tutores_online_tutorId');

    const authWrapper = document.getElementById('auth-wrapper');
    const appWrapper = document.getElementById('app-wrapper');
    const roleBadge = document.getElementById('sidebar-role-badge');

    const studentNav = document.getElementById('sidebar-student-nav');
    const tutorNav = document.getElementById('sidebar-tutor-nav');
    const adminNav = document.getElementById('sidebar-admin-nav');

    if (sessionRole && sessionUser) {
        state.role = sessionRole;
        state.username = sessionUser;
        state.tutorId = sessionTutorId;

        authWrapper.classList.add('hidden');
        appWrapper.classList.remove('hidden');
        appWrapper.classList.add('flex');

        studentNav.classList.add('hidden');
        tutorNav.classList.add('hidden');
        adminNav.classList.add('hidden');

        if (state.role === 'student') {
            roleBadge.textContent = "Estudiante";
            roleBadge.className = "text-[10px] text-blue-400 font-bold tracking-widest uppercase";
            studentNav.classList.remove('hidden');
            loadStudentBalance();
            loadStudentBookings();
            loadStudentTransactions();
            syncBookingsFromGlobal();
            switchTab('student-dashboard');
        } else if (state.role === 'tutor') {
            roleBadge.textContent = "Tutor / Profesor";
            roleBadge.className = "text-[10px] text-purple-400 font-bold tracking-widest uppercase";
            tutorNav.classList.remove('hidden');
            switchTab('tutor-dashboard');
        } else if (state.role === 'admin') {
            roleBadge.textContent = "Administrador";
            roleBadge.className = "text-[10px] text-rose-400 font-bold tracking-widest uppercase";
            adminNav.classList.remove('hidden');
            switchTab('admin-dashboard');
        }
    } else {
        state.role = null;
        state.username = null;
        state.tutorId = null;
        authWrapper.classList.remove('hidden');
        appWrapper.classList.add('hidden');
        appWrapper.classList.remove('flex');
    }
    updateNotifBellUI();
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedUsers = localStorage.getItem('tutores_online_users');
    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    }
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');
    const errorMsgEl = document.getElementById('login-error-msg');

    const username = userEl.value.trim().toLowerCase();
    const password = passEl.value;

    const user = state.users.find(u => u.username === username && u.password === password);

    if (user) {
        // Validar si es un tutor en estado pendiente de aprobación
        if (user.role === 'tutor' && user.tutorId) {
            const tutorProfile = state.tutors.find(t => t.id === user.tutorId);
            if (tutorProfile && tutorProfile.status === 'pending') {
                errorMsgEl.textContent = "Tu perfil docente está 'Pendiente de Verificación'. El Administrador debe revisarlo primero.";
                errorMsgEl.classList.remove('hidden');
                showToast("Acceso denegado: Perfil en revisión.", "warning");
                return;
            } else if (tutorProfile && tutorProfile.status === 'rejected') {
                errorMsgEl.textContent = "Tu perfil fue rechazado. Diploma o documentos falsificados.";
                errorMsgEl.classList.remove('hidden');
                showToast("Acceso denegado: Perfil rechazado.", "danger");
                return;
            }
        }

        errorMsgEl.classList.add('hidden');
        sessionStorage.setItem('tutores_online_role', user.role);
        sessionStorage.setItem('tutores_online_username', user.username);
        if (user.tutorId) {
            sessionStorage.setItem('tutores_online_tutorId', user.tutorId);
        } else {
            sessionStorage.removeItem('tutores_online_tutorId');
        }

        showToast(`Ingreso correcto. Bienvenido, ${user.name || user.username}.`, "success");
        userEl.value = '';
        passEl.value = '';
        checkUserSession();
    } else {
        errorMsgEl.textContent = "Usuario o contraseña incorrectos. Inténtalo de nuevo.";
        errorMsgEl.classList.remove('hidden');
        showToast("Credenciales inválidas.", "danger");
    }
}

function handleLogout() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        sessionStorage.removeItem('tutores_online_role');
        sessionStorage.removeItem('tutores_online_username');
        sessionStorage.removeItem('tutores_online_tutorId');
        sessionStorage.removeItem('tutores_online_notified_bookings');

        // Reset state properties
        state.role = null;
        state.username = null;
        state.tutorId = null;
        state.studentBalance = 100.00;
        state.studentBookings = [];
        state.studentTransactions = [];

        showToast("Sesión cerrada correctamente.", "info");
        checkUserSession();
    }
}

// ================= REGISTRO DINÁMICO (RF01) =================
function setupRegisterForm() {
    const rolesRadio = document.getElementsByName('reg-role');
    const tutorFields = document.getElementById('tutor-fields');

    // Escuchar cambios de rol en el registro
    rolesRadio.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'tutor') {
                tutorFields.classList.remove('hidden');
                // Hacer requeridos los campos de tutor
                document.getElementById('reg-subject').required = true;
                document.getElementById('reg-price').required = true;
                document.getElementById('reg-bio').required = true;
                document.getElementById('reg-diploma').required = true;
            } else {
                tutorFields.classList.add('hidden');
                document.getElementById('reg-subject').required = false;
                document.getElementById('reg-price').required = false;
                document.getElementById('reg-bio').required = false;
                document.getElementById('reg-diploma').required = false;
            }
        });
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const role = document.querySelector('input[name="reg-role"]:checked').value;
        const name = document.getElementById('reg-name').value.trim();
        const username = document.getElementById('reg-username').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;

        // Validar si el usuario ya existe
        if (state.users.some(u => u.username === username)) {
            showToast("El nombre de usuario ya está registrado.", "danger");
            return;
        }

        if (role === 'student') {
            const newUser = { username, password, role, name };
            state.users.push(newUser);
            saveUsers();
            showToast("Registro exitoso. Ya puedes ingresar al portal.", "success");
            toggleRegisterCard(false);
        } else {
            // Tutor registro -> Pendiente de aprobación
            const subject = document.getElementById('reg-subject').value.trim();
            const price = parseFloat(document.getElementById('reg-price').value);
            const level = document.getElementById('reg-level').value;
            const modality = document.getElementById('reg-modality').value;
            const bio = document.getElementById('reg-bio').value.trim();
            const diploma = document.getElementById('reg-diploma').value.trim();

            const newTutorId = 'TUT-' + Date.now();
            
            // Siglas del nombre
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TR';
            const gradients = ['from-blue-600 to-cyan-500', 'from-pink-500 to-indigo-500', 'from-amber-500 to-yellow-500', 'from-purple-600 to-pink-500'];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

            const newTutorProfile = {
                id: newTutorId,
                name: name,
                subject: subject,
                price: price,
                rating: 5.0,
                status: 'pending', // PROCESO 1.0: Bloqueado en revisión
                initials: initials,
                gradient: randomGradient,
                level: level,
                modality: modality,
                bio: bio,
                diploma: diploma,
                hours: 0,
                earnings: 0.00,
                online: false,
                reviews: [],
                schedules: ['Lun 10:00-12:00', 'Jue 14:00-16:00']
            };

            const newUser = {
                username,
                password,
                role,
                tutorId: newTutorId,
                name: name
            };

            state.users.push(newUser);
            state.tutors.push(newTutorProfile);
            saveUsers();
            saveTutors();

            showToast("Perfil enviado a revisión. Un Administrador revisará tus documentos antes de permitir tu acceso.", "warning");
            toggleRegisterCard(false);
        }

        document.getElementById('register-form').reset();
        tutorFields.classList.add('hidden');
    });
}

function toggleRegisterCard(show = true) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const errorMsgEl = document.getElementById('login-error-msg');
    
    errorMsgEl.classList.add('hidden');
    if (show) {
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
        registerCard.classList.add('flex');
    } else {
        registerCard.classList.add('hidden');
        registerCard.classList.remove('flex');
        loginCard.classList.remove('hidden');
    }
}

// ================= RUTEADOR / SPA NAVIGATION =================
function switchTab(tabId) {
    const navButtons = document.querySelectorAll('aside nav button');
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active-tab-btn');
        } else {
            btn.classList.remove('active-tab-btn');
        }
    });

    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => {
        if (section.id === `${tabId}-section`) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });

    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    if (tabId === 'student-dashboard') {
        pageTitle.textContent = "Dashboard de Alumno";
        pageSubtitle.textContent = "Tus tutorías universitarias agendadas en tiempo real.";
        renderStudentDashboard();
    } else if (tabId === 'buscar-tutor') {
        pageTitle.textContent = "Directorio de Docentes";
        pageSubtitle.textContent = "Encuentra el tutor ideal con filtros de nivel y reputación.";
        renderTutors();
    } else if (tabId === 'mi-caja') {
        pageTitle.textContent = "Mi Caja Académica";
        pageSubtitle.textContent = "Gestiona tus fondos universitarios y canjea cupones de saldo.";
        renderMiCaja();
    } else if (tabId === 'evaluar-sesiones') {
        pageTitle.textContent = "Evaluaciones de Calidad";
        pageSubtitle.textContent = "Califica tus sesiones y ayuda a mejorar el promedio del tutor.";
        renderEvaluarSesiones();
    } else if (tabId === 'tutor-dashboard') {
        pageTitle.textContent = "Panel del Docente";
        pageSubtitle.textContent = "Monitorea tus ingresos del 90% y tus horas completadas.";
        renderTutorDashboard();
    } else if (tabId === 'solicitudes-clases') {
        pageTitle.textContent = "Solicitudes Académicas";
        pageSubtitle.textContent = "Gestiona tus clases agendadas y notificaciones inmediatas Uber.";
        renderSolicitudesClases();
    } else if (tabId === 'tutor-ajustes') {
        pageTitle.textContent = "Ajustes de Perfil";
        pageSubtitle.textContent = "Configura tus horarios disponibles, tarifa por hora y modalidad.";
        renderTutorAjustes();
    } else if (tabId === 'admin-dashboard') {
        pageTitle.textContent = "Panel de Administración";
        pageSubtitle.textContent = "Resumen de rentabilidad, comisiones del 10% y usuarios.";
        renderAdminDashboard();
    } else if (tabId === 'admin-verification') {
        pageTitle.textContent = "Verificación de Títulos (Proceso 1.0)";
        pageSubtitle.textContent = "Valida diplomas y aprueba o rechaza perfiles de tutores.";
        renderAdminVerification();
    }

    closeMobileSidebar();
}

function openMobileSidebar() {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}

// ================= LÓGICA ESTUDIANTE: DASHBOARD Y COORDINACIÓN =================
function renderStudentDashboard() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedUsers = localStorage.getItem('tutores_online_users');
    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    }
    syncBookingsFromGlobal();
    loadStudentBalance();

    const studentWelcome = document.getElementById('student-welcome-container');
    if (studentWelcome) {
        const currentUser = state.users.find(u => u.username === state.username);
        const displayName = currentUser ? currentUser.name : state.username;
        studentWelcome.innerHTML = `
            <h2 class="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight text-glow-neon pb-2">
                Bienvenido de nuevo, ${displayName} <span class="text-slate-400 font-normal">•</span> <span class="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold ml-1 inline-block glow-blue">Estudiante</span>
            </h2>
        `;
    }

    document.getElementById('metric-student-classes').textContent = state.studentBookings.filter(b => b.status === 'accepted').length;
    document.getElementById('metric-student-balance').textContent = state.studentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const listEl = document.getElementById('student-upcoming-classes-list');
    const emptyEl = document.getElementById('student-upcoming-classes-empty');
    listEl.innerHTML = '';

    // Filtrar tutorías vigentes (pending o accepted)
    const activeBookings = state.studentBookings.filter(b => b.status === 'pending' || b.status === 'accepted');

    if (activeBookings.length === 0) {
        emptyEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    activeBookings.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'py-5 flex flex-col lg:flex-row gap-5 border-b border-slate-900 last:border-0';
        
        let statusBadge = '';
        let interactionHtml = '';

        if (booking.status === 'pending') {
            statusBadge = `<span class="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Pendiente de Aceptación</span>`;
        } else if (booking.status === 'accepted') {
            statusBadge = `<span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Clase Confirmada</span>`;
            
            // Coordinación Presencial vs Virtual
            if (booking.modality === 'virtual') {
                interactionHtml = `
                    <div class="mt-3 flex items-center gap-3">
                        <button onclick="joinVideoConference('${booking.id}')" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            <span>Unirse a la Videoconferencia</span>
                        </button>
                        <span class="text-[10px] text-slate-500 font-mono">${booking.videoLink}</span>
                    </div>
                `;
            } else {
                interactionHtml = `
                    <div class="mt-3 space-y-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">📍 Punto de Encuentro Fisico</span>
                        <div class="mock-map p-4 flex flex-col justify-end">
                            <div class="mock-map-route"></div>
                            <div class="mock-map-pin" style="top: 45%; left: 48%;">
                                <div class="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center border border-white/20 shadow-lg glow-rose">
                                    <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 0L10 18.9 5.05 14.05zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                                </div>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-2 rounded-xl backdrop-blur-sm z-10 w-fit">
                                <p class="text-[10px] font-bold text-white leading-tight">${booking.location}</p>
                                <p class="text-[8px] text-slate-450 mt-0.5">Indicaciones: Ubicación fija en el campus universitario</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Botón para finalizar sesión y evaluarla
        const finishActionBtn = booking.status === 'accepted' ? 
            `<button onclick="finishSession('${booking.id}')" class="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center gap-1">
                Completar y Evaluar
             </button>` : '';

        item.innerHTML = `
            <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2.5">
                    <h4 class="font-extrabold text-white text-sm md:text-base">Tutoría de ${booking.subject}</h4>
                    ${statusBadge}
                </div>
                <p class="text-xs text-slate-450">Tutor asignado: <span class="text-slate-250 font-bold">${booking.tutorName}</span></p>
                <div class="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
                    <span class="flex items-center gap-1"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${booking.date}</span>
                    <span class="flex items-center gap-1"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>${booking.time} hs</span>
                    <span class="flex items-center gap-1 font-bold text-purple-400 uppercase">[${booking.modality}]</span>
                </div>
                ${interactionHtml}
            </div>
            <div class="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-slate-900 pt-3.5 lg:pt-0">
                <div class="text-right">
                    <p class="text-[9px] text-slate-550 uppercase font-black">Costo de Clase</p>
                    <p class="text-base font-black text-white">$${booking.price.toFixed(2)}</p>
                </div>
                ${finishActionBtn}
            </div>
        `;
        listEl.appendChild(item);
    });
}

window.joinVideoConference = function(bookingId) {
    const booking = state.studentBookings.find(b => b.id === bookingId);
    if (!booking) return;
    showToast("Abriendo enlace de Google Meet para videoconferencia...", "info");
    window.open(booking.videoLink, '_blank');
};

window.finishSession = function(bookingId) {
    const bookingIndex = state.studentBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;

    state.studentBookings[bookingIndex].status = 'completed'; // PROCESO 5.0: Completada
    saveStudentBookings();

    showToast("Clase finalizada correctamente. Por favor, califica al tutor.", "success");
    switchTab('evaluar-sesiones');
};

// ================= LÓGICA ESTUDIANTE: BUSCAR TUTOR Y FILTROS =================
function renderTutors() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const gridEl = document.getElementById('tutors-grid');
    const emptyEl = document.getElementById('tutors-empty');
    gridEl.innerHTML = '';

    const query = document.getElementById('search-tutor').value.trim().toLowerCase();
    const level = document.getElementById('filter-level').value;
    const modality = document.getElementById('filter-modality').value;
    const maxPrice = parseFloat(document.getElementById('filter-price').value);
    const minRating = parseFloat(document.getElementById('filter-rating').value);

    // Listar únicamente tutores aprobados ('active')
    const list = state.tutors.filter(t => t.status === 'active');

    const filtered = list.filter(tutor => {
        const matchesQuery = tutor.name.toLowerCase().includes(query) || tutor.subject.toLowerCase().includes(query);
        const matchesLevel = level === 'Todos' || tutor.level === level;
        const matchesModality = modality === 'Todos' || tutor.modality === modality || tutor.modality === 'both';
        const matchesPrice = tutor.price <= maxPrice;
        const matchesRating = tutor.rating >= minRating;

        return matchesQuery && matchesLevel && matchesModality && matchesPrice && matchesRating;
    });

    if (filtered.length === 0) {
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');

    filtered.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 backdrop-blur-md shadow flex flex-col justify-between group';

        const starRatingHtml = tutor.rating.toFixed(1) + ' ⭐';
        const onlineBadge = tutor.online ? 
            `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-emerald"></span>
             <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">En Línea</span>` :
            `<span class="w-2 h-2 rounded-full bg-slate-650"></span>
             <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fuera de Línea</span>`;

        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr ${tutor.gradient} flex items-center justify-center font-bold text-white border border-white/10 shadow shadow-purple-500/10">
                            ${tutor.initials}
                        </div>
                        <div>
                            <h4 class="font-extrabold text-sm text-white tracking-tight leading-tight">${tutor.name}</h4>
                            <span class="text-[10px] text-slate-400 font-bold block mt-0.5">${tutor.subject}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 bg-slate-950/70 border border-slate-850 px-2 py-1 rounded-xl">
                        ${onlineBadge}
                    </div>
                </div>

                <div class="space-y-2 mb-5 text-[11px] border-b border-slate-900 pb-3">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-550 uppercase tracking-wider font-bold">Nivel</span>
                        <span class="text-slate-300 font-semibold">${tutor.level}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-550 uppercase tracking-wider font-bold">Modalidad</span>
                        <span class="text-slate-300 font-semibold uppercase">${tutor.modality === 'both' ? 'Virtual / Presencial' : tutor.modality}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-550 uppercase tracking-wider font-bold">Reputación</span>
                        <span class="font-bold text-amber-400">${starRatingHtml}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between gap-3 border-t border-slate-900/60 pt-4">
                <div>
                    <span class="block text-[8px] text-slate-550 uppercase font-black">Precio / Hr</span>
                    <span class="text-base font-black text-white">$${tutor.price.toFixed(2)}</span>
                </div>
                <button onclick="openTutorDetailModal('${tutor.id}')" class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95">
                    Ver Perfil / Reservar
                </button>
            </div>
        `;
        gridEl.appendChild(card);
    });
}

// ================= MODAL DETALLADO DE TUTOR Y RESERVAS =================
let activeModalTutorId = null;

window.openTutorDetailModal = function(tutorId) {
    // Reload tutors from LocalStorage for live reviews synchronization
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }
    const tutor = state.tutors.find(t => t.id === tutorId);
    if (!tutor) return;

    activeModalTutorId = tutorId;

    document.getElementById('modal-tutor-badge').textContent = tutor.initials;
    document.getElementById('modal-tutor-badge').className = `w-14 h-14 rounded-2xl bg-gradient-to-tr ${tutor.gradient} flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/10`;
    document.getElementById('modal-tutor-name').textContent = tutor.name;
    document.getElementById('modal-tutor-subject').textContent = tutor.subject;
    document.getElementById('modal-tutor-bio').textContent = tutor.bio || "Experto docente con gran trayectoria académica.";
    document.getElementById('modal-tutor-diploma').textContent = tutor.diploma || "Título académico certificado por la plataforma.";
    document.getElementById('modal-tutor-stars').textContent = tutor.rating.toFixed(1) + ' ⭐';
    document.getElementById('modal-tutor-price').textContent = `$${tutor.price.toFixed(2)}/hr`;
    document.getElementById('modal-tutor-modality').textContent = tutor.modality === 'both' ? 'Híbrido' : tutor.modality;

    // Configurar el selector de modalidades para la clase
    const bookingModSelect = document.getElementById('booking-modality');
    bookingModSelect.innerHTML = '';

    if (tutor.modality === 'virtual' || tutor.modality === 'both') {
        bookingModSelect.innerHTML += `<option value="virtual">Virtual (Videoconferencia)</option>`;
    }
    if (tutor.modality === 'presencial' || tutor.modality === 'both') {
        bookingModSelect.innerHTML += `<option value="presencial">Presencial (Campus Físico)</option>`;
    }

    // Configurar botón Uber según disponibilidad
    const uberBtn = document.getElementById('book-uber-btn');
    if (tutor.online) {
        uberBtn.disabled = false;
        uberBtn.textContent = "Solicitar Ya";
        uberBtn.className = "w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs transition-all active:scale-95";
    } else {
        uberBtn.disabled = true;
        uberBtn.textContent = "Desconectado";
        uberBtn.className = "w-full sm:w-auto px-5 py-3 bg-slate-800 text-slate-500 rounded-xl font-bold text-xs cursor-not-allowed";
    }

    // Renderizar reseñas históricas del tutor
    renderModalReviews(tutor.reviews);

    // Resetear formulario de reserva
    document.getElementById('booking-date').value = '';
    document.getElementById('booking-time').value = '';

    // Mostrar modal
    document.getElementById('tutor-detail-modal').classList.remove('hidden');
};

function closeModal() {
    document.getElementById('tutor-detail-modal').classList.add('hidden');
    activeModalTutorId = null;
}

function renderModalReviews(reviews) {
    const listEl = document.getElementById('modal-reviews-list');
    const emptyEl = document.getElementById('modal-reviews-empty');
    listEl.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        emptyEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    reviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-1.5';
        item.innerHTML = `
            <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-300">${review.studentName}</span>
                <div class="flex items-center gap-1.5">
                    <span class="text-amber-400 font-bold">${review.stars.toFixed(0)} ★</span>
                    <span class="text-slate-550 font-medium font-mono">${review.date}</span>
                </div>
            </div>
            <p class="text-slate-400 text-xs italic leading-relaxed">"${review.comment}"</p>
        `;
        listEl.appendChild(item);
    });
}

// ================= RESERVAS DE ESTUDIANTE (LÓGICA RF14, RF12) =================
function handleBookingSubmit(type) {
    if (!activeModalTutorId) return;
    const tutor = state.tutors.find(t => t.id === activeModalTutorId);
    if (!tutor) return;

    let date = '';
    let time = '';
    let modality = 'virtual';

    if (type === 'scheduled') {
        date = document.getElementById('booking-date').value;
        time = document.getElementById('booking-time').value;
        modality = document.getElementById('booking-modality').value;

        if (!date || !time) {
            showToast("Por favor, selecciona una fecha y hora válida.", "warning");
            return;
        }
    } else {
        // Reserva Uber
        date = new Date().toISOString().split('T')[0];
        const now = new Date();
        time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        modality = 'virtual'; // Por defecto ayuda Uber es virtual
    }

    // 1. Validar Saldo Disponible (RF14)
    if (state.studentBalance < tutor.price) {
        showToast(`Saldo Insuficiente. La clase cuesta $${tutor.price.toFixed(2)} y tienes $${state.studentBalance.toFixed(2)}.`, 'danger');
        return;
    }

    // 2. Descontar Saldo
    state.studentBalance -= tutor.price;
    saveStudentBalance();

    // 3. Registrar transacción
    const now = new Date();
    const timestampStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ', ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const newTx = {
        id: 'TX-' + Date.now(),
        type: 'booking',
        description: `Pago Tutoría ${tutor.subject} (${tutor.name})`,
        amount: -tutor.price,
        timestamp: timestampStr,
        status: 'Completado'
    };
    state.studentTransactions.push(newTx);
    saveStudentTransactions();

    // 4. Sumar a rentabilidad global
    state.platformProfitability += tutor.price;
    savePlatformProfitability();

    // 5. Crear Reserva
    const meetId = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const videoLink = `https://meet.google.com/${meetId}`;
    const location = `Edificio de Ingeniería - Aula ${Math.floor(Math.random() * 8) + 101}`;

    const currentUser = state.users.find(u => u.username === state.username);
    const studentName = currentUser ? currentUser.name : state.username;

    const newBooking = {
        id: 'BKG-' + Date.now(),
        studentUsername: state.username,
        studentName: studentName,
        tutorId: tutor.id,
        tutorName: tutor.name,
        subject: tutor.subject,
        price: tutor.price,
        date: date,
        time: time,
        modality: modality,
        type: type,
        status: 'pending',
        videoLink: modality === 'virtual' ? videoLink : '',
        location: modality === 'presencial' ? location : ''
    };

    state.studentBookings.push(newBooking);
    saveStudentBookings();

    showToast(`¡Tutoría agendada con éxito! Solicitud enviada a la cola de ${tutor.name}.`, "success");
    
    closeModal();
    renderStudentDashboard();
}

// ================= LÓGICA ESTUDIANTE: MI CAJA =================
function renderMiCaja() {
    loadStudentTransactions();
    loadStudentBalance();

    const tbody = document.getElementById('student-history-tbody');
    const emptyEl = document.getElementById('student-history-empty');
    tbody.innerHTML = '';

    if (state.studentTransactions.length === 0) {
        emptyEl.classList.remove('hidden');
        tbody.closest('table').classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    tbody.closest('table').classList.remove('hidden');

    const reversed = [...state.studentTransactions].reverse();

    reversed.forEach(tx => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-850/50 border-b border-slate-900/40 transition-colors';

        const amountColor = tx.amount >= 0 ? 'text-emerald-400 font-bold' : 'text-slate-200 font-black';
        const sign = tx.amount >= 0 ? '+$' : '-$';
        const formattedAmount = sign + Math.abs(tx.amount).toFixed(2);

        const typeBadge = tx.type === 'recharge' 
            ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Recarga</span>'
            : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Clase</span>';

        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap text-slate-500 font-bold">${tx.timestamp}</td>
            <td class="px-4 py-3 font-bold text-white">${tx.description}</td>
            <td class="px-4 py-3">${typeBadge}</td>
            <td class="px-4 py-3 whitespace-nowrap text-right ${amountColor}">${formattedAmount}</td>
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                    ${tx.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleCouponSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('coupon-code');
    const code = input.value.trim().toUpperCase();
    
    let amount = 0;
    if (code === 'BIENVENIDA') {
        amount = 200.00;
    } else if (code === 'PROMO50') {
        amount = 50.00;
    }

    if (amount > 0) {
        state.studentBalance += amount;
        saveStudentBalance();

        const now = new Date();
        const timestampStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ', ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const newTx = {
            id: 'TX-' + Date.now(),
            type: 'recharge',
            description: `Canje de Cupón ${code}`,
            amount: amount,
            timestamp: timestampStr,
            status: 'Completado'
        };
        state.studentTransactions.push(newTx);
        saveStudentTransactions();

        showToast(`¡Cupón canjeado correctamente! Se acreditaron $${amount.toFixed(2)}.`, "success");
        input.value = '';
        renderMiCaja();
    } else {
        showToast("Cupón inválido. Intenta con BIENVENIDA o PROMO50.", "danger");
    }
}

// ================= LÓGICA ESTUDIANTE: EVALUAR SESIONES (PROCESO 5.0) =================
function renderEvaluarSesiones() {
    // Cargar dinámicamente desde LocalStorage de forma aislada y sincronizar
    syncBookingsFromGlobal();

    const listEl = document.getElementById('eval-sessions-list');
    const emptyEl = document.getElementById('eval-sessions-empty');
    listEl.innerHTML = '';

    // Filtrar clases con estado 'completed' que necesitan reseña
    const completedClasses = state.studentBookings.filter(b => b.status === 'completed');

    if (completedClasses.length === 0) {
        emptyEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        
        // Inhabilitar formulario
        document.getElementById('eval-form-container').className = "bg-slate-900/40 rounded-3xl border border-slate-850 p-6 backdrop-blur-md h-fit opacity-50 pointer-events-none";
        document.getElementById('eval-booking-id').value = '';
        document.getElementById('eval-tutor-name').value = '';
        document.getElementById('evaluation-form').reset();
        return;
    }

    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    completedClasses.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850 last:border-0';
        
        card.innerHTML = `
            <div>
                <p class="font-extrabold text-white text-sm">Sesión finalizada de ${booking.subject}</p>
                <p class="text-xs text-slate-450 mt-0.5">Tutor: <span class="font-bold text-slate-350">${booking.tutorName}</span></p>
                <p class="text-[10px] text-slate-500 font-medium mt-1">Dictada el ${booking.date} a las ${booking.time}</p>
            </div>
            <button onclick="selectSessionToEvaluate('${booking.id}')" class="px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95">
                Evaluar Sesión
            </button>
        `;
        listEl.appendChild(card);
    });
}

window.selectSessionToEvaluate = function(bookingId) {
    const booking = state.studentBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Habilitar Formulario
    document.getElementById('eval-form-container').className = "bg-slate-900/40 rounded-3xl border border-slate-850 p-6 backdrop-blur-md h-fit transition-all duration-300";
    document.getElementById('eval-booking-id').value = booking.id;
    document.getElementById('eval-tutor-name').value = booking.tutorName;
    document.getElementById('eval-comment').focus();
    
    showToast(`Formulario habilitado para evaluar a ${booking.tutorName}.`, "info");
};

function handleEvaluationSubmit(e) {
    e.preventDefault();
    // Reload data for synchronicity
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }
    syncBookingsFromGlobal();
    const bookingId = document.getElementById('eval-booking-id').value;
    const comment = document.getElementById('eval-comment').value.trim();
    const starsRadio = document.querySelector('input[name="stars"]:checked');

    if (!bookingId || !starsRadio) {
        showToast("Selecciona primero una tutoría e ingresa las estrellas.", "warning");
        return;
    }

    const stars = parseInt(starsRadio.value);
    const bookingIndex = state.studentBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;

    const booking = state.studentBookings[bookingIndex];
    const tutorIndex = state.tutors.findIndex(t => t.id === booking.tutorId);
    
    if (tutorIndex !== -1) {
        const tutor = state.tutors[tutorIndex];
        
        // Crear Reseña
        const newReview = {
            studentName: state.username || "Estudiante Anónimo",
            stars: stars,
            comment: comment,
            date: new Date().toISOString().split('T')[0]
        };

        if (!tutor.reviews) tutor.reviews = [];
        tutor.reviews.push(newReview);

        // Recalcular estrellas promedio
        const totalStars = tutor.reviews.reduce((sum, r) => sum + r.stars, 0);
        tutor.rating = totalStars / tutor.reviews.length;

        saveTutors();
    }

    // Actualizar estado de la reserva (evaluada / reviewed)
    state.studentBookings[bookingIndex].status = 'reviewed';
    saveStudentBookings();

    showToast("¡Evaluación enviada con éxito! Has calificado la sesión.", "success");
    
    // Resetear vistas
    renderEvaluarSesiones();
}

window.handleReportDispute = function() {
    const bookingId = document.getElementById('eval-booking-id').value;
    const comment = document.getElementById('eval-comment').value.trim();

    if (!bookingId) {
        showToast("Selecciona primero una tutoría para reportar.", "warning");
        return;
    }
    
    if (!comment) {
        showToast("Por favor, ingresa el motivo del reporte en el campo de Comentario.", "warning");
        return;
    }

    // Recargar datos desde LocalStorage de forma aislada y sincronizada
    syncBookingsFromGlobal();
    
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }
    loadStudentBalance();
    loadStudentTransactions();
    
    const storedProfit = localStorage.getItem('tutores_online_platform_profitability');
    if (storedProfit) {
        state.platformProfitability = parseFloat(storedProfit);
    }
    const storedCommissions = localStorage.getItem('tutores_online_platform_commissions');
    if (storedCommissions) {
        state.platformCommissions = parseFloat(storedCommissions);
    }

    const bookingIndex = state.studentBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;

    const booking = state.studentBookings[bookingIndex];

    if (booking.status === 'disputed') {
        showToast("Esta sesión ya ha sido reportada.", "warning");
        return;
    }

    // 1. Reversar comisiones e ingresos si fue previamente aceptada
    // Devolvemos booking.price al estudiante
    state.studentBalance += booking.price;
    saveStudentBalance();

    // 2. Registrar transacción de Reembolso
    const now = new Date();
    const timestampStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ', ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const refundTx = {
        id: 'TX-' + Date.now(),
        type: 'refund',
        description: `Reembolso por Disputa de Tutoría de ${booking.subject}`,
        amount: booking.price,
        timestamp: timestampStr,
        status: 'Completado'
    };
    state.studentTransactions.push(refundTx);
    saveStudentTransactions();

    // 3. Descontar de la rentabilidad global de la plataforma
    state.platformProfitability = Math.max(0, state.platformProfitability - booking.price);
    savePlatformProfitability();

    // 4. Reversar de las ganancias y horas del tutor
    const tutorIndex = state.tutors.findIndex(t => t.id === booking.tutorId);
    if (tutorIndex !== -1) {
        const netEarnings = booking.price * 0.90;
        state.tutors[tutorIndex].earnings = Math.max(0, state.tutors[tutorIndex].earnings - netEarnings);
        state.tutors[tutorIndex].hours = Math.max(0, state.tutors[tutorIndex].hours - 1);
        saveTutors();
    }

    // 5. Reversar de las comisiones cobradas por la plataforma
    const platformCut = booking.price * 0.10;
    state.platformCommissions = Math.max(0, state.platformCommissions - platformCut);
    savePlatformCommissions();

    // 6. Cambiar estado a 'disputed'
    booking.status = 'disputed';
    booking.disputeReason = comment;
    booking.disputeDate = timestampStr;
    saveStudentBookings();

    showToast("Problema grave reportado. Saldo reembolsado y caso enviado a moderación.", "success");

    // Limpiar formulario de evaluación
    document.getElementById('eval-booking-id').value = '';
    document.getElementById('eval-tutor-name').value = '';
    document.getElementById('eval-comment').value = '';
    document.getElementById('evaluation-form').reset();
    
    // Cambiar la clase del container para desactivarlo/opacarlo
    document.getElementById('eval-form-container').className = "bg-slate-900/40 rounded-3xl border border-slate-850 p-6 backdrop-blur-md h-fit opacity-50 pointer-events-none";

    // Volver a renderizar evaluación
    renderEvaluarSesiones();
};

// ================= LÓGICA TUTOR: DASHBOARD =================
function renderTutorDashboard() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedUsers = localStorage.getItem('tutores_online_users');
    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    }
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const tutor = state.tutors.find(t => t.id === state.tutorId);
    if (!tutor) return;

    const tutorWelcome = document.getElementById('tutor-welcome-container');
    if (tutorWelcome) {
        const currentUser = state.users.find(u => u.username === state.username);
        const displayName = currentUser ? currentUser.name : state.username;
        tutorWelcome.innerHTML = `
            <h2 class="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent tracking-tight text-glow-neon pb-2">
                Bienvenido de nuevo, ${displayName} <span class="text-slate-400 font-normal">•</span> <span class="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold ml-1 inline-block glow-purple">Tutor / Docente</span>
            </h2>
        `;
    }

    document.getElementById('metric-tutor-earnings').textContent = tutor.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('metric-tutor-hours').textContent = tutor.hours;
    document.getElementById('metric-tutor-rating').textContent = tutor.rating.toFixed(1);
}

// ================= LÓGICA TUTOR: BANDEJA DE SOLICITUDES =================
function renderSolicitudesClases() {
    const tutor = state.tutors.find(t => t.id === state.tutorId);
    if (!tutor) return;

    // Sincronizar Switch Uber
    const toggle = document.getElementById('uber-availability-toggle');
    toggle.checked = tutor.online;
    updateAvailabilityLabel(tutor.online);

    // Listas
    const scheduledListEl = document.getElementById('tutor-scheduled-requests-list');
    const scheduledEmptyEl = document.getElementById('tutor-scheduled-empty');
    const uberListEl = document.getElementById('tutor-uber-requests-list');
    const uberEmptyEl = document.getElementById('tutor-uber-empty');

    scheduledListEl.innerHTML = '';
    uberListEl.innerHTML = '';

    // Cargar dinámicamente desde LocalStorage global para sincronización total
    const globalBookings = loadGlobalBookings();

    // Filtrar solicitudes pendientes del tutor activo por ID, nombre de usuario o nombre completo
    const tutorBookings = globalBookings.filter(b => 
        (b.tutorId === tutor.id || b.tutorId === state.username || b.tutorName === tutor.name) && 
        b.status === 'pending'
    );

    const scheduledBookings = tutorBookings.filter(b => b.type === 'scheduled');
    const uberBookings = tutorBookings.filter(b => b.type === 'uber');

    // Contador insignias
    document.getElementById('badge-count-scheduled').textContent = scheduledBookings.length;
    document.getElementById('badge-count-uber').textContent = uberBookings.length;

    // Renderizar Programadas
    if (scheduledBookings.length === 0) {
        scheduledEmptyEl.classList.remove('hidden');
        scheduledListEl.classList.add('hidden');
    } else {
        scheduledEmptyEl.classList.add('hidden');
        scheduledListEl.classList.remove('hidden');

        scheduledBookings.forEach(booking => {
            const item = document.createElement('div');
            item.className = 'bg-slate-950/50 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3';
            
            const studentName = booking.studentName || 'Estudiante Regular';
            item.innerHTML = `
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-350">Alumno:</span>
                        <span class="text-xs font-black text-white">${studentName}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3.5 mt-1.5 text-[10px] text-slate-450 font-semibold">
                        <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Fecha: ${booking.date}</span>
                        <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Hora: ${booking.time} hs</span>
                        <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-purple-400 uppercase">[${booking.modality}]</span>
                        <span class="text-emerald-400 font-bold">$${booking.price.toFixed(2)}/hr</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 border-t border-slate-900/60 sm:border-0 pt-2.5 sm:pt-0">
                    <button onclick="respondToRequest('${booking.id}', 'accept')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow">Aceptar</button>
                    <button onclick="respondToRequest('${booking.id}', 'reject')" class="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 rounded-xl transition-all active:scale-95">Rechazar</button>
                </div>
            `;
            scheduledListEl.appendChild(item);
        });
    }

    // Renderizar Uber (Bajo Demanda)
    if (uberBookings.length === 0) {
        uberEmptyEl.classList.remove('hidden');
        uberListEl.classList.add('hidden');
    } else {
        uberEmptyEl.classList.add('hidden');
        uberListEl.classList.remove('hidden');

        uberBookings.forEach(booking => {
            const item = document.createElement('div');
            item.className = 'bg-purple-950/5 border border-purple-900/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm';
            
            const studentName = booking.studentName || 'Estudiante';
            item.innerHTML = `
                <div>
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse glow-purple"></span>
                        <span class="text-xs font-bold text-slate-350">¡Ayuda Emergencia de ${studentName}!</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3.5 mt-1.5 text-[10px] text-slate-450 font-semibold">
                        <span class="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">Clase Inmediata</span>
                        <span class="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400 font-bold">$${booking.price.toFixed(2)}/hr</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 border-t border-purple-900/10 sm:border-0 pt-2.5 sm:pt-0">
                    <button onclick="respondToRequest('${booking.id}', 'accept')" class="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow">Aceptar Alerta</button>
                    <button onclick="respondToRequest('${booking.id}', 'reject')" class="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 rounded-xl transition-all active:scale-95">Rechazar</button>
                </div>
            `;
            uberListEl.appendChild(item);
        });
    }
}

function handleAvailabilityToggle(e) {
    const online = e.target.checked;
    const tutorIndex = state.tutors.findIndex(t => t.id === state.tutorId);
    
    if (tutorIndex !== -1) {
        state.tutors[tutorIndex].online = online;
        saveTutors();
        updateAvailabilityLabel(online);
        
        if (online) {
            showToast("Disponibilidad Uber activa. Apareces En Línea para los alumnos.", "success");
        } else {
            showToast("Disponibilidad inactiva.", "info");
        }
    }
}

function updateAvailabilityLabel(online) {
    const label = document.getElementById('availability-status-label');
    if (!label) return;

    if (online) {
        label.className = "text-center text-xs font-black text-emerald-400 py-1.5 bg-emerald-500/10 rounded-lg max-w-[220px] mx-auto border border-emerald-500/20";
        label.textContent = "Estado: Disponible en Línea";
    } else {
        label.className = "text-center text-xs font-bold text-slate-500 py-1.5 bg-slate-900 border border-slate-850 rounded-lg max-w-[220px] mx-auto";
        label.textContent = "Estado: Desconectado";
    }
}

window.respondToRequest = function(bookingId, action) {
    let globalBookings = loadGlobalBookings();
    const bookingIndex = globalBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;

    const booking = globalBookings[bookingIndex];
    const tutorIndex = state.tutors.findIndex(t => t.id === state.tutorId);

    if (tutorIndex === -1) return;

    if (action === 'accept') {
        // Lógica de comisiones y cobro (RF14)
        // 90% para el tutor, 10% de comisión plataforma
        const netEarnings = booking.price * 0.90;
        const platformCut = booking.price * 0.10;

        state.tutors[tutorIndex].hours += 1;
        state.tutors[tutorIndex].earnings += netEarnings;
        state.platformCommissions += platformCut;

        globalBookings[bookingIndex].status = 'accepted';

        saveTutors();
        savePlatformCommissions();
        saveGlobalBookings(globalBookings);

        showToast(`¡Solicitud Aceptada! Ganaste $${netEarnings.toFixed(2)} por esta tutoría (Comisión 10% cobrada).`, "success");
    } else {
        // Rechazar clase
        globalBookings[bookingIndex].status = 'rejected';
        saveGlobalBookings(globalBookings);
        showToast("Solicitud de tutoría rechazada.", "info");
    }

    renderSolicitudesClases();
};

// ================= LÓGICA TUTOR: AJUSTES DE PERFIL =================
function renderTutorAjustes() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const tutor = state.tutors.find(t => t.id === state.tutorId);
    if (!tutor) return;

    document.getElementById('settings-price').value = tutor.price;
    document.getElementById('settings-modality').value = tutor.modality;
    document.getElementById('settings-schedule').value = tutor.schedules.join(', ');
}

function handleTutorSettingsSubmit(e) {
    e.preventDefault();

    const price = parseFloat(document.getElementById('settings-price').value);
    const modality = document.getElementById('settings-modality').value;
    const scheduleStr = document.getElementById('settings-schedule').value.trim();

    const tutorIndex = state.tutors.findIndex(t => t.id === state.tutorId);
    if (tutorIndex !== -1) {
        state.tutors[tutorIndex].price = price;
        state.tutors[tutorIndex].modality = modality;
        
        // Dividir horarios por comas
        state.tutors[tutorIndex].schedules = scheduleStr ? scheduleStr.split(',').map(s => s.trim()) : [];

        saveTutors();
        showToast("Ajustes de perfil docente actualizados correctamente.", "success");
        renderTutorAjustes();
    }
}

// ================= LÓGICA ADMINISTRADOR: DASHBOARD Y SOLICITUDES =================
function renderAdminDashboard() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedProfit = localStorage.getItem('tutores_online_platform_profitability');
    if (storedProfit) {
        state.platformProfitability = parseFloat(storedProfit);
    }
    const storedCommissions = localStorage.getItem('tutores_online_platform_commissions');
    if (storedCommissions) {
        state.platformCommissions = parseFloat(storedCommissions);
    }
    const storedUsers = localStorage.getItem('tutores_online_users');
    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    }
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const adminWelcome = document.getElementById('admin-welcome-container');
    if (adminWelcome) {
        const currentUser = state.users.find(u => u.username === state.username);
        const displayName = currentUser ? currentUser.name : state.username;
        adminWelcome.innerHTML = `
            <h2 class="text-xl md:text-2xl font-black bg-gradient-to-r from-rose-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-tight text-glow-neon pb-2">
                Bienvenido de nuevo, ${displayName} <span class="text-slate-400 font-normal">•</span> <span class="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold ml-1 inline-block glow-rose">Administrador</span>
            </h2>
        `;
    }

    document.getElementById('metric-admin-profit').textContent = state.platformProfitability.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('metric-admin-commissions').textContent = state.platformCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('metric-admin-users').textContent = state.users.length;

    const tbody = document.getElementById('admin-users-tbody');
    tbody.innerHTML = '';

    state.users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-850/40 border-b border-slate-900/40 transition-colors';
        
        let tutorStatusBadge = 'N/A';
        if (user.role === 'tutor' && user.tutorId) {
            const tutor = state.tutors.find(t => t.id === user.tutorId);
            if (tutor) {
                if (tutor.status === 'active') {
                    tutorStatusBadge = `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase text-[9px]">Verificado</span>`;
                } else if (tutor.status === 'pending') {
                    tutorStatusBadge = `<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 uppercase text-[9px]">Pendiente</span>`;
                } else {
                    tutorStatusBadge = `<span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 uppercase text-[9px]">Rechazado</span>`;
                }
            }
        }

        const roleText = user.role === 'admin' ? 'Administrador' : (user.role === 'student' ? 'Estudiante' : 'Tutor / Docente');

        row.innerHTML = `
            <td class="px-4 py-3 font-bold text-white">${user.name || 'Sin Nombre'}</td>
            <td class="px-4 py-3 font-mono text-slate-400">${user.username}</td>
            <td class="px-4 py-3 font-semibold text-slate-300">${roleText}</td>
            <td class="px-4 py-3 text-center">${tutorStatusBadge}</td>
        `;
        tbody.appendChild(row);
    });

    // Render de Disputas/Moderación
    const disputesTbody = document.getElementById('admin-disputes-tbody');
    const disputesEmpty = document.getElementById('admin-disputes-empty');
    if (disputesTbody && disputesEmpty) {
        disputesTbody.innerHTML = '';
        const globalBookings = loadGlobalBookings();
        const disputedBookings = globalBookings.filter(b => b.status === 'disputed');
        const tableEl = disputesTbody.closest('table');
        
        if (disputedBookings.length === 0) {
            disputesEmpty.classList.remove('hidden');
            if (tableEl) tableEl.classList.add('hidden');
        } else {
            disputesEmpty.classList.add('hidden');
            if (tableEl) tableEl.classList.remove('hidden');
            disputedBookings.forEach(booking => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-850/40 border-b border-slate-900/40 transition-colors disputed-row';
                row.innerHTML = `
                    <td class="px-4 py-3 font-mono text-slate-400 font-bold">${booking.id}</td>
                    <td class="px-4 py-3 font-semibold text-slate-350">${booking.subject}</td>
                    <td class="px-4 py-3 font-medium text-slate-200">${booking.tutorName}</td>
                    <td class="px-4 py-3 text-slate-400 font-mono">${booking.disputeDate || booking.date}</td>
                    <td class="px-4 py-3 text-slate-350 italic max-w-xs truncate" title="${booking.disputeReason || 'Sin motivo especificado'}">${booking.disputeReason || 'Sin motivo especificado'}</td>
                    <td class="px-4 py-3 text-center">
                        <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 uppercase text-[9px] glow-rose">Reembolsado</span>
                    </td>
                `;
                disputesTbody.appendChild(row);
            });
        }
    }
}

function renderAdminVerification() {
    // Cargar dinámicamente desde LocalStorage para sincronización total
    const storedTutors = localStorage.getItem('tutores_online_tutors');
    if (storedTutors) {
        state.tutors = JSON.parse(storedTutors);
    }

    const gridEl = document.getElementById('verification-requests-grid');
    const emptyEl = document.getElementById('verification-requests-empty');
    gridEl.innerHTML = '';

    // Filtrar tutores con estado 'pending'
    const pendingTutors = state.tutors.filter(t => t.status === 'pending');

    if (pendingTutors.length === 0) {
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');

    pendingTutors.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900/40 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between shadow';
        
        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center gap-3 pb-3.5 border-b border-slate-850">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${tutor.gradient} flex items-center justify-center font-bold text-white text-xs border border-white/10 shadow shadow-purple-500/10">
                        ${tutor.initials}
                    </div>
                    <div>
                        <h4 class="font-extrabold text-white text-sm leading-tight">${tutor.name}</h4>
                        <span class="text-[10px] text-purple-400 font-bold block mt-0.5">Asignatura: ${tutor.subject} | Nivel: ${tutor.level}</span>
                    </div>
                </div>

                <div class="space-y-2 text-xs">
                    <div>
                        <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Historial Formativo (Bio)</span>
                        <p class="text-slate-350 leading-relaxed italic mt-0.5">"${tutor.bio || 'Sin descripción'}"</p>
                    </div>
                    <div>
                        <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Título / Diploma Académico</span>
                        <p class="text-slate-300 font-semibold mt-0.5">📜 ${tutor.diploma || 'No especificado'}</p>
                    </div>
                    <div class="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <span class="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Tarifa Solicitada:</span>
                        <span class="text-sm font-black text-white">$${tutor.price.toFixed(2)}/hr</span>
                    </div>
                </div>
            </div>

            <div class="flex gap-2.5 border-t border-slate-850 pt-4 mt-4">
                <button onclick="verifyTutor('${tutor.id}', 'approve')" class="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95">Aprobar Perfil</button>
                <button onclick="verifyTutor('${tutor.id}', 'reject')" class="w-1/2 py-2 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-500 border border-rose-500/20 font-bold text-xs rounded-xl shadow transition-all active:scale-95">Rechazar</button>
            </div>
        `;
        gridEl.appendChild(card);
    });
}

window.verifyTutor = function(tutorId, action) {
    const tutorIndex = state.tutors.findIndex(t => t.id === tutorId);
    if (tutorIndex === -1) return;

    if (action === 'approve') {
        state.tutors[tutorIndex].status = 'active'; // Aprobado
        saveTutors();
        showToast(`Perfil de ${state.tutors[tutorIndex].name} verificado y activado.`, "success");
    } else {
        state.tutors[tutorIndex].status = 'rejected'; // Rechazado
        saveTutors();
        showToast(`Perfil de ${state.tutors[tutorIndex].name} rechazado.`, "info");
    }

    renderAdminVerification();
};

// ================= EVENT LISTENERS Y CONFIGURACIÓN GENERAL =================
function setupEventListeners() {
    // A. Autenticación
    document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // B. Link Registro
    document.getElementById('show-register-btn').addEventListener('click', () => { toggleRegisterCard(true); });
    document.getElementById('cancel-register-btn').addEventListener('click', () => { toggleRegisterCard(false); });
    setupRegisterForm();

    // C. SPA Navegación
    const navButtons = document.querySelectorAll('aside nav button');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // D. Menú Móvil
    document.getElementById('mobile-menu-btn').addEventListener('click', openMobileSidebar);
    document.getElementById('close-sidebar-btn').addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

    // E. Filtros de Búsqueda
    document.getElementById('search-tutor').addEventListener('input', () => { renderTutors(); });
    document.getElementById('filter-level').addEventListener('change', () => { renderTutors(); });
    document.getElementById('filter-modality').addEventListener('change', () => { renderTutors(); });
    document.getElementById('filter-rating').addEventListener('change', () => { renderTutors(); });
    
    const priceInput = document.getElementById('filter-price');
    priceInput.addEventListener('input', (e) => {
        document.getElementById('price-val-label').textContent = e.target.value;
        renderTutors();
    });

    // F. Botón de Alternancia de Panel de Filtros (Ocultar/Mostrar en pantallas pequeñas si es necesario)
    const toggleFilterBtn = document.getElementById('toggle-filter-panel-btn');
    const filterPanel = document.getElementById('filter-options-panel');
    toggleFilterBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });

    // G. Canje de Cupones
    document.getElementById('coupon-form').addEventListener('submit', handleCouponSubmit);

    // H. Formulario de Evaluación Académica
    document.getElementById('evaluation-form').addEventListener('submit', handleEvaluationSubmit);

    // I. Switch Disponibilidad Uber
    document.getElementById('uber-availability-toggle').addEventListener('change', handleAvailabilityToggle);

    // J. Modal Detalle: Botones
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    
    document.getElementById('book-scheduled-btn').addEventListener('click', () => {
        handleBookingSubmit('scheduled');
    });
    
    document.getElementById('book-uber-btn').addEventListener('click', () => {
        handleBookingSubmit('uber');
    });

    // K. Ajustes Perfil Tutor Form
    document.getElementById('tutor-settings-form').addEventListener('submit', handleTutorSettingsSubmit);

    // L. Campana de Notificaciones (Proceso 6.0)
    const bellBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    if (bellBtn && notifDropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            if (!notifDropdown.classList.contains('hidden')) {
                // Marcar todas como leídas
                const notifs = loadNotifications();
                notifs.forEach(n => n.read = true);
                saveNotifications(notifs);
                updateNotifBellUI();
            }
        });
        document.addEventListener('click', (e) => {
            if (!bellBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.add('hidden');
            }
        });
    }

    // M. Reporte de Problema Grave (Excepción Proceso 5.0)
    const reportBtn = document.getElementById('report-dispute-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', window.handleReportDispute);
    }
}

// ================= AL CARGAR LA PÁGINA =================
document.addEventListener('DOMContentLoaded', initApp);
