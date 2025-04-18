document.addEventListener('DOMContentLoaded', function() {
    console.log('Footnotes script loaded');

    // Helper function to convert author name to URL-friendly anchor
    function authorNameToAnchor(name) {
        return name.toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^\w-]/g, ''); // Remove non-word chars except hyphens
    }

    // Add CSS styles for the author info
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .footnote-popup .author-info {
            margin-top: 10px;
            text-align: right;
            font-style: italic;
            color: #000;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            padding-top: 8px;
        }
        .footnote-popup .author-info a {
            color: inherit;
            text-decoration: none;
            border-bottom: 1px dotted rgba(0, 0, 0, 0.3);
        }
        .footnote-popup .author-info a:hover {
            border-bottom-style: solid;
        }
    `;
    document.head.appendChild(styleSheet);
    console.log('Added author info styles');

    // Create popup container
    let popup = document.createElement('div');
    popup.className = 'footnote-popup';
    document.body.appendChild(popup);
    console.log('Popup container created');

    // Hide the footnotes section at the bottom
    const footnotesSection = document.querySelector('.footnotes');
    if (footnotesSection) {
        footnotesSection.style.display = 'none';
        console.log('Found and hid footnotes section');
    } else {
        console.log('No footnotes section found');
    }

    // Create a map of footnote IDs to authors
    const authorMap = {};
    document.querySelectorAll('.footnotes li').forEach(li => {
        const id = li.id;
        // Look for author information in the footnote-content div
        const footnoteContent = li.querySelector('.footnote-content');
        if (footnoteContent) {
            const authorName = footnoteContent.getAttribute('data-author');
            if (authorName) {
                authorMap[id] = authorName;
                console.log(`Found author for ${id}:`, authorMap[id]);
            }
        }
        console.log('Footnote element:', li.outerHTML);
    });

    // Select only the forward footnote references (not the back references)
    const footnoteRefs = document.querySelectorAll('a[href^="#fn:"].footnote');
    console.log('Found footnote refs:', footnoteRefs.length);

    footnoteRefs.forEach(function(ref) {
        console.log('Processing footnote ref:', ref.getAttribute('href'));
        
        ref.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get the footnote ID from the href (including the 'fn:' prefix)
            const footnoteId = this.getAttribute('href').substring(1); // Remove the '#'
            console.log('Looking for footnote content with id:', footnoteId);
            
            // Find the corresponding content div
            const contentId = 'content-' + footnoteId;
            const contentDiv = document.getElementById(contentId);
            
            if (contentDiv) {
                console.log('Found footnote content:', contentDiv.outerHTML);
                
                // Get author from the data attribute
                const authorName = contentDiv.getAttribute('data-author');
                console.log('Author name:', authorName);
                
                // Create the popup content
                let content = `
                    <div class="footnote-content">
                        ${contentDiv.innerHTML}
                    </div>
                `;
                
                // Add author info section at the bottom if available
                if (authorName) {
                    const authorAnchor = authorNameToAnchor(authorName);
                    content += `
                        <div class="author-info">
                            <span>— <a href="/about#${authorAnchor}">${authorName}</a></span>
                        </div>
                    `;
                }
                
                popup.innerHTML = content;
                
                // Position the popup
                const rect = this.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Ensure popup is visible for height calculation
                popup.style.display = 'block';
                popup.style.opacity = '0';
                
                // Calculate position
                const popupHeight = popup.offsetHeight;
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.bottom;
                
                // Position above if not enough space below
                if (spaceBelow < popupHeight + 10 && rect.top > popupHeight + 10) {
                    popup.style.top = (rect.top + scrollTop - popupHeight - 10) + 'px';
                } else {
                    popup.style.top = (rect.bottom + scrollTop + 10) + 'px';
                }
                
                popup.style.left = Math.max(10, Math.min(
                    rect.left - (popup.offsetWidth / 2) + (rect.width / 2),
                    window.innerWidth - popup.offsetWidth - 10
                )) + 'px';
                
                // Show the popup
                requestAnimationFrame(() => {
                    popup.classList.add('show');
                    popup.style.opacity = '1';
                });
                console.log('Popup shown');
            } else {
                console.log('No footnote content found for id:', contentId);
            }
        });
    });

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        const isFootnoteClick = e.target.closest('a[href^="#fn:"].footnote');
        const isPopupClick = popup.contains(e.target);
        
        if (!isFootnoteClick && !isPopupClick) {
            popup.classList.remove('show');
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 200); // Match the CSS transition duration
            console.log('Popup closed by outside click');
        }
    });

    // Close popup when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            popup.classList.remove('show');
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 200); // Match the CSS transition duration
            console.log('Popup closed by Escape key');
        }
    });
}); 