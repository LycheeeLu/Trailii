import tripadvisor_scraper

# ===== TEST WITH STOCKHOLM ATTRACTIONS =====
if __name__ == "__main__":
    print("=" * 60)
    print("Testing TripAdvisor Scraper with Stockholm Attractions")
    print("=" * 60)

    # Stockholm attraction URLs
    stockholm_urls = [
        # Vasa Museum
        "https://www.tripadvisor.com/Attraction_Review-g189852-d243851-Reviews-Vasa_Museum-Stockholm.html",

        # Skansen Open-Air Museum
        "https://www.tripadvisor.com/Attraction_Review-g189852-d195439-Reviews-Skansen-Stockholm.html",

        # ABBA The Museum
        "https://www.tripadvisor.com/Attraction_Review-g189852-d4454428-Reviews-ABBA_The_Museum-Stockholm.html",

        # Royal Palace (Kungliga Slottet)
        "https://www.tripadvisor.com/Attraction_Review-g189852-d243844-Reviews-Royal_Palace-Stockholm.html",

        # Gamla Stan (Old Town)
        "https://www.tripadvisor.com/Attraction_Review-g189852-d243843-Reviews-Gamla_Stan-Stockholm.html",
    ]

    print(f"\nTotal attractions to scrape: {len(stockholm_urls)}\n")

    # Scrape all attractions
    results = tripadvisor_scraper.scrape_multiple_attractions(stockholm_urls)

    # Save to CSV
    tripadvisor_scraper.save_to_csv(results, filename='stockholm_attractions_duration.csv')

    # Print summary
    print("\n" + "=" * 60)
    print("SCRAPING SUMMARY")
    print("=" * 60)
    success_count = sum(1 for r in results if r['success'])
    print(f"Successfully scraped: {success_count}/{len(results)} attractions")
    print(f"Failed: {len(results) - success_count}/{len(results)} attractions")

    print("\nDetailed Results:")
    print("-" * 60)
    for i, result in enumerate(results, 1):
        status = "✓" if result['success'] else "✗"
        print(f"{i}. {status} {result['name']}")
        print(f"   Duration: {result['duration']}")
        print()