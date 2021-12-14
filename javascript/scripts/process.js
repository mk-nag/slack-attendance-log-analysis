let messageList = null;
let calendar = null;

$(function () {
    $('#start').click(function () {
        analyze();
    });

    $('#filepicker').change(function () {
        loadAllFiles();
    });

    $('#month').change(function () {
        setCalendar();
    });

    const today = new Date();
    $('#month').val(`${today.getFullYear()}-${today.getMonth() + 1}`).change();
});

function loadAllFiles() {
    messageList = [];

    let files = $('#filepicker')[0].files;
    for (let i = 0; i < files.length; i++) {
        readFile(files[i], i == files.length - 1);
    }
}

function setCalendar() {
    calendar = [];

    let month = $('#month').val();
    let dt = new Date(month);
    let lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);

    for (let i = 0; i < lastDay.getDate(); i++) {
        calendar.push(dt.toLocaleDateString());
        dt.setDate(dt.getDate() + 1);
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

            resolve(reader.readyState);
        };

        reader.readAsText(file);
    }).then((response) => {
        if (isLastFile) {
            setUserList();
        }
    });
}

function setUserList() {
    for (const item of messageList) {
        if ($('#userList option[value="' + item.user + '"]').length == 0) {
            $('#userList')
                .append($("<option>")
                .val(item.user)
                .text(item.user_profile.real_name));
        }
    }
}

function analyze() {
    let userId = $('#userList').val();
    let userMessages = messageList.filter((item, idx) => item.user == userId);
    console.log(userId);
   

    // format messages
    for (const item of userMessages) {
        let day = parseUnixTimeToDate(item.ts);
        item.day = day.toLocaleDateString();
        item.time = getTime(item.text);
    }

    console.log(userMessages);
}

function readJson(file) {
    const messages = JSON.parse(file);
    const userList = getUserList(messages);

    for (const key in userList) {
        let userName = userList[key].real_name;

        let list = messages.filter((item, idx) => item.user == key);
        let timeList = [];

        let obj = { 'userId': key, 'userName': userName };

        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let ts = parseUnixTimeToDate(item.ts);
            console.log(ts.toLocaleDateString());
            let time = getTime(item.text);
            timeList.push(time);

            if (i == 0) {
                obj['startTime'] = time;
                obj['endTime'] = time;
            } else {
                if (compareTime(time, obj['startTime'])) {
                    obj['startTime'] = time;
                } else {
                    obj['endTime'] = time;
                }
            }
        }

        if (list.length != 2) {
            obj['warn'] = 'input error';
        }
        console.log(obj);
    }
}

function getUserList(messages) {
    let userList = {};
    for (let i = 0; i < messages.length; i++) {
        let item = messages[i];
        userList[item.user] = item.user_profile;
    }

    return userList;
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