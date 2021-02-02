$(function() {
    document.getElementById('settings').selectedIndex = parseInt(localStorage.getItem('option'))
    if (localStorage.getItem('list') != null) {
        document.getElementById('list').innerHTML = localStorage.getItem('list')
    }
    if (localStorage.getItem('shows') == null) {
        localStorage.setItem('shows', JSON.stringify({}))
    }
    TheBigBang();
    $('html').append('<script src="js/search.js"></script>')
})

$(document).ready(function() {
    $('#left').click(function() {
        if ($("#right")[0].style.display == "") {
            $("#left").hide();
            TheBigBang(-7);
        }
        else {
            $('#soon').remove();
            $("#right").show();
            $("#left").show();
            TheBigBang();
        }
    })
    $('#right').click(function() {
        if ($("#left")[0].style.display == "") {
            $("#right").hide();
            $('#calendar').remove()
            document.getElementById('month').textContent = "Spring 2021"
            $('body').append(
                '<div id="soon" class="content" align="center">'
                + 'Coming Soon</div>'
            )
        }
        else {
            $("#right").show();
            $("#left").show();
            TheBigBang();
        }
    })
    $('select').change(function() {
        localStorage.setItem('option', $(this)[0].value)
        TheBigBang();
    })
    $("#clear").click(function() {
        $('#clear').css({"visibility": "hidden"})
        $("#show").remove()
        $('#calendar').css({"height": "50rem"})
    })
    $("#list").click(function() {
        if ($(this)[0].innerHTML == "Full List") {
            $(this)[0].innerHTML = "Your List"
            localStorage.setItem('list', "Your List")
        }
        else {
            $(this)[0].innerHTML = "Full List"
            localStorage.setItem('list', "Full List")
        }
        TheBigBang();
    })
})

function TheBigBang(offset) {
    $('#calendar').remove();
    updateTime()
    var option = localStorage.getItem('option')
    switch(option) {
        case "1":
            file = "./shows/cutoff.json"
            break;
        case "2":
            file = "./shows/compact.json"
            break;
        default:
            file = "./shows/full.json"
    }
    fetch(file)
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            var min = JSON.parse(localStorage.getItem('min'))
            if (localStorage.getItem('list') == "Your List" || option == "0" || min == null) {
                $("body").append(calendar(getDates(offset), data));
            }
            else if (option == "1") {
                $("body").append(calendar(getDates(offset), cutoff(data)));
            }
            else {
                compact(data, offset)
            }
            resizeCalendar()
            shows()
        })
}

function calendar(dates, times) {
    var calendar = '<div id="calendar"><table>'
        + '<thead><tr><td class="date"></th>'
    dates.forEach(async function(date) {
            calendar += '<td class="date">' + date.getDate() + ' '
            calendar += date.toLocaleDateString("en-US",{ weekday: 'long' }) + '</td>'
    })
    calendar += '</tr></thead><tbody>'
    times.forEach(async function(time) {
        calendar += '<tr><td class="time">' + time + '</td>'
        for  (var day = 0; day < 7; day++) {
            var date = dates[day]
            calendar += '<td class="slot" id="'
                + ider_slot(date.toLocaleDateString("en-US",{ weekday: 'long' }), time)
                + '"></td>'
        }
        calendar += '</tr>'
    })
    calendar += '</tbody></table></div>'
    var element = document.getElementById('month');
    if (dates[0].getMonth() == dates[6].getMonth()) {
        element.innerHTML = dates[0].toLocaleDateString("en-US",{ month: 'long' })
    }
    else {
        element.innerHTML = dates[0].toLocaleDateString("en-US",{ month: 'long' })
            + " to "
            + dates[6].toLocaleDateString("en-US",{ month: 'long' })
    }
    return calendar
}

function getDates(offset = 0) {
    var dates = []
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    switch(date.getDay()) {
        case 0:
            day += offset - 6;
            break;
        case 1:
            day += offset;
            break;
        case 2:
            day += offset - 1;
            break;
        case 3:
            day += offset - 2;
            break;
        case 4:
            day += offset - 3;
            break;
        case 5:
            day += offset - 4;
            break;
        case 6:
            day += offset - 5;
            break;
    }
    for (i = 0; i < 7; i++) {
        dates.push(new Date(year, month, day + i))
    }
    return dates
}

function ider_slot(day, time) {
    const days = {Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:7}
    var id = days[day] * 10000
    if (time.substring(1,2) == ":") {
        id += parseInt(time.substring(0,1)) * 100
        id += parseInt(time.substring(2,4))
        return id + time.substring(5,6)
    }
    id += parseInt(time.substring(0,2)) * 100
    id += parseInt(time.substring(3,5))
    return id + time.substring(6,7)
}

function ider_show(title) {
    words = title.split(" ")
    return title.length + words.length.toString() + words[words.length - 1].replace(/\W/g, '')
}

function shows() {
    fetch("./shows/shows.json")
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            const shows = JSON.parse(localStorage.getItem("shows"))
            for (show in (document.getElementById('list').innerHTML == "Your List") ? data:shows) {
                var style = ''
                if (shows != null && show in shows) {
                    style = ' style="border-color: #4f004f;" '
                    if (($('#left')[0].style[0] == null) ? shows[show][0]:shows[show][1]) {
                        style = ' style="border-color: #4f004f; color: #4f4f4f;" '
                    }
                }
                var id = "#" + ider_slot(data[show]["day"], data[show]["time"])
                $(id).append('<a href="' + id + '">'
                    + '<button id="'+ ider_show(show) + '" class="show"' + style + '>'
                    + show + '</button></a>'
                )
            }
            $("#show-js").remove()
            $('html').append('<script id="show-js" src="js/show.js"></script>')
        })
}

function cutoff(times) {
    if (JSON.parse(localStorage.getItem('shows')) == null) {
        return times
    }
    var min = JSON.parse(localStorage.getItem('min'))
    var max = JSON.parse(localStorage.getItem('max'))
    for (const [index, time] of times.entries()){
        if (min[1] == time) {
            min = index
        }
        if (max[1] == time) {
            max = index + 1
            break
        }
    }
    return times.slice(min, max)
}

function compact(times, offset) {
    fetch("./shows/shows.json")
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            var times_comp = []
            const shows = JSON.parse(localStorage.getItem('shows'))
            for (time in times) {
                for (show in shows) {
                    if (data[show]['time'] == times[time]) {
                        times_comp.push(times[time])
                        delete shows[show]
                        break
                    }
                }
                if (shows.length == 0) {
                    break
                }
            }
            $("body").append(calendar(getDates(offset), times_comp));
            resizeCalendar()
        })
}

function resizeCalendar() {
    if (Object.keys($("#show")) != 0) {
        $('#calendar').css({"height": "25rem"})
    }
}

function streamInfo(data, show) {
    $("#show").remove()
    $('.arrow').off('click.arrow')
    var streams = '<table class="table table-hover"><tbody><tr><td id="title">'
        + show + '</td></tr>'
    if (Object.keys(data[show]['streams']) == 0) {
        streams += '<tr><td>Streams not available</td></tr><tr><td>'
            + '<img id="cry"src="https://giffiles.alphacoders.com/349/34979.gif"></td></tr>'
    }
    else {
        for (stream in data[show]['streams']) {
            streams += '<tr><td><a class="stream" href="'
            streams += data[show]['streams'][stream]
            streams += '" target="_blank">'
            switch(stream) {
                case "Crunchyroll":
                    streams += '<img class="image" src="assets/crunchyroll.svg">'
                    break;
                case "Funimation":
                    streams += '<img class="image" src="assets/funimation.svg">'
                    break;
                case "VRV":
                    streams += '<img class="image" src="assets/vrv.svg">'
                    break;
                case "AnimeLab":
                    streams += '<img class="image" src="assets/animelab.svg">'
                    break;
                case "Hulu":
                    streams += '<img class="image" src="assets/hulu.svg">'
                    break;
                case "HiDive":
                    streams += '<img class="image" src="assets/hidive.svg">'
                    break;
                case "Wakanim":
                    streams += '<img class="image" src="assets/wakanim.svg">'
                    break;
                case "YouTube":
                    streams += '<img class="image" src="assets/youtube.svg">'
                    break;
                case "Netflix":
                    streams += '<img class="image" src="assets/netflix.svg">'
                    break;
            }
            streams += ' ' + stream + '</a></td>'
        }
    }
    var shows = JSON.parse(localStorage.getItem('shows'))
    const but = (show in shows) ?
        '<button id="sub" class="setter">Remove from Your List</button>':
        '<button id="add" class="setter">Add to Your List</button>'
    const reset = (show in shows && (($('#left')[0].style[0] == null) ?
        shows[show][0]:shows[show][1])) ?
        '<button id="reset" style="visibility: visible;">Reset</button>':
        '<button id="reset" style="visibility: hidden;">Reset</button>'
    $("#content").append('<h3 id="show">'
        + but + reset
        + '<div id="cover"><img src="'
        + data[show]['cover'] + '" width="340" height="440">'
        + '</div><div id="streams">'
        + streams + '</div>'
    )
    $('#calendar').css({"height": "25rem"})
    $('#clear').css({"visibility": "visible"})
    $('#list-js').remove()
    $('html').append('<script id="list-js" src="js/list.js"></script>')
}

function timestamp(offset = 0) {
    var date = new Date()
    const year = date.getFullYear()
    date.setDate(date.getDate() + offset)
    date.setUTCDate(date.getUTCDate() + 4 - date.getUTCDay() || 7);
    const week = Math.ceil((((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7)
    return [week, year]
}

function updateTime() {
    var time = JSON.parse(localStorage.getItem("time"))
    if (time != null) {
        const now = timestamp()
        if (time[0] != now[0] || time[1] != now[1]) {
            localStorage.setItem('time', JSON.stringify(now))
            var shows = JSON.parse(localStorage.getItem("shows"))
            if (shows != null) {
                for (show in shows) {
                    [shows[show][0], shows[show][1]] = [false, shows[show][0]]
                }
                localStorage.setItem('shows', JSON.stringify(shows))
            }
        }
    }
}
