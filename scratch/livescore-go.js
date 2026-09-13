Mackolik = Mackolik || {};
Mackolik.LiveScore = {
    SEQUENCE_NO: -1,
    SEQ_REQUEST_INTERVAL: 300,
    ERROR_TIMEOUT: 5000,
    groupId: 0,
    oldDataCounter : 0,
    groupName: '',
    date: '',
    type: 0,
    iddaa: 0,
    live: 0,
    duel: 0,
    sport: 3,
    bGoalPlayed: false,
    timeout: null,
    soundOn: false,
    isPlay: false,
    hasCouponTab: true,
    reqWaiting: false,
    sNewGoals: '',
    //aGroups: [],
    arrAdsOdds: [],
    aSelectedGroups: [],
    bCreateEventCookie: false,
    iEventsState: 1,
    iNewsState: 1,
    fullUpdateId : -1,
    chkLatestEvents: 0,
    extraType: -1,
    frames: ["frmBanner", "frmTBABanner", "frmTSLBanner", "frmABLBanner", "frmITABanner", "frmESPBanner", "frmFRA2Banner"],
    loadingMsg: "<div class='loading_div'><h3>Yükleniyor</h3><img src='" + ICON_PATH + "loading.gif' alt=''></div>",
    typeName: function () {
        switch (this.type) {
            case 0:
                return "Lige göre";
            case 1:
                return "Tarihe göre";
            case 2:
                return "Kuponlarım";
            case 3:
                return "Maç Seç";
        }
        return "";
    },
    writeLoading: function () {
        this.copyBanner();
        this.copyIddaaRows();
        HideFrames();
        if (this.type == 3) {
            document.getElementById('dvSelectionScores').innerHTML = this.loadingMsg;
        } else {
            $('#dvScores').html(this.loadingMsg);
            if (Mackolik.LiveScore.extraType != -1  && Mackolik.LiveScore.extraType != 1) {
                $('#dvExtraContainer').html('');
            }
        }
    },
    updateScores: function () {
        if (this.live) {
            Mackolik.LiveScore.getScores();
        } else {
            Mackolik.LiveScoreUpdate.getEventData();
        }
    },
    getGroupScores: function (id, sport) {
        Mackolik.LiveScore.clearOptions();
        if (id == "live") {
            id = "all";
            this.live = 1;
            $("#chkLive").addClass("selected");
        }
        if (id == "iddaaLIVE") {
            id = "0";
            this.live = 1;
            $("#chkLive").addClass("selected");
            this.iddaa = 1;
            $("#chkIddaa").addClass("selected");
        }
        this.groupId = id;
        this.date = "";
        
        this.writeLoading();

        
        var url = "//vd.mackolik.com/livedata";
        if (sport == 2) {
            url += "?bgroup=" + id;
        } else {
            url += "?group=" + id;
        }
        this.reqWaiting = true;
        $.ajax({
            url: url,
            success: function (data) { Mackolik.LiveScore.getLiveScoresCompleted(data, 0); },
            error: Mackolik.LiveScore.errorHandler
        });
        //this.setNewTimeOut();
    },
    getScores: function () {
        var url = "//vd.mackolik.com/livedata?group=" + this.groupId;
        
        if (this.date) {
            url = "//vd.mackolik.com/livedata?date=" + this.date;
        }

        var now = new Date();
        var todayDay = now.getDate();
        var todayMonth = now.getMonth() + 1;
        var today = (todayDay < 10 ? "0" : "") + todayDay + "/" + (todayMonth < 10 ? "0" : "") + todayMonth + "/" + now.getFullYear();

        if ((!this.date || this.date == today) && this.fullUpdateId != -1) {
            url += "&eId=" + this.fullUpdateId;
        }
        if (this.oldDataCounter > 1) {
            url += "&old=" + this.oldDataCounter;
        }
        this.reqWaiting = true;
        $.ajax({ url: url, success: function (data) { Mackolik.LiveScore.getLiveScoresCompleted(data, 1); } });

        //this.setNewTimeOut();
    },
    getBasketballGroupScores: function (id) {
        this.sport = 2;
        if ($("#chkSport1").hasClass("selected")) {
            $("#chkSport1").removeClass("selected");
        }
        if (!$("#chkSport2").hasClass("selected")) {
            $("#chkSport2").addClass("selected");
        }
        this.getGroupScores(id, 2);
    },
    getDailyScores: function (date) {
        if (!isDate(date)) {
            return false;
        }
        this.groupId = 0;
        this.groupName = date;
        this.date = date;

        this.writeLoading();

        var url = '//vd.mackolik.com/livedata?date=' + date;
        $.ajax({
            url: url,
            success: function (response) { Mackolik.LiveScore.getLiveScoresCompleted(response, 0); },
            error: Mackolik.LiveScore.errorHandler
        });

        if (Mackolik.LiveScore.Menu) {
            Mackolik.LiveScore.Menu.clearMenu();
        }
        /*
        if (this.timeout) {
        clearTimeout(this.timeout);
        this.request.abort();
        }
        if (isToday(this.date)) {
        this.timeout = setTimeout(Mackolik.LiveScore.getSequenceNo, this.SEQ_REQUEST_INTERVAL);
        }*/
    },
    getLiveScores: function (type) {
        this.type = type;
        // this.getGroupScores(0, 'BUGÜN');
        this.getScores();
    },
    getLiveScoresCompleted: function (response, isFullRefresh) {
        try {
            var data = eval("(" + response + ")");

            var now = new Date();
            var todayDay = now.getDate();
            var todayMonth = now.getMonth() + 1;
            var today = (todayDay < 10 ? "0" : "") + todayDay + "/" + (todayMonth < 10 ? "0" : "") + todayMonth + "/" + now.getFullYear();

            /* old data control */
            if (isFullRefresh && (!this.date || this.date == today)) {
                if (Mackolik.LiveScore.livescorePoll && data.eId < Mackolik.LiveScore.livescorePoll.latestEventId) {
                    Mackolik.LiveScore.oldDataCounter++;
                    throw "Old Data";
                }
                Mackolik.LiveScore.oldDataCounter = 0;
            }

            if (document.getElementById('dvScores')) {
                this.liveData = data;
                this.writeLiveScores();
                this.writeEvents(Mackolik.LiveScore.liveData.e);
            }

            if ((!this.date || this.date == today)) {
                if (!isFullRefresh) {
                    if (Mackolik.LiveScore.livescorePoll) {
                        Mackolik.LiveScore.livescorePoll.abort();
                        Mackolik.LiveScore.livescorePoll = null;
                    }
                }
                if (!Mackolik.LiveScore.livescorePoll) {
                    Mackolik.LiveScore.livescorePoll = new Mackolik.LiveScore.LongPoll(Mackolik.LiveScoreUpdate.getEventDataCompleted, Mackolik.LiveScore.errorHandler, data.eId);
                } else {
                    if (data.eId) {
                        Mackolik.LiveScore.livescorePoll.latestEventId = data.eId;
                    }   
                }
            }

            Mackolik.LiveScore.reqWaiting = false;
        }
        catch (e) {
            console.log(e);
            Mackolik.LiveScore.errorHandler();
        }
    },
    addIddaaRows: function () {
        $("#tblTemp tr[id|=odds]").map(function (index, domElement) {
            var id = domElement.id.substring(5)
            var frameAd = document.getElementById("frm-odd-" + id);
            if ($("#row_" + id).length > 0) {
                $("#row_" + id).after(domElement);
                if (domElement.style.display != "none") {
                    //$("#row_" + id).addClass("selected-match");
                    reOrganizeFrame(frameAd, "td-odd-" + id);
                    frameAd.style.display = "";
                } else {
                    frameAd.style.display = "none";
                }
            } else {
                frameAd.style.display = "none";
            }
        });
    },
    copyIddaaRows: function () {
        $('#resultsList tr[id|=odds]').appendTo("#tblTemp");
    },
    clearOptions: function () {
        if (this.type == 2 || this.type == 3) {
            this.type = 0;
        }
        this.iddaa = 0;
        this.live = 0;
        $("#basketSubMenu").css("display", "none");
        $("#chkLive").removeClass("selected");
        $("#chkIddaa").removeClass("selected");
        $("#txtCalendar").val("");
    },
    writeBanner: function () {
        function cumulativeOffset(element) {
            var valueT = 0;
            var valueL = 0;
            do {
                valueT += element.offsetTop || 0;
                valueL += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element && element.style.position != "relative");

            return [valueL, valueT];
        }
        var ph = document.getElementById('bannerPlaceHolder1');
        if (ph) {
            var b = document.getElementById("bannerContainer1");
            var offset = cumulativeOffset(ph);
            bTop = offset[1]; // - document.getElementById("dvScores").offsetTop)
            bLeft = offset[0]; // - document.getElementById("dvScores").offsetLeft)
            b.style.left = bLeft + 'px';
            b.style.top = bTop + 'px';
            b.style.display = 'block';
        }
        var ph2 = document.getElementById('bannerPlaceHolder2');
        if (ph2) {
            var b = document.getElementById("bannerContainer2");
            var offset = cumulativeOffset(ph2);
            bTop = offset[1]; // - document.getElementById("dvScores").offsetTop)
            bLeft = offset[0]; // - document.getElementById("dvScores").offsetLeft)
            b.style.left = bLeft + 'px';
            b.style.top = bTop + 'px';
            b.style.display = 'block';
        }
        var ph3 = document.getElementById('bannerPlaceHolder3');
        if (ph3) {
            var b = document.getElementById("bannerContainer3");
            var offset = cumulativeOffset(ph3);
            bTop = offset[1]; // - document.getElementById("dvScores").offsetTop)
            bLeft = offset[0]; // - document.getElementById("dvScores").offsetLeft)
            b.style.left = bLeft + 'px';
            b.style.top = bTop + 'px';
            b.style.display = 'block';
        }
        var ph7 = document.getElementById('dvTSL_Banner');
        if (ph7) {
            var banner = document.getElementById("frmTSLBanner");
            var bannerOffset = cumulativeOffset(ph7);
            bannerTop = bannerOffset[1];
            bannerLeft = bannerOffset[0];
            banner.style.left = bannerLeft + 'px';
            banner.style.top = bannerTop + 'px';
            banner.style.display = 'block';
            if (!this.bTSLFound) {
                banner.src = APP_ROOT + "/livescores/banner.aspx?k=206";
                this.bTSLFound = true;
            }
        }
    },
    copyBanner: function () {
        var b = document.getElementById("bannerContainer1");
        if (b) {
            b.style.display = 'none';
        }

        var b2 = document.getElementById("bannerContainer2");
        if (b2) {
            b2.style.display = 'none';
        }

        var b3 = document.getElementById("bannerContainer3");
        if (b3) {
            b3.style.display = 'none';
        }
        $(this.frames).map(function (i, e) {
            if ($("#" + e).length > 0) {
                $("#" + e).css("display", "none");
            }
        });
    },

    writeLiveScores: function () {
        var data = jQuery.extend(true, {}, this.liveData);
        
        data.m = $.grep(data.m, function (element, index) {
            if (!Mackolik.LiveScore.duel) {
                if (!element[36][0]) {
                    return false;
                }
            }
            if (Mackolik.LiveScore.sport == 1 && element[36][11] == 2) {
                return false;
            }
            if (Mackolik.LiveScore.sport == 2 && element[36][11] != 2) {
                return false;
            }

            if (Mackolik.LiveScore.iddaa || Mackolik.LiveScore.live || Mackolik.LiveScore.liveIddaa || Mackolik.LiveScore.selected) {
                if (Mackolik.LiveScore.iddaa && element[14] == "") {
                    return false;
                }
                if (Mackolik.LiveScore.liveIddaa && element[14] == "") {
                    return false;
                }
                if (Mackolik.LiveScore.liveIddaa && element[37] == 0) {
                    return false;
                }
                if (Mackolik.LiveScore.live && ![1, 2, 3, 5, 7, 11, 14, 15, 16, 17, 18, 19].contains(element[5])) {
                    return false;
                }
                if (Mackolik.LiveScore.selected && !Mackolik.LiveScore.MatchSelection.aSelectedOdds[element[0]]) {
                    return false;
                }
                return true;
            }
            return true;
        });
        
        if (Mackolik.LiveScore.type == 1) {
            data = sortLiveData(data);
        }

        Mackolik.LiveScore.pageData = data;
        this.copyBanner();
        this.copyIddaaRows();
        if (this.type == 0) {
            this.writeLiveScoresByGroup(data);
        } else if (this.type == 1) {
            this.writeLiveScoresByDate(data);
        }
        this.addIddaaRows();
        this.writeBanner();
        

        if (this.extraType != 1) {
            getExtra(this.extraType);
        }
        reOrganizeAll();
    },
    writeLiveScoresByGroup: function (livedata) {
        var header = '<table cellspacing=0 cellpadding=0 border=0 id="resultsList" class="list-table" width="100%">';
        header = header + '<colgroup><col width=35 /><col width=70 /><col width=20 /><col width=15 /><col width=20 /><col width=160 /><col width=12 /><col width=100 /><col width=12 /><col width=160 /><col width=20 /><col width=45 /><col width=30 /><col width=15 /><col width=32 /></colgroup>';

        var dateFormat = '<tr class="dateHeader"><td colspan="11">{0}</td><td colspan="3">&nbsp;</td></tr>';

        var footballRowFormat = '<tr class="row line-bg{0} mac-status-{23}" id="row_{15}" sport="1" {20} {21} onmouseover="highlight(this);" onmouseout="highlight(this);"><td class="td_minute">{12}</td><td align=center class="td_status">{1}</td><td class="liveBet">{24}</td><td>{11}</td><td>{13}</td><td align=right colspan=2><div class="teamDiv"><span class="td_red1">{5}</span>&nbsp;{18}<a href="{7}" target="_blank">{2}</a></div></td><td class="score">{3}</td><td colspan=2><div class="teamDiv"><a href="{8}" target="_blank">{4}</a>{19}&nbsp;<span class="td_red2">{6}</span></div></td><td>{14}</td><td align=center class="td_HTScore">{10}</td><td>{17}</td><td>{9}</td><td nowrap>{16}</td></tr>';
        var basketRowFormat = '<tr class="row line-bg{0}" id="row_{15}" sport="2" h1="{20}" h2="{21}" ts="{22}" onmouseover="highlight(this);" onmouseout="highlight(this);"><td class="td_minute">{12}</td><td align=center class="td_status">{1}</td><td class="liveBet">{24}</td><td>{11}</td><td>{13}</td><td align=right>{18}<div class="teamDiv"><a href="{7}" target="_blank">{2}</a></div></td><td>{5}</td><td class="score">{3}</td><td>{6}</td><td><div class="teamDiv"><a href="{8}" target="_blank">{4}</a></div>{19}</td><td>{14}</td><td align=center class="td_HTScore">{10}</td><td><a href="javascript:Mackolik.LiveScore.MatchSelection.getMoreBets(\'{15}\',\'{23}\', \'2\');">{17}</a></td><td><a href="javascript:popBasketComparison({15})">{9}</a></td><td>{16}</td></tr>';
        var duelloRowFormat = '<tr class="row duel-line-bg{0}" id="row_{15}" sport="0" onmouseover="highlight(this);" onmouseout="highlight(this);"><td class="td_minute">{12}</td><td align=center class="td_status">{1}</td><td>{11}</td><td></td><td align=right>{18}<span class="teamDiv"><a href="{7}" target="_blank">{2}</a></span></td><td align=right class="td_red1">{5}</td><td class="score">{3}</td><td class="td_red2">{6}</td><td><span class="teamDiv"><a href="{8}" target="_blank">{4}</a></span>{19}</td><td>{14}</td><td align=center class="td_HTScore">{10}</td><td style="color:#007343;font-weight:bold;"><a href="javascript:Mackolik.LiveScore.MatchSelection.getMoreBets(\'{15}\',\'{20}\',\'0\');">{17}</a></td><td></td><td>{16}</td></tr>';

        var bannerRow1 = '<tr><td class="bannerPlaceHolderTd1" align="center" colspan="14" style="padding:0"><div id="bannerPlaceHolder1" style="height:24px;background-color:#e5eced"></div></td></tr>';
        var bannerRow2 = '<tr><td class="bannerPlaceHolderTd2" align="center" colspan="14" style="padding:0"><div id="bannerPlaceHolder2" style="height:100px"></div></td></tr>';
        var bannerRow3 = '<tr><td class="bannerPlaceHolderTd3" align="center" colspan="14" style="padding:0"><div id="bannerPlaceHolder3" style="height:100px"></div></td></tr>';

        var sbScores = new StringBuilder();
        sbScores.append(header);

        this.isPlay = false;
        var data = livedata.m;
        var iGroupCounter = 0;
        //var serverTime = livedata.t;
        //var eventData = livedata.e;
        //var bBannerAdded = false;
        //var bGoal = false;
        var bHasNoMatch = false;
        var i;
        var groupFormat;

        if (!this.date && (this.groupId == 0 || this.groupId == "all" || this.groupId == "live")) {
            var now = new Date();
            var todayDay = now.getDate();
            var todayMonth = now.getMonth() + 1;
            var today = (todayDay < 10 ? "0" : "") + todayDay + "/" + (todayMonth < 10 ? "0" : "") + todayMonth + "/" + now.getFullYear();

            $("#txtCalendar").val(today);
        }

        if (data.length == 0) {
            bHasNoMatch = true;
        }

        var ioldgroup = -1;
        var soldDate = ""
        //var bDateAdded = false;
        for (i = 0; i < data.length; i++) {
            var groupdata = data[i][36];
            if (ioldgroup == -1 || ioldgroup != groupdata[2]) {
                ioldgroup = groupdata[2];
                soldDate = "";
                //bDateAdded = false;
                var groupType = groupdata[11];
                if (iGroupCounter == 4) {
                    sbScores.append(bannerRow2);
                }
                if (iGroupCounter == 9) {
                    sbScores.append(bannerRow3);
                }
                iGroupCounter++;
                var rowFormat;
                if (groupType == 1) {
                    rowFormat = footballRowFormat;
                    groupFormat = '<tr class="rows-bg"><td colspan="9"><img src="' + GROUP_FLAG_PATH + '/{0}.gif" width="16" height="12" align="absmiddle"/>&nbsp;<a href="{4}" target="_blank"><strong>{1}</strong> - {2}</a></td><td colspan="2" align=right>&nbsp;</td><td align=center><b>İY</b></td><td colspan="3" align=right></td></tr>';
                    sbScores.appendFormat(groupFormat, groupdata[0], groupdata[1], groupdata[3], groupdata[2], getLeagueSeasonLink(groupdata[4], groupdata[1] + " " + groupdata[3]));
                } else if (groupType == 2) {
                    rowFormat = basketRowFormat;
                    groupFormat = '<tr class="rows-bg"><td colspan="9"><img src="' + IMG_PATH + '/icons/basketball_icon.png" style="vertical-align:middle">&nbsp;<img src="' + BASKET_GROUP_PATH + '/{0}.gif" width="16" height="12" align="absmiddle"/>&nbsp;<a href="{4}" target="_blank"><strong>{1}</strong> - {2}</a></td><td colspan="2" align=right>&nbsp;</td><td align=center><b>İY</b></td><td colspan="3" align=right></td></tr>';
                    sbScores.appendFormat(groupFormat, groupdata[0], groupdata[1], groupdata[3], groupdata[2], getBasketballLeagueSeasonLink(groupdata[4]));
                } else {
                    rowFormat = duelloRowFormat;
                    groupFormat = '<tr class="rows-bg"><td colspan="8"><img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle"/><a href="#;"><strong>Düello</strong></a></td><td colspan="2" align=right>&nbsp;</td><td align=center></td><td colspan="3" align=right></td></tr>';
                    sbScores.appendFormat(groupFormat, groupdata[0], groupdata[1], groupdata[3], groupdata[2], groupdata[4]);
                }
                
            }
            var showDate = true;
            var matchData = data[i];

            if (this.groupId == 0 || this.groupId == "all" || this.groupId == "live") {
                if (this.date) {
                    if (this.date == matchData[35]) {
                        showDate = false;
                    }
                } else {
                    if (today == matchData[35]) {
                        showDate = false;
                    }
                }
            }

            if (showDate && soldDate != matchData[35]) {
                sbScores.appendFormat("<tr class=\"dateHeader\"><td colspan=\"12\">{0}</td><td colspan=3>&nbsp;</td></tr>", matchData[35]);
                soldDate = matchData[35];
            }

            var score = '';
            var scoreLink = "";
            var matchStatus;
            var stadiumStatus = '&nbsp;';
            var matchDetail = matchData[15];
            var isLive;

            var redCard1 = '&nbsp;', redCard2 = '&nbsp;';
            var oldScore1 = "", oldScore2 = "";

            if (groupType == 1) {
                if (matchDetail.f2 || matchDetail.f2 == 0) {
                    oldScore1 = "<span class='oldScore'>(" + matchDetail.f2 + ")</span> ";
                }
                if (matchDetail.f1 || matchDetail.f1 == 0) {
                    oldScore2 = " <span class='oldScore'>(" + matchDetail.f1 + ")</span>";
                }
            }
            if (groupType == 2) {
                if (matchDetail.f2 || matchDetail.f2 == 0) {
                    redCard1 = "<span class='oldScore'>(" + matchDetail.f2 + ")</span>";
                }
                if (matchDetail.f1 || matchDetail.f1 == 0) {
                    redCard2 = "<span class='oldScore'>(" + matchDetail.f1 + ")</span>";
                }
            }

            if (matchDetail.t) {
                stadiumStatus += '<span title="Tarafsız Saha" style="color:red;font-weight:bold">T</span>';
            }
            if (matchDetail.s) {
                stadiumStatus += '<span title="Seyircisiz" style="color:red;font-weight:bold">S</span>';
            }

            if (groupType == 1) { // FOOTBALL
                isLive = false
                if (matchData[5] == 0) {
                    score = "v";
                } else {
                    if (matchDetail.k1) {
                        redCard1 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k1 + '.gif" width="8" height="10">';
                    }
                    if (matchData[5] == 1 || matchData[5] == 2 || matchData[5] == 3 || matchData[5] == 5 || matchData[5] == 7 || matchData[5] == 11
                        || matchData[5] == 14 || matchData[5] == 15 || matchData[5] == 16 || matchData[5] == 17 || matchData[5] == 18) {
                        score = "<span style=\"color:#dd0000;\">" + matchData[12] + " - " + matchData[13] + "</span>";
                        isLive = true;
                    } else if (matchData[5] == 9 || matchData[5] == 21) {
                        score = "P - P";
                    } else {
                        score = matchData[12] + " - " + matchData[13];
                    }
                    if (matchDetail.k2) {
                        redCard2 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k2 + '.gif" width="8" height="10">';
                    }
                }
                scoreLink = "<a href=\"" + getMatchLink(matchData[0], matchData[2], matchData[4]) + "\" target=\"_blank\" class=\"td_score\">" + score + "</a>";
            } else if (groupType == 2) { // BASKETBALL
                if (matchData[5] == 12) {
                    score = "v";
                } else if (matchData[5] == 14 || matchData[5] == 15 || matchData[5] == 16 || matchData[5] == 17 || matchData[5] == 18 || matchData[5] == 19) {
                    score = '<span style="color:#dd0000;"><span class="score1">' + matchData[12] + '</span> - <span class="score2">' + matchData[13] + '</span></span>';
                    isLive = true;
                } else if (matchData[5] == 21) {
                    score = 'P - P';
                } else {
                    score = '<span class="score1">' + matchData[12] + '</span> - <span class="score2">' + matchData[13] + '</span>';
                }
                scoreLink = "<a href=\"" + getBasketMatchLink(matchData[0], matchData[2], matchData[4]) + "\" target=\"_blank\" class=\"td_score\">" + score + "</a>";
            } else { // duello
                if (matchData[5] == 0) {
                    score = score + '&nbsp;&nbsp;&nbsp;<a href="#;"><img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchData[0] + '"/></a>&nbsp;&nbsp;&nbsp;';
                } else {
                    if (matchDetail.k1) {
                        redCard1 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k1 + '.gif" width="8" height="10">';
                    }

                    if (matchData[5] == 1 || matchData[5] == 2 || matchData[5] == 3 || matchData[5] == 5 || matchData[5] == 7 || matchData[5] == 11) {
                        score = score + '<a href="#;" style="color:#dd0000;">' + matchData[12] + ' <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchData[0] + '"/> ' + matchData[13] + '</a>';
                    } else if (matchData[5] == 9 || matchData[5] == 21) {
                        score = score + '<a href="#;">P <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchData[0] + '"/> P</a>';
                    } else {
                        score = score + '<a href="#;">' + matchData[12] + ' <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchData[0] + '"/> ' + matchData[13] + '</a>';
                    }
                    if (matchDetail.k2) {
                        redCard2 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k2 + '.gif" width="8" height="10">';
                    }
                }
                scoreLink = "<span class=\"td_score\">" + score + "</span>";
            }
            if (matchData[5] == 0 || matchData[5] == 12) {
                matchStatus = "&nbsp;";
            } else if (matchData[5] == 1 || matchData[5] == 3 || matchData[5] == 5) {
                if (parseInt(matchData[6]) < 0) {
                    matchStatus = "<span class='red_score'><span class='sp_minute'>1</span><img src='" + ICON_PATH + "blink_bg.gif'/></span>";
                } else {
                    matchStatus = "<span class='red_score'><span class='sp_minute'>" + matchData[6] + "</span><img src='" + ICON_PATH + "blink_bg.gif' width=2 height=9 /></span>";
                }
            } else if (matchData[5] == 2 || matchData[5] == 14 || matchData[5] == 15 || matchData[5] == 16 || matchData[5] == 17 || matchData[5] == 18 || matchData[5] == 19) {
                matchStatus = "<span class='red_score'>" + matchData[6] + "</span>";
            } else {
                matchStatus = "<span class='bold_score'>" + matchData[6] + "</span>";
            }

            scoreLink = oldScore1 + "<span class=\"td_update1\"></span>" + scoreLink + "<span class=\"td_update2\"></span>" + oldScore2;

            var rowType = (i % 2) + 1;

            if (!matchStatus) {
                matchStatus = "&nbsp;";
            }
            var team1 = matchData[2];
            if (matchDetail.e == 1) {
                team1 = "<b>" + matchData[2] + "</b>";
            }
            var team2 = matchData[4];
            if (matchDetail.e == 2) {
                team2 = "<b>" + matchData[4] + "</b>";
            }
            var flag1 = "&nbsp;";
            var flag2 = "&nbsp;";
            if (matchDetail.bh) {
                flag1 = "<img src='" + SMALL_FLAG_PATH + matchDetail.bh + ".gif' title='" + matchDetail.bhn + "' height=12>";
            }
            if (matchDetail.ba) {
                flag2 = "<img src='" + SMALL_FLAG_PATH + matchDetail.ba + ".gif' title='" + matchDetail.ban + "' height=12>";
            }
            var tahminLink = "";
            if (matchDetail.ogd === 1) {
                tahminLink += "<a class='mac-plus' href='" + Mackolik.UrlHelper.CreateMatchPlusURL(matchData[0], matchData[2] + "-" + matchData[4]) + "' target='_blank' title='Tüm istatistikler için tıklayın'><img src='" + ICON_PATH + "macplus16x16.png' width=16 height=16 ></a>";
            }
            if (matchDetail.tId) {
                tahminLink += "<a href='" + Mackolik.UrlHelper.CreateTahminURL(matchData[0], matchData[2] + "-" + matchData[4]) + "' target='_blank' title='İddaa tahmini'><img src='" + ICON_PATH + "tahminkolik_16x16.png' width=16 height=16 ></a>";
            }
            if (matchDetail.goal) {
                tahminLink += "<a href='" + matchDetail.goal + "' target='_blank' title='Goal.com maç tahmini'><img src='" + ICON_PATH + "goalcom16x16.png' width=16 height=16 ></a>";
            }
            if (!tahminLink) {
                tahminLink = "&nbsp;";
            }

            if (groupType == 0) {
                var duel = matchData[33];
                var score1 = "", score2 = "", redCard11 = "", redCard12 = "", redCard21 = "", redCard22 = "", matchStatus1 = "", matchStatus2 = "";

                if (duel[20] == 0) {
                    matchStatus1 = "&nbsp;";
                } else if (duel[20] == 1 || duel[20] == 3 || duel[20] == 5) {
                    if (parseInt(duel[5]) < 0) {
                        matchStatus1 = "<span class='red_score'><span class='sp_minute'>0</span><img src='" + ICON_PATH + "blink_bg.gif'/></span>";
                    } else {
                        matchStatus1 = "<span class='red_score'><span class='sp_minute'>" + duel[5] + "</span><img src='" + ICON_PATH + "blink_bg.gif' width=2 height=9 /></span>";
                    }
                } else if (duel[20] == 2) {
                    matchStatus1 = "<span class='red_score'>" + duel[5] + "</span>";
                } else {
                    matchStatus1 = "<span class='bold_score'>" + duel[5] + "</span>";
                }

                if (duel[21] == 0) {
                    matchStatus2 = "&nbsp;";
                } else if (duel[21] == 1 || duel[21] == 3 || duel[21] == 5) {
                    if (parseInt(duel[15]) < 0) {
                        matchStatus2 = "<span class='red_score'><span class='sp_minute'>0</span><img src='" + ICON_PATH + "blink_bg.gif'/></span>";
                    } else {
                        matchStatus2 = "<span class='red_score'><span class='sp_minute'>" + duel[15] + "</span><img src='" + ICON_PATH + "blink_bg.gif' width=2 height=9 /></span>";
                    }
                } else if (duel[21] == 2) {
                    matchStatus2 = "<span class='red_score'>" + duel[15] + "</span>";
                } else {
                    matchStatus2 = "<span class='bold_score'>" + duel[15] + "</span>";
                }

                if (duel[20] == 0) {
                    score1 = "v";
                } else {
                    if (duel[8]) {
                        redCard11 = "<img src=\"" + ICON_PATH + "kk-" + duel[8] + ".gif\" width=\"8\" height=\"10\">";
                    }
                    if (duel[20] == 1 || duel[20] == 2 || duel[20] == 3 || duel[20] == 5 || duel[20] == 7 || duel[20] == 11) {
                        score1 = "<span style=\"color:#dd0000;\"><div>" + duel[6] + "</div><div>" + duel[7] + "</div></span>";
                    } else if (duel[20] == 9) {
                        score1 = "<div>P</div><div>P</div>";
                    } else {
                        score1 = "<div>" + duel[6] + "</div><div>" + duel[7] + "</div>";
                    }
                    if (duel[9]) {
                        redCard12 = '<img src="' + ICON_PATH + 'kk-' + duel[9] + '.gif" width="8" height="10">';
                    }
                }
                var score1Link = "<a href=\"" + getMatchLink(duel[0], duel[2], duel[4]) + "\" target=\"_blank\" class=\"match_" + duel[0] + " matchscore\">" + score1 + "</a>";
                if (duel[21] == 0) {
                    score2 = "v";
                } else {
                    if (duel[18]) {
                        redCard21 = '<img src="' + ICON_PATH + 'kk-' + duel[18] + '.gif" width="8" height="10">';
                    }
                    if (duel[21] == 1 || duel[21] == 2 || duel[21] == 3 || duel[21] == 5 || duel[21] == 7 || duel[21] == 11) {
                        score2 = '<span style="color:#dd0000;"><div>' + duel[16] + '</div><div>' + duel[17] + '</div></span>';
                    } else if (matchData[5] == 9 || matchData[5] == 21) {
                        score2 = '<div>P</div><div>P</div>';
                    } else {
                        score2 = '<div>' + duel[16] + '</div><div>' + duel[17] + '</div>';
                    }
                    if (duel[19]) {
                        redCard22 = '<img src="' + ICON_PATH + 'kk-' + duel[19] + '.gif" width="8" height="10">';
                    }
                }
                var score2Link = "<a href=\"" + getMatchLink(duel[10], duel[12], duel[14]) + "\" target=\"_blank\" class=\"match_" + duel[10] + " matchscore\">" + score2 + "</a>";

                sbScores.appendFormat('<tr class="row line-bg{0} duel-row" id="row_{1}" sport="0" onmouseover="highlight(this);" onmouseout="highlight(this);"><td class="td_minute">{2}</td><td align=center class="td_status">{3}</td><td></td><td class="match_{18} status">{4}</td><td align=right><div class="teamDiv"><a href="{6}" target="_blank">{7}</a></div><div class="teamDiv"><a href="{8}" target="_blank">{9}</a></div></td><td align=right style="border-right:1px solid #ddd">{5}</td><td class="score">{10}</td><td style="border-left:1px solid #ddd">{15}</td><td><div class="teamDiv"><a href="{11}" target="_blank">{12}</a></div><div class="teamDiv"><a href="{13}" target="_blank">{14}</a></div></td><td class="match_{19} status">{17}</td><td align=center></td><td style="color:#007343;font-weight:bold;"><a href="javascript:Mackolik.LiveScore.MatchSelection.getMoreBets(\'{1}\',\'{20}\',\'0\');">{16}</a></td><td></td><td></td></tr>',
                    rowType, matchData[0], matchData[16], matchStatus, matchStatus1, score1Link,
                    getTeamLink(duel[1], duel[2]),
                    duel[1] == matchData[1] ? "<span class='duel-team'>" + duel[2] + "</span>" : "<span class='not-duel-team'>" + duel[2] + "</span>",
                    getTeamLink(duel[3], duel[4]),
                    duel[3] == matchData[1] ? "<span class='duel-team'>" + duel[4] + "</span>" : "<span class='not-duel-team'>" + duel[4] + "</span>",
                    scoreLink, // 10
                    getTeamLink(duel[11], duel[12]),
                    duel[11] == matchData[3] ? "<span class='duel-team'>" + duel[12] + "</span>" : "<span class='not-duel-team'>" + duel[12] + "</span>",
                    getTeamLink(duel[13], duel[14]),
                    duel[13] == matchData[3] ? "<span class='duel-team'>" + duel[14] + "</span>" : "<span class='not-duel-team'>" + duel[14] + "</span>",
                    score2Link,
                    matchData[14] ? '<span style="cursor:pointer;color:#007343;font-weight:bold;">' + matchData[14] + '</span>' : '&nbsp;',
                    matchStatus2,
                    duel[0],
                    duel[10],
                    matchData[14]);
            } else if (groupType == 1) { // FOOTBALL
                // '<tr class="row line-bg{0}" id="row_{15}" sport="1" {20} {21} onmouseover="highlight(this);" onmouseout="highlight(this);"><td class="td_minute">{12}</td><td align=center class="td_status">{1}</td><td>{11}</td><td>{13}</td><td align=right colspan=2><div class="teamDiv"><span class="td_red1">{5}</span>&nbsp;{18}<a href="javascript:popTeam({7})" >{2}</a></div></td><td class="score">{3}</td><td colspan=2><div class="teamDiv"><a href="javascript:popTeam({8})">{4}</a>{19}&nbsp;<span class="td_red2">{6}</span></div></td><td>{14}</td><td align=center class="td_HTScore">{10}</td><td style="color:#007343;font-weight:bold;"><a href="javascript:Mackolik.LiveScore.MatchSelection.getMoreBets(\'{15}\', \'{22}\',\'1\');">{17}</a></td><td><a href="javascript:popComparison({15})">{9}</a></td><td nowrap>{16}</td></tr>';
                sbScores.appendFormat(rowFormat, rowType, matchStatus, team1, scoreLink,
                    team2, redCard1, redCard2, // 6
                    getTeamLink(matchData[1], matchData[2]),
                    getTeamLink(matchData[3], matchData[4]),
                    "<a href=\"" + getComparisonLink(matchData[0], matchData[2], matchData[4]) + "\" target=\"_blank\"><img border=0 title=\"Takım Karşılaştırma\" src=\"" + ICON_PATH + "compare.gif\" width=10 height=11></a>",
                    matchData[7] ? matchData[7] : '&nbsp;', // 10
                    stadiumStatus, matchData[16], flag1, flag2, matchData[0], tahminLink,
                    matchData[14] ? "<img src=\"" + ICON_PATH + "iddaa-icon.png\" height=12>" : '&nbsp;', // 17
                    matchDetail.h1 && matchDetail.h1 != 0 ? "<span class=red>(h:" + matchDetail.h1 + ")</span>" : "",
                    matchDetail.h2 && matchDetail.h2 != 0 ? "<span class=red>(h:" + matchDetail.h2 + ")</span>" : "",
                    matchDetail.h1 && matchDetail.h1 != 0 ? "h1=\"" + matchDetail.h1 + "\"" : "",
                    matchDetail.h2 && matchDetail.h2 != 0 ? "h2=\"" + matchDetail.h2 + "\"" : "", matchData[14], matchData[5],
                    matchData[37] == "1" ? (isLive ? "<img src=\"" + ICON_PATH + "iddaa-live.png\" height=12>" : "<img src=\"" + ICON_PATH + "iddaa-nlive.png\" height=12>") : "&nbsp;"
                    );
            } else { // BASKETBALL
                sbScores.appendFormat(rowFormat, rowType, matchStatus, team1, scoreLink,
                    team2, redCard1, redCard2,
                    getBasketTeamLink(matchData[1], matchData[2]),
                    getBasketTeamLink(matchData[3], matchData[4]),
                    "<a href=\"" + getBasketComparisonLink(matchData[0], matchData[2], matchData[4]) + "\" target=\"_blank\"><img border=0 title=\"Takım Karşılaştırma\" src=\"" + ICON_PATH + "compare.gif\" width=10 height=11></a>",
                    matchData[7] ? matchData[7] : '&nbsp;',
                    stadiumStatus, matchData[16], flag1, flag2, matchData[0], tahminLink,
                    matchData[14] ? "<img src=\"" + ICON_PATH + "iddaa-icon.png\" height=12>" : '&nbsp;', 
                    matchDetail.h1 && matchDetail.h1 != 0 ? "<span class=red>(h:" + matchDetail.h1 + ")</span>" : "",
                    matchDetail.h2 && matchDetail.h2 != 0 ? "<span class=red>(h:" + matchDetail.h2 + ")</span>" : "",
                    matchData[26], matchData[27], matchData[28], matchData[14],
                    matchData[37] == "1" ? (isLive ? "<img src=\"" + ICON_PATH + "iddaa-live.png\" height=12>" : "<img src=\"" + ICON_PATH + "iddaa-nlive.png\" height=12>") : "&nbsp;");
            }
        }

        //this.setHeaders(this.type, serverTime);
        //this.writeEvents(eventData, serverTime);
        //this.setClientTime(serverTime);
        /*
        if (bGoal && !this.bGoalPlayed) {
            openGoalBanner();
        }*/

        if (bHasNoMatch) {
            $("#dvScores").html("<div style=\"font-size:14px;color: #d90000;font-weight:bold;padding-top:50px;width:500px;text-align:center;\">Maç bulunamadı.</div>");
        } else {
            $("#dvScores").html(sbScores.toString());
        }
        //this.aGroups.sort(sortGroupArray);
        this.showDuelMatches();
    },
    showDuelMatches: function () {
        $(".img_duel").each(function (index, element) {
            $(element).qtip({
                content: {
                    title: {
                        text: 'Düello Maçları',
                        button: true
                    },
                    ajax: {
                        url: APP_ROOT + "/LiveScores/DuelMatches.aspx",
                        data: {
                            id: $(element).attr("duelId")
                        },
                        type: "get",
                        once: false
                    },
                    text: "Yükleniyor..."
                },
                show: {
                    event: "click"
                },
                hide: {
                    delay: 5000,
                    event: "mouseout"
                },
                style: {
                    classes: 'ui-tooltip-shadow ui-tooltip-tipped',
                    width: "560px"
                },
                position: {
                    my: 'top center',
                    at: 'bottom center'
                }
            });
        });
    },
    writeLiveScoresByDate: function (livedata) {
        var dateFormat = '<tr class="rows-bg"><td colspan="12"><b>{0}</b></td><td align=center><b>IY</b><td colspan=4>&nbsp;</td></tr>';
        var footballRowFormat = '<tr class="row line-bg{0} mac-status-{28}" id="row_{16}" sport="1" onmouseover="highlight(this);" onmouseout="highlight(this);"><td nowrap><img src="' + GROUP_FLAG_PATH + '/{12}.gif" style="vertical-align:bottom" width=16 height=12/></td><td title="{14}" nowrap><div style="width:40px;overflow:hidden">{13}</div></td><td nowrap align=center>{17}</td><td class="liveBet">{29}</td><td align=center class="td_status">{1}</td><td>{18}</td><td align=right colspan=2><div class="teamDiv"><span class="td_red1">{5}</span>&nbsp;{21}<a href="{7}" target="_blank">{2}</a></div></td><td nowrap class="score">{3}</td><td colspan=2><div class="teamDiv"><a href="{8}" target="_blank">{4}</a>{22}&nbsp;<span class="td_red2">{6}</span></div></td><td>{19}</td><td nowrap title="İlk Yarı Sonucu" align=center class="td_HTScore">{10}</td><td nowrap>{11}</td><td style="color:#007343;font-weight:bold;">{20}</td><td nowrap>{9}</td><td nowrap>{27}</td></tr>';
        
        var basketballRowFormat = '<tr class="row line-bg{0}" id="row_{16}" sport="2" h1="{23}" h2="{24}" ts="{25}" onmouseover="highlight(this);" onmouseout="highlight(this);"><td nowrap><img src="' + BASKET_GROUP_PATH + '/{12}.gif" style="vertical-align:bottom" width=16 height=12/></td><td title="{14}" nowrap><div style="width:40px;overflow:hidden">{13}</div></td><td nowrap align=center>{17}</td><td class="liveBet">{27}</td><td align=center class="td_status">{1}</td><td>{18}</td><td align=right><div class="teamDiv">{21}<a href="{7}" target="_blank">{2}</a></div></td><td nowrap align=right class="td_red1">{5}</td><td nowrap align=center class="score">{3}</td><td nowrap class="td_red2">{6}</td><td><div class="teamDiv"><a href="{8}" target="_blank">{4}</a>{22}</div></td><td>{19}</td><td nowrap title="İlk Yarı Sonucu" align=center class="td_HTScore">{10}</td><td nowrap>{11}</td><td style="color:#007343;font-weight:bold;"><a href="javascript:Mackolik.LiveScore.MatchSelection.getMoreBets(\'{16}\',\'{26}\',\'2\');">{20}</a></td><td nowrap>{9}</td><td></td></tr>';

        var header = '<table cellspacing=0 cellpadding=0 border=0 width="100%" class="list-table" >';
        header = header + '<colgroup><col width=10 /><col width=35 /><col width=30 /><col width=20/><col width=80 /><col width=20 /><col width=155 /><col width=8 /><col width=60 /><col width=8 /><col width=155 /><col width=20 /><col width=40 /><col width=10 /><col width=20 /><col width=20 /><col width=32 /></colgroup>';

        var bannerRow1 = '<tr><td class="bannerPlaceHolderTd1" align="center" colspan="15" style="padding:0"><div id="bannerPlaceHolder1" style="height:90px;background-color:#e5eced"></div></td></tr>';
        var bannerRow2 = '<tr><td class="bannerPlaceHolderTd2" align="center" colspan="17" style="padding:0"><div id="bannerPlaceHolder2" style="height:100px"></div></td></tr>';

        var sbScores = new StringBuilder();
        var bHasNoMatch = false;
        //var serverTime = livedata.t;
        var matchData = livedata.m;
        //var eventData = livedata.e;
        var i;

        if (!this.date) {
            var now = new Date();
            var todayDay = now.getDate();
            var todayMonth = now.getMonth() + 1;
            var today = (todayDay < 10 ? "0" : "") + todayDay + "/" + (todayMonth < 10 ? "0" : "") + todayMonth + "/" + now.getFullYear();

            $("#txtCalendar").val(today);
        }

        sbScores.append(header);
        this.isPlay = false;

        var sOldDate = "";
        if (matchData.length == 0) {
            bHasNoMatch = true;
        }
        for (i = 0; i < matchData.length; i++) {
            var matchRow = matchData[i];

            if (sOldDate != matchRow[35]) {
                sbScores.appendFormat(dateFormat, matchRow[35]);
                sOldDate = matchRow[35];
            }

            if (i == 20) {
                sbScores.append(bannerRow2);
            }
            var score = '';
            var matchStatus;
            var stadiumStatus = '&nbsp;';
            var matchDetail = matchRow[15];
            var redCard1 = '&nbsp;', redCard2 = '&nbsp;';
            var oldScore1 = "", oldScore2 = "", scoreLink = "";
            var tahminLink = "";
            var isLive = false;
            if (matchDetail.ogd === 1) {
                tahminLink += "<a class='mac-plus' href='" + Mackolik.UrlHelper.CreateMatchPlusURL(matchRow[0], matchRow[2] + "-" + matchRow[4]) + "' target='_blank' title='Tüm istatistikler için tıklayın'><img src='" + ICON_PATH + "macplus16x16.png' width=16 height=16 ></a>";
            }
            if (matchDetail.tId) {
                tahminLink += "<a href='" + Mackolik.UrlHelper.CreateTahminURL(matchRow[0], matchRow[2] + "-" + matchRow[4]) + "' target='_blank' title='İddaa tahmini'><img src='" + ICON_PATH + "tahminkolik_16x16.png' width=16 height=16 ></a>";
            }
            if (matchDetail.goal) {
                tahminLink += "<a href='" + matchDetail.goal + "' target='_blank' title='Goal.com maç tahmini'><img src='" + ICON_PATH + "goalcom16x16.png' width=16 height=16 ></a>";
            }
            if (!tahminLink) {
                tahminLink = "&nbsp;";
            }

            if (matchRow[23] == 1) { //if (matchData[28] == 1) {
                if (matchDetail.f2 || matchDetail.f2 == 0) {
                    oldScore1 = "<span class='oldScore'>(" + matchDetail.f2 + ")</span> ";
                }
                if (matchDetail.f1 || matchDetail.f1 == 0) {
                    oldScore2 = " <span class='oldScore'>(" + matchDetail.f1 + ")</span>";
                }
            }
            if (matchRow[23] == 2) {
                if (matchDetail.f2 || matchDetail.f2 == 0) {
                    redCard1 = "<span class='oldScore'>(" + matchDetail.f2 + ")</span>";
                }
                if (matchDetail.f1 || matchDetail.f1 == 0) {
                    redCard2 = "<span class='oldScore'>(" + matchDetail.f1 + ")</span>";
                }
            }

            if (matchDetail.t) {
                stadiumStatus += '<span title="Tarafsız Saha" style="color:red;font-weight:bold">T</span>';
            }
            if (matchDetail.s) {
                stadiumStatus += '<span title="Seyircisiz" style="color:red;font-weight:bold">S</span>';
            }
            if (matchRow[23] == 1) {
                // FOOTBALL
                if (matchRow[5] == 0) {
                    score = "v";
                } else {
                    if (matchDetail.k1) {
                        redCard1 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k1 + '.gif">';
                    }
                    if (matchRow[5] == 1 || matchRow[5] == 2 || matchRow[5] == 3 || matchRow[5] == 5 || matchRow[5] == 7 || matchRow[5] == 11) {
                        score = "<span style=\"color:#dd0000;\">" + matchRow[12] + " - " + matchRow[13] + "</span>";
                        isLive = true;
                    } else if (matchRow[5] == 9) {
                        score = "P - P";
                    } else {
                        score = matchRow[12] + " - " + matchRow[13];
                    }
                    if (matchDetail.k2) {
                        redCard2 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k2 + '.gif">';
                    }
                }
                scoreLink = "<a href=\"" + getMatchLink(matchRow[0], matchRow[2], matchRow[4]) + "\" target=\"_blank\" class=\"td_score\">" + score + "</a>";

            } else if (matchRow[23] == 2) {
                // BASKETBALL
                if (matchRow[5] == 12) {
                    score = 'v';
                } else {
                    if (matchRow[5] == 14 || matchRow[5] == 15 || matchRow[5] == 16 || matchRow[5] == 17 || matchRow[5] == 18 || matchRow[5] == 19) {
                        score = '<span style="color:#dd0000;"><span class="score1">' + matchRow[12] + '</span> - <span class="score2">' + matchRow[13] + '</span></span>';
                        isLive = true;
                    } else if (matchRow[5] == 21) {
                        score = 'P - P';
                    } else {
                        score = '<span class="score1">' + matchRow[12] + '</span> - <span class="score2">' + matchRow[13] + '</span>';
                    }
                }
                scoreLink = "<a href=\"" + getBasketMatchLink(matchRow[0], matchRow[2], matchRow[4]) + "\" target=\"_blank\" class=\"td_score\">" + score + "</a>";

            } else { // DUELLO
                if (matchRow[5] == 0) {
                    score = score + '&nbsp;<a href="#;"><img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchRow[0] + '"/></a>&nbsp;';
                } else {
                    if (matchDetail.k1) {
                        redCard1 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k1 + '.gif">';
                    }
                    if (matchRow[5] == 1 || matchRow[5] == 2 || matchRow[5] == 3 || matchRow[5] == 5 || matchRow[5] == 7 || matchRow[5] == 11) {
                        score = score + '<a href="#;" style="color:#dd0000;">' + matchRow[12] + ' <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchRow[0] + '"/> ' + matchRow[13] + '</a>';
                    } else if (matchRow[5] == 9) {
                        score = score + '<a href="#;">P <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchRow[0] + '"/> P</a>';
                    } else {
                        score = score + '<a href="#;">' + matchRow[12] + ' <img src="' + ICON_PATH + 'duello.gif" width="16" height="12" align="absmiddle" class="img_duel" duelId="' + matchRow[0] + '"/> ' + matchRow[13] + '</a>';
                    }
                    if (matchDetail.k2) {
                        redCard2 = '<img src="' + ICON_PATH + 'kk-' + matchDetail.k2 + '.gif">';
                    }
                }
                scoreLink = "<span class=\"td_score\">" + score + "</span>";
            }
            if (matchRow[5] == 0 || matchRow[5] == 12) {
                matchStatus = "&nbsp;";
            } else if (matchRow[5] == 2 || matchRow[5] == 14 || matchRow[5] == 15 || matchRow[5] == 16 || matchRow[5] == 17 || matchRow[5] == 18 || matchRow[5] == 19) {
                matchStatus = "<span class='red_score'>" + matchRow[6] + "</span>";
            } else if (matchRow[5] == 1 || matchRow[5] == 3 || matchRow[5] == 5) {
                if (parseInt(matchRow[6]) < 0) {
                    matchStatus = "<span class='red_score'><span class='sp_minute'>0</span><img src='" + ICON_PATH + "blink_bg.gif'/></span>";
                } else {
                    matchStatus = "<span class='red_score'><span class='sp_minute'>" + matchRow[6] + "</span><img src='" + ICON_PATH + "blink_bg.gif'/></span>";
                }
            } else {
                matchStatus = "<span class='bold_score'>" + matchRow[6] + "</span>";
            }

            scoreLink = oldScore1 + "<span class=\"td_update1\"></span>" + scoreLink + "<span class=\"td_update2\"></span>" + oldScore2;
            //score = oldScore1 + "<span class=\"td_update1\"></span><span class=\"td_score\">" + score + "</span><span class=\"td_update2\"></span>" + oldScore2;

            var rowType = (i % 2) + 1;

            var sbGroupData = new StringBuilder();
            var groupdata = matchRow[36];
            if (matchRow[23] == 1) {
                // getLeagueSeasonLink(groupdata[4], groupdata[1] + " " + groupdata[3])
                sbGroupData.appendFormat("<div><a href=\"{0}\" target=\"_blank\">{1}</a></div>", getLeagueSeasonLink(groupdata[4], groupdata[1] + " " + groupdata[3]), groupdata[9]);
            } else if (matchRow[23] == 0) {
                sbGroupData.append("<div><a href=\"#;\">DUEL</a></div>");
            } else {
                sbGroupData.appendFormat("<div><a href=\"{0}\" target=\"_blank\">{1}</a></div>", getBasketballLeagueSeasonLink(groupdata[4]), groupdata[9]);
            }

            if (!matchStatus) {
                matchStatus = "&nbsp;";
            }
            var team1 = matchRow[2];
            if (matchDetail.e == 1) {
                team1 = "<b>" + matchRow[2] + "</b>";
            }
            var team2 = matchRow[4];
            if (matchDetail.e == 2) {
                team2 = "<b>" + matchRow[4] + "</b>";
            }
            var flag1 = "&nbsp;";
            var flag2 = "&nbsp;";
            if (matchDetail.bh) {
                flag1 = "<img src='" + SMALL_FLAG_PATH + matchDetail.bh + ".gif' title='" + matchDetail.bhn + "' height=12>";
            }
            if (matchDetail.ba) {
                flag2 = "<img src='" + SMALL_FLAG_PATH + matchDetail.ba + ".gif' title='" + matchDetail.ban + "' height=12>";
            }
            
            //sbScores.appendFormat(rowFormat,
            if (matchRow[23] == 1) {
                sbScores.appendFormat(footballRowFormat,
                    rowType, matchStatus, team1, scoreLink, team2, //4
                    redCard1, redCard2, getTeamLink(matchRow[1], matchRow[2]), getTeamLink(matchRow[3], matchRow[4]),
                    "<a href=\"" + getComparisonLink(matchRow[0], matchRow[2], matchRow[4]) + "\" target=\"_blank\"><img border=0 title=\"Takım Karşılaştırma\" src=\"" + ICON_PATH + "compare.gif\" width=10 height=11></a>",
                    matchRow[7] ? matchRow[7] : '&nbsp;', stadiumStatus, groupdata[0],
                    sbGroupData, groupdata[1] + ' ' + groupdata[3], // 14
                    matchRow[16], matchRow[0], matchRow[16], flag1, flag2, // 19
                    matchRow[14] ? "<img src=\"" + ICON_PATH + "iddaa-icon.png\" height=12>" : '&nbsp;', 
                    matchDetail.h1 && matchDetail.h1 != 0 ? "<span class=red>(h:" + matchDetail.h1 + ")</span>" : "",
                    matchDetail.h2 && matchDetail.h2 != 0 ? "<span class=red>(h:" + matchDetail.h2 + ")</span>" : "",
                    matchRow[26], matchRow[27], matchRow[28], matchRow[14], tahminLink, matchRow[5],
                    matchRow[37] == "1" ? (isLive ? "<img src=\"" + ICON_PATH + "iddaa-live.png\" height=12>" : "<img src=\"" + ICON_PATH + "iddaa-nlive.png\" height=12>") : "&nbsp;"
                );
            } else {
                sbScores.appendFormat(basketballRowFormat,
                    rowType, matchStatus, team1, scoreLink, team2, //4
                    redCard1, redCard2, getBasketTeamLink(matchRow[1], matchRow[2]), getBasketTeamLink(matchRow[3], matchRow[4]),
                    "<a href=\"" + getBasketComparisonLink(matchRow[0], matchRow[2], matchRow[4]) + "\" target=\"_blank\"><img border=0 title=\"Takım Karşılaştırma\" src=\"" + ICON_PATH + "compare.gif\" width=10 height=11></a>",
                    matchRow[7] ? matchRow[7] : '&nbsp;', stadiumStatus, groupdata[0], sbGroupData, groupdata[1] + ' ' + groupdata[3], // 14
                    matchRow[16], matchRow[0], matchRow[16], flag1, flag2, // 19
                    matchRow[14] ? "<img src=\"" + ICON_PATH + "iddaa-icon.png\" height=12>" : '&nbsp;', 
                    matchDetail.h1 && matchDetail.h1 != 0 ? "<span class=red>(h:" + matchDetail.h1 + ")</span>" : "",
                    matchDetail.h2 && matchDetail.h2 != 0 ? "<span class=red>(h:" + matchDetail.h2 + ")</span>" : "",
                    matchRow[26], matchRow[27], matchRow[28], matchRow[14],
                    matchRow[37] == "1" ? (isLive ? "<img src=\"" + ICON_PATH + "iddaa-live.png\" height=12>" : "<img src=\"" + ICON_PATH + "iddaa-nlive.png\" height=12>") : "&nbsp;"
                );
            }

           
        }
        //this.writeEvents(eventData, serverTime);
        //this.setClientTime(serverTime);
        //this.setHeaders(this.type, serverTime);

        if (bHasNoMatch) {
            $("#dvScores").html("<div style=\"font-size:14px;color: #d90000;font-weight:bold;padding-top:50px;width:500px;text-align:center;\">Maç bulunamadı.</div>");
        } else {
            $("#dvScores").html(sbScores.toString());
        }

        //this.aGroups.sort(sortGroupArray);
        this.showDuelMatches();
    },
    setHeaders: function (type, serverTime) {
        $(".clientTime").html(serverTime);
        if (type == 0 || type == 1) {
            if (this.groupId != 0 && this.groupId != "all" && this.groupId != "live") {
                if (this.sport == 1) {
                    $("#spGroupName").html('<b><img src="' + GROUP_FLAG_PATH + "/" + this.groupId + '.gif" style="vertical-align:middle" /> ' + this.groupName + '</b>');
                }
                if (this.sport == 2) {
                    $("#spGroupName").html('<b><img src="' + BASKET_GROUP_PATH + "/" + this.groupId + '.gif" style="vertical-align:middle" /> ' + this.groupName + '</b>');
                }
            } else {
                $("#spGroupName").html('<b>' + this.groupName + '</b>');
            }
        }
    },
    setClientTime: function (serverTime) {
        if (this.clientTimeInterval) {
            clearInterval(this.clientTimeInterval);
        }
        var hours = serverTime.substr(0, 2);
        var minutes = serverTime.substr(3, 2);
        this.clientTime = new Date();
        this.clientTime.setHours(hours, minutes);

        this.clientTimeInterval = setInterval(Mackolik.LiveScore.updateClientTime, 60000);
    },
    updateClientTime: function () {
        var self = Mackolik.LiveScore;
        self.clientTime.setMinutes(self.clientTime.getMinutes() + 1);
        var minutes = self.clientTime.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        $(".clientTime").html(self.clientTime.getHours() + ":" + minutes);
    },
    createBlockDiv: function () {
        var blockDiv = document.createElement("div");
        blockDiv.setAttribute("id", "dvBlock");
        blockDiv.className = "modal-cover";
        blockDiv.style.cssText = "height:" + document.body.scrollHeight + "px;";
        //blockDiv.style.cssText = "position:absolute;z-index:1010;width:100%;height:" + document.body.scrollHeight + "px;left:0;top:0;background-color:gray;opacity:0.5;filter:Alpha(Opacity=50)";
        document.body.appendChild(blockDiv);
    },
    changeSound: function () {
        if (this.soundOn) {
            this.soundOn = false;
            $("#aSoundOn").css("display", "none");
            $("#aSoundOff").css("display", "");
        } else {
            this.soundOn = true;
            $("#aSoundOn").css("display", "");
            $("#aSoundOff").css("display", "none");
        }
        var dExpiration = new Date();
        dExpiration.setDate(dExpiration.getDate() + 360);
        setCookie("SOUND", this.soundOn, dExpiration);
    },
    playSound: function () {
        /*
        var sStr = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0' WIDTH='1' HEIGHT='1'>";
        sStr += "<param name='movie' value='" + ICON_PATH + "goal.swf' />";
        sStr += "<param name='quality' value='high' />";
        sStr += "<param name='wmode' value='transparent' />";
        sStr += "<embed src='" + ICON_PATH + "goal.swf' quality=best wmode=transparent />";
        sStr += "</object>";
        //alert("GOOOOOOAAAALLLLLL!!!!!");
        document.getElementById("SOUND_HOLDER").innerHTML = sStr;
        */
        $("#goal_sound_player").get(0).load();
        $("#goal_sound_player").get(0).play();
    },
    errorHandler: function () {
        window.setTimeout(function () { 
            Mackolik.LiveScore.getScores();
        }, Mackolik.LiveScore.oldDataCounter < 2 ? 1000 : 10000);
    },
    controlMatches: function () {
        if (this.sNewGoals == '') {
            return false;
        }
        var playedGoals = getCookie("PLAYEDGOALS");
        if (!playedGoals) {
            return true;
        }
        var colArray = this.sNewGoals.split('|');
        try {
            for (var i = 0; i < colArray.length - 1; i++) {
                var newGoalToken = colArray[i];
                var macID = newGoalToken.split('_')[0];
                if (playedGoals.indexOf(newGoalToken) == -1) {
                    return true;
                }
            }
        } catch (e) {
            //alert("error: " + e);
        }
        return false;
    },
    getCoupons: function () {
        this.type = 2;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.copyBanner();
        if (document.getElementById('dvScores')) {
            var sTab = this.writeTabRow(2, "");
            document.getElementById('dvScores').innerHTML = sTab + "<div style='width:100%'><iframe src='" + USR_APP_ROOT + "/Bilyoner/ViewCoupons/LiveHistory.aspx' width='620' height='500' frameborder=0 id='frmCoupons' name='frmCoupons' scrolling=auto></iframe></div><div class='bannerPlaceHolderTd' align='center'><div id='bannerPlaceHolder'></div></div>";
            Mackolik.Analytics.trackEvent('Canlı Sonuçlar', 'Kuponlarım');
            this.writeBanner();
        }
    },
    writeEvents: function (eventData, serverTime) {
        var eventsRow = '<tr class="{0}"><td width="3%"><img src="' + GROUP_FLAG_PATH + '/{1}.gif"></td><td width="5%"><a href="javascript:popLeague({2})">{3}</a></td><td width="11%">{4}</td><td width="24%" align="right"><a class="l-minute-team-score" href="javascript:popTeam({5})">{6}</a></td><td width="3%">{7}</td><td width="10%" align="center"><a class="l-minute-team-score" href="javascript:popMatch({8})"><b>{9}</b></a></td><td width="3%">{10}</td><td width="37%"><a class="l-minute-team-score" href="javascript:popTeam({11})">{12}</a></td><td width="6%" align="center"><b>{13}</b></td></tr>';
        var sEventsTable = new StringBuilder();
        sEventsTable.append("<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"l-minute-right-temp\" id=\"eventsTable\">");

        for (var k = 0; k < eventData.length; k++) {
            var red1 = "&nbsp;";
            var red2 = "&nbsp;";
            if (eventData[k][16] > 0) {
                red1 = "<img src='" + ICON_PATH + "kk-" + eventData[k][16] + ".gif'>";
            }
            if (eventData[k][17] > 0) {
                red2 = "<img src='" + ICON_PATH + "kk-" + eventData[k][17] + ".gif'>";
            }

            sEventsTable.appendFormat('<tr class="{0}"><td width="2%"><img src="' + GROUP_FLAG_PATH + '/{1}.gif"></td><td width="4%"><a href="javascript:popLeague({2})">{3}</a></td><td width="2%">{4}</td><td width="6%" align="center"><b>{14}</b></td><td width="30%" align="right"><a class="l-minute-team-score" href="javascript:popTeam({5})">{6}</a></td><td width="3%">{7}</td><td width="10%" align="center"><a class="l-minute-team-score" href="javascript:popMatch({8})"><b>{9}</b></a></td><td width="3%">{10}</td><td width="30%"><a class="l-minute-team-score" href="javascript:popTeam({11})">{12}</a></td><td width="6%" align="center"><b>{13}</b></td></tr>',
                eventData[k][2] ? "iddaa" : "not_iddaa", eventData[k][3], eventData[k][4], eventData[k][6], eventData[k][11], eventData[k][7], writeTeam(eventData[k][8], eventData[k][13] == "1"),
                eventData[k][13] == 1 ? writeEventImage(eventData[k][12]) : "&nbsp;", eventData[k][1], writeScore(eventData[k][14], eventData[k][15], eventData[k][12], eventData[k][13]),
                eventData[k][13] == 2 ? writeEventImage(eventData[k][12]) : "&nbsp;", eventData[k][9], writeTeam(eventData[k][10], eventData[k][13] == "2"), writeDetail(eventData[k][18], eventData[k][12]), eventData[k][2] ? eventData[k][2] : "&nbsp;");
        }
        sEventsTable.append("</table>");
        if (eventData.length == 0) {
            //$("#dvLatestEventsClosed").css("display", "none");
            //$("#dvLatestEvents").css("display", "none");
        } else {
            //$("#dvLatestEventsClosed").css("display", "").html(sEventsDiv.toString());
            $("#dvLatestEvents").css("display", "").html(sEventsTable.toString());
            changeLatestEvents(0);
        }
    }
};

Mackolik.LiveScore.Forum = {
    iLastMessageId: 0,
    iMessageCount: 0,
    iForumStarted: false,
    forumPoll: null,

    suspendForum: function() {
        this.forumPoll.abort();
        this.iForumStarted = false;
    },
    startForum: function() {
        if (!this.iForumStarted) {
            this.forumPoll = new KokteylPoll.pollForum("live", Mackolik.LiveScore.Forum.successFn, null, Mackolik.LiveScore.Forum.iLastMessageId);
            this.iForumStarted = true;
        }
    },
    successFn: function(messages, deleted) {
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            Mackolik.LiveScore.Forum.iMessageCount++;
            if (message.id <= Mackolik.LiveScore.Forum.iLastMessageId || message.adm) {
                continue;
            }
            var strMessage = "<tr id=\"msg_" + message.id + "\"" + (Mackolik.LiveScore.Forum.iMessageCount % 2 == 0 ? " class=\"alt2\"" : " class=\"alt1\"") + ">";
            strMessage += "<td align=left class=\"frmSubject\"><a target=\"_blank\" href=\"" + APP_ROOT +"/ForumDetails/Default.aspx?id=" + message.fId + "\"><b>" + message.forum + "</b></a><br>";
            strMessage += "<span class=\"frmMessage\" style=\"white-space:normal;" + (message.adm ? "color:#CC2222 !important" : "") + "\" align=\"left\" valign=top>" + message.msg + "</span></td></tr>";
            $("#tblForumMessages").prepend(strMessage);

            $("#msg_" + message.id).effect("highlight", { }, 3000);
        }
        if (messages.length > 0) {
            Mackolik.LiveScore.Forum.iLastMessageId = messages[messages.length - 1].id;
        }
        if (deleted.length > 0) {
            for (i = 0; i < deleted.length; i++) {
                if ($("#msg_" + deleted[i]).length > 0) {
                    $("#msg_" + deleted[i]).remove();
                }
            }            
            $("#tblForumMessages tr").removeClass("alt1 alt2");
            $("#tblForumMessages tr").each(function (index, element) {
                if (index % 2 == 1) {
                    $(element).addClass("alt1");
                } else {
                    $(element).addClass("alt2");
                }
                //
            });
            Mackolik.LiveScore.Forum.iMessageCount = 1;
        }
        $('#tblForumMessages tr:gt(10)').remove();
    },
    getForumMessages: function() {
        $.ajax({
            dataType: "json",
            url: APP_ROOT + "/AjaxHandlers/ForumHandler.aspx?fId=live&mId=" + Mackolik.LiveScore.Forum.iLastMessageId,
            success: function(data) {
                if (data) {
                    Mackolik.LiveScore.Forum.successFn(data.m, data.d);
                }
            },
            error: function() {
                Mackolik.LiveScore.Forum.forumTimeOut = setTimeout(Mackolik.LiveScore.Forum.getForumMessages, 2000);
            }
        });
    }
};

function highlight(obj) {
    var HIGH_COLOR = "#c7d2df";
    if (obj.style.backgroundColor == "") {
        obj.style.backgroundColor = HIGH_COLOR;
    } else {
        obj.style.backgroundColor = "";
    }
}

var addedRows = [];

function reOrganizeFrame(frame, reference) {
    var phAdvertorial = document.getElementById(reference);
    if (phAdvertorial) {
        var bannerOffset = cumulativeOffset(phAdvertorial);
        bannerTop = bannerOffset[1];
        bannerLeft = bannerOffset[0];
        frame.style.left = bannerLeft + 'px';
        frame.style.top = bannerTop + 'px';
    }
}
function cumulativeOffset(element) {
    var valueT = 0;
    var valueL = 0;
    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    }
    while (element && element.style.position != "relative");

    return [valueL, valueT];
}


function reOrganizeAll() {
    for (var i = 0; i < Mackolik.LiveScore.arrAdsOdds.length; i++) {
        var matchId = Mackolik.LiveScore.arrAdsOdds[i];
        var frame = document.getElementById("frm-odd-" + matchId);
        reOrganizeFrame(frame, "td-odd-" + matchId);
    }
}

function HideFrames() {
    for (var i = 0; i < Mackolik.LiveScore.arrAdsOdds.length; i++) {
        var matchId = Mackolik.LiveScore.arrAdsOdds[i];
        document.getElementById("frm-odd-" + matchId).style.display = "none";
    }
}
function sortGroupArray(a, b) {
    var x = a.gName + a.name;
    x = replaceTurkish(x);
    var y = b.gName + b.name;
    y = replaceTurkish(y);

    if (x < y) return -1;
    if (x > y) return +1;
    return 0;
}

function openBanner(zoneId) {
    AdmostClient.appendBanner(zoneId);
}

function openGoalBanner() {
    if (Mackolik.LiveScore.bGoalPlayed) return;
    openBanner(17376);
    Mackolik.LiveScore.bGoalPlayed = true;
    window.setTimeout(function() { Mackolik.LiveScore.bGoalPlayed = false; }, 20000);
}

function writeTeam(teamName, subtype) {
    if (subtype) {
        teamName = "<b>" + teamName + "</b>";
    }
    return teamName;
}

function writeDetail(detail, type) {
    if (type == 2) {
        return "<b>MS</b>";
    }
    if (type == 4) {
        return "<b>İY</b>";
    }
    return detail;
    //return "<span class='red'>" + detail + "</span>";
}
function writeTeams(team1, team2, subtype, red1, red2) {
    if (subtype == 1) {
        team1 = "<b>" + team1 + "</b>";
    }
    if (subtype == 2) {
        team2 = "<b>" + team2 + "</b>";
    }
    if (red1 > 0) {
        team1 = team1 + "<img src='" + ICON_PATH + "kk-" + red1 + ".gif'>";
    }
    if (red2 > 0) {
        team2 = "<img src='" + ICON_PATH + "kk-" + red2 + ".gif'>" + team2;
    }
    return team1 + " - " + team2;
}

function writeEventImage(type) {
    switch (type) {
        case 1:
            return "<img src='" + ICON_PATH + "s-ball.gif'>";
            break;
        case 3:
            return "<img src='" + ICON_PATH + "kk.gif'>";
            break;
        case 5:
            return "<img src='" + ICON_PATH + "s-ball-2.gif'>";
            break;
    }

    return "";
}

function writeScore(score1, score2, type, subtype) {
    /*
    if (type == 1 || type == 5) {
        if (subtype == 1) {
            return "<span class='red'>" + score1 + "</span> - " + score2;
        }
        if (subtype == 2) {
            return score1 + " - <span class='red'>" + score2 + "</span>";
        }
    }*/
    return score1 + " - " + score2;
}

//***** SCRIPT FROM LIVE.aspx*//
function myHideHandler() {
    var aFrames = document.getElementsByTagName("iframe");
    for (var i = 0; i < aFrames.length; i++) {
        aFrames[i].style.visibility = "visible";
    }
}
/*
function getScores() {
    var live = $("#chkLive").hasClass("selected");
    var iddaa = $("#chkIddaa").hasClass("selected");
    var selected = $("#chkSelected").hasClass("selected");
    var duel = $("#chkDuel").hasClass("selected");
    
    if (live) {
        Mackolik.LiveScore.live = 1;
    } else {
        Mackolik.LiveScore.live = 0;
    }

    if (iddaa) {
        Mackolik.LiveScore.iddaa = 1;
    } else {
        Mackolik.LiveScore.iddaa = 0;
    }

    if (selected) {
        Mackolik.LiveScore.selected = 1;
    } else {
        Mackolik.LiveScore.selected = 0;
    }
    
    if(duel) {
        Mackolik.LiveScore.duel = 1;
    } else {
        Mackolik.LiveScore.duel = 0;    
    }
    
    Mackolik.LiveScore.writeLoading();

    if (Mackolik.LiveScore.type == 3) {
        Mackolik.LiveScore.MatchSelection.getSelection();
    } else if (Mackolik.LiveScore.type == 5) {
        getTvMatch();
    } else {
        Mackolik.LiveScore.getScores();
    }
}
function orderByLeague() {
    if (Mackolik.LiveScore.type == 0) {
        return;
    }
    Mackolik.LiveScore.getScoresByLeague();
}

function orderByDate() {
    if (Mackolik.LiveScore.type == 1) {
        return;
    }
    Mackolik.LiveScore.getScoresByDate();
}
*/

function getCoupons() {
    if (Mackolik.LiveScore.type == 2) {
        return;
    }
    Mackolik.LiveScore.getCoupons();
}

function getSelections() {
    if (Mackolik.LiveScore.type == 3) {
        return;
    }
    Mackolik.LiveScore.MatchSelection.getSelection();
}

function getSurveys() {
    if (Mackolik.LiveScore.type == 4) {
        return;
    }
    Mackolik.LiveScore.Survey.getSurvey();
}

function changeLatestEvents(type) {
    if (type == 1) {
        $("#chkLatest").toggleClass("selected");
    }
    if ($("#chkLatest").hasClass("selected")) {
        $("#dvLatestEvents .not_iddaa").css("display", "none");
        $("#eventsTable tr.iddaa").each(function (index, element) {
            $(element).removeClass("alt1 alt2").addClass("alt" + (((index) % 2) + 1));
        });
    } else {        
        $("#dvLatestEvents .not_iddaa").css("display", "");
        $("#eventsTable tr").each(function (index, element) {
            $(element).removeClass("alt1 alt2").addClass("alt" + (((index) % 2) + 1));
        });
    }
}

function getContinentMenu(id) {
    if ($("#dvFootballMenu" + id).length == 0) {
        $("#dvFootballMenu0").after("<div id=\"dvFootballMenu" + id + "\"></div>");
        var url = APP_ROOT + '/LiveScores/GroupData.aspx?id=' + id;
        $.ajax({
            url: url,
            success: function (response) {
                var data = eval(response);
                var sbGroups = new StringBuilder();
                var limit = Math.ceil((data.length + 1) / 4);
                for (var i = 0; i < data.length; i++) {
                    if ((i + 1) % limit == 0 || i == 0) {
                        sbGroups.append('<div class="lig-menu-content-coll">');
                    }
                    if (i == 0) {
                        sbGroups.append('<a href="javascript:goBack()" class="lig-menu-content-li">Geri</a>');
                    }

                    sbGroups.appendFormat('<a href="javascript:getFootballGroup({0})" class="lig-menu-content-li"><img src="' + GROUP_FLAG_PATH + '/{0}.gif" style="vertical-align:middle" width="16"/>&nbsp;{1}</a>', data[i][0], data[i][1]);
                    if ((i + 1) % limit == limit - 1 || i == data.length - 1) {
                        sbGroups.append('</div>');
                    }
                }
                //$("#dvFootballMenu" + id).addClass("lig-menu-content");
                $("#dvFootballMenu" + id).html(sbGroups.toString());
            }
        });
    }

    $("#dvFootballMenu" + id).css("display", "");
    $("#dvFootballMenu0").css("display", "none");
    activeLiveMenu = id;
}


forumStartStop = function () {
    if ($("#chkForum").hasClass("selected")) {
        $("#chkForum").removeClass("selected");
        Mackolik.LiveScore.Forum.suspendForum();
    } else {
        $("#chkForum").addClass("selected");
        Mackolik.LiveScore.Forum.startForum();
    }
};

function getFootballGroup(id) {
    if (Mackolik.LiveScore.sport != 1) {
        Mackolik.LiveScore.sport = 1;
        if (!$("#chkSport1").hasClass("selected")) {
            $("#chkSport1").addClass("selected");
        }
        if ($("#chkSport2").hasClass("selected")) {
            $("#chkSport2").removeClass("selected");
        }
    }
    Mackolik.LiveScore.getGroupScores(id);
    if ($("#dvFootballMenu").is(":visible")) {
        $("#dvFootballMenu").css("display", "none");
        $(".live-score-futbol2-r").removeClass("selected");
    }

    //$("#dvFootballMenu").css("display", "none");
    /*$(".live-score-futbol2-r").removeClass("selected");*/
}
function getBasketballGroup(id) {
    Mackolik.LiveScore.sport = 2;
    if ($("#chkSport1").hasClass("selected")) {
        $("#chkSport1").removeClass("selected");
    }
    if (!$("#chkSport2").hasClass("selected")) {
        $("#chkSport2").addClass("selected");
    }
    Mackolik.LiveScore.getGroupScores(id, 2);
    /*$(".live-score-basketbol2-r").removeClass("selected");*/
}

function changeOrder(type) {
    if (Mackolik.LiveScore.type == type) {
        return;
    }
    Mackolik.LiveScore.type = type;

    $(".show-type").removeClass("selected");
    $($(".show-type")[type]).addClass("selected");
    filterData();
    /*
    Mackolik.LiveScore.writeLoading();
    if (Mackolik.LiveScore.date) {
        Mackolik.LiveScore.getDailyScores(Mackolik.LiveScore.date);
    } else {
        Mackolik.LiveScore.getScores();
    }
    */
}

function checkSport(type) {
    if ($("#chkSport" + type).hasClass("selected")) {
        if (Mackolik.LiveScore.sport == type) {
            return;
        }
        $("#chkSport" + type).removeClass("selected");
        Mackolik.LiveScore.sport -= type;
    } else {
        $("#chkSport" + type).addClass("selected");
        Mackolik.LiveScore.sport += type;
    }
    if (!isNaN(parseInt(Mackolik.LiveScore.groupId))) {
        Mackolik.LiveScore.clearOptions();
        $("#liveMenu div.selected").removeClass("selected");
        $("#liveMenu li.group_selected").removeClass("group_selected");
        Mackolik.LiveScore.groupId = "0";
    }
    filterData();
}

function getSelectedMatch(id) {
    if ($("#" + id).hasClass("selected")) {
        $("#" + id).removeClass("selected");
    } else {
        $("#" + id).addClass("selected");
    }
    filterData();
}

//getScores();
function filterData() {
    var live = $("#chkLive").hasClass("selected");
    var iddaa = $("#chkIddaa").hasClass("selected");
    var selected = $("#chkSelected").hasClass("selected");
    var liveIddaa = $("#chkLiveIddaa").hasClass("selected");

    if (live) {
        Mackolik.LiveScore.live = 1;
    } else {
        Mackolik.LiveScore.live = 0;
    }

    if (iddaa) {
        Mackolik.LiveScore.iddaa = 1;
    } else {
        Mackolik.LiveScore.iddaa = 0;
    }

    if (liveIddaa) {
        Mackolik.LiveScore.liveIddaa = 1;
    } else {
        Mackolik.LiveScore.liveIddaa = 0;
    }

    if (selected) {
        Mackolik.LiveScore.selected = 1;
    } else {
        Mackolik.LiveScore.selected = 0;
    }

    Mackolik.LiveScore.duel = 0;
    Mackolik.LiveScore.writeLiveScores();
    //$(window).scrollTop($("#dvTopBanner2-sticky-wrapper").offset().top);
}

function gotoDate(dateChange) {
    var date = $("#txtCalendar").datepicker('getDate');
    date.setDate(date.getDate() + dateChange);
    $("#txtCalendar").datepicker("setDate", date);
    Mackolik.LiveScore.getDailyScores($("#txtCalendar").val());
}

function getExtra(val) {
    var matchData = Mackolik.LiveScore.pageData;
    if (val == -1) {
        Mackolik.LiveScore.extraType = -1;
        $(".mc-top-bar-menu-active").addClass("mc-top-bar-menu").removeClass("mc-top-bar-menu-active");
        $("#dvExtraBanner").show();
        $("#dvExtraContainer").hide();
        return;
    }
    $(".mc-top-bar-menu-active").addClass("mc-top-bar-menu").removeClass("mc-top-bar-menu-active");
    Mackolik.LiveScore.extraType = val;
    $("#dvExtraBanner").hide();
    $("#dvExtraContainer").show();
    switch (Mackolik.LiveScore.extraType) {
        case 0:
            Mackolik.LiveScore.MatchSelection.writeMatchSelections(matchData);
            break;
        case 1:
            $.ajax({
                url: APP_ROOT + '/livescores/livescoresidenews.aspx',
                success: function (data) {
                    $("#dvExtraContainer").html(data);
                }
            });
            break;
        case 2:
            Mackolik.LiveScoreForm.getForm();
            break;
        case 3:
            Mackolik.LiveScoreTV.getTV();
            break;
       /* case 4:
            Mackolik.LiveScorePopular.getPopular();
            break;*/

    }
    $("#extraMenu" + Mackolik.LiveScore.extraType).addClass("mc-top-bar-menu-active").removeClass("mc-top-bar-menu");
}
function sortLiveData(data) {
/*    data.m = $.map(data.m, function (a) {
        return $.map(a.r, function (b) {
            var sdate = b.d;
            return $.map(b.m, function (c) {
                c.push(sdate, a.g[0], a.g[1], a.g[2], a.g[3], a.g[4], a.g[5], a.g[9]);
                return [c];
            });
        });
    });*/

    data.m.sort(function (a, b) {
        if (a[35] == b[35]) {
            if (a[16] == b[16]) {
                if (a[14] == b[14]) {
                    if (a[38] == b[38]) {
                        if (a[2] == b[2]) {
                            return 0;
                        } else {
                            return a[2] > b[2] ? 1 : -1;
                        }
                    } else {
                        return a[38] > b[38] ? 1 : -1;
                    }
                } else {
                    return a[14] > b[14] ? 1 : -1;
                }
            } else {
                return a[16] > b[16] ? 1 : -1;
            }
        }
        return parseDate(a[35]) > parseDate(b[35]) ? 1 : -1;
    });

    return data;

}

function parseDate(input) {
    var parts = input.split('/');
    
    return new Date(parts[2], parts[1] - 1, parts[0]); // Note: months are 0-based
}
