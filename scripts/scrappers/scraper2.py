"""
Test TripAdvisor Scraper with Stockholm Attractions (Anti-blocking version)
Usage: python3 test_stockholm_scraper.py
"""

import requests
from bs4 import BeautifulSoup
import re
import csv
import time
import random

def scrape_visit_duration(url, retry_count=0, max_retries=3):
    """
    Scrape visit duration from attraction page with anti-blocking measures
    """
    # More realistic browser headers
    user_agents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]

    headers = {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'DNT': '1'
    }

    try:
        print(f"Accessing: {url}")

        # Add random delay before request
        time.sleep(random.uniform(2, 5))

        # Use session for better connection handling
        session = requests.Session()
        response = session.get(url, headers=headers, timeout=15)

        # Check status
        if response.status_code == 403:
            if retry_count < max_retries:
                wait_time = (retry_count + 1) * 10
                print(f"  ⚠️  Blocked (403). Waiting {wait_time}s before retry {retry_count + 1}/{max_retries}...")
                time.sleep(wait_time)
                return scrape_visit_duration(url, retry_count + 1, max_retries)
            else:
                raise requests.exceptions.HTTPError(f"403 Forbidden after {max_retries} retries")

        response.raise_for_status()

        # HTML parsing
        soup = BeautifulSoup(response.content, 'html.parser')

        # Save HTML for debugging
        if retry_count == 0:
            with open('debug_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            print("  💾 Saved HTML to debug_page.html for inspection")

        # Method 1: Search for duration elements
        duration = None

        # Try various selectors
        possible_selectors = [
            {'data-test-target': 'duration'},
            {'class': 'duration'},
            {'class': re.compile('duration', re.I)},
            {'data-automation': 'WebPresentation_PoiDuration'}
        ]

        for selector in possible_selectors:
            element = soup.find('div', selector)
            if not element:
                element = soup.find('span', selector)
            if element:
                duration = element.get_text(strip=True)
                print(f"  ✓ Found duration with selector: {selector}")
                break

        # Method 2: Search for keywords in text
        if not duration:
            keywords = ['Duration', 'Suggested duration', 'length of visit']
            for keyword in keywords:
                elements = soup.find_all(text=re.compile(keyword, re.I))
                for element in elements:
                    parent = element.find_parent()
                    if parent:
                        text = parent.get_text(strip=True)
                        # Extract time patterns
                        time_match = re.search(r'(\d+[-–]\d+|\d+)\s*(hour|hr|minute|min)s?', text, re.I)
                        if time_match:
                            duration = time_match.group(0)
                            print(f"  ✓ Found duration with keyword: {keyword}")
                            break
                if duration:
                    break

        # Method 3: Look for structured data
        if not duration:
            script_tags = soup.find_all('script', type='application/ld+json')
            for script in script_tags:
                try:
                    import json
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'duration' in str(data).lower():
                        print(f"  ℹ️  Found JSON-LD data (check debug_page.html)")
                except:
                    pass

        # Extract attraction name
        title = soup.find('h1')
        attraction_name = title.get_text(strip=True) if title else "Unknown attraction"

        return {
            'name': attraction_name,
            'url': url,
            'duration': duration if duration else 'No visit duration data found',
            'success': bool(duration)
        }

    except requests.exceptions.HTTPError as e:
        print(f"  ✗ HTTP Error: {e}")
        return {
            'name': 'Request failed',
            'url': url,
            'duration': f'HTTP Error: {str(e)}',
            'success': False
        }
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Request failed: {e}")
        return {
            'name': 'Request failed',
            'url': url,
            'duration': f'Request failed: {str(e)}',
            'success': False
        }
    except Exception as e:
        print(f"  ✗ Parsing failed: {e}")
        return {
            'name': 'Error',
            'url': url,
            'duration': f'Parse failed: {str(e)}',
            'success': False
        }

def scrape_multiple_attractions(urls):
    """
    Scrape multiple attractions with random delays
    """
    results = []

    for i, url in enumerate(urls, 1):
        print(f"\n{'='*60}")
        print(f"Processing {i}/{len(urls)} attraction...")
        print('='*60)

        result = scrape_visit_duration(url)
        results.append(result)

        print(f"\n📍 Attraction: {result['name']}")
        print(f"⏱️  Duration: {result['duration']}")

        # Random wait between requests
        if i < len(urls):
            wait_time = random.uniform(5, 10)
            print(f"\n⏳ Waiting {wait_time:.1f}s before next request...")
            time.sleep(wait_time)

    return results

def save_to_csv(results, filename='stockholm_attractions_duration.csv'):
    """
    Save results to CSV file
    """
    with open(filename, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'url', 'duration', 'success'])
        writer.writeheader()
        writer.writerows(results)

    print(f"\n💾 Data saved to: {filename}")

# ===== TEST WITH STOCKHOLM ATTRACTIONS =====
if __name__ == "__main__":
    print("=" * 60)
    print("🕷️  TripAdvisor Scraper - Stockholm Attractions")
    print("=" * 60)
    print("\n⚠️  Note: TripAdvisor has strong anti-scraping measures.")
    print("This script uses delays and rotating headers to avoid blocking.\n")

    # Start with fewer URLs for testing
    stockholm_urls = [
        "https://www.tripadvisor.com/Attraction_Review-g189852-d243851-Reviews-Vasa_Museum-Stockholm.html",
        "https://www.tripadvisor.com/Attraction_Review-g189852-d195439-Reviews-Skansen-Stockholm.html",
        "https://www.tripadvisor.com/Attraction_Review-g189852-d4454428-Reviews-ABBA_The_Museum-Stockholm.html",
    ]

    print(f"📊 Total attractions to scrape: {len(stockholm_urls)}\n")

    # Scrape all attractions
    results = scrape_multiple_attractions(stockholm_urls)

    # Save to CSV
    save_to_csv(results, filename='stockholm_attractions_duration.csv')

    # Print summary
    print("\n" + "=" * 60)
    print("📈 SCRAPING SUMMARY")
    print("=" * 60)
    success_count = sum(1 for r in results if r['success'])
    print(f"✅ Successfully scraped: {success_count}/{len(results)} attractions")
    print(f"❌ Failed: {len(results) - success_count}/{len(results)} attractions")

    print("\n📋 Detailed Results:")
    print("-" * 60)
    for i, result in enumerate(results, 1):
        status = "✅" if result['success'] else "❌"
        print(f"{i}. {status} {result['name']}")
        print(f"   Duration: {result['duration']}")
        print()

    if success_count == 0:
        print("\n" + "=" * 60)
        print("🔍 TROUBLESHOOTING TIPS:")
        print("=" * 60)
        print("1. Check debug_page.html to see what TripAdvisor returned")
        print("2. Try opening the URLs in your browser to verify they work")
        print("3. Consider using a VPN or proxy")
        print("4. Try the manual inspection method (see below)")
        print("=" * 60)