import time
import random
import re
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
import logging
from .base import BaseScraper

logger = logging.getLogger(__name__)

class FlipkartScraper(BaseScraper):
    def __init__(self):
        super().__init__("Flipkart")

    def scrape(self, search_query):
        logger.info(f"  📱 Fetching {self.source_name}...")
        products = []
        html = ""
        
        try:
            self.create_driver()
            search_url = f"https://www.flipkart.com/search?q={quote_plus(search_query)}"
            self.driver.get(search_url)
            time.sleep(random.uniform(4, 6))
            for _ in range(3):
                self.driver.execute_script("window.scrollBy(0, 1000);")
                time.sleep(1)
            html = self.driver.page_source
        except Exception as e:
            logger.error(f"Error fetching {self.source_name}: {e}")
            return products
        finally:
            self.close_driver()
            
        try:
            soup = BeautifulSoup(html, 'html.parser')
            container_selectors = ["div[data-id]", "div._1AtVbE", "div._13oc-S", "div.tUxRFH", "div._2kHMtA", "div.cPHDOP", "div.slAVV4"]
            
            containers = []
            for selector in container_selectors:
                elements = soup.select(selector)
                if len(elements) >= 3:
                    containers = elements
                    break
            
            for container in containers[:20]:
                title = ""
                for t in container.find_all(string=True):
                    t = t.strip()
                    if len(t) > 15 and self.is_relevant_product(t, search_query):
                        title = t
                        break
                            
                if not title:
                    continue
                
                price_text = "N/A"
                for p in container.find_all(string=True):
                    p = p.strip()
                    if p.startswith('₹') or '₹' in p:
                        if sum(c.isdigit() for c in p) >= 1:
                            price_text = p
                            break
                            
                if price_text == "N/A":
                    continue
                    
                product_url = search_url
                for elem in container.find_all('a', href=True):
                    href = elem.get('href', '')
                    if len(href) > 8 and not href.startswith('#') and 'javascript' not in href.lower():
                        product_url = href if href.startswith('http') else f"https://www.flipkart.com{href}"
                        break
                        
                rating = "N/A"
                for elem in container.find_all(['div', 'span']):
                    r_text = elem.get_text(strip=True)
                    if r_text and ('★' in r_text or (len(r_text) <= 3 and '.' in r_text and sum(c.isdigit() for c in r_text) >= 1)):
                        if len(r_text) <= 5: 
                            rating = r_text
                            break
                        
                image_url = "N/A"
                img_elem = container.select_one("img")
                if img_elem:
                    image_url = img_elem.get('src') or img_elem.get('data-src') or "N/A"
                
                container_text = " ".join([t.strip() for t in container.find_all(string=True)])
                products.append({
                    'title': title,
                    'price': price_text,
                    'price_num': self.extract_price(price_text),
                    'rating': rating,
                    'category': self.auto_categorize_product(title),
                    'source': self.source_name,
                    'url': product_url,
                    'image': image_url,
                    'storage': self.extract_storage(title),
                    'color': self.extract_color(title),
                    'discount': self.extract_discount(container_text)
                })
        except Exception as e:
            logger.error(f"Error parsing {self.source_name}: {e}")
            
        logger.info(f"  ✅ Found {len(products)} products on {self.source_name}")
        return products
