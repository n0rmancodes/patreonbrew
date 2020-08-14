const got = require("got");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json"))
const { NumberPrompt } = require('enquirer');

if (
    config.user_agent == "/REPLACE-WITH-UA/" | 
    config.session_id == "/REPLACE-WITH-COOKIE/" |
    config.device_id == "/REPLACE-WITH-COOKIE/"
) {
    console.log("please replace all values marked to be replaced");
    console.log("see /README.md for more information");
    return;
}

var countryCode = config.locale_code.split("-")[1];
var localeCode = config.locale_code;

var cookie = "patreon_device_id=" + config.device_id + "; patreon_location_country_code=" + countryCode + "; patreon_locale_code=" + localeCode + "; G_ENABLED_IDPS=google; session_id=" + config.session_id + ";"

let choiceArray = [];

got("https://www.patreon.com/api/current_user?include=pledges.creator.campaign.null%2Cpledges.campaign.null%2Cfollows.followed.campaign.null&fields[user]=image_url%2Cfull_name%2Curl%2Csocial_connections&fields[campaign]=avatar_photo_url%2Ccreation_name%2Cpay_per_name%2Cis_monthly%2Cis_nsfw%2Cname%2Curl&fields[pledge]=amount_cents%2Ccadence&fields[follow]=[]&json-api-version=1.0", {
    headers: {
        "Host": "www.patreon.com",
        "User-Agent": config.user_agent,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.patreon.com/home",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "TE": "Trailers"
    }
}).then(function(response) {
    var data = JSON.parse(response.body).included;
    console.log("Who will I scrape?");
    console.log("============================")
    for (var c in data) {
        if (data[c].type == "campaign") {
            choiceArray.push(data[c]);
        }
    }
    for (var c in choiceArray) {
        console.log(c + ": " + choiceArray[c].attributes.name)
    }
    console.log(choiceArray.length + ": All campaigns");
    var length = choiceArray.length;
    const prompt = new NumberPrompt({
        name: 'number',
        message: 'Please enter a number.'
    });
    prompt.run().then(answer => {
        if (answer < length) {
            getId(choiceArray[answer].id, choiceArray[answer].attributes.url);
        } else if (answer == length) {
            getAll();
        } else {
            console.log("invalid")
            return;
        }
    })
})

function getId(id, patron_url) {
    id = parseInt(id);
    var full_url = "https://www.patreon.com/api/posts?include=campaign%2Caccess_rules%2Cattachments%2Caudio%2Cimages%2Cmedia%2Cpoll.choices%2Cpoll.current_user_responses.user%2Cpoll.current_user_responses.choice%2Cpoll.current_user_responses.poll%2Cuser&fields[campaign]=currency%2Cshow_audio_post_download_links%2Cavatar_photo_url%2Cearnings_visibility%2Cis_nsfw%2Cis_monthly%2Cname%2Curl&fields[post]=change_visibility_at%2Ccomment_count%2Ccontent%2Ccurrent_user_can_delete%2Ccurrent_user_can_view%2Ccurrent_user_has_liked%2Cembed%2Cimage%2Cis_paid%2Clike_count%2Cmeta_image_url%2Cmin_cents_pledged_to_view%2Cpost_file%2Cpost_metadata%2Cpublished_at%2Cpatron_count%2Cpatreon_url%2Cpost_type%2Cpledge_url%2Cthumbnail_url%2Cteaser_text%2Ctitle%2Cupgrade_url%2Curl%2Cwas_posted_by_campaign_owner&fields[user]=image_url%2Cfull_name%2Curl&fields[access_rule]=access_rule_type%2Camount_cents&fields[media]=id%2Cimage_urls%2Cdownload_url%2Cmetadata%2Cfile_name&filter[campaign_id]=" + id + "&filter[contains_exclusive_posts]=true&filter[is_draft]=false&sort=published_at&json-api-version=1.0";
    console.log(full_url);
    got(full_url, {
        headers: {
            "Host": "www.patreon.com",
            "User-Agent": config.user_agent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": patron_url + "/posts?sort=published_at",
            "Content-Type": "application/vnd.api+json",
            "Connection": "keep-alive",
            "Cookie": cookie,
            "Cache-Control": "max-age=0",
            "TE": "Trailers"
        }
    }).then(function(response) {
        console.log(JSON.parse(response.body))
    }).catch(function(err) {
        console.log(err);
    })
}