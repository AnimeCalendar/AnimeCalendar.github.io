"use strict";
const titleList = Object.keys(Object.assign(STORE, PAST)).sort();
const search = document.getElementById('search');
const titles = document.getElementById('titles');
let indexLi = 99;
search.oninput = e => results(e);
search.onfocus = e => e.relatedTarget && e.relatedTarget.className ?
    e.relatedTarget.className != "active" && results(e) : results(e);
search.onkeyup = e => {
    switch (e.key) {
        case "Enter":
            let input = document.getElementById((indexLi == 99 ? indexLi + 1 : indexLi).toString());
            if (input)
                streamInfo(input.innerHTML);
            search.value = "";
            titles.style.display = "none";
            search.blur();
            break;
        case "Escape":
            e.target.blur();
    }
};
search.onkeydown = e => {
    switch (e.keyCode) {
        case 38:
            move(-1);
            e.preventDefault();
            break;
        case 40:
            move(1);
            e.preventDefault();
    }
};
search.addEventListener('focusout', e => {
    titles.style.display = "none";
    if (e.relatedTarget)
        if (e.relatedTarget.className == "active")
            titles.style.display = "";
        else if (e.relatedTarget.parentElement.id == "titles")
            e.relatedTarget.click();
});
function results(e) {
    let input = e.target.value;
    indexLi = 99;
    if (input) {
        titles.style.display = "";
        titles.innerHTML = "";
        let i = 100;
        for (let title of titleList) {
            if (title.toLocaleLowerCase().includes(input.toLocaleLowerCase())) {
                let li = document.createElement('li');
                li.innerHTML = title;
                li.id = i.toString();
                li.tabIndex = i - 100;
                i++;
                li.onclick = e => {
                    streamInfo(e.target.innerHTML);
                    search.value = "";
                    titles.style.display = "none";
                };
                li.onmousemove = e => {
                    indexLi = parseInt(e.target.id);
                    let active = document.querySelector('.active');
                    if (active)
                        active.className = "";
                    document.getElementById(indexLi.toString()).className = 'active';
                };
                li.oncontextmenu = () => titles.style.display = 'none';
                titles.append(li);
            }
        }
        if (i == 100)
            titles.style.display = "none";
    }
    else
        titles.style.display = "none";
}
function move(num) {
    let li = document.getElementById((indexLi + num).toString());
    if (li) {
        li.className = 'active';
        li.focus();
        search.focus();
        if (li.nextElementSibling)
            li.nextElementSibling.className = "";
        if (li.previousElementSibling)
            li.previousElementSibling.className = "";
        if (document.getElementById((indexLi + num).toString()))
            indexLi += num;
    }
}
