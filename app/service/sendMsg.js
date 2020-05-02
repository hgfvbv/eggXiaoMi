'use strict';

const Service = require('egg').Service;

var https = require('https');
var qs = require('querystring');

class SendMsgService extends Service {
    send(mobile, code) {

        var apikey = this.config.apiKey ? this.config.apiKey : '';
        // 修改为您要发送的手机号码，多个号码用逗号隔开
        var mobile = mobile;
        // 修改为您要发送的短信内容
        var text = `【STL商城】您的验证码是${code}。如非本人操作，请忽略本短信`;

        // 智能匹配模板发送https地址
        var sms_host = 'sms.yunpian.com';

        var send_sms_uri = '/v2/sms/single_send.json';
        // 指定模板发送接口https地址 


        return this.send_sms(send_sms_uri, apikey, mobile, text, sms_host);
    }

    send_sms(uri, apikey, mobile, text, sms_host) {
        var post_data = {
            'apikey': apikey,
            'mobile': mobile,
            'text': text,
        };//这是需要提交的数据  
        var content = qs.stringify(post_data);
        return this.post(uri, content, sms_host);
    }

    post(uri, content, host) {
        var options = {
            hostname: host,
            port: 443,
            path: uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        var req = https.request(options, function (res) {
            // console.log('STATUS: ' + res.statusCode);  
            // console.log('HEADERS: ' + JSON.stringify(res.headers));  
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);     //如果错误  自己把它写入一个日志
                //{"code":0,"msg":"发送成功","count":1,"fee":0.05,"unit":"RMB","mobile":"xxxxxxxxxxx","sid":xxxxxxxxxxx}
                // let res = JSON.parse(chunk);
                console.log(JSON.parse(chunk))
                // console.log(res.code)
                // if (res.code === 0) {
                //     // 无用，只可写日志
                //     isSuccess = true;
                // } else {
                //     isSuccess = false;
                // }
            });
        });
        //console.log(content);
        req.write(content);
        req.end();
    }
}

module.exports = SendMsgService;
