let messageList = null;

function loadAllFiles() {
    messageList = [];

    let files = $('#filepicker')[0].files;
    for (let i = 0; i < files.length; i++) {
        loadFile(files[i], i == files.length -1);
    }
}

function loadFile(file, isLastFile) {
    const reader = new FileReader();
    reader.onload = function (evt) {
        const messages = JSON.parse(evt.target.result);
        for (const idx in messages) {
            messageList.push(messages[idx]);
        }
        
        if (isLastFile) {
            $('#readyState')
                .val(reader.readyState)
                .change(); // hiddenのinputのchangeは自動発火しないため明示的に実行
        }
    };

    reader.readAsText(file);
}

function analyze() {
    console.log(messageList);

    // format messages
    for (const idx in messageList) {
        let item = messageList[idx];
        let ts = parseUnixTimeToDate(item.ts);
        let time = getTime(item.text);

        console.log(ts.toLocaleDateString());
        console.log(time);
        break;
    }
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

$(function(){
    $('#readyState').change(function() {
        if(this.value == FileReader.DONE) {
            analyze();
        }
    });
});
