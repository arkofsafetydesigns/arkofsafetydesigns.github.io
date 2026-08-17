(function() {
    window.onscroll = function () {
        // show or hide the back-to-top button
        var backToTop = document.querySelector(".scroll-top");
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            backToTop.style.display = "flex";
        } else {
            backToTop.style.display = "none";
        }
    };
})();