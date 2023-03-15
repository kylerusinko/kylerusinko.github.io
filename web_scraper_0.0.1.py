## Kyle Rusinko
## Web Scraper 0.0.1
## Last Updated: Feb 19, 2023
import urllib.request

userKeyword = input("Keyword: ")
userUrl = input("URL: ")
with urllib.request.urlopen(userUrl) as webpage:
    webpage_content = webpage.read().decode("utf-8")
if userKeyword in webpage_content:
  print(f"'{userKeyword}' found in '{userUrl}'")
else:
  print(f"'{userKeyword}' not found in '{userUrl}'")

print(webpage_content)


## This is code to get a string of words and also write out a word on each side
## (This will be useful for reprinting what the user input along with some words near it
def get_surrounding_words(string, word, offset):
  words = string.split()
  try:
    index = words.index(word)
    return " ".join(words[index - offset : index + offset + 1])
  except ValueError:
    return f"'{word}' not found in '{string}'"

string = webpage
word = userInput
offset = 2
result = get_surrounding_words(string, word, offset)
print(result)
