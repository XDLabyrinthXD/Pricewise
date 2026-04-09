import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
import re
import logging
import threading

logger = logging.getLogger(__name__)

driver_creation_lock = threading.Lock()

class BaseScraper:
    def __init__(self, source_name):
        self.source_name = source_name
        self.driver = None
        self.pincode = "400001"

    def create_driver(self):
        """Create and configure Chrome driver, returns driver instance"""
        try:
            options = uc.ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            # Using a lock here ensures undetected_chromedriver doesn't encounter FileExistsErrors 
            # while multiple threads attempt to patch the chromedriver.exe binary simultaneously.
            with driver_creation_lock:
                self.driver = uc.Chrome(options=options, version_main=146)
            
            return self.driver
        except Exception as e:
            logger.error(f"Error creating driver for {self.source_name}: {e}")
            raise

    def close_driver(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass
            self.driver = None

    def extract_price(self, price_text):
        """Extract numeric price from text"""
        if not price_text or price_text == "N/A":
            return None
        cleaned_price = re.sub(r'[^\d,]', '', price_text)
        price_match = re.search(r'[\d,]+', cleaned_price.replace(',', ''))
        if price_match:
            return int(price_match.group().replace(',', ''))
        return None

    def extract_storage(self, title):
        match = re.search(r'(\d{2,4}\s*[GT]B)', title, re.IGNORECASE)
        return match.group(1).upper().replace(" ", "") if match else "N/A"
        
    def extract_color(self, title):
        colors = ['Black', 'Blue', 'White', 'Silver', 'Gold', 'Titanium', 'Green', 'Red', 'Pink', 'Yellow', 'Purple', 'Grey', 'Gray', 'Midnight', 'Starlight']
        title_lower = title.lower()
        
        # Look for exact word match
        words = re.findall(r'\b\w+\b', title_lower)
        for color in colors:
            if color.lower() in words:
                return color
                
        # Fallback to substring
        for color in colors:
            if color.lower() in title_lower:
                return color
        return "N/A"

    def extract_discount(self, text):
        match = re.search(r'(\d+(?:\.\d+)?\s*%\s*(?:off|OFF)?)', text, re.IGNORECASE)
        return match.group(1).upper() if match else "N/A"

    def is_relevant_product(self, title, search_query):
        """Check if product title is relevant to search query"""
        if not title or len(title) < 3:
            return False
        
        title_lower = title.lower()
        query_lower = search_query.lower()
        
        # Filter out accessories when searching for main devices
        main_device_keywords = ['iphone', 'phone', 'mobile', 'samsung', 'pixel', 'oneplus']
        accessory_keywords = ['cover', 'case', 'protector', 'screen guard', 'tempered glass', 'pouch', 'skin']
        
        if any(dev in query_lower for dev in main_device_keywords):
            if any(acc in title_lower for acc in accessory_keywords):
                return False
        
        # Check word matching
        stop_words = {'for', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'and', 'or', 'with', 'gb', 'ram', 'rom', 'of'}
        query_words = [word for word in query_lower.split() if len(word) > 1 and word not in stop_words]
        
        if not query_words:
            return False
            
        # Strict enforcement: Any querying word >= 4 chars MUST be exactly in the title.
        for word in query_words:
            if len(word) >= 4 and word not in title_lower:
                return False
        
        match_count = sum(1 for word in query_words if word in title_lower)
        return match_count >= len(query_words) / 2

    def auto_categorize_product(self, title):
        """Automatically categorize product based on title"""
        title_lower = title.lower()
        
        categories = {
            "Mobile Phones": ['phone', 'mobile', 'iphone', 'samsung', 'oneplus', 'pixel'],
            "Laptops": ['laptop', 'notebook', 'macbook', 'chromebook'],
            "Television": ['tv', 'television', 'smart tv', 'led tv'],
            "Audio Accessories": ['headphone', 'earphone', 'earbud', 'airpods'],
            "Mobile Accessories": ['charger', 'cable', 'adapter', 'power bank'],
            "Wearables": ['watch', 'smartwatch', 'fitness band'],
            "Cameras": ['camera', 'dslr', 'gopro'],
            "Apparel": ['shirt', 't-shirt', 'tshirt', 'polo', 'top', 'blouse', 'hoodie', 'sweatshirt'],
            "Bottoms": ['jeans', 'trouser', 'pant', 'cargo', 'chino'],
            "Footwear": ['shoe', 'sneaker', 'boot', 'sandal', 'slipper', 'footwear'],
            "Kitchen Appliances": ['mixer', 'grinder', 'blender', 'juicer', 'cooker'],
            "Furniture": ['sofa', 'chair', 'table', 'bed', 'mattress'],
            "Personal Care": ['shampoo', 'conditioner', 'hair oil', 'soap', 'facewash'],
            "Beauty & Cosmetics": ['makeup', 'lipstick', 'kajal', 'mascara', 'foundation'],
        }
        
        for category, keywords in categories.items():
            if any(word in title_lower for word in keywords):
                return category
        
        return "General Products"

    def scrape(self, search_query):
        """Abstract method to be implemented by child classes"""
        raise NotImplementedError("Subclasses must implement scrape()")
