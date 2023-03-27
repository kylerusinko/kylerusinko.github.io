function main() {
    $.ajax({
        type: "POST",
        url: "https://github.com/kylerusinko/web_scraper/blob/main/webscraper.py",
        data: { param: text }
    }).done(function (o) {
        print("Hello World")
    });
}