/* =========================================================
   FlikTide Toast Notification System
   File: assets/js/ui/toast.js
   ========================================================= */

const Toast = (() => {

    /* =====================================================
       Configuration
       ===================================================== */

    const CONFIG = {
        position: "top-right",
        duration: 4000,
        maxVisible: 5,
        pauseOnHover: true,
        closeButton: true,
        progress: true,
        newestOnTop: true
    };


    /* =====================================================
       State
       ===================================================== */

    let container = null;
    let toastCounter = 0;

    const activeToasts = new Map();
    const queue = [];


    /* =====================================================
       Default Icons
       ===================================================== */

    const ICONS = {
        success: "✓",
        error: "!",
        warning: "!",
        info: "i",
        loading: "",
        default: "•"
    };


    /* =====================================================
       Initialize Container
       ===================================================== */

    function init(options = {}) {

        Object.assign(CONFIG, options);

        if (container) {
            updateContainerPosition();
            return container;
        }

        container = document.createElement("div");

        container.className =
            `toast-container ${CONFIG.position}`;

        container.setAttribute(
            "aria-live",
            "polite"
        );

        container.setAttribute(
            "aria-atomic",
            "false"
        );

        if (CONFIG.pauseOnHover) {
            container.classList.add("pause-on-hover");
        }

        document.body.appendChild(container);

        return container;
    }


    /* =====================================================
       Position
       ===================================================== */

    function updateContainerPosition() {

        if (!container) return;

        container.className =
            `toast-container ${CONFIG.position}`;

        if (CONFIG.pauseOnHover) {
            container.classList.add("pause-on-hover");
        }
    }


    /* =====================================================
       Escape HTML
       ===================================================== */

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent =
            value == null ? "" : String(value);

        return div.innerHTML;
    }


    /* =====================================================
       Create Toast
       ===================================================== */

    function create(options = {}) {

        init();

        const settings = {
            type: "info",
            title: "",
            message: "",
            duration: CONFIG.duration,
            icon: null,
            closeButton: CONFIG.closeButton,
            progress: CONFIG.progress,
            actionText: "",
            onAction: null,
            avatar: "",
            compact: false,
            large: false,
            pauseOnHover: CONFIG.pauseOnHover,
            ...options
        };

        const id =
            settings.id ||
            `toast-${Date.now()}-${++toastCounter}`;


        /* ---------------------------------------------
           Maximum visible limit
           --------------------------------------------- */

        if (activeToasts.size >= CONFIG.maxVisible) {

            const oldest =
                activeToasts.keys().next().value;

            if (oldest) {
                dismiss(oldest);
            }
        }


        /* ---------------------------------------------
           Toast Element
           --------------------------------------------- */

        const toast = document.createElement("article");

        toast.id = id;

        toast.className =
            `toast toast-${settings.type}`;

        if (settings.compact) {
            toast.classList.add("toast-compact");
        }

        if (settings.large) {
            toast.classList.add("toast-large");
        }


        toast.setAttribute(
            "role",
            settings.type === "error"
                ? "alert"
                : "status"
        );


        /* ---------------------------------------------
           Icon
           --------------------------------------------- */

        const iconValue =
            settings.icon ??
            ICONS[settings.type] ??
            ICONS.default;

        let iconHTML = "";

        if (settings.type === "loading") {

            iconHTML = `
                <span
                    class="toast-spinner"
                    aria-hidden="true">
                </span>
            `;

        } else {

            iconHTML = escapeHTML(iconValue);
        }


        /* ---------------------------------------------
           Avatar
           --------------------------------------------- */

        const avatarHTML =
            settings.avatar
                ? `
                    <img
                        class="toast-avatar"
                        src="${escapeHTML(settings.avatar)}"
                        alt="">
                  `
                : "";


        /* ---------------------------------------------
           Title
           --------------------------------------------- */

        const titleHTML =
            settings.title
                ? `
                    <h3 class="toast-title">
                        ${escapeHTML(settings.title)}
                    </h3>
                  `
                : "";


        /* ---------------------------------------------
           Message
           --------------------------------------------- */

        const messageHTML =
            settings.message
                ? `
                    <p class="toast-message">
                        ${escapeHTML(settings.message)}
                    </p>
                  `
                : "";


        /* ---------------------------------------------
           Action Button
           --------------------------------------------- */

        const actionHTML =
            settings.actionText
                ? `
                    <button
                        type="button"
                        class="toast-action"
                        data-toast-action>
                        ${escapeHTML(settings.actionText)}
                    </button>
                  `
                : "";


        /* ---------------------------------------------
           Close Button
           --------------------------------------------- */

        const closeHTML =
            settings.closeButton
                ? `
                    <button
                        type="button"
                        class="toast-close"
                        data-toast-close
                        aria-label="Close notification">
                        ×
                    </button>
                  `
                : "";


        /* ---------------------------------------------
           Progress
           --------------------------------------------- */

        const progressHTML =
            settings.progress &&
            settings.duration > 0
                ? `
                    <div class="toast-progress">
                        <div
                            class="toast-progress-bar"
                            style="animation-duration:${settings.duration}ms">
                        </div>
                    </div>
                  `
                : "";


        /* ---------------------------------------------
           Build Toast
           --------------------------------------------- */

        toast.innerHTML = `

            <span
                class="toast-icon"
                aria-hidden="true">
                ${iconHTML}
            </span>

            ${avatarHTML}

            <div class="toast-content">

                ${titleHTML}

                ${messageHTML}

                ${actionHTML}

            </div>

            ${closeHTML}

            ${progressHTML}
        `;


        /* ---------------------------------------------
           Insert
           --------------------------------------------- */

        if (CONFIG.newestOnTop) {

            container.prepend(toast);

        } else {

            container.appendChild(toast);
        }


        /* ---------------------------------------------
           Store State
           --------------------------------------------- */

        const state = {
            id,
            element: toast,
            settings,
            timer: null,
            remaining: settings.duration,
            startedAt: Date.now(),
            paused: false
        };

        activeToasts.set(id, state);


        /* ---------------------------------------------
           Close Button
           --------------------------------------------- */

        const closeButton =
            toast.querySelector("[data-toast-close]");

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => dismiss(id)
            );
        }


        /* ---------------------------------------------
           Action Button
           --------------------------------------------- */

        const actionButton =
            toast.querySelector("[data-toast-action]");

        if (actionButton) {

            actionButton.addEventListener(
                "click",
                async () => {

                    try {

                        if (
                            typeof settings.onAction ===
                            "function"
                        ) {

                            await settings.onAction({
                                id,
                                toast,
                                dismiss: () => dismiss(id)
                            });
                        }

                    } catch (error) {

                        console.error(
                            "FlikTide Toast action error:",
                            error
                        );
                    }
                }
            );
        }


        /* ---------------------------------------------
           Hover Pause
           --------------------------------------------- */

        if (
            settings.pauseOnHover &&
            settings.duration > 0
        ) {

            toast.addEventListener(
                "mouseenter",
                () => pause(id)
            );

            toast.addEventListener(
                "mouseleave",
                () => resume(id)
            );
        }


        /* ---------------------------------------------
           Start Timer
           --------------------------------------------- */

        if (settings.duration > 0) {

            startTimer(id);
        }


        /* ---------------------------------------------
           Dispatch Event
           --------------------------------------------- */

        document.dispatchEvent(
            new CustomEvent("fliktide:toast:show", {
                detail: {
                    id,
                    type: settings.type,
                    message: settings.message
                }
            })
        );


        return id;
    }


    /* =====================================================
       Start Timer
       ===================================================== */

    function startTimer(id) {

        const state =
            activeToasts.get(id);

        if (!state) return;

        clearTimeout(state.timer);

        state.startedAt = Date.now();

        state.timer = setTimeout(
            () => dismiss(id),
            state.remaining
        );
    }


    /* =====================================================
       Pause Toast
       ===================================================== */

    function pause(id) {

        const state =
            activeToasts.get(id);

        if (!state || state.paused) return;

        state.paused = true;

        const elapsed =
            Date.now() - state.startedAt;

        state.remaining =
            Math.max(
                0,
                state.remaining - elapsed
            );

        clearTimeout(state.timer);

        const progress =
            state.element.querySelector(
                ".toast-progress-bar"
            );

        if (progress) {
            progress.style.animationPlayState =
                "paused";
        }
    }


    /* =====================================================
       Resume Toast
       ===================================================== */

    function resume(id) {

        const state =
            activeToasts.get(id);

        if (!state || !state.paused) return;

        state.paused = false;

        const progress =
            state.element.querySelector(
                ".toast-progress-bar"
            );

        if (progress) {
            progress.style.animationPlayState =
                "running";
        }

        if (state.remaining <= 0) {

            dismiss(id);
            return;
        }

        startTimer(id);
    }


    /* =====================================================
       Dismiss Toast
       ===================================================== */

    function dismiss(id) {

        const state =
            activeToasts.get(id);

        if (!state) return;

        clearTimeout(state.timer);

        const toast =
            state.element;

        toast.classList.add(
            "is-leaving"
        );

        const removeToast = () => {

            if (toast.parentNode) {
                toast.remove();
            }

            activeToasts.delete(id);

            document.dispatchEvent(
                new CustomEvent(
                    "fliktide:toast:dismiss",
                    {
                        detail: { id }
                    }
                )
            );

            processQueue();
        };


        toast.addEventListener(
            "animationend",
            removeToast,
            { once: true }
        );


        /* Fallback */

        setTimeout(
            removeToast,
            300
        );
    }


    /* =====================================================
       Dismiss All
       ===================================================== */

    function dismissAll() {

        [
            ...activeToasts.keys()
        ].forEach(id => dismiss(id));

        queue.length = 0;
    }


    /* =====================================================
       Update Toast
       ===================================================== */

    function update(id, options = {}) {

        const state =
            activeToasts.get(id);

        if (!state) return false;

        const toast =
            state.element;

        const settings =
            state.settings;

        Object.assign(
            settings,
            options
        );


        /* Type */

        toast.className =
            `toast toast-${settings.type}`;

        if (settings.compact) {
            toast.classList.add("toast-compact");
        }

        if (settings.large) {
            toast.classList.add("toast-large");
        }


        /* Title */

        const title =
            toast.querySelector(
                ".toast-title"
            );

        if (title) {
            title.textContent =
                settings.title || "";
        }


        /* Message */

        const message =
            toast.querySelector(
                ".toast-message"
            );

        if (message) {
            message.textContent =
                settings.message || "";
        }


        return true;
    }


    /* =====================================================
       Promise Toast
       ===================================================== */

    async function promise(
        promiseObject,
        messages = {}
    ) {

        const id =
            loading(
                messages.loading ||
                "লোড হচ্ছে..."
            );

        try {

            const result =
                await promiseObject;

            update(
                id,
                {
                    type: "success",
                    title:
                        messages.successTitle ||
                        "সফল",
                    message:
                        messages.success ||
                        "কাজটি সফলভাবে সম্পন্ন হয়েছে।",
                    duration:
                        messages.duration ||
                        4000
                }
            );

            return result;

        } catch (error) {

            update(
                id,
                {
                    type: "error",
                    title:
                        messages.errorTitle ||
                        "সমস্যা হয়েছে",
                    message:
                        messages.error ||
                        error?.message ||
                        "কাজটি সম্পন্ন করা যায়নি।",
                    duration:
                        messages.duration ||
                        5000
                }
            );

            throw error;
        }
    }


    /* =====================================================
       Queue
       ===================================================== */

    function addToQueue(options) {

        queue.push(options);

        processQueue();
    }


    function processQueue() {

        while (
            queue.length &&
            activeToasts.size <
            CONFIG.maxVisible
        ) {

            const options =
                queue.shift();

            create(options);
        }
    }


    /* =====================================================
       Helper Methods
       ===================================================== */

    function success(
        message,
        options = {}
    ) {

        return create({
            ...options,
            type: "success",
            message
        });
    }


    function error(
        message,
        options = {}
    ) {

        return create({
            ...options,
            type: "error",
            message
        });
    }


    function warning(
        message,
        options = {}
    ) {

        return create({
            ...options,
            type: "warning",
            message
        });
    }


    function info(
        message,
        options = {}
    ) {

        return create({
            ...options,
            type: "info",
            message
        });
    }


    function loading(
        message = "লোড হচ্ছে...",
        options = {}
    ) {

        return create({
            ...options,
            type: "loading",
            message,
            duration: 0,
            closeButton:
                options.closeButton ?? false,
            progress: false
        });
    }


    /* =====================================================
       Public API
       ===================================================== */

    return {

        init,

        create,

        success,

        error,

        warning,

        info,

        loading,

        promise,

        pause,

        resume,

        update,

        dismiss,

        dismissAll,

        addToQueue,

        get(id) {
            return activeToasts.get(id);
        },

        getAll() {
            return [
                ...activeToasts.values()
            ];
        },

        setPosition(position) {

            CONFIG.position =
                position;

            updateContainerPosition();
        },

        configure(options = {}) {

            Object.assign(
                CONFIG,
                options
            );

            updateContainerPosition();
        }
    };

})();


/* =========================================================
   Global Export
   ========================================================= */

window.FlikTideToast = Toast;


/* =========================================================
   Auto Initialize
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => Toast.init()
    );

} else {

    Toast.init();
}


/* =========================================================
   ES Module Export
   ========================================================= */

export default Toast;
export { Toast };
