# Kyle Rusinko
# Web Scraper Senior Capstone
# Last Updated: March 25, 2023
import csv
import asyncio
import aiohttp
import micropip
from bs4 import BeautifulSoup
from pyscript import *


async def main():
    await lets_go_scraping()

async def lets_go_scraping():
    # Obtain URL and keywords
    # url = input("Enter the URL you want to scrape: ")
    # keywords = input("Enter the keywords you want to search for, separated by commas: ").split(",")

    # FOR TESTING
    url = "https://www.example.com"
    keywords = ("example, domain").split(",")

    # Send a GET request to the URL and parse the response with Beautiful Soup
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                html = await response.text()
        soup = BeautifulSoup(html, 'html.parser')
    except:
        print("Error parsing information")

    # Find all the paragraphs in the HTML and search for the keywords in them
    for paragraph in soup.find_all('p'):
        for keyword in keywords:
            try:
                if keyword.strip().lower() in paragraph.get_text().strip().lower():
                    results = paragraph.get_text().strip()
                    print(
                        f"Keyword '{keyword.strip()}' found in paragraph: {paragraph.get_text().strip()}")
            except:
                print("Error found when scraping")
            try:
                with open('webscrape.csv', 'w', newline='') as text_file:
                    writer = csv.writer(text_file)
                    for string in results:
                        writer.writerow([string])
            except:
                print("Error writing to CSV file")

asyncio.run(main())
