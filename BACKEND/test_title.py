from bs4 import BeautifulSoup
import re
from scrapers.base import BaseScraper

base = BaseScraper("test")

with open("amazon_dump.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
containers = soup.select("[data-component-type='s-search-result']")

for container in containers[:5]:
    title = ""
    for text_node in container.find_all(string=True):
        t = text_node.strip()
        if len(t) > 15 and "bought in past" not in t.lower() and "price" not in t.lower():
            if base.is_relevant_product(t, "iphone 15"):
                title = t
                break
                
    price = "N/A"
    for text_node in container.find_all(string=True):
        p = text_node.strip()
        if p.startswith('₹') or '₹' in p:
            if sum(c.isdigit() for c in p) >= 3:
                price = p
                break
                
    url = "N/A"
    for elem in container.find_all('a', href=True):
        href = elem['href']
        if '/dp/' in href:
            url = href
            break
            
    print(f"Title: {title} | Price: {price}")
