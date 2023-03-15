import requests
import csv
from bs4 import BeautifulSoup

# Obtain URL and keywords
url = input("Enter the URL you want to scrape: ")
keywords = input("Enter the keywords you want to search for, separated by commas: ").split(",")

# Send a GET request to the URL and parse the response with Beautiful Soup
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Find all the paragraphs in the HTML and search for the keywords in them
for paragraph in soup.find_all('p'):
    for keyword in keywords:
        if keyword.strip().lower() in paragraph.get_text().strip().lower():
            results = paragraph.get_text().strip()
            print(f"Keyword '{keyword.strip()}' found in paragraph: {paragraph.get_text().strip()}")
        with open('webscrape.csv', 'w', newline='') as text_file:
            writer = csv.writer(text_file)
            for string in results:
                writer.writerow([string])

            ## text_file.write(str(keyword.strip()))

