# Mastodon Mappings Integration

This document explains how to integrate the Reply and Like plugin with the [bearblog-automation](https://github.com/flschr/bearblog-automation) social bot for automatic Mastodon reply threading.

## Overview

When the social bot posts an article to Mastodon, it should record the mapping between the article URL and the resulting toot URL. The Reply and Like plugin will automatically fetch these mappings and enable threaded replies.

## File Format

Create a `mastodon-mappings.json` file in your bearblog-automation repository with this structure:

```json
{
  "https://fischr.org/article-one/": "https://mastodon.social/@fischr/123456789012345",
  "https://fischr.org/article-two/": "https://mastodon.social/@fischr/234567890123456"
}
```

**Important:**
- Keys are the **full article URLs** (as they appear in the RSS feed)
- Values are the **full Mastodon toot URLs** (including instance domain)
- Use consistent URL formatting (with or without trailing slashes - the plugin handles both)

## Social Bot Integration

Your social bot should:

1. **After posting to Mastodon**, extract the toot URL from the API response
2. **Load the existing mappings file** from the repository
3. **Add the new mapping**: `article_url -> toot_url`
4. **Save and commit** the updated `mastodon-mappings.json` file
5. **Push to GitHub** so the plugin can fetch the latest version

### Example Workflow

```python
# After posting to Mastodon
article_url = "https://fischr.org/my-article/"
toot_url = mastodon_response['url']  # e.g., "https://mastodon.social/@fischr/123456789"

# Load existing mappings
with open('mastodon-mappings.json', 'r') as f:
    mappings = json.load(f)

# Add new mapping
mappings[article_url] = toot_url

# Save updated mappings
with open('mastodon-mappings.json', 'w') as f:
    json.dump(mappings, f, indent=2, ensure_ascii=False)

# Commit and push to GitHub
git.add('mastodon-mappings.json')
git.commit(m='Update Mastodon mappings')
git.push()
```

## Plugin Behavior

The Reply and Like plugin will:

1. **Fetch the mappings** from GitHub (defaults to `https://raw.githubusercontent.com/flschr/bearblog-automation/main/mastodon-mappings.json`)
2. **Cache in localStorage** for 1 hour to reduce HTTP requests
3. **Look up the current article URL** in the mappings
4. **Use the toot URL** for threaded replies via Mastodon's `/interact` endpoint

## Custom Mappings URL

If your mappings file is hosted elsewhere, users can specify a custom URL:

```html
<script src="https://flschr.github.io/bearblog-plugins/reply-and-like.js"
        data-email="your@email.com"
        data-mastodon="@yourhandle@instance.social"
        data-mastodon-mappings-url="https://example.com/custom-mappings.json"
        defer></script>
```

## Testing

To test the integration:

1. Create a test article and post it to Mastodon
2. Add the mapping to `mastodon-mappings.json`
3. Open the article in your browser
4. Open browser console and check for any errors
5. Click "Reply on Mastodon" and verify it opens the interact endpoint with the correct toot URI

## Troubleshooting

### Cache Issues
Clear the cache by running this in the browser console:
```javascript
localStorage.removeItem('mastodon_mappings');
localStorage.removeItem('mastodon_mappings_time');
```

### URL Matching
The plugin tries multiple URL variations:
- Exact match
- Without trailing slash
- With trailing slash

Ensure your mappings file uses consistent URLs matching your RSS feed.

### CORS Issues
GitHub's raw content URLs support CORS, so no special configuration is needed for public repositories.
