class Search {
  titleList: string[];

  search: HTMLInputElement;

  titles: HTMLElement;

  indexLi: number;

  constructor(list: string[]) {
    this.titleList = list.sort();
    this.search = <HTMLInputElement>document.getElementById('search')!;
    this.titles = document.getElementById('titles')!;
    this.indexLi = 99;
    this.search.oninput = (e) => this.results(e);
    this.search.onfocus = (e) =>
      e.relatedTarget && (<HTMLElement>e.relatedTarget).className
        ? (<HTMLElement>e.relatedTarget).className !== 'active' &&
          this.results(e)
        : this.results(e);
    this.search.onkeyup = (e) => {
      switch (e.key) {
        case 'Enter': {
          const input = document.getElementById(
            (this.indexLi === 99 ? this.indexLi + 1 : this.indexLi).toString(),
          );
          if (this.search.value && input) CAL.streamInfo(input.innerHTML);
          this.search.value = '';
          this.titles.style.display = 'none';
          this.search.blur();
          break;
        }
        case 'Escape':
          (<HTMLElement>e.target!).blur();
          break;
        default:
      }
    };
    this.search.onkeydown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.move(-1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.move(1);
          e.preventDefault();
          break;
        default:
      }
    };
    this.search.addEventListener('focusout', (e) => {
      this.titles.style.display = 'none';
      e.relatedTarget &&
        ((<HTMLElement>e.relatedTarget).className === 'active'
          ? (this.titles.style.display = '')
          : (<HTMLElement>e.relatedTarget).parentElement!.id === 'titles' &&
            (<HTMLElement>e.relatedTarget).click());
    });
  }

  results(e: Event) {
    const input = (<HTMLInputElement>e.target!).value;
    let i = 100;
    this.indexLi = 99;
    if (input) {
      this.titles.innerHTML = '';
      for (const title of this.titleList) {
        if (title.toLocaleLowerCase().includes(input.toLocaleLowerCase())) {
          const li: HTMLLIElement = document.createElement('li');
          li.innerHTML = title;
          li.id = i.toString();
          li.tabIndex = i - 100;
          i++;
          li.onclick = (e) => {
            CAL.streamInfo((<HTMLElement>e.target).innerHTML);
            this.search.value = '';
            this.titles.style.display = 'none';
          };
          li.onmousemove = (e) => {
            this.indexLi = Number((<HTMLElement>e.target).id);
            const active = document.querySelector('.active');
            if (active) active.className = '';
            (<HTMLElement>e.target)!.className = 'active';
          };
          li.oncontextmenu = () => (this.titles.style.display = 'none');
          this.titles.append(li);
        }
      }
    }
    this.titles.style.display = i > 100 ? '' : 'none';
  }

  move(num: number) {
    const li = document.getElementById((this.indexLi + num).toString());
    if (li) {
      li.className = 'active';
      li.focus();
      this.search.focus();
      if (li.nextElementSibling) li.nextElementSibling.className = '';
      if (li.previousElementSibling) li.previousElementSibling.className = '';
      if (document.getElementById((this.indexLi + num).toString()))
        this.indexLi += num;
    }
  }
}
