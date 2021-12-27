const separator = '\t';
let messageList = null;
let calendar = null;

$(function () {
    $('#start').click(() => {
        if(messageList == null || messageList.length == 0) {
            alert('select log folder');
            return;
        }

        deleteResult();
        analyze();
    });

    $('#filepicker').change((e) => {
        loadAllFiles(e);
    });

    $('#month').change((e) => {
        setCalendar(e);
    });

    const today = new Date();
    $('#month').val(`${today.getFullYear()}-${today.getMonth() + 1}`).change();
});

function setCalendar(e) {
    calendar = [];

    let month = e.target.value;
    let dt = new Date(month);
    let lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);

    for (let i = 0; i < lastDay.getDate(); i++) {
        calendar.push(dt.toLocaleDateString());
        dt.setDate(dt.getDate() + 1);
    }
}

function loadAllFiles(e) {
    messageList = [];

    let files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        readFile(files[i], i == files.length - 1);
    }
}

function readFile(file, isLastFile) {
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const messages = JSON.parse(evt.target.result);
            for (const idx in messages) {
                messageList.push(messages[idx]);
            }

            resolve();
        };

        reader.readAsText(file);
    }).then(() => {
        if (isLastFile) {
            setUserList();
        }
    });
}

function setUserList() {
    for (const item of messageList) {
        if ($(`#userList option[value='${item.user}']`).length == 0) {
            $('#userList')
                .append($("<option>")
                    .val(item.user)
                    .text(item.user_profile.real_name));
        }
    }
}

function deleteResult() {
    $('.flex table tr:has(td)').remove();
}

function analyze() {
    let userId = $('#userList').val();
    let userMessages = messageList.filter((item, idx) => item.user == userId);

    // set date
    for (const item of userMessages) {
        let day = parseUnixTimeToDate(item.ts);
        item.day = day.toLocaleDateString();
        item.time = getTime(item.text);
    }

    let dataList = [];
    for (const day of calendar) {
        let obj = { 'day': day, 'startTime': '', 'endTime': '' };

        let list = userMessages.filter((item, idx) => item.day == day && item.time != '');
        if (list.length == 1) {
            obj['warn'] = '`${day}` : NO POST of start or end time';
        }

        for (let i = 0; i < list.length; i++) {
            let item = list[i];

            if (i == 0) {
                obj.startTime = item.time;
                obj.endTime = item.time;
            } else {
                if (compareTime(item.time, obj.startTime)) {
                    obj.startTime = item.time;
                } else {
                    obj.endTime = item.time;
                }
            }
        }

        dataList.push(obj);
    }

    displayData(dataList);
}

function displayData(dataList) {
    const blankRow = `<tr><td><br></td></tr>`;
    for (const item of dataList) {
        $('#days').append(`<tr><td>${item.day}</td></tr>`);

        if(item.startTime == '') {
            $('#startTime').append(blankRow);
        } else {
            $('#startTime').append(`<tr><td>${item.startTime}</td></tr>`);
        }

        if(item.startTime == '') {
            $('#endTime').append(blankRow);
        } else {
            $('#endTime').append(`<tr><td>${item.endTime}</td></tr>`);
        }
    }
}

function getTime(text) {
    const datePattern = /\d{1,2}:?\d{1,2}/g;
    const tempTxt = toHalfWidth(text);
    const time = datePattern.exec(tempTxt);

    let result = '';
    if (time != null) {
        result = time[0];
    }

    return result;
}

function toHalfWidth(input) {
    return input.replace(/[！-～]/g,
        (input) => String.fromCharCode(input.charCodeAt(0) - 0xFEE0)
    );
};

function compareTime(time1, time2) {
    const dummyDate = new Date().toLocaleDateString();
    let date1 = new Date(dummyDate + ' ' + time1);
    let date2 = new Date(dummyDate + ' ' + time2);

    return date1 < date2;
}

function parseUnixTimeToDate(unixTime) {
    return new Date(unixTime * 1000);
}