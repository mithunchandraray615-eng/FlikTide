/* =========================================================
   FlikTide — My Library
   File: library/library.js
   ========================================================= */


/* =========================================================
   1. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeLibrary();

});


/* =========================================================
   2. LIBRARY INITIALIZATION
   ========================================================= */

function initializeLibrary() {

    setupBackButton();

    setupKeyboardNavigation();

    setupLibraryCards();

    setupBottomNavigation();

}


/* =========================================================
   3. BACK BUTTON
   ========================================================= */

function setupBackButton() {

    const backButton =
        document.getElementById(
            "library-back-button"
        );

    if (!backButton) {
        return;
    }

    backButton.addEventListener(
        "click",
        () => {

            /*
             * Browser history ব্যবহার করে
             * আগের page-এ ফিরে যাবে।
             */

            if (window.history.length > 1) {

                window.history.back();

            } else {

                /*
                 * History না থাকলে Home-এ ফিরে যাবে।
                 */

                window.location.href =
                    "../index.html";

            }

        }
    );

}


/* =========================================================
   4. LIBRARY CARDS
   ========================================================= */

function setupLibraryCards() {

    const cards =
        document.querySelectorAll(
            ".library-card"
        );

    cards.forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                /*
                 * বর্তমানে navigation HTML-এর
                 * href-এর মাধ্যমে হচ্ছে।
                 *
                 * ভবিষ্যতে এখানে authentication
                 * এবং user-specific data check
                 * যোগ করা যাবে।
                 */

                card.classList.add(
                    "opening"
                );

            }
        );

    });

}


/* =========================================================
   5. BOTTOM NAVIGATION
   ========================================================= */

function setupBottomNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".bottom-nav-item"
        );

    navigationItems.forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                navigationItems.forEach(
                    (navItem) => {

                        navItem.classList.remove(
                            "active"
                        );

                    }
                );

                item.classList.add(
                    "active"
                );

            }
        );

    });

}


/* =========================================================
   6. KEYBOARD NAVIGATION
   ========================================================= */

function setupKeyboardNavigation() {

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * Escape চাপলে আগের page-এ
             * ফিরে যাওয়ার সুবিধা।
             */

            if (event.key === "Escape") {

                if (window.history.length > 1) {

                    window.history.back();

                }

            }

        }
    );

}


/* =========================================================
   7. MOBILE BACK SUPPORT
   ========================================================= */

/*
 * Android-এর physical/software back button
 * browser history ব্যবহার করে কাজ করবে।
 *
 * আলাদা কোনো button প্রয়োজন নেই।
 */


/* =========================================================
   8. FUTURE LIBRARY MODULES
   ========================================================= */

/*
 * ভবিষ্যতে আলাদা module থেকে:
 *
 * saved-videos.js
 * watch-history.js
 * dictionary.js
 * translator.js
 * ai-english.js
 *
 * এই Library-এর সঙ্গে যুক্ত হবে।
 */


/* =========================================================
   9. FUTURE USER DATA
   ========================================================= */

/*
 * ভবিষ্যতে backend থেকে:
 *
 * saved videos
 * watch history
 * learning progress
 * dictionary history
 * translator history
 * AI English progress
 *
 * user account অনুযায়ী load হবে।
 */
