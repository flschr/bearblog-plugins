(function() {
    // Nur auf /blog/ ausführen
    if (window.location.pathname !== '/blog/') {
        return;
    }

    // Function to format the month and year for headers
    function formatMonthYear(date) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    // Function to get month name only
    function getMonthName(dateStr) {
        return new Date(dateStr).toLocaleString('default', { month: 'long' });
    }

    // Function to get year only
    function getYear(dateStr) {
        return new Date(dateStr).getFullYear();
    }

    // Function to organize blog posts by month
    function organizeBlogPosts() {
        const blogPostsList = document.querySelector('.blog-posts');
        if (!blogPostsList) return;

        const posts = Array.from(blogPostsList.querySelectorAll('li'));
        const postsByMonth = new Map();

        // Group posts by month
        posts.forEach(post => {
            const timeElement = post.querySelector('time');
            if (!timeElement) return;

            const date = new Date(timeElement.getAttribute('datetime'));
            const monthYear = formatMonthYear(date);

            if (!postsByMonth.has(monthYear)) {
                postsByMonth.set(monthYear, {
                    posts: [],
                    date: date
                });
            }
            postsByMonth.get(monthYear).posts.push(post);
        });

        // Sort months (newest first)
        const sortedMonths = Array.from(postsByMonth.keys()).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB - dateA;
        });

        // Group adjacent months with < 3 posts
        const groupedMonths = [];
        let i = 0;

        while (i < sortedMonths.length) {
            const currentMonth = sortedMonths[i];
            const currentData = postsByMonth.get(currentMonth);

            // If current month has >= 3 posts, keep it separate
            if (currentData.posts.length >= 3) {
                groupedMonths.push({
                    months: [currentMonth],
                    posts: currentData.posts
                });
                i++;
            } else {
                // Start a group with the current month
                const group = {
                    months: [currentMonth],
                    posts: [...currentData.posts]
                };

                let j = i + 1;
                // Add consecutive months with < 3 posts until we have >= 3 total posts
                while (j < sortedMonths.length && group.posts.length < 3) {
                    const nextMonth = sortedMonths[j];
                    const nextData = postsByMonth.get(nextMonth);

                    // Only add if next month also has < 3 posts
                    if (nextData.posts.length < 3) {
                        group.months.push(nextMonth);
                        group.posts.push(...nextData.posts);
                        j++;
                    } else {
                        break;
                    }
                }

                groupedMonths.push(group);
                i = j;
            }
        }

        // Render the grouped structure
        blogPostsList.innerHTML = '';

        groupedMonths.forEach(group => {
            const header = document.createElement('strong');

            // Format header based on number of months in group
            if (group.months.length === 1) {
                header.textContent = group.months[0];
            } else {
                // Multiple months: format as "Month1 - Month2 Year"
                const firstMonth = group.months[group.months.length - 1]; // oldest in group
                const lastMonth = group.months[0]; // newest in group
                const firstMonthName = getMonthName(firstMonth);
                const lastMonthName = getMonthName(lastMonth);
                const year = getYear(lastMonth);

                // Check if same year
                const firstYear = getYear(firstMonth);
                if (firstYear === year) {
                    header.textContent = `${firstMonthName} - ${lastMonthName} ${year}`;
                } else {
                    header.textContent = `${firstMonthName} ${firstYear} - ${lastMonthName} ${year}`;
                }
            }

            header.className = 'month-header';
            header.style.display = 'block';
            blogPostsList.appendChild(header);

            // Add all posts in this group
            group.posts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });
    }

    // Run the organization when the DOM is loaded
    if (document.querySelector(".blog-posts")) {
        document.addEventListener('DOMContentLoaded', organizeBlogPosts);
    }
})();