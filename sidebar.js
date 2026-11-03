/* Monarch — shared sidebar behavior
   Replaces the previously duplicated inline script on every page (this
   unifies the collapse logic — all pages now use the consistent variant,
   including active-link border handling while collapsed).

   Desktop (>768px):  toggle between full (240px) and collapsed (80px) rail,
                      exactly as before.
   Mobile (<=768px):  the sidebar is an off-canvas drawer, toggled by the
                      floating menu button; Escape and scrim clicks close it.
   The 768px breakpoint here must match styles.css byte for byte.          */
(function () {
    "use strict";

    var mql = window.matchMedia("(max-width: 768px)");

    var sidebar = document.getElementById("sidebar");
    var main = document.getElementById("mainContent");
    var toggle = document.getElementById("toggleButton");
    var mobileToggle = document.getElementById("mobileToggle");
    if (!sidebar || !main || !toggle) { return; }

    var labels = document.querySelectorAll(".sidebar-label");
    var links = document.querySelectorAll("#sidebar a");

    var collapsed = false;   // desktop rail state
    var mobileOpen = false;  // mobile drawer state

    /* ---------- Desktop collapse (original behavior, unified) ---------- */

    function setCollapsed(next) {
        collapsed = next;
        sidebar.classList.toggle("collapsed", next);

        if (collapsed) {
            sidebar.style.width = "80px";
            sidebar.style.padding = "25px 10px";
            main.style.marginLeft = "80px";
            labels.forEach(function (label) { label.style.display = "none"; });
            links.forEach(function (link) {
                link.style.justifyContent = "center";
                link.style.padding = "14px 5px";
                link.style.borderLeftWidth =
                    link.hasAttribute("aria-current") ? "4px" : "0px";
            });
            toggle.style.alignSelf = "center";
            toggle.setAttribute("aria-label", "Expand sidebar");
        } else {
            sidebar.style.width = "240px";
            sidebar.style.padding = "25px 12px";
            main.style.marginLeft = "240px";
            labels.forEach(function (label) { label.style.display = "inline"; });
            links.forEach(function (link) {
                link.style.justifyContent = "flex-start";
                link.style.padding = "14px 15px";
                link.style.borderLeftWidth =
                    link.hasAttribute("aria-current") ? "4px" : "0px";
            });
            toggle.style.alignSelf = "flex-end";
            toggle.setAttribute("aria-label", "Collapse sidebar");
        }
    }

    /* Reset every JS-applied inline property to expand-state defaults.
       Used when returning to desktop: the base width/margin/padding live in
       the pages' inline styles, so "clear to empty" would permanently strip
       them and break the desktop layout.                                      */
    /* Reset JS-applied inline properties so the stylesheet is authoritative.
       Only safe on mobile, where the media-query layer (!important) supplies
       every affected property. On desktop these base values live in the
       pages' inline styles and must be restored explicitly instead.           */
    function resetToCssAuthority() {
        sidebar.style.width = "";
        sidebar.style.padding = "";
        main.style.marginLeft = "";
        labels.forEach(function (label) { label.style.display = ""; });
        links.forEach(function (link) {
            link.style.justifyContent = "";
            link.style.padding = "";
            link.style.borderLeftWidth = "";
        });
        toggle.style.alignSelf = "";
    }

    /* ---------- Mobile drawer ---------- */

    function setMobileOpen(next) {
        mobileOpen = next;
        sidebar.classList.toggle("open", next);
        document.body.classList.toggle("drawer-open", next);
        if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", String(next));
            mobileToggle.setAttribute("aria-label",
                next ? "Close menu" : "Open menu");
        }
        if (next) {
            sidebar.removeAttribute("inert");
        } else {
            sidebar.setAttribute("inert", "");
        }
    }

    /* ---------- Mode switching ---------- */

    function applyMode() {
        sidebar.classList.remove("open");
        sidebar.classList.remove("collapsed");
        document.body.classList.remove("drawer-open");
        if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", "false");
            mobileToggle.setAttribute("aria-label", "Open menu");
        }
        mobileOpen = false;

        if (mql.matches) {
            /* Mobile: inline state must yield to the stylesheet. */
            resetToCssAuthority();
            sidebar.setAttribute("inert", "");  // hidden from keyboard until opened
        } else {
            /* Desktop: restore the original expanded inline defaults. */
            sidebar.removeAttribute("inert");
            setCollapsed(false);
        }
    }

    window.toggleSidebar = function () {
        if (mql.matches) { setMobileOpen(!mobileOpen); }
        else { setCollapsed(!collapsed); }
    };

    /* Reset "desktop residue" inline styles when crossing breakpoints. */
    if (mql.addEventListener) {
        mql.addEventListener("change", applyMode);
    } else if (mql.addListener) {           // older Safari fallback
        mql.addListener(applyMode);
    }
    applyMode();

    /* Scrim click (scrim is a body pseudo-element, so a closing click lands
       on <body> itself) and Escape both close the drawer. */
    document.body.addEventListener("click", function (event) {
        if (mql.matches && mobileOpen && event.target === document.body) {
            setMobileOpen(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && mql.matches && mobileOpen) {
            setMobileOpen(false);
        }
    });
})();
