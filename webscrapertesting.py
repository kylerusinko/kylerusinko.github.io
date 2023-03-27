# Kyle Rusinko
# Web Scraper Senior Capstone
# Last Updated: March 25, 2023
import csv
import pandas as pd
import requests
from bs4 import BeautifulSoup
from pyscript import *

def lets_go_scraping():
    #Obtain URL and keywords
    url = input("Enter the URL you want to scrape: ")
    keywords = input("Enter the keywords you want to search for, separated by commas: ").split(",")

    # Send a GET request to the URL and parse the response with Beautiful Soup
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
    except:
        print("Error parsing information")

    # Find all the paragraphs in the HTML and search for the keywords in them

    for paragraph in soup.find_all('p'):
        for keyword in keywords:
            try:
                if keyword.strip().lower() in paragraph.get_text().strip().lower():
                    results = paragraph.get_text().strip()
                    print(f"Keyword '{keyword.strip()}' found in paragraph: {paragraph.get_text().strip()}")
            except:
                print("Error found when scraping")
            try:
                with open('webscrape.csv', 'w', newline='') as text_file:
                    writer = csv.writer(text_file)
                    for string in results:
                        writer.writerow([string])
            except:
                print("Error writing to CSV file")
lets_go_scraping()