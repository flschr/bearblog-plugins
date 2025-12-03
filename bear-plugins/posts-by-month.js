// Function to format the month and year for headers
function formatMonthYear(date) {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Function to organize blog posts by month
function organizeBlogPosts() {
    const blogPostsList = document.querySelector('.blog-posts');
    if (!blogPostsList) return;
    
    const posts = Array.from(blogPostsList.querySelectorAll('li'));
    const postsByMonth = new Map();
    
    posts.forEach(post => {
        const timeElement = post.querySelector('time');
        if (!timeElement) return;
        
        const date = new Date(timeElement.getAttribute('datetime'));
        const monthYear = formatMonthYear(date);
        
        if (!postsByMonth.has(monthYear)) {
            postsByMonth.set(monthYear, []);
        }
        postsByMonth.get(monthYear).push(post);
    });
    
    blogPostsList.innerHTML = '';
    
    const sortedMonths = Array.from(postsByMonth.keys()).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
    });
    
    sortedMonths.forEach(monthYear => {
        const header = document.createElement('h2');
        header.textContent = monthYear;
        header.className = 'month-header';
        blogPostsList.appendChild(header);
        
        postsByMonth.get(monthYear).forEach(post => {
            blogPostsList.appendChild(post);
        });
    });
}

// GEÄNDERT: Läuft auf allen Seiten mit .blog-posts, nicht nur auf /blog/
if (document.querySelector(".blog-posts")) {
    document.addEventListener('DOMContentLoaded', organizeBlogPosts); 
}