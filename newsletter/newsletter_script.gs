// ========== CONFIGURATION ==========
const CONFIG = {
  SHEET_ID: '', // Replace with correct Google Sheet ID
  SHEET_NAME: 'Form Responses 1',
  EMAIL_COLUMN: 1,
  BLOG_NAME: 'Emergent Properties Blog',
  BLOG_URL: 'https://emergentpropertiesblog.com',
  RSS_URL: 'https://emergentpropertiesblog.com/feed.xml',
  YOUR_EMAIL: 'emergentpropertiesblog@gmail.com',
  DAILY_LIMIT: 95, // Stay under Gmail's 100/day limit
  GITHUB_RAW_URL: 'https://raw.githubusercontent.com/emergentpropertiesblog/emergentpropertiesblog.github.io/refs/heads/main/_posts/',
};

// ========== MAIN FUNCTION ==========

/**
 * Automatically fetch latest post from front matter and send newsletter
 */
function sendLatestPostNewsletter() {
  try {
    console.log('🔍 Fetching latest blog post details...');
    
    // Get the latest post with full front matter details
    const latestPost = getLatestPostWithFrontMatter();
    
    if (!latestPost) {
      console.log('No blog post found or could not parse front matter');
      return;
    }
    
    console.log(`Found post: "${latestPost.title}" by ${latestPost.author}`);
    console.log(`Published: ${latestPost.date}`);
    
    // Get subscribers
    const subscribers = getSubscribers();
    
    if (subscribers.length === 0) {
      console.log('No subscribers found');
      return;
    } else {
      console.log(subscribers)
    }
    
    // Create email content from front matter
    const emailData = createEmailFromFrontMatter(latestPost);

    // Confirm before sending
    sendBulkEmails(subscribers, emailData);
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
    
  } catch (error) {
    console.error('Error in sendLatestPostNewsletter:', error);
  }
}

// ========== FRONT MATTER EXTRACTION ==========

/**
 * Get latest post with front matter details
 */
function getLatestPostWithFrontMatter() {
  try {
    // First, get the latest post URL from RSS
    const latestPostInfo = getLatestPostFromRSS();
    
    if (!latestPostInfo) {
      console.log('Could not get latest post from RSS');
      return null;
    }
    
    console.log(`Found latest post URL: ${latestPostInfo.url}`);
    
    // Extract front matter from the post
    const frontMatter = extractFrontMatterFromPost(latestPostInfo);
    
    if (!frontMatter) {
      console.log('Could not extract front matter, using RSS data as fallback');
      return {
        title: latestPostInfo.title,
        date: latestPostInfo.date,
        author: 'Blog Author', // Default
        description: latestPostInfo.description,
        url: latestPostInfo.url,
        source: 'RSS-fallback'
      };
    }
    
    return {
      ...frontMatter,
      url: latestPostInfo.url,
      source: 'Front-matter'
    };
    
  } catch (error) {
    console.error('Error getting post with front matter:', error);
    return null;
  }
}

/**
 * Get basic post info from RSS feed - handles multiple feed formats
 */
function getLatestPostFromRSS() {
  try {
    console.log(`Fetching RSS feed from: ${CONFIG.RSS_URL}`);
    
    const response = UrlFetchApp.fetch(CONFIG.RSS_URL, {
      headers: {
        'User-Agent': 'GoogleAppsScript-Newsletter/1.0'
      },
      muteHttpExceptions: true
    });
    
    console.log(`RSS Response code: ${response.getResponseCode()}`);
    
    if (response.getResponseCode() !== 200) {
      console.log('RSS feed not accessible');
      return null;
    }
    
    const xmlContent = response.getContentText();
    console.log(`RSS content length: ${xmlContent.length} characters`);
    console.log(`First 500 chars: ${xmlContent.substring(0, 500)}`);
    
    // Try different feed formats
    let post = parseRSSFormat(xmlContent) || parseAtomFormat(xmlContent);
    
    if (!post) {
      console.log('Could not parse any recognized feed format');
      return null;
    }
    
    console.log(`Parsed post: "${post.title}"`);
    return post;
    
  } catch (error) {
    console.error('RSS parsing error:', error);
    return null;
  }
}

/**
 * Parse standard RSS 2.0 format
 */
function parseRSSFormat(xmlContent) {
  try {
    console.log('🔧 Trying RSS 2.0 format...');
    
    // Get the first <item> block
    const itemMatch = xmlContent.match(/<item[^>]*>([\s\S]*?)<\/item>/);
    if (!itemMatch) {
      console.log('No <item> found in RSS format');
      return null;
    }
    
    const itemContent = itemMatch[1];
    
    // Parse title - handle both CDATA and plain text
    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s) ||
                      itemContent.match(/<title[^>]*>(.*?)<\/title>/s);
    
    // Parse link
    const linkMatch = itemContent.match(/<link[^>]*>(.*?)<\/link>/s) ||
                     itemContent.match(/<guid[^>]*>(.*?)<\/guid>/s);
    
    // Parse description - handle both CDATA and plain text
    const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/s) ||
                     itemContent.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/s);
    
    // Parse date
    const dateMatch = itemContent.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s) ||
                     itemContent.match(/<dc:date[^>]*>(.*?)<\/dc:date>/s) ||
                     itemContent.match(/<date[^>]*>(.*?)<\/date>/s);
    
    if (!titleMatch || !linkMatch) {
      console.log('Missing title or link in RSS item');
      return null;
    }
    
    // Clean up description
    let description = descMatch ? descMatch[1] : '';
    description = description.replace(/<[^>]*>/g, '').replace(/&lt;[^&]*&gt;/g, '').trim();
    description = description.length > 300 ? description.substring(0, 300) + '...' : description;
    
    return {
      title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
      url: linkMatch[1].trim(),
      description: description,
      date: dateMatch ? new Date(dateMatch[1]) : new Date(),
      format: 'RSS'
    };
    
  } catch (error) {
    console.error('Error parsing RSS format:', error);
    return null;
  }
}

/**
 * Parse Atom feed format (common with Jekyll)
 */
function parseAtomFormat(xmlContent) {
  try {
    console.log('🔧 Trying Atom format...');
    
    // Get the first <entry> block
    const entryMatch = xmlContent.match(/<entry[^>]*>([\s\S]*?)<\/entry>/);
    if (!entryMatch) {
      console.log('No <entry> found in Atom format');
      return null;
    }
    
    const entryContent = entryMatch[1];
    
    // Parse title
    const titleMatch = entryContent.match(/<title[^>]*>(.*?)<\/title>/s);
    
    // Parse link - Atom uses <link href="...">
    const linkMatch = entryContent.match(/<link[^>]*href=["'](.*?)["'][^>]*>/s) ||
                     entryContent.match(/<id[^>]*>(.*?)<\/id>/s);
    
    // Parse summary/content
    const descMatch = entryContent.match(/<summary[^>]*>([\s\S]*?)<\/summary>/s) ||
                     entryContent.match(/<content[^>]*>([\s\S]*?)<\/content>/s);
    
    // Parse date
    const dateMatch = entryContent.match(/<published[^>]*>(.*?)<\/published>/s) ||
                     entryContent.match(/<updated[^>]*>(.*?)<\/updated>/s);
    
    if (!titleMatch || !linkMatch) {
      console.log('Missing title or link in Atom entry');
      return null;
    }
    
    // Clean up description
    let description = descMatch ? descMatch[1] : '';
    description = description.replace(/<[^>]*>/g, '').replace(/&lt;[^&]*&gt;/g, '').trim();
    description = description.length > 300 ? description.substring(0, 300) + '...' : description;
    
    return {
      title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
      url: linkMatch[1].trim(),
      description: description,
      date: dateMatch ? new Date(dateMatch[1]) : new Date(),
      format: 'Atom'
    };
    
  } catch (error) {
    console.error('Error parsing Atom format:', error);
    return null;
  }
}


/**
 * Get basic post info from RSS feed
 */
function getLatestPostFromRSS2() {
  try {
    const response = UrlFetchApp.fetch(CONFIG.RSS_URL, {
      headers: {
        'User-Agent': 'GoogleAppsScript-Newsletter/1.0'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      console.log('RSS feed not accessible');
      return null;
    } else {
      console.log('RSS feed accessed')
    }
    
    const xmlContent = response.getContentText();
    
    // Parse XML to get the first (latest) item
    const titleMatch = xmlContent.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = xmlContent.match(/<item>[\s\S]*?<link>(.*?)<\/link>/);
    const descMatch = xmlContent.match(/<item>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>/);
    const dateMatch = xmlContent.match(/<item>[\s\S]*?<pubDate>(.*?)<\/pubDate>/);

    console.log(xmlContent)

    if (!titleMatch || !linkMatch) {
      return null;
    }
    
    // Clean up description
    let description = descMatch ? descMatch[1] : '';
    description = description.replace(/<[^>]*>/g, '').trim();
    description = description.length > 300 ? description.substring(0, 300) + '...' : description;
    
    return {
      title: titleMatch[1].trim(),
      url: linkMatch[1].trim(),
      description: description,
      date: dateMatch ? new Date(dateMatch[1]) : new Date()
    };
    
  } catch (error) {
    console.error('RSS parsing error:', error);
    return null;
  }
}

/**
 * Extract front matter from a Jekyll post
 */
function extractFrontMatterFromPost(postInfo) {
  try {
    // Try multiple methods to get the raw post content
    let rawContent = null;
    
    // Method 1: Try to get from GitHub raw URL (if configured)
    if (CONFIG.GITHUB_RAW_URL) {
      rawContent = getRawPostFromGitHub(postInfo);
    }
    
    // Method 2: Try to get from direct post URL with .md extension
    if (!rawContent && CONFIG.POST_SOURCE_URL) {
      rawContent = getRawPostFromSource(postInfo);
    }
    
    // Method 3: Try to extract front matter from the rendered HTML page
    if (!rawContent) {
      rawContent = extractFrontMatterFromHTML(postInfo.url);
    }
    
    if (!rawContent) {
      console.log('Could not get raw post content');
      return null;
    }
    
    // Parse the YAML front matter
    return parseFrontMatter(rawContent);
    
  } catch (error) {
    console.error('Error extracting front matter:', error);
    return null;
  }
}

/**
 * Get raw post content from GitHub
 */
function getRawPostFromGitHub(postInfo) {
  try {
    // Extract post filename from URL
    // e.g., /2024/01/15/post-title.html -> 2024-01-15-post-title.md
    const urlParts = postInfo.url.split('/');
    const year = urlParts[1];
    const month = urlParts[2];
    const day = urlParts[3];
    const titlePart = urlParts[4].replace('.html', '');
    
    const filename = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}-${titlePart}.md`;
    const rawUrl = CONFIG.GITHUB_RAW_URL + filename;
    
    console.log(`🔗 Trying GitHub raw URL: ${rawUrl}`);
    
    const response = UrlFetchApp.fetch(rawUrl, {
      headers: {
        'User-Agent': 'GoogleAppsScript-Newsletter/1.0'
      }
    });
    
    if (response.getResponseCode() === 200) {
      return response.getContentText();
    }
    
    return null;
    
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    return null;
  }
}

/**
 * Get raw post from custom source URL
 */
function getRawPostFromSource(postInfo) {
  try {
    // This would be customized based on your setup
    const rawUrl = CONFIG.POST_SOURCE_URL + extractPostIdentifier(postInfo.url);
    
    const response = UrlFetchApp.fetch(rawUrl, {
      headers: {
        'User-Agent': 'GoogleAppsScript-Newsletter/1.0'
      }
    });
    
    if (response.getResponseCode() === 200) {
      return response.getContentText();
    }
    
    return null;
    
  } catch (error) {
    console.error('Error fetching from source:', error);
    return null;
  }
}

/**
 * Try to extract front matter info from HTML comments or meta tags
 */
function extractFrontMatterFromHTML(postUrl) {
  try {
    const response = UrlFetchApp.fetch(postUrl, {
      headers: {
        'User-Agent': 'GoogleAppsScript-Newsletter/1.0'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      return null;
    }
    
    const htmlContent = response.getContentText();
    
    // Look for Jekyll front matter in HTML comments
    const frontMatterMatch = htmlContent.match(/<!--\s*FRONT_MATTER:\s*([\s\S]*?)\s*-->/);
    if (frontMatterMatch) {
      return frontMatterMatch[1];
    }
    
    // Look for meta tags with Jekyll data
    const metaData = {};
    
    // Extract from meta tags
    const titleMatch = htmlContent.match(/<meta\s+property="og:title"\s+content="([^"]*)"/) ||
                      htmlContent.match(/<title>([^<]*)<\/title>/);
    if (titleMatch) metaData.title = titleMatch[1].trim();
    
    const descMatch = htmlContent.match(/<meta\s+property="og:description"\s+content="([^"]*)"/) ||
                     htmlContent.match(/<meta\s+name="description"\s+content="([^"]*)"/) ||
                     htmlContent.match(/<meta\s+property="description"\s+content="([^"]*)"/);
    if (descMatch) metaData.description = descMatch[1].trim();
    
    const authorMatch = htmlContent.match(/<meta\s+name="author"\s+content="([^"]*)"/) ||
                       htmlContent.match(/<span\s+class="[^"]*author[^"]*">([^<]*)<\/span>/i);
    if (authorMatch) metaData.author = authorMatch[1].trim();
    
    const dateMatch = htmlContent.match(/<meta\s+property="article:published_time"\s+content="([^"]*)"/) ||
                     htmlContent.match(/<time[^>]*datetime="([^"]*)"/) ||
                     htmlContent.match(/<span\s+class="[^"]*date[^"]*">([^<]*)<\/span>/i);
    if (dateMatch) {
      try {
        metaData.date = new Date(dateMatch[1]);
      } catch (e) {
        metaData.date = new Date();
      }
    }
    
    // Convert to YAML-like format for parsing
    if (Object.keys(metaData).length > 0) {
      let yamlContent = '---\n';
      Object.keys(metaData).forEach(key => {
        yamlContent += `${key}: "${metaData[key]}"\n`;
      });
      yamlContent += '---';
      return yamlContent;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
}

/**
 * Parse YAML front matter
 */
function parseFrontMatter(content) {
  try {
    // Extract the front matter block
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (!frontMatterMatch) {
      console.log('No front matter block found');
      return null;
    }
    
    const yamlContent = frontMatterMatch[1];
    const frontMatter = {};
    
    // Parse common YAML fields
    const lines = yamlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      // Handle simple key: value pairs
      const match = trimmedLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Handle special cases
        if (key === 'date') {
          try {
            frontMatter[key] = new Date(value);
          } catch (e) {
            frontMatter[key] = value;
          }
        } else {
          frontMatter[key] = value;
        }
      }
    }
    
    console.log('Parsed front matter:', frontMatter);
    
    return {
      title: frontMatter.title || 'Untitled Post',
      date: frontMatter.date || new Date(),
      author: frontMatter.author || 'Blog Author',
      description: frontMatter.description || frontMatter.excerpt || 'Check out this new post!'
    };
    
  } catch (error) {
    console.error('Error parsing front matter:', error);
    return null;
  }
}

// ========== EMAIL CREATION FROM FRONT MATTER ==========

/**
 * Create email content from front matter data
 */
function createEmailFromFrontMatter(post) {
  const dateStr = post.date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return {
    subject: `New Post: ${post.title}`,
    
    plainText: `
New Post: ${post.title}
By ${post.author} • ${dateStr}

Hi there!

We are excited to present our latest blog post!

${post.description}

Read the full post: ${post.url}

Thanks for being a subscriber! Feel free to reply to this email with any comments / thoughts / reflections / questions.

Best,
${post.author} on behalf of the Emergent Properties team
${CONFIG.BLOG_NAME}

---
Unsubscribe: Reply with "UNSUBSCRIBE"
Blog: ${CONFIG.BLOG_URL}
    `,
    
    htmlBody: createHTMLFromFrontMatter(post, dateStr)
  };
}


// Create HTML email from front matter with Emergent Properties theme
function createHTMLFromFrontMatter(post, dateStr) {
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${post.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif; background-color: #ffffff; line-height: 1.6; color: #2c3e50; font-size: 14px;">
        
        <!-- Main container -->
        <div style="max-width: 50rem; margin: 0 auto; background: white; padding: 0 1rem;">
          
          <!-- Header - Matching archive header style with logo -->
          <div style="padding: 60px 0 40px 0; border-bottom: 1px solid #f2f2f2; text-align: center;">
            <!-- Logo and title container - RESPONSIVE CENTERED APPROACH -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://emergentpropertiesblog.com/assets/images/logored.png" 
                   alt="Emergent Properties Logo" 
                   style="width: 120px; height: 120px; border: 2px solid #2c3e50; border-radius: 50%; display: block; margin: 0 auto 20px auto;">
              <h1 style="color: #2c3e50; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 3rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; text-align: center;">
                Emergent Properties
              </h1>
            </div>
            
            <div style="border-top: 0.4rem solid #2c3e50; display: block; margin: 0 auto 3rem; width: 4rem;"></div>
            <p style="color: #666666; margin: 15px 0 0 0; font-size: 20px; font-weight: 400; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              New post published
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 0;">
            
            <!-- Article title - Matching archive post title style -->
            <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 1.6rem; line-height: 1.3; font-weight: 600; letter-spacing: -0.01em;">
              ${post.title}
            </h2>
            
            <!-- Author and date info - Matching archive post time style -->
            <div style="margin-bottom: 35px;">
              <p style="color: #999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 1rem; margin: 0; font-weight: 400; letter-spacing: 0.5px;">
                ${post.author} • ${dateStr}
              </p>
            </div>
            
            <!-- Article excerpt/description - Matching paragraph style -->
            <div style="margin: 35px 0;">
              <p style="color: #2c3e50; line-height: 1.6; font-size: 1.1rem; margin-bottom: 1.5rem; font-weight: 400;">
                ${post.description}
              </p>
            </div>
            
            <!-- Read more button - Using site's link color -->
            <div style="margin: 40px 0;">
              <a href="${post.url}" 
                 style="color: #DB4C40; text-decoration: none; font-weight: 500; font-size: 1.1rem; border-bottom: 1px solid #DB4C40; padding-bottom: 2px; transition: color 0.2s ease;">
                Read the full post →
              </a>
            </div>
            
            <!-- Separator line -->
            <div style="border-top: 1px solid #f2f2f2; margin: 50px 0 40px 0;"></div>
            
            <!-- About section -->
            <div style="margin: 40px 0;">
              <h4 style="color: #2c3e50; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 1.15rem; font-weight: 600; margin: 0 0 15px 0;">
                About Emergent Properties
              </h4>
              <p style="color: #666666; line-height: 1.6; font-size: 1.1rem; margin: 0; font-weight: 400;">
                We are a small group of friends and MD-PhD program classmates who love having nerdy, cross-disciplinary discussions that straddle the scientific and clinical worlds. We have broad scientific discussions that go beyond individual fields to try to create interesting new perspectives.
              </p>
            </div>
            
            <!-- Discussion prompt - Using site's accent color -->
            <div style="background: rgba(212, 203, 179, 0.1); padding: 30px; margin: 40px 0; border-left: 3px solid #D4CBB3;">
              <p style="color: #2c3e50; line-height: 1.6; font-size: 1.1rem; margin: 0; font-weight: 400;">
                <strong>Join the discussion:</strong> Have thoughts or questions about this article? 
                We'd love to hear from you. Simply reply to this email to start a conversation.
              </p>
            </div>
            
            <!-- Browse more -->
            <div style="margin: 40px 0;">
              <p style="color: #666666; font-size: 1.1rem; margin: 0 0 15px 0;">
                <a href="${CONFIG.BLOG_URL}" style="color: #DB4C40; text-decoration: none; font-weight: 500; border-bottom: 1px solid #DB4C40; padding-bottom: 1px;">
                  Browse all articles →
                </a>
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background: #fafafa; padding: 30px 0; text-align: center; border-top: 1px solid #f2f2f2;">
            <p style="color: #999999; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">
              You're receiving this email because you subscribed to Emergent Properties.
            </p>
            <p style="color: #999999; font-size: 13px; margin: 0; line-height: 1.5;">
              <a href="mailto:${CONFIG.YOUR_EMAIL}?subject=Unsubscribe&body=Please unsubscribe me" style="color: #DB4C40; text-decoration: none;">Unsubscribe</a> • 
              <a href="${CONFIG.BLOG_URL}" style="color: #DB4C40; text-decoration: none;">Visit Blog</a> • 
              <a href="mailto:${CONFIG.YOUR_EMAIL}" style="color: #DB4C40; text-decoration: none;">Contact</a>
            </p>
          </div>
          
        </div>
      </body>
    </html>
  `;
}



// ========== TESTING & UTILITY FUNCTIONS ==========

/**
 * Test front matter extraction
 */
function testFrontMatterExtraction() {
  console.log('Testing front matter extraction...');
  
  const post = getLatestPostWithFrontMatter();
  
  if (post) {
    console.log('Successfully extracted front matter:');
    console.log(`Title: ${post.title}`);
    console.log(`Author: ${post.author}`);
    console.log(`Date: ${post.date}`);
    console.log(`Description: ${post.description}`);
    console.log(`URL: ${post.url}`);
    console.log(`Source: ${post.source}`);
  } else {
    console.log('Failed to extract front matter');
  }
  
  return post;
}

/**
 * Send test email with front matter data
 */
function sendTestEmailWithFrontMatter() {
  const post = getLatestPostWithFrontMatter();
  
  if (!post) {
    console.log('Could not get post with front matter');
    return;
  }
  
  const emailData = createEmailFromFrontMatter(post);
  
  MailApp.sendEmail({
    to: CONFIG.YOUR_EMAIL,
    subject: '[TEST] ' + emailData.subject,
    htmlBody: emailData.htmlBody,
    plainTextBody: emailData.plainText,
    name: CONFIG.BLOG_NAME
  });
  
  console.log('Test email sent with front matter data');
  console.log(`Post: "${post.title}" by ${post.author}`);
}

/**
 * Helper function to extract post identifier from URL
 */
function extractPostIdentifier(url) {
  // Extract post identifier from URL for custom source fetching
  // Customize this based on your URL structure
  const parts = url.split('/');
  return parts[parts.length - 1]; // Gets the filename part
}

// Include utility functions from previous script
function getSubscribers() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const subscribers = [];
    
    for (let i = 1; i < data.length; i++) {
      const email = data[i][CONFIG.EMAIL_COLUMN];

      if (email && email.includes('@')) {
        subscribers.push({
          email: email.trim(),
          row: i + 1
        });
      }
    }
    
    return subscribers;
    
  } catch (error) {
    console.error('Error getting subscribers:', error);
    return [];
  }
}

function sendBulkEmails(subscribers, emailData) {
  const totalEmails = Math.min(subscribers.length, 95);
  let successCount = 0;
  
  for (let i = 0; i < totalEmails; i++) {
    const subscriber = subscribers[i];
    
    try {
      MailApp.sendEmail({
        to: subscriber.email,
        subject: emailData.subject,
        htmlBody: emailData.htmlBody,
        plainTextBody: emailData.plainText,
        name: CONFIG.BLOG_NAME,
        replyTo: CONFIG.YOUR_EMAIL
      });
      
      successCount++;
      Utilities.sleep(200);
      
    } catch (error) {
      console.error(`Failed to send to ${subscriber.email}:`, error.message);
    }
  }
  
  console.log(`Sending complete! Success: ${successCount}`);
}
