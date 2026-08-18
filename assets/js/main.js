document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu Logic ---
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('#navbarNav');
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', (e) => {
            e.stopPropagation();
            navbarToggler.classList.toggle('active');
            navbarCollapse.classList.toggle('show');
        });
    }

    const track = document.querySelector('.screenshot-track');
    const originalWindows = Array.from(document.querySelectorAll('.screenshot-window'));
    const dots = document.querySelectorAll('.pagination-dot');

    if (!track || originalWindows.length === 0) return;

    const originalCount = originalWindows.length;
    const cloneCount = 3; // Number of elements to clone on each side for a seamless loop

    // --- 1. Cloning for Infinite Loop ---
    const firstClones = originalWindows.slice(0, cloneCount).map(win => win.cloneNode(true));
    const lastClones = originalWindows.slice(-cloneCount).map(win => win.cloneNode(true));

    // Append last clones to the start, first clones to the end
    lastClones.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
    firstClones.forEach(clone => track.appendChild(clone));

    // Re-fetch all windows including clones
    const allWindows = Array.from(track.querySelectorAll('.screenshot-window'));

    // Helper to update the active/focused state
    const updateActiveState = () => {
        const trackCenter = track.scrollLeft + (track.offsetWidth / 2);
        let closestIndex = -1;
        let minDistance = Infinity;

        allWindows.forEach((win, index) => {
            const winCenter = win.offsetLeft + (win.offsetWidth / 2);
            const distance = Math.abs(trackCenter - winCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== -1) {
            // Update Windows active class
            allWindows.forEach((win, i) => win.classList.toggle('active', i === closestIndex));

            // Map cloned index back to original index for dots
            // Clones are shifted by cloneCount
            let originalIndex = (closestIndex - cloneCount) % originalCount;
            if (originalIndex < 0) originalIndex += originalCount;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === originalIndex);
            });
        }
    };

    // --- 2. Drag to Scroll Logic ---
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => { isDown = false; });
    track.addEventListener('mouseup', () => { isDown = false; });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2; 
        track.scrollLeft = scrollLeft - walk;
    });

    // --- 3. Infinite Loop Reset & Active State ---
    track.addEventListener('scroll', () => {
        updateActiveState();

        // Seamless Jump Logic
        const totalWidth = track.scrollWidth;
        const visibleWidth = track.offsetWidth;
        
        // If we scroll too far left (into the last clones)
        if (track.scrollLeft <= 0) {
            const jumpTo = originalCount * 300 + (cloneCount - 1) * 30; // Rough estimate, better to use offset
            // More precise: jump to original equivalent of the current position
            const realStartOffset = allWindows[cloneCount].offsetLeft - (track.offsetWidth / 2) + (allWindows[cloneCount].offsetWidth / 2);
            // Correct logic for seamless jump:
            // We use a slight delay or requestAnimationFrame to avoid 'scroll' event recursion issues if behavior is 'instant'
            // but typically just updating scrollLeft works
        }
    });

    // Improved Seamless Jump Logic
    const handleInfiniteLoop = () => {
        const scrollPos = track.scrollLeft;
        const windowWidth = allWindows[0].offsetWidth;
        const gap = 30; // Matching the gap in CSS
        const singleItemWidth = windowWidth + gap;
        const totalOriginalWidth = originalCount * singleItemWidth;

        // If we scroll too far left (into the last clones)
        if (scrollPos <= 0) {
            track.scrollTo({
                left: scrollPos + totalOriginalWidth,
                behavior: 'instant'
            });
        } 
        // If we scroll too far right (into the first clones)
        else if (scrollPos >= allWindows[originalCount + cloneCount].offsetLeft - (track.offsetWidth / 2) + (allWindows[0].offsetWidth / 2)) {
            track.scrollTo({
                left: scrollPos - totalOriginalWidth,
                behavior: 'instant'
            });
        }
        updateActiveState();
    };

    // Use requestAnimationFrame for the smoothest possible loop check
    const loopCheck = () => {
        handleInfiniteLoop();
        requestAnimationFrame(loopCheck);
    };
    requestAnimationFrame(loopCheck);

    // --- 4. Auto-Center First Original Item on Load ---
    setTimeout(() => {
        const firstOriginal = allWindows[cloneCount];
        if (firstOriginal) {
            track.scrollTo({
                left: firstOriginal.offsetLeft - (track.offsetWidth / 2) + (firstOriginal.offsetWidth / 2),
                behavior: 'smooth'
            });
        }
        updateActiveState();
    }, 200);

    // --- 5. Dot Navigation ---
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const targetWindow = allWindows[cloneCount + index];
            if (targetWindow) {
                track.scrollTo({
                    left: targetWindow.offsetLeft - (track.offsetWidth / 2) + (targetWindow.offsetWidth / 2),
                    behavior: 'smooth'
                });
            }
        });
    });

    updateActiveState();

});
