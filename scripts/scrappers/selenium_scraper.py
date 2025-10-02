"""
TripAdvisor Scraper using Selenium (Real Browser)
Usage: python3 selenium_stockholm_scraper.py
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import random
import csv
import re

def setup_driver(headless=False):
    """
    Setup Chrome WebDriver with options
    headless=True: Run without opening browser window
    headless=False: Open browser window (easier to debug)
    """
    chrome_options = Options()

    if headless:
        chrome_options.add_argument('--headless')

    # Anti-detection options
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    # Exclude automation flags
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # Setup driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Execute script to hide webdriver property
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    return driver

def scrape_visit_duration_selenium(driver, url):
    """
    Scrape visit duration using Selenium
    """
    try:
        print(f"\n{'='*60}")
        print(f"Accessing: {url}")
        print('='*60)

        # Load page
        driver.get(url)

        # Random human-like delay
        time.sleep(random.uniform(3, 6))

        # Wait for page to load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "h1"))
            )
        except:
            print("  ⚠️  Page load timeout, continuing anyway...")

        # Scroll page (human-like behavior)
        driver.execute_script("window.scrollTo(0, 500);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 0);")

        # Get page source
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        # Save HTML for debugging
        with open('selenium_debug.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        print("  💾 Saved HTML to selenium_debug.html")

        # Extract attraction name
        attraction_name = "Unknown attraction"
        try:
            title_element = driver.find_element(By.TAG_NAME, "h1")
            attraction_name = title_element.text.strip()
            print(f"  📍 Attraction: {attraction_name}")
        except:
            print("  ⚠️  Could not find attraction name")

        # Method 1: Try to find duration with various selectors
        duration = None

        # Try different XPath patterns
        xpath_patterns = [
            "//div[contains(text(), 'Duration')]",
            "//div[contains(text(), 'Suggested duration')]",
            "//span[contains(text(), 'Duration')]",
            "//*[contains(@class, 'duration')]",
            "//*[contains(text(), 'hour') or contains(text(), 'hours')]",
        ]

        for xpath in xpath_patterns:
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                for element in elements:
                    text = element.text.strip()
                    if text and ('hour' in text.lower() or 'minute' in text.lower() or 'duration' in text.lower()):
                        # Extract time pattern
                        time_match = re.search(r'(\d+[-–]\d+|\d+)\s*(hour|hr|minute|min)s?', text, re.I)
                        if time_match:
                            duration = time_match.group(0)
                            print(f"  ✅ Found duration: {duration}")
                            print(f"  📝 Full text: {text}")
                            break
                if duration:
                    break
            except:
                continue

        # Method 2: Search in BeautifulSoup
        if not duration:
            print("  🔍 Trying BeautifulSoup search...")
            keywords = ['Duration', 'Suggested duration', 'length of visit']
            for keyword in keywords:
                elements = soup.find_all(text=re.compile(keyword, re.I))
                for element in elements:
                    parent = element.find_parent()
                    if parent:
                        text = parent.get_text(strip=True)
                        time_match = re.search(r'(\d+[-–]\d+|\d+)\s*(hour|hr|minute|min)s?', text, re.I)
                        if time_match:
                            duration = time_match.group(0)
                            print(f"  ✅ Found duration: {duration}")
                            break
                if duration:
                    break

        # Method 3: Look for all text containing time patterns
        if not duration:
            print("  🔍 Searching all text for time patterns...")
            all_text = soup.get_text()
            # More flexible time pattern
            time_patterns = [
                r'(\d+[-–]\d+)\s*(hour|hr)s?',
                r'(\d+)\s*to\s*(\d+)\s*(hour|hr)s?',
                r'about\s*(\d+)\s*(hour|hr)s?',
                r'(\d+)\s*(hour|hr)s?'
            ]
            for pattern in time_patterns:
                matches = re.findall(pattern, all_text, re.I)
                if matches:
                    duration = ' '.join(matches[0]) if isinstance(matches[0], tuple) else matches[0]
                    print(f"  ✅ Found duration pattern: {duration}")
                    break

        if not duration:
            print("  ❌ No duration information found")
            print("  💡 Check selenium_debug.html to manually find the duration")

        return {
            'name': attraction_name,
            'url': url,
            'duration': duration if duration else 'No visit duration data found',
            'success': bool(duration)
        }

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return {
            'name': 'Error',
            'url': url,
            'duration': f'Error: {str(e)}',
            'success': False
        }

def scrape_multiple_attractions(urls, headless=False):
    """
    Scrape multiple attractions
    """
    print("\n🚀 Starting browser...")
    driver = setup_driver(headless=headless)
    results = []

    try:
        for i, url in enumerate(urls, 1):
            print(f"\n{'='*60}")
            print(f"Processing {i}/{len(urls)} attraction")
            print('='*60)

            result = scrape_visit_duration_selenium(driver, url)
            results.append(result)

            # Random wait between requests
            if i < len(urls):
                wait_time = random.uniform(5, 10)
                print(f"\n⏳ Waiting {wait_time:.1f}s before next request...")
                time.sleep(wait_time)

    finally:
        print("\n🔒 Closing browser...")
        driver.quit()

    return results

def save_to_csv(results, filename='stockholm_attractions_selenium.csv'):
    """
    Save results to CSV file
    """
    with open(filename, 'w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'url', 'duration', 'success'])
        writer.writeheader()
        writer.writerows(results)

    print(f"\n💾 Data saved to: {filename}")

# ===== MAIN =====
if __name__ == "__main__":
    print("=" * 60)
    print("🕷️  TripAdvisor Selenium Scraper - Stockholm Attractions")
    print("=" * 60)

    # Stockholm attraction URLs
    stockholm_urls = [
        "https://www.tripadvisor.com/Attraction_Review-g189852-d243851-Reviews-Vasa_Museum-Stockholm.html",
        "https://www.tripadvisor.com/Attraction_Review-g189852-d195439-Reviews-Skansen-Stockholm.html",
    ]

    print(f"\nTotal attractions to scrape: {len(stockholm_urls)}")
    print("\n Settings:")
    print("   - Browser: Chrome")
    print("   - Headless: No (you'll see the browser window)")
    print("   - Delays: 5-10 seconds between requests")

    # Choose headless mode
    print("\n❓ Run in headless mode (no browser window)?")
    print("   Recommended: No (easier to see what's happening)")
    headless_mode = False  # Set to True to run without browser window

    # Start scraping
    print("\n🎬 Starting in 3 seconds...")
    time.sleep(3)

    results = scrape_multiple_attractions(stockholm_urls, headless=headless_mode)

    # Save to CSV
    save_to_csv(results)

    # Print summary
    print("\n" + "=" * 60)
    print("=" * 60)
    success_count = sum(1 for r in results if r['success'])
    print(f"Success: {success_count}/{len(results)} attractions")
    print(f"Failed: {len(results) - success_count}/{len(results)} attractions")

    print("\n📋 Detailed Results:")
    print("-" * 60)
    for i, result in enumerate(results, 1):
        status = "✅" if result['success'] else "❌"
        print(f"{i}. {status} {result['name']}")
        print(f"   Duration: {result['duration']}")

    print("\n" + "=" * 60)
    print("✨ Done!")
    print("=" * 60)