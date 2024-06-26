from json import dump
from os import popen

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.remote.webelement import WebElement


def main():
    profile = popen('ls ~/.mozilla/firefox/ | grep "default"').read().split("\n")[0]
    user = popen("whoami").read()[0:-1]
    options = Options()
    options.set_preference("profile", "/home/" + user + "/.mozilla/firefox/" + profile)
    driver = webdriver.Firefox(
        service=Service(executable_path="/usr/bin/geckodriver", log_path="/dev/null"),
        options=options,
    )
    driver.maximize_window()
    driver.get("https://animeschedule.net/seasons/summer-2024")
    shows = {}
    show: WebElement
    for show in driver.find_element(By.CLASS_NAME, "shows-container").find_elements(
        By.CLASS_NAME, "anime-tile"
    ):
        title: str = show.find_element(By.CLASS_NAME, "anime-tile-title").get_attribute(
            "innerText"
        )
        cover: str = show.find_element(
            By.CLASS_NAME, "anime-tile-thumbnail"
        ).get_attribute("src")[77:-4]
        # while "placeholder" in cover:
        #     cover = show.find_element(By.CLASS_NAME, 'show-poster').get_attribute('src')
        try:
            studio = show.find_element(By.CLASS_NAME, "anime-tile-stu").get_attribute(
                "innerText"
            )
        except NoSuchElementException:
            studio = "N/A"
        source = show.find_element(By.CLASS_NAME, "anime-tile-sou").get_attribute(
            "innerText"
        )
        genres = [
            ele.get_attribute("innerText")
            for ele in show.find_elements(By.CLASS_NAME, "anime-tile-genre")
        ]
        content = {
            "title": title,
            "cover": cover,
            "studio": studio,
            "source": source,
            "genres": genres,
        }
        shows.update({show.get_attribute("showid"): content})
    shows = dict(sorted(shows.items(), key=lambda item: item[1]["title"]))
    with open("indent.json", "w", encoding="utf-8") as file:
        dump(shows, file, indent=2)
    with open("shows.json", "w", encoding="utf-8") as file:
        dump(shows, file, separators=(",", ":"))
    driver.quit()


if __name__ == "__main__":
    main()
