// TODO
// ファイル名の日付≠メッセージの日付　12:00～翌12:00をとっている？　→tsから判断する
// 日付をまたぐ場合→アラートは出すが対象外

function analyze() {
    let files = document.getElementById('filepicker').files;
    
    // get messages
    let messageList = readFiles(files);
    // format messages
    test(files);
}

function test(files) {
    for (let i=0; i<files.length; i++) {
        let file = files[i];
        let ret = loadFile(file);
        console.log(ret);
    }
}

function loadFile(file) {
    const reader = new FileReader();        
    reader.onload = function(evt) {
        const messages = JSON.parse(evt.target.result);
        console.log(messages);
    };

    reader.readAsText(file);
}


function func(files) {
    
    new Promise((resolve) => {
        let messageList = [];
        const reader = new FileReader();
        reader.onload = function(evt) {
            const messages = JSON.parse(evt.target.result);
            messageList.push(messages);
        };
    
        for (let i=0; i<files.length; i++) {
            let file = files[i];
            reader.readAsText(file);
            break;
        }

        resolve(messageList);
    }).then(
        response => {
            console.log(response);
        }
    );
}

function readFiles(files) {
    let messageList= [];
    let asyncProcess = function(flag) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if(flag) {
                    resolve('true');
                } else {
                    reject('false');
                }

            }, 500);
        });
    }

    asyncProcess(false).then(
        response => {
            //console.log(response);
        },
        error => {
            //console.log('NG');
        }
    )

    const reader = new FileReader();
    reader.onload = function(evt) {
        const messages = JSON.parse(evt.target.result);
       // callback(messages);
    };

    for (let i=0; i<files.length; i++) {
        let file = files[i];
        console.log(file.name);
        reader.readAsText(file);
        break;
    }
    //console.log(messageList);
    return messageList;
}

function readFiles2(files) {
    const reader = new FileReader();
    reader.addEventListener('load', function() {
        readJson(reader.result);
    }, true)

    for (let i=0; i<files.length; i++) {
        let file = files[i];
        console.log(file.name);
        reader.readAsText(file);
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

        let obj = { 'userId':key, 'userName':userName };

        for (let i=0; i<list.length; i++) {
            let item = list[i];
            let ts = parseUnixTimeToDate(item.ts);
            console.log(ts.toLocaleDateString());
            let time = getTime(item.text);
            timeList.push(time);

            if(i == 0) {
                obj['startTime'] = time;
                obj['endTime'] = time;
            } else {
                if(compareTime(time, obj['startTime'])) {
                    obj['startTime'] = time;
                } else {
                    obj['endTime'] = time;
                }
            }
        }

        if(list.length != 2) {
            obj['warn'] = 'input error';
        }
        console.log(obj);
    }
}

function getUserList(messages) {
    let userList = {};
    for (let i=0; i<messages.length; i++) {
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
    console.log(result);
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