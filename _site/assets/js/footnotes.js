document.addEventListener('DOMContentLoaded', function() {
    console.log('Footnotes script loaded');

    // Helper function to convert author name to URL-friendly anchor
    function authorNameToAnchor(name) {
        return name.toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^\w-]/g, ''); // Remove non-word chars except hyphens
    }

    // Helper function to process reference links in content
    function processReferenceLinks(content) {
        //console.log('Processing reference links in content:', content);
        
        // Convert markdown-style references to HTML links
        content = content.replace(/\[\[(\d+)\]\]\(#ref\1\)/g, '<a href="#ref$1" class="citation-link">[$1]</a>');
        //console.log('Converted markdown references to HTML:', content);
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        //console.log('Created temp div with content:', tempDiv.innerHTML);
        
        // Find all reference links
        const refLinks = tempDiv.querySelectorAll('a[href^="#ref"]');
        //console.log('Found reference links:', refLinks.length);
        
        // We'll keep the links as clickable elements, just style them
        refLinks.forEach((link, index) => {
            //console.log(`Processing reference link ${index + 1}:`, link.outerHTML);
            // Get the reference number from the href
            const refNum = link.getAttribute('href').replace('#ref', '');
            //console.log('Reference number:', refNum);
            
            // Style the link instead of replacing it
            link.className = 'citation-link';
            link.style.color = '#DB4C40';
            link.style.margin = '0 2px';
            link.style.textDecoration = 'none';
            link.style.transition = 'color 0.2s ease';
            
            // Add hover effect
            link.addEventListener('mouseover', () => {
                link.style.color = '#c13224';
                link.style.textDecoration = 'underline';
            });
            
            link.addEventListener('mouseout', () => {
                link.style.color = '#DB4C40';
                link.style.textDecoration = 'none';
            });
            
            //console.log('Styled reference link:', link.outerHTML);
        });
        
        const processedContent = tempDiv.innerHTML;
        //console.log('Final processed content:', processedContent);
        return processedContent;
    }

    // Add CSS styles for the author info and references
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
        .footnote-popup .reference-link {
            color: #DB4C40;
            font-weight: 500;
            margin: 0 2px;
        }
        .citation-link {
            color: #DB4C40 !important;
            text-decoration: none !important;
            transition: color 0.2s ease;
            margin: 0 2px;
        }
        .citation-link:hover {
            color: #c13224 !important;
            text-decoration: underline !important;
        }
    `;
    document.head.appendChild(styleSheet);
    console.log('Added author info and reference styles');

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

    footnoteRefs.forEach(ref => {
        console.log('Processing footnote ref:', ref.getAttribute('href'));
        
        ref.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Check if this is the same footnote that's currently open
            const currentFootnoteId = popup.getAttribute('data-current-footnote');
            const clickedFootnoteId = this.getAttribute('href').substring(1);
            
            if (currentFootnoteId === clickedFootnoteId) {
                // Close the popup if clicking the same footnote
                popup.classList.remove('show');
                popup.style.opacity = '0';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 200);
                popup.removeAttribute('data-current-footnote');
                return;
            }

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
                
                // Process the content to format references
                const processedContent = processReferenceLinks(contentDiv.innerHTML);
                //console.log('Processed content for popup:', processedContent);
                
                // Create the popup content
                let content = `
                    <div class="footnote-content">
                        ${processedContent}
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
                
                //console.log('Final popup content:', content);
                popup.innerHTML = content;
                popup.setAttribute('data-current-footnote', footnoteId);
                
                // Add click handlers for citation links
                popup.querySelectorAll('.citation-link').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });
                
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
        const isCitationClick = e.target.closest('.citation-link');
        
        if (!isFootnoteClick && !isPopupClick && !isCitationClick) {
            popup.classList.remove('show');
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 200); // Match the CSS transition duration
            popup.removeAttribute('data-current-footnote');
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
            popup.removeAttribute('data-current-footnote');
            console.log('Popup closed by Escape key');
        }
    });
}); 