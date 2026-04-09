from bs4 import BeautifulSoup
import re

with open("amazon_dump.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
container = soup.select_one("[data-component-type='s-search-result']")

print("H2:")
print(container.select_one("h2"))
print("A:")
print(container.select_one("h2 a"))
