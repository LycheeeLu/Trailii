import requests
from bs4 import BeautifulSoup
import re
import csv
import time

def scrape_visit_duration(url):
    """"
    scrape visit duration from attraction page"""

    # simulate browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }

    try:
        #sending request
        print(f"accessing: {url}")
        response = requests.get(url,
                                headers=headers,
                                timeout= 10)
        response.raise_for_status()

        # HTML parsing
        soup = BeautifulSoup(response.content, 'html.parser')

        # method 1: search for duration or suggest visit time
        duration = None

        possible_selectors = [
            {'data-test-target': 'duration'},
            {'class' : 'duration'},
            {'class': re.compile('duration', re.I)}
        ]

        for selector in possible_selectors:
            element = soup.find('div', selector)
            if element:
                duration = element.get_text(strip=True)
                break

        # method 2: search for relevant words
        if not duration:
            keywords = ['Duration']
            for keyword in keywords:
                element = soup.find(text=re.compile(keyword, re.I))
                if element:
                    parent = element.find_parent()
                    if parent:
                        duration = parent.get_text(strip=True)
                        break


        title = soup.find('h1')
        attraction_name = title.get_text(strip = True) if title else "unknown tourist spots"
        return {
            'name': attraction_name,
            'url': url,
            'duration': duration if duration else 'no visit duration data found',
            'success': bool(duration)
        }
    except requests.exceptions.RequestException as e:
        print(f"failed request: {e}")
        return {
            'name': 'failed request',
            'url': url,
            'duration': f'failed request: {str(e)}',
            'success': False
        }
    except Exception as e:
        print(f"failed parsing: {e}")
        return {
            'name': 'error',
            'url': url,
            'duration': f'parse failed: {str(e)}',
            'success': False
        }


def scrape_multiple_attractions(urls):
    results = []

    for i, url in enumerate(urls, 1):
        print(f"\nprocessing the {i}th/{len(urls)} spots...")
        result = scrape_visit_duration(url)
        results.append(result)

        print(f"spots: {result['name']}")
        print(f"visit duration: {result['duration']}")
        # wait for 3 second
        if i < len(urls):
            time.sleep(3)
    return results


def save_to_csv(results, filename='tripadvisor_duration.csv'):
    with open(filename, 'w', newline = '', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'url', 'duration', 'success'])
        writer.writeheader()
        writer.writerows(results)

    print(f"\nscrape data saved to: {filename}")


