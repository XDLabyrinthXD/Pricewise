import logging
logging.basicConfig(level=logging.DEBUG)
from scrapers.amazon import AmazonScraper

def test():
    scraper = AmazonScraper()
    print("Starting Amazon Scrape...")
    products = scraper.scrape("iphone 15")
    print("Found products:", len(products))
    for p in products:
        print(p)

if __name__ == "__main__":
    test()
