from selenium import webdriver
from shows import shows
from sys import argv

def main():
    sh = shows(webdriver.Firefox(service_log_path = '/dev/null',
        firefox_profile = webdriver.FirefoxProfile("/home/dosx/.mozilla/firefox/eg34u3uo.default")))
    sh.html()
    if len(argv) == 1:
        sh.update()
    elif argv[1] == "n":
        sh.rename()
    else:
        sh.updateStreams()
    sh.driver.quit()

if __name__ == "__main__":
    main()