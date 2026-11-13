
(() => {
    "use strict";

    const THEME_KEY = "keury-portfolio-theme";

    // Selectores generales
    const $ = (selector, scope = document) =>
        scope.querySelector(selector);

    const $$ = (selector, scope = document) =>
        [...scope.querySelectorAll(selector)];


    // =========================================
    // 01. TEMA CLARO Y OSCURO
    // =========================================

    function initTheme() {
        const toggle = $("#theme-toggle");
        const icon = $("#theme-icon");

        if (!toggle || !icon) return;

        let theme = localStorage.getItem(THEME_KEY) === "light"
            ? "light"
            : "dark";

        function applyTheme(nextTheme) {
            theme = nextTheme;

            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;

            const themeColor = $('meta[name="theme-color"]');

            if (themeColor) {
                themeColor.setAttribute(
                    "content",
                    theme === "dark" ? "#0B0F14" : "#F1F4F7"
                );
            }

            localStorage.setItem(THEME_KEY, theme);

            const isDark = theme === "dark";

            icon.className = isDark
                ? "fa-solid fa-sun"
                : "fa-solid fa-moon";

            toggle.setAttribute(
                "aria-label",
                isDark
                    ? "Cambiar a tema claro"
                    : "Cambiar a tema oscuro"
            );

            toggle.setAttribute("aria-pressed", String(!isDark));
        }

        toggle.addEventListener("click", () => {
            applyTheme(theme === "dark" ? "light" : "dark");
        });

        applyTheme(theme);
    }


    // =========================================
    // 02. MENÚ RESPONSIVE
    // =========================================

    function initMobileMenu() {
        const menuToggle = $("#menuToggle");
        const navLinks = $("#navLinks");

        if (!menuToggle || !navLinks) return;

        const menuIcon = $("i", menuToggle);

        function closeMenu() {
            navLinks.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");

            if (menuIcon) {
                menuIcon.className = "fa-solid fa-bars";
            }
        }

        function toggleMenu() {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Cerrar menú" : "Abrir menú"
            );

            if (menuIcon) {
                menuIcon.className = isOpen
                    ? "fa-solid fa-xmark"
                    : "fa-solid fa-bars";
            }
        }

        menuToggle.addEventListener("click", toggleMenu);

        // Cerrar al seleccionar una sección
        $$(".nav-link", navLinks).forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        // Cerrar con Escape
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        // Cerrar al hacer clic fuera del menú
        document.addEventListener("click", (event) => {
            const clickedInsideMenu =
                navLinks.contains(event.target) ||
                menuToggle.contains(event.target);

            if (!clickedInsideMenu) {
                closeMenu();
            }
        });

        // Cerrar al volver a escritorio
        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) {
                closeMenu();
            }
        });
    }


    // =========================================
    // 03. NAVEGACIÓN Y SECCIÓN ACTIVA
    // =========================================

    function initNavigation() {
        const navbar = $("#navbar");

        const links = $$(".nav-links .nav-link[href^='#']");

        const sections = links
            .map((link) => {
                const id = link.getAttribute("href");
                return $(id);
            })
            .filter(Boolean);

        if (!links.length || !sections.length) return;

        function updateNavigation() {
            const activationPoint = Math.min(
                window.innerHeight * 0.35,
                220
            );

            let currentSection = sections[0];

            // Detectar la última sección que ha alcanzado
            // el punto de activación de la pantalla.
            sections.forEach((section) => {
                const position = section.getBoundingClientRect();

                if (position.top <= activationPoint) {
                    currentSection = section;
                }
            });

            // Si el usuario llega al final de la página,
            // activar siempre la última sección.
            const reachedBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 5;

            if (reachedBottom) {
                currentSection = sections[sections.length - 1];
            }

            // Actualizar el menú
            links.forEach((link) => {
                const isActive =
                    link.getAttribute("href") === `#${currentSection.id}`;

                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            // Efecto de la barra al desplazarse
            navbar?.classList.toggle(
                "is-scrolled",
                window.scrollY > 20
            );
        }

        // Actualizar al desplazarse
        window.addEventListener("scroll", updateNavigation, {
            passive: true
        });

        // Actualizar al cambiar el tamaño
        window.addEventListener("resize", updateNavigation);

        // Actualizar al cargar
        updateNavigation();

        // Actualizar después de navegar mediante un enlace
        links.forEach((link) => {
            link.addEventListener("click", () => {
                requestAnimationFrame(updateNavigation);
            });
        });
    }


    // =========================================
    // 04. ANIMACIONES DE APARICIÓN
    // =========================================

    function initRevealAnimations() {
        const elements = $$(".reveal");

        if (!("IntersectionObserver" in window)) {
            elements.forEach((element) => {
                element.classList.add("visible");
            });

            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    // El CSS utiliza .visible, no .is-visible.
                    entry.target.classList.add("visible");

                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12
            }
        );

        elements.forEach((element) => {
            observer.observe(element);
        });
    }


    // =========================================
    // 05. FORMULARIO DE CONTACTO
    // =========================================

    function initContactForm() {
        // El ID correcto en tu HTML es contactForm.
        const form = $("#contactForm");

        const feedback = $("#form-feedback");

        if (!form || !feedback) return;

        const feedbackText = $("span", feedback);

        const fields = $$("input, textarea", form);

        if (!feedbackText) return;

        // Mostrar y limpiar errores
        function validateField(field) {
            const errorMessage = field.parentElement.querySelector(
                ".field-error"
            );

            const isValid = field.checkValidity();

            field.classList.toggle("invalid", !isValid);

            field.setAttribute(
                "aria-invalid",
                String(!isValid)
            );

            if (errorMessage) {
                if (field.validity.valueMissing) {
                    errorMessage.textContent =
                        "Este campo es obligatorio.";
                } else if (field.validity.typeMismatch) {
                    errorMessage.textContent =
                        "Introduce un correo electrónico válido.";
                } else if (field.validity.tooShort) {
                    errorMessage.textContent =
                        `Introduce al menos ${field.minLength} caracteres.`;
                } else {
                    errorMessage.textContent = "";
                }
            }

            return isValid;
        }

        // Validar mientras el usuario escribe
        fields.forEach((field) => {
            field.addEventListener("input", () => {
                validateField(field);

                // Ocultar el mensaje anterior cuando se modifica
                // nuevamente el formulario.
                feedback.hidden = true;
            });

            field.addEventListener("blur", () => {
                if (field.value.trim() !== "") {
                    validateField(field);
                }
            });
        });

        // Procesar el formulario
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            feedback.hidden = true;

            let isValid = true;

            fields.forEach((field) => {
                const fieldIsValid = validateField(field);

                if (!fieldIsValid) {
                    isValid = false;
                }
            });

            // Si hay errores, enfocar el primer campo incorrecto
            if (!isValid) {
                form.querySelector(".invalid")?.focus();
                return;
            }

            const name = $("#name", form).value.trim();

            // Mostrar confirmación
            feedbackText.textContent =
                `¡Gracias, ${name}! Tu mensaje ha sido validado correctamente.`;

            feedback.classList.remove("error");
            feedback.hidden = false;

            // Limpiar los campos
            form.reset();

            fields.forEach((field) => {
                field.classList.remove("invalid");

                field.setAttribute("aria-invalid", "false");

                const errorMessage =
                    field.parentElement.querySelector(".field-error");

                if (errorMessage) {
                    errorMessage.textContent = "";
                }
            });

            // Llevar la atención a la confirmación
            feedback.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });
    }


    // =========================================
    // 06. INICIALIZACIÓN
    // =========================================

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initMobileMenu();
        initNavigation();
        initRevealAnimations();
        initContactForm();

        console.log("Portfolio KR: sistema inicializado correctamente.");
    });

})();
