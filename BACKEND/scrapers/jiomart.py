import time
import random
import re
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
import logging
from .base import BaseScraper

logger = logging.getLogger(__name__)

class JioMartScraper(BaseScraper):
    def __init__(self):
        super().__init__("JioMart")

    def scrape(self, search_query):
        logger.info(f"  🔵 Fetching {self.source_name}...")
        products = []
        html = ""
        
        try:
            self.create_driver()
            
            # Set dynamic pincode to prevent JioMart from blocking results locally
            self.driver.get("https://www.jiomart.com/robots.txt")
            for cookie_name in ["pincode", "I2_PINCODE", "nms_mgo_pincode", "default_pincode"]:
                try:
                    self.driver.add_cookie({"name": cookie_name, "value": str(self.pincode), "domain": ".jiomart.com"})
                except: pass

            search_url = f"https://www.jiomart.com/search/{quote_plus(search_query)}"
            self.driver.get(search_url)
            time.sleep(random.uniform(4, 6))
            for _ in range(2):
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
            containers = soup.select("div.plp-card-container, div.product-card, div.col-md-3")
            
            for container in containers[:15]:
                title = ""
                for t in container.find_all(string=True):
                    t = t.strip()
                    if len(t) > 10 and self.is_relevant_product(t, search_query):
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
                    if '/p/' in href and not href.startswith('#'):
                        product_url = href if href.startswith('http') else f"https://www.jiomart.com{href}"
                        break
                
                image_url = "N/A"
                img_elem = container.select_one("img")
                if img_elem and img_elem.has_attr('src'):
                    image_url = img_elem['src']
                
                container_text = " ".join([t.strip() for t in container.find_all(string=True)])
                products.append({
                    'title': title,
                    'price': price_text,
                    'price_num': self.extract_price(price_text),
                    'rating': "N/A",
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
